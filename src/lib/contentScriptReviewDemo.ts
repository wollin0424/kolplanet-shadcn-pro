import {
  getCaptionCoverSubmissions,
  setCaptionCoverSubmissions,
  type CaptionCoverSubmission,
} from "@/lib/captionCoverSubmissions";
import {
  getScriptDraftSubmissions,
  setScriptDraftSubmissions,
  type ScriptDraftSubmission,
} from "@/lib/scriptDraftSubmissions";

const DEMO_COVER_FILE = {
  name: "Logo.png",
  previewUrl: "/vercel.svg",
  sizeLabel: "3.4 KB",
};

const S1_CAPTION_COVER_DEMO_SUBMISSIONS: CaptionCoverSubmission[] = [
  {
    version: 1,
    status: "Under Review",
    submittedAt: "Jun 17, 2026, 11:16 AM",
    caption: "打算的",
    cover: DEMO_COVER_FILE,
    messages: [
      {
        id: "demo-caption-msg-1",
        author: "client",
        authorLabel: "**",
        content: "1. 但是啊的啊的",
        sentAt: "Jun 17, 2026, 11:16 AM",
      },
    ],
  },
];

const S1_DEMO_SUBMISSIONS: ScriptDraftSubmission[] = [
  {
    version: 1,
    status: "Under Review",
    submittedAt: "Jun 2, 2026, 1:41 PM",
    content: "First script draft for review.",
    messages: [],
  },
  {
    version: 2,
    status: "Under Review",
    submittedAt: "Jun 2, 2026, 2:11 PM",
    content: "Revised opening hook and CTA.",
    messages: [],
  },
  {
    version: 3,
    status: "Under Review",
    submittedAt: "Jun 2, 2026, 2:11 PM",
    content: "Updated tone to match brand guidelines.",
    messages: [],
  },
  {
    version: 4,
    status: "Approved",
    submittedAt: "Jun 2, 2026, 4:09 PM",
    content: "回调个人韩国人好",
    messages: [
      {
        id: "demo-msg-1",
        author: "client",
        authorLabel: "**",
        content: "1. /? ? 》",
        sentAt: "Jun 2, 2026, 5:29 PM",
      },
      {
        id: "demo-msg-2",
        author: "client",
        authorLabel: "**",
        content: "2. ? ? ?",
        sentAt: "Jun 2, 2026, 5:29 PM",
      },
    ],
  },
];

const S1_VIDEO_DEMO_SUBMISSIONS: ScriptDraftSubmission[] = [
  {
    version: 1,
    status: "Approved",
    submittedAt: "Jun 17, 2026, 10:30 AM",
    content: "https://drive.google.com/file/d/demo-video-draft/view",
    messages: [],
  },
];

/** Seeds Amelia Stone demo drafts when opening the content review sheet with no saved data. */
export function ensureContentScriptReviewDemoData(kolId: string) {
  if (kolId.endsWith("-video")) {
    if (getScriptDraftSubmissions(kolId).length > 0) return;
    setScriptDraftSubmissions(kolId, S1_VIDEO_DEMO_SUBMISSIONS);
    return;
  }

  if (kolId.endsWith("-caption")) {
    if (getCaptionCoverSubmissions(kolId).length > 0) return;
    setCaptionCoverSubmissions(kolId, S1_CAPTION_COVER_DEMO_SUBMISSIONS);
    return;
  }

  if (kolId !== "s1") return;
  if (getScriptDraftSubmissions(kolId).length > 0) return;
  setScriptDraftSubmissions(kolId, S1_DEMO_SUBMISSIONS);
}
