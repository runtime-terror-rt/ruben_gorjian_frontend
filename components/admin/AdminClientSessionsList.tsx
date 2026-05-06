"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Camera,
  Video,
  Clock,
  Calendar as CalendarIcon,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import dayjs from "dayjs";
import { useTimezone } from "@/hooks/use-timezone";

interface AdminClientSessionsListProps {
  userId: string;
  onEditSession?: (session: any) => void;
}

export default function AdminClientSessionsList({
  userId,
  onEditSession,
}: AdminClientSessionsListProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { toast } = useToast();
  const { timezone: userTimezone } = useTimezone();

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      // Pass a wide date range to ensure future sessions are fetched
      const startDate = dayjs().subtract(1, "month").toISOString();
      const endDate = dayjs().add(1, "year").toISOString();

      const url = `/api/scheduler/posts?userId=${userId}&all=true&scheduleType=PHOTO_SESSION,VIDEO_SESSION&startDate=${startDate}&endDate=${endDate}&pageSize=100&limit=100`;
      const data = await apiGet<any>(url);

      const rawItems = Array.isArray(data)
        ? data
        : (data.items || data.data?.items || data.data?.posts || data.sessions || data.data || []);
        
      const items = rawItems.map((p: any) => {
        const dateValue = p.scheduledFor || p.scheduledAt || p.date;
        return {
          ...p,
          scheduledAt: dateValue,
          scheduledFor: dateValue
        };
      });
      setSessions(items);
    } catch (err) {
      console.error("Failed to load sessions", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleUpdateStatus = async (sessionId: string, newStatus: string) => {
    try {
      await apiPatch(`/api/scheduler/sessions/${sessionId}`, {
        status: newStatus,
      });
      toast({
        title: "Success",
        description: `Session status updated to ${newStatus}`,
      });
      fetchSessions();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      await apiDelete(`/api/scheduler/posts/${sessionId}`);
      toast({ title: "Success", description: "Session deleted" });
      fetchSessions();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            Scheduled
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            Pending
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            Completed
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 text-lime-400 animate-spin" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center p-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
        <CalendarIcon className="h-12 w-12 text-slate-700 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">
          No sessions found for this client.
        </p>
      </div>
    );
  }

  const sortedSessions = [...sessions].sort((a, b) => {
    // Priority: scheduledAt (the actual event time), then createdAt
    const dateA = new Date(a.scheduledAt || a.scheduledFor || a.createdAt || 0).getTime();
    const dateB = new Date(b.scheduledAt || b.scheduledFor || b.createdAt || 0).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(sortedSessions.length / itemsPerPage);
  const paginatedSessions = sortedSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
          }
          className="border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300"
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Sort by Created{" "}
          {sortOrder === "desc" ? "(Newest First)" : "(Oldest First)"}
        </Button>
      </div>
      <div className="overflow-hidden border border-slate-800 rounded-2xl bg-slate-950/50">
        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="border-slate-800">
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Type
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Title
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Date & Time
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Status
              </TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSessions.map((session) => (
              <TableRow
                key={session.id}
                className="border-slate-800 hover:bg-slate-800/30 transition-colors"
              >
                <TableCell>
                  {session.scheduleType === "PHOTO_SESSION" ? (
                    <div className="flex items-center gap-2 text-lime-400">
                      <Camera className="h-4 w-4" />
                      <span className="text-xs font-bold">Photo</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-400">
                      <Video className="h-4 w-4" />
                      <span className="text-xs font-bold">Video</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium text-white text-sm">
                  {session.sessionTitle ||
                    session.session?.title ||
                    "Untitled Session"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-300 font-bold">
                      {dayjs
                        .tz(
                          session.scheduledAt || session.scheduledFor,
                          userTimezone,
                        )
                        .format("MMM D, YYYY")}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {dayjs
                        .tz(
                          session.scheduledAt || session.scheduledFor,
                          userTimezone,
                        )
                        .format("h:mm A")}{" "}
                      ({session.sessionDurationMinutes || 60}m)
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(session.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-white"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-slate-900 border-slate-800 text-slate-300"
                    >
                      {onEditSession && (
                        <DropdownMenuItem
                          onClick={() => onEditSession(session)}
                          className="gap-2 focus:bg-slate-800 focus:text-white"
                        >
                          <Edit className="h-4 w-4 text-blue-400" /> Edit
                          Session
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateStatus(session.id, "SCHEDULED")
                        }
                        className="gap-2 focus:bg-slate-800 focus:text-white"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />{" "}
                        Mark Scheduled
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateStatus(session.id, "COMPLETED")
                        }
                        className="gap-2 focus:bg-slate-800 focus:text-white"
                      >
                        <CheckCircle2 className="h-4 w-4 text-blue-500" /> Mark
                        Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateStatus(session.id, "CANCELLED")
                        }
                        className="gap-2 focus:bg-slate-800 focus:text-white"
                      >
                        <XCircle className="h-4 w-4 text-rose-500" /> Cancel
                        Session
                      </DropdownMenuItem>
                      <div className="h-px bg-slate-800 my-1" />
                      <DropdownMenuItem
                        onClick={() => handleDelete(session.id)}
                        className="gap-2 text-rose-400 focus:bg-rose-500/10 focus:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900/30">
            <div className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-bold text-white">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-white">
                {Math.min(currentPage * itemsPerPage, sortedSessions.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-white">
                {sortedSessions.length}
              </span>{" "}
              sessions
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="h-8 border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
