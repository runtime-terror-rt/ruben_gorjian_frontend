"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { getPlansForCategory } from "@/lib/pricing-catalog";
import { cn } from "@/lib/utils";
import { Tooltip } from "react-tooltip";
import Image from "next/image";
import logo from "@/components/assets/talexia_ai_logo.png";

const PLAN_SUBTITLES: Record<string, string> = {
  "FMP-20": "Complete done-for-you posting",
  "FMP-35": "More content. Broader reach.",
  "FM-70": "Your dedicated digital marketing team",
};

export default function MyPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userPlanCode, setUserPlanCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadCurrentPlan() {
      try {
        const res = await apiGet<{ success: boolean; plan: any }>("/api/billing/current-plan");
        if (res.success && res.plan) {
          setUserPlanCode(res.plan.code);
        }
      } catch (err) {
        console.error("Failed to load current plan", err);
      } finally {
        setLoading(false);
      }
    }
    loadCurrentPlan();
  }, []);

  const plans = useMemo(() => {
    return getPlansForCategory("regular", "full");
  }, []);

  function formatPrice(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f4ef]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f4ef] text-[#1b1b1b]">
      {/* Absolute Back Button - Removing background as requested */}
      <div className="fixed top-8 left-8 z-50">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-primary transition-all hover:scale-105 active:scale-95 hover:opacity-70"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <main className="pt-24 pb-20">
        <section className="px-4">
          <div className="mx-auto max-w-6xl text-center">
            {/* Logo instead of text */}
            <div className="flex justify-center mb-6">
              <Image 
                src={logo} 
                alt="Talexia" 
                width={50} 
                height={50} 
                className="opacity-90"
              />
            </div>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl text-primary">
              Your Active Subscription
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-[#5d6170]">
              Review your current workflow and explore the next tier of managed execution across Instagram, Facebook, and LinkedIn.
            </p>
          </div>
        </section>

        <section className="px-4 pt-10">
          <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-3">
            {plans.map((plan) => {
              const isActive = plan.lookupKey === userPlanCode;
              const isFMP35 = plan.lookupKey === "FMP-35"; // Most popular on pricing page
              
              // We highlight the current plan as if it were the "Featured" plan on pricing page
              return (
                <article
                  key={plan.lookupKey}
                  className={cn(
                    "rounded-2xl border p-5 shadow-sm transition-all duration-200",
                    isActive 
                      ? "border-primary bg-primary/10" 
                      : "border-[#d7d8df] bg-white"
                  )}
                >
                  <div className="min-h-[52px]">
                    {isActive ? (
                      <span className="inline-flex rounded-full bg-[#111827] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                        Current Plan
                      </span>
                    ) : isFMP35 ? (
                      <span className="inline-flex rounded-full bg-[#111827] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                        Most Popular
                      </span>
                    ) : null}
                  </div>

                  <h2 className="mt-3 text-lg font-semibold">{plan.name}</h2>
                  <p className="mt-2 text-sm text-[#5d6170]">
                    {PLAN_SUBTITLES[plan.lookupKey]}
                  </p>

                  <div className="mt-5 text-4xl font-semibold leading-none">
                    {formatPrice(plan.priceStandard)}
                  </div>
                  <p className="mt-2 text-xs text-[#6c6f7d]">Per month</p>

                  <button
                    onClick={() => {
                        if (!isActive) router.push("/dashboard/billing");
                    }}
                    className={cn(
                        "mt-5 w-full rounded-full px-4 py-3 text-sm font-bold transition-all duration-200",
                        isActive
                        ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98]"
                        : "bg-primary text-white hover:bg-primary/85 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                    )}
                  >
                    {isActive ? "Currently Purchased" : "Choose Plan"}
                  </button>

                  <ul className="mt-5 space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={feature.label + String(idx)}
                        {...(feature.tooltip
                          ? {
                              "data-tooltip-id": `pricing-tooltip-${plan.lookupKey}`,
                              "data-tooltip-content": feature.tooltip,
                            }
                          : {})}
                        className="flex items-center gap-2 text-sm text-[#4f5160] whitespace-nowrap"
                      >
                        <Check className="h-4 w-4 shrink-0 text-[#4a5dff]" />
                        <span className="truncate">{feature.label}</span>
                      </li>
                    ))}
                  </ul>
                  <Tooltip
                    id={`pricing-tooltip-${plan.lookupKey}`}
                    className="!bg-slate-900 max-w-xs !text-slate-200 !border !border-slate-800 !rounded-xl !p-3 !text-xs !shadow-2xl !opacity-100 z-50"
                  />
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
