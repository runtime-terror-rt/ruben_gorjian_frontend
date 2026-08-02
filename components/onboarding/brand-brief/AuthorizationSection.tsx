"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

interface AuthorizationSectionProps {
  data: any;
  updateData: (fields: any) => void;
  session: any;
}

const AUTHORIZATION_BULLETS = [
  "All brand information provided above is accurate, current, and complete to the best of my knowledge.",
  "I authorize Talexia to generate visual content, captions, hashtags, and a posting schedule on behalf of my brand using the information provided.",
  "I authorize Talexia to publish content directly to my connected social media platforms on my behalf without requiring my prior review or approval of individual posts.",
  "I understand that Talexia's content is generated from this Brief, and that inaccurate or incomplete information may affect content quality.",
  "I understand that stylistic preferences are not grounds for revision or regeneration.",
  "I understand that verifiable factual errors in published content must be reported within 48 hours of posting and will be corrected.",
  "I understand that significant brand changes must be submitted as an updated Brand Brief to take effect the following month.",
];

export function AuthorizationSection({ data, updateData, session }: AuthorizationSectionProps) {
  const submissionDate = new Date().toLocaleDateString();
  const planName = session?.subscription?.planCategory?.split('_').map((word: string) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ') || "Your Plan";

  // Sync plan and restaurant name to auth fields if not set
  useEffect(() => {
    if (!data.talexiaPlan && planName !== "Your Plan") {
      updateData({ talexiaPlan: planName });
    }
    if (!data.restaurantNameAuth && data.restaurantName) {
      updateData({ restaurantNameAuth: data.restaurantName });
    }
  }, [planName, data.restaurantName]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div className="space-y-2 text-center pb-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">08 Brand Publishing Authorization</h2>
          <p className="text-sm text-slate-400">Read carefully before submitting.</p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <p className="text-sm text-slate-300 font-medium">By submitting this Brand Brief, I confirm the following:</p>
          <ul className="space-y-3">
            {AUTHORIZATION_BULLETS.map((bullet, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-400 leading-relaxed">
                <CheckCircle2 className="h-4 w-4 text-lime-700 mt-1 flex-shrink-0" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-300 pt-2 border-t border-slate-800/50">
            By submitting this form I am entering into a standing publishing authorization with Talexia that remains active for the duration of my subscription.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="clientName" className="text-sm font-semibold text-slate-300">
              Client Name <span className="text-lime-700">*</span>
            </Label>
            <Input
              id="clientName"
              value={data.clientName || ""}
              onChange={(e) => updateData({ clientName: e.target.value })}
              placeholder="Enter your full name"
              className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="restaurantNameAuth" className="text-sm font-semibold text-slate-300">
              Restaurant Name
            </Label>
            <Input
              id="restaurantNameAuth"
              value={data.restaurantNameAuth || data.restaurantName || ""}
              onChange={(e) => updateData({ restaurantNameAuth: e.target.value })}
              placeholder="Restaurant name"
              className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-300">
              Submission Date
            </Label>
            <div className="px-3 py-2 rounded-xl bg-slate-800/30 border border-slate-800 text-slate-400 text-sm h-11 flex items-center">
              {submissionDate}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="talexiaPlan" className="text-sm font-semibold text-slate-300">
              Talexia Plan
            </Label>
            <Input
              id="talexiaPlan"
              value={data.talexiaPlan || ""}
              onChange={(e) => updateData({ talexiaPlan: e.target.value })}
              placeholder="e.g. Pro, Enterprise..."
              className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50 h-11"
            />
          </div>
        </div>

        <div className="pt-8 text-center border-t border-slate-800">
          <p className="text-[10px] text-slate-600 font-medium tracking-widest uppercase">
            TALEXIA • Restaurant Brand Brief • Confidential
          </p>
        </div>
      </div>
    </div>
  );
}
