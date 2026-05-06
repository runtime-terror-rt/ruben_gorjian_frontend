"use client";

import { useState, useEffect } from "react";
import { useSessionContext } from "@/context/SessionContext";
import { validateReturnTo } from "@/lib/return-to";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

declare global {
  interface Window {
    google: any;
  }
}

type Props = { returnTo?: string; redirect?: string; requirePlan?: boolean };

export function GoogleLoginButton({ returnTo, redirect, requirePlan }: Props) {
  const finalReturnTo = returnTo || redirect || "/dashboard";
  const [loading, setLoading] = useState(false);
  const { refresh } = useSessionContext();
  const router = useRouter();

  useEffect(() => {
    // Initialize Google Identity Services
    const initializeGSI = () => {
      if (typeof window !== "undefined" && window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        // Render the official button inside our hidden container
        window.google.accounts.id.renderButton(
          document.getElementById("google-button-hidden"),
          {
            type: "standard",
            shape: "rectangular",
            theme: "outline",
            size: "large",
            text: "continue_with",
            width: "100%"
          }
        );
      }
    };

    if (typeof window !== "undefined") {
      if (window.google) {
        initializeGSI();
      } else {
        const interval = setInterval(() => {
          if (window.google) {
            initializeGSI();
            clearInterval(interval);
          }
        }, 100);
        return () => clearInterval(interval);
      }
    }
  }, []);

  const handleCredentialResponse = async (response: any) => {
    setLoading(true);
    try {
      const idToken = response.credential;

      let pendingPlanCode: string | null = null;
      try {
        const searchParams = new URLSearchParams(window.location.search);
        if (requirePlan) {
          // Strictly use query params to avoid auto-selecting stale localStorage plans
          pendingPlanCode = searchParams.get("plan");
        } else {
          // Fallback to localStorage for normal logins
          const { getPlanSelection } = await import("@/lib/plan-selection");
          const planSelection = getPlanSelection(searchParams);
          pendingPlanCode = planSelection?.planCode || null;
        }
      } catch (e) {
        console.error("Error getting plan selection:", e);
      }

      // If requirePlan is true and no plan is found, redirect to pricing
      if (requirePlan && !pendingPlanCode) {
        window.location.href = "/pricing";
        return;
      }

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          pendingPlanCode: pendingPlanCode || undefined
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Google login failed");
      }

      // Success! Refresh session context to ensure global state is updated
      await refresh();

      toast.success("Successfully logged in with Google!");

      // Fetch fresh session data to ensure we have populated subscription info
      const meRes = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      const freshSession = meRes.ok ? await meRes.json() : (data?.user || data);

      const role = freshSession?.role;
      const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

      if (isAdmin) {
        window.location.href = "/admin";
        return;
      }

      const subscription = freshSession?.subscription;
      const planCategory = subscription?.planCategory;
      const onboardingCompleted =
        freshSession?.onboardingCompleted ||
        (planCategory === "CALENDAR_ONLY" && freshSession?.calendarOnboardingCompleted) ||
        (planCategory === "VISUAL_ADD_ON" && freshSession?.visualOnboardingCompleted) ||
        (planCategory === "FULL_MANAGEMENT" && freshSession?.fullManagementOnboardingCompleted);

      // 1. If no payment (no subscription or status is not ACTIVE/TRIALING)
      if (!subscription || (subscription.status !== "ACTIVE" && subscription.status !== "TRIALING")) {
        window.location.href = "/pricing";
        return;
      }

      // 2. If has payment but onboarding not done
      if (!onboardingCompleted) {
        window.location.href = "/onboarding";
        return;
      }

      // 3. Both exist (or it's a specific returnTo)
      const validated = validateReturnTo(finalReturnTo) || "/dashboard";
      window.location.href = validated;
    } catch (err: any) {
      console.error("Google login error:", err);
      toast.error(err.message || "Unable to sign in with Google");
      setLoading(false); // Only reset loading on error; on success we're redirecting anyway
    }
  };

  const handleGoogleLogin = () => {
    // Attempt to trigger the hidden official button's click
    const hiddenButton = document.getElementById("google-button-hidden")?.querySelector('div[role="button"]');
    if (hiddenButton) {
      (hiddenButton as HTMLElement).click();
    } else {
      // Fallback to prompt
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="w-full relative">
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex items-center justify-center gap-3 w-full px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-900 font-medium shadow-sm active:scale-[0.98]"
      >
        {loading ? (
          <div className="h-5 w-5 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
        ) : (
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {loading ? "Signing in..." : "Continue with Google"}
      </button>

      {/* 
        HACK: We render the official Google button invisibly on top of our custom button.
        This ensures that a real user interaction triggers the Google popup,
        which is required for security and avoids popup blockers.
      */}
      <div
        id="google-button-hidden"
        className="absolute inset-0 opacity-[0.01] overflow-hidden pointer-events-auto"
        title="Continue with Google"
      ></div>
    </div>
  );
}
