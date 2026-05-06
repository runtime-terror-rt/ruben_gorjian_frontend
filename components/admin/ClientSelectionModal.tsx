"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, User, Mail, Hash, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { apiGet } from "@/lib/api";

interface Client {
  id: string;
  name: string | null;
  fullName: string | null;
  email: string;
  status?: string;
  createdAt?: string;
}

interface Meta {
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

interface ClientSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (client: Client) => void;
}

export default function ClientSelectionModal({
  isOpen,
  onClose,
  onSelect,
}: ClientSelectionModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<Meta | null>(null);
  const pageSize = 10;

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchClients(1);
      }, searchQuery ? 500 : 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, searchQuery]);

  const fetchClients = async (pageNum: number) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.set("all", "true");
      queryParams.set("page", pageNum.toString());
      queryParams.set("pageSize", pageSize.toString());
      if (searchQuery.trim()) {
        queryParams.set("search", searchQuery.trim());
      }

      const data = await apiGet<any>(`/api/scheduler/clients?${queryParams.toString()}`).catch(async (err) => {
        console.warn("Paginated fetch failed, trying fallback:", err);
        return await apiGet<any>("/api/scheduler/clients");
      });
      
      let items = [];
      let metaData = null;

      if (data && typeof data === "object") {
        items = data.items || data.data?.items || data.data || data.users || [];
        if (Array.isArray(data)) items = data;
        metaData = data.meta || data.data?.meta || null;
      }

      setClients(items);
      setMeta(metaData);
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (!meta || newPage <= meta.totalPages)) {
      fetchClients(newPage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] xl:max-w-6xl bg-[#0b0f1a] border-slate-800/60 text-slate-100 p-0 overflow-hidden flex flex-col h-[85vh] shadow-[0_0_50px_rgba(0,0,0,0.5)] border-t border-slate-700/30">
        <style dangerouslySetInnerHTML={{ __html: `
          *::-webkit-scrollbar { display: none !important; }
          * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
          .modal-gradient { background: radial-gradient(circle at top left, rgba(163, 230, 53, 0.04), transparent 40%), radial-gradient(circle at bottom right, rgba(99, 102, 241, 0.04), transparent 40%); }
        `}} />
        
        <DialogHeader className="p-5 border-b border-slate-800/50 shrink-0 relative modal-gradient">
          <DialogTitle className="text-xl font-semibold flex items-center gap-3">
            <div className="p-2 bg-lime-400/10 rounded-xl border border-lime-400/20">
              <User className="h-5 w-5 text-lime-400" />
            </div>
            Select Client
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4 flex-1 flex flex-col min-h-0 overflow-hidden relative modal-gradient">
          <div className="relative shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search database..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-10 bg-[#060810] border-slate-800/80 focus:ring-lime-500/10 focus:border-lime-500/40 text-sm rounded-xl transition-all"
            />
          </div>

          <div className="flex-1 border border-slate-800/60 rounded-2xl overflow-hidden flex flex-col bg-[#060810]/40 backdrop-blur-sm">
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-hidden">
                <Table className="min-w-full table-fixed">
                  <TableHeader className="bg-[#0b0f1a]/95 backdrop-blur-xl sticky top-0 z-20">
                    <TableRow className="border-slate-800/40 hover:bg-transparent uppercase tracking-widest text-[9px] font-black opacity-60">
                      <TableHead className="text-slate-400 h-9 px-4 w-[30%]">Name</TableHead>
                      <TableHead className="text-slate-400 h-9 px-4 w-[35%]">Email Address</TableHead>
                      <TableHead className="text-slate-400 h-9 px-4 w-[20%]">User ID</TableHead>
                      <TableHead className="text-right text-slate-400 h-9 pr-6 w-[15%]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow className="hover:bg-transparent border-none">
                        <TableCell colSpan={4} className="h-[460px] text-center">
                          <div className="flex flex-col items-center justify-center gap-4">
                            <div className="relative">
                              <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
                              <div className="absolute inset-0 blur-lg bg-lime-400/20 animate-pulse" />
                            </div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Accessing Database...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : clients.length === 0 ? (
                      <TableRow className="hover:bg-transparent border-none">
                        <TableCell colSpan={4} className="h-[460px] text-center">
                          <div className="flex flex-col items-center justify-center gap-3 text-slate-600">
                            <div className="p-4 bg-slate-900/50 rounded-full border border-slate-800/50">
                              <Search className="h-8 w-8 opacity-20" />
                            </div>
                            <p className="text-sm font-semibold">No clients found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {clients.map((client) => (
                          <TableRow
                            key={client.id}
                            className="border-slate-800/30 hover:bg-lime-400/[0.03] transition-all group cursor-pointer h-[46px]"
                            onClick={() => onSelect(client)}
                          >
                            <TableCell className="px-4 py-0">
                              <span className="font-semibold text-slate-300 group-hover:text-lime-400 transition-colors block text-sm truncate">
                                {client.fullName || client.name || "N/A"}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-0">
                              <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-300 transition-colors text-sm truncate">
                                <Mail className="h-3 w-3 opacity-30 shrink-0" />
                                <span className="truncate">{client.email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-0 font-mono text-[9px]">
                              <div className="flex items-center gap-2 text-slate-600 group-hover:text-slate-400 transition-colors">
                                <Hash className="h-2.5 w-2.5 opacity-20 shrink-0" />
                                <span className="truncate">{client.id}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-6 py-0">
                              <Button
                                size="sm"
                                className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-black px-4 h-7 rounded-lg text-[10px] uppercase tracking-wider shadow-lg shadow-lime-400/10 active:scale-95 transition-all"
                              >
                                Select
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Fill empty rows */}
                        {clients.length < 10 && Array.from({ length: 10 - clients.length }).map((_, i) => (
                          <TableRow key={`empty-${i}`} className="border-transparent hover:bg-transparent h-[46px]">
                            <TableCell colSpan={4} />
                          </TableRow>
                        ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination Footer */}
            {meta && meta.totalPages > 0 && (
              <div className="shrink-0 px-6 py-3 border-t border-slate-800/50 bg-[#0b0f1a]/80 flex items-center justify-between">
                <p className="text-[9px] font-black text-slate-500 tracking-widest uppercase">
                  Page <span className="text-slate-300">{page}</span> / <span className="text-slate-300">{meta.totalPages}</span>
                  {" "}· {meta.totalCount} Clients
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-slate-900/50 border-slate-800/80 hover:bg-slate-800 disabled:opacity-20 rounded-lg transition-all"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1 || loading}
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <div className="bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-800/80 min-w-[24px] text-center">
                    <span className="text-[10px] font-black text-lime-400">{page}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-slate-900/50 border-slate-800/80 hover:bg-slate-800 disabled:opacity-20 rounded-lg transition-all"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= meta.totalPages || loading}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
