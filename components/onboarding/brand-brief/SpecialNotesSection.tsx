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
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Special Notes</h2>
          <p className="text-xs text-slate-500">
            Certifications, discontinued items, seasonal notes, sensitivities, or anything we must know before creating content.
          </p>
        </div>

        <div className="space-y-2">
          <Textarea
            id="specialNotes"
            value={data.specialNotes || ""}
            onChange={(e) => updateData({ specialNotes: e.target.value })}
            placeholder="Enter any additional notes or instructions here..."
            className="min-h-[200px] bg-slate-900/50 border-slate-800 focus:border-lime-400/50"
          />
        </div>

        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-3">
          <div className="flex items-center gap-2 text-blue-400">
            <Info className="h-5 w-5" />
            <h3 className="font-semibold text-sm uppercase tracking-wide">Social Media Access</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            You will receive a separate secure form to connect your platforms after submission. 
            You log in directly — your credentials are never visible to or stored by Talexia. 
            You can disconnect at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
