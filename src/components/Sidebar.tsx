"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Users,
  FolderKanban,
  CreditCard,
  Settings,
} from "lucide-react";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: { label: string; href: string }[];
};

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

// Which L1 section a given pathname belongs to — used to auto-open
// the section containing the current route on first render.
function findOwningSection(pathname: string): string | null {
  for (const item of navItems) {
    if (item.children?.some((c) => pathname.startsWith(c.href))) {
      return item.label;
    }
  }
  return null;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(["Projects", "My Payments", "Setting"])
  );

  // Auto-expand the section that owns the current route when it changes
  useEffect(() => {
    const owner = findOwningSection(pathname);
    if (owner) {
      setOpenSections((prev) => {
        if (prev.has(owner)) return prev;
        const next = new Set(prev);
        next.add(owner);
        return next;
      });
    }
  }, [pathname]);

  const toggle = (label: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const isHrefActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="w-[220px] shrink-0 flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-gray-100">
        <span className="text-[15px] font-bold tracking-tight text-gray-900">
          KOL<span className="text-brand">Planet</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const isOpen = openSections.has(item.label);

          // ── L1 without children ────────────────────────────────────────
          if (!item.children) {
            const isActive = item.href ? isHrefActive(item.href) : false;
            return (
              <div key={item.label} className="px-2">
                <Link
                  href={item.href || "#"}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-semibold transition-colors",
                    isActive
                      ? "text-brand bg-brand-50"
                      : "text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <span
                    className={cn(isActive ? "text-brand" : "text-gray-500")}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </div>
            );
          }

          // ── L1 with children (section) ─────────────────────────────────
          return (
            <div key={item.label} className="px-2 mb-0.5">
              <button
                onClick={() => toggle(item.label)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-gray-500">{item.icon}</span>
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

              {/* ── L2 items ── */}
              {isOpen && (
                <div className="relative mt-0.5 mb-1.5 ml-[22px] pl-3 border-l border-gray-100">
                  {item.children.map((child) => {
                    const isActive = isHrefActive(child.href);
                    return (
                      <Link
                        key={child.label}
                        href={child.href}
                        className={cn(
                          "relative block py-1.5 pl-2 pr-3 rounded-md text-[12.5px] font-normal transition-colors",
                          isActive
                            ? "text-brand font-medium bg-brand-50"
                            : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-[-13px] top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-brand" />
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
    </aside>
  );
}
