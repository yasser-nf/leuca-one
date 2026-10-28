import {
  DEFAULT_FX_CNY_DZD,
  DEFAULT_FX_CNY_USD,
  FX_SETTING_CNY_DZD,
  FX_SETTING_CNY_USD,
} from "@/lib/constants";
import type { FxRates } from "@/lib/currency";
import { createClient } from "@/lib/supabase/server";

function parseRate(value: string | null | undefined, fallback: number): number {
  const n = value ? Number(value) : fallback;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export async function getFxRates(): Promise<FxRates> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", [FX_SETTING_CNY_DZD, FX_SETTING_CNY_USD]);

    const map = new Map((data ?? []).map((r) => [r.key as string, r.value as string]));
    return {
      cnyDzd: parseRate(map.get(FX_SETTING_CNY_DZD), DEFAULT_FX_CNY_DZD),
      cnyUsd: parseRate(map.get(FX_SETTING_CNY_USD), DEFAULT_FX_CNY_USD),
    };
  } catch {
    return { cnyDzd: DEFAULT_FX_CNY_DZD, cnyUsd: DEFAULT_FX_CNY_USD };
  }
}

/** @deprecated Prefer getFxRates(); kept for call-site gradual migration */
export async function getFxRate(): Promise<number> {
  const rates = await getFxRates();
  return rates.cnyDzd;
}
