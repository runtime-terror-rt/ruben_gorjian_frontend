"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  RefreshCw,
  MoreHorizontal,
  Calendar,
  AlertCircle,
  Mail,
  Trash2,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Building2,
  User,
  Copy,
  Send,
  Loader2,
  ShieldCheck,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  CheckSquare,
  Camera,
  Edit3,
  FileText,
  ClipboardList,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  ColumnDef,
} from "@tanstack/react-table";

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";

// --- Types ---

type EnterpriseInvite = {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  planCode: string;
  status: "PENDING" | "VIEWED" | "SIGNED_UP" | "PAYMENT_COMPLETED" | "EXPIRED" | "CANCELED";
  proposal?: {
    planName: string;
    amount: number;
    billingCycle: string;
    currency: string;
    status: string;
    expiresAt: string;
    paidAt: string | null;
    industry?: string;
  };
  // Flat fields from detail view
  planName?: string;
  amount?: number;
  industry?: string;
  billingCycle?: string;
  currency?: string;
  socialPlatforms?: string[];
  reelsPerMonth?: number;
  microReelsPerMonth?: number;
  postsPerMonth?: number;
  proPhotoShootFrequency?: string;
  proPhotoShootLength?: string;
  captionHashtags?: boolean;
  scheduling?: boolean;
  internalNotes?: string;

  createdAt: string;
  expiresAt: string;
  viewedAt: string | null;
  signedUpAt: string | null;
  paidAt: string | null;
  sentByAdminEmail: string;
};

type BrandBriefSubmission = {
  id: string;
  restaurantName: string;
  location: string;
  businessType: string;
  createdAt: string;
  submissionDate: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  proposal?: {
    id: string;
    planCode: string;
    planName: string;
    companyName: string;
  };
};

type BrandBriefDetail = BrandBriefSubmission & {
  userId: string;
  proposalId: string;
  updatedAt: string;
  cuisineType: string;
  dietaryCertifications: string[];
  websiteUrl: string;
  instagramHandle: string;
  facebookPageUrl: string;
  tiktokHandle: string;
  onlineOrderingUrl: string;
  foodDescription: string;
  uniqueSellingPoint: string;
  customerReviews: string;
  forbiddenPhrases: string;
  preferredPhrases: string;
  captionSample1: string;
  captionSample2: string;
  captionSample3: string;
  toneAndVoice: string[];
  captionTargeting: string;
  language: string;
  signatureDishes: string[];
  signatureDishDetails: string;
  excludedItems: string;
  upcomingPromotions: string;
  hashtagStyle: string;
  confirmMinDishes: string;
  actionShotsPossible: string;
  preferredShootTime: string;
  physicalConstraints: string;
  specialNotes: string;
  clientName: string;
  restaurantNameAuth: string;
  talexiaPlan: string;
  proposal?: {
    amount: string;
    billingCycle: string;
    createdByAdminEmail: string;
  } & NonNullable<BrandBriefSubmission['proposal']>;
};

type InviteListResponse = {
  items: EnterpriseInvite[];
  total: number;
  page: number;
  pageSize: number;
};

type BrandBriefListResponse = {
  success: boolean;
  data: {
    items: BrandBriefSubmission[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// --- Helper Components ---

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  switch (s) {
    case "PAYMENT_COMPLETED":
      return (
        <Badge className="bg-lime-500/20 text-lime-400 border-lime-400/20 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-widest animate-pulse shadow-[0_0_15px_rgba(163,230,53,0.1)]">
          <CheckCircle2 className="h-3 w-3" />
          PAYMENT_COMPLETED
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-widest">
          <Send className="h-3 w-3" />
          PENDING
        </Badge>
      );
    case "VIEWED":
      return (
        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-widest">
          <Eye className="h-3 w-3" />
          VIEWED
        </Badge>
      );
    case "SIGNED_UP":
      return (
        <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/20 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-widest">
          <User className="h-3 w-3" />
          SIGNED_UP
        </Badge>
      );
    case "EXPIRED":
    case "CANCELED":
      return (
        <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-widest">
          <XCircle className="h-3 w-3" />
          {s}
        </Badge>
      );
    default:
      return <Badge variant="outline" className="px-3 py-1 uppercase text-[10px] font-black tracking-widest">{status}</Badge>;
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount);
}

// --- Main Component ---

export default function EnterprisePlanPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async (id: string, name: string) => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/brand-brief/admin/submissions/${id}/pdf`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.details || "Failed to generate PDF");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brand-brief-${name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: error.message || "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<EnterpriseInvite | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [inviteToDelete, setInviteToDelete] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInviteId, setEditingInviteId] = useState<string | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [freqError, setFreqError] = useState<string | null>(null);

  // Tabs State
  const [activeTab, setActiveTab] = useState("enterprise");

  // Brand Brief State
  const [bbPage, setBbPage] = useState(1);
  const [bbLimit] = useState(20);
  const [selectedBbId, setSelectedBbId] = useState<string | null>(null);
  const [isBbDetailsOpen, setIsBbDetailsOpen] = useState(false);

  // Form State for Create Invite
  const [formData, setFormData] = useState({
    planName: "Enterprise Growth",
    companyName: "",
    fullName: "",
    email: "",
    industry: "RESTAURANT_HOSPITALITY",
    otherIndustry: "",
    socialPlatforms: ["INSTAGRAM", "FACEBOOK", "TIKTOK"],
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

  const resetForm = () => {
    setFormData({
      planName: "Enterprise Growth",
      companyName: "",
      fullName: "",
      email: "",
      industry: "RESTAURANT_HOSPITALITY",
      otherIndustry: "",
      socialPlatforms: ["INSTAGRAM", "FACEBOOK", "TIKTOK"],
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
    setFreqError(null);
  };

  // Queries
  const invitesQuery = useQuery({
    queryKey: ["admin-invites", search, statusFilter, page],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pageSize.toString(),
        });
        if (search) params.append("search", search);
        if (statusFilter && statusFilter !== "ALL") {
          params.append("status", statusFilter);
        }

        // Using the singular proxy route with invites subpath
        const response = await apiGet<InviteListResponse>(`/api/admin/enterprise-plan/invites?${params.toString()}`);
        return response;
      } catch (err) {
        console.error("Enterprise Plan GET Error:", err);
        throw err;
      }
    },
  });

  // Details Query
  const inviteDetailsQuery = useQuery({
    queryKey: ["admin-invite-details", selectedInvite?.id],
    queryFn: () => apiGet<{ invite: EnterpriseInvite }>(`/api/admin/enterprise-plan/invites/${selectedInvite?.id}/details`),
    enabled: !!selectedInvite?.id && isDetailsModalOpen,
  });

  // Brand Brief Queries
  const brandBriefsQuery = useQuery({
    queryKey: ["admin-brand-briefs", bbPage, bbLimit],
    queryFn: () => apiGet<BrandBriefListResponse>(`/api/brand-brief/admin/submissions?page=${bbPage}&limit=${bbLimit}`),
    enabled: activeTab === "brand-brief",
  });

  const bbDetailsQuery = useQuery({
    queryKey: ["admin-brand-brief-details", selectedBbId],
    queryFn: () => apiGet<{ success: boolean; data?: BrandBriefDetail; item?: BrandBriefDetail }>(`/api/brand-brief/admin/submissions/${selectedBbId}`),
    enabled: !!selectedBbId && isBbDetailsOpen,
  });

  const details = bbDetailsQuery.data?.data || bbDetailsQuery.data?.item;

  // Mutations
  const createInviteMutation = useMutation({
    mutationFn: (data: typeof formData) => apiPost("/api/admin/enterprise-plan/invites", data),
    onSuccess: () => {
      toast({ title: "Enterprise Request Submitted Successfully" });
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["enterprise-invites"] });
      setFormData({
        planName: "Enterprise Growth",
        companyName: "",
        fullName: "",
        email: "",
        industry: "RESTAURANT_HOSPITALITY",
        otherIndustry: "",
        socialPlatforms: ["INSTAGRAM", "FACEBOOK", "TIKTOK"],
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
      setFreqError(null);
    },
    onError: (error: any) => {
      toast({
        title: "Create failed",
        description: error.message || "Request failed",
        variant: "destructive"
      });
    }
  });

  const resendMutation = useMutation({
    mutationFn: (id: string) => apiPost(`/api/admin/enterprise-plan/invites/${id}/resend`, {}),
    onSuccess: () => {
      toast({ title: "Invite resent" });
      queryClient.invalidateQueries({ queryKey: ["enterprise-invites"] });
    },
    onError: (error: any) => {
      toast({
        title: "Resend failed",
        description: error.message || "Unable to resend invite",
        variant: "destructive"
      });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiPatch(`/api/admin/enterprise-plan/invites/${id}/cancel`, {}),
    onSuccess: () => {
      toast({ title: "Invite canceled" });
      queryClient.invalidateQueries({ queryKey: ["enterprise-invites"] });
    },
    onError: (error: any) => {
      toast({
        title: "Cancel failed",
        description: error.message || "Unable to cancel invite",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/admin/enterprise-plan/invites/${id}/permanent`),
    onSuccess: () => {
      toast({ title: "Permanently deleted" });
      setIsConfirmDeleteOpen(false);
      setInviteToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["enterprise-invites"] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => apiPatch(`/api/admin/enterprise-plan/invites/${editingInviteId}`, payload),
    onSuccess: () => {
      toast({ title: "Proposal updated successfully" });
      setIsEditModalOpen(false);
      setEditingInviteId(null);
      queryClient.invalidateQueries({ queryKey: ["enterprise-invites"] });
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  });

  const handleEditClick = async (inviteId: string) => {
    setEditingInviteId(inviteId);
    setIsDetailLoading(true);
    try {
      const response = await apiGet<any>(`/api/admin/enterprise-plan/invites/${inviteId}/details`);
      const { invite, proposal } = response;

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
      setIsEditModalOpen(true);
    } catch (err: any) {
      toast({ title: "Fetch failed", description: "Could not load invite details", variant: "destructive" });
    } finally {
      setIsDetailLoading(false);
    }
  };

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

  // Table Columns
  const columns: ColumnDef<EnterpriseInvite>[] = [
    {
      accessorKey: "companyName",
      header: "Client / Company",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-lime-400 group-hover:bg-lime-400 group-hover:text-slate-950 transition-colors">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white tracking-tight">{row.original.companyName}</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{row.original.fullName}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "proposal.industry",
      header: "Industry",
      cell: ({ row }) => {
        const industry = row.original.proposal?.industry || row.original.industry || "—";
        const formattedIndustry = industry.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        return (
          <div className="flex items-center">
            <span className="text-slate-200 font-bold text-[13px] tracking-tight">
              {formattedIndustry}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Contact Details",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Mail className="h-3 w-3 text-slate-500" />
            <span className="text-sm">{row.original.email}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5">{row.original.planCode}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "proposal.planName",
      header: "Plan & Pricing",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-slate-200 font-bold text-sm">{row.original.proposal?.planName || row.original.planName}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-lime-400 font-black tracking-wider">
              {formatAmount(row.original.proposal?.amount || row.original.amount || 0, row.original.proposal?.currency || row.original.currency || "usd")}
            </span>
            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest border-l border-slate-800 pl-2">
              {row.original.proposal?.billingCycle || row.original.billingCycle}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Timeline",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Send className="h-3 w-3" />
            <span>Sent: {formatDate(row.original.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400/70 text-[11px] mt-0.5">
            <Clock className="h-3 w-3" />
            <span>Expires: {formatDate(row.original.expiresAt)}</span>
          </div>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const invite = row.original;
        const copyInviteLink = () => {
          const url = `${window.location.origin}/enterprise-plan/accept?token=${invite.id}`;
          navigator.clipboard.writeText(url);
          toast({ title: "Invite link copied" });
        };

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 w-9 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 rounded-2xl p-2 shadow-2xl">
                <DropdownMenuLabel className="text-[10px] uppercase font-bold text-slate-500 tracking-widest px-3 py-2">Management</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push(`/admin/enterprise-plan/${invite.id}`)}
                  className="rounded-lg py-2.5 cursor-pointer focus:bg-slate-800 text-white"
                >
                  <Eye className="mr-3 h-4 w-4 text-blue-400" />
                  <span className="font-medium">View Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(invite.id);
                  }}
                  className="rounded-lg py-2.5 cursor-pointer focus:bg-slate-800 text-white"
                  disabled={invite.status === "PAYMENT_COMPLETED"}
                >
                  {isDetailLoading && editingInviteId === invite.id ? (
                    <Loader2 className="mr-3 h-4 w-4 animate-spin text-lime-400" />
                  ) : (
                    <Edit3 className="mr-3 h-4 w-4 text-lime-400" />
                  )}
                  <span className="font-medium">Edit Proposal</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    copyInviteLink();
                  }}
                  className="rounded-lg py-2.5 cursor-pointer focus:bg-slate-800 text-white"
                >
                  <Copy className="mr-3 h-4 w-4 text-lime-400" />
                  <span className="font-medium">Copy Invite Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    resendMutation.mutate(invite.id);
                  }}
                  className="rounded-lg py-2.5 cursor-pointer focus:bg-slate-800 text-white"
                  disabled={invite.status === "PAYMENT_COMPLETED" || invite.status === "CANCELED"}
                >
                  <Mail className="mr-3 h-4 w-4 text-amber-400" />
                  <span className="font-medium">Resend Email</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-800 my-1" />

                {invite.status !== "CANCELED" && invite.status !== "PAYMENT_COMPLETED" && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelMutation.mutate(invite.id);
                    }}
                    className="rounded-lg py-2.5 cursor-pointer focus:bg-amber-500/10 text-amber-400"
                  >
                    <XCircle className="mr-3 h-4 w-4" />
                    <span className="font-medium">Cancel Invite</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setInviteToDelete(invite.id);
                    setIsConfirmDeleteOpen(true);
                  }}
                  className="rounded-lg py-2.5 cursor-pointer focus:bg-red-500/10 text-red-400"
                >
                  <Trash2 className="mr-3 h-4 w-4" />
                  <span className="font-medium">Delete Permanently</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: invitesQuery.data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare final data
    const submissionData = {
      ...formData,
      industry: formData.industry === "OTHER" ? formData.otherIndustry : formData.industry,
      proPhotoShootLength: formData.proPhotoShootLength === "Custom" ? formData.otherPhotoShootLength : formData.proPhotoShootLength
    };

    // Remove internal manual input fields
    const { otherIndustry, otherPhotoShootLength, ...finalData } = submissionData;

    createInviteMutation.mutate(finalData as any);
  };

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      socialPlatforms: prev.socialPlatforms.includes(platform)
        ? prev.socialPlatforms.filter(p => p !== platform)
        : [...prev.socialPlatforms, platform]
    }));
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-2xl bg-lime-400 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(163,230,53,0.3)]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Enterprise Plan</h1>
          </div>
          <p className="text-slate-400 text-sm font-medium ml-1">
            Manage custom enterprise proposals and brand brief submissions.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList className="bg-slate-900/50 border border-white/5 p-1 rounded-2xl h-14">
            <TabsTrigger 
              value="enterprise" 
              className="rounded-xl px-6 h-full data-[state=active]:bg-lime-400 data-[state=active]:text-slate-950 font-black uppercase text-[10px] tracking-widest transition-all"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Enterprise Plan
            </TabsTrigger>
            <TabsTrigger 
              value="brand-brief" 
              className="rounded-xl px-6 h-full data-[state=active]:bg-lime-400 data-[state=active]:text-slate-950 font-black uppercase text-[10px] tracking-widest transition-all"
            >
              <FileText className="h-4 w-4 mr-2" />
              Brand Brief
            </TabsTrigger>
          </TabsList>

          {activeTab === "enterprise" && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800 h-11 px-5 rounded-xl font-bold transition-all active:scale-95"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["enterprise-invites"] })}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${invitesQuery.isFetching ? "animate-spin" : ""}`} />
                Sync Data
              </Button>
              <Button
                className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-black h-11 px-6 rounded-xl shadow-[0_10px_20px_rgba(163,230,53,0.2)] transition-all active:scale-95"
                onClick={() => {
                  resetForm();
                  setIsCreateModalOpen(true);
                }}
              >
                <Plus className="h-5 w-5 mr-2 stroke-[3px]" />
                New Proposal
              </Button>
            </div>
          )}
          {activeTab === "brand-brief" && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800 h-11 px-5 rounded-xl font-bold transition-all active:scale-95"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-brand-briefs"] })}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${brandBriefsQuery.isFetching ? "animate-spin" : ""}`} />
                Refresh List
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="enterprise" className="space-y-8 mt-0 outline-none">
          {/* Main Content Area */}
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-slate-900/60 p-2 rounded-[1.5rem] border border-white/5 backdrop-blur-md">
              <div className="relative flex-1 w-full lg:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search client pipeline..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-11 bg-transparent border-none focus-visible:ring-0 h-10 text-sm text-slate-200 placeholder:text-slate-600 font-medium"
                />
              </div>
              <div className="flex items-center gap-2 pr-2 w-full lg:w-auto">
                <div className="h-6 w-[1px] bg-slate-800 mx-2 hidden lg:block" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-slate-800/80 border-white/5 h-9 w-full lg:w-44 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 px-3 outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="PENDING">PENDING</option>
                  <option value="VIEWED">VIEWED</option>
                  <option value="SIGNED_UP">SIGNED_UP</option>
                  <option value="PAYMENT_COMPLETED">PAYMENT_COMPLETED</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="CANCELED">CANCELED</option>
                </select>
              </div>
            </div>

            {/* Table Container */}
            <Card className="border-white/5 bg-slate-950/20 backdrop-blur-xl overflow-hidden rounded-[2rem] shadow-2xl">
              <div className="overflow-x-auto scrollbar-hide">
                <Table>
                  <TableHeader className="bg-slate-900/60 border-b border-white/5">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="text-slate-600 py-5 px-6 font-bold uppercase text-[9px] tracking-[0.2em] text-center first:text-left">
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {invitesQuery.isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-white/5 animate-pulse hover:bg-transparent">
                          <TableCell colSpan={columns.length} className="py-8 px-6">
                            <div className="h-12 bg-white/5 rounded-2xl w-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : invitesQuery.isError ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={columns.length} className="h-80 text-center">
                          <div className="flex flex-col items-center justify-center gap-4">
                            <div className="h-20 w-20 rounded-3xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 rotate-12">
                              <AlertCircle className="h-10 w-10 text-rose-500 -rotate-12" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-white font-black text-xl tracking-tight">Sync Failure</p>
                              <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">
                            {(invitesQuery.error as any)?.message || "The neural link to the backend was interrupted unexpectedly."}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="mt-2 border-slate-800 bg-slate-900/50 text-slate-300 rounded-xl hover:bg-white hover:text-slate-950 transition-all font-black px-6 uppercase text-[10px] tracking-widest"
                          onClick={() => invitesQuery.refetch()}
                        >
                          <RefreshCw className="h-3 w-3 mr-2" />
                          Reconnect
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (invitesQuery.data?.items ?? []).length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-white/5 hover:bg-white/[0.03] transition-all group border-b last:border-b-0 cursor-pointer"
                      onClick={() => router.push(`/admin/enterprise-plan/${row.original.id}`)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-6 px-6 text-center first:text-left">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={columns.length} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="h-20 w-20 rounded-3xl bg-slate-900 flex items-center justify-center border border-white/5 shadow-inner">
                          <Building2 className="h-10 w-10 text-slate-800" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-white font-black text-xl tracking-tight">Pipeline Empty</p>
                          <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">Add your first high-value client to begin tracking their lifecycle.</p>
                        </div>
                        <Button
                          variant="outline"
                          className="mt-2 border-slate-800 bg-slate-900/50 text-slate-300 rounded-xl hover:bg-slate-800 hover:text-white transition-all font-bold px-6"
                          onClick={() => {
                            setSearch("");
                            setStatusFilter("ALL");
                          }}
                        >
                          Reset Filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between p-6 border-t border-white/5 bg-black/40">
            <div className="flex items-center gap-4">
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
                Live Feed: {invitesQuery.data?.total ?? 0} Global Records
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-slate-900/50 border-slate-800 h-9 px-4 rounded-xl transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white"
              >
                Prev
              </Button>
              <div className="flex items-center gap-2 px-3 h-9 bg-slate-950 border border-white/5 rounded-xl text-[11px] font-black text-white">
                <span className="text-lime-400">{page}</span>
                <span className="opacity-20">/</span>
                <span>{Math.ceil((invitesQuery.data?.total ?? 0) / pageSize) || 1}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil((invitesQuery.data?.total ?? 0) / pageSize)}
                className="bg-slate-900/50 border-slate-800 h-9 px-4 rounded-xl transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
          </div>
        </TabsContent>

        <TabsContent value="brand-brief" className="space-y-8 mt-0 outline-none">
          <Card className="border-white/5 bg-slate-950/20 backdrop-blur-xl overflow-hidden rounded-[2rem] shadow-2xl">
            <div className="overflow-x-auto scrollbar-hide">
              <Table>
                <TableHeader className="bg-slate-900/60 border-b border-white/5">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-slate-600 py-5 px-6 font-bold uppercase text-[9px] tracking-[0.2em] text-left">Restaurant / Brand</TableHead>
                    <TableHead className="text-slate-600 py-5 px-6 font-bold uppercase text-[9px] tracking-[0.2em] text-center">Location</TableHead>
                    <TableHead className="text-slate-600 py-5 px-6 font-bold uppercase text-[9px] tracking-[0.2em] text-center">Business Type</TableHead>
                    <TableHead className="text-slate-600 py-5 px-6 font-bold uppercase text-[9px] tracking-[0.2em] text-center">Submission Date</TableHead>
                    <TableHead className="text-slate-600 py-5 px-6 font-bold uppercase text-[9px] tracking-[0.2em] text-center">User</TableHead>
                    <TableHead className="text-slate-600 py-5 px-6 font-bold uppercase text-[9px] tracking-[0.2em] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brandBriefsQuery.isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-white/5 animate-pulse">
                        <TableCell colSpan={6} className="py-8 px-6">
                          <div className="h-12 bg-white/5 rounded-2xl w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : brandBriefsQuery.data?.data?.items?.length ? (
                    brandBriefsQuery.data.data.items.map((bb) => (
                      <TableRow key={bb.id} className="border-white/5 hover:bg-white/[0.03] transition-all group border-b last:border-b-0">
                        <TableCell className="py-6 px-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-white tracking-tight">{bb.restaurantName}</span>
                            <span className="text-[10px] text-lime-400 font-bold uppercase tracking-wider">{bb.proposal?.planName || "Enterprise"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-6 text-center text-slate-300 text-sm">{bb.location}</TableCell>
                        <TableCell className="py-6 px-6 text-center text-slate-300 text-sm">{bb.businessType}</TableCell>
                        <TableCell className="py-6 px-6 text-center text-slate-400 text-xs">{formatDate(bb.submissionDate)}</TableCell>
                        <TableCell className="py-6 px-6 text-center">
                          <div className="flex flex-col">
                            <span className="text-slate-200 font-medium text-sm">{bb.user.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{bb.user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-6 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl"
                            onClick={() => {
                              setSelectedBbId(bb.id);
                              setIsBbDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-80 text-center text-slate-500">No brand brief submissions found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* BB Pagination Footer */}
            <div className="flex items-center justify-between p-6 border-t border-white/5 bg-black/40">
              <div className="flex items-center gap-4">
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Total Submissions: {brandBriefsQuery.data?.data?.total ?? 0}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBbPage(p => Math.max(1, p - 1))}
                  disabled={bbPage === 1}
                  className="bg-slate-900/50 border-slate-800 h-9 px-4 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white"
                >
                  Prev
                </Button>
                <div className="text-[11px] font-black text-white px-3">
                  {bbPage} / {brandBriefsQuery.data?.data?.totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBbPage(p => p + 1)}
                  disabled={bbPage >= (brandBriefsQuery.data?.data?.totalPages || 1)}
                  className="bg-slate-900/50 border-slate-800 h-9 px-4 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white"
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- Modals & Dialogs --- */}

      {/* Create Invite Modal */}
      <Dialog
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
        }}
      >
        <DialogContent className="bg-slate-950/95 backdrop-blur-3xl border-white/10 sm:max-w-[1000px] rounded-[2rem] p-0 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden border flex flex-col max-h-[95vh]">
          <div className="px-6 py-5 bg-gradient-to-br from-slate-800/20 to-transparent border-b border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/5 blur-[100px] pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <DialogTitle className="text-2xl font-black text-white tracking-tighter uppercase">Enterprise Proposal Forge</DialogTitle>
                <DialogDescription className="text-slate-500 text-xs font-medium tracking-tight mt-0.5">
                  Engineer a high-performance custom plan for priority enterprise clients.
                </DialogDescription>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-lime-400/10 flex items-center justify-center text-lime-400 border border-lime-400/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="flex-1 px-6 py-6 bg-slate-950/40 overflow-y-auto">
            <form id="enterprise-proposal-form" onSubmit={handleCreateSubmit} className="space-y-10">

              {/* 1. Client Information */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-lime-400 uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-lime-400/10 flex items-center justify-center text-[10px]">1</span>
                  Client Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Plan Name</Label>
                    <Input
                      value={formData.planName}
                      onChange={(e) => setFormData(prev => ({ ...prev, planName: e.target.value }))}
                      className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-lime-400/50 text-white font-bold text-sm"
                      placeholder="Enter PlanName"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Company Name</Label>
                    <Input
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-lime-400/50 text-white font-bold text-sm"
                      placeholder="Enter CompanyName"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Full Name</Label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-lime-400/50 text-white font-bold text-sm"
                      placeholder="Enter FullName"
                      required
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Email Address</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-lime-400/50 text-white font-bold text-sm"
                      placeholder=" Enter Email"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 2. Industry / Business Type */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-blue-400/10 flex items-center justify-center text-[10px]">2</span>
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
                          ? "bg-blue-400/10 border-blue-400/40 text-blue-400"
                          : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10"
                      )}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all",
                        formData.industry === ind.value ? "border-blue-400" : "border-slate-700"
                      )}>
                        {formData.industry === ind.value && <div className="h-2 w-2 rounded-full bg-blue-400" />}
                      </div>
                      <span className="text-[11px] font-bold">{ind.label}</span>
                    </div>
                  ))}
                </div>
                {formData.industry === "OTHER" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1.5"
                  >
                    <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Specify Industry</Label>
                    <Input
                      value={formData.otherIndustry}
                      onChange={(e) => setFormData(prev => ({ ...prev, otherIndustry: e.target.value }))}
                      className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-blue-400/50 text-white font-bold text-sm"
                      placeholder="Enter business category..."
                      required={formData.industry === "OTHER"}
                    />
                  </motion.div>
                )}
              </div>

              {/* 3. Social Media Platforms */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-indigo-400/10 flex items-center justify-center text-[10px]">3</span>
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
                          ? "bg-indigo-400/10 border-indigo-400/40 text-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.1)]"
                          : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10"
                      )}
                    >
                      <div className={cn(
                        "h-5 w-5 rounded-md border flex items-center justify-center transition-colors",
                        formData.socialPlatforms.includes(platform) ? "bg-indigo-400 border-indigo-400" : "border-slate-700"
                      )}>
                        {formData.socialPlatforms.includes(platform) && <CheckSquare className="h-3 w-3 text-slate-950" />}
                      </div>
                      <span className="text-xs font-black tracking-widest">{platform}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Content Plan Details */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-amber-400 uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-amber-400/10 flex items-center justify-center text-[10px]">4</span>
                  Content Plan Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Posts per Month</Label>
                    <Input
                      type="number"
                      value={formData.postsPerMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, postsPerMonth: parseInt(e.target.value) }))}
                      className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-amber-400/50 text-white font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Reels per Month</Label>
                    <Input
                      type="number"
                      value={formData.reelsPerMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, reelsPerMonth: parseInt(e.target.value) }))}
                      className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-amber-400/50 text-white font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Micro Reels per Month</Label>
                    <Input
                      type="number"
                      value={formData.microReelsPerMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, microReelsPerMonth: parseInt(e.target.value) }))}
                      className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-amber-400/50 text-white font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Production Details */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-rose-400 uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-rose-400/10 flex items-center justify-center text-[10px]">5</span>
                  Production Details
                </h3>

                <div className="space-y-4">
                  <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Photo Shoot Frequency</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["None", "Every 3 Months", "Every 2 Months", "Monthly"].map((freq) => (
                      <div
                        key={freq}
                        onClick={() => setFormData(prev => ({ ...prev, proPhotoShootFrequency: freq }))}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer text-center",
                          formData.proPhotoShootFrequency === freq
                            ? "bg-rose-400/10 border-rose-400/40 text-rose-400"
                            : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10"
                        )}
                      >
                        <Calendar className={cn("h-5 w-5 mb-2", formData.proPhotoShootFrequency === freq ? "text-rose-400" : "text-slate-600")} />
                        <span className="text-[10px] font-black uppercase tracking-tight">{freq}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Photo Shoot Length</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {["0", "1 Hour", "1.5 Hours", "3 Hours", "Custom"].map((len) => (
                      <div
                        key={len}
                        onClick={() => setFormData(prev => ({ ...prev, proPhotoShootLength: len }))}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer text-center",
                          formData.proPhotoShootLength === len
                            ? "bg-rose-400/10 border-rose-400/40 text-rose-400"
                            : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10"
                        )}
                      >
                        <Clock className={cn("h-5 w-5 mb-2", formData.proPhotoShootLength === len ? "text-rose-400" : "text-slate-600")} />
                        <span className="text-[10px] font-black uppercase tracking-tight">{len}</span>
                      </div>
                    ))}
                  </div>
                  {formData.proPhotoShootLength === "Custom" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1.5"
                    >
                      <Input
                        value={formData.otherPhotoShootLength}
                        onChange={(e) => setFormData(prev => ({ ...prev, otherPhotoShootLength: e.target.value }))}
                        className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-rose-400/50 text-white font-bold text-sm"
                        placeholder="e.g. 4 Hours, 8 Hours..."
                        required={formData.proPhotoShootLength === "Custom"}
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* 6. Additional Services */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.25em] flex items-center gap-3">
                    <span className="h-5 w-5 rounded-md bg-cyan-400/10 flex items-center justify-center text-[10px]">6</span>
                    Additional Services
                  </h3>
                  <div className="space-y-3">
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, captionHashtags: !prev.captionHashtags }))}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                        formData.captionHashtags ? "bg-cyan-400/10 border-cyan-400/30" : "bg-white/5 border-white/5"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className={cn("text-xs font-bold", formData.captionHashtags ? "text-cyan-400" : "text-slate-400")}>Caption & Hashtags</span>
                        <span className="text-[9px] text-slate-600 font-medium">Expert copywriting for all posts</span>
                      </div>
                      <div className={cn(
                        "h-5 w-10 rounded-full relative transition-colors p-1",
                        formData.captionHashtags ? "bg-cyan-400" : "bg-slate-800"
                      )}>
                        <div className={cn(
                          "h-3 w-3 rounded-full bg-white transition-all shadow-sm",
                          formData.captionHashtags ? "ml-5" : "ml-0"
                        )} />
                      </div>
                    </div>

                    <div
                      onClick={() => setFormData(prev => ({ ...prev, scheduling: !prev.scheduling }))}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                        formData.scheduling ? "bg-cyan-400/10 border-cyan-400/30" : "bg-white/5 border-white/5"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className={cn("text-xs font-bold", formData.scheduling ? "text-cyan-400" : "text-slate-400")}>Auto Scheduling</span>
                        <span className="text-[9px] text-slate-600 font-medium">Automated publishing pipeline</span>
                      </div>
                      <div className={cn(
                        "h-5 w-10 rounded-full relative transition-colors p-1",
                        formData.scheduling ? "bg-cyan-400" : "bg-slate-800"
                      )}>
                        <div className={cn(
                          "h-3 w-3 rounded-full bg-white transition-all shadow-sm",
                          formData.scheduling ? "ml-5" : "ml-0"
                        )} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. Pricing & Validity */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.25em] flex items-center gap-3">
                    <span className="h-5 w-5 rounded-md bg-emerald-400/10 flex items-center justify-center text-[10px]">7</span>
                    Pricing & Validity
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Monthly Price (USD)</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-black">$</span>
                        <Input
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                          className="bg-slate-900/50 border-white/5 h-11 pl-8 rounded-xl focus-visible:ring-emerald-400/50 text-white font-black text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Expires In (Days)</Label>
                      <Input
                        type="number"
                        value={formData.expiresInDays}
                        onChange={(e) => setFormData(prev => ({ ...prev, expiresInDays: parseInt(e.target.value) }))}
                        className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-emerald-400/50 text-white font-bold text-sm"
                        min={1}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 8. Internal Notes */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-slate-400/10 flex items-center justify-center text-[10px]">8</span>
                  Internal Notes (Admin Only)
                </h3>
                <textarea
                  value={formData.internalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 min-h-[100px] placeholder:text-slate-700"
                  placeholder="Special instructions, priority notes, or follow-up requirements..."
                />
              </div>

            </form>
          </div>

          <div className="px-6 py-5 border-t border-white/5 bg-slate-950/80 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Secure Proposal Dispatch
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="border-white/5 bg-white/5 text-slate-400 h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 hover:text-white transition-all"
              >
                Discard
              </Button>
              <Button
                form="enterprise-proposal-form"
                type="submit"
                className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-black h-12 px-10 rounded-xl shadow-[0_10px_30px_rgba(163,230,53,0.3)] transition-all active:scale-95 uppercase tracking-[0.2em] text-[11px]"
                disabled={createInviteMutation.isPending}
              >
                {createInviteMutation.isPending ? (
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-3 stroke-[3px]" />
                )}
                Authorize & Send Proposal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="bg-slate-950/95 backdrop-blur-3xl border-white/10 sm:max-w-[850px] rounded-[2rem] p-0 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden border">
          {inviteDetailsQuery.isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <Loader2 className="h-10 w-10 text-lime-400 animate-spin" />
                <div className="absolute inset-0 blur-xl bg-lime-400/20 animate-pulse" />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Synchronizing Data...</p>
            </div>
          ) : inviteDetailsQuery.data?.invite ? (
            (() => {
              const invite = inviteDetailsQuery.data.invite;
              return (
                <div className="flex flex-col">
                  {/* Compact Header */}
                  <div className="p-8 bg-gradient-to-br from-slate-800/20 to-transparent border-b border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(163,230,53,0.05),transparent)] pointer-events-none" />
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lime-400">
                          <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-white tracking-tight">{invite.companyName}</h2>
                          <div className="flex items-center gap-3 text-slate-500 font-bold uppercase tracking-widest text-[9px] mt-0.5">
                            <span>{invite.fullName}</span>
                            <div className="h-1 w-1 rounded-full bg-slate-800" />
                            <span>{invite.email}</span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={invite.status} />
                    </div>
                  </div>

                  {/* Body - Grid Layout to avoid scroll */}
                  <div className="p-8 grid grid-cols-1 md:grid-cols-5 gap-8 bg-slate-950/40">
                    {/* Lifecycle - Left Column */}
                    <div className="md:col-span-2 space-y-6">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Activity Lifecycle</h3>
                      <div className="space-y-4 relative">
                        <div className="absolute top-2 left-5 bottom-2 w-[1px] bg-slate-800" />
                        {[
                          { id: "PENDING", label: "ISSUED", date: invite.createdAt, icon: Send },
                          { id: "VIEWED", label: "VIEWED", date: invite.viewedAt, icon: Eye },
                          { id: "SIGNED_UP", label: "JOINED", date: invite.signedUpAt, icon: User },
                          { id: "PAYMENT_COMPLETED", label: "PAID", date: invite.paidAt, icon: CheckCircle2 },
                        ].map((step, idx) => {
                          const isActive = !!step.date;
                          return (
                            <div key={idx} className="flex gap-4 items-center relative z-10">
                              <div className={cn(
                                "h-10 w-10 rounded-lg flex items-center justify-center border transition-all",
                                isActive ? "bg-lime-400/10 text-lime-400 border-lime-400/20" : "bg-slate-900 text-slate-700 border-white/5"
                              )}>
                                <step.icon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className={cn("text-[9px] font-black uppercase tracking-widest", isActive ? "text-white" : "text-slate-700")}>{step.label}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{step.date ? formatDate(step.date) : "Pending"}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Proposal Details - Right Column */}
                    <div className="md:col-span-3 space-y-6">
                      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[9px] font-black text-lime-400 uppercase tracking-widest mb-1">Current Proposal</p>
                            <h3 className="text-xl font-black text-white tracking-tight">{invite.proposal?.planName || invite.planName}</h3>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-white tracking-tighter">
                              {formatAmount(invite.proposal?.amount || invite.amount || 0, invite.proposal?.currency || invite.currency || "usd")}
                            </p>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-0.5">/ {invite.proposal?.billingCycle || invite.billingCycle}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Social Content</p>
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-400">Monthly Posts</span>
                                <span className="text-white font-bold">{invite.postsPerMonth || 0}</span>
                              </div>
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-400">Monthly Reels</span>
                                <span className="text-white font-bold">{invite.reelsPerMonth || 0}</span>
                              </div>
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-400">Micro Content</span>
                                <span className="text-white font-bold">{invite.microReelsPerMonth || 0}</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Shoot Logistics</p>
                            <div className="space-y-1">
                              <p className="text-[11px] text-white font-bold">{invite.proPhotoShootFrequency || "N/A"}</p>
                              <p className="text-[10px] text-slate-500">{invite.proPhotoShootLength || "N/A"} session</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Industry / Category</p>
                            <p className="text-sm text-white font-bold tracking-tight">{invite.industry?.replace(/_/g, ' ') || "GENERAL"}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-2">
                          <div className={cn("flex items-center gap-2 text-[9px] font-black uppercase tracking-widest", invite.captionHashtags ? "text-lime-400" : "text-slate-700")}>
                            <div className={cn("h-1.5 w-1.5 rounded-full", invite.captionHashtags ? "bg-lime-400" : "bg-slate-800")} /> AI Captions
                          </div>
                          <div className={cn("flex items-center gap-2 text-[9px] font-black uppercase tracking-widest", invite.scheduling ? "text-indigo-400" : "text-slate-700")}>
                            <div className={cn("h-1.5 w-1.5 rounded-full", invite.scheduling ? "bg-indigo-400" : "bg-slate-800")} /> Auto Scheduling
                          </div>
                        </div>

                        {invite.internalNotes && (
                          <div className="pt-4 border-t border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Internal Admin Notes</p>
                            <p className="text-[11px] text-slate-400 leading-relaxed italic">"{invite.internalNotes}"</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between px-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                        <span>Ref: {invite.planCode}</span>
                        <span>Created By: {invite.sentByAdminEmail?.split('@')[0]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-8 pt-4 border-t border-white/5 bg-slate-950/60 backdrop-blur-md flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setIsDetailsModalOpen(false)}
                      className="border-white/10 bg-white/5 text-slate-400 h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 hover:text-white transition-all"
                    >
                      Close Details
                    </Button>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="p-20 text-center">
              <p className="text-white font-bold">Failed to load proposal details.</p>
              <Button onClick={() => setIsDetailsModalOpen(false)} className="mt-4">Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="bg-[#0a0a0f] border border-white/5 rounded-[2rem] p-0 sm:max-w-[420px] shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Red glow accent top bar */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />

          <div className="p-8 flex flex-col items-center text-center gap-6">
            {/* Icon */}
            <div className="relative">
              <div className="absolute inset-0 blur-2xl bg-red-500/20 rounded-full" />
              <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-red-500/20 to-rose-900/30 flex items-center justify-center border border-red-500/30 rotate-3">
                <Trash2 className="h-9 w-9 text-red-400 -rotate-3" />
              </div>
            </div>

            {/* Text */}
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-black text-white tracking-tight">
                Permanently Delete?
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-sm font-medium leading-relaxed">
                This will permanently erase the enterprise invite record and all associated proposal data.
                <br />
                <span className="text-red-400 font-bold mt-1 inline-block">This action cannot be undone.</span>
              </DialogDescription>
            </div>
          </div>

          {/* Buttons */}
          <div className="px-8 pb-8 flex flex-col gap-3">
            <button
              onClick={() => inviteToDelete && deleteMutation.mutate(inviteToDelete)}
              disabled={deleteMutation.isPending}
              className="w-full h-14 rounded-2xl font-black text-[13px] tracking-wider uppercase transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_8px_30px_rgba(220,38,38,0.35)]"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 stroke-[3px]" />
                  <span>Delete Permanently</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsConfirmDeleteOpen(false)}
              className="w-full h-12 rounded-2xl font-bold text-[12px] tracking-wider uppercase transition-all active:scale-95 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 hover:border-white/10"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Proposal Modal */}
      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => setIsEditModalOpen(open)}
      >
        <DialogContent className="bg-slate-950/95 backdrop-blur-3xl border-white/10 sm:max-w-[1000px] rounded-[2rem] p-0 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden border flex flex-col max-h-[95vh]">
          <div className="px-6 py-5 bg-gradient-to-br from-slate-800/20 to-transparent border-b border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 blur-[100px] pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <DialogTitle className="text-2xl font-black text-white tracking-tighter uppercase">Modify Proposal</DialogTitle>
                <DialogDescription className="text-slate-500 text-xs font-medium tracking-tight mt-0.5">
                  Update project scope and pricing for priority enterprise clients.
                </DialogDescription>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-400/10 flex items-center justify-center text-blue-400 border border-blue-400/20">
                <Edit3 className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="flex-1 px-6 py-6 bg-slate-950/40 overflow-y-auto scrollbar-hide">
            <form id="enterprise-update-form" onSubmit={handleUpdateSubmit} className="space-y-10">
              {/* 1. Client Information */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-lime-400 uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-lime-400/10 flex items-center justify-center text-[10px]">1</span>
                  Client Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Plan Name</Label>
                    <Input
                      value={formData.planName}
                      onChange={(e) => setFormData(prev => ({ ...prev, planName: e.target.value }))}
                      className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-lime-400/50 text-white font-bold text-sm"
                      placeholder="Enterprise Growth"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Company Name</Label>
                    <Input
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-lime-400/50 text-white font-bold text-sm"
                      placeholder="Company Name"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Full Name</Label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-lime-400/50 text-white font-bold text-sm"
                      placeholder="Full Name"
                      required
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Email Address</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-lime-400/50 text-white font-bold text-sm"
                      placeholder="enterprise.client@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 2. Industry / Business Type */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-blue-400/10 flex items-center justify-center text-[10px]">2</span>
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
                          ? "bg-blue-400/10 border-blue-400/40 text-blue-400"
                          : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10"
                      )}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all",
                        formData.industry === ind.value ? "border-blue-400" : "border-slate-700"
                      )}>
                        {formData.industry === ind.value && <div className="h-2 w-2 rounded-full bg-blue-400" />}
                      </div>
                      <span className="text-[11px] font-bold">{ind.label}</span>
                    </div>
                  ))}
                </div>
                {formData.industry === "OTHER" && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Specify Industry</Label>
                    <Input
                      value={formData.otherIndustry}
                      onChange={(e) => setFormData(prev => ({ ...prev, otherIndustry: e.target.value }))}
                      className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-blue-400/50 text-white font-bold text-sm"
                      placeholder="Enter business category..."
                      required={formData.industry === "OTHER"}
                    />
                  </motion.div>
                )}
              </div>

              {/* 3. Social Media Platforms */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-indigo-400/10 flex items-center justify-center text-[10px]">3</span>
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
                          ? "bg-indigo-400/10 border-indigo-400/40 text-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.1)]"
                          : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10"
                      )}
                    >
                      <div className={cn(
                        "h-5 w-5 rounded-md border flex items-center justify-center transition-colors",
                        formData.socialPlatforms.includes(platform) ? "bg-indigo-400 border-indigo-400" : "border-slate-700"
                      )}>
                        {formData.socialPlatforms.includes(platform) && <CheckSquare className="h-3 w-3 text-slate-950" />}
                      </div>
                      <span className="text-xs font-black tracking-widest">{platform}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Content Plan Details */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-amber-400 uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-amber-400/10 flex items-center justify-center text-[10px]">4</span>
                  Content Plan Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Posts per Month</Label>
                    <Input
                      type="number"
                      value={formData.postsPerMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, postsPerMonth: parseInt(e.target.value) }))}
                      className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-amber-400/50 text-white font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Reels per Month</Label>
                    <Input
                      type="number"
                      value={formData.reelsPerMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, reelsPerMonth: parseInt(e.target.value) }))}
                      className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-amber-400/50 text-white font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Micro Reels per Month</Label>
                    <Input
                      type="number"
                      value={formData.microReelsPerMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, microReelsPerMonth: parseInt(e.target.value) }))}
                      className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-amber-400/50 text-white font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Production Details */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-rose-400 uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-rose-400/10 flex items-center justify-center text-[10px]">5</span>
                  Production Details
                </h3>

                <div className="space-y-4">
                  <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Photo Shoot Frequency</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["None", "Every 3 Months", "Every 2 Months", "Monthly"].map((freq) => (
                      <div
                        key={freq}
                        onClick={() => setFormData(prev => ({ ...prev, proPhotoShootFrequency: freq }))}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer text-center",
                          formData.proPhotoShootFrequency === freq
                            ? "bg-rose-400/10 border-rose-400/40 text-rose-400"
                            : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10"
                        )}
                      >
                        <Calendar className={cn("h-5 w-5 mb-2", formData.proPhotoShootFrequency === freq ? "text-rose-400" : "text-slate-600")} />
                        <span className="text-[10px] font-black uppercase tracking-tight">{freq}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Photo Shoot Length</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {["0", "1 Hour", "1.5 Hours", "3 Hours", "Custom"].map((len) => (
                      <div
                        key={len}
                        onClick={() => setFormData(prev => ({ ...prev, proPhotoShootLength: len }))}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer text-center",
                          formData.proPhotoShootLength === len
                            ? "bg-rose-400/10 border-rose-400/40 text-rose-400"
                            : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10"
                        )}
                      >
                        <Clock className={cn("h-5 w-5 mb-2", formData.proPhotoShootLength === len ? "text-rose-400" : "text-slate-600")} />
                        <span className="text-[10px] font-black uppercase tracking-tight">{len}</span>
                      </div>
                    ))}
                  </div>
                  {formData.proPhotoShootLength === "Custom" && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
                      <Input
                        value={formData.otherPhotoShootLength}
                        onChange={(e) => setFormData(prev => ({ ...prev, otherPhotoShootLength: e.target.value }))}
                        className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-rose-400/50 text-white font-bold text-sm"
                        placeholder="e.g. 4 Hours, 8 Hours..."
                        required={formData.proPhotoShootLength === "Custom"}
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.25em] flex items-center gap-3">
                    <span className="h-5 w-5 rounded-md bg-cyan-400/10 flex items-center justify-center text-[10px]">6</span>
                    Additional Services
                  </h3>
                  <div className="space-y-3">
                    <div onClick={() => setFormData(prev => ({ ...prev, captionHashtags: !prev.captionHashtags }))} className={cn("flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer", formData.captionHashtags ? "bg-cyan-400/10 border-cyan-400/30" : "bg-white/5 border-white/5")}>
                      <div className="flex flex-col">
                        <span className={cn("text-xs font-bold", formData.captionHashtags ? "text-cyan-400" : "text-slate-400")}>Caption & Hashtags</span>
                        <span className="text-[9px] text-slate-600 font-medium">Expert copywriting for all posts</span>
                      </div>
                      <div className={cn("h-5 w-10 rounded-full relative transition-colors p-1", formData.captionHashtags ? "bg-cyan-400" : "bg-slate-800")}>
                        <div className={cn("h-3 w-3 rounded-full bg-white transition-all shadow-sm", formData.captionHashtags ? "ml-5" : "ml-0")} />
                      </div>
                    </div>

                    <div onClick={() => setFormData(prev => ({ ...prev, scheduling: !prev.scheduling }))} className={cn("flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer", formData.scheduling ? "bg-cyan-400/10 border-cyan-400/30" : "bg-white/5 border-white/5")}>
                      <div className="flex flex-col">
                        <span className={cn("text-xs font-bold", formData.scheduling ? "text-cyan-400" : "text-slate-400")}>Auto Scheduling</span>
                        <span className="text-[9px] text-slate-600 font-medium">Automated publishing pipeline</span>
                      </div>
                      <div className={cn("h-5 w-10 rounded-full relative transition-colors p-1", formData.scheduling ? "bg-cyan-400" : "bg-slate-800")}>
                        <div className={cn("h-3 w-3 rounded-full bg-white transition-all shadow-sm", formData.scheduling ? "ml-5" : "ml-0")} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.25em] flex items-center gap-3">
                    <span className="h-5 w-5 rounded-md bg-emerald-400/10 flex items-center justify-center text-[10px]">7</span>
                    Pricing & Validity
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Monthly Price (USD)</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-black">$</span>
                        <Input type="number" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) }))} className="bg-slate-900/50 border-white/5 h-11 pl-8 rounded-xl focus-visible:ring-emerald-400/50 text-white font-black text-sm" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Expires In (Days)</Label>
                      <Input type="number" value={formData.expiresInDays} onChange={(e) => setFormData(prev => ({ ...prev, expiresInDays: parseInt(e.target.value) }))} className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-emerald-400/50 text-white font-bold text-sm" min={1} required />
                    </div>
                  </div>
                </div>
              </div>

              {/* 8. Internal Notes */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-slate-400/10 flex items-center justify-center text-[10px]">8</span>
                  Internal Notes (Admin Only)
                </h3>
                <textarea
                  value={formData.internalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 min-h-[100px] placeholder:text-slate-700"
                  placeholder="Special instructions, priority notes, or follow-up requirements..."
                />
              </div>
            </form>
          </div>

          <div className="px-6 py-5 border-t border-white/5 bg-slate-950/80 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Update Authorization
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="border-white/5 bg-white/5 text-slate-400 h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 hover:text-white transition-all">Discard</Button>
              <Button form="enterprise-update-form" type="submit" className="bg-blue-500 hover:bg-blue-400 text-white font-black h-12 px-10 rounded-xl shadow-[0_10px_30px_rgba(59,130,246,0.3)] transition-all active:scale-95 uppercase tracking-[0.2em] text-[11px]" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="h-5 w-5 mr-3 animate-spin" /> : <ArrowRight className="h-4 w-4 mr-3 stroke-[3px]" />}
                Confirm Updates
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Brand Brief Details Modal */}
      <Dialog open={isBbDetailsOpen} onOpenChange={setIsBbDetailsOpen}>
        <DialogContent className="bg-slate-950/95 backdrop-blur-3xl border-white/10 sm:max-w-[1100px] rounded-[2.5rem] p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {bbDetailsQuery.isLoading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-lime-400" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Decrypting Brand Data...</p>
            </div>
          ) : details ? (
            <>
              {/* Header */}
              <div className="px-8 py-6 bg-gradient-to-br from-slate-800/20 to-transparent border-b border-white/5 flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-black text-white tracking-tighter uppercase">Brand Brief Intel</DialogTitle>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge className="bg-lime-400 text-slate-950 font-black px-2 py-0.5 rounded-md text-[9px] tracking-widest">{details.restaurantName}</Badge>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{details.user.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleDownloadPdf(details.id, details.restaurantName)}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 text-lime-400 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 text-lime-400 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-[11px] font-black uppercase tracking-widest">
                      {isDownloading ? "Generating..." : "Download PDF"}
                    </span>
                  </button>
                  <div className="h-14 w-14 rounded-3xl bg-lime-400/10 flex items-center justify-center text-lime-400 border border-lime-400/20">
                    <FileText className="h-7 w-7" />
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide bg-slate-950/20">
                {/* Section Generator */}
                {[
                  {
                    title: "01 Identity & Presence",
                    color: "text-lime-400",
                    bg: "bg-lime-400/10",
                    fields: [
                      { label: "Restaurant Name", value: details.restaurantName },
                      { label: "Location", value: details.location },
                      { label: "Business Type", value: details.businessType },
                      { label: "Cuisine Type", value: details.cuisineType },
                      { label: "Website", value: details.websiteUrl, isLink: true },
                      { label: "Instagram", value: details.instagramHandle, isLink: true },
                      { label: "Dietary Certs", value: details.dietaryCertifications?.join(", ") },
                    ]
                  },
                  {
                    title: "02 Social Media Handles",
                    color: "text-blue-400",
                    bg: "bg-blue-400/10",
                    fields: [
                      { label: "Facebook", value: details.facebookPageUrl, isLink: true },
                      { label: "TikTok", value: details.tiktokHandle, isLink: true },
                      { label: "Online Ordering", value: details.onlineOrderingUrl, isLink: true },
                    ]
                  },
                  {
                    title: "03 Brand Voice & Content",
                    color: "text-indigo-400",
                    bg: "bg-indigo-400/10",
                    fields: [
                      { label: "Tone & Voice", value: details.toneAndVoice?.join(" | ") },
                      { label: "Targeting", value: details.captionTargeting },
                      { label: "Language", value: details.language },
                      { label: "Hashtag Style", value: details.hashtagStyle },
                      { label: "Unique Selling Point", value: details.uniqueSellingPoint },
                    ]
                  },
                  {
                    title: "04 Messaging & Samples",
                    color: "text-amber-400",
                    bg: "bg-amber-400/10",
                    fields: [
                      { label: "Forbidden Phrases", value: details.forbiddenPhrases },
                      { label: "Preferred Phrases", value: details.preferredPhrases },
                      { label: "Sample Caption 1", value: details.captionSample1 },
                      { label: "Sample Caption 2", value: details.captionSample2 },
                      { label: "Sample Caption 3", value: details.captionSample3 },
                    ]
                  },
                  {
                    title: "05 Operations & Production",
                    color: "text-rose-400",
                    bg: "bg-rose-400/10",
                    fields: [
                      { label: "Signature Dishes", value: details.signatureDishes?.join(", ") },
                      { label: "Dish Details", value: details.signatureDishDetails },
                      { label: "Excluded Items", value: details.excludedItems },
                      { label: "Upcoming Promos", value: details.upcomingPromotions },
                      { label: "Shoot Frequency", value: details.confirmMinDishes },
                      { label: "Action Shots Possible", value: details.actionShotsPossible },
                      { label: "Preferred Shoot Time", value: details.preferredShootTime },
                    ]
                  },
                  {
                    title: "06 Admin & Authorization",
                    color: "text-cyan-400",
                    bg: "bg-cyan-400/10",
                    fields: [
                      { label: "Client Name (Auth)", value: details.clientName },
                      { label: "Talexia Plan", value: details.talexiaPlan },
                      { label: "Authorization Date", value: formatDate(details.submissionDate) },
                    ]
                  },
                ].map((section, idx) => (
                  <div key={idx} className="space-y-4">
                    <h4 className={cn("text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3", section.color)}>
                      <span className={cn("h-6 w-6 rounded-lg flex items-center justify-center text-[10px] border border-white/5", section.bg)}>{idx + 1}</span>
                      {section.title}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {section.fields.map((field, fIdx) => (
                        <div key={fIdx} className="space-y-1 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{field.label}</p>
                          {field.isLink && field.value ? (
                            <a href={field.value} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-400 hover:underline break-all">
                              {field.value}
                            </a>
                          ) : (
                            <p className="text-sm font-medium text-slate-200 leading-relaxed">{field.value || "—"}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-white/5 bg-slate-950/80 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                  <div className="h-2 w-2 rounded-full bg-lime-400" />
                  Intel Verified • {formatDate(details.createdAt)}
                </div>
                <Button 
                  onClick={() => setIsBbDetailsOpen(false)}
                  className="bg-white/5 hover:bg-white/10 text-white font-black h-12 px-10 rounded-2xl border border-white/10 uppercase tracking-widest text-[10px]"
                >
                  Close Intel
                </Button>
              </div>
            </>
          ) : (
            <div className="h-96 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest">Error fetching intel.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
