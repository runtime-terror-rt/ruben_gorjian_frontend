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

const tones = [
  "Bold & playful",
  "Warm & community-driven",
  "Elegant & aspirational",
  "Minimal & clean",
];

const targetingOptions = [
  { value: "B2C only", label: "B2C only (end consumer — e.g. customers buying for themselves)" },
  { value: "B2B only", label: "B2B only (trade buyers — e.g. retailers, stylists, wholesale)" },
  { value: "Mix of B2B & B2C", label: "Mix of B2B & B2C (captions will alternate between both angles)" },
];

export function BrandVoiceSection({ data, updateData }: BrandVoiceSectionProps) {
  const handleToneChange = (tone: string, checked: boolean) => {
    const currentTones = data.tones || [];
    if (checked) {
      updateData({ tones: [...currentTones, tone] });
    } else {
      updateData({ tones: currentTones.filter((t: string) => t !== tone) });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Brand Voice</h2>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-300">
            Tone & Voice
            <span className="block text-xs font-normal text-slate-500 mt-1">Select all that apply:</span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tones.map((tone) => (
              <label
                key={tone}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-colors cursor-pointer"
              >
                <Checkbox
                  checked={(data.tones || []).includes(tone)}
                  onCheckedChange={(checked) => handleToneChange(tone, !!checked)}
                />
                <span className="text-sm text-slate-200">{tone}</span>
              </label>
            ))}
          </div>
          <div className="mt-2">
            <Label htmlFor="toneOther" className="text-xs text-slate-400">Other:</Label>
            <Input
              id="toneOther"
              value={data.toneOther || ""}
              onChange={(e) => updateData({ toneOther: e.target.value })}
              placeholder="Specify other tone"
              className="mt-1 bg-slate-900/50 border-slate-800 h-9 text-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-300">
            Caption Targeting
            <span className="block text-xs font-normal text-slate-500 mt-1">Pick one:</span>
          </Label>
          <RadioGroup
            value={data.captionTargeting}
            onValueChange={(val) => updateData({ captionTargeting: val })}
            className="space-y-2"
          >
            {targetingOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-colors cursor-pointer"
              >
                <RadioGroupItem value={opt.value} id={`targeting-${opt.value}`} className="mt-1" />
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-slate-200">{opt.value}</span>
                  <span className="text-xs text-slate-500 block">{opt.label.split('(')[1]?.replace(')', '') || ''}</span>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="taglines" className="text-sm font-semibold text-slate-300">
            Taglines or Recurring Phrases
            <span className="block text-xs font-normal text-slate-500 mt-1">Any slogans, phrases, or language your brand uses regularly.</span>
          </Label>
          <Textarea
            id="taglines"
            value={data.taglines || ""}
            onChange={(e) => updateData({ taglines: e.target.value })}
            placeholder="Enter your brand slogans or phrases"
            className="min-h-[100px] bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sampleCaptions" className="text-sm font-semibold text-slate-300">
            3 Sample Captions
            <span className="block text-xs font-normal text-slate-500 mt-1">Paste 3 captions that represent your brand voice perfectly.</span>
          </Label>
          <Textarea
            id="sampleCaptions"
            value={data.sampleCaptions || ""}
            onChange={(e) => updateData({ sampleCaptions: e.target.value })}
            placeholder="Caption 1...

Caption 2...

Caption 3..."
            className="min-h-[150px] bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
          />
        </div>
      </div>
    </div>
  );
}
