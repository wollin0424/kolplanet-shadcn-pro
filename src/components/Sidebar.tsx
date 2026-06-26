"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  CreditCard,
  FolderKanban,
  Settings,
} from "@/lib/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: { label: string; href: string }[];
};

const SIDEBAR_COLLAPSED_KEY = "kolplanet-sidebar-collapsed";

const navItems: NavItem[] = [
  {
    label: "Influencer",
    icon: <Users size={16} strokeWidth={2} />,
    href: "/influencer",
  },
  {
    label: "Projects",
    icon: <FolderKanban size={16} strokeWidth={2} />,
    children: [
      { label: "Plans", href: "/projects/plans" },
      { label: "Outreach", href: "/projects/outreach" },
      { label: "Campaigns", href: "/projects/campaigns" },
    ],
  },
  {
    label: "My Payments",
    icon: <CreditCard size={16} strokeWidth={2} />,
    children: [
      { label: "Client Billing", href: "/payments/client" },
      { label: "Influencer Payments", href: "/payments/influencer" },
    ],
  },
  {
    label: "Setting",
    icon: <Settings size={16} strokeWidth={2} />,
    children: [
      { label: "Set Roles", href: "/setting/roles" },
      { label: "Team", href: "/setting/team" },
      { label: "Organization", href: "/setting/organization" },
      { label: "Contract Settings", href: "/setting/contracts" },
    ],
  },
];

function findOwningSection(pathname: string): string | null {
  for (const item of navItems) {
    if (item.children?.some((c) => pathname.startsWith(c.href))) {
      return item.label;
    }
  }
  return null;
}

function isHrefActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function isItemActive(item: NavItem, pathname: string) {
  if (item.href) return isHrefActive(pathname, item.href);
  return item.children?.some((c) => isHrefActive(pathname, c.href)) ?? false;
}

function NavIconButton({
  active,
  children,
  className,
}: {
  active: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md transition-colors",
        active ? "text-brand bg-brand-50" : "text-gray-500",
        className
      )}
    >
      {children}
    </span>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(["Projects", "My Payments", "Setting"])
  );

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored !== "true") return;
    queueMicrotask(() => setCollapsed(true));
  }, []);

  useEffect(() => {
    const owner = findOwningSection(pathname);
    if (!owner) return;
    queueMicrotask(() => {
      setOpenSections((prev) => {
        if (prev.has(owner)) return prev;
        const next = new Set(prev);
        next.add(owner);
        return next;
      });
    });
  }, [pathname]);

  const toggleSection = (label: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  };

  return (
    <TooltipProvider delay={0}>
      <aside
        className={cn(
          "flex h-full shrink-0 flex-col border-r border-gray-100 bg-white transition-[width] duration-200",
          collapsed ? "w-14" : "w-[220px]"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-14 items-center border-b border-gray-100",
            collapsed ? "justify-center px-0" : "px-5"
          )}
        >
          {collapsed ? (
            <span className="text-[15px] font-bold text-brand">K</span>
          ) : (
            <span className="text-[15px] font-bold tracking-tight text-gray-900">
              KOL<span className="text-brand">Planet</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {navItems.map((item) => {
            const active = isItemActive(item, pathname);

            // ── L1 without children ──────────────────────────────────────
            if (!item.children) {
              const link = (
                <Link
                  href={item.href || "#"}
                  className={cn(
                    "flex items-center rounded-md text-[13px] font-semibold transition-colors",
                    collapsed ? "justify-center px-0 py-1.5" : "gap-2.5 px-3 py-2",
                    active
                      ? "text-brand bg-brand-50"
                      : "text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <span
                    className={cn(
                      collapsed && "flex size-8 items-center justify-center rounded-md",
                      active ? "text-brand" : "text-gray-500"
                    )}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && item.label}
                </Link>
              );

              return (
                <div key={item.label} className={cn(collapsed ? "px-1.5" : "px-2")}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger render={link} />
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    link
                  )}
                </div>
              );
            }

            // ── Collapsed: L1 with flyout submenu ──────────────────────────
            if (collapsed) {
              return (
                <div key={item.label} className="px-1.5">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-center rounded-md py-1.5 transition-colors",
                        active ? "bg-brand-50" : "hover:bg-gray-50"
                      )}
                    >
                      <NavIconButton active={active}>{item.icon}</NavIconButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" sideOffset={8} className="min-w-[180px]">
                      {item.children.map((child) => {
                        const childActive = isHrefActive(pathname, child.href);
                        return (
                          <DropdownMenuItem
                            key={child.label}
                            className={cn(
                              "cursor-pointer text-[13px]",
                              childActive && "text-brand font-medium"
                            )}
                            onSelect={() => router.push(child.href)}
                          >
                            {child.label}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            }

            // ── Expanded: L1 with accordion children ─────────────────────
            const isOpen = openSections.has(item.label);

            return (
              <div key={item.label} className="mb-0.5 px-2">
                <button
                  type="button"
                  onClick={() => toggleSection(item.label)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-[13px] font-semibold text-gray-900 transition-colors hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2.5">
                    <span className={cn(active ? "text-brand" : "text-gray-500")}>
                      {item.icon}
                    </span>
                    {item.label}
                  </span>
                  <ChevronDown
                    size={13}
                    strokeWidth={2.2}
                    className={cn(
                      "text-gray-400 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="relative mb-1.5 mt-0.5 ml-[22px] border-l border-gray-100 pl-3">
                    {item.children.map((child) => {
                      const childActive = isHrefActive(pathname, child.href);
                      return (
                        <Link
                          key={child.label}
                          href={child.href}
                          className={cn(
                            "relative block rounded-md py-1.5 pl-2 pr-3 text-[12.5px] font-normal transition-colors",
                            childActive
                              ? "bg-brand-50 font-medium text-brand"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                          )}
                        >
                          {childActive && (
                            <span className="absolute left-[-13px] top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-brand" />
                          )}
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className={cn("border-t border-gray-100 p-2", collapsed && "flex justify-center")}>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex items-center rounded-md text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800",
              collapsed ? "size-8 justify-center" : "w-full gap-2 px-3 py-2 text-[12px] font-medium"
            )}
          >
            {collapsed ? (
              <ChevronRight size={16} strokeWidth={2} />
            ) : (
              <>
                <ChevronLeft size={16} strokeWidth={2} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
