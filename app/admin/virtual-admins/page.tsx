"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useSessionContext } from "@/context/SessionContext";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Plus,
  MoreHorizontal,
  Trash2,
  UserPlus,
  Key,
  Mail,
  User,
  Shield,
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserX,
  UserCheck,
  Search,
  Filter,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// --- Constants ---

const PERMISSIONS = [
  "OVERVIEW",
  "USER_MANAGE",
  "SUBSCRIPTION_MANAGE",
  "SCHEDULE_MANAGE",
  "POST_MANAGE",
  "COUPON_MANAGE",
  "VIRTUAL_ADMIN_MANAGE",
  "SUBMISSIONS",
  "SUPPORT",
  "PROFILE",
  "CASE_STUDIES",
  "FAQ",
];

const ROLES = ["ADMIN", "SUPER_ADMIN"];

// --- Types ---

type AdminItem = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: "ACTIVE" | "BLOCKED";
  createdAt: string;
  updatedAt: string;
  permissions: string[];
};

type AdminsResponse = {
  items: AdminItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type CreateAdminPayload = {
  name: string;
  email: string;
  password?: string;
  role: string;
  permissions: string[];
};

export default function AdminManagementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { session, refresh: refreshSession } = useSessionContext();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAdminDetailsOpen, setIsAdminDetailsOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminItem | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminItem | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<AdminItem | null>(null);

  const [formData, setFormData] = useState<CreateAdminPayload>({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
    permissions: [],
  });
  const [showPasswordToggle, setShowPasswordToggle] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-virtual-admins", page, statusFilter, debouncedSearch],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (debouncedSearch) params.append("search", debouncedSearch);
      return apiGet<AdminsResponse>(
        `/api/admin/virtual-admins?${params.toString()}`,
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateAdminPayload) =>
      apiPost<any, CreateAdminPayload>("/api/admin/virtual-admins", payload),
    onSuccess: () => {
      toast({
        title: "Admin Onboarded",
        description: `Successfully created account for ${formData.email}`,
      });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-virtual-admins"] });
      resetForm();
    },
    onError: (err: any) => {
      toast({
        title: "Failed",
        description: err.message || "Unable to create administrator account.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: {
      id: string;
      data: Partial<CreateAdminPayload>;
    }) => {
      const updateData = {
        name: payload.data.name,
        role: payload.data.role,
        replacePermissions: payload.data.permissions,
      };
      return apiPatch<any, any>(
        `/api/admin/virtual-admins/${payload.id}`,
        updateData,
      );
    },
    onSuccess: async (_, variables) => {
      toast({
        title: "Profile Updated",
        description: "Administrative permissions and role have been saved.",
      });
      setEditingAdmin(null);
      setIsDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-virtual-admins"] });
      // If the updated admin is the current logged-in user,
      // refresh the session so the sidebar updates immediately.
      if (session?.id && variables.id === session.id) {
        await refreshSession();
      }
    },
    onError: (err: any) => {
      toast({
        title: "Update Failed",
        description: err.message || "Failed to save profile changes.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiDelete<any>(`/api/admin/virtual-admins/${id}`),
    onSuccess: () => {
      toast({
        title: "Access Revoked",
        description: "Admin account has been permanently removed.",
        variant: "destructive",
      });
      setIsDialogOpen(false);
      setAdminToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin-virtual-admins"] });
    },
    onError: (err: any) => {
      toast({
        title: "Deletion Failed",
        description: err.message || "Unable to revoke administrative access.",
        variant: "destructive",
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (payload: { id: string; status: string }) =>
      apiPatch<any, { status: string }>(
        `/api/admin/virtual-admins/${payload.id}/status`,
        { status: payload.status },
      ),
    onSuccess: (_, variables) => {
      const isBlocked = variables.status === "BLOCKED";
      toast({
        title: isBlocked ? "Admin Blocked" : "Admin Activated",
        description: `Personnel status changed to ${variables.status.toLowerCase()}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-virtual-admins"] });
    },
    onError: (err: any) => {
      toast({
        title: "Status Update Failed",
        description: err.message || "Could not change administrator status.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "ADMIN",
      permissions: [],
    });
  };

  const handleEdit = (admin: AdminItem) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name || "",
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions || [],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAdmin) {
      updateMutation.mutate({ id: editingAdmin.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const togglePermission = (perm: string) => {
    setFormData((prev) => {
      const has = prev.permissions.includes(perm);
      if (has) {
        return {
          ...prev,
          permissions: prev.permissions.filter((p) => p !== perm),
        };
      } else {
        return { ...prev, permissions: [...prev.permissions, perm] };
      }
    });
  };

  const columns: ColumnDef<AdminItem>[] = [
    {
      accessorKey: "admin",
      header: "Admin Information",
      cell: ({ row }) => {
        const admin = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#e6e1d8] flex items-center justify-center border border-[#d9d4c9] text-[#b08d3e] font-bold overflow-hidden">
              {admin.name ? (
                admin.name.charAt(0).toUpperCase()
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#14110c]">
                {admin.name || "N/A"}
              </span>
              <span className="text-xs text-[#6b6b6b]">{admin.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <Badge
            variant="outline"
            className={cn(
              "font-bold tracking-wider shadow-sm",
              role === "SUPER_ADMIN"
                ? "bg-[#b08d3e]/10 text-[#8a6d28] border-[#b08d3e]/20"
                : "bg-slate-100 text-slate-700 border-slate-200",
            )}
          >
            {role.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            className={cn(
              "capitalize",
              status === "ACTIVE"
                ? "bg-[#b08d3e]/10 text-[#b08d3e] border-[#b08d3e]/20"
                : "bg-red-500/10 text-red-600 border-red-500/20",
            )}
            variant="outline"
          >
            {status.toLowerCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created On",
      cell: ({ row }) => (
        <div className="text-xs text-[#6b6b6b]">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const admin = row.original;
        return (
          <div className="flex items-center gap-2">
            {/* <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-[#d9d4c9] text-[#6b6b6b] hover:text-[#b08d3e] hover:border-[#b08d3e]/50"
              onClick={() => {
                setSelectedAdmin(admin);
                setIsAdminDetailsOpen(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 text-[#6b6b6b] hover:text-[#14110c]"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 bg-[#ffffff] border-[#d9d4c9] text-[#14110c] shadow-2xl"
              >
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedAdmin(admin);
                    setIsAdminDetailsOpen(true);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(admin)}>
                  <User className="mr-2 h-4 w-4" /> Edit Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    statusMutation.mutate({
                      id: admin.id,
                      status: admin.status === "ACTIVE" ? "BLOCKED" : "ACTIVE",
                    })
                  }
                  className={
                    admin.status === "ACTIVE"
                      ? "text-amber-700"
                      : "text-[#b08d3e]"
                  }
                >
                  {admin.status === "ACTIVE" ? (
                    <>
                      <UserX className="mr-2 h-4 w-4" /> Block Admin
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" /> Activate Admin
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setAdminToDelete(admin);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete admin
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data?.items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#14110c]">Admin Management</h1>
          <p className="text-sm text-[#6b6b6b]">Manage your team, roles, and fine-grained access permissions.</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditingAdmin(null);
            setIsDialogOpen(true);
          }}
          className="bg-[#b08d3e] hover:bg-[#e6e1d8] text-[#14110c] font-black gap-2 px-8 py-6 rounded-2xl shadow-[0_15px_30px_rgba(163,230,53,0.3)] transition-all hover:scale-[1.05] active:scale-95 text-base"
        >
          <UserPlus className="h-5 w-5" /> Add New Admin
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6b6b] group-focus-within:text-[#b08d3e] transition-colors" />
          <Input
            placeholder="Search admins by name or email..."
            className="pl-10 h-12 bg-[#ffffff] border-[#d9d4c9] text-[#14110c] rounded-xl focus:ring-[#b08d3e]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#6b6b6b] hidden sm:block" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-12 w-40 justify-between bg-[#ffffff] border-[#d9d4c9] text-[#14110c] rounded-xl px-3 hover:bg-[#e6e1d8] focus:ring-1 focus:ring-[#b08d3e] transition-colors"
              >
                {statusFilter === "ALL"
                  ? "All Status"
                  : statusFilter === "ACTIVE"
                    ? "Active"
                    : "Blocked"}
                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[var(--radix-dropdown-menu-trigger-width)]"
            >
              <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("ACTIVE")}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("BLOCKED")}>
                Blocked
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-2xl border border-[#d9d4c9] bg-[#ffffff]/30 overflow-hidden backdrop-blur-sm">
        {isLoading ? (
          <div className="flex h-80 flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#b08d3e]" />
            <p className="text-[#6b6b6b] text-sm font-bold uppercase tracking-widest">
              Loading Personnel...
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-[#e6e1d8]/30">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent border-[#d9d4c9]"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-[#6b6b6b] font-bold uppercase tracking-widest text-[10px] py-5"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-[#d9d4c9] hover:bg-[#e6e1d8]/20 transition-all group"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="py-5 font-medium group-hover:text-[#14110c] transition-colors"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-40 text-center text-[#6b6b6b] font-medium"
                    >
                      No matching administrators found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* ── Pagination Footer ── */}
            {data && data.totalPages > 0 && (
              <AdminPagination
                currentPage={page}
                totalPages={data.totalPages}
                totalItems={data.total}
                onPageChange={setPage}
                isLoading={isLoading}
              />
            )}
          </>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-[#faf8f3] border-[#d9d4c9] text-[#14110c] rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#b08d3e] shadow-[0_0_15px_rgba(163,230,53,0.5)]" />
          <DialogHeader className="pt-6 px-6 pb-2">
            <DialogTitle className="text-2xl font-black text-[#14110c] tracking-tight">
              {editingAdmin ? "Edit Administrator" : "Create New Admin"}
            </DialogTitle>
            <DialogDescription className="text-[#6b6b6b] font-medium text-sm">
              {editingAdmin
                ? "Update security roles and access permissions for this admin."
                : "Create a new administrative user with specific access controls."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div className="grid gap-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6b6b6b]">
                  Identity Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-[#6b6b6b] flex items-center gap-1.5">
                      <User className="h-3 w-3" /> Full Name
                    </Label>
                    <Input
                      placeholder="e.g. John Doe"
                      className="bg-[#ffffff] border-[#d9d4c9] text-[#14110c] rounded-xl h-11 focus:ring-[#b08d3e]"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-[#6b6b6b] flex items-center gap-1.5">
                      <Mail className="h-3 w-3" /> Email Address
                    </Label>
                    <Input
                      type="email"
                      placeholder="email@talexia.ai"
                      className="bg-[#ffffff] border-[#d9d4c9] text-[#14110c] rounded-xl h-11 focus:ring-[#b08d3e]"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      disabled={!!editingAdmin}
                    />
                  </div>
                </div>

                {!editingAdmin && (
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type={showPasswordToggle ? "text" : "password"}
                        placeholder="Minimum 8 characters"
                        className="bg-[#ffffff] border-[#d9d4c9] text-[#14110c] rounded-xl h-11 focus:ring-[#b08d3e] pr-10"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#6b6b6b] hover:text-[#14110c] transition-colors focus:outline-none"
                        onClick={() => setShowPasswordToggle(!showPasswordToggle)}
                      >
                        {showPasswordToggle ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6b6b6b]">
                  Role & Authority
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role })}
                      className={cn(
                        "p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all group",
                        formData.role === role
                          ? "bg-[#b08d3e]/10 border-[#b08d3e] shadow-[0_0_15px_rgba(163,230,53,0.1)]"
                          : "bg-[#ffffff] border-[#d9d4c9] hover:border-[#d9d4c9] hover:bg-[#e6e1d8]/50",
                      )}
                    >
                      <Shield
                        className={cn(
                          "h-6 w-6 transition-colors",
                          formData.role === role
                            ? "text-[#b08d3e]"
                            : "text-[#6b6b6b] group-hover:text-[#6b6b6b]",
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-black uppercase tracking-widest",
                          formData.role === role
                            ? "text-[#b08d3e]"
                            : "text-[#6b6b6b]",
                        )}
                      >
                        {role.replace("_", " ")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 bg-[#ffffff] p-6 rounded-3xl border border-[#d9d4c9]/60">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6b6b6b]">
                    Access Permissions
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        permissions:
                          prev.permissions.length === PERMISSIONS.length
                            ? []
                            : [...PERMISSIONS],
                      }))
                    }
                    className="text-[10px] font-bold text-[#b08d3e] hover:underline"
                  >
                    {formData.permissions.length === PERMISSIONS.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                  {PERMISSIONS.map((perm) => (
                    <div
                      key={perm}
                      className="flex items-center space-x-3 group justify-between sm:justify-start"
                    >
                      <Checkbox
                        id={`perm-${perm}`}
                        checked={formData.permissions.includes(perm)}
                        onCheckedChange={() => togglePermission(perm)}
                        className="h-5 w-5 border-[#d9d4c9] data-[state=checked]:bg-[#b08d3e] data-[state=checked]:border-lime-500 shadow-sm"
                      />
                      <label
                        htmlFor={`perm-${perm}`}
                        className="text-xs font-semibold text-[#6b6b6b] cursor-pointer group-hover:text-[#14110c] transition-colors"
                      >
                        {perm === "FAQ" ? "FAQ" : perm
                          .split("_")
                          .map((s) => s.charAt(0) + s.slice(1).toLowerCase())
                          .join(" ")}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 flex flex-col-reverse sm:flex-row gap-4">
              <Button
                type="button"
                variant="outline"
                className="border-[#d9d4c9] bg-[#ffffff] text-[#14110c] hover:bg-[#e6e1d8] hover:text-[#14110c] font-black px-8 py-6 rounded-2xl transition-all hover:scale-105 active:scale-95 text-base"
                onClick={() => setIsDialogOpen(false)}
              >
                Dismiss
              </Button>
              <Button
                type="submit"
                className="bg-[#b08d3e] hover:bg-[#e6e1d8] text-[#14110c] font-black gap-2 px-8 py-6 rounded-2xl shadow-[0_15px_30px_rgba(163,230,53,0.3)] transition-all hover:scale-105 active:scale-95 text-base"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserCheck className="mr-2 h-4 w-4" />
                )}
                {editingAdmin ? "Save Account Changes" : "Confirm "}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAdminDetailsOpen} onOpenChange={setIsAdminDetailsOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#faf8f3] border-[#d9d4c9] text-[#14110c] rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#b08d3e]" />
          <DialogHeader className="pt-6 px-6">
            <DialogTitle className="text-xl font-black text-[#14110c] tracking-tight flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-[#b08d3e]" />
              Administrator Details
            </DialogTitle>
          </DialogHeader>

          {selectedAdmin && (
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 bg-[#ffffff] p-4 rounded-2xl border border-[#d9d4c9]">
                <div className="h-14 w-14 rounded-full bg-[#e6e1d8] flex items-center justify-center border border-[#d9d4c9] text-2xl font-black text-[#b08d3e]">
                  {selectedAdmin.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#14110c]">
                    {selectedAdmin.name}
                  </h3>
                  <p className="text-sm text-[#6b6b6b] font-medium">
                    {selectedAdmin.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#6b6b6b]">
                    Access Level
                  </p>
                  <Badge
                    variant="outline"
                    className="bg-sky-500/10 text-sky-400 border-sky-500/20 px-3 py-1"
                  >
                    {selectedAdmin.role}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#6b6b6b]">
                    Current Status
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-3 py-1",
                      selectedAdmin.status === "ACTIVE"
                        ? "bg-[#b08d3e]/10 text-[#b08d3e] border-[#b08d3e]/20"
                        : "bg-red-500/10 text-red-600 border-red-500/20",
                    )}
                  >
                    {selectedAdmin.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#6b6b6b] flex items-center gap-2">
                  <Shield className="h-3 w-3 text-[#b08d3e]" /> Active
                  Permissions
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedAdmin.permissions?.map((perm) => (
                    <Badge
                      key={perm}
                      variant="secondary"
                      className="bg-[#ffffff] text-[#14110c] border-[#d9d4c9] text-[10px]"
                    >
                      {perm === "FAQ" ? "FAQ" : perm
                        .split("_")
                        .map((s) => s.charAt(0) + s.slice(1).toLowerCase())
                        .join(" ")}
                    </Badge>
                  ))}
                  {(!selectedAdmin.permissions ||
                    selectedAdmin.permissions.length === 0) && (
                    <p className="text-xs text-[#6b6b6b] italic">
                      No special permissions granted.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#d9d4c9] flex justify-between text-[10px] text-[#6b6b6b] font-mono">
                <span>
                  Created:{" "}
                  {format(
                    new Date(selectedAdmin.createdAt),
                    "yyyy-MM-dd HH:mm",
                  )}
                </span>
                <span>
                  Last Updated:{" "}
                  {format(
                    new Date(selectedAdmin.updatedAt),
                    "yyyy-MM-dd HH:mm",
                  )}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="bg-[#ffffff] p-6 border-t border-[#d9d4c9]">
            <Button
              variant="outline"
              onClick={() => setIsAdminDetailsOpen(false)}
              className="w-full border-[#d9d4c9] bg-[#ffffff] text-[#14110c] hover:bg-[#e6e1d8] hover:text-[#14110c] font-black px-8 py-6 rounded-2xl transition-all hover:scale-105 active:scale-95 text-base"
            >
              Close Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#faf8f3] border-[#d9d4c9] text-[#14110c] rounded-3xl shadow-2xl">
          <DialogHeader className="pt-4">
            <DialogTitle className="text-xl font-black text-[#14110c] tracking-tight">
              Revoke Admin Access
            </DialogTitle>
            <DialogDescription className="text-[#6b6b6b] font-medium">
              Are you sure you want to permanently delete the administrator
              account for{" "}
              <span className="text-[#14110c] font-black underline decoration-red-500/50 underline-offset-4">
                {adminToDelete?.email}
              </span>
              ? This action is irreversible and will immediately revoke all
              access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-8 flex flex-col-reverse sm:flex-row gap-4 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-[#d9d4c9] bg-[#ffffff] text-[#14110c] hover:bg-[#e6e1d8] hover:text-[#14110c] font-black px-8 py-6 rounded-2xl transition-all hover:scale-105 active:scale-95 text-base"
            >
              Keep Access
            </Button>
            <Button
              variant="destructive"
              className="bg-rose-600 hover:bg-rose-500 text-[#14110c] font-black px-8 py-6 rounded-2xl shadow-[0_15px_30px_rgba(225,29,72,0.3)] transition-all hover:scale-105 active:scale-95 text-base border-none"
              onClick={() =>
                adminToDelete && deleteMutation.mutate(adminToDelete.id)
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Revoke Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
