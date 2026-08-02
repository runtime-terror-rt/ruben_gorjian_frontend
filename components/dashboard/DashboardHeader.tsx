"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useSessionContext } from "@/context/SessionContext";
import { NAV_SECTIONS } from "./DashboardSidebar";
import { cn } from "@/lib/utils";
import {
  Menu,
  LogOut,
  User,
  CreditCard,
  Settings,
  Crown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

type DashboardHeaderProps = {
  onMenuClick: () => void;
  isCollapsed: boolean;
};

export function DashboardHeader({
  onMenuClick,
  isCollapsed,
}: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, refresh } = useSessionContext();

  // Derive the current page title from the sidebar nav
  const currentPageTitle = (() => {
    for (const section of NAV_SECTIONS) {
      const match = section.items.find(item =>
        item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href)
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

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-[#d9d4c9] bg-[#ffffff]/95 backdrop-blur px-4 lg:px-6 transition-all duration-300",
        !isCollapsed ? "lg:pl-64" : "lg:pl-20",
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

      {/* Desktop: Logo — commented out to match admin header design
      <div
        className={cn(
          "hidden lg:flex items-center gap-2 transition-opacity duration-300",
          isCollapsed ? "opacity-100" : "opacity-0 w-0 overflow-hidden",
        )}
      >
        <div className="h-8 w-8 rounded-lg bg-[#b08d3e] flex items-center justify-center">
          <span className="text-sm font-bold text-[#14110c]">T</span>
        </div>
        <span className="text-sm font-semibold text-[#14110c]">Talexia</span>
      </div>
      */}

      {/* Center: Dynamic Page Title */}
      <div className="flex-1 flex items-center px-4">
        <h1 className="text-base font-semibold text-[#14110c] tracking-tight">
          {currentPageTitle}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Create Button */}
        {/* <Button
          onClick={handleCreateNew}
          size="sm"
          className="hidden sm:flex items-center gap-2 bg-[#b08d3e] text-[#14110c] hover:bg-[#e6e1d8]"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden lg:inline">New Campaign</span>
          <span className="lg:hidden">New</span>
        </Button> */}

        {/* Notifications — commented out
        <button
          className="relative rounded-lg p-2 text-[#6b6b6b] hover:bg-[#e6e1d8] hover:text-[#14110c]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#b08d3e]"></span>
        </button>
        */}

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
                <div className="text-sm font-medium text-[#14110c] flex items-center gap-1">
                  {session?.name || "User"}
                  {session?.isFounder && (
                    <Crown className="h-3 w-3 text-[#b08d3e]" />
                  )}
                </div>
                <div className="text-xs text-[#6b6b6b]">
                  {session?.email || "user@example.com"}
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-fit min-w-[260px] max-w-[400px] bg-[#ffffff] text-[#6b6b6b] border-[#d9d4c9] shadow-lg rounded-xl"
          >
            <DropdownMenuLabel className="font-normal normal-case tracking-normal">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-semibold text-[#14110c] flex items-center gap-1 whitespace-nowrap">
                  {session?.name || "User"}
                  {session?.isFounder && (
                    <Crown className="h-3 w-3 text-[#b08d3e] shrink-0" />
                  )}
                </span>
                <span className="text-xs text-[#6b6b6b] whitespace-nowrap">
                  {session?.email || "user@example.com"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer w-full">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/billing" className="flex items-center gap-2 cursor-pointer w-full">
                <CreditCard className="h-4 w-4" />
                <span>Billing</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer w-full">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
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
