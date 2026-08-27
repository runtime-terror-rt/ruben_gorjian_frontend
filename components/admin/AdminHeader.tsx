"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useSessionContext } from "@/context/SessionContext";
import { NAV_SECTIONS } from "./AdminSidebar";
import { cn } from "@/lib/utils";
import {
  Menu,
  Bell,
  ExternalLink,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

type AdminHeaderProps = {
  onMenuClick: () => void;
  isCollapsed: boolean;
};

export function AdminHeader({ onMenuClick, isCollapsed }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, refresh } = useSessionContext();
  const [searchQuery, setSearchQuery] = useState("");

  // Derive the current page title from the sidebar nav
  const currentPageTitle = (() => {
    for (const section of NAV_SECTIONS) {
      const match = section.items.find(item =>
        item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
      );
      if (match) return match.label;
    }
    return "Dashboard";
  })();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        await refresh();
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleViewSite = () => {
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement global search functionality
    console.log("Search query:", searchQuery);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-[#d9d4c9] bg-[#ffffff]/95 backdrop-blur px-4 lg:px-6 transition-all duration-300",
        !isCollapsed ? "lg:pl-64" : "lg:pl-20"
      )}
    >
      {/* Left: Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden rounded-lg p-2 text-[#6b6b6b] hover:bg-[#e6e1d8] hover:text-[#14110c]"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop: Logo + Admin Badge (visible when sidebar collapsed) */}
      {/* <div className={cn(
        "hidden lg:flex items-center gap-2 transition-opacity duration-300",
        isCollapsed ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
      )}>
        <div className="h-8 w-8 rounded-lg bg-[#b08d3e] flex items-center justify-center">
          <span className="text-sm font-bold text-[#14110c]">T</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#14110c]">Talexia</span>
          <Badge variant="secondary" className="text-xs">Admin</Badge>
        </div>
      </div> */}

      {/* Center: Dynamic Page Title */}
      <div className="flex-1 flex items-center px-4">
        <h1 className="text-base font-semibold text-[#14110c] tracking-tight">
          {currentPageTitle}
        </h1>
      </div>

      {/* Search Bar — commented out
      <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6b6b]" />
          <input
            type="search"
            placeholder="Search users, posts, subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#d9d4c9] bg-[#e6e1d8]/50 pl-10 pr-4 py-2 text-sm text-[#14110c] placeholder:text-[#6b6b6b] focus:border-[#b08d3e] focus:outline-none focus:ring-2 focus:ring-[#b08d3e]/20"
          />
        </div>
      </form>
      */}

      {/* Right: Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications (placeholder) */}
        {/* <button
          className="hidden sm:flex relative rounded-lg p-2 text-[#6b6b6b] hover:bg-[#e6e1d8] hover:text-[#14110c]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#b08d3e]"></span>
        </button> */}

        {/* View Site Button */}
        <Link
          href="/"
          className="hidden sm:flex items-center gap-2 rounded-lg border border-[#d9d4c9] px-3 py-2 text-sm text-[#14110c] hover:bg-[#e6e1d8] hover:text-[#14110c] transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="hidden lg:inline">View Site</span>
        </Link>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-2 text-[#14110c] hover:bg-[#e6e1d8] hover:text-[#14110c]">
              <div className="h-8 w-8 rounded-full bg-[#b08d3e]/20 border border-[#b08d3e] flex items-center justify-center overflow-hidden">
                {session?.avatarUrl ? (
                  <Image
                    width={32}
                    height={32}
                    src={`${session.avatarUrl}${session.avatarVersion ? `?v=${session.avatarVersion}` : ""}`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-[#b08d3e]" />
                )}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-sm font-medium text-[#14110c]">
                  {session?.name || "Admin"}
                </div>
                <div className="text-xs text-[#6b6b6b]">
                  {session?.email || "admin@talexia.us"}
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-fit min-w-[260px] max-w-[400px] bg-[#ffffff] text-[#6b6b6b] border-[#d9d4c9] shadow-lg rounded-xl">
            <DropdownMenuLabel className="font-normal normal-case tracking-normal px-3 py-2">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-semibold text-[#14110c] whitespace-nowrap">
                  {session?.name || "Admin User"}
                </span>
                <span className="text-xs text-[#6b6b6b] whitespace-nowrap">
                  {session?.email || "admin@talexia.us"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#d9d4c9]" />
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-[#e6e1d8] hover:text-[#14110c] focus:bg-[#e6e1d8] focus:text-[#14110c] px-3 py-2 rounded-lg">
              <Shield className="h-4 w-4" />
              <span>Role: {session?.role || "ADMIN"}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#d9d4c9]" />
            <DropdownMenuItem asChild>
              <Link
                href="/"
                className="flex items-center gap-2 lg:hidden cursor-pointer hover:bg-[#e6e1d8] hover:text-[#14110c] focus:bg-[#e6e1d8] focus:text-[#14110c] px-3 py-2 rounded-lg w-full"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View Site</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 px-3 py-2 rounded-lg mt-1"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
