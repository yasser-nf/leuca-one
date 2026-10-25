"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileUp, LogOut, Settings } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/client";

const links = [
  {
    href: "/settings",
    label: "Paramètres & taux CNY→DZD",
    icon: Settings,
  },
  {
    href: "/import",
    label: "Import CSV modèles",
    icon: FileUp,
  },
];

export default function MorePage() {
  const router = useRouter();

  async function logout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur déconnexion");
    }
  }

  return (
    <div>
      <PageHeader title="Plus" subtitle="Leuca Sourcing V1" />
      <ul className="space-y-2">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                className="flex items-center gap-3 rounded-xl border border-border/80 bg-card px-4 py-3 text-sm font-medium transition hover:border-accent/40"
              >
                <Icon className="h-5 w-5 text-accent" />
                {l.label}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl border border-border/80 bg-card px-4 py-3 text-sm font-medium text-destructive"
          >
            <LogOut className="h-5 w-5" />
            Se déconnecter
          </button>
        </li>
      </ul>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        V1 — Catalogue + stock manuel. Commandes & coût de revient en V2.
      </p>
    </div>
  );
}
