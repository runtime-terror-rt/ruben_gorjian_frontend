"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";

interface SpecialNotesSectionProps {
  data: any;
  updateData: (fields: any) => void;
}

export function SpecialNotesSection({ data, updateData }: SpecialNotesSectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">07 Special Notes</h2>
          <p className="text-xs text-slate-500">
            Anything else we must know before creating your content?
          </p>
        </div>

        <div className="space-y-2">
          <Textarea
            id="specialNotes"
            value={data.specialNotes || ""}
            onChange={(e) => updateData({ specialNotes: e.target.value })}
            placeholder="Enter any additional notes, instructions, or specific sensitivities here..."
            className="min-h-[250px] bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
          />
        </div>
      </div>
    </div>
  );
}
