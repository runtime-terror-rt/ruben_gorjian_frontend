"use client";

import AdminClientWorkspace from "@/components/admin/AdminClientWorkspace";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function AdminClientWorkspacePage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Client <span className="text-lime-400">Workspace</span>
        </h1>
        <p className="text-slate-400 mt-1 font-medium">
          Focused management for individual clients.
        </p>
      </div>

      <AdminClientWorkspace />
    </div>
  );
}
