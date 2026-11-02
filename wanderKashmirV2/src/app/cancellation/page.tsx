import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  Clock,
  RotateCcw,
  Plane,
  FileCheck,
  MapPin,
  AlertTriangle,
  CreditCard,
  Ticket,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | WanderKashmir",
  description:
    "Official Cancellation, Rescheduling & Refund Policy for bookings made with WanderKashmir (WanderKashmir.com).",
  alternates: {
    canonical: "https://www.wanderkashmir.com/cancellation",
  },
};

export default function CancellationPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-slate-950 text-white pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#f97316] via-slate-950 to-slate-950" />
        <div className="container-custom max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" /> Official Booking Policy
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Cancellation & Refund Policy
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Transparent booking terms, clear cancellation timelines, and fair refund procedures for all WanderKashmir travelers.
          </p>
        </div>
      </section>

      {/* Main Content Card */}
      <div className="container-custom max-w-4xl mx-auto py-10 px-4 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 sm:p-10 md:p-12 mb-16 space-y-12">

          {/* Policy Intro Note */}
          <div className="bg-amber-50/80 border-l-4 border-amber-500 rounded-r-xl p-4 sm:p-5 text-amber-950 text-sm leading-relaxed">
            <p className="font-semibold text-amber-900 mb-1">Important Notice</p>
            This Cancellation & Refund Policy is applicable to all bookings made with{" "}
            <strong>WanderKashmir (WanderKashmir.com)</strong>. All cancellation requests must be communicated in writing via email to{" "}
            <a href="mailto:sales@wanderkashmir.com" className="font-semibold text-amber-900 underline hover:text-[#f97316]">
              sales@wanderkashmir.com
            </a>{" "}
            from the registered email address used at the time of booking.
          </div>

          {/* Section 1: Group Trips */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#f97316] flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">1. Group Trips</h2>
                <p className="text-xs sm:text-sm text-slate-500">Standard deduction timelines for domestic and international group tours</p>
              </div>
            </div>

            {/* Domestic Group Trips */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" /> Domestic Group Trips – Cancellation Charges
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Timeline Prior to Departure</th>
                      <th className="py-3 px-4">Cancellation Deduction</th>
                      <th className="py-3 px-4">Refund Applicable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-3 px-4 font-medium">Initial Booking Amount</td>
                      <td className="py-3 px-4 text-red-600 font-semibold">100% Non-refundable</td>
                      <td className="py-3 px-4 text-slate-500">No refund on booking deposit</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Last 15 days before departure</td>
                      <td className="py-3 px-4 text-red-600 font-semibold">100% Deduction</td>
                      <td className="py-3 px-4 text-slate-500">No refund</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">15–30 days before departure</td>
                      <td className="py-3 px-4 text-amber-600 font-semibold">50% of total trip cost</td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">50% Refund</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">31–45 days before departure</td>
                      <td className="py-3 px-4 text-amber-600 font-semibold">25% of total trip cost</td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">75% Refund</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">More than 45 days before departure</td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">10% of total trip cost</td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">90% Refund</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* International Group Trips */}
            <div className="space-y-3 pt-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plane className="w-4 h-4 text-indigo-600" /> International Group Trips – Cancellation Charges
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Timeline Prior to Departure</th>
                      <th className="py-3 px-4">Cancellation Deduction</th>
                      <th className="py-3 px-4">Refund Applicable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-3 px-4 font-medium">Initial Booking Amount</td>
                      <td className="py-3 px-4 text-red-600 font-semibold">100% Non-refundable</td>
                      <td className="py-3 px-4 text-slate-500">No refund on booking deposit</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Last 30 days before departure</td>
                      <td className="py-3 px-4 text-red-600 font-semibold">100% Deduction</td>
                      <td className="py-3 px-4 text-slate-500">No refund</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">31–45 days before departure</td>
                      <td className="py-3 px-4 text-amber-600 font-semibold">50% of total trip cost</td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">50% Refund</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">More than 45 days before departure</td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">25% of total trip cost</td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">75% Refund</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 2: Free Rescheduling */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">2. Free Rescheduling</h2>
                <p className="text-xs sm:text-sm text-slate-500">Flexible trip date changes and conditions</p>
              </div>
            </div>

            <ul className="grid sm:grid-cols-2 gap-3 text-sm text-slate-700">
              <li className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Domestic Group Trips:</strong> Free rescheduling allowed up to <strong>30 days</strong> before departure.</span>
              </li>
              <li className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>International Group Trips:</strong> Free rescheduling allowed up to <strong>45 days</strong> before departure.</span>
              </li>
              <li className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Complimentary limit:</strong> Exactly <strong>one (1)</strong> complimentary reschedule is permitted per booking.</span>
              </li>
              <li className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Validity Window:</strong> Revised travel date must be within <strong>12 months</strong> from original departure.</span>
              </li>
            </ul>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs sm:text-sm text-slate-600 space-y-2">
              <p>
                • <strong>Non-Refundable Components:</strong> Actual costs incurred for non-refundable components such as flights, trains, buses, visa fees, permits, and vendor penalties will be charged separately.
              </p>
              <p>
                • <strong>Availability:</strong> All rescheduling requests remain strictly subject to availability.
              </p>
              <p>
                • <strong>Indirect Arrangements:</strong> Indirect travel arrangements such as flights, visa processing, or insurance are governed by respective vendor policies and are typically non-refundable.
              </p>
            </div>
          </section>

          {/* Section 3: Private Trips */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">3. Private Trips & Tailor-Made Itineraries</h2>
                <p className="text-xs sm:text-sm text-slate-500">Flights, hotels, transport, activities, and land packages</p>
              </div>
            </div>

            {/* Flights, Hotels & Activities */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-800">Flights, Hotels, Trains, Buses, Activities & Experiences</h3>
              <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                <p>
                  • <strong>Non-refundable bookings:</strong> Once booked, non-refundable services are not eligible for any refund under any condition.
                </p>
                <p>
                  • <strong>Refundable bookings:</strong> Refunds will be processed strictly as per the respective third-party service provider’s cancellation policy.
                </p>
                <p>
                  • <strong>Third-party delays:</strong> WanderKashmir is not responsible for delays, schedule alterations, or cancellations by airlines, hotels, railways, coach operators, or other external providers.
                </p>
                <p>
                  • <strong>Hotel Lock-in:</strong> Most hotels and resorts become strictly non-refundable within the last <strong>20 days prior to check-in</strong>; last-minute changes or refunds may not be possible.
                </p>
                <p>
                  • <strong>Passport Validity:</strong> For international travel, travellers must ensure they hold a valid passport with a minimum validity of <strong>12 months</strong> from the travel date.
                </p>
              </div>
            </div>

            {/* Visa Services */}
            <div className="space-y-3 pt-2">
              <h3 className="text-base font-bold text-slate-800">Visa Services</h3>
              <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                <p>
                  • <strong>Assistance Only:</strong> WanderKashmir provides visa assistance services only, including documentation support and appointment guidance. The final decision regarding visa issuance or refusal lies solely with the respective embassy or consulate.
                </p>
                <p>
                  • <strong>Non-Refundable Visa Fees:</strong> Embassy and consular visa fees are non-refundable under all circumstances.
                </p>
                <p>
                  • <strong>Late or Rejected Visa:</strong> If a visa is not approved prior to the departure date, the remaining trip cost will be subject to the applicable cancellation policy timeline.
                </p>
              </div>
            </div>

            {/* Land Packages */}
            <div className="space-y-3 pt-2">
              <h3 className="text-base font-bold text-slate-800">Land Packages</h3>
              <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                <p>
                  • <strong>Domestic private trips:</strong> Land packages are non-refundable within the last <strong>20 days prior to departure</strong>.
                </p>
                <p>
                  • <strong>International private trips:</strong> Land packages are non-refundable within the last <strong>30 days prior to departure</strong>.
                </p>
                <p>
                  • Cancellations made before the above timelines will be processed as per respective service provider and vendor retention charges.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Cancellation by WanderKashmir */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">4. Cancellation by WanderKashmir (Force Majeure)</h2>
                <p className="text-xs sm:text-sm text-slate-500">Government orders, natural events, and external disruptions</p>
              </div>
            </div>

            <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
              <p>
                In the event of a trip being cancelled or modified due to government restrictions, natural calamities, severe weather, civil unrest, or any other circumstances beyond our control, WanderKashmir may be required to alter or cancel the tour itinerary.
              </p>
              <p>
                Any refunds or credit vouchers in such situations will be governed strictly by respective vendor policies and what is practically feasible. No refunds will be issued for indirect travel services (such as independent flight tickets, visas, or travel insurance) that are impacted by such changes.
              </p>
            </div>
          </section>

          {/* Section 5: Refund Processing */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">5. Refund Processing & Mode</h2>
                <p className="text-xs sm:text-sm text-slate-500">Timelines, payment methods, and exchange rates</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-semibold text-slate-800 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#f97316]" /> Original Payment Mode
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Refunds will be processed directly to the bank account, card, or original payment mode used during booking.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-semibold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" /> 7 to 14 Working Days
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Refund processing time is <strong>7 to 14 working days</strong> from the formal date of written cancellation confirmation.
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600">
              • <strong>Rate of Exchange (ROE):</strong> For international trips, partial refunds or credit voucher values will be calculated based on the prevailing Rate of Exchange on the date of cancellation.
            </p>
          </section>

          {/* Section 6: Credit Vouchers */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">6. Credit Vouchers</h2>
                <p className="text-xs sm:text-sm text-slate-500">Terms of issuance, redemption, and non-transferability</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
              <p>
                • <strong>Validity:</strong> Credit Vouchers are valid for <strong>12 months</strong> from the date of issuance and can be used for future bookings with WanderKashmir.
              </p>
              <p>
                • <strong>Non-Transferable:</strong> Credit Vouchers are strictly non-transferable and cannot be sold, gifted, or redeemed for cash.
              </p>
              <p>
                • <strong>Scope of Redemption:</strong> Vouchers can be redeemed solely for package bookings with WanderKashmir. They cannot be used for standalone flights, trains, buses, visa fees, permits, or third-party arrangements.
              </p>
              <p>
                • <strong>Single Transaction:</strong> The entire Credit Voucher amount must be used in a single transaction and cannot be split across multiple bookings. Carryover or partial usage is allowed only in specific cases with prior written approval from WanderKashmir.
              </p>
            </div>
          </section>

          {/* Section 7: Contact Support */}
          <section className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-bold text-white">Have questions about cancellation?</h3>
              <p className="text-slate-300 text-xs sm:text-sm">
                Our support team is available to assist you with rescheduling, deductions, and credit vouchers.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="mailto:sales@wanderkashmir.com"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all shadow-sm"
              >
                <Mail className="w-4 h-4 text-[#f97316]" /> sales@wanderkashmir.com
              </a>
              <a
                href="tel:+916005888754"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm"
              >
                <Phone className="w-4 h-4" /> +91 60058 88754
              </a>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </main>
  );
}
