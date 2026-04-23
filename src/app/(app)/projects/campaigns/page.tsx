import { Megaphone } from "lucide-react";
import PagePlaceholder from "@/components/PagePlaceholder";

export default function CampaignsPage() {
  return (
    <PagePlaceholder
      title="Campaigns"
      description="Monitor live campaigns, content approvals, and delivery milestones across every active partnership."
      icon={<Megaphone size={14} strokeWidth={2} />}
    />
  );
}
