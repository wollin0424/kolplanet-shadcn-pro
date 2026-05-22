import { Receipt } from "@/lib/icons";
import PagePlaceholder from "@/components/PagePlaceholder";

export default function ClientBillingPage() {
  return (
    <PagePlaceholder
      title="Client Billing"
      description="Invoices issued to clients, payment status, and margin tracking across every campaign."
      icon={<Receipt size={14} strokeWidth={2} />}
    />
  );
}
