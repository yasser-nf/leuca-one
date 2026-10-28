import {
  cnyToDzd,
  cnyToUsd,
  formatCny,
  formatDzd,
  formatUsd,
  type FxRates,
} from "@/lib/currency";

export function PriceCnyDzd({
  cny,
  rate,
  rates,
  className,
  showUsd = true,
}: {
  cny: number;
  /** Legacy: CNY→DZD only */
  rate?: number;
  rates?: FxRates;
  className?: string;
  showUsd?: boolean;
}) {
  const cnyDzd = rates?.cnyDzd ?? rate ?? 0;
  const cnyUsd = rates?.cnyUsd;

  return (
    <span className={className}>
      <span className="font-medium">{formatCny(cny)}</span>
      {cnyDzd > 0 ? (
        <span className="text-muted-foreground">
          {" "}
          · {formatDzd(cnyToDzd(cny, cnyDzd))}
        </span>
      ) : null}
      {showUsd && cnyUsd != null && cnyUsd > 0 ? (
        <span className="text-muted-foreground">
          {" "}
          · {formatUsd(cnyToUsd(cny, cnyUsd))}
        </span>
      ) : null}
    </span>
  );
}
