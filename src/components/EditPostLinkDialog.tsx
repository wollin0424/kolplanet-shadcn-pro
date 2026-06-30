"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  getMasterPostLink,
  getPostLinksByType,
  type PostLink,
} from "@/lib/postingHubMock";
import { formInputClass } from "@/lib/formControls";
import { cn } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "@/lib/icons";

const MIRRORED_PLACEHOLDER = "https://www.tiktok.com/@username/video/...";

const MASTER_BADGE_CLASS = "border-brand/25 bg-brand-50 text-brand";

const EDIT_POST_LINK_INPUT_CLASS = formInputClass(
  "px-3 text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
);

const EDIT_POST_LINK_FIELD_STACK_CLASS = "space-y-3";

type MirroredDraft = {
  id: string;
  url: string;
};

function validateMasterUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "Master link is required.";
  try {
    new URL(trimmed);
  } catch {
    return "Enter a valid URL.";
  }
  if (trimmed.includes("private")) {
    return "Master Link is not publicly accessible.";
  }
  return undefined;
}

function buildDraftFromLinks(links?: PostLink[]) {
  const master = getMasterPostLink(links);
  const mirrored = getPostLinksByType(links, "Mirrored");

  return {
    masterUrl: master?.url ?? "",
    mirrored: mirrored.map((link, index) => ({
      id: `mirrored-${index}`,
      url: link.url,
    })),
  };
}

export function buildPostLinksFromDraft(
  masterUrl: string,
  mirroredUrls: string[],
  previousLinks?: PostLink[]
): PostLink[] {
  const prevMaster = getMasterPostLink(previousLinks);
  const prevMirrored = getPostLinksByType(previousLinks, "Mirrored");
  const trimmedMaster = masterUrl.trim();
  const links: PostLink[] = [];

  if (trimmedMaster) {
    const masterError = validateMasterUrl(trimmedMaster);
    links.push({
      type: "Master",
      url: trimmedMaster,
      validation: prevMaster?.validation,
      postedDate: prevMaster?.postedDate,
      issues: masterError ? [masterError] : prevMaster?.issues,
    });
  }

  mirroredUrls
    .map((url) => url.trim())
    .filter(Boolean)
    .forEach((url, index) => {
      links.push({
        type: "Mirrored",
        url,
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLinks?: PostLink[];
  onSubmit: (links: PostLink[]) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <EditPostLinkDialogPanel
          key={JSON.stringify(initialLinks ?? [])}
          initialLinks={initialLinks}
          onSubmit={onSubmit}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </Dialog>
  );
}

function EditPostLinkDialogPanel({
  onOpenChange,
  initialLinks,
  onSubmit,
}: {
  onOpenChange: (open: boolean) => void;
  initialLinks?: PostLink[];
  onSubmit: (links: PostLink[]) => void;
}) {
  const baseId = useId();
  const draft = buildDraftFromLinks(initialLinks);
  const [masterUrl, setMasterUrl] = useState(draft.masterUrl);
  const [masterError, setMasterError] = useState<string | undefined>(() =>
    draft.masterUrl ? validateMasterUrl(draft.masterUrl) : undefined
  );
  const [mirrored, setMirrored] = useState<MirroredDraft[]>(draft.mirrored);

  const handleMasterChange = (value: string) => {
    setMasterUrl(value);
    setMasterError(value.trim() ? validateMasterUrl(value) : undefined);
  };

  const handleAddMirrored = () => {
    setMirrored((prev) => [...prev, { id: crypto.randomUUID(), url: "" }]);
  };

  const handleMirroredChange = (id: string, url: string) => {
    setMirrored((prev) => prev.map((item) => (item.id === id ? { ...item, url } : item)));
  };

  const handleRemoveMirrored = (id: string) => {
    setMirrored((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = () => {
    const error = validateMasterUrl(masterUrl);
    if (error) {
      setMasterError(error);
      return;
    }

    onSubmit(
      buildPostLinksFromDraft(
        masterUrl,
        mirrored.map((item) => item.url),
        initialLinks
      )
    );
    onOpenChange(false);
  };

  const canSubmit = Boolean(masterUrl.trim()) && !masterError;

  return (
    <DialogContent
        className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[520px]"
        showCloseButton
      >
        <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50/80 to-white px-6 pt-6 pb-5">
          <div className="flex items-start gap-3 pr-6">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10">
              <Pencil size={18} strokeWidth={2} />
            </span>
            <div className="min-w-0 pt-0.5">
              <DialogTitle className="text-base font-semibold text-gray-900">
                Edit Post Link
              </DialogTitle>
              <DialogDescription className="mt-2 text-[13px] leading-relaxed text-gray-500">
                The system failed to fetch the post link automatically. Please manually enter the
                published URL below. The system will initiate content validation immediately after
                submission.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="max-h-[min(52vh,420px)] space-y-5 overflow-y-auto px-6 py-5">
          <div className={EDIT_POST_LINK_FIELD_STACK_CLASS}>
            <div className="flex items-center gap-2">
              <label htmlFor={`${baseId}-master`} className="text-xs font-medium text-gray-700">
                Post Link
              </label>
              <span
                className={cn(
                  "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-none",
                  MASTER_BADGE_CLASS
                )}
              >
                Master
              </span>
            </div>
            <Input
              id={`${baseId}-master`}
              value={masterUrl}
              onChange={(e) => handleMasterChange(e.target.value)}
              onBlur={() => setMasterError(validateMasterUrl(masterUrl))}
              aria-invalid={Boolean(masterError)}
              className={cn(
                EDIT_POST_LINK_INPUT_CLASS,
                masterError &&
                  "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100"
              )}
            />
            {masterError ? (
              <p className="text-[12px] leading-snug text-red-600">{masterError}</p>
            ) : null}
          </div>

          <div className="space-y-3">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[13px] font-medium text-brand transition-colors hover:text-brand/80"
              onClick={handleAddMirrored}
            >
              <Plus size={14} strokeWidth={2.25} />
              Add Mirrored Link
            </button>

            {mirrored.map((item, index) => (
              <div key={item.id} className={EDIT_POST_LINK_FIELD_STACK_CLASS}>
                <label
                  htmlFor={`${baseId}-mirrored-${item.id}`}
                  className="text-xs font-medium text-gray-700"
                >
                  Mirrored Link {mirrored.length > 1 ? index + 1 : ""}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`${baseId}-mirrored-${item.id}`}
                    value={item.url}
                    onChange={(e) => handleMirroredChange(item.id, e.target.value)}
                    placeholder={MIRRORED_PLACEHOLDER}
                    className={cn(EDIT_POST_LINK_INPUT_CLASS, "min-w-0 flex-1")}
                  />
                  <button
                    type="button"
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                    aria-label="Remove mirrored link"
                    onClick={() => handleRemoveMirrored(item.id)}
                  >
                    <Trash2 size={15} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
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
        </div>
      </DialogContent>
  );
}
