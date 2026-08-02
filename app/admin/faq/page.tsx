"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Loader2, MoreHorizontal, Pencil, Plus, Power, PowerOff, Trash2, Filter } from "lucide-react";
import { AdminPagination } from "@/components/admin/AdminPagination";

type FaqPageType = "FAQ_PAGE" | "PRICING_PAGE";

type Faq = {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  pageType: FaqPageType;
  createdByAdminId?: string | null;
  updatedByAdminId?: string | null;
  createdAt: string;
  updatedAt: string;
};

type GetAllFaqsResponse = {
  success: boolean;
  data: Faq[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type UpsertFaqPayload = {
  question: string;
  answer: string;
  isActive: boolean;
  pageType: FaqPageType;
};

type UpsertFaqResponse = {
  success: boolean;
  data: Faq;
};

type DeleteFaqResponse = {
  success: boolean;
};

type UpdateStatusPayload = {
  status: "ACTIVE" | "INACTIVE";
};

export default function AdminFaqPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    return "Request failed";
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<Faq | null>(null);
  const [filterPageType, setFilterPageType] = useState<FaqPageType | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState<UpsertFaqPayload>({
    question: "",
    answer: "",
    isActive: true,
    pageType: "FAQ_PAGE",
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-faqs", filterPageType, currentPage, itemsPerPage],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append("page", String(currentPage));
      params.append("limit", String(itemsPerPage));
      if (filterPageType !== "ALL") {
        params.append("pageType", filterPageType);
      }
      return apiGet<GetAllFaqsResponse>(`/api/faq/admin?${params.toString()}`);
    },
    placeholderData: (previousData) => previousData,
  });

  const faqs = useMemo(() => data?.data ?? [], [data?.data]);

  const totalPages = Math.max(1, data?.pagination?.totalPages ?? 1);
  const totalRecords = data?.pagination?.total ?? faqs.length;
  const hasServerPagination = Boolean(data?.pagination);
  const canGoPrev = currentPage > 1;
  const canGoNext = hasServerPagination ? currentPage < totalPages : faqs.length >= itemsPerPage;

  useEffect(() => {
    // Avoid snapping back while a new page is still fetching.
    if (isFetching) return;
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages, isFetching]);

  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      isActive: true,
      pageType: "FAQ_PAGE",
    });
  };

  const openCreate = () => {
    setEditingFaq(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = (faq: Faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      // UI does not edit displayOrder.
      // displayOrder: 0,
      isActive: faq.isActive,
      pageType: faq.pageType || "FAQ_PAGE",
    });
    setIsDialogOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (payload: UpsertFaqPayload) => apiPost<UpsertFaqResponse, UpsertFaqPayload>("/api/faq", payload),
    onSuccess: () => {
      toast({ title: "FAQ created" });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      resetForm();
    },
    onError: (err: unknown) => {
      toast({ title: "Create failed", description: getErrorMessage(err), variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: UpsertFaqPayload }) =>
      apiPatch<UpsertFaqResponse, UpsertFaqPayload>(`/api/faq/${payload.id}`, payload.data),
    onSuccess: () => {
      toast({ title: "FAQ updated" });
      setIsDialogOpen(false);
      setEditingFaq(null);
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      resetForm();
    },
    onError: (err: unknown) => {
      toast({ title: "Update failed", description: getErrorMessage(err), variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete<DeleteFaqResponse>(`/api/faq/${id}`),
    onSuccess: () => {
      toast({ title: "FAQ deleted" });
      setIsDeleteDialogOpen(false);
      setFaqToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
    },
    onError: (err: unknown) => {
      toast({ title: "Delete failed", description: getErrorMessage(err), variant: "destructive" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (payload: { id: string; status: UpdateStatusPayload["status"] }) =>
      apiPatch<{ success: boolean; data?: Faq }, UpdateStatusPayload>(`/api/faq/${payload.id}/status`, {
        status: payload.status,
      }),
    onSuccess: () => {
      toast({ title: "Status updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
    },
    onError: (err: unknown) => {
      toast({ title: "Status update failed", description: getErrorMessage(err), variant: "destructive" });
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UpsertFaqPayload = {
      question: formData.question.trim(),
      answer: formData.answer.trim(),
     
      isActive: Boolean(formData.isActive),
      pageType: formData.pageType,
    };
    if (!payload.question || !payload.answer) {
      toast({ title: "Question and answer are required", variant: "destructive" });
      return;
    }
    if (editingFaq) {
      updateMutation.mutate({ id: editingFaq.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const formatDateTime = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#14110c]">FAQ Management</h1>
          <p className="text-sm text-[#6b6b6b]">Create, edit, delete, and activate FAQs.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#ffffff] border border-[#d9d4c9] rounded-xl px-3 py-1">
            <Filter className="h-4 w-4 text-[#6b6b6b]" />
            <Select
              value={filterPageType}
              onChange={(e) => {
                setFilterPageType(e.target.value as FaqPageType | "ALL");
                setCurrentPage(1);
              }}
              className="w-[160px] bg-transparent border-none text-[#14110c] focus:ring-0 cursor-pointer"
            >
              <option value="ALL">All Pages</option>
              <option value="FAQ_PAGE">FAQ Page</option>
              <option value="PRICING_PAGE">Pricing Page</option>
            </Select>
          </div>
          <Button
            onClick={openCreate}
            className="cursor-pointer bg-[#b08d3e] hover:bg-[#e6e1d8] text-[#14110c] font-black gap-2 px-8 py-6 rounded-2xl shadow-[0_15px_30px_rgba(163,230,53,0.3)] transition-all hover:scale-105 active:scale-95 text-base"
          >
            <Plus className="h-5 w-5" /> Create FAQ
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-[#d9d4c9] bg-[#ffffff] overflow-hidden">
        {isLoading && !data ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#b08d3e]" />
            <p className="text-[#6b6b6b] text-sm">Loading FAQs...</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-[#e6e1d8]/50">
                <TableRow className="hover:bg-transparent border-[#d9d4c9]">
                  <TableHead className="text-[#6b6b6b] font-semibold py-4">Question</TableHead>
                  <TableHead className="text-[#6b6b6b] font-semibold py-4 w-32">Page Type</TableHead>
                  <TableHead className="text-[#6b6b6b] font-semibold py-4 w-32">Status</TableHead>
                  <TableHead className="text-[#6b6b6b] font-semibold py-4 w-48">Updated</TableHead>
                  <TableHead className="text-[#6b6b6b] font-semibold py-4 w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.length ? (
                  faqs.map((faq) => (
                    <TableRow key={faq.id} className="border-[#d9d4c9] hover:bg-[#e6e1d8]/30 transition-colors">
                      <TableCell className="py-4">
                        <div className="text-[#14110c] font-medium leading-5">{faq.question}</div>
                        <div className="text-[#6b6b6b] text-xs mt-1 line-clamp-2">{faq.answer}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className="border-[#d9d4c9] bg-[#e6e1d8]/40 text-[#14110c] font-bold text-[10px]"
                        >
                          {faq.pageType === "FAQ_PAGE" ? "FAQ" : "PRICING"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className={
                            faq.isActive
                              ? "border-[#b08d3e]/30 bg-[#b08d3e]/10 text-[#8a6d28]"
                              : "border-[#d9d4c9] bg-[#e6e1d8]/40 text-[#14110c]"
                          }
                        >
                          {faq.isActive ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-[#6b6b6b] text-sm">{formatDateTime(faq.updatedAt)}</TableCell>
                      <TableCell className="py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer h-8 w-8 text-[#6b6b6b] hover:text-[#14110c] hover:bg-[#e6e1d8]"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#ffffff] border-[#d9d4c9] text-[#14110c]">
                            <DropdownMenuItem
                              onClick={() => openEdit(faq)}
                              className="cursor-pointer focus:bg-[#e6e1d8]"
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                statusMutation.mutate({
                                  id: faq.id,
                                  status: faq.isActive ? "INACTIVE" : "ACTIVE",
                                })
                              }
                              className="cursor-pointer focus:bg-[#e6e1d8]"
                            >
                              {faq.isActive ? (
                                <>
                                  <PowerOff className="mr-2 h-4 w-4" /> Deactivate
                                </>
                              ) : (
                                <>
                                  <Power className="mr-2 h-4 w-4" /> Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setFaqToDelete(faq);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="cursor-pointer text-red-600 focus:bg-[#e6e1d8] focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-[#6b6b6b]">
                      No FAQs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalRecords}
                isLoading={isFetching}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </>
        )}
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingFaq(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[650px] bg-[#ffffff] border-[#d9d4c9] text-[#14110c]">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#14110c]">{editingFaq ? "Edit FAQ" : "Create FAQ"}</DialogTitle>
            <DialogDescription className="text-[#6b6b6b]">
              {editingFaq ? "Update the FAQ details." : "Add a new FAQ entry."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="question" className="text-[#14110c]">
                Question
              </Label>
              <Input
                id="question"
                className="bg-[#faf8f3] border-[#d9d4c9] text-[#14110c] focus:ring-lime-500"
                value={formData.question}
                onChange={(e) => setFormData((p) => ({ ...p, question: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer" className="text-[#14110c]">
                Answer
              </Label>
              <Textarea
                id="answer"
                className="min-h-32 bg-[#faf8f3] border-[#d9d4c9] text-[#14110c] focus:ring-lime-500"
                value={formData.answer}
                onChange={(e) => setFormData((p) => ({ ...p, answer: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pageType" className="text-[#14110c] font-medium">
                  Page Type
                </Label>
                <Select
                  id="pageType"
                  value={formData.pageType}
                  onChange={(e) => setFormData((p) => ({ ...p, pageType: e.target.value as FaqPageType }))}
                  className="bg-[#faf8f3] border-[#d9d4c9] text-[#14110c] focus:ring-lime-500 cursor-pointer h-11"
                  required
                >
                  <option value="FAQ_PAGE">FAQ Page</option>
                  <option value="PRICING_PAGE">Pricing Page</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#14110c] font-medium">Status</Label>
                <div className="flex items-center gap-3 rounded-xl border border-[#d9d4c9] bg-[#faf8f3] px-4 h-11 w-full transition-all hover:border-[#d9d4c9]">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData((p) => ({ ...p, isActive: Boolean(checked) }))}
                    className="border-[#d9d4c9] data-[state=checked]:bg-[#b08d3e] data-[state=checked]:text-[#14110c]"
                  />
                  <Label htmlFor="isActive" className="text-sm text-[#14110c] cursor-pointer flex-1">
                    Visible on site
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="border-[#d9d4c9] bg-[#ffffff] text-[#14110c] hover:bg-[#e6e1d8] hover:text-[#14110c] font-black px-8 py-6 rounded-2xl transition-all hover:scale-105 active:scale-95 text-base"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[#b08d3e] hover:bg-[#e6e1d8] text-[#14110c] font-black gap-2 px-8 py-6 rounded-2xl shadow-[0_15px_30px_rgba(163,230,53,0.3)] transition-all hover:scale-105 active:scale-95 text-base"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingFaq ? "Update FAQ" : "Create FAQ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px] bg-[#ffffff] border-[#d9d4c9] text-[#14110c]">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#14110c]">Delete FAQ</DialogTitle>
            <DialogDescription className="text-[#6b6b6b]">
              This action cannot be undone. Delete this FAQ?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-[#d9d4c9] bg-[#faf8f3] px-4 py-3">
            <div className="text-sm text-[#14110c] font-medium">{faqToDelete?.question}</div>
            <div className="text-xs text-[#6b6b6b] mt-1 line-clamp-2">{faqToDelete?.answer}</div>
          </div>
          <DialogFooter className="gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="border-[#d9d4c9] bg-[#ffffff] text-[#14110c] hover:bg-[#e6e1d8] hover:text-[#14110c] font-black px-8 py-6 rounded-2xl transition-all hover:scale-105 active:scale-95 text-base"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!faqToDelete || deleteMutation.isPending}
              onClick={() => faqToDelete && deleteMutation.mutate(faqToDelete.id)}
              className="bg-rose-600 hover:bg-rose-500 text-[#14110c] font-black px-8 py-6 rounded-2xl shadow-[0_15px_30px_rgba(225,29,72,0.3)] transition-all hover:scale-105 active:scale-95 text-base border-none"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
