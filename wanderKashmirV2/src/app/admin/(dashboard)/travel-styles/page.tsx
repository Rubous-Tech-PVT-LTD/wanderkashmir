import { Palette } from "lucide-react";
import MigrationPendingView from "@/components/admin/MigrationPendingView";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export default async function AdminTravelStylesPage() {
  const [activeStyles, totalStyles] = await Promise.all([
    prisma.travelStyle.count({ where: { isActive: true } }),
    prisma.travelStyle.count(),
  ]);

  return (
    <MigrationPendingView
      title="Travel Styles"
      description="Category mapping, iconography, SEO slug assignments, and style-to-tour associations are operational in V1 and scheduled for V2 CRUD migration."
      icon={Palette}
      v1RouteName="V1 Travel Styles Tab"
      stats={[
        { label: "Active Styles", value: activeStyles },
        { label: "Total in DB", value: totalStyles },
      ]}
    />
  );
}
