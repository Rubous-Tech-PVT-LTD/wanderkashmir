import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, FileText, Calendar, TrendingUp } from "lucide-react";

export default async function BADashboard({ session }: { session: any }) {
  // Each model has a different field name for the BA relationship
  const [newLeadsCount, requirementsCount, quotationsCount, followUpsCount] = await Promise.all([
    prisma.crmLead.count({ where: { assignedBaId: session.userId, status: "NEW" } }),
    prisma.crmRequirement.count({ where: { partner: { assignedBaId: session.userId } } }),
    prisma.crmQuotation.count({ where: { baId: session.userId } }),
    prisma.crmFollowUp.count({ where: { baId: session.userId } }),
  ]);

  const kpis = [
    { name: "New Leads", count: newLeadsCount, icon: Users, href: "/dashboard/leads", color: "bg-blue-100 text-blue-600" },
    { name: "Follow-ups", count: followUpsCount, icon: Calendar, href: "/dashboard/follow-ups", color: "bg-orange-100 text-orange-600" },
    { name: "Requirements", count: requirementsCount, icon: FileText, href: "/dashboard/requirements", color: "bg-purple-100 text-purple-600" },
    { name: "Quotations", count: quotationsCount, icon: TrendingUp, href: "/dashboard/quotations", color: "bg-green-100 text-green-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Partner Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {session.name}. Here is your overview.</p>
      </div>
      
      {/* 2-column grid on mobile, 4-column on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {kpis.map((kpi) => (
          <Link key={kpi.name} href={kpi.href} className="card-white p-4 hover:shadow-md transition-shadow block">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{kpi.name}</p>
                <p className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">{kpi.count}</p>
              </div>
              <div className={`p-2 rounded-lg ${kpi.color}`}>
                <kpi.icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
