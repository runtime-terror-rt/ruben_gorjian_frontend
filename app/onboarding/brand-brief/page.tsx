"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSessionContext } from "@/context/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { OnboardingHeaderNav } from "@/components/onboarding/OnboardingHeaderNav";
import { Button } from "@/components/ui/button";
import { BrandIdentitySection } from "@/components/onboarding/brand-brief/BrandIdentitySection";
import { OnlinePresenceSection } from "@/components/onboarding/brand-brief/OnlinePresenceSection";
import { BrandVoiceSection } from "@/components/onboarding/brand-brief/BrandVoiceSection";
import { ProductsCollectionsSection } from "@/components/onboarding/brand-brief/ProductsCollectionsSection";
import { SpecialNotesSection } from "@/components/onboarding/brand-brief/SpecialNotesSection";
import { AuthorizationSection } from "@/components/onboarding/brand-brief/AuthorizationSection";
import { ShootPreparationSection } from "@/components/onboarding/brand-brief/ShootPreparationSection";
import { SocialMediaAccessSection } from "@/components/onboarding/brand-brief/SocialMediaAccessSection";
import { AlertCircle, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const sections = [
  { id: 1, title: "Brand Identity" },
  { id: 2, title: "Online Presence" },
  { id: 3, title: "Brand Voice" },
  { id: 4, title: "Menu & Content Priorities" },
  { id: 5, title: "Shoot Preparation" },
  { id: 6, title: "Social Media Access" },
  { id: 7, title: "Special Notes" },
  { id: 8, title: "Authorization" },
];

export default function BrandBriefPage() {
  const { session, loading, refresh } = useSessionContext();
  const router = useRouter();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    // Step 1: Brand Identity
    planCode: "",
    restaurantName: "",
    location: "",
    businessType: "",
    cuisineType: "",
    dietaryCertifications: [],

    // Step 2: Online Presence
    websiteUrl: "",
    instagramHandle: "",
    facebookPageUrl: "",
    tiktokHandle: "",
    onlineOrderingUrl: "",

    // Step 3: Brand Voice
    foodDescription: "",
    uniqueSellingPoint: "",
    customerReviews: "",
    forbiddenPhrases: "",
    preferredPhrases: "",
    captionSample1: "",
    captionSample2: "",
    captionSample3: "",
    toneAndVoice: [],
    captionTargeting: "",
    language: "English",

    // Step 4: Menu & Content
    signatureDishes: ["", "", "", "", ""],
    signatureDishDetails: "",
    excludedItems: "",
    upcomingPromotions: "",
    hashtagStyle: "",

    // Step 5: Shoot Preparation
    confirmMinDishes: "",
    actionShotsPossible: "",
    actionShotDetails: "",
    preferredShootTime: "",
    physicalConstraints: "",

    // Step 7: Special Notes
    specialNotes: "",

    // Step 8: Authorization
    clientName: "",
    restaurantNameAuth: "",
    submissionDate: new Date().toISOString().split("T")[0],
    talexiaPlan: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.push("/login?returnTo=/onboarding/brand-brief");
      return;
    }

    if (session.brandBriefCompleted) {
      // Logic to continue to plan-specific onboarding
      router.push("/onboarding");
      return;
    }

    const loadDraft = async () => {
      try {
        const res = await fetch("/api/brand-brief", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            setFormData(data.data);
            if (data.data.currentStep) setCurrentStep(data.data.currentStep);
          }
        }
      } catch (err) {
        console.warn("Failed to load brand brief draft", err);
      } finally {
        setFetching(false);
      }
    };

    loadDraft();
  }, [session, loading, router]);

  // Auto-save draft
  useEffect(() => {
    if (fetching || submitting || !session) return;
    const timer = setTimeout(async () => {
      try {
        await fetch("/api/brand-brief/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        });
      } catch (err) {
        console.warn("Failed to save draft", err);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, currentStep, fetching, submitting, session]);

  const updateData = (fields: any) => {
    setFormData((prev: any) => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    // Basic validation for mandatory fields per step
    if (currentStep === 1) {
      if (!formData.restaurantName || !formData.location || !formData.businessType || !formData.cuisineType) {
        setError("Please fill in all mandatory fields (marked with *).");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.instagramHandle) {
        setError("Instagram handle is required.");
        return;
      }
    } else if (currentStep === 3) {
      const hasAllCaptions = formData.captionSample1 && formData.captionSample2 && formData.captionSample3;
      if (!formData.foodDescription || !formData.uniqueSellingPoint || !formData.customerReviews || !hasAllCaptions || (formData.toneAndVoice?.length === 0) || !formData.captionTargeting) {
        setError("Please complete all mandatory Brand Voice fields, including 3 sample captions.");
        return;
      }
    } else if (currentStep === 4) {
      const hasDishes = formData.signatureDishes?.filter((d: string) => d.trim().length > 0).length >= 2;
      if (!hasDishes || !formData.signatureDishDetails || !formData.hashtagStyle) {
        setError("Please list your Signature Dishes and their details.");
        return;
      }
    } else if (currentStep === 5) {
      if (!formData.confirmMinDishes) {
        setError("Please confirm the shoot day requirements.");
        return;
      }
    }

    setError(null);
    if (currentStep < sections.length) {
      setCurrentStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!formData.clientName) {
      setError("Please enter your name for authorization.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/brand-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit brand brief.");
      }

      toast({
        title: "Success!",
        description: "Your brand brief has been saved.",
      });

      await refresh();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900">
        <OnboardingHeaderNav
          currentStep={currentStep}
          totalSteps={sections.length}
          sectionNames={sections}
        />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-lime-400 animate-spin" />
            <p className="text-slate-400 text-sm">Loading your brief...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900">
      <OnboardingHeaderNav
        currentStep={currentStep}
        totalSteps={sections.length}
        sectionNames={sections}
      />

      <div className="flex items-center justify-center px-4 pb-20 pt-10">
        <div className="w-full max-w-5xl rounded-3xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shadow-2xl overflow-hidden min-h-[700px]">
          <div className="grid md:grid-cols-4 h-full">
            {/* Sidebar Navigation */}
            <aside className="md:col-span-1 bg-slate-900/60 border-r border-slate-800 px-6 py-8">
              <div className="space-y-3 sticky top-8">
                <div className="mb-6">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Process</h3>
                </div>
                {sections.map((section) => {
                  const active = section.id === currentStep;
                  const done = section.id < currentStep;
                  return (
                    <div
                      key={section.id}
                      className={`flex items-start gap-4 rounded-2xl border p-4 transition-all duration-300 ${active
                          ? "border-lime-400/50 bg-lime-400/5 shadow-[0_0_15px_rgba(163,230,53,0.05)]"
                          : done
                            ? "border-slate-800 bg-slate-900/60 opacity-60"
                            : "border-slate-900/50 bg-slate-900/20 opacity-40"
                        }`}
                    >
                      <div className={`mt-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-colors ${active
                          ? "border-lime-400 bg-lime-400 text-slate-950"
                          : done
                            ? "border-lime-400/50 bg-lime-400/20 text-lime-400"
                            : "border-slate-700 bg-slate-800 text-slate-500"
                        }`}>
                        {done ? <Check className="h-3 w-3" /> : section.id}
                      </div>
                      <div>
                        <div className={`text-[10px] font-bold uppercase tracking-wider ${active ? "text-lime-400" : "text-slate-500"}`}>
                          Section {section.id}
                        </div>
                        <div className={`text-sm font-medium ${active ? "text-white" : "text-slate-400"}`}>
                          {section.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="md:col-span-3 p-8 md:p-12 flex flex-col">
              <div className="flex-1">
                {error && (
                  <div className="mb-6 flex items-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-red-400 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="max-w-2xl mx-auto">
                  {currentStep === 1 && <BrandIdentitySection data={formData} updateData={updateData} session={session} />}
                  {currentStep === 2 && <OnlinePresenceSection data={formData} updateData={updateData} />}
                  {currentStep === 3 && <BrandVoiceSection data={formData} updateData={updateData} />}
                  {currentStep === 4 && <ProductsCollectionsSection data={formData} updateData={updateData} />}
                  {currentStep === 5 && <ShootPreparationSection data={formData} updateData={updateData} />}
                  {currentStep === 6 && <SocialMediaAccessSection data={formData} updateData={updateData} />}
                  {currentStep === 7 && <SpecialNotesSection data={formData} updateData={updateData} />}
                  {currentStep === 8 && <AuthorizationSection data={formData} updateData={updateData} session={session} />}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-800/50">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1 || submitting}
                  className="rounded-full px-8 py-6 border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white transition-all disabled:opacity-0"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={submitting}
                  className="rounded-full px-10 py-6 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold transition-all shadow-[0_0_20px_rgba(163,230,53,0.2)] hover:scale-105 active:scale-95"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                      Saving Brief...
                    </>
                  ) : currentStep === sections.length ? (
                    "Complete Brief"
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
