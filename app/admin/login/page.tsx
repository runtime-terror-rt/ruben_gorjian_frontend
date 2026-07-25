"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSessionContext } from "@/context/SessionContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { session, loading: sessionLoading, refresh } = useSessionContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (sessionLoading) return;
    
    const isAdmin = session?.role === "ADMIN" || session?.role === "SUPER_ADMIN";
    if (isAdmin) {
      router.replace("/admin");
    }
  }, [session, sessionLoading, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Login failed");
      }
      await refresh();
      router.push("/admin");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#faf8f3] to-indigo-950 text-[#14110c] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#b08d3e]" />
          <p className="text-sm text-[#6b6b6b]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#faf8f3] to-indigo-950 text-[#14110c] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-[#d9d4c9] bg-[#ffffff]/70 p-6 shadow-xl">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-lime-300/20 border border-lime-300/40 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-lime-200" />
          </div>
          <h1 className="text-xl font-semibold text-[#14110c]">Admin sign in</h1>
          <p className="text-sm text-[#6b6b6b]">Access the Talexia control center.</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm text-[#14110c]">Admin email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#d9d4c9] bg-[#faf8f3] px-3 py-2 text-sm text-[#14110c]"
              placeholder="admin@talexia.test"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-[#14110c]">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#d9d4c9] bg-[#faf8f3] px-3 py-2 text-sm text-[#14110c] pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-[#14110c] transition-colors focus:outline-none"
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
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#b08d3e] px-4 py-2 text-sm font-semibold text-slate-950 shadow hover:bg-[#e6e1d8] disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>

          {error && <p className="text-xs text-red-300">{error}</p>}
        </form>
      </div>
    </div>
  );
}
