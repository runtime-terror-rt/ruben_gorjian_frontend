"use client";

import React, { Suspense, useMemo, useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Loader2,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import Navbar from "@/components/newhome/Navbar";
import Footer from "@/components/newhome/Footer";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import "./case-studies.css";
import "../newhome.css";

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
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
      } catch {
        return [];
      }
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

function normalizeUserList(data: any): {
  items: CaseStudy[];
  total: number;
  pages: number;
} {
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

function FullWidthMediaGrid({
  images,
  onImageClick,
}: {
  images: string[];
  onImageClick?: (url: string) => void;
}) {
  const mediaCount = images.length;

  if (mediaCount === 0) return null;

  const renderMedia = (
    url: string,
    className: string,
    isLast?: boolean,
    count?: number,
  ) => {
    return (
      <div
        key={url}
        className={cn(
          "relative group overflow-hidden cursor-pointer bg-[#f3f4f6]",
          className,
        )}
        onClick={() => onImageClick?.(url)}
      >
        <img
          src={url}
          alt=""
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {isLast && count && count > 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-white text-3xl font-black">+{count}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-[#f8f9fc] border-y border-[#e4e5ea]">
      {mediaCount === 1 && (
        <div className="h-[400px] sm:h-[600px]">
          {renderMedia(images[0], "h-full w-full")}
        </div>
      )}

      {mediaCount === 2 && (
        <div className="grid grid-cols-2 gap-[2px] h-[300px] sm:h-[500px]">
          {images.map((m) => renderMedia(m, "h-full w-full"))}
        </div>
      )}

      {mediaCount === 3 && (
        <div className="grid grid-cols-12 gap-[2px] h-[400px] sm:h-[600px]">
          <div className="col-span-8 h-full">
            {renderMedia(images[0], "h-full w-full")}
          </div>
          <div className="col-span-4 grid grid-rows-2 gap-[2px] h-full">
            {images.slice(1, 3).map((m) => renderMedia(m, "h-full w-full"))}
          </div>
        </div>
      )}

      {mediaCount === 4 && (
        <div className="grid grid-cols-2 grid-rows-2 gap-[2px] h-[400px] sm:h-[600px]">
          {images.map((m) => renderMedia(m, "h-full w-full"))}
        </div>
      )}

      {mediaCount >= 5 && (
        <div className="grid grid-cols-12 grid-rows-2 gap-[2px] h-[400px] sm:h-[600px]">
          <div className="col-span-8 row-span-2 h-full">
            {renderMedia(images[0], "h-full w-full")}
          </div>
          <div className="col-span-4 h-full">
            {renderMedia(images[1], "h-full w-full")}
          </div>
          <div className="col-span-4 h-full">
            {renderMedia(
              images[2],
              "h-full w-full",
              mediaCount > 3,
              mediaCount - 3,
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewHomeCaseStudiesPage() {
  const limit = 10;
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["case-studies", limit],
      queryFn: async ({ pageParam = 1 }) => {
        const resp = await apiGet<any>(
          `/api/case-studies?page=${pageParam}&limit=${limit}`,
        );
        return normalizeUserList(resp);
      },
      getNextPageParam: (lastPage, allPages) => {
        const nextPage = allPages.length + 1;
        return nextPage <= lastPage.pages ? nextPage : undefined;
      },
      initialPageParam: 1,
    });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const activeItems = useMemo(() => {
    const items = data?.pages.flatMap((p) => p.items) ?? [];
    return items
      .filter((cs) => {
        const status = cs.status
          ? String(cs.status).toUpperCase()
          : cs.isActive
            ? "ACTIVE"
            : "INACTIVE";
        return status === "ACTIVE";
      })
      .sort(
        (a, b) => Number(a.displayOrder ?? 0) - Number(b.displayOrder ?? 0),
      );
  }, [data]);

  return (
    <div className="talexia-wrapper">
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      {/* NEW HOME STYLE HEADER */}
      <div className="page-header">
        <div className="rule-ornament center"></div>
        <div className="page-eyebrow">Case Studies</div>
        <h1 className="page-title">Execution <em>Case Studies.</em></h1>
        <p className="page-lede">Structured production. Managed execution. Real restaurant output.</p>
      </div>

      <section className="cs-container">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <Loader2 className="h-12 w-12 animate-spin text-[#b08d3e]" />
              <p className="page-eyebrow">
                Assembling Visual Intelligence
              </p>
            </div>
          ) : activeItems.length === 0 ? (
            <div className="cs-empty">
              <div className="cs-empty-title">
                The feed is currently silent
              </div>
              <div className="cs-empty-text">
                Our latest production narratives are being processed and will
                appear here shortly.
              </div>
            </div>
          ) : (
            <div className="cs-list">
              {activeItems.map((cs) => {
                const logoUrl = cs.logoUrl || getMediaUrl(cs.logo);
                const imageUrls = Array.isArray(cs.images)
                  ? (cs.images.map(getMediaUrl).filter(Boolean) as string[])
                  : [];
                const videoUrl = cs.videoUrl || getMediaUrl(cs.video);
                const services = getStringArray(cs.services);
                const structureItems = getStringArray(cs.structureItems);

                return (
                  <div key={cs.id} className="cs-item">
                    <div className="cs-item-header">
                      <div className="cs-item-logo-title">
                        <div className="cs-item-logo">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt=""
                              loading="lazy"
                            />
                          ) : (
                            <ImageIcon className="h-7 w-7 text-[#b08d3e]" />
                          )}
                        </div>
                        <div>
                          <h2 className="cs-item-title">
                            {cs.title || "Project Alpha"}
                          </h2>
                          {cs.location && (
                            <div className="cs-item-location">
                              <span className="dot"></span>
                              {cs.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="cs-narrative">
                      {cs.cycleTitle ||
                        "Engineered for high-frequency execution and strategic brand expansion."}
                    </p>

                    <ul className="cs-intel-list">
                      {services.length === 0 ? (
                        <li className="cs-intel-text" style={{opacity: 0.5, fontStyle: 'italic'}}>
                          Syncing Intel...
                        </li>
                      ) : (
                        services.map((s, idx) => (
                          <li key={`${s}-${idx}`} className="cs-intel-item">
                            <span className="dot"></span>
                            <div className="cs-intel-text">{s}</div>
                          </li>
                        ))
                      )}
                    </ul>

                    {cs.tagline && (
                      <p className="cs-narrative" style={{fontStyle: 'italic', color: '#6b6b6b', fontSize: '24px'}}>
                        {cs.tagline}
                      </p>
                    )}

                    {imageUrls.length > 0 && (
                      <FullWidthMediaGrid
                        images={imageUrls}
                        onImageClick={(url) =>
                          setLightbox({
                            images: imageUrls,
                            index: imageUrls.indexOf(url),
                          })
                        }
                      />
                    )}

                    {structureItems.length > 0 && (
                      <div>
                        {cs?.structureTitle && <div className="cs-intel-title">{cs.structureTitle}</div>}
                        <ul className="cs-intel-list">
                          {structureItems.map((it, idx) => (
                            <li key={`${it}-${idx}`} className="cs-intel-item">
                              <span className="dot"></span>
                              <div className="cs-intel-text">{it}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {cs?.videoTitle && <h3 className="cs-intel-title">{cs.videoTitle}</h3>}

                    {videoUrl && (
                      <div className="cs-video-container">
                        <video
                          src={videoUrl}
                          controls
                          playsInline
                          preload="metadata"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div
            ref={loadMoreRef}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-[#b08d3e]" />
                <p className="page-eyebrow">
                  Next Narrative Syncing
                </p>
              </>
            ) : hasNextPage ? (
              <p className="page-eyebrow" style={{opacity: 0.6}}>
                Reveal Further Insights
              </p>
            ) : null}
          </div>
      </section>

      {/* Lightbox for full image viewing */}
      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent 
          fullScreen
          className="w-screen h-screen bg-transparent border-none shadow-none overflow-hidden flex items-center justify-center m-0 p-0 max-w-none"
          overlayClassName="backdrop-blur-3xl bg-black/60"
        >
          {lightbox && (
            <div className="relative w-full h-full flex items-center justify-center m-0 p-0">
              {/* Close Button */}
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-8 right-8 z-[60] p-3 rounded-full bg-black/50 text-[#d25ffd] hover:bg-black/70 transition-all backdrop-blur-xl border border-[#d25ffd]/30 shadow-2xl"
              >
                <X className="h-7 w-7" />
              </button>

              {/* Previous Button */}
              {lightbox.images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox({
                      ...lightbox,
                      index:
                        (lightbox.index - 1 + lightbox.images.length) %
                        lightbox.images.length,
                    });
                  }}
                  className="absolute left-8 z-[60] p-4 rounded-full bg-black/50 text-[#d25ffd] hover:bg-black/70 transition-all backdrop-blur-xl border border-[#d25ffd]/30 shadow-2xl group"
                >
                  <ChevronLeft className="h-8 w-8 transition-transform group-hover:-translate-x-1" />
                </button>
              )}

              {/* Next Button */}
              {lightbox.images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox({
                      ...lightbox,
                      index: (lightbox.index + 1) % lightbox.images.length,
                    });
                  }}
                  className="absolute right-8 z-[60] p-4 rounded-full bg-black/50 text-[#d25ffd] hover:bg-black/70 transition-all backdrop-blur-xl border border-[#d25ffd]/30 shadow-2xl group"
                >
                  <ChevronRight className="h-8 w-8 transition-transform group-hover:translate-x-1" />
                </button>
              )}

              {/* Image Container */}
              <div className="w-full h-full flex items-center justify-center p-6 sm:p-20">
                <img
                  src={lightbox.images[lightbox.index]}
                  alt="Full preview"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-300"
                />
              </div>

              {/* Counter */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-xs font-black tracking-widest backdrop-blur-md">
                {lightbox.index + 1} / {lightbox.images.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
