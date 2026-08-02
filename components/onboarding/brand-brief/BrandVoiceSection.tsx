"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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

  const captionTargetingOptions = [
    {
      value: "B2C only — captions speak directly to hungry customers",
      label: "B2C only",
      sub: "Captions speak directly to hungry customers",
    },
    {
      value: "B2B only — captions target event planners, corporate clients",
      label: "B2B only",
      sub: "Captions target event planners, corporate clients",
    },
    {
      value: "Mix of both — alternate between consumer and business angles",
      label: "Mix of both",
      sub: "Alternate between consumer and business angles",
    },
  ];

  const handleToneChange = (tone: string, checked: boolean) => {
    const current = data.toneAndVoice || [];
    if (checked) {
      updateData({ toneAndVoice: [...current, tone] });
    } else {
      updateData({ toneAndVoice: current.filter((t: string) => t !== tone) });
    }
  };

  const addOtherTone = () => {
    if (data.toneOther && data.toneOther.trim()) {
      const current = data.toneAndVoice || [];
      if (!current.includes(data.toneOther.trim())) {
        updateData({
          toneAndVoice: [...current, data.toneOther.trim()],
          toneOther: ""
        });
      } else {
        updateData({ toneOther: "" });
      }
    }
  };

  const handleTargetingChange = (val: string, checked: boolean) => {
    if (checked) {
      updateData({ captionTargeting: val });
    } else {
      updateData({ captionTargeting: "" });
    }
  };

  const handleLanguageChange = (val: string, checked: boolean) => {
    if (checked) {
      updateData({ language: val });
    } else {
      updateData({ language: "" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">03 Brand Voice</h2>
          <p className="text-xs text-slate-500">
            ★ Most Important Section — This section directly determines how your captions sound.
            Vague answers produce generic captions. Specific answers produce captions that sound like YOU.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="foodDescription" className="text-sm font-semibold text-slate-300">
            How would you describe your food in your own words? <span className="text-lime-700">*</span>
            <span className="block text-xs font-normal text-slate-500 mt-1">
              Write like you&apos;re telling a friend about your restaurant. Not marketing language — YOUR words.
            </span>
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
            What makes your restaurant different from every other place on the block? <span className="text-lime-700">*</span>
            <span className="block text-xs font-normal text-slate-500 mt-1">
              Could be a secret recipe, family history, technique, atmosphere, or loyal community. Be specific.
            </span>
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
            What do your regulars say about you? <span className="text-lime-700">*</span>
            <span className="block text-xs font-normal text-slate-500 mt-1">
              Paste real Google/Yelp review quotes, or write what you hear customers say most often.
            </span>
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
              <span className="block text-xs font-normal text-slate-500 mt-1">
                e.g. &apos;premium ingredients&apos;, &apos;culinary journey&apos; — list any language that feels fake or generic to you.
              </span>
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
              <span className="block text-xs font-normal text-slate-500 mt-1">
                Any slogan, tagline, inside joke, or language your regulars would recognize immediately.
              </span>
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

        {/* 3 Sample Captions */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-slate-300">
            3 Sample Captions — MANDATORY <span className="text-lime-700">*</span>
            <span className="block text-xs font-normal text-slate-500 mt-1">
              Paste 3 captions from your existing Instagram or any account whose tone you want to match.
              If you have none, write 3 sentences about your restaurant the way you&apos;d say them out loud.
              NO EXCEPTIONS — briefs submitted without this will be returned.
            </span>
          </Label>
          <div className="space-y-3">
            {[
              { key: "captionSample1", placeholder: "Caption Sample 1..." },
              { key: "captionSample2", placeholder: "Caption Sample 2..." },
              { key: "captionSample3", placeholder: "Caption Sample 3..." },
            ].map(({ key, placeholder }) => (
              <Textarea
                key={key}
                value={data[key] || ""}
                onChange={(e) => updateData({ [key]: e.target.value })}
                placeholder={placeholder}
                className="min-h-[80px] bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
              />
            ))}
          </div>
        </div>

        {/* Tone & Voice */}
        <div className="space-y-3 pt-4">
          <Label className="text-sm font-semibold text-slate-300">
            Tone &amp; Voice <span className="text-lime-700">*</span>
            <span className="block text-xs font-normal text-slate-500 mt-1">Select all that apply:</span>
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {tones.map((tone) => {
              const isChecked = (data.toneAndVoice || []).includes(tone);
              return (
                <label
                  key={tone}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                    isChecked
                      ? "border-lime-400 bg-lime-400/10 shadow-[0_0_15px_rgba(163,230,53,0.1)]"
                      : "border-slate-800 bg-slate-900/40 hover:bg-slate-900/60"
                  }`}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => handleToneChange(tone, !!checked)}
                  />
                  <span className={`text-sm ${isChecked ? "text-white font-bold" : "text-slate-200"}`}>
                    {tone}
                  </span>
                </label>
              );
            })}

            {/* Other — toggle card, hidden by default */}
            <div
              onClick={() => {
                if (data.toneOtherActive) {
                  updateData({ toneOtherActive: false, toneOther: "" });
                } else {
                  updateData({ toneOtherActive: true });
                }
              }}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                data.toneOtherActive
                  ? "border-lime-400 bg-lime-400/10 shadow-[0_0_15px_rgba(163,230,53,0.1)]"
                  : "border-slate-800 bg-slate-900/40 hover:bg-slate-900/60"
              }`}
            >
              <Checkbox
                checked={!!data.toneOtherActive}
                onCheckedChange={(checked) => {
                  if (!checked) {
                    updateData({ toneOtherActive: false, toneOther: "" });
                  } else {
                    updateData({ toneOtherActive: true });
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <span
                className={`text-sm flex-1 py-1 transition-colors ${
                  data.toneOtherActive ? "text-white font-bold" : "text-slate-400"
                }`}
              >
                Other — specify your tone
              </span>
            </div>
          </div>

          {/* Other input — only visible when Other is toggled on */}
          {data.toneOtherActive && (
            <div className="flex gap-2 animate-in slide-in-from-top-2 duration-300">
              <Input
                id="toneOther"
                value={data.toneOther || ""}
                onChange={(e) => updateData({ toneOther: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOtherTone())}
                placeholder="Type and press Enter or click '+'"
                className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50 h-11 text-sm flex-1"
              />
              <button
                type="button"
                onClick={addOtherTone}
                className="h-11 px-4 rounded-xl bg-lime-400 text-slate-950 font-bold hover:bg-lime-300 transition-colors"
              >
                +
              </button>
            </div>
          )}

          {/* Display added "Other" tones if any are not in the main list */}
          {(data.toneAndVoice || []).filter((t: string) => !tones.includes(t)).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {(data.toneAndVoice || []).filter((t: string) => !tones.includes(t)).map((tone: string) => (
                <Badge key={tone} className="bg-slate-800 text-slate-200 border-slate-700 py-1 px-3 rounded-lg flex gap-2 items-center">
                  {tone}
                  <button 
                    onClick={() => handleToneChange(tone, false)}
                    className="hover:text-rose-400 transition-colors"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Caption Targeting — checkbox-grid options */}
        <div className="space-y-3 pt-4">
          <Label className="text-sm font-semibold text-slate-300">
            Caption Targeting <span className="text-lime-700">*</span>
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {captionTargetingOptions.map((opt) => {
              const isSelected = data.captionTargeting === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => handleTargetingChange(opt.value, !isSelected)}
                  className={`flex flex-col gap-1 p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                    isSelected
                      ? "border-lime-400 bg-lime-400/10 shadow-[0_0_15px_rgba(163,230,53,0.1)]"
                      : "border-slate-800 bg-slate-900/40 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      id={`target-${opt.value}`}
                      onCheckedChange={(checked) => handleTargetingChange(opt.value, !!checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Label
                      htmlFor={`target-${opt.value}`}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-sm font-semibold cursor-pointer transition-colors ${
                        isSelected ? "text-white" : "text-slate-200"
                      }`}
                    >
                      {opt.label}
                    </Label>
                  </div>
                  <span
                    className={`text-[11px] leading-relaxed ml-7 transition-colors ${
                      isSelected ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {opt.sub}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Language — checkbox-grid */}
        <div className="space-y-3 pt-4">
          <Label className="text-sm font-semibold text-slate-300">Language</Label>
          <div className="flex flex-wrap gap-3">
            {[
              { value: "English only", label: "English only" },
              { value: "Bilingual", label: "Bilingual" },
            ].map((lang) => {
              const isSelected = data.language === lang.value;
              const id = `lang-${lang.value.toLowerCase().replace(/\s+/g, "-")}`;
              return (
                <div
                  key={lang.value}
                  onClick={() => handleLanguageChange(lang.value, !isSelected)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                    isSelected
                      ? "border-lime-400 bg-lime-400/10 shadow-[0_0_15px_rgba(163,230,53,0.1)]"
                      : "border-slate-800 bg-slate-900/40 hover:bg-slate-900/60"
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    id={id}
                    onCheckedChange={(checked) => handleLanguageChange(lang.value, !!checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Label
                    htmlFor={id}
                    onClick={(e) => e.stopPropagation()}
                    className={`text-sm cursor-pointer transition-colors ${
                      isSelected ? "text-white font-bold" : "text-slate-200"
                    }`}
                  >
                    {lang.label}
                  </Label>
                </div>
              );
            })}
          </div>

          {/* Bilingual specify input — hidden until Bilingual is selected */}
          {data.language === "Bilingual" && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <Input
                value={data.languageSpecify || ""}
                onChange={(e) => updateData({ languageSpecify: e.target.value })}
                placeholder="Specify language(s) e.g. English + Spanish..."
                className="bg-slate-900/50 border-slate-800 focus:border-lime-400/50 h-11"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
