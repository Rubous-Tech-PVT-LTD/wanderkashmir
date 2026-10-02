import { Sparkles } from "lucide-react";
import MigrationPendingView from "@/components/admin/MigrationPendingView";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export default async function AdminExperiencesPage() {
  const [activeExp, totalExp] = await Promise.all([
    prisma.experience.count({ where: { status: "ACTIVE" } }),
    prisma.experience.count(),
  ]);

  return (
    <MigrationPendingView
      title="Experiences & Activities"
      description="Curated Kashmiri experiences (shikara rides, trekking, skiing, heritage walks, culinary tours) and their partner assignments are managed via V1."
      icon={Sparkles}
      v1RouteName="V1 Experiences Tab"
      stats={[
        { label: "Active in DB", value: activeExp },
        { label: "Total in DB", value: totalExp },
      ]}
    />
  );
}
