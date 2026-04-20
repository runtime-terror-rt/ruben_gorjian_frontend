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
  ExternalLink,
  CheckCircle2,
  Clock,
  Building2,
  User,
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

// --- Types ---

type EnterpriseInvite = {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  planCode: string;
  status: "PENDING" | "SENT" | "VIEWED" | "SIGNED_UP" | "PAID" | "EXPIRED" | "CANCELED";
  proposal: {
    planName: string;
    amount: number;
    billingCycle: string;
    currency: string;
    status: string;
    expiresAt: string;
    paidAt: string | null;
  };
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
        <Badge className="bg-lime-500/10 text-lime-400 border-lime-500/20 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-widest">
          <CheckCircle2 className="h-3 w-3" />
          Paid
        </Badge>
      );
    case "PENDING":
    case "SENT":
      return (
        <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-widest">
          <Clock className="h-3 w-3" />
          {s === "SENT" ? "Sent" : "Pending"}
        </Badge>
      );
    case "VIEWED":
      return (
        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-widest">
          <Eye className="h-3 w-3" />
          Viewed
        </Badge>
      );
    case "SIGNED_UP":
      return (
        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-widest">
          <User className="h-3 w-3" />
          Signed Up
        </Badge>
      );
    case "EXPIRED":
    case "CANCELED":
      return (
        <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-widest">
          <XCircle className="h-3 w-3" />
          {s === "EXPIRED" ? "Expired" : "Canceled"}
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
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

// --- Main Component ---

export default function EnterprisePlansPage() {
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
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (search) params.append("search", search);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      return apiGet<InviteListResponse>(`/api/admin/enterprise-plan/invites?${params.toString()}`);
    },
  });

  // Mutations
  const createInviteMutation = useMutation({
    mutationFn: (data: typeof formData) => apiPost("/api/admin/enterprise-plan/invites", data),
    onSuccess: () => {
      toast({ title: "Enterprise invite created successfully" });
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
        title: "Failed to create invite", 
        description: error.message || "An unexpected error occurred",
        variant: "destructive" 
      });
    }
  });

  const resendMutation = useMutation({
    mutationFn: (id: string) => apiPost(`/api/admin/enterprise-plan/invites/${id}/resend`, {}),
    onSuccess: () => {
      toast({ title: "Invite resent successfully" });
      queryClient.invalidateQueries({ queryKey: ["enterprise-invites"] });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiPost(`/api/admin/enterprise-plan/invites/${id}/cancel`, {}),
    onSuccess: () => {
      toast({ title: "Invite canceled successfully" });
      queryClient.invalidateQueries({ queryKey: ["enterprise-invites"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/admin/enterprise-plan/invites/${id}/permanent`),
    onSuccess: () => {
      toast({ title: "Invite permanently deleted" });
      setIsConfirmDeleteOpen(false);
      setInviteToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["enterprise-invites"] });
    }
  });

  // Table Columns
  const columns: ColumnDef<EnterpriseInvite>[] = [
    {
      accessorKey: "companyName",
      header: "Company / Client",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-medium text-slate-200">{row.original.companyName}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <User className="h-3 w-3 text-slate-500" />
            <span className="text-xs text-slate-400">{row.original.fullName}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-slate-300">{row.original.email}</span>
          <span className="text-[10px] text-slate-500 font-mono">{row.original.planCode}</span>
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
      header: "Plan Details",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-slate-300 font-medium">{row.original.proposal.planName}</span>
          <span className="text-xs text-lime-400 font-bold">
            {formatAmount(row.original.proposal.amount, row.original.proposal.currency)} / {row.original.proposal.billingCycle.toLowerCase()}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Sent At",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-slate-400 text-xs">{formatDate(row.original.createdAt)}</span>
          <span className="text-[10px] text-slate-600">by {row.original.sentByAdminEmail}</span>
        </div>
      ),
    },
    {
      accessorKey: "expiresAt",
      header: "Expires At",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(row.original.expiresAt)}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const invite = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedInvite(invite);
                  setIsDetailsModalOpen(true);
                }}
                className="hover:bg-slate-800 cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => resendMutation.mutate(invite.id)}
                className="hover:bg-slate-800 cursor-pointer"
                disabled={invite.status === "PAID" || invite.status === "CANCELED"}
              >
                <Mail className="mr-2 h-4 w-4" /> Resend Invite
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-slate-800" />
              
              {invite.status !== "CANCELED" && invite.status !== "PAID" && (
                <DropdownMenuItem 
                  onClick={() => cancelMutation.mutate(invite.id)}
                  className="hover:bg-amber-500/10 cursor-pointer text-amber-400"
                >
                  <XCircle className="mr-2 h-4 w-4" /> Cancel Invite
                </DropdownMenuItem>
              )}

              <DropdownMenuItem 
                onClick={() => {
                  setInviteToDelete(invite.id);
                  setIsConfirmDeleteOpen(true);
                }}
                className="hover:bg-red-500/10 cursor-pointer text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Permanent Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
    <div className="p-6 space-y-6 max-h-screen overflow-auto scrollbar-hide">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Enterprise Plans</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage custom enterprise plan invitations and proposals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Invite
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["enterprise-invites"] })}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${invitesQuery.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-end bg-slate-900/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
        <div className="flex-1 space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Filter by email, name or company..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 bg-slate-950/50 border-slate-800 focus-visible:ring-lime-500/50 h-11"
            />
          </div>
        </div>
        <div className="w-full lg:w-48 space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-1">Status</label>
          <Select 
            value={statusFilter} 
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="bg-slate-950/50 border-slate-800 h-11">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800">
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="VIEWED">Viewed</SelectItem>
              <SelectItem value="SIGNED_UP">Signed Up</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="CANCELED">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-950/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-white/5 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-slate-500 py-4 font-semibold">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {invitesQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-white/5 animate-pulse">
                  <TableCell colSpan={columns.length} className="h-16 bg-slate-800/10" />
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Building2 className="h-10 w-10 opacity-20" />
                    <p>No enterprise invites found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-white/5 bg-slate-950/20">
          <div className="text-xs text-slate-500 font-medium">
            Showing {invitesQuery.data?.items.length ?? 0} of {invitesQuery.data?.total ?? 0} records
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-slate-900 border-slate-800 h-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-slate-400 px-2">
              Page {page} of {Math.ceil((invitesQuery.data?.total ?? 0) / pageSize) || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil((invitesQuery.data?.total ?? 0) / pageSize)}
              className="bg-slate-900 border-slate-800 h-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* --- Dialogs --- */}

      {/* Create Invite Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Create Enterprise Invite</DialogTitle>
            <DialogDescription className="text-slate-400">
              Configure the enterprise plan and send a custom proposal to the client.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name</Label>
                <Input 
                  id="planName"
                  value={formData.planName}
                  onChange={(e) => setFormData(prev => ({ ...prev, planName: e.target.value }))}
                  className="bg-slate-950 border-slate-800"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input 
                  id="companyName"
                  placeholder="Omega Holdings"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="bg-slate-950 border-slate-800"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName"
                  placeholder="Md Masud Rana"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="bg-slate-950 border-slate-800"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Client Email</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="client@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-slate-950 border-slate-800"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Social Platforms</Label>
              <div className="flex flex-wrap gap-4 p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                {["INSTAGRAM", "FACEBOOK", "TIKTOK", "LINKEDIN", "TWITTER"].map((platform) => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`platform-${platform}`} 
                      checked={formData.socialPlatforms.includes(platform)}
                      onCheckedChange={() => togglePlatform(platform)}
                    />
                    <label 
                      htmlFor={`platform-${platform}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
                    >
                      {platform}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reelsPerMonth">Reels Per Month</Label>
                <Input 
                  id="reelsPerMonth"
                  type="number"
                  value={formData.reelsPerMonth}
                  onChange={(e) => setFormData(prev => ({ ...prev, reelsPerMonth: parseInt(e.target.value) }))}
                  className="bg-slate-950 border-slate-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="microReelsPerMonth">Micro Reels Per Month</Label>
                <Input 
                  id="microReelsPerMonth"
                  type="number"
                  value={formData.microReelsPerMonth}
                  onChange={(e) => setFormData(prev => ({ ...prev, microReelsPerMonth: parseInt(e.target.value) }))}
                  className="bg-slate-950 border-slate-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proPhotoShootFrequency">Photo Shoot Frequency</Label>
                <Input 
                  id="proPhotoShootFrequency"
                  value={formData.proPhotoShootFrequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, proPhotoShootFrequency: e.target.value }))}
                  className="bg-slate-950 border-slate-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proPhotoShootLength">Photo Shoot Length</Label>
                <Input 
                  id="proPhotoShootLength"
                  value={formData.proPhotoShootLength}
                  onChange={(e) => setFormData(prev => ({ ...prev, proPhotoShootLength: e.target.value }))}
                  className="bg-slate-950 border-slate-800"
                />
              </div>
            </div>

            <div className="flex gap-6 p-4 bg-slate-950/50 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="captionHashtags" 
                  checked={formData.captionHashtags}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, captionHashtags: !!checked }))}
                />
                <Label htmlFor="captionHashtags">Captions & Hashtags</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="scheduling" 
                  checked={formData.scheduling}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, scheduling: !!checked }))}
                />
                <Label htmlFor="scheduling">Auto Scheduling</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input 
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                  className="bg-slate-950 border-slate-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingCycle">Billing Cycle</Label>
                <Select 
                  value={formData.billingCycle}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, billingCycle: val }))}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                    <SelectItem value="ONETIME">One Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresInDays">Expires In (Days)</Label>
                <Input 
                  id="expiresInDays"
                  type="number"
                  value={formData.expiresInDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresInDays: parseInt(e.target.value) }))}
                  className="bg-slate-950 border-slate-800"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateModalOpen(false)}
                className="border-slate-800 text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold"
                disabled={createInviteMutation.isPending}
              >
                {createInviteMutation.isPending ? "Creating..." : "Create & Send Invite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-lime-400" />
              Invite Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedInvite && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Status</p>
                  <div className="mt-1"><StatusBadge status={selectedInvite.status} /></div>
                </div>
                <div>
                  <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Plan Code</p>
                  <p className="mt-1 text-slate-200 font-mono">{selectedInvite.planCode}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Company</p>
                  <p className="mt-1 text-slate-200">{selectedInvite.companyName}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Contact Name</p>
                  <p className="mt-1 text-slate-200">{selectedInvite.fullName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Email</p>
                  <p className="mt-1 text-slate-200">{selectedInvite.email}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-lime-400 uppercase tracking-tight">Proposal Information</h4>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold">Plan Name</p>
                    <p className="text-slate-200">{selectedInvite.proposal.planName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold">Amount</p>
                    <p className="text-slate-200">{formatAmount(selectedInvite.proposal.amount, selectedInvite.proposal.currency)} / {selectedInvite.proposal.billingCycle.toLowerCase()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold">Expires At</p>
                    <p className="text-slate-200">{formatDate(selectedInvite.expiresAt)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold">Sent By</p>
                    <p className="text-slate-200">{selectedInvite.sentByAdminEmail}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 text-sm border-t border-slate-800 pt-4">
                <div>
                  <p className="text-slate-500 text-[10px] font-bold">Created At</p>
                  <p className="text-slate-400">{formatDate(selectedInvite.createdAt)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-bold">Viewed At</p>
                  <p className="text-slate-400">{formatDate(selectedInvite.viewedAt)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-bold">Signed Up At</p>
                  <p className="text-slate-400">{formatDate(selectedInvite.signedUpAt)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-bold">Paid At</p>
                  <p className="text-slate-400">{formatDate(selectedInvite.paidAt)}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDetailsModalOpen(false)}
              className="w-full border-slate-800 text-slate-300 hover:bg-slate-800"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <DialogTitle className="text-center text-xl">Delete Invite Permanently?</DialogTitle>
            <DialogDescription className="text-center text-slate-400 mt-2">
              This action cannot be undone. All data related to this invitation will be permanently removed from the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-center">
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmDeleteOpen(false)}
              className="border-slate-800 bg-slate-900/50 text-slate-300"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => inviteToDelete && deleteMutation.mutate(inviteToDelete)}
              className="bg-red-600 hover:bg-red-500"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
