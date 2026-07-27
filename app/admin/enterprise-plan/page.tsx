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

  CheckCircle2,
  Clock,
  Building2,
  User,
  Copy,
  Send,
  Loader2,
  ShieldCheck,
  ArrowRight,
  CheckSquare,
  Edit3,
  FileText,
  ClipboardList,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  ColumnDef,
} from "@tanstack/react-table";

// "lsdfjlsdjflsdf"

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
import { AdminPagination } from "@/components/admin/AdminPagination";

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
  const displayStatus = status.replace(/_/g, " ");

  switch (s) {
    case "PAYMENT_COMPLETED":
      return (
        <Badge variant="outline" className="bg-[#b08d3e] text-[#14110c] border-[#b08d3e] px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-[0.18em] shadow-sm">
          <CheckCircle2 className="h-3 w-3" />
          {displayStatus}
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="outline" className="bg-[#b08d3e]/10 text-[#b08d3e] border-[#b08d3e]/30 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-[0.18em]">
          <Send className="h-3 w-3" />
          {displayStatus}
        </Badge>
      );
    case "VIEWED":
      return (
        <Badge variant="outline" className="bg-[#e6e1d8] text-[#14110c] border-[#d9d4c9] px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-[0.18em]">
          <Eye className="h-3 w-3" />
          {displayStatus}
        </Badge>
      );
    case "SIGNED_UP":
      return (
        <Badge variant="outline" className="bg-[#e6e1d8]/50 text-[#14110c] border-[#d9d4c9] px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-[0.18em]">
          <User className="h-3 w-3" />
          {displayStatus}
        </Badge>
      );
    case "EXPIRED":
    case "CANCELED":
      return (
        <Badge variant="outline" className="bg-red-900/10 text-red-900 border-red-900/30 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-[0.18em]">
          <XCircle className="h-3 w-3" />
          {displayStatus}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-[#e6e1d8]/50 text-[#14110c] border-[#d9d4c9] px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-[0.18em]">
          {displayStatus}
        </Badge>
      );
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
  const [pageSize] = useState(10);
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
  const [bbLimit] = useState(10);
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
    queryKey: ["admin-invites", search, statusFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
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
    placeholderData: keepPreviousData,
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
          <div className="h-10 w-10 rounded-xl bg-[#e6e1d8] border border-[#d9d4c9] flex items-center justify-center text-[#b08d3e] group-hover:bg-[#b08d3e] group-hover:text-[#14110c] transition-colors">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#14110c] tracking-tight">{row.original.companyName}</span>
            <span className="text-[10px] text-[#6b6b6b] font-medium uppercase tracking-wider">{row.original.fullName}</span>
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
            <span className="text-[#14110c] font-bold text-[13px] tracking-tight">
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
          <div className="flex items-center gap-1.5 text-[#14110c]">
            <Mail className="h-3 w-3 text-[#6b6b6b]" />
            <span className="text-sm placeholder:text-[#6b6b6b] placeholder:font-normal">{row.original.email}</span>
          </div>
          <span className="text-[10px] text-[#6b6b6b] font-mono mt-0.5">{row.original.planCode}</span>
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
          <span className="text-[#14110c] font-bold text-sm placeholder:text-[#6b6b6b] placeholder:font-normal">{row.original.proposal?.planName || row.original.planName}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-[#b08d3e] font-black tracking-wider">
              {formatAmount(row.original.proposal?.amount || row.original.amount || 0, row.original.proposal?.currency || row.original.currency || "usd")}
            </span>
            <span className="text-[9px] text-[#6b6b6b] font-bold uppercase tracking-widest border-l border-[#d9d4c9] pl-2">
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
          <div className="flex items-center gap-1.5 text-[#6b6b6b] text-[11px]">
            <Send className="h-3 w-3" />
            <span>Sent: {formatDate(row.original.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#b08d3e]/70 text-[11px] mt-0.5">
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
                  className="h-9 w-9 p-0 text-[#6b6b6b] hover:text-[#14110c] hover:bg-[#e6e1d8] rounded-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#ffffff] border-[#d9d4c9] rounded-2xl p-2 shadow-2xl">
                <DropdownMenuLabel className="text-[10px] uppercase font-bold text-[#6b6b6b] tracking-widest px-3 py-2">Management</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push(`/admin/enterprise-plan/${invite.id}`)}
                  className="rounded-lg py-2.5 cursor-pointer focus:bg-[#e6e1d8] text-[#14110c]"
                >
                  <Eye className="mr-3 h-4 w-4 text-[#b08d3e]" />
                  <span className="font-medium">View Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(invite.id);
                  }}
                  className="rounded-lg py-2.5 cursor-pointer focus:bg-[#e6e1d8] text-[#14110c]"
                  disabled={invite.status === "PAYMENT_COMPLETED"}
                >
                  {isDetailLoading && editingInviteId === invite.id ? (
                    <Loader2 className="mr-3 h-4 w-4 animate-spin text-[#b08d3e]" />
                  ) : (
                    <Edit3 className="mr-3 h-4 w-4 text-[#b08d3e]" />
                  )}
                  <span className="font-medium">Edit Proposal</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    copyInviteLink();
                  }}
                  className="rounded-lg py-2.5 cursor-pointer focus:bg-[#e6e1d8] text-[#14110c]"
                >
                  <Copy className="mr-3 h-4 w-4 text-[#b08d3e]" />
                  <span className="font-medium">Copy Invite Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    resendMutation.mutate(invite.id);
                  }}
                  className="rounded-lg py-2.5 cursor-pointer focus:bg-[#e6e1d8] text-[#14110c]"
                  disabled={invite.status === "PAYMENT_COMPLETED" || invite.status === "CANCELED"}
                >
                  <Mail className="mr-3 h-4 w-4 text-[#b08d3e]" />
                  <span className="font-medium">Resend Email</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-[#e6e1d8] my-1" />

                {invite.status !== "CANCELED" && invite.status !== "PAYMENT_COMPLETED" && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelMutation.mutate(invite.id);
                    }}
                    className="rounded-lg py-2.5 cursor-pointer focus:bg-[#b08d3e]/10 text-[#b08d3e]"
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
                  className="rounded-lg py-2.5 cursor-pointer focus:bg-red-500/10 text-red-600"
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

  const tableData = invitesQuery.data?.items ?? [];
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: pageSize,
      }
    }
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
          <h1 className="text-2xl font-semibold text-[#14110c]">Custom Plans</h1>
          <p className="text-sm text-[#6b6b6b]">Manage custom enterprise proposals and brand brief submissions.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList className="bg-[#ffffff] border border-[#d9d4c9] p-1 rounded-2xl h-14">
            <TabsTrigger
              value="enterprise"
              className="rounded-xl px-6 h-full data-[state=active]:bg-[#b08d3e] data-[state=active]:text-[#14110c] font-black uppercase text-[10px] tracking-widest transition-all"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Custom Plans
            </TabsTrigger>
            <TabsTrigger
              value="brand-brief"
              className="rounded-xl px-6 h-full data-[state=active]:bg-[#b08d3e] data-[state=active]:text-[#14110c] font-black uppercase text-[10px] tracking-widest transition-all"
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
                className="border-[#d9d4c9] bg-[#ffffff] text-[#14110c] hover:bg-[#e6e1d8] h-11 px-5 rounded-xl font-bold transition-all active:scale-95"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["enterprise-invites"] })}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${invitesQuery.isFetching ? "animate-spin" : ""}`} />
                Sync Data
              </Button>
              <Button
                className="bg-[#b08d3e] hover:bg-[#e6e1d8] text-[#14110c] font-black gap-2 px-8 py-6 rounded-2xl shadow-[0_15px_30px_rgba(176,141,62,0.3)] transition-all hover:scale-105 active:scale-95 text-base"
                onClick={() => {
                  resetForm();
                  setIsCreateModalOpen(true);
                }}
              >
                <Plus className="h-5 w-5 stroke-[3px]" />
                New Proposal
              </Button>
            </div>
          )}
          {activeTab === "brand-brief" && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-[#d9d4c9] bg-[#ffffff] text-[#14110c] hover:bg-[#e6e1d8] h-11 px-5 rounded-xl font-bold transition-all active:scale-95"
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
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-[#ffffff] p-4 rounded-xl border border-[#d9d4c9] shadow-sm">
              <div className="relative flex-1 w-full lg:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
                <Input
                  placeholder="Search client pipeline..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-11 bg-[#faf8f3] shadow-sm border border-[#d9d4c9] rounded-md focus-visible:ring-[#b08d3e]/50 h-11 text-sm text-[#14110c] placeholder:text-[#6b6b6b] font-medium"
                />
              </div>
              <div className="flex items-center gap-2 pr-2 w-full lg:w-auto">
                <div className="h-6 w-[1px] bg-[#e6e1d8] mx-2 hidden lg:block" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-[#faf8f3] shadow-sm border border-[#d9d4c9] rounded-md h-11 w-full lg:w-44 text-[10px] font-black uppercase tracking-widest text-[#14110c] px-3 outline-none"
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
            <Card className="rounded-xl border border-[#d9d4c9] bg-[#ffffff] overflow-hidden">
              <div className="overflow-x-auto scrollbar-hide">
                <Table>
                  <TableHeader className="bg-[#e6e1d8]/50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="hover:bg-transparent border-[#d9d4c9]">
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="text-[#6b6b6b] py-5 px-6 font-bold uppercase text-[9px] tracking-[0.2em] text-center first:text-left">
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {invitesQuery.isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-[#d9d4c9] animate-pulse hover:bg-transparent">
                          <TableCell colSpan={columns.length} className="py-8 px-6">
                            <div className="h-12 bg-[#e6e1d8]/50 rounded-2xl w-full" />
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
                              <p className="text-[#14110c] font-black text-xl tracking-tight">Sync Failure</p>
                              <p className="text-[#6b6b6b] text-sm max-w-xs mx-auto font-medium">
                                {(invitesQuery.error as any)?.message || "The neural link to the backend was interrupted unexpectedly."}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              className="mt-2 border-[#d9d4c9] bg-[#ffffff] text-[#14110c] rounded-xl hover:bg-white hover:text-[#14110c] transition-all font-black px-6 uppercase text-[10px] tracking-widest"
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
                          className="border-[#d9d4c9] hover:bg-[#e6e1d8]/30 transition-colors group cursor-pointer"
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
                            <div className="h-20 w-20 rounded-3xl bg-[#ffffff] flex items-center justify-center border border-[#d9d4c9] shadow-inner">
                              <Building2 className="h-10 w-10 text-[#14110c]" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[#14110c] font-black text-xl tracking-tight">Pipeline Empty</p>
                              <p className="text-[#6b6b6b] text-sm max-w-xs mx-auto font-medium">Add your first high-value client to begin tracking their lifecycle.</p>
                            </div>
                            <Button
                              variant="outline"
                              className="mt-2 border-[#d9d4c9] bg-[#ffffff] text-[#14110c] rounded-xl hover:bg-[#e6e1d8] hover:text-[#14110c] transition-all font-bold px-6"
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
              <AdminPagination
                currentPage={page}
                totalPages={invitesQuery.data?.total ? Math.ceil(invitesQuery.data.total / pageSize) : 1}
                totalItems={invitesQuery.data?.total ?? 0}
                onPageChange={setPage}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="brand-brief" className="space-y-8 mt-0 outline-none">
          <Card className="rounded-xl border border-[#d9d4c9] bg-[#ffffff] overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <Table>
                <TableHeader className="bg-[#e6e1d8]/50">
                  <TableRow className="hover:bg-transparent border-[#d9d4c9]">
                    <TableHead className="text-[#6b6b6b] py-5 px-6 font-bold uppercase text-[9px] tracking-[0.2em] text-left">Restaurant / Brand</TableHead>
                    <TableHead className="text-[#6b6b6b] py-5 px-6 font-bold uppercase text-[9px] tracking-[0.2em] text-center">Location</TableHead>
                    <TableHead className="text-[#6b6b6b] py-5 px-6 font-bold uppercase text-[9px] tracking-[0.2em] text-center">Business Type</TableHead>
                    <TableHead className="text-[#6b6b6b] py-5 px-6 font-bold uppercase text-[9px] tracking-[0.2em] text-center">Submission Date</TableHead>
                    <TableHead className="text-[#6b6b6b] py-5 px-6 font-bold uppercase text-[9px] tracking-[0.2em] text-center">User</TableHead>
                    <TableHead className="text-[#6b6b6b] py-5 px-6 font-bold uppercase text-[9px] tracking-[0.2em] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brandBriefsQuery.isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-[#d9d4c9] animate-pulse">
                        <TableCell colSpan={6} className="py-8 px-6">
                          <div className="h-12 bg-[#e6e1d8]/50 rounded-2xl w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : brandBriefsQuery.data?.data?.items?.length ? (
                    brandBriefsQuery.data.data.items.map((bb) => (
                      <TableRow key={bb.id} className="border-[#d9d4c9] hover:bg-[#e6e1d8]/30 transition-colors group">
                        <TableCell className="py-6 px-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#14110c] tracking-tight">{bb.restaurantName}</span>
                            <span className="text-[10px] text-[#b08d3e] font-bold uppercase tracking-wider">{bb.proposal?.planName || "Enterprise"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-6 text-center text-[#14110c] text-sm placeholder:text-[#6b6b6b] placeholder:font-normal">{bb.location}</TableCell>
                        <TableCell className="py-6 px-6 text-center text-[#14110c] text-sm placeholder:text-[#6b6b6b] placeholder:font-normal">{bb.businessType}</TableCell>
                        <TableCell className="py-6 px-6 text-center text-[#6b6b6b] text-xs">{formatDate(bb.submissionDate)}</TableCell>
                        <TableCell className="py-6 px-6 text-center">
                          <div className="flex flex-col">
                            <span className="text-[#14110c] font-medium text-sm placeholder:text-[#6b6b6b] placeholder:font-normal">{bb.user.name}</span>
                            <span className="text-[10px] text-[#6b6b6b] font-mono">{bb.user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-6 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-[#6b6b6b] hover:text-[#b08d3e] hover:bg-[#b08d3e]/10 rounded-xl"
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
                      <TableCell colSpan={6} className="h-80 text-center text-[#6b6b6b]">No brand brief submissions found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* BB Pagination Footer */}
            <AdminPagination
              currentPage={bbPage}
              totalPages={brandBriefsQuery.data?.data?.totalPages || 1}
              totalItems={brandBriefsQuery.data?.data?.total ?? 0}
              onPageChange={setBbPage}
              isLoading={brandBriefsQuery.isLoading}
            />
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
        <DialogContent contentClassName="p-0" className="bg-[#faf8f3] backdrop-blur-3xl border-[#d9d4c9] sm:max-w-[1000px] rounded-[2rem] p-0 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden border flex flex-col max-h-[95vh]">
          <div className="px-6 py-5 bg-gradient-to-br from-[#14110c]/20 to-transparent border-b border-[#d9d4c9] relative overflow-hidden rounded-t-[2rem]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#b08d3e]/5 blur-[100px] pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <DialogTitle className="text-2xl font-black text-[#14110c] tracking-tighter uppercase">Enterprise Proposal Forge</DialogTitle>
                <DialogDescription className="text-[#6b6b6b] text-xs font-medium tracking-tight mt-0.5">
                  Engineer a high-performance custom plan for priority enterprise clients.
                </DialogDescription>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-[#b08d3e]/10 flex items-center justify-center text-[#b08d3e] border border-[#b08d3e]/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="flex-1 px-6 py-6 bg-[#faf8f3] overflow-y-auto">
            <form id="enterprise-proposal-form" onSubmit={handleCreateSubmit} className="space-y-10">

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
                      className="bg-[#ffffff] border-[#d9d4c9] h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm placeholder:text-[#6b6b6b] placeholder:font-normal"
                      placeholder="Enter PlanName"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Company Name</Label>
                    <Input
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      className="bg-[#ffffff] border-[#d9d4c9] h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm placeholder:text-[#6b6b6b] placeholder:font-normal"
                      placeholder="Enter CompanyName"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Full Name</Label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="bg-[#ffffff] border-[#d9d4c9] h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm placeholder:text-[#6b6b6b] placeholder:font-normal"
                      placeholder="Enter FullName"
                      required
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Email Address</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-[#ffffff] border-[#d9d4c9] h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm placeholder:text-[#6b6b6b] placeholder:font-normal"
                      placeholder=" Enter Email"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 2. Industry / Business Type */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-[#b08d3e] uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-[#b08d3e]/10 flex items-center justify-center text-[10px]">2</span>
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
                          ? "bg-[#b08d3e]/10 border-[#b08d3e]/40 text-[#b08d3e]"
                          : "bg-[#ffffff] shadow-sm border-[#d9d4c9] text-[#6b6b6b] hover:border-[#b08d3e]/50 hover:shadow-md"
                      )}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all",
                        formData.industry === ind.value ? "border-[#b08d3e]" : "border-[#d9d4c9]"
                      )}>
                        {formData.industry === ind.value && <div className="h-2 w-2 rounded-full bg-[#b08d3e]" />}
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
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Specify Industry</Label>
                    <Input
                      value={formData.otherIndustry}
                      onChange={(e) => setFormData(prev => ({ ...prev, otherIndustry: e.target.value }))}
                      className="bg-[#ffffff] border-[#d9d4c9] h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm placeholder:text-[#6b6b6b] placeholder:font-normal"
                      placeholder="Enter business category..."
                      required={formData.industry === "OTHER"}
                    />
                  </motion.div>
                )}
              </div>

              {/* 3. Social Media Platforms */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-[#b08d3e] uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-[#b08d3e]/10 flex items-center justify-center text-[10px]">3</span>
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
                          ? "bg-[#b08d3e]/10 border-[#b08d3e]/40 text-[#b08d3e] shadow-[0_0_20px_rgba(176,141,62,0.1)]"
                          : "bg-[#ffffff] shadow-sm border-[#d9d4c9] text-[#6b6b6b] hover:border-[#b08d3e]/50 hover:shadow-md"
                      )}
                    >
                      <div className={cn(
                        "h-5 w-5 rounded-md border flex items-center justify-center transition-colors",
                        formData.socialPlatforms.includes(platform) ? "bg-[#b08d3e] border-[#b08d3e]" : "border-[#d9d4c9]"
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
                <h3 className="text-[11px] font-black text-[#b08d3e] uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-[#b08d3e]/10 flex items-center justify-center text-[10px]">4</span>
                  Content Plan Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Posts per Month</Label>
                    <Input
                      type="number"
                      value={formData.postsPerMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, postsPerMonth: parseInt(e.target.value) }))}
                      className="bg-[#ffffff] border-[#d9d4c9] h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm placeholder:text-[#6b6b6b] placeholder:font-normal"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Reels per Month</Label>
                    <Input
                      type="number"
                      value={formData.reelsPerMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, reelsPerMonth: parseInt(e.target.value) }))}
                      className="bg-[#ffffff] border-[#d9d4c9] h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm placeholder:text-[#6b6b6b] placeholder:font-normal"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Micro Reels per Month</Label>
                    <Input
                      type="number"
                      value={formData.microReelsPerMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, microReelsPerMonth: parseInt(e.target.value) }))}
                      className="bg-[#ffffff] border-[#d9d4c9] h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm placeholder:text-[#6b6b6b] placeholder:font-normal"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* 5. Additional Services */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-[#b08d3e] uppercase tracking-[0.25em] flex items-center gap-3">
                    <span className="h-5 w-5 rounded-md bg-[#b08d3e]/10 flex items-center justify-center text-[10px]">5</span>
                    Additional Services
                  </h3>
                  <div className="space-y-3">
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, captionHashtags: !prev.captionHashtags }))}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                        formData.captionHashtags ? "bg-[#b08d3e]/10 border-[#b08d3e]/30" : "bg-[#ffffff] border-[#d9d4c9]"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className={cn("text-xs font-bold", formData.captionHashtags ? "text-[#b08d3e]" : "text-[#6b6b6b]")}>Caption & Hashtags</span>
                        <span className="text-[9px] text-[#6b6b6b] font-medium">Expert copywriting for all posts</span>
                      </div>
                      <div className={cn(
                        "h-5 w-10 rounded-full relative transition-colors p-1",
                        formData.captionHashtags ? "bg-[#b08d3e]" : "bg-[#e6e1d8]"
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
                        formData.scheduling ? "bg-[#b08d3e]/10 border-[#b08d3e]/30" : "bg-[#ffffff] border-[#d9d4c9]"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className={cn("text-xs font-bold", formData.scheduling ? "text-[#b08d3e]" : "text-[#6b6b6b]")}>Auto Scheduling</span>
                        <span className="text-[9px] text-[#6b6b6b] font-medium">Automated publishing pipeline</span>
                      </div>
                      <div className={cn(
                        "h-5 w-10 rounded-full relative transition-colors p-1",
                        formData.scheduling ? "bg-[#b08d3e]" : "bg-[#e6e1d8]"
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
                  <h3 className="text-[11px] font-black text-[#b08d3e] uppercase tracking-[0.25em] flex items-center gap-3">
                    <span className="h-5 w-5 rounded-md bg-[#b08d3e]/10 flex items-center justify-center text-[10px]">6</span>
                    Pricing & Validity
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Monthly Price (USD)</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b08d3e] font-black">$</span>
                        <Input
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                          className="bg-[#ffffff] border-[#d9d4c9] h-11 pl-8 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-black text-sm placeholder:text-[#6b6b6b] placeholder:font-normal"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Expires In (Days)</Label>
                      <Input
                        type="number"
                        value={formData.expiresInDays}
                        onChange={(e) => setFormData(prev => ({ ...prev, expiresInDays: parseInt(e.target.value) }))}
                        className="bg-[#ffffff] border-[#d9d4c9] h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm placeholder:text-[#6b6b6b] placeholder:font-normal"
                        min={1}
                        required
                      />
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
                  className="w-full bg-[#ffffff] border border-[#d9d4c9] rounded-2xl p-4 text-[#14110c] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#d9d4c9] min-h-[100px] placeholder:text-[#6b6b6b] placeholder:font-normal"
                  placeholder="Special instructions, priority notes, or follow-up requirements..."
                />
              </div>

            </form>
          </div>

          <div className="px-6 py-5 border-t border-[#d9d4c9] bg-[#faf8f3] backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] text-[#6b6b6b] font-bold uppercase tracking-widest">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Secure Proposal Dispatch
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="bg-[#ffffff] border-[#d9d4c9] text-[#14110c] hover:bg-[#e6e1d8] h-12 px-6 rounded-xl font-black uppercase tracking-[0.18em] text-[10px] transition-all"
              >
                Discard
              </Button>
              <Button
                form="enterprise-proposal-form"
                type="submit"
                className="bg-[#b08d3e] hover:bg-[#e6e1d8] text-[#14110c] font-black h-12 px-10 rounded-xl shadow-[0_10px_20px_rgba(176,141,62,0.2)] transition-all hover:scale-105 active:scale-95 uppercase tracking-[0.18em] text-[11px]"
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
        <DialogContent contentClassName="p-0" className="bg-[#faf8f3] backdrop-blur-3xl border-[#d9d4c9] sm:max-w-[850px] rounded-[2rem] p-0 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden border">
          {inviteDetailsQuery.isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <Loader2 className="h-10 w-10 text-[#b08d3e] animate-spin" />
                <div className="absolute inset-0 blur-xl bg-[#b08d3e]/20 animate-pulse" />
              </div>
              <p className="text-[#6b6b6b] font-black uppercase tracking-[0.2em] text-[10px]">Synchronizing Data...</p>
            </div>
          ) : inviteDetailsQuery.data?.invite ? (
            (() => {
              const invite = inviteDetailsQuery.data.invite;
              return (
                <div className="flex flex-col">
                  {/* Compact Header */}
                  <div className="p-8 bg-gradient-to-br from-[#14110c]/20 to-transparent border-b border-[#d9d4c9] relative overflow-hidden rounded-t-[2rem]">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(163,230,53,0.05),transparent)] pointer-events-none" />
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-[#ffffff] border border-[#d9d4c9] flex items-center justify-center text-[#b08d3e]">
                          <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-[#14110c] tracking-tight">{invite.companyName}</h2>
                          <div className="flex items-center gap-3 text-[#6b6b6b] font-bold uppercase tracking-widest text-[9px] mt-0.5">
                            <span>{invite.fullName}</span>
                            <div className="h-1 w-1 rounded-full bg-[#e6e1d8]" />
                            <span>{invite.email}</span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={invite.status} />
                    </div>
                  </div>

                  {/* Body - Grid Layout to avoid scroll */}
                  <div className="p-8 grid grid-cols-1 md:grid-cols-5 gap-8 bg-[#faf8f3]">
                    {/* Lifecycle - Left Column */}
                    <div className="md:col-span-2 space-y-6">
                      <h3 className="text-[10px] font-black text-[#6b6b6b] uppercase tracking-[0.2em] mb-4">Activity Lifecycle</h3>
                      <div className="space-y-4 relative">
                        <div className="absolute top-2 left-5 bottom-2 w-[1px] bg-[#e6e1d8]" />
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
                                isActive ? "bg-[#b08d3e]/10 text-[#b08d3e] border-[#b08d3e]/20" : "bg-[#ffffff] text-[#14110c] border-[#d9d4c9]"
                              )}>
                                <step.icon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className={cn("text-[9px] font-black uppercase tracking-widest", isActive ? "text-[#14110c]" : "text-[#14110c]")}>{step.label}</p>
                                <p className="text-[10px] text-[#6b6b6b] font-medium">{step.date ? formatDate(step.date) : "Pending"}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Proposal Details - Right Column */}
                    <div className="md:col-span-3 space-y-6">
                      <div className="bg-[#ffffff] border border-[#d9d4c9] rounded-2xl p-6 space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[9px] font-black text-[#b08d3e] uppercase tracking-widest mb-1">Current Proposal</p>
                            <h3 className="text-xl font-black text-[#14110c] tracking-tight">{invite.proposal?.planName || invite.planName}</h3>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-[#14110c] tracking-tighter">
                              {formatAmount(invite.proposal?.amount || invite.amount || 0, invite.proposal?.currency || invite.currency || "usd")}
                            </p>
                            <p className="text-[9px] font-black text-[#6b6b6b] uppercase tracking-widest mt-0.5">/ {invite.proposal?.billingCycle || invite.billingCycle}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-[#ffffff] rounded-xl border border-[#d9d4c9]">
                            <p className="text-[9px] font-black text-[#6b6b6b] uppercase tracking-widest mb-2">Social Content</p>
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-[#6b6b6b]">Monthly Posts</span>
                                <span className="text-[#14110c] font-bold">{invite.postsPerMonth || 0}</span>
                              </div>
                              <div className="flex justify-between text-[11px]">
                                <span className="text-[#6b6b6b]">Monthly Reels</span>
                                <span className="text-[#14110c] font-bold">{invite.reelsPerMonth || 0}</span>
                              </div>
                              <div className="flex justify-between text-[11px]">
                                <span className="text-[#6b6b6b]">Micro Content</span>
                                <span className="text-[#14110c] font-bold">{invite.microReelsPerMonth || 0}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-4 bg-[#ffffff] rounded-xl border border-[#d9d4c9]">
                            <p className="text-[9px] font-black text-[#b08d3e] uppercase tracking-widest mb-1">Industry / Category</p>
                            <p className="text-sm text-[#14110c] font-bold tracking-tight">{invite.industry?.replace(/_/g, ' ') || "GENERAL"}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-2">
                          <div className={cn("flex items-center gap-2 text-[9px] font-black uppercase tracking-widest", invite.captionHashtags ? "text-[#b08d3e]" : "text-[#14110c]")}>
                            <div className={cn("h-1.5 w-1.5 rounded-full", invite.captionHashtags ? "bg-[#b08d3e]" : "bg-[#e6e1d8]")} /> AI Captions
                          </div>
                          <div className={cn("flex items-center gap-2 text-[9px] font-black uppercase tracking-widest", invite.scheduling ? "text-[#b08d3e]" : "text-[#14110c]")}>
                            <div className={cn("h-1.5 w-1.5 rounded-full", invite.scheduling ? "bg-indigo-600" : "bg-[#e6e1d8]")} /> Auto Scheduling
                          </div>
                        </div>

                        {invite.internalNotes && (
                          <div className="pt-4 border-t border-[#d9d4c9]">
                            <p className="text-[9px] font-black text-[#6b6b6b] uppercase tracking-widest mb-2">Internal Admin Notes</p>
                            <p className="text-[11px] text-[#6b6b6b] leading-relaxed italic">"{invite.internalNotes}"</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between px-2 text-[9px] font-bold text-[#6b6b6b] uppercase tracking-widest">
                        <span>Ref: {invite.planCode}</span>
                        <span>Created By: {invite.sentByAdminEmail?.split('@')[0]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-8 pt-4 border-t border-[#d9d4c9] bg-[#faf8f3] backdrop-blur-md flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setIsDetailsModalOpen(false)}
                      className="bg-[#ffffff] border-[#d9d4c9] text-[#14110c] hover:bg-[#e6e1d8] h-11 px-8 rounded-xl font-black uppercase tracking-[0.18em] text-[10px] transition-all"
                    >
                      Close Details
                    </Button>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="p-20 text-center">
              <p className="text-[#14110c] font-bold">Failed to load proposal details.</p>
              <Button onClick={() => setIsDetailsModalOpen(false)} className="mt-4">Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent contentClassName="p-0" className="bg-[#0a0a0f] border border-[#d9d4c9] rounded-[2rem] p-0 sm:max-w-[420px] shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Red glow accent top bar */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />

          <div className="p-8 flex flex-col items-center text-center gap-6">
            {/* Icon */}
            <div className="relative">
              <div className="absolute inset-0 blur-2xl bg-red-500/20 rounded-full" />
              <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-red-500/20 to-rose-900/30 flex items-center justify-center border border-red-500/30 rotate-3">
                <Trash2 className="h-9 w-9 text-red-600 -rotate-3" />
              </div>
            </div>

            {/* Text */}
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-black text-[#14110c] tracking-tight">
                Permanently Delete?
              </DialogTitle>
              <DialogDescription className="text-[#6b6b6b] text-sm font-medium leading-relaxed">
                This will permanently erase the enterprise invite record and all associated proposal data.
                <br />
                <span className="text-red-600 font-bold mt-1 inline-block">This action cannot be undone.</span>
              </DialogDescription>
            </div>
          </div>

          {/* Buttons */}
          <div className="px-8 pb-8 flex flex-col gap-3">
            <button
              onClick={() => inviteToDelete && deleteMutation.mutate(inviteToDelete)}
              disabled={deleteMutation.isPending}
              className="w-full h-14 rounded-2xl font-black text-[13px] tracking-wider uppercase transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-[#14110c] shadow-[0_8px_30px_rgba(220,38,38,0.35)]"
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
              className="w-full h-12 rounded-2xl font-bold text-[12px] tracking-wider uppercase transition-all active:scale-95 bg-[#ffffff] hover:bg-[#e6e1d8] text-[#6b6b6b] hover:text-[#14110c] border border-[#d9d4c9] hover:border-[#d9d4c9]"
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
        <DialogContent contentClassName="p-0" className="bg-[#faf8f3] backdrop-blur-3xl border-[#d9d4c9] sm:max-w-[1000px] rounded-[2rem] p-0 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden border flex flex-col max-h-[95vh]">
          <div className="px-6 py-5 bg-gradient-to-br from-[#14110c]/20 to-transparent border-b border-[#d9d4c9] relative overflow-hidden rounded-t-[2rem]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#b08d3e]/5 blur-[100px] pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <DialogTitle className="text-2xl font-black text-[#14110c] tracking-tighter uppercase">Modify Proposal</DialogTitle>
                <DialogDescription className="text-[#6b6b6b] text-xs font-medium tracking-tight mt-0.5">
                  Update project scope and pricing for priority enterprise clients.
                </DialogDescription>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-[#b08d3e]/10 flex items-center justify-center text-[#b08d3e] border border-[#b08d3e]/20">
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
                      className="bg-[#ffffff] border-[#d9d4c9] h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm placeholder:text-[#6b6b6b] placeholder:font-normal"
                      placeholder="Enterprise Growth"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Company Name</Label>
                    <Input
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      className="bg-[#ffffff] border-[#d9d4c9] h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm placeholder:text-[#6b6b6b] placeholder:font-normal"
                      placeholder="Company Name"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Full Name</Label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="bg-[#ffffff] border-[#d9d4c9] h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm placeholder:text-[#6b6b6b] placeholder:font-normal"
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
                      className="bg-[#ffffff] border-[#d9d4c9] h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm placeholder:text-[#6b6b6b] placeholder:font-normal"
                      placeholder="enterprise.client@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 2. Industry / Business Type */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-[#b08d3e] uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-[#b08d3e]/10 flex items-center justify-center text-[10px]">2</span>
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
                          ? "bg-[#b08d3e]/10 border-blue-500/40 text-[#b08d3e]"
                          : "bg-[#ffffff] shadow-sm border-[#d9d4c9] text-[#6b6b6b] hover:border-[#b08d3e]/50 hover:shadow-md"
                      )}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all",
                        formData.industry === ind.value ? "border-blue-500" : "border-[#d9d4c9]"
                      )}>
                        {formData.industry === ind.value && <div className="h-2 w-2 rounded-full bg-[#b08d3e]" />}
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
                      className="bg-[#ffffff] border-[#d9d4c9] h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm placeholder:text-[#6b6b6b] placeholder:font-normal"
                      placeholder="Enter business category..."
                      required={formData.industry === "OTHER"}
                    />
                  </motion.div>
                )}
              </div>

              {/* 3. Social Media Platforms */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-[#b08d3e] uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-[#b08d3e]/10 flex items-center justify-center text-[10px]">3</span>
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
                          ? "bg-[#b08d3e]/10 border-indigo-500/40 text-[#b08d3e] shadow-[0_0_20px_rgba(129,140,248,0.1)]"
                          : "bg-[#ffffff] shadow-sm border-[#d9d4c9] text-[#6b6b6b] hover:border-[#b08d3e]/50 hover:shadow-md"
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
                <h3 className="text-[11px] font-black text-[#b08d3e] uppercase tracking-[0.25em] flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-[#b08d3e]/10 flex items-center justify-center text-[10px]">4</span>
                  Content Plan Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Posts per Month</Label>
                    <Input
                      type="number"
                      value={formData.postsPerMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, postsPerMonth: parseInt(e.target.value) }))}
                      className="bg-[#ffffff] border-[#d9d4c9] h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm placeholder:text-[#6b6b6b] placeholder:font-normal"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Reels per Month</Label>
                    <Input
                      type="number"
                      value={formData.reelsPerMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, reelsPerMonth: parseInt(e.target.value) }))}
                      className="bg-[#ffffff] border-[#d9d4c9] h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm placeholder:text-[#6b6b6b] placeholder:font-normal"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Micro Reels per Month</Label>
                    <Input
                      type="number"
                      value={formData.microReelsPerMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, microReelsPerMonth: parseInt(e.target.value) }))}
                      className="bg-[#ffffff] border-[#d9d4c9] h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm placeholder:text-[#6b6b6b] placeholder:font-normal"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-[#b08d3e] uppercase tracking-[0.25em] flex items-center gap-3">
                    <span className="h-5 w-5 rounded-md bg-[#b08d3e]/10 flex items-center justify-center text-[10px]">5</span>
                    Additional Services
                  </h3>
                  <div className="space-y-3">
                    <div onClick={() => setFormData(prev => ({ ...prev, captionHashtags: !prev.captionHashtags }))} className={cn("flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer", formData.captionHashtags ? "bg-[#b08d3e]/10 border-[#b08d3e]/30" : "bg-[#ffffff] border-[#d9d4c9]")}>
                      <div className="flex flex-col">
                        <span className={cn("text-xs font-bold", formData.captionHashtags ? "text-[#b08d3e]" : "text-[#6b6b6b]")}>Caption & Hashtags</span>
                        <span className="text-[9px] text-[#6b6b6b] font-medium">Expert copywriting for all posts</span>
                      </div>
                      <div className={cn("h-5 w-10 rounded-full relative transition-colors p-1", formData.captionHashtags ? "bg-[#b08d3e]" : "bg-[#e6e1d8]")}>
                        <div className={cn("h-3 w-3 rounded-full bg-white transition-all shadow-sm", formData.captionHashtags ? "ml-5" : "ml-0")} />
                      </div>
                    </div>

                    <div onClick={() => setFormData(prev => ({ ...prev, scheduling: !prev.scheduling }))} className={cn("flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer", formData.scheduling ? "bg-[#b08d3e]/10 border-[#b08d3e]/30" : "bg-[#ffffff] border-[#d9d4c9]")}>
                      <div className="flex flex-col">
                        <span className={cn("text-xs font-bold", formData.scheduling ? "text-[#b08d3e]" : "text-[#6b6b6b]")}>Auto Scheduling</span>
                        <span className="text-[9px] text-[#6b6b6b] font-medium">Automated publishing pipeline</span>
                      </div>
                      <div className={cn("h-5 w-10 rounded-full relative transition-colors p-1", formData.scheduling ? "bg-[#b08d3e]" : "bg-[#e6e1d8]")}>
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
                        <Input type="number" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) }))} className="bg-[#ffffff] border-[#d9d4c9] h-11 pl-8 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-black text-sm placeholder:text-[#6b6b6b] placeholder:font-normal" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-[#6b6b6b] ml-1 uppercase tracking-wider">Expires In (Days)</Label>
                      <Input type="number" value={formData.expiresInDays} onChange={(e) => setFormData(prev => ({ ...prev, expiresInDays: parseInt(e.target.value) }))} className="bg-[#ffffff] border-[#d9d4c9] h-11 rounded-xl focus-visible:ring-[#b08d3e]/50 text-[#14110c] font-bold text-sm placeholder:text-[#6b6b6b] placeholder:font-normal" min={1} required />
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
                  className="w-full bg-[#ffffff] border border-[#d9d4c9] rounded-2xl p-4 text-[#14110c] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#d9d4c9] min-h-[100px] placeholder:text-[#6b6b6b] placeholder:font-normal"
                  placeholder="Special instructions, priority notes, or follow-up requirements..."
                />
              </div>
            </form>
          </div>

          <div className="px-6 py-5 border-t border-[#d9d4c9] bg-[#faf8f3] backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] text-[#6b6b6b] font-bold uppercase tracking-widest">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Update Authorization
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="bg-[#ffffff] border-[#d9d4c9] text-[#14110c] hover:bg-[#e6e1d8] h-12 px-6 rounded-xl font-black uppercase tracking-[0.18em] text-[10px] transition-all">Discard</Button>
              <Button form="enterprise-update-form" type="submit" className="bg-[#b08d3e] hover:bg-[#e6e1d8] text-[#14110c] font-black h-12 px-10 rounded-xl shadow-[0_10px_20px_rgba(176,141,62,0.2)] transition-all hover:scale-105 active:scale-95 uppercase tracking-[0.18em] text-[11px]" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="h-5 w-5 mr-3 animate-spin" /> : <ArrowRight className="h-4 w-4 mr-3 stroke-[3px]" />}
                Confirm Updates
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Brand Brief Details Modal */}
      <Dialog open={isBbDetailsOpen} onOpenChange={setIsBbDetailsOpen}>
        <DialogContent contentClassName="p-0" className="bg-[#faf8f3] backdrop-blur-3xl border-[#d9d4c9] sm:max-w-[1100px] rounded-[2.5rem] p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {bbDetailsQuery.isLoading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-[#b08d3e]" />
              <p className="text-[#6b6b6b] font-bold uppercase tracking-widest text-[10px]">Decrypting Brand Data...</p>
            </div>
          ) : details ? (
            <>
              {/* Header */}
              <div className="px-8 py-6 bg-gradient-to-br from-[#14110c]/20 to-transparent border-b border-[#d9d4c9] flex items-center justify-between rounded-t-[2.5rem]">
                <div>
                  <DialogTitle className="text-2xl font-black text-[#14110c] tracking-tighter uppercase">Brand Brief Intel</DialogTitle>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge className="bg-[#b08d3e] text-[#14110c] font-black px-2 py-0.5 rounded-md text-[9px] tracking-widest">{details.restaurantName}</Badge>
                    <span className="text-[#6b6b6b] text-[10px] font-bold uppercase tracking-widest">{details.user.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleDownloadPdf(details.id, details.restaurantName)}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#ffffff] border border-[#d9d4c9] text-[#14110c] hover:bg-[#e6e1d8] transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 text-[#b08d3e] animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 text-[#b08d3e] group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-[11px] font-black uppercase tracking-widest">
                      {isDownloading ? "Generating..." : "Download PDF"}
                    </span>
                  </button>
                  <div className="h-14 w-14 rounded-3xl bg-[#b08d3e]/10 flex items-center justify-center text-[#b08d3e] border border-[#b08d3e]/20">
                    <FileText className="h-7 w-7" />
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide bg-[#faf8f3]">
                {/* Section Generator */}
                {[
                  {
                    title: "01 Identity & Presence",
                    color: "text-[#b08d3e]",
                    bg: "bg-[#b08d3e]/10",
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
                    color: "text-[#b08d3e]",
                    bg: "bg-[#b08d3e]/10",
                    fields: [
                      { label: "Facebook", value: details.facebookPageUrl, isLink: true },
                      { label: "TikTok", value: details.tiktokHandle, isLink: true },
                      { label: "Online Ordering", value: details.onlineOrderingUrl, isLink: true },
                    ]
                  },
                  {
                    title: "03 Brand Voice & Content",
                    color: "text-[#b08d3e]",
                    bg: "bg-[#b08d3e]/10",
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
                    color: "text-[#b08d3e]",
                    bg: "bg-[#b08d3e]/10",
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
                    color: "text-[#b08d3e]",
                    bg: "bg-[#b08d3e]/10",
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
                    color: "text-[#b08d3e]",
                    bg: "bg-[#b08d3e]/10",
                    fields: [
                      { label: "Client Name (Auth)", value: details.clientName },
                      { label: "Talexia Plan", value: details.talexiaPlan },
                      { label: "Authorization Date", value: formatDate(details.submissionDate) },
                    ]
                  },
                ].map((section, idx) => (
                  <div key={idx} className="space-y-4">
                    <h4 className={cn("text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3", section.color)}>
                      <span className={cn("h-6 w-6 rounded-lg flex items-center justify-center text-[10px] border border-[#d9d4c9]", section.bg)}>{idx + 1}</span>
                      {section.title}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {section.fields.map((field, fIdx) => (
                        <div key={fIdx} className="space-y-1 bg-[#ffffff] shadow-sm border border-[#d9d4c9] p-4 rounded-2xl">
                          <p className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-widest">{field.label}</p>
                          {field.isLink && field.value ? (
                            <a href={field.value} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#b08d3e] hover:underline break-all">
                              {field.value}
                            </a>
                          ) : (
                            <p className="text-sm font-medium text-[#14110c] leading-relaxed">{field.value || "—"}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-[#d9d4c9] bg-[#faf8f3] backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-[#6b6b6b] font-bold uppercase tracking-widest">
                  <div className="h-2 w-2 rounded-full bg-[#b08d3e]" />
                  Intel Verified • {formatDate(details.createdAt)}
                </div>
                <Button
                  onClick={() => setIsBbDetailsOpen(false)}
                  className="bg-[#b08d3e] border border-[#b08d3e] text-[#14110c] hover:bg-[#d9b45c] hover:border-[#d9b45c] hover:text-[#14110c] font-black h-12 px-10 rounded-xl uppercase tracking-[0.18em] text-[11px] transition-all"
                >
                  Close Intel
                </Button>
              </div>
            </>
          ) : (
            <div className="h-96 flex items-center justify-center text-[#6b6b6b] font-bold uppercase tracking-widest">Error fetching intel.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
