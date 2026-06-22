"use client";

import { useRef, useState, type ComponentProps, type ReactNode } from "react";
import { FileUploadZone } from "@/components/FileUploadZone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formInputClass, formTextareaClass } from "@/lib/formControls";
import { cn } from "@/lib/utils";
import { FileText, Languages, Link as LinkIcon, Plus, Sparkles, X } from "@/lib/icons";

function SettingsInput({ className, ...props }: ComponentProps<typeof Input>) {
  return <Input className={formInputClass(className)} {...props} />;
}

function SettingsSectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-7 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
      <h3 className="text-[18px] font-semibold leading-none text-gray-800">{children}</h3>
    </div>
  );
}

function CoreBadge() {
  return (
    <span className="inline-flex h-5 items-center rounded-full border border-sky-600/40 bg-sky-50 px-1.5 text-[10px] font-medium text-sky-700">
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
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[16px] font-medium leading-5 text-gray-800">{label}</p>
        {core ? <CoreBadge /> : null}
      </div>
      {hint ? <p className="text-[12px] leading-4 text-gray-400">{hint}</p> : null}
    </div>
  );
}

function LimitedTextarea({
  value,
  onChange,
  placeholder,
  maxLength = 200,
  rows = 4,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        rows={rows}
        className={formTextareaClass("min-h-[120px] resize-none")}
      />
      <p className="text-right text-[14px] text-gray-300 tabular-nums">
        {value.length} / {maxLength}
      </p>
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
    <div className="flex flex-wrap gap-x-8 gap-y-3 py-4">
      {options.map((option) => {
        const selected = value === option;
        return (
          <label key={option} className="inline-flex cursor-pointer items-center gap-2">
            <span
              className={cn(
                "inline-flex size-4 shrink-0 items-center justify-center rounded-full border",
                selected ? "border-brand bg-brand" : "border-gray-400 bg-white"
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
            <span className="text-[14px] text-gray-900">{option}</span>
          </label>
        );
      })}
    </div>
  );
}

function UploadDropzone({
  title,
  subtitle,
  onPick,
}: {
  title: string;
  subtitle: string;
  onPick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="flex h-[120px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white px-2 py-6 text-center transition-colors hover:border-brand/35 hover:bg-brand-50/30"
    >
      <Plus size={14} className="text-brand" strokeWidth={2} />
      <span className="text-[14px] font-medium text-brand">{title}</span>
      <span className="text-[12px] text-gray-400">{subtitle}</span>
    </button>
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
    <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2">
      <Icon size={14} className="shrink-0 text-gray-500" strokeWidth={2} />
      <span className="min-w-0 flex-1 truncate text-[12px] text-gray-600">{label}</span>
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
  mention: string;
  onMentionChange: (value: string) => void;
  hashtag: string;
  onHashtagChange: (value: string) => void;
  briefFiles: string[];
  onRemoveBriefFile: (index: number) => void;
  onBriefFileAdd: (file: File) => void;
  referenceLinks: string[];
  onRemoveReferenceLink: (index: number) => void;
  linkDraft: string;
  onLinkDraftChange: (value: string) => void;
  onAddLink: () => void;
}) {
  const maxLength = 200;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="border-b border-gray-100 px-5 py-4">
        <FieldLabel label="Content Guidelines" core />
      </div>

      <Textarea
        value={guidelines}
        onChange={(e) => onGuidelinesChange(e.target.value.slice(0, maxLength))}
        placeholder="e.g., Duration: 60s; Key visual: Product close-up; Tone: Professional & Elegant."
        rows={6}
        className="min-h-[160px] resize-none rounded-none border-0 bg-white px-5 py-4 text-[14px] leading-relaxed shadow-none placeholder:text-gray-300 focus-visible:ring-0"
      />

      <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-5 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand transition-colors hover:text-brand/80"
          >
            <Sparkles size={14} className="text-brand" strokeWidth={2} />
            AI Optimize
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand transition-colors hover:text-brand/80"
          >
            <Languages size={14} className="text-brand" strokeWidth={2} />
            Translator
          </button>
        </div>
        <span className="shrink-0 text-[13px] text-gray-300 tabular-nums">
          {guidelines.length} / {maxLength}
        </span>
      </div>

      <div className="space-y-4 border-t border-gray-100 px-5 py-4">
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-gray-600">Mention</label>
          <SettingsInput
            value={mention}
            onChange={(e) => onMentionChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-gray-600">Hashtag</label>
          <SettingsInput
            value={hashtag}
            onChange={(e) => onHashtagChange(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-gray-100 px-5 py-4">
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

      <div className="space-y-3 border-t border-gray-100 px-5 py-4">
        <label className="text-[13px] font-medium text-gray-600">Add Link</label>
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
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [brandDescription, setBrandDescription] = useState("");
  const [previewLink, setPreviewLink] = useState("");
  const [objectives, setObjectives] = useState("");
  const [contentGuidelines, setContentGuidelines] = useState(
    "打算赌神的萨达爱上打算打算赌神啊赌神啊打算的"
  );
  const [mention, setMention] = useState("打算大的赌神啊d");
  const [hashtag, setHashtag] = useState("打算打算赌神啊赌神啊");
  const [briefFiles, setBriefFiles] = useState([
    "Frame 2085665168.png",
    "Frame 2085665168.png",
  ]);
  const [referenceLinks, setReferenceLinks] = useState([
    "https://kolplanet-ab5zz5ztf-boluobao20-6161s-projects.vercel.app/",
  ]);
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex h-full w-full flex-col gap-0 border-l border-gray-100 bg-white p-0 data-[side=right]:max-w-[540px] data-[side=right]:sm:max-w-[540px]"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-6 py-5">
          <SheetClose
            render={
              <button
                type="button"
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              />
            }
          >
            <X size={18} strokeWidth={2} />
          </SheetClose>
          <h2 className="text-[18px] font-semibold text-gray-900">Execution Guide</h2>
        </div>

        <ScrollArea className="min-h-0 flex-1 bg-gray-50/80">
          <div className="space-y-3 py-3">
            <section className="space-y-9 bg-white px-6 py-6">
              <SettingsSectionTitle>Brand Identity</SettingsSectionTitle>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_178px]">
                <div className="space-y-4">
                  <FieldLabel label="Brand Description" />
                  <LimitedTextarea
                    value={brandDescription}
                    onChange={setBrandDescription}
                    placeholder="Brief description of the brand..."
                  />
                </div>

                <div className="space-y-4">
                  <FieldLabel label="Brand Logo" core />
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="sr-only"
                    onChange={() => undefined}
                  />
                  <UploadDropzone
                    title="Click to upload"
                    subtitle="1:1 ratio, max 500KB"
                    onPick={() => logoInputRef.current?.click()}
                  />
                </div>
              </div>

              <div className="space-y-4">
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
            </section>

            <section className="space-y-9 bg-white px-6 py-6">
              <SettingsSectionTitle>Execution Details</SettingsSectionTitle>

              <div className="space-y-4">
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

            </section>

            <section className="space-y-9 bg-white px-6 py-6">
              <SettingsSectionTitle>Commercial Terms &amp; Rights</SettingsSectionTitle>

              <div className="space-y-4">
                <FieldLabel label="Deliverables Details" core />
                <LimitedTextarea
                  value={deliverables}
                  onChange={setDeliverables}
                  placeholder='e.g., Instagram Reels*1, TikTok Video*1, Link in Bios...'
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
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
              </div>

              <div className="space-y-2">
                <FieldLabel label="Post Retention" core />
                <RadioChipGroup
                  options={[...RETENTION_OPTIONS]}
                  value={postRetention}
                  onChange={setPostRetention}
                />
              </div>

              <div className="space-y-2">
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
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
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
              </div>

              <div className="space-y-2">
                <FieldLabel
                  label="Collab Post"
                  hint="Influencer must accept the collab invite within 24h."
                />
                <RadioChipGroup
                  options={[...REQUIRED_OPTIONS]}
                  value={collabPost}
                  onChange={setCollabPost}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
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
              </div>

              <div className="space-y-2">
                <FieldLabel
                  label="Partnership Label"
                  hint="Operation guide / screenshot should be shown automatically for the influencer."
                />
                <RadioChipGroup
                  options={[...REQUIRED_OPTIONS]}
                  value={partnershipLabel}
                  onChange={setPartnershipLabel}
                />
              </div>
            </section>
          </div>
        </ScrollArea>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 px-8 py-5">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-gray-300 px-4 text-[14px] text-gray-600"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            className="h-10 rounded-xl px-6 text-[14px]"
            onClick={() => onOpenChange(false)}
          >
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
