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
  Printer,
  FileCheck,
} from "lucide-react";
import { AdminLeadItem } from "@/lib/admin/data";
import {
  updateAdminLeadStatusAction,
  updateAdminLeadDetailsAction,
  deleteAdminLeadAction,
} from "@/actions/adminLeads";
import { saveLeadPaymentAction, sendLeadReceiptEmailAction } from "@/actions/adminReceipt";
import { useRouter } from "next/navigation";

interface LeadDetailsModalProps {
  lead: AdminLeadItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PENDING: { bg: "bg-amber-950/60", text: "text-amber-400", border: "border-amber-800/80" },
  CONTACTED: { bg: "bg-blue-950/60", text: "text-blue-400", border: "border-blue-800/80" },
  "Quote to Client": { bg: "bg-blue-950/60", text: "text-blue-400", border: "border-blue-800/80" },
  CONFIRMED: { bg: "bg-emerald-950/60", text: "text-emerald-400", border: "border-emerald-800/80" },
  CANCELLED: { bg: "bg-rose-950/60", text: "text-rose-400", border: "border-rose-800/80" },
};

function getStatusLabel(st: string): string {
  const upper = (st || "").toUpperCase();
  if (upper === "CONTACTED" || upper === "QUOTE TO CLIENT" || upper === "QUOTED") return "Quote to Client";
  if (upper === "CONFIRMED") return "CONFIRMED";
  if (upper === "PENDING") return "PENDING";
  if (upper === "CANCELLED") return "CANCELLED";
  return st;
}

export default function LeadDetailsModal({ lead, isOpen, onClose }: LeadDetailsModalProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<string>(lead?.status || "PENDING");
  const [adminNotes, setAdminNotes] = useState<string>(lead?.adminNotes || "");
  const [totalCost, setTotalCost] = useState<string>("10000");
  const [advancePaid, setAdvancePaid] = useState<string>("3000");
  const [customerEmail, setCustomerEmail] = useState<string>(lead?.email || "");

  // Editable Requirement Fields
  const [travelDates, setTravelDates] = useState<string>(lead?.travelDates || "");
  const [guestsCount, setGuestsCount] = useState<string>(lead?.guestsCount || "");
  const [hotelType, setHotelType] = useState<string>(lead?.hotelType || "");
  const [cabType, setCabType] = useState<string>(lead?.cabType || "");

  const [isUpdating, setIsUpdating] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);
  const [detailsSavedMsg, setDetailsSavedMsg] = useState<string | null>(null);
  const [emailMsg, setEmailMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    if (lead) {
      setCurrentStatus(lead.status);
      setAdminNotes(lead.adminNotes || "");
      setCustomerEmail(lead.email || "");
      setTravelDates(lead.travelDates || "");
      setGuestsCount(lead.guestsCount || "");
      setHotelType(lead.hotelType || "");
      setCabType(lead.cabType || "");
      setUpdateMsg(null);
      setDetailsSavedMsg(null);
      setEmailMsg(null);

      // Parse existing payment details from adminNotes
      if (lead.adminNotes) {
        const matchTotal = lead.adminNotes.match(/Total=₹?([0-9,]+)/i);
        const matchAdvance = lead.adminNotes.match(/Advance=₹?([0-9,]+)/i);
        if (matchTotal) {
          const tot = matchTotal[1].replace(/,/g, "");
          setTotalCost(tot);
          if (matchAdvance) {
            setAdvancePaid(matchAdvance[1].replace(/,/g, ""));
          } else {
            setAdvancePaid(String(Math.round(parseInt(tot, 10) * 0.3)));
          }
        }
      }
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const totalNum = parseInt(totalCost, 10) || 0;
  const advanceNum = parseInt(advancePaid, 10) || 0;
  const balanceDue = Math.max(0, totalNum - advanceNum);

  const refId = `WK-${lead.id.slice(-6).toUpperCase()}`;
  const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
  const statusStyle = STATUS_COLORS[currentStatus] || STATUS_COLORS.PENDING;

  // Auto percentage calculators
  const setPercentageAdvance = (pct: number) => {
    const calculated = Math.round(totalNum * (pct / 100));
    setAdvancePaid(String(calculated));
  };

  const handleSaveDetails = async () => {
    setIsSavingDetails(true);
    setDetailsSavedMsg(null);
    try {
      const res = await updateAdminLeadDetailsAction({
        leadId: lead.id,
        travelDates: travelDates.trim(),
        guestsCount: guestsCount.trim(),
        hotelType: hotelType.trim(),
        cabType: cabType.trim(),
      });
      if (res.success) {
        setDetailsSavedMsg("Saved!");
        setTimeout(() => setDetailsSavedMsg(null), 3000);
        router.refresh();
      } else {
        alert(res.error || "Failed to update details.");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error saving details.");
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleSavePaymentAndStatus = async () => {
    setIsUpdating(true);
    setUpdateMsg(null);
    try {
      // Also update any edited trip requirements
      await updateAdminLeadDetailsAction({
        leadId: lead.id,
        travelDates: travelDates.trim(),
        guestsCount: guestsCount.trim(),
        hotelType: hotelType.trim(),
        cabType: cabType.trim(),
      });

      const res = await saveLeadPaymentAction({
        leadId: lead.id,
        totalAmount: totalNum,
        advanceAmount: advanceNum,
        balanceAmount: balanceDue,
        paymentStatus: balanceDue === 0 ? "FULLY_PAID" : "ADVANCE_PAID",
        leadStatus: currentStatus,
        adminNotes: adminNotes.trim(),
      });

      if (res.success) {
        setUpdateMsg("Payment & Details Updated!");
        router.refresh();
      } else {
        setUpdateMsg(res.error || "Failed to save.");
      }
    } catch (e: unknown) {
      setUpdateMsg(e instanceof Error ? e.message : "Error saving payment.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendEmailReceipt = async () => {
    if (!customerEmail.trim()) {
      setEmailMsg({ type: "error", text: "Please enter customer email." });
      return;
    }
    setIsSendingEmail(true);
    setEmailMsg(null);
    try {
      const res = await sendLeadReceiptEmailAction({
        leadId: lead.id,
        customerEmail: customerEmail.trim(),
        totalAmount: totalNum,
        advanceAmount: advanceNum,
        balanceAmount: balanceDue,
      });

      if (res.success) {
        setEmailMsg({ type: "success", text: "Branded PDF receipt sent to customer email!" });
      } else {
        setEmailMsg({ type: "error", text: res.error || "Failed to send email." });
      }
    } catch (e: unknown) {
      setEmailMsg({ type: "error", text: e instanceof Error ? e.message : "Error sending email." });
    } finally {
      setIsSendingEmail(false);
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

  // Generate WhatsApp Quick Itinerary & Payment Voucher / Quotation Text
  const destinationsText = Array.isArray(lead.destinations) && lead.destinations.length > 0
    ? lead.destinations.join(" • ")
    : "Srinagar • Gulmarg • Pahalgam";

  const isQuoting = currentStatus === "CONTACTED";

  const prefilledWhatsApp = isQuoting
    ? encodeURIComponent(
        `*Trip Quotation from WanderKashmir* 🏔️\n` +
        `*Ref ID:* ${refId}\n\n` +
        `Dear *${lead.name}*,\n` +
        `Greetings from WanderKashmir! Here is your customized Kashmir tour proposal:\n\n` +
        `• *Dates / Duration:* ${travelDates || "Upcoming"}\n` +
        `• *No. of Travelers:* ${guestsCount || lead.guestsCount}\n` +
        `• *Route:* ${destinationsText}\n` +
        `• *Stay Category:* ${hotelType || lead.hotelType}\n` +
        `• *Transport:* ${cabType || lead.cabType} (Dedicated Cab + Driver)\n\n` +
        `*💰 Package Price & Payment Terms:*\n` +
        `• *Total Package Cost:* ₹${totalNum.toLocaleString("en-IN")}\n` +
        `• *Advance to Confirm Booking (30%):* ₹${advanceNum.toLocaleString("en-IN")}\n` +
        `• *Balance Due on Arrival:* ₹${balanceDue.toLocaleString("en-IN")} (Payable in Srinagar)\n\n` +
        `Please let us know if you would like to reserve this package!\n` +
        `24/7 Srinagar Helpline: +91 60058 88754\n` +
        `WanderKashmir - Your Trusted Kashmir Host`
      )
    : encodeURIComponent(
        `*Booking Confirmed!* ✅\n` +
        `*WanderKashmir Official Tour Voucher*\n\n` +
        `• *Ref ID:* ${refId}\n` +
        `• *Lead Guest:* ${lead.name}\n` +
        `• *Dates / Duration:* ${travelDates || "Upcoming"}\n` +
        `• *No. of Travelers:* ${guestsCount || lead.guestsCount}\n` +
        `• *Route:* ${destinationsText}\n` +
        `• *Stay Category:* ${hotelType || lead.hotelType}\n` +
        `• *Transport:* ${cabType || lead.cabType} (Private Cab + Driver)\n\n` +
        `*💰 Official Payment Breakdown:*\n` +
        `• *Total Package Cost:* ₹${totalNum.toLocaleString("en-IN")}\n` +
        `• *Advance Received (30%):* ₹${advanceNum.toLocaleString("en-IN")} (CONFIRMED & PAID)\n` +
        `• *Balance Due on Arrival:* ₹${balanceDue.toLocaleString("en-IN")} (Payable at Srinagar)\n\n` +
        `Your dedicated driver contact & hotel check-in vouchers will be shared 24 hours prior to travel.\n` +
        `24/7 Srinagar Helpline: +91 60058 88754\n` +
        `Thank you for choosing WanderKashmir!`
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
                  {getStatusLabel(currentStatus)}
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
          {/* Quick Contact & WhatsApp Actions */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-slate-400">Direct Customer Contact</div>
              <div className="font-mono text-sm sm:text-base font-bold text-white flex items-center gap-2 mt-0.5">
                <span>{lead.phone}</span>
                {customerEmail && <span className="text-xs text-slate-400 font-normal">({customerEmail})</span>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://wa.me/${cleanPhone}?text=${prefilledWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                title={isQuoting ? "Send WhatsApp Quotation with 30% Advance details" : "Send WhatsApp Booking Confirmation"}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isQuoting ? "Send WhatsApp Quote" : "Send WhatsApp Receipt"}</span>
              </a>
              <a
                href={`tel:${lead.phone}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold active:scale-95 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call</span>
              </a>
            </div>
          </div>

          {/* Key Requirement Details (Editable) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Trip Requirements & Preferences</span>
                <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  Editable
                </span>
              </div>
              <div className="flex items-center gap-2">
                {detailsSavedMsg && (
                  <span className="text-[11px] text-emerald-400 font-semibold">{detailsSavedMsg}</span>
                )}
                <button
                  type="button"
                  onClick={handleSaveDetails}
                  disabled={isSavingDetails}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer active:scale-95"
                >
                  {isSavingDetails ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  <span>Save Details</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Duration / Dates */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus-within:border-emerald-500/80 transition-all">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Duration / Dates</span>
                  </div>
                </div>
                <input
                  type="text"
                  value={travelDates}
                  onChange={(e) => setTravelDates(e.target.value)}
                  placeholder="e.g. 5D/4N or 15 March"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Guests Count */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus-within:border-emerald-500/80 transition-all">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Guests Count</span>
                  </div>
                </div>
                <input
                  type="text"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(e.target.value)}
                  placeholder="e.g. Couple (2 Adults)"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Hotel Type */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus-within:border-emerald-500/80 transition-all">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Hotel className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hotel Type</span>
                  </div>
                </div>
                <input
                  type="text"
                  list="hotel-type-options"
                  value={hotelType}
                  onChange={(e) => setHotelType(e.target.value)}
                  placeholder="e.g. 3 Star Standard"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
                />
                <datalist id="hotel-type-options">
                  <option value="3 Star Standard" />
                  <option value="4 Star Deluxe" />
                  <option value="5 Star Luxury" />
                  <option value="Houseboat Premium" />
                  <option value="Budget Stay" />
                </datalist>
              </div>

              {/* Vehicle / Cab */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus-within:border-emerald-500/80 transition-all">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Vehicle / Cab</span>
                  </div>
                </div>
                <input
                  type="text"
                  list="cab-type-options"
                  value={cabType}
                  onChange={(e) => setCabType(e.target.value)}
                  placeholder="e.g. Sedan / SUV"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
                />
                <datalist id="cab-type-options">
                  <option value="Sedan / SUV" />
                  <option value="Innova Crysta (Luxury)" />
                  <option value="Toyota Etios (Sedan)" />
                  <option value="Tempo Traveller (12-16)" />
                  <option value="Urbania (Super Luxury)" />
                </datalist>
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

          {/* Full Notes / Special Requests */}
          <div>
            <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Message & Special Requests:</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap select-text font-sans">
              {lead.specialRequests || "No specific notes provided."}
            </div>
          </div>

          {/* 🌟 ADVANCE & ON-ARRIVAL PAYMENT SPLIT CALCULATOR */}
          <div className="p-4 rounded-xl bg-slate-950/90 border-2 border-emerald-500/40 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  ₹
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Payment & Advance Split Tracker
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    30% Advance & Remaining On-Arrival Split
                  </p>
                </div>
              </div>

              {/* Status Selector */}
              <select
                value={currentStatus}
                onChange={async (e) => {
                  const newSt = e.target.value;
                  setCurrentStatus(newSt);
                  try {
                    await updateAdminLeadStatusAction(lead.id, newSt);
                    router.refresh();
                  } catch (err) {
                    console.error("Status update error:", err);
                  }
                }}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-emerald-300 focus:outline-hidden cursor-pointer"
              >
                <option value="CONFIRMED">CONFIRMED (Advance Locked)</option>
                <option value="PENDING">PENDING PAYMENT</option>
                <option value="CONTACTED">Quote to Client</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Total Package Deal Cost (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    value={totalCost}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTotalCost(val);
                      const num = parseInt(val, 10) || 0;
                      setAdvancePaid(String(Math.round(num * 0.3)));
                    }}
                    placeholder="e.g. 10000"
                    className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono font-bold focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Advance Received (₹)
                  </label>
                  <div className="flex gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setPercentageAdvance(30)}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-emerald-800 text-emerald-300 cursor-pointer font-mono"
                    >
                      30%
                    </button>
                    <button
                      type="button"
                      onClick={() => setPercentageAdvance(50)}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-emerald-800 text-emerald-300 cursor-pointer font-mono"
                    >
                      50%
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-emerald-500 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(e.target.value)}
                    placeholder="e.g. 3000"
                    className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-emerald-400 font-mono font-bold focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Auto-Calculated Balance Due Card */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Balance Due on Arrival in Srinagar:</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Collect from customer upon check-in or airport pickup
                </div>
              </div>
              <div className="text-right">
                <span className="text-base sm:text-lg font-mono font-black text-amber-300">
                  ₹{balanceDue.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Email Voucher Field */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Customer Email for Voucher / PDF Receipt
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendEmailReceipt}
                  disabled={isSendingEmail}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  {isSendingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  <span>Email Voucher</span>
                </button>
              </div>
              {emailMsg && (
                <div className={`text-xs mt-1.5 font-medium ${emailMsg.type === "success" ? "text-emerald-400" : "text-rose-400"}`}>
                  {emailMsg.text}
                </div>
              )}
            </div>

            {/* Save & Print Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-slate-800">
              <a
                href={`/admin/leads/${lead.id}/receipt?total=${totalCost}&advance=${advancePaid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold transition active:scale-95"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>View / Print Luxury PDF Voucher</span>
              </a>

              <div className="flex items-center gap-2">
                {updateMsg && (
                  <span className="text-xs text-emerald-400 font-semibold">{updateMsg}</span>
                )}
                <button
                  type="button"
                  onClick={handleSavePaymentAndStatus}
                  disabled={isUpdating}
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Payment & Confirm</span>
                </button>
              </div>
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
