"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import dynamicImport from "next/dynamic";
import { Check, Minus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { type MasterPlanType } from "@/lib/pricing-data";
import {
  PLAN_KEYS,
  PLAN_NAMES,
  type CellValue,
  type PlanKey,
} from "@/lib/pricing-comparison";
import { getPlanByLookupKey } from "@/lib/pricing-catalog";
import { persistPlanSelection } from "@/lib/plan-selection";
import { useUiStore } from "@/store/uiStore";
import { Tooltip } from "react-tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiGet } from "@/lib/api";

type Faq = {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
};

type FaqListResponse = {
  success: boolean;
  data: Faq[];
};

const STORAGE_KEY = "talexia_pricing_master";

const Navbar = dynamicImport(() => import("@/components/navbar"), {
  ssr: false,
});
const FooterSecondary = dynamicImport(
  () => import("@/components/footer-secondary"),
  { ssr: false },
);

type BillingCycle = "monthly" | "yearly";

import { COMPARISON_ROWS } from "@/lib/pricing-comparison";

const PLAN_SUBTITLES: Record<PlanKey, string> = {
  "ESSENTIALS": "A polished, consistent presence for a single-store brand.",
  "SIGNATURE": "A weekly rhythm for brands ready to show up consistently.",
};

const PLAN_BADGES: Partial<Record<PlanKey, string>> = {
  "SIGNATURE": "Most Popular",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function PricingPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [masterPlan, setMasterPlan] = useState<MasterPlanType>(() => {
    if (typeof window === "undefined") return "regular";
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "jewelry" ? "jewelry" : "regular";
  });
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [faqs, setFaqs] = useState<Array<{ q: string; a: string }>>([]);
  const [faqLoaded, setFaqLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const masterFromUrl = searchParams.get("master");
  const activeMasterPlan: MasterPlanType =
    masterFromUrl === "regular" || masterFromUrl === "jewelry"
      ? masterFromUrl
      : masterPlan;

  useEffect(() => {
    let isActive = true;
    apiGet<FaqListResponse>("/api/faq?pageType=PRICING_PAGE")
      .then((res) => {
        if (!isActive) return;
        const rows = Array.isArray(res?.data) ? res.data : [];
        const mapped = rows
          .filter((r) => r.isActive)
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          .map((r) => ({
            q: r.question,
            a: r.answer,
          }));
        setFaqs(mapped);
      })
      .catch(() => {
        setFaqs([]);
      })
      .finally(() => {
        if (isActive) setFaqLoaded(true);
      });
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "include",
        });
        const authenticated = res.ok;
        setIsAuthenticated(authenticated);
        
        /* 
        // AUTO-REDIRECT REMOVED FOR BETTER UX (PREVENTS BACK-BUTTON LOOP)
        if (authenticated && typeof window !== "undefined") {
          const { getPlanSelection, clearPlanSelection } = await import("@/lib/plan-selection");
          const selection = getPlanSelection();
          if (selection && selection.planCode) {
            clearPlanSelection();
            setTimeout(() => {
              router.push(`/billing/checkout?plan=${selection.planCode}&cycle=monthly`);
            }, 500);
          }
        }
        */
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const plans = useMemo(() => {
    return PLAN_KEYS.map((key) => {
      const plan = getPlanByLookupKey(key);
      if (!plan) return null;

      const monthly = plan.priceStandard;
      const yearlyMonthlyEquivalent = Math.round(monthly * 0.8);
      const active =
        billingCycle === "monthly" ? monthly : yearlyMonthlyEquivalent;

      return {
        key,
        plan,
        displayPrice: active,
        billingNote:
          billingCycle === "monthly"
            ? "Per month"
            : `Billed annually (${formatPrice(yearlyMonthlyEquivalent * 12)}/year)`,
      };
    }).filter(Boolean) as Array<{
      key: PlanKey;
      plan: NonNullable<ReturnType<typeof getPlanByLookupKey>>;
      displayPrice: number;
      billingNote: string;
    }>;
  }, [billingCycle]);

  // Used when Regular/Jewelry toggle is enabled (currently commented in JSX)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- keep for when toggle is re-enabled
  const handleMasterChange = (next: MasterPlanType) => {
    setMasterPlan(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("master", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, next);
  };

  const handleSelectPlan = async (planKey: PlanKey) => {
    const plan = getPlanByLookupKey(planKey);
    if (!plan) return;

    const category = "full";
    persistPlanSelection(plan.lookupKey, {
      master: activeMasterPlan,
      category,
      planName: plan.name,
      planSlug: plan.lookupKey,
    });

    useUiStore.setState({
      selectedPlanId: plan.lookupKey,
      selectedPlanMeta: {
        master: activeMasterPlan,
        category,
        planName: plan.name,
        planSlug: plan.lookupKey,
      },
    });

    if (!isAuthenticated) {
      router.push(`/signup?plan=${plan.lookupKey}&cycle=${billingCycle}`);
      return;
    }

    // Redirect to checkout page so user can add addons and coupons
    router.push(`/billing/checkout?plan=${plan.lookupKey}&cycle=${billingCycle}`);
  };

  const selectedPlanId = useUiStore((state) => state.selectedPlanId);
  const selectedPlanMeta = useUiStore((state) => state.selectedPlanMeta);

  return (
    <div className="min-h-screen bg-[#f5f4ef] text-[#1b1b1b]">
      <Suspense fallback={<div className="h-16" />}>
        <Navbar />
      </Suspense>

      <main className="pt-24 pb-20">
        <section className="px-4">
          <div className="mx-auto max-w-6xl text-center">
            {/* Professional Selection Indicator (COMMENTED OUT FOR NOW) */}
            {/* 
            {selectedPlanId && (
              <div className="mx-auto mb-10 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/[0.03] p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20">
                      <Check className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary/60">Currently Selected</p>
                      <p className="text-sm font-black text-primary">
                        {selectedPlanMeta?.planName || selectedPlanId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={async () => {
                        const { clearPlanSelection } = await import("@/lib/plan-selection");
                        clearPlanSelection();
                      }}
                      className="text-xs font-bold text-secondary hover:text-primary transition-colors px-3 py-2"
                    >
                      Clear
                    </button>
                    <Button 
                      onClick={() => router.push(`/billing/checkout?plan=${selectedPlanId}&cycle=${billingCycle}`)}
                      className="rounded-full bg-primary px-6 py-2 text-xs font-black text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Continue to Checkout
                    </Button>
                  </div>
                </div>
              </div>
            )}
            */}

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6f7179]">
              Talexia Pricing
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl text-primary">
              Scaling social content is hard.
              <br />
              Talexia makes it easy.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-secondary">
              Pick the workflow that matches your team, from pure calendar
              planning to fully managed execution across Instagram, Facebook,
              and LinkedIn.
            </p>

            <div className="mx-auto mt-8 flex w-full max-w-4xl flex-row items-center justify-center">
              <div className="inline-flex items-center rounded-full border-2 border-primary bg-primary p-1 gap-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={cn(
                    "rounded-full px-7 py-2 text-sm font-bold transition-all duration-300 select-none",
                    billingCycle === "monthly"
                      ? "bg-white text-primary shadow-md"
                      : "bg-transparent text-white hover:bg-white/10"
                  )}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={cn(
                    "rounded-full px-7 py-2 text-sm font-bold transition-all duration-300 select-none",
                    billingCycle === "yearly"
                      ? "bg-white text-primary shadow-md"
                      : "bg-transparent text-white hover:bg-white/10"
                  )}
                >
                  Yearly
                  {billingCycle !== "yearly" && (
                    <span className="ml-2 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      Save 20%
                    </span>
                  )}
                </button>
              </div>
            </div>
            {/* <p className="mt-3 text-xs font-medium text-secondary">
              Founder pricing: first 25 customers lock in 30% off for life
              before June 30, 2026.
            </p> */}
          </div>
        </section>

        <section className="px-4 pt-10">
          <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-3">
            {plans.map(({ key, plan, displayPrice, billingNote }) => {
              const isHighlighted = key === "SIGNATURE";
              return (
                <article
                  key={key}
                  className={`rounded-2xl border p-5 shadow-sm ${
                    isHighlighted
                      ? "border-primary bg-primary/10"
                      : // ? "border-[#ff5a3d] bg-[#fff4ef]"
                        "border-[#d7d8df] bg-white"
                  }`}
                >
                  <div className="min-h-[52px]">
                    {PLAN_BADGES[key] ? (
                      <span className="inline-flex rounded-full bg-[#111827] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                        {PLAN_BADGES[key]}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-3 text-lg font-semibold">{plan.name}</h2>
                  <p className="mt-2 text-sm text-[#5d6170]">
                    {PLAN_SUBTITLES[key]}
                  </p>
                  <p className="mt-5 text-4xl font-semibold leading-none">
                    {formatPrice(displayPrice)}
                  </p>
                  <p className="mt-2 text-xs text-[#6c6f7d]">{billingNote}</p>
                  <button
                    onClick={() => handleSelectPlan(key)}
                    className={`mt-5 w-full rounded-full px-4 py-3 text-sm font-bold transition-all duration-200 ${
                      isHighlighted
                        ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98]"
                        : "bg-primary text-white hover:bg-primary/85 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                    }`}
                  >
                    {plan.ctaLabel}
                  </button>
                  <ul className="mt-5 space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={feature.label + String(idx)}
                        {...(feature.tooltip
                          ? {
                              "data-tooltip-id": `pricing-tooltip-${key}`,
                              "data-tooltip-content": feature.tooltip,
                            }
                          : {})}
                        className="flex items-start gap-2 text-sm text-[#4f5160]"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#4a5dff]" />
                        <span>{feature.label}</span>
                        <Tooltip
                          id={`pricing-tooltip-${key}`}
                          className="!bg-slate-900 max-w-xs !text-slate-200 !border !border-slate-800 !rounded-xl !p-3 !text-xs !shadow-2xl !opacity-100 z-50"
                        />
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        <section className="px-4 pt-16">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-3xl border border-[#d9dbe2] bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-2xl font-semibold">What&apos;s included</h3>
              <p className="mt-2 text-sm text-[#5b5f6d]">
                Compare capabilities across all Talexia plans.
              </p>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#e4e6ee]">
                      <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-[#70737f]">
                        Feature
                      </th>
                      {PLAN_KEYS.map((planKey) => (
                        <th
                          key={planKey}
                          className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-[#70737f]"
                        >
                          {PLAN_NAMES[planKey]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_ROWS.map((row) => (
                      <tr key={row.category} className="border-b border-[#eef0f5]">
                        <td className="py-3 pr-4 text-sm font-medium">
                          {row.category}
                        </td>
                        {PLAN_KEYS.map((planKey) => (
                          <td
                            key={`${row.category}-${planKey}`}
                            className="py-3 px-3 text-sm text-[#3f4352]"
                          >
                            <MatrixCell value={row.values[planKey]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pt-16">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#ffd9cf] bg-[#fff4ef] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5a3d]">
                Ready for modern social ops?
              </p>
              <h3 className="mt-3 text-2xl font-semibold">
                From assets to scheduled posts in one workflow.
              </h3>
              <p className="mt-3 text-sm text-[#4f5160]">
                Talexia keeps strategy, creative production, captions, and
                publishing aligned so agencies can scale client volume without
                adding operational noise.
              </p>
            </div>
            <div className="rounded-2xl border border-[#dfe3f3] bg-[#eef1ff] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4a5dff]">
                Proof in the model
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <StatCard value="50" label="assets/mo per client" />
                <StatCard value="3" label="platforms per account" />
                <StatCard value="30%" label="founder savings" />
              </div>
            </div>
          </div>
        </section>

        <section
          id="pricing-faq"
          className="px-4 pb-16 pt-14 sm:pt-20"
          aria-labelledby="pricing-faq-heading"
        >
          <div className="mx-auto max-w-5xl space-y-10 rounded-3xl border border-[#dfe2ec] bg-white p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#777b86]">
              Pricing FAQs
            </p>
            <h3
              id="pricing-faq-heading"
              className="mt-2 text-3xl font-bold font-sora text-primary sm:text-4xl"
            >
              Questions teams ask before switching
            </h3>
            {faqs.length > 0 ? (
              <Accordion type="single" collapsible className="mt-6">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={`${faq.q}-${index}`}
                    value={`faq-${index}`}
                    className="mb-6 rounded-full border border-[#ebedf4] px-6 py-4"
                  >
                    <AccordionTrigger className="text-left text-sm font-medium">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-left text-sm text-[#55596a] pl-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : faqLoaded ? (
              <div className="rounded-3xl border border-[#e4e6ee] bg-[#f8fbff] p-8 text-center text-sm text-[#4f5160]">
                <p className="text-base font-semibold text-[#1f2230]">
                  Pricing FAQ content is not available right now.
                </p>
                <p className="mt-3">
                  If you have questions about our plans or pricing, reach out to our team and we&apos;ll respond quickly.
                </p>
              </div>
            ) : (
              <p className="mt-6 text-sm text-[#5d657d]">Loading pricing FAQs...</p>
            )}
          </div>
        </section>
      </main>

      <Suspense fallback={<div className="h-52" />}>
        <FooterSecondary />
      </Suspense>
    </div>
  );
}

function MatrixCell({ value }: { value: CellValue }) {
  if (value === "yes") {
    return <Check className="h-4 w-4 text-[#2f6f45]" />;
  }
  if (value === "no") {
    return <Minus className="h-4 w-4 text-[#9aa0ae]" />;
  }
  if (value === "client") {
    return (
      <span className="inline-flex rounded-full bg-[#eaf0ff] px-2 py-0.5 text-xs font-semibold text-[#3f55ff]">
        Client
      </span>
    );
  }
  if (value === "admin") {
    return (
      <span className="inline-flex rounded-full bg-[#fff1e8] px-2 py-0.5 text-xs font-semibold text-[#d0472f]">
        Talexia
      </span>
    );
  }
  return <span>{value}</span>;
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-[#d8ddf5] bg-white px-3 py-4 text-center">
      <p className="text-2xl font-semibold text-[#1f2331]">{value}</p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[#6f7280]">
        {label}
      </p>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f5f4ef] text-[#222]">
          Loading...
        </div>
      }
    >
      <PricingPageContent />
    </Suspense>
  );
}
