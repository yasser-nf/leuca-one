import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  backHref,
  action,
  className,
}: {
  title: string;
  subtitle?: React.ReactNode;
  backHref?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-4 flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        {backHref ? (
          <Link
            href={backHref}
            className="mb-1 inline-flex items-center gap-0.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour
          </Link>
        ) : null}
        <h1 className="truncate text-xl font-semibold tracking-tight text-leuca-ink">
          {title}
        </h1>
        {subtitle ? (
          <div className="mt-0.5 text-sm text-muted-foreground">{subtitle}</div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
