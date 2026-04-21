"use client";

import { useMemo, useState } from "react";
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

import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Select } from "@/components/ui/select";
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
  status: "PENDING" | "SENT" | "VIEWED" | "SIGNED_UP" | "PAID" | "EXPIRED" | "CANCELED";
  proposal?: {
    planName: string;
    amount: number;
    billingCycle: string;
    currency: string;
    status: string;
    expiresAt: string;
    paidAt: string | null;
  };
  // Flat fields from detail view
  planName?: string;
  amount?: number;
  billingCycle?: string;
  currency?: string;
  socialPlatforms?: string[];
  reelsPerMonth?: number;
  microReelsPerMonth?: number;
  proPhotoShootFrequency?: string;
  proPhotoShootLength?: string;
  captionHashtags?: boolean;
  scheduling?: boolean;
  
  createdAt: string;
  expiresAt: string;
  viewedAt: string | null;
  signedUpAt: string | null;
  paidAt: string | null;
  sentByAdminEmail: string;
};

type InviteListResponse = {
  items: EnterpriseInvite[];
  total: number;
  page: number;
  pageSize: number;
};

// --- Helper Components ---

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  switch (s) {
    case "PAID":
      return (
        <Badge className="bg-lime-500/20 text-lime-400 border-lime-400/20 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-widest animate-pulse shadow-[0_0_15px_rgba(163,230,53,0.1)]">
          <CheckCircle2 className="h-3 w-3" />
          Fully Paid
        </Badge>
      );
    case "PENDING":
    case "SENT":
      return (
        <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-widest">
          <Send className="h-3 w-3" />
          {s === "SENT" ? "Sent" : "Created"}
        </Badge>
      );
    case "VIEWED":
      return (
        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-widest">
          <Eye className="h-3 w-3" />
          Client Viewed
        </Badge>
      );
    case "SIGNED_UP":
      return (
        <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/20 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-widest">
          <User className="h-3 w-3" />
          Onboarded
        </Badge>
      );
    case "EXPIRED":
    case "CANCELED":
      return (
        <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-widest">
          <XCircle className="h-3 w-3" />
          {s === "EXPIRED" ? "Offer Expired" : "Voided"}
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
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<EnterpriseInvite | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [inviteToDelete, setInviteToDelete] = useState<string | null>(null);

  // Form State for Create Invite
  const [formData, setFormData] = useState({
    planName: "Enterprise Growth",
    companyName: "",
    fullName: "",
    email: "",
    socialPlatforms: ["INSTAGRAM", "FACEBOOK", "TIKTOK"],
    reelsPerMonth: 20,
    microReelsPerMonth: 30,
    proPhotoShootFrequency: "Monthly",
    proPhotoShootLength: "4 hours",
    captionHashtags: true,
    scheduling: true,
    amount: 1250,
    billingCycle: "MONTHLY",
    expiresInDays: 7
  });

  // Queries
  const invitesQuery = useQuery({
    queryKey: ["enterprise-invites", page, pageSize, search, statusFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
        });
        if (search) params.append("search", search);
        if (statusFilter && statusFilter !== "ALL") {
          params.append("status", statusFilter);
        }
        
        // Using the plural proxy route
        const response = await apiGet<InviteListResponse>(`/api/admin/enterprise-plans?${params.toString()}`);
        return response;
      } catch (err) {
        console.error("Enterprise Plan GET Error:", err);
        throw err;
      }
    },
  });

  // Details Query
  const inviteDetailsQuery = useQuery({
    queryKey: ["enterprise-invite-details", selectedInvite?.id],
    queryFn: () => apiGet<{ invite: EnterpriseInvite }>(`/api/admin/enterprise-plans/${selectedInvite?.id}/details`),
    enabled: !!selectedInvite?.id && isDetailsModalOpen,
  });

  // Mutations
  const createInviteMutation = useMutation({
    mutationFn: (data: typeof formData) => apiPost("/api/admin/enterprise-plans", data),
    onSuccess: () => {
      toast({ title: "Enterprise invite created" });
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["enterprise-invites"] });
      setFormData({
        planName: "Enterprise Growth",
        companyName: "",
        fullName: "",
        email: "",
        socialPlatforms: ["INSTAGRAM", "FACEBOOK", "TIKTOK"],
        reelsPerMonth: 20,
        microReelsPerMonth: 30,
        proPhotoShootFrequency: "Monthly",
        proPhotoShootLength: "4 hours",
        captionHashtags: true,
        scheduling: true,
        amount: 1250,
        billingCycle: "MONTHLY",
        expiresInDays: 7
      });
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
    mutationFn: (id: string) => apiPost(`/api/admin/enterprise-plans/${id}/resend`, {}),
    onSuccess: () => {
      toast({ title: "Invite resent" });
      queryClient.invalidateQueries({ queryKey: ["enterprise-invites"] });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiPost(`/api/admin/enterprise-plans/${id}/cancel`, {}),
    onSuccess: () => {
      toast({ title: "Invite canceled" });
      queryClient.invalidateQueries({ queryKey: ["enterprise-invites"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/admin/enterprise-plans/${id}/permanent`),
    onSuccess: () => {
      toast({ title: "Permanently deleted" });
      setIsConfirmDeleteOpen(false);
      setInviteToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["enterprise-invites"] });
    }
  });

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
          const url = `${window.location.origin}/enterprise/${invite.planCode}`;
          navigator.clipboard.writeText(url);
          toast({ title: "Invite link copied" });
        };

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 rounded-2xl p-2 shadow-2xl">
                <DropdownMenuLabel className="text-[10px] uppercase font-bold text-slate-500 tracking-widest px-3 py-2">Management</DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => {
                    setSelectedInvite(invite);
                    setIsDetailsModalOpen(true);
                  }}
                  className="rounded-lg py-2.5 cursor-pointer focus:bg-slate-800 text-white"
                >
                  <Eye className="mr-3 h-4 w-4 text-blue-400" /> 
                  <span className="font-medium">View Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={copyInviteLink}
                  className="rounded-lg py-2.5 cursor-pointer focus:bg-slate-800 text-white"
                >
                  <Copy className="mr-3 h-4 w-4 text-lime-400" /> 
                  <span className="font-medium">Copy Invite Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => resendMutation.mutate(invite.id)}
                  className="rounded-lg py-2.5 cursor-pointer focus:bg-slate-800 text-white"
                  disabled={invite.status === "PAID" || invite.status === "CANCELED"}
                >
                  <Mail className="mr-3 h-4 w-4 text-amber-400" /> 
                  <span className="font-medium">Resend Email</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-slate-800 my-1" />
                
                {invite.status !== "CANCELED" && invite.status !== "PAID" && (
                  <DropdownMenuItem 
                    onClick={() => cancelMutation.mutate(invite.id)}
                    className="rounded-lg py-2.5 cursor-pointer focus:bg-amber-500/10 text-amber-400"
                  >
                    <XCircle className="mr-3 h-4 w-4" /> 
                    <span className="font-medium">Cancel Invite</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem 
                  onClick={() => {
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
    createInviteMutation.mutate(formData);
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
    <div className="p-6 space-y-8 max-h-screen overflow-auto scrollbar-hide">
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
            Manage custom enterprise proposals and high-value client onboarding.
          </p>
        </div>
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
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-5 w-5 mr-2 stroke-[3px]" />
            New Proposal
          </Button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Value", value: formatAmount((invitesQuery.data?.items || []).reduce((acc, curr) => acc + (curr.proposal?.amount || curr.amount || 0), 0), "usd"), icon: TrendingUp, color: "text-lime-400", bg: "bg-lime-400/10" },
          { label: "Active Proposals", value: (invitesQuery.data?.items || []).filter(i => i.status === "SENT" || i.status === "PENDING" || i.status === "VIEWED").length, icon: Send, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Successful Converts", value: (invitesQuery.data?.items || []).filter(i => i.status === "PAID").length, icon: ShieldCheck, color: "text-indigo-400", bg: "bg-indigo-400/10" },
          { label: "Pipeline Health", value: "98%", icon: Building2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-slate-900/40 border-white/5 overflow-hidden group">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-white tracking-tighter">{stat.value}</p>
                </div>
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6", stat.bg, stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

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
            <Select 
              value={statusFilter} 
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-800/80 border-white/5 h-9 w-full lg:w-44 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300"
            >
              <option value="ALL">All Categories</option>
              <option value="PENDING">Draft Proposals</option>
              <option value="SENT">Sent & Active</option>
              <option value="VIEWED">Client Viewed</option>
              <option value="SIGNED_UP">Onboarded</option>
              <option value="PAID">Fully Paid</option>
              <option value="EXPIRED">Expired Offer</option>
              <option value="CANCELED">Voided</option>
            </Select>
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
                    <TableRow key={row.id} className="border-white/5 hover:bg-white/[0.03] transition-all group border-b last:border-b-0">
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

      {/* --- Modals & Dialogs --- */}

      {/* Create Invite Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 sm:max-w-[750px] max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-none shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="p-8 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-white/5">
            <DialogHeader>
              <div className="h-14 w-14 rounded-2xl bg-lime-400 flex items-center justify-center text-slate-950 mb-4 shadow-[0_0_30px_rgba(163,230,53,0.2)]">
                <Send className="h-7 w-7" />
              </div>
              <DialogTitle className="text-3xl font-black text-white tracking-tight">Create Enterprise Proposal</DialogTitle>
              <DialogDescription className="text-slate-400 text-base font-medium">
                Configure a custom high-value plan and invite your client to join.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleCreateSubmit} className="p-8 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-[10px] font-black text-lime-400">01</div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Client Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Plan Name</Label>
                  <Input 
                    value={formData.planName}
                    onChange={(e) => setFormData(prev => ({ ...prev, planName: e.target.value }))}
                    className="bg-slate-950/50 border-slate-800 h-12 rounded-xl focus-visible:ring-lime-400/50"
                    required
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Company Name</Label>
                  <Input 
                    placeholder="e.g. Omega Holdings"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="bg-slate-950/50 border-slate-800 h-12 rounded-xl focus-visible:ring-lime-400/50"
                    required
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</Label>
                  <Input 
                    placeholder="e.g. Masud Rana"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="bg-slate-950/50 border-slate-800 h-12 rounded-xl focus-visible:ring-lime-400/50"
                    required
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</Label>
                  <Input 
                    type="email"
                    placeholder="e.g. client@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-slate-950/50 border-slate-800 h-12 rounded-xl focus-visible:ring-lime-400/50"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-[10px] font-black text-lime-400">02</div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Plan Configuration</h3>
              </div>
              
              <div className="space-y-4">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Social Platforms</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-950/30 rounded-2xl border border-slate-800">
                  {["INSTAGRAM", "FACEBOOK", "TIKTOK", "LINKEDIN", "X/TWITTER"].map((platform) => (
                    <div key={platform} className="flex items-center space-x-3 bg-slate-900/50 p-3 rounded-xl border border-white/5 transition-colors hover:border-lime-400/20">
                      <Checkbox 
                        id={`platform-${platform}`} 
                        checked={formData.socialPlatforms.includes(platform)}
                        onCheckedChange={() => togglePlatform(platform)}
                        className="h-5 w-5 rounded-md border-slate-700"
                      />
                      <label 
                        htmlFor={`platform-${platform}`}
                        className="text-xs font-bold text-slate-300 cursor-pointer"
                      >
                        {platform}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between ml-1">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reels Per Month</Label>
                    <span className="text-[10px] font-bold text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-full">High Value</span>
                  </div>
                  <Input 
                    type="number"
                    value={formData.reelsPerMonth}
                    onChange={(e) => setFormData(prev => ({ ...prev, reelsPerMonth: parseInt(e.target.value) }))}
                    className="bg-slate-950/50 border-slate-800 h-12 rounded-xl focus-visible:ring-lime-400/30"
                  />
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between ml-1">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Micro Reels Per Month</Label>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">Engagement</span>
                  </div>
                  <Input 
                    type="number"
                    value={formData.microReelsPerMonth}
                    onChange={(e) => setFormData(prev => ({ ...prev, microReelsPerMonth: parseInt(e.target.value) }))}
                    className="bg-slate-950/50 border-slate-800 h-12 rounded-xl focus-visible:ring-lime-400/30"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-[10px] font-black text-lime-400">03</div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Production & Automation</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Photo Shoot Frequency</Label>
                  <Select 
                    value={formData.proPhotoShootFrequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, proPhotoShootFrequency: e.target.value }))}
                    className="bg-slate-950/50 border-slate-800 h-12 rounded-xl font-bold"
                  >
                    <option value="One Time">One Time</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Every 2 Months">Every 2 Months</option>
                    <option value="Quarterly">Quarterly</option>
                  </Select>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Pro Shoot Length</Label>
                  <Select 
                    value={formData.proPhotoShootLength}
                    onChange={(e) => setFormData(prev => ({ ...prev, proPhotoShootLength: e.target.value }))}
                    className="bg-slate-950/50 border-slate-800 h-12 rounded-xl font-bold"
                  >
                    <option value="1 hour">1 hour</option>
                    <option value="2 hours">2 hours</option>
                    <option value="4 hours">4 hours</option>
                    <option value="6 hours">6 hours</option>
                    <option value="Full Day">Full Day</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-slate-950/30 rounded-2xl border border-slate-800 transition-all hover:bg-slate-900/50">
                  <div className="flex flex-col">
                    <Label htmlFor="captionHashtags" className="text-sm font-bold text-slate-200">Captions & Hashtags</Label>
                    <p className="text-[10px] text-slate-500 font-medium tracking-tight">AI optimized brand copywriting</p>
                  </div>
                  <Checkbox 
                    id="captionHashtags" 
                    checked={formData.captionHashtags}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, captionHashtags: !!checked }))}
                    className="h-6 w-6 rounded-md border-slate-700 data-[state=checked]:bg-lime-400 data-[state=checked]:text-slate-950"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-950/30 rounded-2xl border border-slate-800 transition-all hover:bg-slate-900/50">
                  <div className="flex flex-col">
                    <Label htmlFor="scheduling" className="text-sm font-bold text-slate-200">Auto Scheduling</Label>
                    <p className="text-[10px] text-slate-500 font-medium tracking-tight">Fully managed posting queue</p>
                  </div>
                  <Checkbox 
                    id="scheduling" 
                    checked={formData.scheduling}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, scheduling: !!checked }))}
                    className="h-6 w-6 rounded-md border-slate-700 data-[state=checked]:bg-lime-400 data-[state=checked]:text-slate-950"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-[10px] font-black text-lime-400">04</div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Pricing & Expiration</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Proposal Amount ($)</Label>
                  <Input 
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                    className="bg-slate-950/50 border-slate-800 h-12 rounded-xl font-black text-lime-400 text-lg focus-visible:ring-lime-400/50"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Billing Cycle</Label>
                  <Select 
                    value={formData.billingCycle}
                    onChange={(e) => setFormData(prev => ({ ...prev, billingCycle: e.target.value }))}
                    className="bg-slate-950/50 border-slate-800 h-12 rounded-xl font-bold"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                    <option value="ONETIME">One Time</option>
                  </Select>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Offer Expires In</Label>
                  <div className="relative">
                    <Input 
                      type="number"
                      value={formData.expiresInDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiresInDays: parseInt(e.target.value) }))}
                      className="bg-slate-950/50 border-slate-800 h-12 rounded-xl pr-14"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600 uppercase">Days</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 border-slate-800 bg-slate-900/50 text-slate-400 h-14 rounded-2xl font-bold hover:text-white"
              >
                Discard
              </Button>
              <Button 
                type="submit" 
                className="flex-[2] bg-lime-400 hover:bg-lime-300 text-slate-950 font-black h-14 rounded-2xl shadow-[0_15px_30px_rgba(163,230,53,0.2)] transition-all active:scale-95"
                disabled={createInviteMutation.isPending}
              >
                {createInviteMutation.isPending ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                Send Proposal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 sm:max-w-[600px] rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden">
          {inviteDetailsQuery.isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 text-lime-400 animate-spin" />
              <p className="text-slate-400 font-bold animate-pulse">Loading proposal details...</p>
            </div>
          ) : inviteDetailsQuery.data?.invite ? (
            (() => {
              const invite = inviteDetailsQuery.data.invite;
              return (
                <div className="flex flex-col">
                  {/* Modal Header Section */}
                  <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-white/5">
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-14 w-14 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center text-lime-400 shadow-inner">
                        <Building2 className="h-7 w-7" />
                      </div>
                      <StatusBadge status={invite.status} />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-1">{invite.companyName}</h2>
                    <p className="text-slate-400 font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-600" />
                      {invite.fullName}
                    </p>
                  </div>

                  {/* Modal Body Section */}
                  <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide bg-slate-950/20">
                    {/* Visual Lifecycle Timeline */}
                    <div className="relative px-2">
                      <div className="absolute top-[18px] left-[18px] bottom-[18px] w-[2px] bg-slate-800" />
                      <div className="space-y-8 relative z-10">
                        {[
                          { label: "Proposal Created", date: invite.createdAt, icon: Plus, active: !!invite.createdAt, color: "text-blue-400", bg: "bg-blue-400/10" },
                          { label: "Client Viewed", date: invite.viewedAt, icon: Eye, active: !!invite.viewedAt, color: "text-amber-400", bg: "bg-amber-400/10" },
                          { label: "Account Setup", date: invite.signedUpAt, icon: ShieldCheck, active: !!invite.signedUpAt, color: "text-indigo-400", bg: "bg-indigo-400/10" },
                          { label: "Conversion (Paid)", date: invite.paidAt, icon: CheckCircle2, active: !!invite.paidAt, color: "text-lime-400", bg: "bg-lime-400/10" },
                        ].map((step, idx) => (
                          <div key={idx} className="flex gap-6 items-start group">
                            <div className={cn(
                              "h-9 w-9 rounded-xl flex items-center justify-center transition-all border shadow-lg shrink-0",
                              step.active ? cn(step.bg, step.color, "border-white/10") : "bg-slate-900 text-slate-700 border-white/5"
                            )}>
                              <step.icon className="h-4 w-4" />
                            </div>
                            <div className="pt-1.5 flex-1 border-b border-white/[0.03] pb-4 group-last:border-none">
                              <div className="flex items-center justify-between">
                                <p className={cn("text-xs font-black uppercase tracking-widest", step.active ? "text-white" : "text-slate-600")}>
                                  {step.label}
                                </p>
                                {step.active && (
                                  <Badge className="bg-lime-400/10 text-lime-400 text-[8px] font-black uppercase px-1.5 py-0">Completed</Badge>
                                )}
                              </div>
                              <p className={cn("text-[11px] mt-1 font-medium", step.active ? "text-slate-400" : "text-slate-800")}>
                                {step.date ? formatDate(step.date) : "Awaiting event tracking..."}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Official Proposal Section */}
                    <div className="bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                      <div className="bg-gradient-to-r from-lime-400/20 to-transparent p-6 pb-0">
                        <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-lime-400 text-slate-950 text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5">Enterprise Proposal</Badge>
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">ID: {invite.planCode}</span>
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tighter mb-1">{invite.proposal?.planName || invite.planName}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-lime-400 tracking-tighter">
                            {formatAmount(invite.proposal?.amount || invite.amount || 0, invite.proposal?.currency || invite.currency || "usd")}
                          </span>
                          <span className="text-sm font-black text-slate-500 uppercase tracking-widest opacity-50">/ {invite.proposal?.billingCycle || invite.billingCycle}</span>
                        </div>
                      </div>

                      <div className="p-6 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Social Range</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {invite.socialPlatforms?.map((p: string) => (
                              <Badge key={p} variant="outline" className="text-[8px] font-black border-slate-800 text-slate-400 uppercase tracking-tighter">{p}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-rows-2 gap-4">
                          <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/5 flex items-center justify-between px-4">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Reels</span>
                            <span className="text-xs font-black text-white">{invite.reelsPerMonth || 0}</span>
                          </div>
                          <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/5 flex items-center justify-between px-4">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Micro</span>
                            <span className="text-xs font-black text-white">{invite.microReelsPerMonth || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-white/[0.03] mt-2">
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                          <div className={cn("flex items-center gap-1.5", invite.captionHashtags ? "text-lime-400" : "text-slate-700")}>
                            <CheckCircle2 className="h-3 w-3" /> Captions
                          </div>
                          <div className={cn("flex items-center gap-1.5", invite.scheduling ? "text-lime-400" : "text-slate-700")}>
                            <CheckCircle2 className="h-3 w-3" /> Scheduling
                          </div>
                        </div>
                        <div className="text-[10px] font-black text-slate-600 flex items-center gap-2">
                          <Building2 className="h-3 w-3" /> {invite.proPhotoShootFrequency || "N/A"} Shots
                        </div>
                      </div>
                    </div>

                    {/* System Meta */}
                    <div className="px-4 py-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                      <span>Recipient: {invite.email}</span>
                      <span>Authored: {invite.sentByAdminEmail}</span>
                    </div>
                  </div>

                  {/* Modal Footer Section */}
                  <div className="p-8 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDetailsModalOpen(false)}
                      className="w-full border-slate-800 bg-slate-900/50 text-slate-400 h-14 rounded-2xl font-bold hover:text-white transition-all active:scale-95"
                    >
                      Close Summary
                    </Button>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="p-12 flex flex-col items-center justify-center space-y-4 text-center">
              <AlertCircle className="h-12 w-12 text-rose-500" />
              <div>
                <p className="text-white font-black text-xl">System Error</p>
                <p className="text-slate-500 text-sm mt-1">Failed to fetch the requested proposal data.</p>
              </div>
              <Button onClick={() => setIsDetailsModalOpen(false)} variant="outline" className="border-slate-800">Dismiss</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="bg-slate-950 border-none rounded-[2rem] p-8 sm:max-w-[400px] shadow-2xl">
          <DialogHeader className="items-center text-center">
            <div className="h-20 w-20 rounded-3xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <DialogTitle className="text-2xl font-black text-white tracking-tight">Erase Record</DialogTitle>
            <DialogDescription className="text-slate-400 text-sm font-medium mt-2 leading-relaxed text-center">
              This will permanently remove the enterprise invitation record. This action <span className="text-red-400 font-bold underline">cannot be recovered</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-8 flex flex-col gap-3">
            <Button 
              variant="destructive"
              onClick={() => inviteToDelete && deleteMutation.mutate(inviteToDelete)}
              className="bg-red-600 hover:bg-red-500 h-14 rounded-2xl font-black shadow-[0_15px_30px_rgba(220,38,38,0.2)] transition-all active:scale-95"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                "Delete Completely"
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmDeleteOpen(false)}
              className="border-slate-800 bg-slate-900/50 text-slate-400 h-14 rounded-2xl font-bold hover:text-white transition-all active:scale-95"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
