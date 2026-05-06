"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";
import { usePreventScroll } from "@/hooks/usePreventScroll";
import { useSessionContext } from "@/context/SessionContext";
import Image from "next/image";
import logo from "@/components/assets/talexia_ai_logo.png";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Case Studies", href: "/execution-case-studies" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
  
];

function NavbarInner() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { session, loading } = useSessionContext();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthed = Boolean(session);
  const isAdmin = session?.role === "ADMIN" || session?.role === "SUPER_ADMIN";
  const hasActiveSubscription =
    session?.subscription?.status === "ACTIVE" ||
    session?.subscription?.status === "TRIALING";

  const dashboardHref = isAdmin
    ? "/admin"
    : hasActiveSubscription
    ? "/dashboard"
    : "/pricing";

  const dashboardLabel = isAdmin
    ? "Admin Panel"
    : hasActiveSubscription
    ? "Dashboard"
    : "Select a Plan";

  usePreventScroll(open);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    window.location.href = "/";
  };

  const getLoginUrl = () => {
    if (
      isAuthed ||
      pathname?.startsWith("/login") ||
      pathname?.startsWith("/signup")
    ) {
      return "/login";
    }
    const fullPath =
      pathname +
      (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    return `/login?returnTo=${encodeURIComponent(fullPath)}`;
  };

  // User initials for avatar
  const userInitials = session?.name
    ? session.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : session?.email
    ? session.email[0].toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-40 border-b border-[#e4e5ea] bg-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-[0.22em] text-[#1c2231]"
        >
          <Image
            src={logo}
            alt="Talexia"
            width={40}
            height={40}
          />
          TALEXIA
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-[#4c4f5e] md:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href) &&
                  (item.href.length > 1 || pathname === "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative py-1 transition-all duration-200 hover:text-[#1c2231]",
                  isActive ? "text-[#1c2231] font-bold" : "text-[#4c4f5e]"
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-0 h-[2px] w-full rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-9 w-28 animate-pulse rounded-full bg-gray-100" />
          ) : isAuthed ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-[#e4e5ea] bg-white px-3 py-1.5 text-sm font-medium text-[#1c2231] shadow-sm hover:bg-gray-50 transition-all"
              >
                {/* Avatar */}
                {session?.avatarUrl ? (
                  <img src={session.avatarUrl} alt="Avatar" className="h-7 w-7 rounded-full object-cover border border-[#e4e5ea]" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-black text-white">
                    {userInitials}
                  </span>
                )}
                <span className="max-w-[120px] truncate text-xs font-semibold text-[#1c2231]">
                  {session?.name || session?.email?.split("@")[0] || "Account"}
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 text-[#6c7080] transition-transform duration-200", userMenuOpen && "rotate-180")} />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[#e4e5ea] bg-white shadow-xl shadow-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-[#f0f1f5]">
                    <p className="text-xs font-bold text-[#1c2231] truncate">{session?.name || "User"}</p>
                    <p className="text-[11px] text-[#6c7080] truncate">{session?.email}</p>
                    {!hasActiveSubscription && !isAdmin && (
                      <span className="mt-1.5 inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                        No active plan
                      </span>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="p-1.5">
                    <Link
                      href={dashboardHref}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#363a49] hover:bg-[#f5f6fa] transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 text-accent" />
                      {dashboardLabel}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href={getLoginUrl()}
                className="text-sm font-medium text-[#4c4f5e] cursor-pointer hover:text-[#1c2231] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/pricing"
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 cursor-pointer"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-[#1f2333] md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-[#e4e5ea] bg-[#f4f3ee] md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-4">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href) &&
                    (item.href.length > 1 || pathname === "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center justify-between",
                    isActive
                      ? "bg-white text-accent font-bold shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#e4e5ea]"
                      : "text-[#363a49] hover:bg-white/50"
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                  {isActive && <div className="h-1.5 w-1.5 rounded-full bg-accent" />}
                </Link>
              );
            })}

            {isAuthed ? (
              <>
                {/* User info in mobile */}
                <div className="mt-2 rounded-2xl border border-[#e4e5ea] bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    {session?.avatarUrl ? (
                      <img src={session.avatarUrl} alt="Avatar" className="h-9 w-9 shrink-0 rounded-full object-cover border border-[#e4e5ea]" />
                    ) : (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-black text-white">
                        {userInitials}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#1c2231]">{session?.name || "User"}</p>
                      <p className="truncate text-[11px] text-[#6c7080]">{session?.email}</p>
                    </div>
                  </div>
                  {!hasActiveSubscription && !isAdmin && (
                    <span className="mt-2 inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                      No active plan
                    </span>
                  )}
                </div>
                <Link
                  href={dashboardHref}
                  className={cn(
                    "mt-2 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-center text-sm font-semibold cursor-pointer transition-all",
                    hasActiveSubscription || isAdmin
                      ? "border border-[#d4d8e5] bg-white text-[#1e2333]"
                      : "bg-accent text-white"
                  )}
                  onClick={() => setOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {dashboardLabel}
                </Link>
                <button
                  onClick={() => { setOpen(false); handleLogout(); }}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-500 cursor-pointer transition-all hover:bg-red-100"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href={getLoginUrl()}
                  className="mt-2 rounded-full border border-[#d4d8e5] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[#1e2333] cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/pricing"
                  className="mt-2 rounded-full bg-accent px-4 py-2.5 text-center text-sm font-semibold text-white cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-40 border-b border-[#e4e5ea] bg-white backdrop-blur">
          <div className="mx-auto h-[73px] max-w-6xl px-4" />
        </header>
      }
    >
      <NavbarInner />
    </Suspense>
  );
}
