import { getMockInfluencerAvatar } from "@/lib/mockInfluencerAvatars";

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

export function getScriptBriefH5Data(kolId: string): ScriptBriefH5Data {
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
    guidelines: kolId === "s1" ? "3456789" : "Highlight the campaign value naturally and keep delivery easy to follow.",
    referenceScripts: [DEFAULT_SCRIPT],
    deadlineLabel: "Jun 16, 2026 11:53 UTC+08:00",
    submissionLimit: 5,
  };
}
