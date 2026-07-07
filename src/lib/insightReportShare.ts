import {
  mergeInsightReportImages,
  parseKolIdFromH5Path,
  type InsightReportImage,
} from "@/lib/insightReportSync";
import { getH5PostingState, subscribeH5InsightSync } from "@/lib/h5PostingSubmissions";
import { POSTING_HUB_MOCK_ROWS, type PostingHubRow } from "@/lib/postingHubMock";

export type InsightReportSharePayload = {
  rowId: string;
  influencerName: string;
  influencerHandle: string;
  platform: string;
  files: InsightReportImage[];
};

export function getPostingHubRowById(rowId: string): PostingHubRow | undefined {
  return POSTING_HUB_MOCK_ROWS.find((row) => row.id === rowId);
}

export function getInsightReportSharePayload(rowId: string): InsightReportSharePayload | null {
  const row = getPostingHubRowById(rowId);
  if (!row) return null;

  const kolId = row.h5Path ? parseKolIdFromH5Path(row.h5Path) : undefined;
  const h5Files = kolId ? getH5PostingState(kolId).insightDraftFiles : [];

  return {
    rowId: row.id,
    influencerName: row.name,
    influencerHandle: row.handle,
    platform: row.platform,
    files: mergeInsightReportImages(row.insightReports ?? [], h5Files, row.id),
  };
}

export function subscribeInsightReportShareChanges(
  rowId: string,
  onChange: () => void
): () => void {
  const row = getPostingHubRowById(rowId);
  const kolId = row?.h5Path ? parseKolIdFromH5Path(row.h5Path) : undefined;
  if (!kolId) return () => undefined;

  return subscribeH5InsightSync((changedKolId) => {
    if (changedKolId === kolId) onChange();
  });
}
