"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPatch } from "@/lib/api";
import { 
  Clock, 
  CheckCircle, 
  Mail, 
  Globe, 
  User, 
  Calendar, 
  MessageSquare,
  Info
} from "lucide-react";

type SubmissionStatus = "PENDING" | "REPLIED" | "RESOLVED";

interface SubmissionDetail {
  id: string;
  fullName: string;
  businessName: string;
  email: string;
  websiteHandle: string;
  interests: string[];
  postsPerMonth: string;
  message: string;
  // source: string;
  status: SubmissionStatus;
  repliedBy: string | null;
  replyMessage: string | null;
  repliedAt: string | null;
  isResolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
  createdIp: string;
}

interface SupportDetailsModalProps {
  submissionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupportDetailsModal({
  submissionId,
  open,
  onOpenChange,
}: SupportDetailsModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [replyMessage, setReplyMessage] = useState("");

  const { data: submission, isLoading, error } = useQuery({
    queryKey: ["contact-submission", submissionId],
    queryFn: () => apiGet<{ success: boolean; data: SubmissionDetail }>(`/api/contact/admin/submissions/${submissionId}`).then(res => res.data),
    enabled: !!submissionId && open,
  });

  const replyMutation = useMutation({
    mutationFn: (message: string) => 
      apiPatch<{ success: boolean }>(`/api/contact/admin/submissions/${submissionId}/reply`, { replyMessage: message }),
    onSuccess: () => {
      toast({ title: "Reply sent successfully" });
      setReplyMessage("");
      queryClient.invalidateQueries({ queryKey: ["contact-submission", submissionId] });
      queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to send reply", description: err.message, variant: "destructive" });
    }
  });

  const statusMutation = useMutation({
    mutationFn: (status: SubmissionStatus) => 
      apiPatch<{ success: boolean }>(`/api/contact/admin/submissions/${submissionId}/status`, { status }),
    onSuccess: () => {
      toast({ title: `Status updated to ${submission?.status === "RESOLVED" ? "PENDING" : "RESOLVED"}` });
      queryClient.invalidateQueries({ queryKey: ["contact-submission", submissionId] });
      queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to update status", description: err.message, variant: "destructive" });
    }
  });

  const handleSendReply = () => {
    if (!replyMessage.trim()) return;
    replyMutation.mutate(replyMessage);
  };

  const toggleStatus = () => {
    const nextStatus = submission?.status === "RESOLVED" ? "PENDING" : "RESOLVED";
    statusMutation.mutate(nextStatus);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case "RESOLVED":
        return (
          <Badge className="bg-[#b08d3e]/10 text-[#b08d3e] border-lime-500/30 px-2 py-0.5 font-bold uppercase text-[9px] tracking-widest shadow-[0_0_10px_rgba(132,204,22,0.1)]">
            Resolved
          </Badge>
        );
      case "REPLIED":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 px-2 py-0.5 font-bold uppercase text-[9px] tracking-widest shadow-[0_0_10px_rgba(59,130,246,0.1)]">
            Replied
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500 text-black px-2 py-0.5 font-black uppercase text-[9px] tracking-[0.15em] border-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.4)] animate-pulse hover:animate-none transition-all">
            Pending
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-3xl max-h-[92vh] overflow-y-auto bg-[#faf8f3] border-[#d9d4c9]/80 text-[#14110c] 
        scrollbar-hide">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#b08d3e]" />
              Submission Details
            </DialogTitle>
            {submission && getStatusBadge(submission.status)}
          </div>
          <DialogDescription className="text-[#6b6b6b] text-xs">
            Full report of contact request from {submission?.fullName || "user"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d9d4c9] border-t-lime-400"></div>
            <p className="text-sm text-slate-500">Fetching submission details...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <Info className="h-12 w-12 text-red-500/50 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Failed to load details</p>
            <p className="text-sm text-slate-500">{(error as Error).message}</p>
          </div>
        ) : submission ? (
          <div className="space-y-8 mt-4">
            {/* User Info Grid */}
            {/* User Info Grid - Compact version */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4 bg-[#ffffff]/30 p-5 rounded-xl border border-white/5 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-[#e6e1d8]/50 border border-white/5">
                    <User className="h-3.5 w-3.5 text-[#6b6b6b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider mb-0.5">Full Name</p>
                    <p className="font-semibold text-[#14110c] text-sm leading-tight truncate">{submission.fullName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-[#e6e1d8]/50 border border-white/5">
                    <Mail className="h-3.5 w-3.5 text-[#6b6b6b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider mb-0.5">Email Address</p>
                    <p className="font-medium text-[#14110c] text-sm break-all">{submission.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-[#e6e1d8]/50 border border-white/5">
                    <Globe className="h-3.5 w-3.5 text-[#6b6b6b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider mb-0.5">Website / Handle</p>
                    <p className="font-medium text-[#14110c] text-sm break-all">{submission.websiteHandle}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-[#e6e1d8]/50 border border-white/5">
                    <Info className="h-3.5 w-3.5 text-[#6b6b6b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider mb-0.5">Business Name</p>
                    <p className="font-semibold text-[#14110c] text-sm leading-tight truncate">{submission.businessName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-[#e6e1d8]/50 border border-white/5">
                    <Calendar className="h-3.5 w-3.5 text-[#6b6b6b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider mb-0.5">Submitted At</p>
                    <p className="font-medium text-[#14110c] text-sm">{formatDate(submission.createdAt)}</p>
                  </div>
                </div>
                {/* <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-[#e6e1d8]/50 border border-white/5">
                    <Globe className="h-3.5 w-3.5 text-[#6b6b6b]" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1.5">Source</p>
                    <Badge variant="outline" className="text-[9px] font-bold border-[#d9d4c9] bg-[#b08d3e]/10 text-[#b08d3e] py-0 px-2 h-4">{submission.source}</Badge>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Requirements Section */}
            {/* <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-[#b08d3e]"></div>
                Project Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#ffffff]/20 p-3 rounded-lg border border-white/5">
                  <p className="text-[9px] uppercase font-bold text-slate-600 tracking-wider mb-1.5">Interests</p>
                  <div className="flex flex-wrap gap-1.5">
                    {submission.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="bg-[#e6e1d8] text-[10px] text-[#6b6b6b] h-5">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="bg-[#ffffff]/20 p-3 rounded-lg border border-white/5">
                  <p className="text-[9px] uppercase font-bold text-slate-600 tracking-wider mb-1">Posts Per Month</p>
                  <p className="text-[#14110c] font-medium text-sm">{submission.postsPerMonth}</p>
                </div>
              </div>
            </div> */}

            {/* Message Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-[#b08d3e]"></div>
                User Message
              </h3>
              <div className="bg-[#ffffff] p-5 rounded-xl border border-white/5 shadow-inner relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                  <MessageSquare className="h-8 w-8 text-[#14110c]" />
                </div>
                <p className="text-[#14110c] leading-relaxed text-sm italic relative z-10">
                  "{submission.message}"
                </p>
              </div>
            </div>

            {/* Reply Log */}
            {submission.replyMessage && (
              <div className="space-y-4 bg-[#b08d3e]/5 p-6 rounded-xl border border-lime-500/10">
                <h3 className="text-sm font-semibold text-[#b08d3e] uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Your Reply
                </h3>
                <p className="text-[#14110c] leading-relaxed">{submission.replyMessage}</p>
                <div className="flex items-center gap-4 text-[10px] text-slate-500 border-t border-lime-500/10 pt-4">
                  <span>Replied at {formatDate(submission.repliedAt)}</span>
                  <span>•</span>
                  <span>ID: {submission.repliedBy}</span>
                </div>
              </div>
            )}

            {/* Reply Form */}
            {!submission.replyMessage && (
              <div className="space-y-4 border-t border-[#d9d4c9] pt-6">
                <h3 className="text-sm font-semibold text-[#14110c] uppercase tracking-wider">Send a Response</h3>
                <div className="space-y-3">
                  <Textarea
                    placeholder="Type your reply to the user here..."
                    className="min-h-[120px] bg-[#faf8f3] border-[#d9d4c9] focus-visible:ring-lime-500/50"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500 italic">User will receive this via email.</p>
                    <Button 
                      onClick={handleSendReply} 
                      disabled={!replyMessage.trim() || replyMutation.isPending}
                      className="bg-[#b08d3e] hover:bg-lime-600 text-slate-950 font-bold px-8"
                    >
                      {replyMutation.isPending ? "Sending..." : "Send Reply"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="border-t border-[#d9d4c9] pt-6 flex sm:justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Status:</span>
                {getStatusBadge(submission.status)}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-[#d9d4c9]" onClick={() => onOpenChange(false)}>
                  Close Details
                </Button>
                {/* <Button 
                  variant={submission.status === "RESOLVED" ? "secondary" : "default"}
                  className={submission.status === "RESOLVED" ? "" : "bg-[#b08d3e] hover:bg-lime-600 text-[#14110c]"}
                  onClick={toggleStatus}
                  disabled={statusMutation.isPending}
                >
                  {statusMutation.isPending ? "Updating..." : submission.status === "RESOLVED" ? "Mark as Pending" : "Mark as Resolved"}
                </Button> */}
              </div>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
