"use client";

import React, { useState } from "react";
import {
  X,
  Phone,
  Mail,
  Calendar,
  Users,
  MapPin,
  Hotel,
  Car,
  FileText,
  Clock,
  CheckCircle2,
  Loader2,
  Trash2,
  Send,
  Printer,
  FileCheck,
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
import { useSeasonalTheme } from "@/lib/theme/themeProvider";
import {
  StatusBadge,
  ConfirmActionDialog,
  useAdminBasePath,
} from "@/components/admin/ui";

interface LeadDetailsModalProps {
  lead: AdminLeadItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_DESTINATIONS = [
  "Srinagar",
  "Gulmarg",
  "Pahalgam",
  "Sonamarg",
  "Doodhpathri",
  "Yusmarg",
  "Gurez Valley",
];

const DEFAULT_GROUND_INSTRUCTIONS = `Dedicated private driver details and cab registration number will be shared 24 hours prior to travel.
Remaining balance must be settled upon arrival in Srinagar.
For any flight delay or on-ground query, connect with our 24/7 Srinagar Operations Desk.`;

const DEFAULT_TERMS_PKG = "Inclusive of stays, private transport & assistance";
const DEFAULT_TERMS_ADV = "Booking locked & vehicle/hotel reserved";
const DEFAULT_TERMS_BAL = "Payable at Srinagar arrival (cash or UPI to driver/hotel)";

function getLeadStatusMeta(st: string): {
  label: string;
  tone: "amber" | "blue" | "emerald" | "rose" | "slate" | "season";
} {
  const upper = (st || "").toUpperCase();
  if (upper === "CONTACTED" || upper === "QUOTE TO CLIENT" || upper === "QUOTED") {
    return { label: "Quote to Client", tone: "blue" };
  }
  if (upper === "CONFIRMED") return { label: "Confirmed", tone: "season" };
  if (upper === "COMPLETED") return { label: "Completed", tone: "emerald" };
  if (upper === "PENDING") return { label: "Pending", tone: "amber" };
  if (upper === "CANCELLED") return { label: "Cancelled", tone: "rose" };
  return { label: st || "Pending", tone: "slate" };
}

function parseDatesAndDuration(raw: string | null | undefined): { date: string; duration: string } {
  if (!raw) return { date: "", duration: "5D/4N" };
  const s = raw.trim();

  if (s.includes("•") || s.includes("|")) {
    const parts = s
      .split(/[•|]/)
      .map((p) => p.trim())
      .filter(Boolean);
    const durationPart = parts.find((p) => /\b\d+D\/?\d*N?\b/i.test(p));
    const datePart = parts.find((p) => p !== durationPart);
    return {
      duration: durationPart || "5D/4N",
      date: datePart || "",
    };
  }

  const durMatch = s.match(/\b\d+D\/?\d*N?\b/i);
  if (durMatch) {
    const dur = durMatch[0];
    const remaining = s.replace(dur, "").replace(/[(),-]/g, "").trim();
    return {
      duration: dur,
      date: remaining,
    };
  }

  if (/\b\d+\s*days?\b/i.test(s)) {
    return { duration: s, date: "" };
  }

  return { date: s, duration: "5D/4N" };
}

function parseInitialLeadState(lead: AdminLeadItem | null) {
  const parsedDates = parseDatesAndDuration(lead?.travelDates);
  let totalCost = "10000";
  let advancePaid = "3000";
  let experiences = "";
  let customInclusions = "";
  let termsPkg = DEFAULT_TERMS_PKG;
  let termsAdv = DEFAULT_TERMS_ADV;
  let termsBal = DEFAULT_TERMS_BAL;
  let groundInstructions = DEFAULT_GROUND_INSTRUCTIONS;

  if (lead?.adminNotes) {
    const matchTotal = lead.adminNotes.match(/Total=₹?([0-9,]+)/i);
    const matchAdvance = lead.adminNotes.match(/Advance=₹?([0-9,]+)/i);
    if (matchTotal) {
      const tot = matchTotal[1].replace(/,/g, "");
      totalCost = tot;
      if (matchAdvance) {
        advancePaid = matchAdvance[1].replace(/,/g, "");
      } else {
        advancePaid = String(Math.round(parseInt(tot, 10) * 0.3));
      }
    }

    const matchExp = lead.adminNotes.match(/Exp=([^|\]]+)/i);
    const matchInc = lead.adminNotes.match(/Perks=([^|\]]+)/i);
    experiences = matchExp ? matchExp[1].trim() : "";
    customInclusions = matchInc ? matchInc[1].trim() : "";

    const matchTerms = lead.adminNotes.match(/\[TERMS:([\s\S]*?)\]/i);
    if (matchTerms) {
      const matchTermsPkg = matchTerms[1].match(/TermsPkg=([^|\]]*)/i);
      const matchTermsAdv = matchTerms[1].match(/TermsAdv=([^|\]]*)/i);
      const matchTermsBal = matchTerms[1].match(/TermsBal=([^|\]]*)/i);
      const pkgVal = matchTermsPkg ? matchTermsPkg[1].trim() : "";
      const advVal = matchTermsAdv ? matchTermsAdv[1].trim() : "";
      const balVal = matchTermsBal ? matchTermsBal[1].trim() : "";
      termsPkg = pkgVal === "NONE" ? "" : pkgVal;
      termsAdv = advVal === "NONE" ? "" : advVal;
      termsBal = balVal === "NONE" ? "" : balVal;
    }

    const matchInst = lead.adminNotes.match(/\[INSTRUCTIONS:([\s\S]*?)\]/i);
    if (matchInst) {
      const raw = matchInst[1].trim();
      groundInstructions = raw === "NONE" ? "" : raw;
    }
  }

  return {
    currentStatus: lead?.status || "PENDING",
    adminNotes: lead?.adminNotes || "",
    customerEmail: lead?.email || "",
    travelDate: parsedDates.date,
    duration: parsedDates.duration,
    guestsCount: lead?.guestsCount || "",
    hotelType: lead?.hotelType || "",
    cabType: lead?.cabType || "",
    destinations: Array.isArray(lead?.destinations) ? [...lead.destinations] : [],
    totalCost,
    advancePaid,
    experiences,
    customInclusions,
    termsPkg,
    termsAdv,
    termsBal,
    groundInstructions,
  };
}

export default function LeadDetailsModal({ lead, isOpen, onClose }: LeadDetailsModalProps) {
  const router = useRouter();
  const { basePath } = useAdminBasePath();
  const { selectedSeason } = useSeasonalTheme();

  const initial = parseInitialLeadState(lead);

  const [currentStatus, setCurrentStatus] = useState<string>(initial.currentStatus);
  const [adminNotes, setAdminNotes] = useState<string>(initial.adminNotes);
  const [totalCost, setTotalCost] = useState<string>(initial.totalCost);
  const [advancePaid, setAdvancePaid] = useState<string>(initial.advancePaid);
  const [customerEmail, setCustomerEmail] = useState<string>(initial.customerEmail);

  const [termsPkg, setTermsPkg] = useState<string>(initial.termsPkg);
  const [termsAdv, setTermsAdv] = useState<string>(initial.termsAdv);
  const [termsBal, setTermsBal] = useState<string>(initial.termsBal);
  const [groundInstructions, setGroundInstructions] = useState<string>(initial.groundInstructions);

  const [travelDate, setTravelDate] = useState<string>(initial.travelDate);
  const [duration, setDuration] = useState<string>(initial.duration);
  const [guestsCount, setGuestsCount] = useState<string>(initial.guestsCount);
  const [hotelType, setHotelType] = useState<string>(initial.hotelType);
  const [cabType, setCabType] = useState<string>(initial.cabType);
  const [experiences, setExperiences] = useState<string>(initial.experiences);
  const [customInclusions, setCustomInclusions] = useState<string>(initial.customInclusions);
  const [destinations, setDestinations] = useState<string[]>(initial.destinations);
  const [customDestInput, setCustomDestInput] = useState<string>("");

  const [isUpdating, setIsUpdating] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [statusFeedback, setStatusFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [updateMsg, setUpdateMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [detailsMsg, setDetailsMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [emailMsg, setEmailMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen || !lead) return null;

  const totalNum = parseInt(totalCost, 10) || 0;
  const advanceNum = parseInt(advancePaid, 10) || 0;
  const balanceDue = Math.max(0, totalNum - advanceNum);
  const advancePct = totalNum > 0 ? Math.round((advanceNum / totalNum) * 100) : 0;
  const advancePctSuffix = advancePct > 0 ? ` (${advancePct}%)` : "";

  const refId = `WK-${lead.id.slice(-6).toUpperCase()}`;
  const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
  const statusMeta = getLeadStatusMeta(currentStatus);

  const setPercentageAdvance = (pct: number) => {
    const calculated = Math.round(totalNum * (pct / 100));
    setAdvancePaid(String(calculated));
  };

  const buildSerializedNotes = (baseNotes: string) => {
    const existingCleanNotes = (baseNotes || "")
      .replace(/\[INCLUSIONS:[^\]]+\]/g, "")
      .replace(/\[TERMS:[^\]]+\]/g, "")
      .replace(/\[INSTRUCTIONS:[\s\S]*?\]/g, "")
      .trim();

    const inclusionsTag =
      experiences.trim() || customInclusions.trim()
        ? `[INCLUSIONS: Exp=${experiences.trim()} | Perks=${customInclusions.trim()}]`
        : "";

    const termsTag = `[TERMS: TermsPkg=${termsPkg.trim() ? termsPkg.trim() : "NONE"} | TermsAdv=${termsAdv.trim() ? termsAdv.trim() : "NONE"} | TermsBal=${termsBal.trim() ? termsBal.trim() : "NONE"}]`;

    const instructionsTag = groundInstructions.trim()
      ? `[INSTRUCTIONS: ${groundInstructions.trim()}]`
      : `[INSTRUCTIONS: NONE]`;

    return [existingCleanNotes, inclusionsTag, termsTag, instructionsTag].filter(Boolean).join(" | ");
  };

  const handleStatusChange = async (newStatus: string) => {
    const previous = currentStatus;
    setCurrentStatus(newStatus);
    setIsSavingStatus(true);
    setStatusFeedback(null);
    try {
      const res = await updateAdminLeadStatusAction(lead.id, newStatus);
      if (res.success) {
        setStatusFeedback({ type: "success", text: "Stage updated." });
        router.refresh();
      } else {
        setCurrentStatus(previous);
        setStatusFeedback({ type: "error", text: res.error || "Failed to update stage." });
      }
    } catch (err: unknown) {
      setCurrentStatus(previous);
      setStatusFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update stage.",
      });
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleSaveDetails = async () => {
    setIsSavingDetails(true);
    setDetailsMsg(null);
    try {
      const combinedDates = [travelDate.trim(), duration.trim()].filter(Boolean).join(" • ");
      const updatedNotes = buildSerializedNotes(adminNotes || lead.adminNotes || "");
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
        setDetailsMsg({ type: "success", text: "Trip requirements saved." });
        router.refresh();
      } else {
        setDetailsMsg({ type: "error", text: res.error || "Failed to update details." });
      }
    } catch (err: unknown) {
      setDetailsMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Error saving details.",
      });
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleSavePaymentAndStatus = async () => {
    setIsUpdating(true);
    setUpdateMsg(null);
    try {
      const combinedDates = [travelDate.trim(), duration.trim()].filter(Boolean).join(" • ");
      const updatedNotes = buildSerializedNotes(adminNotes || lead.adminNotes || "");
      setAdminNotes(updatedNotes);

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
        setUpdateMsg({ type: "success", text: "Payment & details saved." });
        router.refresh();
      } else {
        setUpdateMsg({ type: "error", text: res.error || "Failed to save payment." });
      }
    } catch (e: unknown) {
      setUpdateMsg({
        type: "error",
        text: e instanceof Error ? e.message : "Error saving payment.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendEmailReceipt = async () => {
    if (!customerEmail.trim()) {
      setEmailMsg({ type: "error", text: "Please enter a customer email address." });
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
        season: selectedSeason,
        instructions: groundInstructions,
        termsPkg,
        termsAdv,
        termsBal,
      });

      if (res.success) {
        setEmailMsg({ type: "success", text: "PDF receipt sent to customer email." });
      } else {
        setEmailMsg({ type: "error", text: res.error || "Failed to send email." });
      }
    } catch (e: unknown) {
      setEmailMsg({
        type: "error",
        text: e instanceof Error ? e.message : "Error sending email.",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteAdminLeadAction(lead.id);
      if (res.success) {
        setConfirmDeleteOpen(false);
        onClose();
        router.refresh();
      } else {
        setUpdateMsg({ type: "error", text: res.error || "Failed to delete lead." });
        setConfirmDeleteOpen(false);
      }
    } catch (err: unknown) {
      setUpdateMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Error deleting lead.",
      });
      setConfirmDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const currentDestinationsText = destinations.length > 0 ? destinations.join(" • ") : "";
  const isQuoting = currentStatus === "CONTACTED";
  const hasHotel =
    hotelType &&
    !["none", "n/a", "not required", "no hotel", "not included"].includes(
      hotelType.toLowerCase().trim()
    );
  const hasCab =
    cabType &&
    !["none", "n/a", "not required", "no cab", "no transport", "not included"].includes(
      cabType.toLowerCase().trim()
    );

  const dynamicLogisticsLines = [
    `• *Travel Date:* ${travelDate || "Upcoming / Flexible"}`,
    `• *Trip Duration:* ${duration || "5D/4N"}`,
    `• *No. of Travelers:* ${guestsCount || lead.guestsCount}`,
    currentDestinationsText ? `• *Route:* ${currentDestinationsText}` : null,
    hasHotel ? `• *Stay Category:* ${hotelType}` : null,
    hasCab ? `• *Transport:* ${cabType} (Private Cab + Driver)` : null,
    experiences.trim() ? `• *Activities & Experiences:* ${experiences.trim()}` : null,
    customInclusions.trim() ? `• *Special Perks:* ${customInclusions.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const prefilledWhatsApp = isQuoting
    ? encodeURIComponent(
        `*Trip Quotation from WanderKashmir*\n` +
          `*Ref ID:* ${refId}\n\n` +
          `Dear *${lead.name}*,\n` +
          `Greetings from WanderKashmir! Here is your customized Kashmir proposal:\n\n` +
          `${dynamicLogisticsLines}\n\n` +
          `*Package Price & Payment Terms:*\n` +
          `• *Total Package Cost:* ₹${totalNum.toLocaleString("en-IN")}\n` +
          `• *Advance to Confirm Booking${advancePctSuffix}:* ₹${advanceNum.toLocaleString("en-IN")}\n` +
          `• *Balance Due on Arrival:* ₹${balanceDue.toLocaleString("en-IN")} (Payable in Srinagar)\n\n` +
          `Please let us know if you would like to reserve this package.\n` +
          `24/7 Srinagar Helpline: +91 60058 88754\n` +
          `WanderKashmir - Your Trusted Kashmir Host`
      )
    : encodeURIComponent(
        `*Booking Confirmed — WanderKashmir Official Tour Voucher*\n\n` +
          `• *Ref ID:* ${refId}\n` +
          `• *Lead Guest:* ${lead.name}\n` +
          `${dynamicLogisticsLines}\n\n` +
          `*Official Payment Breakdown:*\n` +
          `• *Total Package Cost:* ₹${totalNum.toLocaleString("en-IN")}\n` +
          `• *Advance Received${advancePctSuffix}:* ₹${advanceNum.toLocaleString("en-IN")} (CONFIRMED & PAID)\n` +
          `• *Balance Due on Arrival:* ₹${balanceDue.toLocaleString("en-IN")} (Payable at Srinagar)\n\n` +
          `Your dedicated driver contact & hotel check-in vouchers will be shared 24 hours prior to travel.\n` +
          `24/7 Srinagar Helpline: +91 60058 88754\n` +
          `Thank you for choosing WanderKashmir!`
      );

  const receiptHref = `${basePath}/leads/${lead.id}/receipt?total=${totalCost}&advance=${advancePaid}&hotel=${encodeURIComponent(hotelType)}&cab=${encodeURIComponent(cabType)}&exp=${encodeURIComponent(experiences)}&inc=${encodeURIComponent(customInclusions)}&route=${encodeURIComponent(destinations.join(" • "))}&season=${selectedSeason}&instructions=${encodeURIComponent(groundInstructions)}&termsPkg=${encodeURIComponent(termsPkg)}&termsAdv=${encodeURIComponent(termsAdv)}&termsBal=${encodeURIComponent(termsBal)}`;

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Lead details for ${lead.name}`}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs"
        onClick={onClose}
      >
        <div
          className="w-full sm:max-w-3xl bg-white border border-slate-200/90 rounded-t-2xl sm:rounded-md shadow-xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {refId}
                </span>
                <StatusBadge status={currentStatus} label={statusMeta.label} tone={statusMeta.tone} />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mt-1">{lead.name}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close lead details"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5 space-y-5 overflow-y-auto flex-1 bg-[#F8FAFC]">
            {/* Direct Contact & WhatsApp */}
            <div className="rounded-md border border-slate-200/90 bg-white p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div>
                <div className="text-[11px] font-medium text-slate-500">Customer Contact</div>
                <div className="font-mono text-sm font-semibold text-slate-900 flex flex-wrap items-center gap-2 mt-0.5">
                  <span>{lead.phone}</span>
                  {customerEmail && (
                    <span className="font-sans text-xs font-normal text-slate-500">
                      ({customerEmail})
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`https://wa.me/${cleanPhone}?text=${prefilledWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isQuoting ? "Send WhatsApp Quote" : "Send WhatsApp Receipt"}</span>
                </a>
                <a
                  href={`tel:${lead.phone}`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span>Call</span>
                </a>
              </div>
            </div>

            {/* Lead Pipeline Stage */}
            <div className="rounded-md border border-slate-200 bg-white p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600 shrink-0">
                  <FileCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">Lead Pipeline Stage</div>
                  <div className="text-[11px] text-slate-500">
                    Update customer stage in the sales pipeline
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {statusFeedback && (
                  <span
                    className={`text-xs font-medium ${
                      statusFeedback.type === "success" ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {statusFeedback.text}
                  </span>
                )}
                <select
                  value={currentStatus}
                  disabled={isSavingStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-[var(--season-primary)] focus:outline-hidden cursor-pointer"
                >
                  <option value="PENDING">Pending (New Lead)</option>
                  <option value="CONTACTED">Quote to Client</option>
                  <option value="CONFIRMED">Confirmed (Advance Locked)</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Editable Trip Requirements */}
            <div className="rounded-md border border-slate-200/90 bg-white p-4 space-y-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-semibold text-slate-900">
                  Trip Requirements & Preferences
                </h4>
                <div className="flex items-center gap-2">
                  {detailsMsg && (
                    <span
                      className={`text-xs font-medium ${
                        detailsMsg.type === "success" ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      {detailsMsg.text}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveDetails}
                    disabled={isSavingDetails}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isSavingDetails ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                    )}
                    <span>Save Details</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <Calendar className="h-3 w-3" />
                    <span>Travel Date</span>
                  </label>
                  <input
                    type="text"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    placeholder="e.g. 15 March"
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>Duration</span>
                  </label>
                  <input
                    type="text"
                    list="duration-options"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 5D/4N"
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
                  />
                  <datalist id="duration-options">
                    <option value="4D/3N" />
                    <option value="5D/4N" />
                    <option value="6D/5N" />
                    <option value="7D/6N" />
                    <option value="8D/7N" />
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <Users className="h-3 w-3" />
                    <span>Guests</span>
                  </label>
                  <input
                    type="text"
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(e.target.value)}
                    placeholder="e.g. Couple (2 Adults)"
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <Hotel className="h-3 w-3" />
                    <span>Hotel Type</span>
                  </label>
                  <input
                    type="text"
                    list="hotel-type-options"
                    value={hotelType}
                    onChange={(e) => setHotelType(e.target.value)}
                    placeholder="e.g. 3 Star Standard"
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
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

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <Car className="h-3 w-3" />
                    <span>Vehicle / Cab</span>
                  </label>
                  <input
                    type="text"
                    list="cab-type-options"
                    value={cabType}
                    onChange={(e) => setCabType(e.target.value)}
                    placeholder="e.g. Sedan / SUV"
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-500">
                    Activities / Experiences (Optional)
                  </label>
                  <input
                    type="text"
                    value={experiences}
                    onChange={(e) => setExperiences(e.target.value)}
                    placeholder="e.g. Gondola Phase 1 & 2 • Shikara Ride"
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-500">
                    Special Inclusions / Perks (Optional)
                  </label>
                  <input
                    type="text"
                    value={customInclusions}
                    onChange={(e) => setCustomInclusions(e.target.value)}
                    placeholder="e.g. Breakfast & Dinner • Toll & Parking"
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Ground Instructions */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    <span>Ground Instructions (PDF Voucher Section 4)</span>
                    {!groundInstructions.trim() && (
                      <span className="text-[11px] text-amber-700">(Hidden from PDF)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setGroundInstructions(DEFAULT_GROUND_INSTRUCTIONS)}
                      className="text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      Reset Default
                    </button>
                    {groundInstructions.trim() && (
                      <button
                        type="button"
                        onClick={() => setGroundInstructions("")}
                        className="text-rose-600 hover:text-rose-700 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={groundInstructions}
                  onChange={(e) => setGroundInstructions(e.target.value)}
                  placeholder="Enter one instruction per line. Leave blank to hide this section from the PDF voucher."
                  className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden leading-relaxed"
                />
              </div>
            </div>

            {/* Covered Destinations */}
            <div className="rounded-md border border-slate-200/90 bg-white p-4 space-y-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>Covered Destinations</span>
                  {destinations.length > 0 ? (
                    <span className="text-[11px] font-normal text-slate-500">
                      ({destinations.length})
                    </span>
                  ) : (
                    <span className="text-[11px] font-normal text-amber-700">
                      (Hidden from PDF voucher)
                    </span>
                  )}
                </div>
                {destinations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDestinations([])}
                    className="text-[11px] font-medium text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {destinations.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {destinations.map((dest) => (
                    <span
                      key={dest}
                      className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800"
                    >
                      <span>{dest}</span>
                      <button
                        type="button"
                        onClick={() => setDestinations((prev) => prev.filter((d) => d !== dest))}
                        className="text-emerald-600 hover:text-emerald-900 cursor-pointer"
                        title={`Remove ${dest}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  No destinations selected. Covered Destinations will be omitted from the PDF voucher.
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
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
                      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer ${
                        isSelected
                          ? "border-[var(--season-primary)] bg-[var(--season-primary)] text-white shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Plus className="h-3 w-3 text-slate-400" />
                      )}
                      <span>{spot}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
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
                  placeholder="Add custom destination (e.g. Aru Valley, Betaab Valley) and press Enter"
                  className="flex-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
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
                  className="inline-flex items-center gap-1 rounded-md bg-[var(--season-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Customer Message */}
            <div className="rounded-md border border-slate-200/90 bg-white p-4 space-y-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span>Customer Message & Special Requests</span>
              </div>
              <div className="rounded-md bg-slate-50 border border-slate-100 p-3 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap select-text">
                {lead.specialRequests || "No specific notes provided."}
              </div>
            </div>

            {/* Payment & Advance Split Tracker */}
            <div className="rounded-md border border-slate-200/90 bg-white p-4 space-y-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    Payment & Advance Split Tracker
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Configure package cost, advance deposit, voucher terms, and balance due on arrival.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Balance Due
                  </div>
                  <div className="font-mono text-base font-bold text-amber-700">
                    ₹{balanceDue.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Total Cost */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Total Package Cost (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-semibold text-slate-400">
                        ₹
                      </span>
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
                        className="w-full rounded-md border border-slate-200 bg-white pl-7 pr-3 py-1.5 font-mono text-xs font-semibold text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-medium text-slate-600">
                        Package Terms
                      </label>
                      <div className="flex items-center gap-2 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setTermsPkg(DEFAULT_TERMS_PKG)}
                          className="text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Default
                        </button>
                        {termsPkg.trim() && (
                          <button
                            type="button"
                            onClick={() => setTermsPkg("")}
                            className="text-rose-600 hover:text-rose-700 cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={termsPkg}
                      onChange={(e) => setTermsPkg(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-[var(--season-primary)] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Advance Paid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-md border border-slate-100 bg-slate-50/70 p-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-slate-700">
                        Advance Received (₹){advancePctSuffix}
                      </label>
                      <div className="flex gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setPercentageAdvance(30)}
                          className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          30%
                        </button>
                        <button
                          type="button"
                          onClick={() => setPercentageAdvance(50)}
                          className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          50%
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-semibold text-emerald-700">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={advancePaid}
                        onChange={(e) => setAdvancePaid(e.target.value)}
                        placeholder="e.g. 3000"
                        className="w-full rounded-md border border-slate-200 bg-white pl-7 pr-3 py-1.5 font-mono text-xs font-semibold text-emerald-800 focus:border-[var(--season-primary)] focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-medium text-slate-600">
                        Advance Terms
                      </label>
                      <div className="flex items-center gap-2 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setTermsAdv(DEFAULT_TERMS_ADV)}
                          className="text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Default
                        </button>
                        {termsAdv.trim() && (
                          <button
                            type="button"
                            onClick={() => setTermsAdv("")}
                            className="text-rose-600 hover:text-rose-700 cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={termsAdv}
                      onChange={(e) => setTermsAdv(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-[var(--season-primary)] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Balance Terms */}
                <div className="rounded-md border border-amber-200/80 bg-amber-50/50 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-amber-900">
                      Balance Due Terms (Collected at Srinagar arrival)
                    </label>
                    <div className="flex items-center gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setTermsBal(DEFAULT_TERMS_BAL)}
                        className="text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        Default
                      </button>
                      {termsBal.trim() && (
                        <button
                          type="button"
                          onClick={() => setTermsBal("")}
                          className="text-rose-600 hover:text-rose-700 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={termsBal}
                    onChange={(e) => setTermsBal(e.target.value)}
                    className="w-full rounded-md border border-amber-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-[var(--season-primary)] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Email Receipt */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Customer Email for Voucher / PDF Receipt
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendEmailReceipt}
                    disabled={isSendingEmail}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {isSendingEmail ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                    )}
                    <span>Email Voucher</span>
                  </button>
                </div>
                {emailMsg && (
                  <p
                    className={`mt-1.5 text-xs font-medium ${
                      emailMsg.type === "success" ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {emailMsg.text}
                  </p>
                )}
              </div>

              {/* Print & Save Payment */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <a
                  href={receiptHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-500" />
                  <span>View / Print PDF Voucher</span>
                </a>

                <div className="flex items-center justify-end gap-2">
                  {updateMsg && (
                    <span
                      className={`text-xs font-medium ${
                        updateMsg.type === "success" ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      {updateMsg.text}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSavePaymentAndStatus}
                    disabled={isUpdating}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Save Payment Details</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Lead</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <ConfirmActionDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Lead"
        description={`Permanently delete lead ${refId} (${lead.name})? This cannot be undone.`}
        confirmLabel="Delete Lead"
        tone="danger"
      />
    </>
  );
}
