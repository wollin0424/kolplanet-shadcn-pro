import CampaignsTable from "@/components/CampaignsTable";

export default function CampaignsPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0 rounded-xl border border-gray-100 overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <CampaignsTable />
    </div>
  );
}
