import { DEFAULT_FX_CNY_DZD } from "@/lib/constants";

export function cnyToDzd(cny: number, rate: number = DEFAULT_FX_CNY_DZD): number {
  return Math.round(cny * rate * 100) / 100;
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
