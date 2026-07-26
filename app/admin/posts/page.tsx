"use client";
import { AdminPagination } from "@/components/admin/AdminPagination";

import DeleteConfirmationModal from "@/app/dashboard/calendar/delete-confirmation-modal";
import PostDetailsModal from "@/app/dashboard/calendar/post-details-modal";
import PostModal from "@/app/dashboard/calendar/post-modal";
import { useSocket } from "@/app/providers/SocketProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useTimezone } from "@/hooks/use-timezone";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import { getEnvVarWithDefault } from "@/lib/env-utils";
import { buildStorageUrl } from "@/lib/storage-utils";
import { fromUTC, toUTC } from "@/lib/timezone";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  MoreHorizontal,
  RefreshCcw,
  Send,
  Trash2,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { apiGet } from "@/lib/api";
import PostFilters, { FilterState } from "@/components/admin/PostFilters";

dayjs.extend(utc);

const STORAGE_BASE_URL = getEnvVarWithDefault(
  "NEXT_PUBLIC_STORAGE_BASE_URL",
  "",
);

const getCompatibleMediaUrl = (value: string | null | undefined) => {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) {
    return STORAGE_BASE_URL ? `${STORAGE_BASE_URL.replace(/\/+$/, "")}${trimmed}` : null;
  }
  return buildStorageUrl(STORAGE_BASE_URL, trimmed);
};

type AdminPost = {
  id: string;
  caption: string | null;
  scheduledFor: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHING" | "POSTED" | "FAILED";
  failureReason?: string | null;
  asset?: {
    id: string;
    storageKey: string;
    type: "IMAGE" | "VIDEO";
  };
  hashtags?: string[];
  ownerId?: string;
  user?: {
    id: string;
    name: string | null;
    fullName: string | null;
    email: string;
  };
  owner?: {
    id: string;
    name: string | null;
    email: string;
  };
  author?: {
    id: string;
    name: string | null;
    fullName: string | null;
    email: string;
  };
  targets: Array<{
    id: string;
    platform: string;
    status: string;
    errorMessage?: string | null;
    failureReason?: string | null;
    socialAccount?: {
      id: string;
      displayName: string;
    };
  }>;
  media?: any[];
};

export default function AdminPostsPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingPostId, setViewingPostId] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  
  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    sessionStatus: "all",
    status: "all",
    platform: "all",
    userId: "",
    userEmail: "",
  });
  
  // For admin posts page, we want only POSTING type items
  const currentPosts = posts;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToBeDeleted, setPostToBeDeleted] = useState<string | null>(null);
  const { uploadFile, uploading } = useUpload();
  const { socket } = useSocket();
  const { timezone: userTimezone, timezoneAbbr } = useTimezone();

  const fetchPosts = useCallback(async (page = currentPage, currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      // Admin should see all posts. Fetching from /api/scheduler/posts
      const startDate = dayjs().subtract(1, "year").toISOString();
      const endDate = dayjs().add(5, "year").toISOString();
      
      // We explicitly request scheduleType=POSTING to avoid getting sessions in this view
      const queryParams = new URLSearchParams({
        all: "true",
        page: page.toString(),
        pageSize: itemsPerPage.toString(),
        scheduleType: "POSTING"
      });

      // Only add date range if no specific user is targeted (to see full history of a user)
      if (!currentFilters.userId && !currentFilters.userEmail) {
        queryParams.set("startDate", dayjs().subtract(1, "year").toISOString());
        queryParams.set("endDate", dayjs().add(5, "year").toISOString());
      }

      if (currentFilters.sessionStatus && currentFilters.sessionStatus !== "all") {
        queryParams.set("sessionStatus", currentFilters.sessionStatus);
      }
      if (currentFilters.status && currentFilters.status !== "all") {
        queryParams.set("status", currentFilters.status);
      }
      if (currentFilters.platform && currentFilters.platform !== "all") {
        queryParams.set("platform", currentFilters.platform);
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
        : data.items || data.data?.items || data.data?.posts || data.data || [];
      
      // Update pagination info from backend meta
      const meta = data.meta || data.data?.meta;
      if (meta) {
        setTotalPages(meta.totalPages || 1);
        setTotalCount(meta.totalCount || items.length);
      } else {
        // Fallback if meta is missing
        setTotalPages(1);
        setTotalCount(items.length);
      }

      const filteredItems = items.filter(
        (p: any) =>
          p.scheduleType !== "PHOTO_SESSION" &&
          p.scheduleType !== "VIDEO_SESSION"
      );

      // Normalize the date field
      const syncedItems = filteredItems.map((p: any) => {
        const dateValue = p.scheduledFor || p.scheduledAt;
        return {
          ...p,
          scheduledFor: dateValue,
        };
      });

      setPosts(syncedItems);
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userTimezone, toast, filters]);

  useEffect(() => {
    fetchPosts(currentPage, filters);
  }, [currentPage, filters, fetchPosts]); // Re-fetch when page or filters change

  useEffect(() => {
    if (!socket) return;
    const handleStatus = () => {
      fetchPosts();
    };
    socket.on("post:created", handleStatus);
    socket.on("post:status_changed", handleStatus);
    socket.on("post:updated", handleStatus);
    socket.on("post:deleted", handleStatus);
    socket.on("post:failed", handleStatus);
    socket.on("post:published", handleStatus);
    socket.on("session:created", handleStatus);
    socket.on("session:updated", handleStatus);
    socket.on("session:deleted", handleStatus);
    socket.on("session:status_changed", handleStatus);
    return () => {
      socket.off("post:created", handleStatus);
      socket.off("post:status_changed", handleStatus);
      socket.off("post:updated", handleStatus);
      socket.off("post:deleted", handleStatus);
      socket.off("post:failed", handleStatus);
      socket.off("post:published", handleStatus);
      socket.off("session:created", handleStatus);
      socket.off("session:updated", handleStatus);
      socket.off("session:deleted", handleStatus);
      socket.off("session:status_changed", handleStatus);
    };
  }, [socket, fetchPosts]);

  const confirmDeletePost = (id: string) => {
    setPostToBeDeleted(id);
    setDeleteModalOpen(true);
  };

  const handleDeletePost = async () => {
    if (!postToBeDeleted) return;

    try {
      // The user wants 'Delete' to count as 'Failed' in their dashboard
      // and then disappear from the calendar grid.
      // So instead of hard DELETE, we PATCH status to FAILED first, then we could delete or just let it be.
      // But to satisfy the "failed count" requirement, it must have status FAILED.

      const res = await fetch(`/api/scheduler/posts/${postToBeDeleted}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          data: JSON.stringify({
            status: "FAILED",
            failureReason: "Rejected by Administrator",
            adminReason: "Rejected by Administrator",
          }),
        }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Post rejected and marked as Failed",
        });
        fetchPosts();
      } else {
        // Fallback to delete if PATCH fails or if backend doesn't support status update via PATCH
        await fetch(`/api/scheduler/posts/${postToBeDeleted}`, {
          method: "DELETE",
          credentials: "include",
        });
        toast({ title: "Success", description: "Post removed from system" });
        fetchPosts();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const extractUserIdFromPost = (post: any) => {
    const id = post.owner?.id || post.user?.id || post.author?.id;
    if (id) return id;

    // Fallback: Extract from asset storage key or URL if backend omits the owner
    const extractFromUrl = (url: string) => {
      const match = /\/user\/([a-z0-9]+)\//.exec(`/${url}`);
      return match ? match[1] : null;
    };

    if (post.asset?.storageKey) {
      const match = extractFromUrl(post.asset.storageKey);
      if (match) return match;
    }

    if (post.media && post.media.length > 0) {
      const storageKey = post.media[0].storageKey || post.media[0].url || "";
      const match = extractFromUrl(storageKey);
      if (match) return match;
    }

    if (post.assets && post.assets.length > 0) {
      const match = extractFromUrl(post.assets[0]);
      if (match) return match;
    }

    return null;
  };

  const handleViewPost = (postId: string) => {
    setViewingPostId(postId);
    setDetailsModalOpen(true);
  };

  const handleEditPost = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.status === "POSTED") {
      toast({
        title: "Update Prevented",
        description: "Cannot edit posts that have already been published.",
        variant: "destructive",
      });
      return;
    }

    try {
      const targetUserId = extractUserIdFromPost(post);
      if (!targetUserId) {
        toast({
          title: "Error",
          description:
            "Cannot determine the user for this post as the backend did not provide an ID and there are no media assets.",
          variant: "destructive",
        });
        return;
      }
      // Fetch user's social accounts for editing
      const res = await fetch(
        `/api/admin/users/${targetUserId}/connected-platforms`,
        {
          credentials: "include",
        },
      );

      let loadedAccounts: any[] = [];
      if (res.ok) {
        const data = await res.json();
        const rawAccounts = Array.isArray(data)
          ? data
          : data.links || data.items || data.platforms || [];
        loadedAccounts = rawAccounts.map((acc: any) => ({
          id: acc.id || acc._id,
          platform: acc.platform?.toUpperCase(),
          displayName: acc.username || acc.displayName,
        }));
      }

      // If backend leaves socialAccount: null or loadedAccounts is missing the platform,
      // fallback to mocking the accounts directly from the post's targets so Admin is not blocked
      const accountIds: string[] = [];
      if (post.targets && post.targets.length > 0) {
        post.targets.forEach((t: any) => {
          const plat = t.platform?.toUpperCase();
          const targetAccId = t.socialAccount?.id;

          if (targetAccId) {
            accountIds.push(targetAccId);
            if (!loadedAccounts.find((a) => a.id === targetAccId)) {
              loadedAccounts.push({
                id: targetAccId,
                platform: plat,
                displayName: t.socialAccount?.displayName || `${plat} Account`,
              });
            }
          } else {
            // target has no socialAccount object, let's find one or mock one
            let matchingAcc = loadedAccounts.find(
              (acc) => acc.platform === plat,
            );
            if (!matchingAcc) {
              matchingAcc = {
                id: `mock-${plat}-${t.id}`,
                platform: plat,
                displayName: `${plat} (Pre-selected)`,
              };
              loadedAccounts.push(matchingAcc);
            }
            if (!accountIds.includes(matchingAcc.id)) {
              accountIds.push(matchingAcc.id);
            }
          }
        });
      }

      setSocialAccounts(loadedAccounts);

      setEditingPost({
        id: post.id,
        caption: post.caption || "",
        scheduledFor: post.scheduledFor,
        assetId: post.asset?.id,
        socialAccountIds: accountIds,
        existingMedia: post.asset ? [{
          id: post.asset.id,
          storageKey: post.asset.storageKey,
          name: post.asset.storageKey.split('/').pop() || 'Media'
        }] : (post.media || []).map((m: any) => ({
          id: m.id || m.storageKey,
          storageKey: m.storageKey || m.url,
          name: (m.storageKey || m.url || "").split('/').pop() || 'Media'
        })),
        status: post.status
      });
      setEditModalOpen(true);
    } catch (err) {
      console.error("Failed to prepare edit modal:", err);
    }
  };

  const handleSavePost = async (payload: any) => {
    try {
      const res = await fetch(`/api/scheduler/posts/${editingPost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          caption: payload.caption || ".",
          scheduledAt: toUTC(
            dayjs(payload.scheduledFor),
            userTimezone || "UTC",
          ).toISOString(),
          scheduledFor: toUTC(
            dayjs(payload.scheduledFor),
            userTimezone || "UTC",
          ).toISOString(),
          userId: extractUserIdFromPost(
            posts.find((p) => p.id === editingPost.id),
          ),
          adminReason: "Modified by Administrator",
          assetIds:
            payload.assetIds || (payload.assetId ? [payload.assetId] : []),
          hashtags: payload.hashtags || [],
          platforms: payload.platforms,
          socialAccountIds: payload.socialAccountIds,
        }),
      });

      if (res.ok) {
        toast({ title: "Success", description: "Post updated successfully" });
        fetchPosts();
        setEditModalOpen(false);
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to update post");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const handlePublishFromModal = async (payload: any) => {
    try {
      if (editingPost) {
        await handleSavePost(payload);
        await handlePublishPost(editingPost.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublishPost = async (id: string) => {
    try {
      setLoading(true);

      const post = posts.find((p) => p.id === id);
      if (!post) throw new Error("Post not found");

      const user = post.user || post.owner || post.author;
      let username = "";
      if (user && user.email) {
        username = user.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
      }

      const platform = post.targets?.[0]?.platform?.toLowerCase() || "instagram";
      const title = post.caption || "Instant 122";

      const mediaUrls: string[] = [];
      if (post.asset?.storageKey) {
        const url = getCompatibleMediaUrl(post.asset.storageKey);
        if (url) mediaUrls.push(url);
      }
      if (post.media && post.media.length > 0) {
        post.media.forEach((m: any) => {
          const url = m.url
            ? getCompatibleMediaUrl(m.url)
            : getCompatibleMediaUrl(m.storageKey);
          if (url) mediaUrls.push(url);
        });
      }
      if (mediaUrls.length === 0 && (post as any).assets && (post as any).assets.length > 0) {
        (post as any).assets.forEach((a: any) => {
          if (typeof a === "string") {
            const url = getCompatibleMediaUrl(a);
            if (url) mediaUrls.push(url);
          } else if (typeof a === "object") {
            const url = a.url
              ? getCompatibleMediaUrl(a.url)
              : getCompatibleMediaUrl(a.storageKey);
            if (url) mediaUrls.push(url);
          }
        });
      }

      if (mediaUrls.length === 0) {
        throw new Error(
          "Cannot publish this post because no valid media URL was found. Please make sure the post has uploaded media."
        );
      }

      const payload: any = {
        username,
        platform,
        title,
        asyncUpload: true,
        hashtags: post.hashtags || [],
      };

      if (mediaUrls.length === 1) {
        payload.mediaUrl = mediaUrls[0];
      } else if (mediaUrls.length > 1) {
        payload.mediaUrls = mediaUrls;
      }

      const res = await fetch(`/api/social-media/publish-now`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.allSuccessful === false && data.results) {
          const errors = data.results
            .filter((r: any) => !r.success)
            .map((r: any) => r.error);
          throw new Error(errors.join(", ") || "Publishing failed");
        }
        // Update the status in the scheduler after successful publication
        const targetUserId = extractUserIdFromPost(post);
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

        toast({
          title: "Success",
          description: "Publication triggered successfully",
        });
        fetchPosts();
      } else {
        const data = await res.json();
        throw new Error(data.error || data.message || "Failed to publish post");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: AdminPost["status"]) => {
    switch (status) {
      case "POSTED":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30">
            Published
          </Badge>
        );
      case "SCHEDULED":
        return (
          <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">
            Scheduled
          </Badge>
        );
      case "DRAFT":
        return (
          <Badge className="bg-[#e6e1d8]/40 text-[#6b6b6b] border-[#d9d4c9]/30">
            Draft
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
            Failed
          </Badge>
        );
      case "PUBLISHING":
        return (
          <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 animate-pulse">
            Publishing
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#14110c]">Post Management</h1>
          <p className="text-sm text-[#6b6b6b]">
            Monitor and manage all scheduled content across all users.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchPosts()}
          disabled={loading}
          className="border-[#d9d4c9] hover:bg-[#e6e1d8] text-[#14110c]"
        >
          <RefreshCcw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <PostFilters 
        type="posts"
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }} 
        initialFilters={filters}
      />

      <Card className="border-[#d9d4c9] bg-[#ffffff] backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-[#d9d4c9]">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-[#b08d3e]" />
            All Posts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#faf8f3]">
              <TableRow className="border-[#d9d4c9] hover:bg-transparent">
                <TableHead className="w-[80px]">Media</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Caption / Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled For</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (posts || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-2 text-[#6b6b6b]">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#b08d3e] border-t-transparent" />
                      Loading posts...
                    </div>
                  </TableCell>
                </TableRow>
              ) : (posts || []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-48 text-center text-[#6b6b6b]"
                  >
                    No posts found.
                  </TableCell>
                </TableRow>
              ) : (
                currentPosts.map((post: any) => {
                  let mediaUrl = null;
                  if (post.asset?.storageKey) {
                    mediaUrl = buildStorageUrl(
                      STORAGE_BASE_URL,
                      post.asset.storageKey,
                    );
                  } else if (post.media && post.media.length > 0) {
                    mediaUrl =
                      post.media[0].url ||
                      buildStorageUrl(
                        STORAGE_BASE_URL,
                        post.media[0].storageKey,
                      );
                  } else if (post.assets && post.assets.length > 0) {
                    mediaUrl = post.assets[0];
                  }

                  return (
                    <TableRow
                      key={post.id}
                      className="border-[#d9d4c9] hover:bg-[#e6e1d8]/30 transition-colors group"
                    >
                      <TableCell>
                        <div className="h-12 w-12 rounded-lg bg-[#e6e1d8] overflow-hidden relative border border-[#d9d4c9] group-hover:border-[#d9d4c9] transition-colors">
                          {mediaUrl ? (
                            <Image
                              src={mediaUrl}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="48px"
                              unoptimized
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[#6b6b6b]">
                              <FileText className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {post.scheduleType === "PHOTO_SESSION" ? (
                          <Badge className="bg-[#b08d3e]/10 text-[#b08d3e] border-[#b08d3e]/20 gap-1">
                            <Calendar className="h-3 w-3" /> Photo
                          </Badge>
                        ) : post.scheduleType === "VIDEO_SESSION" ? (
                          <Badge className="bg-indigo-600/10 text-indigo-600 border-indigo-500/20 gap-1">
                            <Clock className="h-3 w-3" /> Video
                          </Badge>
                        ) : (
                          <Badge className="bg-[#e6e1d8] text-[#6b6b6b] border-[#d9d4c9] gap-1">
                            <FileText className="h-3 w-3" /> Post
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex flex-col gap-0.5">
                          <div className="line-clamp-2 text-sm text-[#14110c] font-medium">
                            {post.session?.title ||
                              post.sessionTitle ||
                              post.caption || (
                                <span className="text-[#6b6b6b] italic">
                                  No caption
                                </span>
                              )}
                          </div>
                          {(post.session?.notes || post.sessionNotes) && (
                            <span className="text-[10px] text-[#6b6b6b] line-clamp-1 italic">
                              Ref: {post.session?.notes || post.sessionNotes}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-[#14110c]">
                            {post.owner?.name ||
                              post.user?.fullName ||
                              post.user?.name ||
                              post.author?.fullName ||
                              post.author?.name ||
                              (extractUserIdFromPost(post)
                                ? `User: ${extractUserIdFromPost(post)?.substring(0, 8)}...`
                                : "Unknown User")}
                          </span>
                          <span className="text-xs text-[#6b6b6b]">
                            {post.owner?.email ||
                              post.user?.email ||
                              post.author?.email ||
                              "No email"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {post.targets?.map((t: any, idx: number) => {
                            const platform = (t.platform || "").toUpperCase();
                            const iconMap: Record<
                              string,
                              | typeof FaInstagram
                              | typeof FaFacebook
                              | typeof FaTiktok
                            > = {
                              INSTAGRAM: FaInstagram,
                              FACEBOOK: FaFacebook,
                              TIKTOK: FaTiktok,
                            };
                            const Icon = iconMap[platform];
                            return (
                              <Badge
                                key={`${post.id}-${platform}-${idx}`}
                                variant="outline"
                                className="text-[10px] py-0 px-1.5 border-[#d9d4c9] bg-[#ffffff] text-[#6b6b6b] uppercase inline-flex items-center gap-1"
                              >
                                {Icon ? <Icon className="h-3 w-3" /> : null}
                                {platform || "Unknown"}
                              </Badge>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(post.status)}
                          {post.status === "FAILED" &&
                            (post.failureReason ||
                              post.targets?.some(
                                (t: any) => t.errorMessage || t.failureReason,
                              )) && (
                              <span
                                className="text-[10px] text-rose-400 max-w-[150px] truncate"
                                title={
                                  post.failureReason ||
                                  post.targets?.find(
                                    (t: any) =>
                                      t.errorMessage || t.failureReason,
                                  )?.errorMessage ||
                                  post.targets?.find(
                                    (t: any) =>
                                      t.errorMessage || t.failureReason,
                                  )?.failureReason ||
                                  "Failed"
                                }
                              >
                                {post.failureReason ||
                                  post.targets?.find(
                                    (t: any) =>
                                      t.errorMessage || t.failureReason,
                                  )?.errorMessage ||
                                  post.targets?.find(
                                    (t: any) =>
                                      t.errorMessage || t.failureReason,
                                  )?.failureReason}
                              </span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-[#14110c]">
                            {post.scheduledFor 
                              ? fromUTC(post.scheduledFor, userTimezone).format("MMM D, YYYY")
                              : "Pending"}
                          </div>
                          <div className="text-xs text-[#6b6b6b] flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.scheduledFor 
                              ? fromUTC(post.scheduledFor, userTimezone).format("h:mm A")
                              : "—"}
                            <span className="text-[#6b6b6b] ml-1">
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
                              className="h-8 border-[#d9d4c9] bg-[#ffffff] text-[#14110c] hover:bg-[#e6e1d8] hover:text-[#14110c] flex items-center gap-1 px-3"
                            >
                              Action <ChevronDown className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-40 bg-[#ffffff] border-[#d9d4c9] text-[#14110c]"
                          >
                            <DropdownMenuItem
                              className="hover:bg-[#e6e1d8] focus:bg-[#e6e1d8] cursor-pointer"
                              onClick={() => handleViewPost(post.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {post.status !== "POSTED" && (
                              <DropdownMenuItem
                                className="hover:bg-[#e6e1d8] focus:bg-[#e6e1d8] cursor-pointer"
                                onClick={() => handleEditPost(post.id)}
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                Edit Post
                              </DropdownMenuItem>
                            )}
                            {post.status !== "POSTED" && (
                              <DropdownMenuItem
                                className="hover:bg-[#e6e1d8] focus:bg-[#e6e1d8] cursor-pointer text-[#b08d3e]"
                                onClick={() => handlePublishPost(post.id)}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Publish Now
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-rose-400 hover:bg-rose-500/10 focus:bg-rose-500/10 cursor-pointer"
                              onClick={() => confirmDeletePost(post.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Reject / Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* ── Pagination Footer ── */}
        {totalCount > 0 && (
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            onPageChange={setCurrentPage}
            isLoading={loading}
          />
        )}
      </Card>

      <PostDetailsModal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        postId={viewingPostId}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
        posts={posts as any}
      />

      <PostModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        initialDate={null}
        socialAccounts={socialAccounts}
        editingPost={editingPost}
        onCreate={handleSavePost}
        onPublish={handlePublishFromModal}
        onUpload={uploadFile as any}
        uploading={uploading}
        isAdmin={true}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeletePost}
        title="Reject Schedule?"
        description="This will mark the post as 'Failed' for the user and remove it from their calendar dashboard grid."
      />
    </div>
  );
}
