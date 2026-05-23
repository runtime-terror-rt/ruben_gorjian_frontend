"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import dayjs from "dayjs";
import {
  Plus,
  MoreHorizontal,
  Loader2,
  Power,
  PowerOff,
  Trash2,
  Pencil,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  Check,
  MapPin,
  Upload,
  Clapperboard,
  FileText,
} from "lucide-react";
import { apiDelete, apiGet, apiPatch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Textarea } from "@/components/ui/textarea";

type CaseStudy = {
  id: string;
  title?: string | null;
  location?: string | null;
  displayOrder?: number | null;
  cycleTitle?: string | null;
  services?: string[] | string | null;
  tagline?: string | null;
  structureTitle?: string | null;
  structureItems?: string[] | string | null;
  videoTitle?: string | null;
  status?: "ACTIVE" | "INACTIVE" | string | null;
  isActive?: boolean | null;
  logoUrl?: string | null;
  logo?: any;
  images?: any[] | null;
  videoUrl?: string | null;
  video?: any;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type CaseStudyListResult = {
  items: CaseStudy[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};

function getStringArray(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(String).filter(Boolean);
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
    }
    return trimmed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function getMediaUrl(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    const obj = val as any;
    if (typeof obj.url === "string") return obj.url;
    if (typeof obj.publicUrl === "string") return obj.publicUrl;
    if (typeof obj.src === "string") return obj.src;
    if (typeof obj.path === "string") return obj.path;
    if (typeof obj.location === "string") return obj.location;
  }
  return null;
}

function normalizeAdminList(
  data: any,
  page: number,
  limit: number,
): CaseStudyListResult {
  const items = Array.isArray(data)
    ? data
    : data?.items || data?.caseStudies || data?.data || data?.rows || [];

  const total =
    (typeof data?.total === "number" && data.total) ||
    (typeof data?.count === "number" && data.count) ||
    (typeof data?.pagination?.total === "number" && data.pagination.total) ||
    items.length;

  const pages =
    (typeof data?.pages === "number" && data.pages) ||
    (typeof data?.pagination?.pages === "number" && data.pagination.pages) ||
    Math.max(1, Math.ceil(total / limit));

  const resolvedPage =
    (typeof data?.page === "number" && data.page) ||
    (typeof data?.pagination?.page === "number" && data.pagination.page) ||
    page;

  const resolvedLimit =
    (typeof data?.limit === "number" && data.limit) ||
    (typeof data?.pagination?.limit === "number" && data.pagination.limit) ||
    limit;

  return {
    items,
    page: resolvedPage,
    limit: resolvedLimit,
    total,
    pages,
  };
}

function TagInput({
  value,
  onChange,
  placeholder,
  variant = "default",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  variant?: "default" | "pill";
}) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const next = raw.trim();
    if (!next) return;
    const normalized = next.replace(/\s+/g, " ");
    const exists = value.some(
      (v) => v.toLowerCase() === normalized.toLowerCase(),
    );
    if (exists) return;
    onChange([...value, normalized]);
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-2 sm:p-3">
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {value.map((t, idx) => (
          <button
            type="button"
            key={`${t}-${idx}`}
            onClick={() => remove(idx)}
            className={cn(
              "px-3 py-1 text-slate-200 text-[10px] sm:text-xs font-semibold hover:bg-rose-500/20 hover:text-rose-300 transition-colors",
              variant === "pill"
                ? "rounded-full bg-slate-100/10"
                : "rounded-lg bg-slate-800",
            )}
            title="Remove"
          >
            {t}
          </button>
        ))}
        <div className="flex-1 min-w-[140px] relative flex items-center">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                add(draft);
                setDraft("");
              }
              if (e.key === "Backspace" && !draft && value.length > 0) {
                remove(value.length - 1);
              }
            }}
            onBlur={() => {
              add(draft);
              setDraft("");
            }}
            placeholder={placeholder}
            className="w-full bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-600 h-9 pr-10"
          />
          {draft.trim() && (
            <button
              type="button"
              onClick={() => {
                add(draft);
                setDraft("");
              }}
              
            >
              <Plus className="h-4 w-4 text-white" size={30} />
            </button>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[9px] sm:text-[10px] text-slate-600 font-semibold uppercase tracking-widest">
        <span>Press Enter, comma, or click (+) to add</span>
        <span>Click tag to remove</span>
      </div>
    </div>
  );
}

function FilePreview({ file, className }: { file: File; className?: string }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url ? <img src={url} alt={file.name} className={className} /> : null;
}

type CaseStudyFormValues = {
  logo: FileList | null;
  title: string;
  location: string;
  displayOrder: number;
  cycleTitle: string;
  services: string[];
  tagline: string;
  structureTitle: string;
  structureItems: string[];
  images: FileList | null;
  videoTitle: string;
  video: FileList | null;
  isActive: boolean;
};

function buildCaseStudyFormData(
  values: CaseStudyFormValues,
  selectedImages: File[],
) {
  const fd = new FormData();
  if (values.logo && values.logo[0]) fd.append("logo", values.logo[0]);
  fd.append("title", values.title || "");
  fd.append("location", values.location || "");
  fd.append("displayOrder", String(values.displayOrder ?? 0));
  fd.append("cycleTitle", values.cycleTitle || "");
  fd.append("services", JSON.stringify(values.services ?? []));
  fd.append("tagline", values.tagline || "");
  fd.append("structureTitle", values.structureTitle || "");
  fd.append("structureItems", JSON.stringify(values.structureItems ?? []));
  fd.append("videoTitle", values.videoTitle || "");
  if (values.video && values.video[0]) fd.append("video", values.video[0]);
  if (selectedImages && selectedImages.length > 0) {
    selectedImages.forEach((file) => fd.append("images", file));
  }
  fd.append("isActive", values.isActive ? "true" : "false");
  return fd;
}

export default function AdminCaseStudiesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const limit = 10;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CaseStudy | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CaseStudy | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const form = useForm<CaseStudyFormValues>({
    defaultValues: {
      logo: null,
      title: "",
      location: "",
      displayOrder: 0,
      cycleTitle: "",
      services: [],
      tagline: "",
      structureTitle: "",
      structureItems: [],
      images: null,
      videoTitle: "",
      video: null,
      isActive: true,
    },
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { ref: logoRef, ...logoRegister } = form.register("logo");
  const { ref: videoRef, ...videoRegister } = form.register("video");

  const logoFiles = form.watch("logo");
  const videoFiles = form.watch("video");

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...newFiles]);
      // clear the input so the exact same files can be selected again if needed
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const listQuery = useQuery({
    queryKey: ["admin-case-studies", page, limit],
    queryFn: async () => {
      const data = await apiGet<any>(
        `/api/case-studies/admin?page=${page}&limit=${limit}`,
      );
      return normalizeAdminList(data, page, limit);
    },
  });

  const openCreate = () => {
    setEditing(null);
    setSelectedImages([]);
    form.reset({
      logo: null,
      title: "",
      location: "",
      displayOrder: 0,
      cycleTitle: "",
      services: [],
      tagline: "",
      structureTitle: "",
      structureItems: [],
      images: null,
      videoTitle: "",
      video: null,
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (cs: CaseStudy) => {
    setEditing(cs);
    setSelectedImages([]);
    form.reset({
      logo: null,
      title: String(cs.title ?? ""),
      location: String(cs.location ?? ""),
      displayOrder: Number(cs.displayOrder ?? 0),
      cycleTitle: String(cs.cycleTitle ?? ""),
      services: getStringArray(cs.services),
      tagline: String(cs.tagline ?? ""),
      structureTitle: String(cs.structureTitle ?? ""),
      structureItems: getStringArray(cs.structureItems),
      images: null,
      videoTitle: String(cs.videoTitle ?? ""),
      video: null,
      isActive: cs.status
        ? String(cs.status).toUpperCase() === "ACTIVE"
        : Boolean(cs.isActive ?? true),
    });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (values: CaseStudyFormValues) => {
      if (values.video && values.video.length > 1) {
        throw new Error("Only one video is allowed.");
      }

      const fd = buildCaseStudyFormData(values, selectedImages);
      const url = editing
        ? `/api/case-studies/${editing.id}`
        : "/api/case-studies";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        body: fd,
      });
      const contentType = res.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await res.json().catch(() => null)
        : await res.text().catch(() => null);

      if (!res.ok) {
        const obj =
          payload && typeof payload === "object" ? (payload as any) : null;
        let message = "Request failed";

        if (obj) {
          if (obj.details?.fieldErrors) {
            const errors = Object.entries(obj.details.fieldErrors).map(
              ([field, errs]) => `${field}: ${(errs as string[]).join(", ")}`,
            );
            message = errors.join("\n");
          } else {
            message =
              ((obj.error || obj.message) &&
                String(obj.error || obj.message)) ||
              message;
          }
        } else if (typeof payload === "string" && payload) {
          message = payload;
        }

        throw new Error(message);
      }
      return payload;
    },
    onSuccess: () => {
      toast({
        title: editing ? "Case study updated" : "Case study created",
      });
      setDialogOpen(false);
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["admin-case-studies"] });
    },
    onError: (err: any) => {
      toast({
        title: "Save failed",
        description: err.message || "Unable to save case study.",
        variant: "destructive",
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      status: "ACTIVE" | "INACTIVE";
    }) =>
      apiPatch<any, { status: "ACTIVE" | "INACTIVE" }>(
        `/api/case-studies/${payload.id}/status`,
        {
          status: payload.status,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-case-studies"] });
    },
    onError: (err: any) => {
      toast({
        title: "Status update failed",
        description: err.message || "Unable to update status.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiDelete<any>(`/api/case-studies/${id}`),
    onSuccess: () => {
      toast({ title: "Case study deleted" });
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-case-studies"] });
    },
    onError: (err: any) => {
      toast({
        title: "Delete failed",
        description: err.message || "Unable to delete case study.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (v: CaseStudyFormValues) => {
    if (!editing && (!v.logo || v.logo.length === 0)) {
      toast({ title: "Validation Error", description: "Please upload a project logo.", variant: "destructive" });
      return;
    }
    if (!editing && selectedImages.length === 0) {
      toast({ title: "Validation Error", description: "Please upload at least one image for the gallery.", variant: "destructive" });
      return;
    }
    saveMutation.mutate(v);
  };

  const onInvalid = (errors: any) => {
    const firstError = Object.keys(errors)[0];
    
    const messages: Record<string, string> = {
      title: "Oops! You forgot to give your case study a title.",
      location: "We need a location for this case study to proceed.",
      displayOrder: "Don't forget to set a display order number.",
      tagline: "A punchy tagline is required to create this case study.",
      cycleTitle: "What's the services cycle title? We need that!",
      services: "Please add at least one service to the list.",
      structureTitle: "You're missing the structure section title.",
      structureItems: "Make sure to add at least one structure highlight.",
    };

    toast({
      title: "Almost there!",
      description: messages[firstError] || "Oops! It looks like you missed some required fields.",
      variant: "destructive",
    });
  };

  const items = listQuery.data?.items ?? [];

  const totals = useMemo(() => {
    const total = listQuery.data?.total ?? items.length;
    const pages = listQuery.data?.pages ?? 1;
    return { total, pages };
  }, [items.length, listQuery.data?.pages, listQuery.data?.total]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Case Studies</h1>
          <p className="text-sm text-slate-400">
            Create, update, activate/inactivate and delete case studies.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-black gap-2 px-8 py-6 rounded-2xl shadow-[0_15px_30px_rgba(163,230,53,0.3)] transition-all hover:scale-105 active:scale-95 text-base"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Case Study
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="text-sm text-slate-300 font-semibold">
            Total: <span className="text-white">{totals.total}</span>
          </div>
        </div>

        {listQuery.isLoading ? (
          <div className="p-10 flex items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading case studies...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Title</TableHead>
                <TableHead className="text-slate-400 hidden md:table-cell">
                  Location
                </TableHead>
                <TableHead className="text-slate-400 hidden lg:table-cell">
                  Order
                </TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 hidden sm:table-cell">
                  Media
                </TableHead>
                <TableHead className="text-slate-400 hidden xl:table-cell">
                  Updated
                </TableHead>
                <TableHead className="text-slate-400 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow className="border-slate-800">
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-slate-500"
                  >
                    No case studies found.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((cs) => {
                  const status = cs.status
                    ? String(cs.status).toUpperCase()
                    : cs.isActive
                      ? "ACTIVE"
                      : "INACTIVE";
                  const logoUrl = cs.logoUrl || getMediaUrl(cs.logo);
                  const imageCount = Array.isArray(cs.images)
                    ? cs.images.length
                    : 0;
                  const hasVideo = Boolean(
                    cs.videoUrl || getMediaUrl(cs.video),
                  );

                  return (
                    <TableRow key={cs.id} className="border-slate-800">
                      <TableCell className="text-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl border border-slate-800 bg-slate-800/40 overflow-hidden flex items-center justify-center">
                            {logoUrl ? (
                              <img
                                src={logoUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate">
                              {cs.title || "Untitled"}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {cs.tagline || cs.cycleTitle || ""}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400 hidden md:table-cell">
                        {cs.location || "—"}
                      </TableCell>
                      <TableCell className="text-slate-400 hidden lg:table-cell">
                        {typeof cs.displayOrder === "number"
                          ? cs.displayOrder
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "rounded-full",
                            status === "ACTIVE"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-300 border border-rose-500/20",
                          )}
                        >
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <ImageIcon className="h-4 w-4" /> {imageCount}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1",
                              !hasVideo && "opacity-40",
                            )}
                          >
                            <VideoIcon className="h-4 w-4" />{" "}
                            {hasVideo ? "1" : "0"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400 hidden xl:table-cell">
                        {cs.updatedAt
                          ? dayjs(cs.updatedAt).format("MMM D, YYYY")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-slate-400 hover:text-white"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEdit(cs)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                statusMutation.mutate({
                                  id: cs.id,
                                  status:
                                    status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                                })
                              }
                            >
                              {status === "ACTIVE" ? (
                                <>
                                  <PowerOff className="h-4 w-4 mr-2" />
                                  Inactivate
                                </>
                              ) : (
                                <>
                                  <Power className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-rose-400 focus:text-rose-300"
                              onClick={() => setDeleteTarget(cs)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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
        )}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <div className="text-xs text-slate-500 font-semibold">
              Page <span className="text-slate-200">{page}</span> /{" "}
              <span className="text-slate-200">{totals.pages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700"
              disabled={page >= totals.pages}
              onClick={() => setPage((p) => Math.min(totals.pages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => !saveMutation.isPending && setDialogOpen(o)}
      >
        <DialogContent className="w-full max-w-[98vw] sm:max-w-[95vw] lg:max-w-6xl bg-[#0b0e14] border-slate-800/50 max-h-[98vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800/40">
            <button
              onClick={() => setDialogOpen(false)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-white font-sora">
              {editing ? "Update Case Study" : "Create Case Study"}
            </h2>
            <button
              type="button"
              onClick={form.handleSubmit(onSubmit, onInvalid)}
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>Check</span>
            </button>
          </div>

          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className="flex-1 overflow-y-auto px-4 sm:px-8 py-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-16">
              {/* Left Column: Core Identity & Editorial Narrative */}
              <div className="space-y-10">
                {/* Core Identity */}
                <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-pink-400/80">
                    Core Identity
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Case Title
                      </Label>
                      <Input
                        placeholder="e.g. The Quantum Rebranding"
                        {...form.register("title", { required: true })}
                        className="h-12 bg-slate-900/50 border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl focus:ring-1 focus:ring-indigo-500/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Location
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                          <Input
                            placeholder="San Francisco, CA"
                            {...form.register("location", { required: true })}
                            className="h-12 pl-10 bg-slate-900/50 border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Display Order
                        </Label>
                        <Input
                          type="number"
                          placeholder="01"
                          {...form.register("displayOrder", {
                            valueAsNumber: true,
                            required: true,
                          })}
                          className="h-12 bg-slate-900/50 border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 sm:p-5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white transition-colors group-hover:text-indigo-300">
                          Active Status
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Visible to the public immediately after creation
                        </p>
                      </div>
                      <Controller
                        name="isActive"
                        control={form.control}
                        render={({ field }) => (
                          <button
                            type="button"
                            onClick={() => field.onChange(!field.value)}
                            className={cn(
                              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 p-0.5",
                              field.value ? "bg-lime-400" : "bg-rose-500",
                            )}
                          >
                            <span className="sr-only">
                              Toggle active status
                            </span>
                            <span
                              className={cn(
                                "pointer-events-none block h-5 w-5 shrink-0 rounded-full bg-white shadow-lg transform transition duration-200 ease-in-out",
                                field.value ? "translate-x-5" : "translate-x-0",
                              )}
                            />
                          </button>
                        )}
                      />
                    </div>
                  </div>
                </section>

                {/* Editorial Narrative */}
                <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-pink-400/80">
                    Editorial Narrative
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Editorial Tagline
                      </Label>
                      <Textarea
                        placeholder="Describe the soul of the project in a single punchy sentence..."
                        {...form.register("tagline", { required: true })}
                        className="min-h-[100px] bg-slate-900/50 border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-2xl resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Services Cycle Title
                      </Label>
                      <Input
                        placeholder="e.g. Discovery Phase"
                        {...form.register("cycleTitle", { required: true })}
                        className="h-12 bg-slate-900/50 border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Services Provided
                      </Label>
                      <Controller
                        name="services"
                        control={form.control}
                        rules={{ validate: (v) => v && v.length > 0 }}
                        render={({ field }) => (
                          <TagInput
                            value={getStringArray(field.value)}
                            onChange={(vals) => field.onChange(vals)}
                            placeholder="Add service..."
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Structure Section Title
                      </Label>
                      <Input
                        placeholder="e.g. Project Architecture"
                        {...form.register("structureTitle", { required: true })}
                        className="h-12 bg-slate-900/50 border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Structure Highlights
                      </Label>
                      <Controller
                        name="structureItems"
                        control={form.control}
                        rules={{ validate: (v) => v && v.length > 0 }}
                        render={({ field }) => (
                          <TagInput
                            value={getStringArray(field.value)}
                            onChange={(vals) => field.onChange(vals)}
                            placeholder="Add highlight..."
                          />
                        )}
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Visual Media & Cinematic Component */}
              <div className="space-y-10">
                {/* Visual Media */}
                <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400/80">
                    Visual Media
                  </h3>
                  <div className="space-y-8">
                    {/* Project Logo Dropzone */}
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Project Logo
                      </Label>
                      <div
                        className="relative group cursor-pointer overflow-hidden rounded-3xl"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          {...logoRegister}
                          ref={(e) => {
                            logoRef(e);
                            if (e) logoInputRef.current = e;
                          }}
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-slate-800 p-8 flex flex-col items-center justify-center gap-4 bg-slate-900/20 group-hover:bg-slate-900/40 group-hover:border-indigo-500/50 transition-all relative z-10 min-h-[160px]">
                          {logoFiles && logoFiles.length > 0 ? (
                            <div className="absolute inset-0 z-0 bg-slate-950">
                              <FilePreview
                                file={logoFiles[0]}
                                className="h-full w-full object-contain opacity-50 group-hover:opacity-30 transition-opacity"
                              />
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-xl backdrop-blur-md font-bold text-sm border border-indigo-500/30">
                                  {logoFiles[0].name}
                                </div>
                                <p className="text-[10px] text-indigo-400/70 mt-2 font-bold uppercase tracking-widest">
                                  Click to change
                                </p>
                              </div>
                            </div>
                          ) : editing?.logoUrl || getMediaUrl(editing?.logo) ? (
                            <div className="absolute inset-0 z-0 bg-slate-950">
                              <img
                                src={
                                  editing?.logoUrl ||
                                  getMediaUrl(editing?.logo) ||
                                  ""
                                }
                                alt="Logo"
                                className="h-full w-full object-contain opacity-50 group-hover:opacity-30 transition-opacity"
                              />
                              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-white/10 text-white px-4 py-2 rounded-xl backdrop-blur-md font-bold text-sm border border-white/20">
                                  Change Logo
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="h-6 w-6 text-indigo-400" />
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-bold text-slate-200">
                                  Drop Logo Here
                                </p>
                                <p className="text-[10px] text-slate-500 mt-1">
                                  SVG, PNG or AI (Max 2MB)
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Project Gallery */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Project Gallery
                        </Label>
                        <span className="text-[10px] font-black text-slate-600">
                          Upload up to 12 images
                        </span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {/* Add Button */}
                        <div
                          onClick={() => imagesInputRef.current?.click()}
                          className="aspect-square rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/40 flex items-center justify-center cursor-pointer hover:bg-slate-800/60 hover:border-indigo-500/40 transition-all group relative overflow-hidden"
                        >
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImagesChange}
                            ref={imagesInputRef}
                            className="hidden"
                          />
                          <Plus className="h-6 w-6 text-slate-500 group-hover:text-indigo-400 group-hover:scale-110 transition-all relative z-10" />
                        </div>
                        {selectedImages.length > 0
                          ? selectedImages.map((file, i) => (
                              <div
                                key={`new-${i}`}
                                className="aspect-square rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden relative group"
                              >
                                <FilePreview
                                  file={file}
                                  className="h-full w-full object-cover opacity-80"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(i)}
                                  className="absolute top-1 right-1 bg-rose-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-rose-500"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                                  <span className="text-[10px] font-bold text-white px-2 text-center truncate w-full">
                                    {file.name}
                                  </span>
                                </div>
                              </div>
                            ))
                          : editing?.images &&
                              Array.isArray(editing.images) &&
                              editing.images.length > 0
                            ? editing.images.map((img: any, i: number) => (
                                <div
                                  key={`existing-${i}`}
                                  className="aspect-square rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden relative group"
                                >
                                  <img
                                    src={getMediaUrl(img) || ""}
                                    alt=""
                                    className="h-full w-full object-cover opacity-80"
                                  />
                                </div>
                              ))
                            : [1, 2, 3].map((i) => (
                                <div
                                  key={`placeholder-${i}`}
                                  className="aspect-square rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center"
                                >
                                  <ImageIcon className="h-6 w-6 text-slate-800" />
                                </div>
                              ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Cinematic Component */}
                <section className="space-y-6">
                  <div className="bg-[#151922] border border-slate-800/50 rounded-3xl p-6 space-y-6">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Clapperboard className="h-5 w-5" />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                        Cinematic Component
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <Input
                        placeholder="Video Component Title"
                        {...form.register("videoTitle")}
                        className="h-12 bg-slate-800/40 border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl"
                      />
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 bg-slate-800/40 border border-slate-800 rounded-xl px-4 flex items-center justify-between h-12 text-slate-300 text-sm overflow-hidden">
                          {videoFiles && videoFiles.length > 0 ? (
                            <span className="truncate text-teal-300 font-bold">
                              {videoFiles[0].name}
                            </span>
                          ) : editing?.videoUrl ||
                            getMediaUrl(editing?.video) ? (
                            <span className="truncate text-teal-300 font-bold">
                              Existing Video Uploaded
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              No video selected
                            </span>
                          )}
                          {!videoFiles?.length &&
                            !(
                              editing?.videoUrl || getMediaUrl(editing?.video)
                            ) && (
                              <Plus className="h-4 w-4 text-slate-500 rotate-45 flex-shrink-0" />
                            )}
                        </div>
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="flex h-12 items-center justify-center gap-2 px-6 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 text-sm font-bold hover:bg-teal-500/20 transition-all cursor-pointer"
                        >
                          <input
                            type="file"
                            accept="video/*"
                            {...videoRegister}
                            ref={(e) => {
                              videoRef(e);
                              if (e) videoInputRef.current = e;
                            }}
                            className="hidden"
                          />
                          <VideoIcon className="h-4 w-4" />
                          <span>
                            {videoFiles && videoFiles.length > 0
                              ? "Change Clip"
                              : "Upload Clip"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-end gap-5 border-t border-slate-800/50 pt-8 pb-4">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto h-14 min-w-[140px] rounded-2xl border-slate-700 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white font-black uppercase tracking-widest text-xs transition-all"
                onClick={() => setDialogOpen(false)}
                disabled={saveMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="w-full sm:w-auto h-14 min-w-[240px] rounded-2xl bg-gradient-to-r from-fuchsia-500 to-indigo-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {saveMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : editing ? (
                  "Update Case Study"
                ) : (
                  "Create Case Study"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-md bg-slate-950 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Delete case study?</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-slate-400">
            This action cannot be undone.{" "}
            {deleteTarget?.title ? `“${deleteTarget.title}”` : ""}
          </div>
          <DialogFooter className="gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white font-black px-8 py-6 rounded-2xl transition-all hover:scale-105 active:scale-95 text-base"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-rose-600 hover:bg-rose-500 text-white font-black px-8 py-6 rounded-2xl shadow-[0_15px_30px_rgba(225,29,72,0.3)] transition-all hover:scale-105 active:scale-95 text-base"
              disabled={deleteMutation.isPending || !deleteTarget?.id}
              onClick={() =>
                deleteTarget?.id && deleteMutation.mutate(deleteTarget.id)
              }
            >
              {deleteMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete Study"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
