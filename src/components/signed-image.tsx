"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function SignedImage({
  path,
  bucket = "products",
  alt,
  className,
}: {
  path: string | null | undefined;
  bucket?: "products" | "business-cards";
  alt?: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string>("/placeholder-product.svg");

  useEffect(() => {
    if (!path) {
      setSrc("/placeholder-product.svg");
      return;
    }
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
      setSrc(path);
      return;
    }
    setSrc(`/api/signed-url?path=${encodeURIComponent(path)}&bucket=${bucket}`);
  }, [path, bucket]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt ?? ""} className={cn("object-cover bg-muted", className)} />
  );
}
