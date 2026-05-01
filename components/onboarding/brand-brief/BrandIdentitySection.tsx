"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
interface BrandIdentitySectionProps {
  data: any;
  updateData: (fields: any) => void;
  session: any;
}

export function BrandIdentitySection({ data, updateData, session }: BrandIdentitySectionProps) {
  const businessTypes = [
    "Restaurant",
    "Bar & Lounge",
    "Fast Casual",
    "Ghost Kitchen",
    "Catering",
  ];

  const dietaryCerts = ["Kosher", "Halal", "Gluten-Free", "Vegan-Friendly", "None"];

  const handleDietaryChange = (cert: string, checked: boolean) => {
    const current = data.dietaryCertifications || [];
    if (checked) {
      updateData({ dietaryCertifications: [...current, cert] });
    } else {
      updateData({ dietaryCertifications: current.filter((c: string) => c !== cert) });
    }
  };

  useEffect(() => {
    if (!data.planCode && session?.subscription?.planCode) {
      updateData({ planCode: session.subscription.planCode });
    }
  }, [session, data.planCode]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">01 Brand Identity</h2>
          <p className="text-xs text-slate-500">Provide basic details about your restaurant.</p>
        </div>

        {/* planCode (Hidden field for backend sync) */}
        <input type="hidden" name="planCode" value={data.planCode || ""} />

        <div className="space-y-2">
          <Label htmlFor="restaurantName" className="text-sm font-semibold text-slate-300">
            Restaurant / Brand Name <span className="text-lime-400">*</span>
          </Label>
          <Input
            id="restaurantName"
            value={data.restaurantName || ""}
            onChange={(e) => updateData({ restaurantName: e.target.value })}
            placeholder="Enter your restaurant name"
            className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-semibold text-slate-300">
            Location (City, State) <span className="text-lime-400">*</span>
          </Label>
          <Input
            id="location"
            value={data.location || ""}
            onChange={(e) => updateData({ location: e.target.value })}
            placeholder="e.g. Great Neck, NY — we serve Long Island & Queens only"
            className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-300">
            Business Type <span className="text-lime-400">*</span>
          </Label>
          <RadioGroup
            value={data.businessType}
            onValueChange={(val) => updateData({ businessType: val })}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {businessTypes.map((type) => {
              const isSelected = data.businessType === type;
              return (
                <div
                  key={type}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                    isSelected 
                      ? "border-lime-400 bg-lime-400/10 shadow-[0_0_15px_rgba(163,230,53,0.1)]" 
                      : "border-slate-800 bg-slate-900/40 hover:bg-slate-900/60"
                  }`}
                >
                  <RadioGroupItem value={type} id={`type-${type}`} className={isSelected ? "border-lime-400" : ""} />
                  <Label 
                    htmlFor={`type-${type}`} 
                    className={`text-sm cursor-pointer flex-1 py-1 transition-colors ${isSelected ? "text-white font-bold" : "text-slate-200"}`}
                  >
                    {type}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
          <div className="mt-2">
            <Label htmlFor="businessTypeOther" className="text-xs text-slate-500">Other:</Label>
            <Input
              id="businessTypeOther"
              value={data.businessTypeOther || ""}
              onChange={(e) => updateData({ businessTypeOther: e.target.value })}
              placeholder="Specify other business type"
              className="mt-1 bg-slate-900/50 border-slate-800 h-9 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cuisineType" className="text-sm font-semibold text-slate-300">
            Cuisine Type <span className="text-lime-400">*</span>
          </Label>
          <Input
            id="cuisineType"
            value={data.cuisineType || ""}
            onChange={(e) => updateData({ cuisineType: e.target.value })}
            placeholder="e.g. Italian steakhouse, kosher pizza, Japanese fusion, BBQ"
            className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-300">
            Dietary Certifications
            <span className="block text-xs font-normal text-slate-500 mt-1">
              Check all that apply — these must appear in captions and hashtags
            </span>
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {dietaryCerts.map((cert) => (
              <label
                key={cert}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-colors cursor-pointer"
              >
                <Checkbox
                  checked={(data.dietaryCertifications || []).includes(cert)}
                  onCheckedChange={(checked) => handleDietaryChange(cert, !!checked)}
                />
                <span className="text-sm text-slate-200">{cert}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
