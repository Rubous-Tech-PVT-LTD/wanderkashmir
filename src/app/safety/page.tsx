import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Safety Guidelines | WanderKashmir",
  description: "Safety guidelines for traveling in Kashmir.",
};

export default function SafetyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="bg-slate-900 text-white pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500 via-slate-900 to-slate-900"></div>
        <div className="container-custom max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Safety Guidelines</h1>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Ensuring a safe and enjoyable journey.
          </p>
        </div>
      </div>
      <div className="container-custom max-w-4xl mx-auto py-8 px-4 -mt-16 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 mb-16">
          <div className="prose prose-slate prose-lg max-w-none">
            <p className="text-slate-700 text-lg leading-relaxed">
              Your safety is our priority. We are currently compiling a comprehensive list of travel safety guidelines, local emergency contacts, and best practices for visiting Kashmir.
            </p>
            <p className="text-slate-600 mt-4">
              Always follow the instructions of your verified local guides and hosts. In case of any emergency, please refer to local authorities or reach out to our support team.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
