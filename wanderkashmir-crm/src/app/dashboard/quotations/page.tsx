import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import QuotationsClient from "@/components/quotations/QuotationsClient";

export default async function QuotationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const isAdminOrManager = ["CRM_ADMIN", "SALES_MANAGER"].includes(session.role);
  const whereClause = isAdminOrManager ? {} : { baId: session.userId };

  const quotations = await prisma.crmQuotation.findMany({
    where: whereClause,
    select: {
      id: true,
      requirementId: true,
      version: true,
      partnerPrice: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <QuotationsClient quotations={quotations} />;
}
