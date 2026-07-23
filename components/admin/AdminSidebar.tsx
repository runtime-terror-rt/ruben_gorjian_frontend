"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  LayoutDashboard,
  CreditCard,
  FileText,
  Image as ImageIcon,
  Settings,
  Calendar,
  ChevronLeft,

  ChevronRight,
  ExternalLink,
  BookOpen,
  Tag,
  ShieldCheck,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { useSessionContext } from "@/context/SessionContext";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  permission?: string;
};

type NavSection = {
  title?: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      {
        label: "Overview",
        href: "/admin",
        icon: LayoutDashboard,
        permission: "OVERVIEW",
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Client Workspace",
        href: "/admin/client-workspace",
        icon: Users,
        permission: "POST_MANAGE",
      },
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
        permission: "USER_MANAGE",
      },
      {
        label: "Subscriptions",
        href: "/admin/subscriptions",
        icon: CreditCard,
        permission: "SUBSCRIPTION_MANAGE",
      },
      {
        label: "Custom Plans",
        href: "/admin/enterprise-plan",
        icon: ShieldCheck,
      },
      {
        label: "Coupons",
        href: "/admin/coupons",
        icon: Tag,
        permission: "COUPON_MANAGE",
      },
      {
        label: "Admins",
        href: "/admin/virtual-admins",
        icon: ShieldCheck,
        permission: "VIRTUAL_ADMIN_MANAGE",
      },
      {
        label: "Posts",
        href: "/admin/posts",
        icon: FileText,
        permission: "POST_MANAGE",
      },
      {
        label: "Scheduler Failures",
        href: "/admin/scheduler-failures",
        icon: AlertCircle,
        permission: "SCHEDULE_MANAGE",
      },
      {
        label: "Session Schedule",
        href: "/admin/session-schedule",
        icon: Calendar,
        permission: "SCHEDULE_MANAGE",
      },
      // {
      //   label: "Media",
      //   href: "/admin/media",
      //   icon: ImageIcon,
      //   permission: "POST_MANAGE",
      // },


      // {
      //   label: "Submissions",
      //   href: "/admin/submissions",
      //   icon: FileText,
      //   permission: "SUBMISSIONS",
      // },
      {
        label: "Support System",
        href: "/admin/support-system",
        icon: MessageSquare,
        permission: "SUPPORT",
      },
      {
        label: "FAQ",
        href: "/admin/faq",
        icon: BookOpen,
        permission: "FAQ",
      },
      {
        label: "Case Studies",
        href: "/admin/case-studies",
        icon: BookOpen,
        permission: "CASE_STUDIES",
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        permission: "PROFILE",
      },
    ],
  },
];

type AdminSidebarProps = {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose?: () => void;
  isMobile?: boolean;
};

export function AdminSidebar({
  isOpen,
  isCollapsed,
  onToggleCollapse,
  onClose,
  isMobile = false,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, loading: sessionLoading } = useSessionContext();

  const userPermissions: string[] = session?.permissions ?? [];
  const isSuperAdmin = session?.role === "SUPER_ADMIN";

  const hasPermission = (permission?: string): boolean => {
    if (!permission) return true;
    // If the user has specific permissions assigned, strictly use them
    if (userPermissions && userPermissions.length > 0) {
      return userPermissions.includes(permission);
    }
    // Fallback: Super Admins get full access only if they don't have restricted permissions
    if (isSuperAdmin) return true;
    return false;
  };

  // Only show nav items the current user has permission for.
  // We avoid rendering the nav items until the session is fully loaded
  // to prevent flickering or showing unauthorized menu items.
  const filteredSections = sessionLoading || !session
    ? []
    : NAV_SECTIONS.map(section => ({
      ...section,
      items: section.items.filter(item => hasPermission(item.permission)),
    })).filter(section => section.items.length > 0);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const handleNavClick = (href: string) => {
    router.push(href);
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}

        {/* Mobile Drawer */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 h-full w-64 transform bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:hidden flex flex-col min-h-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-4 flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
                <div className="h-8 w-8 rounded-lg bg-lime-400 flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-900">T</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Talexia</div>
                  <div className="text-xs text-slate-400">Admin Panel</div>
                </div>
              </Link>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Close sidebar"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation — min-h-0 so flex item can shrink and scroll */}
            <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 space-y-6">
              {filteredSections.map((section, idx) => (
                <div key={idx}>
                  {section.title && (
                    <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {section.title}
                    </div>
                  )}
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <button
                          key={item.href}
                          onClick={() => handleNavClick(item.href)}
                          className={cn(
                            "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            active
                              ? "bg-lime-400/10 text-lime-300"
                              : "text-slate-300 hover:bg-slate-800 hover:text-white"
                          )}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span className="rounded-full bg-lime-400 px-2 py-0.5 text-xs font-semibold text-slate-900">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div className="border-t border-slate-800 p-4 flex-shrink-0">
              {/* <a
                href="https://www.talexia.us/execution-case-studies"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <BookOpen className="h-4 w-4" />
                <span>Documentation</span>
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a> */}
              {/* Role badge */}
              {/* <div className={`mt-2 mx-1 flex items-center gap-2 px-3 py-2 rounded-xl ${
                isSuperAdmin
                  ? "bg-amber-400/10 border border-amber-400/20"
                  : "bg-slate-800/60 border border-slate-700/50"
              }`}>
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                  isSuperAdmin ? "bg-amber-400" : "bg-lime-400"
                }`} />
                <div className="min-w-0">
                  <p className={`text-[10px] font-black uppercase tracking-widest truncate ${
                    isSuperAdmin ? "text-amber-300" : "text-lime-300"
                  }`}>
                    {isSuperAdmin ? "Super Admin" : "Admin"}
                  </p>
                  <p className="text-[9px] text-slate-500 font-semibold">
                    {isSuperAdmin ? "Full Access" : `${userPermissions.length} permissions`}
                  </p>
                </div>
              </div>
              <div className="mt-2 px-3 text-xs text-slate-500">
                Version 1.0.0
              </div> */}
            </div>
          </div>
        </aside>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <aside
      className={cn(
        "hidden lg:flex fixed left-0 top-0 z-30 h-full min-h-0 flex-col border-r border-slate-800 bg-slate-900 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 p-4 h-16 flex-shrink-0">
        {!isCollapsed ? (
          <Link href="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-lime-400 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-slate-900">T</span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">Talexia</div>
              <div className="text-xs text-slate-400 truncate">Admin Panel</div>
            </div>
          </Link>
        ) : (
          <Link href="/" className="mx-auto h-8 w-8 rounded-lg bg-lime-400 flex items-center justify-center hover:opacity-80 transition-opacity">
            <span className="text-sm font-bold text-slate-900">T</span>
          </Link>
        )}
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Collapsed Expand Button */}
      {isCollapsed && (
        <div className="border-b border-slate-800 p-2">
          <button
            onClick={onToggleCollapse}
            className="w-full rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-5 w-5 mx-auto" />
          </button>
        </div>
      )}

      {/* Navigation — min-h-0 so flex item can shrink and scroll */}
      <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 space-y-6">
        {filteredSections.map((section, idx) => (
          <div key={idx}>
            {section.title && !isCollapsed && (
              <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-lime-400/10 text-lime-300"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white",
                      isCollapsed && "justify-center"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="rounded-full bg-lime-400 px-2 py-0.5 text-xs font-semibold text-slate-900">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t border-slate-800 pt-10 p-4 flex-shrink-0">
          {/* <a
            href="https://www.talexia.us/execution-case-studies"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <BookOpen className="h-4 w-4" />
            <span>Documentation</span>
            <ExternalLink className="h-3 w-3 ml-auto" />
          </a>
          <div className="mt-2 px-3 text-xs text-slate-500">
            Version 1.0.0
          </div> */}
        </div>
      )}
    </aside>
  );
}
