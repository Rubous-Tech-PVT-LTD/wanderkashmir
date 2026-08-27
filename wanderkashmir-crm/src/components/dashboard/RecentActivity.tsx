import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { Activity, User, FileText, TrendingUp, CheckCircle, Clock } from "lucide-react";

export default async function RecentActivity() {
  const activities = await prisma.crmAuditLog.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' }
  });

  const getActivityIcon = (action: string, entity: string) => {
    if (action.includes('CREATE') && entity === 'CrmLead') return <User className="h-4 w-4 text-blue-500" />;
    if (action.includes('ASSIGN')) return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    if (action.includes('APPROVE') || action.includes('STATUS')) return <Activity className="h-4 w-4 text-purple-500" />;
    if (entity === 'CrmQuotation') return <TrendingUp className="h-4 w-4 text-orange-500" />;
    if (entity === 'CrmRequirement') return <FileText className="h-4 w-4 text-cyan-500" />;
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const formatAction = (action: string, entity: string) => {
    const actionText = action.replace(/_/g, ' ').toLowerCase();
    const entityText = entity.replace('Crm', '');
    return `${entityText} ${actionText}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">Recent CRM Activity</h3>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No recent activity found.
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icon */}
                <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-gray-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                  {getActivityIcon(activity.action, activity.entity)}
                </div>
                
                {/* Content */}
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 rounded-lg border border-gray-100 shadow-sm ml-2 md:ml-0 hover:border-primary/20 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm text-gray-800 capitalize">
                      {formatAction(activity.action, activity.entity)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                    <span className="truncate pr-2">By: {activity.userRole}</span>
                    <span className="shrink-0">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
