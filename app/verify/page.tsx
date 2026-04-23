"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSessionContext } from "@/context/SessionContext";
import { getReturnToFromQuery, validateReturnTo } from "@/lib/return-to";
import { getPlanSelection } from "@/lib/plan-selection";

function VerifyPageInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { session, refresh, loading: sessionLoading } = useSessionContext();

  // Get returnTo from query, or check sessionStorage (from signup), or use default
  let returnTo = getReturnToFromQuery(searchParams, "/pricing");
  if (returnTo === "/dashboard" && typeof window !== "undefined") {
    const stored = sessionStorage.getItem("signup_return_to");
    if (stored) {
      const validated = validateReturnTo(stored);
      if (validated) {
        returnTo = validated;
        sessionStorage.removeItem("signup_return_to");
      }
    }
  }
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending"
  );
  const [message, setMessage] = useState("Verifying your email...");
  const [emailForResend, setEmailForResend] = useState("");
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (session?.email) {
      setEmailForResend(session.email);
    }
  }, [session?.email]);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        setMessage("Missing verification token.");
        return;
      }
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          credentials: "include",
        });
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body?.error || "Unable to verify email.");
        }
        setStatus("success");
        setMessage("Email verified! Setting up your account...");
        setVerified(true);

        // Refresh session to get latest user state including pendingPlanCode and resolved planCategory
        // Wait a bit to ensure backend has processed the verification
        await new Promise((resolve) => setTimeout(resolve, 500));
        await refresh();
      } catch (err: unknown) {
        setStatus("error");
        const message =
          err instanceof Error ? err.message : "Unable to verify email.";
        setMessage(message);
      }
    }
    verify();
  }, [token, refresh]);

  // After verification and session refresh, determine routing
  useEffect(() => {
    if (!verified || sessionLoading || !session) return;

    async function routeAfterVerification() {
      if (!session) return;

      // Get plan selection from localStorage or query params (primary source)
      const { getOnboardingRouteForPlanCategory } =
        await import("@/lib/onboarding-routes");
      const planSelection = getPlanSelection(searchParams);

      // Check subscription status to determine routing
      const subscriptionStatus = session.subscription?.status;
      const planCategory = session.subscription?.planCategory;
      const pendingPlanCode =
        session.pendingPlanCode || planSelection?.planCode;

      // Log plan resolution for debugging
      console.log("[Verify] Plan resolution:", {
        subscriptionStatus,
        planCategory,
        pendingPlanCode,
        planSelection,
        hasSubscription: !!session.subscription,
      });

      // Determine the plan to use: from query params > pendingPlanCode > subscription > selection
      const queryPlanCode = searchParams.get("planCode");
      const planCodeToUse =
        queryPlanCode ||
        pendingPlanCode ||
        session.subscription?.planCode ||
        planSelection?.planCode;
      
      // Infer category: prioritize Enterprise as FULL_MANAGEMENT
      const isEnterprise = planCodeToUse?.startsWith("ENT_") || planCodeToUse?.startsWith("ENT-");
      let planCategoryToUse = planCategory;
      if (isEnterprise) {
        planCategoryToUse = "FULL_MANAGEMENT";
      }

      // Case 1: User needs to pay for the resolved plan
      // Trigger if: 
      // 1. Subscription is INCOMPLETE
      // 2. It is an ENTERPRISE plan (always go to checkout)
      // 3. We have a plan to use that DIFFERENT from the current active subscription (upgrade/change)
      const isNewPlan = planCodeToUse && session.subscription?.planCode !== planCodeToUse;
      
      if (
        subscriptionStatus === "INCOMPLETE" ||
        (isEnterprise && subscriptionStatus !== "ACTIVE" && subscriptionStatus !== "TRIALING") ||
        (isNewPlan && subscriptionStatus === "ACTIVE") // Upgrade/Change scenario
      ) {
        if (planCodeToUse) {
          console.log(
            "[Verify] Payment required, redirecting to frontend checkout page for plan:",
            planCodeToUse
          );

          let redirectUrl = `/billing/checkout?plan=${planCodeToUse}`;
          
          // Try to recover plan price and name from localStorage for Enterprise plans
          const isEnterprise = planCodeToUse?.startsWith("ENT_") || planCodeToUse?.startsWith("ENT-");
          if (isEnterprise) {
            try {
              const savedPrice = localStorage.getItem(`ent_plan_${planCodeToUse}_price`);
              const savedName = localStorage.getItem(`ent_plan_${planCodeToUse}_name`);
              
              if (savedPrice) redirectUrl += `&price=${encodeURIComponent(savedPrice)}`;
              if (savedName) redirectUrl += `&name=${encodeURIComponent(savedName)}`;
            } catch (e) {
              console.error("[Verify] Error reading from localStorage:", e);
            }
          }
          
          window.location.href = redirectUrl;
          return;
        }
      }

      // Case 2: User has ACTIVE or TRIALING subscription → route to onboarding
      // Use planCategory from subscription or resolved from plan selection
      if (
        subscriptionStatus === "ACTIVE" ||
        subscriptionStatus === "TRIALING"
      ) {
        const category = planCategoryToUse || planCategory;
        if (category) {
          const onboardingRoute = getOnboardingRouteForPlanCategory(category);
          if (onboardingRoute) {
            console.log(
              "[Verify] Active subscription, routing to onboarding:",
              onboardingRoute
            );
            window.location.href = onboardingRoute;
            return;
          }
        }
      }

      /* 
      // Case 3: Use plan selection to determine onboarding route
      if (planCodeToUse && !planCategoryToUse) {
        // Try to get route from plan code
        const { getOnboardingRouteForPlanCode } =
          await import("@/lib/onboarding-routes");
        const route = await getOnboardingRouteForPlanCode(planCodeToUse);
        if (route) {
          console.log("[Verify] Routing to onboarding from plan code:", route);
          window.location.href = route;
          return;
        }
      }
      */

      // Case 4: User has no plan → redirect to pricing
      if (!planCategoryToUse && !planCodeToUse) {
        console.log("[Verify] No plan found, redirecting to pricing");
        window.location.href = "/pricing";
        return;
      }

      // Case 5: Fallback - route to pricing page
      console.log("[Verify] Fallback: routing to pricing page");
      window.location.href = "/pricing";
    }

    routeAfterVerification();
  }, [verified, sessionLoading, session, searchParams]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-lg w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center shadow-xl">
        <h1 className="text-2xl font-semibold text-white">Verify your email</h1>
        <p className="mt-3 text-sm text-slate-300">{message}</p>
        {status === "error" && (
          <div className="mt-6 space-y-3">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-lime-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow hover:bg-lime-300"
            >
              Back to login
            </a>
            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Resend verification email
              </label>
              <input
                type="email"
                value={emailForResend}
                onChange={(e) => setEmailForResend(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-lime-400/40 focus:border-lime-400 focus:ring-2"
              />
              <button
                onClick={async () => {
                  setResendMessage(null);
                  try {
                    const res = await fetch("/api/auth/resend-verification", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: emailForResend }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      setResendMessage(
                        data.error || "Unable to resend verification email."
                      );
                      return;
                    }
                    setResendMessage(
                      "Verification email resent. Please check your inbox."
                    );
                  } catch {
                    setResendMessage("Unable to resend verification email.");
                  }
                }}
                className="w-full inline-flex items-center justify-center rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800/70"
              >
                Resend
              </button>
              {resendMessage && (
                <p className="text-xs text-slate-300">{resendMessage}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <VerifyPageInner />
    </Suspense>
  );
}
