import { getAdminLeads } from "@/lib/admin/data";
import { Inbox, ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";

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
            Read-only stream of production enquiries from Customize Trip and Property booking forms
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Read-Only Mode ({leads.length} Records)</span>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-sm">
        {leads.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            No customer inquiries found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Ref ID</th>
                  <th className="px-5 py-3.5">Customer Name</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Dates / Duration</th>
                  <th className="px-5 py-3.5">Guests</th>
                  <th className="px-5 py-3.5">Preferences</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      WK-{lead.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-4 font-medium text-white whitespace-nowrap">
                      {lead.name}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-mono text-xs text-slate-200">{lead.phone}</div>
                      {lead.email && (
                        <div className="text-[11px] text-slate-400">{lead.email}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-300 whitespace-nowrap">
                      {lead.travelDates || "Upcoming"}
                    </td>
                    <td className="px-5 py-4 text-slate-300 whitespace-nowrap">
                      {lead.guestsCount}
                    </td>
                    <td className="px-5 py-4 text-slate-300 max-w-xs truncate" title={lead.specialRequests || ""}>
                      <div className="text-xs text-slate-200">{lead.hotelType}</div>
                      <div className="text-[11px] text-slate-400">{lead.cabType}</div>
                      {lead.specialRequests && (
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {lead.specialRequests}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 border border-slate-700">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-slate-400 text-xs font-mono whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
