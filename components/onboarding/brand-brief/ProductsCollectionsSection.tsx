"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface ProductsCollectionsSectionProps {
  data: any;
  updateData: (fields: any) => void;
}

const hashtagStyles = [
  { value: "Niche", label: "Niche (tight, specific — e.g. #SapphireRing #BridalJewelry)" },
  { value: "Broad", label: "Broad (wide reach — e.g. #JewelryLovers #OOTD)" },
  { value: "Mixed", label: "Mixed (combination of both)" },
];

export function ProductsCollectionsSection({ data, updateData }: ProductsCollectionsSectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Products & Collections</h2>

        <div className="space-y-2">
          <Label htmlFor="keyProducts" className="text-sm font-semibold text-slate-300">
            Key Products / Collections
            <span className="block text-xs font-normal text-slate-500 mt-1">List your main product categories, hero items, or named collections.</span>
          </Label>
          <Textarea
            id="keyProducts"
            value={data.keyProducts || ""}
            onChange={(e) => updateData({ keyProducts: e.target.value })}
            placeholder="List your products here..."
            className="min-h-[120px] bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-300">
            Hashtag Style
            <span className="block text-xs font-normal text-slate-500 mt-1">Pick one:</span>
          </Label>
          <RadioGroup
            value={data.hashtagStyle}
            onValueChange={(val) => updateData({ hashtagStyle: val })}
            className="space-y-2"
          >
            {hashtagStyles.map((opt) => (
              <label
                key={opt.value}
                className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-colors cursor-pointer"
              >
                <RadioGroupItem value={opt.value} id={`hashtag-${opt.value}`} className="mt-1" />
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-slate-200">{opt.value}</span>
                  <span className="text-xs text-slate-500 block">{opt.label.split('(')[1]?.replace(')', '') || ''}</span>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-300">
            Language
            <span className="block text-xs font-normal text-slate-500 mt-1">Pick one:</span>
          </Label>
          <RadioGroup
            value={data.language}
            onValueChange={(val) => updateData({ language: val })}
            className="space-y-3"
          >
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-colors cursor-pointer">
              <RadioGroupItem value="English only" id="lang-english" />
              <span className="text-sm text-slate-200">English only</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-colors cursor-pointer">
                <RadioGroupItem value="Bilingual" id="lang-bilingual" />
                <span className="text-sm text-slate-200">Bilingual — specify language:</span>
              </label>
              {data.language === "Bilingual" && (
                <Input
                  value={data.bilingualLanguage || ""}
                  onChange={(e) => updateData({ bilingualLanguage: e.target.value })}
                  placeholder="e.g. English & Spanish"
                  className="ml-8 bg-slate-900/50 border-slate-800 h-9 w-[calc(100%-2rem)] text-sm"
                />
              )}
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
