import { Send } from "lucide-react";
import PagePlaceholder from "@/components/PagePlaceholder";

export default function OutreachPage() {
  return (
    <PagePlaceholder
      title="Outreach"
      description="Track every message, follow-up, and acceptance status for the influencers invited to your active campaigns."
      icon={<Send size={14} strokeWidth={2} />}
    />
  );
}
