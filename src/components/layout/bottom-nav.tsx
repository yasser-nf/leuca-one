"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  LayoutDashboard,
  MoreHorizontal,
  Package,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Tableau", icon: LayoutDashboard, match: (p: string) => p === "/" },
  {
    href: "/products",
    label: "Modèles",
    icon: Package,
    match: (p: string) => p.startsWith("/products"),
  },
  {
    href: "/suppliers",
    label: "Fournisseurs",
    icon: Users,
    match: (p: string) => p.startsWith("/suppliers"),
  },
  {
    href: "/stock",
    label: "Stock",
    icon: Boxes,
    match: (p: string) => p.startsWith("/stock"),
  },
  {
    href: "/more",
    label: "Plus",
    icon: MoreHorizontal,
    match: (p: string) =>
      p.startsWith("/more") ||
      p.startsWith("/settings") ||
      p.startsWith("/import"),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1 pt-1">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-1 py-2 text-[11px] font-medium transition-colors",
                  active ? "text-accent" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.25]")} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
