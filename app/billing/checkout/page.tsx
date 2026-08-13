"use client";

import "@/app/(updatednewhomepage)/newhome/newhome.css";
import "./checkout.css";
import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, CreditCard, Tag, ShieldCheck, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { getPlanByLookupKey } from "@/lib/pricing-catalog";
import { PLAN_NAMES, MONTHLY_PRICES, type PlanKey } from "@/lib/pricing-comparison";
import { apiGet, apiPost } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useSessionContext } from "@/context/SessionContext";

const TAX_RATE = 0.08625; // 8.625% based on backend example

type Coupon = {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  description: string;
  applicablePlans?: string[];
  expiresAt: string;
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useSessionContext();

  // URL params
  const rawPlan = searchParams.get("plan");
  const isEnterprise = rawPlan?.toUpperCase().startsWith("ENT");
  const planCode = isEnterprise ? rawPlan : (rawPlan && (PLAN_NAMES as any)[rawPlan] ? rawPlan : "FMP-35") as PlanKey;
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    (searchParams.get("cycle") as "monthly" | "yearly") || "monthly"
  );

  // State
  const [enterprisePlanDetails, setEnterprisePlanDetails] = useState<{ name?: string, price?: number } | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Fetch enterprise plan details from API
  useEffect(() => {
    if (!isEnterprise || !planCode) return;

    const fetchPlanDetails = async () => {
      // Don't fetch until we have a session to avoid 401s if the session is still loading
      if (!session) return;

      try {
        const res = await fetch(`/api/enterprise-plan/invites/${planCode}/details`, {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();
        console.log("[Checkout] Enterprise plan details:", data);

        if (data && (data.proposal || data.invite)) {
          const name = data.proposal?.planName || data.invite?.planName || searchParams.get("name") || "Enterprise Plan";
          const price = data.proposal?.amount ?? data.invite?.amount ?? Number(searchParams.get("price") ?? 0);
          setEnterprisePlanDetails({ name, price });
        } else {
          // Fallback to URL params if API returned no usable data
          const urlName = searchParams.get("name");
          const urlPrice = searchParams.get("price");
          if (urlName || urlPrice) {
            setEnterprisePlanDetails({ name: urlName || "Enterprise Plan", price: Number(urlPrice ?? 0) });
          }
        }
      } catch (err) {
        console.error("[Checkout] Failed to fetch enterprise plan details:", err);
        // Fallback to URL params
        const urlName = searchParams.get("name");
        const urlPrice = searchParams.get("price");
        if (urlName || urlPrice) {
          setEnterprisePlanDetails({ name: urlName || "Enterprise Plan", price: Number(urlPrice ?? 0) });
        }
      }
    };

    fetchPlanDetails();
  }, [isEnterprise, planCode, session]);

  // Fetch coupons on mount
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await apiGet<{ coupons: Coupon[] }>("/api/billing/coupons");
        if (res && res.coupons) {
          setAvailableCoupons(res.coupons);
        }
      } catch (err: any) {
        // Log error but don't show to user as coupons are optional
        console.warn("Failed to fetch coupons (likely unauthorized for enterprise users)", err.message);
        // Ensure availableCoupons remains an empty array
        setAvailableCoupons([]);
      }
    };
    fetchCoupons();
  }, []);

  // Re-validate coupon if plan changes
  useEffect(() => {
    if (appliedCoupon && appliedCoupon.applicablePlans && !appliedCoupon.applicablePlans.includes(planCode as any)) {
      handleRemoveCoupon();
      setError(`The coupon was removed as it is not applicable to the ${PLAN_NAMES[planCode as PlanKey]} plan.`);
    }
  }, [planCode, appliedCoupon]);


  // Calculation Logic (aligned with screenshot and backend founder pricing)
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
        // Fallback for known enterprise codes if price is missing in URL
        basePrice = 1250;
      }
    }

    // BACKEND SYNC: Check if user has Founder pricing (30% discount)
    // Stripe shows $664.30 for $949.00 plan, which is 949 * 0.7
    const isFounder = session?.isFounder || session?.subscription?.priceType === "founder";
    const founderMultiplier = isFounder ? 0.7 : 1;

    const discountMultiplier = billingCycle === "yearly" ? 0.9 : 1;
    const cycleMultiplier = billingCycle === "yearly" ? 12 : 1;

    const planPrice = basePrice * discountMultiplier * cycleMultiplier * founderMultiplier;
    const platformPrice = 0;

    const subtotal = planPrice + platformPrice;

    let discount = 0;
    if (appliedCoupon) {
      const val = appliedCoupon.discountValue;
      const type = appliedCoupon.discountType;

      if (type === 'percentage') {
        discount = subtotal * (val / 100);
      } else if (type === 'fixed') {
        discount = val * cycleMultiplier;
      }
    }

    const discountedSubtotal = subtotal - discount;
    const tax = Math.max(0, discountedSubtotal * TAX_RATE);
    const total = discountedSubtotal + tax;

    return {
      planPrice,
      platformPrice,
      subtotal,
      discount,
      tax,
      total,
      isYearly: billingCycle === "yearly",
      isFounder,
      isActuallyApplicable: true // Defaulting to true as available coupons are now fetched from a specific endpoint
    };
  }, [planCode, billingCycle, appliedCoupon, session, enterprisePlanDetails]);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) return;

    // Reset everything first to ensure clean state
    handleRemoveCoupon();
    setCouponCode(code); // Keep the code in the input
    setError(null);

    const coupon = availableCoupons.find(c => c.code === code);

    if (coupon) {
      if (coupon.code === "1MFREE" && billingCycle === "yearly") {
        setError("The 1MFREE coupon cannot be applied to the yearly billing cycle.");
        return;
      }
      // Check if applicable plans exist and if the current plan is included
      const isApplicable = !coupon.applicablePlans || coupon.applicablePlans.includes(planCode as any);

      if (!isApplicable && !isEnterprise) {
        setError(`This coupon is not applicable to the ${PLAN_NAMES[planCode as PlanKey] || "Enterprise"} plan.`);
        return;
      }
      setAppliedCoupon(coupon);
    } else {
      const fallbacks: Record<string, Coupon> = {
        "SUMMER26": {
          id: "fallback-summer26",
          code: "SUMMER26",
          discountType: "percentage",
          discountValue: 15,
          description: "Summer sale - 15% off",
          expiresAt: "2027-12-31T23:59:59.000Z"
        },
        "FIXED36": {
          id: "fallback-fixed36",
          code: "FIXED36",
          discountType: "fixed",
          discountValue: 36,
          description: "Summer sale - fixed 36 off",
          expiresAt: "2027-12-31T23:59:59.000Z"
        }
      };

      if (fallbacks[code]) {
        const fb = fallbacks[code];
        setAppliedCoupon(fb);
        setCouponCode(fb.code);
        return;
      }

      setError("Invalid coupon code.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setError(null);
  };

  const handleCheckout = async () => {
    if (!termsAccepted) {
      setError("Please accept the terms and conditions to proceed.");
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
        couponCode: appliedCoupon ? couponCode : undefined,
        successUrl: `${origin}/billing/success`,
        cancelUrl: `${origin}/billing/checkout?plan=${planCode}&cycle=${billingCycle}`,
      });

      if (res.checkoutUrl) {
        window.location.assign(res.checkoutUrl);
      } else {
        const errorMsg = res.error || "Failed to initiate checkout. Please try again.";
        setError(errorMsg);

        // If the error is specifically about the coupon, remove it to stop calculating the discount
        if (errorMsg.toLowerCase().includes("coupon") || errorMsg.toLowerCase().includes("applicable")) {
          handleRemoveCoupon();
          setCouponCode(""); // Completely clear it so they have to re-type
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="talexia-wrapper">
      <div className="checkout-wrapper">
        <div className="container">
          <button
            className="checkout-back-btn"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Plans
          </button>

          <div className="checkout-grid">
            {/* Left Column: Configuration */}
            <div>
              <div className="checkout-card">
                <div className="checkout-card-header">
                  <h1 className="checkout-card-title">Complete your subscription</h1>
                  <p className="checkout-card-desc">Customize your plan and review your order details.</p>
                </div>
                
                {/* Plan Summary */}
                <div className="checkout-plan-summary">
                  <div className="checkout-plan-title-row">
                    <div className="checkout-plan-name">
                      {isEnterprise
                        ? (searchParams.get("name") || enterprisePlanDetails?.name || "Enterprise Plan")
                        : PLAN_NAMES[planCode as PlanKey]}
                      {calculation.isFounder && (
                        <span className="checkout-founder-tag">Founder</span>
                      )}
                    </div>
                    <div className="checkout-plan-price">
                      {isEnterprise && calculation.planPrice === 0 ? (
                        "Custom"
                      ) : (
                        <>
                          ${(calculation.planPrice / (calculation.isYearly ? 12 : 1)).toFixed(2)}
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
                        onClick={() => setBillingCycle("monthly")}
                        className={`checkout-billing-btn ${billingCycle === "monthly" ? "active" : ""}`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => {
                          if (appliedCoupon?.code === "1MFREE" || couponCode === "1MFREE") {
                            setError("The 1MFREE coupon cannot be used with the yearly billing cycle.");
                            return;
                          }
                          setBillingCycle("yearly");
                        }}
                        className={`checkout-billing-btn ${billingCycle === "yearly" ? "active" : ""}`}
                      >
                        Yearly
                        <span className="checkout-annual-tag">-20%</span>
                      </button>
                    </div>
                  </div>
                </div>



                {/* Coupon Section */}
                <div style={{ marginBottom: '30px' }}>
                  <span className="checkout-section-title">Discount Coupon</span>
                  <div className="checkout-coupon-row">
                    <div className="checkout-input-wrap">
                      <Tag className="checkout-input-icon h-4 w-4" />
                      <input
                        placeholder="Enter code (e.g. SUMMER26)"
                        className="checkout-input"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          if (error) setError(null);
                        }}
                        disabled={!!appliedCoupon}
                      />
                    </div>
                    <button
                      className="btn btn-outline"
                      onClick={() => appliedCoupon ? handleRemoveCoupon() : handleApplyCoupon()}
                    >
                      {appliedCoupon ? "Remove" : "Apply"}
                    </button>
                  </div>

                  {appliedCoupon && (
                    <div className="checkout-msg checkout-msg-success">
                      <Check className="h-4 w-4" />
                      <div>
                        <strong>{appliedCoupon.code}</strong> applied: {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% off` : `$${appliedCoupon.discountValue} off`} successfully
                      </div>
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
                    I agree to the <a href="/terms-conditions" target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>. Subscriptions automatically renew at the end of each billing period.
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
                  <div className="checkout-summary-row">
                    <div>
                      <div className="checkout-summary-item">
                        {isEnterprise
                          ? (searchParams.get("name") || enterprisePlanDetails?.name || "Enterprise Plan")
                          : PLAN_NAMES[planCode as PlanKey]}
                      </div>
                      <span className="checkout-summary-sub">Qty 1, Billed {billingCycle}</span>
                    </div>
                    <div className="checkout-summary-val">
                      {isEnterprise && calculation.planPrice === 0 ? (
                        "Custom"
                      ) : (
                        <>
                          ${calculation.planPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          {calculation.isFounder && (
                            <span className="checkout-summary-strike">
                              ${(calculation.planPrice / 0.7).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="checkout-divider"></div>

                  <div className="checkout-summary-row">
                    <div className="checkout-summary-item" style={{ fontSize: '15px' }}>Subtotal</div>
                    <div className="checkout-summary-val" style={{ fontSize: '15px' }}>
                      ${calculation.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  {appliedCoupon && (
                    <div className="checkout-summary-coupon">
                      <div className="checkout-summary-row" style={{ marginBottom: 0 }}>
                        <div>
                          <div className="checkout-summary-item">
                            <Tag className="h-3.5 w-3.5" />
                            Talexia Coupon {appliedCoupon?.code || couponCode}
                          </div>
                          <span className="checkout-summary-sub" style={{ color: '#8a857a' }}>
                            {appliedCoupon?.discountType === 'percentage' 
                              ? `${appliedCoupon.discountValue}% off` 
                              : `$${appliedCoupon?.discountValue} off`} 
                            for this period
                          </span>
                        </div>
                        <div className="checkout-summary-val">
                          - ${calculation.discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="checkout-summary-row">
                    <div className="checkout-summary-item" style={{ fontSize: '14px', color: '#6b6b6b' }}>Sales tax (8.625%)</div>
                    <div className="checkout-summary-val" style={{ fontSize: '14px' }}>
                      ${calculation.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="checkout-total-row">
                    <div className="checkout-total-label">Total due today</div>
                    <div className="checkout-total-val">
                      {isEnterprise && calculation.total === 0 ? (
                        <span style={{ fontSize: '18px', color: '#6b6b6b' }}>Calculated at Checkout</span>
                      ) : (
                        <>
                          <span>US</span>
                          ${calculation.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="checkout-summary-footer">
                  <button
                    className="btn btn-dark checkout-full-width-btn"
                    style={{ padding: '20px' }}
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
                    <ShieldCheck className="h-4 w-4" style={{ color: '#8a6d28' }} />
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
    <Suspense fallback={
      <div className="talexia-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#faf8f3' }}>
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: '#c9a44c', marginBottom: '16px' }} />
        <p style={{ fontFamily: 'Georgia, serif', color: '#6b6b6b', fontStyle: 'italic' }}>Securing your session...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}