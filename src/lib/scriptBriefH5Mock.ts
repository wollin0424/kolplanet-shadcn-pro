import { getMockInfluencerAvatar } from "@/lib/mockInfluencerAvatars";
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
  guidelines: string;
  attachments: Array<{ name: string; locked?: boolean }>;
  referenceScripts: Array<{
    title: string;
    original: string;
    translation: string;
  }>;
  deadlineLabel: string;
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
      "Before drafting, review the campaign outline, reference materials, and submission schedule carefully.",
    influencer: {
      name: "Amelia Stone",
      handle: "@instagram ins",
      platform: "Instagram Inst",
      avatar: getMockInfluencerAvatar(kolId === "1" ? "s1" : kolId),
    },
    referenceWebsiteUrl: "https://example.com/campaign-reference",
    guidelines:
      kolId === "s1"
        ? "3456789"
        : "Highlight the campaign value naturally and keep delivery easy to follow.",
    attachments:
      kolId === "s1"
        ? [
            { name: "模块-支付管理.pdf", locked: true },
            { name: "Contract_James_Morgan_Final_2026.pdf" },
          ]
        : [],
    referenceScripts: [DEFAULT_SCRIPT],
    deadlineLabel: "Jun 16, 2026 11:53 UTC+08:00",
    submissionLimit: 5,
  };
}

function mergeScriptBriefPublished(
  defaults: ScriptBriefH5Data,
  published: ScriptBriefPublished | null
): ScriptBriefH5Data {
  if (!published) return defaults;

  return {
    ...defaults,
    guidelines: published.guidelines?.trim() || defaults.guidelines,
    attachments: Array.isArray(published.attachments)
      ? published.attachments
      : defaults.attachments,
    referenceScripts:
      Array.isArray(published.referenceScripts) && published.referenceScripts.length > 0
        ? published.referenceScripts
        : defaults.referenceScripts,
    deadlineLabel: published.deadlineLabel?.trim() || defaults.deadlineLabel,
  };
}

/** Client-only: reads published brief from localStorage. */
export function getScriptBriefH5Data(kolId: string): ScriptBriefH5Data {
  const defaults = getScriptBriefH5Defaults(kolId);
  if (typeof window === "undefined") return defaults;
  return mergeScriptBriefPublished(defaults, getScriptBriefPublished(kolId));
}
