"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Eye,
  MessageSquare,
  Phone,
  Calendar,
  Users,
  Download,
  Trash2,
} from "lucide-react";
import { AdminLeadItem } from "@/lib/admin/data";
import { deleteAdminLeadAction } from "@/actions/adminLeads";
import { useRouter } from "next/navigation";
import LeadDetailsModal from "./LeadDetailsModal";

interface LeadsTableClientProps {
  initialLeads: AdminLeadItem[];
}

export default function LeadsTableClient({ initialLeads }: LeadsTableClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedLead, setSelectedLead] = useState<AdminLeadItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const filteredLeads = useMemo(() => {
    return initialLeads.filter((lead) => {
      const q = search.toLowerCase().trim();
      const refId = `WK-${lead.id.slice(-6).toUpperCase()}`.toLowerCase();
      const matchesSearch =
        !q ||
        lead.name.toLowerCase().includes(q) ||
        lead.phone.toLowerCase().includes(q) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        refId.includes(q);

      const matchesStatus =
        statusFilter === "ALL" || lead.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [initialLeads, search, statusFilter]);

  // Export filtered leads to CSV
  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      const headers = [
        "Ref ID",
        "Customer Name",
        "Phone",
        "Email",
        "Travel Dates",
        "Guests",
        "Destinations",
        "Hotel Category",
        "Vehicle Type",
        "Status",
        "Special Requests / Notes",
        "Received Date",
      ];

      const rows = filteredLeads.map((l) => [
        `WK-${l.id.slice(-6).toUpperCase()}`,
        `"${(l.name || "").replace(/"/g, '""')}"`,
        `"${l.phone || ""}"`,
        `"${l.email || ""}"`,
        `"${l.travelDates || ""}"`,
        `"${l.guestsCount || ""}"`,
        `"${(l.destinations || []).join(", ")}"`,
        `"${l.hotelType || ""}"`,
        `"${l.cabType || ""}"`,
        `"${l.status || ""}"`,
        `"${(l.specialRequests || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
        `"${new Date(l.createdAt).toLocaleDateString()}"`,
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `wanderkashmir-leads-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Export error:", e);
      alert("Failed to export leads.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteLead = async (e: React.MouseEvent, lead: AdminLeadItem) => {
    e.stopPropagation();
    if (!confirm(`Delete test/spam lead for ${lead.name} (${lead.phone})?`)) return;

    try {
      const res = await deleteAdminLeadAction(lead.id);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to delete lead.");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deleting lead.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter & CSV Export Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, phone, or Ref ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        {/* Filter Pills & Export Button */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "PENDING", "CONTACTED", "CONFIRMED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                statusFilter === st
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold whitespace-nowrap transition cursor-pointer shadow-xs ml-1"
            title="Download Leads Excel/CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-12 text-center text-sm text-slate-400">
          No matching leads found for your filter.
        </div>
      ) : (
        <>
          {/* MOBILE VIEW: Cards with prominent "View Details" and "Delete" actions */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filteredLeads.map((lead) => (
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
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                      {lead.status}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteLead(e, lead)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                      title="Delete Lead"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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

                {/* View Details Full Button */}
                <button
                  type="button"
                  onClick={() => setSelectedLead(lead)}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 hover:bg-emerald-900/60 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Full Details & Quote</span>
                </button>
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW: Table with View and Delete action buttons */}
          <div className="hidden sm:block rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Ref ID</th>
                    <th className="px-5 py-3.5">Customer Name</th>
                    <th className="px-5 py-3.5">Contact</th>
                    <th className="px-5 py-3.5">Dates</th>
                    <th className="px-5 py-3.5">Guests</th>
                    <th className="px-5 py-3.5">Preferences / Notes</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Received</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-900/50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        WK-{lead.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-5 py-4 font-bold text-white whitespace-nowrap">
                        {lead.name}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
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
                        <div className="text-xs text-slate-200 font-medium">
                          {lead.hotelType} • {lead.cabType}
                        </div>
                        {lead.specialRequests && (
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {lead.specialRequests}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-slate-700">
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs font-mono whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedLead(lead)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95"
                            title="View Full Lead Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteLead(e, lead)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Lead Details Modal */}
      <LeadDetailsModal
        lead={selectedLead}
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
      />
    </div>
  );
}
