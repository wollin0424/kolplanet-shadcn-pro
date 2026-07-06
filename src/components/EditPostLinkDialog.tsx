"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getFigmaCaptureEditPostLinkLinks,
  getMasterPostLinks,
  getPostLinksByType,
  getPostLinkSourceLabel,
  getPostLinkTooltipCopy,
  type PostLink,
  type PostLinkSource,
  type PostLinkType,
} from "@/lib/postingHubMock";
import { formInputClass } from "@/lib/formControls";
import { cn } from "@/lib/utils";
import { Monitor, Plus, Smartphone, Trash2 } from "@/lib/icons";
import {
  InstagramPostsTabIcon,
  InstagramRepostIcon,
} from "@/components/icons/InstagramUiIcons";

const MIRRORED_PLACEHOLDER = "https://www.tiktok.com/@username/video/...";

const EDIT_POST_LINK_INPUT_CLASS = formInputClass(
  "h-10! px-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
);

const EDIT_POST_LINK_FIELD_STACK_CLASS = "space-y-2";

const EDIT_POST_LINK_LIST_CLASS = "flex flex-col gap-4";

type LinkDraft = {
  id: string;
  url: string;
  source?: PostLinkSource;
  snapshot?: PostLink;
};

function toLinkDraft(link: PostLink, id: string): LinkDraft {
  return {
    id,
    url: link.url,
    source: link.source,
    snapshot: link,
  };
}

function getEditRowStatusLink(
  snapshot: PostLink | undefined,
  url: string,
  type: PostLinkType
): PostLink | null {
  if (!url.trim()) return null;

  if (!snapshot) {
    return { type, url };
  }

  const urlUnchanged = snapshot.url.trim() === url.trim();

  return {
    ...snapshot,
    type,
    url,
    issues: urlUnchanged ? snapshot.issues : undefined,
    validation: urlUnchanged ? snapshot.validation : undefined,
  };
}

function getDisplaySource(item: LinkDraft): PostLinkSource | undefined {
  if (item.source) return item.source;
  if (item.url.trim()) return "Web";
  return undefined;
}

function FigmaCaptureSourceGlyph({ source }: { source: PostLinkSource }) {
  const label = getPostLinkSourceLabel(source);
  const isH5 = source === "H5";

  return (
    <div
      data-figma-capture="edit-post-link-source"
      className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-9 items-center justify-center"
      aria-label={label}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {isH5 ? (
          <>
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="#6B7280" strokeWidth="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="#6B7280" strokeWidth="2" />
            <line x1="8" y1="21" x2="16" y2="21" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="17" x2="12" y2="21" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
      </svg>
    </div>
  );
}

function EditPostLinkSourceIcon({
  source,
  figmaCapture = false,
}: {
  source: PostLinkSource;
  figmaCapture?: boolean;
}) {
  if (figmaCapture) {
    return <FigmaCaptureSourceGlyph source={source} />;
  }

  const Icon = source === "H5" ? Smartphone : Monitor;
  const label = getPostLinkSourceLabel(source);

  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-9 items-center justify-center">
      <Tooltip>
        <TooltipTrigger
          render={
            <span
              className="pointer-events-auto inline-flex size-5 items-center justify-center text-gray-400"
              aria-label={label}
            >
              <Icon size={15} strokeWidth={2} />
            </span>
          }
        />
        <TooltipContent variant="light" side="top" sideOffset={4} className="px-2.5 py-1.5 text-[11px]">
          {label}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function EditPostLinkSectionHeader({
  variant,
  title,
}: {
  variant: "master" | "mirrored";
  title: string;
}) {
  const Icon = variant === "master" ? InstagramPostsTabIcon : InstagramRepostIcon;

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "inline-flex size-7 shrink-0 items-center justify-center",
          variant === "master"
            ? "rounded-full bg-brand-50 text-brand"
            : "rounded-lg bg-gray-50 text-gray-400"
        )}
      >
        <Icon size={15} strokeWidth={2} />
      </span>
      <div>
        <h3
          className={cn(
            "font-semibold leading-tight",
            variant === "master" ? "text-[15px] text-gray-900" : "text-[13px] text-gray-700"
          )}
        >
          {title}
          {variant === "master" ? <span className="ml-0.5 text-red-500">*</span> : null}
        </h3>
        {variant === "mirrored" ? (
          <p className="mt-0.5 text-[11px] font-normal text-gray-400">Optional</p>
        ) : null}
      </div>
    </div>
  );
}

function EditPostLinkFieldLabel({
  label,
  inputId,
  statusLink,
  variant = "master",
}: {
  label: string;
  inputId: string;
  statusLink: PostLink | null;
  variant?: "master" | "mirrored";
}) {
  const status = statusLink ? getPostLinkTooltipCopy(statusLink) : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label
        htmlFor={inputId}
        className={cn(
          "text-xs font-medium",
          variant === "master" ? "font-semibold text-gray-900" : "text-gray-600"
        )}
      >
        {label}
      </label>
      {status ? (
        <span
          className={cn(
            "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-none",
            status.tagClassName
          )}
        >
          {status.tag}
        </span>
      ) : null}
    </div>
  );
}

function EditPostLinkFieldRow({
  label,
  statusLink,
  source,
  inputId,
  url,
  onUrlChange,
  onBlur,
  error,
  placeholder,
  onRemove,
  variant,
  figmaCapture = false,
}: {
  label: string;
  statusLink: PostLink | null;
  source?: PostLinkSource;
  inputId: string;
  url: string;
  onUrlChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  onRemove: () => void;
  variant: "master" | "mirrored";
  figmaCapture?: boolean;
}) {
  return (
    <div className={EDIT_POST_LINK_FIELD_STACK_CLASS}>
      <EditPostLinkFieldLabel label={label} inputId={inputId} statusLink={statusLink} variant={variant} />
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          {source ? <EditPostLinkSourceIcon source={source} figmaCapture={figmaCapture} /> : null}
          <Input
            id={inputId}
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            className={cn(
              EDIT_POST_LINK_INPUT_CLASS,
              source && "pl-9",
              figmaCapture && source && "relative z-0",
              variant === "master" && !error && "border-brand/25 focus-visible:border-brand/45",
              error && "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100"
            )}
          />
        </div>
        <button
          type="button"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
          aria-label={`Remove ${label}`}
          onClick={onRemove}
        >
          <Trash2 size={15} strokeWidth={2} />
        </button>
      </div>
      {error ? <p className="text-[12px] leading-snug text-red-600">{error}</p> : null}
    </div>
  );
}

function EditPostLinkAddButton({
  label,
  onClick,
  variant = "master",
}: {
  label: string;
  onClick: () => void;
  variant?: "master" | "mirrored";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 text-[13px] font-medium transition-colors",
        variant === "master"
          ? "border-brand/35 bg-white text-brand hover:border-brand/50 hover:bg-brand-50/35"
          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
      )}
    >
      <Plus size={14} strokeWidth={2.25} />
      {label}
    </button>
  );
}

function validateMasterUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "Master link is required.";
  try {
    new URL(trimmed);
  } catch {
    return "Invalid URL format.";
  }
  if (trimmed.includes("private")) {
    return "Master Link is not publicly accessible.";
  }
  return undefined;
}

function getLastMasterRequiredMessage(index: number) {
  return `Master Link ${index + 1} is required.`;
}

function buildDraftFromLinks(links?: PostLink[], figmaCapture = false) {
  const captureLinks = figmaCapture ? getFigmaCaptureEditPostLinkLinks() : links;
  const masters = getMasterPostLinks(captureLinks);
  const mirrored = getPostLinksByType(captureLinks, "Mirrored");

  return {
    masters:
      masters.length > 0
        ? masters.map((link, index) => toLinkDraft(link, `master-${index}`))
        : [{ id: "master-0", url: "" }],
    mirrored:
      mirrored.length > 0
        ? mirrored.map((link, index) => toLinkDraft(link, `mirrored-${index}`))
        : figmaCapture
          ? [{ id: "figma-mirrored-0", url: "" }]
          : [],
  };
}

export function buildPostLinksFromDraft(
  masterUrls: string[],
  mirroredUrls: string[],
  previousLinks?: PostLink[]
): PostLink[] {
  const prevMasters = getMasterPostLinks(previousLinks);
  const prevMirrored = getPostLinksByType(previousLinks, "Mirrored");
  const links: PostLink[] = [];

  masterUrls
    .map((url) => url.trim())
    .filter(Boolean)
    .forEach((url, index) => {
      const masterError = validateMasterUrl(url);
      links.push({
        type: "Master",
        url,
        source: prevMasters[index]?.source ?? "Web",
        validation: prevMasters[index]?.validation,
        postedDate: prevMasters[index]?.postedDate,
        issues: masterError ? [masterError] : prevMasters[index]?.issues,
      });
    });

  mirroredUrls
    .map((url) => url.trim())
    .filter(Boolean)
    .forEach((url, index) => {
      links.push({
        type: "Mirrored",
        url,
        source: prevMirrored[index]?.source ?? "Web",
        postedDate: prevMirrored[index]?.postedDate,
        issues: prevMirrored[index]?.issues,
      });
    });

  return links;
}

export function EditPostLinkDialog({
  open,
  onOpenChange,
  initialLinks,
  onSubmit,
  figmaCapture = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLinks?: PostLink[];
  onSubmit: (links: PostLink[]) => void;
  figmaCapture?: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {open ? (
        <EditPostLinkSheetPanel
          key={JSON.stringify(initialLinks ?? [])}
          initialLinks={initialLinks}
          onSubmit={onSubmit}
          onOpenChange={onOpenChange}
          figmaCapture={figmaCapture}
        />
      ) : null}
    </Sheet>
  );
}

function EditPostLinkSheetPanel({
  onOpenChange,
  initialLinks,
  onSubmit,
  figmaCapture = false,
}: {
  onOpenChange: (open: boolean) => void;
  initialLinks?: PostLink[];
  onSubmit: (links: PostLink[]) => void;
  figmaCapture?: boolean;
}) {
  const baseId = useId();
  const draft = buildDraftFromLinks(initialLinks, figmaCapture);
  const [masters, setMasters] = useState<LinkDraft[]>(draft.masters);
  const [masterErrors, setMasterErrors] = useState<Record<string, string | undefined>>(() => {
    const errors: Record<string, string | undefined> = {};
    draft.masters.forEach((item) => {
      if (item.url.trim()) {
        errors[item.id] = validateMasterUrl(item.url);
      }
    });
    return errors;
  });
  const [mirrored, setMirrored] = useState<LinkDraft[]>(draft.mirrored);
  const mirroredSeededRef = useRef(draft.mirrored.length > 0);
  const hasMasterLink = masters.some((item) => item.url.trim());

  useEffect(() => {
    if (!hasMasterLink || mirrored.length > 0 || mirroredSeededRef.current) return;
    mirroredSeededRef.current = true;
    setMirrored([{ id: "mirrored-0", url: "" }]);
  }, [hasMasterLink, mirrored.length]);

  const handleMasterChange = (id: string, value: string) => {
    setMasters((prev) => prev.map((item) => (item.id === id ? { ...item, url: value } : item)));
    setMasterErrors((prev) => ({
      ...prev,
      [id]: value.trim() ? validateMasterUrl(value) : undefined,
    }));
  };

  const handleAddMaster = () => {
    setMasters((prev) => [...prev, { id: `master-${prev.length}`, url: "" }]);
  };

  const handleRemoveMaster = (id: string, index: number) => {
    if (masters.length === 1) {
      setMasterErrors((prev) => ({
        ...prev,
        [id]: getLastMasterRequiredMessage(index),
      }));
      return;
    }

    setMasters((prev) => prev.filter((item) => item.id !== id));
    setMasterErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleAddMirrored = () => {
    setMirrored((prev) => [...prev, { id: `mirrored-${prev.length}`, url: "" }]);
  };

  const handleMirroredChange = (id: string, url: string) => {
    setMirrored((prev) => prev.map((item) => (item.id === id ? { ...item, url } : item)));
  };

  const handleRemoveMirrored = (id: string) => {
    setMirrored((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = () => {
    const filledMasters = masters.filter((item) => item.url.trim());
    if (filledMasters.length === 0) {
      setMasterErrors({ [masters[0]?.id ?? ""]: getLastMasterRequiredMessage(0) });
      return;
    }

    const nextErrors: Record<string, string | undefined> = {};
    let hasError = false;
    masters.forEach((item) => {
      if (!item.url.trim()) return;
      const error = validateMasterUrl(item.url);
      if (error) {
        nextErrors[item.id] = error;
        hasError = true;
      }
    });

    if (hasError) {
      setMasterErrors(nextErrors);
      return;
    }

    onSubmit(
      buildPostLinksFromDraft(
        masters.map((item) => item.url),
        mirrored.map((item) => item.url),
        initialLinks
      )
    );
    onOpenChange(false);
  };

  const hasMasterValidationError = Object.values(masterErrors).some(Boolean);
  const canSubmit =
    masters.some((item) => item.url.trim()) && !hasMasterValidationError;

  return (
    <SheetContent
      side="right"
      className={cn(
        "flex h-full gap-0 bg-white p-0 data-[side=right]:w-full data-[side=right]:max-w-[520px] data-[side=right]:sm:max-w-[520px]",
        figmaCapture && "figma-capture-edit-post-link-sheet"
      )}
      data-figma-capture={figmaCapture ? "edit-post-link-dialog" : undefined}
    >
      <SheetHeader className="shrink-0 gap-1.5 border-b border-gray-100 bg-white px-6 py-5 text-left">
        <SheetTitle className="text-[18px] font-semibold text-gray-900">Edit Post Link</SheetTitle>
        <SheetDescription className="text-[13px] leading-relaxed text-gray-500">
          Update the primary post link and mirrored links for the current influencer.
        </SheetDescription>
      </SheetHeader>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-4 rounded-xl border border-brand/35 bg-brand-50/10 p-4">
            <EditPostLinkSectionHeader variant="master" title="Master Post Link" />

            <div className={EDIT_POST_LINK_LIST_CLASS}>
              {masters.map((item, index) => (
                <EditPostLinkFieldRow
                  key={item.id}
                  variant="master"
                  label={`Master ${index + 1}`}
                  statusLink={getEditRowStatusLink(item.snapshot, item.url, "Master")}
                  source={getDisplaySource(item)}
                  inputId={`${baseId}-master-${item.id}`}
                  url={item.url}
                  onUrlChange={(value) => handleMasterChange(item.id, value)}
                  onBlur={() =>
                    setMasterErrors((prev) => ({
                      ...prev,
                      [item.id]: item.url.trim() ? validateMasterUrl(item.url) : undefined,
                    }))
                  }
                  error={masterErrors[item.id]}
                  onRemove={() => handleRemoveMaster(item.id, index)}
                  figmaCapture={figmaCapture}
                />
              ))}
              <EditPostLinkAddButton label="Add Master Link" onClick={handleAddMaster} variant="master" />
            </div>
          </div>

          {hasMasterLink ? (
            <div className="space-y-3 border-t border-gray-100 pt-5">
              <EditPostLinkSectionHeader variant="mirrored" title="Mirrored Post Link" />

              <div className={EDIT_POST_LINK_LIST_CLASS}>
                {mirrored.map((item, index) => (
                  <EditPostLinkFieldRow
                    key={item.id}
                    variant="mirrored"
                    label={`Mirrored ${index + 1}`}
                    statusLink={getEditRowStatusLink(item.snapshot, item.url, "Mirrored")}
                    source={getDisplaySource(item)}
                    inputId={`${baseId}-mirrored-${item.id}`}
                    url={item.url}
                    onUrlChange={(value) => handleMirroredChange(item.id, value)}
                    placeholder={MIRRORED_PLACEHOLDER}
                    onRemove={() => handleRemoveMirrored(item.id)}
                    figmaCapture={figmaCapture}
                  />
                ))}
                <EditPostLinkAddButton
                  label="Add Mirrored Link"
                  onClick={handleAddMirrored}
                  variant="mirrored"
                />
              </div>
            </div>
          ) : null}
        </div>

        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-9 px-4 text-[13px]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            className="h-9 px-4 text-[13px]"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </SheetFooter>
      </div>
    </SheetContent>
  );
}
