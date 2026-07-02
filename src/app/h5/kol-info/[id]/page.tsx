import ScriptBriefH5View from "@/components/h5/ScriptBriefH5View";

export default async function KolInfoH5Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string; figmaCapture?: string; figmaWidth?: string; figmaPostingState?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const figmaCapture = query.figmaCapture === "1";
  const figmaPostingState = query.figmaPostingState?.trim() || undefined;
  return (
    <ScriptBriefH5View
      kolId={id}
      view={resolveH5View(query.view)}
      figmaCapture={figmaCapture}
      figmaPostingState={figmaPostingState}
    />
  );
}

function resolveH5View(
  view: string | undefined
): "overview" | "script" | "guidelines" | "contract" | "video" | "caption" | "posting" {
  if (view === "script") return "script";
  if (view === "guidelines") return "guidelines";
  if (view === "contract") return "contract";
  if (view === "video") return "video";
  if (view === "caption") return "caption";
  if (view === "posting") return "posting";
  return "overview";
}
