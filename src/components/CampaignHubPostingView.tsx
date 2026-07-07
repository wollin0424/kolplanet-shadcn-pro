"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CampaignHubDetailHeader,
  CampaignHubDetailToolbar,
  CampaignHubToolbarActionButton,
} from "@/components/CampaignHubDetailToolbar";
import { CampaignHubH5LinkCell } from "@/components/CampaignHubH5LinkCell";
import {
  PostLinkPill,
  POST_LINK_PILL_WIDTH_CLASS,
  POST_LINK_TYPE_CLASS,
} from "@/components/PostLinkPill";
import { CampaignHubFilterSelect } from "@/components/CampaignHubFilterSelect";
import { InfluencerAvatar } from "@/components/InfluencerAvatar";
import PostingHubStatusSelect from "@/components/pipeline/PostingHubStatusSelect";
import { SetPostingDateDialog } from "@/components/SetPostingDateDialog";
import { EditPostLinkDialog } from "@/components/EditPostLinkDialog";
import { ImportPostLinksDialog } from "@/components/ImportPostLinksDialog";
import { UploadInsightReportDialog } from "@/components/UploadInsightReportDialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMockInfluencerAvatar } from "@/lib/mockInfluencerAvatars";
import {
  POSTING_HUB_MOCK_ROWS,
  POSTING_HUB_STATUS_OPTIONS,
  POST_LINK_STATUS_FILTER_OPTIONS,
  CONTENT_VALIDATION_FILTER_OPTIONS,
  applyMockValidationToMasterLink,
  applyMockValidationToPostLinks,
  buildInsightReportShareUrl,
  getInsightReportSharePageUrl,
  buildMockFetchedPostLinks,
  formatPostingPlanDate,
  getContentValidationTooltipDescription,
  getMasterPostLinks,
  getMasterLabel,
  getMirroredLabel,
  hasFetchedPostLinks,
  getPostLinkDateEntries,
  getVisibleMirroredLinks,
  getPostLinkStatus,
  getPostLinkTooltipCopy,
  getEffectiveMasterValidation,
  canShowMasterContentValidation,
  matchesContentValidationFilter,
  matchesPostLinkStatusFilter,
  type ContentValidationField,
  type ContentValidationFilter,
  type ContentValidationStatus,
  type PostLink,
  type PostLinkHealthStatus,
  type PostLinkStatusFilter,
  type PostLinkType,
  type PostingHubRow,
  type PostingHubStatus,
} from "@/lib/postingHubMock";
import { getH5PostingState, subscribeH5InsightSync } from "@/lib/h5PostingSubmissions";
import {
  mergeInsightReportFileNames,
  parseKolIdFromH5Path,
} from "@/lib/insightReportSync";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, Calendar, CheckCircle2, ChevronDown, Copy, FileText, FileX, MoreHorizontal, Paperclip, Pencil, RefreshCcw, Sparkles, Upload, X } from "@/lib/icons";

function mergePostingHubRowsInsightReports(rows: PostingHubRow[]): PostingHubRow[] {
  return rows.map((row) => {
    const kolId = parseKolIdFromH5Path(row.h5Path);
    if (!kolId) return row;

    const merged = mergeInsightReportFileNames(
      row.insightReports ?? [],
      getH5PostingState(kolId).insightDraftFiles
    );
    const current = row.insightReports ?? [];

    if (
      merged.length === current.length &&
      merged.every((name, index) => name === current[index])
    ) {
      return row;
    }

    return {
      ...row,
      insightReports: merged,
      insightReportShareUrl:
        merged.length > 0 ? buildInsightReportShareUrl(row.id) : row.insightReportShareUrl,
    };
  });
}

const STATUS_ICON_CLASS: Record<"success" | "warning" | "error", string> = {
  success: "text-emerald-600",
  warning: "text-amber-600",
  error: "text-red-600",
};

const VALIDATION_STATUS_CONFIG: Record<
  ContentValidationStatus,
  {
    pillSurfaceClassName: string;
    tagClassName: string;
    iconClassName: string;
    Icon: typeof CheckCircle2;
    title: string;
  }
> = {
  Verified: {
    pillSurfaceClassName: "border-emerald-200/90 bg-emerald-50",
    tagClassName: "border-emerald-200/90 bg-emerald-50 text-emerald-700",
    iconClassName: STATUS_ICON_CLASS.success,
    Icon: CheckCircle2,
    title: "Verified",
  },
  Mismatched: {
    pillSurfaceClassName: "border-red-200/90 bg-red-50",
    tagClassName: "border-red-200/90 bg-red-50 text-red-700",
    iconClassName: STATUS_ICON_CLASS.error,
    Icon: X,
    title: "Mismatched",
  },
  "Cannot Verify": {
    pillSurfaceClassName: "border-amber-200/90 bg-amber-50",
    tagClassName: "border-amber-200/90 bg-amber-50 text-amber-700",
    iconClassName: STATUS_ICON_CLASS.warning,
    Icon: AlertCircle,
    title: "Fetch Failed",
  },
  "No Draft": {
    pillSurfaceClassName: "border-gray-200 bg-gray-50",
    tagClassName: "border-gray-200 bg-gray-50 text-gray-600",
    iconClassName: "text-gray-400",
    Icon: FileX,
    title: "No Draft",
  },
};

const POSTING_DATE_TAG_PILL_WIDTH = "w-[76px] justify-center whitespace-nowrap";

function PostLinkTypeLabelPill({ label, linkType }: { label: string; linkType: PostLinkType }) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] shrink-0 items-center rounded-full border px-1.5 text-[11px] font-semibold leading-none",
        POSTING_DATE_TAG_PILL_WIDTH,
        POST_LINK_TYPE_CLASS[linkType]
      )}
    >
      {label}
    </span>
  );
}

function PostingDateTooltipContent({
  rows,
}: {
  rows: { label: string; value: string; linkType: PostLinkType }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-2 text-[12px] leading-snug">
          <PostLinkTypeLabelPill label={row.label} linkType={row.linkType} />
          <span className="font-medium text-gray-700">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const POST_LINK_ROW_CLASS = "flex h-7 min-w-0 items-center gap-1.5";

const ROW_ACTION_BUTTON_CLASS =
  "inline-grid size-[22px] shrink-0 place-items-center rounded-full border p-0 leading-none";

const POSTING_ROW_HOVER_ACTION_CLASS = "posting-row-hover-action";

function RowHoverAction({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        POSTING_ROW_HOVER_ACTION_CLASS,
        "pointer-events-none inline-flex shrink-0 items-center leading-none opacity-0 transition-opacity duration-200 group-hover/posting-row:pointer-events-auto group-hover/posting-row:opacity-100 group-focus-within/posting-row:pointer-events-auto group-focus-within/posting-row:opacity-100"
      )}
    >
      {children}
    </div>
  );
}

function LinkRowHoverAction({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        POSTING_ROW_HOVER_ACTION_CLASS,
        "pointer-events-none inline-flex shrink-0 items-center leading-none opacity-0 transition-opacity duration-200 group-hover/master-link:pointer-events-auto group-hover/master-link:opacity-100 group-focus-within/master-link:pointer-events-auto group-focus-within/master-link:opacity-100"
      )}
    >
      {children}
    </div>
  );
}

function ValidationRowHoverAction({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        POSTING_ROW_HOVER_ACTION_CLASS,
        "pointer-events-none inline-flex shrink-0 items-center leading-none opacity-0 transition-opacity duration-200 group-hover/validation-row:pointer-events-auto group-hover/validation-row:opacity-100 group-focus-within/validation-row:pointer-events-auto group-focus-within/validation-row:opacity-100"
      )}
    >
      {children}
    </div>
  );
}

function PostLinkRowAction({
  variant,
  onClick,
  ariaLabel,
  emphasized = false,
}: {
  variant: "edit" | "fetch";
  onClick: () => void;
  ariaLabel: string;
  emphasized?: boolean;
}) {
  const Icon = variant === "edit" ? Pencil : RefreshCcw;
  const isBrandStyled = emphasized || variant === "edit";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        ROW_ACTION_BUTTON_CLASS,
        isBrandStyled
          ? "border-brand/25 bg-brand-50 text-brand transition-colors hover:border-brand/40 hover:bg-brand-100/80"
          : "border-gray-200 bg-white text-gray-500 transition-colors hover:border-brand/30 hover:bg-brand-50/40 hover:text-brand"
      )}
    >
      <Icon size={12} strokeWidth={2.2} />
    </button>
  );
}

const VALIDATION_MICRO_PILL_CLASS =
  "inline-flex h-[22px] items-center gap-1 rounded-full border px-1.5 text-[10px] font-semibold leading-none";

const VALIDATION_MICRO_PILL_WIDTH: Record<ContentValidationField, string> = {
  Caption: "min-w-[69px]",
  Cover: "min-w-[60px]",
  Video: "min-w-[59px]",
};

function ValidationMicroIconSlot({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex size-[13px] shrink-0 items-center justify-center overflow-hidden leading-none">
      {children}
    </span>
  );
}

function ValidationMicroTooltipBody({
  label,
  status,
}: {
  label: ContentValidationField;
  status: ContentValidationStatus;
}) {
  const config = VALIDATION_STATUS_CONFIG[status];
  const description = getContentValidationTooltipDescription(label, status);

  return (
    <div className="flex flex-col gap-2">
      <span
        className={cn(
          "inline-flex w-fit rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-none",
          config.tagClassName
        )}
      >
        {config.title}
      </span>
      <p className="text-[11px] leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}

function validationStatusCaptureId(status: ContentValidationStatus) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

const FIGMA_VALIDATION_TOOLTIP_STATUSES: ContentValidationStatus[] = [
  "Verified",
  "Mismatched",
  "Cannot Verify",
  "No Draft",
];

function ValidationMicro({
  label,
  status,
  figmaTooltipPinned = false,
}: {
  label: ContentValidationField;
  status: ContentValidationStatus;
  figmaTooltipPinned?: boolean;
}) {
  const config = VALIDATION_STATUS_CONFIG[status];
  const Icon = config.Icon;

  const pill = (
    <span
      className={cn(
        VALIDATION_MICRO_PILL_CLASS,
        VALIDATION_MICRO_PILL_WIDTH[label],
        config.pillSurfaceClassName,
        "cursor-default text-gray-600"
      )}
    >
      <ValidationMicroIconSlot>
        <Icon size={13} strokeWidth={2.2} className={cn("shrink-0", config.iconClassName)} />
      </ValidationMicroIconSlot>
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );

  if (figmaTooltipPinned) {
    return (
      <div
        className="flex flex-col items-start gap-2"
        data-figma-capture={`posting-validation-tooltip-${validationStatusCaptureId(status)}`}
      >
        {pill}
        <div className="inline-flex w-[min(280px,calc(100vw-2rem))] max-w-none flex-col gap-0 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[12px] text-gray-900 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <ValidationMicroTooltipBody label={label} status={status} />
        </div>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger render={pill} />
      <TooltipContent
        variant="light"
        side="top"
        sideOffset={4}
        className="w-[min(280px,calc(100vw-2rem))] max-w-none gap-0 px-3 py-2.5"
      >
        <ValidationMicroTooltipBody label={label} status={status} />
      </TooltipContent>
    </Tooltip>
  );
}

function PostingValidationTooltipsFigmaCapture() {
  return (
    <div
      className="fixed left-0 top-0 z-[300] flex flex-col gap-5 p-20"
      data-figma-capture="posting-validation-tooltips-panel"
    >
      {FIGMA_VALIDATION_TOOLTIP_STATUSES.map((status) => (
        <ValidationMicro key={status} label="Caption" status={status} figmaTooltipPinned />
      ))}
    </div>
  );
}

const POST_LINK_TOOLTIP_POPUP_CLASS =
  "inline-flex w-[min(300px,calc(100vw-2rem))] max-w-none flex-col gap-0 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[12px] text-gray-900 shadow-[0_4px_16px_rgba(0,0,0,0.08)]";

type FigmaPostLinkTooltipSample = {
  id: string;
  links: PostLink[];
  multi?: boolean;
};

function getFigmaPostLinkTooltipSamples(): FigmaPostLinkTooltipSample[] {
  const p1 = POSTING_HUB_MOCK_ROWS.find((row) => row.id === "p1");
  const p2 = POSTING_HUB_MOCK_ROWS.find((row) => row.id === "p2");
  const p3 = POSTING_HUB_MOCK_ROWS.find((row) => row.id === "p3");
  const p8 = POSTING_HUB_MOCK_ROWS.find((row) => row.id === "p8");
  if (!p1?.postLinks || !p2?.postLinks?.[0] || !p3?.postLinks?.[0] || !p8?.postLinks?.[0]) return [];

  return [
    { id: "verified", links: [p1.postLinks[0]] },
    {
      id: "mirrored",
      links: p1.postLinks.filter((link) => link.type === "Mirrored"),
      multi: true,
    },
    { id: "data-fetch-failed", links: [p2.postLinks[0]] },
    { id: "missing-info", links: [p3.postLinks[0]] },
    { id: "private-account", links: [p8.postLinks[0]] },
  ];
}

function PostingPostLinkTooltipsFigmaCapture() {
  return (
    <div
      className="fixed left-0 top-0 z-[300] flex flex-col gap-5 p-20"
      data-figma-capture="posting-post-link-tooltips-panel"
    >
      {getFigmaPostLinkTooltipSamples().map((sample) => (
        <div
          key={sample.id}
          className="flex flex-col items-start"
          data-figma-capture={`posting-post-link-tooltip-${sample.id}`}
        >
          <div className={POST_LINK_TOOLTIP_POPUP_CLASS}>
            {sample.multi ? (
              <PostLinkMirroredTooltipContent links={sample.links} />
            ) : (
              <PostLinkTooltipContent link={sample.links[0]} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function PostLinkTooltipContent({ link }: { link: PostLink }) {
  const { tag, description, tagClassName } = getPostLinkTooltipCopy(link);

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.url}
          className="min-w-0 flex-1 truncate text-[12px] font-medium text-brand underline underline-offset-2"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {link.url}
        </a>
        <button
          type="button"
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-brand transition-colors hover:bg-brand-50"
          aria-label="Copy post link"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => void navigator.clipboard.writeText(link.url)}
        >
          <Copy size={13} strokeWidth={2} />
        </button>
      </div>
      <span
        className={cn(
          "inline-flex w-fit rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-none",
          tagClassName
        )}
      >
        {tag}
      </span>
      {description ? (
        <p className="text-[11px] leading-relaxed text-gray-500">{description}</p>
      ) : null}
    </div>
  );
}

function PostLinkPillWithTooltip({
  link,
  label,
  linkType,
}: {
  link: PostLink;
  label: string;
  linkType: PostLinkType;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <PostLinkPill
            label={label}
            linkType={linkType}
            status={getPostLinkStatus(link)}
            className="cursor-default"
          />
        }
      />
      <TooltipContent
        variant="light"
        side="top"
        align="start"
        className="w-[min(300px,calc(100vw-2rem))] max-w-none gap-0 px-3 py-2.5"
      >
        <PostLinkTooltipContent link={link} />
      </TooltipContent>
    </Tooltip>
  );
}

const POST_LINK_CELL_WIDTH = "w-[224px] min-w-[224px]";

function PostLinkMasterRow({
  link,
  label,
  trailingAction,
  onEdit,
  onFetch,
}: {
  link: PostLink;
  label: string;
  trailingAction: "edit" | "fetch" | null;
  onEdit?: () => void;
  onFetch?: () => void;
}) {
  const hasUrl = Boolean(link.url.trim());

  return (
    <div className={cn(POST_LINK_ROW_CLASS, "group/master-link w-fit max-w-full")}>
      {hasUrl ? (
        <PostLinkPillWithTooltip link={link} label={label} linkType="Master" />
      ) : (
        <span
          className={cn(
            "inline-flex h-[22px] items-center rounded-full border border-dashed border-gray-200 bg-gray-50 px-1.5 text-[11px] font-semibold leading-none text-gray-400",
            POST_LINK_PILL_WIDTH_CLASS
          )}
        >
          {label}
        </span>
      )}
      {trailingAction === "edit" ? (
        <LinkRowHoverAction>
          <PostLinkRowAction variant="edit" onClick={onEdit!} ariaLabel="Edit post links" />
        </LinkRowHoverAction>
      ) : trailingAction === "fetch" ? (
        <LinkRowHoverAction>
          <PostLinkRowAction variant="fetch" onClick={onFetch!} ariaLabel={`Fetch ${label}`} />
        </LinkRowHoverAction>
      ) : null}
    </div>
  );
}

function getPostLinkMasterTrailingAction(
  link: PostLink,
  hasAnyUrl: boolean
): "edit" | "fetch" | null {
  if (!link.url.trim()) return "fetch";
  if (hasAnyUrl) return "edit";
  return null;
}

function PostLinkMirroredTooltipContent({ links }: { links: PostLink[] }) {
  return (
    <ul className="flex flex-col">
      {links.map((link, index) => (
        <li
          key={`${link.url}-${index}`}
          className={cn("flex flex-col gap-2.5", index > 0 && "mt-3 border-t border-gray-100 pt-3")}
        >
          {links.length > 1 ? (
            <p className="text-[11px] font-semibold text-gray-500">
              {getMirroredLabel(index, links.length)}
            </p>
          ) : null}
          <PostLinkTooltipContent link={link} />
        </li>
      ))}
    </ul>
  );
}

function PostLinkMirroredPillWithTooltip({
  links,
  figmaTooltipOpen = false,
}: {
  links: PostLink[];
  figmaTooltipOpen?: boolean;
}) {
  const count = links.length;

  return (
    <Tooltip open={figmaTooltipOpen ? true : undefined}>
      <TooltipTrigger
        render={
          <span
            className="inline-flex cursor-default items-center"
            aria-label={count === 1 ? "Mirrored link" : `${count} mirrored links`}
          >
            <PostLinkPill
              label={count === 1 ? "Mirrored 1" : "Mirrored"}
              linkType="Mirrored"
              status="success"
              showStatusIcon={false}
              inlineCount={count > 1 ? count : undefined}
              className="pointer-events-none"
            />
          </span>
        }
      />
      <TooltipContent
        variant="light"
        side="top"
        align="start"
        className="w-[min(300px,calc(100vw-2rem))] max-w-none gap-0 px-3 py-2.5"
        data-figma-capture={figmaTooltipOpen ? "posting-mirrored-link-tooltip" : undefined}
      >
        <PostLinkMirroredTooltipContent links={links} />
      </TooltipContent>
    </Tooltip>
  );
}

function PostLinkMirroredGroup({
  links,
  showEdit,
  onEdit,
  figmaTooltipOpen = false,
}: {
  links: PostLink[];
  showEdit: boolean;
  onEdit?: () => void;
  figmaTooltipOpen?: boolean;
}) {
  return (
    <div className={cn(POST_LINK_ROW_CLASS, "group/master-link w-fit max-w-full")}>
      <PostLinkMirroredPillWithTooltip links={links} figmaTooltipOpen={figmaTooltipOpen} />
      {showEdit ? (
        <LinkRowHoverAction>
          <PostLinkRowAction variant="edit" onClick={onEdit!} ariaLabel="Edit post links" />
        </LinkRowHoverAction>
      ) : null}
    </div>
  );
}

function AutoValidateRowAction({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label="Auto Validate"
            className={cn(
              ROW_ACTION_BUTTON_CLASS,
              "transition-colors",
              disabled
                ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300"
                : "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100/80"
            )}
          >
            <Sparkles size={12} strokeWidth={2.2} />
          </button>
        }
      />
      <TooltipContent variant="light" side="top" sideOffset={4} className="px-2.5 py-1.5 text-[11px]">
        Auto Validate
      </TooltipContent>
    </Tooltip>
  );
}

function PostLinkEmptyState({ onFetch }: { onFetch: () => void }) {
  return (
    <div className={cn(POST_LINK_ROW_CLASS, "w-fit max-w-full")}>
      <PostLinkRowAction
        variant="fetch"
        emphasized
        onClick={onFetch}
        ariaLabel="Fetch post links"
      />
      <button
        type="button"
        onClick={onFetch}
        className="text-left text-[12px] text-gray-500 transition-colors hover:text-gray-600"
      >
        Not fetched yet
      </button>
    </div>
  );
}

function PostLinkCell({
  row,
  figmaMirroredTooltipOpen = false,
  onFetchPostLinks,
  onEditPostLink,
  onFetchMasterLink,
}: {
  row: PostingHubRow;
  figmaMirroredTooltipOpen?: boolean;
  onFetchPostLinks: (row: PostingHubRow) => void;
  onEditPostLink: (row: PostingHubRow) => void;
  onFetchMasterLink: (row: PostingHubRow, masterIndex: number) => void;
}) {
  const links = row.postLinks;
  const masters = getMasterPostLinks(links);
  const mirrored = getVisibleMirroredLinks(links);

  if (!hasFetchedPostLinks(links) && masters.length === 0 && mirrored.length === 0) {
    return <PostLinkEmptyState onFetch={() => onFetchPostLinks(row)} />;
  }

  const hasAnyUrl = hasFetchedPostLinks(links);

  return (
    <div className="flex min-w-0 flex-col gap-1 py-0.5">
      {masters.map((link, index) => (
        <PostLinkMasterRow
          key={`${link.url || "empty"}-${index}`}
          link={link}
          label={getMasterLabel(index, masters.length)}
          trailingAction={getPostLinkMasterTrailingAction(link, hasAnyUrl)}
          onEdit={() => onEditPostLink(row)}
          onFetch={() => onFetchMasterLink(row, index)}
        />
      ))}
      {mirrored.length ? (
        <div className="border-t border-gray-100/80 pt-1">
          <PostLinkMirroredGroup
            links={mirrored}
            showEdit={hasAnyUrl}
            onEdit={() => onEditPostLink(row)}
            figmaTooltipOpen={figmaMirroredTooltipOpen}
          />
        </div>
      ) : null}
    </div>
  );
}

function ValidationMicroPlaceholder({ label }: { label: ContentValidationField }) {
  return (
    <span
      className={cn(
        VALIDATION_MICRO_PILL_CLASS,
        VALIDATION_MICRO_PILL_WIDTH[label],
        "border-gray-200 bg-white text-gray-400"
      )}
    >
      <ValidationMicroIconSlot>
        <span aria-hidden className="text-[9px] font-semibold leading-none tracking-tight text-gray-300">
          --
        </span>
      </ValidationMicroIconSlot>
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
}

function ContentValidationUnvalidatedPills() {
  return (
    <>
      <ValidationMicroPlaceholder label="Caption" />
      <ValidationMicroPlaceholder label="Cover" />
      <ValidationMicroPlaceholder label="Video" />
    </>
  );
}

function ContentValidationPlaceholderRow({
  disabled,
  onAutoValidate,
}: {
  disabled: boolean;
  onAutoValidate: () => void;
}) {
  return (
    <div className={cn(POST_LINK_ROW_CLASS, "group/validation-row w-fit max-w-full")}>
      <ContentValidationUnvalidatedPills />
      <ValidationRowHoverAction>
        <AutoValidateRowAction disabled={disabled} onClick={onAutoValidate} />
      </ValidationRowHoverAction>
    </div>
  );
}

function ContentValidationMasterRow({
  link,
  onAutoValidate,
}: {
  link: PostLink;
  onAutoValidate: () => void;
}) {
  const hasUrl = Boolean(link.url.trim());
  const validation = getEffectiveMasterValidation(link);
  const canAutoValidate = canShowMasterContentValidation(link) && !link.validation;

  return (
    <div className={cn(POST_LINK_ROW_CLASS, "group/validation-row w-fit max-w-full")}>
      {!hasUrl ? (
        <span className="text-[11px] text-gray-300">—</span>
      ) : !validation ? (
        <ContentValidationUnvalidatedPills />
      ) : (
        <>
          <ValidationMicro label="Caption" status={validation.caption} />
          <ValidationMicro label="Cover" status={validation.cover} />
          <ValidationMicro label="Video" status={validation.video} />
        </>
      )}
      <ValidationRowHoverAction>
        <AutoValidateRowAction disabled={!canAutoValidate} onClick={onAutoValidate} />
      </ValidationRowHoverAction>
    </div>
  );
}

function ContentValidationMirroredRow() {
  return <div className={POST_LINK_ROW_CLASS} aria-hidden />;
}

function ContentValidationCell({
  row,
  onAutoValidate,
}: {
  row: PostingHubRow;
  onAutoValidate: (row: PostingHubRow, masterIndex: number) => void;
}) {
  const masters = getMasterPostLinks(row.postLinks);
  const mirrored = getVisibleMirroredLinks(row.postLinks);
  const hasFetchedMaster = masters.some((link) => link.url.trim());
  const isEmpty =
    !hasFetchedPostLinks(row.postLinks) && masters.length === 0 && mirrored.length === 0;

  if (isEmpty) {
    return (
      <ContentValidationPlaceholderRow disabled onAutoValidate={() => onAutoValidate(row, 0)} />
    );
  }

  if (masters.length === 0) {
    return (
      <div className="flex min-w-0 flex-col gap-1 py-0.5">
        <ContentValidationPlaceholderRow
          disabled={!hasFetchedMaster}
          onAutoValidate={() => onAutoValidate(row, 0)}
        />
        {mirrored.length ? (
          <div className="border-t border-gray-100/80 pt-1">
            <ContentValidationMirroredRow />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-1 py-0.5">
      {masters.map((link, index) => (
        <ContentValidationMasterRow
          key={`${link.url || "empty"}-${index}`}
          link={link}
          onAutoValidate={() => onAutoValidate(row, index)}
        />
      ))}
      {mirrored.length ? (
        <div className="border-t border-gray-100/80 pt-1">
          <ContentValidationMirroredRow />
        </div>
      ) : null}
    </div>
  );
}

function InsightReportTooltipContent({
  shareUrl,
  files,
}: {
  shareUrl?: string;
  files: string[];
}) {
  const fullShareUrl = shareUrl ? getInsightReportSharePageUrl(shareUrl) : undefined;

  const handleCopyLink = async () => {
    if (!fullShareUrl) return;
    try {
      await navigator.clipboard.writeText(fullShareUrl);
    } catch {
      // Clipboard may be unavailable outside secure context.
    }
  };

  return (
    <div className="flex min-w-[240px] flex-col gap-2.5">
      {fullShareUrl ? (
        <div className="flex min-w-0 items-center gap-2 border-b border-gray-100 pb-2.5">
          <a
            href={fullShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate text-[12px] font-medium text-brand underline decoration-brand/40 underline-offset-[3px] transition-colors hover:decoration-brand/60"
            title={fullShareUrl}
          >
            {fullShareUrl}
          </a>
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-brand transition-colors hover:bg-brand-50"
            aria-label="Copy share link"
          >
            <Copy size={14} strokeWidth={2} />
          </button>
        </div>
      ) : null}
      <ul className="flex flex-col gap-2">
        {files.map((fileName, index) => (
          <li key={`${fileName}-${index}`} className="flex min-w-0 items-center gap-2">
            <Paperclip size={14} strokeWidth={2} className="shrink-0 text-gray-400" />
            <span className="min-w-0 truncate text-[12px] font-medium leading-snug text-gray-800">
              {fileName}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InsightReportCell({
  files,
  shareUrl,
  onClick,
}: {
  files?: string[];
  shareUrl?: string;
  onClick: () => void;
}) {
  const reportFiles = files ?? [];
  const count = reportFiles.length;

  const badge = (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={
        count > 0
          ? "inline-flex cursor-pointer items-center gap-1 rounded-full border border-brand/25 bg-brand-50 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-brand transition-colors hover:border-brand/40 hover:bg-brand-100/70"
          : "inline-flex cursor-pointer items-center gap-1.5 text-[12px] text-gray-400 transition-colors hover:text-gray-600"
      }
      aria-label={
        count > 0
          ? `${count} insight ${count === 1 ? "report" : "reports"}`
          : "Upload insight report"
      }
    >
      <FileText size={count > 0 ? 12 : 14} className="shrink-0" strokeWidth={2} />
      {count}
    </button>
  );

  if (count === 0) return badge;

  return (
    <Tooltip>
      <TooltipTrigger render={badge} />
      <TooltipContent variant="light" side="top" align="start" className="px-3 py-2.5">
        <InsightReportTooltipContent shareUrl={shareUrl} files={reportFiles} />
      </TooltipContent>
    </Tooltip>
  );
}

function PostingDateCountBadge({
  count,
  rows,
}: {
  count: number;
  rows: { label: string; value: string; linkType: PostLinkType }[];
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className="inline-grid size-[18px] shrink-0 place-items-center rounded-full border border-gray-200 bg-gray-50 p-0 text-[10px] font-medium leading-none tabular-nums text-gray-500"
            aria-label={`${count} posting dates`}
          >
            {count}
          </span>
        }
      />
      <TooltipContent
        variant="light"
        side="top"
        align="start"
        className="flex flex-col gap-0 px-3.5 py-2.5"
      >
        <PostingDateTooltipContent rows={rows} />
      </TooltipContent>
    </Tooltip>
  );
}

function PostingDateCell({ row }: { row: PostingHubRow }) {
  const dateEntries = getPostLinkDateEntries(row.postLinks);
  const breakdownRows = dateEntries.map((entry) => ({
    label: entry.label,
    value: entry.date,
    linkType: entry.linkType,
  }));

  return (
    <div className="space-y-0.5 leading-snug">
      <p className="text-[11px] text-gray-400">
        <span>Plan:</span> <span>{row.planDate}</span>
      </p>
      {row.actualDate ? (
        <p className="flex items-center gap-1 text-[12px] font-semibold text-gray-900">
          <span>Actual:</span>
          <span>{row.actualDate}</span>
          {breakdownRows.length > 1 ? (
            <PostingDateCountBadge count={breakdownRows.length} rows={breakdownRows} />
          ) : null}
        </p>
      ) : (
        <p className="text-[11px] text-gray-400">
          <span>Actual:</span> <span>--</span>
        </p>
      )}
    </div>
  );
}

function PostingHubTable({
  figmaCapture = false,
  figmaPostingHoverRowId,
  figmaPostingHoverRowIds,
  figmaPostingActionsOpen = false,
  figmaPostingMirroredTooltipRowId,
  rows,
  selectedIds,
  onToggleAll,
  onToggleRow,
  onStatusChange,
  onSetPostingDate,
  onEditPostLink,
  onUploadInsightReport,
  onFetchPostLinks,
  onFetchMasterLink,
  onAutoValidate,
}: {
  figmaCapture?: boolean;
  figmaPostingHoverRowId?: string;
  figmaPostingHoverRowIds?: string[];
  figmaPostingActionsOpen?: boolean;
  figmaPostingMirroredTooltipRowId?: string;
  rows: PostingHubRow[];
  selectedIds: Set<string>;
  onToggleAll: (checked: boolean) => void;
  onToggleRow: (id: string, checked: boolean) => void;
  onStatusChange: (id: string, status: PostingHubStatus) => void;
  onSetPostingDate: (row: PostingHubRow) => void;
  onEditPostLink: (row: PostingHubRow) => void;
  onUploadInsightReport: (row: PostingHubRow) => void;
  onFetchPostLinks: (row: PostingHubRow) => void;
  onFetchMasterLink: (row: PostingHubRow, masterIndex: number) => void;
  onAutoValidate: (row: PostingHubRow, masterIndex: number) => void;
}) {
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));

  return (
    <div
      className={cn(
        "no-scrollbar min-h-0 flex-1 overflow-y-auto",
        figmaCapture && "figma-capture-posting-table"
      )}
    >
      <Table className="w-full table-auto border-separate border-spacing-0 text-[13px] [&_tbody_td]:border-b [&_tbody_td]:border-gray-100 [&_td]:px-5 [&_td]:align-middle [&_th]:border-b [&_th]:border-gray-100 [&_th]:px-5 [&_th]:align-middle">
        <TableHeader>
          <TableRow className="bg-gray-50/70 hover:bg-gray-50/70">
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onToggleAll(checked === true)}
                aria-label="Select all influencers"
              />
            </TableHead>
            <TableHead className="min-w-[180px] text-[11px] font-semibold text-gray-500">
              Influencer
            </TableHead>
            <TableHead className="min-w-[160px] py-3 text-[11px] font-semibold text-gray-500">
              H5 Link
            </TableHead>
            <TableHead className="min-w-[120px] text-[11px] font-semibold text-gray-500">
              Posting Status
            </TableHead>
            <TableHead className={cn(POST_LINK_CELL_WIDTH, "shrink-0 whitespace-normal px-5 pr-2 text-[11px] font-semibold text-gray-500")}>
              Post Link
            </TableHead>
            <TableHead className="min-w-[188px] pl-2 pr-5 text-[11px] font-semibold text-gray-500">
              Content Validation
            </TableHead>
            <TableHead className="min-w-[100px] text-[11px] font-semibold text-gray-500">
              Insight Report
            </TableHead>
            <TableHead className="min-w-[140px] text-[11px] font-semibold text-gray-500">
              Posting Date
            </TableHead>
            <TableHead className="w-12 text-[11px] font-semibold text-gray-500">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const hoveredRowIds = figmaPostingHoverRowIds?.length
              ? figmaPostingHoverRowIds
              : figmaPostingHoverRowId
                ? [figmaPostingHoverRowId]
                : [];
            const isFigmaHoveredRow = Boolean(
              hoveredRowIds.includes(row.id) ||
                (figmaPostingMirroredTooltipRowId && row.id === figmaPostingMirroredTooltipRowId)
            );
            const isFigmaMirroredTooltipOpen = Boolean(
              figmaPostingMirroredTooltipRowId && row.id === figmaPostingMirroredTooltipRowId
            );

            return (
            <TableRow
              key={row.id}
              className={cn(
                "group/posting-row hover:bg-gray-50/40",
                isFigmaHoveredRow && "figma-capture-posting-hovered-row bg-gray-50/40"
              )}
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(row.id)}
                  onCheckedChange={(checked) => onToggleRow(row.id, checked === true)}
                  aria-label={`Select ${row.name}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <InfluencerAvatar
                    src={getMockInfluencerAvatar(row.id)}
                    alt={row.name}
                    platform={row.platform}
                    size="sm"
                    fallback={initials(row.name)}
                    fallbackClassName="bg-violet-100 text-violet-700"
                  />
                    <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{row.name}</p>
                    <p className="mt-0.5 truncate text-[11px] text-gray-500">{row.handle}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="min-w-[160px] max-w-[220px] whitespace-normal py-4">
                <CampaignHubH5LinkCell path={row.h5Path} />
              </TableCell>
              <TableCell>
                <PostingHubStatusSelect
                  status={row.postingStatus}
                  onChange={(next) => onStatusChange(row.id, next)}
                />
              </TableCell>
              <TableCell className={cn(POST_LINK_CELL_WIDTH, "align-top whitespace-normal px-5 py-3 pr-2")}>
                <PostLinkCell
                  row={row}
                  figmaMirroredTooltipOpen={isFigmaMirroredTooltipOpen}
                  onFetchPostLinks={onFetchPostLinks}
                  onEditPostLink={onEditPostLink}
                  onFetchMasterLink={onFetchMasterLink}
                />
              </TableCell>
              <TableCell className="align-top py-3 pl-2 pr-5">
                <ContentValidationCell row={row} onAutoValidate={onAutoValidate} />
              </TableCell>
              <TableCell>
                <InsightReportCell
                  files={row.insightReports}
                  shareUrl={
                    row.insightReportShareUrl ??
                    (row.insightReports?.length ? buildInsightReportShareUrl(row.id) : undefined)
                  }
                  onClick={() => onUploadInsightReport(row)}
                />
              </TableCell>
              <TableCell>
                <PostingDateCell row={row} />
              </TableCell>
              <TableCell>
                <DropdownMenu open={isFigmaHoveredRow && figmaPostingActionsOpen ? true : undefined}>
                  <DropdownMenuTrigger
                    type="button"
                    className="inline-flex size-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    aria-label={`Actions for ${row.name}`}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal size={16} strokeWidth={2} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-auto min-w-[210px] p-1 text-[13px]">
                    <DropdownMenuItem
                      className="cursor-pointer gap-2.5 whitespace-nowrap rounded-md px-2.5 py-2 text-gray-800"
                      onSelect={() => onSetPostingDate(row)}
                    >
                      <Calendar size={16} className="shrink-0 text-brand" strokeWidth={2} />
                      Set Posting Date
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer gap-2.5 whitespace-nowrap rounded-md px-2.5 py-2 text-gray-800"
                      onSelect={() => onEditPostLink(row)}
                    >
                      <Pencil size={16} className="shrink-0 text-brand" strokeWidth={2} />
                      Edit Post Link
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer gap-2.5 whitespace-nowrap rounded-md px-2.5 py-2 text-gray-800"
                      onSelect={() => onUploadInsightReport(row)}
                    >
                      <Upload size={16} className="shrink-0 text-brand" strokeWidth={2} />
                      Upload Insight Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default function CampaignHubPostingView({
  campaignId,
  onBack,
  figmaCapture = false,
  figmaPostingHoverRowId,
  figmaPostingHoverRowIds,
  figmaPostingActionsOpen = false,
  figmaPostingMirroredTooltipRowId,
  figmaPostingValidationTooltips = false,
  figmaOpenSetPostingDate = false,
  figmaPostingPostLinkTooltips = false,
  figmaOpenEditPostLink = false,
  figmaEditPostLinkRowId,
  figmaEditPostLinkState = "full",
  figmaOpenUploadInsightReport = false,
  figmaInsightReportState,
  figmaUploadInsightRowId,
  figmaOpenImportPostLinks = false,
}: {
  campaignId: string;
  onBack: () => void;
  figmaCapture?: boolean;
  figmaPostingHoverRowId?: string;
  figmaPostingHoverRowIds?: string[];
  figmaPostingActionsOpen?: boolean;
  figmaPostingMirroredTooltipRowId?: string;
  figmaPostingValidationTooltips?: boolean;
  figmaOpenSetPostingDate?: boolean;
  figmaPostingPostLinkTooltips?: boolean;
  figmaOpenEditPostLink?: boolean;
  figmaEditPostLinkRowId?: string;
  figmaEditPostLinkState?: "empty" | "partial" | "full";
  figmaOpenUploadInsightReport?: boolean;
  figmaInsightReportState?: string;
  figmaUploadInsightRowId?: string;
  figmaOpenImportPostLinks?: boolean;
}) {
  const [rows, setRows] = useState(() =>
    figmaCapture ? POSTING_HUB_MOCK_ROWS : mergePostingHubRowsInsightReports(POSTING_HUB_MOCK_ROWS)
  );
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostingHubStatus | "All">("All");
  const [postLinkStatusFilter, setPostLinkStatusFilter] = useState<PostLinkStatusFilter>("All");
  const [contentValidationFilter, setContentValidationFilter] =
    useState<ContentValidationFilter>("All");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [postingDateDialog, setPostingDateDialog] = useState<{
    open: boolean;
    targetIds: string[];
    label: string;
  }>(() =>
    figmaCapture && figmaOpenSetPostingDate
      ? { open: true, targetIds: ["p1"], label: "Lucas Turner" }
      : { open: false, targetIds: [], label: "" }
  );
  const [editPostLinkDialog, setEditPostLinkDialog] = useState<{
    open: boolean;
    rowId: string | null;
  }>(() =>
    figmaCapture && figmaOpenEditPostLink
      ? { open: true, rowId: figmaEditPostLinkRowId ?? "p4" }
      : { open: false, rowId: null }
  );
  const [uploadInsightReportDialog, setUploadInsightReportDialog] = useState<{
    open: boolean;
    rowId: string | null;
  }>(() =>
    figmaCapture && figmaOpenUploadInsightReport
      ? { open: true, rowId: figmaUploadInsightRowId ?? "p3" }
      : { open: false, rowId: null }
  );
  const [importPostLinksDialogOpen, setImportPostLinksDialogOpen] = useState(
    () => figmaCapture && figmaOpenImportPostLinks
  );

  const uploadInsightReportRow = useMemo(
    () => rows.find((row) => row.id === uploadInsightReportDialog.rowId) ?? null,
    [uploadInsightReportDialog.rowId, rows]
  );

  const syncRowInsightReportsFromH5 = (kolId: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (parseKolIdFromH5Path(row.h5Path) !== kolId) return row;

        const merged = mergeInsightReportFileNames(row.insightReports ?? [], getH5PostingState(kolId).insightDraftFiles);
        const current = row.insightReports ?? [];

        if (
          merged.length === current.length &&
          merged.every((name, index) => name === current[index])
        ) {
          return row;
        }

        return {
          ...row,
          insightReports: merged,
          insightReportShareUrl:
            merged.length > 0 ? buildInsightReportShareUrl(row.id) : row.insightReportShareUrl,
        };
      })
    );
  };

  useEffect(() => {
    if (figmaCapture) return;
    return subscribeH5InsightSync(syncRowInsightReportsFromH5);
  }, [figmaCapture]);

  const editPostLinkRow = useMemo(
    () => rows.find((row) => row.id === editPostLinkDialog.rowId) ?? null,
    [editPostLinkDialog.rowId, rows]
  );

  const openPostingDateDialog = (targetIds: string[], label: string) => {
    setPostingDateDialog({ open: true, targetIds, label });
  };

  const handlePostingDateConfirm = ({ date, timezone }: { date: string; timezone: string }) => {
    const planDate = formatPostingPlanDate(date);
    setRows((prev) =>
      prev.map((row) =>
        postingDateDialog.targetIds.includes(row.id)
          ? { ...row, planDate, planTimezone: timezone }
          : row
      )
    );
  };

  const handleEditPostLinkSubmit = (postLinks: PostLink[]) => {
    if (!editPostLinkDialog.rowId) return;
    setRows((prev) =>
      prev.map((row) =>
        row.id === editPostLinkDialog.rowId ? { ...row, postLinks } : row
      )
    );
  };

  const handleBulkMarkAsApproved = () => {
    setRows((prev) =>
      prev.map((row) =>
        selectedIds.has(row.id) ? { ...row, postingStatus: "Post Approved" } : row
      )
    );
  };

  const handleUploadInsightReportSubmit = (files: string[]) => {
    if (!uploadInsightReportDialog.rowId) return;
    const rowId = uploadInsightReportDialog.rowId;
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              insightReports: files,
              insightReportShareUrl:
                files.length > 0 ? buildInsightReportShareUrl(rowId) : undefined,
            }
          : row
      )
    );
  };

  const handleFetchPostLinks = (row: PostingHubRow) => {
    setRows((prev) =>
      prev.map((item) =>
        item.id === row.id
          ? {
              ...item,
              postLinks: buildMockFetchedPostLinks(item),
              postingStatus: item.postingStatus === "Pending" ? "Posted" : item.postingStatus,
              actualDate: item.actualDate ?? item.planDate,
            }
          : item
      )
    );
  };

  const handleFetchMasterLink = (row: PostingHubRow, masterIndex: number) => {
    setRows((prev) =>
      prev.map((item) => {
        if (item.id !== row.id) return item;
        const links = [...(item.postLinks ?? [])];
        const masters = getMasterPostLinks(links);
        const target = masters[masterIndex];
        const fetchedLink: PostLink = {
          type: "Master",
          url: `https://www.instagram.com/p/${item.id}-master-${masterIndex + 1}/`,
          postedDate: item.actualDate ?? item.planDate,
        };

        if (target) {
          const linkIndex = links.indexOf(target);
          links[linkIndex] = { ...target, ...fetchedLink, validation: target.validation };
        } else {
          links.push(fetchedLink);
        }

        return {
          ...item,
          postLinks: links,
          postingStatus: item.postingStatus === "Pending" ? "Posted" : item.postingStatus,
          actualDate: item.actualDate ?? item.planDate,
        };
      })
    );
  };

  const handleAutoValidate = (row: PostingHubRow, masterIndex: number) => {
    const masters = getMasterPostLinks(row.postLinks);
    if (!masters[masterIndex]?.url.trim()) return;
    setRows((prev) =>
      prev.map((item) =>
        item.id === row.id
          ? { ...item, postLinks: applyMockValidationToMasterLink(item.postLinks, masterIndex) }
          : item
      )
    );
  };

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery =
        !normalized ||
        row.name.toLowerCase().includes(normalized) ||
        row.handle.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "All" || row.postingStatus === statusFilter;
      const matchesPostLinkStatus = matchesPostLinkStatusFilter(row, postLinkStatusFilter);
      const matchesContentValidation = matchesContentValidationFilter(row, contentValidationFilter);
      return matchesQuery && matchesStatus && matchesPostLinkStatus && matchesContentValidation;
    });
  }, [query, rows, statusFilter, postLinkStatusFilter, contentValidationFilter]);

  const toggleAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filtered.map((row) => row.id)));
  };

  const toggleRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const updateStatus = (id: string, status: PostingHubStatus) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, postingStatus: status } : row)));
  };

  return (
    <TooltipProvider delay={0} closeDelay={200}>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-3 overflow-hidden",
          figmaCapture && "figma-capture-posting-root",
          figmaCapture && figmaPostingValidationTooltips && "figma-capture-posting-validation-tooltips",
          figmaCapture && figmaPostingPostLinkTooltips && "figma-capture-posting-post-link-tooltips"
        )}
      >
      {figmaCapture && figmaPostingValidationTooltips ? <PostingValidationTooltipsFigmaCapture /> : null}
      {figmaCapture && figmaPostingPostLinkTooltips ? <PostingPostLinkTooltipsFigmaCapture /> : null}
      <CampaignHubDetailHeader title="Posting" onBack={onBack} />
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
          figmaCapture && "figma-capture-posting-card"
        )}
      >
        <span className="sr-only">{campaignId}</span>

        <CampaignHubDetailToolbar
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search Influencer by Name or Handle"
          filters={
            <>
              <CampaignHubFilterSelect
                label="Posting Status"
                value={statusFilter}
                options={["All", ...POSTING_HUB_STATUS_OPTIONS]}
                onChange={(value) => setStatusFilter(value as PostingHubStatus | "All")}
              />
              <CampaignHubFilterSelect
                label="Post Link Status"
                value={postLinkStatusFilter}
                options={POST_LINK_STATUS_FILTER_OPTIONS}
                onChange={(value) => setPostLinkStatusFilter(value as PostLinkStatusFilter)}
              />
              <CampaignHubFilterSelect
                label="Content Validation"
                value={contentValidationFilter}
                options={CONTENT_VALIDATION_FILTER_OPTIONS}
                onChange={(value) => setContentValidationFilter(value as ContentValidationFilter)}
              />
            </>
          }
          actions={
            <CampaignHubToolbarActionButton onClick={() => setImportPostLinksDialogOpen(true)}>
              <Upload size={13} />
              Import
            </CampaignHubToolbarActionButton>
          }
        />

        <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-2.5">
          <span className="text-[12px] font-medium text-gray-500">
            Influencer: <span className="tabular-nums text-gray-700">{filtered.length}</span>
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border bg-white px-2.5 text-[12px] font-medium transition-colors hover:bg-brand-50/40",
                selectedIds.size > 0
                  ? "border-brand/30 text-brand"
                  : "border-brand/20 text-brand/70"
              )}
            >
              Bulk Actions
              <ChevronDown size={13} className="shrink-0" strokeWidth={2} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[180px] w-auto text-[13px]">
              <DropdownMenuItem
                disabled={selectedIds.size === 0}
                className="whitespace-nowrap"
                onSelect={() =>
                  openPostingDateDialog(
                    [...selectedIds],
                    selectedIds.size === 1
                      ? (rows.find((row) => selectedIds.has(row.id))?.name ?? "selected influencer")
                      : `${selectedIds.size} influencers`
                  )
                }
              >
                Set Posting Date
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={selectedIds.size === 0}
                className="whitespace-nowrap"
                onSelect={handleBulkMarkAsApproved}
              >
                Mark as Approved
              </DropdownMenuItem>
              <DropdownMenuItem disabled={selectedIds.size === 0} className="whitespace-nowrap">
                Download
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <PostingHubTable
          figmaCapture={figmaCapture}
          figmaPostingHoverRowId={figmaPostingHoverRowId}
          figmaPostingHoverRowIds={figmaPostingHoverRowIds}
          figmaPostingActionsOpen={figmaPostingActionsOpen}
          figmaPostingMirroredTooltipRowId={figmaPostingMirroredTooltipRowId}
          rows={filtered}
          selectedIds={selectedIds}
          onToggleAll={toggleAll}
          onToggleRow={toggleRow}
          onStatusChange={updateStatus}
          onSetPostingDate={(row) => openPostingDateDialog([row.id], row.name)}
          onEditPostLink={(row) => setEditPostLinkDialog({ open: true, rowId: row.id })}
          onUploadInsightReport={(row) =>
            setUploadInsightReportDialog({ open: true, rowId: row.id })
          }
          onFetchPostLinks={handleFetchPostLinks}
          onFetchMasterLink={handleFetchMasterLink}
          onAutoValidate={handleAutoValidate}
        />
      </div>

      <SetPostingDateDialog
        open={postingDateDialog.open}
        onOpenChange={(open) => setPostingDateDialog((prev) => ({ ...prev, open }))}
        influencerLabel={postingDateDialog.label}
        onConfirm={handlePostingDateConfirm}
        figmaCapture={figmaCapture && figmaOpenSetPostingDate}
      />

      <EditPostLinkDialog
        open={editPostLinkDialog.open}
        onOpenChange={(open) => setEditPostLinkDialog((prev) => ({ ...prev, open }))}
        initialLinks={editPostLinkRow?.postLinks}
        onSubmit={handleEditPostLinkSubmit}
        figmaCapture={figmaCapture && figmaOpenEditPostLink}
        figmaEditPostLinkState={figmaEditPostLinkState}
      />

      <UploadInsightReportDialog
        open={uploadInsightReportDialog.open}
        onOpenChange={(open) => setUploadInsightReportDialog((prev) => ({ ...prev, open }))}
        initialFiles={uploadInsightReportRow?.insightReports}
        submissionLink={uploadInsightReportRow?.insightReportShareUrl}
        rowId={uploadInsightReportDialog.rowId ?? undefined}
        h5KolId={parseKolIdFromH5Path(uploadInsightReportRow?.h5Path ?? "")}
        onSubmit={handleUploadInsightReportSubmit}
        figmaCapture={figmaCapture && figmaOpenUploadInsightReport}
        figmaInsightReportState={figmaInsightReportState}
      />

      <ImportPostLinksDialog
        open={importPostLinksDialogOpen}
        onOpenChange={setImportPostLinksDialogOpen}
        figmaCapture={figmaCapture && figmaOpenImportPostLinks}
      />
    </div>
    </TooltipProvider>
  );
}
