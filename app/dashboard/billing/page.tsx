"use client";

import { useMemo, useState, useEffect } from "react";
import {
  CreditCard,
  Receipt,
  Zap,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Calendar,
  XCircle,
  Clock,
  ExternalLink,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip } from "react-tooltip";
import { getCustomerPortalUrl } from "./utils";
import type { Invoice, Plan } from "./types";
import { apiGet, apiPost } from "@/lib/api";
import { PLAN_KEYS, type PlanKey } from "@/lib/pricing-comparison";
import { getPlanByLookupKey } from "@/lib/pricing-catalog";
import { cn } from "@/lib/utils";
import "@/app/(updatednewhomepage)/plan/plan.css";

const PLAN_SUBTITLES: Record<PlanKey, string> = {
  "ESSENTIALS": "A polished, consistent presence for a single-store brand.",
  "SIGNATURE": "A weekly rhythm for brands ready to show up consistently.",
};

const PLAN_BADGES: Partial<Record<PlanKey, string>> = {
  "SIGNATURE": "Most Popular",
};

const PLANS_COLLAPSED_STORAGE_KEY = "talexia-billing-plans-collapsed";

function formatPlanPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

type UsageSummary = {
  postsUsed: number;
  postsLimit: number;
  visualsUsed: number;
  visualsLimit: number;
};

export default function BillingPage() {
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [plansExpanded, setPlansExpanded] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // New states for subscription management
  const [schedulingPlan, setSchedulingPlan] = useState<PlanKey | null>(null);
  const [confirmCancelSub, setConfirmCancelSub] = useState(false);
  const [confirmCancelSchedule, setConfirmCancelSchedule] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PLANS_COLLAPSED_STORAGE_KEY);
      if (stored !== null) setPlansExpanded(stored !== "true");
    } catch {
      // ignore
    }
  }, []);

  const togglePlansExpanded = () => {
    setPlansExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(PLANS_COLLAPSED_STORAGE_KEY, String(!next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const usage: UsageSummary = useMemo(
    () => ({
      postsUsed: plan?.usage?.postsUsed || 0,
      postsLimit: plan?.postQuota || 0,
      visualsUsed: plan?.usage?.visualsUsed || 0,
      visualsLimit: plan?.visualQuota || 0,
    }),
    [plan],
  );

  const postLimitType = plan?.postLimitType || "NONE";

  // Fallback to pricing catalog when API returns plan code but missing name/price (e.g. plan relation not loaded)
  const currentPlanDisplay = useMemo(() => {
    if (!plan) return null;
    const catalogPlan = plan.code
      ? getPlanByLookupKey(plan.code as PlanKey)
      : null;
    
    // Exact price from plan object
    const priceCents = plan.price > 0 ? plan.price : 0;
    
    // If it's a yearly plan, we might want to show the monthly equivalent if the price is high
    const isYearly = plan.interval === "year";
    const displayPriceCents = isYearly && priceCents > 100000 
      ? Math.round(priceCents / 12) 
      : priceCents;

    const rawEnd = plan.current_period_end ?? plan.renewsAt;
    const renewalDate = rawEnd
      ? (() => {
          const d =
            typeof rawEnd === "number"
              ? new Date(rawEnd * 1000)
              : new Date(rawEnd);
          if (Number.isNaN(d.getTime())) return "—";
          return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        })()
      : "—";
    return {
      name: catalogPlan?.name || plan.name || plan.code || "—",
      price: displayPriceCents,
      totalPrice: priceCents,
      currency: plan.currency || "usd",
      interval: plan.interval || "month",
      priceType: plan.priceType === "FOUNDER" ? "🎉 Founder" : "Standard",
      status: plan.status || "—",
      renewsAt: renewalDate,
    };
  }, [plan]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [summary, invoicesRes, plansRes] = await Promise.all([
        apiGet<{ 
          success: boolean;
          plan: any;
          subscription: any;
          scheduledChange?: any;
        }>("/api/billing/current-plan"),
        apiGet<{ items: Invoice[] }>("/api/billing/invoices"),
        apiGet<any[]>("/api/billing/plans"),
      ]);
      
      const plansList = Array.isArray(plansRes) ? plansRes : [];
      setAllPlans(plansList);
      
      if (summary.success && summary.plan) {
        const subCycle = summary.subscription.billingCycle?.toLowerCase();
        const matchingPlan = plansList.find(p => p.code === summary.plan.code && p.billingCycle?.toLowerCase() === subCycle) 
          || plansList.find(p => p.code === summary.plan.code);
        
        let priceCents = 0;
        if (matchingPlan) {
          priceCents = summary.subscription.priceType === "FOUNDER" ? matchingPlan.priceFounderCents : matchingPlan.priceStandardCents;
        }
        
        // Fallback safety to ensure UI shows the correct price if backend doesn't differentiate cycles in plansList
        if (summary.plan.code === "SIGNATURE") {
          priceCents = subCycle === "yearly" ? 644800 : 59700;
        } else if (summary.plan.code === "ESSENTIALS") {
          priceCents = subCycle === "yearly" ? 428800 : 39700;
        }

        const mappedPlan: Plan = {
          id: summary.subscription.id,
          name: summary.plan.name,
          code: summary.plan.code,
          price: priceCents,
          currency: "usd",
          interval: summary.subscription.billingCycle.toLowerCase() as "month" | "year",
          current_period_end: summary.subscription.currentPeriodEnd,
          status: summary.subscription.status,
          priceType: summary.subscription.priceType,
          platformLimit: summary.plan.platformLimit,
          addonPlatformQty: summary.subscription.addonPlatformQty,
          videoAddonEnabled: summary.subscription.videoAddonEnabled,
          postLimitType: summary.plan.postLimitType,
          schedulerRole: summary.plan.schedulerRole,
          visualQuota: summary.plan.baseVisualQuota,
          postQuota: summary.plan.basePostQuota,
          cancelAtPeriodEnd: summary.subscription.cancelAtPeriodEnd,
          scheduledChange: summary.scheduledChange ? {
            targetPlanCode: summary.scheduledChange.targetPlanCode,
            targetBillingCycle: summary.scheduledChange.targetBillingCycle?.toLowerCase() || summary.subscription.billingCycle.toLowerCase(),
            effectiveAt: summary.scheduledChange.effectiveAt,
            scheduleId: summary.scheduledChange.scheduleId,
          } : null
        };
        setPlan(mappedPlan);
      } else {
        setPlan(null);
      }
      
      setInvoices(invoicesRes.items || []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unable to load billing data";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (loading) return;
    if (typeof window !== "undefined" && window.location.hash === "#plans") {
      document
        .getElementById("plans")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading]);

  async function startCheckout(planCode: string) {
    // If they already have a plan, show the scheduling modal instead of direct checkout
    if (plan && plan.code && plan.code !== planCode) {
      setSchedulingPlan(planCode as PlanKey);
      return;
    }

    setCheckoutError(null);
    setCheckoutLoading(planCode);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const res = await apiPost<{
        checkoutUrl?: string;
        redirectUrl?: string;
        error?: string;
      }>("/api/billing/checkout", {
        planCode,
        successUrl: `${origin}/billing/success`,
        cancelUrl: `${origin}/dashboard/billing`,
      });
      if (res.checkoutUrl) {
        window.location.assign(res.checkoutUrl);
        return;
      }
      if (res.redirectUrl) {
        window.location.assign(res.redirectUrl);
        return;
      }
      setCheckoutError(res.error || "Unable to start checkout.");
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function schedulePlanChange(
    targetPlanCode: string,
    targetBillingCycle: "monthly" | "yearly",
  ) {
    setActionLoading(true);
    setCheckoutError(null);
    try {
      const res = await apiPost<{
        success: boolean;
        message: string;
        scheduleId?: string;
        effectiveAt?: string;
      }>("/api/billing/schedule-change", {
        targetPlanCode,
        targetBillingCycle,
      });
      setSuccessMessage(res.message || `Successfully scheduled plan change to ${targetPlanCode}.`);
      setSchedulingPlan(null);
      load(); // Refresh data
    } catch (err: unknown) {
      setCheckoutError(
        err instanceof Error ? err.message : "Scheduling plan change failed.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function cancelScheduledChange() {
    setActionLoading(true);
    setPortalError(null);
    try {
      const res = await apiPost<{
        success: boolean;
        message: string;
      }>("/api/billing/scheduled-change/cancel", {});
      setSuccessMessage(res.message || "Scheduled plan change has been canceled.");
      setConfirmCancelSchedule(false);
      load(); // Refresh data
    } catch (err: unknown) {
      setPortalError(
        err instanceof Error ? err.message : "Failed to cancel scheduled change.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function cancelSubscription() {
    setActionLoading(true);
    setPortalError(null);
    try {
      await apiPost("/api/billing/cancel", {});
      setSuccessMessage("Your subscription will be canceled at the end of the current period.");
      setConfirmCancelSub(false);
      load(); // Refresh data
    } catch (err: unknown) {
      setPortalError(
        err instanceof Error ? err.message : "Subscription cancellation failed.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-[#d9d4c9] bg-[#ffffff]/60 p-6">
          <p className="text-[#6b6b6b]">Loading billing information...</p>
        </div>
      </div>
    );
  }

  // Show no subscription state
  const noPlan = !plan && !loading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          {/* <p className="text-xs uppercase tracking-wide text-[#6b6b6b]">
            Billing
          </p> */}
          <h1 className="text-2xl font-semibold text-[#14110c]">
            Subscription & Invoices
          </h1>
          <p className="text-sm text-[#14110c]">
            {/* Review your current plan and manage billing details. */}
          </p>
        </div>
      </div>
      {portalError && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {portalError}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-lime-500/50 bg-[#b08d3e]/10 px-3 py-2 text-sm text-lime-100 flex items-center justify-between">
          <span>{successMessage}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-[#b08d3e]/20"
            onClick={() => setSuccessMessage(null)}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Card className="border-[#d9d4c9] bg-[#ffffff]">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#d9d4c9] pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-[#14110c]">Current Subscription</CardTitle>
            <p className="text-xs text-[#6b6b6b] mt-1">
              Manage your active plan and subscription settings.
            </p>
          </div>
          <div className="rounded-full bg-[#b08d3e]/10 p-2">
            <CreditCard className="h-5 w-5 text-[#b08d3e]" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {!plan ? (
            <div className="rounded-xl border border-dashed border-[#d9d4c9] bg-[#faf8f3] p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#ffffff] flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-[#6b6b6b]" />
              </div>
              <p className="text-[#6b6b6b] font-medium">No active plan found</p>
              <p className="mt-2 text-sm text-[#6b6b6b] max-w-xs mx-auto">
                Subscribe to a plan below to start scheduling and managing your social content.
              </p>
              <Button 
                variant="outline" 
                className="mt-6 rounded-full border-[#d9d4c9] text-[#14110c]"
                onClick={() => {
                  document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                View Plans
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-[#14110c]">
                    {currentPlanDisplay?.name ?? "—"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-bold text-[#b08d3e]">
                      {currentPlanDisplay && currentPlanDisplay.price >= 0
                        ? formatCurrency(currentPlanDisplay.price, currentPlanDisplay.currency)
                        : "—"}
                    </p>
                    <div className="flex flex-col">
                      <span className="text-sm text-[#6b6b6b]">
                        per month {currentPlanDisplay?.interval === "year" ? "(billed yearly)" : ""}
                      </span>
                      {currentPlanDisplay?.interval === "year" && (
                        <span className="text-[10px] text-[#6b6b6b] font-medium">
                          {formatCurrency(currentPlanDisplay.totalPrice, currentPlanDisplay.currency)} total / year
                        </span>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-2 border-[#b08d3e]/30 text-[#b08d3e] bg-[#b08d3e]/5">
                      {currentPlanDisplay?.priceType ?? "Standard"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    className="rounded-full bg-[#b08d3e] hover:bg-[#b08d3e] text-black px-6 font-bold"
                    disabled={portalLoading}
                    onClick={async () => {
                      setPortalLoading(true);
                      setPortalError(null);
                      try {
                        const url = await getCustomerPortalUrl();
                        if (url) window.location.href = url;
                        else setPortalError("Unable to open billing portal.");
                      } finally {
                        setPortalLoading(false);
                      }
                    }}
                  >
                    {portalLoading ? "Loading..." : "Manage Subscription"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-[#d9d4c9]/50">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#6b6b6b] font-bold mb-1">Status</p>
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      plan.status === "ACTIVE" ? "bg-green-500" : "bg-amber-500"
                    )} />
                    <span className="text-sm font-semibold text-[#14110c] capitalize">
                      {plan.status.toLowerCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#6b6b6b] font-bold mb-1">
                    {plan.cancelAtPeriodEnd ? "Expires On" : "Next Payment"}
                  </p>
                  <p className="text-sm font-semibold text-[#14110c]">
                    {currentPlanDisplay?.renewsAt ?? "—"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#6b6b6b] font-bold mb-1">Billing</p>
                  <p className="text-sm font-semibold text-[#14110c] capitalize">
                    {currentPlanDisplay?.interval === "year" ? "Yearly" : "Monthly"}
                  </p>
                </div>
              </div>

              {plan.cancelAtPeriodEnd && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
                  <div className="rounded-full bg-amber-500/10 p-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-700">Subscription Cancellation Pending</p>
                    <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                      Your subscription will automatically end on <span className="font-bold text-amber-700">{currentPlanDisplay?.renewsAt}</span>. 
                      You will continue to have full access to all features until this date.
                    </p>
                  </div>
                </div>
              )}

              {plan.scheduledChange && (
                <div className="rounded-xl border border-lime-500/30 bg-[#b08d3e]/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-[#b08d3e]/10 p-1.5 mt-0.5">
                      <Clock className="h-4 w-4 text-[#b08d3e]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-lime-700">Scheduled Plan Change</p>
                      <p className="text-xs text-[#b08d3e]/80 mt-1 leading-relaxed">
                        Moving to <span className="font-bold text-[#8a6d28]">
                          {getPlanByLookupKey(plan.scheduledChange.targetPlanCode as PlanKey)?.name || plan.scheduledChange.targetPlanCode}
                        </span> ({plan.scheduledChange.targetBillingCycle}) effective <span className="font-bold text-[#8a6d28]">
                          {new Date(plan.scheduledChange.effectiveAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-lime-500/30 text-[#b08d3e] hover:bg-[#b08d3e]/20 bg-transparent h-8 px-4 text-xs font-bold uppercase tracking-wider"
                    onClick={() => setConfirmCancelSchedule(true)}
                  >
                    Cancel Change
                  </Button>
                </div>
              )}

              {plan && !plan.cancelAtPeriodEnd && (
                <div className="flex justify-start pt-2">
                  <Button
                    variant="ghost"
                    className="text-xs font-bold uppercase tracking-widest text-[#6b6b6b] hover:text-red-600 hover:bg-red-500/10 transition-colors"
                    onClick={() => setConfirmCancelSub(true)}
                  >
                    Cancel Subscription
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plans: same card design as pricing page, current plan highlighted and not selectable for resubscribe */}
      <Card id="plans">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Plans</CardTitle>
            <p className="text-xs text-[#6b6b6b]">
              {/* Choose or change your plan. Your current plan is highlighted; you
              cannot resubscribe to it. */}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#8a6d28]" />
            <div className="flex p-1 bg-[#faf8f3] rounded-full border border-[#d9d4c9] mr-2">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition",
                  billingCycle === "monthly"
                    ? "bg-[#b08d3e] text-[#14110c]"
                    : "text-[#6b6b6b] hover:text-[#14110c]",
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={cn(
                  "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition",
                  billingCycle === "yearly"
                    ? "bg-[#b08d3e] text-[#14110c]"
                    : "text-[#6b6b6b] hover:text-[#14110c]",
                )}
              >
                Yearly
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={togglePlansExpanded}
              aria-expanded={plansExpanded}
              aria-label={plansExpanded ? "Collapse plans" : "Show plans"}
            >
              {plansExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {checkoutError && (
            <div className="mb-4 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
              {checkoutError}
            </div>
          )}
          {plansExpanded && (
            <div className="talexia-wrapper">
            <div className={`plans-cards ${billingCycle === 'yearly' ? 'plans-annual' : ''}`} style={{ marginTop: 0 }}>
              {/* ESSENTIALS */}
              <div className={cn("plan-card", plan?.code === "ESSENTIALS" && "border-[#b08d3e]/50 bg-[#b08d3e]/5")}>
                <div className="min-h-[28px] mb-2">
                  {plan?.code === "ESSENTIALS" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b08d3e]/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#8a6d28]">
                      <Check className="h-3 w-3" />
                      Current plan
                    </span>
                  )}
                </div>
                <div className="plan-name">Essentials</div>
                <div className="plan-tagline">A polished, consistent presence for a single-store brand.</div>
                <div className="plan-price">
                  <span className="cur">$</span>
                  <span className="amt">{billingCycle === 'yearly' ? '4,288' : '397'}</span>
                  <span className="per per-monthly">/ month</span>
                  <span className="per per-annual">/ year</span>
                </div>
                <div className="plan-annual-saving">
                  <strong>Save $476</strong> a year &mdash; that&rsquo;s $357/mo, one month effectively free.
                </div>
                <div className="plan-volume">12 feed posts monthly &middot; 2 platforms</div>
                <div className="plan-divider"></div>
                <p className="plan-desc">
                  Twelve editorial-grade visuals produced monthly, captioned in your brand voice, and published to two of your connected platforms on a weekly rhythm. Brand voice locked from day one.
                </p>

                <div className="plan-section-label">What's included</div>
                <ul className="plan-feat">
                  <li>12 luxury-enhanced visuals produced monthly</li>
                  <li>Produced from your existing website or catalog photography</li>
                  <li>Professional captions written in your brand voice</li>
                  <li>Hashtag research per fine jewelry conventions</li>
                  <li>Publishing to 2 platforms (choose: Instagram, Facebook, or LinkedIn)</li>
                  <li>Monthly content calendar</li>
                  <li>48-hour factual error correction window</li>
                  <li>Brand Brief authorization model &mdash; no per-post approvals required</li>
                </ul>

                <div className="plan-fee plan-monthly-fee">
                  <strong>No onboarding fee.</strong> First month is $397. Billed monthly thereafter.
                </div>
                <p style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: '12px', lineHeight: 1.5, color: '#8a857a', margin: '12px 0 0' }}>
                  Best for brands with existing product photography. Working mainly from phone photos? Signature includes full image preparation.
                </p>

                <div className="plan-cta">
                  {plan?.code === "ESSENTIALS" ? (
                    <button
                      className="btn btn-outline w-full"
                      disabled={portalLoading}
                      onClick={async () => {
                        setPortalLoading(true);
                        setPortalError(null);
                        try {
                          const url = await getCustomerPortalUrl();
                          if (url) window.location.href = url;
                          else setPortalError("Unable to open billing portal.");
                        } finally {
                          setPortalLoading(false);
                        }
                      }}
                    >
                      {portalLoading ? "Loading..." : "Manage Subscription"}
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline w-full"
                      disabled={checkoutLoading !== null}
                      onClick={() => startCheckout("ESSENTIALS")}
                    >
                      {checkoutLoading === "ESSENTIALS"
                        ? "Loading..."
                        : billingCycle === 'yearly' ? 'Subscribe annually — $4,288/yr' : 'Subscribe to Essentials'}
                    </button>
                  )}
                  <div className="plan-annual-terms">
                    Annual plans are paid in full today and are <strong>non-refundable</strong>. Auto-renews yearly; we&rsquo;ll remind you 30 days before renewal.
                  </div>
                </div>
              </div>

              {/* SIGNATURE */}
              <div className={cn("plan-card feature", plan?.code === "SIGNATURE" && "border-[#b08d3e]/50 bg-[#b08d3e]/5")}>
                <div className="min-h-[28px] mb-2 flex items-center justify-between">
                  <div className="plan-badge" style={{ position: 'relative', top: 0, left: 0, transform: 'none', display: 'inline-block' }}>Most popular</div>
                  {plan?.code === "SIGNATURE" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b08d3e]/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#8a6d28]">
                      <Check className="h-3 w-3" />
                      Current plan
                    </span>
                  )}
                </div>
                <div className="plan-name">Signature</div>
                <div className="plan-tagline">A weekly rhythm for brands ready to show up consistently.</div>
                <div className="plan-price">
                  <span className="cur">$</span>
                  <span className="amt">{billingCycle === 'yearly' ? '6,448' : '597'}</span>
                  <span className="per per-monthly">/ month</span>
                  <span className="per per-annual">/ year</span>
                </div>
                <div className="plan-annual-saving">
                  <strong>Save $716</strong> a year &mdash; that&rsquo;s $537/mo, one month effectively free.
                </div>
                <div className="plan-volume">24 feed posts monthly &middot; 3 platforms</div>
                <div className="plan-divider"></div>
                <p className="plan-desc">
                  Twenty-four editorial visuals monthly, published across all three platforms, planned around the fine jewelry editorial calendar and completely off your plate.
                </p>

                <div className="plan-section-label">What's included</div>
                <ul className="plan-feat">
                  <li>24 luxury-enhanced visuals produced monthly</li>
                  <li>Full image preparation &mdash; send us anything, even phone photos</li>
                  <li>Professional captions &amp; hashtag research</li>
                  <li>Publishing to 3 platforms (Instagram, Facebook, LinkedIn)</li>
                  <li>Monthly content plan preview</li>
                  <li>Seasonal editorial planning (engagement season, holidays)</li>
                  <li>Micro-animation on select visuals</li>
                  <li>48-hour factual error correction window</li>
                  <li>Brand Brief authorization model &mdash; no per-post approvals required</li>
                </ul>

                <div className="plan-fee plan-monthly-fee">
                  <strong>$97 one-time onboarding fee.</strong> Covers Brand Brief development, catalog setup, and brand voice training. First invoice is $694 ($597 + $97). Billed $597 monthly thereafter.
                </div>
                <div className="plan-fee plan-annual-fee">
                  <strong>$97 one-time onboarding fee.</strong> Covers Brand Brief development, catalog setup, and brand voice training. First invoice is $6,545 ($6,448 annual + $97).
                </div>

                <div className="plan-cta">
                  {plan?.code === "SIGNATURE" ? (
                    <button
                      className="btn btn-dark w-full"
                      disabled={portalLoading}
                      onClick={async () => {
                        setPortalLoading(true);
                        setPortalError(null);
                        try {
                          const url = await getCustomerPortalUrl();
                          if (url) window.location.href = url;
                          else setPortalError("Unable to open billing portal.");
                        } finally {
                          setPortalLoading(false);
                        }
                      }}
                    >
                      {portalLoading ? "Loading..." : "Manage Subscription"}
                    </button>
                  ) : (
                    <button
                      className="btn btn-dark w-full"
                      disabled={checkoutLoading !== null}
                      onClick={() => startCheckout("SIGNATURE")}
                    >
                      {checkoutLoading === "SIGNATURE"
                        ? "Loading..."
                        : billingCycle === 'yearly' ? 'Subscribe annually — $6,448/yr' : 'Subscribe to Signature'}
                    </button>
                  )}
                  <div className="plan-annual-terms">
                    Annual plans are paid in full today and are <strong>non-refundable</strong>. Auto-renews yearly; we&rsquo;ll remind you 30 days before renewal.
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}
        </CardContent>
      </Card>



      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Invoices</CardTitle>
            <p className="text-xs text-[#6b6b6b]">
              {/* Most recent invoices */}
            </p>
          </div>
          <Receipt className="h-5 w-5 text-[#8a6d28]" />
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <>
              {/* Desktop Table View - hidden on mobile */}
              <div className="hidden md:block overflow-x-auto">
                <div className="min-w-full">
                  <div className="grid grid-cols-5 gap-4 text-xs uppercase tracking-wide text-[#6b6b6b] pb-2 border-b border-[#d9d4c9]">
                    <div>Invoice #</div>
                    <div>Amount</div>
                    <div>Status</div>
                    <div>Date</div>
                    <div className="text-right">Action</div>
                  </div>
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="grid grid-cols-5 gap-4 items-center py-3 border-b border-[#d9d4c9]/50 last:border-0 text-sm"
                    >
                      <div className="font-mono text-xs text-[#14110c] truncate">
                        {invoice.number || invoice.id.slice(-8)}
                      </div>
                      <div className="font-semibold text-[#14110c]">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </div>
                      <div>
                        <Badge
                          variant="outline"
                          className={`uppercase text-[10px] font-black tracking-[0.18em] px-2 py-0.5 ${
                            invoice.status === "paid"
                              ? "bg-[#b08d3e]/10 text-[#b08d3e] border-[#b08d3e]/30"
                              : invoice.status === "open"
                                ? "bg-[#e6e1d8] text-[#14110c] border-[#d9d4c9]"
                                : "bg-red-900/10 text-red-900 border-red-900/30"
                          }`}
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-[#6b6b6b]">
                        {invoice.createdAt
                          ? new Date(invoice.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </div>
                      <div className="text-right">
                        {invoice.hostedInvoiceUrl ? (
                          <a
                            href={invoice.hostedInvoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex justify-end text-[#b08d3e] hover:text-[#8a6d28] transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-xs text-[#6b6b6b]">—</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Card View - shown on mobile only */}
              <div className="md:hidden space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="rounded-xl border border-[#d9d4c9] bg-[#faf8f3] p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-[#6b6b6b] mb-1">Invoice #</p>
                        <p className="text-sm font-mono text-[#14110c]">
                          {invoice.number || invoice.id.slice(-8)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#6b6b6b] mb-1">Amount</p>
                        <p className="text-sm font-semibold text-[#14110c]">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#d9d4c9]">
                      <div>
                        <p className="text-xs text-[#6b6b6b] mb-1">Status</p>
                        <Badge
                          variant="outline"
                          className={`uppercase text-[10px] font-black tracking-[0.18em] px-2 py-0.5 ${
                            invoice.status === "paid"
                              ? "bg-[#b08d3e]/10 text-[#b08d3e] border-[#b08d3e]/30"
                              : invoice.status === "open"
                                ? "bg-[#e6e1d8] text-[#14110c] border-[#d9d4c9]"
                                : "bg-red-900/10 text-red-900 border-red-900/30"
                          }`}
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#6b6b6b] mb-1">Date</p>
                        <p className="text-xs text-[#14110c]">
                          {invoice.createdAt
                            ? new Date(invoice.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {invoice.hostedInvoiceUrl && (
                      <div className="pt-2">
                        <a
                          href={invoice.hostedInvoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-full gap-2 rounded-lg bg-[#b08d3e]/10 border border-[#b08d3e]/30 px-3 py-2 text-xs font-medium text-[#8a6d28] hover:bg-[#b08d3e]/20 transition"
                        >
                          <Eye className="h-4 w-4" />
                          View Invoice
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-sm text-[#14110c] py-4">No invoices yet.</div>
          )}
          {error && <p className="text-xs text-red-600 mt-4">{error}</p>}
        </CardContent>
      </Card>

      {/* Confirmation Dialogs */}
      <Dialog
        open={schedulingPlan !== null}
        onOpenChange={() => setSchedulingPlan(null)}
      >
        <DialogContent className="bg-[#ffffff] border-[#d9d4c9] text-[#14110c] max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#b08d3e]" />
              Schedule Plan Change
            </DialogTitle>
            <DialogDescription className="text-[#6b6b6b]">
              You are about to schedule a plan change to{" "}
              <span className="font-bold text-[#14110c]">
                {schedulingPlan ? getPlanByLookupKey(schedulingPlan)?.name : ""}
              </span>
              . This change will take effect at the end of your current billing
              period ({currentPlanDisplay?.renewsAt}).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="rounded-lg bg-[#faf8f3] p-4 border border-[#d9d4c9]">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#6b6b6b]">New Plan:</span>
                <span className="font-semibold">
                  {schedulingPlan
                    ? getPlanByLookupKey(schedulingPlan)?.name
                    : ""}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b6b]">Effective Date:</span>
                <span className="font-semibold text-[#b08d3e]">
                  {currentPlanDisplay?.renewsAt}
                </span>
              </div>
            </div>
            <p className="text-xs text-[#6b6b6b]">
              * Your current features will remain active until the change date.
              * You can cancel this scheduled change at any time before it
              takes effect.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="rounded-full border-[#d9d4c9]"
              onClick={() => setSchedulingPlan(null)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full bg-[#b08d3e] hover:bg-[#b08d3e] text-[#14110c]"
              onClick={() =>
                schedulingPlan && schedulePlanChange(schedulingPlan, billingCycle)
              }
              disabled={actionLoading}
            >
              {actionLoading ? "Scheduling..." : "Confirm Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmCancelSub}
        onOpenChange={() => setConfirmCancelSub(false)}
      >
        <DialogContent className="bg-[#ffffff] border-[#d9d4c9] text-[#14110c] max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Cancel Subscription
            </DialogTitle>
            <DialogDescription className="text-[#6b6b6b]">
              Are you sure you want to cancel your subscription? You will
              maintain access to all features until{" "}
              <span className="font-bold text-[#14110c]">
                {currentPlanDisplay?.renewsAt}
              </span>
              , after which your subscription will end.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-[#14110c]">
              Once canceled, you will lose access to:
            </p>
            <ul className="mt-3 space-y-2">
              <li className="flex items-start gap-2 text-xs text-[#6b6b6b]">
                <XCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>Automated scheduling & calendar management</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-[#6b6b6b]">
                <XCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>AI-powered content generation</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-[#6b6b6b]">
                <XCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>Platform management & analytics</span>
              </li>
            </ul>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="rounded-full border-[#d9d4c9]"
              onClick={() => setConfirmCancelSub(false)}
              disabled={actionLoading}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              className="rounded-full"
              onClick={cancelSubscription}
              disabled={actionLoading}
            >
              {actionLoading ? "Canceling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmCancelSchedule}
        onOpenChange={() => setConfirmCancelSchedule(false)}
      >
        <DialogContent className="bg-[#ffffff] border-[#d9d4c9] text-[#14110c] max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#b08d3e]" />
              Cancel Scheduled Change
            </DialogTitle>
            <DialogDescription className="text-[#6b6b6b]">
              Are you sure you want to cancel the scheduled plan change? Your
              current plan will remain active and will renew normally on{" "}
              <span className="font-bold text-[#14110c]">
                {currentPlanDisplay?.renewsAt}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              className="rounded-full border-[#d9d4c9]"
              onClick={() => setConfirmCancelSchedule(false)}
              disabled={actionLoading}
            >
              No, Keep Scheduled Change
            </Button>
            <Button
              className="rounded-full bg-[#b08d3e] hover:bg-[#b08d3e] text-[#14110c]"
              onClick={cancelScheduledChange}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Yes, Cancel Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlanDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#d9d4c9] bg-[#faf8f3] p-3">
      <p className="text-xs text-[#6b6b6b]">{label}</p>
      <p className="text-sm font-semibold text-[#14110c]">{value}</p>
    </div>
  );
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount / 100);
  } catch {
    return `$${(amount / 100).toFixed(2)}`;
  }
}
