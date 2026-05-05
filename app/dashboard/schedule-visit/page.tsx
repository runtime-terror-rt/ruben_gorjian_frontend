"use client";

import { useSocket } from "@/app/providers/SocketProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSessionContext } from "@/context/SessionContext";
import { useTimezone } from "@/hooks/use-timezone";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import clsx from "clsx";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Calendar as CalendarIcon,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  Loader2,
  ShieldCheck,
  Video,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { VideoSessionUpsellModal } from "@/components/dashboard/VideoSessionUpsellModal";

dayjs.extend(utc);
dayjs.extend(timezone);

type Session = {
  id: string;
  scheduleType: "PHOTO_SESSION" | "VIDEO_SESSION";
  scheduledAt: string;
  scheduledFor?: string; // Added to fix TS error
  date?: string; // Added for completeness
  status: string;
  schedulerStatus: string;
  session?: {
    title: string;
    notes: string;
    durationMinutes: number;
    status: string;
  };
  // Fallback for older data or different API responses
  sessionTitle?: string;
  sessionNotes?: string;
  sessionDurationMinutes?: number;
  media?: {
    id: string;
    storageKey: string;
    url: string;
    mimeType: string;
    mediaType: string;
  }[];
  assets?: string[];
};

export default function ScheduleVisitPage() {
  const { toast } = useToast();
  const { session: userSession } = useSessionContext();
  const { timezone: userTimezone } = useTimezone();
  const { socket } = useSocket();
  const isAdmin =
    userSession?.role === "ADMIN" || userSession?.role === "SUPER_ADMIN";

  type UploadedAsset = { id: string; storageKey: string; name?: string };
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [assetIds, setAssetIds] = useState<string[]>([]);
  const { uploadFile, uploading } = useUpload();

  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [sessionType, setSessionType] = useState<
    "PHOTO_SESSION" | "VIDEO_SESSION"
  >("PHOTO_SESSION");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState(60);

  // Admin only fields
  const [targetUserId, setTargetUserId] = useState("");
  const [adminReason, setAdminReason] = useState("");

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [hasVideoAddon, setHasVideoAddon] = useState(false);
  const [showVideoUpsellModal, setShowVideoUpsellModal] = useState(false);

  useEffect(() => {
    async function checkVideoAddon() {
      try {
        const res = await apiGet<any>("/api/billing/current-plan");
        if (res?.success && res?.subscription) {
          const enabled = !!res.subscription.videoAddonEnabled;
          console.log("[ScheduleVisit] Video addon status:", enabled);
          setHasVideoAddon(enabled);
        }
      } catch (err) {
        console.error("Failed to fetch plan for video addon", err);
      }
    }
    if (!isAdmin) {
      checkVideoAddon();
    } else {
      setHasVideoAddon(true);
    }
  }, [isAdmin]);

  const userBookings = useMemo(() => {
    if (isAdmin) return sessions;

    return sessions.filter((s) => {
      const ownerId = (s as any).userId || (s as any).user?.id;
      return ownerId === userSession?.id;
    });
  }, [sessions, userSession?.id, isAdmin]);

  const totalPages = Math.ceil(userBookings.length / itemsPerPage);

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return userBookings.slice(start, end);
  }, [userBookings, currentPage]);
  useEffect(() => {
    setCurrentPage(1);
  }, [userBookings.length]);

  // Fetch blocked dates
  const fetchSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      // Fetch from unified posts endpoint and filter
      const data = await apiGet<any>("/api/scheduler/posts");
      const items = Array.isArray(data)
        ? data
        : data.items ||
        data.data?.items ||
        data.data?.posts ||
        data.sessions ||
        data.data ||
        [];

      const sessionItems = items
        .filter(
          (p: any) =>
            p.scheduleType === "PHOTO_SESSION" ||
            p.scheduleType === "VIDEO_SESSION",
        )
        .map((p: any) => ({
          ...p,
          scheduledAt: p.scheduledFor || p.scheduledAt || p.date,
        }));
      setSessions(sessionItems);
    } catch (err) {
      console.error("Failed to load sessions", err);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (!socket) return;
    const handleRefresh = () => {
      fetchSessions();
    };
    socket.on("session:created", handleRefresh);
    socket.on("session:updated", handleRefresh);
    socket.on("session:deleted", handleRefresh);
    socket.on("session:status_changed", handleRefresh);
    socket.on("post:created", handleRefresh);
    socket.on("post:updated", handleRefresh);
    socket.on("post:deleted", handleRefresh);
    socket.on("post:status_changed", handleRefresh);
    return () => {
      socket.off("session:created", handleRefresh);
      socket.off("session:updated", handleRefresh);
      socket.off("session:deleted", handleRefresh);
      socket.off("session:status_changed", handleRefresh);
      socket.off("post:created", handleRefresh);
      socket.off("post:updated", handleRefresh);
      socket.off("post:deleted", handleRefresh);
      socket.off("post:status_changed", handleRefresh);
    };
  }, [socket, fetchSessions]);

  const sessionsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    sessions
      .filter((s) => s.status !== "CANCELLED" && s.status !== "REJECTED")
      .forEach((s) => {
        const d = s.scheduledAt || s.scheduledFor || s.date;
        if (!d) return;
        try {
          const dateStr = dayjs.tz(d, userTimezone).format("YYYY-MM-DD");
          map[dateStr] = (map[dateStr] || 0) + 1;
        } catch {
          const dateStr = dayjs(d).format("YYYY-MM-DD");
          map[dateStr] = (map[dateStr] || 0) + 1;
        }
      });
    return map;
  }, [sessions, userTimezone]);

  const calendarDays = useMemo(() => {
    const startOfMonth = currentDate.startOf("month");
    const endOfMonth = currentDate.endOf("month");
    const startDay = startOfMonth.startOf("week");
    const endDay = endOfMonth.endOf("week");

    const days = [];
    let day = startDay;
    while (day.isBefore(endDay) || day.isSame(endDay, "day")) {
      days.push(day);
      day = day.add(1, "day");
    }
    return days;
  }, [currentDate]);

  const handlePrevMonth = () =>
    setCurrentDate((prev) => prev.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate((prev) => prev.add(1, "month"));

  const resetForm = () => {
    setNotes("");
    setTitle("");
    setSelectedDate(null);
    setSelectedTime(""); // Reset to empty to force selection
    setDuration(60);
    setEditingSession(null);
    setAdminReason("");
    setTargetUserId("");
    setAssets([]);
    setAssetIds([]);
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    const date = dayjs(session.scheduledAt);
    setSelectedDate(date);
    setSelectedTime(date.format("HH:mm"));
    setSessionType(session.scheduleType);
    setTitle(session.session?.title || session.sessionTitle || "");
    setNotes(session.session?.notes || session.sessionNotes || "");
    setDuration(
      session.session?.durationMinutes || session.sessionDurationMinutes || 60,
    );

    // Load existing assets if they exist in the session
    if (session.media && session.media.length > 0) {
      setAssets(session.media.map(m => ({
        id: m.id,
        storageKey: m.storageKey,
        name: m.storageKey.split('/').pop() || 'Existing Media'
      })));
      setAssetIds(session.media.map(m => m.id));
    } else {
      setAssets([]);
      setAssetIds([]);
    }

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      toast({
        title: "Missing Date",
        description: "Please select a date for your session.",
        variant: "destructive",
      });
      return;
    }

    if (hasTimeConflict(selectedDate, selectedTime)) {
      toast({
        title: "Time Conflict",
        description:
          "Sessions must have at least 90 minutes gap between them. Please choose a different time.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please provide a title for your session.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Construct the date in the user's photoshoot timezone to avoid jumps
      const scheduledAt = dayjs
        .tz(
          `${selectedDate.format("YYYY-MM-DD")} ${selectedTime}:00`,
          userTimezone,
        )
        .toISOString();

      const payload: any = {
        scheduleType: sessionType,
        scheduledAt,
        sessionTitle: title.trim(),
        sessionNotes: notes.trim(),
        sessionDurationMinutes: duration,
        status: "PENDING",
      };

      if (assetIds.length > 0) {
        payload.uploadedAssetIds = assetIds;
        payload.assetIds = assetIds;
        payload.assetId = assetIds[0];
      } else {
        payload.uploadedAssetIds = [];
        payload.assetIds = [];
        payload.assetId = null;
      }

      if (isAdmin) {
        if (targetUserId.trim()) payload.userId = targetUserId.trim();
        if (adminReason.trim()) payload.adminReason = adminReason.trim();
      }

      const requestBody = payload;

      if (editingSession) {
        await apiPatch<any, any>(
          `/api/scheduler/sessions/${editingSession.id}`,
          requestBody,
        );
      } else {
        await apiPost<any, any>("/api/scheduler/sessions", requestBody);
      }

      toast({
        title: "Success!",
        description: editingSession
          ? "Your session has been updated."
          : "Your session has been scheduled successfully.",
      });

      resetForm();
      // Wait for sessions to be refreshed before allowing another submission
      await fetchSessions();
    } catch (err: any) {
      const errorMsg = err.message || "";
      if (errorMsg.toLowerCase().includes("no remaining video sessions")) {
        setShowVideoUpsellModal(true);
      } else {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isDayBlocked = () => {
    // Allow multiple sessions on same date, no day blocking
    return false;
  };

  const hasTimeConflict = (selectedDate: dayjs.Dayjs, selectedTime: string) => {
    if (!selectedDate) return false;

    const newStart = dayjs.tz(
      `${selectedDate.format("YYYY-MM-DD")} ${selectedTime}:00`,
      userTimezone,
    );

    const newEnd = newStart.add(duration, "minute");

    return sessions.some((s) => {
      if (s.status === "CANCELLED" || s.status === "REJECTED") return false;

      // Ignore if editing own session
      if (editingSession && s.id === editingSession.id) return false;

      const existingStart = dayjs.tz(s.scheduledAt, userTimezone);

      const existingDuration =
        s.session?.durationMinutes || s.sessionDurationMinutes || 60;

      const existingEnd = existingStart.add(existingDuration, "minute");

      // 🔥 90 min buffer rule
      const bufferStart = existingStart.subtract(90, "minute");
      const bufferEnd = existingEnd.add(90, "minute");

      return newStart.isBefore(bufferEnd) && newEnd.isAfter(bufferStart);
    });
  };

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];

    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 20; // 8 PM
    
    let current = selectedDate.hour(startHour).minute(0).second(0);
    const end = selectedDate.hour(endHour).minute(0).second(0);

    const now = dayjs().tz(userTimezone);

    while (current.isBefore(end) || current.isSame(end)) {
      const timeStr = current.format("HH:mm");
      
      // Check if this time slot is in the past
      const isPast = current.isBefore(now, "minute");
      
      // Check for conflicts
      const hasConflict = sessions.some((s) => {
        if (s.status === "CANCELLED" || s.status === "REJECTED") return false;
        if (editingSession && s.id === editingSession.id) return false;

        const existingStart = dayjs.tz(s.scheduledAt, userTimezone);
        const existingDuration = s.session?.durationMinutes || s.sessionDurationMinutes || 60;
        const existingEnd = existingStart.add(existingDuration, "minute");

        // 90 min buffer rule
        const bufferStart = existingStart.subtract(90, "minute");
        const bufferEnd = existingEnd.add(90, "minute");

        const slotStart = current;
        const slotEnd = current.add(duration, "minute");

        return slotStart.isBefore(bufferEnd) && slotEnd.isAfter(bufferStart);
      });

      slots.push({
        time: timeStr,
        label: current.format("h:mm A"),
        available: !hasConflict && !isPast,
        reason: isPast ? "Past" : hasConflict ? "Conflict" : null
      });

      current = current.add(30, "minute");
    }

    return slots;
  }, [selectedDate, sessions, editingSession, userTimezone, duration]);

  const isDayInPast = (day: dayjs.Dayjs) => {
    return day.isBefore(dayjs(), "day");
  };

  const handleFiles = async (files?: FileList | null) => {
    if (!files || files.length === 0) return;
    const uploaded: UploadedAsset[] = [];
    for (const file of Array.from(files)) {
      try {
        const asset = await uploadFile(file);
        uploaded.push({
          id: asset.id,
          storageKey: asset.storageKey,
          name: file.name,
        });
      } catch (err) {
        toast({ title: "Upload Failed", description: err instanceof Error ? err.message : "Upload failed", variant: "destructive" });
        break;
      }
    }
    if (uploaded.length > 0) {
      setAssets((prev) => [...prev, ...uploaded]);
      setAssetIds((prev) => [...prev, ...uploaded.map((a) => a.id)]);
    }
  };

  return (
    <div className="max-w-9xl mx-auto space-y-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-black text-white tracking-tight">
            Session <span className="text-lime-400">Scheduling</span>
          </h1>
          {isAdmin && (
            <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                Admin Mode
              </span>
            </div>
          )}
        </div>
        <p className="text-slate-400 text-lg">
          Book your professional photoshoot or video session. One slot per day
          for maximum quality.
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Calendar Selection */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
            <CardHeader className="border-b border-slate-800 bg-slate-800/20 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-lime-400/10 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-lime-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white">
                    Select Date
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevMonth}
                    className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-white h-9 w-9 rounded-lg"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-white font-semibold min-w-[120px] text-center">
                    {currentDate.format("MMMM YYYY")}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextMonth}
                    className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-white h-9 w-9 rounded-lg"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, idx) => {
                  const isCurrentMonth = day.isSame(currentDate, "month");
                  const isToday = day.isSame(dayjs(), "day");
                  const isSelected = selectedDate?.isSame(day, "day");
                  const isPast = isDayInPast(day);
                  const sessionCount =
                    sessionsByDate[day.format("YYYY-MM-DD")] || 0;
                  const canSelect = isCurrentMonth && !isPast;

                  return (
                    <button
                      key={idx}
                      disabled={!canSelect}
                      type="button"
                      onClick={() => setSelectedDate(day)}
                      className={clsx(
                        "relative flex flex-col items-center justify-center aspect-square rounded-xl transition-all duration-300 group",
                        !isCurrentMonth && "opacity-20 cursor-default",
                        canSelect &&
                        "hover:bg-lime-400/10 hover:border-lime-400/30 border border-transparent",
                        isSelected &&
                        "bg-lime-400 text-slate-900 font-bold shadow-[0_0_25px_rgba(163,230,53,0.4)] border-lime-400 scale-105 z-10",
                        !isSelected &&
                        isCurrentMonth &&
                        !isPast &&
                        "bg-slate-800/40 text-slate-300 hover:scale-105",
                        isToday &&
                        !isSelected &&
                        "border-lime-400/50 text-lime-400 font-bold",
                        isPast &&
                        isCurrentMonth &&
                        "bg-slate-900/20 text-slate-700 cursor-not-allowed",
                      )}
                    >
                      <span className="text-sm">{day.date()}</span>
                      {sessionCount > 0 && (
                        <div className="absolute top-1 right-1 bg-indigo-500 text-white text-[8px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                          {sessionCount}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap gap-6 text-[10px] text-slate-500 border-t border-slate-800/50 pt-6 uppercase font-bold tracking-widest">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-slate-800" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.6)]" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span>Sessions Booked</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Session Details */}
        <div className="lg:col-span-4 space-y-6">
          <Card
            className={clsx(
              "border-slate-800 bg-slate-900/40 backdrop-blur-xl border-l-4 transition-all duration-500 shadow-2xl",
              editingSession ? "border-l-indigo-400" : "border-l-lime-400",
            )}
          >
            <CardHeader className="px-6 py-6 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white">
                    {editingSession ? "Edit Session" : "Session Details"}
                  </CardTitle>
                  <p className="text-slate-400 text-sm">
                    {editingSession
                      ? "Update your session requirements."
                      : "Fill in the requirements for your booking."}
                  </p>
                </div>
                {editingSession && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetForm}
                    className="text-slate-500 hover:text-white"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">
                    Session Type
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSessionType("PHOTO_SESSION")}
                      className={clsx(
                        "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300",
                        sessionType === "PHOTO_SESSION"
                          ? "bg-lime-400/10 border-lime-400 text-white"
                          : "bg-slate-800/50 border-transparent text-slate-500 hover:border-slate-700 hover:text-slate-300",
                      )}
                    >
                      <Camera
                        className={clsx(
                          "h-8 w-8",
                          sessionType === "PHOTO_SESSION"
                            ? "text-lime-400"
                            : "text-slate-600",
                        )}
                      />
                      <span className="font-bold">Photoshoot</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!hasVideoAddon && !isAdmin) {
                          setShowVideoUpsellModal(true);
                          return;
                        }
                        setSessionType("VIDEO_SESSION");
                        // Clear any uploaded assets when switching to video session
                        setAssets([]);
                        setAssetIds([]);
                      }}
                      className={clsx(
                        "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 relative",
                        sessionType === "VIDEO_SESSION"
                          ? "bg-lime-400/10 border-lime-400 text-white"
                          : "bg-slate-800/50 border-transparent text-slate-500 hover:border-slate-700 hover:text-slate-300",
                        !hasVideoAddon && !isAdmin && "opacity-50 hover:border-transparent hover:text-slate-500 cursor-not-allowed"
                      )}
                    >
                      <Video
                        className={clsx(
                          "h-8 w-8",
                          sessionType === "VIDEO_SESSION"
                            ? "text-lime-400"
                            : "text-slate-600",
                        )}
                      />
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold">Video Session</span>
                        {!hasVideoAddon && !isAdmin && (
                          <span className="text-[9px] text-red-400/80 font-black uppercase tracking-widest">
                            Requires Addon
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="title"
                        className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-3 w-3 text-lime-400" />{" "}
                        Session Title
                      </Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Wedding Shoot"
                        className="bg-slate-800/50 border-slate-700 text-white h-12 rounded-xl focus:ring-lime-400/50 transition-all"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label
                        className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
                      >
                        <Clock className="h-3 w-3 text-lime-400" /> Select Time Slot
                      </Label>
                      {!selectedDate ? (
                        <div className="p-4 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl text-center">
                          <p className="text-xs text-slate-500">Please select a date first</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-hide">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setSelectedTime(slot.time)}
                              className={clsx(
                                "py-2 px-1 rounded-lg text-[11px] font-bold transition-all border",
                                selectedTime === slot.time
                                  ? "bg-lime-400 border-lime-400 text-slate-900 shadow-[0_0_15px_rgba(163,230,53,0.3)]"
                                  : slot.available
                                    ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-lime-400/50 hover:bg-lime-400/5"
                                    : "bg-slate-900/20 border-transparent text-slate-600 cursor-not-allowed opacity-50"
                              )}
                            >
                              {slot.label}
                            </button>
                          ))}
                        </div>
                      )}
                      {selectedTime && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-lime-400/10 border border-lime-400/20 rounded-lg">
                           <Clock className="h-3 w-3 text-lime-400" />
                           <span className="text-xs font-bold text-lime-400">Selected: {availableSlots.find(s => s.time === selectedTime)?.label || selectedTime}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="duration"
                      className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
                    >
                      <Loader2 className="h-3 w-3 text-lime-400" /> Duration
                      (Minutes)
                    </Label>
                    <div className="relative group">
                      <Input
                        id="duration"
                        type="number"
                        min="15"
                        value={duration === 0 ? "" : duration}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setDuration(0);
                          } else {
                            const num = parseInt(val, 10);
                            setDuration(isNaN(num) ? 0 : num);
                          }
                        }}
                        onBlur={() => {
                          if (duration < 15) setDuration(15);
                        }}
                        className="bg-slate-800/50 border-slate-700 text-white h-12 rounded-xl focus:ring-lime-400/50 pr-12"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 uppercase">
                        Min
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="notes"
                      className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-3 w-3 text-lime-400" /> Notes /
                      Requirements
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Share any specific requirements or location details..."
                      rows={4}
                      className="bg-slate-800/50 border-slate-700 text-white rounded-xl focus:ring-lime-400/50 resize-none transition-all"
                    />
                  </div>

                  {sessionType === "PHOTO_SESSION" && (
                    <div className="space-y-2">
                      <Label className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <Camera className="h-3 w-3 text-lime-400" /> Upload Photos / Videos (Optional)
                      </Label>
                      <div className="rounded-lg border border-dashed border-slate-700 bg-slate-800/30 p-3">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={(e) => handleFiles(e.target.files)}
                          className={clsx(
                            "text-xs text-slate-200 file:mr-3 file:rounded-md file:border file:border-slate-700 file:bg-slate-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-100 hover:file:bg-slate-700"
                          )}
                        />
                        <div className="mt-2 text-xs text-slate-400">
                          {uploading && <span>Uploading...</span>}
                          {assets.length > 0 && !uploading && (
                            <span className="text-lime-300">
                              {assets.length} file(s) uploaded
                            </span>
                          )}
                        </div>
                        {assets.length > 0 && (
                          <div className="mt-3 space-y-1 max-h-28 overflow-auto">
                            {assets.map((asset) => {
                              const isSelected = assetIds.includes(asset.id);
                              return (
                                <label
                                  key={asset.id}
                                  className={clsx(
                                    "flex items-center gap-2 text-xs text-slate-200 p-1.5 rounded cursor-pointer hover:bg-slate-800/50",
                                    isSelected && "bg-slate-800/70 border border-lime-400/50"
                                  )}
                                >
                                  <input
                                    type="checkbox"
                                    name="asset"
                                    value={asset.id}
                                    checked={isSelected}
                                    onChange={() => {
                                      setAssetIds((prev) =>
                                        prev.includes(asset.id)
                                          ? prev.filter((id) => id !== asset.id)
                                          : [...prev, asset.id]
                                      );
                                    }}
                                    className="accent-lime-400"
                                  />
                                  <span className="truncate flex-1">{asset.name || asset.storageKey}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {isAdmin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="pt-4 space-y-4 border-t border-slate-800 mt-4"
                    >
                      <div className="flex items-center gap-2 text-amber-500">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Admin Controls
                        </span>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="userId"
                          className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                          Client User ID (Optional)
                        </Label>
                        <Input
                          id="userId"
                          value={targetUserId}
                          onChange={(e) => setTargetUserId(e.target.value)}
                          placeholder="e.g. user_123"
                          className="bg-amber-500/5 border-amber-500/20 text-white h-12 rounded-xl focus:ring-amber-500/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="adminReason"
                          className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                          Admin Reason / Note
                        </Label>
                        <Input
                          id="adminReason"
                          value={adminReason}
                          onChange={(e) => setAdminReason(e.target.value)}
                          placeholder="e.g. Rescheduled by request"
                          className="bg-amber-500/5 border-amber-500/20 text-white h-12 rounded-xl focus:ring-amber-500/50"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={
                    submitting ||
                    uploading ||
                    !selectedDate ||
                    (isDayBlocked() && !editingSession)
                  }
                  className={clsx(
                    "w-full h-14 text-lg font-black tracking-widest uppercase transition-all duration-500 rounded-2xl",
                    selectedDate && (!isDayBlocked() || editingSession)
                      ? editingSession
                        ? "bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_10px_30px_rgba(99,102,241,0.3)]"
                        : "bg-lime-400 hover:bg-lime-300 text-slate-900 shadow-[0_10px_30px_rgba(163,230,53,0.3)]"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed",
                  )}
                >
                  {submitting ? (
                    <span className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />{" "}
                      {editingSession ? "Updating..." : "Scheduling..."}
                    </span>
                  ) : uploading ? (
                    <span className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />{" "}
                      Uploading Media...
                    </span>
                  ) : isDayBlocked() && !editingSession ? (
                    "Date Already Booked"
                  ) : editingSession ? (
                    "Update Session"
                  ) : selectedDate ? (
                    `Request for ${selectedDate.format("MMM D")}`
                  ) : (
                    "Select a Date to Continue"
                  )}
                </Button>

                {isDayBlocked() && !editingSession && (
                  <p className="text-[10px] text-center text-rose-400 uppercase tracking-[0.2em] font-bold">
                    This date is already taken. Please select another.
                  </p>
                )}

                <p className="text-[10px] text-center text-slate-500 uppercase tracking-[0.2em] font-bold">
                  All sessions are reviewed by our team
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bookings List (Moved below for better layout balance) */}
      <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-xl mt-8">
        <CardHeader className="border-b border-slate-800 bg-slate-800/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-400/10 rounded-lg">
                <History className="h-5 w-5 text-indigo-400" />
              </div>
              <CardTitle className="text-xl font-bold text-white">
                Your Bookings
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingSessions ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 text-lime-400 animate-spin" />
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                Loading sessions...
              </p>
            </div>
          ) : userBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="p-4 bg-slate-800/50 rounded-full mb-4">
                <CalendarDays className="h-8 w-8 text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium">
                No sessions scheduled yet.
              </p>
              <p className="text-slate-600 text-sm mt-1">
                Book your first professional photoshoot today!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {paginatedBookings.map((s) => (
                <div
                  key={s.id}
                  className={clsx(
                    "group flex items-center justify-between p-4 transition-all duration-300",
                    editingSession?.id === s.id
                      ? "bg-lime-400/5 border-l-4 border-lime-400"
                      : "hover:bg-slate-800/30 border-l-4 border-transparent",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={clsx(
                        "p-3 rounded-xl",
                        s.scheduleType === "PHOTO_SESSION"
                          ? "bg-amber-400/10 text-amber-400"
                          : "bg-indigo-400/10 text-indigo-400",
                      )}
                    >
                      {s.scheduleType === "PHOTO_SESSION" ? (
                        <Camera className="h-5 w-5" />
                      ) : (
                        <Video className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-bold">
                        {s.session?.title ||
                          s.sessionTitle ||
                          "Untitled Session"}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {dayjs(s.scheduledAt).format("MMM D, YYYY")}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {dayjs(s.scheduledAt).format("HH:mm")}
                        </span>
                        <span
                          className={clsx(
                            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                            s.status?.toUpperCase() === "SCHEDULED" ||
                              s.status?.toUpperCase() === "COMPLETED"
                              ? "bg-green-500/10 text-green-500"
                              : s.status?.toUpperCase() === "PENDING"
                                ? "bg-amber-500/10 text-amber-500 animate-pulse"
                                : "bg-slate-700/30 text-slate-500",
                          )}
                        >
                          {s.status}
                        </span>
                      </div>

                      {/* Media Display */}
                      {((s.media && s.media.length > 0) || (s.assets && s.assets.length > 0)) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {s.media && s.media.length > 0 ? (
                            s.media.slice(0, 4).map((m, i) => (
                              <a 
                                key={m.id} 
                                href={m.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="relative h-10 w-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 group/media transition-transform hover:scale-110 active:scale-95"
                              >
                                {m.mediaType === "IMAGE" || m.mimeType?.startsWith('image/') ? (
                                  <img src={m.url} alt="Media" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-slate-800">
                                    <Video className="h-4 w-4 text-lime-400" />
                                  </div>
                                )}
                                {i === 3 && (s.media?.length || 0) > 4 && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-bold text-white">
                                    +{(s.media?.length || 0) - 4}
                                  </div>
                                )}
                              </a>
                            ))
                          ) : (
                            s.assets?.slice(0, 4).map((url, i) => (
                              <a 
                                key={i} 
                                href={url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="relative h-10 w-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 transition-transform hover:scale-110 active:scale-95"
                              >
                                <img src={url} alt="Asset" className="h-full w-full object-cover" />
                                {i === 3 && (s.assets?.length || 0) > 4 && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-bold text-white">
                                    +{(s.assets?.length || 0) - 4}
                                  </div>
                                )}
                              </a>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isAdmin && (
                      <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
                        {["pending", "completed", "canceled"].map(
                          (status) => (
                            <Button
                              key={status}
                              variant="ghost"
                              size="sm"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await apiPatch(
                                    `/api/scheduler/sessions/${s.id}/status`,
                                    {
                                      status: status.toLowerCase(),
                                      adminReason:
                                        "Status updated by admin",
                                    },
                                  );
                                  toast({
                                    title: "Status Updated",
                                    description: `Session marked as ${status.toLowerCase()}`,
                                  });
                                  fetchSessions();
                                } catch (err: any) {
                                  toast({
                                    title: "Update Failed",
                                    description: err.message,
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className={clsx(
                                "h-7 px-2 text-[8px] font-black tracking-widest uppercase rounded-md transition-all",
                                s.status === status
                                  ? "bg-lime-400 text-slate-900"
                                  : "text-slate-500 hover:text-white hover:bg-slate-700",
                              )}
                            >
                              {status === "SCHEDULED"
                                ? "Sch"
                                : status === "COMPLETED"
                                  ? "Done"
                                  : "Can"}
                            </Button>
                          ),
                        )}
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSession(s)}
                      className="h-9 text-slate-400 hover:text-lime-400 hover:bg-lime-400/10 font-bold"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="border-slate-700 text-white"
                  >
                    Prev
                  </Button>

                  <div className="text-slate-400 text-sm">
                    Page {currentPage} of {totalPages}
                  </div>

                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="border-slate-700 text-white"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <VideoSessionUpsellModal
        isOpen={showVideoUpsellModal}
        onOpenChange={setShowVideoUpsellModal}
        hasAddon={hasVideoAddon}
      />
    </div>
  );
}
