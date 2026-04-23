import { UsersRound } from "lucide-react";
import PagePlaceholder from "@/components/PagePlaceholder";

export default function TeamPage() {
  return (
    <PagePlaceholder
      title="Team"
      description="Invite teammates, assign roles, and manage individual access across your workspace."
      icon={<UsersRound size={14} strokeWidth={2} />}
    />
  );
}
