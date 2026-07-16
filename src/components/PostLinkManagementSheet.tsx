"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { FileUploadZone } from "@/components/FileUploadZone";
import { InsightReportImageGrid } from "@/components/InsightReportImageCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formInputClass } from "@/lib/formControls";
import {
  AlertCircle,
  CheckCircle2,
  Monitor,
  Plus,
  Send,
  Smartphone,
  Sparkles,
  Trash2,
  TriangleAlert,
  X,
} from "@/lib/icons";
import {
  mergeInsightReportFileNames,
  splitInitialWebInsightFileNames,
  type InsightReportImage,
  type WebInsightFileRecord,
} from "@/lib/insightReportSync";
import { getH5PostingState } from "@/lib/h5PostingSubmissions";
import {
  applyMockValidationToMasterLink,
  getEffectiveMasterValidation,
  getMasterLabel,
  getMasterPostLinks,
  getMirroredLinksForMaster,
  getPostLinkStatus,
  getPostLinkTooltipCopy,
  getInsightReportPreviewUrl,
  mergePostLinkTaskDraft,
  type ContentValidationField,
  type ContentValidationStatus,
  type PostLink,
  type PostLinkSource,
  type PostLinkType,
  type PostingHubRow,
} from "@/lib/postingHubMock";
import {
  getWebInsightFiles,
  setWebInsightFiles as persistWebInsightFiles,
} from "@/lib/webInsightSubmissions";
import { cn } from "@/lib/utils";

const MIRRORED_MAX = 3;
const MIRRORED_PLACEHOLDER = "https://www.tiktok.com/@username/video/...";
const TASK_TABS = [
  { id: "links" as const, label: "Post Link & Content Validation" },
  { id: "insight" as const, label: "Insight Report" },
];
const ACCEPT_INPUT = "image/png,image/jpeg,image/jpg";
const ACCEPTED_EXTENSIONS = [".png", ".jpg", ".jpeg"];

const TASK_INPUT_CLASS = formInputClass(
  "h-10! px-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
);

export type PostLinkManagementTabId = (typeof TASK_TABS)[number]["id"];

type LinkDraft = {
  id: string;
  url: string;
  source?: PostLinkSource;
  snapshot?: PostLink;
};

type PendingInsightFile = WebInsightFileRecord & { id: string };

function toLinkDraft(link: PostLink, id: string): LinkDraft {
  return {
    id,
    url: link.url,
    source: link.source,
    snapshot: link,
  };
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

function getDisplaySource(item: LinkDraft): PostLinkSource | undefined {
  if (item.source) return item.source;
  if (item.url.trim()) return "Web";
  return undefined;
}

function buildTaskDraft(links: PostLink[] | undefined, masterIndex: number) {
  const masters = getMasterPostLinks(links);
  const master = masters[masterIndex];
  const mirrored = getMirroredLinksForMaster(links, masterIndex);

  return {
    master: master
      ? toLinkDraft(master, `master-${masterIndex}`)
      : { id: `master-${masterIndex}`, url: "" },
    mirrored:
      mirrored.length > 0
        ? mirrored.map((link, index) => toLinkDraft(link, `mirrored-${index}`))
        : [],
  };
}

function getDraftStatusLink(
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

function TaskFieldLabel({
  label,
  inputId,
  statusLink,
  variant = "master",
  mirroredIndex,
}: {
  label: string;
  inputId: string;
  statusLink: PostLink | null;
  variant?: "master" | "mirrored";
  mirroredIndex?: number;
}) {
  const status = statusLink ? getPostLinkTooltipCopy(statusLink) : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {variant === "mirrored" && mirroredIndex !== undefined ? (
        <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-[10px] font-bold text-gray-500">
          {mirroredIndex}
        </span>
      ) : null}
      <label
        htmlFor={inputId}
        className={cn(
          "text-xs font-medium",
          variant === "master" ? "text-[13px] font-semibold text-gray-900" : "text-[12px] text-gray-600"
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

function PostLinkManagementTabs({
  activeTab,
  onChange,
}: {
  activeTab: PostLinkManagementTabId;
  onChange: (tab: PostLinkManagementTabId) => void;
}) {
  return (
    <div className="px-6 pb-4">
      <div className="flex rounded-lg border border-gray-200 bg-gray-50/80 p-1">
        {TASK_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex-1 rounded-md px-2 py-2 text-center text-[11px] font-semibold leading-tight transition-colors",
                isActive
                  ? "bg-white text-brand shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TaskSourceIcon({ source }: { source: PostLinkSource }) {
  const Icon = source === "H5" ? Smartphone : Monitor;

  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-9 items-center justify-center">
      <Icon size={15} strokeWidth={2} className="text-gray-400" />
    </div>
  );
}

function TaskLinkFieldRow({
  label,
  inputId,
  url,
  statusLink,
  source,
  variant,
  mirroredIndex,
  error,
  onUrlChange,
  onBlur,
  onRemove,
}: {
  label: string;
  inputId: string;
  url: string;
  statusLink: PostLink | null;
  source?: PostLinkSource;
  variant: "master" | "mirrored";
  mirroredIndex?: number;
  error?: string;
  onUrlChange: (value: string) => void;
  onBlur?: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "space-y-2 rounded-lg p-3",
        variant === "master"
          ? "border-2 border-brand/30 bg-white shadow-[0_1px_2px_rgba(37,99,235,0.06)]"
          : "border border-gray-200 bg-gray-50/80"
      )}
    >
      <TaskFieldLabel
        label={label}
        inputId={inputId}
        statusLink={statusLink}
        variant={variant}
        mirroredIndex={mirroredIndex}
      />
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          {source ? <TaskSourceIcon source={source} /> : null}
          <Input
            id={inputId}
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            onBlur={onBlur}
            placeholder={MIRRORED_PLACEHOLDER}
            aria-invalid={Boolean(error)}
            className={cn(
              TASK_INPUT_CLASS,
              source && "pl-9",
              variant === "master" && !error && "border-brand/25 bg-white focus-visible:border-brand/45",
              variant === "mirrored" && !error && "border-gray-200 bg-white focus-visible:border-gray-300",
              error && "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100"
            )}
          />
        </div>
        <button
          type="button"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-red-500 transition-colors hover:bg-red-50"
          aria-label={`Remove ${label}`}
          onClick={onRemove}
        >
          <Trash2 size={14} strokeWidth={2} />
        </button>
      </div>
      {error ? <p className="text-[12px] leading-snug text-red-600">{error}</p> : null}
    </div>
  );
}

const TASK_VALIDATION_PILL_WIDTH: Record<ContentValidationField, string> = {
  Caption: "min-w-[69px]",
  Cover: "min-w-[60px]",
  Video: "min-w-[59px]",
};

function TaskValidationPlaceholder({ label }: { label: ContentValidationField }) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1 rounded-full border border-gray-200 bg-white px-1.5 text-[10px] font-semibold leading-none text-gray-400",
        TASK_VALIDATION_PILL_WIDTH[label]
      )}
    >
      <span className="inline-flex size-[13px] shrink-0 items-center justify-center text-[9px] text-gray-300">
        --
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
}

function ConfirmTaskUpdateDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="z-[60] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[480px]"
        showCloseButton
      >
        <div className="px-6 pt-6 pb-4">
          <DialogTitle className="text-center text-[17px] font-bold text-gray-900">
            Confirm Task Update
          </DialogTitle>
          <DialogDescription className="mt-4 text-left text-[13px] font-normal text-gray-500">
            You are updating this task.
          </DialogDescription>
        </div>

        <div className="space-y-3 px-6 pb-6 text-left">
          <div className="flex items-start gap-2.5 rounded-lg border border-red-200/80 bg-red-50/70 px-3 py-3">
            <TriangleAlert
              size={16}
              strokeWidth={2.2}
              className="mt-0.5 shrink-0 text-red-600"
            />
            <p className="text-[12px] font-normal leading-relaxed text-gray-500">
              <span className="font-bold text-gray-900">Warning:</span> If you leave the{" "}
              <span className="font-bold text-gray-900">Master Link</span> field empty, this task
              and all associated data, including{" "}
              <span className="font-bold text-gray-900">Mirrored Links</span>,{" "}
              <span className="font-bold text-gray-900">Validation results</span>, and{" "}
              <span className="font-bold text-gray-900">Insight Reports</span>, will be permanently
              deleted.
            </p>
          </div>
          <p className="text-[13px] font-normal leading-relaxed text-gray-500">
            To preserve your data, you must provide a valid{" "}
            <span className="font-bold text-gray-900">Master Link</span> before saving.
          </p>
        </div>

        <div className="flex justify-center gap-2 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-9 min-w-[88px] px-4 text-[13px]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            className="h-9 min-w-[88px] px-4 text-[13px]"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmReportUpdateDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="z-[60] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[480px]"
        showCloseButton
      >
        <div className="px-6 pt-6 pb-4">
          <DialogTitle className="text-center text-[17px] font-bold text-gray-900">
            Confirm Report Update
          </DialogTitle>
          <DialogDescription className="mt-4 text-left text-[13px] font-normal text-gray-500">
            You are about to save changes to the Insight Report.
          </DialogDescription>
        </div>

        <div className="space-y-3 px-6 pb-6 text-left">
          <p className="text-[13px] font-normal leading-relaxed text-gray-500">
            <span className="font-bold text-gray-900">Note:</span> Please ensure the uploaded
            insight report is complete, accurate, and corresponds to the current{" "}
            <span className="font-bold text-gray-900">Master Link</span>.
          </p>
          <div className="flex items-start gap-2.5 rounded-lg border border-red-200/80 bg-red-50/70 px-3 py-3">
            <TriangleAlert
              size={16}
              strokeWidth={2.2}
              className="mt-0.5 shrink-0 text-red-600"
            />
            <p className="text-[12px] font-normal leading-relaxed text-gray-500">
              <span className="font-bold text-gray-900">Warning:</span> If you remove or replace any
              uploaded report images,{" "}
              <span className="font-bold text-gray-900">
                all previously generated data associated with them will be permanently deleted
              </span>{" "}
              and cannot be recovered.
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-2 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-9 min-w-[88px] px-4 text-[13px]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            className="h-9 min-w-[88px] px-4 text-[13px]"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TaskValidationPill({
  label,
  status,
}: {
  label: ContentValidationField;
  status: ContentValidationStatus;
}) {
  const toneClass =
    status === "Verified"
      ? "border-emerald-200/90 bg-emerald-50 text-gray-600"
      : status === "Mismatched"
        ? "border-red-200/90 bg-red-50 text-gray-600"
        : status === "Cannot Verify"
          ? "border-amber-200/90 bg-amber-50 text-gray-600"
          : "border-gray-200 bg-gray-50 text-gray-500";

  const Icon =
    status === "Verified"
      ? CheckCircle2
      : status === "Mismatched"
        ? X
        : AlertCircle;

  const iconClass =
    status === "Verified"
      ? "text-emerald-600"
      : status === "Mismatched"
        ? "text-red-600"
        : status === "Cannot Verify"
          ? "text-amber-600"
          : "text-gray-400";

  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1 rounded-full border px-1.5 text-[10px] font-semibold leading-none",
        TASK_VALIDATION_PILL_WIDTH[label],
        toneClass
      )}
    >
      <span className="inline-flex size-[13px] shrink-0 items-center justify-center overflow-hidden leading-none">
        <Icon size={13} strokeWidth={2.2} className={iconClass} />
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
}

function PostLinkManagementSheetPanel({
  row,
  masterIndex,
  initialTab = "links",
  onOpenChange,
  onSubmitPostLinks,
  onSubmitInsightReports,
}: {
  row: PostingHubRow;
  masterIndex: number;
  initialTab?: PostLinkManagementTabId;
  onOpenChange: (open: boolean) => void;
  onSubmitPostLinks: (links: PostLink[]) => void;
  onSubmitInsightReports: (files: string[]) => void;
}) {
  const baseId = useId();
  const draftKey = `${row.id}:${masterIndex}:${JSON.stringify(row.postLinks ?? [])}`;
  const initialDraft = useMemo(
    () => buildTaskDraft(row.postLinks, masterIndex),
    [draftKey, masterIndex, row.postLinks]
  );

  const [activeTab, setActiveTab] = useState<PostLinkManagementTabId>(initialTab);
  const [master, setMaster] = useState<LinkDraft>(initialDraft.master);
  const [mirrored, setMirrored] = useState<LinkDraft[]>(initialDraft.mirrored);
  const [masterError, setMasterError] = useState<string | undefined>();
  const [savedLinks, setSavedLinks] = useState<PostLink[] | undefined>(row.postLinks);
  const [pendingInsightFiles, setPendingInsightFiles] = useState<PendingInsightFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmInsightOpen, setConfirmInsightOpen] = useState(false);
  const [removedSubmittedInsightIds, setRemovedSubmittedInsightIds] = useState<string[]>([]);

  useEffect(() => {
    setActiveTab(initialTab);
    setMaster(initialDraft.master);
    setMirrored(initialDraft.mirrored);
    setMasterError(undefined);
    setSavedLinks(row.postLinks);
    setPendingInsightFiles([]);
    setUploadError(null);
    setConfirmDeleteOpen(false);
    setConfirmInsightOpen(false);
    setRemovedSubmittedInsightIds([]);
  }, [draftKey, initialDraft.master, initialDraft.mirrored, initialTab, row.postLinks]);

  const existingMasters = getMasterPostLinks(row.postLinks);
  const isNewTask =
    masterIndex >= existingMasters.length || !existingMasters[masterIndex]?.url.trim();
  const headerBadge = isNewTask ? "New Task" : getMasterLabel(masterIndex);

  const savedMasterLink = useMemo(() => {
    const masters = getMasterPostLinks(savedLinks);
    return masters[masterIndex] ?? null;
  }, [masterIndex, savedLinks]);

  const masterVerified =
    Boolean(savedMasterLink?.url.trim()) && getPostLinkStatus(savedMasterLink!) === "success";
  const validation = savedMasterLink ? getEffectiveMasterValidation(savedMasterLink) : null;

  const masterStatusLink = getDraftStatusLink(master.snapshot, master.url, "Master");

  const h5InsightFiles = useMemo(() => {
    const kolId = row.h5Path.split("/").pop();
    return kolId ? getH5PostingState(kolId).insightDraftFiles : [];
  }, [row.h5Path]);

  const submittedInsightFiles = useMemo(() => {
    const stored = getWebInsightFiles(row.id);
    if (stored.length > 0) {
      return stored.map((file) => ({
        ...file,
        previewUrl: file.previewUrl || getInsightReportPreviewUrl(row.id, file.name),
      }));
    }
    return splitInitialWebInsightFileNames(row.insightReports, h5InsightFiles).map((name) => ({
      name,
      previewUrl: getInsightReportPreviewUrl(row.id, name),
      sizeLabel: "2.1 KB",
    }));
  }, [h5InsightFiles, row.id, row.insightReports]);

  const submittedInsightImages = useMemo<InsightReportImage[]>(
    () =>
      submittedInsightFiles
        .filter((file) => !removedSubmittedInsightIds.includes(file.name))
        .map((file) => ({
          id: file.name,
          name: file.name,
          previewUrl: file.previewUrl,
          sizeLabel: file.sizeLabel ?? "2.1 KB",
          source: "Web",
        })),
    [removedSubmittedInsightIds, submittedInsightFiles]
  );

  const pendingInsightImages = useMemo<InsightReportImage[]>(
    () =>
      pendingInsightFiles.map((file) => ({
        id: file.id,
        name: file.name,
        previewUrl: file.previewUrl,
        sizeLabel: file.sizeLabel,
        source: "Web",
      })),
    [pendingInsightFiles]
  );

  const hasMasterUrl = Boolean(master.url.trim());
  const taskExistsAtIndex = Boolean(
    getMasterPostLinks(savedLinks ?? row.postLinks)[masterIndex]?.url.trim()
  );
  const isDeletingTask = !hasMasterUrl && taskExistsAtIndex;
  const canSaveLinks =
    (hasMasterUrl && !validateMasterUrl(master.url)) || isDeletingTask;
  const allMirroredFilled = mirrored.every((item) => item.url.trim());
  const canAddMirrored =
    hasMasterUrl && mirrored.length < MIRRORED_MAX && allMirroredFilled;
  const hasRemovedSubmittedInsight = removedSubmittedInsightIds.length > 0;
  const canSaveInsight = pendingInsightFiles.length > 0 || hasRemovedSubmittedInsight;

  const handleAddMirrored = () => {
    if (!canAddMirrored) return;
    setMirrored((prev) => [...prev, { id: `mirrored-${prev.length}`, url: "" }]);
  };

  const persistLinks = () => {
    const error = validateMasterUrl(master.url);
    setMasterError(error);
    if (error) return false;

    const nextLinks = mergePostLinkTaskDraft(
      row.postLinks,
      masterIndex,
      master.url,
      mirrored.map((item) => item.url)
    );
    onSubmitPostLinks(nextLinks);
    setSavedLinks(nextLinks);
    return true;
  };

  const handleConfirmDeleteTask = () => {
    const sourceLinks = savedLinks ?? row.postLinks;
    const nextLinks = mergePostLinkTaskDraft(sourceLinks, masterIndex, "", []);
    onSubmitPostLinks(nextLinks);
    persistWebInsightFiles(row.id, []);
    onSubmitInsightReports([]);
    onOpenChange(false);
  };

  const persistInsightReports = () => {
    if (!pendingInsightFiles.length && !hasRemovedSubmittedInsight) return;

    const remainingSubmitted = submittedInsightFiles.filter(
      (file) => !removedSubmittedInsightIds.includes(file.name)
    );

    const nextWebInsightFiles = [
      ...remainingSubmitted.map(({ name, previewUrl, sizeLabel }) => ({
        name,
        previewUrl,
        sizeLabel: sizeLabel ?? "2.1 KB",
      })),
      ...pendingInsightFiles.map(({ name, previewUrl, sizeLabel }) => ({
        name,
        previewUrl,
        sizeLabel,
      })),
    ];
    persistWebInsightFiles(row.id, nextWebInsightFiles);
    const nextNames = mergeInsightReportFileNames(
      nextWebInsightFiles.map((file) => file.name),
      h5InsightFiles
    );
    onSubmitInsightReports(nextNames);
    setPendingInsightFiles([]);
    setRemovedSubmittedInsightIds([]);
    setUploadError(null);
  };

  const handleSaveAndUpdate = () => {
    if (activeTab === "links") {
      if (isDeletingTask) {
        setConfirmDeleteOpen(true);
        return;
      }
      persistLinks();
      return;
    }

    if (!canSaveInsight) return;
    setConfirmInsightOpen(true);
  };

  const handleConfirmInsightSave = () => {
    persistInsightReports();
  };

  const handleAiVerify = () => {
    if (!savedLinks || !masterVerified) return;
    const nextLinks = applyMockValidationToMasterLink(savedLinks, masterIndex);
    onSubmitPostLinks(nextLinks);
    setSavedLinks(nextLinks);
  };

  const handleRemoveSubmittedInsight = (fileId: string) => {
    setRemovedSubmittedInsightIds((prev) =>
      prev.includes(fileId) ? prev : [...prev, fileId]
    );
  };

  const handleRemovePendingInsight = (fileId: string) => {
    setPendingInsightFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleStageInsightFiles = (files: File[]) => {
    const nextPending: PendingInsightFile[] = [];
    let skipped = 0;

    files.forEach((file) => {
      const name = file.name;
      const exists =
        submittedInsightImages.some((item) => item.name === name) ||
        pendingInsightFiles.some((item) => item.name === name) ||
        nextPending.some((item) => item.name === name);
      if (exists) {
        skipped += 1;
        return;
      }
      nextPending.push({
        id: `${name}-${file.lastModified}`,
        name,
        previewUrl: URL.createObjectURL(file),
        sizeLabel: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      });
    });

    if (nextPending.length) {
      setPendingInsightFiles((current) => [...current, ...nextPending]);
      setUploadError(null);
    } else if (skipped > 0) {
      setUploadError(
        skipped === 1 ? "1 duplicate image was skipped." : `${skipped} duplicate images were skipped.`
      );
    }
  };

  const saveDisabled = activeTab === "links" ? !canSaveLinks : !canSaveInsight;

  return (
    <>
    <SheetContent
      side="right"
      className="flex h-full gap-0 bg-white p-0 data-[side=right]:w-full data-[side=right]:max-w-[520px] data-[side=right]:sm:max-w-[520px]"
    >
      <div className="shrink-0 border-b border-gray-100 bg-white">
        <SheetHeader className="gap-2 px-6 pt-5 pb-3 text-left">
          <div className="flex items-center gap-2 pr-8">
            <SheetTitle className="text-[18px] font-semibold text-gray-900">
              Task Management
            </SheetTitle>
            <span className="inline-flex h-[22px] items-center rounded-full border border-brand/25 bg-brand-50 px-2.5 text-[11px] font-semibold text-brand">
              {headerBadge}
            </span>
          </div>
          <SheetDescription className="text-[13px] leading-relaxed text-gray-500">
            Manage the master link, AI verification, and insight reports for the current task.
          </SheetDescription>
        </SheetHeader>

        <PostLinkManagementTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {activeTab === "links" ? (
            <div className="space-y-4 pb-2">
              <section className="space-y-4 rounded-xl border border-brand/15 bg-brand-50/5 p-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50/70 text-brand/80">
                    <Send size={15} strokeWidth={2} />
                  </span>
                  <h3 className="text-[15px] font-semibold text-gray-900">
                    Post Link
                  </h3>
                </div>

                <TaskLinkFieldRow
                  label="Master Link (Original Posts)"
                  inputId={`${baseId}-master`}
                  url={master.url}
                  statusLink={masterStatusLink}
                  source={getDisplaySource(master)}
                  variant="master"
                  error={masterError}
                  onUrlChange={(value) => {
                    setMaster((prev) => ({ ...prev, url: value }));
                    if (masterError) setMasterError(undefined);
                  }}
                  onBlur={() =>
                    setMasterError(
                      master.url.trim() ? validateMasterUrl(master.url) : undefined
                    )
                  }
                  onRemove={() => {
                    setMaster((prev) => ({ ...prev, url: "" }));
                    setMasterError(undefined);
                  }}
                />

                {mirrored.length > 0 ? (
                  <div className="space-y-3 border-t border-brand/10 pt-4">
                    <p className="text-[12px] font-semibold text-gray-700">
                      Mirrored Links{" "}
                      <span className="font-normal text-gray-400">(Cross-platform Reposts)</span>
                    </p>
                    {mirrored.map((item, index) => (
                      <TaskLinkFieldRow
                        key={item.id}
                        label={`Mirrored ${index + 1}`}
                        mirroredIndex={index + 1}
                        inputId={`${baseId}-mirrored-${item.id}`}
                        url={item.url}
                        statusLink={getDraftStatusLink(item.snapshot, item.url, "Mirrored")}
                        source={getDisplaySource(item)}
                        variant="mirrored"
                        onUrlChange={(value) =>
                          setMirrored((prev) =>
                            prev.map((entry) =>
                              entry.id === item.id ? { ...entry, url: value } : entry
                            )
                          )
                        }
                        onRemove={() =>
                          setMirrored((prev) => prev.filter((entry) => entry.id !== item.id))
                        }
                      />
                    ))}
                  </div>
                ) : null}

                {mirrored.length < MIRRORED_MAX ? (
                  <button
                    type="button"
                    onClick={handleAddMirrored}
                    disabled={!canAddMirrored}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors",
                      canAddMirrored
                        ? "text-brand hover:text-brand/80"
                        : "cursor-not-allowed text-gray-400"
                    )}
                  >
                    <Plus size={13} strokeWidth={2.25} />
                    Add Mirrored Link (Up to {MIRRORED_MAX})
                  </button>
                ) : null}
              </section>

              <section className="space-y-4 rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="text-[14px] font-semibold text-gray-900">Content Validation</h3>
                    <p className="text-[12px] leading-relaxed text-gray-500">
                      Run content validation for the current verified master link.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAiVerify}
                    disabled={!masterVerified}
                    className={cn(
                      "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold transition-colors",
                      masterVerified
                        ? "border border-amber-200 bg-amber-50 text-amber-600 hover:border-amber-300 hover:bg-amber-100/80"
                        : "cursor-not-allowed border border-gray-200 bg-gray-50 text-gray-400"
                    )}
                  >
                    <Sparkles size={13} strokeWidth={2.2} />
                    AI Verify
                  </button>
                </div>

                <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-3">
                  <p className="text-[11px] font-semibold text-gray-400">
                    Validation result
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {validation ? (
                      <>
                        <TaskValidationPill label="Caption" status={validation.caption} />
                        <TaskValidationPill label="Cover" status={validation.cover} />
                        <TaskValidationPill label="Video" status={validation.video} />
                      </>
                    ) : (
                      <>
                        <TaskValidationPlaceholder label="Caption" />
                        <TaskValidationPlaceholder label="Cover" />
                        <TaskValidationPlaceholder label="Video" />
                      </>
                    )}
                  </div>
                </div>
              </section>
            </div>
          ) : null}

          {activeTab === "insight" ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-gray-800">Submitted Reports</p>
                {submittedInsightImages.length ? (
                  <InsightReportImageGrid
                    files={submittedInsightImages}
                    variant="submitted"
                    onRemoveFile={handleRemoveSubmittedInsight}
                  />
                ) : (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center text-[12px] text-gray-400">
                    No insight reports uploaded yet.
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-gray-800">More Images</p>
                <FileUploadZone
                  title="Upload image here."
                  hint="Only PNG or JPG supported."
                  accept={ACCEPT_INPUT}
                  acceptedExtensions={ACCEPTED_EXTENSIONS}
                  maxBytes={20 * 1024 * 1024}
                  multiple
                  onFilesChange={handleStageInsightFiles}
                  error={uploadError}
                  onErrorChange={setUploadError}
                  variant="brand"
                />
              </div>

              {pendingInsightImages.length ? (
                <InsightReportImageGrid
                  files={pendingInsightImages}
                  variant="draft"
                  onRemoveFile={handleRemovePendingInsight}
                />
              ) : null}

              <div className="flex items-start gap-2 rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2.5 text-[11px] leading-relaxed text-amber-800">
                <AlertCircle size={14} strokeWidth={2.2} className="mt-0.5 shrink-0 text-amber-600" />
                <p>
                  Ensure this report matches the master link. Data will be auto-extracted for the
                  campaign report for your review.
                </p>
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
            disabled={saveDisabled}
            onClick={handleSaveAndUpdate}
          >
            Save & Update
          </Button>
        </SheetFooter>
      </div>
    </SheetContent>

    <ConfirmTaskUpdateDialog
      open={confirmDeleteOpen}
      onOpenChange={setConfirmDeleteOpen}
      onConfirm={handleConfirmDeleteTask}
    />

    <ConfirmReportUpdateDialog
      open={confirmInsightOpen}
      onOpenChange={setConfirmInsightOpen}
      onConfirm={handleConfirmInsightSave}
    />
    </>
  );
}

export function PostLinkManagementSheet({
  open,
  onOpenChange,
  row,
  masterIndex,
  initialTab = "links",
  onSubmitPostLinks,
  onSubmitInsightReports,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: PostingHubRow | null;
  masterIndex: number;
  initialTab?: PostLinkManagementTabId;
  onSubmitPostLinks: (links: PostLink[]) => void;
  onSubmitInsightReports: (files: string[]) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {open && row ? (
        <PostLinkManagementSheetPanel
          key={`${row.id}:${masterIndex}:${initialTab}:${open}`}
          row={row}
          masterIndex={masterIndex}
          initialTab={initialTab}
          onOpenChange={onOpenChange}
          onSubmitPostLinks={onSubmitPostLinks}
          onSubmitInsightReports={onSubmitInsightReports}
        />
      ) : null}
    </Sheet>
  );
}