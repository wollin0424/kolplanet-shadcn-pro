import { notFound } from "next/navigation";
import InfluencerPaymentCampaignsTable from "@/components/InfluencerPaymentCampaignsTable";
import { getInfluencerPaymentRow } from "@/lib/influencerPayments";

export default async function InfluencerPaymentDetailPage({
  params,
}: {
  params: Promise<{ influencerId: string }>;
}) {
  const { influencerId } = await params;
  const row = getInfluencerPaymentRow(influencerId);

  if (!row) {
    notFound();
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <InfluencerPaymentCampaignsTable
        influencerId={row.id}
        influencerName={row.name}
        influencerHandle={row.handle}
        platform={row.platform}
        kolManager={row.kolManager}
        relationship={row.relationship}
      />
    </div>
  );
}
