"use client";

import React, { useState } from "react";
import {
  X,
  Phone,
  Mail,
  User,
  Calendar,
  Users,
  MapPin,
  Hotel,
  Car,
  FileText,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Send,
  DollarSign,
  CalendarDays,
} from "lucide-react";
import { AdminLeadItem } from "@/lib/admin/data";
import { updateAdminLeadStatusAction, deleteAdminLeadAction } from "@/actions/adminLeads";
import { useRouter } from "next/navigation";

interface LeadDetailsModalProps {
  lead: AdminLeadItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PENDING: { bg: "bg-amber-950/60", text: "text-amber-400", border: "border-amber-800/80" },
  CONTACTED: { bg: "bg-blue-950/60", text: "text-blue-400", border: "border-blue-800/80" },
  CONFIRMED: { bg: "bg-emerald-950/60", text: "text-emerald-400", border: "border-emerald-800/80" },
  CANCELLED: { bg: "bg-rose-950/60", text: "text-rose-400", border: "border-rose-800/80" },
};

export default function LeadDetailsModal({ lead, isOpen, onClose }: LeadDetailsModalProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<string>(lead?.status || "PENDING");
  const [adminNotes, setAdminNotes] = useState<string>(lead?.adminNotes || "");
  const [quotedPrice, setQuotedPrice] = useState<string>("");
  const [followUpDate, setFollowUpDate] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (lead) {
      setCurrentStatus(lead.status);
      setAdminNotes(lead.adminNotes || "");
      setUpdateMsg(null);
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const refId = `WK-${lead.id.slice(-6).toUpperCase()}`;
  const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
  const statusStyle = STATUS_COLORS[currentStatus] || STATUS_COLORS.PENDING;

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    setUpdateMsg(null);
    try {
      const extraNotesParts = [
        adminNotes.trim() || null,
        quotedPrice ? `[Quoted: ₹${quotedPrice}]` : null,
        followUpDate ? `[FollowUp: ${followUpDate}]` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      const res = await updateAdminLeadStatusAction(lead.id, currentStatus, extraNotesParts);
      if (res.success) {
        setUpdateMsg("Status & Notes saved!");
        router.refresh();
      } else {
        setUpdateMsg(res.error || "Failed to update.");
      }
    } catch (e: unknown) {
      setUpdateMsg(e instanceof Error ? e.message : "Error updating status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete lead WK-${lead.id.slice(-6).toUpperCase()} (${lead.name})?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await deleteAdminLeadAction(lead.id);
      if (res.success) {
        onClose();
        router.refresh();
      } else {
        alert(res.error || "Failed to delete lead.");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deleting lead.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Generate WhatsApp Quick Itinerary / Proposal Text
  const destinationsText = Array.isArray(lead.destinations) && lead.destinations.length > 0
    ? lead.destinations.join(" - ")
    : "Srinagar - Gulmarg - Pahalgam";

  const prefilledProposal = encodeURIComponent(
    `Hello ${lead.name.trim().split(" ")[0]}! Greetings from WanderKashmir.\n\n` +
    `Regarding your ${lead.travelDates || "Kashmir"} trip inquiry (Ref: ${refId}):\n` +
    `• Travelers: ${lead.guestsCount}\n` +
    `• Destinations: ${destinationsText}\n` +
    `• Hotel Category: ${lead.hotelType}\n` +
    `• Transport: ${lead.cabType} (Private cab with mountain driver)\n` +
    (quotedPrice ? `• Package Price: ₹${quotedPrice}\n` : "") +
    `\nWould you like me to share the detailed day-by-day itinerary?`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-2xl bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-emerald-400 font-bold bg-emerald-950 px-2.5 py-0.5 rounded-md border border-emerald-800">
                  {refId}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                >
                  {currentStatus}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                {lead.name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Quick Contact & WhatsApp Proposal Row */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-slate-400">Direct Customer Contact</div>
              <div className="font-mono text-sm sm:text-base font-bold text-white flex items-center gap-2 mt-0.5">
                <span>{lead.phone}</span>
                {lead.email && <span className="text-xs text-slate-400 font-normal">({lead.email})</span>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://wa.me/${cleanPhone}?text=${prefilledProposal}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                title="Send pre-filled itinerary quote on WhatsApp"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send WhatsApp Quote</span>
              </a>
              <a
                href={`tel:${lead.phone}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold active:scale-95 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call</span>
              </a>
            </div>
          </div>

          {/* Key Requirement Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Duration / Dates</span>
              </div>
              <div className="text-sm font-semibold text-white">
                {lead.travelDates || "Upcoming"}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Guests Count</span>
              </div>
              <div className="text-sm font-semibold text-white">
                {lead.guestsCount}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Hotel className="w-3.5 h-3.5 text-slate-500" />
                <span>Hotel Type</span>
              </div>
              <div className="text-xs font-semibold text-white truncate" title={lead.hotelType}>
                {lead.hotelType}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Car className="w-3.5 h-3.5 text-slate-500" />
                <span>Vehicle / Cab</span>
              </div>
              <div className="text-xs font-semibold text-white truncate" title={lead.cabType}>
                {lead.cabType}
              </div>
            </div>
          </div>

          {/* Destinations */}
          {Array.isArray(lead.destinations) && lead.destinations.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Selected Destinations:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {lead.destinations.map((dest, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300"
                  >
                    {dest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full Notes / Special Requests (Zero Truncation!) */}
          <div>
            <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Message & Special Requests:</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap select-text font-sans">
              {lead.specialRequests || "No specific notes provided."}
            </div>
          </div>

          {/* Status & Operational Notes Manager */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Follow-up & Quotation Tracker
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Received: {new Date(lead.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Status</label>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="PENDING">PENDING (Action Required)</option>
                  <option value="CONTACTED">CONTACTED (Follow-up ongoing)</option>
                  <option value="CONFIRMED">CONFIRMED (Booked / Paid)</option>
                  <option value="CANCELLED">CANCELLED (Closed / Inactive)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  <span>Quoted Price (₹)</span>
                </label>
                <input
                  type="text"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                  placeholder="e.g. 28000"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                  <CalendarDays className="w-3 h-3 text-blue-400" />
                  <span>Next Follow-up Date</span>
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Internal Admin Note</label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Sent 5D itinerary with Innova, client asking for 2k discount"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {updateMsg ? (
                <span className="text-xs text-emerald-400 font-medium">{updateMsg}</span>
              ) : <span />}
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
              >
                {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Status & Notes</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer with Delete Spam option */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-3 py-1.5 rounded-lg border border-transparent hover:border-rose-900/60 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? "Deleting..." : "Delete / Spam"}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
