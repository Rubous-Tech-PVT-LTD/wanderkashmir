import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import RequirementsClient from "@/components/requirements/RequirementsClient";

export default async function RequirementsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const isAdminOrManager = ["CRM_ADMIN", "SALES_MANAGER"].includes(session.role);
  const whereClause = isAdminOrManager ? {} : { partner: { assignedBaId: session.userId } };

  const requirements = await prisma.crmRequirement.findMany({
    where: whereClause,
    select: {
      id: true,
      customerName: true,
      customerPhone: true,
      customerEmail: true,
      travelDate: true,
      returnDate: true,
      adults: true,
      children: true,
      rooms: true,
      destinations: true,
      status: true,
      createdAt: true,
      cabRequired: true,
      cabType: true,
      hotelCategory: true,
      sightseeingRequired: true,
      houseboatRequired: true,
      houseboatNights: true,
      specialRequirements: true,
      notes: true,
      customerBudget: true,
      currency: true,
      partner: {
        select: {
          companyName: true,
          assignedBaId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <RequirementsClient requirements={requirements} />;
}
