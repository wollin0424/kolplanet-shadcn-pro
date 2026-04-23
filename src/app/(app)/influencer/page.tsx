import { Users } from "lucide-react";
import PagePlaceholder from "@/components/PagePlaceholder";

export default function InfluencerPage() {
  return (
    <PagePlaceholder
      title="Influencer"
      description="Centralised roster of all KOLs across every platform, with vetting history, pricing, and engagement signals."
      icon={<Users size={14} strokeWidth={2} />}
    />
  );
}
