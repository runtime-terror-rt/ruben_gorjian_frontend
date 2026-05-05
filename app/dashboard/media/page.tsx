"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Download, ExternalLink } from "lucide-react";
import Image  from "next/image";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

type Asset = {
  id: string;
  storageKey: string;
  mediaType: "image" | "video";
  url?: string | null;
  fileName?: string | null;
  contentType?: string | null;
  createdAt: string;
};

type ApiResponse = { 
  items: Asset[]; 
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  baseUrl?: string | null 
};

function buildAssetUrl(asset: Asset, baseUrl?: string | null) {
  if (asset.url) return asset.url;
  if (asset.storageKey.startsWith("http")) return asset.storageKey;
  if (baseUrl) return `${baseUrl.replace(/\/$/, "")}/${asset.storageKey}`;
  const fallback = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;
  return fallback ? `${fallback.replace(/\/$/, "")}/${asset.storageKey}` : asset.storageKey;
}

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [baseUrl, setBaseUrl] = useState<string | undefined | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("type", activeTab);
        params.set("page", page.toString());
        params.set("limit", "9");

        const res = await fetch(`/api/uploads/assets?${params.toString()}`, { 
          credentials: "include" 
        });
        const data: ApiResponse | { error: string } = await res.json();
        if (!res.ok) {
          throw new Error((data && typeof data === "object" && "error" in data && typeof (data as { error?: string }).error === "string" ? (data as { error: string }).error : null) || "Failed to load media");
        }
        const payload = data as ApiResponse;
        setAssets(payload.items || []);
        setBaseUrl(payload.baseUrl);
        setTotalPages(payload.totalPages || 1);
        setTotalItems(payload.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load media");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab, page]);

  // Reset to page 1 when tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const grouped = useMemo(() => {
    const groups: Record<string, Asset[]> = {};
    assets.forEach((asset) => {
      const day = dayjs(asset.createdAt).format("YYYY-MM-DD");
      if (!groups[day]) groups[day] = [];
      groups[day].push(asset);
    });
    return Object.entries(groups)
      .map(([day, items]) => ({ day, items }))
      .sort((a, b) => (a.day < b.day ? 1 : -1));
  }, [assets]);

  const handleDownload = async (url: string, fileName: string, id: string) => {
    try {
      setDownloadingId(id);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Media Library</h1>
          <p className="text-sm text-slate-400">Review your uploaded images and videos, grouped by upload date.</p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-fit">
            <TabsList className="bg-slate-900 border border-slate-800 h-10 p-1 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg px-4 text-xs font-semibold data-[state=active]:bg-lime-400 data-[state=active]:text-slate-950">All</TabsTrigger>
              <TabsTrigger value="image" className="rounded-lg px-4 text-xs font-semibold data-[state=active]:bg-lime-400 data-[state=active]:text-slate-950">Images</TabsTrigger>
              <TabsTrigger value="video" className="rounded-lg px-4 text-xs font-semibold data-[state=active]:bg-lime-400 data-[state=active]:text-slate-950">Videos</TabsTrigger>
            </TabsList>
          </Tabs>
          <Badge variant="outline" className="h-10 px-4 rounded-xl border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-medium flex items-center">
            Total {totalItems}
          </Badge>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {error}
        </div>
      )}

      <div className={cn(
        "min-h-[400px] transition-opacity duration-300",
        loading ? "opacity-50 pointer-events-none" : "opacity-100"
      )}>
        {assets.length === 0 && !loading ? (
          <Card>
            <CardContent className="p-12 text-center text-slate-400">
              <p className="text-lg font-medium text-white mb-1">No media found</p>
              <p className="text-sm">Add media from the Calendar post modal to see them here.</p>
            </CardContent>
          </Card>
        ) : (
          grouped.map(({ day, items }) => (
          <Card key={day} className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-white">
                {dayjs(day).format("MMMM D, YYYY")}
              </CardTitle>
              <Badge variant="secondary" className="text-xs text-lime-300">
                {items.length} file{items.length === 1 ? "" : "s"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((asset) => {
                  const url = buildAssetUrl(asset, baseUrl || undefined);
                  return (
                    <div
                      key={asset.id}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-2"
                    >
                      <div className="aspect-video w-full overflow-hidden rounded-md bg-slate-900 flex items-center justify-center">
                        {asset.mediaType?.toLowerCase() === "image" ? (
                          <Image
                            src={url}
                            alt={asset.fileName || asset.storageKey}
                            className="h-full w-full object-cover"
                            width={300}
                            height={200}
                          />
                        ) : (
                          <video
                            src={url}
                            controls
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                         <span className="truncate" title={asset.fileName || asset.storageKey}>
                          {asset.fileName || asset.storageKey.split("/").pop()}
                        </span> 
                        <span className="uppercase text-slate-400">{asset.mediaType}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {dayjs(asset.createdAt).format("h:mm A")}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                        >
                          Open
                        </Button>
                        <Button
                          onClick={() => handleDownload(url, asset.fileName || asset.storageKey.split('/').pop() || 'file', asset.id)}
                          disabled={downloadingId === asset.id}
                          variant="ghost"
                          size="sm"
                          className="text-xs text-slate-200"
                        >
                          <Download className="mr-2 h-3.5 w-3.5" />
                          {downloadingId === asset.id ? "..." : "Download"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-4 pt-4 pb-8">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="border-slate-800 text-slate-300 hover:bg-slate-800"
          >
           <ChevronLeft className="mr-2 h-3.5 w-3.5" />
          </Button>
          <div className="text-sm text-slate-400 font-medium">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="border-slate-800 text-slate-300 hover:bg-slate-800"
          >
           <ChevronRight className="ml-2 h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
