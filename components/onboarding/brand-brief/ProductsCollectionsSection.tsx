"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface ProductsCollectionsSectionProps {
  data: any;
  updateData: (fields: any) => void;
}

export function ProductsCollectionsSection({ data, updateData }: ProductsCollectionsSectionProps) {
  const hashtagStyles = [
    { value: "Niche", label: "tight and specific (e.g. #KosherPizza #GreatNeckEats)" },
    { value: "Broad", label: "wide reach (e.g. #FoodLovers #NYCFood)" },
    { value: "Mixed", label: "combination of both (recommended)" },
  ];

  const handleHashtagChange = (val: string, checked: boolean) => {
    if (checked) {
      updateData({ hashtagStyle: val });
    } else {
      updateData({ hashtagStyle: "" });
    }
  };

  const updateSignatureDish = (index: number, val: string) => {
    const current = [...(data.signatureDishes || ["", "", "", "", ""])];
    current[index] = val;
    updateData({ signatureDishes: current });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">04 Menu & Content Priorities</h2>
          <p className="text-xs text-slate-500">Identify the heroes of your menu.</p>
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-semibold text-slate-300">
            Your Top 5 Signature Dishes <span className="text-lime-400">*</span>
            <span className="block text-xs font-normal text-slate-500 mt-1">List your most iconic, most ordered, or most visually impressive items. These get priority in every shoot.</span>
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {[0, 1, 2, 3, 4].map((idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600 w-4">{idx + 1}.</span>
                <Input
                  value={(data.signatureDishes || [])[idx] || ""}
                  onChange={(e) => updateSignatureDish(idx, e.target.value)}
                  placeholder={`Dish #${idx + 1}`}
                  className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50 h-11"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <Label htmlFor="signatureDishDetails" className="text-sm font-semibold text-slate-300">
            What makes your signature dishes special? <span className="text-lime-400">*</span>
            <span className="block text-xs font-normal text-slate-500 mt-1">For each hero item above — describe the ingredients, technique, or story that makes it memorable. This goes directly into captions.</span>
          </Label>
          <Textarea
            id="signatureDishDetails"
            value={data.signatureDishDetails || ""}
            onChange={(e) => updateData({ signatureDishDetails: e.target.value })}
            placeholder="Details about your dishes..."
            className="min-h-[120px] bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excludedItems" className="text-sm font-semibold text-slate-300">
            Items or categories you do NOT want featured
            <span className="block text-xs font-normal text-slate-500 mt-1">Discontinued items, low-margin dishes, or anything you're phasing out.</span>
          </Label>
          <Textarea
            id="excludedItems"
            value={data.excludedItems || ""}
            onChange={(e) => updateData({ excludedItems: e.target.value })}
            placeholder="What should we avoid?"
            className="min-h-[80px] bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="upcomingPromotions" className="text-sm font-semibold text-slate-300">
            Upcoming specials, seasonal items, or promotions we should know about
          </Label>
          <Textarea
            id="upcomingPromotions"
            value={data.upcomingPromotions || ""}
            onChange={(e) => updateData({ upcomingPromotions: e.target.value })}
            placeholder="Any upcoming events or specials?"
            className="min-h-[80px] bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
          />
        </div>

        <div className="space-y-3 pt-4">
          <Label className="text-sm font-semibold text-slate-300">
            Hashtag Style <span className="text-lime-400">*</span>
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {hashtagStyles.map((opt) => {
              const isSelected = data.hashtagStyle === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => handleHashtagChange(opt.value, !isSelected)}
                  className={`flex flex-col gap-2 p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none ${isSelected
                    ? "border-lime-400 bg-lime-400/10 shadow-[0_0_15px_rgba(163,230,53,0.1)]"
                    : "border-slate-800 bg-slate-900/40 hover:bg-slate-900/60"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      id={`hashtag-${opt.value}`}
                      onCheckedChange={(checked) => handleHashtagChange(opt.value, !!checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Label
                      htmlFor={`hashtag-${opt.value}`}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-sm font-semibold cursor-pointer transition-colors ${isSelected ? "text-white" : "text-slate-200"}`}
                    >
                      {opt.value}
                    </Label>
                  </div>
                  <span className={`text-[10px] leading-relaxed ml-7 transition-colors ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
