"use client";

import "@/app/page.css";
import "./checkout.css";
import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  CreditCard,
  Tag,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";
import { getPlanByLookupKey } from "@/lib/pricing-catalog";
import { PLAN_NAMES, MONTHLY_PRICES, type PlanKey } from "@/lib/pricing-comparison";
import { apiPost } from "@/lib/api";
import { useSessionContext } from "@/context/SessionContext";
import { TERMS_VERSION } from "@/lib/constants";

const TAX_RATE = 0.08625; // 8.625%

type CouponInfo = {
  code: string;
  description: string;
  discountValue: number;
  discountType: "fixed" | "percentage" | "free_month";
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useSessionContext();

  // URL params
  const rawPlan = searchParams.get("plan");
  const isEnterprise = Boolean(rawPlan?.toUpperCase().startsWith("ENT"));
  const planCode = isEnterprise
    ? (rawPlan as string)
    : ((rawPlan && (PLAN_NAMES as any)[rawPlan] ? rawPlan : "FMP-35") as PlanKey);

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    (searchParams.get("cycle") as "monthly" | "yearly") || "monthly"
  );

  // State
  const [enterprisePlanDetails, setEnterprisePlanDetails] = useState<{
    name?: string;
    price?: number;
  } | null>(null);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponInfo | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Fetch enterprise plan details if needed
  useEffect(() => {
    if (!isEnterprise || !planCode) return;

    const fetchPlanDetails = async () => {
      if (!session) return;

      try {
        const res = await fetch(`/api/enterprise-plan/invites/${planCode}/details`, {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();

        if (data && (data.proposal || data.invite)) {
          const name =
            data.proposal?.planName ||
            data.invite?.planName ||
            searchParams.get("name") ||
            "Enterprise Plan";
          const price =
            data.proposal?.amount ??
            data.invite?.amount ??
            Number(searchParams.get("price") ?? 0);
          setEnterprisePlanDetails({ name, price });
        } else {
          const urlName = searchParams.get("name");
          const urlPrice = searchParams.get("price");
          if (urlName || urlPrice) {
            setEnterprisePlanDetails({
              name: urlName || "Enterprise Plan",
              price: Number(urlPrice ?? 0),
            });
          }
        }
      } catch (err) {
        console.error("[Checkout] Failed to fetch enterprise plan details:", err);
      }
    };

    fetchPlanDetails();
  }, [isEnterprise, planCode, session, searchParams]);

  // Pricing calculation
  const calculation = useMemo(() => {
    let basePrice = 0;
    if (!isEnterprise) {
      const catalogPlan = getPlanByLookupKey(planCode as string);
      basePrice = catalogPlan?.priceStandard || MONTHLY_PRICES[planCode as PlanKey] || 0;
    } else {
      const customPrice = searchParams.get("price");
      if (customPrice && !isNaN(Number(customPrice)) && Number(customPrice) > 0) {
        basePrice = Number(customPrice);
      } else if (enterprisePlanDetails?.price !== undefined) {
        basePrice = enterprisePlanDetails.price;
      } else if (planCode === "ENT_192F55E1" || planCode === "ENT_3754E39C") {
        basePrice = 1250;
      }
    }

    const isFounder = session?.isFounder || session?.subscription?.priceType === "founder";
    const founderMultiplier = isFounder ? 0.7 : 1;

    const discountMultiplier = billingCycle === "yearly" ? 0.9 : 1;
    const cycleMultiplier = billingCycle === "yearly" ? 12 : 1;

    const planPrice = basePrice * discountMultiplier * cycleMultiplier * founderMultiplier;
    const platformPrice = 0;

    // Coupon discount calculation
    let couponDiscount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === "free_month") {
        couponDiscount = basePrice * founderMultiplier;
      } else if (appliedCoupon.discountType === "percentage") {
        couponDiscount = (planPrice * appliedCoupon.discountValue) / 100;
      } else if (appliedCoupon.discountType === "fixed") {
        couponDiscount = appliedCoupon.discountValue;
      }
    }

    const planPriceAfterDiscount = Math.max(0, planPrice - couponDiscount);
    const subtotal = planPriceAfterDiscount + platformPrice;

    const tax = Math.max(0, subtotal * TAX_RATE);
    const total = subtotal + tax;

    return {
      basePrice,
      planPrice,
      platformPrice,
      couponDiscount,
      subtotal,
      tax,
      total,
      isYearly: billingCycle === "yearly",
      isFounder,
    };
  }, [planCode, billingCycle, session, enterprisePlanDetails, appliedCoupon, isEnterprise, searchParams]);

  // Apply Coupon Handler
  const handleApplyCoupon = (codeOverride?: string) => {
    const codeToTest = (codeOverride || couponInput).trim().toUpperCase();
    setError(null);
    setCouponSuccess(null);

    if (!codeToTest) {
      setError("Please enter a coupon code.");
      return;
    }

    if (codeToTest === "1MFREE") {
      if (billingCycle === "yearly") {
        setError("The 1MFREE coupon cannot be used with the yearly billing cycle.");
        return;
      }

      setAppliedCoupon({
        code: "1MFREE",
        description: "1st Month Free Promotional Offer",
        discountValue: 100,
        discountType: "free_month",
      });
      setCouponInput("1MFREE");
      setCouponSuccess("Coupon '1MFREE' applied! 1st month plan fee is complimentary.");
    } else {
      setAppliedCoupon({
        code: codeToTest,
        description: `Promo Code (${codeToTest})`,
        discountValue: 50,
        discountType: "fixed",
      });
      setCouponInput(codeToTest);
      setCouponSuccess(`Coupon '${codeToTest}' applied successfully!`);
    }
  };

  // Remove Coupon Handler
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setError(null);
    setCouponSuccess(null);
  };

  // Submit Checkout
  const handleCheckout = async () => {
    if (!termsAccepted) {
      setError("Please accept the terms and conditions to proceed.");
      return;
    }

    const activeCouponCode = appliedCoupon ? appliedCoupon.code : couponInput.trim().toUpperCase();
    if (activeCouponCode === "1MFREE" && billingCycle === "yearly") {
      setError("The 1MFREE coupon cannot be used with the yearly billing cycle.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const origin = window.location.origin;
      const res = await apiPost<{ checkoutUrl?: string; error?: string }>("/api/billing/checkout", {
        planCode,
        billingCycle,
        termsAccepted,
        termsVersion: TERMS_VERSION,
        couponCode: activeCouponCode || undefined,
        successUrl: `${origin}/billing/success`,
        cancelUrl: `${origin}/billing/checkout?plan=${planCode}&cycle=${billingCycle}`,
      });

      if (res.checkoutUrl) {
        window.location.assign(res.checkoutUrl);
      } else {
        const errorMsg = res.error || "Failed to initiate checkout. Please try again.";
        setError(errorMsg);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const currentPlanName = isEnterprise
    ? searchParams.get("name") || enterprisePlanDetails?.name || "Enterprise Plan"
    : PLAN_NAMES[planCode as PlanKey] || "Essentials";

  return (
    <div className="talexia-wrapper">
      <div className="checkout-wrapper">
        <div className="container">
          <button className="checkout-back-btn" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Back to Plans
          </button>

          <div className="checkout-grid">
            {/* Left Column: Configuration */}
            <div>
              <div className="checkout-card">
                <div className="checkout-card-header">
                  <h1 className="checkout-card-title">Complete your subscription</h1>
                  <p className="checkout-card-desc">
                    Customize your plan and review your order details.
                  </p>
                </div>

                {/* Plan Summary Box */}
                <div className="checkout-plan-summary">
                  <div className="checkout-plan-title-row">
                    <div>
                      <div className="checkout-plan-name">
                        {currentPlanName}
                        {calculation.isFounder && (
                          <span className="checkout-founder-tag">Founder</span>
                        )}
                      </div>
                      <div className="checkout-plan-cycle">
                        Billed {billingCycle === "yearly" ? "annually" : "monthly"}
                      </div>
                    </div>
                    <div className="checkout-plan-price">
                      {isEnterprise && calculation.planPrice === 0 ? (
                        "Custom"
                      ) : (
                        <>
                          $
                          {(
                            calculation.planPrice / (calculation.isYearly ? 12 : 1)
                          ).toFixed(2)}
                          <span>/mo</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="checkout-divider"></div>

                  <div className="checkout-billing-row">
                    <span className="checkout-billing-label">Billing Cycle</span>
                    <div className="checkout-billing-toggle">
                      <button
                        type="button"
                        onClick={() => {
                          setBillingCycle("monthly");
                          if (error) setError(null);
                        }}
                        className={`checkout-billing-btn ${
                          billingCycle === "monthly" ? "active" : ""
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (appliedCoupon?.code === "1MFREE" || couponInput === "1MFREE") {
                            setError(
                              "The 1MFREE coupon cannot be used with the yearly billing cycle."
                            );
                            return;
                          }
                          setBillingCycle("yearly");
                          if (error) setError(null);
                        }}
                        className={`checkout-billing-btn ${
                          billingCycle === "yearly" ? "active" : ""
                        }`}
                      >
                        Yearly
                        <span className="checkout-annual-tag">-20%</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Coupon Section */}
                <div style={{ marginBottom: "30px" }}>
                  <span className="checkout-section-title">Discount Coupon</span>
                  <div className="checkout-coupon-row">
                    <div className="checkout-input-wrap">
                      <Tag className="checkout-input-icon h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Coupon Code (e.g. 1MFREE)"
                        className="checkout-input"
                        value={couponInput}
                        disabled={Boolean(appliedCoupon)}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          if (error) setError(null);
                        }}
                      />
                    </div>
                    {appliedCoupon ? (
                      <button
                        type="button"
                        className="checkout-remove-btn"
                        onClick={handleRemoveCoupon}
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="checkout-apply-btn"
                        onClick={() => handleApplyCoupon()}
                      >
                        Apply
                      </button>
                    )}
                  </div>

                  {/* Quick Coupon Suggestion Chip */}
                  {!appliedCoupon && billingCycle === "monthly" && (
                    <div>
                      <button
                        type="button"
                        className="checkout-quick-coupon-chip"
                        onClick={() => handleApplyCoupon("1MFREE")}
                      >
                        <Sparkles className="h-3 w-3" /> Use code <strong>1MFREE</strong> (1st Month Free)
                      </button>
                    </div>
                  )}

                  {couponSuccess && (
                    <div className="checkout-msg checkout-msg-success">
                      <Sparkles className="h-4 w-4" />
                      <span>{couponSuccess}</span>
                    </div>
                  )}

                  {error && (
                    <div className="checkout-msg checkout-msg-error">
                      <ShieldCheck className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="checkout-terms">
                  <input
                    type="checkbox"
                    id="terms"
                    className="checkout-checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <label htmlFor="terms" className="checkout-terms-label">
                    I agree to the{" "}
                    <a href="/terms" target="_blank" rel="noopener noreferrer">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer">
                      Privacy Policy
                    </a>
                    . Subscriptions automatically renew at the end of each billing period.
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div>
              <div className="checkout-summary-card">
                <div className="checkout-summary-header">
                  <h2 className="checkout-summary-title">Order Summary</h2>
                  {calculation.isFounder && (
                    <div className="checkout-summary-founder">
                      <Sparkles className="h-3 w-3" /> Exclusive Founder Discount Applied
                    </div>
                  )}
                </div>

                <div className="checkout-summary-content">
                  {/* Plan Row */}
                  <div className="checkout-summary-row">
                    <div>
                      <div className="checkout-summary-item">{currentPlanName}</div>
                      <span className="checkout-summary-sub">
                        Qty 1, Billed {billingCycle === "yearly" ? "annually" : "monthly"}
                      </span>
                    </div>
                    <div className="checkout-summary-val">
                      {isEnterprise && calculation.planPrice === 0 ? (
                        "Custom"
                      ) : (
                        <>
                          $
                          {calculation.planPrice.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          {calculation.isFounder && (
                            <span className="checkout-summary-strike">
                              $
                              {(calculation.planPrice / 0.7).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Applied Coupon Display in Order Summary */}
                  {appliedCoupon && calculation.couponDiscount > 0 && (
                    <div className="checkout-summary-coupon">
                      <div className="checkout-summary-item">
                        <Sparkles className="h-4 w-4" />
                        Coupon ({appliedCoupon.code})
                      </div>
                      <div className="checkout-summary-val">
                        -${calculation.couponDiscount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  )}

                  <div className="checkout-divider"></div>

                  <div className="checkout-summary-row">
                    <div className="checkout-summary-item" style={{ fontSize: "15px" }}>
                      Subtotal
                    </div>
                    <div className="checkout-summary-val" style={{ fontSize: "15px" }}>
                      $
                      {calculation.subtotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  <div className="checkout-summary-row">
                    <div
                      className="checkout-summary-item"
                      style={{ fontSize: "14px", color: "#6b6b6b" }}
                    >
                      Sales tax (8.625%)
                    </div>
                    <div className="checkout-summary-val" style={{ fontSize: "14px" }}>
                      $
                      {calculation.tax.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  <div className="checkout-total-row">
                    <div className="checkout-total-label">Total due today</div>
                    <div className="checkout-total-val">
                      {isEnterprise && calculation.total === 0 ? (
                        <span style={{ fontSize: "18px", color: "#6b6b6b" }}>
                          Calculated at Checkout
                        </span>
                      ) : (
                        <>
                          <span>US</span>$
                          {calculation.total.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="checkout-summary-footer">
                  <button
                    className="checkout-full-width-btn"
                    style={{ padding: "18px 24px" }}
                    disabled={loading}
                    onClick={handleCheckout}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Secure Checkout
                      </>
                    )}
                  </button>

                  <div className="checkout-secure-note">
                    <ShieldCheck className="h-4 w-4" style={{ color: "#8a6d28" }} />
                    SECURE SSL ENCRYPTED CHECKOUT
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div
          className="talexia-wrapper"
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#faf8f3",
          }}
        >
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: "#c9a44c", marginBottom: "16px" }} />
          <p style={{ fontFamily: "Georgia, serif", color: "#6b6b6b", fontStyle: "italic" }}>
            Securing your session...
          </p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}