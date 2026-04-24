"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Calendar, 
  Mail, 
  Building2, 
  Hash, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Send, 
  Ban,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  User,
  Globe,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiGet, apiPost, apiDelete, apiPatch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type DetailResponse = {
  invite: {
    id: string;
    email: string;
    fullName: string;
    companyName: string;
    socialPlatforms: string[];
    planCode: string;
    status: string;
    expiresAt: string;
    viewedAt: string | null;
    signedUpAt: string | null;
    paidAt: string | null;
    sentByAdminEmail: string;
    createdAt: string;
    updatedAt: string;
  };
  proposal: {
    id: string;
    planName: string;
    amount: number;
    billingCycle: string;
    currency: string;
    status: string;
    expiresAt: string;
    viewedAt: string | null;
    signedUpAt: string | null;
    paidAt: string | null;
  } | null;
  user: any;
  subscription: any;
};

export default function EnterpriseInviteDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery<DetailResponse>({
    queryKey: ["enterprise-invite-details", id],
    queryFn: () => apiGet<DetailResponse>(`/api/admin/enterprise-plan/invites/${id}/details`),
    enabled: !!id,
  });

  const resendMutation = useMutation({
    mutationFn: () => apiPost(`/api/admin/enterprise-plan/invites/${id}/resend`, {}),
    onSuccess: () => {
      toast({ title: "Invite resent successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Resend failed", description: err.message, variant: "destructive" });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiPatch(`/api/admin/enterprise-plan/invites/${id}/cancel`, {}),
    onSuccess: () => {
      toast({ title: "Invite canceled" });
      setIsCancelModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["enterprise-invites"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise-invite-details", id] });
    },
    onError: (err: any) => {
      toast({ title: "Cancel failed", description: err.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/api/admin/enterprise-plan/invites/${id}/permanent`),
    onSuccess: () => {
      toast({ title: "Permanently deleted" });
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["enterprise-invites"] });
      router.push("/admin/enterprise-plan");
    },
    onError: (err: any) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-lime-400" />
        <p className="text-slate-400 font-medium">Loading proposal details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-white">Error loading details</h2>
        <p className="text-slate-400 mt-2">The requested enterprise invite could not be found or loaded.</p>
        <Button onClick={() => router.back()} className="mt-4 bg-slate-800 hover:bg-slate-700">
          Go Back
        </Button>
      </div>
    );
  }

  const { invite, proposal, user, subscription } = data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAYMENT_COMPLETED": return "bg-lime-400 text-slate-950";
      case "PENDING": return "bg-yellow-400 text-slate-950";
      case "SIGNED_UP": return "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]";
      case "CANCELED": return "bg-red-400 text-white";
      default: return "bg-slate-600 text-white";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 hover:bg-transparent text-slate-400 hover:text-white mb-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white tracking-tight">{invite.companyName}</h1>
            <Badge className={cn("px-3 py-1 font-bold rounded-full", getStatusColor(invite.status))}>
              {invite.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-slate-400 font-medium">Ref: {invite.planCode}</p>
        </div>

        <div className="flex items-center gap-2">
          {invite.status === "PENDING" && (
            <Button 
              className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold rounded-xl"
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending}
            >
              {resendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Resend Invite
            </Button>
          )}
          {invite.status !== "CANCELED" && invite.status !== "PAYMENT_COMPLETED" && (
            <Button 
              variant="outline" 
              className="border-white/10 bg-white/5 text-white hover:bg-red-500/20 hover:text-red-400 font-bold rounded-xl"
              onClick={() => setIsCancelModalOpen(true)}
            >
              <Ban className="h-4 w-4 mr-2" /> Cancel
            </Button>
          )}
          <Button 
            variant="ghost" 
            className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 font-bold rounded-xl"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Modals */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="bg-slate-900 border-white/5 rounded-3xl max-w-sm">
          <DialogHeader className="pt-4 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">Cancel Invitation?</DialogTitle>
            <DialogDescription className="text-slate-400 mt-2">
              This will invalidate the current proposal and prevent the client from completing the checkout.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 p-4 pt-2 sm:flex-col">
            <Button 
              onClick={() => cancelMutation.mutate()} 
              disabled={cancelMutation.isPending}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold w-full rounded-xl h-12"
            >
              {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Cancel Invite"}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setIsCancelModalOpen(false)}
              className="text-slate-400 hover:text-white w-full rounded-xl"
            >
              Go Back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-slate-900 border-white/5 rounded-3xl max-w-sm">
          <DialogHeader className="pt-4 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <Trash2 className="h-8 w-8 text-red-500" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">Delete Permanently?</DialogTitle>
            <DialogDescription className="text-slate-400 mt-2">
              This action cannot be undone. All record of this invitation and proposal will be lost forever.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 p-4 pt-2 sm:flex-col">
            <Button 
              onClick={() => deleteMutation.mutate()} 
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-400 text-white font-bold w-full rounded-xl h-12 shadow-[0_10px_20px_rgba(239,68,68,0.2)]"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Permanently"}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-slate-400 hover:text-white w-full rounded-xl"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section - 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <Card className="border-white/5 bg-slate-900/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-lime-400" />
                <CardTitle className="text-white">Proposal Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plan Name</span>
                    <span className="text-white font-bold text-xl">{proposal?.planName || "Enterprise Plan"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount & Cycle</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lime-400 font-black text-2xl">${proposal?.amount}</span>
                      <Badge className="bg-white/10 text-white border-none">{proposal?.billingCycle}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Social Platforms</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {invite.socialPlatforms.map(platform => (
                        <Badge key={platform} className="bg-slate-800 text-slate-200 border-white/10 px-3 py-1">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expires On</span>
                    <div className="flex items-center gap-2 text-white font-medium">
                      <Clock className="h-4 w-4 text-slate-500" />
                      {format(new Date(invite.expiresAt), "PPP")}
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/5" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-lime-400/5 rounded-2xl border border-lime-400/10 flex flex-col items-center text-center gap-2">
                  <Mail className="h-5 w-5 text-lime-400" />
                  <span className="text-[10px] text-lime-400/70 font-bold uppercase">Sent</span>
                  <span className="text-white font-bold text-xs">{format(new Date(invite.createdAt), "MMM d, yyyy")}</span>
                </div>
                <div className={cn(
                  "p-4 rounded-2xl border flex flex-col items-center text-center gap-2",
                  invite.viewedAt ? "bg-cyan-500/10 border-cyan-500/20" : "bg-white/5 border-white/5"
                )}>
                  <Globe className={cn("h-5 w-5", invite.viewedAt ? "text-cyan-400" : "text-slate-400")} />
                  <span className={cn("text-[10px] font-bold uppercase", invite.viewedAt ? "text-cyan-300" : "text-slate-500")}>Viewed</span>
                  <span className="text-white font-bold text-xs">{invite.viewedAt ? format(new Date(invite.viewedAt), "MMM d, yyyy") : "Not viewed"}</span>
                </div>
                <div className={cn(
                  "p-4 rounded-2xl border flex flex-col items-center text-center gap-2",
                  invite.signedUpAt ? "bg-indigo-500/10 border-indigo-500/20" : "bg-white/5 border-white/5"
                )}>
                  <User className={cn("h-5 w-5", invite.signedUpAt ? "text-indigo-400" : "text-slate-400")} />
                  <span className={cn("text-[10px] font-bold uppercase", invite.signedUpAt ? "text-indigo-300" : "text-slate-500")}>Signed Up</span>
                  <span className="text-white font-bold text-xs">{invite.signedUpAt ? format(new Date(invite.signedUpAt), "MMM d, yyyy") : "Pending"}</span>
                </div>
                <div className={cn(
                  "p-4 rounded-2xl border flex flex-col items-center text-center gap-2",
                  invite.paidAt ? "bg-lime-400/10 border-lime-400/20" : "bg-white/5 border-white/5"
                )}>
                  <CreditCard className={cn("h-5 w-5", invite.paidAt ? "text-lime-400" : "text-slate-400")} />
                  <span className={cn("text-[10px] font-bold uppercase", invite.paidAt ? "text-lime-300" : "text-slate-500")}>Paid</span>
                  <span className="text-white font-bold text-xs">{invite.paidAt ? format(new Date(invite.paidAt), "MMM d, yyyy") : "Unpaid"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity / Timeline could go here */}
        </div>

        {/* Right Section - 1 Column */}
        <div className="space-y-8">
          {/* Client Card */}
          <Card className="border-white/5 bg-slate-900/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-white text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400 font-black text-xl">
                  {invite.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-white font-bold">{invite.fullName}</h4>
                  <p className="text-slate-500 text-sm">{invite.companyName}</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 text-slate-300">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium">{invite.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium">Invited by: {invite.sentByAdminEmail}</span>
                </div>
              </div>

              <Separator className="bg-white/5" />

              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Platform Access</h5>
                {user ? (
                  <div className="flex items-center justify-between p-3 bg-lime-400/5 border border-lime-400/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-lime-400" />
                      <span className="text-white text-sm font-bold">Account Active</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-lime-400 hover:text-lime-300 p-0" onClick={() => router.push(`/admin/users/${user.id}`)}>
                      View User <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-medium">Account not yet created</span>
                  </div>
                )}

                {subscription ? (
                  <div className="flex items-center justify-between p-3 bg-blue-400/5 border border-blue-400/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-400" />
                      <span className="text-white text-sm font-bold">Subscription Live</span>
                    </div>
                    <Badge className="bg-blue-400/20 text-blue-400 border-none">{subscription.status}</Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400">
                    <Ban className="h-4 w-4" />
                    <span className="text-xs font-medium">No active subscription</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="border-white/5 bg-slate-900/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl border-dashed border-2">
            <CardContent className="p-6 text-center space-y-4">
              <p className="text-xs text-slate-500">Need to make changes to the pricing or plan details? Cancel this proposal and create a new one.</p>
              <Button 
                variant="link" 
                className="text-lime-400 hover:text-lime-300 font-bold"
                onClick={() => router.push("/admin/enterprise-plan")}
              >
                Create New Proposal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
