"use client";
import { FormEvent, Suspense, useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { GoogleLoginButton } from "@/components/google-login-button";
import { getReturnToFromQuery } from "@/lib/return-to";

function SignupPageInner() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnTo = getReturnToFromQuery(searchParams, "/dashboard");

  // Professional redirect with error message if no plan is selected
  useEffect(() => {
    const plan = searchParams.get("plan");
    if (!plan) {
      setError("Please select a plan to continue. Redirecting to plans...");
      const timer = setTimeout(() => {
        router.push("/plan");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  // Store returnTo in sessionStorage for after email verification
  if (typeof window !== "undefined" && returnTo !== "/dashboard") {
    sessionStorage.setItem("signup_return_to", returnTo);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    // Honeypot — bots fill this; real users never see it
    const websiteUrl = String(form.get("websiteUrl") || "");

    // Strictly get plan from query params to avoid auto-selecting stale localStorage plans
    const pendingPlanCode = searchParams.get("plan");

    // If no plan selected, redirect to pricing
    if (!pendingPlanCode) {
      setError("Please select a plan to continue.");
      setSubmitting(false);
      // Redirect to plan page after a short delay
      setTimeout(() => {
        router.push("/plan");
      }, 2000);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          pendingPlanCode,
          websiteUrl,
        }),
      });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body?.error || "Unable to sign up.");
      }

      setSuccess(
        "Account created. Check your email for the verification link to continue.",
      );
      // Do not redirect until verified; verification email contains link.
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to sign up.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center px-4" style={{ fontFamily: "Georgia, serif" }}>
      <div className="w-full max-w-md rounded-xl border border-[#d9d4c9] bg-white text-[#14110c] p-8 shadow-[0_18px_44px_rgba(20,17,12,0.06)]">
        <h1 className="text-3xl font-normal text-[#14110c] tracking-tight">Create account</h1>
        <p className="mt-2 text-[13.5px] text-[#6b6b6b]" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", lineHeight: "1.65" }}>
          Create your account. We&apos;ll send you an email to verify before you
          pick a plan.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-primary">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-xs text-primary">
              {success}
            </div>
          )}

          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-[11px] font-semibold uppercase tracking-[2px] text-[#14110c]"
              style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-[#d9d4c9] px-3 py-3 text-[13.5px] text-[#14110c] outline-none focus:border-[#b08d3e] focus:ring-2 focus:ring-[#b08d3e] transition-colors bg-white"
              style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-[11px] font-semibold uppercase tracking-[2px] text-[#14110c]"
              style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                minLength={8}
                required
                className="w-full rounded-lg border border-[#d9d4c9] px-3 py-3 text-[13.5px] text-[#14110c] outline-none focus:border-[#b08d3e] focus:ring-2 focus:ring-[#b08d3e] pr-10 transition-colors bg-white"
                style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#6b6b6b] hover:text-[#14110c] transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Honeypot: hidden from real users; bots often fill it */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
            <label htmlFor="websiteUrl">Do not fill this field</label>
            <input
              type="text"
              id="websiteUrl"
              name="websiteUrl"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center rounded-sm bg-[#14110c] hover:bg-[#b08d3e] px-6 py-3.5 text-[11px] font-semibold tracking-[2px] uppercase text-white transition-all disabled:cursor-not-allowed disabled:opacity-70 mt-2"
            style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
          >
            {submitting ? "Creating..." : "Create account"}
          </button>
          <div className="mt-6">
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#d9d4c9]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[2px]" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                <span className="bg-white px-2 text-[#6b6b6b]">or</span>
              </div>
            </div>
            <GoogleLoginButton returnTo={returnTo} requirePlan={true} />
          </div>
        </form>

        <p className="mt-5 text-[13.5px] text-[#6b6b6b] text-center" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
          Already have an account?{" "}
          <Link
            className="text-[#b08d3e] hover:text-[#8a6d28] font-semibold underline underline-offset-2 transition-colors"
            href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f3] text-[#14110c] flex items-center justify-center" style={{ fontFamily: "Georgia, serif" }}>
          Loading...
        </div>
      }
    >
      <SignupPageInner />
    </Suspense>
  );
}
