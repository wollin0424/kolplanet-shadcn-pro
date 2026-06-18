import ScriptBriefH5View from "@/components/h5/ScriptBriefH5View";

export default async function KolInfoH5Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  return <ScriptBriefH5View kolId={id} view={resolveH5View(query.view)} />;
}

function resolveH5View(
  view: string | undefined
): "overview" | "script" | "guidelines" | "video" | "caption" | "posting" {
  if (view === "script") return "script";
  if (view === "guidelines") return "guidelines";
  if (view === "video") return "video";
  if (view === "caption") return "caption";
  if (view === "posting") return "posting";
  return "overview";
}
