"use client";

import { useMemo, useCallback, useState, Fragment, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCalendar } from "./calendar-context";
import { useUpload } from "@/hooks/use-upload";
import { useScrollPropagation } from "@/hooks/use-scroll-propagation";
import { useSessionContext } from "@/context/SessionContext";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Grid,
  AlertCircle,
  Loader2,
  List,
  X,
  LayoutList,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import clsx from "clsx";
import { CalendarColumn } from "@/components/calendar/calendar-column";
import { CalendarItem } from "@/components/calendar/calendar-item";
import { useDrop } from "react-dnd";
import PostModal from "./post-modal";
import PostDetailsModal from "./post-details-modal";

dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);

const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;

const hours = Array.from({ length: 24 }, (_, i) => i);

const MONTH_VIEW_WIDE_STORAGE_KEY = "talexia-calendar-month-wide";

const convertTimeFormat = (time: number) => {
  return `${time.toString().padStart(2, "0")}:00`;
};

// Drop zone component for Day view hour slots
function HourDropZone({
  hourDate,
  isPast,
  posts,
  onAddPost,
  onEdit,
  onDragEnd,
  onDelete,
  onDuplicate,
  onPublish,
}: {
  hourDate: Dayjs;
  isPast: boolean;
  posts: Array<{
    id: string;
    caption: string | null;
    hashtags?: string[] | null;
    scheduledFor: string;
    status: "DRAFT" | "SCHEDULED" | "PUBLISHING" | "POSTED" | "FAILED";
    asset?: {
      id: string;
      storageKey: string;
      type: "IMAGE" | "VIDEO";
      contentType?: string | null;
    };
    targets: Array<{
      id: string;
      platform: "INSTAGRAM" | "FACEBOOK" | "TIKTOK";
      status: string;
      errorMessage?: string | null;
    }>;
  }>;
  onAddPost: (date: Dayjs) => void;
  onEdit: (postId: string) => void;
  onDragEnd: (postId: string, newDate: Date) => void;
  onDelete: (postId: string) => void;
  onDuplicate: (postId: string) => void;
  onPublish?: (postId: string) => void;
  statusColors?: Record<string, string>;
}) {
  const [{ canDrop }, drop] = useDrop(() => ({
    accept: "post",
    drop: async (item: { id: string; scheduledFor: string }) => {
      if (isPast) return;
      onDragEnd(item.id, hourDate.toDate());
    },
    collect: (monitor) => ({
      canDrop: isPast ? false : !!monitor.canDrop() && !!monitor.isOver(),
    }),
  }));

  const dropRef = useCallback(
    (node: HTMLDivElement | null) => {
      drop(node);
    },
    [drop],
  );

  return (
    <div
      ref={dropRef}
      className={clsx(
        "flex-1 space-y-2 min-h-[60px] rounded-lg p-1 transition-colors",
        canDrop && "bg-amber-600/20 border-2 border-amber-500",
      )}
    >
      {posts.length > 0 ? (
        posts.map((post) => {
          return (
            <div key={post.id} className="w-full">
              <CalendarItem
                post={post}
                date={hourDate}
                isBeforeNow={isPast}
                display="day"
                onEdit={() => onEdit(post.id)}
                onDelete={() => onDelete(post.id)}
                onDuplicate={() => onDuplicate(post.id)}
                onPublish={onPublish ? () => onPublish(post.id) : undefined}
              />
            </div>
          );
        })
      ) : (
        <div
          onClick={() => !isPast && onAddPost(hourDate)}
          className={clsx(
            "rounded-lg p-3 cursor-pointer transition-all border border-dashed",
            isPast
              ? "border-[#d9d4c9]/30 bg-[#ffffff]/20 opacity-50 cursor-not-allowed"
              : "border-[#d9d4c9] hover:border-amber-600/50 hover:bg-amber-600/10",
          )}
        >
          <p className="text-xs text-slate-500 text-center">
            {isPast ? "Past time" : "Click to add post"}
          </p>
        </div>
      )}
    </div>
  );
}

function WeekView({
  onAddPost,
  onEdit,
  onDragEnd,
}: {
  onAddPost: (date: Dayjs) => void;
  onEdit: (postId: string) => void;
  onDragEnd: (postId: string, newDate: Date) => void;
}) {
  const {
    posts,
    startDate,
    deletePost,
    duplicatePost,
    publishPost,
    timezone: userTimezone,
  } = useCalendar();
  const weekStart = userTimezone
    ? dayjs.tz(startDate, userTimezone).startOf("isoWeek")
    : dayjs(startDate).startOf("isoWeek");

  const localizedDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = weekStart.add(i, "day");
      days.push({
        name: day.format("dddd"),
        day: day.format("MMM D"),
        date: day,
      });
    }
    return days;
  }, [weekStart]);
  const scrollHandlers = useScrollPropagation();

  return (
    <div className="flex flex-col text-[#14110c] min-h-full">
      <div
        className="flex-1 relative h-full overflow-x-auto overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x pan-y" }}
        {...scrollHandlers}
      >
        <div className="grid [grid-template-columns:136px_repeat(7,160px)] md:[grid-template-columns:136px_repeat(7,_minmax(0,_1fr))] gap-[4px] rounded-[10px] min-h-full w-max md:w-full">
          <div className="z-10 bg-[#ffffff]/80 flex justify-center items-center flex-col h-[62px] rounded-[8px] sticky top-0 border border-[#d9d4c9]/50"></div>
          {localizedDays.map((day) => {
            const isToday = userTimezone
              ? day.date.isSame(dayjs().tz(userTimezone), "day")
              : day.date.isSame(dayjs(), "day");
            return (
              <div
                key={day.name}
                className="p-2 text-center bg-[#ffffff]/80 flex justify-center items-center flex-col h-[62px] rounded-[8px] sticky top-0 z-[20] border border-[#d9d4c9]/50"
              >
                <div className="text-[14px] font-[500] text-[#6b6b6b]">
                  {day.name}
                </div>
                <div
                  className={clsx(
                    "text-[14px] font-[600] flex items-center justify-center gap-[6px]",
                    isToday && "text-amber-400",
                  )}
                >
                  {isToday && (
                    <div className="w-[6px] h-[6px] bg-amber-400 rounded-full" />
                  )}
                  {day.day}
                </div>
              </div>
            );
          })}
          {hours.map((hour) => (
            <Fragment key={hour}>
              <div className="p-2 pe-4 text-center items-center justify-center flex text-[14px] text-[#6b6b6b] border-t border-[#d9d4c9]/50">
                {convertTimeFormat(hour)}
              </div>
              {localizedDays.map((day) => (
                <Fragment key={`${day.date.format("YYYY-MM-DD")}-${hour}`}>
                  <div className="relative border-t border-[#d9d4c9]/50">
                    <CalendarColumn
                      getDate={day.date.hour(hour).startOf("hour")}
                      display="week"
                      posts={posts}
                      onEdit={onEdit}
                      onDelete={deletePost}
                      onDuplicate={duplicatePost}
                      onPublish={publishPost}
                      onAddPost={onAddPost}
                      onDragEnd={onDragEnd}
                    />
                  </div>
                </Fragment>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthView({
  onAddPost,
  onEdit,
  onDragEnd,
}: {
  onAddPost: (date: Dayjs) => void;
  onEdit: (postId: string) => void;
  onDragEnd: (postId: string, newDate: Date) => void;
}) {
  const {
    posts,
    startDate,
    deletePost,
    duplicatePost,
    publishPost,
    setDisplay,
    navigateToDate,
    timezone: userTimezone,
  } = useCalendar();
  const monthStart = userTimezone
    ? dayjs.tz(startDate, userTimezone).startOf("month")
    : dayjs(startDate).startOf("month");
  const [wideMonth, setWideMonth] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const stored = window.localStorage.getItem(MONTH_VIEW_WIDE_STORAGE_KEY);
      return stored === "true";
    } catch {
      return false;
    }
  });

  const toggleMonthWidth = () => {
    setWideMonth((prev) => {
      const next = !prev;
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            MONTH_VIEW_WIDE_STORAGE_KEY,
            String(next),
          );
        }
      } catch {
        // ignore
      }
      return next;
    });
  };

  const localizedDays = useMemo(() => {
    const days = [];
    for (let i = 1; i <= 7; i++) {
      days.push(dayjs().day(i).format("ddd"));
    }
    return days;
  }, []);

  const calendarDays = useMemo(() => {
    const currentMonth = monthStart.month();
    const startOfMonth = monthStart.startOf("month");
    const startDayOfWeek = startOfMonth.isoWeekday();
    const daysBeforeMonth = startDayOfWeek - 1;
    const calendarStartDate = startOfMonth.subtract(daysBeforeMonth, "day");

    const calendarDays = [];
    let currentDay = calendarStartDate;
    for (let i = 0; i < 42; i++) {
      let label = "current-month";
      const currentDayMonth = currentDay.month();
      if (currentDayMonth < currentMonth) label = "previous-month";
      else if (currentDayMonth > currentMonth) label = "next-month";

      calendarDays.push({
        day: userTimezone ? dayjs.tz(currentDay, userTimezone) : currentDay,
        label,
      });
      currentDay = currentDay.add(1, "day");
    }
    return calendarDays;
  }, [monthStart, userTimezone]);

  const gridClassName = clsx(
    "grid gap-[2px] rounded-[10px]",
    wideMonth
      ? "[grid-template-columns:repeat(7,160px)] w-max min-h-full"
      : "grid-cols-7 w-full min-h-full min-w-[700px]",
  );

  return (
    <div className="flex flex-col text-[#14110c] h-full">
      <div className="flex items-center justify-end mb-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-full border-[#d9d4c9] text-xs text-[#14110c] hover:bg-[#e6e1d8]"
          onClick={toggleMonthWidth}
        >
          {wideMonth ? "Compact" : "Wide"} View
        </Button>
      </div>
      <div
        className="flex-1 relative overflow-auto pb-12 [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.700)_transparent]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div
          className={gridClassName}
          style={{ gridAutoRows: "minmax(110px, auto)" }}
        >
          {localizedDays.map((day) => (
            <div
              key={day}
              className="z-[30] p-2 bg-[#ffffff] border-b border-[#d9d4c9] flex justify-center items-center h-[52px] sticky top-0"
            >
              <div className="text-[11px] font-bold uppercase tracking-widest text-[#6b6b6b]">
                {day}
              </div>
            </div>
          ))}
          {calendarDays.map((date, index) => {
            const isCurrentMonth = date.label === "current-month";
            const dayDate = userTimezone
              ? dayjs.tz(date.day, userTimezone).startOf("day")
              : dayjs(date.day).startOf("day");
            const isToday = userTimezone
              ? dayDate.isSame(dayjs().tz(userTimezone), "day")
              : dayDate.isSame(dayjs(), "day");

            return (
              <div
                key={index}
                className={clsx(
                  "text-center min-h-[120px] sm:min-h-[140px] flex border-r border-b border-[#d9d4c9]/60 transition-all duration-200",
                  !isCurrentMonth && "bg-[#faf8f3] opacity-30",
                  isToday && "bg-emerald-500/5",
                  isCurrentMonth && "hover:bg-[#e6e1d8]/30",
                )}
              >
                <CalendarColumn
                  getDate={dayDate}
                  display="month"
                  posts={posts}
                  randomHour={true}
                  onEdit={onEdit}
                  onDelete={deletePost}
                  onDuplicate={duplicatePost}
                  onPublish={publishPost}
                  onAddPost={onAddPost}
                  onDragEnd={onDragEnd}
                  onDayClick={() => {
                    navigateToDate(dayDate);
                    setDisplay("day");
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DayView({
  onAddPost,
  onEdit,
  onDragEnd,
}: {
  onAddPost: (date: Dayjs) => void;
  onEdit: (postId: string) => void;
  onDragEnd: (postId: string, newDate: Date) => void;
}) {
  const {
    posts,
    startDate,
    navigateDate,
    timezoneAbbr,
    deletePost,
    duplicatePost,
    publishPost,
    timezone: userTimezone,
  } = useCalendar();
  const selectedDate = userTimezone
    ? dayjs.tz(startDate, userTimezone)
    : dayjs(startDate);
  const scrollHandlers = useScrollPropagation();

  // Group posts by hour for timeline display
  const postsByHour = useMemo(() => {
    const grouped: Record<number, typeof posts> = {};
    posts
      .filter((post) => {
        const pDate = userTimezone
          ? dayjs(post.scheduledFor).tz(userTimezone)
          : dayjs(post.scheduledFor);
        return pDate.isSame(selectedDate, "day");
      })
      .forEach((post) => {
        const hour = userTimezone
          ? dayjs(post.scheduledFor).tz(userTimezone).hour()
          : dayjs(post.scheduledFor).hour();
        if (!grouped[hour]) {
          grouped[hour] = [];
        }
        grouped[hour].push(post);
      });

    // Sort posts within each hour
    Object.keys(grouped).forEach((hour) => {
      grouped[Number(hour)].sort((a, b) => {
        const dateA = userTimezone
          ? dayjs(a.scheduledFor).tz(userTimezone)
          : dayjs(a.scheduledFor);
        const dateB = userTimezone
          ? dayjs(b.scheduledFor).tz(userTimezone)
          : dayjs(b.scheduledFor);
        return dateA.valueOf() - dateB.valueOf();
      });
    });

    return grouped;
  }, [posts, selectedDate]);

  const statusColors = {
    DRAFT: "bg-[#e6e1d8]/80",
    SCHEDULED: "bg-amber-600/80",
    PUBLISHING: "bg-amber-600/80",
    POSTED: "bg-emerald-600/80",
    FAILED: "bg-rose-600/80",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Day Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#d9d4c9]">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[#14110c]">
            {selectedDate.format("dddd, MMMM D, YYYY")}
          </h2>
          <span className="text-sm text-[#6b6b6b]">({timezoneAbbr})</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate("prev")}
            className="border-[#d9d4c9] hover:bg-[#e6e1d8]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate("today")}
            className="border-[#d9d4c9] hover:bg-[#e6e1d8] text-xs"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate("next")}
            className="border-[#d9d4c9] hover:bg-[#e6e1d8]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Timeline List - Always show time slots */}
      <div
        className="flex-1 overflow-y-auto min-h-0 overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ WebkitOverflowScrolling: "touch" }}
        {...scrollHandlers}
      >
        <div className="space-y-2">
          {hours.map((hour) => {
            const hourPosts = postsByHour[hour] || [];
            const hourDate = selectedDate.hour(hour).minute(0);
            const now = userTimezone ? dayjs().tz(userTimezone) : dayjs();
            const isPast = hourDate.isBefore(now, "minute");

            return (
              <div key={hour} className="flex gap-3 items-start">
                {/* Timestamp on left */}
                <div className="w-16 flex-shrink-0 pt-3 text-right pr-2">
                  <span className="text-xs font-black uppercase tracking-tighter text-slate-500">
                    {convertTimeFormat(hour)}
                  </span>
                </div>

                {/* Posts for this hour - with drop zone */}
                <HourDropZone
                  hourDate={hourDate}
                  isPast={isPast}
                  posts={hourPosts}
                  onAddPost={onAddPost}
                  onEdit={onEdit}
                  onDragEnd={onDragEnd}
                  onDelete={deletePost}
                  onDuplicate={duplicatePost}
                  onPublish={publishPost}
                  statusColors={statusColors}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ListView({
  onAddPost,
  onEdit,
  onDragEnd,
}: {
  onAddPost: (date: Dayjs) => void;
  onEdit: (postId: string) => void;
  onDragEnd: (postId: string, newDate: Date) => void;
}) {
  const {
    posts,
    startDate,
    deletePost,
    duplicatePost,
    publishPost,
    timezone: userTimezone,
  } = useCalendar();
  const monthStart = userTimezone
    ? dayjs.tz(startDate, userTimezone).startOf("month")
    : dayjs(startDate).startOf("month");

  // Sort posts chronologically
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const dateA = userTimezone
        ? dayjs(a.scheduledFor).tz(userTimezone)
        : dayjs(a.scheduledFor);
      const dateB = userTimezone
        ? dayjs(b.scheduledFor).tz(userTimezone)
        : dayjs(b.scheduledFor);
      return dateA.valueOf() - dateB.valueOf();
    });
  }, [posts, userTimezone]);

  // Reset page when sorting/filtering changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortedPosts.length]);

  const totalPages = Math.ceil(sortedPosts.length / itemsPerPage);
  const paginatedPosts = sortedPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      {sortedPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-4">
          <LayoutList className="h-12 w-12 opacity-20" />
          <p>No posts scheduled for this period.</p>
          <Button
            variant="outline"
            onClick={() => onAddPost(dayjs().tz(userTimezone))}
          >
            Create Post
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Professional Header Row for List view */}
          <div className="hidden sm:flex items-center px-5 py-4 gap-6 text-xs font-bold text-[#14110c] uppercase tracking-wider bg-[#e6e1d8]/60 rounded-[10px] border border-[#d9d4c9]/50 mb-4 ml-1">
            <div className="w-16 text-center shrink-0">Media</div>
            <div className="flex-1 min-w-0">Content / Caption</div>
            <div className="w-40 text-center shrink-0">Posting Date</div>
            <div className="w-28 text-center shrink-0">Status</div>
            <div className="w-24 hidden md:block text-center shrink-0">Platforms</div>
            <div className="w-24 text-right shrink-0">Actions</div>
          </div>

          <div className="space-y-3">
            {paginatedPosts.map((post) => {
              const date = userTimezone
                ? dayjs(post.scheduledFor).tz(userTimezone)
                : dayjs(post.scheduledFor);
              return (
                <div key={post.id} className="w-full">
                  <CalendarItem
                    post={post}
                    date={date}
                    display="list"
                    onEdit={() => onEdit(post.id)}
                    onDelete={() => deletePost(post.id)}
                    onDuplicate={() => duplicatePost(post.id)}
                    onPublish={
                      publishPost ? () => publishPost(post.id) : undefined
                    }
                    isBeforeNow={false}
                  />
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-[#d9d4c9]/50 mt-6">
              <div className="text-sm text-[#6b6b6b]">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedPosts.length)} of {sortedPosts.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="bg-[#e6e1d8]/50 border-[#d9d4c9]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      className={clsx(
                        "w-8 h-8 p-0",
                        currentPage === i + 1 
                          ? "bg-slate-200 text-[#14110c] hover:bg-slate-300"
                          : "bg-[#e6e1d8]/50 border-[#d9d4c9] text-[#6b6b6b] hover:text-[#14110c]"
                      )}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-[#e6e1d8]/50 border-[#d9d4c9]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EnhancedCalendar({
  clientEmail,
}: {
  clientEmail?: string;
}) {
  const {
    display,
    setDisplay,
    startDate,
    endDate,
    navigateDate,
    loading,
    posts,
    socialAccounts,
    createPost,
    updatePost,
    movePost,
    publishPost,
    deletePost,
    // Explicitly destructure timezone as userTimezone to be used in children
    timezone: userTimezone,
  } = useCalendar();
  const { session } = useSessionContext();
  const isAdmin = session?.role === "ADMIN" || session?.role === "SUPER_ADMIN";
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<Dayjs | null>(null);
  const [editingPost, setEditingPost] = useState<{
    id: string;
    caption: string;
    scheduledFor: string;
    assetId?: string;
    assetIds?: string[];
    socialAccountIds: string[];
    hashtags?: string[];
    existingMedia?: any[];
    status?: string;
  } | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewingPostId, setViewingPostId] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const { uploadFile, uploading } = useUpload();
  const { toast } = useToast();

  const handleAddPost = useCallback(
    (date?: Dayjs) => {
      const defaultDate = userTimezone ? dayjs().tz(userTimezone) : dayjs();
      setModalDate(date ?? defaultDate);
      setModalOpen(true);
    },
    [userTimezone],
  );

  const handleCreatePost = useCallback(
    async (
      payload: {
        caption: string;
        scheduledFor: string;
        socialAccountIds: string[];
        platforms: string[];
        assetId?: string;
        assetIds?: string[];
        hashtags?: string[];
        mediaUrl?: string;
        mediaUrls?: string[];
      },
      files?: File[],
    ) => {
      try {
        if (editingPost) {
          await updatePost(editingPost.id, payload, files);
          setEditingPost(null);
        } else {
          await createPost(payload, files);
        }
        toast({
          title: editingPost ? "Post Updated" : "Post Scheduled",
          description: "Your post has been successfully saved.",
        });
        setModalOpen(false);
      } catch (err: any) {
        console.error("Calendar Action Error:", err);
        const message = err.message || "Failed to save post";
        toast({ title: "Error", description: message, variant: "destructive" });
        throw err;
      }
    },
    [createPost, updatePost, editingPost, toast],
  );

  const handleViewPost = useCallback((postId: string) => {
    setViewingPostId(postId);
    setDetailsModalOpen(true);
  }, []);

  const handleEditPost = useCallback(
    (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      // Prevent editing posted content
      if (post.status === "POSTED") {
        toast({
          title: "Update Prevented",
          description:
            "Cannot edit posts that have already been published. Please duplicate the post to create a new version.",
          variant: "destructive",
        });
        return;
      }

      setEditingPost({
        id: post.id,
        caption: post.caption || "",
        scheduledFor: post.scheduledFor || new Date().toISOString(),
        assetId: post.assetId,
        assetIds:
          (post.assetIds && Array.isArray(post.assetIds)
            ? post.assetIds
            : undefined) || (post.assetId ? [post.assetId] : undefined),
        socialAccountIds: post.targets
          .map((t) => t.socialAccount?.id)
          .filter(Boolean) as string[],
        hashtags: Array.isArray(post.hashtags)
          ? post.hashtags
          : post.hashtags
            ? [post.hashtags]
            : [],
        existingMedia: post.asset
          ? [
            {
              id: post.asset.id,
              storageKey: post.asset.storageKey,
              name: post.asset.storageKey.split("/").pop() || "Media",
            },
          ]
          : [],
        status: post.status,
      });
      // post.scheduledFor is already in user timezone from fetchPosts conversion
      setModalDate(
        userTimezone
          ? dayjs(post.scheduledFor).tz(userTimezone)
          : dayjs(post.scheduledFor),
      );
      setModalOpen(true);
    },
    [posts, userTimezone, toast],
  );

  const handleDragEnd = useCallback(
    async (postId: string, newDate: Date) => {
      try {
        const targetDate = userTimezone
          ? dayjs.tz(newDate, userTimezone)
          : dayjs(newDate);
        const now = userTimezone ? dayjs().tz(userTimezone) : dayjs();

        // Validate: cannot move to past dates (before current minute)
        if (targetDate.isBefore(now, "minute")) {
          toast({
            title: "Invalid Move",
            description:
              "Cannot schedule posts in the past. Please select a current or future date/time.",
            variant: "destructive",
          });
          return;
        }

        await movePost(postId, targetDate);
        toast({
          title: "Post Rescheduled",
          description: `Item moved to ${targetDate.format("MMM D, HH:mm")}`,
        });
      } catch (err) {
        toast({
          title: "Error",
          description:
            err instanceof Error ? err.message : "Failed to move post",
          variant: "destructive",
        });
      }
    },
    [movePost, userTimezone, toast],
  );

  const formatDateRange = () => {
    const start = userTimezone
      ? dayjs.tz(startDate, userTimezone)
      : dayjs(startDate);
    const end = userTimezone ? dayjs.tz(endDate, userTimezone) : dayjs(endDate);

    if (display === "day") {
      return start.format("MMMM D, YYYY");
    } else if (display === "week") {
      return `${start.format("MMM D")} - ${end.format("MMM D, YYYY")}`;
    } else {
      return start.format("MMMM YYYY");
    }
  };

  const stats = useMemo(() => {
    return {
      total: posts.length,
      scheduled: posts.filter(
        (p) => p.status === "SCHEDULED" || p.status === "PUBLISHING",
      ).length,
      posted: posts.filter((p) => p.status === "POSTED").length,
      failed: posts.filter((p) => p.status === "FAILED").length,
    };
  }, [posts]);

  const dndBackend = isTouchDevice ? TouchBackend : HTML5Backend;

  return (
    <DndProvider backend={dndBackend}>
      {showDebug && (
        <div className="mb-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-200 text-xs font-mono space-y-1 relative group">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-amber-400 mb-2">Timezone Debugger</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebug(false)}
              className="h-6 w-6 p-0 hover:bg-amber-500/20 text-amber-400"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <p>
              Target Timezone:{" "}
              <span className="text-[#14110c] bg-[#e6e1d8] px-1 rounded">
                {userTimezone || "BROWSER_DEFAULT"}
              </span>
            </p>
            <p>
              Browser Timezone:{" "}
              <span className="text-[#14110c]">
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </span>
            </p>
            <p>
              Current Time (Local):{" "}
              <span className="text-[#14110c]">
                {dayjs().format("YYYY-MM-DD HH:mm:ss")}
              </span>
            </p>
            <p>
              Current Time (Locked):{" "}
              <span className="text-[#14110c]">
                {userTimezone
                  ? dayjs().tz(userTimezone).format("YYYY-MM-DD HH:mm:ss")
                  : "N/A"}
              </span>
            </p>
            <p>
              UTC Now:{" "}
              <span className="text-[#14110c]">
                {dayjs().utc().format("YYYY-MM-DD HH:mm:ss")} Z
              </span>
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-amber-500/20">
            <p className="text-[10px] text-amber-400/70 font-sans italic">
              Tip: If "Current Time (Locked)" doesn't match your wall clock,
              check your Business Settings.
            </p>
          </div>
        </div>
      )}
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#14110c]">
              Content Calendar
            </h1>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate("prev")}
                className="border-[#d9d4c9] hover:bg-[#e6e1d8]"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium text-sm sm:text-base text-[#14110c] min-w-[140px] sm:min-w-[200px] text-center">
                {formatDateRange()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate("next")}
                className="border-[#d9d4c9] hover:bg-[#e6e1d8]"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex border border-[#d9d4c9] rounded-lg overflow-hidden bg-[#ffffff]">
              <Button
                variant={display === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDisplay("day")}
                className={clsx(
                  "rounded-none border-0",
                  display !== "day" &&
                  "text-[#6b6b6b] hover:text-[#14110c] hover:bg-[#e6e1d8]",
                )}
                title="Day view"
              >
                <List className="h-4 w-4" />
                <span className="ml-1 sm:ml-2">Day</span>
              </Button>
              <Button
                variant={display === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDisplay("week")}
                className={clsx(
                  "rounded-none border-0 border-l border-r border-[#d9d4c9]",
                  display !== "week" &&
                  "text-[#6b6b6b] hover:text-[#14110c] hover:bg-[#e6e1d8]",
                )}
                title="Week view"
              >
                <Calendar className="h-4 w-4" />
                <span className="ml-1 sm:ml-2">Week</span>
              </Button>
              <Button
                variant={display === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDisplay("month")}
                className={clsx(
                  "rounded-none border-0",
                  display !== "month" &&
                  "text-[#6b6b6b] hover:text-[#14110c] hover:bg-[#e6e1d8]",
                )}
                title="Month view"
              >
                <Grid className="h-4 w-4" />
                <span className="ml-1 sm:ml-2">Month</span>
              </Button>
              <Button
                variant={display === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDisplay("list")}
                className={clsx(
                  "rounded-none border-0 border-l border-[#d9d4c9]",
                  display !== "list" &&
                  "text-[#6b6b6b] hover:text-[#14110c] hover:bg-[#e6e1d8]",
                )}
                title="List view"
              >
                <LayoutList className="h-4 w-4" />
                <span className="ml-1 sm:ml-2">List</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
              className="h-9 w-9 p-0 border border-[#d9d4c9] bg-[#ffffff] hover:bg-[#e6e1d8] text-[#6b6b6b] hover:text-amber-400"
              title="Toggle Timezone Debugger"
            >
              <AlertCircle className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => handleAddPost()}
              className="bg-[#b08d3e] hover:bg-[#b08d3e] text-black flex-1 sm:flex-initial"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Create Post</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-[#d9d4c9]/50 bg-[#ffffff]">
            <CardContent className="p-4">
              <div className="text-xl sm:text-2xl font-bold text-[#14110c]">
                {stats.total}
              </div>
              <div className="text-xs sm:text-sm text-[#6b6b6b]">
                Total Posts
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#d9d4c9]/50 bg-[#ffffff]">
            <CardContent className="p-4">
              <div className="text-xl sm:text-2xl font-bold text-amber-400">
                {stats.scheduled}
              </div>
              <div className="text-xs sm:text-sm text-[#6b6b6b]">Scheduled</div>
            </CardContent>
          </Card>
          <Card className="border-[#d9d4c9]/50 bg-[#ffffff]">
            <CardContent className="p-4">
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">
                {stats.posted}
              </div>
              <div className="text-xs sm:text-sm text-[#6b6b6b]">Published</div>
            </CardContent>
          </Card>
          <Card className="border-[#d9d4c9]/50 bg-[#ffffff]">
            <CardContent className="p-4">
              <div className="text-xl sm:text-2xl font-bold text-rose-400">
                {stats.failed}
              </div>
              <div className="text-xs sm:text-sm text-[#6b6b6b]">Failed</div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Area */}
        <div className="mt-8">
          <Card className="border-[#d9d4c9]/50 bg-[#ffffff]">
            <CardContent className="p-4 sm:p-6 min-h-[600px]">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                    <div className="text-[#6b6b6b]">Loading calendar...</div>
                  </div>
                </div>
              ) : (
                <div className="min-h-[600px] flex flex-col">
                  {display === "day" && (
                    <DayView
                      onAddPost={handleAddPost}
                      onEdit={handleViewPost}
                      onDragEnd={handleDragEnd}
                    />
                  )}
                  {display === "week" && (
                    <WeekView
                      onAddPost={handleAddPost}
                      onEdit={handleViewPost}
                      onDragEnd={handleDragEnd}
                    />
                  )}
                  {display === "month" && (
                    <MonthView
                      onAddPost={handleAddPost}
                      onEdit={handleViewPost}
                      onDragEnd={handleDragEnd}
                    />
                  )}
                  {display === "list" && (
                    <ListView
                      onAddPost={handleAddPost}
                      onEdit={handleViewPost}
                      onDragEnd={handleDragEnd}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <PostModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingPost(null);
          }}
          initialDate={modalDate}
          editingPost={editingPost}
          socialAccounts={socialAccounts.map((acc) => ({
            id: acc.id,
            platform: acc.platform,
            displayName: acc.displayName || acc.externalAccountId || acc.id,
            externalAccountId: acc.externalAccountId,
          }))}
          clientEmail={clientEmail}
          onCreate={handleCreatePost}
          onUpload={uploadFile}
          uploading={uploading}
          isAdmin={isAdmin}
          onDelete={deletePost}
          onPublish={
            isAdmin
              ? (payload) => publishPost(editingPost?.id || "")
              : undefined
          }
        />

        <PostDetailsModal
          open={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setViewingPostId(null);
          }}
          postId={viewingPostId}
          onEdit={handleEditPost}
          onDelete={useCalendar().deletePost}
          posts={posts}
          loading={loading}
        />
      </div>
    </DndProvider>
  );
}
