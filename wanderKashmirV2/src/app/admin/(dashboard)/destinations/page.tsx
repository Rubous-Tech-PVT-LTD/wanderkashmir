import { MapPin } from "lucide-react";
import MigrationPendingView from "@/components/admin/MigrationPendingView";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export default async function AdminDestinationsPage() {
  const [publishedDests, totalDests] = await Promise.all([
    prisma.seoLandingPage.count({ where: { type: "DESTINATION", workflowState: "PUBLISHED" } }),
    prisma.seoLandingPage.count({ where: { type: "DESTINATION" } }),
  ]);

  return (
    <MigrationPendingView
      title="Destinations & Places"
      description="Destination page builder, section editor, rich content blocks, and TouristAttraction place curation are active in V1 and scheduled for V2 migration."
      icon={MapPin}
      v1RouteName="V1 Destinations Tab"
      stats={[
        { label: "Published Dests", value: publishedDests },
        { label: "Total in DB", value: totalDests },
      ]}
    />
  );
}
