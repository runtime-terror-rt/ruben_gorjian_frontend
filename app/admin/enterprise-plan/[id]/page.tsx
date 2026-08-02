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
  AlertCircle,
  Edit3,
  CheckSquare,
  Camera,
  ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
    industry?: string;
    postsPerMonth?: number;
    reelsPerMonth?: number;
    microReelsPerMonth?: number;
    proPhotoShootFrequency?: string;
    proPhotoShootLength?: string;
    captionHashtags?: boolean;
    scheduling?: boolean;
    internalNotes?: string;
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit Form State
  const [formData, setFormData] = useState({
    planName: "",
    companyName: "",
    fullName: "",
    email: "",
    industry: "RESTAURANT_HOSPITALITY",
    otherIndustry: "",
    socialPlatforms: [] as string[],
    postsPerMonth: 40,
    reelsPerMonth: 20,
    microReelsPerMonth: 30,
    proPhotoShootFrequency: "Monthly",
    proPhotoShootLength: "3 Hours",
    otherPhotoShootLength: "",
    captionHashtags: true,
    scheduling: true,
    amount: 1250,
    billingCycle: "MONTHLY",
    expiresInDays: 7,
    internalNotes: ""
  });

  const { data, isLoading, error, refetch } = useQuery<DetailResponse>({
    queryKey: ["enterprise-invite-details", id],
    queryFn: () => apiGet<DetailResponse>(`/api/admin/enterprise-plan/invites/${id}/details`),
    enabled: !!id,
  });

  // Populate form data when editing starts
  useEffect(() => {
    // Check for edit=true in query params
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("edit") === "true") {
      setIsEditModalOpen(true);
      // Clean up the URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (data && isEditModalOpen) {
      const { invite, proposal } = data;
      
      const standardIndustries = [
        "RESTAURANT_HOSPITALITY", "JEWELRY", "FASHION_APPAREL", "BEAUTY_WELLNESS", 
        "HOME_LIFESTYLE", "HEALTH_FITNESS", "CORPORATE_PROFESSIONAL", "ECOMMERCE_PRODUCT"
      ];
      
      const standardLengths = ["0", "1 Hour", "1.5 Hours", "3 Hours"];
      
      const isOtherIndustry = proposal?.industry && !standardIndustries.includes(proposal.industry);
      const isCustomLength = proposal?.proPhotoShootLength && !standardLengths.includes(proposal.proPhotoShootLength);

      setFormData({
        planName: proposal?.planName || "Enterprise Growth",
        companyName: invite.companyName,
        fullName: invite.fullName,
        email: invite.email,
        industry: isOtherIndustry ? "OTHER" : (proposal?.industry || "RESTAURANT_HOSPITALITY"),
        otherIndustry: isOtherIndustry ? (proposal?.industry || "") : "",
        socialPlatforms: invite.socialPlatforms || ["INSTAGRAM", "FACEBOOK", "TIKTOK"],
        postsPerMonth: proposal?.postsPerMonth || 40,
        reelsPerMonth: proposal?.reelsPerMonth || 20,
        microReelsPerMonth: proposal?.microReelsPerMonth || 30,
        proPhotoShootFrequency: proposal?.proPhotoShootFrequency || "Monthly",
        proPhotoShootLength: isCustomLength ? "Custom" : (proposal?.proPhotoShootLength || "3 Hours"),
        otherPhotoShootLength: isCustomLength ? (proposal?.proPhotoShootLength || "") : "",
        captionHashtags: proposal?.captionHashtags ?? true,
        scheduling: proposal?.scheduling ?? true,
        amount: proposal?.amount || 1250,
        billingCycle: proposal?.billingCycle || "MONTHLY",
        expiresInDays: 7, 
        internalNotes: proposal?.internalNotes || ""
      });
    }
  }, [data, isEditModalOpen]);

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

  const updateMutation = useMutation({
    mutationFn: (payload: any) => apiPatch(`/api/admin/enterprise-plan/invites/${id}`, payload),
    onSuccess: () => {
      toast({ title: "Proposal updated successfully" });
      setIsEditModalOpen(false);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["enterprise-invites"] });
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  });

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare final data
    const submissionData = {
      ...formData,
      industry: formData.industry === "OTHER" ? formData.otherIndustry : formData.industry,
      proPhotoShootLength: formData.proPhotoShootLength === "Custom" ? formData.otherPhotoShootLength : formData.proPhotoShootLength
    };

    // Remove internal manual input fields
    const { otherIndustry, otherPhotoShootLength, ...finalData } = submissionData;

    updateMutation.mutate(finalData);
  };

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      socialPlatforms: prev.socialPlatforms.includes(platform)
        ? prev.socialPlatforms.filter(p => p !== platform)
        : [...prev.socialPlatforms, platform]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#b08d3e]" />
        <p className="text-[#6b6b6b] font-medium">Loading proposal details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-[#14110c]">Error loading details</h2>
        <p className="text-[#6b6b6b] mt-2">The requested enterprise invite could not be found or loaded.</p>
        <Button onClick={() => router.back()} className="mt-4 bg-[#e6e1d8] hover:bg-[#e6e1d8]">
          Go Back
        </Button>
      </div>
    );
  }

  const { invite, proposal, user, subscription } = data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAYMENT_COMPLETED": return "bg-[#b08d3e] text-[#14110c]";
      case "PENDING": return "bg-yellow-400 text-[#14110c]";
      case "SIGNED_UP": return "bg-indigo-500 text-[#14110c] shadow-[0_0_15px_rgba(99,102,241,0.3)]";
      case "CANCELED": return "bg-red-500 text-[#14110c]";
      default: return "bg-[#6b6b6b] text-[#14110c]";
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
            className="p-0 hover:bg-transparent text-[#6b6b6b] hover:text-[#14110c] mb-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-[#14110c]">{invite.companyName}</h1>
            <Badge className={cn("px-3 py-1 font-bold rounded-full", getStatusColor(invite.status))}>
              {invite.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-[#6b6b6b] font-medium">Ref: {invite.planCode}</p>
        </div>

        <div className="flex items-center gap-2">
          {invite.status !== "PAYMENT_COMPLETED" && (
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-[#14110c] font-bold rounded-xl"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Proposal
            </Button>
          )}
          {invite.status === "PENDING" && (
            <Button 
              variant="outline"
              className="border-lime-500/30 bg-[#b08d3e]/5 text-[#b08d3e] hover:bg-[#b08d3e] hover:text-[#14110c] font-bold rounded-xl"
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
              className="border-white/10 bg-white/5 text-[#14110c] hover:bg-red-500/20 hover:text-red-600 font-bold rounded-xl"
              onClick={() => setIsCancelModalOpen(true)}
            >
              <Ban className="h-4 w-4 mr-2" /> Cancel
            </Button>
          )}
          <Button 
            variant="ghost" 
            className="text-[#6b6b6b] hover:text-red-600 hover:bg-red-500/10 font-bold rounded-xl"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section - 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <Card className="border-white/5 bg-[#ffffff] backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#b08d3e]" />
                <CardTitle className="text-[#14110c]">Proposal Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-widest">Plan Name</span>
                    <span className="text-[#14110c] font-bold text-xl">{proposal?.planName || "Enterprise Plan"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-widest">Amount & Cycle</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#b08d3e] font-black text-2xl">${proposal?.amount}</span>
                      <Badge className="bg-white/10 text-[#14110c] border-none">{proposal?.billingCycle}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-widest">Industry / Category</span>
                    <span className="text-[#14110c] font-bold text-sm tracking-tight">{proposal?.industry?.replace(/_/g, " ") || "GENERAL"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-widest">Content Deliverables</span>
                    <div className="space-y-1 mt-1">
                      <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                        <span className="text-[#6b6b6b]">Monthly Posts</span>
                        <span className="text-[#14110c] font-bold">{proposal?.postsPerMonth || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                        <span className="text-[#6b6b6b]">Monthly Reels</span>
                        <span className="text-[#14110c] font-bold">{proposal?.reelsPerMonth || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                        <span className="text-[#6b6b6b]">Micro Content</span>
                        <span className="text-[#14110c] font-bold">{proposal?.microReelsPerMonth || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-widest">Shoot Logistics</span>
                    <div className="mt-1">
                      <p className="text-sm text-[#14110c] font-bold">{proposal?.proPhotoShootFrequency || "N/A"}</p>
                      <p className="text-xs text-[#6b6b6b]">{proposal?.proPhotoShootLength || "N/A"} session</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-widest">Social Presence</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {invite.socialPlatforms.map(platform => (
                        <Badge key={platform} className="bg-[#e6e1d8] text-[#14110c] border-white/10 px-3 py-1">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <div className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight", proposal?.captionHashtags ? "text-cyan-700" : "text-[#6b6b6b]")}>
                      <div className={cn("h-1.5 w-1.5 rounded-full", proposal?.captionHashtags ? "bg-cyan-600" : "bg-[#e6e1d8]")} /> Captions
                    </div>
                    <div className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight", proposal?.scheduling ? "text-indigo-600" : "text-[#6b6b6b]")}>
                      <div className={cn("h-1.5 w-1.5 rounded-full", proposal?.scheduling ? "bg-indigo-600" : "bg-[#e6e1d8]")} /> Scheduling
                    </div>
                  </div>
                </div>
              </div>

              {proposal?.internalNotes && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-widest block mb-2">Internal Admin Notes</span>
                  <p className="text-sm text-[#14110c] italic">"{proposal.internalNotes}"</p>
                </div>
              )}

              <Separator className="bg-white/5" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-[#b08d3e]/5 rounded-2xl border border-[#b08d3e]/10 flex flex-col items-center text-center gap-2">
                  <Mail className="h-5 w-5 text-[#b08d3e]" />
                  <span className="text-[10px] text-[#b08d3e]/70 font-bold uppercase">Sent</span>
                  <span className="text-[#14110c] font-bold text-xs">{format(new Date(invite.createdAt), "MMM d, yyyy")}</span>
                </div>
                <div className={cn(
                  "p-4 rounded-2xl border flex flex-col items-center text-center gap-2",
                  invite.viewedAt ? "bg-cyan-500/10 border-cyan-500/20" : "bg-white/5 border-white/5"
                )}>
                  <Globe className={cn("h-5 w-5", invite.viewedAt ? "text-cyan-700" : "text-[#6b6b6b]")} />
                  <span className={cn("text-[10px] font-bold uppercase", invite.viewedAt ? "text-cyan-700" : "text-[#6b6b6b]")}>Viewed</span>
                  <span className="text-[#14110c] font-bold text-xs">{invite.viewedAt ? format(new Date(invite.viewedAt), "MMM d, yyyy") : "Not viewed"}</span>
                </div>
                <div className={cn(
                  "p-4 rounded-2xl border flex flex-col items-center text-center gap-2",
                  invite.signedUpAt ? "bg-indigo-500/10 border-indigo-500/20" : "bg-white/5 border-white/5"
                )}>
                  <User className={cn("h-5 w-5", invite.signedUpAt ? "text-indigo-600" : "text-[#6b6b6b]")} />
                  <span className={cn("text-[10px] font-bold uppercase", invite.signedUpAt ? "text-indigo-600" : "text-[#6b6b6b]")}>Signed Up</span>
                  <span className="text-[#14110c] font-bold text-xs">{invite.signedUpAt ? format(new Date(invite.signedUpAt), "MMM d, yyyy") : "Pending"}</span>
                </div>
                <div className={cn(
                  "p-4 rounded-2xl border flex flex-col items-center text-center gap-2",
                  invite.paidAt ? "bg-[#b08d3e]/10 border-[#b08d3e]/20" : "bg-white/5 border-white/5"
                )}>
                  <CreditCard className={cn("h-5 w-5", invite.paidAt ? "text-[#b08d3e]" : "text-[#6b6b6b]")} />
                  <span className={cn("text-[10px] font-bold uppercase", invite.paidAt ? "text-[#8a6d28]" : "text-[#6b6b6b]")}>Paid</span>
                  <span className="text-[#14110c] font-bold text-xs">{invite.paidAt ? format(new Date(invite.paidAt), "MMM d, yyyy") : "Unpaid"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Section - 1 Column */}
        <div className="space-y-8">
          {/* Client Card */}
          <Card className="border-white/5 bg-[#ffffff] backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-[#14110c] text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-[#b08d3e]/10 border border-[#b08d3e]/20 flex items-center justify-center text-[#b08d3e] font-black text-xl">
                  {invite.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-[#14110c] font-bold">{invite.fullName}</h4>
                  <p className="text-[#6b6b6b] text-sm">{invite.companyName}</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 text-[#14110c]">
                  <Mail className="h-4 w-4 text-[#6b6b6b]" />
                  <span className="text-sm font-medium">{invite.email}</span>
                </div>
                <div className="flex items-center gap-3 text-[#14110c]">
                  <ShieldCheck className="h-4 w-4 text-[#6b6b6b]" />
                  <span className="text-sm font-medium">Invited by: {invite.sentByAdminEmail}</span>
                </div>
              </div>

              <Separator className="bg-white/5" />

              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-widest">Platform Access</h5>
                {user ? (
                  <div className="flex items-center justify-between p-3 bg-[#b08d3e]/5 border border-[#b08d3e]/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#b08d3e]" />
                      <span className="text-[#14110c] text-sm font-bold">Account Active</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-[#b08d3e] hover:text-[#8a6d28] p-0" onClick={() => router.push(`/admin/users/${user.id}`)}>
                      View User <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl text-[#6b6b6b]">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-medium">Account not yet created</span>
                  </div>
                )}

                {subscription ? (
                  <div className="flex items-center justify-between p-3 bg-blue-600/5 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <span className="text-[#14110c] text-sm font-bold">Subscription Live</span>
                    </div>
                    <Badge className="bg-blue-600/20 text-blue-600 border-none">{subscription.status}</Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl text-[#6b6b6b]">
                    <Ban className="h-4 w-4" />
                    <span className="text-xs font-medium">No active subscription</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="border-white/5 bg-[#ffffff] backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl border-dashed border-2">
            <CardContent className="p-6 text-center space-y-4">
              <p className="text-xs text-[#6b6b6b]">Need to make changes to the pricing or plan details? Modify the proposal above or cancel it.</p>
              <Button 
                variant="link" 
                className="text-[#b08d3e] hover:text-[#8a6d28] font-bold"
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Current Proposal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <Dialog 
        open={isEditModalOpen} 
        onOpenChange={(open) => setIsEditModalOpen(open)}
      >
        <DialogContent className="bg-[#faf8f3] backdrop-blur-3xl border-white/10 sm:max-w-[1000px] rounded-[2rem] p-0 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden border flex flex-col max-h-[95vh]">
          <div className="px-6 py-5 bg-gradient-to-br from-[#14110c]/20 to-transparent border-b border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <DialogTitle className="text-2xl font-black text-[#14110c] tracking-tighter uppercase">Modify Proposal</DialogTitle>
                <DialogDescription className="text-[#6b6b6b] text-xs font-medium tracking-tight mt-0.5">
                  Update project scope and pricing for {invite.companyName}.
                </DialogDescription>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 border border-blue-500/20">
                <Edit3 className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="flex-1 px-6 py-6 bg-[#faf8f3] overflow-y-auto scrollbar-hide">
            <form id="enterprise-update-form" onSubmit={handleUpdateSubmit} className="space-y-10">
              {/* 1. Client Information */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-[#b08d3e] uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-[#b08d3e]/10 flex items-center justify-center text-[10px]">1</span>
                  Client Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Plan Name</Label>
                    <Input 
                      value={formData.planName}
                      onChange={(e) => setFormData(prev => ({ ...prev, planName: e.target.value }))}
                      className="bg-[#ffffff] border-white/5 h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm"
                      placeholder="Plan Name"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Company Name</Label>
                    <Input 
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      className="bg-[#ffffff] border-white/5 h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm"
                      placeholder="Company Name"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Full Name</Label>
                    <Input 
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="bg-[#ffffff] border-white/5 h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm"
                      placeholder="Full Name"
                      required
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Email Address</Label>
                    <Input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-[#ffffff] border-white/5 h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm"
                      placeholder="enterprise.client@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 2. Industry / Business Type */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-blue-600/10 flex items-center justify-center text-[10px]">2</span>
                  Industry / Business Type
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { label: "Restaurant / Hospitality", value: "RESTAURANT_HOSPITALITY" },
                    { label: "Jewelry", value: "JEWELRY" },
                    { label: "Fashion & Apparel", value: "FASHION_APPAREL" },
                    { label: "Beauty & Wellness", value: "BEAUTY_WELLNESS" },
                    { label: "Home & Lifestyle", value: "HOME_LIFESTYLE" },
                    { label: "Health & Fitness", value: "HEALTH_FITNESS" },
                    { label: "Corporate / Professional Services", value: "CORPORATE_PROFESSIONAL" },
                    { label: "E-commerce / Product Brand", value: "ECOMMERCE_PRODUCT" },
                    { label: "Other (Manual Input)", value: "OTHER" },
                  ].map((ind) => (
                    <div 
                      key={ind.value}
                      onClick={() => setFormData(prev => ({ ...prev, industry: ind.value }))}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer group",
                        formData.industry === ind.value 
                        ? "bg-blue-600/10 border-blue-500/40 text-blue-600" 
                        : "bg-white/5 border-white/5 text-[#6b6b6b] hover:border-white/10"
                      )}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all",
                        formData.industry === ind.value ? "border-blue-500" : "border-[#d9d4c9]"
                      )}>
                        {formData.industry === ind.value && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                      </div>
                      <span className="text-[11px] font-bold">{ind.label}</span>
                    </div>
                  ))}
                </div>
                {formData.industry === "OTHER" && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Specify Industry</Label>
                    <Input 
                      value={formData.otherIndustry}
                      onChange={(e) => setFormData(prev => ({ ...prev, otherIndustry: e.target.value }))}
                      className="bg-[#ffffff] border-white/5 h-11 rounded-xl focus-visible:ring-blue-400/50 text-[#14110c] font-bold text-sm"
                      placeholder="Enter business category..."
                      required={formData.industry === "OTHER"}
                    />
                  </motion.div>
                )}
              </div>

              {/* 3. Social Media Platforms */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-indigo-600/10 flex items-center justify-center text-[10px]">3</span>
                  Social Media Platforms
                </h3>
                <div className="flex flex-wrap gap-3">
                  {["INSTAGRAM", "FACEBOOK", "TIKTOK"].map((platform) => (
                    <div 
                      key={platform} 
                      onClick={() => togglePlatform(platform)}
                      className={cn(
                        "flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all cursor-pointer min-w-[160px]",
                        formData.socialPlatforms.includes(platform) 
                        ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-600 shadow-[0_0_20px_rgba(129,140,248,0.1)]" 
                        : "bg-white/5 border-white/5 text-[#6b6b6b] hover:border-white/10"
                      )}
                    >
                      <div className={cn(
                        "h-5 w-5 rounded-md border flex items-center justify-center transition-colors",
                        formData.socialPlatforms.includes(platform) ? "bg-indigo-600 border-indigo-500" : "border-[#d9d4c9]"
                      )}>
                        {formData.socialPlatforms.includes(platform) && <CheckSquare className="h-3 w-3 text-[#14110c]" />}
                      </div>
                      <span className="text-xs font-black tracking-widest">{platform}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Content Plan Details */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-amber-700 uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-amber-500/10 flex items-center justify-center text-[10px]">4</span>
                  Content Plan Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Posts per Month</Label>
                    <Input 
                      type="number"
                      value={formData.postsPerMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, postsPerMonth: parseInt(e.target.value) }))}
                      className="bg-[#ffffff] border-white/5 h-11 rounded-xl focus-visible:ring-amber-400/50 text-[#14110c] font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Reels per Month</Label>
                    <Input 
                      type="number"
                      value={formData.reelsPerMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, reelsPerMonth: parseInt(e.target.value) }))}
                      className="bg-[#ffffff] border-white/5 h-11 rounded-xl focus-visible:ring-amber-400/50 text-[#14110c] font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Micro Reels per Month</Label>
                    <Input 
                      type="number"
                      value={formData.microReelsPerMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, microReelsPerMonth: parseInt(e.target.value) }))}
                      className="bg-[#ffffff] border-white/5 h-11 rounded-xl focus-visible:ring-amber-400/50 text-[#14110c] font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-cyan-700 uppercase tracking-[0.25em] flex items-center gap-3">
                    <span className="h-5 w-5 rounded-md bg-cyan-600/10 flex items-center justify-center text-[10px]">5</span>
                    Additional Services
                  </h3>
                  <div className="space-y-3">
                    <div onClick={() => setFormData(prev => ({ ...prev, captionHashtags: !prev.captionHashtags }))} className={cn("flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer", formData.captionHashtags ? "bg-cyan-600/10 border-cyan-500/30" : "bg-white/5 border-white/5")}>
                      <div className="flex flex-col">
                        <span className={cn("text-xs font-bold", formData.captionHashtags ? "text-cyan-700" : "text-[#6b6b6b]")}>Caption & Hashtags</span>
                        <span className="text-[9px] text-[#6b6b6b] font-medium">Expert copywriting for all posts</span>
                      </div>
                      <div className={cn("h-5 w-10 rounded-full relative transition-colors p-1", formData.captionHashtags ? "bg-cyan-600" : "bg-[#e6e1d8]")}>
                        <div className={cn("h-3 w-3 rounded-full bg-white transition-all shadow-sm", formData.captionHashtags ? "ml-5" : "ml-0")} />
                      </div>
                    </div>

                    <div onClick={() => setFormData(prev => ({ ...prev, scheduling: !prev.scheduling }))} className={cn("flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer", formData.scheduling ? "bg-cyan-600/10 border-cyan-500/30" : "bg-white/5 border-white/5")}>
                      <div className="flex flex-col">
                        <span className={cn("text-xs font-bold", formData.scheduling ? "text-cyan-700" : "text-[#6b6b6b]")}>Auto Scheduling</span>
                        <span className="text-[9px] text-[#6b6b6b] font-medium">Automated publishing pipeline</span>
                      </div>
                      <div className={cn("h-5 w-10 rounded-full relative transition-colors p-1", formData.scheduling ? "bg-cyan-600" : "bg-[#e6e1d8]")}>
                        <div className={cn("h-3 w-3 rounded-full bg-white transition-all shadow-sm", formData.scheduling ? "ml-5" : "ml-0")} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-emerald-700 uppercase tracking-[0.25em] flex items-center gap-3">
                    <span className="h-5 w-5 rounded-md bg-emerald-400/10 flex items-center justify-center text-[10px]">6</span>
                    Pricing & Validity
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Monthly Price (USD)</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700 font-black">$</span>
                        <Input type="number" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) }))} className="bg-[#ffffff] border-white/5 h-11 pl-8 rounded-xl focus-visible:ring-emerald-400/50 text-[#14110c] font-black text-sm" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Expires In (Days)</Label>
                      <Input type="number" value={formData.expiresInDays} onChange={(e) => setFormData(prev => ({ ...prev, expiresInDays: parseInt(e.target.value) }))} className="bg-[#ffffff] border-white/5 h-11 rounded-xl focus-visible:ring-emerald-400/50 text-[#14110c] font-bold text-sm" min={1} required />
                    </div>
                  </div>
                </div>
              </div>

              {/* 8. Internal Notes */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-[#6b6b6b] uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-[#d9d4c9]/20 flex items-center justify-center text-[10px]">8</span>
                  Internal Notes (Admin Only)
                </h3>
                <textarea 
                  value={formData.internalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
                  className="w-full bg-[#ffffff] border border-white/5 rounded-2xl p-4 text-[#14110c] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#d9d4c9] min-h-[100px] placeholder:text-[#14110c]"
                  placeholder="Special instructions, priority notes, or follow-up requirements..."
                />
              </div>
            </form>
          </div>

          <div className="px-6 py-5 border-t border-white/5 bg-[#faf8f3] backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] text-[#6b6b6b] font-bold uppercase tracking-widest">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Update Authorization
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="border-white/5 bg-white/5 text-[#6b6b6b] h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 hover:text-[#14110c] transition-all">Discard</Button>
              <Button form="enterprise-update-form" type="submit" className="bg-blue-500 hover:bg-blue-600 text-[#14110c] font-black h-12 px-10 rounded-xl shadow-[0_10px_30px_rgba(59,130,246,0.3)] transition-all active:scale-95 uppercase tracking-[0.2em] text-[11px]" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="h-5 w-5 mr-3 animate-spin" /> : <ArrowRight className="h-4 w-4 mr-3 stroke-[3px]" />}
                Confirm Updates
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="bg-[#ffffff] border-white/5 rounded-3xl max-w-sm">
          <DialogHeader className="pt-4 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
            <DialogTitle className="text-xl font-bold text-[#14110c]">Cancel Invitation?</DialogTitle>
            <DialogDescription className="text-[#6b6b6b] mt-2">
              This will invalidate the current proposal and prevent the client from completing the checkout.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 p-4 pt-2 sm:flex-col">
            <Button onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending} className="bg-amber-500 hover:bg-amber-500 text-[#14110c] font-bold w-full rounded-xl h-12">
              {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Cancel Invite"}
            </Button>
            <Button variant="ghost" onClick={() => setIsCancelModalOpen(false)} className="text-[#6b6b6b] hover:text-[#14110c] w-full rounded-xl">Go Back</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#ffffff] border-white/5 rounded-3xl max-w-sm">
          <DialogHeader className="pt-4 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <Trash2 className="h-8 w-8 text-red-500" />
            </div>
            <DialogTitle className="text-xl font-bold text-[#14110c]">Delete Permanently?</DialogTitle>
            <DialogDescription className="text-[#6b6b6b] mt-2">
              This action cannot be undone. All record of this invitation and proposal will be lost forever.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 p-4 pt-2 sm:flex-col">
            <Button onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="bg-red-500 hover:bg-red-500 text-[#14110c] font-bold w-full rounded-xl h-12 shadow-[0_10px_20px_rgba(239,68,68,0.2)]">
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Permanently"}
            </Button>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} className="text-[#6b6b6b] hover:text-[#14110c] w-full rounded-xl">Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
