"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_FX_CNY_DZD,
  DEFAULT_FX_CNY_USD,
  FX_SETTING_CNY_DZD,
  FX_SETTING_CNY_USD,
} from "@/lib/constants";
import {
  cnyToDzd,
  cnyToUsd,
  formatDzd,
  formatUsd,
  usdPerDzd,
} from "@/lib/currency";

export default function SettingsPage() {
  const [cnyDzd, setCnyDzd] = useState(DEFAULT_FX_CNY_DZD);
  const [cnyUsd, setCnyUsd] = useState(DEFAULT_FX_CNY_USD);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("settings")
          .select("key, value")
          .in("key", [FX_SETTING_CNY_DZD, FX_SETTING_CNY_USD]);
        for (const row of data ?? []) {
          if (row.key === FX_SETTING_CNY_DZD) {
            setCnyDzd(Number(row.value) || DEFAULT_FX_CNY_DZD);
          }
          if (row.key === FX_SETTING_CNY_USD) {
            setCnyUsd(Number(row.value) || DEFAULT_FX_CNY_USD);
          }
        }
      } catch {
        /* ignore — defaults */
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  const derivedDzdUsd = useMemo(
    () => usdPerDzd({ cnyDzd: cnyDzd || DEFAULT_FX_CNY_DZD, cnyUsd: cnyUsd || DEFAULT_FX_CNY_USD }),
    [cnyDzd, cnyUsd]
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!(cnyDzd > 0) || !(cnyUsd > 0)) {
      toast.error("Les deux taux doivent être > 0.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const now = new Date().toISOString();
      const { error } = await supabase.from("settings").upsert([
        {
          key: FX_SETTING_CNY_DZD,
          value: String(cnyDzd),
          updated_at: now,
          updated_by: user?.id ?? null,
        },
        {
          key: FX_SETTING_CNY_USD,
          value: String(cnyUsd),
          updated_at: now,
          updated_by: user?.id ?? null,
        },
      ]);
      if (error) throw error;
      toast.success("Taux de change enregistrés.");
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

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-xl border border-border/80 bg-card p-4"
      >
        <div className="space-y-2">
          <Label htmlFor="cny-dzd">Taux CNY → DZD *</Label>
          <Input
            id="cny-dzd"
            type="number"
            step="0.01"
            min="0.01"
            value={loaded ? cnyDzd : ""}
            onChange={(e) => setCnyDzd(Number(e.target.value))}
            required
          />
          <p className="text-xs text-muted-foreground">
            Ex. 1 CNY ={" "}
            {formatDzd(cnyToDzd(1, cnyDzd || DEFAULT_FX_CNY_DZD))}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cny-usd">Taux CNY → USD *</Label>
          <Input
            id="cny-usd"
            type="number"
            step="0.0001"
            min="0.0001"
            value={loaded ? cnyUsd : ""}
            onChange={(e) => setCnyUsd(Number(e.target.value))}
            required
          />
          <p className="text-xs text-muted-foreground">
            Ex. 1 CNY ={" "}
            {formatUsd(cnyToUsd(1, cnyUsd || DEFAULT_FX_CNY_USD))}
          </p>
        </div>

        <div className="rounded-lg bg-muted/60 px-3 py-2.5 text-sm">
          <p className="font-medium">DZD → USD (calculé)</p>
          <p className="mt-1 text-muted-foreground">
            1 DZD ≈ {formatUsd(derivedDzdUsd)}{" "}
            <span className="text-xs">(USD÷DZD = taux CNY→USD ÷ taux CNY→DZD)</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Les prix d&apos;achat s&apos;affichent en CNY · DZD · USD partout dans
            l&apos;app.
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Enregistrement…" : "Enregistrer les taux"}
        </Button>
      </form>
    </div>
  );
}
