"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSessionContext } from "@/context/SessionContext";
function OnboardingRouterContent() {
  const { session, loading, refresh } = useSessionContext();
  const router = useRouter();
  const pathname = usePathname();
  const hasRefreshed = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.push("/login?returnTo=/onboarding");
      return;
    }

    async function routeToOnboarding() {
      // CRITICAL FIX: Refresh session ONCE to get latest onboarding completion status
      // This prevents infinite "Loading onboarding..." when user has completed onboarding
      // but the session context has stale data
      if (!hasRefreshed.current) {
        hasRefreshed.current = true;
        await refresh();
        // After refresh, the useEffect will re-run with fresh session data
        // so we return here to let it re-run
        return;
      }
      // TypeScript guard: session is checked above, but we need to assert it here
      if (!session) {
        router.push("/login?returnTo=/onboarding");
        return;
      }

      const subscriptionStatus = session.subscription?.status;
      const planCategory = session.subscription?.planCategory;
      const pendingPlanCode = session.pendingPlanCode;
      const role = session.role;

      // DEBUG LOGGING
      console.group("[OnboardingRouter] Routing Decision Point");
      console.log("✓ Session exists:", !!session);
      console.log("✓ subscription.planCode:", session.subscription?.planCode);
      console.log("✓ subscription.planCategory:", planCategory);
      console.log("✓ subscription.status:", subscriptionStatus);
      console.log("✓ pendingPlanCode:", pendingPlanCode);
      console.groupEnd();

      // ROLE SECURITY: Admins and Super Admins should NEVER see onboarding
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        console.log("[OnboardingRouter] Admin role detected, redirecting to /admin");
        router.push("/admin");
        return;
      }

      // Log plan resolution for debugging
      console.log("[OnboardingRouter] Plan resolution:", {
        subscriptionStatus,
        planCategory,
        pendingPlanCode,
        hasSubscription: !!session.subscription,
      });

      // CRITICAL: If user has INCOMPLETE subscription or pendingPlanCode without active subscription,
      // they need to complete checkout first - redirect to checkout, NOT onboarding
      if (
        subscriptionStatus === "INCOMPLETE" ||
        (pendingPlanCode &&
          subscriptionStatus !== "ACTIVE" &&
          subscriptionStatus !== "TRIALING")
      ) {
        const rawCode = session.subscription?.planCode || pendingPlanCode;
        const planCodeToCheckout = rawCode?.toUpperCase();
        if (planCodeToCheckout) {
          console.log(
            "[OnboardingRouter] Payment required, redirecting to checkout:",
            planCodeToCheckout,
          );
          router.push(`/billing/checkout?plan=${encodeURIComponent(planCodeToCheckout)}`);
          return;
        }
      }

      // Route to onboarding based on planCategory from subscription OR pendingPlanCode
      // The backend resolves planCategory from pendingPlanCode when subscription status is INCOMPLETE
      // So we should use the planCategory from the session, which should be resolved correctly

      // If no planCategory is available and no pendingPlanCode, redirect to pricing
      if (!planCategory && !pendingPlanCode) {
        console.log(
          "[OnboardingRouter] No plan category and no pending plan code, redirecting to pricing",
        );
        router.push("/pricing");
        return;
      }

      // If we have a planCategory (from subscription or resolved from pendingPlanCode), route accordingly
      // Note: Users with INCOMPLETE subscriptions should have planCategory resolved from pendingPlanCode
      if (!planCategory) {
        // Try to resolve from plan code
        console.log("[OnboardingRouter] No planCategory, attempting to resolve from plan code...");

        if (pendingPlanCode || session.subscription?.planCode) {
          const planCodeToResolve = session.subscription?.planCode || pendingPlanCode;

          // Check if it's an enterprise plan
          if (planCodeToResolve?.toUpperCase().startsWith("ENT")) {
            console.log("[OnboardingRouter] Detected enterprise plan code:", planCodeToResolve);
            router.push("/onboarding/brand-brief");
            return;
          }

          // Otherwise try to fetch plan info
          console.log("[OnboardingRouter] Attempting to fetch plan category for:", planCodeToResolve);
          // This will be fetched in the next section
        } else {
          console.log(
            "[OnboardingRouter] No plan category resolved, redirecting to pricing",
          );
          router.push("/pricing");
          return;
        }
      }

      // Route to plan-specific onboarding using canonical mapping
      const { getOnboardingRouteForPlanCategory } =
        await import("@/lib/onboarding-routes");

      const onboardingRoute = getOnboardingRouteForPlanCategory(planCategory);

      if (onboardingRoute) {
        if (onboardingRoute === pathname) {
          return;
        }

        // Determine if completed - All plans now only check brand brief completion
        const isCompleted = session.brandBriefCompleted || session.brandBriefOnboardingCompleted;

        /* // Commented out old plan-specific completion logic
        const pendingCode = session.pendingPlanCode;
        const { getPlanSelection } = await import("@/lib/plan-selection");
        const selection = getPlanSelection();
        const isEnterprise =
          pendingCode?.toUpperCase().startsWith("ENT") ||
          session.subscription?.planCode?.toUpperCase().startsWith("ENT") ||
          selection?.planCode?.toUpperCase().startsWith("ENT") ||
          planCategory?.toUpperCase() === "ENTERPRISE" ||
          planCategory?.toUpperCase() === "BRAND_BRIEF" ||
          planCategory?.toUpperCase() === "BRAND_BRIF";

        const isCompletedOld = isEnterprise
          ? (session.brandBriefCompleted || session.brandBriefOnboardingCompleted)
          : (
            ((planCategory === "CALENDAR_ONLY" ||
              planCategory === "VISUAL_CALENDAR" ||
              planCategory === "JEWELRY_CALENDAR_ONLY") &&
              session.calendarOnboardingCompleted) ||
            ((planCategory === "VISUAL_ADD_ON" ||
              planCategory === "REGULAR_VISUAL" ||
              planCategory === "JEWELRY_VISUAL") &&
              session.visualOnboardingCompleted) ||
            ((planCategory === "FULL_MANAGEMENT" ||
              planCategory === "JEWELRY_FULL_MANAGEMENT") &&
              session.fullManagementOnboardingCompleted)
          );
        */

        if (isCompleted) {
          router.push("/dashboard");
        } else {
          router.push(onboardingRoute);
        }
      } else {
        // Unknown plan category - redirect to pricing
        console.log("[OnboardingRouter] Unknown plan category:", planCategory);
        router.push("/pricing");
      }
    }

    routeToOnboarding();
  }, [session, loading, router, pathname, refresh]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-300">Loading onboarding...</p>
      </div>
    </div>
  );
}

export default function OnboardingRouterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
          <div className="text-center space-y-3">
            <div className="h-8 w-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-300">Loading...</p>
          </div>
        </div>
      }
    >
      <OnboardingRouterContent />
    </Suspense>
  );
}