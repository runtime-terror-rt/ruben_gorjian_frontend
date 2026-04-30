"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Building2, 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Globe,
  Camera,
  CheckSquare,
  TrendingUp,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

function EnterprisePlanDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const planCode = searchParams.get("planCode");
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const response = await fetch(`/api/enterprise-plan/invites/${planCode}/details`);
        if (!response.ok) throw new Error("Failed to load proposal details");
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (planCode) {
      fetchDetails();
    } else {
      setError("No plan code provided in the URL.");
      setLoading(false);
    }
  }, [planCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-lime-400 animate-spin mx-auto" />
          <p className="text-slate-500 font-medium tracking-widest uppercase text-[10px]">Loading Proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-950 border border-white/5 rounded-3xl p-10 text-center space-y-6">
          <div className="h-20 w-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h2 className="text-white font-black text-xl">Invalid Proposal</h2>
          <p className="text-slate-500 text-sm">{error || "This proposal link is no longer valid or the plan code is incorrect."}</p>
          <Button onClick={() => router.push("/")} className="w-full bg-white/5 hover:bg-white/10 text-white rounded-2xl h-12 font-bold">Return Home</Button>
        </div>
      </div>
    );
  }

  const { invite, proposal } = data;

  const handleAccept = () => {
    toast({
      title: "Sign Up Required",
      description: "Please create an account to proceed to billing and activate your plan.",
    });
    router.push(`/enterprise-plan/accept?token=${token}&planCode=${planCode}`);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-slate-300 font-sans selection:bg-lime-400/30 selection:text-lime-400 pb-20">
      {/* Background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lime-400/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[150px] rounded-full" />
      </div>

      {/* Hero Header */}
      <div className="relative pt-20 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
                <span className="text-[10px] font-black text-lime-400 uppercase tracking-[0.4em]">Exclusive Proposal</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
                {proposal?.planName || "Enterprise Growth"}
              </h1>
            </div>
            
            <div className="bg-slate-950/80 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl min-w-[280px]">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Monthly Investment</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white tracking-tighter">${(proposal?.amount || 0).toLocaleString()}</span>
                <span className="text-slate-600 font-bold uppercase text-xs tracking-widest">/ {proposal?.billingCycle || "MONTHLY"}</span>
              </div>
              <Button 
                onClick={handleAccept}
                className="w-full mt-8 bg-lime-400 hover:bg-lime-300 text-slate-950 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-[0_15px_30px_rgba(163,230,53,0.2)] transition-all active:scale-95 group"
              >
                Accept & Subscribe
                <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
          
          {/* Left Column: Client & Industry */}
          <div className="space-y-8 lg:col-span-1">
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <Building2 className="h-3 w-3" />
                Client Information
              </h3>
              <div className="bg-white/5 border border-white/5 p-6 rounded-3xl space-y-4">
                <div>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Company</p>
                  <p className="text-white font-bold">{invite.companyName}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Primary Contact</p>
                  <p className="text-white font-bold">{invite.fullName}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Industry</p>
                  <Badge variant="outline" className="bg-blue-400/5 border-blue-400/20 text-blue-400 font-black text-[10px] uppercase mt-1">
                    {proposal?.industry?.replace(/_/g, " ") || "Not Specified"}
                  </Badge>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <Globe className="h-3 w-3" />
                Digital Presence
              </h3>
              <div className="flex flex-wrap gap-2">
                {invite.socialPlatforms?.map((platform: string) => (
                  <Badge key={platform} className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase">
                    {platform}
                  </Badge>
                ))}
              </div>
            </section>
          </div>

          {/* Center Column: Content Plan */}
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <TrendingUp className="h-3 w-3" />
                Monthly Content Volume
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center group hover:bg-white/[0.07] transition-colors">
                  <p className="text-4xl font-black text-white mb-1 group-hover:scale-110 transition-transform">{proposal?.postsPerMonth || 0}</p>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Static Posts</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center group hover:bg-white/[0.07] transition-colors border-lime-400/10">
                  <p className="text-4xl font-black text-lime-400 mb-1 group-hover:scale-110 transition-transform">{proposal?.reelsPerMonth || 0}</p>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Cinematic Reels</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center group hover:bg-white/[0.07] transition-colors">
                  <p className="text-4xl font-black text-white mb-1 group-hover:scale-110 transition-transform">{proposal?.microReelsPerMonth || 0}</p>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Micro Content</p>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Production Details */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Camera className="h-3 w-3" />
                  Production Details
                </h3>
                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl space-y-5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="text-xs font-medium text-slate-500">Shoot Frequency</span>
                    <span className="text-white font-bold text-sm uppercase tracking-wider">{proposal?.proPhotoShootFrequency || "Not Set"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Session Length</span>
                    <span className="text-white font-bold text-sm uppercase tracking-wider">{proposal?.proPhotoShootLength || "Not Set"}</span>
                  </div>
                </div>
              </section>

              {/* Included Services */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                  <CheckSquare className="h-3 w-3" />
                  Premium Features
                </h3>
                <div className="space-y-3">
                  <div className="bg-white/5 border border-white/5 px-6 py-4 rounded-2xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Captions & Hashtags</span>
                    <div className="h-6 w-6 rounded-full bg-lime-400/20 flex items-center justify-center">
                      <CheckCircle2 className="h-3.5 w-3.5 text-lime-400" />
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/5 px-6 py-4 rounded-2xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Content Scheduling</span>
                    <div className="h-6 w-6 rounded-full bg-lime-400/20 flex items-center justify-center">
                      <CheckCircle2 className="h-3.5 w-3.5 text-lime-400" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="mt-24 text-center space-y-4">
        <div className="flex items-center justify-center gap-4 text-slate-700">
          <div className="h-[1px] w-12 bg-slate-800" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Talexia Enterprise</p>
          <div className="h-[1px] w-12 bg-slate-800" />
        </div>
        <p className="text-[9px] text-slate-800 font-bold uppercase tracking-widest">
          © 2026 Talexia. All rights reserved. Secured by Talexia Cloud Security.
        </p>
      </div>
    </div>
  );
}

export default function EnterprisePlanDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-lime-400 animate-spin" />
      </div>
    }>
      <EnterprisePlanDetailsContent />
    </Suspense>
  );
}
