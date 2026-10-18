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
  Sparkles,
  Plus,
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

const POPULAR_DESTINATIONS = [
  "Srinagar",
  "Gulmarg",
  "Pahalgam",
  "Sonamarg",
  "Doodhpathri",
  "Yusmarg",
  "Gurez Valley",
];

function getStatusLabel(st: string): string {
  const upper = (st || "").toUpperCase();
  if (upper === "CONTACTED" || upper === "QUOTE TO CLIENT" || upper === "QUOTED") return "Quote to Client";
  if (upper === "CONFIRMED") return "CONFIRMED";
  if (upper === "PENDING") return "PENDING";
  if (upper === "CANCELLED") return "CANCELLED";
  return st;
}

function parseDatesAndDuration(raw: string | null | undefined): { date: string; duration: string } {
  if (!raw) return { date: "", duration: "5D/4N" };
  const s = raw.trim();

  // If separated by bullet or pipe
  if (s.includes("•") || s.includes("|")) {
    const parts = s.split(/[•|]/).map((p) => p.trim()).filter(Boolean);
    const durationPart = parts.find((p) => /\b\d+D\/?\d*N?\b/i.test(p));
    const datePart = parts.find((p) => p !== durationPart);
    return {
      duration: durationPart || "5D/4N",
      date: datePart || "",
    };
  }

  // If contains a duration pattern like 5D/4N or 6D/5N
  const durMatch = s.match(/\b\d+D\/?\d*N?\b/i);
  if (durMatch) {
    const dur = durMatch[0];
    const remaining = s.replace(dur, "").replace(/[(),-]/g, "").trim();
    return {
      duration: dur,
      date: remaining,
    };
  }

  // If it contains "day" / "night"
  if (/\b\d+\s*days?\b/i.test(s)) {
    return { duration: s, date: "" };
  }

  return { date: s, duration: "5D/4N" };
}

export default function LeadDetailsModal({ lead, isOpen, onClose }: LeadDetailsModalProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<string>(lead?.status || "PENDING");
  const [adminNotes, setAdminNotes] = useState<string>(lead?.adminNotes || "");
  const [totalCost, setTotalCost] = useState<string>("10000");
  const [advancePaid, setAdvancePaid] = useState<string>("3000");
  const [customerEmail, setCustomerEmail] = useState<string>(lead?.email || "");

  // Separated & Editable Requirement Fields
  const [travelDate, setTravelDate] = useState<string>("");
  const [duration, setDuration] = useState<string>("5D/4N");
  const [guestsCount, setGuestsCount] = useState<string>(lead?.guestsCount || "");
  const [hotelType, setHotelType] = useState<string>(lead?.hotelType || "");
  const [cabType, setCabType] = useState<string>(lead?.cabType || "");
  const [experiences, setExperiences] = useState<string>("");
  const [customInclusions, setCustomInclusions] = useState<string>("");
  const [destinations, setDestinations] = useState<string[]>([]);
  const [customDestInput, setCustomDestInput] = useState<string>("");

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

      const parsed = parseDatesAndDuration(lead.travelDates);
      setTravelDate(parsed.date);
      setDuration(parsed.duration);

      setGuestsCount(lead.guestsCount || "");
      setHotelType(lead.hotelType || "");
      setCabType(lead.cabType || "");
      setDestinations(Array.isArray(lead.destinations) ? [...lead.destinations] : []);
      setCustomDestInput("");
      setUpdateMsg(null);
      setDetailsSavedMsg(null);
      setEmailMsg(null);

      // Parse existing payment details and experiences from adminNotes
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

        const matchExp = lead.adminNotes.match(/Exp=([^|\]]+)/i);
        const matchInc = lead.adminNotes.match(/Perks=([^|\]]+)/i);
        setExperiences(matchExp ? matchExp[1].trim() : "");
        setCustomInclusions(matchInc ? matchInc[1].trim() : "");
      } else {
        setExperiences("");
        setCustomInclusions("");
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
      const combinedDates = [travelDate.trim(), duration.trim()].filter(Boolean).join(" • ");
      const existingCleanNotes = (adminNotes || lead.adminNotes || "").replace(/\[INCLUSIONS:[^\]]+\]/g, "").trim();
      const inclusionsTag = (experiences.trim() || customInclusions.trim())
        ? `[INCLUSIONS: Exp=${experiences.trim()} | Perks=${customInclusions.trim()}]`
        : "";
      const updatedNotes = [existingCleanNotes, inclusionsTag].filter(Boolean).join(" | ");
      setAdminNotes(updatedNotes);

      const res = await updateAdminLeadDetailsAction({
        leadId: lead.id,
        travelDates: combinedDates,
        guestsCount: guestsCount.trim(),
        hotelType: hotelType.trim(),
        cabType: cabType.trim(),
        destinations,
        adminNotes: updatedNotes,
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
      const combinedDates = [travelDate.trim(), duration.trim()].filter(Boolean).join(" • ");
      const existingCleanNotes = (adminNotes || lead.adminNotes || "").replace(/\[INCLUSIONS:[^\]]+\]/g, "").trim();
      const inclusionsTag = (experiences.trim() || customInclusions.trim())
        ? `[INCLUSIONS: Exp=${experiences.trim()} | Perks=${customInclusions.trim()}]`
        : "";
      const updatedNotes = [existingCleanNotes, inclusionsTag].filter(Boolean).join(" | ");
      setAdminNotes(updatedNotes);

      // Also update any edited trip requirements
      await updateAdminLeadDetailsAction({
        leadId: lead.id,
        travelDates: combinedDates,
        guestsCount: guestsCount.trim(),
        hotelType: hotelType.trim(),
        cabType: cabType.trim(),
        destinations,
        adminNotes: updatedNotes,
      });

      const res = await saveLeadPaymentAction({
        leadId: lead.id,
        totalAmount: totalNum,
        advanceAmount: advanceNum,
        balanceAmount: balanceDue,
        paymentStatus: balanceDue === 0 ? "FULLY_PAID" : "ADVANCE_PAID",
        leadStatus: currentStatus,
        adminNotes: updatedNotes,
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
  const currentDestinationsText = destinations.length > 0
    ? destinations.join(" • ")
    : "";

  const isQuoting = currentStatus === "CONTACTED";
  const hasHotel = hotelType && !["none", "n/a", "not required", "no hotel", "not included"].includes(hotelType.toLowerCase().trim());
  const hasCab = cabType && !["none", "n/a", "not required", "no cab", "no transport", "not included"].includes(cabType.toLowerCase().trim());

  const dynamicLogisticsLines = [
    `• *Travel Date:* ${travelDate || "Upcoming / Flexible"}`,
    `• *Trip Duration:* ${duration || "5D/4N"}`,
    `• *No. of Travelers:* ${guestsCount || lead.guestsCount}`,
    currentDestinationsText ? `• *Route:* ${currentDestinationsText}` : null,
    hasHotel ? `• *Stay Category:* ${hotelType}` : null,
    hasCab ? `• *Transport:* ${cabType} (Private Cab + Driver)` : null,
    experiences.trim() ? `• *Activities & Experiences:* ${experiences.trim()}` : null,
    customInclusions.trim() ? `• *Special Perks:* ${customInclusions.trim()}` : null,
  ].filter(Boolean).join("\n");

  const prefilledWhatsApp = isQuoting
    ? encodeURIComponent(
        `*Trip Quotation from WanderKashmir* 🏔️\n` +
        `*Ref ID:* ${refId}\n\n` +
        `Dear *${lead.name}*,\n` +
        `Greetings from WanderKashmir! Here is your customized Kashmir proposal:\n\n` +
        `${dynamicLogisticsLines}\n\n` +
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
        `${dynamicLogisticsLines}\n\n` +
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

          {/* 🏷️ LEAD PIPELINE & WORKFLOW STATUS (SEPARATE DEDICATED SECTION) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Lead Pipeline Status</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                  >
                    {getStatusLabel(currentStatus)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Update customer stage in CRM sales pipeline
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px] text-slate-400 whitespace-nowrap font-medium">Select Stage:</label>
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
                className="w-full sm:w-auto px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-emerald-500 rounded-lg text-xs font-bold text-emerald-300 focus:outline-hidden cursor-pointer shadow-xs"
              >
                <option value="PENDING">PENDING (New Lead)</option>
                <option value="CONTACTED">Quote to Client</option>
                <option value="CONFIRMED">CONFIRMED (Advance Locked)</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
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

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {/* 1. Travel Date */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus-within:border-emerald-500/80 transition-all">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Travel Date</span>
                  </div>
                </div>
                <input
                  type="text"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  placeholder="e.g. 15 March"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* 2. Trip Duration */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus-within:border-emerald-500/80 transition-all">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Duration</span>
                  </div>
                </div>
                <input
                  type="text"
                  list="duration-options"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 5D/4N"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
                />
                <datalist id="duration-options">
                  <option value="4D/3N" />
                  <option value="5D/4N" />
                  <option value="6D/5N" />
                  <option value="7D/6N" />
                  <option value="8D/7N" />
                </datalist>
              </div>

              {/* 3. Guests Count */}
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

              {/* 4. Hotel Type */}
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
                  <option value="None / Not Required" />
                  <option value="3 Star Standard" />
                  <option value="4 Star Deluxe" />
                  <option value="5 Star Luxury" />
                  <option value="Houseboat Premium" />
                  <option value="Budget Stay" />
                </datalist>
              </div>

              {/* 5. Vehicle / Cab */}
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
                  placeholder="e.g. Sedan / SUV or None"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
                />
                <datalist id="cab-type-options">
                  <option value="None / Not Required" />
                  <option value="Sedan / SUV" />
                  <option value="Innova Crysta (Luxury)" />
                  <option value="Toyota Etios (Sedan)" />
                  <option value="Tempo Traveller (12-16)" />
                  <option value="Urbania (Super Luxury)" />
                </datalist>
              </div>
            </div>

            {/* Optional Experiences & Custom Inclusions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5">
              {/* Experiences & Activities */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus-within:border-emerald-500/80 transition-all">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Activities / Experiences (Optional)</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Leave blank if none</span>
                </div>
                <input
                  type="text"
                  value={experiences}
                  onChange={(e) => setExperiences(e.target.value)}
                  placeholder="e.g. Gondola Phase 1 & 2 • Shikara Ride • Trekking"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Special Inclusions & Perks */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus-within:border-emerald-500/80 transition-all">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <div className="flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Special Inclusions / Notes (Optional)</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Leave blank if none</span>
                </div>
                <input
                  type="text"
                  value={customInclusions}
                  onChange={(e) => setCustomInclusions(e.target.value)}
                  placeholder="e.g. Breakfast & Dinner • Sightseeing Toll & Parking"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Editable Destinations Section */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Selected Destinations:</span>
                <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  Editable
                </span>
                {destinations.length > 0 ? (
                  <span className="text-[11px] text-slate-400 font-normal">
                    ({destinations.length} places)
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-400 font-medium">
                    (Blank — Hidden from PDF Voucher)
                  </span>
                )}
              </div>

              {destinations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDestinations([])}
                  className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors font-medium cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Active Selected Destination Badges with Remove 'X' */}
            {destinations.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {destinations.map((dest, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-800/70 text-xs font-medium text-emerald-300 animate-in fade-in duration-150"
                  >
                    <span>{dest}</span>
                    <button
                      type="button"
                      onClick={() => setDestinations((prev) => prev.filter((d) => d !== dest))}
                      className="hover:text-white transition-colors cursor-pointer text-emerald-400"
                      title={`Remove ${dest}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-dashed border-slate-800 text-[11px] text-slate-400">
                ⚠️ No destinations selected. &quot;Covered Destinations&quot; will not appear in the PDF voucher.
              </div>
            )}

            {/* Quick Toggle / Add Popular Kashmir Spots */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[11px] text-slate-400 mb-1.5 font-medium flex items-center justify-between">
                <span>Quick Add / Toggle Popular Spots:</span>
                <span className="text-[10px] text-slate-500">Click to toggle</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_DESTINATIONS.map((spot) => {
                  const isSelected = destinations.includes(spot);
                  return (
                    <button
                      key={spot}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setDestinations((prev) => prev.filter((d) => d !== spot));
                        } else {
                          setDestinations((prev) => [...prev, spot]);
                        }
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium transition cursor-pointer ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                      }`}
                    >
                      {isSelected ? <CheckCircle2 className="w-3 h-3" /> : <Plus className="w-3 h-3 text-slate-400" />}
                      <span>{spot}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Destination Input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customDestInput}
                onChange={(e) => setCustomDestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const trimmed = customDestInput.trim();
                    if (trimmed && !destinations.includes(trimmed)) {
                      setDestinations((prev) => [...prev, trimmed]);
                      setCustomDestInput("");
                    }
                  }
                }}
                placeholder="Add custom place (e.g. Aru Valley, Betaab Valley, Sinthan Top) + Enter"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => {
                  const trimmed = customDestInput.trim();
                  if (trimmed && !destinations.includes(trimmed)) {
                    setDestinations((prev) => [...prev, trimmed]);
                    setCustomDestInput("");
                  }
                }}
                disabled={!customDestInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

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
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                ₹
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Payment & Advance Split Tracker
                </h4>
                <p className="text-[10px] text-slate-400">
                  30% Advance Deposit & Remaining On-Arrival Split
                </p>
              </div>
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
                href={`/admin/leads/${lead.id}/receipt?total=${totalCost}&advance=${advancePaid}&hotel=${encodeURIComponent(hotelType)}&cab=${encodeURIComponent(cabType)}&exp=${encodeURIComponent(experiences)}&inc=${encodeURIComponent(customInclusions)}&route=${encodeURIComponent(destinations.join(" • "))}`}
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
                  <span>Save Payment Details</span>
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
