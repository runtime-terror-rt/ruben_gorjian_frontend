"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  History, 
  User, 
  Mail, 
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { AdminPagination } from "@/components/admin/AdminPagination";

// --- Types ---

type CouponUsage = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  usedAt: string;
};

type CouponUsagesResponse = {
  success: boolean;
  message: string;
  coupon: {
    code: string;
    usedCount: number;
    maxUses: number;
  };
  usages: CouponUsage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

// --- Page Component ---

export default function CouponUsagesPage() {
  const params = useParams();
  const router = useRouter();
  const couponId = params.id as string;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // --- Queries ---

  const { data, isLoading } = useQuery({
    queryKey: ["admin-coupon-usages", couponId, page],
    queryFn: () => apiGet<CouponUsagesResponse>(`/api/admin/coupons/${couponId}/usages?page=${page}&limit=20`),
    enabled: !!couponId,
  });

  // --- Table Columns ---

  const columns: ColumnDef<CouponUsage>[] = [
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[#14110c] font-medium">
            <User className="h-3 w-3 text-[#6b6b6b]" />
            {row.original.userName || "Anonymous"}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6b6b6b]">
            <Mail className="h-3 w-3" />
            {row.original.userEmail}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "usedAt",
      header: "Used At",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-[#14110c]">
          <Calendar className="h-4 w-4 text-[#6b6b6b]" />
          {format(new Date(row.original.usedAt), "MMM d, yyyy HH:mm:ss")}
        </div>
      ),
    },
    {
      accessorKey: "id",
      header: "Usage ID",
      cell: ({ row }) => (
        <code className="text-[10px] text-[#6b6b6b] font-mono bg-[#e6e1d8]/50 px-1.5 py-0.5 rounded border border-[#d9d4c9]/50">
          {row.original.id}
        </code>
      ),
    },
  ];

  const table = useReactTable({
    data: data?.usages || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const filteredUsages = useMemo(() => {
    if (!data?.usages) return [];
    if (!search) return data.usages;
    const s = search.toLowerCase();
    return data.usages.filter(u => 
      u.userEmail.toLowerCase().includes(s) || 
      (u.userName && u.userName.toLowerCase().includes(s))
    );
  }, [data?.usages, search]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-full h-10 w-10 text-[#6b6b6b] hover:text-[#14110c] hover:bg-[#e6e1d8]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-[#14110c]">Coupon Usages</h1>
            {data?.coupon && (
              <Badge variant="outline" className="bg-[#b08d3e]/10 text-[#b08d3e] border-[#b08d3e]/20 px-3 py-1 font-mono text-base">
                {data.coupon.code}
              </Badge>
            )}
          </div>
          <p className="text-sm text-[#6b6b6b]">Viewing redemption history for this discount code.</p>
        </div>
      </div>

      {/* Stats Summary */}
      {data?.coupon && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#d9d4c9] bg-[#ffffff] p-4 space-y-1">
            <p className="text-xs text-[#6b6b6b] uppercase tracking-wider font-semibold">Total Redemptions</p>
            <p className="text-2xl font-bold text-[#14110c]">{data.coupon.usedCount}</p>
          </div>
          <div className="rounded-xl border border-[#d9d4c9] bg-[#ffffff] p-4 space-y-1">
            <p className="text-xs text-[#6b6b6b] uppercase tracking-wider font-semibold">Remaining Uses</p>
            <p className="text-2xl font-bold text-[#14110c]">{Math.max(0, data.coupon.maxUses - data.coupon.usedCount)}</p>
          </div>
          <div className="rounded-xl border border-[#d9d4c9] bg-[#ffffff] p-4 space-y-1">
            <p className="text-xs text-[#6b6b6b] uppercase tracking-wider font-semibold">Utilization</p>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold text-[#14110c]">{Math.round((data.coupon.usedCount / data.coupon.maxUses) * 100)}%</p>
              <div className="h-2 flex-1 bg-[#e6e1d8] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#b08d3e] transition-all"
                  style={{ width: `${Math.min(100, (data.coupon.usedCount / data.coupon.maxUses) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usages Table */}
      <div className="rounded-xl border border-[#d9d4c9] bg-[#ffffff] overflow-hidden">
        {/* Table Filter */}
        <div className="p-4 border-b border-[#d9d4c9] bg-[#e6e1d8]/20 flex items-center gap-2">
          <Search className="h-4 w-4 text-[#6b6b6b]" />
          <Input 
            placeholder="Filter by user email or name..."
            className="h-9 bg-transparent border-none text-[#14110c] focus-visible:ring-0 placeholder:text-[#6b6b6b] max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#b08d3e]" />
            <p className="text-[#6b6b6b] text-sm">Loading usage history...</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-[#e6e1d8]/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent border-[#d9d4c9]">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-[#6b6b6b] font-semibold py-4">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {filteredUsages.length ? (
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
                    <TableCell colSpan={columns.length} className="h-32 text-center text-[#6b6b6b]">
                      No redemptions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {data?.pagination && data.pagination.pages > 1 && (
              <AdminPagination
                currentPage={page}
                totalPages={data.pagination.pages}
                totalItems={data.pagination.total}
                onPageChange={setPage}
                isLoading={isLoading}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
