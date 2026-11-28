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
  X,
} from "lucide-react";
import { AdminLeadItem } from "@/lib/admin/data";
import { deleteAdminLeadAction } from "@/actions/adminLeads";
import { useRouter } from "next/navigation";
import LeadDetailsModal from "./LeadDetailsModal";
import {
  StatusBadge,
  ConfirmActionDialog,
  AdminToastBanner,
  AdminEmptyState,
} from "@/components/admin/ui";

interface LeadsTableClientProps {
  initialLeads: AdminLeadItem[];
}

function getLeadStatusMeta(status: string): {
  label: string;
  tone: "amber" | "blue" | "emerald" | "rose" | "slate";
} {
  const u = (status || "").toUpperCase();
  if (u === "CONTACTED" || u === "QUOTE TO CLIENT" || u === "QUOTED") {
    return { label: "Quote to Client", tone: "blue" };
  }
  if (u === "CONFIRMED") {
    return { label: "Confirmed", tone: "emerald" };
  }
  if (u === "COMPLETED") {
    return { label: "Completed", tone: "emerald" };
  }
  if (u === "CANCELLED") {
    return { label: "Cancelled", tone: "rose" };
  }
  if (u === "PENDING") {
    return { label: "Pending", tone: "amber" };
  }
  return { label: status || "Unknown", tone: "slate" };
}

export default function LeadsTableClient({ initialLeads }: LeadsTableClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedLead, setSelectedLead] = useState<AdminLeadItem | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<AdminLeadItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const counts = useMemo(() => {
    let pending = 0;
    let contacted = 0;
    let confirmed = 0;
    let completed = 0;
    let cancelled = 0;
    for (const lead of initialLeads) {
      const u = (lead.status || "").toUpperCase();
      if (u === "PENDING") pending++;
      else if (u === "CONTACTED" || u === "QUOTE TO CLIENT" || u === "QUOTED") contacted++;
      else if (u === "CONFIRMED") confirmed++;
      else if (u === "COMPLETED") completed++;
      else if (u === "CANCELLED") cancelled++;
    }
    return { all: initialLeads.length, pending, contacted, confirmed, completed, cancelled };
  }, [initialLeads]);

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

      const upper = (lead.status || "").toUpperCase();
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "CONTACTED" &&
          (upper === "CONTACTED" || upper === "QUOTE TO CLIENT" || upper === "QUOTED")) ||
        upper === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [initialLeads, search, statusFilter]);

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

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `wanderkashmir-leads-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setToast({ type: "success", text: `Exported ${filteredLeads.length} leads to CSV.` });
    } catch (e) {
      console.error("Export error:", e);
      setToast({ type: "error", text: "Failed to export leads." });
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    const res = await deleteAdminLeadAction(leadToDelete.id);
    if (res.success) {
      setToast({ type: "success", text: `Deleted lead for ${leadToDelete.name}.` });
      setLeadToDelete(null);
      router.refresh();
    } else {
      throw new Error(res.error || "Failed to delete lead.");
    }
  };

  const tabs = [
    { id: "ALL", label: "All", count: counts.all },
    { id: "PENDING", label: "Pending", count: counts.pending },
    { id: "CONTACTED", label: "Quote to Client", count: counts.contacted },
    { id: "CONFIRMED", label: "Confirmed", count: counts.confirmed },
    { id: "COMPLETED", label: "Completed", count: counts.completed },
    { id: "CANCELLED", label: "Cancelled", count: counts.cancelled },
  ];

  return (
    <div className="space-y-4">
      <AdminToastBanner message={toast} onDismiss={() => setToast(null)} />

      {/* Filter Tabs, Search & CSV Export */}
      <div className="rounded-md border border-slate-200 bg-white p-3.5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {tabs.map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-[var(--season-primary)] text-white shadow-xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                      active ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting || filteredLeads.length === 0}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
            title="Export filtered leads as CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, phone, email, or Ref ID..."
              className="w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:bg-white focus:outline-hidden"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <span className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-900">{filteredLeads.length}</span> of{" "}
            {initialLeads.length} leads
          </span>
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <AdminEmptyState
          title="No matching leads"
          description="Try clearing your search or selecting another pipeline status."
          action={
            (search || statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                }}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Reset Filters
              </button>
            )
          }
        />
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filteredLeads.map((lead) => {
              const statusMeta = getLeadStatusMeta(lead.status);
              return (
                <div
                  key={lead.id}
                  className="rounded-md border border-slate-200 bg-white p-4 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        WK-{lead.id.slice(-6).toUpperCase()}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-900 mt-1.5">{lead.name}</h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={lead.status} label={statusMeta.label} tone={statusMeta.tone} />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLeadToDelete(lead);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete lead"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 py-1.5 px-3 font-mono text-xs text-slate-700"
                    >
                      <Phone className="h-3.5 w-3.5 text-emerald-700" />
                      <span>{lead.phone}</span>
                    </a>
                    <a
                      href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 p-2 text-emerald-700"
                      title="Open WhatsApp"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{lead.travelDates || "Upcoming"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{lead.guestsCount}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedLead(lead)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Details & Quote</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block rounded-md border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Ref ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Dates</th>
                    <th className="px-4 py-3">Guests</th>
                    <th className="px-4 py-3">Preferences / Notes</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Received</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredLeads.map((lead) => {
                    const statusMeta = getLeadStatusMeta(lead.status);
                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          WK-{lead.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                          {lead.name}
                        </td>
                        <td
                          className="px-4 py-3.5 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-800">
                            <span>{lead.phone}</span>
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded p-1 text-emerald-700 hover:bg-emerald-50 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </a>
                          </div>
                          {lead.email && (
                            <div className="text-[11px] text-slate-500">{lead.email}</div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                          {lead.travelDates || "Upcoming"}
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                          {lead.guestsCount}
                        </td>
                        <td
                          className="px-4 py-3.5 max-w-xs truncate"
                          title={lead.specialRequests || ""}
                        >
                          <div className="text-xs font-medium text-slate-800">
                            {lead.hotelType} • {lead.cabType}
                          </div>
                          {lead.specialRequests && (
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {lead.specialRequests}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <StatusBadge status={lead.status} label={statusMeta.label} tone={statusMeta.tone} />
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td
                          className="px-4 py-3.5 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedLead(lead)}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>View</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setLeadToDelete(lead)}
                              className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete lead"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Keyed by lead.id so modal initializes fresh state without set-state-in-effect */}
      <LeadDetailsModal
        key={selectedLead?.id ?? "none"}
        lead={selectedLead}
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
      />

      <ConfirmActionDialog
        open={Boolean(leadToDelete)}
        onClose={() => setLeadToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Lead"
        description={
          leadToDelete
            ? `Permanently delete lead WK-${leadToDelete.id.slice(-6).toUpperCase()} for ${leadToDelete.name} (${leadToDelete.phone})? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete Lead"
        tone="danger"
      />
    </div>
  );
}
