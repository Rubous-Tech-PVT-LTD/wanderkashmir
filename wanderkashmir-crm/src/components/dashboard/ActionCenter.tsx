import Link from "next/link";
import { AlertCircle, Clock, Users, FileText, TrendingUp, CheckCircle2 } from "lucide-react";

interface ActionCenterProps {
  overdueFollowUps: number;
  pendingPartners: number;
  unassignedLeads: number;
  quotationsAwaitingReview: number;
  requirementsAwaitingAction: number;
}

export default function ActionCenter({
  overdueFollowUps,
  pendingPartners,
  unassignedLeads,
  quotationsAwaitingReview,
  requirementsAwaitingAction
}: ActionCenterProps) {
  const totalActions = overdueFollowUps + pendingPartners + unassignedLeads + quotationsAwaitingReview + requirementsAwaitingAction;

  if (totalActions === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 flex items-center justify-center gap-3 text-green-600">
        <CheckCircle2 className="h-6 w-6" />
        <p className="font-medium">All caught up! No pending actions require your immediate attention.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          Action Center
        </h2>
        <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
          {totalActions} pending
        </span>
      </div>
      <div className="p-2 sm:p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        {overdueFollowUps > 0 && (
          <Link href="/dashboard/follow-ups?filter=overdue" className="flex items-center gap-3 p-3 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 transition-colors">
            <div className="bg-red-200 text-red-700 p-2 rounded-full flex-shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-red-700 leading-tight">{overdueFollowUps}</p>
              <p className="text-xs font-medium text-red-600">Overdue Follow-ups</p>
            </div>
          </Link>
        )}
        
        {pendingPartners > 0 && (
          <Link href="/dashboard/partners?status=INACTIVE" className="flex items-center gap-3 p-3 rounded-lg border border-amber-100 bg-amber-50 hover:bg-amber-100 transition-colors">
            <div className="bg-amber-200 text-amber-700 p-2 rounded-full flex-shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-amber-700 leading-tight">{pendingPartners}</p>
              <p className="text-xs font-medium text-amber-600">Pending Partners</p>
            </div>
          </Link>
        )}
        
        {unassignedLeads > 0 && (
          <Link href="/dashboard/leads?unassigned=true" className="flex items-center gap-3 p-3 rounded-lg border border-orange-100 bg-orange-50 hover:bg-orange-100 transition-colors">
            <div className="bg-orange-200 text-orange-700 p-2 rounded-full flex-shrink-0">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-orange-700 leading-tight">{unassignedLeads}</p>
              <p className="text-xs font-medium text-orange-600">Unassigned Leads</p>
            </div>
          </Link>
        )}
        
        {quotationsAwaitingReview > 0 && (
          <Link href="/dashboard/quotations?status=INTERNAL_REVIEW" className="flex items-center gap-3 p-3 rounded-lg border border-yellow-100 bg-yellow-50 hover:bg-yellow-100 transition-colors">
            <div className="bg-yellow-200 text-yellow-700 p-2 rounded-full flex-shrink-0">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-yellow-700 leading-tight">{quotationsAwaitingReview}</p>
              <p className="text-xs font-medium text-yellow-700">Quotes to Review</p>
            </div>
          </Link>
        )}
        
        {requirementsAwaitingAction > 0 && (
          <Link href="/dashboard/requirements?status=NEW" className="flex items-center gap-3 p-3 rounded-lg border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 transition-colors">
            <div className="bg-emerald-200 text-emerald-700 p-2 rounded-full flex-shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-700 leading-tight">{requirementsAwaitingAction}</p>
              <p className="text-xs font-medium text-emerald-600">New Requirements</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
