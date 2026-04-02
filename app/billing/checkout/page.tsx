"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, CreditCard, Tag, Plus, Minus, Video, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { getPlanByLookupKey } from "@/lib/pricing-catalog";
import { PLAN_NAMES, MONTHLY_PRICES, type PlanKey } from "@/lib/pricing-comparison";
import { apiPost } from "@/lib/api";
import { cn } from "@/lib/utils";

// Mock pricing data for addons if not in catalog
const ADDON_PRICES = {
  platform: 5, // $5 per extra platform
  videoHour: 50, // $50 per extra video hour
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL params
  const rawPlan = searchParams.get("plan");
  const planCode = (rawPlan && (PLAN_NAMES as any)[rawPlan] ? rawPlan : "FMP-35") as PlanKey;
  const billingCycle = (searchParams.get("cycle") as "monthly" | "yearly") || "yearly";

  // State
  const [couponCode, setCouponCode] = useState("");
  const [addonPlatformQty, setAddonPlatformQty] = useState(0);
  const [videoSessionHours, setVideoSessionHours] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  // Derived data
  const catalogPlan = getPlanByLookupKey(planCode);
  const basePrice = catalogPlan?.priceStandard || MONTHLY_PRICES[planCode] || 0;
  const cycleMultiplier = billingCycle === "yearly" ? 12 : 1;
  const discountMultiplier = billingCycle === "yearly" ? 0.8 : 1; // 20% off for yearly
  
  const subtotal = basePrice * cycleMultiplier * discountMultiplier;
  const addonTotal = (addonPlatformQty * ADDON_PRICES.platform + videoSessionHours * ADDON_PRICES.videoHour) * cycleMultiplier;
  const total = subtotal + addonTotal;

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
        addonPlatformQty,
        videoSessionHours,
        couponCode: isCouponApplied ? couponCode : undefined,
        successUrl: `${origin}/billing/success`,
        cancelUrl: `${origin}/billing/checkout?plan=${planCode}&cycle=${billingCycle}`,
      });

      if (res.checkoutUrl) {
        window.location.assign(res.checkoutUrl);
      } else {
        setError(res.error || "Failed to initiate checkout. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-5xl py-10">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-6 gap-2 text-slate-400 hover:text-white"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-white">Complete your subscription</CardTitle>
              <CardDescription className="text-slate-400">
                Customize your plan and review your order details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Plan Summary */}
              <div className="flex items-center justify-between rounded-xl border border-lime-400/20 bg-lime-400/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-lime-400 p-2 text-slate-950">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{PLAN_NAMES[planCode]}</h3>
                    <p className="text-xs text-slate-400 capitalize">{billingCycle} billing</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">${basePrice}<span className="text-xs font-normal text-slate-500">/mo</span></p>
                </div>
              </div>

              {/* Addons Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Optional Add-ons</h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Extra Platforms */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-white font-medium">Extra Platforms</Label>
                      <span className="text-xs text-lime-400">+${ADDON_PRICES.platform}/mo</span>
                    </div>
                    <p className="text-xs text-slate-500">Add more social accounts beyond your plan limit.</p>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full border-slate-700 bg-transparent hover:bg-slate-800"
                        onClick={() => setAddonPlatformQty(Math.max(0, addonPlatformQty - 1))}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-bold text-white">{addonPlatformQty}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full border-slate-700 bg-transparent hover:bg-slate-800"
                        onClick={() => setAddonPlatformQty(addonPlatformQty + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Video Hours */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-slate-400" />
                        <Label className="text-white font-medium">Extra Video Hours</Label>
                      </div>
                      <span className="text-xs text-lime-400">+${ADDON_PRICES.videoHour}/hr</span>
                    </div>
                    <p className="text-xs text-slate-500">Additional professional video session hours per month.</p>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full border-slate-700 bg-transparent hover:bg-slate-800"
                        onClick={() => setVideoSessionHours(Math.max(0, videoSessionHours - 1))}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-bold text-white">{videoSessionHours}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full border-slate-700 bg-transparent hover:bg-slate-800"
                        onClick={() => setVideoSessionHours(videoSessionHours + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold uppercase tracking-wider text-slate-500">Discount Coupon</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input 
                      placeholder="Enter code (e.g. SUMMER25)" 
                      className="border-slate-800 bg-slate-950 pl-10 text-white focus:ring-lime-400"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={isCouponApplied}
                    />
                  </div>
                  <Button 
                    variant={isCouponApplied ? "outline" : "secondary"}
                    className={cn(isCouponApplied ? "border-lime-500/50 text-lime-400" : "")}
                    onClick={() => {
                      if (isCouponApplied) {
                        setIsCouponApplied(false);
                        setCouponCode("");
                      } else if (couponCode) {
                        setIsCouponApplied(true);
                      }
                    }}
                  >
                    {isCouponApplied ? "Remove" : "Apply"}
                  </Button>
                </div>
                {isCouponApplied && (
                  <p className="text-xs text-lime-400">Coupon applied successfully!</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Terms */}
          <div className="flex items-start space-x-3 p-2">
            <Checkbox 
              id="terms" 
              className="mt-1 border-slate-700 data-[state=checked]:bg-lime-500" 
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(!!checked)}
            />
            <Label htmlFor="terms" className="text-xs leading-relaxed text-slate-400">
              I agree to the <a href="/terms" className="text-lime-400 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-lime-400 hover:underline">Privacy Policy</a>. I understand that my subscription will automatically renew at the end of each billing period.
            </Label>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg text-white">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Base Plan ({billingCycle})</span>
                  <span className="text-white font-medium">${subtotal.toLocaleString()}</span>
                </div>
                {addonPlatformQty > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Extra Platforms ({addonPlatformQty})</span>
                    <span className="text-white font-medium">+${(addonPlatformQty * ADDON_PRICES.platform * cycleMultiplier).toLocaleString()}</span>
                  </div>
                )}
                {videoSessionHours > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Extra Video Hours ({videoSessionHours})</span>
                    <span className="text-white font-medium">+${(videoSessionHours * ADDON_PRICES.videoHour * cycleMultiplier).toLocaleString()}</span>
                  </div>
                )}
                {isCouponApplied && (
                  <div className="flex justify-between text-lime-400 font-medium italic">
                    <span>Coupon Discount</span>
                    <span>- $0.00</span>
                  </div>
                )}
              </div>

              <Separator className="bg-slate-800" />

              <div className="flex justify-between items-baseline">
                <span className="text-white font-semibold">Total</span>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">${total.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Plus applicable taxes</p>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                  {error}
                </div>
              )}
            </CardContent>
            {/* <CardFooter>
              <Button 
                className="w-full rounded-full bg-lime-500 py-6 text-base font-bold text-slate-950 hover:bg-lime-400 shadow-[0_0_20px_rgba(132,204,22,0.3)] transition-all hover:scale-[1.02]"
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
              </Button>
            </CardFooter> */}
            <div className="pb-6 text-center">
              <div className="flex items-center justify-center gap-2 grayscale opacity-50">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
              </div>
              <p className="mt-2 text-[10px] text-slate-500 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Encrypted & Secure
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
