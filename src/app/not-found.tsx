import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Compass, Home, MapPin, PhoneCall, ArrowRight, Search } from "lucide-react";

export default function NotFound() {
  const quickLinks = [
    { name: "Popular Tours", href: "/tours", desc: "Curated Kashmir travel packages" },
    { name: "Verified Stays", href: "/stays", desc: "Hotels, homestays & houseboats" },
    { name: "Destination Guide", href: "/destinations", desc: "Gulmarg, Pahalgam, Srinagar" },
    { name: "Taxi Services", href: "/taxis", desc: "Pre-fixed rate cards across Kashmir" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full text-center">
          {/* Badge & Icon */}
          <div className="inline-flex items-center justify-center p-4 bg-orange-100 text-orange-600 rounded-3xl mb-6 shadow-sm">
            <Compass className="w-12 h-12 animate-[spin_12s_linear_infinite]" />
          </div>

          <p className="text-sm uppercase tracking-widest font-bold text-orange-600 mb-2">
            Error 404 • Destination Not Found
          </p>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Looks like you wandered off the map!
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto mb-8">
            The page you are looking for doesn&apos;t exist, has been moved, or is taking a scenic detour through the valleys of Kashmir.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--primary,#f97316)] text-white font-semibold shadow-md hover:opacity-95 transition-all hover:shadow-lg"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-100 transition-colors shadow-sm"
            >
              <PhoneCall className="w-4 h-4" />
              Contact Local Support
            </Link>
          </div>

          {/* Suggested Destinations & Quick Links */}
          <div className="border-t border-slate-200 pt-10 text-left">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">
              Popular places to explore instead
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {quickLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all"
                >
                  <div>
                    <p className="font-semibold text-slate-900 text-sm group-hover:text-orange-600 transition-colors">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
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
