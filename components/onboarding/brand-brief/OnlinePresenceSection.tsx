"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface OnlinePresenceSectionProps {
  data: any;
  updateData: (fields: any) => void;
}

export function OnlinePresenceSection({ data, updateData }: OnlinePresenceSectionProps) {
  const urlPattern = /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d%_.~+=-]*)?$/i;

  const isInvalidUrl = (url: string) => {
    if (!url || !url.trim()) return false;
    return !urlPattern.test(url.trim()) || !url.trim().includes(".");
  };

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
              className={`bg-slate-900/50 border-slate-800 focus:border-lime-400/50 transition-all ${
                isInvalidUrl(data.websiteUrl) ? "border-red-500/50 focus:border-red-500" : ""
              }`}
            />
            {isInvalidUrl(data.websiteUrl) && (
              <p className="text-[10px] text-red-400 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-3 w-3" />
                Please enter a valid URL
              </p>
            )}
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
              className={`bg-slate-900/50 border-slate-800 focus:border-lime-400/50 transition-all ${
                isInvalidUrl(data.facebookPageUrl) ? "border-red-500/50 focus:border-red-500" : ""
              }`}
            />
            {isInvalidUrl(data.facebookPageUrl) && (
              <p className="text-[10px] text-red-400 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-3 w-3" />
                Please enter a valid URL
              </p>
            )}
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
              className={`bg-slate-900/50 border-slate-800 focus:border-lime-400/50 transition-all ${
                isInvalidUrl(data.onlineOrderingUrl) ? "border-red-500/50 focus:border-red-500" : ""
              }`}
            />
            {isInvalidUrl(data.onlineOrderingUrl) && (
              <p className="text-[10px] text-red-400 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-3 w-3" />
                Please enter a valid URL
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
