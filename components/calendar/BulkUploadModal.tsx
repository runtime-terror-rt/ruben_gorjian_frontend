"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Image as ImageIconLucide,
  CalendarIcon,
  ChevronRight,
  ArrowLeft,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onSuccess: () => void;
}

interface ParsedPost {
  rowNumber: number;
  imageFilename?: string;
  caption: string;
  hashtags?: string[];
  suggestedDate?: string;
  suggestedTime?: string;
  scheduledAt?: string | null;
  errors?: string[];
  // user-assigned date/time for scheduling
  assignedDate?: string;
  assignedTime?: string;
}

// Stepper component
function Stepper({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  const steps = [
    { label: "Upload CSV", num: 1 },
    { label: "Review & Schedule", num: 2 },
    { label: "Upload Images", num: 3 },
    { label: "Final Edit & Confirm", num: 4 },
  ];
  return (
    <div className="flex items-center gap-0 px-6 pt-5 pb-1">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                currentStep > step.num
                  ? "bg-[#b08d3e] border-[#b08d3e] text-white"
                  : currentStep === step.num
                  ? "bg-[#b08d3e]/10 border-[#b08d3e] text-[#b08d3e]"
                  : "bg-[#f6f1e6] border-[#d9d4c9] text-[#6b6b6b]"
              }`}
            >
              {currentStep > step.num ? <CheckCircle2 className="h-4 w-4" /> : step.num}
            </div>
            <span
              className={`text-xs mt-1 font-semibold whitespace-nowrap ${
                currentStep >= step.num ? "text-[#b08d3e]" : "text-[#6b6b6b]"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 mx-1 transition-all ${currentStep > step.num ? "bg-[#b08d3e]" : "bg-[#d9d4c9]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function BulkUploadModal({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: BulkUploadModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [posts, setPosts] = useState<ParsedPost[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadedAssetsData, setUploadedAssetsData] = useState<any[]>([]);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStep(1);
    setPreviewData(null);
    setPosts([]);
    setSelectedImages([]);
    setUploadedAssetsData([]);
    setConfirmError(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const getDefaultDate = (index: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + 7 + index);
    return d.toISOString().slice(0, 10);
  };

  const getDefaultTime = (): string => "12:00";

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!userId) {
      toast({ title: "Error", description: "User ID is missing.", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      setConfirmError(null);
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("file", file);

      const res = await fetch("/api/scheduler/bulk/preview", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || errorData?.error || "Failed to preview bulk data");
      }

      const data = await res.json();
      setPreviewData(data);

      // Enrich posts with assignedDate/assignedTime defaults
      const enriched: ParsedPost[] = (data.posts || []).map((post: any, i: number) => {
        let assignedDate = "";
        let assignedTime = "";

        if (post.scheduledAt) {
          try {
            const d = new Date(post.scheduledAt);
            assignedDate = d.toISOString().slice(0, 10);
            assignedTime = d.toTimeString().slice(0, 5);
          } catch {}
        } else if (post.suggestedDate) {
          assignedDate = post.suggestedDate;
          assignedTime = post.suggestedTime || getDefaultTime();
        } else {
          assignedDate = getDefaultDate(i);
          assignedTime = getDefaultTime();
        }

        return { ...post, assignedDate, assignedTime };
      });

      setPosts(enriched);
      setStep(2);
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message || "An error occurred while uploading CSV.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const updatePostField = (index: number, field: keyof ParsedPost, value: any) => {
    setPosts((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const normalizeMediaMatch = (value: string) =>
    value ? value.trim().toLowerCase().replace(/\.[a-z0-9]+$/i, "") : "";

  // "Missing Date or Time" is a fixable error — user provides dates via pickers
  const DATE_ERROR_KEYWORDS = ["missing date", "missing time", "date or time", "date", "time"];
  const isOnlyDateError = (errors?: string[]) =>
    errors?.length === 1 &&
    DATE_ERROR_KEYWORDS.some((k) => errors[0].toLowerCase().includes(k));

  // Posts that truly cannot be fixed (non-date errors)
  const hardErrorPosts = posts.filter(
    (p) => p.errors && p.errors.length > 0 && !isOnlyDateError(p.errors)
  );
  // Posts we will actually schedule (all posts minus hard errors)
  const schedulablePosts = posts.filter(
    (p) => !p.errors || p.errors.length === 0 || isOnlyDateError(p.errors)
  );

  const checkSchedules = (currentTime: number) => {
    for (const p of schedulablePosts) {
      if (!p.assignedDate || !p.assignedTime) return { valid: false, message: "Please set a date and time for all posts." };
      const dateTimeStr = `${p.assignedDate}T${p.assignedTime}:00`;
      const scheduledAt = new Date(dateTimeStr);
      if (scheduledAt.getTime() <= currentTime) {
        return { valid: false, message: `Post #${p.rowNumber} is scheduled in the past. Please select a future time.` };
      }
    }
    return { valid: true, message: "" };
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const expectedNames = previewData?.expectedImages?.map(normalizeMediaMatch) || [];
      
      const validFiles = files.filter(f => expectedNames.includes(normalizeMediaMatch(f.name)));
      
      if (validFiles.length < files.length) {
        setConfirmError("Some selected files are not in the required images list and were ignored.");
      } else {
        setConfirmError(null);
      }

      setSelectedImages((prev) => {
        const newFiles = [...prev];
        validFiles.forEach(file => {
          const exists = newFiles.some(f => normalizeMediaMatch(f.name) === normalizeMediaMatch(file.name));
          if (!exists) newFiles.push(file);
        });
        return newFiles;
      });
      
      // Reset input so the same file can be selected again if removed
      if (e.target) e.target.value = "";
    }
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadImages = async () => {
    if (!userId || !previewData) return;

    try {
      setLoading(true);
      setConfirmError(null);

      // 1. Upload Images
      let uploadedAssets: any[] = [];
      if (selectedImages.length > 0) {
        const formData = new FormData();
        formData.append("userId", userId);
        selectedImages.forEach((img) => formData.append("files", img));

        const uploadRes = await fetch("/api/scheduler/bulk/upload-images", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => null);
          throw new Error(errData?.message || errData?.error || "Failed to upload images");
        }

        const uploadData = await uploadRes.json();
        uploadedAssets = Array.isArray(uploadData)
          ? uploadData
          : uploadData.media || uploadData.data || uploadData.assets || [];
        
        // Also capture nameToId if the backend provides it for bulletproof mapping
        if (uploadData.nameToId) {
          (uploadedAssets as any).nameToId = uploadData.nameToId;
        }
      }
      
      setUploadedAssetsData(uploadedAssets);
      setStep(4);
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message || "An error occurred during image upload.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!userId || !previewData) return;

    try {
      setLoading(true);
      setConfirmError(null);

      const uploadedAssets = uploadedAssetsData;
      const backendNameToId = (uploadedAssets as any).nameToId;

      // Map original filename to the uploaded asset ID
      const assetMap = new Map<string, string>();
      
      if (backendNameToId) {
        // Use the highly reliable map provided by the backend
        Object.entries(backendNameToId).forEach(([name, id]) => {
          if (typeof id === "string") {
            assetMap.set(normalizeMediaMatch(name), id);
          }
        });
      } else {
        // Fallback to manual mapping
        uploadedAssets.forEach((asset: any, index: number) => {
          const id = typeof asset === "string" ? asset : (asset.id || asset._id);
          const name = asset.originalFileName || asset.originalName || asset.filename || asset.name || (selectedImages[index] ? selectedImages[index].name : null);
          if (id && name) {
            assetMap.set(normalizeMediaMatch(name), id);
          }
        });
      }

      // Build valid ISO datetimes from the user-assigned date + time
      // Include ALL posts user can fix (skip only hard non-date errors)
      const postsToSchedule = schedulablePosts.map((post) => {
        const dateTimeStr = `${post.assignedDate}T${post.assignedTime}:00`;
        const scheduledAt = new Date(dateTimeStr).toISOString();

        const postAssetIds = [];
        if (post.imageFilename) {
          const matchingId = assetMap.get(normalizeMediaMatch(post.imageFilename));
          if (matchingId) {
            postAssetIds.push(matchingId);
          }
        }

        return {
          caption: post.caption,
          hashtags: post.hashtags || [],
          scheduledAt,
          assetIds: postAssetIds,
          imageFilename: post.imageFilename,
        };
      });

      if (postsToSchedule.length === 0) {
        throw new Error("No valid posts to schedule. All posts have unresolvable errors.");
      }

      const confirmPayload = {
        userId,
        platforms: ["INSTAGRAM"],
        posts: postsToSchedule,
      };

      const confirmRes = await fetch("/api/scheduler/bulk/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(confirmPayload),
      });

      if (!confirmRes.ok) {
        const errData = await confirmRes.json().catch(() => null);
        throw new Error(errData?.message || errData?.error || "Failed to confirm bulk schedule");
      }

      const confirmData = await confirmRes.json().catch(() => null);
      const errorCount = Number(confirmData?.errorCount || 0);
      const successCount = Number(confirmData?.successCount || 0);

      if (errorCount > 0) {
        const firstError = confirmData?.errors?.[0]?.error || "Unknown error";
        const summary = `${successCount} post(s) scheduled successfully. ${errorCount} failed.`;
        
        setConfirmError(`${summary} Reason: ${firstError}`);
        
        toast({
          title: successCount > 0 ? "Partially Scheduled" : "Scheduling Failed",
          description: `Reason: ${firstError}`,
          variant: "destructive",
        });
        
        if (successCount > 0) {
          await onSuccess();
        }
        return;
      }

      toast({ title: "Success! 🎉", description: "All posts have been scheduled successfully." });
      await onSuccess();
      handleClose();
    } catch (err: any) {
      toast({
        title: "Bulk Schedule Failed",
        description: err.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const problemPosts = hardErrorPosts;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl bg-[#faf8f3] border-[#d9d4c9] text-[#14110c] p-0 overflow-hidden flex flex-col max-h-[95vh] shadow-2xl rounded-3xl">
        {/* Header */}
        <DialogHeader className="shrink-0 bg-[#ffffff] border-b border-[#d9d4c9]">
          <div className="flex items-center gap-3 px-6 pt-5 pb-2">
            <div className="p-2.5 bg-[#b08d3e]/10 rounded-xl border border-[#b08d3e]/20">
              <UploadCloud className="h-5 w-5 text-[#b08d3e]" />
            </div>
            <DialogTitle className="text-xl font-bold">Bulk CSV Upload</DialogTitle>
          </div>
          <Stepper currentStep={step} />
        </DialogHeader>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">

          {/* STEP 1: CSV Upload */}
          {step === 1 && (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <div
                className="w-full max-w-lg border-2 border-dashed border-[#d9d4c9] rounded-2xl p-12 flex flex-col items-center justify-center bg-white hover:border-[#b08d3e]/60 hover:bg-[#b08d3e]/5 transition-all cursor-pointer"
                onClick={() => !loading && fileInputRef.current?.click()}
              >
                <div className="p-5 bg-[#f6f1e6] rounded-2xl mb-5">
                  <FileText className="h-10 w-10 text-[#b08d3e]" />
                </div>
                <h3 className="text-lg font-bold text-[#14110c] mb-2">Select Your Content Calendar File</h3>
                <p className="text-sm text-[#6b6b6b] text-center mb-8 max-w-xs">
                  Upload a CSV or Excel file to preview, review, and bulk schedule your posts.
                </p>
                <Button
                  className="bg-[#b08d3e] hover:bg-[#9a7a35] text-black font-semibold px-8 h-11"
                  disabled={loading}
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />}
                  {loading ? "Processing..." : "Browse Files"}
                </Button>
                <p className="text-xs text-[#6b6b6b] mt-4">Supported formats: .csv, .xlsx, .xls</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleCSVUpload}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Review & Set Schedules */}
          {step === 2 && previewData && (
            <div className="space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-[#d9d4c9] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#6b6b6b] mb-1">Total Posts</p>
                    <p className="text-3xl font-black text-[#14110c]">{previewData.totalPosts || 0}</p>
                  </div>
                  <div className="h-11 w-11 bg-[#f6f1e6] rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-[#b08d3e]" />
                  </div>
                </div>
                <div className="bg-white border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#6b6b6b] mb-1">Will Schedule</p>
                    <p className="text-3xl font-black text-emerald-600">{schedulablePosts.length}</p>
                  </div>
                  <div className="h-11 w-11 bg-emerald-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
                <div className="bg-white border border-red-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#6b6b6b] mb-1">Problems</p>
                    <p className="text-3xl font-black text-red-500">{problemPosts.length}</p>
                  </div>
                  <div className="h-11 w-11 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Info banner if there are missing dates */}
              {schedulablePosts.some(p => !p.suggestedDate && !p.scheduledAt) && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                  <CalendarIcon className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
                  <span>Some posts are missing a scheduled date. Please review the date and time for each post below before continuing.</span>
                </div>
              )}

              {/* Posts Table */}
              <div className="bg-white border border-[#d9d4c9] rounded-xl overflow-hidden">
                <div className="bg-[#f6f1e6] px-4 py-3 border-b border-[#d9d4c9]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-[#14110c]">Posts ({posts.length}) — Set Schedule</h3>
                    <span className="text-xs text-[#6b6b6b] italic">{schedulablePosts.length} will be scheduled</span>
                  </div>
                  {/* Quick apply: set same date+time to all schedulable posts */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[#6b6b6b] font-semibold">Apply to all:</span>
                    <input
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => {
                        if (e.target.value) {
                          setPosts(prev => prev.map(p =>
                            (!p.errors || p.errors.length === 0 || isOnlyDateError(p.errors))
                              ? { ...p, assignedDate: e.target.value }
                              : p
                          ));
                        }
                      }}
                      className="text-xs border border-[#d9d4c9] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#b08d3e] w-32"
                    />
                    <input
                      type="time"
                      onChange={(e) => {
                        if (e.target.value) {
                          setPosts(prev => prev.map(p =>
                            (!p.errors || p.errors.length === 0 || isOnlyDateError(p.errors))
                              ? { ...p, assignedTime: e.target.value }
                              : p
                          ));
                        }
                      }}
                      className="text-xs border border-[#d9d4c9] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#b08d3e] w-24"
                    />
                    <span className="text-xs text-amber-600">⚠ Each post needs its own date below — change them individually if needed</span>
                  </div>
                </div>
                <div className="max-h-[360px] overflow-y-auto divide-y divide-[#d9d4c9]/50">
                  {posts.map((post, i) => {
                    const hasError = post.errors && post.errors.length > 0;
                    return (
                      <div
                        key={i}
                        className={`px-4 py-3.5 flex flex-col sm:flex-row sm:items-start gap-3 transition-colors ${
                          hasError ? "bg-red-50/50" : "hover:bg-[#faf8f3]"
                        }`}
                      >
                        {/* Row info */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-[#6b6b6b] font-mono w-6 text-right">#{i + 1}</span>
                          {hasError ? (
                            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          )}
                        </div>

                        {/* Caption & filename */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#14110c] font-medium line-clamp-2 mb-1">{post.caption}</p>
                          {post.imageFilename && (
                            <span className="inline-flex items-center gap-1 text-xs text-[#6b6b6b] bg-[#f6f1e6] px-2 py-0.5 rounded font-mono">
                              <ImageIconLucide className="h-3 w-3" />
                              {post.imageFilename}
                            </span>
                          )}
                          {post.errors && post.errors.length > 0 && !isOnlyDateError(post.errors) && (
                            <div className="mt-1.5 text-xs text-red-600 font-medium">
                              ⚠ {post.errors![0]} — <span className="italic">This post will be skipped</span>
                            </div>
                          )}
                          {isOnlyDateError(post.errors) && (
                            <div className="mt-1 text-xs text-amber-600 font-medium">
                              ⚠ No date in CSV — please set below
                            </div>
                          )}
                        </div>

                        {/* Date + Time pickers (for all schedulable posts) */}
                        {(!post.errors || post.errors.length === 0 || isOnlyDateError(post.errors)) && (
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex flex-col">
                              <label className="text-[10px] text-[#6b6b6b] font-bold uppercase tracking-wide mb-1">Date</label>
                              <input
                                type="date"
                                value={post.assignedDate || ""}
                                min={new Date().toISOString().slice(0, 10)}
                                onChange={(e) => updatePostField(i, "assignedDate", e.target.value)}
                                className="text-xs border border-[#d9d4c9] rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#b08d3e] focus:ring-1 focus:ring-[#b08d3e]/20 w-36"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-[10px] text-[#6b6b6b] font-bold uppercase tracking-wide mb-1">Time</label>
                              <input
                                type="time"
                                value={post.assignedTime || ""}
                                onChange={(e) => updatePostField(i, "assignedTime", e.target.value)}
                                className="text-xs border border-[#d9d4c9] rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#b08d3e] focus:ring-1 focus:ring-[#b08d3e]/20 w-24"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Upload Images */}
          {step === 3 && previewData && (
            <div className="space-y-5">
              {confirmError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{confirmError}</span>
                </div>
              )}
              {previewData.expectedImages && previewData.expectedImages.length > 0 ? (
                <>
                  <div className="bg-white border border-[#d9d4c9] rounded-xl p-5">
                    <h3 className="text-sm font-bold text-[#14110c] mb-3 flex items-center gap-2">
                      <ImageIconLucide className="h-4 w-4 text-[#b08d3e]" />
                      Required Images ({previewData.expectedImages.length})
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {previewData.expectedImages.map((img: string, i: number) => {
                        const isUploaded = selectedImages.some(
                          (f) => normalizeMediaMatch(f.name) === normalizeMediaMatch(img)
                        );
                        return (
                          <span
                            key={i}
                            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-mono border transition-all ${
                              isUploaded
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-[#f6f1e6] text-[#6b6b6b] border-[#d9d4c9]"
                            }`}
                          >
                            {isUploaded ? <CheckCircle2 className="h-3 w-3" /> : <ImageIconLucide className="h-3 w-3" />}
                            {img}
                          </span>
                        );
                      })}
                    </div>

                    <div
                      className="border-2 border-dashed border-[#d9d4c9] rounded-xl p-8 flex flex-col items-center bg-[#faf8f3] hover:border-[#b08d3e]/50 hover:bg-[#b08d3e]/5 transition-all cursor-pointer"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <ImageIconLucide className="h-8 w-8 text-[#b08d3e] mb-3" />
                      <p className="text-sm font-semibold text-[#14110c] mb-1">Click to select images</p>
                      <p className="text-xs text-[#6b6b6b]">You can select multiple files at once</p>
                    </div>
                    <input
                      type="file"
                      ref={imageInputRef}
                      className="hidden"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleImageSelect}
                    />

                    {selectedImages.length > 0 && (
                      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {selectedImages.map((f, i) => (
                          <div key={i} className="group relative flex flex-col border border-emerald-200 rounded-xl bg-emerald-50/30 p-2 overflow-hidden transition-all hover:border-emerald-300 hover:shadow-sm">
                            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-2 border border-emerald-100 bg-white flex items-center justify-center">
                              {f.type.startsWith("image/") ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={URL.createObjectURL(f)}
                                  alt={f.name}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center">
                                  <ImageIconLucide className="h-8 w-8 text-emerald-200 mb-1" />
                                  <span className="text-[9px] text-emerald-600 font-medium uppercase tracking-wider">Video</span>
                                </div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeSelectedImage(i);
                                }}
                                className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-red-50 hover:text-red-600 rounded-full shadow-sm p-1 transition-colors z-10"
                                title="Remove image"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <span className="text-xs text-emerald-800 font-medium truncate w-full text-center px-1" title={f.name}>
                              {f.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedImages.length > 0 && selectedImages.length < previewData.expectedImages.length && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                      {previewData.expectedImages.length - selectedImages.length} image(s) still missing. Posts without matching images will be skipped.
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
                  <div className="p-4 bg-emerald-50 rounded-full">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-[#14110c]">No images required</p>
                    <p className="text-sm text-[#6b6b6b] mt-1">All posts use text-only content. Click "Confirm & Schedule" to proceed.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Final Review & Confirm */}
          {step === 4 && previewData && (
            <div className="space-y-5">
              {confirmError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{confirmError}</span>
                </div>
              )}
              
              <div className="bg-white border border-[#d9d4c9] rounded-xl overflow-hidden">
                <div className="bg-[#f6f1e6] px-4 py-3 border-b border-[#d9d4c9]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#14110c]">Final Edit & Confirm ({schedulablePosts.length} posts)</h3>
                  </div>
                </div>
                <div className="max-h-[360px] overflow-y-auto divide-y divide-[#d9d4c9]/50 p-2">
                  {schedulablePosts.map((post, i) => {
                    const dateTimeStr = `${post.assignedDate}T${post.assignedTime}:00`;
                    
                    // Match image if available to show preview
                    const uploadedImageFile = post.imageFilename 
                      ? selectedImages.find(f => normalizeMediaMatch(f.name) === normalizeMediaMatch(post.imageFilename!))
                      : null;
                      
                    let previewUrl = null;
                    let isVideo = false;
                    
                    if (uploadedImageFile) {
                      previewUrl = URL.createObjectURL(uploadedImageFile);
                      isVideo = !uploadedImageFile.type.startsWith("image/");
                    } else if (post.imageFilename) {
                      // Fallback to backend data
                      const matchedAsset = uploadedAssetsData.find(a => 
                        normalizeMediaMatch(a.originalFileName || "") === normalizeMediaMatch(post.imageFilename!) ||
                        normalizeMediaMatch(a.originalName || "") === normalizeMediaMatch(post.imageFilename!)
                      );
                      if (matchedAsset && matchedAsset.previewUrl) {
                        previewUrl = matchedAsset.previewUrl;
                        isVideo = matchedAsset.type === "VIDEO" || matchedAsset.mediaType === "VIDEO";
                      }
                    }

                    return (
                      <div key={i} className="p-3 flex gap-4">
                        {previewUrl ? (
                          <div className="shrink-0 w-20 h-20 bg-[#f6f1e6] rounded-lg overflow-hidden border border-[#d9d4c9]">
                            {!isVideo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center">
                                <ImageIconLucide className="h-6 w-6 text-[#b08d3e] mb-1" />
                                <span className="text-[8px] font-bold">VIDEO</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="shrink-0 w-20 h-20 bg-[#f6f1e6] rounded-lg overflow-hidden border border-[#d9d4c9] flex items-center justify-center">
                             <ImageIconLucide className="h-6 w-6 text-[#6b6b6b]/50" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col gap-2 justify-center">
                          <textarea
                            value={post.caption || ""}
                            onChange={(e) => updatePostField(i, "caption", e.target.value)}
                            rows={2}
                            placeholder="Caption..."
                            className="text-xs border border-[#d9d4c9] rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#b08d3e] focus:ring-1 focus:ring-[#b08d3e]/20 w-full resize-y"
                          />
                          <input
                            type="text"
                            value={post.hashtags?.join(" ") || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              const tags = val.split(/[\s,]+/).map(t => t.trim()).filter(Boolean);
                              updatePostField(i, "hashtags", tags);
                            }}
                            placeholder="#hashtags"
                            className="text-xs border border-[#d9d4c9] rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#b08d3e] focus:ring-1 focus:ring-[#b08d3e]/20 w-full"
                          />
                          <div className="flex items-center gap-2 text-xs text-[#6b6b6b] mt-1">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(dateTimeStr).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#d9d4c9] bg-white flex items-center justify-between shrink-0">
          <div>
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep((s) => (s === 4 ? 3 : s === 3 ? 2 : 1) as 1 | 2 | 3 | 4)}
                disabled={loading}
                className="border-[#d9d4c9] text-[#6b6b6b] hover:bg-[#f6f1e6]"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-[#d9d4c9] hover:bg-[#f6f1e6]"
            >
              Cancel
            </Button>

            {step === 2 && (
              <Button
                onClick={() => {
                  const scheduleValidation = checkSchedules(Date.now());
                  if (!scheduleValidation.valid) {
                    toast({ title: "Invalid schedule", description: scheduleValidation.message, variant: "destructive" });
                    return;
                  }
                  setStep(3);
                }}
                className="bg-[#b08d3e] hover:bg-[#9a7a35] text-black font-semibold"
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-1.5" />
              </Button>
            )}

            {step === 3 && (
              <Button
                onClick={handleUploadImages}
                disabled={loading}
                className="bg-[#b08d3e] hover:bg-[#9a7a35] text-black font-semibold"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {!loading && <UploadCloud className="h-4 w-4 mr-2" />}
                {loading ? "Uploading..." : "Upload Media"}
              </Button>
            )}

            {step === 4 && (
              <Button
                onClick={handleConfirm}
                disabled={loading}
                className="bg-[#b08d3e] hover:bg-[#9a7a35] text-black font-semibold"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {!loading && <CheckCircle2 className="h-4 w-4 mr-2" />}
                {loading ? "Scheduling..." : "Confirm & Schedule"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
