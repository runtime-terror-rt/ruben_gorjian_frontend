"use client";

import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSessionContext } from "@/context/SessionContext";
import { Button } from "@/components/ui/button";

function BillingSuccessContent() {
  const { refresh, session } = useSessionContext();
  const router = useRouter();
  useSearchParams(); // presence triggers re-render when query changes
  const [checking, setChecking] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const retriesRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Exponential backoff delays: 1s, 2s, 4s, 8s, 16s (total ~31s, 5 checks)
  const BACKOFF_DELAYS = [1000, 2000, 4000, 8000, 16000];

  // Manual sync function
  const syncSubscription = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/billing/sync", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refresh();
      }
    } catch (err) {
      console.error("Failed to sync subscription", err);
    } finally {
      setSyncing(false);
    }
  }, [refresh]);

  useEffect(() => {
    // Immediately sync subscription from Stripe on page load
    syncSubscription();

    const checkSubscription = async () => {
      await refresh();
    };

    // Initial check
    checkSubscription();

    // Schedule subsequent checks with exponential backoff
    const scheduleNext = (attempt: number) => {
      if (attempt >= BACKOFF_DELAYS.length) {
        setChecking(false);
        return;
      }
      timeoutRef.current = setTimeout(async () => {
        retriesRef.current = attempt + 1;
        await checkSubscription();
        scheduleNext(attempt + 1);
      }, BACKOFF_DELAYS[attempt]);
    };

    scheduleNext(0);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [refresh, syncSubscription]);

  // Check session status after refresh
  useEffect(() => {
    const checkStatus = async () => {
      const { getPlanSelection } = await import("@/lib/plan-selection");
      const selection = getPlanSelection();
      const expectedPlanCode = selection?.planCode;

      const currentPlanCode = session?.subscription?.planCode;
      const status = session?.subscription?.status;

      const isStatusActive = status === "ACTIVE" || status === "TRIALING";

      // For enterprise plans, the plan code might be generated dynamically, so we shouldn't strictly require a match
      // if the current plan is an enterprise plan
      const isExpectedEnterprise = expectedPlanCode?.toUpperCase().startsWith("ENT");
      const isCurrentEnterprise = currentPlanCode?.toUpperCase().startsWith("ENT") ||
        session?.subscription?.planCategory?.toUpperCase() === "ENTERPRISE" ||
        session?.subscription?.planCategory?.toUpperCase() === "BRAND_BRIEF" ||
        session?.subscription?.planCategory?.toUpperCase() === "BRAND_BRIF";

      const isPlanMatched = !expectedPlanCode ||
        currentPlanCode === expectedPlanCode ||
        (isExpectedEnterprise && isCurrentEnterprise) ||
        (!isExpectedEnterprise && isCurrentEnterprise); // If they upgraded to enterprise, consider it matched

      const isActive = isStatusActive && isPlanMatched;

      if (isActive && checking) {
        setChecking(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // We removed the automatic redirect to give the user full control.
        // They can now read the success message and proceed by clicking the button below.
      }
    };

    checkStatus();
  }, [session, checking]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#faf8f3', color: '#14110c', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div className="max-w-lg w-full text-center p-10" style={{ backgroundColor: '#fff', border: '1px solid #e8dcbe', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#f6efdd', border: '1px solid #e8dcbe' }}>
            <svg
              className="w-8 h-8"
              style={{ color: '#8a6d28' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl mb-3" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#14110c' }}>
            Payment Successful
          </h1>
          <p className="text-sm" style={{ color: '#6b6b6b', lineHeight: 1.6 }}>
            {checking
              ? "Activating your subscription..."
              : session?.subscription?.status === "ACTIVE" ||
                session?.subscription?.status === "TRIALING"
                ? "Your subscription is now active. Welcome to Talexia!"
                : "Your payment was successful. Your subscription will be activated shortly."}
          </p>
          {checking && (
            <div className="mt-6 flex flex-col items-center justify-center gap-3">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 border-2 rounded-full animate-spin" style={{ borderColor: '#e8dcbe', borderTopColor: '#8a6d28' }} />
                <span className="text-sm" style={{ color: '#8a857a' }}>Processing...</span>
              </div>
              {!syncing && retriesRef.current >= 2 && (
                <button
                  onClick={syncSubscription}
                  className="mt-3 text-xs px-4 py-2"
                  style={{ border: '1px solid #e8dcbe', borderRadius: '4px', color: '#8a6d28', backgroundColor: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Sync Subscription Status
                </button>
              )}
            </div>
          )}
          {syncing && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="h-5 w-5 border-2 rounded-full animate-spin" style={{ borderColor: '#e8dcbe', borderTopColor: '#8a6d28' }} />
              <span className="text-sm" style={{ color: '#8a857a' }}>
                Syncing with Stripe...
              </span>
            </div>
          )}
        </div>

        <div className="text-left p-6 mb-8 mt-8" style={{ backgroundColor: '#faf8f3', border: '1px solid #e8dcbe', borderRadius: '4px' }}>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#8a6d28', fontWeight: 600, letterSpacing: '1.5px' }}>
            Next Steps
          </p>
          <ol className="space-y-4 text-sm" style={{ color: '#14110c', lineHeight: 1.5 }}>
            <li className="flex items-start gap-3">
              <span style={{ color: '#8a6d28', fontWeight: 600 }}>01.</span>
              <span>Complete your Brand Brief authorization</span>
            </li>
            <li className="flex items-start gap-3">
              <span style={{ color: '#8a6d28', fontWeight: 600 }}>02.</span>
              <span>Connect your social media channels securely</span>
            </li>
            <li className="flex items-start gap-3">
              <span style={{ color: '#8a6d28', fontWeight: 600 }}>03.</span>
              <span>Our editorial team begins content production</span>
            </li>
          </ol>
        </div>

        <div className="flex justify-center">
          {(() => {
            const isCompleted = session?.brandBriefCompleted || session?.brandBriefOnboardingCompleted || session?.onboardingCompleted;

            return isCompleted ? (
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center px-8 py-4 text-sm transition-colors"
                style={{ backgroundColor: '#14110c', color: '#faf8f3', borderRadius: '4px', fontWeight: 600, letterSpacing: '0.5px' }}
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/brandbrief"
                className="w-full inline-flex items-center justify-center px-8 py-4 text-sm transition-colors"
                style={{ backgroundColor: '#14110c', color: '#faf8f3', borderRadius: '4px', fontWeight: 600, letterSpacing: '0.5px' }}
              >
                Start Onboarding
              </Link>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#faf8f3' }}>
          <div className="max-w-lg w-full text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="h-6 w-6 border-2 rounded-full animate-spin" style={{ borderColor: '#e8dcbe', borderTopColor: '#8a6d28' }} />
              <span className="text-sm" style={{ color: '#6b6b6b' }}>Securing your session...</span>
            </div>
          </div>
        </div>
      }
    >
      <BillingSuccessContent />
    </Suspense>
  );
}
