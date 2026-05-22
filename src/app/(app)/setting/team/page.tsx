import { IconPageTeam } from "@/lib/icons";
import PagePlaceholder from "@/components/PagePlaceholder";

export default function TeamPage() {
  return (
    <PagePlaceholder
      title="Team"
      description="Invite teammates, assign roles, and manage individual access across your workspace."
      icon={<IconPageTeam size={14} strokeWidth={2} />}
    />
  );
}
