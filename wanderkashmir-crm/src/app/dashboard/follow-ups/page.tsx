import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Calendar, Clock, CheckCircle, ListTodo } from "lucide-react";
import FollowUpRow from "@/components/follow-ups/FollowUpRow";

export default async function FollowUpsPage() {
  const session = await getSession();
  const userId = session?.userId;
  const role = session?.role;

  // Build where clause based on role
  const whereClause = role === 'BUSINESS_ASSOCIATE' ? { baId: userId } : {};

  // Fetch follow ups
  const followUps = await prisma.crmFollowUp.findMany({
    where: whereClause,
    select: {
      id: true,
      task: true,
      dueDate: true,
      status: true,
      notes: true,
      completedAt: true,
      createdAt: true,
      lead: {
        select: {
          id: true,
          companyName: true,
          contactPerson: true,
          phone: true,
          status: true,
        },
      },
      partner: {
        select: {
          id: true,
          companyName: true,
          contactPerson: true,
          phone: true,
        },
      },
      ba: {
        select: { name: true },
      },
    },
    orderBy: [{ dueDate: "asc" }],
  });

  const now = new Date();
  
  // Categorize
  const overdue = followUps.filter(f => f.status === 'PENDING' && new Date(f.dueDate) < now);
  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  
  const today = followUps.filter(f => 
    f.status === 'PENDING' && 
    new Date(f.dueDate) >= todayStart && 
    new Date(f.dueDate) <= todayEnd
  );

  const upcoming = followUps.filter(f => 
    f.status === 'PENDING' && 
    new Date(f.dueDate) > todayEnd
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completedToday = followUps.filter((f: any) => 
    f.status === 'COMPLETED' && 
    f.completedAt && 
    new Date(f.completedAt) >= todayStart && 
    new Date(f.completedAt) <= todayEnd
  );

  const metrics = [
    { name: "Today's Follow-ups", value: today.length, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Overdue", value: overdue.length, icon: Clock, color: "text-red-600", bg: "bg-red-50" },
    { name: "Upcoming", value: upcoming.length, icon: ListTodo, color: "text-purple-600", bg: "bg-purple-50" },
    { name: "Completed Today", value: completedToday.length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Follow-ups</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((stat) => (
          <div key={stat.name} className={`${stat.bg} rounded-lg p-6 flex items-center justify-between border border-gray-100`}>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <stat.icon className={`h-10 w-10 ${stat.color} opacity-80`} />
          </div>
        ))}
      </div>

      <div className="card-white overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
          <div className="font-semibold text-gray-900">Overdue ({overdue.length})</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-gray-200 hidden md:table-header-group">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Company/Contact</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Lead Status</th>
                {role === 'CRM_ADMIN' && <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Assigned BA</th>}
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {overdue.length === 0 ? (
                <tr><td colSpan={role === 'CRM_ADMIN' ? 6 : 5} className="p-6 text-center text-gray-500">No overdue follow-ups.</td></tr>
              ) : (
                overdue.map(f => <FollowUpRow key={f.id} followUp={f} isOverdue={true} isAdmin={role === 'CRM_ADMIN'} />)
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-white overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
          <div className="font-semibold text-gray-900">Today ({today.length})</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-gray-100">
              {today.length === 0 ? (
                <tr><td colSpan={role === 'CRM_ADMIN' ? 6 : 5} className="p-6 text-center text-gray-500">No follow-ups scheduled for today.</td></tr>
              ) : (
                today.map(f => <FollowUpRow key={f.id} followUp={f} isAdmin={role === 'CRM_ADMIN'} />)
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-white overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
          <div className="font-semibold text-gray-900">Upcoming ({upcoming.length})</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-gray-100">
              {upcoming.length === 0 ? (
                <tr><td colSpan={role === 'CRM_ADMIN' ? 6 : 5} className="p-6 text-center text-gray-500">No upcoming follow-ups.</td></tr>
              ) : (
                upcoming.map(f => <FollowUpRow key={f.id} followUp={f} isAdmin={role === 'CRM_ADMIN'} />)
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
