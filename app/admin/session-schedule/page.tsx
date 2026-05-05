"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  Calendar,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutGrid,
  List,
  Mail,
  RefreshCcw,
  User,
  Video
} from "lucide-react";

import dayjs from "dayjs";

import { useSocket } from "@/app/providers/SocketProvider";
import PostFilters, { FilterState } from "@/components/admin/PostFilters";
import { useTimezone } from "@/hooks/use-timezone";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import { apiGet, apiPatch } from "@/lib/api";
import { fromUTC } from "@/lib/timezone";

type Session = {
  id: string;
  scheduleType: "PHOTO_SESSION" | "VIDEO_SESSION";
  scheduledAt: string;
  status: string;
  session?: {
    title: string;
    notes: string;
    durationMinutes: number;
  };
  sessionTitle?: string;
  sessionNotes?: string;
  owner?: {
    id: string;
    name: string | null;
    fullName: string | null;
    email: string;
  };
  user?: {
    id: string;
    name: string | null;
    fullName: string | null;
    email: string;
  };
  assets?: {
    id: string;
    storageKey: string;
    name?: string;
    url?: string;
    mediaType?: string;
  }[];
  media?: {
    id: string;
    storageKey: string;
    url: string;
    mimeType: string;
    mediaType: string;
  }[];
  uploadedAssetIds?: string[];
};

export default function SessionSchedulePage() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<"table" | "calendar">("calendar");
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedDay, setSelectedDay] = useState<dayjs.Dayjs | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { uploadFile, uploading } = useUpload();
  const itemsPerPage = 10;
  const { socket } = useSocket();
  const { timezone, timezoneAbbr } = useTimezone();
  
  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    sessionStatus: "all",
    status: "all",
    platform: "all",
    userId: "",
    userEmail: "",
  });

  const fetchSessions = useCallback(async (page = currentPage, currentFilters = filters) => {
    try {
      setLoading(true);
      // Fetching from unified posts endpoint with session filters
      const isCalendar = view === "calendar";
      const startDate = isCalendar
        ? currentMonth.startOf('month').subtract(1, 'week').toISOString()
        : dayjs().subtract(1, "year").toISOString();
      const endDate = isCalendar
        ? currentMonth.endOf('month').add(1, 'week').toISOString()
        : dayjs().add(5, "year").toISOString();
      
      const queryParams = new URLSearchParams({
        all: "true",
        scheduleType: "PHOTO_SESSION,VIDEO_SESSION"
      });

      if (!isCalendar) {
        queryParams.set("page", page.toString());
        queryParams.set("pageSize", itemsPerPage.toString());
      } else {
        queryParams.set("page", "1");
        queryParams.set("pageSize", "100");
      }

      // Only add date range if no specific user is targeted
      if (!currentFilters.userId && !currentFilters.userEmail) {
        queryParams.set("startDate", startDate);
        queryParams.set("endDate", endDate);
      }

      // Add custom filters
      if (currentFilters.sessionStatus && currentFilters.sessionStatus !== "all") {
        queryParams.set("sessionStatus", currentFilters.sessionStatus);
      }
      if (currentFilters.platform && currentFilters.platform !== "all") {
        queryParams.set("platform", currentFilters.platform);
      }
      if (currentFilters.status && currentFilters.status !== "all") {
        queryParams.set("status", currentFilters.status);
      }
      if (currentFilters.userId) {
        queryParams.set("userId", currentFilters.userId);
      }
      if (currentFilters.userEmail) {
        queryParams.set("userEmail", currentFilters.userEmail);
      }

      const data = await apiGet<any>(`/api/scheduler/posts?${queryParams.toString()}`);
      const items = Array.isArray(data)
        ? data
        : data.items ||
          data.data?.items ||
          data.data?.posts ||
          data.sessions ||
          data.data ||
          [];

      // Update pagination info
      const meta = data.meta || data.data?.meta;
      if (meta) {
        setTotalPages(meta.totalPages || 1);
        setTotalCount(meta.totalCount || items.length);
      } else {
        setTotalPages(1);
        setTotalCount(items.length);
      }

      // Filter for sessions ONLY and sync timezones
      const sessionItems = items
        .filter(
          (p: any) =>
            p.scheduleType === "PHOTO_SESSION" ||
            p.scheduleType === "VIDEO_SESSION",
        )
        .map((p: any) => {
          const dateValue = p.scheduledFor || p.scheduledAt || p.date;
          return {
            ...p,
            scheduledAt: dateValue ? fromUTC(dateValue, timezone).format() : dateValue,
          };
        });

      setSessions(sessionItems);
    } catch (err: any) {
      console.error("Error fetching sessions:", err);

      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, view, currentPage, itemsPerPage, currentMonth, timezone, filters]);

  useEffect(() => {
    fetchSessions(currentPage, filters);
  }, [currentPage, filters, fetchSessions]); // Re-fetch when page or filters change

  useEffect(() => {
    if (!socket) return;
    const handleRefresh = () => fetchSessions();
    socket.on("session:created", handleRefresh);
    socket.on("session:updated", handleRefresh);
    socket.on("session:deleted", handleRefresh);
    socket.on("session:status_changed", handleRefresh);
    return () => {
      socket.off("session:created", handleRefresh);
      socket.off("session:updated", handleRefresh);
      socket.off("session:deleted", handleRefresh);
      socket.off("session:status_changed", handleRefresh);
    };
  }, [socket, fetchSessions]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const apiStatus =
        status === "COMPLETED"
          ? "completed"
          : status === "CANCELLED" || status === "FAILED"
            ? "cancelled"
            : "pending";

      await apiPatch(`/api/scheduler/sessions/${id}/status`, {
        status: apiStatus,
        adminReason: `Status updated to ${status} by Administrator`,
      });

      // Optimistically update local state immediately so UI doesn't
      // revert to PENDING while the background refetch is in-flight
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );

      toast({
        title: "Success",
        description: `Session marked as ${status}`,
      });

      // Sync with backend after a short delay to allow propagation
      setTimeout(() => fetchSessions(), 800);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase();
    switch (s) {
      case "COMPLETED":
      case "POSTED":
      case "COMPLETE":
        return (
          <Badge className="bg-green-500/25 text-green-600 border-green-500/30">
            Completed
          </Badge>
        );

      case "CANCELLED":
      case "CANCELED":
      case "REJECTED":
      case "CANCEL":
      case "FAILED":
        return (
          <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
            Canceled
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20 animate-pulse">
            Pending
          </Badge>
        );
      case "SCHEDULED":
        return (
          <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
            Pending
          </Badge>
        );

      default:
        return (
          <Badge variant="outline" className="text-slate-500 border-slate-800">
            {status}
          </Badge>
        );
    }
  };

  const getSessionTypeBadge = (type: string) => {
    if (type === "PHOTO_SESSION") {
      return (
        <Badge className="bg-lime-400/10 text-lime-400 border-lime-400/20 gap-1">
          <Camera className="h-3 w-3" /> Photo
        </Badge>
      );
    }
    return (
      <Badge className="bg-indigo-400/10 text-indigo-400 border-indigo-400/20 gap-1">
        <Video className="h-3 w-3" /> Video
      </Badge>
    );
  };

  const getCalendarDays = () => {
    const startOfMonth = currentMonth.startOf("month");
    const endOfMonth = currentMonth.endOf("month");
    const startDay = startOfMonth.day();
    const totalDays = endOfMonth.date();

    const days = [];

    // Fill previous month days
    const prevMonthEnd = currentMonth
      .subtract(1, "month")
      .endOf("month")
      .date();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthEnd - i,
        month: "prev",
        date: currentMonth.subtract(1, "month").date(prevMonthEnd - i),
      });
    }

    // Fill current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        month: "current",
        date: currentMonth.date(i),
      });
    }

    // Fill next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        month: "next",
        date: currentMonth.add(1, "month").date(i),
      });
    }

    return days;
  };

  const getSessionsForDay = (date: dayjs.Dayjs) => {
    return sessions.filter((s) => {
      if (!s.scheduledAt) return false;
      return dayjs(s.scheduledAt).format("YYYY-MM-DD") === date.format("YYYY-MM-DD");
    });
  };

  const currentItems = sessions;

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Session Schedule Management
          </h1>
          <p className="text-sm text-slate-400">
            Manage all professional photoshoot and video sessions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("calendar")}
              className={cn(
                "h-7 px-3 text-[10px] font-bold uppercase tracking-wider transition-all",
                view === "calendar"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              <LayoutGrid className="h-3 w-3 mr-1.5" />
              Calendar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("table")}
              className={cn(
                "h-7 px-3 text-[10px] font-bold uppercase tracking-wider transition-all",
                view === "table"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              <List className="h-3 w-3 mr-1.5" />
              Table
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSessions()}
            disabled={loading}
            className="border-slate-700 hover:bg-slate-800 text-slate-300 h-9"
          >
            <RefreshCcw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      <PostFilters 
        type="sessions"
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1); // Reset to first page when filters change
        }} 
        initialFilters={filters}
      />

      {view === "calendar" ? (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="py-4 px-6 border-b border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-5 w-5 text-lime-400" />
              {currentMonth.format("MMMM YYYY")}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white"
                onClick={() =>
                  setCurrentMonth(currentMonth.subtract(1, "month"))
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-400 hover:text-white font-bold uppercase tracking-tighter"
                onClick={() => setCurrentMonth(dayjs())}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white"
                onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b border-slate-800">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-950/30"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 text-xs">
              {getCalendarDays().map((dateObj, idx) => {
                const daySessions = getSessionsForDay(dateObj.date);
                const isToday = dateObj.date.isSame(dayjs(), "day");

                return (
                  <div
                    key={idx}
                    className={cn(
                      "min-h-[100px] p-2 border-r border-b border-slate-800/50 transition-colors",
                      dateObj.month !== "current"
                        ? "bg-slate-900/20 opacity-30"
                        : "bg-transparent",
                      idx % 7 === 6 && "border-r-0",
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center h-6 w-6 rounded-full font-bold",
                          isToday
                            ? "bg-lime-400 text-slate-950"
                            : "text-slate-400",
                        )}
                      >
                        {dateObj.day}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {daySessions.slice(0, 3).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSession(s)}
                          className={cn(
                            "w-full text-left px-1.5 py-1 rounded text-[10px] font-semibold truncate transition-all hover:translate-x-0.5",
                            s.scheduleType === "PHOTO_SESSION"
                              ? "bg-lime-400/10 text-lime-400 hover:bg-lime-400/20"
                              : "bg-indigo-400/10 text-indigo-400 hover:bg-indigo-400/20",
                            (s.status.toUpperCase() === "COMPLETED" ||
                              s.status.toUpperCase() === "COMPLETE") &&
                              "opacity-50 grayscale",
                          )}
                        >
                          <span className="opacity-70 mr-1">
                            {dayjs(s.scheduledAt).format("h:mm A")}
                          </span>
                          {s.session?.title || s.sessionTitle || "Session"}
                        </button>
                      ))}
                      {daySessions.length > 3 && (
                        <button
                          onClick={() => setSelectedDay(dateObj.date)}
                          className="text-[10px] text-slate-400 hover:text-white font-bold pl-1 pt-1 cursor-pointer hover:underline text-left"
                        >
                          + {daySessions.length - 3} more
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-slate-800">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-lime-400" />
              All Scheduled Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-950/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date / Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-lime-400 border-t-transparent" />
                        Loading sessions...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sessions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-48 text-center text-slate-500"
                    >
                      No sessions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((s) => (
                    <TableRow
                      key={s.id}
                      className="border-slate-800 hover:bg-slate-800/30 transition-colors group"
                    >
                      <TableCell>
                        {getSessionTypeBadge(s.scheduleType)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-200">
                            {s.session?.title ||
                              s.sessionTitle ||
                              "Untitled Session"}
                          </span>
                          {(s.session?.notes || s.sessionNotes) && (
                            <span className="text-[10px] text-slate-500 line-clamp-1 italic">
                              Notes: {s.session?.notes || s.sessionNotes}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-200">
                            {s.owner?.fullName ||
                              s.owner?.name ||
                              s.user?.fullName ||
                              s.user?.name ||
                              "Unknown"}
                          </span>
                          <span className="text-xs text-slate-500">
                            {s.owner?.email || s.user?.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(s.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-slate-200">
                            {dayjs(s.scheduledAt).format("MMM D, YYYY")}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {dayjs(s.scheduledAt).format("h:mm A")}
                            <span className="text-slate-500 ml-1">
                              {timezoneAbbr}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                "h-8 border-slate-700 bg-slate-900/50 flex items-center gap-1 px-3 transition-colors",
                                s.status.toUpperCase() === "COMPLETED" ||
                                  s.status.toUpperCase() === "POSTED" ||
                                  s.status.toUpperCase() === "COMPLETE"
                                  ? "text-green-500 hover:bg-slate-800 hover:text-green-400"
                                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
                              )}
                            >
                              Action <ChevronDown className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="end"
                            className="bg-slate-900 border-slate-800 text-slate-300"
                          >
                            {s.status.toUpperCase() !== "COMPLETED" && (
                              <DropdownMenuItem
                                className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer text-emerald-400"
                                onClick={() => updateStatus(s.id, "COMPLETED")}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Complete Session
                              </DropdownMenuItem>
                            )}

                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>

          {totalCount > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/20">
              <div className="text-xs text-slate-500 font-medium">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} sessions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="bg-slate-900 border-slate-800 h-8 px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-slate-400 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages}
                  className="bg-slate-900 border-slate-800 h-8 px-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Day View Modal */}
      <Dialog
        open={!!selectedDay}
        onOpenChange={(o) => !o && setSelectedDay(null)}
      >
        <DialogContent className="max-w-md bg-[#0b0e14] border-slate-800/60 p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-slate-800/40">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-white font-sora">
                Sessions on {selectedDay?.format("MMMM D, YYYY")}
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="p-4 max-h-[65vh] overflow-y-auto space-y-3">
            {selectedDay && getSessionsForDay(selectedDay).map((s) => (
              <div 
                key={s.id} 
                className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex flex-col gap-3 hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSessionTypeBadge(s.scheduleType)}
                    <span className="text-sm font-bold text-slate-200">
                      {s.session?.title || s.sessionTitle || "Untitled Session"}
                    </span>
                  </div>
                  {getStatusBadge(s.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Time
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {dayjs(s.scheduledAt).format("h:mm A")} <span className="text-[10px] text-slate-500">{timezoneAbbr}</span>
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                      <User className="h-3 w-3" /> Client
                    </span>
                    <span className="text-xs font-semibold text-slate-300 truncate">
                      {s.owner?.fullName || s.owner?.name || s.user?.fullName || s.user?.name || "Unknown"}
                    </span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2 h-8 text-xs bg-slate-950/50 border-slate-700 hover:bg-slate-800 hover:text-white transition-colors"
                  onClick={() => {
                    setSelectedSession(s);
                    setSelectedDay(null);
                  }}
                >
                  View Details
                </Button>
              </div>
            ))}
            {selectedDay && getSessionsForDay(selectedDay).length === 0 && (
              <div className="text-center text-slate-500 py-8 text-sm">
                No sessions found for this day.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog
        open={!!selectedSession}
        onOpenChange={(o) => !o && setSelectedSession(null)}
      >
        <DialogContent className="max-w-md bg-[#0a0d14] border-slate-800/60 p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] sm:rounded-3xl">
          {/* Header Area */}
          <div className="relative h-36 w-full overflow-hidden bg-slate-900/50">
             {/* Abstract background blobs for premium feel */}
             <div className="absolute top-[-50%] left-[-20%] h-48 w-48 rounded-full bg-lime-500/10 blur-[50px]" />
             <div className="absolute bottom-[-50%] right-[-20%] h-48 w-48 rounded-full bg-indigo-500/10 blur-[50px]" />
             
             <div className="absolute top-5 right-5 z-10">
                {selectedSession && getStatusBadge(selectedSession.status)}
             </div>

             <div className="absolute bottom-6 left-6 flex items-center gap-4 z-10">
                <div
                  className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg backdrop-blur-md",
                    selectedSession?.scheduleType === "PHOTO_SESSION"
                      ? "bg-lime-400/20 border-lime-400/30 text-lime-400 shadow-lime-500/10"
                      : "bg-indigo-400/20 border-indigo-400/30 text-indigo-400 shadow-indigo-500/10",
                  )}
                >
                  {selectedSession?.scheduleType === "PHOTO_SESSION" ? (
                    <Camera className="h-6 w-6" />
                  ) : (
                    <Video className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white tracking-tight">
                    {selectedSession?.session?.title ||
                      selectedSession?.sessionTitle ||
                      "Untitled Session"}
                  </h4>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">
                    {selectedSession?.scheduleType.replace("_", " ")}
                  </p>
                </div>
             </div>
          </div>

          {selectedSession && (
            <div className="p-6 space-y-5 bg-[#0a0d14]">
              
              {/* Timing Grid */}
              <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex flex-col gap-1.5 transition-all hover:bg-slate-900/60">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
                       <CalendarDays className="h-3.5 w-3.5" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Date</span>
                    </div>
                    <p className="text-sm font-bold text-slate-200">
                      {dayjs(selectedSession.scheduledAt).format("MMM D, YYYY")}
                    </p>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex flex-col gap-1.5 transition-all hover:bg-slate-900/60">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
                       <Clock className="h-3.5 w-3.5" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Time</span>
                    </div>
                    <p className="text-sm font-bold text-slate-200">
                      {dayjs(selectedSession.scheduledAt).format("h:mm A")}
                      <span className="text-slate-500 ml-1.5 text-[10px]">
                        {timezoneAbbr}
                      </span>
                    </p>
                  </div>
              </div>

              {/* Client Info */}
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex items-center justify-between transition-all hover:bg-slate-900/60">
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 ring-4 ring-slate-900/50">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-white">
                        {selectedSession.owner?.fullName ||
                          selectedSession.owner?.name ||
                          selectedSession.user?.fullName ||
                          selectedSession.user?.name ||
                          "Unknown Client"}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <Mail className="h-3 w-3" />
                        {selectedSession.owner?.email ||
                          selectedSession.user?.email}
                      </div>
                    </div>
                  </div>
              </div>

              {/* Notes */}
              {(selectedSession.session?.notes ||
                selectedSession.sessionNotes) && (
                <div className="bg-slate-900/20 border border-slate-800/40 rounded-2xl p-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/30" />
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 flex items-center gap-1.5">
                    <List className="h-3.5 w-3.5" /> Session Notes
                  </h5>
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    {selectedSession.session?.notes ||
                      selectedSession.sessionNotes}
                  </p>
                </div>
              )}

              {/* Attached Assets */}
              {((selectedSession.assets && selectedSession.assets.length > 0) || 
                (selectedSession.media && selectedSession.media.length > 0) || 
                (selectedSession.uploadedAssetIds && selectedSession.uploadedAssetIds.length > 0)) && (
                <div className="bg-slate-900/20 border border-slate-800/40 rounded-2xl p-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-lime-500/30" />
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5" /> Attached Media
                  </h5>
                  <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                    {selectedSession.media && selectedSession.media.length > 0 ? (
                      selectedSession.media.map((m, i) => (
                        <div key={m.id || i} className="group relative bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden transition-all hover:border-lime-400/50">
                          <div className="aspect-square bg-slate-900">
                            {m.mediaType === "IMAGE" || m.mimeType?.startsWith('image/') ? (
                              <img src={m.url} alt="Media" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Video className="h-6 w-6 text-slate-500" />
                              </div>
                            )}
                          </div>
                          <div className="p-2 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">
                              {m.mediaType || (m.mimeType?.startsWith('video/') ? "VIDEO" : "IMAGE")}
                            </span>
                            <a 
                              href={m.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-[9px] font-black text-lime-400 uppercase tracking-widest hover:text-lime-300"
                            >
                              View
                            </a>
                          </div>
                        </div>
                      ))
                    ) : selectedSession.assets && selectedSession.assets.length > 0 ? (
                      selectedSession.assets.map((asset: any, i) => {
                        const url = typeof asset === 'string' ? asset : (asset.url || `https://talexia.s3.us-east-2.amazonaws.com/${asset.storageKey}`);
                        const name = typeof asset === 'string' ? url.split('/').pop() : (asset.name || asset.storageKey?.split('/').pop() || `Asset ${i + 1}`);
                        const isVideo = url?.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/);

                        return (
                          <div key={i} className="group relative bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden transition-all hover:border-lime-400/50">
                            <div className="aspect-square bg-slate-900">
                              {isVideo ? (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Video className="h-6 w-6 text-slate-400" />
                                </div>
                              ) : (
                                <img src={url} alt={name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                              )}
                            </div>
                            <div className="p-2 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">
                                {isVideo ? "VIDEO" : "IMAGE"}
                              </span>
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[9px] font-black text-lime-400 uppercase tracking-widest hover:text-lime-300"
                              >
                                View
                              </a>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      selectedSession.uploadedAssetIds?.map((assetId, i) => (
                        <div key={assetId || i} className="flex flex-col gap-1 text-xs bg-slate-800/40 p-2 rounded-lg border border-slate-700/50">
                          <span className="text-slate-300 font-medium truncate" title={assetId}>
                            Asset ID: {assetId}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 flex items-center gap-3">
                {selectedSession.status.toUpperCase() !== "COMPLETED" &&
                  selectedSession.status.toUpperCase() !== "COMPLETE" && (
                    <Button
                      onClick={() => {
                        updateStatus(selectedSession.id, "COMPLETED");
                        setSelectedSession(null);
                      }}
                      className="flex-1 h-12 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-400 hover:to-emerald-500 text-white shadow-lg shadow-lime-500/20 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5 sm:mr-2" />
                      Complete
                    </Button>
                  )}

              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
