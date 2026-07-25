"use client";

import AdminClientWorkspace from "@/components/admin/AdminClientWorkspace";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function AdminClientWorkspacePage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#14110c] tracking-tight">
          Client <span className="text-[#b08d3e]">Workspace</span>
        </h1>
        <p className="text-[#6b6b6b] mt-1 font-medium">
          Focused management for individual clients.
        </p>
      </div>

      <AdminClientWorkspace />
    </div>
  );
}
