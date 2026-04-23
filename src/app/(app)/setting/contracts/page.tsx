import { FileText } from "lucide-react";
import PagePlaceholder from "@/components/PagePlaceholder";

export default function ContractSettingsPage() {
  return (
    <PagePlaceholder
      title="Contract Settings"
      description="Default contract templates, clauses, and signatory rules applied to new campaigns."
      icon={<FileText size={14} strokeWidth={2} />}
    />
  );
}
