import {
  mergeInsightReportImagesFromRecords,
  parseKolIdFromH5Path,
  splitInitialWebInsightFileNames,
  type InsightReportImage,
} from "@/lib/insightReportSync";
import { getH5PostingState, getAllH5InsightFiles, subscribeH5InsightSync } from "@/lib/h5PostingSubmissions";
import {
  POSTING_HUB_MOCK_ROWS,
  getInsightReportPreviewUrl,
  type PostingHubRow,
} from "@/lib/postingHubMock";
import {
  getWebInsightFiles,
  subscribeWebInsightChanges,
} from "@/lib/webInsightSubmissions";

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
  const h5Files = kolId ? getAllH5InsightFiles(getH5PostingState(kolId)) : [];
  const storedWebFiles = getWebInsightFiles(rowId);
  const webFiles =
    storedWebFiles.length > 0
      ? storedWebFiles
      : splitInitialWebInsightFileNames(row.insightReports, h5Files).map((name) => ({
          name,
          previewUrl: getInsightReportPreviewUrl(row.id, name),
          sizeLabel: "2.1 KB",
        }));

  return {
    rowId: row.id,
    influencerName: row.name,
    influencerHandle: row.handle,
    platform: row.platform,
    files: mergeInsightReportImagesFromRecords(webFiles, h5Files),
  };
}

export function subscribeInsightReportShareChanges(
  rowId: string,
  onChange: () => void
): () => void {
  const row = getPostingHubRowById(rowId);
  const kolId = row?.h5Path ? parseKolIdFromH5Path(row.h5Path) : undefined;

  const unsubWeb = subscribeWebInsightChanges((changedRowId) => {
    if (changedRowId === rowId) onChange();
  });

  if (!kolId) return unsubWeb;

  const unsubH5 = subscribeH5InsightSync((changedKolId) => {
    if (changedKolId === kolId) onChange();
  });

  return () => {
    unsubWeb();
    unsubH5();
  };
}
