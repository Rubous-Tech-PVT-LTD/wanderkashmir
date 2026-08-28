import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  UserCheck,
  Megaphone,
  Lock,
  Share2,
  BellRing,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | WanderKashmir",
  description:
    "Learn how WanderKashmir collects, protects, and uses your personal information, including data gathered through Google Ads Lead Forms and website inquiries.",
  alternates: {
    canonical: "https://www.wanderkashmir.com/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "August 2026";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      {/* Header Section */}
      <div className="bg-slate-900 text-white pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500 via-slate-900 to-slate-900"></div>
        <div className="container-custom max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-orange-500/30">
            <ShieldCheck className="w-4 h-4" />
            Trust & Transparency
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Your privacy is of utmost importance to us. This policy outlines how WanderKashmir collects, uses, protects, and handles your personal information.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-slate-400 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700">
            <Calendar className="w-4 h-4 text-orange-400" />
            <span>Last Updated: <strong className="text-white font-medium">{lastUpdated}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container-custom max-w-4xl mx-auto py-12 px-4">
        
        {/* Quick Summary Card */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200/80 p-6 md:p-8 mb-10 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-orange-600 flex-shrink-0" />
            Privacy Summary at a Glance
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>We <strong>never sell or rent</strong> your personal data to third-party marketing companies.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>We collect your <strong>Name and Phone Number</strong> solely to assist with travel planning and bookings.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>Information received via <strong>Google Ads &amp; Lead Forms</strong> is used strictly to fulfill your travel inquiries.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>All communications and booking data are secured using industry-standard encryption protocols.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-10">

          {/* Section 1: Introduction */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">1. Introduction &amp; Scope</h2>
            </div>
            <div className="text-slate-600 leading-relaxed space-y-3">
              <p>
                Welcome to <strong>WanderKashmir</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), accessible at{" "}
                <Link href="/" className="text-orange-600 hover:underline font-medium">
                  https://www.wanderkashmir.com
                </Link>.
                We provide a comprehensive travel platform connecting travelers with verified stays (hotels, homestays, houseboats), taxi services, curated tour packages, and certified local guides across Jammu &amp; Kashmir and Ladakh.
              </p>
              <p>
                This Privacy Policy describes our practices regarding the collection, storage, processing, and protection of your personal information when you visit our website, submit an inquiry, use our booking services, or interact with our advertisements (including Google Ads).
              </p>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 2: Information We Collect */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">2. Information We Collect</h2>
            </div>
            <div className="text-slate-600 leading-relaxed space-y-4">
              <p>
                We only collect information that is strictly necessary to provide you with seamless travel services, accurate pricing estimates, and customer support. This includes:
              </p>
              
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">A. Personal Identification &amp; Contact Information</h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm">
                    <li><strong>Full Name:</strong> To identify you, personalize itineraries, and issue booking vouchers.</li>
                    <li><strong>Phone / Mobile Number (including WhatsApp):</strong> To communicate travel quotes, itinerary details, booking confirmations, emergency updates, and taxi driver / guide coordination.</li>
                    <li><strong>Email Address:</strong> To send formal booking vouchers, invoices, trip updates, and customer support responses.</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <h3 className="text-base font-bold text-slate-900 mb-1">B. Travel Details &amp; Inquiry Data</h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm">
                    <li>Dates of travel, number of travelers (adults/children), preferred destination(s) (e.g., Srinagar, Gulmarg, Pahalgam, Sonamarg, Doodhpathri, Ladakh).</li>
                    <li>Accommodation preferences, vehicle/taxi category, budget range, and any special requests (e.g., child seat, wheelchair accessibility, dietary preferences).</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <h3 className="text-base font-bold text-slate-900 mb-1">C. Technical &amp; Usage Information</h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm">
                    <li>IP address, browser type, device details, operating system, and pages visited on our website to ensure security, maintain website performance, and prevent fraud.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 3: Google Ads & Lead Form Policy (CRITICAL FOR GOOGLE ADS) */}
          <section className="bg-orange-50/60 rounded-2xl p-6 md:p-8 border border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <Megaphone className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">
                3. Collection &amp; Use of Information via Google Ads &amp; Lead Forms
              </h2>
            </div>
            <div className="text-slate-700 leading-relaxed space-y-3">
              <p>
                When you click on our advertisements on Google Search, Google Display Network, YouTube, or submit your information through <strong>Google Ads Lead Form Extensions</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Direct Consent:</strong> By voluntarily submitting your <strong>Name</strong>, <strong>Phone Number</strong>, <strong>Email Address</strong>, or <strong>Travel Preferences</strong> through a Google Ads form, you consent to being contacted by our verified Kashmir travel consultants.
                </li>
                <li>
                  <strong>Purpose of Collection:</strong> The information received through Google Ads Lead Forms is used exclusively to:
                  <ul className="list-circle pl-5 mt-1.5 space-y-1 text-sm text-slate-600">
                    <li>Provide customized price quotes and itinerary recommendations for your Kashmir trip.</li>
                    <li>Reach out via phone call, WhatsApp, or email to assist with your travel inquiries.</li>
                    <li>Confirm and process hotel, taxi, or tour bookings requested by you.</li>
                  </ul>
                </li>
                <li>
                  <strong>No Unauthorized Marketing or Reselling:</strong> We do <strong>NOT</strong> sell, trade, or distribute leads or contact details obtained through Google Ads to unauthorized third parties, spammers, or unrelated marketing agencies.
                </li>
                <li>
                  <strong>Opt-Out of Inquiries:</strong> If at any point you wish to stop receiving communications regarding your lead inquiry, you can simply reply &quot;STOP&quot; on WhatsApp or email us at{" "}
                  <a href="mailto:support@wanderkashmir.com" className="text-orange-600 font-medium hover:underline">
                    support@wanderkashmir.com
                  </a>.
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 4: How We Use Your Information */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">4. How We Use Your Information</h2>
            </div>
            <div className="text-slate-600 leading-relaxed space-y-3">
              <p>We process your personal information for the following legitimate business purposes:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Service Delivery:</strong> To generate reservations, book hotels/homestays/houseboats, assign licensed commercial taxi drivers, and book certified local guides.</li>
                <li><strong>Customer Support:</strong> To provide real-time updates regarding weather conditions, road closures (e.g., Jammu-Srinagar Highway), flight rescheduling assistance, and 24/7 on-ground emergency help.</li>
                <li><strong>Payment Processing:</strong> To securely process booking transactions and issue official GST invoices.</li>
                <li><strong>Platform Security:</strong> To prevent fraudulent bookings, unauthorized transactions, or cyber threats.</li>
                <li><strong>Service Improvements:</strong> To understand customer needs and optimize tour itineraries for a better travel experience in Kashmir.</li>
              </ul>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 5: Sharing & Disclosure */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Share2 className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">5. How We Share &amp; Disclose Information</h2>
            </div>
            <div className="text-slate-600 leading-relaxed space-y-3">
              <p>
                We do not sell, rent, or commercialize your personal information. We only share necessary details with trusted partners under strict confidentiality guidelines:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Verified Local Service Providers:</strong> When you confirm a booking, your Name and Phone Number are shared with the specific registered hotel host, commercial taxi driver, or local tour guide assigned to your trip to facilitate pick-up and check-in logistics.
                </li>
                <li>
                  <strong>Authorized Payment Gateways:</strong> Payment details are processed directly through PCI-DSS compliant payment gateways (e.g., Razorpay). WanderKashmir does not store credit card or debit card numbers on its servers.
                </li>
                <li>
                  <strong>Legal &amp; Regulatory Compliance:</strong> If required by Indian law, tourism authorities (J&amp;K Tourism Department), or law enforcement agencies, we may disclose information in good faith to comply with legal obligations or ensure traveler safety.
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 6: Data Protection & Security */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">6. How We Protect Your Information</h2>
            </div>
            <div className="text-slate-600 leading-relaxed space-y-3">
              <p>
                We employ comprehensive technical and organizational measures to safeguard your personal information against unauthorized access, alteration, disclosure, or destruction:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>256-Bit SSL/TLS Encryption:</strong> All data transmitted between your browser and our servers is fully encrypted using HTTPS.</li>
                <li><strong>Strict Access Control:</strong> Only authorized staff and travel managers with authenticated credentials have access to customer data.</li>
                <li><strong>Secure Infrastructure:</strong> Our databases are hosted in secure cloud environments with active firewalls, rate-limiting, and automated intrusion detection.</li>
                <li><strong>Data Minimization:</strong> We only retain personal data as long as necessary to fulfill your booking and comply with statutory accounting and tax regulations.</li>
              </ul>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 7: User Rights & Opt-out */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <BellRing className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">7. Your Rights &amp; Choices</h2>
            </div>
            <div className="text-slate-600 leading-relaxed space-y-3">
              <p>As a user, you have the following rights concerning your personal data:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Access &amp; Review:</strong> You can request a copy of the personal details we hold about you.</li>
                <li><strong>Correction &amp; Update:</strong> You can request updates or corrections to inaccurate contact or booking details.</li>
                <li><strong>Data Deletion:</strong> You can request the deletion of your personal contact records from our promotional database at any time.</li>
                <li><strong>Opt-Out of Marketing:</strong> You can opt out of informational or promotional messages by contacting us via phone or email.</li>
              </ul>
              <p className="text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                To exercise any of these rights, simply email us at{" "}
                <a href="mailto:support@wanderkashmir.com" className="text-orange-600 font-semibold hover:underline">
                  support@wanderkashmir.com
                </a>{" "}
                with the subject line <em>&quot;Privacy Request&quot;</em>.
              </p>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 8: Cookies & Third-Party Analytics */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">8. Cookies &amp; Tracking Technologies</h2>
            </div>
            <div className="text-slate-600 leading-relaxed space-y-3">
              <p>
                Our website uses cookies and similar tracking technologies to enhance your browsing experience, remember your preferences, and evaluate website traffic.
              </p>
              <p>
                We may use services such as Google Analytics and Google Ads conversion tracking to measure marketing effectiveness. These tools collect aggregated and anonymized usage data and do not store sensitive personal information like credit card numbers or phone numbers without your explicit consent. You can disable cookies at any time through your browser settings.
              </p>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 9: Contact Information */}
          <section className="bg-slate-900 text-white rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 text-white">9. Contact &amp; Grievance Officer</h2>
            <p className="text-slate-300 mb-6 leading-relaxed">
              If you have any questions, concerns, or grievances regarding this Privacy Policy or how your personal information is handled, please contact our dedicated support team:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3.5 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <Phone className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Phone / WhatsApp</div>
                  <a href="tel:+916005888754" className="text-white font-medium hover:text-orange-400 transition-colors">
                    +91 60058 88754
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <Mail className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Email Support</div>
                  <a href="mailto:support@wanderkashmir.com" className="text-white font-medium hover:text-orange-400 transition-colors">
                    support@wanderkashmir.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <MapPin className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Registered Office</div>
                  <p className="text-slate-300 text-sm">
                    Devlok Block Majra, Dehradun, Uttarakhand, India
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </main>
  );
}
