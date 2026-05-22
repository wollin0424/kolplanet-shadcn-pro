import { IconPageInfluencerPayments } from "@/lib/icons";
import PagePlaceholder from "@/components/PagePlaceholder";

export default function InfluencerPaymentsPage() {
  return (
    <PagePlaceholder
      title="Influencer Payments"
      description="Payouts to creators, tax withholding, currency conversion, and payment method management."
      icon={<IconPageInfluencerPayments size={14} strokeWidth={2} />}
    />
  );
}
