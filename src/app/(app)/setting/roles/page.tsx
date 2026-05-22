import { IconPageRoles } from "@/lib/icons";
import PagePlaceholder from "@/components/PagePlaceholder";

export default function RolesPage() {
  return (
    <PagePlaceholder
      title="Set Roles"
      description="Define what each role in your organisation can see and do — from viewing campaigns to approving payments."
      icon={<IconPageRoles size={14} strokeWidth={2} />}
    />
  );
}
