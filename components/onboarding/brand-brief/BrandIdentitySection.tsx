"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface BrandIdentitySectionProps {
  data: any;
  updateData: (fields: any) => void;
}

const industries = [
  "Jewelry",
  "Restaurant & Food",
  "Fashion & Apparel",
  "Beauty & Wellness",
  "Home & Lifestyle",
];

const platforms = ["Instagram", "Facebook", "TikTok", "LinkedIn"];

export function BrandIdentitySection({ data, updateData }: BrandIdentitySectionProps) {
  const handleIndustryChange = (industry: string, checked: boolean) => {
    const currentIndustries = data.industries || [];
    if (checked) {
      updateData({ industries: [...currentIndustries, industry] });
    } else {
      updateData({ industries: currentIndustries.filter((i: string) => i !== industry) });
    }
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    const currentPlatforms = data.platforms || [];
    if (checked) {
      updateData({ platforms: [...currentPlatforms, platform] });
    } else {
      updateData({ platforms: currentPlatforms.filter((p: string) => p !== platform) });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Brand Identity</h2>
        
        <div className="space-y-2">
          <Label htmlFor="brandName" className="text-sm font-semibold text-slate-300">
            Brand Name
          </Label>
          <Input
            id="brandName"
            value={data.brandName || ""}
            onChange={(e) => updateData({ brandName: e.target.value })}
            placeholder="Enter your brand name"
            className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50 transition-colors"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-300">
            Industry
            <span className="block text-xs font-normal text-slate-500 mt-1">
              Select your industry or type it in the Other field. Select all that apply:
            </span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {industries.map((industry) => (
              <label
                key={industry}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-colors cursor-pointer"
              >
                <Checkbox
                  checked={(data.industries || []).includes(industry)}
                  onCheckedChange={(checked) => handleIndustryChange(industry, !!checked)}
                />
                <span className="text-sm text-slate-200">{industry}</span>
              </label>
            ))}
          </div>
          <div className="mt-2">
            <Label htmlFor="industryOther" className="text-xs text-slate-400">Other:</Label>
            <Input
              id="industryOther"
              value={data.industryOther || ""}
              onChange={(e) => updateData({ industryOther: e.target.value })}
              placeholder="Specify other industry"
              className="mt-1 bg-slate-900/50 border-slate-800 h-9 text-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-300">
            Business Type
            <span className="block text-xs font-normal text-slate-500 mt-1">Pick one:</span>
          </Label>
          <RadioGroup
            value={data.businessType}
            onValueChange={(val) => updateData({ businessType: val })}
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            {["Major Brand", "Retail", "Wholesale"].map((type) => (
              <label
                key={type}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-colors cursor-pointer"
              >
                <RadioGroupItem value={type} id={`type-${type}`} />
                <span className="text-sm text-slate-200">{type}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-semibold text-slate-300">
            Location (City, State / Country)
          </Label>
          <Input
            id="location"
            value={data.location || ""}
            onChange={(e) => updateData({ location: e.target.value })}
            placeholder="e.g. New York, NY, USA"
            className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-300">
            Platforms
            <span className="block text-xs font-normal text-slate-500 mt-1">
              Select the platforms included in your plan. Select all that apply:
            </span>
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {platforms.map((platform) => (
              <label
                key={platform}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-colors cursor-pointer"
              >
                <Checkbox
                  checked={(data.platforms || []).includes(platform)}
                  onCheckedChange={(checked) => handlePlatformChange(platform, !!checked)}
                />
                <span className="text-sm text-slate-200">{platform}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
