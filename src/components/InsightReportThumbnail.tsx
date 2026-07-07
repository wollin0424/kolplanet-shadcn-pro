"use client";

import { cn } from "@/lib/utils";

export function InsightReportThumbnail({
  src,
  alt,
  className,
  imageClassName,
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[3/4] w-full overflow-hidden bg-gray-100",
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        className={cn("size-full object-cover object-top", imageClassName)}
      />
    </div>
  );
}
