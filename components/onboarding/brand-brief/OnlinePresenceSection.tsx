"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OnlinePresenceSectionProps {
  data: any;
  updateData: (fields: any) => void;
}

export function OnlinePresenceSection({ data, updateData }: OnlinePresenceSectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Online Presence</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="websiteUrl" className="text-sm font-semibold text-slate-300">
              Brand Website URL
            </Label>
            <Input
              id="websiteUrl"
              value={data.websiteUrl || ""}
              onChange={(e) => updateData({ websiteUrl: e.target.value })}
              placeholder="https://your-brand.com"
              className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagramHandle" className="text-sm font-semibold text-slate-300">
              Instagram Handle
            </Label>
            <Input
              id="instagramHandle"
              value={data.instagramHandle || ""}
              onChange={(e) => updateData({ instagramHandle: e.target.value })}
              placeholder="e.g. @Talexia_NY"
              className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebookUrl" className="text-sm font-semibold text-slate-300">
              Facebook Page Name or URL
            </Label>
            <Input
              id="facebookUrl"
              value={data.facebookUrl || ""}
              onChange={(e) => updateData({ facebookUrl: e.target.value })}
              placeholder="e.g. facebook.com/Talexia_NY"
              className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiktokHandle" className="text-sm font-semibold text-slate-300">
              TikTok Handle
            </Label>
            <Input
              id="tiktokHandle"
              value={data.tiktokHandle || ""}
              onChange={(e) => updateData({ tiktokHandle: e.target.value })}
              placeholder="e.g. @Talexia_NY — leave blank if not applicable"
              className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinUrl" className="text-sm font-semibold text-slate-300">
              LinkedIn Page URL
            </Label>
            <Input
              id="linkedinUrl"
              value={data.linkedinUrl || ""}
              onChange={(e) => updateData({ linkedinUrl: e.target.value })}
              placeholder="e.g. linkedin.com/company/Talexia_NY — leave blank if not applicable"
              className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
