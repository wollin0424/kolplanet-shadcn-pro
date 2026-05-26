import { notFound } from "next/navigation";
import ClientBillingSettlementTable from "@/components/ClientBillingSettlementTable";
import { getBillingRow } from "@/lib/clientBilling";

export default async function ClientBillingDetailPage({
  params,
}: {
  params: Promise<{ billingId: string }>;
}) {
  const { billingId } = await params;
  const row = getBillingRow(billingId);

  if (!row) {
    notFound();
  }

  const title =
    row.id === "B3038" ? "Spotify Campus Push" : `${row.id} ${row.campaignName}`;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <ClientBillingSettlementTable billingId={billingId} campaignTitle={title} />
    </div>
  );
}
