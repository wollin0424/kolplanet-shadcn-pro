/**
 * Central Lucide icon registry for product UI.
 *
 * - Import semantic components from `@/lib/icons` only (not `lucide-react` in feature code).
 * - Each icon is a named React component: DevTools shows `IconRefresh`, DOM has `data-icon` / `data-lucide`.
 * - Lookup: `src/lib/icons.catalog.md`
 */

import {
  AlertCircle,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Clapperboard,
  Columns3,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  FileLock,
  FileText,
  FolderKanban,
  Hammer,
  Hourglass,
  Info,
  Link,
  List,
  Mail,
  MoreHorizontal,
  MoreVertical,
  Pencil,
  Plus,
  Receipt,
  RefreshCcw,
  RotateCcw,
  ScrollText,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Stamp,
  Tag,
  Trash2,
  Truck,
  Upload,
  UserRound,
  Users,
  UsersRound,
  Wallet,
  X,
  Clock,
} from "lucide-react";
import { createIcon } from "@/lib/createIcon";

export type { LucideIcon, LucideProps } from "lucide-react";

// ─── Campaign Hub — KOL card meta ───────────────────────────────────────────
export const IconKolIdentityType = createIcon(Tag, "IconKolIdentityType", "Tag");
export const IconKolManager = createIcon(UserRound, "IconKolManager", "UserRound");

// ─── Campaign Hub — overview cells ────────────────────────────────────────────
export const IconHubGoChevron = createIcon(ChevronRight, "IconHubGoChevron", "ChevronRight");
export const IconHubContract = createIcon(ScrollText, "IconHubContract", "ScrollText");
export const IconHubLogistics = createIcon(Truck, "IconHubLogistics", "Truck");
export const IconHubPayment = createIcon(CreditCard, "IconHubPayment", "CreditCard");
export const IconHubScript = createIcon(Clapperboard, "IconHubScript", "Clapperboard");
export const IconHubContent = createIcon(Stamp, "IconHubContent", "Stamp");
export const IconHubPosting = createIcon(Send, "IconHubPosting", "Send");
export const IconHubInfo = createIcon(Info, "IconHubInfo", "Info");
export const IconHubList = createIcon(List, "IconHubList", "List");

// ─── Campaign Hub — influencer cards ──────────────────────────────────────────
export const IconHubStepCompleted = createIcon(Check, "IconHubStepCompleted", "Check");
export const IconHubStepScheduled = createIcon(Clock, "IconHubStepScheduled", "Clock");
export const IconHubStepActive = createIcon(Hourglass, "IconHubStepActive", "Hourglass");
export const IconContractFile = createIcon(FileText, "IconContractFile", "FileText");
export const IconEdit = createIcon(Pencil, "IconEdit", "Pencil");
export const IconMoreHorizontal = createIcon(MoreHorizontal, "IconMoreHorizontal", "MoreHorizontal");
export const IconCopy = createIcon(Copy, "IconCopy", "Copy");
export const IconDownload = createIcon(Download, "IconDownload", "Download");
export const IconUpload = createIcon(Upload, "IconUpload", "Upload");
export const IconLogisticsLog = createIcon(Truck, "IconLogisticsLog", "Truck");
export const IconBack = createIcon(ChevronLeft, "IconBack", "ChevronLeft");
export const IconSearch = createIcon(Search, "IconSearch", "Search");
export const IconChevronDown = createIcon(ChevronDown, "IconChevronDown", "ChevronDown");

// ─── Pipeline table ───────────────────────────────────────────────────────────
export const IconStageAlert = createIcon(AlertCircle, "IconStageAlert", "AlertCircle");
export const IconStageComplete = createIcon(CheckCircle2, "IconStageComplete", "CheckCircle2");
export const IconStagePending = createIcon(CircleDashed, "IconStagePending", "CircleDashed");
export const IconCommercialScopeLock = createIcon(
  FileLock,
  "IconCommercialScopeLock",
  "FileLock"
);
export const IconPaymentAction = createIcon(CreditCard, "IconPaymentAction", "CreditCard");
export const IconClose = createIcon(X, "IconClose", "X");
export const IconRefresh = createIcon(RefreshCcw, "IconRefresh", "RefreshCcw");
export const IconColumns = createIcon(Columns3, "IconColumns", "Columns3");
export const IconFilters = createIcon(SlidersHorizontal, "IconFilters", "SlidersHorizontal");
export const IconChevronLeft = createIcon(ChevronLeft, "IconChevronLeft", "ChevronLeft");
export const IconChevronRight = createIcon(ChevronRight, "IconChevronRight", "ChevronRight");

// ─── Campaign detail & header ─────────────────────────────────────────────────
export const IconExternalLink = createIcon(ExternalLink, "IconExternalLink", "ExternalLink");
export const IconGuide = createIcon(BookOpen, "IconGuide", "BookOpen");
export const IconChecklist = createIcon(CheckSquare, "IconChecklist", "CheckSquare");

// ─── Payout & settlement ──────────────────────────────────────────────────────
export const IconCalendar = createIcon(Calendar, "IconCalendar", "Calendar");
export const IconInfo = createIcon(Info, "IconInfo", "Info");
export const IconMoreVertical = createIcon(MoreVertical, "IconMoreVertical", "MoreVertical");
export const IconPlus = createIcon(Plus, "IconPlus", "Plus");
export const IconSparkles = createIcon(Sparkles, "IconSparkles", "Sparkles");
export const IconUndo = createIcon(RotateCcw, "IconUndo", "RotateCcw");

// ─── Influencer & campaigns lists ─────────────────────────────────────────────
export const IconLink = createIcon(Link, "IconLink", "Link");
export const IconTrash = createIcon(Trash2, "IconTrash", "Trash2");

// ─── App shell & settings ─────────────────────────────────────────────────────
export const IconNavInfluencers = createIcon(Users, "IconNavInfluencers", "Users");
export const IconNavProjects = createIcon(FolderKanban, "IconNavProjects", "FolderKanban");
export const IconNavPayments = createIcon(CreditCard, "IconNavPayments", "CreditCard");
export const IconNavSettings = createIcon(Settings, "IconNavSettings", "Settings");
export const IconNotifications = createIcon(Bell, "IconNotifications", "Bell");
export const IconMail = createIcon(Mail, "IconMail", "Mail");
export const IconUnderConstruction = createIcon(Hammer, "IconUnderConstruction", "Hammer");

// ─── Route / page placeholders ────────────────────────────────────────────────
export const IconPageTeam = createIcon(UsersRound, "IconPageTeam", "UsersRound");
export const IconPageOrganization = createIcon(Building2, "IconPageOrganization", "Building2");
export const IconPageContracts = createIcon(FileText, "IconPageContracts", "FileText");
export const IconPageRoles = createIcon(ShieldCheck, "IconPageRoles", "ShieldCheck");
export const IconPageInfluencerPayments = createIcon(
  Wallet,
  "IconPageInfluencerPayments",
  "Wallet"
);
export const IconPageClientPayments = createIcon(Receipt, "IconPageClientPayments", "Receipt");
export const IconPageOutreach = createIcon(Send, "IconPageOutreach", "Send");
