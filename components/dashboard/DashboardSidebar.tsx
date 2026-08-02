"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { isOnHighestPlan } from "@/lib/pricing-catalog";
import { useSessionContext } from "@/context/SessionContext";
import {
  LayoutDashboard,
  CalendarClock,
  Calendar,
  Share2,
  FileText,
  Image as ImageIcon,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Zap,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
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
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      // {
      //   label: "Schedule On Calendly",
      //   href: "https://calendly.com/talexia",
      //   icon: CalendarClock,
      // },
    ],
  },
  {
    title: "Content",
    items: [
      {
        label: "Calendar",
        href: "/dashboard/calendar",
        icon: Calendar,
      },
      {
        label: "Media Library",
        href: "/dashboard/media",
        icon: ImageIcon,
      },
      // {
      //   label: "Submissions",
      //   href: "/dashboard/submissions",
      //   icon: FileText,
      // },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        label: "Platforms",
        href: "/dashboard/social",
        icon: Share2,
      },
      {
        label: "Billing",
        href: "/dashboard/billing",
        icon: CreditCard,
      },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

type DashboardSidebarProps = {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose?: () => void;
  isMobile?: boolean;
};

export function DashboardSidebar({
  isOpen,
  isCollapsed,
  onToggleCollapse,
  onClose,
  isMobile = false,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useSessionContext();
  const showUpgradePlan = !isOnHighestPlan(session?.subscription?.planCode);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleNavClick = (href: string) => {
    if (href.startsWith("http")) {
      window.open(href, "CalendlyPopup", "width=800,height=700,scrollbars=yes");
      if (isMobile && onClose) {
        onClose();
      }
      return;
    }
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
            "fixed left-0 top-0 z-50 h-full w-64 transform bg-[#ffffff] border-r border-[#d9d4c9] transition-transform duration-300 ease-in-out lg:hidden flex flex-col min-h-0",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-full flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#d9d4c9] p-4 flex-shrink-0">
              <Link
                href="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="h-8 w-8 rounded-lg bg-[#b08d3e] flex items-center justify-center">
                  <span className="text-sm font-bold text-[#14110c]">T</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#14110c]">
                    Talexia
                  </div>
                  <div className="text-xs text-[#6b6b6b]">Dashboard</div>
                </div>
              </Link>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-[#6b6b6b] hover:bg-[#e6e1d8] hover:text-[#14110c]"
                aria-label="Close sidebar"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation — min-h-0 so flex item can shrink and scroll */}
            <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 space-y-6">
              {NAV_SECTIONS.map((section, idx) => (
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
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={(e) => {
                            if (item.href.startsWith("http")) {
                              e.preventDefault();
                              window.open(item.href, "CalendlyPopup", "width=800,height=700,scrollbars=yes");
                            }
                            if (isMobile && onClose) {
                              onClose();
                            }
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            active
                              ? "bg-[#b08d3e]/10 text-[#8a6d28]"
                              : "text-[#14110c] hover:bg-[#e6e1d8] hover:text-[#14110c]",
                          )}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span className="rounded-full bg-[#b08d3e] px-2 py-0.5 text-xs font-semibold text-[#14110c]">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div className="border-t border-[#d9d4c9] p-4 space-y-2 flex-shrink-0">
              <Link
                href="/faq"
                onClick={() => {
                  if (isMobile && onClose) onClose();
                }}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#6b6b6b] hover:bg-[#e6e1d8] hover:text-[#14110c]"
              >
                <HelpCircle className="h-4 w-4" />
                <span>Help & Support</span>
              </Link>
              {showUpgradePlan && (
                <Link
                  href="/dashboard/billing"
                  onClick={() => {
                    if (isMobile && onClose) onClose();
                  }}
                  className="w-full flex items-center gap-2 rounded-lg bg-[#b08d3e]/10 border border-[#b08d3e]/20 px-3 py-2 text-sm text-[#8a6d28] hover:bg-[#b08d3e]/20"
                >
                  <Zap className="h-4 w-4" />
                  <span>Upgrade Plan</span>
                </Link>
              )}
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
        "hidden lg:flex fixed left-0 top-0 z-30 h-full min-h-0 flex-col border-r border-[#d9d4c9] bg-[#ffffff] transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#d9d4c9] p-4 h-16 flex-shrink-0">
        {!isCollapsed ? (
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-lg bg-[#b08d3e] flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-[#14110c]">T</span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#14110c] truncate">
                Talexia
              </div>
              <div className="text-xs text-[#6b6b6b] truncate">Dashboard</div>
            </div>
          </Link>
        ) : (
          <Link
            href="/"
            className="mx-auto h-8 w-8 rounded-lg bg-[#b08d3e] flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <span className="text-sm font-bold text-[#14110c]">T</span>
          </Link>
        )}
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="rounded-lg p-2 text-[#6b6b6b] hover:bg-[#e6e1d8] hover:text-[#14110c]"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Collapsed Expand Button */}
      {isCollapsed && (
        <div className="border-b border-[#d9d4c9] p-2">
          <button
            onClick={onToggleCollapse}
            className="w-full rounded-lg p-2 text-[#6b6b6b] hover:bg-[#e6e1d8] hover:text-[#14110c]"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-5 w-5 mx-auto" />
          </button>
        </div>
      )}

      {/* Navigation — min-h-0 so flex item can shrink and scroll */}
      <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 space-y-6">
        {NAV_SECTIONS.map((section, idx) => (
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
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      if (item.href.startsWith("http")) {
                        e.preventDefault();
                        window.open(item.href, "CalendlyPopup", "width=800,height=700,scrollbars=yes");
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-[#b08d3e]/10 text-[#8a6d28]"
                        : "text-[#14110c] hover:bg-[#e6e1d8] hover:text-[#14110c]",
                      isCollapsed && "justify-center",
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="rounded-full bg-[#b08d3e] px-2 py-0.5 text-xs font-semibold text-[#14110c]">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t border-[#d9d4c9] p-4 space-y-2 flex-shrink-0">
          <Link
            href="/faq"
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#6b6b6b] hover:bg-[#e6e1d8] hover:text-[#14110c]"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Help & Support</span>
          </Link>
          {showUpgradePlan && (
            <Link
              href="/dashboard/billing"
              className="w-full flex items-center gap-2 rounded-lg bg-[#b08d3e]/10 border border-[#b08d3e]/20 px-3 py-2 text-sm text-[#8a6d28] hover:bg-[#b08d3e]/20"
            >
              <Zap className="h-4 w-4" />
              <span>Upgrade Plan</span>
            </Link>
          )}
        </div>
      )}

      {/* Collapsed Footer Icons */}
      {isCollapsed && (
        <div className="border-t border-[#d9d4c9] p-2 space-y-2">
          <Link
            href="/faq"
            className="block w-full rounded-lg p-2 text-[#6b6b6b] hover:bg-[#e6e1d8] hover:text-[#14110c] text-center"
            title="Help & Support"
          >
            <HelpCircle className="h-5 w-5 mx-auto" />
          </Link>
          {showUpgradePlan && (
            <Link
              href="/dashboard/billing"
              className="block w-full rounded-lg p-2 text-[#8a6d28] hover:bg-[#b08d3e]/20 text-center"
              title="Upgrade Plan"
            >
              <Zap className="h-5 w-5 mx-auto" />
            </Link>
          )}
        </div>
      )}
    </aside>
  );
}
