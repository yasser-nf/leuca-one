import { DEFAULT_FX_CNY_DZD, DEFAULT_FX_CNY_USD } from "@/lib/constants";

export type FxRates = {
  cnyDzd: number;
  cnyUsd: number;
};

export function cnyToDzd(cny: number, rate: number = DEFAULT_FX_CNY_DZD): number {
  return Math.round(cny * rate * 100) / 100;
}

export function cnyToUsd(cny: number, rate: number = DEFAULT_FX_CNY_USD): number {
  return Math.round(cny * rate * 100) / 100;
}

/** Derived: 1 DZD in USD = (CNY→USD) / (CNY→DZD) */
export function dzdToUsd(
  dzd: number,
  rates: Pick<FxRates, "cnyDzd" | "cnyUsd">
): number {
  if (!(rates.cnyDzd > 0)) return 0;
  const rate = rates.cnyUsd / rates.cnyDzd;
  return Math.round(dzd * rate * 100) / 100;
}

export function usdPerDzd(rates: Pick<FxRates, "cnyDzd" | "cnyUsd">): number {
  if (!(rates.cnyDzd > 0)) return 0;
  return rates.cnyUsd / rates.cnyDzd;
}

export function formatCny(value: number): string {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDzd(value: number): string {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}
