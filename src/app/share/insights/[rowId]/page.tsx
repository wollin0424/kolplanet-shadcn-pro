import { InsightReportShareView } from "@/components/InsightReportShareView";
import { getPostingHubRowById } from "@/lib/insightReportShare";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ rowId: string }>;
}) {
  const { rowId } = await params;
  const row = getPostingHubRowById(rowId);

  return {
    title: row ? `Insight Reports — ${row.name}` : "Insight Reports",
    description: "Submitted performance insight screenshots for campaign review.",
  };
}

export default async function InsightReportSharePage({
  params,
}: {
  params: Promise<{ rowId: string }>;
}) {
  const { rowId } = await params;
  return <InsightReportShareView rowId={rowId} />;
}
