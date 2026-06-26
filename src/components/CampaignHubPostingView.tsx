"use client";

import { forwardRef, useMemo, useState, type ComponentPropsWithoutRef } from "react";
import {
  CampaignHubDetailHeader,
  CampaignHubDetailToolbar,
  CampaignHubToolbarActionButton,
} from "@/components/CampaignHubDetailToolbar";
import { CampaignHubFilterSelect } from "@/components/CampaignHubFilterSelect";
import { InfluencerAvatar } from "@/components/InfluencerAvatar";
import PostingHubStatusSelect from "@/components/pipeline/PostingHubStatusSelect";
import { SetPostingDateDialog } from "@/components/SetPostingDateDialog";
import { EditPostLinkDialog } from "@/components/EditPostLinkDialog";
import { UpdatePostStatusDialog } from "@/components/UpdatePostStatusDialog";
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
  applyMockValidationToPostLinks,
  buildMockFetchedPostLinks,
  formatPostingPlanDate,
  getMasterContentValidation,
  getMasterPostLink,
  getPostLinkDateEntries,
  getPostLinksByType,
  getPostLinkStatus,
  getPostLinkTooltipCopy,
  type ContentValidationStatus,
  type PostLink,
  type PostLinkHealthStatus,
  type PostLinkType,
  type PostingHubRow,
  type PostingHubStatus,
} from "@/lib/postingHubMock";
import { cn } from "@/lib/utils";
import { TooltipLabeledRows } from "@/components/ui/tooltip-labeled-rows";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, Calendar, CheckCircle2, ChevronDown, Copy, Download, FileText, MoreHorizontal, Paperclip, Pencil, RefreshCcw, Sparkles, Upload, X } from "@/lib/icons";

const VALIDATION_STATUS_CONFIG: Record<
  ContentValidationStatus,
  { tagClassName: string; Icon: typeof CheckCircle2; title: string }
> = {
  Verified: {
    tagClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Icon: CheckCircle2,
    title: "Verified",
  },
  Mismatched: {
    tagClassName: "border-red-200 bg-red-50 text-red-700",
    Icon: X,
    title: "Mismatched",
  },
  "Cannot Verify": {
    tagClassName: "border-amber-200 bg-amber-50 text-amber-700",
    Icon: AlertCircle,
    title: "Fetch Failed",
  },
};

const POST_LINK_STATUS_CONFIG: Record<
  PostLinkHealthStatus,
  { iconClassName: string; tagClassName: string; Icon: typeof CheckCircle2; title: string }
> = {
  success: {
    iconClassName: "text-emerald-600",
    tagClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Icon: CheckCircle2,
    title: "Verified",
  },
  warning: {
    iconClassName: "text-amber-500",
    tagClassName: "border-amber-200 bg-amber-50 text-amber-700",
    Icon: AlertCircle,
    title: "Needs attention",
  },
  error: {
    iconClassName: "text-red-500",
    tagClassName: "border-red-200 bg-red-50 text-red-700",
    Icon: X,
    title: "Issue found",
  },
};

const POST_LINK_TYPE_CLASS: Record<PostLinkType, string> = {
  Master: "border-brand/25 bg-brand-50 text-brand",
  Mirrored: "border-gray-200 bg-gray-50 text-gray-500",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const PostLinkPill = forwardRef<
  HTMLSpanElement,
  {
    label: string;
    linkType: PostLinkType;
    status: PostLinkHealthStatus;
    className?: string;
  } & ComponentPropsWithoutRef<"span">
>(function PostLinkPill({ label, linkType, status, className, ...props }, ref) {
  const config = POST_LINK_STATUS_CONFIG[status];
  const Icon = config.Icon;

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-1 text-[11px] font-semibold leading-none",
        POST_LINK_TYPE_CLASS[linkType],
        className
      )}
      {...props}
    >
      <Icon size={11} strokeWidth={2.2} className={cn("shrink-0", config.iconClassName)} />
      {label}
    </span>
  );
});

function ValidationTag({
  label,
  status,
}: {
  label: string;
  status: ContentValidationStatus;
}) {
  const config = VALIDATION_STATUS_CONFIG[status];
  const Icon = config.Icon;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={cn(
              "inline-flex cursor-default items-center gap-1 rounded-full border px-1.5 py-1 text-[11px] font-semibold leading-none",
              config.tagClassName
            )}
          >
            <Icon size={11} strokeWidth={2.2} className="shrink-0" />
            {label}
          </span>
        }
      />
      <TooltipContent variant="light" side="top" sideOffset={4} className="px-2.5 py-1.5 text-[11px]">
        {config.title}
      </TooltipContent>
    </Tooltip>
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
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
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
      <p className="text-[11px] leading-relaxed text-gray-500">{description}</p>
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
            className="w-fit cursor-default"
          />
        }
      />
      <TooltipContent
        variant="light"
        side="bottom"
        align="start"
        className="w-[min(300px,calc(100vw-2rem))] max-w-none gap-0 px-3 py-2.5"
      >
        <PostLinkTooltipContent link={link} />
      </TooltipContent>
    </Tooltip>
  );
}

const POST_LINK_CELL_WIDTH = "w-[240px]";

function PostingHubEmptyActionButton({
  label,
  icon: Icon,
  onClick,
  disabled = false,
}: {
  label: string;
  icon: typeof RefreshCcw;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold leading-none transition-colors",
        disabled
          ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
          : "border-brand/20 bg-brand-50 text-brand hover:bg-brand-100/70"
      )}
    >
      <Icon size={11} strokeWidth={2.2} className="shrink-0" />
      {label}
    </button>
  );
}

function PostLinkCell({
  row,
  onFetchPostLinks,
}: {
  row: PostingHubRow;
  onFetchPostLinks: (row: PostingHubRow) => void;
}) {
  const links = row.postLinks;
  const master = getMasterPostLink(links);
  const mirrored = getPostLinksByType(links, "Mirrored");

  if (!master && !mirrored.length) {
    return (
      <PostingHubEmptyActionButton
        label="Fetch Post Links"
        icon={RefreshCcw}
        onClick={() => onFetchPostLinks(row)}
      />
    );
  }

  const pills: { key: string; link: PostLink; label: string; linkType: PostLinkType }[] = [];

  if (master) {
    pills.push({ key: "master", link: master, label: "Master", linkType: "Master" });
  }
  mirrored.forEach((link, index) => {
    pills.push({
      key: `${link.url}-${index}`,
      link,
      label: mirrored.length === 1 ? "Mirrored" : `Mirrored ${index + 1}`,
      linkType: "Mirrored",
    });
  });

  return (
    <div className="flex min-w-0 flex-wrap gap-1.5">
      {pills.map((pill) => (
        <PostLinkPillWithTooltip
          key={pill.key}
          link={pill.link}
          label={pill.label}
          linkType={pill.linkType}
        />
      ))}
    </div>
  );
}

function ContentValidationCell({
  row,
  onAutoValidate,
}: {
  row: PostingHubRow;
  onAutoValidate: (row: PostingHubRow) => void;
}) {
  const validation = getMasterContentValidation(row.postLinks);
  const hasMaster = Boolean(getMasterPostLink(row.postLinks));

  if (!validation) {
    return (
      <PostingHubEmptyActionButton
        label="Auto Validate"
        icon={Sparkles}
        onClick={() => onAutoValidate(row)}
        disabled={!hasMaster}
      />
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <ValidationTag label="Caption" status={validation.caption} />
      <ValidationTag label="Cover" status={validation.cover} />
      <ValidationTag label="Video" status={validation.video} />
    </div>
  );
}

function InsightReportCell({ files }: { files?: string[] }) {
  const reportFiles = files ?? [];
  const count = reportFiles.length;

  if (count === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-400">
        <FileText size={14} className="shrink-0" strokeWidth={2} />
        0
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className="inline-flex cursor-default items-center gap-1 rounded-full border border-brand/25 bg-brand-50 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-brand"
            aria-label={`${count} insight ${count === 1 ? "report" : "reports"}`}
          >
            <FileText size={12} strokeWidth={2} className="shrink-0" />
            {count}
          </span>
        }
      />
      <TooltipContent variant="light" side="bottom" align="start" className="min-w-[220px] px-3 py-2.5">
        <ul className="flex flex-col gap-2">
          {reportFiles.map((fileName) => (
            <li key={fileName} className="flex min-w-0 items-center gap-2">
              <Paperclip size={14} strokeWidth={2} className="shrink-0 text-gray-400" />
              <span className="min-w-0 text-[12px] font-medium leading-snug text-gray-800">{fileName}</span>
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

function PostingDateCountBadge({ count, rows }: { count: number; rows: { label: string; value: string }[] }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className="inline-flex size-[18px] cursor-default items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-[10px] font-medium tabular-nums text-gray-500"
            aria-label={`${count} posting dates`}
          >
            ({count})
          </span>
        }
      />
      <TooltipContent
        variant="light"
        side="bottom"
        align="start"
        className="flex flex-col gap-0 px-3.5 py-2.5"
      >
        <TooltipLabeledRows rows={rows} />
      </TooltipContent>
    </Tooltip>
  );
}

function PostingDateCell({ row }: { row: PostingHubRow }) {
  const dateEntries = getPostLinkDateEntries(row.postLinks);
  const breakdownRows = dateEntries.map((entry) => ({
    label: entry.label,
    value: entry.date,
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
        <p className="text-[11px] text-gray-400">—</p>
      )}
    </div>
  );
}

function PostingHubTable({
  rows,
  selectedIds,
  onToggleAll,
  onToggleRow,
  onStatusChange,
  onSetPostingDate,
  onEditPostLink,
  onUpdatePostStatus,
  onUploadInsightReport,
  onFetchPostLinks,
  onAutoValidate,
}: {
  rows: PostingHubRow[];
  selectedIds: Set<string>;
  onToggleAll: (checked: boolean) => void;
  onToggleRow: (id: string, checked: boolean) => void;
  onStatusChange: (id: string, status: PostingHubStatus) => void;
  onSetPostingDate: (row: PostingHubRow) => void;
  onEditPostLink: (row: PostingHubRow) => void;
  onUpdatePostStatus: (row: PostingHubRow) => void;
  onUploadInsightReport: (row: PostingHubRow) => void;
  onFetchPostLinks: (row: PostingHubRow) => void;
  onAutoValidate: (row: PostingHubRow) => void;
}) {
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));

  return (
    <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
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
            <TableHead className="min-w-[120px] text-[11px] font-semibold text-gray-500">
              Posting Status
            </TableHead>
            <TableHead className={cn(POST_LINK_CELL_WIDTH, "shrink-0 whitespace-normal px-5 pr-2 text-[11px] font-semibold text-gray-500")}>
              Post Link
            </TableHead>
            <TableHead className="min-w-[148px] pl-2 pr-5 text-[11px] font-semibold text-gray-500">
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
          {rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-gray-50/40">
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
              <TableCell>
                <PostingHubStatusSelect
                  status={row.postingStatus}
                  onChange={(next) => onStatusChange(row.id, next)}
                />
              </TableCell>
              <TableCell className={cn(POST_LINK_CELL_WIDTH, "whitespace-normal px-5 pr-2")}>
                <PostLinkCell row={row} onFetchPostLinks={onFetchPostLinks} />
              </TableCell>
              <TableCell className="pl-2 pr-5">
                <ContentValidationCell row={row} onAutoValidate={onAutoValidate} />
              </TableCell>
              <TableCell>
                <InsightReportCell files={row.insightReports} />
              </TableCell>
              <TableCell>
                <PostingDateCell row={row} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
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
                      onSelect={() => onUpdatePostStatus(row)}
                    >
                      <CheckCircle2 size={16} className="shrink-0 text-brand" strokeWidth={2} />
                      Update Post Status
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function CampaignHubPostingView({
  campaignId,
  onBack,
}: {
  campaignId: string;
  onBack: () => void;
}) {
  const [rows, setRows] = useState(POSTING_HUB_MOCK_ROWS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostingHubStatus | "All">("All");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [postingDateDialog, setPostingDateDialog] = useState<{
    open: boolean;
    targetIds: string[];
    label: string;
  }>({ open: false, targetIds: [], label: "" });
  const [editPostLinkDialog, setEditPostLinkDialog] = useState<{
    open: boolean;
    rowId: string | null;
  }>({ open: false, rowId: null });
  const [updatePostStatusDialog, setUpdatePostStatusDialog] = useState<{
    open: boolean;
    rowId: string | null;
  }>({ open: false, rowId: null });
  const [uploadInsightReportDialog, setUploadInsightReportDialog] = useState<{
    open: boolean;
    rowId: string | null;
  }>({ open: false, rowId: null });

  const uploadInsightReportRow = useMemo(
    () => rows.find((row) => row.id === uploadInsightReportDialog.rowId) ?? null,
    [uploadInsightReportDialog.rowId, rows]
  );

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

  const handleUpdatePostStatusConfirm = () => {
    if (!updatePostStatusDialog.rowId) return;
    setRows((prev) =>
      prev.map((row) =>
        row.id === updatePostStatusDialog.rowId
          ? { ...row, postingStatus: "Post Approved" }
          : row
      )
    );
  };

  const handleUploadInsightReportSubmit = (files: string[]) => {
    if (!uploadInsightReportDialog.rowId) return;
    setRows((prev) =>
      prev.map((row) =>
        row.id === uploadInsightReportDialog.rowId ? { ...row, insightReports: files } : row
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

  const handleAutoValidate = (row: PostingHubRow) => {
    if (!getMasterPostLink(row.postLinks)) return;
    setRows((prev) =>
      prev.map((item) =>
        item.id === row.id ? { ...item, postLinks: applyMockValidationToPostLinks(item.postLinks) } : item
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
      return matchesQuery && matchesStatus;
    });
  }, [query, rows, statusFilter]);

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
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <CampaignHubDetailHeader title="Posting" onBack={onBack} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <span className="sr-only">{campaignId}</span>

        <CampaignHubDetailToolbar
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search Influencer by Name or Handle"
          filters={
            <CampaignHubFilterSelect
              label="Posting Status"
              value={statusFilter}
              options={["All", ...POSTING_HUB_STATUS_OPTIONS]}
              onChange={(value) => setStatusFilter(value as PostingHubStatus | "All")}
            />
          }
          actions={
            <>
              <CampaignHubToolbarActionButton>
                <Upload size={13} />
                Import
              </CampaignHubToolbarActionButton>
              <CampaignHubToolbarActionButton>
                <Download size={13} />
                Download
              </CampaignHubToolbarActionButton>
            </>
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
              <DropdownMenuItem disabled={selectedIds.size === 0} className="whitespace-nowrap">
                Fetch Post Links
              </DropdownMenuItem>
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
              <DropdownMenuItem disabled={selectedIds.size === 0} className="whitespace-nowrap">
                Mark as Posted
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <PostingHubTable
          rows={filtered}
          selectedIds={selectedIds}
          onToggleAll={toggleAll}
          onToggleRow={toggleRow}
          onStatusChange={updateStatus}
          onSetPostingDate={(row) => openPostingDateDialog([row.id], row.name)}
          onEditPostLink={(row) => setEditPostLinkDialog({ open: true, rowId: row.id })}
          onUpdatePostStatus={(row) =>
            setUpdatePostStatusDialog({ open: true, rowId: row.id })
          }
          onUploadInsightReport={(row) =>
            setUploadInsightReportDialog({ open: true, rowId: row.id })
          }
          onFetchPostLinks={handleFetchPostLinks}
          onAutoValidate={handleAutoValidate}
        />
      </div>

      <SetPostingDateDialog
        open={postingDateDialog.open}
        onOpenChange={(open) => setPostingDateDialog((prev) => ({ ...prev, open }))}
        influencerLabel={postingDateDialog.label}
        onConfirm={handlePostingDateConfirm}
      />

      <EditPostLinkDialog
        open={editPostLinkDialog.open}
        onOpenChange={(open) => setEditPostLinkDialog((prev) => ({ ...prev, open }))}
        initialLinks={editPostLinkRow?.postLinks}
        onSubmit={handleEditPostLinkSubmit}
      />

      <UpdatePostStatusDialog
        open={updatePostStatusDialog.open}
        onOpenChange={(open) => setUpdatePostStatusDialog((prev) => ({ ...prev, open }))}
        onConfirm={handleUpdatePostStatusConfirm}
      />

      <UploadInsightReportDialog
        open={uploadInsightReportDialog.open}
        onOpenChange={(open) => setUploadInsightReportDialog((prev) => ({ ...prev, open }))}
        initialFiles={uploadInsightReportRow?.insightReports}
        onSubmit={handleUploadInsightReportSubmit}
      />
    </div>
    </TooltipProvider>
  );
}
