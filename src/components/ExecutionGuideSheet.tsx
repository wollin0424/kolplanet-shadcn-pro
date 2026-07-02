"use client";

import { useRef, useState, type ComponentProps, type ReactNode } from "react";
import { FileUploadZone } from "@/components/FileUploadZone";
import { TagInput, formatHashtagTag } from "@/components/TagInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formInputClass, formTextareaClass } from "@/lib/formControls";
import {
  getCampaignExecutionGuide,
  saveCampaignExecutionGuide,
} from "@/lib/campaignExecutionGuide";
import { cn } from "@/lib/utils";
import { ChevronDown, FileText, Languages, Link as LinkIcon, Plus, Sparkles, Trash2, X } from "@/lib/icons";

function SettingsInput({ className, ...props }: ComponentProps<typeof Input>) {
  return <Input className={formInputClass(className)} {...props} />;
}

function SettingsSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="border-b border-gray-100 pb-3 text-[14px] font-semibold tracking-tight text-gray-900">
      {children}
    </h3>
  );
}

function SettingsSection({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]",
        className
      )}
    >
      {children}
    </section>
  );
}

function CoreBadge() {
  return (
    <span className="inline-flex h-[18px] items-center rounded-full border border-brand/20 bg-brand-50 px-1.5 text-[10px] font-semibold leading-none text-brand">
      Core
    </span>
  );
}

function FieldLabel({
  label,
  hint,
  core = false,
}: {
  label: string;
  hint?: string;
  core?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[13px] font-medium leading-snug text-gray-800">{label}</p>
        {core ? <CoreBadge /> : null}
      </div>
      {hint ? <p className="text-[11px] leading-relaxed text-gray-400">{hint}</p> : null}
    </div>
  );
}

function FieldGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

function ChoiceFieldGroup({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4 border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
      {children}
    </div>
  );
}

function LimitedTextarea({
  value,
  onChange,
  placeholder,
  maxLength = 200,
  rows = 4,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
  rows?: number;
  className?: string;
}) {
  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        rows={rows}
        className={formTextareaClass(cn("min-h-[96px] resize-none pb-8", className))}
      />
      <span className="pointer-events-none absolute bottom-2.5 right-3 text-[11px] tabular-nums text-gray-400">
        {value.length} / {maxLength}
      </span>
    </div>
  );
}

function RadioChipGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-4 pt-1">
      {options.map((option) => {
        const selected = value === option;
        return (
          <label
            key={option}
            className="inline-flex min-h-[22px] cursor-pointer items-center gap-2.5"
          >
            <span
              className={cn(
                "inline-flex size-3.5 shrink-0 items-center justify-center rounded-full border",
                selected ? "border-brand bg-brand" : "border-gray-300 bg-white"
              )}
            >
              {selected ? <span className="size-1.5 rounded-full bg-white" /> : null}
            </span>
            <input
              type="radio"
              name={`radio-${options.join("-")}`}
              value={option}
              checked={selected}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            <span className="text-[13px] text-gray-700">{option}</span>
          </label>
        );
      })}
    </div>
  );
}

type BrandLogoFile = {
  name: string;
  previewUrl: string;
};

const MAX_BRAND_LOGO_BYTES = 500 * 1024;
const BRAND_IDENTITY_FIELD_CLASS = "h-[132px] min-h-[132px]";
const BRAND_LOGO_BOX_CLASS = "size-[132px] shrink-0";

function BrandLogoUploadField({
  value,
  onChange,
}: {
  value: BrandLogoFile | null;
  onChange: (value: BrandLogoFile | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > MAX_BRAND_LOGO_BYTES) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      onChange({ name: file.name, previewUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="sr-only"
        onChange={(e) => {
          handleFileChange(e.target.files);
          e.target.value = "";
        }}
      />

      {value ? (
        <div
          className={cn(
            "group/logo relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100",
            BRAND_LOGO_BOX_CLASS
          )}
        >
          <img src={value.previewUrl} alt={value.name} className="size-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover/logo:bg-black/45">
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex size-9 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover/logo:opacity-100 hover:bg-black/70"
              aria-label="Remove brand logo"
            >
              <Trash2 size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-200 bg-gray-50/40 px-2 py-3 text-center transition-colors hover:border-brand/30 hover:bg-brand-50/35",
            BRAND_LOGO_BOX_CLASS
          )}
        >
          <Plus size={14} className="text-brand" strokeWidth={2} />
          <span className="text-[12px] font-medium leading-tight text-brand">Click to upload</span>
          <span className="text-[10px] leading-tight text-gray-400">1:1, max 500KB</span>
        </button>
      )}
    </>
  );
}

function AttachmentListRow({
  icon: Icon,
  label,
  onRemove,
}: {
  icon: typeof FileText;
  label: string;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2">
      <Icon size={14} className="shrink-0 text-gray-400" strokeWidth={2} />
      <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-gray-700">{label}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-50 hover:text-gray-700"
          aria-label={`Remove ${label}`}
        >
          <X size={12} strokeWidth={2} />
        </button>
      ) : null}
    </div>
  );
}

const CONTENT_USAGE_OPTIONS = [
  "0 Days",
  "30 Days",
  "60 Days",
  "90 Days",
  "180 Days",
  "1 Year",
  "Permanent",
] as const;

const RETENTION_OPTIONS = ["30 Days", "60 Days", "180 Days", "Permanent"] as const;

const GUIDELINES_TARGET_LANGUAGES = [
  "Bahasa Indonesia",
  "Bahasa Melayu",
  "Thai",
  "Vietnamese",
  "Japanese",
  "English",
  "Chinese (Traditional)",
] as const;

function mockTranslateGuidelines(source: string, targetLanguage: string) {
  const trimmed = source.trim();
  if (!trimmed) return "";
  return `[${targetLanguage}] ${trimmed}`;
}

function mockOptimizeGuidelines(source: string) {
  const trimmed = source.trim();
  if (!trimmed) {
    return "Duration: 60s; Key visual: Product close-up; Tone: Professional & Elegant.";
  }

  return [
    "Duration: 60–90s",
    "Key visual: Product hero shot with natural lighting",
    "Tone: Authentic, concise, and platform-native",
    `Core message: ${trimmed}`,
    "CTA: Include required @mention and #hashtag naturally in caption",
  ].join("; ");
}

function guidelinesViewTabClass(active: boolean) {
  return cn(
    "inline-flex h-8 shrink-0 items-center border-b-2 px-2.5 text-[12px] font-medium leading-none transition-colors",
    active
      ? "border-brand text-gray-900"
      : "border-transparent text-gray-500 hover:text-gray-800"
  );
}

function GuidelinesTranslatorPopover({
  disabled = false,
  onTranslate,
}: {
  disabled?: boolean;
  onTranslate: (targetLanguage: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<string>(GUIDELINES_TARGET_LANGUAGES[0]);

  const canTranslate = Boolean(targetLanguage) && !disabled;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        disabled={disabled}
        className={cn(
          "inline-flex items-center gap-1 text-[12px] font-medium text-brand transition-colors hover:text-brand/80",
          "aria-expanded:text-brand",
          disabled && "cursor-not-allowed opacity-45"
        )}
      >
        <Languages size={13} className="text-brand" strokeWidth={2} />
        Translator
        <ChevronDown size={12} className="text-brand/80" strokeWidth={2} />
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={6} className="w-[280px] gap-0 p-0">
        <div className="border-b border-gray-100 px-4 py-3">
          <p className="text-[13px] font-semibold text-gray-900">Translate</p>
          <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
            Choose a target language for the guidelines.
          </p>
        </div>

        <div className="space-y-3 px-4 py-3.5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-gray-600">Target language</label>
            <Select
              modal={false}
              value={targetLanguage}
              onValueChange={(value) => {
                if (value) setTargetLanguage(value);
              }}
            >
              <SelectTrigger className="h-9 w-full border-gray-200 bg-white text-[12px] shadow-none">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {GUIDELINES_TARGET_LANGUAGES.map((language) => (
                  <SelectItem key={language} value={language} className="text-xs">
                    {language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="brand"
            className="h-8 w-full text-[12px]"
            disabled={!canTranslate}
            onClick={() => {
              if (!canTranslate) return;
              onTranslate(targetLanguage);
              setOpen(false);
            }}
          >
            Translate
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ContentGuidelinesCoreBlock({
  guidelines,
  onGuidelinesChange,
  mention,
  onMentionChange,
  hashtag,
  onHashtagChange,
  briefFiles,
  onRemoveBriefFile,
  onBriefFileAdd,
  referenceLinks,
  onRemoveReferenceLink,
  linkDraft,
  onLinkDraftChange,
  onAddLink,
}: {
  guidelines: string;
  onGuidelinesChange: (value: string) => void;
  mention: string[];
  onMentionChange: (value: string[]) => void;
  hashtag: string[];
  onHashtagChange: (value: string[]) => void;
  briefFiles: string[];
  onRemoveBriefFile: (index: number) => void;
  onBriefFileAdd: (file: File) => void;
  referenceLinks: string[];
  onRemoveReferenceLink: (index: number) => void;
  linkDraft: string;
  onLinkDraftChange: (value: string) => void;
  onAddLink: () => void;
}) {
  const [guidelinesView, setGuidelinesView] = useState<"original" | "translation">("original");
  const [guidelinesTranslation, setGuidelinesTranslation] = useState("");
  const [guidelinesTargetLanguage, setGuidelinesTargetLanguage] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);

  const hasTranslation = Boolean(guidelinesTranslation.trim());
  const activeGuidelines =
    guidelinesView === "translation" && hasTranslation ? guidelinesTranslation : guidelines;

  const handleGuidelinesChange = (value: string) => {
    if (guidelinesView === "translation" && hasTranslation) {
      setGuidelinesTranslation(value);
      return;
    }
    onGuidelinesChange(value);
  };

  const handleTranslate = (targetLanguage: string) => {
    const translated = mockTranslateGuidelines(guidelines, targetLanguage);
    if (!translated) return;
    setGuidelinesTranslation(translated);
    setGuidelinesTargetLanguage(targetLanguage);
    setGuidelinesView("translation");
  };

  const handleAiOptimize = () => {
    if (isOptimizing) return;

    setIsOptimizing(true);
    window.setTimeout(() => {
      onGuidelinesChange(mockOptimizeGuidelines(guidelines));
      setGuidelinesTranslation("");
      setGuidelinesTargetLanguage("");
      setGuidelinesView("original");
      setIsOptimizing(false);
    }, 900);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div
        className={cn(
          "bg-gray-50/40 px-4 py-3",
          !hasTranslation && "border-b border-gray-100"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <FieldLabel label="Content Guidelines" core />
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              disabled={isOptimizing}
              onClick={handleAiOptimize}
              className={cn(
                "inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-600 transition-colors hover:text-amber-700",
                isOptimizing && "cursor-wait opacity-70"
              )}
            >
              <Sparkles size={13} className="text-amber-600" strokeWidth={2} />
              {isOptimizing ? "Optimizing..." : "AI Optimize"}
            </button>
            <GuidelinesTranslatorPopover
              disabled={!guidelines.trim()}
              onTranslate={handleTranslate}
            />
          </div>
        </div>

        {hasTranslation ? (
          <div className="mt-3 flex items-center gap-0.5 border-b border-gray-100">
            <button
              type="button"
              onClick={() => setGuidelinesView("original")}
              className={guidelinesViewTabClass(guidelinesView === "original")}
            >
              Original
            </button>
            <button
              type="button"
              onClick={() => setGuidelinesView("translation")}
              className={guidelinesViewTabClass(guidelinesView === "translation")}
            >
              Translation
              {guidelinesTargetLanguage ? (
                <span className="ml-1 text-[11px] font-normal text-gray-400">
                  ({guidelinesTargetLanguage})
                </span>
              ) : null}
            </button>
          </div>
        ) : null}
      </div>

      <Textarea
        value={activeGuidelines}
        onChange={(e) => handleGuidelinesChange(e.target.value)}
        placeholder="e.g., Duration: 60s; Key visual: Product close-up; Tone: Professional & Elegant."
        rows={6}
        className="min-h-[140px] resize-none rounded-none border-0 bg-white px-4 py-3.5 text-[13px] leading-relaxed shadow-none placeholder:text-gray-300 focus-visible:ring-0"
      />

      <div className="border-t border-gray-100 px-4 py-3.5">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-gray-600">Mention</label>
            <TagInput
              value={mention}
              onChange={onMentionChange}
              placeholder="Type and press Enter"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-gray-600">Hashtag</label>
            <TagInput
              value={hashtag}
              onChange={onHashtagChange}
              placeholder="Type and press Enter"
              formatTag={formatHashtagTag}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t border-gray-100 px-4 py-3.5">
        <FileUploadZone
          title="Upload Briefs"
          hint="PDF / Image, up to 5 files"
          variant="brand"
          accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
          acceptedExtensions={[".pdf", ".png", ".jpg", ".jpeg", ".webp"]}
          onFileChange={(file) => {
            if (file) onBriefFileAdd(file);
          }}
        />
        {briefFiles.length > 0 ? (
          <div className="space-y-2">
            {briefFiles.map((file, index) => (
              <AttachmentListRow
                key={`${file}-${index}`}
                icon={FileText}
                label={file}
                onRemove={() => onRemoveBriefFile(index)}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-3 border-t border-gray-100 px-4 py-3.5">
        <label className="text-[12px] font-medium text-gray-600">Add Link</label>
        <div className="flex items-center gap-3">
          <SettingsInput
            value={linkDraft}
            onChange={(e) => onLinkDraftChange(e.target.value)}
            placeholder="Please enter the link."
            onKeyDown={(e) => {
              if (e.key === "Enter") onAddLink();
            }}
          />
          <button
            type="button"
            onClick={onAddLink}
            disabled={!linkDraft.trim()}
            className="shrink-0 text-[13px] font-medium text-brand transition-colors hover:text-brand/80 disabled:cursor-not-allowed disabled:text-gray-300"
          >
            Add Link
          </button>
        </div>
        {referenceLinks.length > 0 ? (
          <div className="space-y-2">
            {referenceLinks.map((url, index) => (
              <AttachmentListRow
                key={`${url}-${index}`}
                icon={LinkIcon}
                label={url}
                onRemove={() => onRemoveReferenceLink(index)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

const REQUIRED_OPTIONS = ["Required", "Not Required"] as const;

export function ExecutionGuideSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex h-full w-full flex-col gap-0 border-l border-gray-100 bg-[#f8f9fb] p-0 data-[side=right]:max-w-[540px] data-[side=right]:sm:max-w-[540px]"
      >
        {open ? <ExecutionGuideSheetForm onOpenChange={onOpenChange} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function ExecutionGuideSheetForm({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const guide = getCampaignExecutionGuide();

  const [brandLogo, setBrandLogo] = useState<BrandLogoFile | null>(null);
  const [brandDescription, setBrandDescription] = useState("");
  const [previewLink, setPreviewLink] = useState("");
  const [objectives, setObjectives] = useState("");
  const [contentGuidelines, setContentGuidelines] = useState(guide.contentGuidelines);
  const [mention, setMention] = useState(guide.mention);
  const [hashtag, setHashtag] = useState(guide.hashtag);
  const [briefFiles, setBriefFiles] = useState(guide.briefFiles);
  const [referenceLinks, setReferenceLinks] = useState(guide.referenceLinks);
  const [linkDraft, setLinkDraft] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [contentUsage, setContentUsage] = useState<string>("60 Days");
  const [postRetention, setPostRetention] = useState<string>("Permanent");
  const [postBoosting, setPostBoosting] = useState<string>("60 Days");
  const [competitorExclusivity, setCompetitorExclusivity] = useState(true);
  const [competitorNotes, setCompetitorNotes] = useState("");
  const [collabPost, setCollabPost] = useState<string>("Required");
  const [onsiteEvent, setOnsiteEvent] = useState(true);
  const [onsiteNotes, setOnsiteNotes] = useState("");
  const [partnershipLabel, setPartnershipLabel] = useState<string>("Required");

  const handleAddLink = () => {
    const trimmed = linkDraft.trim();
    if (!trimmed) return;
    setReferenceLinks((prev) => [...prev, trimmed]);
    setLinkDraft("");
  };

  const handleSave = () => {
    saveCampaignExecutionGuide({
      contentGuidelines,
      mention,
      hashtag,
      briefFiles,
      referenceLinks,
    });
    onOpenChange(false);
  };

  return (
    <>
      <SheetHeader className="shrink-0 flex-row items-center justify-between gap-3 border-b border-gray-100 bg-white px-6 py-5 text-left">
        <SheetTitle className="text-[18px] font-semibold text-gray-900">Execution Guide</SheetTitle>
        <SheetClose
          render={
            <button
              type="button"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            />
          }
        >
          <X size={16} strokeWidth={2} />
        </SheetClose>
      </SheetHeader>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          <SettingsSection className="space-y-5">
            <SettingsSectionTitle>Brand Identity</SettingsSectionTitle>

            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_132px]">
              <div className="space-y-3">
                <FieldLabel label="Brand Description" />
                <LimitedTextarea
                  value={brandDescription}
                  onChange={setBrandDescription}
                  placeholder="Brief description of the brand..."
                  className={BRAND_IDENTITY_FIELD_CLASS}
                />
              </div>

              <div className="space-y-3">
                <FieldLabel label="Brand Logo" core />
                <BrandLogoUploadField value={brandLogo} onChange={setBrandLogo} />
              </div>
            </div>

            <div className="space-y-3">
              <FieldLabel
                label="Preview Link"
                core
                hint="URL format validation required."
              />
              <SettingsInput
                value={previewLink}
                onChange={(e) => setPreviewLink(e.target.value)}
                placeholder="https://"
              />
            </div>
          </SettingsSection>

          <SettingsSection className="space-y-5">
            <SettingsSectionTitle>Execution Details</SettingsSectionTitle>

            <div className="space-y-3">
              <FieldLabel
                label="Objectives"
                hint="Project objective / KPI, such as view target or CPM target."
              />
              <SettingsInput
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                placeholder="e.g., 1M Views, $2 CPM target, or Brand Awareness."
              />
            </div>

            <ContentGuidelinesCoreBlock
                guidelines={contentGuidelines}
                onGuidelinesChange={setContentGuidelines}
                mention={mention}
                onMentionChange={setMention}
                hashtag={hashtag}
                onHashtagChange={setHashtag}
                briefFiles={briefFiles}
                onRemoveBriefFile={(index) =>
                  setBriefFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index))
                }
                onBriefFileAdd={(file) =>
                  setBriefFiles((prev) => [...prev, file.name].slice(0, 5))
                }
                referenceLinks={referenceLinks}
                onRemoveReferenceLink={(index) =>
                  setReferenceLinks((prev) => prev.filter((_, linkIndex) => linkIndex !== index))
                }
                linkDraft={linkDraft}
                onLinkDraftChange={setLinkDraft}
                onAddLink={handleAddLink}
            />
          </SettingsSection>

          <SettingsSection className="space-y-7">
            <SettingsSectionTitle>Commercial Terms &amp; Rights</SettingsSectionTitle>

            <FieldGroup>
              <FieldLabel label="Deliverables Details" core />
              <LimitedTextarea
                value={deliverables}
                onChange={setDeliverables}
                placeholder='e.g., Instagram Reels*1, TikTok Video*1, Link in Bios...'
                rows={3}
                maxLength={200}
              />
            </FieldGroup>

            <ChoiceFieldGroup>
              <FieldLabel
                label="Content Usage"
                core
                hint="Permission to download and reuse the content on brand's official channels (Social media, website, ads)."
              />
              <RadioChipGroup
                options={[...CONTENT_USAGE_OPTIONS]}
                value={contentUsage}
                onChange={setContentUsage}
              />
            </ChoiceFieldGroup>

            <ChoiceFieldGroup>
              <FieldLabel label="Post Retention" core />
              <RadioChipGroup
                options={[...RETENTION_OPTIONS]}
                value={postRetention}
                onChange={setPostRetention}
              />
            </ChoiceFieldGroup>

            <ChoiceFieldGroup>
              <FieldLabel
                label="Post Boosting"
                core
                hint="Grant brand access to promote the post."
              />
              <RadioChipGroup
                options={[...CONTENT_USAGE_OPTIONS]}
                value={postBoosting}
                onChange={setPostBoosting}
              />
            </ChoiceFieldGroup>

            <FieldGroup>
              <div className="flex items-start justify-between gap-4">
                <FieldLabel label="Competitor Exclusivity" />
                <Switch checked={competitorExclusivity} onCheckedChange={setCompetitorExclusivity} />
              </div>
              {competitorExclusivity ? (
                <LimitedTextarea
                  value={competitorNotes}
                  onChange={setCompetitorNotes}
                  placeholder=""
                  rows={3}
                  maxLength={200}
                />
              ) : null}
            </FieldGroup>

            <ChoiceFieldGroup>
              <FieldLabel
                label="Collab Post"
                hint="Influencer must accept the collab invite within 24h."
              />
              <RadioChipGroup
                options={[...REQUIRED_OPTIONS]}
                value={collabPost}
                onChange={setCollabPost}
              />
            </ChoiceFieldGroup>

            <FieldGroup>
              <div className="flex items-start justify-between gap-4">
                <FieldLabel label="Onsite / Event" />
                <Switch checked={onsiteEvent} onCheckedChange={setOnsiteEvent} />
              </div>
              {onsiteEvent ? (
                <LimitedTextarea
                  value={onsiteNotes}
                  onChange={setOnsiteNotes}
                  placeholder=""
                  rows={3}
                  maxLength={200}
                />
              ) : null}
            </FieldGroup>

            <ChoiceFieldGroup>
              <FieldLabel
                label="Partnership Label"
                hint="Operation guide / screenshot should be shown automatically for the influencer."
              />
              <RadioChipGroup
                options={[...REQUIRED_OPTIONS]}
                value={partnershipLabel}
                onChange={setPartnershipLabel}
              />
            </ChoiceFieldGroup>
          </SettingsSection>
        </div>
      </div>

      <SheetFooter className="shrink-0 flex-row justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
        <Button
          type="button"
          variant="outline"
          className="h-9 rounded-lg border-gray-200 px-4 text-[13px] text-gray-600"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="brand"
          className="h-9 rounded-lg px-5 text-[13px]"
          onClick={handleSave}
        >
          Save
        </Button>
      </SheetFooter>
    </>
  );
}
