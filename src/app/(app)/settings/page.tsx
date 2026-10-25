"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_FX_CNY_DZD } from "@/lib/constants";
import { cnyToDzd, formatDzd } from "@/lib/currency";

export default function SettingsPage() {
  const [rate, setRate] = useState(DEFAULT_FX_CNY_DZD);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "exchange_rate_cny_dzd")
          .maybeSingle();
        if (data?.value) setRate(Number(data.value) || DEFAULT_FX_CNY_DZD);
      } catch {
        /* ignore */
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!(rate > 0)) {
      toast.error("Taux doit être > 0.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase.from("settings").upsert({
        key: "exchange_rate_cny_dzd",
        value: String(rate),
        updated_at: new Date().toISOString(),
        updated_by: user?.id ?? null,
      });
      if (error) throw error;
      toast.success("Taux CNY→DZD enregistré.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Paramètres"
        subtitle="Taux de change"
        backHref="/more"
      />

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border/80 bg-card p-4">
        <div className="space-y-2">
          <Label htmlFor="rate">Taux CNY → DZD *</Label>
          <Input
            id="rate"
            type="number"
            step="0.01"
            min="0.01"
            value={loaded ? rate : ""}
            onChange={(e) => setRate(Number(e.target.value))}
            required
          />
          <p className="text-xs text-muted-foreground">
            Exemple : 1 CNY = {formatDzd(cnyToDzd(1, rate || DEFAULT_FX_CNY_DZD))} ·
            affiché à côté de chaque prix CNY. USD est un champ optionnel
            (affichage seul) — pas de taux USD en V1.
          </p>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </div>
  );
}
