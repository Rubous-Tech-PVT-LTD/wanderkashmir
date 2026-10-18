import { getAdminLeadById } from "@/lib/admin/data";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import VoucherToolbar from "./VoucherToolbar";
import { SeasonId } from "@/lib/theme/seasonalThemes";
import { getSeasonFromDate } from "@/lib/theme/seasonUtils";

export const revalidate = 0;

interface VoucherSeasonTheme {
  id: SeasonId;
  name: string;
  kashmiriName: string;
  tagline: string;
  headerBg: string;
  headerBorder: string;
  headerBadgeBg: string;
  headerBadgeBorder: string;
  headerBadgeText: string;
  headerSubtext: string;
  headerMetaAccent: string;
  sectionTitleText: string;
  sectionBorder: string;
  accentText: string;
  tableBorder: string;
  tableHeadBg: string;
  tableHeadText: string;
  advanceRowBg: string;
  advanceRowText: string;
  advanceAmountText: string;
  advanceShieldColor: string;
  arrivalRowBg: string;
  arrivalRowText: string;
  arrivalAmountText: string;
  arrivalBorder: string;
  instructionsBg: string;
  instructionsBorder: string;
  verifiedBadgeBg: string;
  verifiedBadgeBorder: string;
  verifiedBadgeText: string;
  verifiedShieldColor: string;
}

const VOUCHER_SEASON_THEMES: Record<SeasonId, VoucherSeasonTheme> = {
  autumn: {
    id: "autumn",
    name: "Autumn",
    kashmiriName: "Harud",
    tagline: "Chinar Rust & Saffron Gold",
    headerBg: "bg-gradient-to-r from-[#2a0e0e] via-[#3d1313] to-[#4f1616]",
    headerBorder: "border-[#D62828]",
    headerBadgeBg: "bg-red-950/80",
    headerBadgeBorder: "border-red-600/50",
    headerBadgeText: "text-amber-200",
    headerSubtext: "text-amber-100/90",
    headerMetaAccent: "text-amber-300",
    sectionTitleText: "text-[#991B1B]",
    sectionBorder: "border-amber-200/80",
    accentText: "text-[#C2410C]",
    tableBorder: "border-amber-300/80",
    tableHeadBg: "bg-[#7F1D1D]",
    tableHeadText: "text-white",
    advanceRowBg: "bg-amber-50/70",
    advanceRowText: "text-amber-950",
    advanceAmountText: "text-[#B45309]",
    advanceShieldColor: "text-[#EA580C]",
    arrivalRowBg: "bg-orange-50/90",
    arrivalRowText: "text-orange-950",
    arrivalAmountText: "text-[#9A3412]",
    arrivalBorder: "border-orange-300",
    instructionsBg: "bg-orange-50/40",
    instructionsBorder: "border-orange-200/70",
    verifiedBadgeBg: "bg-orange-100",
    verifiedBadgeBorder: "border-orange-300",
    verifiedBadgeText: "text-orange-900",
    verifiedShieldColor: "text-[#EA580C]",
  },
  spring: {
    id: "spring",
    name: "Spring",
    kashmiriName: "Sonth",
    tagline: "Tulip Pink & Almond Blooms",
    headerBg: "bg-gradient-to-r from-[#290d1c] via-[#3b1227] to-[#4c1633]",
    headerBorder: "border-[#D91E63]",
    headerBadgeBg: "bg-pink-950/80",
    headerBadgeBorder: "border-pink-600/50",
    headerBadgeText: "text-pink-200",
    headerSubtext: "text-pink-100/90",
    headerMetaAccent: "text-pink-300",
    sectionTitleText: "text-[#9D174D]",
    sectionBorder: "border-pink-200/80",
    accentText: "text-[#D91E63]",
    tableBorder: "border-pink-300/80",
    tableHeadBg: "bg-[#831843]",
    tableHeadText: "text-white",
    advanceRowBg: "bg-pink-50/70",
    advanceRowText: "text-pink-950",
    advanceAmountText: "text-[#BE185D]",
    advanceShieldColor: "text-[#D91E63]",
    arrivalRowBg: "bg-rose-50/90",
    arrivalRowText: "text-rose-950",
    arrivalAmountText: "text-[#9F1239]",
    arrivalBorder: "border-rose-300",
    instructionsBg: "bg-pink-50/40",
    instructionsBorder: "border-pink-200/70",
    verifiedBadgeBg: "bg-pink-100",
    verifiedBadgeBorder: "border-pink-300",
    verifiedBadgeText: "text-pink-900",
    verifiedShieldColor: "text-[#D91E63]",
  },
  summer: {
    id: "summer",
    name: "Summer",
    kashmiriName: "Grishm",
    tagline: "Pine Green & Dal Lake Blue",
    headerBg: "bg-gradient-to-r from-[#064e3b] via-[#094132] to-[#0d3b2f]",
    headerBorder: "border-[#10B981]",
    headerBadgeBg: "bg-emerald-950/80",
    headerBadgeBorder: "border-emerald-600/50",
    headerBadgeText: "text-emerald-200",
    headerSubtext: "text-emerald-100/90",
    headerMetaAccent: "text-emerald-300",
    sectionTitleText: "text-[#065F46]",
    sectionBorder: "border-emerald-200/80",
    accentText: "text-[#047857]",
    tableBorder: "border-emerald-300/80",
    tableHeadBg: "bg-[#064E3B]",
    tableHeadText: "text-white",
    advanceRowBg: "bg-emerald-50/70",
    advanceRowText: "text-emerald-950",
    advanceAmountText: "text-[#047857]",
    advanceShieldColor: "text-[#059669]",
    arrivalRowBg: "bg-amber-50/90",
    arrivalRowText: "text-amber-950",
    arrivalAmountText: "text-[#92400E]",
    arrivalBorder: "border-amber-300",
    instructionsBg: "bg-emerald-50/40",
    instructionsBorder: "border-emerald-200/70",
    verifiedBadgeBg: "bg-emerald-100",
    verifiedBadgeBorder: "border-emerald-300",
    verifiedBadgeText: "text-emerald-900",
    verifiedShieldColor: "text-[#059669]",
  },
  winter: {
    id: "winter",
    name: "Winter",
    kashmiriName: "Wandh",
    tagline: "Glacier Cyan & Alpine Mountain Slate",
    headerBg: "bg-gradient-to-r from-[#091b2b] via-[#0f2d47] to-[#143b5c]",
    headerBorder: "border-[#00B4D8]",
    headerBadgeBg: "bg-sky-950/80",
    headerBadgeBorder: "border-sky-600/50",
    headerBadgeText: "text-sky-200",
    headerSubtext: "text-sky-100/90",
    headerMetaAccent: "text-sky-300",
    sectionTitleText: "text-[#0369A1]",
    sectionBorder: "border-sky-200/80",
    accentText: "text-[#0284C7]",
    tableBorder: "border-sky-300/80",
    tableHeadBg: "bg-[#0C4A6E]",
    tableHeadText: "text-white",
    advanceRowBg: "bg-sky-50/70",
    advanceRowText: "text-sky-950",
    advanceAmountText: "text-[#0284C7]",
    advanceShieldColor: "text-[#00B4D8]",
    arrivalRowBg: "bg-slate-100/90",
    arrivalRowText: "text-slate-950",
    arrivalAmountText: "text-[#1E293B]",
    arrivalBorder: "border-slate-300",
    instructionsBg: "bg-sky-50/40",
    instructionsBorder: "border-sky-200/70",
    verifiedBadgeBg: "bg-sky-100",
    verifiedBadgeBorder: "border-sky-300",
    verifiedBadgeText: "text-sky-900",
    verifiedShieldColor: "text-[#00B4D8]",
  },
};

function resolveSeason(seasonParam?: string, travelDates?: string | null): SeasonId {
  const validSeasons: SeasonId[] = ["spring", "summer", "autumn", "winter"];
  if (seasonParam && validSeasons.includes(seasonParam.toLowerCase() as SeasonId)) {
    return seasonParam.toLowerCase() as SeasonId;
  }

  if (travelDates) {
    const s = travelDates.toLowerCase();
    if (s.includes("mar") || s.includes("apr") || s.includes("may") || s.includes("spring") || s.includes("sonth")) {
      return "spring";
    }
    if (s.includes("jun") || s.includes("jul") || s.includes("aug") || s.includes("summer") || s.includes("grishm")) {
      return "summer";
    }
    if (s.includes("sep") || s.includes("oct") || s.includes("nov") || s.includes("autumn") || s.includes("harud") || s.includes("fall")) {
      return "autumn";
    }
    if (s.includes("dec") || s.includes("jan") || s.includes("feb") || s.includes("winter") || s.includes("wandh")) {
      return "winter";
    }
  }

  return getSeasonFromDate(new Date());
}

const DEFAULT_GROUND_INSTRUCTIONS = `Dedicated private driver details and cab registration number will be shared 24 hours prior to travel.
Remaining balance must be settled upon arrival in Srinagar.
For any flight delay or on-ground query, connect with our 24/7 Srinagar Operations Desk.`;

export default async function LeadReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    total?: string;
    advance?: string;
    hotel?: string;
    cab?: string;
    route?: string;
    exp?: string;
    inc?: string;
    season?: string;
    instructions?: string;
    termsPkg?: string;
    termsAdv?: string;
    termsBal?: string;
  }>;
}) {
  const { id } = await params;
  const sParams = await searchParams;
  const lead = await getAdminLeadById(id);

  if (!lead) {
    notFound();
  }

  // Parse payment details from query or from lead.adminNotes
  let totalAmount = parseInt(sParams.total || "0", 10);
  let advanceAmount = parseInt(sParams.advance || "0", 10);

  if (!totalAmount && lead.adminNotes) {
    const matchTotal = lead.adminNotes.match(/Total=₹?([0-9,]+)/i);
    const matchAdvance = lead.adminNotes.match(/Advance=₹?([0-9,]+)/i);
    if (matchTotal) totalAmount = parseInt(matchTotal[1].replace(/,/g, ""), 10);
    if (matchAdvance) advanceAmount = parseInt(matchAdvance[1].replace(/,/g, ""), 10);
  }

  // Fallbacks if not set
  if (!totalAmount) totalAmount = 10000;
  if (!advanceAmount) advanceAmount = Math.round(totalAmount * 0.3);
  const balanceAmount = Math.max(0, totalAmount - advanceAmount);

  const refId = `WK-${lead.id.slice(-6).toUpperCase()}`;
  const destinationsText = Array.isArray(lead.destinations) && lead.destinations.length > 0
    ? lead.destinations.join(" • ")
    : "";

  // Check if adminNotes has saved experiences / inclusions / instructions / terms
  let savedExp = "";
  let savedInc = "";
  let savedInstructions = "";
  let savedTermsPkg = "";
  let savedTermsAdv = "";
  let savedTermsBal = "";
  if (lead.adminNotes) {
    const matchExp = lead.adminNotes.match(/Exp=([^|\]]+)/i);
    const matchInc = lead.adminNotes.match(/Perks=([^|\]]+)/i);
    const matchInst = lead.adminNotes.match(/\[INSTRUCTIONS:([\s\S]*?)\]/i);
    const matchTermsPkg = lead.adminNotes.match(/TermsPkg=([^|\]]+)/i);
    const matchTermsAdv = lead.adminNotes.match(/TermsAdv=([^|\]]+)/i);
    const matchTermsBal = lead.adminNotes.match(/TermsBal=([^|\]]+)/i);
    if (matchExp) savedExp = matchExp[1].trim();
    if (matchInc) savedInc = matchInc[1].trim();
    if (matchInst) savedInstructions = matchInst[1].trim();
    if (matchTermsPkg) savedTermsPkg = matchTermsPkg[1].trim();
    if (matchTermsAdv) savedTermsAdv = matchTermsAdv[1].trim();
    if (matchTermsBal) savedTermsBal = matchTermsBal[1].trim();
  }

  const termsPkgVal = sParams.termsPkg !== undefined
    ? sParams.termsPkg
    : (savedTermsPkg || "Inclusive of stays, private transport & assistance");

  const termsAdvVal = sParams.termsAdv !== undefined
    ? sParams.termsAdv
    : (savedTermsAdv || "Booking locked & vehicle/hotel reserved");

  const termsBalVal = sParams.termsBal !== undefined
    ? sParams.termsBal
    : (savedTermsBal || "Payable at Srinagar arrival (cash or UPI to driver/hotel)");

  const rawInstructions = sParams.instructions !== undefined
    ? sParams.instructions
    : (savedInstructions || DEFAULT_GROUND_INSTRUCTIONS);

  const isInstructionsMeaningful = (val: string) => {
    if (!val) return false;
    const lower = val.toLowerCase().trim();
    return !["none", "n/a", "not required", "no", "hide", "blank", "null", "undefined"].includes(lower);
  };

  const parsedInstructionsLines = isInstructionsMeaningful(rawInstructions)
    ? rawInstructions
        .split(/[\n|]/)
        .map((line) => line.replace(/^[•\s*-]+/, "").trim())
        .filter(Boolean)
    : [];

  const hotelVal = (sParams.hotel !== undefined ? sParams.hotel : lead.hotelType || "").trim();
  const cabVal = (sParams.cab !== undefined ? sParams.cab : lead.cabType || "").trim();
  const routeVal = (sParams.route !== undefined ? sParams.route : destinationsText).trim();
  const expVal = (sParams.exp !== undefined ? sParams.exp : savedExp).trim();
  const incVal = (sParams.inc !== undefined ? sParams.inc : savedInc).trim();

  const isMeaningful = (val: string) => {
    if (!val) return false;
    const lower = val.toLowerCase().trim();
    return !["none", "n/a", "not required", "no hotel", "no cab", "not included", "unspecified", "null", "undefined"].includes(lower);
  };

  const logisticsItems: { label: string; value: string; highlight?: boolean }[] = [];

  if (isMeaningful(routeVal)) {
    logisticsItems.push({ label: "Covered Destinations", value: routeVal });
  }

  if (isMeaningful(hotelVal)) {
    logisticsItems.push({ label: "Stay Accommodation", value: hotelVal });
  }

  if (isMeaningful(cabVal)) {
    logisticsItems.push({ label: "Assigned Transport", value: `${cabVal} (Private Dedicated Vehicle)` });
  }

  if (isMeaningful(expVal)) {
    logisticsItems.push({ label: "Activities & Experiences", value: expVal, highlight: true });
  }

  if (isMeaningful(incVal)) {
    logisticsItems.push({ label: "Package Inclusions & Perks", value: incVal, highlight: true });
  }

  const datesParsed = (() => {
    const raw = lead.travelDates || "";
    if (raw.includes("•") || raw.includes("|")) {
      const parts = raw.split(/[•|]/).map((p) => p.trim()).filter(Boolean);
      const durationPart = parts.find((p) => /\b\d+D\/?\d*N?\b/i.test(p));
      const datePart = parts.find((p) => p !== durationPart);
      return { duration: durationPart || "5D/4N", date: datePart || "Upcoming" };
    }
    const durMatch = raw.match(/\b\d+D\/?\d*N?\b/i);
    if (durMatch) {
      const dur = durMatch[0];
      const rem = raw.replace(dur, "").replace(/[(),-]/g, "").trim();
      return { duration: dur, date: rem || "Upcoming" };
    }
    return { date: raw || "Upcoming", duration: "5D/4N" };
  })();

  const activeSeason = resolveSeason(sParams.season, lead.travelDates);
  const voucherTheme = VOUCHER_SEASON_THEMES[activeSeason] || VOUCHER_SEASON_THEMES.autumn;

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6">
      {/* Top Floating Action Bar with Season Switcher & Print Button (Hidden when printing) */}
      <VoucherToolbar activeSeason={activeSeason} />

      {/* Luxury Printable Voucher Card (A4 Aspect Ratio Optimized) */}
      <div
        id="printable-voucher"
        className="max-w-3xl mx-auto bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 print:shadow-none print:border-none print:rounded-none print:p-0 print:m-0"
      >
        {/* Header Ribbon with Dynamic Seasonal Palette */}
        <div className={`${voucherTheme.headerBg} text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 ${voucherTheme.headerBorder}`}>
          <div>
            <div className={`inline-block px-2.5 py-0.5 rounded-full ${voucherTheme.headerBadgeBg} text-[10px] font-bold tracking-widest uppercase ${voucherTheme.headerBadgeText} mb-2 border ${voucherTheme.headerBadgeBorder}`}>
              Official Booking Voucher • {voucherTheme.name} ({voucherTheme.kashmiriName})
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif">
              WanderKashmir
            </h1>
            <p className={`text-xs ${voucherTheme.headerSubtext} font-medium mt-0.5`}>
              Curated Local Kashmir Tour Packages & Stays • {voucherTheme.tagline}
            </p>
          </div>

          <div className={`text-left sm:text-right text-xs ${voucherTheme.headerSubtext} space-y-1 font-mono`}>
            <div><strong className="text-white">Ref ID:</strong> {refId}</div>
            <div><strong>Date:</strong> {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</div>
            <div className={`text-[11px] font-bold ${voucherTheme.headerMetaAccent}`}>
              Status: CONFIRMED & LOCKED
            </div>
          </div>
        </div>

        {/* Voucher Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Guest & Trip Summary */}
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${voucherTheme.sectionTitleText} border-b ${voucherTheme.sectionBorder} pb-1.5 mb-3`}>
              1. Guest & Travel Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Lead Guest</span>
                <strong className="text-slate-900 text-sm">{lead.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Phone / WhatsApp</span>
                <strong className="font-mono text-slate-900">{lead.phone}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Travel Date</span>
                <strong className="text-slate-900">{datesParsed.date}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Duration</span>
                <strong className={`${voucherTheme.accentText} font-bold`}>{datesParsed.duration}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">No. of Guests</span>
                <strong className="text-slate-900">{lead.guestsCount}</strong>
              </div>
            </div>
          </div>

          {/* Dynamic Itinerary & Ground Logistics (Only shows non-empty fields) */}
          {logisticsItems.length > 0 && (
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${voucherTheme.sectionTitleText} border-b ${voucherTheme.sectionBorder} pb-1.5 mb-3`}>
                2. Itinerary & Ground Logistics
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
                {logisticsItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-4">
                    <span className="text-slate-600 shrink-0 font-medium">{item.label}:</span>
                    <strong className={`text-right ${item.highlight ? voucherTheme.accentText : "text-slate-900"}`}>
                      {item.value}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Breakdown Table */}
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${voucherTheme.sectionTitleText} border-b ${voucherTheme.sectionBorder} pb-1.5 mb-3`}>
              3. Official Payment & Advance Receipt
            </h3>
            <div className={`rounded-xl border-2 ${voucherTheme.tableBorder} overflow-hidden ${voucherTheme.advanceRowBg}`}>
              <table className="w-full text-xs">
                <thead>
                  <tr className={`${voucherTheme.tableHeadBg} text-white font-semibold text-left`}>
                    <th className="p-3">Payment Component</th>
                    <th className="p-3">Details / Terms</th>
                    <th className="p-3 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${voucherTheme.tableBorder} text-slate-800`}>
                  <tr className="bg-white">
                    <td className="p-3 font-medium">Total Package Value</td>
                    <td className="p-3 text-slate-600">{termsPkgVal}</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                  <tr className={`${voucherTheme.advanceRowBg} font-semibold ${voucherTheme.advanceRowText}`}>
                    <td className="p-3 flex items-center gap-1.5">
                      <ShieldCheck className={`w-4 h-4 ${voucherTheme.advanceShieldColor} shrink-0`} />
                      <span>Advance Received</span>
                    </td>
                    <td className="p-3 text-slate-700">
                      {termsAdvVal}
                    </td>
                    <td className={`p-3 text-right ${voucherTheme.advanceAmountText} font-extrabold text-sm`}>
                      ₹{advanceAmount.toLocaleString("en-IN")} (PAID)
                    </td>
                  </tr>
                  <tr className={`${voucherTheme.arrivalRowBg} ${voucherTheme.arrivalRowText} font-bold border-t-2 ${voucherTheme.arrivalBorder}`}>
                    <td className="p-3">Balance to Pay on Arrival</td>
                    <td className="p-3 text-slate-700 font-normal">
                      {termsBalVal}
                    </td>
                    <td className={`p-3 text-right ${voucherTheme.arrivalAmountText} font-extrabold text-sm`}>
                      ₹{balanceAmount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Important Ground Instructions (Dynamic - Omitted if blank) */}
          {parsedInstructionsLines.length > 0 && (
            <div className={`text-[11px] text-slate-600 space-y-1.5 ${voucherTheme.instructionsBg} p-4 rounded-xl border ${voucherTheme.instructionsBorder} leading-relaxed`}>
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">
                Important Ground Instructions:
              </div>
              {parsedInstructionsLines.map((line, idx) => {
                const formatted = line.replace("{balance}", `₹${balanceAmount.toLocaleString("en-IN")}`);
                return (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-400 select-none">•</span>
                    <span>{formatted}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Verification Stamp & Sign */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md ${voucherTheme.verifiedBadgeBg} ${voucherTheme.verifiedBadgeText} font-bold text-[11px] uppercase tracking-wider border ${voucherTheme.verifiedBadgeBorder}`}>
                <ShieldCheck className={`w-4 h-4 ${voucherTheme.verifiedShieldColor}`} />
                <span>Verified Local Srinagar Booking</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                WanderKashmir Operations Desk • Srinagar, Jammu & Kashmir
              </div>
            </div>

            <div className="text-center sm:text-right text-xs text-slate-600 font-medium">
              <div>24/7 Helpline: <strong>+91 60058 88754</strong></div>
              <div>Email: <strong>support@wanderkashmir.com</strong></div>
              <div className="text-[10px] text-slate-400">www.wanderkashmir.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
