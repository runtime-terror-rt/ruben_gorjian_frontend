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
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">02 Online Presence</h2>
          <p className="text-xs text-slate-500">Link your existing digital platforms.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="websiteUrl" className="text-sm font-semibold text-slate-300">
              Website URL
            </Label>
            <Input
              id="websiteUrl"
              value={data.websiteUrl || ""}
              onChange={(e) => updateData({ websiteUrl: e.target.value })}
              placeholder="https://your-restaurant.com"
              className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagramHandle" className="text-sm font-semibold text-slate-300">
              Instagram Handle <span className="text-lime-400">*</span>
            </Label>
            <Input
              id="instagramHandle"
              value={data.instagramHandle || ""}
              onChange={(e) => updateData({ instagramHandle: e.target.value })}
              placeholder="e.g. @YourRestaurant"
              className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebookPageUrl" className="text-sm font-semibold text-slate-300">
              Facebook Page URL
            </Label>
            <Input
              id="facebookPageUrl"
              value={data.facebookPageUrl || ""}
              onChange={(e) => updateData({ facebookPageUrl: e.target.value })}
              placeholder="e.g. facebook.com/YourRestaurant"
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
              placeholder="e.g. @YourRestaurant"
              className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="onlineOrderingUrl" className="text-sm font-semibold text-slate-300">
              Online Ordering URL
              <span className="block text-xs font-normal text-slate-500 mt-1">
                e.g. Toast, DoorDash, UberEats direct link
              </span>
            </Label>
            <Input
              id="onlineOrderingUrl"
              value={data.onlineOrderingUrl || ""}
              onChange={(e) => updateData({ onlineOrderingUrl: e.target.value })}
              placeholder="https://order.toasttab.com/..."
              className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
