import { getAdminLeads } from "@/lib/admin/data";
import { Inbox, ArrowLeft } from "lucide-react";
import Link from "next/link";
import QuickLeadFormModal from "@/components/admin/leads/QuickLeadFormModal";
import LeadsTableClient from "@/components/admin/leads/LeadsTableClient";

export const revalidate = 0;

export default async function AdminLeadsPage() {
  const leads = await getAdminLeads(100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-3">
            <Inbox className="w-7 h-7 text-emerald-400" />
            Customer Leads & Inquiries
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time enquiries from Website, Customize Trip, and Direct WhatsApp
          </p>
        </div>

        {/* Action Button & Record Count */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <QuickLeadFormModal />
          <div className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium">
            <span>{leads.length} Total Records</span>
          </div>
        </div>
      </div>

      {/* Leads Table Client with Search, Filters, View Details Modal */}
      <LeadsTableClient initialLeads={leads} />
    </div>
  );
}
