"use client";

import { useSocket } from "@/app/providers/SocketProvider";
import { useTimezone } from "@/hooks/use-timezone";
import { fromUTC, parseDateTimeLocal } from "@/lib/timezone";
import { useUiStore } from "@/store/uiStore";
import { apiGet } from "@/lib/api";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { buildStorageUrl } from "@/lib/storage-utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

dayjs.extend(isoWeek);
dayjs.extend(utc);
dayjs.extend(timezone);

interface Post {
  id: string;
  caption: string;
  scheduledFor: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHING" | "POSTED" | "FAILED";
  hashtags?: string[] | null;
  assetId?: string;
  assetIds?: string[];
  asset?: {
    id: string;
    storageKey: string;
    type: "IMAGE" | "VIDEO";
    contentType?: string | null;
  };
  targets: Array<{
    id: string;
    platform: "INSTAGRAM" | "FACEBOOK" | "TIKTOK";
    status: "PENDING" | "SCHEDULED" | "POSTED" | "FAILED";
    errorMessage?: string | null;
    externalPostId?: string | null;
    publishedAt?: string | null;
    socialAccount?: {
      id: string;
      displayName: string;
    };
  }>;
}

interface SocialAccount {
  id: string;
  platform: "INSTAGRAM" | "FACEBOOK" | "TIKTOK";
  displayName: string;
  externalAccountId: string;
}

interface CalendarContextType {
  // View state
  display: "day" | "week" | "month" | "list";
  startDate: string;
  endDate: string;

  // Data
  posts: Post[];
  socialAccounts: SocialAccount[];

  // Loading states
  loading: boolean;

  // Actions
  setDisplay: (display: "day" | "week" | "month" | "list") => void;
  setDateRange: (startDate: string, endDate: string) => void;
  navigateDate: (direction: "prev" | "next" | "today") => void;
  navigateToDate: (date: dayjs.Dayjs) => void;

  // Post operations
  createPost: (data: CreatePostData, files?: File[]) => Promise<void>;
  updatePost: (
    id: string,
    data: Partial<CreatePostData>,
    files?: File[],
  ) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  duplicatePost: (id: string) => Promise<void>;
  movePost: (id: string, newDate: dayjs.Dayjs) => Promise<void>;
  publishPost: (id: string) => Promise<void>;

  // Data refresh
  refreshData: () => Promise<void>;

  // Admin / Impersonation
  targetUserId?: string;
  clientEmail?: string;

  // Timezone info (optional, added dynamically)
  timezone?: string;
  timezoneAbbr?: string;
  timezoneDisplayName?: string;
}

interface CreatePostData {
  caption: string;
  scheduledFor: string;
  scheduledAt?: string;
  platforms: string[];
  socialAccountIds: string[];
  assetId?: string;
  assetIds?: string[];
  hashtags?: string[];
  userId?: string; // For admin
  adminReason?: string; // For admin
  mediaUrl?: string; // Add mediaUrl
  mediaUrls?: string[]; // Add mediaUrls
}

const CalendarContext = createContext<CalendarContextType | null>(null);

function getDateRange(display: string, referenceDate?: string, tz?: string) {
  const date = referenceDate
    ? tz
      ? dayjs.tz(referenceDate, tz)
      : dayjs(referenceDate)
    : tz
      ? dayjs().tz(tz)
      : dayjs();

  switch (display) {
    case "day":
      return {
        startDate: date.startOf("day").format("YYYY-MM-DD"),
        endDate: date.endOf("day").format("YYYY-MM-DD"),
      };
    case "week":
      return {
        startDate: date.startOf("isoWeek").format("YYYY-MM-DD"),
        endDate: date.endOf("isoWeek").format("YYYY-MM-DD"),
      };
    case "month":
      return {
        startDate: date.startOf("month").format("YYYY-MM-DD"),
        endDate: date.endOf("month").format("YYYY-MM-DD"),
      };
    default:
      return {
        startDate: date.startOf("isoWeek").format("YYYY-MM-DD"),
        endDate: date.endOf("isoWeek").format("YYYY-MM-DD"),
      };
  }
}

export function CalendarProvider({
  children,
  targetUserId,
  clientEmail,
}: {
  children: ReactNode;
  targetUserId?: string;
  clientEmail?: string;
}) {
  const {
    timezone: userTimezone,
    timezoneAbbr,
    timezoneDisplayName,
    loading: timezoneLoading,
  } = useTimezone();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { socket } = useSocket();

  const storedView = useUiStore((state) => state.calendarView);
  const setStoredView = useUiStore((state) => state.setCalendarView);

  // Get view from URL or persisted store, default to "month"
  const getInitialDisplay = (): "day" | "week" | "month" => {
    const urlView = searchParams.get("view");
    if (urlView === "day" || urlView === "week" || urlView === "month") {
      return urlView;
    }
    return storedView || "month";
  };

  const [display, setDisplayState] = useState<
    "day" | "week" | "month" | "list"
  >(() => getInitialDisplay());
  const [posts, setPosts] = useState<Post[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [focusDate, setFocusDate] = useState(() =>
    dayjs().format("YYYY-MM-DD"),
  );
  const hasUserNavigatedRef = useRef(false);
  const isUpdatingDisplayRef = useRef(false);

  // Initialize date range
  const initialRange = getDateRange(
    display,
    focusDate,
    userTimezone ?? undefined,
  );
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);

  const setDateRange = useCallback(
    (newStartDate: string, newEndDate: string) => {
      setStartDate(newStartDate);
      setEndDate(newEndDate);
    },
    [],
  );

  // Sync display with URL and persisted store
  // Note: searchParams is NOT in dependencies to avoid recreating on every URL change
  // We read the current value from searchParams directly when needed
  const setDisplay = useCallback(
    (newDisplay: "day" | "week" | "month") => {
      isUpdatingDisplayRef.current = true;
      setDisplayState(newDisplay);
      setStoredView(newDisplay);
      const range = getDateRange(
        newDisplay,
        focusDate,
        userTimezone ?? undefined,
      );
      setDateRange(range.startDate, range.endDate);
      // Update URL - read current searchParams at call time, not from closure
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.set("view", newDisplay);
      router.replace(`${pathname}?${currentParams.toString()}`, {
        scroll: false,
      });
      // Reset flag after a brief delay to allow URL update to complete
      setTimeout(() => {
        isUpdatingDisplayRef.current = false;
      }, 0);
    },
    [focusDate, pathname, router, setDateRange, setStoredView, userTimezone],
  );

  const navigateDate = useCallback(
    (direction: "prev" | "next" | "today") => {
      hasUserNavigatedRef.current = true;
      const current = userTimezone
        ? dayjs.tz(focusDate, userTimezone)
        : dayjs(focusDate);
      let newDate: dayjs.Dayjs;

      if (direction === "today") {
        newDate = userTimezone ? dayjs().tz(userTimezone) : dayjs();
      } else {
        switch (display) {
          case "day":
            newDate =
              direction === "next"
                ? current.add(1, "day")
                : current.subtract(1, "day");
            break;
          case "week":
            newDate =
              direction === "next"
                ? current.add(1, "week")
                : current.subtract(1, "week");
            break;
          case "list":
          case "month":
            newDate =
              direction === "next"
                ? current.add(1, "month")
                : current.subtract(1, "month");
            break;
        }
      }

      const nextFocus = newDate.format("YYYY-MM-DD");
      setFocusDate(nextFocus);
      const range = getDateRange(display, nextFocus, userTimezone ?? undefined);
      setDateRange(range.startDate, range.endDate);
    },
    [display, focusDate, setDateRange, userTimezone],
  );

  const navigateToDate = useCallback(
    (date: dayjs.Dayjs) => {
      hasUserNavigatedRef.current = true;
      const nextFocus = date.format("YYYY-MM-DD");
      setFocusDate(nextFocus);
      const range = getDateRange(display, nextFocus, userTimezone ?? undefined);
      setDateRange(range.startDate, range.endDate);
    },
    [display, setDateRange, userTimezone],
  );

  const fetchPosts = useCallback(async () => {
    // Wait for timezone to load before fetching
    if (timezoneLoading || !userTimezone) return;

    try {
      setLoading(true);
      const rangeStart = userTimezone
        ? dayjs.tz(startDate, userTimezone).startOf("day").utc()
        : dayjs(startDate).startOf("day");
      const rangeEnd = userTimezone
        ? dayjs.tz(endDate, userTimezone).endOf("day").utc()
        : dayjs(endDate).endOf("day");

      // Use the scheduler API and pass targetUserId if it exists
      let url = `/api/scheduler/posts?startDate=${rangeStart.toISOString()}&endDate=${rangeEnd.toISOString()}&scheduleType=POSTING`;
      if (targetUserId) {
        url += `&userId=${targetUserId}`;
      }

      const response = await fetch(url, { credentials: "include" });

      if (response.ok) {
        const data = await response.json();
        // Support all known scheduler response shapes
        const rawPosts = Array.isArray(data)
          ? data
          : data.items ||
            data.posts ||
            data.data?.items ||
            data.data?.posts ||
            data.data ||
            [];

        // Convert post dates from UTC to user timezone for display
        const postsWithTimezone = (Array.isArray(rawPosts) ? rawPosts : [])
          .filter(
            (post: any) =>
              post.scheduleType === "POSTING" || !post.scheduleType,
          ) // Safeguard filter
          .map((post: any) => {
            const dateValue = post.scheduledFor || post.scheduledAt;
            return {
              ...post,
              scheduledFor: dateValue
                ? fromUTC(dateValue, userTimezone).format()
                : dateValue,
            };
          });
        setPosts(postsWithTimezone);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, userTimezone, timezoneLoading, targetUserId]);

  const fetchSocialAccounts = useCallback(async () => {
    try {
      // Use different endpoints for User and Admin
      const url = targetUserId 
        ? `/api/social-media/platform/get-all-performed-links?userId=${targetUserId}` 
        : "/api/social-media/platform/my-links";
      
      const data = await apiGet<any>(url);
      
      if (data && (data.success || Array.isArray(data))) {
        // Handle different data structures:
        // User (/my-links): data: [...]
        // Admin (/get-all-performed-links): data: { data: [...] } OR data: [...]
        let rawAccounts: any[] = [];
        
        if (targetUserId) {
          // Admin response handling
          rawAccounts = Array.isArray(data.data) 
            ? data.data 
            : (data.data?.data || []);
        } else {
          // Regular user response handling
          rawAccounts = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
        }

        if (Array.isArray(rawAccounts)) {
          // Filter by targetUserId if needed
          const filteredAccounts = targetUserId
            ? rawAccounts.filter((acc: any) => acc.userId === targetUserId)
            : rawAccounts;

          const mappedAccounts: SocialAccount[] = filteredAccounts.map(
            (acc: any) => ({
              id: String(acc.id || acc._id || acc.platform || Math.random()),
              platform: (acc.platform || "UNKNOWN").toUpperCase(),
              displayName:
                acc.platformUsername ||
                acc.username ||
                acc.displayName ||
                acc.platform ||
                "Unknown Account",
              externalAccountId: String(
                acc.externalAccountId || acc.platformUsername || acc.username || "",
              ),
            }),
          );
          setSocialAccounts(mappedAccounts);
        }
      }
    } catch (error) {
      console.error("Failed to fetch social accounts:", error);
    }
  }, [targetUserId]);

  const createPost = useCallback(
    async (data: CreatePostData, files?: File[]) => {
      try {
        if (!userTimezone) {
          throw new Error("Timezone not ready. Please try again.");
        }

        // ✅ If scheduledFor is already a UTC ISO string (sent from modal after conversion),
        // use it directly. Otherwise, convert from user timezone to UTC.
        const isAlreadyUTC = data.scheduledFor.endsWith("Z") || data.scheduledFor.includes("+");
        const dateISO = isAlreadyUTC
          ? new Date(data.scheduledFor).toISOString()
          : parseDateTimeLocal(data.scheduledFor, userTimezone).toISOString();

        // ✅ DEBUG: Log timezone conversion for verification
        console.log("[SCHEDULE] Timezone in use:", userTimezone);
        console.log("[SCHEDULE] Raw input scheduledFor:", data.scheduledFor);
        console.log("[SCHEDULE] isAlreadyUTC:", isAlreadyUTC);
        console.log("[SCHEDULE] Final UTC ISO sent to backend:", dateISO);
        console.log("[SCHEDULE] Verify: UTC time back in user TZ:", new Date(dateISO).toLocaleString("en-US", { timeZone: userTimezone }));

        const url = "/api/scheduler/posts";

        const payload = {
          ...data,
          scheduledAt: dateISO,
          scheduledFor: dateISO,
          ...(data.assetIds && data.assetIds.length > 0
            ? {
                assetIds: data.assetIds,
                assetId: data.assetIds[0],
              }
            : data.assetId
              ? { assetId: data.assetId, assetIds: [data.assetId] }
              : {}),
          ...(targetUserId
            ? {
                userId: targetUserId,
                adminReason: "Created from admin dashboard",
              }
            : {}),
        };

        let response;
        
        // If there are files, use FormData. Otherwise, use plain JSON.
        if (files && files.length > 0) {
          const formData = new FormData();
          formData.append("data", JSON.stringify(payload));
          files.forEach((file) => formData.append("files", file));
          
          response = await fetch(url, {
            method: "POST",
            credentials: "include",
            body: formData,
          });
        } else {
          response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          });
        }

        if (response.ok) {
          await fetchPosts();
        } else {
          const error = await response.json().catch(() => ({}));
          let msg =
            error.message ||
            error.error ||
            "Something went wrong while scheduling your post.";

          if (
            msg.toLowerCase().includes("internal server error") ||
            msg.toLowerCase().includes("unexpected token") ||
            msg.toLowerCase().includes("nest") ||
            msg.toLowerCase().includes("multipart")
          ) {
            msg =
              "The server encountered an error. Please check if your data is valid and try again.";
          }

          if (error.details?.issues) {
            const details = error.details.issues
              .map((i: any) => i.message)
              .join(", ");
            msg = `Validation Error: ${details}`;
          }

          throw new Error(msg);
        }
      } catch (error) {
        console.error("Failed to create post:", error);
        throw error;
      }
    },
    [fetchPosts, userTimezone, targetUserId],
  );

  const updatePost = useCallback(
    async (id: string, data: Partial<CreatePostData>, files?: File[]) => {
      try {
        if (!userTimezone) {
          throw new Error("Timezone not ready. Please try again.");
        }

        // ✅ Helper: convert scheduledFor safely (avoid double-conversion if already UTC ISO)
        const toUTCIso = (s: string) => {
          const isAlreadyUTC = s.endsWith("Z") || s.includes("+");
          return isAlreadyUTC
            ? new Date(s).toISOString()
            : parseDateTimeLocal(s, userTimezone).toISOString();
        };

        // ✅ DEBUG: Log timezone conversion for update verification
        if (data.scheduledFor) {
          const updatedDateISO = toUTCIso(data.scheduledFor);
          console.log("[UPDATE] Timezone in use:", userTimezone);
          console.log("[UPDATE] Raw input scheduledFor:", data.scheduledFor);
          console.log("[UPDATE] isAlreadyUTC:", data.scheduledFor.endsWith("Z") || data.scheduledFor.includes("+"));
          console.log("[UPDATE] Final UTC ISO sent to backend:", updatedDateISO);
          console.log("[UPDATE] Verify: UTC time back in user TZ:", new Date(updatedDateISO).toLocaleString("en-US", { timeZone: userTimezone }));
        }

        const payload = {
          ...data,
          caption:
            data.caption || (data.hasOwnProperty("caption") ? "." : undefined),
          ...(data.scheduledFor
            ? {
                scheduledAt: toUTCIso(data.scheduledFor),
                scheduledFor: toUTCIso(data.scheduledFor),
              }
            : {}),
          ...(data.assetIds && data.assetIds.length > 0
            ? {
                assetIds: data.assetIds,
                assetId: data.assetIds[0],
              }
            : data.assetId
              ? { assetId: data.assetId, assetIds: [data.assetId] }
              : {}),
          ...(targetUserId
            ? {
                userId: targetUserId,
                adminReason: data.adminReason || "Updated from admin dashboard",
              }
            : {}),
        };

        const formData = new FormData();
        formData.append("data", JSON.stringify(payload));
        if (files && files.length > 0) {
          files.forEach((file) => formData.append("files", file));
        }

        const response = await fetch(`/api/scheduler/posts/${id}`, {
          method: "PATCH",
          credentials: "include",
          body: formData,
        });

        if (response.ok) {
          await fetchPosts();
        } else {
          const error = await response.json().catch(() => ({}));
          let msg = error.error || error.message || "Failed to update post";
          if (error.details?.issues) {
            msg +=
              ": " + error.details.issues.map((i: any) => i.message).join(", ");
          }
          throw new Error(msg);
        }
      } catch (error) {
        console.error("Failed to update post:", error);
        throw error;
      }
    },
    [fetchPosts, userTimezone, targetUserId],
  );

  const deletePost = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/scheduler/posts/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (response.ok) {
          await fetchPosts();
        } else {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete post");
        }
      } catch (error) {
        console.error("Failed to delete post:", error);
        throw error;
      }
    },
    [fetchPosts],
  );

  const duplicatePost = useCallback(
    async (id: string) => {
      const post = posts.find((p) => p.id === id);
      if (!post) return;

      // post.scheduledFor is already in user timezone (from fetchPosts conversion)
      const scheduledDate = dayjs
        .tz(post.scheduledFor, userTimezone)
        .add(1, "hour");

      const duplicateData: CreatePostData = {
        caption: post.caption + " (Copy)",
        scheduledFor: scheduledDate.format("YYYY-MM-DDTHH:mm"), // Pass formatted string to createPost
        platforms: post.targets.map((t) => t.platform),
        socialAccountIds: post.targets
          .map((t) => t.socialAccount?.id)
          .filter(Boolean) as string[],
        ...(post.assetIds && post.assetIds.length > 0
          ? { assetIds: post.assetIds }
          : post.assetId
            ? { assetId: post.assetId }
            : {}),
        hashtags: Array.isArray(post.hashtags) ? post.hashtags : undefined,
      };

      await createPost(duplicateData);
    },
    [posts, createPost, userTimezone],
  );

  const movePost = useCallback(
    async (id: string, newDate: dayjs.Dayjs) => {
      await updatePost(id, {
        scheduledFor: newDate.format("YYYY-MM-DDTHH:mm"),
      });
    },
    [updatePost],
  );

  const publishPost = useCallback(
    async (id: string) => {
      // Admin publishing flow for a client
      if (targetUserId && clientEmail) {
        const post = posts.find((p) => p.id === id);
        if (post) {
          try {
            const technicalUsername = clientEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
            const hashtagsStr = Array.isArray(post.hashtags) ? post.hashtags.join(" ") : "";
            const fullCaption = hashtagsStr ? `${post.caption}\n\n${hashtagsStr}` : post.caption;

            // Debug log to see the post structure
            console.log("Publishing post:", post);

            // Find media URL using the same logic as CalendarItem.tsx
            const anyPost = post as any;
            let mediaUrl = "";
            const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || "";

            if (post.asset?.storageKey) {
              mediaUrl = buildStorageUrl(STORAGE_BASE_URL, post.asset.storageKey) || "";
            } else if (anyPost.media && anyPost.media.length > 0) {
              mediaUrl = anyPost.media[0].url || buildStorageUrl(STORAGE_BASE_URL, anyPost.media[0].storageKey) || "";
            } else if (anyPost.assets && anyPost.assets.length > 0) {
              mediaUrl = anyPost.assets[0] || "";
            }

            // Handle multiple targets
            for (const target of post.targets) {
              const payload: any = {
                username: technicalUsername,
                platform: target.platform.toLowerCase(),
                title: fullCaption,
                asyncUpload: true,
              };

              if (mediaUrl) {
                payload.mediaUrl = mediaUrl;
              }

              const endpoint = target.platform === "TIKTOK" 
                ? "/api/tiktok/publish-now" 
                : "/api/social-media/publish-now";

              console.log(`Hitting ${endpoint} with payload:`, payload);

              const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
              });

              if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Failed to publish to ${target.platform}`);
              }
            }
            // Update the status in the scheduler after successful publication
            const statusResponse = await fetch(`/api/scheduler/posts/${id}/publish-status`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                status: "completed",
                userId: targetUserId,
                adminReason: "Published from admin dashboard",
              }),
            });

            if (!statusResponse.ok) {
              console.warn("Failed to update scheduler status, but post was published.");
            }

            await fetchPosts();
            return;
          } catch (err) {
            console.error("Admin Publish Now Error:", err);
            throw err;
          }
        }
      }

      const response = await fetch(`/api/posts/${id}/publish`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        await fetchPosts();
        return;
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to publish post");
    },
    [fetchPosts, posts, targetUserId, clientEmail],
  );

  const refreshData = useCallback(async () => {
    await Promise.all([fetchPosts(), fetchSocialAccounts()]);
  }, [fetchPosts, fetchSocialAccounts]);

  // Sync display from URL on mount and when URL changes (e.g., browser back/forward)
  // Skip if we're currently updating display to prevent loops
  useEffect(() => {
    if (isUpdatingDisplayRef.current) return;

    const urlView = searchParams.get("view");
    if (urlView === "day" || urlView === "week" || urlView === "month") {
      if (urlView !== display) {
        setDisplayState(urlView);
        setStoredView(urlView);
        const range = getDateRange(
          urlView,
          focusDate,
          userTimezone ?? undefined,
        );
        setDateRange(range.startDate, range.endDate);
      }
    }
  }, [
    searchParams,
    display,
    focusDate,
    setStoredView,
    setDateRange,
    userTimezone,
  ]);

  // Fetch data when date range changes
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Initial social account fetch
  useEffect(() => {
    fetchSocialAccounts();
  }, [fetchSocialAccounts]);

  useEffect(() => {
    if (!socket) return;
    const handleStatus = () => {
      fetchPosts();
    };
    socket.on("post:status_changed", handleStatus);
    socket.on("post:updated", handleStatus);
    socket.on("post:deleted", handleStatus);
    socket.on("post:failed", handleStatus);
    socket.on("post:published", handleStatus);
    return () => {
      socket.off("post:status_changed", handleStatus);
      socket.off("post:updated", handleStatus);
      socket.off("post:deleted", handleStatus);
      socket.off("post:failed", handleStatus);
      socket.off("post:published", handleStatus);
    };
  }, [socket, fetchPosts]);

  useEffect(() => {
    if (!userTimezone || hasUserNavigatedRef.current) return;
    const today = dayjs().tz(userTimezone).format("YYYY-MM-DD");
    setFocusDate(today);
    const range = getDateRange(display, today, userTimezone);
    setDateRange(range.startDate, range.endDate);
  }, [display, userTimezone, setDateRange]);

  const value: CalendarContextType = {
    display,
    startDate,
    endDate,
    posts,
    socialAccounts,
    loading,
    setDisplay,
    setDateRange,
    navigateDate,
    navigateToDate,
    createPost,
    updatePost,
    deletePost,
    duplicatePost,
    movePost,
    publishPost,
    refreshData,
    targetUserId,
    clientEmail,
    // Add timezone info to context
    timezone: userTimezone,
    timezoneAbbr,
    timezoneDisplayName,
  } as CalendarContextType & {
    timezone: string;
    timezoneAbbr: string;
    timezoneDisplayName: string;
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within CalendarProvider");
  }
  return context;
}
