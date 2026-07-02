import type { H5InsightFile } from "@/lib/h5PostingSubmissions";
import { getInsightReportPreviewUrl } from "@/lib/postingHubMock";

export type InsightReportSource = "H5" | "Web";

export type InsightReportImage = {
  id: string;
  name: string;
  previewUrl: string;
  sizeLabel: string;
  source: InsightReportSource;
  /** H5-only: whether the file was submitted from H5. */
  locked?: boolean;
};

export type WebInsightFileRecord = {
  name: string;
  previewUrl: string;
  sizeLabel: string;
};

export function parseKolIdFromH5Path(h5Path: string): string | undefined {
  const match = h5Path.match(/\/h5\/kol-info\/([^/]+)/);
  return match?.[1];
}

export function buildH5InsightImages(files: H5InsightFile[]): InsightReportImage[] {
  return files
    .filter((file) => file.locked !== false)
    .map((file) => ({
      id: `h5-${file.id}`,
      name: file.name,
      previewUrl: file.previewUrl,
      sizeLabel: file.sizeLabel,
      source: "H5" as const,
      locked: file.locked !== false,
    }));
}

export function buildWebInsightImages(fileNames: string[], rowId?: string): InsightReportImage[] {
  return fileNames.map((name) => ({
    id: `web-${name}`,
    name,
    previewUrl: getInsightReportPreviewUrl(rowId ?? "", name),
    sizeLabel: "2.1 KB",
    source: "Web" as const,
  }));
}

export function buildWebInsightImagesFromRecords(
  files: WebInsightFileRecord[]
): InsightReportImage[] {
  return files.map((file) => ({
    id: `web-${file.name}`,
    name: file.name,
    previewUrl: file.previewUrl,
    sizeLabel: file.sizeLabel,
    source: "Web" as const,
  }));
}

export function mergeInsightReportImages(
  webFileNames: string[],
  h5Files: H5InsightFile[],
  rowId?: string
): InsightReportImage[] {
  const h5Images = buildH5InsightImages(h5Files);
  const h5Names = new Set(h5Images.map((file) => file.name));
  const webImages = buildWebInsightImages(
    webFileNames.filter((name) => !h5Names.has(name)),
    rowId
  );
  return [...h5Images, ...webImages];
}

export function mergeInsightReportImagesFromRecords(
  webFiles: WebInsightFileRecord[],
  h5Files: H5InsightFile[]
): InsightReportImage[] {
  const h5Images = buildH5InsightImages(h5Files);
  const h5Names = new Set(h5Images.map((file) => file.name));
  const webImages = buildWebInsightImagesFromRecords(
    webFiles.filter((file) => !h5Names.has(file.name))
  );
  return [...h5Images, ...webImages];
}

export function mergeInsightReportFileNames(
  webFileNames: string[],
  h5Files: H5InsightFile[]
): string[] {
  const h5Names = buildH5InsightImages(h5Files).map((file) => file.name);
  const h5NameSet = new Set(h5Names);
  return [...h5Names, ...webFileNames.filter((name) => !h5NameSet.has(name))];
}

export function splitInitialWebInsightFileNames(
  initialFiles: string[] | undefined,
  h5Files: H5InsightFile[]
): string[] {
  if (!initialFiles?.length) return [];
  const h5Names = new Set(buildH5InsightImages(h5Files).map((file) => file.name));
  return initialFiles.filter((name) => !h5Names.has(name));
}
