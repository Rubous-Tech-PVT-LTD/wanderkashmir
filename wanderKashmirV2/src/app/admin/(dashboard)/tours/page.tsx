import { Compass } from "lucide-react";
import MigrationPendingView from "@/components/admin/MigrationPendingView";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export default async function AdminToursPage() {
  const [liveTours, totalTours] = await Promise.all([
    prisma.tour.count({ where: { isLive: true } }),
    prisma.tour.count(),
  ]);

  return (
    <MigrationPendingView
      title="Tours Management"
      description="Tour package publishing, pricing management, itinerary builder, and seasonal controls are scheduled for migration in a dedicated Tour CRUD phase."
      icon={Compass}
      v1RouteName="V1 Tours Tab"
      stats={[
        { label: "Live Tours", value: liveTours },
        { label: "Total in DB", value: totalTours },
      ]}
    />
  );
}
