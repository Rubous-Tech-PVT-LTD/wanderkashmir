import { getAdminLeads } from "@/lib/admin/data";
import { Inbox, ArrowLeft, Phone, Calendar, Users, MessageSquare } from "lucide-react";
import Link from "next/link";
import QuickLeadFormModal from "@/components/admin/leads/QuickLeadFormModal";

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
          <div className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span>{leads.length} Total Records</span>
          </div>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-12 text-center text-sm text-slate-400">
          No customer inquiries found in the database. Use "+ Add WhatsApp Lead" to add your first enquiry.
        </div>
      ) : (
        <>
          {/* MOBILE VIEW: Compact Cards (Optimized for Smartphone Screens) */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] text-emerald-400 font-semibold bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-900">
                      WK-{lead.id.slice(-6).toUpperCase()}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1.5">{lead.name}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Contact Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 active:scale-95 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lead.phone}</span>
                  </a>
                  <a
                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center p-2 rounded-lg bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] active:scale-95 transition-all"
                    title="Open WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1 border-t border-slate-900">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{lead.travelDates || "Upcoming"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{lead.guestsCount}</span>
                  </div>
                </div>

                {/* Preferences / Notes */}
                {(lead.hotelType || lead.cabType || lead.specialRequests) && (
                  <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-900/80 space-y-1">
                    <div className="text-slate-300 font-medium">
                      {lead.hotelType} • {lead.cabType}
                    </div>
                    {lead.specialRequests && (
                      <p className="text-slate-400 line-clamp-2 leading-relaxed">
                        {lead.specialRequests}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW: Full Wide Table */}
          <div className="hidden sm:block rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-sm">
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
                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-200">
                          <span>{lead.phone}</span>
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md text-emerald-400 hover:bg-emerald-950/50 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        </div>
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
          </div>
        </>
      )}
    </div>
  );
}
