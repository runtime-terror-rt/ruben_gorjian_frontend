"use client";

import { memo, useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useDrag } from "react-dnd";
import dayjs from "dayjs";
import clsx from "clsx";
import { Copy, Send, Trash2, AlertCircle, Edit2 } from "lucide-react";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import type { Dayjs } from "dayjs";
import { buildStorageUrl } from "@/lib/storage-utils";
import { useSessionContext } from "@/context/SessionContext";
import { useCalendar } from "@/app/dashboard/calendar/calendar-context";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

dayjs.extend(utc);
dayjs.extend(timezone);

type CalendarPost = {
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
    socialAccount?: {
      id: string;
      displayName: string;
    };
  }>;
};

interface CalendarItemProps {
  post: CalendarPost;
  date: Dayjs;
  isBeforeNow: boolean;
  display: "day" | "week" | "month" | "list";
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPublish?: () => void;
}

import { getEnvVarWithDefault } from "@/lib/env-utils";

const STORAGE_BASE_URL = getEnvVarWithDefault(
  "NEXT_PUBLIC_STORAGE_BASE_URL",
  "",
);

const platformIcons = {
  INSTAGRAM: FaInstagram,
  FACEBOOK: FaFacebook,
  TIKTOK: FaTiktok,
};

const platformColors = {
  INSTAGRAM: "text-pink-500",
  FACEBOOK: "text-blue-500",
  TIKTOK: "text-white",
};

export const CalendarItem = memo<CalendarItemProps>(
  ({
    post,
    date, // eslint-disable-line @typescript-eslint/no-unused-vars -- required by CalendarItemProps
    isBeforeNow,
    display, // eslint-disable-line @typescript-eslint/no-unused-vars -- required by CalendarItemProps
    onEdit,
    onDuplicate,
    onDelete,
    onPublish,
  }) => {
    const { timezone: userTimezone } = useCalendar();
    const [showRawTime, setShowRawTime] = useState(false);
    // date and display are part of the public props but not used in this compact view
    // Prevent dragging POSTED posts
    const canDrag = post.status !== "POSTED";

    const [{ opacity }, dragRef] = useDrag(
      () => ({
        type: "post",
        item: {
          id: post.id,
          scheduledFor: post.scheduledFor,
        },
        canDrag: canDrag,
        collect: (monitor) => ({
          opacity: monitor.isDragging() ? 0.5 : 1,
        }),
      }),
      [post.id, canDrag],
    );

    const dragElementRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      dragRef(dragElementRef);
    }, [dragRef]);

    const anyPost = post as any;
    let mediaUrl = null;
    if (post.asset?.storageKey) {
      mediaUrl = buildStorageUrl(STORAGE_BASE_URL, post.asset.storageKey);
    } else if (anyPost.media && anyPost.media.length > 0) {
      mediaUrl = anyPost.media[0].url || buildStorageUrl(STORAGE_BASE_URL, anyPost.media[0].storageKey);
    } else if (anyPost.assets && anyPost.assets.length > 0) {
      mediaUrl = anyPost.assets[0];
    }

    const platforms = post.targets.map((t) => t.platform);
    const primaryPlatform = platforms[0];
    const PrimaryIcon = primaryPlatform ? platformIcons[primaryPlatform] : null;

    const statusColor = {
      DRAFT: "bg-slate-600",
      SCHEDULED: "bg-amber-600",
      PUBLISHING: "bg-amber-600",
      POSTED: "bg-emerald-600",
      FAILED: "bg-rose-600",
    }[post.status];

    const { session } = useSessionContext();
    const isAdmin = session?.role === "ADMIN" || session?.role === "SUPER_ADMIN";
    const needsMedia = platforms.some(p => p === "INSTAGRAM" || p === "TIKTOK");
    const isMissingContent = needsMedia && !mediaUrl && (!post.caption || post.caption.trim() === "");

    const formattedDate = userTimezone
      ? dayjs(post.scheduledFor).tz(userTimezone).format("MM/DD/YYYY")
      : dayjs(post.scheduledFor).format("MM/DD/YYYY");

    const formattedTime = userTimezone
      ? dayjs(post.scheduledFor).tz(userTimezone).format("hh:mm A")
      : dayjs(post.scheduledFor).format("hh:mm A");

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    return (
      <>
        <div
        ref={canDrag ? dragElementRef : null}
        className={clsx(
          "w-full flex rounded-[10px] overflow-hidden group relative cursor-pointer",
          "bg-slate-800/70 hover:bg-slate-800/90 transition-colors",
          display === "list" ? "min-h-[76px]" : "h-14",
          "border border-slate-700/50 shadow-sm",
          isBeforeNow && "opacity-60 grayscale",
          !canDrag && "cursor-default",
        )}
        style={{ opacity }}
        onClick={onEdit}
      >
        {/* Left accent stripe - status color */}
        <div
          className={clsx(
            "w-1.5 min-w-[6px] flex-shrink-0 rounded-l-[10px]",
            statusColor,
          )}
        />
        {/* Content Container */}
        <div
          className={clsx(
            "flex-1 min-w-0 flex flex-row items-center",
            display === "list" ? "px-5 py-3 gap-6" : "gap-2 px-2 h-full",
          )}
        >
          {/* Thumbnail or platform icon */}
          <div className={clsx("relative flex-shrink-0 flex items-center justify-center", display === "list" ? "w-16" : "")}>
            {mediaUrl ? (
              <Image
                className={clsx(
                  "object-cover",
                  display === "list" ? "w-14 h-14 rounded-[8px]" : "w-10 h-10 rounded-[6px]"
                )}
                src={mediaUrl}
                alt=""
                width={display === "list" ? 56 : 40}
                height={display === "list" ? 56 : 40}
                unoptimized
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div
                className={clsx(
                  "flex items-center justify-center",
                  display === "list" ? "w-14 h-14 rounded-[8px]" : "w-10 h-10 rounded-[6px]",
                  isMissingContent ? "bg-amber-500/20 border border-amber-500/50" : "bg-slate-700"
                )}
                title={isMissingContent ? "Missing content" : undefined}
              >
                {isMissingContent ? (
                  <AlertCircle className={clsx("text-amber-500", display === "list" ? "h-7 w-7" : "h-5 w-5")} />
                ) : (
                  PrimaryIcon && (
                    <PrimaryIcon
                      className={clsx(platformColors[primaryPlatform], display === "list" ? "h-7 w-7" : "h-5 w-5")}
                    />
                  )
                )}
              </div>
            )}
            {platforms.length > 0 && display !== "list" && (
              <div className="absolute -bottom-0.5 -right-0.5 z-10 flex items-center gap-0.5">
                {platforms.slice(0, 2).map((platform) => {
                  const Icon = platformIcons[platform];
                  return (
                    <div
                      key={platform}
                      className="w-[10px] h-[10px] rounded-[4px] bg-slate-900 border border-slate-600 flex items-center justify-center"
                    >
                      <Icon
                        className={clsx("h-2 w-2", platformColors[platform])}
                      />
                    </div>
                  );
                })}
                {platforms.length > 2 && (
                  <div className="w-[10px] h-[10px] rounded-[4px] bg-slate-700 text-[8px] flex items-center justify-center">
                    +{platforms.length - 2}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Caption preview for list view */}
          {display === "list" ? (
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-[13px] text-slate-200 font-medium line-clamp-2 leading-relaxed">
                {post.caption && post.caption.trim() !== "" ? (
                  post.caption
                ) : (
                  <span className="text-slate-500 italic font-normal">No caption</span>
                )}
              </p>
            </div>
          ) : null}

          {/* Date & Time display */}
          {display === "list" ? (
            <div className="w-40 flex flex-col items-center justify-center shrink-0">
              <span className="text-[13px] font-bold text-slate-200 tabular-nums tracking-wide">
                {formattedDate}
              </span>
              <span className="text-[11px] text-slate-400 tabular-nums mt-0.5">
                {formattedTime}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 tabular-nums shrink-0 flex items-center">
              {post.status === "DRAFT" ? "Draft " : ""}
              {userTimezone
                ? dayjs(post.scheduledFor).tz(userTimezone).format("hh:mm A")
                : dayjs(post.scheduledFor).format("hh:mm A")}
            </span>
          )}

          {/* Status Pill for List View */}
          {display === "list" && (
            <div className="w-28 hidden sm:flex items-center justify-center shrink-0">
              <span
                className={clsx(
                  "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider text-white",
                  statusColor,
                )}
              >
                {post.status}
              </span>
            </div>
          )}

          {/* Platforms list for List View */}
          {display === "list" && (
            <div className="w-24 hidden md:flex items-center justify-center gap-2 shrink-0">
              {platforms.length > 0 ? (
                platforms.map((platform) => {
                  const Icon = platformIcons[platform];
                  return (
                    <div key={platform} title={platform} className="p-1.5 bg-slate-800 rounded-full">
                      <Icon className={clsx("h-4 w-4", platformColors[platform])} />
                    </div>
                  );
                })
              ) : (
                <span className="text-xs text-slate-500">-</span>
              )}
            </div>
          )}

          {showRawTime && (
            <div className="absolute top-full left-0 z-[100] bg-black text-[10px] text-amber-400 p-1 rounded border border-amber-500 whitespace-nowrap pointer-events-none">
              Raw: {post.scheduledFor}
            </div>
          )}

          {/* Actions */}
          <div className={clsx(
            "flex items-center flex-shrink-0",
            display === "list" ? "w-24 justify-end gap-2" : "ml-auto mr-1 gap-1"
          )}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              className="p-2 rounded-md hover:bg-rose-500/20 text-rose-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            {post.status !== "POSTED" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 rounded-md hover:bg-slate-600/50 transition-colors"
                title="Edit post"
              >
                <Edit2 className="h-4 w-4 text-slate-300 hover:text-white" />
              </button>
            )}
            {isAdmin && onPublish && post.status !== "POSTED" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPublish?.();
                }}
                className="p-2 rounded-md hover:bg-lime-500/10 transition-colors"
                title={isMissingContent ? "Publishing without content may fail" : "Publish now"}
              >
                <Send className="h-4 w-4 text-lime-400" />
              </button>
            )}
          </div>
        </div>
      </div>
        
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Post</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this post? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete();
                  setShowDeleteDialog(false);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

CalendarItem.displayName = "CalendarItem";
