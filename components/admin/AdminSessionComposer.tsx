"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Camera, 
  Video, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { cn } from "@/lib/utils";
import { useTimezone } from "@/hooks/use-timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

interface AdminSessionComposerProps {
  userId: string;
  userName?: string | null;
  userEmail?: string;
  onSuccess?: () => void;
  editingSession?: any;
  onCancelEdit?: () => void;
}

export default function AdminSessionComposer({
  userId,
  userName,
  userEmail,
  onSuccess,
  editingSession,
  onCancelEdit
}: AdminSessionComposerProps) {
  const { toast } = useToast();
  const { timezone: userTimezone } = useTimezone();
  
  const [sessionType, setSessionType] = useState<"PHOTO_SESSION" | "VIDEO_SESSION">("PHOTO_SESSION");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState(60);
  const [adminReason, setAdminReason] = useState("");
  
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingSession) {
      setSessionType(editingSession.scheduleType);
      setTitle(editingSession.sessionTitle || editingSession.session?.title || "");
      setNotes(editingSession.sessionNotes || editingSession.session?.notes || "");
      setDuration(editingSession.sessionDurationMinutes || editingSession.session?.durationMinutes || 60);
      setAdminReason(editingSession.adminReason || "");
      
      if (editingSession.scheduledAt || editingSession.scheduledFor) {
        const date = dayjs.tz(editingSession.scheduledAt || editingSession.scheduledFor, userTimezone);
        setCurrentDate(date);
        setSelectedDate(date);
        setSelectedTime(date.format("HH:mm"));
      }
    } else {
      setSessionType("PHOTO_SESSION");
      setTitle("");
      setNotes("");
      setDuration(60);
      setAdminReason("");
      setSelectedDate(null);
      setSelectedTime("");
    }
  }, [editingSession, userTimezone]);

  const fetchSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      // For admin, we might want to see conflicts for this specific user or all?
      // Usually, session conflicts are for the provider/photographer, but here it seems per-user or global.
      // Based on the requirement, admin schedules for Client X.
      const data = await apiGet<any>("/api/scheduler/posts?scheduleType=PHOTO_SESSION,VIDEO_SESSION");
      const items = Array.isArray(data) ? data : (data.items || data.data?.items || []);
      setSessions(items);
    } catch (err) {
      console.error("Failed to load sessions", err);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

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
      const isPast = current.isBefore(now, "minute");
      
      const hasConflict = sessions.some((s) => {
        if (s.status === "CANCELLED" || s.status === "REJECTED") return false;
        if (editingSession && s.id === editingSession.id) return false;
        
        const existingStart = dayjs.tz(s.scheduledAt || s.scheduledFor, userTimezone);
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
      });

      current = current.add(30, "minute");
    }

    return slots;
  }, [selectedDate, sessions, userTimezone, duration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      toast({ title: "Error", description: "Please select date and time", variant: "destructive" });
      return;
    }
    if (!title.trim()) {
      toast({ title: "Error", description: "Please enter a title", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const scheduledAt = dayjs.tz(
        `${selectedDate.format("YYYY-MM-DD")} ${selectedTime}:00`,
        userTimezone
      ).toISOString();

      const payload: any = {
        userId,
        scheduleType: sessionType,
        scheduledAt,
        sessionTitle: title.trim(),
        sessionNotes: notes.trim(),
        sessionDurationMinutes: duration,
        adminReason: adminReason.trim() || `Scheduled by Admin for ${userName || userEmail}`,
      };

      if (editingSession) {
        await apiPatch(`/api/scheduler/sessions/${editingSession.id}`, payload);
        toast({ title: "Success", description: "Session updated successfully" });
      } else {
        payload.status = "SCHEDULED";
        await apiPost("/api/scheduler/sessions", payload);
        toast({ title: "Success", description: "Session scheduled successfully" });
      }
      
      // Reset form if not editing, or close edit
      if (editingSession && onCancelEdit) {
        onCancelEdit();
      } else {
        setTitle("");
        setNotes("");
        setAdminReason("");
        setSelectedDate(null);
        setSelectedTime("");
      }
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calendar Picker */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="py-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-lime-400" />
                Select Date
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-bold min-w-[80px] text-center">
                  {currentDate.format("MMM YYYY")}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(currentDate.add(1, "month"))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map(d => (
                <div key={d} className="text-[10px] font-black text-slate-500">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const isCurrentMonth = day.isSame(currentDate, "month");
                const isPast = day.isBefore(dayjs(), "day");
                const isSelected = selectedDate?.isSame(day, "day");
                
                return (
                  <button
                    key={idx}
                    disabled={!isCurrentMonth || isPast}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "aspect-square rounded-lg text-xs flex items-center justify-center transition-all",
                      !isCurrentMonth && "opacity-0 pointer-events-none",
                      isPast && "text-slate-600 cursor-not-allowed",
                      isSelected ? "bg-lime-400 text-slate-950 font-bold" : "hover:bg-slate-800 text-slate-300"
                    )}
                  >
                    {day.date()}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Time Picker */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="py-4 border-b border-slate-800">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-lime-400" />
              Select Time
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {!selectedDate ? (
              <div className="h-40 flex items-center justify-center text-slate-500 text-sm italic">
                Please select a date first
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {availableSlots.map(slot => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={cn(
                      "py-2 px-1 rounded-lg text-[10px] font-bold border transition-all",
                      selectedTime === slot.time 
                        ? "bg-lime-400 border-lime-400 text-slate-950" 
                        : slot.available 
                          ? "bg-slate-800 border-slate-700 text-slate-300 hover:border-lime-400/50" 
                          : "bg-slate-900 border-transparent text-slate-600 cursor-not-allowed opacity-50"
                    )}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-800 bg-slate-900/40">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Session Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={sessionType === "PHOTO_SESSION" ? "default" : "outline"}
                    className="flex-1 h-10 gap-2"
                    onClick={() => setSessionType("PHOTO_SESSION")}
                  >
                    <Camera className="h-4 w-4" /> Photo
                  </Button>
                  <Button
                    type="button"
                    variant={sessionType === "VIDEO_SESSION" ? "default" : "outline"}
                    className="flex-1 h-10 gap-2"
                    onClick={() => setSessionType("VIDEO_SESSION")}
                  >
                    <Video className="h-4 w-4" /> Video
                  </Button>
                
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Duration (Min)</Label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-slate-800 border-slate-700 rounded-lg h-10 text-sm px-3 outline-none focus:ring-1 focus:ring-lime-400"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={90}>90 Minutes</option>
                  <option value={120}>120 Minutes</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Session Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Spring Collection Photoshoot"
                className="bg-slate-800 border-slate-700 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notes for Client</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details about location, outfits, etc."
                className="bg-slate-800 border-slate-700 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminReason" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Admin Internal Note</Label>
              <Input
                id="adminReason"
                value={adminReason}
                onChange={(e) => setAdminReason(e.target.value)}
                placeholder="Reason for manual scheduling..."
                className="bg-slate-800 border-slate-700 h-11"
              />
            </div>

            <div className="flex gap-4">
              {editingSession && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancelEdit}
                  className="flex-1 h-12 text-slate-300 border-slate-700 bg-slate-900 rounded-xl"
                >
                  Cancel Edit
                </Button>
              )}
              <Button
                type="submit"
                disabled={submitting || !selectedDate || !selectedTime}
                className={cn(
                  "flex-1 h-12 font-bold text-lg rounded-xl shadow-lg",
                  editingSession 
                    ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20"
                    : "bg-lime-400 hover:bg-lime-500 text-slate-950 shadow-lime-400/20"
                )}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {editingSession ? "Updating..." : "Scheduling..."}
                  </>
                ) : (
                  editingSession ? "Update Session" : "Schedule Session for Client"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
