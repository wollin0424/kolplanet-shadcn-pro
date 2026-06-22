import {
  getScriptDraftSubmissions,
  setScriptDraftSubmissions,
  type ScriptDraftSubmission,
} from "@/lib/scriptDraftSubmissions";

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

/** Seeds Amelia Stone demo drafts when opening the content script sheet with no saved data. */
export function ensureContentScriptReviewDemoData(kolId: string) {
  if (kolId !== "s1") return;
  if (getScriptDraftSubmissions(kolId).length > 0) return;
  setScriptDraftSubmissions(kolId, S1_DEMO_SUBMISSIONS);
}
