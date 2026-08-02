"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  MoreHorizontal,
  Calendar,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  Clock,
  Eye,
  Mail,
  User,
  Info,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  ColumnDef,
  VisibilityState,
} from "@tanstack/react-table";

import { apiGet, apiPatch } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SupportDetailsModal } from "@/components/admin/support/SupportDetailsModal";
import { SupportStatusModal } from "@/components/admin/support/SupportStatusModal";
import { AdminPagination } from "@/components/admin/AdminPagination";

// --- Types ---

type SubmissionStatus = "PENDING" | "RESOLVED" | "REPLIED";

interface Submission {
  id: string;
  fullName: string;
  businessName: string;
  email: string;
  websiteHandle: string;
  interests: string[];
  postsPerMonth: string;
  message: string;
  source: string;
  status: SubmissionStatus;
  repliedBy: string | null;
  replyMessage: string | null;
  repliedAt: string | null;
  isResolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
  createdIp: string;
}

interface SubmissionsResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    submissions: Submission[];
  };
}

// --- Helper Components ---

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const s = status.toUpperCase();
  const displayStatus = status.replace(/_/g, " ");
  if (s === "RESOLVED") {
    return (
      <Badge variant="outline" className="bg-[#b08d3e] text-[#14110c] border-[#b08d3e] px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-[0.18em] shadow-sm">
        {displayStatus}
      </Badge>
    );
  }
  if (s === "REPLIED") {
    return (
      <Badge variant="outline" className="bg-[#e6e1d8] text-[#14110c] border-[#d9d4c9] px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-[0.18em]">
        {displayStatus}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-[#b08d3e]/10 text-[#b08d3e] border-[#b08d3e]/30 px-3 py-1 flex items-center gap-1.5 uppercase text-[10px] font-black tracking-[0.18em]">
      {displayStatus}
    </Badge>
  );
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// --- Main Page Component ---

export default function SupportSystemPage() {
  const queryClient = useQueryClient();

  // State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
    source: false,
    createdAt: true,
  });

  // Reset page index when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search, statusFilter]);

  // Main Table Query
  const submissionsQuery = useQuery({
    queryKey: [
      "contact-submissions",
      pagination.pageIndex,
      pagination.pageSize,
      statusFilter,
      search,
    ],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append("page", (pagination.pageIndex + 1).toString());
      params.append("limit", pagination.pageSize.toString());
      if (statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }
      if (search) {
        params.append("search", search);
      }
      return apiGet<SubmissionsResponse>(
        `/api/contact/admin/submissions?${params.toString()}`
      ).then((res) => res.data);
    },
  });

  // Stats Queries
  const pendingQuery = useQuery({
    queryKey: ["contact-submissions-stats", "PENDING"],
    queryFn: () =>
      apiGet<SubmissionsResponse>("/api/contact/admin/submissions?limit=1&status=PENDING").then(
        (res) => res.data.total
      ),
  });

  const repliedQuery = useQuery({
    queryKey: ["contact-submissions-stats", "REPLIED"],
    queryFn: () =>
      apiGet<SubmissionsResponse>("/api/contact/admin/submissions?limit=1&status=REPLIED").then(
        (res) => res.data.total
      ),
  });

  const resolvedQuery = useQuery({
    queryKey: ["contact-submissions-stats", "RESOLVED"],
    queryFn: () =>
      apiGet<SubmissionsResponse>("/api/contact/admin/submissions?limit=1&status=RESOLVED").then(
        (res) => res.data.total
      ),
  });

  // Mutations
  const statusMutation = useMutation({
    mutationFn: (payload: { id: string; status: SubmissionStatus }) =>
      apiPatch<{ success: boolean }>(
        `/api/contact/admin/submissions/${payload.id}/status`,
        { status: payload.status },
      ),
    onSuccess: (_, variables) => {
      toast.success(`Status updated to ${variables.status}`, {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["contact-submissions-stats"] });
    },
    onError: (err: Error) => {
      toast.error("Failed to update status", {
        description: err.message,
        position: "top-right",
      });
    },
  });

  // Client-side filter by name & email (backend ignores the search param)
  const submissions = useMemo(() => {
    const raw = submissionsQuery.data?.submissions ?? [];
    if (!search.trim()) return raw;
    const low = search.trim().toLowerCase();
    return raw.filter(
      (s) =>
        s.fullName.toLowerCase().includes(low) ||
        s.email.toLowerCase().includes(low),
    );
  }, [submissionsQuery.data, search]);

  // Table Columns
  const columns: ColumnDef<Submission>[] = [
    {
      accessorKey: "fullName",
      header: "User",
      cell: ({ row }) => (
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-[#14110c] truncate">
            {row.original.fullName}
          </span>
          <span className="text-[10px] text-[#6b6b6b] font-mono truncate" title={row.original.email}>
            {row.original.email}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "businessName",
      header: "Business",
      cell: ({ row }) => (
        <div className="flex flex-col min-w-0">
          <span className="text-[#14110c] font-medium truncate">
            {row.original.businessName}
          </span>
          <span className="text-[10px] text-[#6b6b6b] truncate" title={row.original.websiteHandle}>
            {row.original.websiteHandle}
          </span>
        </div>
      ),
    },
    // {
    //   accessorKey: "interests",
    //   header: "Interests",
    //   cell: ({ row }) => (
    //     <div className="flex flex-wrap gap-1 max-w-[200px]">
    //       {row.original.interests.slice(0, 2).map((i) => (
    //         <Badge
    //           key={i}
    //           variant="outline"
    //           className="text-[10px] h-5 bg-[#e6e1d8]/30 text-[#14110c]/40 font-light border-[#d9d4c9]/50"
    //         >
    //           {i}
    //         </Badge>
    //       ))}
    //       {row.original.interests.length > 2 && (
    //         <Badge variant="outline" className="text-[10px] h-5">
    //           +{row.original.interests.length - 2}
    //         </Badge>
    //       )}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "createdAt",
      header: "Submitted",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-[#6b6b6b]">
          <Calendar className="h-3 w-3" />
          <span className="text-xs">{formatDate(row.original.createdAt)}</span>
        </div>
      ),
    },
    // {
    //   id: "toggleStatus",
    //   header: "Toggle Status",
    //   cell: ({ row }) => {
    //     const sub = row.original;
    //     const isResolved = sub.status === "RESOLVED";
    //     return (
    //       <div className="flex items-center gap-2">
    //         <Button
    //           variant="outline"
    //           size="sm"
    //           className={`h-7 px-3 text-[10px] font-bold rounded-full border-[#d9d4c9] transition-all ${
    //             isResolved
    //               ? "bg-[#b08d3e]/10 text-[#b08d3e] border-lime-500/20 hover:bg-[#e6e1d8]"
    //               : "bg-[#ffffff] text-[#6b6b6b] border-[#d9d4c9] hover:text-[#14110c]"
    //           }`}
    //           onClick={() =>
    //             statusMutation.mutate({
    //               id: sub.id,
    //               status: isResolved ? "PENDING" : "RESOLVED",
    //             })
    //           }
    //           disabled={statusMutation.isPending}
    //         >
    //           {isResolved ? "RESOLVED" : "MARK AS DONE"}
    //         </Button>
    //       </div>
    //     );
    //   },
    // },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const sub = row.original;
        return (
          <div className="flex justify-start pr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 text-[#6b6b6b] hover:text-[#14110c] hover:bg-[#e6e1d8] rounded-lg"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-[#ffffff] border-[#d9d4c9] text-[#14110c] shadow-2xl rounded-xl p-1"
              >
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-[#6b6b6b] px-2 py-1.5">
                  Action Menu
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#e6e1d8]" />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedSubmission(sub);
                    setIsDetailsOpen(true);
                  }}
                  className="rounded-lg focus:bg-[#e6e1d8] focus:text-[#b08d3e]"
                >
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    statusMutation.mutate({
                      id: sub.id,
                      status: "RESOLVED",
                    })
                  }
                  className="rounded-lg focus:bg-[#e6e1d8] focus:text-[#b08d3e]"
                  disabled={sub.status === "RESOLVED" || statusMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Resolved
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: submissions,
    columns,
    pageCount: submissionsQuery.data?.totalPages ?? -1,
    state: {
      pagination,
      columnVisibility,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#14110c]">Support System</h1>
          <p className="text-sm text-[#6b6b6b]">Analyze and respond to contact form submissions effectively.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="border-[#d9d4c9] bg-[#ffffff] text-[#14110c] hover:bg-[#e6e1d8]"
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["contact-submissions"],
              })
            }
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${submissionsQuery.isFetching ? "animate-spin" : ""}`}
            />
            Refresh List
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#ffffff] border-white/5 p-4 flex items-center gap-4 group hover:bg-[#e6e1d8]/40 transition-colors">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-[#6b6b6b] font-bold uppercase tracking-widest">
              Pending
            </p>
            <p className="text-xl font-bold text-[#14110c]">
              {pendingQuery.data ?? 0}
            </p>
          </div>
        </Card>
        <Card className="bg-[#ffffff] border-white/5 p-4 flex items-center gap-4 group hover:bg-[#e6e1d8]/40 transition-colors">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-[#6b6b6b] font-bold uppercase tracking-widest">
              Replied
            </p>
            <p className="text-xl font-bold text-[#14110c]">
              {repliedQuery.data ?? 0}
            </p>
          </div>
        </Card>
        <Card className="bg-[#ffffff] border-white/5 p-4 flex items-center gap-4 group hover:bg-[#e6e1d8]/40 transition-colors">
          <div className="h-10 w-10 rounded-xl bg-[#b08d3e]/10 flex items-center justify-center text-lime-500">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-[#6b6b6b] font-bold uppercase tracking-widest">
              Resolved
            </p>
            <p className="text-xl font-bold text-[#14110c]">
              {resolvedQuery.data ?? 0}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-end bg-[#ffffff] p-4 rounded-xl border border-[#d9d4c9] shadow-sm">
        <div className="flex-1 space-y-2">
          <label className="text-[10px] uppercase font-bold text-[#6b6b6b] tracking-widest pl-1">
            Search Submissions
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
            <Input
              placeholder="Filter by name and email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#faf8f3] shadow-sm border-[#d9d4c9] rounded-md focus-visible:ring-lime-500/50 h-11"
            />
          </div>
        </div>
        <div className="w-full lg:w-48 space-y-2">
          <label className="text-[10px] uppercase font-bold text-[#6b6b6b] tracking-widest pl-1">
            Status
          </label>
          <Select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#faf8f3] shadow-sm border-[#d9d4c9] rounded-md h-11"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            {/* <option value="REPLIED">Replied</option> */}
            <option value="RESOLVED">Resolved</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-xl border border-[#d9d4c9] bg-[#ffffff] overflow-hidden">
        <div className="w-full">
          <Table className="table-fixed w-full">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[30%]" />
              <col className="w-[12%]" />
              <col className="w-[18%]" />
              <col className="w-[10%]" />
            </colgroup>
            <TableHeader className="bg-[#e6e1d8]/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-[#d9d4c9] hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-[#6b6b6b] py-4 font-semibold uppercase tracking-wider text-[10px]"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {submissionsQuery.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-[#d9d4c9] animate-pulse">
                    <TableCell
                      colSpan={columns.length}
                      className="h-16 bg-[#e6e1d8]/10"
                    />
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-[#d9d4c9] hover:bg-[#e6e1d8]/30 transition-colors group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-48 text-center text-[#6b6b6b]"
                  >
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-[#e6e1d8]/40 flex items-center justify-center">
                        <MessageSquare className="h-8 w-8 opacity-20" />
                      </div>
                      <p className="text-sm font-medium">
                        No submissions found matching your filters.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <AdminPagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          totalItems={submissionsQuery.data?.total ?? 0}
          onPageChange={(page) => table.setPageIndex(page - 1)}
        />
      </Card>

      <SupportDetailsModal
        submissionId={selectedSubmission?.id || null}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      <SupportStatusModal
        submission={selectedSubmission}
        open={isStatusOpen}
        onOpenChange={setIsStatusOpen}
      />
    </div>
  );
}
