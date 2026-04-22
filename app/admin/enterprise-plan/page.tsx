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
  ArrowLeft,
  ArrowRight,
  CheckSquare,
  Camera,
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
  status: "PENDING" | "VIEWED" | "SIGNED_UP" | "PAYMENT_COMPLETED" | "EXPIRED" | "CANCELED";
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
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
    mutationFn: (id: string) => apiPost(`/api/admin/enterprise-plan/invites/${id}/resend`, {}),
    onSuccess: () => {
      toast({ title: "Invite resent" });
      queryClient.invalidateQueries({ queryKey: ["enterprise-invites"] });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiPatch(`/api/admin/enterprise-plan/invites/${id}/cancel`, {}),
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
                  disabled={invite.status === "PAYMENT_COMPLETED" || invite.status === "CANCELED"}
                >
                  <Mail className="mr-3 h-4 w-4 text-amber-400" /> 
                  <span className="font-medium">Resend Email</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-slate-800 my-1" />
                
                {invite.status !== "CANCELED" && invite.status !== "PAYMENT_COMPLETED" && (
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
          { label: "Active Proposals", value: (invitesQuery.data?.items || []).filter(i => i.status === "PENDING" || i.status === "VIEWED").length, icon: Send, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Successful Converts", value: (invitesQuery.data?.items || []).filter(i => i.status === "PAYMENT_COMPLETED").length, icon: ShieldCheck, color: "text-indigo-400", bg: "bg-indigo-400/10" },
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
              <option value="PENDING">PENDING</option>
              <option value="VIEWED">VIEWED</option>
              <option value="SIGNED_UP">SIGNED_UP</option>
              <option value="PAYMENT_COMPLETED">PAYMENT_COMPLETED</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="CANCELED">CANCELED</option>
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
      <Dialog 
        open={isCreateModalOpen} 
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
        }}
      >
        <DialogContent className="bg-slate-950/95 backdrop-blur-3xl border-white/10 sm:max-w-[900px] rounded-[2rem] p-0 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden border">
          <div className="p-8 bg-gradient-to-br from-slate-800/20 to-transparent border-b border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/5 blur-[100px] pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <DialogTitle className="text-3xl font-black text-white tracking-tighter">New Enterprise Proposal</DialogTitle>
                <DialogDescription className="text-slate-500 text-sm font-medium tracking-tight mt-1">
                  Configure custom proposal details for high-value clients.
                </DialogDescription>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-lime-400/10 flex items-center justify-center text-lime-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-950/40">
            <form id="enterprise-proposal-form" onSubmit={handleCreateSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Client Identity Section */}
                <div className="md:col-span-3">
                  <h3 className="text-[11px] font-black text-lime-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <User className="h-3 w-3" /> Client Identity
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">planName</Label>
                      <Input 
                        value={formData.planName}
                        onChange={(e) => setFormData(prev => ({ ...prev, planName: e.target.value }))}
                        className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-lime-400/50 text-white font-bold text-sm"
                        placeholder="e.g. OMEGA ELITE"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">companyName</Label>
                      <Input 
                        value={formData.companyName}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                        className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-lime-400/50 text-white font-bold text-sm"
                        placeholder="Legal Entity"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">fullName</Label>
                      <Input 
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-lime-400/50 text-white font-bold text-sm"
                        placeholder="Full Name"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">email</Label>
                      <Input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-lime-400/50 text-white font-bold text-sm"
                        placeholder="client@company.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Service Logistics */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" /> Service Strategy
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">reelsPerMonth</Label>
                      <Input 
                        type="number"
                        value={formData.reelsPerMonth}
                        onChange={(e) => setFormData(prev => ({ ...prev, reelsPerMonth: parseInt(e.target.value) }))}
                        className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-lime-400/50 text-white font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">microReelsPerMonth</Label>
                      <Input 
                        type="number"
                        value={formData.microReelsPerMonth}
                        onChange={(e) => setFormData(prev => ({ ...prev, microReelsPerMonth: parseInt(e.target.value) }))}
                        className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus-visible:ring-lime-400/50 text-white font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">proPhotoShootFrequency</Label>
                      <Select 
                        value={formData.proPhotoShootFrequency}
                        onChange={(e) => setFormData(prev => ({ ...prev, proPhotoShootFrequency: e.target.value }))}
                        className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus:ring-1 focus:ring-lime-400/50 text-white font-bold text-sm px-3"
                      >
                        <option value="One Time">One Time</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Every 2 Months">Every 2 Months</option>
                        <option value="Quarterly">Quarterly</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">proPhotoShootLength</Label>
                      <Select 
                        value={formData.proPhotoShootLength}
                        onChange={(e) => setFormData(prev => ({ ...prev, proPhotoShootLength: e.target.value }))}
                        className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus:ring-1 focus:ring-lime-400/50 text-white font-bold text-sm px-3"
                      >
                        <option value="1 hour">1 hour</option>
                        <option value="2 hours">2 hours</option>
                        <option value="4 hours">4 hours</option>
                        <option value="6 hours">6 hours</option>
                        <option value="Full Day">Full Day</option>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">socialPlatforms</Label>
                    <div className="flex flex-wrap gap-2">
                      {["INSTAGRAM", "FACEBOOK", "TIKTOK",].map((platform) => (
                        <div 
                          key={platform} 
                          onClick={() => togglePlatform(platform)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer",
                            formData.socialPlatforms.includes(platform) 
                            ? "bg-lime-400/10 border-lime-400/30 text-lime-400" 
                            : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10"
                          )}
                        >
                          <div className={cn(
                            "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                            formData.socialPlatforms.includes(platform) ? "bg-lime-400 border-lime-400" : "border-slate-700"
                          )}>
                            {formData.socialPlatforms.includes(platform) && <CheckSquare className="h-3 w-3 text-slate-950" />}
                          </div>
                          <span className="text-[10px] font-black tracking-wider">{platform}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Financials */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3" /> Financials
                  </h3>
                  <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">amount</Label>
                      <Input 
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                        className="bg-slate-950/50 border-white/5 h-11 rounded-xl focus-visible:ring-lime-400/50 text-lime-400 text-lg font-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">billingCycle</Label>
                      <Select 
                        value={formData.billingCycle}
                        onChange={(e) => setFormData(prev => ({ ...prev, billingCycle: e.target.value }))}
                        className="bg-slate-950/50 border-white/5 h-11 rounded-xl focus:ring-1 focus:ring-lime-400/50 text-white font-bold text-sm px-3"
                      >
                        <option value="MONTHLY">Monthly</option>
                        <option value="YEARLY">Yearly</option>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer" htmlFor="captions">captionHashtags</Label>
                      <Checkbox 
                        id="captions"
                        checked={formData.captionHashtags} 
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, captionHashtags: !!checked }))}
                        className="rounded-md border-slate-700 data-[state=checked]:bg-lime-400 data-[state=checked]:text-slate-950" 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer" htmlFor="scheduling">scheduling</Label>
                      <Checkbox 
                        id="scheduling"
                        checked={formData.scheduling} 
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, scheduling: !!checked }))}
                        className="rounded-md border-slate-700 data-[state=checked]:bg-lime-400 data-[state=checked]:text-slate-950" 
                      />
                    </div>
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">expiresInDays</Label>
                      <Input 
                        type="number"
                        value={formData.expiresInDays}
                        onChange={(e) => setFormData(prev => ({ ...prev, expiresInDays: parseInt(e.target.value) }))}
                        className="bg-slate-950/50 border-white/5 h-11 rounded-xl focus-visible:ring-lime-400/50 text-white font-bold text-sm"
                        min={1}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="p-8 pt-4 border-t border-white/5 bg-slate-950/60 backdrop-blur-md flex items-center justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsCreateModalOpen(false)}
              className="border-white/10 bg-white/5 text-slate-400 h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 hover:text-white transition-all"
            >
              Cancel
            </Button>
            <Button 
              form="enterprise-proposal-form"
              type="submit" 
              className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-black h-12 px-8 rounded-xl shadow-[0_10px_20px_rgba(163,230,53,0.2)] transition-all active:scale-95 uppercase tracking-widest text-[11px]"
              disabled={createInviteMutation.isPending}
            >
              {createInviteMutation.isPending ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Dispatch Proposal
            </Button>
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

                        <div className="flex flex-wrap gap-4 pt-2">
                          <div className={cn("flex items-center gap-2 text-[9px] font-black uppercase tracking-widest", invite.captionHashtags ? "text-lime-400" : "text-slate-700")}>
                            <div className={cn("h-1.5 w-1.5 rounded-full", invite.captionHashtags ? "bg-lime-400" : "bg-slate-800")} /> AI Captions
                          </div>
                          <div className={cn("flex items-center gap-2 text-[9px] font-black uppercase tracking-widest", invite.scheduling ? "text-indigo-400" : "text-slate-700")}>
                            <div className={cn("h-1.5 w-1.5 rounded-full", invite.scheduling ? "bg-indigo-400" : "bg-slate-800")} /> Auto Scheduling
                          </div>
                        </div>
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
    </div>
  );
}
