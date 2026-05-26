import ClientBillingTable from "@/components/ClientBillingTable";

export default function ClientBillingPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <ClientBillingTable />
    </div>
  );
}
