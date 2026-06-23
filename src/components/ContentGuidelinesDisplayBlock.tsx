"use client";

import { useState, type ReactNode } from "react";
import type { ScriptBriefH5Data } from "@/lib/scriptBriefH5Mock";
import { cn } from "@/lib/utils";
import { ExternalLink, FileText, Link as LinkIcon, Tag } from "@/lib/icons";

const GUIDELINES_TAB_CLASS =
  "inline-flex h-10 shrink-0 items-center border-b-2 px-2.5 text-[13px] font-medium leading-none transition-colors";

function guidelinesTabClass(active: boolean) {
  return cn(
    GUIDELINES_TAB_CLASS,
    active
      ? "border-brand text-gray-900"
      : "border-transparent text-gray-500 hover:text-gray-800"
  );
}

function GuidelineDetailCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof LinkIcon;
  label: string;
  value: string;
}) {
  const display = value.trim() || "—";

  return (
    <div className="min-w-0 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600">
        <Icon size={14} strokeWidth={2} className="shrink-0 text-gray-500" />
        {label}
      </div>
      <p className="mt-1.5 break-words text-[13px] leading-relaxed text-gray-800">{display}</p>
    </div>
  );
}

function ReadonlyAttachmentRow({ name }: { name: string }) {
  const isPdf = name.toLowerCase().endsWith(".pdf");

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2">
      <FileText
        size={14}
        className={cn("shrink-0", isPdf ? "text-rose-500" : "text-gray-500")}
        strokeWidth={2}
      />
      <span className="min-w-0 flex-1 truncate text-[12px] text-gray-600">{name}</span>
      <span
        className="inline-flex size-6 shrink-0 items-center justify-center text-gray-400"
        aria-hidden
      >
        <ExternalLink size={12} strokeWidth={2} />
      </span>
    </div>
  );
}

function ReadonlyLinkField({ value }: { value: string }) {
  const trimmed = value.trim();
  const display = trimmed || "—";
  const isUrl = trimmed.startsWith("http://") || trimmed.startsWith("https://");

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2">
      <LinkIcon size={14} className="shrink-0 text-gray-500" strokeWidth={2} />
      {isUrl ? (
        <>
          <a
            href={trimmed}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate text-[12px] text-brand hover:text-brand/80"
          >
            {trimmed}
          </a>
          <ExternalLink size={12} className="shrink-0 text-gray-400" strokeWidth={2} />
        </>
      ) : (
        <span className="min-w-0 flex-1 text-[13px] leading-relaxed text-gray-800">{display}</span>
      )}
    </div>
  );
}

function GuidelineSectionField({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-gray-100 px-5 py-4">
      <p className="text-[13px] font-medium text-gray-600">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function ContentGuidelinesDisplayBlock({
  guidelines,
  mention,
  hashtag,
  attachments,
  referenceLinks,
}: Pick<
  ScriptBriefH5Data,
  "guidelines" | "mention" | "hashtag" | "attachments" | "referenceLinks"
>) {
  const [guidelinesView, setGuidelinesView] = useState<"original" | "translation">("original");
  const activeGuidelines =
    (guidelinesView === "original" ? guidelines.original : guidelines.translation).trim() ||
    "No content guidelines yet.";

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="space-y-3 px-5 py-4">
        <p className="text-[12px] leading-relaxed text-gray-500">
          The translation is auto-generated for reference. Please follow the Original version for
          exact requirements.
        </p>
        <div className="flex w-full min-w-0 items-center gap-0.5 overflow-x-auto border-b border-gray-100">
          <button
            type="button"
            onClick={() => setGuidelinesView("original")}
            className={guidelinesTabClass(guidelinesView === "original")}
          >
            Original
          </button>
          <button
            type="button"
            onClick={() => setGuidelinesView("translation")}
            className={guidelinesTabClass(guidelinesView === "translation")}
          >
            Translation
          </button>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50/40 px-3.5 py-3">
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-gray-700">
            {activeGuidelines}
          </p>
        </div>
      </div>

      <div className="space-y-4 border-t border-gray-100 px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          <GuidelineDetailCard icon={LinkIcon} label="Mention" value={mention} />
          <GuidelineDetailCard icon={Tag} label="Hashtag" value={hashtag} />
        </div>
      </div>

      {attachments.length > 0 ? (
        <GuidelineSectionField title="Upload Briefs">
          <div className="space-y-2">
            {attachments.map((attachment, index) => (
              <ReadonlyAttachmentRow
                key={`${attachment.name}-${index}`}
                name={attachment.name}
              />
            ))}
          </div>
        </GuidelineSectionField>
      ) : null}

      <GuidelineSectionField title="Add Link">
        {referenceLinks.length > 0 ? (
          <div className="space-y-2">
            {referenceLinks.map((url, index) => (
              <ReadonlyLinkField key={`${url}-${index}`} value={url} />
            ))}
          </div>
        ) : (
          <ReadonlyLinkField value="" />
        )}
      </GuidelineSectionField>
    </div>
  );
}
