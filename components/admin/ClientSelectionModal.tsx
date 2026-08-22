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
import { Search, User, Mail, Hash, Loader2, X } from "lucide-react";
import { apiGet } from "@/lib/api";
import { AdminPagination } from "@/components/admin/AdminPagination";

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
    let timeoutId: NodeJS.Timeout;
    if (isOpen) {
      timeoutId = setTimeout(() => {
        fetchClients(1);
      }, 300);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isOpen, searchQuery]);

  const fetchClients = async (page: number = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: "10",
      });
      if (searchQuery) {
        queryParams.append("search", searchQuery);
      }
      const data = await apiGet<any>(`/api/scheduler/clients?${queryParams.toString()}`);
      console.log(data, 'data')
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

  // const handlePageChange = (newPage: number) => {
  //   if (newPage >= 1 && (!meta || newPage <= meta.totalPages)) {
  //     fetchClients(newPage);
  //   }
  // };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] xl:max-w-5xl bg-[#faf8f3] border-[#d9d4c9] text-[#14110c] p-0 overflow-hidden flex flex-col max-h-[95vh] shadow-2xl rounded-3xl">
        <style dangerouslySetInnerHTML={{
          __html: `
          *::-webkit-scrollbar { display: none !important; }
          * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        `}} />

        <DialogHeader className="p-5 border-b border-[#d9d4c9] shrink-0 bg-[#ffffff]">
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <div className="p-2.5 bg-[#b08d3e]/10 rounded-xl border border-[#b08d3e]/20">
              <User className="h-5 w-5 text-[#b08d3e]" />
            </div>
            Select Client
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4 flex-1 flex flex-col min-h-0 overflow-hidden bg-[#faf8f3]">
          <div className="relative shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search database..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-[#ffffff] border-[#d9d4c9] focus:ring-[#b08d3e]/20 focus:border-[#b08d3e] text-sm rounded-xl transition-all shadow-sm"
            />
          </div>

          <div className="flex-1 border border-[#d9d4c9] rounded-2xl overflow-hidden flex flex-col bg-[#ffffff] shadow-sm">
            <div className="overflow-x-auto flex-1 border-b border-[#d9d4c9] no-scrollbar">
              <Table className="min-w-full table-auto">
                <TableHeader className="bg-[#faf8f3] border-b border-[#d9d4c9] sticky top-0 z-20">
                  <TableRow className="border-none hover:bg-transparent uppercase tracking-widest text-xs font-bold">
                    <TableHead className="text-slate-500 h-10 px-4">Name</TableHead>
                    <TableHead className="text-slate-500 h-10 px-4">Email Address</TableHead>
                    <TableHead className="text-slate-500 h-10 px-4">User ID</TableHead>
                    <TableHead className="text-right text-slate-500 h-10 pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className="hover:bg-transparent border-none">
                      <TableCell colSpan={4} className="h-[480px] text-center">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="relative">
                            <Loader2 className="h-8 w-8 animate-spin text-[#b08d3e]" />
                            <div className="absolute inset-0 blur-lg bg-[#b08d3e]/20 animate-pulse" />
                          </div>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Accessing Database...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : clients.length === 0 ? (
                    <TableRow className="hover:bg-transparent border-none">
                      <TableCell colSpan={4} className="h-[480px] text-center">
                        <div className="flex flex-col items-center justify-center gap-3 text-slate-600">
                          <div className="p-4 bg-[#ffffff] rounded-full border border-[#d9d4c9]/50">
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
                          className="border-[#d9d4c9]/30 hover:bg-[#b08d3e]/[0.03] transition-all group cursor-pointer h-[48px]"
                          onClick={() => onSelect(client)}
                        >
                          <TableCell className="px-4 py-0">
                            <span className="font-semibold text-[#14110c] group-hover:text-[#b08d3e] transition-colors block text-base truncate">
                              {client.fullName || client.name || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-0">
                            <div className="flex items-center gap-2 text-slate-500 group-hover:text-[#14110c] transition-colors text-[15px] truncate">
                              <Mail className="h-4 w-4 opacity-40 shrink-0" />
                              <span className="truncate">{client.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-0 font-mono text-xs">
                            <div className="flex items-center gap-2 text-slate-600 group-hover:text-[#6b6b6b] transition-colors">
                              <Hash className="h-3 w-3 opacity-40 shrink-0" />
                              <span className="truncate">{client.id}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-6 py-0">
                            <Button
                              size="sm"
                              className="bg-[#b08d3e] hover:bg-[#e6e1d8] text-slate-950 font-black px-5 h-8 rounded-lg text-xs uppercase tracking-wider shadow-lg shadow-lime-400/10 active:scale-95 transition-all"
                            >
                              Select
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Fill empty rows */}
                        {clients.length < 10 && Array.from({ length: 10 - clients.length }).map((_, i) => (
                          <TableRow key={`empty-${i}`} className="border-transparent hover:bg-transparent h-[48px]">
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
            <div className="bg-[#ffffff] rounded-b-2xl overflow-hidden border-t border-[#d9d4c9]">
              <AdminPagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                onPageChange={fetchClients}
                isLoading={loading}
                className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#ffffff] gap-4"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
