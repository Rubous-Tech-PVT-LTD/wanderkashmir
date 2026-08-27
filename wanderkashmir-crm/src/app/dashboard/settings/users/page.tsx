import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const session = await getSession();
  if (!session || session.role !== "CRM_ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.crmUser.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          assignedLeads: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return <UsersClient users={users} />;
}
