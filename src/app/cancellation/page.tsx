import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Cancellation Policy | Indiahiles",
  description: "Cancellation policy for bookings on Indiahiles.",
};

export default function CancellationPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="bg-slate-900 text-white pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-400 via-slate-900 to-slate-900"></div>
        <div className="container-custom max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Cancellation Policy</h1>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Understanding your booking flexibility.
          </p>
        </div>
      </div>
      <div className="container-custom max-w-4xl mx-auto py-8 px-4 -mt-16 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 mb-16">
          <div className="prose prose-slate prose-lg max-w-none">
            <h3>Standard Cancellation</h3>
            <ul>
              <li><strong>Free Cancellation:</strong> Guests can cancel up to 48 hours before the check-in or start date for a full refund (minus any payment gateway charges).</li>
              <li><strong>Late Cancellation:</strong> Cancellations made within 48 hours of the booking will incur a penalty, which is designed to compensate our local vendors for their lost revenue.</li>
              <li><strong>No Shows:</strong> No refunds are provided in the event of a no-show.</li>
            </ul>
            <h3>Exceptions & Force Majeure</h3>
            <p>
              In cases of extreme weather, road closures, or unforeseen security restrictions in the region, guests will be eligible for a full refund or the option to reschedule for free.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
