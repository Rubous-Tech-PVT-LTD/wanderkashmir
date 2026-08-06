import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata = {
  title: "Contact Us | WanderKashmir",
  description: "Get in touch with WanderKashmir.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="bg-slate-900 text-white pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange- via-slate-900 to-slate-900"></div>
        <div className="container-custom max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Contact Us</h1>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto font-light leading-relaxed">
            We are here to help you plan your perfect trip to Kashmir.
          </p>
        </div>
      </div>
      <div className="container-custom max-w-4xl mx-auto py-8 px-4 -mt-16 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 mb-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
              <Phone className="w-8 h-8 text-orange- mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">Phone</h3>
              <p className="text-slate-600">+91 60058 88754</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
              <Mail className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">Email</h3>
              <p className="text-slate-600">support@wanderkashmir.com</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
              <MapPin className="w-8 h-8 text-rose-500 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">Address</h3>
              <p className="text-slate-600">Devlok Block Majra Dehradhun Uttrakhand</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
