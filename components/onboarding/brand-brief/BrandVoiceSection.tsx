"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface BrandVoiceSectionProps {
  data: any;
  updateData: (fields: any) => void;
}

export function BrandVoiceSection({ data, updateData }: BrandVoiceSectionProps) {
  const tones = [
    "Bold & direct — we say what we mean, no fluff",
    "Warm & community-driven — neighborhood feels, loyal regulars",
    "Elegant & aspirational — upscale, refined, wine-and-dine energy",
    "Playful & funny — personality-first, makes people smile",
    "Minimal & clean — let the food speak, no excess words",
  ];

  const targetingOptions = [
    { value: "Local food lovers", label: "Target residents and foodies in your immediate area" },
    { value: "Tourists & Visitors", label: "Speak to people visiting your city/landmark" },
    { value: "Corporate/Events", label: "Target event planners and business lunch crowds" },
    { value: "Food Influencers", label: "Focus on aesthetic, high-engagement content" },
    { value: "Family/Groups", label: "Highlight sharing, kids' menus, and large tables" },
    { value: "Late Night/Social", label: "Focus on drinks, music, and after-hours energy" },
  ];

  const handleToneChange = (tone: string, checked: boolean) => {
    const current = data.toneAndVoice || [];
    if (checked) {
      updateData({ toneAndVoice: [...current, tone] });
    } else {
      updateData({ toneAndVoice: current.filter((t: string) => t !== tone) });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">03 Brand Voice</h2>
          <p className="text-xs text-slate-500">This section directly determines how your captions sound.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="foodDescription" className="text-sm font-semibold text-slate-300">
            How would you describe your food in your own words? <span className="text-lime-400">*</span>
            <span className="block text-xs font-normal text-slate-500 mt-1">Write like you're telling a friend about your restaurant. Not marketing language — YOUR words.</span>
          </Label>
          <Textarea
            id="foodDescription"
            value={data.foodDescription || ""}
            onChange={(e) => updateData({ foodDescription: e.target.value })}
            placeholder="Tell us about your food..."
            className="min-h-[100px] bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="uniqueSellingPoint" className="text-sm font-semibold text-slate-300">
            What makes your restaurant different from every other place on the block? <span className="text-lime-400">*</span>
            <span className="block text-xs font-normal text-slate-500 mt-1">Could be a secret recipe, family history, technique, atmosphere, or loyal community. Be specific.</span>
          </Label>
          <Textarea
            id="uniqueSellingPoint"
            value={data.uniqueSellingPoint || ""}
            onChange={(e) => updateData({ uniqueSellingPoint: e.target.value })}
            placeholder="What sets you apart?"
            className="min-h-[100px] bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerReviews" className="text-sm font-semibold text-slate-300">
            What do your regulars say about you? <span className="text-lime-400">*</span>
            <span className="block text-xs font-normal text-slate-500 mt-1">Paste real Google/Yelp review quotes, or write what you hear customers say most often.</span>
          </Label>
          <Textarea
            id="customerReviews"
            value={data.customerReviews || ""}
            onChange={(e) => updateData({ customerReviews: e.target.value })}
            placeholder="Reviews or customer quotes..."
            className="min-h-[100px] bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="forbiddenPhrases" className="text-sm font-semibold text-slate-300">
              Words or phrases you NEVER want us to use
              <span className="block text-xs font-normal text-slate-500 mt-1">e.g. 'premium ingredients', 'culinary journey' — list any language that feels fake or generic to you.</span>
            </Label>
            <Textarea
              id="forbiddenPhrases"
              value={data.forbiddenPhrases || ""}
              onChange={(e) => updateData({ forbiddenPhrases: e.target.value })}
              placeholder="Words to avoid..."
              className="min-h-[80px] bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredPhrases" className="text-sm font-semibold text-slate-300">
              Words or phrases you LOVE and want us to use often
              <span className="block text-xs font-normal text-slate-500 mt-1">Any slogan, tagline, inside joke, or language your regulars would recognize immediately.</span>
            </Label>
            <Textarea
              id="preferredPhrases"
              value={data.preferredPhrases || ""}
              onChange={(e) => updateData({ preferredPhrases: e.target.value })}
              placeholder="Words we love..."
              className="min-h-[80px] bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-semibold text-slate-300">
            3 Sample Captions — MANDATORY <span className="text-lime-400">*</span>
            <span className="block text-xs font-normal text-slate-500 mt-1">Paste 3 captions from your existing Instagram or any account whose tone you want to match. If you have none, write 3 sentences about your restaurant the way you'd say them out loud. NO EXCEPTIONS.</span>
          </Label>
          <div className="space-y-3">
            <Textarea
              value={data.captionSample1 || ""}
              onChange={(e) => updateData({ captionSample1: e.target.value })}
              placeholder="Enter caption sample 1..."
              className="min-h-[80px] bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
            />
            <Textarea
              value={data.captionSample2 || ""}
              onChange={(e) => updateData({ captionSample2: e.target.value })}
              placeholder="Enter caption sample 2..."
              className="min-h-[80px] bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
            />
            <Textarea
              value={data.captionSample3 || ""}
              onChange={(e) => updateData({ captionSample3: e.target.value })}
              placeholder="Enter caption sample 3..."
              className="min-h-[80px] bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
            />
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <Label className="text-sm font-semibold text-slate-300">
            Tone & Voice <span className="text-lime-400">*</span>
            <span className="block text-xs font-normal text-slate-500 mt-1">Select all that apply:</span>
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {tones.map((tone) => (
              <label
                key={tone}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-colors cursor-pointer"
              >
                <Checkbox
                  checked={(data.toneAndVoice || []).includes(tone)}
                  onCheckedChange={(checked) => handleToneChange(tone, !!checked)}
                />
                <span className="text-sm text-slate-200">{tone}</span>
              </label>
            ))}
          </div>
          <div className="mt-2">
            <Label htmlFor="toneOther" className="text-xs text-slate-500">Other:</Label>
            <Input
              id="toneOther"
              value={data.toneOther || ""}
              onChange={(e) => updateData({ toneOther: e.target.value })}
              placeholder="Specify other tone"
              className="mt-1 bg-slate-900/50 border-slate-800 h-9 text-sm"
            />
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <Label className="text-sm font-semibold text-slate-300">
            Caption Targeting <span className="text-lime-400">*</span>
          </Label>
          <RadioGroup
            value={data.captionTargeting}
            onValueChange={(val) => updateData({ captionTargeting: val })}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {targetingOptions.map((opt) => {
              const isSelected = data.captionTargeting === opt.value;
              return (
                <div
                  key={opt.value}
                  className={`flex flex-col gap-2 p-4 rounded-xl border transition-all duration-200 ${isSelected
                    ? "border-lime-400 bg-lime-400/10 shadow-[0_0_15px_rgba(163,230,53,0.1)]"
                    : "border-slate-800 bg-slate-900/40 hover:bg-slate-900/60"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={opt.value} id={`target-${opt.value}`} className={isSelected ? "border-lime-400" : ""} />
                    <Label
                      htmlFor={`target-${opt.value}`}
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
          </RadioGroup>
        </div>

        <div className="space-y-3 pt-4">
          <Label className="text-sm font-semibold text-slate-300">Language</Label>
          <RadioGroup
            value={data.language}
            onValueChange={(val) => updateData({ language: val })}
            className="flex flex-wrap gap-4"
          >
            {["English", "Bilingual"].map((lang) => {
              const isSelected = data.language === lang;
              const id = `lang-${lang.toLowerCase()}`;
              return (
                <div
                  key={lang}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${isSelected
                    ? "border-lime-400 bg-lime-400/10 shadow-[0_0_15px_rgba(163,230,53,0.1)]"
                    : "border-slate-800 bg-slate-900/40 hover:bg-slate-900/60"
                    }`}
                >
                  <RadioGroupItem value={lang} id={id} className={isSelected ? "border-lime-400" : ""} />
                  <Label
                    htmlFor={id}
                    className={`text-sm cursor-pointer transition-colors ${isSelected ? "text-white font-bold" : "text-slate-200"}`}
                  >
                    {lang}
                  </Label>
                </div>
              );
            })}
            {data.language === "Bilingual" && (
              <Input
                value={data.languageSpecify || ""}
                onChange={(e) => updateData({ languageSpecify: e.target.value })}
                placeholder="Specify language(s)..."
                className="flex-1 min-w-[200px] bg-slate-900/50 border-slate-800 h-11"
              />
            )}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
