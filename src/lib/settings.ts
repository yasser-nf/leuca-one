import { DEFAULT_FX_CNY_DZD } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export async function getFxRate(): Promise<number> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "exchange_rate_cny_dzd")
      .maybeSingle();
    const rate = data?.value ? Number(data.value) : DEFAULT_FX_CNY_DZD;
    return Number.isFinite(rate) && rate > 0 ? rate : DEFAULT_FX_CNY_DZD;
  } catch {
    return DEFAULT_FX_CNY_DZD;
  }
}
