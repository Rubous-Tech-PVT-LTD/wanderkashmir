import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, BookOpen, AlertCircle, Scale, CreditCard } from "lucide-react";

export const metadata = {
  title: "Terms of Service | WanderKashmir",
  description: "Terms and conditions for users and vendors of WanderKashmir.",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-slate-900 text-white pt-32 pb-20 px-4">
        <div className="container-custom max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service & Vendor Agreement</h1>
          <p className="text-slate-300 text-lg">Last updated: June 2026</p>
        </div>
      </div>

      <div className="container-custom max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 prose prose-slate max-w-none">
          
          <p className="text-slate-600 lead text-lg">
            Welcome to WanderKashmir. By accessing our platform or registering as a vendor (Hotel, Homestay, Taxi Driver, or Guide), you agree to comply with and be bound by the following market-standard terms and conditions.
          </p>

          <hr className="my-8 border-slate-200" />

          {/* Section 1 */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-orange-500">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">1. Role of WanderKashmir</h2>
            </div>
            <p className="text-slate-600">
              WanderKashmir acts strictly as an aggregator and technology platform. We facilitate connections between travelers and local vendors in Jammu & Kashmir. We do not own, operate, or directly provide any of the properties, vehicles, or guided tours listed on our platform. The respective vendor is solely responsible for delivering the service.
            </p>
          </div>

          {/* Section 2 */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">2. Vendor Responsibilities & Compliance</h2>
            </div>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li><strong>Authenticity:</strong> Vendors must provide accurate, up-to-date information, including real photos and honest descriptions of their offerings.</li>
              <li><strong>Licensing:</strong> All vendors must hold valid J&K Tourism licenses, commercial vehicle permits, or homestay registrations where applicable.</li>
              <li><strong>Safety & Hygiene:</strong> Property owners must maintain strict hygiene standards. Taxi drivers must ensure vehicle safety and hold valid commercial insurance.</li>
              <li><strong>Overbooking:</strong> Vendors are responsible for managing their calendars. Cancelations by vendors due to overbooking will incur penalties and lower platform rankings.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">3. Commission, Payouts & Payments</h2>
            </div>
            <p className="text-slate-600 mb-3">
              We operate on a transparent commission model designed to boost local tourism:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li><strong>Platform Fee:</strong> WanderKashmir charges a standard commission (e.g., 8% to 15% depending on your vendor tier) on successful bookings.</li>
              <li><strong>Payment Collection:</strong> WanderKashmir (GTM) acts as the authorized payment collection agent and collects 100% of the booking payments securely on behalf of the vendors.</li>
              <li><strong>Payout Cycle:</strong> Payouts to vendors are initiated only after the guest has successfully checked in or the trip has commenced. Payouts are transferred directly to the registered bank account.</li>
              <li><strong>Customer Payments:</strong> Guests pay 100% upfront via our secure payment gateway to confirm bookings.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">4. Cancellations & Refunds</h2>
            </div>
            <p className="text-slate-600 mb-3">Our standard cancellation policy protects both guests and hosts:</p>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li><strong>Free Cancellation:</strong> Guests can cancel up to 48 hours before check-in/start date for a 100% refund (minus payment gateway charges).</li>
              <li><strong>Late Cancellation:</strong> Cancellations made within 48 hours will incur a 50% penalty, which is transferred to the vendor to cover losses.</li>
              <li><strong>No Shows:</strong> No refunds are provided for no-shows.</li>
              <li><strong>Force Majeure:</strong> In case of extreme weather, road closures (e.g., Srinagar-Jammu highway blocks), or security restrictions in Kashmir, guests will receive a full refund or a free reschedule.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600">
                <Scale className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">5. Code of Conduct & Local Laws</h2>
            </div>
            <p className="text-slate-600">
              Kashmir is a culturally rich and sensitive region. Both guests and vendors are expected to show mutual respect. Illegal activities, unauthorized partying, or disrespecting local sentiments will lead to an immediate ban from the platform. WanderKashmir holds the right to terminate any user or vendor profile without prior notice if they violate these policies.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl mt-12">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Legal Jurisdiction</h3>
            <p className="text-sm text-slate-600">
              These terms are governed by the laws of India. Any disputes arising from the use of WanderKashmir shall be subject to the exclusive jurisdiction of the courts located in Srinagar, Jammu & Kashmir.
            </p>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
