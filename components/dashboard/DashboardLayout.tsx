"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSessionContext } from "@/context/SessionContext";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "talexia_dashboard_sidebar_collapsed";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, loading: sessionLoading } = useSessionContext();

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = !!session;

  // Handle auth redirect - keep existing logic
  useEffect(() => {
    if (sessionLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [sessionLoading, isAuthenticated, router]);

  // Load sidebar collapsed state from localStorage (defer setState to avoid sync setState in effect)
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    queueMicrotask(() => {
      if (stored !== null) {
        setIsSidebarCollapsed(stored === "true");
      }
      setIsHydrated(true);
    });
  }, []);

  // Save sidebar collapsed state to localStorage
  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue));
      return newValue;
    });
  };

  // Toggle mobile sidebar
  const handleToggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  // Close mobile sidebar on route change (defer setState to avoid sync setState in effect)
  useEffect(() => {
    queueMicrotask(() => setIsMobileSidebarOpen(false));
  }, [pathname]);

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileSidebarOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSidebarOpen]);

  // Show loading state
  if (sessionLoading || !isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-lime-400"></div>
          <p className="text-sm text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting non-authenticated users
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Desktop Sidebar */}
      <DashboardSidebar
        isOpen={true}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        isMobile={false}
      />

      {/* Mobile Sidebar */}
      <DashboardSidebar
        isOpen={isMobileSidebarOpen}
        isCollapsed={false}
        onToggleCollapse={() => {}}
        onClose={() => setIsMobileSidebarOpen(false)}
        isMobile={true}
      />

      {/* Header */}
      <DashboardHeader
        onMenuClick={handleToggleMobileSidebar}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main Content — page scrolls normally (trackpad/mouse wheel) */}
      <main
        className={cn(
          "min-h-[calc(100vh-4rem)] transition-[padding] duration-300",
          !isSidebarCollapsed ? "lg:pl-64" : "lg:pl-20",
        )}
      >
        <div className="p-5 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
