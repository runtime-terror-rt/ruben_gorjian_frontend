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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchClients(1);
    }
  }, [isOpen, searchQuery]);

  const fetchClients = async (page: number = 1) => {
    try {
      setLoading(true);
      const data = await apiGet<any>(`/api/scheduler/clients?page=${page}&pageSize=20`);
      // Robustly extract items from various possible response structures
      let items = [];
      let metaData = null;

      if (data && typeof data === "object") {
        items = data.items || data.data?.items || data.data || data.users || [];
        if (data.meta) {
          setTotalPages(data.meta.totalPages || 1);
          setTotalCount(data.meta.totalCount || items.length);
        } else if (data.totalPages) {
          setTotalPages(data.totalPages);
          setTotalCount(data.totalCount || items.length);
        }
      }

      setClients(items);
      setCurrentPage(page);
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

          <div className="flex-1 border border-slate-800 rounded-xl overflow-hidden flex flex-col bg-slate-950/50">
            <div className="overflow-y-auto overflow-x-auto flex-1 custom-scrollbar border-b border-slate-800">
              <Table className="min-w-full table-auto">
                <TableHeader className="bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
                  <TableRow className="border-slate-800 hover:bg-transparent uppercase tracking-widest text-[10px] font-bold">
                    <TableHead className="text-slate-500 h-10 px-4">Name</TableHead>
                    <TableHead className="text-slate-500 h-10 px-4">Email Address</TableHead>
                    <TableHead className="text-slate-500 h-10 px-4">User ID</TableHead>
                    <TableHead className="text-right text-slate-500 h-10 pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <Loader2 className="h-10 w-10 animate-spin text-lime-400" />
                          <p className="text-base text-slate-400 font-medium">Loading client database...</p>
                        </div>
                      </TableCell>
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
            
            {/* Pagination Controls */}
            {!searchQuery && totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80">
                <div className="text-xs text-slate-500">
                  Showing page <span className="font-bold text-white">{currentPage}</span> of <span className="font-bold text-white">{totalPages}</span>
                  {totalCount > 0 && <span> ({totalCount} total)</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchClients(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="h-8 border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchClients(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="h-8 border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
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
