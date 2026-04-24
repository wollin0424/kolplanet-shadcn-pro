import CampaignHeader from "@/components/CampaignHeader";
import InfluencerTable from "@/components/InfluencerTable";
import { PlanScopeProvider } from "@/context/PlanScopeContext";

export default function PlansPage() {
  return (
    <PlanScopeProvider>
      <div className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <CampaignHeader />
      </div>

      <div className="flex flex-col flex-1 min-h-0 rounded-xl border border-gray-100 overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <InfluencerTable />
      </div>
    </PlanScopeProvider>
  );
}
