import { getAdminLeadById } from "@/lib/admin/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, ShieldCheck, Phone, Mail, MapPin } from "lucide-react";
import PrintButton from "./PrintButton";

export const revalidate = 0;

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

  // Check if adminNotes has saved experiences / inclusions
  let savedExp = "";
  let savedInc = "";
  if (lead.adminNotes) {
    const matchExp = lead.adminNotes.match(/Exp=([^|\]]+)/i);
    const matchInc = lead.adminNotes.match(/Perks=([^|\]]+)/i);
    if (matchExp) savedExp = matchExp[1].trim();
    if (matchInc) savedInc = matchInc[1].trim();
  }

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

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6">
      {/* Top Floating Action Bar (Hidden when printing) */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Leads</span>
        </Link>

        <div className="flex items-center gap-2">
          <PrintButton />
        </div>
      </div>

      {/* Luxury Printable Voucher Card (A4 Aspect Ratio Optimized) */}
      <div
        id="printable-voucher"
        className="max-w-3xl mx-auto bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 print:shadow-none print:border-none print:rounded-none print:p-0 print:m-0"
      >
        {/* Header Ribbon */}
        <div className="bg-[#064e3b] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-emerald-500">
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-[10px] font-bold tracking-widest uppercase text-emerald-200 mb-2 border border-emerald-600/40">
              Official Booking Voucher
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif">
              WanderKashmir
            </h1>
            <p className="text-xs text-emerald-200 font-medium mt-0.5">
              Curated Local Kashmir Tour Packages & Stays
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-emerald-100 space-y-1 font-mono">
            <div><strong className="text-white">Ref ID:</strong> {refId}</div>
            <div><strong>Date:</strong> {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</div>
            <div className="text-[11px] text-emerald-300">Status: CONFIRMED & LOCKED</div>
          </div>
        </div>

        {/* Voucher Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Guest & Trip Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-200 pb-1.5 mb-3">
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
                <strong className="text-emerald-700 font-bold">{datesParsed.duration}</strong>
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-200 pb-1.5 mb-3">
                2. Itinerary & Ground Logistics
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
                {logisticsItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-4">
                    <span className="text-slate-600 shrink-0 font-medium">{item.label}:</span>
                    <strong className={`text-right ${item.highlight ? "text-emerald-700" : "text-slate-900"}`}>
                      {item.value}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Breakdown Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-200 pb-1.5 mb-3">
              3. Official Payment & Advance Receipt
            </h3>
            <div className="rounded-xl border-2 border-emerald-200 overflow-hidden bg-emerald-50/40">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-emerald-900 text-white font-semibold text-left">
                    <th className="p-3">Payment Component</th>
                    <th className="p-3">Details / Terms</th>
                    <th className="p-3 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-200/80 text-slate-800">
                  <tr>
                    <td className="p-3 font-medium">Total Package Value</td>
                    <td className="p-3 text-slate-600">Inclusive of stays, private transport & assistance</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                  <tr className="bg-emerald-100/60 font-semibold text-emerald-950">
                    <td className="p-3 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Advance Received</span>
                    </td>
                    <td className="p-3 text-emerald-800">
                      Booking locked & vehicle/hotel reserved
                    </td>
                    <td className="p-3 text-right text-emerald-800 font-extrabold text-sm">
                      ₹{advanceAmount.toLocaleString("en-IN")} (PAID)
                    </td>
                  </tr>
                  <tr className="bg-amber-50/80 text-amber-950 font-bold border-t-2 border-amber-300">
                    <td className="p-3">Balance to Pay on Arrival</td>
                    <td className="p-3 text-amber-800 font-normal">
                      Payable at Srinagar arrival (cash or UPI to driver/hotel)
                    </td>
                    <td className="p-3 text-right text-amber-900 font-extrabold text-sm">
                      ₹{balanceAmount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Inclusions & General Instructions */}
          <div className="text-[11px] text-slate-500 space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Important Ground Instructions:
            </div>
            <div>• Dedicated private driver details and cab registration number will be shared 24 hours prior to travel.</div>
            <div>• Remaining balance of ₹{balanceAmount.toLocaleString("en-IN")} must be settled upon arrival in Srinagar.</div>
            <div>• For any flight delay or on-ground query, connect with our 24/7 Srinagar Operations Desk.</div>
          </div>

          {/* Verification Stamp & Sign */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px] uppercase tracking-wider border border-emerald-300">
                <ShieldCheck className="w-4 h-4" />
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
