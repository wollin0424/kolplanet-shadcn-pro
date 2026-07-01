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
  getMasterPostLinks,
  getPostLinksByType,
  type PostLink,
} from "@/lib/postingHubMock";
import { formInputClass } from "@/lib/formControls";
import { cn } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "@/lib/icons";

const MIRRORED_PLACEHOLDER = "https://www.tiktok.com/@username/video/...";

const EDIT_POST_LINK_INPUT_CLASS = formInputClass(
  "h-10! px-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
);

const EDIT_POST_LINK_FIELD_STACK_CLASS = "space-y-3";

type LinkDraft = {
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

function getLastMasterRequiredMessage(index: number) {
  return `Master Link ${index + 1} is required.`;
}

function buildDraftFromLinks(links?: PostLink[], figmaCapture = false) {
  const masters = getMasterPostLinks(links);
  const mirrored = getPostLinksByType(links, "Mirrored");

  return {
    masters:
      masters.length > 0
        ? masters.map((link, index) => ({
            id: `master-${index}`,
            url: link.url,
          }))
        : [{ id: "figma-master-0", url: "" }],
    mirrored:
      mirrored.length > 0
        ? mirrored.map((link, index) => ({
            id: `mirrored-${index}`,
            url: link.url,
          }))
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <EditPostLinkDialogPanel
          key={JSON.stringify(initialLinks ?? [])}
          initialLinks={initialLinks}
          onSubmit={onSubmit}
          onOpenChange={onOpenChange}
          figmaCapture={figmaCapture}
        />
      ) : null}
    </Dialog>
  );
}

function EditPostLinkDialogPanel({
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
    <DialogContent
      className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[520px]"
      showCloseButton
      data-figma-capture={figmaCapture ? "edit-post-link-dialog" : undefined}
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
        <div className="space-y-3">
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-brand transition-colors hover:text-brand/80"
            onClick={handleAddMaster}
          >
            <Plus size={14} strokeWidth={2.25} />
            Add Master Link
          </button>

          {masters.map((item, index) => (
            <div key={item.id} className={EDIT_POST_LINK_FIELD_STACK_CLASS}>
              <label
                htmlFor={`${baseId}-master-${item.id}`}
                className="text-xs font-medium text-gray-700"
              >
                Master {index + 1}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id={`${baseId}-master-${item.id}`}
                  value={item.url}
                  onChange={(e) => handleMasterChange(item.id, e.target.value)}
                  onBlur={() =>
                    setMasterErrors((prev) => ({
                      ...prev,
                      [item.id]: item.url.trim() ? validateMasterUrl(item.url) : undefined,
                    }))
                  }
                  aria-invalid={Boolean(masterErrors[item.id])}
                  className={cn(
                    EDIT_POST_LINK_INPUT_CLASS,
                    "min-w-0 flex-1",
                    masterErrors[item.id] &&
                      "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100"
                  )}
                />
                <button
                  type="button"
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                  aria-label="Remove master link"
                  onClick={() => handleRemoveMaster(item.id, index)}
                >
                  <Trash2 size={15} strokeWidth={2} />
                </button>
              </div>
              {masterErrors[item.id] ? (
                <p className="text-[12px] leading-snug text-red-600">{masterErrors[item.id]}</p>
              ) : null}
            </div>
          ))}
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
                Mirrored {index + 1}
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
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
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
