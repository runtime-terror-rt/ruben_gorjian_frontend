"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

interface BrandIdentitySectionProps {
  data: any;
  updateData: (fields: any) => void;
  session: any;
}

export function BrandIdentitySection({ data, updateData, session }: BrandIdentitySectionProps) {
  const businessTypes = [
    { value: "Full-service restaurant", label: "Full-service restaurant" },
    { value: "Bar & lounge", label: "Bar & lounge" },
    { value: "Fast casual / takeout", label: "Fast casual / takeout" },
    { value: "Ghost kitchen / delivery only", label: "Ghost kitchen / delivery only" },
    { value: "Catering", label: "Catering" },
  ];

  const dietaryCerts = ["Kosher", "Halal", "Gluten-Free", "Vegan-Friendly", "None"];

  const handleBusinessTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      updateData({ businessType: type });
    } else {
      updateData({ businessType: "" });
    }
  };

  const handleDietaryChange = (cert: string, checked: boolean) => {
    const current = data.dietaryCertifications || [];

    /* Original simple logic - commented out as per request
    if (checked) {
      updateData({ dietaryCertifications: [...current, cert] });
    } else {
      updateData({ dietaryCertifications: current.filter((c: string) => c !== cert) });
    }
    */

    // New professional logic with "None" exclusivity
    if (checked) {
      if (cert === "None") {
        // If "None" is selected, clear everything else
        updateData({ dietaryCertifications: ["None"] });
      } else {
        // If something else is selected, make sure "None" is removed
        const filtered = current.filter((c: string) => c !== "None");
        updateData({ dietaryCertifications: [...filtered, cert] });
      }
    } else {
      updateData({ dietaryCertifications: current.filter((c: string) => c !== cert) });
    }
  };

  const setOtherBusinessType = () => {
    if (data.businessTypeOther && data.businessTypeOther.trim()) {
      updateData({
        businessType: data.businessTypeOther.trim(),
      });
    }
  };

  useEffect(() => {
    if (!data.planCode && session?.subscription?.planCode) {
      if (!session.subscription.planCode.startsWith("price_")) {
        updateData({ planCode: session.subscription.planCode });
      }
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

        {/* Business Type */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-300">
            Business Type <span className="text-lime-400">*</span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {businessTypes.map(({ value, label }) => {
              const isSelected = data.businessType === value;
              return (
                <div
                  key={value}
                  onClick={() => handleBusinessTypeChange(value, !isSelected)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                    isSelected
                      ? "border-lime-400 bg-lime-400/10 shadow-[0_0_15px_rgba(163,230,53,0.1)]"
                      : "border-slate-800 bg-slate-900/40 hover:bg-slate-900/60"
                  }`}
                >
                  <Checkbox
                    id={`type-${value}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => handleBusinessTypeChange(value, !!checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Label
                    htmlFor={`type-${value}`}
                    onClick={(e) => e.stopPropagation()}
                    className={`text-sm cursor-pointer flex-1 py-1 transition-colors ${
                      isSelected ? "text-white font-bold" : "text-slate-200"
                    }`}
                  >
                    {label}
                  </Label>
                </div>
              );
            })}

            {/* Other — toggle card */}
            <div
              onClick={() => updateData({ businessTypeOtherActive: !data.businessTypeOtherActive })}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                data.businessTypeOtherActive
                  ? "border-lime-400 bg-lime-400/10 shadow-[0_0_15px_rgba(163,230,53,0.1)]"
                  : "border-slate-800 bg-slate-900/40 hover:bg-slate-900/60"
              }`}
            >
              <Checkbox
                checked={!!data.businessTypeOtherActive}
                onCheckedChange={(checked) => updateData({ businessTypeOtherActive: !!checked })}
                onClick={(e) => e.stopPropagation()}
              />
              <span
                className={`text-sm flex-1 py-1 transition-colors ${
                  data.businessTypeOtherActive ? "text-white font-bold" : "text-slate-400"
                }`}
              >
                Other
              </span>
            </div>
          </div>

          {/* Other input — only shown when "Other" is toggled */}
          {data.businessTypeOtherActive && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <Input
                id="businessTypeOther"
                value={data.businessTypeOther || ""}
                onChange={(e) => {
                  updateData({ businessTypeOther: e.target.value, businessType: e.target.value });
                }}
                placeholder="Describe your business type..."
                className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50 h-11 text-sm"
              />
            </div>
          )}
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
            {dietaryCerts.map((cert) => {
              const isSelected = (data.dietaryCertifications || []).includes(cert);
              return (
                <div
                  key={cert}
                  onClick={() => handleDietaryChange(cert, !isSelected)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                    isSelected
                      ? "border-lime-400 bg-lime-400/10 shadow-[0_0_15px_rgba(163,230,53,0.1)]"
                      : "border-slate-800 bg-slate-900/40 hover:bg-slate-900/60"
                  }`}
                >
                  <Checkbox
                    id={`dietary-${cert}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => handleDietaryChange(cert, !!checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Label
                    htmlFor={`dietary-${cert}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-slate-200 cursor-pointer flex-1 py-1"
                  >
                    {cert}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
