import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, FileText, Calendar, TrendingUp, CheckCircle, AlertCircle, BookOpen, Clock } from "lucide-react";
import AdminCharts from "./AdminCharts";
import RecentActivity from "./RecentActivity";
import ActionCenter from "./ActionCenter";

export default async function AdminDashboard({ session }: { session: any }) {
  // Use parallel queries for performance
  const [
    totalLeads,
    newLeads,
    unassignedLeads,
    activePartners,
    pendingPartners,
    activeRequirements,
    pendingQuotations,
    activeBookings,
    
    // Action center stats
    overdueFollowUps,
    quotationsAwaitingReview,
    requirementsAwaitingAction,
  ] = await Promise.all([
    prisma.crmLead.count(),
    prisma.crmLead.count({ where: { status: "NEW" } }),
    prisma.crmLead.count({ where: { assignedBaId: null } }),
    
    prisma.crmPartner.count({ where: { status: "ACTIVE" } }),
    prisma.crmPartner.count({ where: { status: "INACTIVE" } }), // Assuming INACTIVE means pending approval based on schema
    
    prisma.crmRequirement.count({ where: { status: { notIn: ["CONFIRMED", "CANCELLED", "CONVERTED_TO_BOOKING"] } } }),
    prisma.crmQuotation.count({ where: { status: { in: ["DRAFT", "INTERNAL_REVIEW", "REVISED"] } } }),
    prisma.crmBooking.count({ where: { status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] } } }),
    
    // Action center
    prisma.crmFollowUp.count({ where: { status: "PENDING", dueDate: { lt: new Date() } } }),
    prisma.crmQuotation.count({ where: { status: "INTERNAL_REVIEW" } }),
    prisma.crmRequirement.count({ where: { status: { in: ["NEW", "UNDER_REVIEW"] } } }),
  ]);

  const kpis = [
    { name: "Total Leads", count: totalLeads, icon: Users, href: "/dashboard/leads", color: "bg-blue-100 text-blue-600" },
    { name: "New Leads", count: newLeads, icon: CheckCircle, href: "/dashboard/leads?status=NEW", color: "bg-cyan-100 text-cyan-600" },
    { name: "Unassigned Leads", count: unassignedLeads, icon: AlertCircle, href: "/dashboard/leads?unassigned=true", color: "bg-red-100 text-red-600" },
    { name: "Active Partners", count: activePartners, icon: Users, href: "/dashboard/partners?status=ACTIVE", color: "bg-emerald-100 text-emerald-600" },
    { name: "Pending Partners", count: pendingPartners, icon: Clock, href: "/dashboard/partners?status=INACTIVE", color: "bg-amber-100 text-amber-600" },
    { name: "Active Req.", count: activeRequirements, icon: FileText, href: "/dashboard/requirements", color: "bg-purple-100 text-purple-600" },
    { name: "Pending Quotes", count: pendingQuotations, icon: TrendingUp, href: "/dashboard/quotations", color: "bg-orange-100 text-orange-600" },
    { name: "Active Bookings", count: activeBookings, icon: BookOpen, href: "/dashboard/bookings", color: "bg-indigo-100 text-indigo-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM Admin Control Center</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor leads, partners, requirements, quotations and CRM operations.</p>
        </div>
        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-md shadow-sm border border-gray-200">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      {/* Action Center */}
      <ActionCenter 
        overdueFollowUps={overdueFollowUps}
        pendingPartners={pendingPartners}
        unassignedLeads={unassignedLeads}
        quotationsAwaitingReview={quotationsAwaitingReview}
        requirementsAwaitingAction={requirementsAwaitingAction}
      />
      
      {/* KPI Cards: 2-col on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpis.map((kpi) => (
          <Link key={kpi.name} href={kpi.href} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-primary/30 transition-all block">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-500 truncate">{kpi.name}</p>
                <p className="mt-1 md:mt-2 text-xl md:text-3xl font-bold text-gray-900">{kpi.count}</p>
              </div>
              <div className={`p-2 rounded-lg ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <AdminCharts />
        </div>
        <div className="xl:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
