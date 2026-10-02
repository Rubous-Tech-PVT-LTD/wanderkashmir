import { Building } from "lucide-react";
import MigrationPendingView from "@/components/admin/MigrationPendingView";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export default async function AdminPropertiesPage() {
  const [approvedProps, totalProps] = await Promise.all([
    prisma.property.count({ where: { isApproved: true, status: "APPROVED" } }),
    prisma.property.count(),
  ]);

  return (
    <MigrationPendingView
      title="Properties & Stays"
      description="Vendor hotel onboarding, verification approvals, amenity toggles, room rates, and property status workflows are managed via the legacy admin."
      icon={Building}
      v1RouteName="V1 Stays / Properties Tab"
      stats={[
        { label: "Approved Stays", value: approvedProps },
        { label: "Total Properties", value: totalProps },
      ]}
    />
  );
}
