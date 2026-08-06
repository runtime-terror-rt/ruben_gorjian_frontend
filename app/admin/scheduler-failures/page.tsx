"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { fromUTC } from "@/lib/timezone";
import { useTimezone } from "@/hooks/use-timezone";
import dayjs from "dayjs";
import {
  AlertCircle,
  Clock,
  RefreshCcw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Info,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { apiGet } from "@/lib/api";
import Link from "next/link";
import { AdminPagination } from "@/components/admin/AdminPagination";

type FailureTicket = {
  id: string;
  postId: string;
  userId: string;
  userEmail: string;
  platform: string[];
  failureReason: string;
  status: "OPEN" | "RESOLVED" | "CLOSED";
  timestamp: string;
  createdAt: string;
};

export default function SchedulerFailuresPage() {
  const { toast } = useToast();
  const { timezone: userTimezone } = useTimezone();
  const [tickets, setTickets] = useState<FailureTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  const fetchTickets = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      const data = await apiGet<any>(`/api/scheduler/failure-tickets?${queryParams.toString()}`);

      const items = data.items || [];
      const meta = data.meta;

      if (meta) {
        setTotalPages(meta.totalPages || 1);
        setTotalCount(meta.totalCount || items.length);
      } else {
        setTotalPages(1);
        setTotalCount(items.length);
      }

      setTickets(items);
    } catch (err: any) {
      console.error("Error fetching failure tickets:", err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load failure tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTickets(currentPage);
  }, [currentPage, fetchTickets]);

  const getStatusBadge = (status: FailureTicket["status"]) => {
    switch (status) {
      case "OPEN":
        return (
          <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
            Open
          </Badge>
        );
      case "RESOLVED":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30">
            Resolved
          </Badge>
        );
      case "CLOSED":
        return (
          <Badge className="bg-[#e6e1d8]/40 text-[#6b6b6b] border-[#d9d4c9]/30">
            Closed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlatformIcon = (platform: string) => {
    const p = platform.toUpperCase();
    if (p === "INSTAGRAM") return <FaInstagram className="h-4 w-4" />;
    if (p === "FACEBOOK") return <FaFacebook className="h-4 w-4" />;
    if (p === "TIKTOK") return <FaTiktok className="h-4 w-4" />;
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#14110c]">Scheduler Failures</h1>
          <p className="text-sm text-[#6b6b6b]">Track and manage post publishing failures reported by the scheduler.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchTickets(currentPage)}
          disabled={loading}
          className="border-[#d9d4c9] hover:bg-[#e6e1d8] text-[#14110c] h-9"
        >
          <RefreshCcw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Card className="border-[#d9d4c9] bg-[#ffffff] backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-[#d9d4c9] bg-[#ffffff]/80">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-[#14110c]">
            <Info className="h-5 w-5 text-[#b08d3e]" />
            Failure Logs
            {totalCount > 0 && (
              <span className="ml-2 text-xs font-normal text-[#6b6b6b] bg-[#e6e1d8] px-2 py-0.5 rounded-full">
                {totalCount} Total
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#faf8f3]">
                <TableRow className="border-[#d9d4c9] hover:bg-transparent">
                  <TableHead className="text-[#6b6b6b] font-semibold">User</TableHead>
                  <TableHead className="text-[#6b6b6b] font-semibold">Platform</TableHead>
                  <TableHead className="text-[#6b6b6b] font-semibold">Failure Reason</TableHead>
                  <TableHead className="text-[#6b6b6b] font-semibold">Status</TableHead>
                  <TableHead className="text-[#6b6b6b] font-semibold">Created At</TableHead>
                  <TableHead className="text-[#6b6b6b] font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-[#6b6b6b]">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#b08d3e] border-t-transparent" />
                        <span className="text-sm">Fetching failure records...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-64 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-2 text-[#6b6b6b]">
                        <div className="h-12 w-12 rounded-full bg-[#e6e1d8] flex items-center justify-center mb-2">
                          <AlertCircle className="h-6 w-6 text-[#6b6b6b]" />
                        </div>
                        <p className="text-sm font-medium">No failure tickets found</p>
                        <p className="text-xs text-[#6b6b6b]">All systems appear to be running smoothly.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="border-[#d9d4c9] hover:bg-[#e6e1d8]/30 transition-colors group"
                    >
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm font-medium text-[#14110c]">
                            <User className="h-3.5 w-3.5 text-[#6b6b6b]" />
                            {ticket.userEmail.split('@')[0]}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#6b6b6b]">
                            <Mail className="h-3 w-3" />
                            {ticket.userEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {ticket.platform.map((p, idx) => (
                            <Badge
                              key={`${ticket.id}-${p}-${idx}`}
                              variant="outline"
                              className="text-[10px] py-0 px-2 border-[#d9d4c9] bg-[#faf8f3] text-[#6b6b6b] uppercase inline-flex items-center gap-1.5 h-6"
                            >
                              {getPlatformIcon(p)}
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div
                          className="text-sm text-[#14110c] line-clamp-2 leading-relaxed"
                          title={ticket.failureReason}
                        >
                          {ticket.failureReason}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(ticket.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-medium text-[#14110c] flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-[#6b6b6b]" />
                            {dayjs(ticket.createdAt).format("MMM D, YYYY")}
                          </div>
                          {/* <div className="text-xs text-[#6b6b6b] ml-5">
                            {dayjs(ticket.createdAt ).format("h:mm A")}
                          </div> */}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/admin/posts?postId=${ticket.postId}`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[#6b6b6b] hover:text-[#14110c] hover:bg-[#e6e1d8] gap-1"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            View Post
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            onPageChange={setCurrentPage}
            isLoading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
