import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Compass, Home, MapPin, PhoneCall, ArrowRight } from "lucide-react";

export default function NotFound() {
  const quickLinks = [
    { name: "Popular Tours", href: "/tours", desc: "Curated Kashmir holiday packages" },
    { name: "Verified Stays", href: "/stays", desc: "Hotels, resorts & heritage houseboats" },
    { name: "Destinations & Places", href: "/destinations", desc: "Gulmarg, Pahalgam, Srinagar & more" },
    { name: "Local Experiences", href: "/experiences", desc: "Shikara rides, trekking & crafts" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-2xl w-full text-center">
          {/* Badge & Icon */}
          <div className="inline-flex items-center justify-center p-4 bg-emerald-50 text-emerald-700 rounded-3xl mb-6 shadow-sm border border-emerald-100">
            <Compass className="w-12 h-12 animate-[spin_12s_linear_infinite]" />
          </div>

          <p className="text-xs uppercase tracking-widest font-bold text-emerald-700 mb-2">
            Error 404 • Page Not Found
          </p>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4 font-display">
            Looks like you wandered off the map!
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-lg mx-auto mb-8">
            The page you are looking for doesn&apos;t exist, has been moved, or took a scenic detour through the valleys of Kashmir.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-colors"
            >
              <Home className="w-4 h-4" />
              Return to Homepage
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-700 font-semibold text-sm border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <PhoneCall className="w-4 h-4" />
              Contact Support
            </Link>
          </div>

          {/* Suggested Destinations & Quick Links */}
          <div className="border-t border-slate-200 pt-8 text-left">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">
              Popular journeys to explore instead
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
              {quickLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition-all flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
