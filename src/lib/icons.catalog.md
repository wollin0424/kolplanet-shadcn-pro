# Lucide icon catalog

Product code should import **semantic names** from [`icons.ts`](./icons.ts).  
Search this file by feature name or `Lucide:` to find the underlying icon.

Each export is a **named React component** (not a raw Lucide re-export):

- **React DevTools** shows e.g. `IconRefresh`, not `ForwardRef`
- **DOM** on the `<svg>`: `data-icon="IconRefresh"` and `data-lucide="RefreshCcw"`
- **class** still includes Lucide’s `lucide lucide-refresh-ccw` for styling

## Campaign Hub — KOL card

| Semantic export | Lucide | Where |
|-----------------|--------|--------|
| `IconKolIdentityType` | `Tag` | `CampaignHubInfluencerIdentity` — identity type |
| `IconKolManager` | `UserRound` | `CampaignHubInfluencerIdentity` — KOL manager |
| `IconHubStepCompleted` | `Check` | `CampaignHubStepList` — done step |
| `IconHubStepScheduled` | `Clock` | `CampaignHubStepList` — scheduled step |
| `IconHubStepActive` | `Hourglass` | `CampaignHubStepList` — in-progress step |
| `IconContractFile` | `FileText` | Contract card file count / tooltip |
| `IconLogisticsLog` | `Truck` | Logistics card “View Full Log” |
| `IconEdit` | `Pencil` | Legal name, ship to, etc. |
| `IconCopy` | `Copy` | Logistics tracking copy |
| `IconMoreHorizontal` | `MoreHorizontal` | Contract card overflow menu |

## Campaign Hub — overview & toolbar

| Semantic export | Lucide | Where |
|-----------------|--------|--------|
| `IconHubContract` | `ScrollText` | Hub contract cell |
| `IconHubLogistics` | `Truck` | Hub logistics cell |
| `IconHubPayment` | `CreditCard` | Hub payment cell |
| `IconHubScript` | `Clapperboard` | Hub script cell |
| `IconHubContent` | `Stamp` | Hub content cell |
| `IconHubPosting` | `Send` | Hub posting cell |
| `IconHubGoChevron` | `ChevronRight` | Hub “Go” button |
| `IconHubInfo` | `Info` | Hub generic info |
| `IconHubList` | `List` | Hub list sections |
| `IconBack` | `ChevronLeft` | Hub detail toolbar back |
| `IconSearch` | `Search` | Hub detail search |
| `IconChevronDown` | `ChevronDown` | Hub filters / selects |
| `IconDownload` | `Download` | Logistics export / import template |
| `IconUpload` | `Upload` | Logistics import |

## Pipeline

| Semantic export | Lucide | Where |
|-----------------|--------|--------|
| `IconStageAlert` | `AlertCircle` | `PipelineStageCell` |
| `IconStageComplete` | `CheckCircle2` | `PipelineStageCell` |
| `IconStagePending` | `CircleDashed` | `PipelineStageCell` |
| `IconCommercialScopeLock` | `FileLock` | `CommercialScopePopover` |
| `IconPaymentAction` | `CreditCard` | `PipelineRowActionsMenu` |
| `IconHubStepCompleted` | `Check` | `CollabStatusSelect` selected check |
| `IconRefresh` | `RefreshCcw` | Pipeline / payment table refresh |
| `IconColumns` | `Columns3` | Column visibility |
| `IconFilters` | `SlidersHorizontal` | Pipeline / influencer filters |

## Tables & dialogs

| Semantic export | Lucide | Where |
|-----------------|--------|--------|
| `IconChevronLeft` / `IconChevronRight` | `ChevronLeft` / `ChevronRight` | Pagination |
| `IconPlus` | `Plus` | Add row, scope, payout |
| `IconClose` | `X` | Clear / close |
| `IconLink` | `Link` | Influencer table link field |
| `IconTrash` | `Trash2` | `QuotesMatrixDialog` |
| `IconCalendar` | `Calendar` | `CampaignPaymentTable` |
| `IconMoreVertical` | `MoreVertical` | Payment table row menu |
| `IconInfo` | `Info` | Payout hints |
| `IconSparkles` | `Sparkles` | `ApprovePayoutSheet` AI fill |
| `IconUndo` | `RotateCcw` | `ApprovePayoutSheet` reset |
| `IconChecklist` | `CheckSquare` | `CampaignDetailView` |
| `IconExternalLink` | `ExternalLink` | `CampaignDetailHeader` |
| `IconGuide` | `BookOpen` | `CampaignHeader` |

## App shell & pages

| Semantic export | Lucide | Where |
|-----------------|--------|--------|
| `IconNavInfluencers` | `Users` | Sidebar, influencer page |
| `IconNavProjects` | `FolderKanban` | Sidebar |
| `IconNavPayments` | `CreditCard` | Sidebar |
| `IconNavSettings` | `Settings` | Sidebar, `PlanSettingsSheet` |
| `IconNotifications` | `Bell` | `TopBar` |
| `IconMail` | `Mail` | `ContactChannels` |
| `IconUnderConstruction` | `Hammer` | `PagePlaceholder` |
| `IconPageTeam` | `UsersRound` | Settings → team |
| `IconPageOrganization` | `Building2` | Settings → organization |
| `IconPageContracts` | `FileText` | Settings → contracts |
| `IconPageRoles` | `ShieldCheck` | Settings → roles |
| `IconPageInfluencerPayments` | `Wallet` | Payments → influencer |
| `IconPageClientPayments` | `Receipt` | Payments → client |
| `IconPageOutreach` | `Send` | Projects → outreach |

## shadcn UI primitives (direct `lucide-react`)

These stay in `src/components/ui/*` with Lucide’s `*Icon` names:

| File | Lucide |
|------|--------|
| `checkbox.tsx` | `CheckIcon` |
| `command.tsx` | `SearchIcon`, `CheckIcon` |
| `dialog.tsx`, `sheet.tsx` | `XIcon` |
| `dropdown-menu.tsx` | `ChevronRightIcon`, `CheckIcon` |
| `pagination.tsx` | `ChevronLeftIcon`, `ChevronRightIcon`, `MoreHorizontalIcon` |
| `select.tsx` | `ChevronDownIcon`, `CheckIcon`, `ChevronUpIcon` |

## Non-Lucide

| Component | Notes |
|-----------|--------|
| `PlatformIcon.tsx` | Custom SVG per platform (IG, TT, YT, FB) |
