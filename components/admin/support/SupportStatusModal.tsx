"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPatch } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle2, Clock, Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SubmissionStatus = "PENDING" | "REPLIED" | "RESOLVED";

interface SupportStatusModalProps {
  submission: {
    id: string;
    fullName: string;
    status: SubmissionStatus;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupportStatusModal({
  submission,
  open,
  onOpenChange,
}: SupportStatusModalProps) {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<SubmissionStatus | null>(
    () => submission?.status ?? null,
  );

  const statusMutation = useMutation({
    mutationFn: (status: SubmissionStatus) => 
      apiPatch<{ success: boolean }>(`/api/contact/admin/submissions/${submission?.id}/status`, { status }),
    onSuccess: (_, status) => {
      toast.success(`Status updated to ${status.toLowerCase()}`, {
        position: "top-right"
      });
      queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error("Failed to update status", {
        description: err.message,
        position: "top-right"
      });
    }
  });

  const statuses: Array<{
    value: SubmissionStatus;
    label: string;
    icon: LucideIcon;
    color: string;
  }> = [
    {
      value: "PENDING",
      label: "Pending",
      icon: Clock,
      color:
        "text-[#14110c] bg-orange-500 border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]",
    },
    {
      value: "RESOLVED",
      label: "Resolved",
      icon: CheckCircle2,
      color: "text-[#b08d3e] bg-[#b08d3e]/10 border-[#b08d3e]/20",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#faf8f3] border-[#d9d4c9] text-[#14110c] rounded-3xl shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-black text-[#14110c] tracking-tight flex items-center gap-3">
            Change Status
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Update the processing status for <span className="text-[#14110c]">{submission?.fullName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl border transition-all group",
                selectedStatus === status.value
                  ? "bg-[#ffffff] border-[#b08d3e] shadow-[0_0_15px_rgba(163,230,53,0.1)]"
                  : "bg-[#ffffff] border-[#d9d4c9] hover:border-[#d9d4c9] hover:bg-[#ffffff]"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl", status.color)}>
                  <status.icon className="h-4 w-4" />
                </div>
                <span className={cn("font-bold", selectedStatus === status.value ? "text-[#14110c]" : "text-[#6b6b6b]")}>
                  {status.label}
                </span>
              </div>
              {selectedStatus === status.value && (
                <CheckCircle2 className="h-5 w-5 text-[#b08d3e]" />
              )}
            </button>
          ))}
        </div>

        <DialogFooter className="pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-500 hover:text-[#14110c] hover:bg-[#ffffff] rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={() => selectedStatus && statusMutation.mutate(selectedStatus)}
            disabled={
              statusMutation.isPending ||
              !submission ||
              !selectedStatus ||
              selectedStatus === submission.status
            }
            className="bg-[#b08d3e] hover:bg-[#e6e1d8] text-slate-950 font-black px-8 h-11 rounded-xl shadow-[0_10px_20px_rgba(163,230,53,0.2)]"
          >
            {statusMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
