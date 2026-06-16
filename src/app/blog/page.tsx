import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PenTool } from "lucide-react";
import Link from "next/link";

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-xl w-full bg-white rounded-3xl p-10 md:p-16 text-center shadow-sm border border-slate-100">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <PenTool className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Kashmir Travel Blog
          </h1>
          <p className="text-slate-600 mb-8 text-lg">
            We are working on something exciting! Our travel experts are writing the best guides, itineraries, and hidden gems for your Kashmir trip. 
            <br/><br/>
            Check back soon!
          </p>
          <Link 
            href="/"
            className="inline-flex px-8 py-3 bg-[#0284c7] text-white rounded-full font-medium hover:bg-[#0369a1] transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#0284c7]/30"
          >
            Explore Kashmir Now
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
