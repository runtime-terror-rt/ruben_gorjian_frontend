"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  User,
  Lock,
  Building2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

function EnterpriseAcceptForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") ?? "";

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteDetails, setInviteDetails] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(true);

  // If no token, show invalid state
  const isValidToken = !!token;

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setIsValidating(false);
        return;
      }

      try {
        const res = await fetch(`/api/auth/enterprise-invite/${token}`);
        if (res.ok) {
          const data = await res.json();
          setInviteDetails(data.invite || data.enterpriseInvite || data);
        }
      } catch (err) {
        console.error("Error validating token:", err);
      } finally {
        setIsValidating(false);
      }
    }

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup-enterprise-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Signup failed. Please try again.");
      }

      setIsSuccess(true);

      // Extract plan code from response if available, fallback to inviteDetails or query param
      const enterprisePlan = data.enterpriseInvite || data.invite || data.enterprisePlan || data.plan || inviteDetails || {};
      const planCode = data.planCode || enterprisePlan.planCode || enterprisePlan.lookupKey || searchParams.get("plan") || "ENT-UNKNOWN";
      const planName = data.planName || enterprisePlan.planName || enterprisePlan.name || "";
      
      // Try to find the price in various common fields
      const price = data.price ?? 
                    enterprisePlan.price ?? 
                    enterprisePlan.amount ?? 
                    enterprisePlan.monthlyPrice ?? 
                    searchParams.get("price") ?? 
                    0;
  
        // Redirect to checkout after short delay
        setTimeout(() => {
          router.push(`/billing/checkout?plan=${planCode}&price=${price}${planName ? `&name=${encodeURIComponent(planName)}` : ""}`);
        }, 2500);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-lime-400/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(163,230,53,0.03)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[460px] relative"
      >
        {/* Card */}
        <div className="bg-slate-950/80 border border-white/[0.06] rounded-[2rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-lime-400 to-transparent" />

          {/* Header */}
          <div className="px-10 pt-10 pb-8 text-center border-b border-white/5">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 blur-2xl bg-lime-400/20 rounded-full" />
                <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-lime-400/20 to-lime-900/30 flex items-center justify-center border border-lime-400/20">
                  <ShieldCheck className="h-8 w-8 text-lime-400" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-lime-400" />
              <span className="text-[10px] font-black text-lime-400 uppercase tracking-[0.3em]">Enterprise Access</span>
              <Sparkles className="h-3.5 w-3.5 text-lime-400" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mb-2">
              Activate Your Plan
            </h1>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              You've been invited to an exclusive enterprise plan. Set up your account to get started.
            </p>
          </div>

          {/* Body */}
          <div className="px-10 py-8">
            <AnimatePresence mode="wait">
              {isValidating ? (
                <motion.div
                  key="validating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 space-y-4"
                >
                  <Loader2 className="h-10 w-10 text-lime-400 animate-spin mx-auto" />
                  <p className="text-slate-500 text-sm font-medium">Validating your invitation...</p>
                </motion.div>
              ) : !isValidToken ? (
                <motion.div
                  key="invalid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 space-y-3"
                >
                  <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                    <ShieldCheck className="h-8 w-8 text-red-400" />
                  </div>
                  <p className="text-white font-bold text-lg">Invalid Invite Link</p>
                  <p className="text-slate-500 text-sm">
                    This invitation link is missing a token. Please use the link directly from your email.
                  </p>
                </motion.div>
              ) : isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 space-y-4"
                >
                  <div className="relative mx-auto w-fit">
                    <div className="absolute inset-0 blur-2xl bg-lime-400/30 rounded-full" />
                    <div className="relative h-20 w-20 rounded-3xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-lime-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-black text-xl tracking-tight">Account Activated!</p>
                    <p className="text-slate-400 text-sm mt-1 font-medium">
                      Welcome aboard. Redirecting to secure checkout...
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Loader2 className="h-4 w-4 text-lime-400 animate-spin" />
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {/* Invite token display (read-only) */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-lime-400/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-4 w-4 text-lime-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Invite Token</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{token}</p>
                    </div>
                  </div>

                  {/* Invite details display */}
                  {inviteDetails && (
                    <div className="bg-lime-400/5 border border-lime-400/20 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-lime-400" />
                          <p className="text-[10px] font-black text-lime-400 uppercase tracking-widest">Selected Plan</p>
                        </div>
                        <div className="px-2 py-0.5 rounded-full bg-lime-400/10 border border-lime-400/20">
                          <p className="text-[9px] font-black text-lime-400 uppercase">Enterprise</p>
                        </div>
                      </div>
                      <div className="flex items-end justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-white font-bold text-lg truncate tracking-tight">
                            {inviteDetails.planName || inviteDetails.name || "Enterprise Growth"}
                          </h3>
                          <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest mt-0.5">
                            {inviteDetails.companyName || inviteDetails.company || "Your Company"}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-white font-black text-xl tracking-tighter">
                            ${(inviteDetails.amount || inviteDetails.price || 0).toLocaleString()}
                          </p>
                          <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">
                            / {inviteDetails.billingCycle?.toLowerCase() || "monthly"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Name field */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        className="w-full h-12 pl-11 pr-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm font-medium placeholder:text-slate-700 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Create Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        required
                        minLength={8}
                        className="w-full h-12 pl-11 pr-12 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm font-medium placeholder:text-slate-700 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm font-medium"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isLoading || !name || !password}
                    className="w-full h-13 py-3.5 rounded-2xl font-black text-[13px] tracking-wider uppercase transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 bg-lime-400 hover:bg-lime-300 text-slate-950 shadow-[0_8px_30px_rgba(163,230,53,0.25)] mt-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Activating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Activate Enterprise Account</span>
                        <ArrowRight className="h-4 w-4 stroke-[3px]" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-10 pb-8 text-center">
            <p className="text-[10px] text-slate-700 font-medium">
              Protected by Talexia Enterprise Security •{" "}
              <span className="text-lime-400/50">End-to-End Encrypted</span>
            </p>
          </div>
        </div>

        {/* Bottom branding */}
        <div className="text-center mt-6">
          <p className="text-[11px] text-slate-700 font-medium">
            © 2026 Talexia. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function EnterpriseAcceptPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-lime-400 animate-spin" />
      </div>
    }>
      <EnterpriseAcceptForm />
    </Suspense>
  );
}
