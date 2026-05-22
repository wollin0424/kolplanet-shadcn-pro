import { IconPageOrganization } from "@/lib/icons";
import PagePlaceholder from "@/components/PagePlaceholder";

export default function OrganizationPage() {
  return (
    <PagePlaceholder
      title="Organization"
      description="Company profile, billing entity, tax information, and workspace-level branding."
      icon={<IconPageOrganization size={14} strokeWidth={2} />}
    />
  );
}
