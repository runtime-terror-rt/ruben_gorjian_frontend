"use client";

import { Suspense, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  MapPin,
  Play,
  Loader2,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Navbar from "@/components/navbar";
import FooterSecondary from "@/components/footer-secondary";

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

function normalizeUserList(data: any): { items: CaseStudy[]; total: number; pages: number } {
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
    1;

  return { items, total, pages };
}

function MediaCarousel({
  images,
  videoUrl,
}: {
  images: string[];
  videoUrl: string | null;
}) {
  const [idx, setIdx] = useState(0);
  const hasImages = images.length > 0;
  const canPrev = idx > 0;
  const canNext = idx < images.length - 1;

  if (!hasImages && !videoUrl) {
    return (
      <div className="h-[260px] sm:h-[340px] bg-[#f6f7fb] border border-[#e4e5ea] rounded-2xl flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#6b7280]">
          <ImageIcon className="h-5 w-5" />
          No media
        </div>
      </div>
    );
  }

  if (!hasImages && videoUrl) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[#e4e5ea] bg-black">
        <video
          controls
          playsInline
          className="w-full h-[260px] sm:h-[340px] object-contain"
          src={videoUrl}
        />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#e4e5ea] bg-white">
      <img
        src={images[idx]}
        alt=""
        className="w-full h-[260px] sm:h-[340px] object-cover"
        loading="lazy"
      />
      {images.length > 1 && (
        <>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-[#1c2231] border border-[#e4e5ea] shadow-sm",
              !canPrev && "opacity-40 pointer-events-none",
            )}
            onClick={() => setIdx((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-[#1c2231] border border-[#e4e5ea] shadow-sm",
              !canNext && "opacity-40 pointer-events-none",
            )}
            onClick={() => setIdx((p) => Math.min(images.length - 1, p + 1))}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/80 text-[10px] font-black tracking-widest uppercase text-[#1c2231] border border-[#e4e5ea]">
            {idx + 1} / {images.length}
          </div>
        </>
      )}
      {videoUrl && (
        <div className="absolute top-2 right-2 px-3 py-1 rounded-full bg-white/80 text-[10px] font-black tracking-widest uppercase text-[#1c2231] inline-flex items-center gap-2 border border-[#e4e5ea]">
          <Play className="h-3 w-3" /> Video inside
        </div>
      )}
    </div>
  );
}

export default function CaseStudiesPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CaseStudy | null>(null);

  const query = useQuery({
    queryKey: ["case-studies", page, limit],
    queryFn: async () => {
      const data = await apiGet<any>(`/api/case-studies?page=${page}&limit=${limit}`);
      return normalizeUserList(data);
    },
  });

  const activeItems = useMemo(() => {
    const items = query.data?.items ?? [];
    return items
      .filter((cs) => {
        const status = cs.status ? String(cs.status).toUpperCase() : cs.isActive ? "ACTIVE" : "INACTIVE";
        return status === "ACTIVE";
      })
      .sort((a, b) => Number(a.displayOrder ?? 0) - Number(b.displayOrder ?? 0));
  }, [query.data?.items]);

  return (
    <main className="min-h-screen bg-white text-[#1f2230]">
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <section className="px-4 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1c2231]">
            Case <span className="text-accent">Studies</span>
          </h1>
          <p className="text-[#4c4f5e] text-sm sm:text-base max-w-2xl">
            Real campaigns and production cycles. Scroll like a social feed to explore media and outcomes.
          </p>
        </div>

        {query.isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-[#4c4f5e]">
            <Loader2 className="h-6 w-6 animate-spin" />
            Loading case studies...
          </div>
        ) : activeItems.length === 0 ? (
          <div className="rounded-3xl border border-[#e4e5ea] bg-[#fbfbfe] p-10 text-center">
            <div className="text-[#1c2231] font-bold">No case studies available</div>
            <div className="text-[#6b7280] text-sm mt-1">
              When new case studies go live, they will appear here.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeItems.map((cs) => {
              const logoUrl = cs.logoUrl || getMediaUrl(cs.logo);
              const imageUrls = Array.isArray(cs.images)
                ? cs.images.map(getMediaUrl).filter(Boolean) as string[]
                : [];
              const videoUrl = cs.videoUrl || getMediaUrl(cs.video);
              const services = getStringArray(cs.services);

              return (
                <Card
                  key={cs.id}
                  className="border-[#e4e5ea] bg-white rounded-3xl overflow-hidden shadow-[0_20px_70px_rgba(10,20,60,0.12)]"
                >
                  <CardHeader className="p-5 border-b border-[#e4e5ea] bg-[#fbfbfe]">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-2xl border border-[#e4e5ea] bg-white overflow-hidden flex items-center justify-center flex-shrink-0">
                        {logoUrl ? (
                          <img src={logoUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-[#9ca3af]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <h2 className="text-[#1c2231] font-black text-lg truncate">
                            {cs.title || "Untitled Case Study"}
                          </h2>
                          {typeof cs.displayOrder === "number" && (
                            <Badge className="rounded-full bg-accent/10 text-accent border border-accent/20">
                              #{cs.displayOrder}
                            </Badge>
                          )}
                        </div>
                        {cs.location && (
                          <div className="mt-1 text-xs text-[#6b7280] flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{cs.location}</span>
                          </div>
                        )}
                        {cs.tagline && (
                          <div className="mt-2 text-sm text-[#363a49] leading-relaxed">
                            {cs.tagline}
                          </div>
                        )}
                        {services.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {services.slice(0, 6).map((s, idx) => (
                              <span
                                key={`${s}-${idx}`}
                                className="px-2 py-1 rounded-full bg-[#eef0f6] text-[#1c2231] text-[10px] font-black tracking-widest uppercase"
                              >
                                {s}
                              </span>
                            ))}
                            {services.length > 6 && (
                              <span className="px-2 py-1 rounded-full bg-[#eef0f6] text-[#6b7280] text-[10px] font-black tracking-widest uppercase">
                                +{services.length - 6}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4">
                    <MediaCarousel images={imageUrls} videoUrl={videoUrl} />

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-xs text-[#6b7280] font-semibold">
                        {cs.updatedAt ? `Updated ${dayjs(cs.updatedAt).format("MMM D, YYYY")}` : ""}
                      </div>
                      <Button
                        onClick={() => {
                          setSelected(cs);
                          setOpen(true);
                        }}
                        className="bg-accent text-white hover:bg-indigo-600 font-black tracking-widest uppercase"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            className="border-[#d4d8e5]"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <div className="text-xs text-[#6b7280] font-semibold">
            Page <span className="text-[#1c2231]">{page}</span>
          </div>
          <Button
            variant="outline"
            className="border-[#d4d8e5]"
            onClick={() => setPage((p) => p + 1)}
            disabled={(query.data?.pages ?? 1) > 1 ? page >= (query.data?.pages ?? 1) : false}
          >
            Next
          </Button>
        </div>
      </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl bg-white border-[#e4e5ea] p-0 overflow-hidden">
          <DialogHeader>
            <div className="px-6 pt-6 pb-4 border-b border-[#e4e5ea] bg-[#fbfbfe]">
              <DialogTitle className="text-[#1c2231] text-xl sm:text-2xl font-black">
                {selected?.title || "Case Study"}
              </DialogTitle>
              {selected?.location && (
                <div className="mt-2 text-sm text-[#6b7280] flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {selected.location}
                </div>
              )}
            </div>
          </DialogHeader>
          {selected && (
            <div className="max-h-[75vh] overflow-y-auto px-6 py-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-[#e4e5ea] bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[11px] text-[#6b7280] font-black tracking-[0.22em] uppercase">
                        Overview
                      </div>
                      {typeof selected.displayOrder === "number" && (
                        <Badge className="rounded-full bg-accent/10 text-accent border border-accent/20">
                          #{selected.displayOrder}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 text-sm sm:text-base text-[#363a49] leading-relaxed">
                      {selected.tagline || "—"}
                    </div>
                    {(selected.videoTitle || selected.cycleTitle) && (
                      <div className="mt-4 text-xs text-[#6b7280] font-semibold">
                        {selected.videoTitle ? `Video: ${selected.videoTitle}` : ""}
                        {selected.videoTitle && selected.cycleTitle ? " • " : ""}
                        {selected.cycleTitle ? `Cycle: ${selected.cycleTitle}` : ""}
                      </div>
                    )}
                    {selected.updatedAt && (
                      <div className="mt-2 text-xs text-[#9ca3af] font-semibold">
                        Updated {dayjs(selected.updatedAt).format("MMM D, YYYY")}
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-[#e4e5ea] bg-white p-5">
                    <div className="text-[11px] text-[#6b7280] font-black tracking-[0.22em] uppercase">
                      Services
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {getStringArray(selected.services).length === 0 ? (
                        <span className="text-sm text-[#9ca3af]">—</span>
                      ) : (
                        getStringArray(selected.services).map((s, idx) => (
                          <span
                            key={`${s}-${idx}`}
                            className="px-3 py-1 rounded-full bg-[#eef0f6] text-[#1c2231] text-[10px] font-black tracking-widest uppercase"
                          >
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#e4e5ea] bg-white p-5">
                  <div className="text-[11px] text-[#6b7280] font-black tracking-[0.22em] uppercase">
                    {selected.structureTitle || "Production Structure"}
                  </div>
                  <div className="mt-4 space-y-3">
                    {getStringArray(selected.structureItems).length === 0 ? (
                      <div className="text-sm text-[#9ca3af]">—</div>
                    ) : (
                      getStringArray(selected.structureItems).map((it, idx) => (
                        <div
                          key={`${it}-${idx}`}
                          className="flex items-start gap-3 rounded-2xl border border-[#e4e5ea] bg-[#fbfbfe] p-4"
                        >
                          <div className="h-8 w-8 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-[11px] font-black text-accent flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="text-sm sm:text-base text-[#1c2231] font-semibold leading-snug">
                            {it}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-[#e4e5ea] bg-white p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="text-[11px] text-[#6b7280] font-black tracking-[0.22em] uppercase">
                    Media
                  </div>
                  <div className="text-xs text-[#9ca3af] font-semibold">
                    {Array.isArray(selected.images) ? `${selected.images.length} images` : ""}
                  </div>
                </div>
                <MediaCarousel
                  images={
                    Array.isArray(selected.images)
                      ? (selected.images.map(getMediaUrl).filter(Boolean) as string[])
                      : []
                  }
                  videoUrl={selected.videoUrl || getMediaUrl(selected.video)}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <FooterSecondary />
    </main>
  );
}
