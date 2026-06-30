"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, Share2 } from "@/lib/icons";

export function H5PageShell({
  backHref,
  pageTitle,
  pageIntro,
  children,
}: {
  backHref?: string;
  pageTitle?: string;
  pageIntro?: string;
  children: ReactNode;
}) {
  const brand = (
    <img src="/kolplanet-logo.png" alt="KOLPlanet" className="h-6 w-auto shrink-0" />
  );

  return (
    <div className="flex flex-col bg-[#f4f6f9]">
      <header className="sticky top-0 z-20 shrink-0 border-b border-gray-100 bg-white px-4 py-3">
        {backHref && pageTitle ? (
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={backHref}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900"
                aria-label="Back to Hub"
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </Link>
              <h1 className="min-w-0 flex-1 text-left text-[17px] font-bold leading-snug text-gray-950">
                {pageTitle}
              </h1>
            </div>
            {pageIntro ? (
              <div className="mt-1 grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-2">
                <div aria-hidden className="col-start-1" />
                <p className="col-start-2 text-[13px] leading-snug text-gray-600">{pageIntro}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {backHref ? (
                <Link href={backHref} className="flex min-w-0 items-center gap-2">
                  {brand}
                </Link>
              ) : (
                <div className="flex min-w-0 items-center gap-2">{brand}</div>
              )}
            </div>
            <button
              type="button"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-800"
              aria-label="Share"
            >
              <Share2 size={16} strokeWidth={2} />
            </button>
          </div>
        )}
      </header>

      <main className="space-y-5 px-4 py-5 pb-8">{children}</main>
    </div>
  );
}
