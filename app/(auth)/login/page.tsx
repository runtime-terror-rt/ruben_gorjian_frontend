"use client";
import { FormEvent, Suspense, useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { GoogleLoginButton } from "@/components/google-login-button";
import { useSessionContext } from "@/context/SessionContext";

function LoginPageInner() {
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refresh } = useSessionContext();
  const redirect = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    setMounted(true);
  }, []);
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    let isSuccess = false;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body?.error || "Unable to login.");
      }

      setSuccess("Logged in. Redirecting...");
      await refresh();
      const role = body?.role || body?.user?.role;
      const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
      const destination = (isAdmin && redirect === "/dashboard") ? "/admin" : redirect;
      isSuccess = true;
      router.push(destination);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to login.";
      setError(msg);
      if (msg.toLowerCase().includes("verify")) {
        setSuccess("Not seeing the email? Resend the verification link below.");
      }
    } finally {
      if (!isSuccess) {
        setSubmitting(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center px-4" style={{ fontFamily: "Georgia, serif" }}>
      <div className="w-full max-w-md rounded-xl border border-[#d9d4c9] bg-white text-[#14110c] p-8 shadow-[0_18px_44px_rgba(20,17,12,0.06)]">
        <h1 className="text-3xl font-normal text-[#14110c] tracking-tight">Login</h1>
        <p className="mt-2 text-[13.5px] text-[#6b6b6b]" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", lineHeight: "1.65" }}>Use your email and password to sign in.</p>

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
              onChange={(e) => setEmailValue(e.target.value)}
            />
          </div>

          <div className="space-y-1 ">
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

          <button
            type="submit"
            disabled={!mounted || submitting}
            className="w-full inline-flex items-center justify-center rounded-sm bg-[#14110c] hover:bg-[#b08d3e] px-6 py-3.5 text-[11px] font-semibold tracking-[2px] uppercase text-white transition-all disabled:cursor-not-allowed disabled:opacity-70 mt-6"
            style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
          >
            {!mounted ? "Loading..." : submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4">
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#d9d4c9]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[2px]" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
              <span className="bg-white px-2 text-[#6b6b6b]">or</span>
            </div>
          </div>
          <GoogleLoginButton redirect={redirect} />
        </div>

        <p className="mt-5 text-[13.5px] text-[#6b6b6b] text-center" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
          Don&apos;t have an account?{" "}
          {/* OLD: href={`/signup?redirect=${encodeURIComponent(redirect)}`} */}
          <Link
            className="text-[#b08d3e] hover:text-[#8a6d28] font-semibold underline underline-offset-2 transition-colors"
            href={`/signup?plan=${searchParams.get("plan") ||
              (redirect.includes("plan=") ? redirect.split("plan=")[1].split("&")[0] : "")
              }&returnTo=${encodeURIComponent(redirect)}`}
          >
            Sign up
          </Link>
        </p>

        {success && success.toLowerCase().includes("resend") && (
          <button
            type="button"
            onClick={async () => {
              try {
                await fetch("/api/auth/resend-verification", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: emailValue }),
                });
                setSuccess(
                  "Verification email resent. Please check your inbox.",
                );
              } catch {
                setError("Unable to resend verification email.");
              }
            }}
            className="mt-4 w-full inline-flex items-center justify-center rounded-sm border border-[#d9d4c9] px-6 py-3.5 text-[11px] font-semibold tracking-[2px] uppercase text-[#14110c] hover:bg-[#f6f1e6] transition-colors"
            style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
          >
            Resend verification email
          </button>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f3] text-[#14110c] flex items-center justify-center" style={{ fontFamily: "Georgia, serif" }}>
          Loading...
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
