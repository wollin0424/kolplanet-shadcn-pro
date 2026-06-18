import { getMockInfluencerAvatar } from "@/lib/mockInfluencerAvatars";
import {
  parseLegacyDeadlineLabel,
  type ScriptBriefDeadline,
} from "@/lib/scriptBriefDeadline";
import {
  getScriptBriefPublished,
  type ScriptBriefPublished,
} from "@/lib/scriptBriefPublished";

export type ScriptBriefH5Data = {
  campaignTitle: string;
  campaignSubtitle: string;
  intro: string;
  influencer: {
    name: string;
    handle: string;
    platform: string;
    avatar: string;
  };
  referenceWebsiteUrl: string;
  guidelines: {
    original: string;
    translation: string;
  };
  attachments: Array<{ name: string; locked?: boolean }>;
  referenceScripts: Array<{
    title: string;
    original: string;
    translation: string;
  }>;
  deadline: ScriptBriefDeadline;
  submissionLimit: number;
};

const DEFAULT_SCRIPT = {
  title: "Option 1 - Style A - Honest Review",
  original: `Hook: Open with an honest review beat that feels native to Amelia Stone's posting rhythm.

Core flow: Straight opinion, clean talking-head delivery. Connect it to this brief requirement: Highlight the campaign value naturally and keep the delivery easy to follow.

Execution notes: Keep the language natural for ID audience, preserve Amelia Stone's familiar cadence, and apply this direction: Keep the creator's established tone.

CTA: Close with one concrete audience takeaway and a clear next action that feels platform-native.`,
  translation: `Hook: Open with an honest review beat that feels native to Amelia Stone's posting rhythm.

Core flow: Straight opinion, clean talking-head delivery. Connect it to this brief requirement: Highlight the campaign value naturally and keep the delivery easy to follow.

Execution notes: Keep the language natural for ID audience, preserve Amelia Stone's familiar cadence, and apply this direction: Keep the creator's established tone.`,
};

export function getScriptBriefH5Defaults(kolId: string): ScriptBriefH5Data {
  return {
    campaignTitle: "Budweiser 2024 Sales Promotion Campaign",
    campaignSubtitle: "Campaign Brief",
    intro:
      "Review the brief, references, and deadline before starting your script.",
    influencer: {
      name: "Amelia Stone",
      handle: "@instagram ins",
      platform: "Instagram Inst",
      avatar: getMockInfluencerAvatar(kolId === "1" ? "s1" : kolId),
    },
    referenceWebsiteUrl: "https://example.com/campaign-reference",
    guidelines: {
      original:
        kolId === "s1"
          ? "3456789"
          : "Highlight the campaign value naturally and keep delivery easy to follow.",
      translation:
        kolId === "s1"
          ? "3456789"
          : "Harap ikuti panduan kampanye, gunakan nada yang natural, dan sesuaikan penyampaian dengan audiens lokal.",
    },
    attachments:
      kolId === "s1"
        ? [
            { name: "模块-支付管理.pdf", locked: true },
            { name: "Contract_James_Morgan_Final_2026.pdf" },
          ]
        : [],
    referenceScripts: [DEFAULT_SCRIPT],
    deadline: {
      date: "Jun 16, 2026",
      time: "11:53 AM",
      timezone: "UTC+08:00",
    },
    submissionLimit: 5,
  };
}

function normalizePublishedGuidelines(
  guidelines: ScriptBriefPublished["guidelines"] | string | undefined,
  fallback: ScriptBriefH5Data["guidelines"]
): ScriptBriefH5Data["guidelines"] {
  if (!guidelines) return fallback;
  if (typeof guidelines === "string") {
    const text = guidelines.trim();
    return { original: text || fallback.original, translation: text || fallback.translation };
  }
  return {
    original: guidelines.original?.trim() || fallback.original,
    translation:
      guidelines.translation?.trim() ||
      guidelines.original?.trim() ||
      fallback.translation,
  };
}

function normalizePublishedDeadline(
  published: ScriptBriefPublished,
  fallback: ScriptBriefH5Data["deadline"]
): ScriptBriefH5Data["deadline"] {
  if (published.deadline?.date?.trim()) {
    return {
      date: published.deadline.date.trim(),
      time: published.deadline.time?.trim() || undefined,
      timezone: published.deadline.timezone?.trim() || undefined,
    };
  }

  if (published.deadlineLabel?.trim()) {
    return parseLegacyDeadlineLabel(published.deadlineLabel);
  }

  return fallback;
}

function mergeScriptBriefPublished(
  defaults: ScriptBriefH5Data,
  published: ScriptBriefPublished | null
): ScriptBriefH5Data {
  if (!published) return defaults;

  return {
    ...defaults,
    guidelines: normalizePublishedGuidelines(published.guidelines, defaults.guidelines),
    attachments: Array.isArray(published.attachments)
      ? published.attachments
      : defaults.attachments,
    referenceScripts:
      Array.isArray(published.referenceScripts) && published.referenceScripts.length > 0
        ? published.referenceScripts
        : defaults.referenceScripts,
    deadline: normalizePublishedDeadline(published, defaults.deadline),
  };
}

/** Client-only: reads published brief from localStorage. */
export function getScriptBriefH5Data(kolId: string): ScriptBriefH5Data {
  const defaults = getScriptBriefH5Defaults(kolId);
  if (typeof window === "undefined") return defaults;
  return mergeScriptBriefPublished(defaults, getScriptBriefPublished(kolId));
}
