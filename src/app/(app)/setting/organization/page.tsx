import { Building2 } from "lucide-react";
import PagePlaceholder from "@/components/PagePlaceholder";

export default function OrganizationPage() {
  return (
    <PagePlaceholder
      title="Organization"
      description="Company profile, billing entity, tax information, and workspace-level branding."
      icon={<Building2 size={14} strokeWidth={2} />}
    />
  );
}
