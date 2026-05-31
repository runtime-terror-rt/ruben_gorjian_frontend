"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker";
import { useTimezone } from "@/hooks/use-timezone";
import { useScrollPropagation } from "@/hooks/use-scroll-propagation";
import {
  fromUTC,
  formatForDateTimeLocal,
  parseDateTimeLocal,
} from "@/lib/timezone";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import clsx from "clsx";
import { useToast } from "@/hooks/use-toast";

import { getEnvVarWithDefault } from "@/lib/env-utils";
import { buildStorageUrl } from "@/lib/storage-utils";

dayjs.extend(utc);
dayjs.extend(timezone);

const STORAGE_BASE_URL = getEnvVarWithDefault(
  "NEXT_PUBLIC_STORAGE_BASE_URL",
  "",
);

interface PostModalProps {
  open: boolean;
  onClose: () => void;
  initialDate: dayjs.Dayjs | null;
  socialAccounts: Array<{
    id: string;
    platform: string;
    displayName: string;
    externalAccountId?: string;
  }>;
  onCreate: (
    payload: {
      caption: string;
      scheduledFor: string;
      socialAccountIds: string[];
      platforms: string[];
      assetIds?: string[];
      hashtags?: string[];
      mediaUrl?: string;
      mediaUrls?: string[];
    },
    files?: File[],
  ) => Promise<void>;
  onUpload: (file: File) => Promise<{ id: string; storageKey: string }>;
  uploading?: boolean;
  editingPost?: {
    id: string;
    caption: string;
    scheduledFor: string;
    assetId?: string;
    assetIds?: string[];
    socialAccountIds: string[];
    hashtags?: string[];
    existingMedia?: any[];
    status?: string;
  } | null;
  isAdmin?: boolean;
  onPublish?: (payload: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  clientEmail?: string;
}

type UploadedAsset = { id: string; storageKey: string; name?: string };

export default function PostModal({
  open,
  onClose,
  initialDate,
  socialAccounts,
  onCreate,
  onUpload,
  uploading = false,
  editingPost,
  isAdmin = false,
  onPublish,
  onDelete,
  clientEmail,
}: PostModalProps) {
  const [caption, setCaption] = useState("");
  const [datetime, setDatetime] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [assetIds, setAssetIds] = useState<string[]>([]);
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [hashtagsInput, setHashtagsInput] = useState("");
  const isEditing = !!editingPost;
  const { timezone: userTimezone, timezoneAbbr } = useTimezone();
  const { toast } = useToast();

  const isPosted = editingPost?.status === "POSTED";
  const scrollHandlers = useScrollPropagation({ scrollWindowAtBoundary: true });

  const normalizeHashtags = (input: string): string[] => {
    if (!input.trim()) return [];
    const tags = input
      .split(/[\s,]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .map((tag) => {
        const cleaned = tag.replace(/^#+/, "");
        return cleaned.length > 0 ? `#${cleaned}` : "";
      })
      .filter((tag) => tag.length > 0);
    return tags.slice(0, 30);
  };

  const requiresMedia = useMemo(
    () =>
      socialAccounts
        .filter((acc) => selectedAccounts.includes(acc.id))
        .some(
          (acc) => acc.platform === "INSTAGRAM" || acc.platform === "TIKTOK",
        ),
    [selectedAccounts, socialAccounts],
  );

  const hasFacebook = useMemo(
    () =>
      socialAccounts
        .filter((acc) => selectedAccounts.includes(acc.id))
        .some((acc) => acc.platform === "FACEBOOK"),
    [selectedAccounts, socialAccounts],
  );

  // Instagram allows only one media file; Facebook supports multiple
  const allowsMultipleMedia = useMemo(() => {
    // If it's Instagram or TikTok, we usually want to restrict to one for simplicity in UI,
    // but the user's requirement is: photos any number, video only one.
    // However, Instagram/TikTok platforms themselves have limits.
    // We'll follow the user's specific request for the UI logic.
    return true; // We'll handle the specifics in handleFiles and handleSubmit
  }, []);

  const storageConfigured = useMemo(() => {
    if (!requiresMedia) return true;
    return true;
  }, [requiresMedia]);

  useEffect(() => {
    if (editingPost) {
      setCaption(editingPost.caption === "." ? "" : editingPost.caption || "");
      // Convert from UTC to user timezone for display
      const scheduledDate = fromUTC(editingPost.scheduledFor, userTimezone);
      setDatetime(formatForDateTimeLocal(scheduledDate, userTimezone));
      setSelectedAccounts(editingPost.socialAccountIds);
      // Support both single assetId (legacy) and assetIds array
      if (editingPost.assetId) {
        setAssetIds([editingPost.assetId]);
      } else if (editingPost.assetIds && Array.isArray(editingPost.assetIds)) {
        setAssetIds(editingPost.assetIds);
      } else {
        setAssetIds([]);
      }
      setHashtagsInput(
        editingPost.hashtags && Array.isArray(editingPost.hashtags)
          ? editingPost.hashtags.join(" ")
          : "",
      );
      if (editingPost.existingMedia) {
        setAssets(editingPost.existingMedia);
      }
    } else if (initialDate) {
      // initialDate is already in user timezone from calendar
      setDatetime(formatForDateTimeLocal(initialDate, userTimezone));
    }
  }, [initialDate, editingPost, userTimezone]);

  useEffect(() => {
    if (!open) {
      setCaption("");
      setDatetime("");
      setSelectedAccounts([]);
      setSubmitting(false);
      setAssets([]);
      setAssetIds([]);
      setHashtagsInput("");
    }
  }, [open]);

  const toggleAccount = (id: string) => {
    const account = socialAccounts.find((acc) => acc.id === id);
    if (!account) return;

    // Users can now change platforms even during editing
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleSubmit = async () => {
    if (!caption.trim()) {
      toast({
        title: "Caption Required",
        description: "Please add a caption",
        variant: "destructive",
      });
      return;
    }

    if (!datetime) {
      toast({
        title: "Input Required",
        description: "Please choose a date and time",
        variant: "destructive",
      });
      return;
    }

    // ✅ CRITICAL: Validate timezone is set correctly (not UTC fallback for BD users)
    if (!userTimezone || userTimezone === "UTC") {
      toast({
        title: "Timezone Not Set",
        description: "Please set your timezone in Settings → Business before scheduling. Go to Dashboard → Settings → Business → Timezone and select 'Asia/Dhaka'.",
        variant: "destructive",
      });
      return;
    }

    // ✅ Convert local datetime to UTC ISO string HERE in the modal
    // datetime is "YYYY-MM-DDTHH:mm" in user's local timezone
    // parseDateTimeLocal interprets it as userTimezone and converts to UTC
    const scheduledForUTC = parseDateTimeLocal(datetime, userTimezone).toISOString();

    // Debug log to verify conversion
    console.log("[SUBMIT] userTimezone:", userTimezone);
    console.log("[SUBMIT] datetime (local):", datetime);
    console.log("[SUBMIT] scheduledForUTC (sent to backend):", scheduledForUTC);

    // Validate past dates
    const now = dayjs().tz(userTimezone);
    const selectedDate = dayjs.tz(datetime, userTimezone);

    if (selectedDate.isBefore(now, "minute")) {
      toast({
        title: "Invalid Date",
        description:
          "Cannot schedule posts in the past. Please select a future date and time.",
        variant: "destructive",
      });
      return;
    }

    if (selectedAccounts.length === 0) {
      toast({
        title: "Account Required",
        description: "Select at least one social account",
        variant: "destructive",
      });
      return;
    }

    // Removed artificial single-media restriction for Instagram/TikTok to support carousel posts

    const selectedAssets = assets.filter((a) => assetIds.includes(a.id));

    // Validate combined assets (uploaded + pending)
    const allSelectedMedia = [
      ...selectedAssets.map((a) => ({
        type: a.storageKey.toLowerCase().match(/\.(mp4|mov|webm)$/)
          ? "VIDEO"
          : "IMAGE",
        name: a.name,
      })),
      ...selectedFiles.map((f) => ({
        type: f.type.startsWith("video/") ? "VIDEO" : "IMAGE",
        name: f.name,
      })),
    ];

    const hasVideo = allSelectedMedia.some((m) => m.type === "VIDEO");
    const hasImage = allSelectedMedia.some((m) => m.type === "IMAGE");

    if (allSelectedMedia.filter((m) => m.type === "VIDEO").length > 1) {
      toast({
        title: "Video Limit",
        description: "You can only include one video per post.",
        variant: "destructive",
      });
      return;
    }

    // TikTok specific: Video only
    const hasTikTok = socialAccounts
      .filter((acc) => selectedAccounts.includes(acc.id))
      .some((acc) => acc.platform === "TIKTOK");

    if (hasTikTok && hasImage) {
      toast({
        title: "Format Error",
        description:
          "TikTok only supports video uploads. Please remove any images.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const platforms = Array.from(
        new Set(
          socialAccounts
            .filter((acc) => selectedAccounts.includes(acc.id))
            .map((acc) => acc.platform),
        ),
      );
      const hashtags = normalizeHashtags(hashtagsInput);
      const metadata = {
        caption: caption.trim(),
        // ✅ Pass UTC ISO string — context will NOT double-convert this
        scheduledFor: scheduledForUTC,
        socialAccountIds: selectedAccounts,
        platforms,
        assetIds,
        hashtags,
        // Include mediaUrl/mediaUrls for backward compatibility in the JSON metadata
        ...(selectedAssets.length > 0
          ? selectedAssets.length > 1
            ? {
                mediaUrls: selectedAssets
                  .map((a) => buildStorageUrl(STORAGE_BASE_URL, a.storageKey))
                  .filter((url): url is string => !!url),
              }
            : {
                mediaUrl:
                  buildStorageUrl(
                    STORAGE_BASE_URL,
                    selectedAssets[0].storageKey,
                  ) || undefined,
              }
          : {}),
      };

      await onCreate(metadata, selectedFiles);
      onClose();
    } catch (err: any) {
      // Error will be caught by EnhancedCalendar and toasted there,
      // but we'll toast here too for redundancy if preferred
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishNow = async () => {
    if (!caption.trim()) {
      toast({
        title: "Caption Required",
        description: "Please add a caption",
        variant: "destructive",
      });
      return;
    }
    if (selectedAccounts.length === 0) {
      toast({
        title: "Account Required",
        description: "Select at least one social account",
        variant: "destructive",
      });
      return;
    }
    if (requiresMedia && assetIds.length === 0 && selectedFiles.length === 0) {
      toast({
        title: "Media Required",
        description: "Instagram and TikTok require media to publish.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      if (onPublish) {
        const hashtags = normalizeHashtags(hashtagsInput);
        const platforms = Array.from(
          new Set(
            socialAccounts
              .filter((acc) => selectedAccounts.includes(acc.id))
              .map((acc) => acc.platform),
          ),
        );
        await onPublish({
          caption: caption.trim(),
          scheduledFor: datetime,
          socialAccountIds: selectedAccounts,
          platforms,
          ...(assetIds.length > 0 ? { assetIds } : {}),
          ...(hashtags.length > 0 ? { hashtags } : {}),
        });
        toast({
          title: "Successfully Published",
          description: "Your post is being published.",
        });
        onClose();
        return;
      }

      const selectedAssets = assets.filter((a) => assetIds.includes(a.id));
      const hasVideo = selectedAssets.some((a) => {
        const key = a.storageKey.toLowerCase();
        return (
          key.endsWith(".mp4") || key.endsWith(".mov") || key.endsWith(".webm")
        );
      });
      const hasImage = selectedAssets.some((a) => {
        const key = a.storageKey.toLowerCase();
        return (
          !key.endsWith(".mp4") &&
          !key.endsWith(".mov") &&
          !key.endsWith(".webm")
        );
      });

      if (hasVideo && hasImage) {
        toast({
          title: "Mixed Media",
          description: "You cannot mix photos and videos in a single post.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      if (hasVideo && selectedAssets.length > 1) {
        toast({
          title: "Video Limit",
          description: "You can only upload one video per post.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // TikTik specific check
      const hasTikTok = socialAccounts
        .filter((acc) => selectedAccounts.includes(acc.id))
        .some((acc) => acc.platform === "TIKTOK");

      if (hasTikTok) {
        if (hasImage) {
          toast({
            title: "Format Error",
            description:
              "TikTok only supports video uploads. Please remove any images.",
            variant: "destructive",
          });
          setSubmitting(false);
          return;
        }
      }

      const hashtags = normalizeHashtags(hashtagsInput);
      const fullCaption =
        hashtags.length > 0
          ? `${caption.trim()}\n\n${hashtags.join(" ")}`
          : caption.trim();

      // Upload local files first for Publish Now
      const uploadedAssets: UploadedAsset[] = [];
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          try {
            const asset = await onUpload(file);
            uploadedAssets.push({
              id: asset.id,
              storageKey: asset.storageKey,
              name: file.name,
            });
          } catch (err) {
            throw new Error(`Failed to upload ${file.name}`);
          }
        }
      }
      const combinedAssets = [
        ...assets.filter((a) => assetIds.includes(a.id)),
        ...uploadedAssets,
      ];

      for (const accountId of selectedAccounts) {
        const account = socialAccounts.find((a) => a.id === accountId);
        if (!account) continue;

        let technicalUsername = account.displayName || account.id;

        // Admin publishing flow for a client
        if (isAdmin && clientEmail) {
          technicalUsername = clientEmail
            .split("@")[0]
            .replace(/[^a-zA-Z0-9_]/g, "_");
        } else if (account.externalAccountId) {
          if (account.externalAccountId.startsWith("upload-post:")) {
            technicalUsername = account.externalAccountId.replace(
              "upload-post:",
              "",
            );
          } else {
            technicalUsername = account.externalAccountId;
          }
        }

        const isFacebook = account.platform === "FACEBOOK";

        const payload: any = {
          username: technicalUsername,
          platform: account.platform.toLowerCase(),
          title: fullCaption,
          asyncUpload: true,
        };

        if (combinedAssets.length > 0) {
          if (isFacebook && combinedAssets.length > 1) {
            payload.mediaUrls = combinedAssets.map((a) =>
              buildStorageUrl(STORAGE_BASE_URL, a.storageKey),
            );
          } else {
            payload.mediaUrl = buildStorageUrl(
              STORAGE_BASE_URL,
              combinedAssets[0].storageKey,
            );
          }
        }

        const endpoint =
          account.platform === "TIKTOK"
            ? "/api/tiktok/publish-now"
            : "/api/social-media/publish-now";

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.message ||
              `Failed to post. Please try again or contact support.`,
          );
        }
      }
      toast({
        title: "Published Successfully",
        description: "Your post has been published to the selected accounts.",
      });
      onClose();
    } catch (err) {
      toast({
        title: "Publish Error",
        description:
          err instanceof Error
            ? err.message
            : "Failed to post. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFiles = async (files?: FileList | null) => {
    if (!files || files.length === 0) return;

    const existingVideos = assets.filter((a) => {
      const key = a.storageKey.toLowerCase();
      return (
        key.endsWith(".mp4") || key.endsWith(".mov") || key.endsWith(".webm")
      );
    });
    const pendingVideos = selectedFiles.filter((f) =>
      f.type.startsWith("video/"),
    );

    let totalVideos = existingVideos.length + pendingVideos.length;

    const newFilesList = Array.from(files);
    const validFilesToAppend: File[] = [];

    for (const file of newFilesList) {
      const isVideo = file.type.startsWith("video/");

      if (isVideo) {
        if (totalVideos >= 1) {
          toast({
            title: "Video Limit",
            description:
              "You can only upload one video per post. Skipping additional videos.",
            variant: "destructive",
          });
          continue;
        }
        totalVideos++;
      }
      validFilesToAppend.push(file);
    }

    if (validFilesToAppend.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFilesToAppend]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <style jsx>{`
        @keyframes modalFade {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes overlayFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm overscroll-none"
        style={{ animation: "overlayFade 180ms ease-out" }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl max-h-[90vh] flex flex-col pointer-events-auto overflow-hidden"
        style={{ animation: "modalFade 200ms ease-out" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {isEditing ? "Edit Post" : "New Post"}
            </h3>
            <p className="text-xs text-slate-400">
              {isEditing
                ? "Update your scheduled post"
                : "Schedule a post for your connected accounts"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-300 hover:text-white"
          >
            Close
          </Button>
        </div>

        <div
          className="space-y-4 px-5 py-4 overflow-y-auto flex-1 min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ WebkitOverflowScrolling: "touch" }}
          {...scrollHandlers}
        >
          <div className="space-y-2">
            <label className="text-sm text-slate-300">
              Media{" "}
              {requiresMedia && (
                <span className="text-amber-400/70">
                  (Optional for scheduling)
                </span>
              )}
            </label>
            <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/60 p-3">
              {!isEditing && (
                <>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                    disabled={isPosted}
                    className={clsx(
                      "text-xs text-slate-200 file:mr-3 file:rounded-md file:border file:border-slate-700 file:bg-slate-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-100 hover:file:bg-slate-700",
                      isPosted && "opacity-50 cursor-not-allowed",
                    )}
                  />
                  <div className="mt-2 text-xs text-slate-400">
                    {uploading && <span>Uploading...</span>}
                    {assets.length > 0 && !uploading && (
                      <span className="text-lime-300">
                        {assets.length} file(s) uploaded
                      </span>
                    )}
                    {assets.length === 0 &&
                      !uploading &&
                      assetIds.length === 0 && (
                        <span>
                          Optional: Attach media. Admin can add it later.
                        </span>
                      )}
                  </div>
                </>
              )}
              {isEditing && assets.length === 0 && (
                <div className="text-xs text-slate-500 italic py-2 text-center">
                  No media attached to this post
                </div>
              )}
              {assets.length > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="text-xs text-slate-300 font-medium">
                    {allowsMultipleMedia
                      ? "Select media (multiple allowed)"
                      : "Select one asset"}
                  </div>
                  <div className="space-y-1 max-h-28 overflow-auto">
                    {[
                      ...assets,
                      ...selectedFiles.map((f) => ({
                        id: f.name,
                        name: f.name,
                        storageKey: f.name,
                        isLocal: true,
                        file: f,
                      })),
                    ].map((asset: any) => {
                      const id = "isLocal" in asset ? asset.name : asset.id;
                      const isSelected =
                        "isLocal" in asset || assetIds.includes(asset.id);

                      let thumbUrl = null;
                      if (!("isLocal" in asset) && asset.storageKey) {
                        thumbUrl = buildStorageUrl(
                          STORAGE_BASE_URL,
                          asset.storageKey,
                        );
                      } else if ("isLocal" in asset && asset.file) {
                        // Create object URL for local files preview
                        if (asset.file.type.startsWith("image/")) {
                          thumbUrl = URL.createObjectURL(asset.file);
                        }
                      }

                      return (
                        <label
                          key={id}
                          className={clsx(
                            "flex items-center gap-2 text-xs text-slate-200 p-1.5 rounded cursor-pointer hover:bg-slate-800/50 transition-all",
                            isSelected &&
                              "bg-slate-800/70 border border-lime-400/50",
                          )}
                        >
                          {thumbUrl ? (
                            <div className="h-8 w-8 rounded overflow-hidden flex-shrink-0 border border-slate-700">
                              <img
                                src={thumbUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : "isLocal" in asset &&
                            asset.file?.type.startsWith("video/") ? (
                            <div className="h-8 w-8 rounded overflow-hidden flex-shrink-0 border border-slate-700 bg-slate-800 flex items-center justify-center">
                              <span className="text-[8px] font-bold text-slate-400">
                                VIDEO
                              </span>
                            </div>
                          ) : null}
                          <input
                            type={allowsMultipleMedia ? "checkbox" : "radio"}
                            name="asset"
                            value={id}
                            checked={isSelected}
                            readOnly={
                              "isLocal" in asset || isPosted || isEditing
                            }
                            disabled={isPosted || isEditing}
                            onChange={() => {
                              if ("isLocal" in asset || isPosted || isEditing)
                                return;
                              if (allowsMultipleMedia) {
                                setAssetIds((prev) =>
                                  prev.includes(asset.id)
                                    ? prev.filter((id) => id !== asset.id)
                                    : [...prev, asset.id],
                                );
                              } else {
                                setAssetIds([asset.id]);
                              }
                            }}
                            className="accent-lime-400"
                          />
                          <span className="truncate flex-1">
                            {asset.name}{" "}
                            {"isLocal" in asset && (
                              <span className="text-[10px] text-amber-400 ml-1">
                                (Pending)
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300 flex items-center gap-1">
              Caption <span className="text-rose-500">*</span>
            </label>
            <MarkdownEditor
              value={caption}
              onChange={setCaption}
              placeholder="Write your caption..."
              rows={6}
              readOnly={isPosted}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Hashtags</label>
            <textarea
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 p-2 text-sm text-white focus:border-lime-400 focus:outline-none"
              rows={2}
              value={hashtagsInput}
              onChange={(e) => setHashtagsInput(e.target.value)}
              placeholder="#hashtag1 #hashtag2"
              readOnly={isPosted}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <EnhancedDatePicker
              value={datetime}
              onChange={setDatetime}
              timezone={userTimezone}
              timezoneAbbr={timezoneAbbr}
              min={formatForDateTimeLocal(dayjs(), userTimezone)}
              disabled={isPosted}
            />
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Accounts</label>
              <div className="max-h-32 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/60 p-2 space-y-1">
                {socialAccounts.map((acc) => (
                  <label
                    key={acc.id}
                    className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAccounts.includes(acc.id)}
                      onChange={() => toggleAccount(acc.id)}
                      disabled={isPosted}
                      className={clsx(
                        "h-4 w-4 accent-lime-400 cursor-pointer",
                        isPosted && "opacity-50 cursor-not-allowed",
                      )}
                    />
                    <span className="text-xs rounded px-1.5 py-0.5 border border-slate-700 text-slate-300">
                      {acc.platform}
                    </span>
                    <span className="truncate text-sm text-slate-100">
                      {acc.displayName || acc.id}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          {/* Timezone info banner — helps user & developer verify correct TZ */}
          {datetime && userTimezone && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 flex items-center gap-2">
              <span className="text-xs text-amber-400 font-semibold shrink-0">🕐 Schedule TZ:</span>
              <span className="text-xs text-amber-300/80 flex-1 truncate">
                {userTimezone} ({timezoneAbbr}) — fires at{" "}
                <span className="font-bold text-amber-300">
                  {(() => {
                    try {
                      const utcTime = dayjs.tz(datetime, userTimezone).utc();
                      return utcTime.format("MMM D, HH:mm [UTC]");
                    } catch {
                      return "—";
                    }
                  })()}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-800 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-300 hover:text-white"
          >
            Cancel
          </Button>
          {isEditing && onDelete && (
            <Button
              variant="ghost"
              onClick={async () => {
                if (confirm("Are you sure you want to delete this post?")) {
                  setSubmitting(true);
                  try {
                    await onDelete(editingPost.id);
                    onClose();
                  } catch (err) {
                    console.error("Delete Error:", err);
                  } finally {
                    setSubmitting(false);
                  }
                }
              }}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 mr-auto"
            >
              Delete Post
            </Button>
          )}
          {!isPosted && (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-lime-400 text-slate-900 hover:bg-lime-300"
            >
              {submitting
                ? isEditing
                  ? "Updating..."
                  : "Scheduling..."
                : isEditing
                  ? "Update"
                  : "Schedule"}
            </Button>
          )}
          {/* {(isAdmin || onPublish) && !isPosted && (
            <Button
              onClick={handlePublishNow}
              disabled={submitting}
              className="bg-sky-500 text-white hover:bg-sky-400"
            >
              {submitting ? "Publishing..." : "Publish Now"}
            </Button>
          )} */}
        </div>
      </div>
    </div>
  );
}
