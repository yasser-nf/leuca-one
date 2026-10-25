import { cnyToDzd, formatCny, formatDzd } from "@/lib/currency";

export function PriceCnyDzd({
  cny,
  rate,
  className,
}: {
  cny: number;
  rate: number;
  className?: string;
}) {
  return (
    <span className={className}>
      <span className="font-medium">{formatCny(cny)}</span>
      <span className="text-muted-foreground"> · {formatDzd(cnyToDzd(cny, rate))}</span>
    </span>
  );
}
