"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface ShootPreparationSectionProps {
  data: any;
  updateData: (fields: any) => void;
}

export function ShootPreparationSection({ data, updateData }: ShootPreparationSectionProps) {
  const actionShots = [
    "Hand model interaction (holding food/drink)",
    "Pouring / Drizzling shots",
    "Chef / Staff interaction",
    "Atmosphere / Crowd shots",
  ];

  const handleActionShotChange = (shot: string, checked: boolean) => {
    const current = data.actionShotsPossible || [];
    if (checked) {
      updateData({ actionShotsPossible: [...current, shot] });
    } else {
      updateData({ actionShotsPossible: current.filter((s: string) => s !== shot) });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">05 Shoot Preparation</h2>
          <p className="text-xs text-slate-500">Ensure your team is ready for the content shoot.</p>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-300">
            Minimum 5-7 hero dishes must be ready and styled at the start of your shoot. <span className="text-lime-700">*</span>
            <span className="block text-xs font-normal text-slate-500 mt-1">Confirmed?</span>
          </Label>
          <div className="flex flex-wrap gap-4">
            {[
              { id: "confirm-yes", value: "Minimum 6 dishes ready", label: "Yes, I understand" },
              { id: "confirm-no", value: "No, I have questions", label: "No, I have questions" }
            ].map((opt) => {
              const isSelected = data.confirmMinDishes === opt.value;
              return (
                <div
                  key={opt.id}
                  onClick={() => updateData({ confirmMinDishes: opt.value })}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${isSelected
                    ? "border-lime-400 bg-lime-400/10 shadow-[0_0_15px_rgba(163,230,53,0.1)]"
                    : "border-slate-800 bg-slate-900/40 hover:bg-slate-900/60"
                    }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => checked && updateData({ confirmMinDishes: opt.value })}
                  />
                  <Label
                    htmlFor={opt.id}
                    className={`text-sm cursor-pointer transition-colors ${isSelected ? "text-white font-bold" : "text-slate-200"}`}
                  >
                    {opt.label}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <Label className="text-sm font-semibold text-slate-300">
            Will action shots be possible? <span className="text-lime-700">*</span>
            <span className="block text-xs font-normal text-slate-500 mt-1">e.g. pouring, drizzling, chef interaction.</span>
          </Label>
          <div className="flex flex-wrap gap-4">
            {[
              { id: "action-yes", value: "Yes", label: "Yes" },
              { id: "action-no", value: "No", label: "No" }
            ].map((opt) => {
              const isSelected = data.actionShotsPossible === opt.value;
              return (
                <div
                  key={opt.id}
                  onClick={() => updateData({ actionShotsPossible: opt.value })}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${isSelected
                    ? "border-lime-400 bg-lime-400/10 shadow-[0_0_15px_rgba(163,230,53,0.1)]"
                    : "border-slate-800 bg-slate-900/40 hover:bg-slate-900/60"
                    }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => checked && updateData({ actionShotsPossible: opt.value })}
                  />
                  <Label
                    htmlFor={opt.id}
                    className={`text-sm cursor-pointer transition-colors ${isSelected ? "text-white font-bold" : "text-slate-200"}`}
                  >
                    {opt.label}
                  </Label>
                </div>
              );
            })}
          </div>
          {data.actionShotsPossible === "Yes" && (
            <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-300">
              <Label htmlFor="actionShotDetails" className="text-xs text-slate-500 font-medium uppercase tracking-wider">Specify Action Shots:</Label>
              <Input
                id="actionShotDetails"
                value={data.actionShotDetails || ""}
                onChange={(e) => updateData({ actionShotDetails: e.target.value })}
                placeholder="e.g. Pouring sauce, chef plating, drink splashing..."
                className="bg-slate-900/50 border-slate-800 h-11"
              />
            </div>
          )}
        </div>

        <div className="space-y-2 pt-4">
          <Label htmlFor="preferredShootTime" className="text-sm font-semibold text-slate-300">
            Preferred shoot time
            <span className="block text-xs font-normal text-slate-500 mt-1">e.g. 'Mondays at 10 AM', 'Tuesdays before service'</span>
          </Label>
          <Input
            id="preferredShootTime"
            value={data.preferredShootTime || ""}
            onChange={(e) => updateData({ preferredShootTime: e.target.value })}
            placeholder="When is best for you?"
            className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50 h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="physicalConstraints" className="text-sm font-semibold text-slate-300">
            Any physical constraints we should know about?
            <span className="block text-xs font-normal text-slate-500 mt-1">e.g. limited space, low lighting, basement kitchen, etc.</span>
          </Label>
          <Textarea
            id="physicalConstraints"
            value={data.physicalConstraints || ""}
            onChange={(e) => updateData({ physicalConstraints: e.target.value })}
            placeholder="Tell us about the space..."
            className="min-h-[100px] bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
          />
        </div>
      </div>
    </div>
  );
}
