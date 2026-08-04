"use client";

import { useMemo, useState } from "react";
import {
  Clock,
  CheckCircle,
  CreditCard,
  Search,
  RefreshCw,
  MoreHorizontal,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  ColumnDef,
  VisibilityState
} from "@tanstack/react-table";

import { apiGet, apiPost } from "@/lib/api";
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
import { AdminPagination } from "@/components/admin/AdminPagination";

// --- Types ---

type AdminSubscription = {
  id: string;
  userId: string;
  userEmail: string;
  userIsFounder: boolean;
  planCode: string;
  planName: string;
  planCategory: string;
  planIsJewelry: boolean;
  platformLimit: number;
  baseVisualQuota: number | null;
  basePostQuota: number;
  status: string;
  priceType: string;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  createdAt: string;
};

type AdminInvoice = {
  id: string;
  number: string | null;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  hostedInvoiceUrl: string | null;
};

type ConfirmAction =
  | { type: "cancel-schedule"; subscription: AdminSubscription }
  | { type: "cancel-immediate"; subscription: AdminSubscription }
  | { type: "resume"; subscription: AdminSubscription }
  | { type: "refresh"; subscription: AdminSubscription }
  | null;

// --- Helper Components ---

function StatusBadge({ status, cancelAtPeriodEnd }: { status: string; cancelAtPeriodEnd: boolean }) {
  const s = status.toUpperCase();
  const displayStatus = status.replace(/_/g, " ");
  if (s === "ACTIVE") {
    if (cancelAtPeriodEnd) {
      return (
        <Badge variant="outline" className="bg-[#b08d3e] text-[#14110c] border-[#b08d3e] font-black px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] tracking-[0.18em] shadow-sm whitespace-nowrap">
          <Clock className="h-3 w-3 flex-shrink-0" />
          Scheduled to Cancel
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-[#b08d3e]/10 text-[#b08d3e] border-[#b08d3e]/30 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-[0.18em]">
        <CheckCircle className="h-3 w-3" />
        Active
      </Badge>
    );
  }
  if (s === "CANCELED" || s === "CANCELLED") {
    return (
      <Badge variant="outline" className="bg-red-900/10 text-red-900 border-red-900/30 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-[0.18em]">
        <AlertCircle className="h-3 w-3" />
        Canceled
      </Badge>
    );
  }
  if (s === "INCOMPLETE") {
    return (
      <Badge variant="outline" className="bg-[#e6e1d8] text-[#14110c] border-[#d9d4c9] px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-[0.18em]">
        <RefreshCw className="h-3 w-3" />
        Incomplete
      </Badge>
    );
  }
  return <Badge variant="outline" className="bg-[#e6e1d8]/50 text-[#14110c] border-[#d9d4c9] px-3 py-1 uppercase text-[10px] font-black tracking-[0.18em]">{displayStatus}</Badge>;
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
  }).format(amount / 100);
}

// --- Main Component ---

export default function AdminSubscriptionsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [invoiceUserId, setInvoiceUserId] = useState<string | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    platformLimit: false,
    createdAt: false,
  });

  // Queries
  const subscriptionsQuery = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: () => apiGet<AdminSubscription[]>("/api/admin/subscriptions"),
  });

  const invoicesQuery = useQuery({
    queryKey: ["admin-user-invoices", invoiceUserId],
    queryFn: () => invoiceUserId ? apiGet<{ items: AdminInvoice[] }>(`/api/admin/users/${invoiceUserId}/invoices`) : null,
    enabled: !!invoiceUserId,
  });

  // Mutations
  const refreshMutation = useMutation({
    mutationFn: (userId: string) => apiPost(`/api/admin/users/${userId}/refresh-subscription`, {}),
    onSuccess: () => {
      toast({ title: "Subscription refreshed" });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
    }
  });

  const cancelScheduleMutation = useMutation({
    mutationFn: (userId: string) => apiPost(`/api/admin/users/${userId}/cancel-subscription-schedule`, {}),
    onSuccess: () => {
      toast({ title: "Cancellation scheduled for period end" });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
    }
  });

  const cancelImmediateMutation = useMutation({
    mutationFn: (userId: string) => apiPost(`/api/admin/users/${userId}/cancel-subscription-immediately`, {}),
    onSuccess: () => {
      toast({ title: "Subscription canceled immediately", variant: "destructive" });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
    }
  });

  const resumeMutation = useMutation({
    mutationFn: (userId: string) => apiPost(`/api/admin/users/${userId}/resume-subscription`, {}),
    onSuccess: () => {
      toast({ title: "Subscription successfully resumed" });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
    }
  });

  // Filtering Logic
  const filteredData = useMemo(() => {
    let data = subscriptionsQuery.data ?? [];
    if (statusFilter !== "ALL") {
      data = data.filter(s => s.status.toUpperCase() === statusFilter);
    }
    if (search) {
      const low = search.toLowerCase();
      data = data.filter(s => s.userEmail.toLowerCase().includes(low) || s.userId.toLowerCase().includes(low));
    }
    return data;
  }, [subscriptionsQuery.data, statusFilter, search]);

  // Table Columns
  const columns: ColumnDef<AdminSubscription>[] = [
    {
      accessorKey: "userEmail",
      header: "User",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-black">{row.original.userEmail}</span>
          <span className="text-[10px] text-[#6b6b6b] font-mono">{row.original.userId}</span>
        </div>
      ),
    },
    {
      accessorKey: "planName",
      header: "Plan",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-black">{row.original.planName}</span>
          <span className="text-[10px] text-[#6b6b6b]">{row.original.planCategory}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} cancelAtPeriodEnd={row.original.cancelAtPeriodEnd} />,
    },
    {
      accessorKey: "priceType",
      header: "Type",
      cell: ({ row }) => {
        const isFounder = row.original.priceType === "FOUNDER";
        return (
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] h-5 font-bold tracking-wider shadow-sm",
              isFounder 
                ? "bg-[#b08d3e]/10 text-[#8a6d28] border-[#b08d3e]/20" 
                : "bg-[#faf8f3] text-[#14110c] border-[#d9d4c9]"
            )}
          >
            {row.original.priceType}
          </Badge>
        );
      },
    },
    {
      accessorKey: "platformLimit",
      header: "Limit",
    },
    {
      accessorKey: "currentPeriodEnd",
      header: "Next Billing",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-[#6b6b6b]">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(row.original.currentPeriodEnd)}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const sub = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-[#6b6b6b] hover:text-black hover:bg-[#e6e1d8]">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#ffffff] border-[#d9d4c9]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setConfirmAction({ type: "refresh", subscription: sub })}
                className="hover:bg-[#e6e1d8] cursor-pointer"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Sync from Stripe
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setInvoiceUserId(sub.userId)}
                className="hover:bg-[#e6e1d8] cursor-pointer"
              >
                <CreditCard className="mr-2 h-4 w-4" /> View Invoices
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[#e6e1d8]" />

              {sub.status === "ACTIVE" && !sub.cancelAtPeriodEnd && (
                <DropdownMenuItem
                  onClick={() => setConfirmAction({ type: "cancel-schedule", subscription: sub })}
                  className="hover:bg-[#e6e1d8] cursor-pointer text-amber-700"
                >
                  Schedule Cancel
                </DropdownMenuItem>
              )}

              {sub.cancelAtPeriodEnd && (
                <DropdownMenuItem
                  onClick={() => setConfirmAction({ type: "resume", subscription: sub })}
                  className="hover:bg-[#b08d3e]/10 cursor-pointer text-[#b08d3e] font-medium"
                >
                  Resume Sub
                </DropdownMenuItem>
              )}

              {sub.status !== "CANCELED" && (
                <DropdownMenuItem
                  onClick={() => setConfirmAction({ type: "cancel-immediate", subscription: sub })}
                  className="hover:bg-red-500/10 cursor-pointer text-red-600"
                >
                  Cancel Immediately
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    const { type, subscription } = confirmAction;

    if (type === "refresh") refreshMutation.mutate(subscription.userId);
    if (type === "cancel-schedule") cancelScheduleMutation.mutate(subscription.userId);
    if (type === "cancel-immediate") cancelImmediateMutation.mutate(subscription.userId);
    if (type === "resume") resumeMutation.mutate(subscription.userId);

    setConfirmAction(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black">Subscriptions</h1>
          <p className="text-sm text-[#6b6b6b]">Real-time management for Stripe billing and user plans.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="border-[#d9d4c9] bg-[#ffffff] text-black hover:bg-[#e6e1d8]"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] })}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${subscriptionsQuery.isFetching ? "animate-spin" : ""}`} />
            Refresh List
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-end bg-[#ffffff] p-4 rounded-xl border border-[#d9d4c9] shadow-sm">
        <div className="flex-1 space-y-2">
          <label className="text-[10px] uppercase font-bold text-[#6b6b6b] tracking-widest pl-1">Search User</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
            <Input
              placeholder="Filter by email or user ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#faf8f3] shadow-sm border-[#d9d4c9] rounded-md focus-visible:ring-lime-500/50 h-11"
            />
          </div>
        </div>
        <div className="w-full lg:w-48 space-y-2">
          <label className="text-[10px] uppercase font-bold text-[#6b6b6b] tracking-widest pl-1">Status</label>
          <Select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#faf8f3] shadow-sm border-[#d9d4c9] rounded-md h-11"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="CANCELED">Canceled</option>
            <option value="INCOMPLETE">Incomplete</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-xl border border-[#d9d4c9] bg-[#ffffff] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#e6e1d8]/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-[#d9d4c9]">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-[#6b6b6b] py-4 font-semibold">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {subscriptionsQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-[#d9d4c9] animate-pulse">
                  <TableCell colSpan={columns.length} className="h-16 bg-[#e6e1d8]/10" />
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-[#d9d4c9] hover:bg-[#e6e1d8]/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center text-[#6b6b6b]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CreditCard className="h-10 w-10 opacity-20" />
                    <p>No subscriptions found matching your criteria.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <AdminPagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          totalItems={filteredData.length}
          onPageChange={(page) => table.setPageIndex(page - 1)}
        />
      </Card>

      {/* --- Dialogs & Modals --- */}

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent className="bg-[#ffffff] border-[#d9d4c9]">
          <DialogHeader>
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${confirmAction?.type === 'cancel-immediate' ? 'bg-red-500/20' : 'bg-amber-500/20'
              }`}>
              <AlertCircle className={`h-6 w-6 ${confirmAction?.type === 'cancel-immediate' ? 'text-red-600' : 'text-amber-700'
                }`} />
            </div>
            <DialogTitle className="text-center text-xl">
              {confirmAction?.type === 'cancel-immediate' ? 'Cancel Immediately?' :
                confirmAction?.type === 'cancel-schedule' ? 'Schedule Cancellation?' :
                  confirmAction?.type === 'resume' ? 'Resume Subscription?' : 'Sync Subscription?'}
            </DialogTitle>
            <DialogDescription className="text-center text-[#6b6b6b] mt-2">
              {confirmAction?.type === 'cancel-immediate' ?
                'This will terminate the subscription with Stripe right now. The user will lose access immediately.' :
                confirmAction?.type === 'cancel-schedule' ?
                  'The user will keep access until the end of the current billing cycle.' :
                  confirmAction?.type === 'resume' ?
                    'This will undo the scheduled cancellation and allow the subscription to renew normally.' :
                    'This will fetch the latest status and period dates directly from Stripe.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-4 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
              className="border-[#d9d4c9] bg-[#ffffff] text-black hover:bg-[#e6e1d8] hover:text-black font-black px-8 py-6 rounded-2xl transition-all hover:scale-105 active:scale-95 text-base order-2 sm:order-1"
            >
              Go Back
            </Button>
            <Button
              variant={confirmAction?.type === 'cancel-immediate' ? 'destructive' : 'default'}
              onClick={handleConfirmAction}
              className={cn(
                "font-black px-8 py-6 rounded-2xl transition-all hover:scale-105 active:scale-95 text-base order-1 sm:order-2",
                confirmAction?.type === 'cancel-immediate' ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_15px_30px_rgba(225,29,72,0.3)] border-none' :
                  confirmAction?.type === 'resume' ? 'bg-[#b08d3e] hover:bg-lime-600 text-black shadow-[0_15px_30px_rgba(34,197,94,0.3)]' :
                    'bg-[#b08d3e] hover:bg-[#e6e1d8] text-black shadow-[0_15px_30px_rgba(163,230,53,0.3)]'
              )}
              disabled={
                refreshMutation.isPending ||
                cancelScheduleMutation.isPending ||
                cancelImmediateMutation.isPending ||
                resumeMutation.isPending
              }
            >
              Confirm Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoices Sheet/Modal */}
      <Dialog open={!!invoiceUserId} onOpenChange={(open) => !open && setInvoiceUserId(null)}>
        <DialogContent className="bg-[#faf8f3] border-[#d9d4c9] sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#b08d3e]" />
              Invoices History
            </DialogTitle>
            <DialogDescription>
              Billing history and hosted invoice links from Stripe.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto mt-4 px-1">
            <Table>
              <TableHeader className="sticky top-0 bg-[#faf8f3]">
                <TableRow className="border-[#d9d4c9]">
                  <TableHead>Number</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicesQuery.isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse border-[#d9d4c9]">
                      <TableCell colSpan={5} className="h-12 bg-[#ffffff]" />
                    </TableRow>
                  ))
                ) : invoicesQuery.data?.items?.length ? (
                  invoicesQuery.data.items.map((inv) => (
                    <TableRow key={inv.id} className="border-[#d9d4c9] hover:bg-[#e6e1d8]/30 transition-colors text-black">
                      <TableCell className="font-mono text-[10px]">{inv.number ?? inv.id.slice(0, 8)}</TableCell>
                      <TableCell className="font-bold text-black">{formatAmount(inv.amount, inv.currency)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`h-4 text-[9px] ${inv.status === 'paid' ? 'border-lime-500/50 text-[#b08d3e]' : ''
                          }`}>
                          {inv.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{formatDate(inv.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        {inv.hostedInvoiceUrl && (
                          <a
                            href={inv.hostedInvoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-[#b08d3e] hover:text-black transition-colors"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-[#6b6b6b]">
                      No invoices found for this user.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <Button
              variant="outline"
              className="w-full border-[#d9d4c9] bg-[#ffffff] text-black hover:bg-[#e6e1d8] hover:text-black font-black px-8 py-6 rounded-2xl transition-all hover:scale-105 active:scale-95 text-base"
              onClick={() => setInvoiceUserId(null)}
            >
              Close History
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
