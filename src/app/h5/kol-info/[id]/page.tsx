import ScriptBriefH5View from "@/components/h5/ScriptBriefH5View";

export default async function KolInfoH5Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ScriptBriefH5View kolId={id} />;
}
