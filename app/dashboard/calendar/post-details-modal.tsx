"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/calendar/status-pill";
import { useTimezone } from "@/hooks/use-timezone";
import { useScrollPropagation } from "@/hooks/use-scroll-propagation";
import { useSessionContext } from "@/context/SessionContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import clsx from "clsx";
import { buildStorageUrl } from "@/lib/storage-utils";

dayjs.extend(relativeTime);
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
import {
  Edit2,
  X,
  Calendar as CalendarIcon,
  Clock,
  Hash,
  FileText,
  AlertCircle,
  Trash2,
  User as UserIcon,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import {
  FaFacebook as Facebook,
  FaInstagram as Instagram,
  FaTiktok as Tiktok,
} from "react-icons/fa";
import NextImage from "next/image";

import { getEnvVarWithDefault } from "@/lib/env-utils";

const STORAGE_BASE_URL = getEnvVarWithDefault("NEXT_PUBLIC_STORAGE_BASE_URL", "");

const platformIcons = {
  INSTAGRAM: Instagram,
  FACEBOOK: Facebook,
  TIKTOK: Tiktok,
};

const platformColors = {
  INSTAGRAM: "text-rose-500",
  FACEBOOK: "text-blue-500",
  TIKTOK: "text-white",
};

type PostDetails = {
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
    status: "PENDING" | "SCHEDULED" | "POSTED" | "FAILED";
    errorMessage?: string | null;
    externalPostId?: string | null;
    publishedAt?: string | null;
    socialAccount?: {
      id: string;
      displayName: string;
    };
  }>;
  user?: {
    id: string;
    name: string | null;
    fullName: string | null;
    email: string;
  };
  author?: {
    id: string;
    email: string;
    name: string;
  };
  // Add common fields from different API versions
  media?: Array<{
    url?: string;
    storageKey?: string;
    mediaType?: "IMAGE" | "VIDEO";
  }>;
  assets?: string[];
};

interface PostDetailsModalProps {
  open: boolean;
  onClose: () => void;
  postId: string | null;
  onEdit: (postId: string) => void;
  onDelete?: (postId: string) => Promise<void>;
  posts: PostDetails[];
  loading?: boolean;
}

export default function PostDetailsModal({
  open,
  onClose,
  postId,
  onEdit,
  onDelete,
  posts,
  loading = false,
}: PostDetailsModalProps) {
  const { timezone: userTimezone, timezoneAbbr } = useTimezone();
  const { session } = useSessionContext();
  const isAdmin = session?.role === "ADMIN" || session?.role === "SUPER_ADMIN";
  const [isDeleting, setIsDeleting] = useState(false);

  const scrollHandlers = useScrollPropagation({ scrollWindowAtBoundary: true });

  const post = useMemo(() => {
    if (!open || !postId) return null;
    return posts.find((p) => p.id === postId) || null;
  }, [open, postId, posts]);

  // Improved media detection logic
  const allMediaUrls = useMemo(() => {
    if (!post) return [];
    
    const urls: string[] = [];
    
    // 1. Check plural assets array
    if (post.assets && post.assets.length > 0) {
      post.assets.forEach(asset => {
        if (asset) urls.push(asset);
      });
    }
    
    // 2. Check media array
    if (post.media && post.media.length > 0) {
      post.media.forEach(m => {
        if (m.url) {
          urls.push(m.url);
        } else if (m.storageKey) {
          const url = buildStorageUrl(STORAGE_BASE_URL, m.storageKey);
          if (url) urls.push(url);
        }
      });
    }
    
    // 3. Check single asset
    if (post.asset?.storageKey && urls.length === 0) {
      const url = buildStorageUrl(STORAGE_BASE_URL, post.asset.storageKey);
      if (url) urls.push(url);
    }
    
    return Array.from(new Set(urls)).filter((url): url is string => !!url);
  }, [post]);

  const isVideo = useMemo(() => {
    if (!post) return false;
    if (post.asset?.type === "VIDEO") return true;
    if (post.media?.some(m => m.mediaType === "VIDEO")) return true;
    
    // Check key patterns in URLs
    return allMediaUrls.some(url => url.toLowerCase().match(/\.(mp4|mov|webm)$/));
  }, [post, allMediaUrls]);

  const handleEdit = () => {
    if (postId) {
      onEdit(postId);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!postId || !onDelete) return;
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    setIsDeleting(true);
    try {
      await onDelete(postId);
      onClose();
    } catch (error) {
      console.error("Failed to delete post:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!open) return null;

  const scheduledDate = (post?.scheduledFor && userTimezone)
    ? dayjs(post.scheduledFor).tz(userTimezone) 
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      <style jsx>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      <div
        className="relative w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] overflow-hidden"
        style={{ animation: 'modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Top Accent Strip */}
        <div className={clsx(
           "h-1.5 w-full shrink-0",
           post?.status === 'POSTED' ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
           post?.status === 'FAILED' ? "bg-gradient-to-r from-rose-500 to-pink-500" :
           "bg-gradient-to-r from-amber-400 to-orange-500"
        )} />

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 shrink-0 transition-all">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
               Post Intelligence
               {post?.status === 'PUBLISHING' && (
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping inline-block" />
               )}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400">
               <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {scheduledDate ? scheduledDate.format('MMM D, HH:mm') : "Pending"}
               </span>
               <span className="w-1 h-1 rounded-full bg-slate-700" />
               <span className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {scheduledDate ? scheduledDate.fromNow() : "Scheduled"}
               </span>
            </div>
          </div>
          <button 
             onClick={onClose}
             className="p-2 rounded-full hover:bg-slate-800 text-slate-500 hover:text-white transition-all transform hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div 
          className="flex-1 overflow-y-auto px-6 py-2 space-y-6 scrollbar-hide overscroll-contain"
          {...scrollHandlers}
        >
          {loading ? (
             <div className="py-20 flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-800 border-t-amber-400 rounded-full animate-spin" />
                <span className="text-slate-400 animate-pulse">Analyzing Post Data...</span>
             </div>
          ) : !post ? (
             <div className="py-20 text-center">
                <AlertCircle className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <h4 className="text-xl text-slate-300 font-medium">Data Sync Error</h4>
                <p className="text-slate-500 text-sm mt-1">This post record could not be retrieved from the cluster.</p>
             </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Core Analytics / Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                 <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status</span>
                    <StatusPill status={post.status} />
                 </div>
                 <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Platforms</span>
                    <span className="text-sm font-semibold text-white">{post.targets.length} connected</span>
                 </div>
                 <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Media</span>
                    <span className="text-sm font-semibold text-white">{allMediaUrls.length > 0 ? `${allMediaUrls.length} file(s)` : "Null"}</span>
                 </div>
                 {/* <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">TZ</span>
                    <span className="text-sm font-semibold text-amber-400">{timezoneAbbr}</span>
                 </div> */}
              </div>

              {/* Admin Context */}
              {isAdmin && (post.user || post.author) && (
                <div className="p-4 bg-lime-400/10 border border-lime-400/20 rounded-2xl flex items-center gap-4">
                   <div className="p-2.5 bg-lime-400/20 rounded-xl">
                      <UserIcon className="w-5 h-5 text-lime-400" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-xs text-lime-400 font-bold uppercase tracking-widest">Post Origin</p>
                      <h5 className="text-sm font-medium text-white truncate">
                         {post.user?.fullName || post.user?.name || post.author?.name || post.user?.email || "Managed Account"}
                      </h5>
                   </div>
                   <Button variant="ghost" size="sm" className="text-lime-400 hover:bg-lime-400/10 text-xs">
                      View Profile
                   </Button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Left Column: Context */}
                 <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          Caption Strategy
                       </label>
                       <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner min-h-[120px] relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <ExternalLink className="w-4 h-4 text-slate-600" />
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-amber-400 selection:text-slate-900">
                             {post.caption === '.' ? <span className="text-slate-500 italic">No primary caption provided.</span> : post.caption}
                          </p>
                       </div>
                    </div>

                    {post.hashtags && Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
                      <div className="space-y-3">
                         <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Hash className="w-4 h-4 text-sky-400" />
                            Target Hashtags
                         </label>
                         <div className="flex flex-wrap gap-2">
                            {post.hashtags.map((tag, idx) => (
                               <span key={idx} className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1.5 rounded-xl text-xs font-medium hover:scale-105 transition-transform cursor-default">
                                {tag}
                               </span>
                            ))}
                         </div>
                      </div>
                    )}
                 </div>

                 {/* Right Column: Visual Preview */}
                 <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <ImageIcon className="w-4 h-4 text-pink-400" />
                       Media Asset
                    </label>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden group relative min-h-[200px]">
                       {allMediaUrls.length > 0 ? (
                         <div className={clsx(
                           "grid gap-1 w-full h-full",
                           allMediaUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"
                         )}>
                            {allMediaUrls.map((url, idx) => {
                              const isThisVideo = url.toLowerCase().match(/\.(mp4|mov|webm)$/);
                              return (
                                <div key={idx} className="relative aspect-square w-full h-full">
                                  {isThisVideo ? (
                                    <video src={url} controls className="w-full h-full object-cover" />
                                  ) : (
                                    <NextImage 
                                      src={url} 
                                      alt={`Post media ${idx + 1}`} 
                                      fill 
                                      className="object-cover transition-transform duration-700 hover:scale-110" 
                                      unoptimized
                                    />
                                  )}
                                </div>
                              );
                            })}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 pointer-events-none">
                               <span className="text-xs text-white font-medium drop-shadow-md">
                                 {allMediaUrls.length > 1 ? `${allMediaUrls.length} Media Files` : "Original Media File"}
                               </span>
                            </div>
                         </div>
                       ) : (
                         <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center gap-3 bg-slate-900/50">
                            <AlertCircle className="w-10 h-10 text-slate-800" />
                            <span className="text-xs text-slate-600">Visual post component empty.</span>
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* Target Platforms Detail */}
              <div className="space-y-4">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Platform Distribution Pipeline
                 </label>
                 <div className="grid grid-cols-1 gap-3">
                    {post.targets.map((target) => {
                       const Icon = platformIcons[target.platform];
                       const color = platformColors[target.platform];
                       return (
                         <div key={target.id} className="bg-slate-800/30 border border-slate-800 hover:border-slate-700/80 transition-all rounded-2xl p-4 flex items-center gap-4 group">
                            <div className={clsx("p-3 rounded-2xl bg-slate-900 group-hover:scale-110 transition-transform", color)}>
                               <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                               <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-sm">{target.platform}</span>
                                  {target.socialAccount && (
                                    <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-[10px] text-slate-400 border border-slate-800">
                                       @{target.socialAccount.displayName}
                                    </span>
                                  )}
                               </div>
                               {target.publishedAt && (
                                 <p className="text-[10px] text-slate-500 mt-0.5">
                                    Published {dayjs(target.publishedAt).tz(userTimezone).format('MMM D [at] HH:mm')}
                                 </p>
                               )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                               <StatusPill status={target.status === 'PENDING' ? 'SCHEDULED' : (target.status as any)} />
                               {target.errorMessage && (
                                  <div className="flex items-center gap-1.5 text-rose-400 group/err relative">
                                     <AlertCircle className="w-3.5 h-3.5" />
                                     <span className="text-[10px] font-bold max-w-[100px] truncate">{target.errorMessage}</span>
                                     <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-rose-950 border border-rose-500/50 rounded-lg text-[10px] text-white opacity-0 group-hover/err:opacity-100 transition-opacity z-50">
                                        {target.errorMessage}
                                     </div>
                                  </div>
                               )}
                            </div>
                         </div>
                       );
                    })}
                 </div>
              </div>

            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-6 shrink-0 border-t border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row gap-3">
            <Button 
               variant="outline" 
               onClick={onClose} 
               className="border-slate-800 bg-transparent text-slate-400 hover:text-white hover:bg-slate-800 flex-1 order-2 sm:order-1"
            >
               Close
            </Button>
            <div className="flex gap-2 flex-[2] order-1 sm:order-2">
               {isAdmin && (
                 <Button
                    variant="ghost"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
                 >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Archive
                 </Button>
               )}
               {post?.status !== 'POSTED' && (
                 <Button
                   onClick={handleEdit}
                   className="flex-1 bg-gradient-to-r from-lime-400 to-lime-500 text-slate-950 font-bold hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all"
                 >
                   <Edit2 className="w-4 h-4 mr-2" />
                   Optimization
                 </Button>
               )}
            </div>
        </div>
      </div>
    </div>
  );
}