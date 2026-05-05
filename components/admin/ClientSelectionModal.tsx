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

interface Client {
  id: string;
  name: string | null;
  fullName: string | null;
  email: string;
  status?: string;
  createdAt?: string;
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

  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await apiGet<any>("/api/scheduler/clients");
      // Robustly extract items from various possible response structures
      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data && typeof data === "object") {
        items = data.items || data.data?.items || data.data || data.users || [];
      }
      setClients(items);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    if (!client) return false;
    const search = searchQuery.toLowerCase().trim();
    if (!search) return true;

    const name = (client.name || "").toLowerCase();
    const fullName = (client.fullName || "").toLowerCase();
    const email = (client.email || "").toLowerCase();
    const id = (client.id || "").toLowerCase();

    return (
      name.includes(search) ||
      fullName.includes(search) ||
      email.includes(search) ||
      id.includes(search)
    );
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] xl:max-w-7xl bg-slate-900 border-slate-800 text-slate-100 p-0 overflow-hidden flex flex-col h-[80vh]">
        <DialogHeader className="p-6 border-b border-slate-800 shrink-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-lime-400/10 rounded-lg">
              <User className="h-6 w-6 text-lime-400" />
            </div>
            Select Client
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6 flex-1 flex flex-col min-h-0">
          <div className="relative shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <Input
              placeholder="Search by name, email or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-10 bg-slate-950 border-slate-800 focus:ring-lime-500/20 focus:border-lime-500/50 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex-1 border border-slate-800 rounded-xl overflow-hidden flex flex-col bg-slate-950/50">
            <div className="overflow-y-auto overflow-x-auto flex-1 custom-scrollbar">
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
                  ) : filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                          <div className="p-4 bg-slate-900 rounded-full">
                            <Search className="h-10 w-10 opacity-20" />
                          </div>
                          <p className="text-lg font-medium">No results found</p>
                          <p className="text-sm opacity-60">Try searching for something else</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => (
                      <TableRow
                        key={client.id}
                        className="border-slate-800/50 hover:bg-lime-400/5 transition-all group cursor-pointer"
                        onClick={() => onSelect(client)}
                      >
                        <TableCell className="px-4 py-2">
                          <span className="font-semibold text-slate-200 group-hover:text-lime-400 transition-colors block text-sm">
                            {client.fullName || client.name || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-2">
                          <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-200 transition-colors text-sm">
                            <Mail className="h-3.5 w-3.5 opacity-50" />
                            {client.email}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-2 font-mono text-[10px]">
                          <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-400 transition-colors">
                            <Hash className="h-3 w-3 opacity-40" />
                            {client.id}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6 py-2">
                          <Button
                            size="sm"
                            className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold px-4 h-8 rounded-lg text-xs"
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
