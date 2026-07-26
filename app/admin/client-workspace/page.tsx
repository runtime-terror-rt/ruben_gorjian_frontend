"use client";

import AdminClientWorkspace from "@/components/admin/AdminClientWorkspace";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function AdminClientWorkspacePage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#14110c]">Client Workspace</h1>
        <p className="text-sm text-[#6b6b6b]">Focused management for individual clients.</p>
      </div>

      <AdminClientWorkspace />
    </div>
  );
}
