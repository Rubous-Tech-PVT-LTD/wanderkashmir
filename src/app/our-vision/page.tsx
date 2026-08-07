import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Eye, Users, Heart, Globe, Sparkles } from "lucide-react";

export const metadata = {
  title: "Our Vision | WanderKashmir",
  description: "Transforming Kashmir's tourism by bringing every village into the digital world.",
};

export default function OurVisionPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-slate-900 text-white pt-32 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500 via-slate-900 to-slate-900"></div>
        <div className="container-custom max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-orange-50 rounded-full mb-6 text-orange-500">
            <Eye className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">Our Vision</h1>
          <p className="text-slate-300 text-xl md:text-2xl max-w-2xl mx-auto font-light leading-relaxed">
            Transforming Kashmir's tourism by bringing every village into the digital world.
          </p>
        </div>
      </div>

      <div className="container-custom max-w-4xl mx-auto py-8 px-4 -mt-16 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 lg:p-16 mb-16">
          
          <div className="prose prose-slate prose-lg max-w-none">
            <p className="text-slate-700 text-xl font-medium leading-relaxed mb-8">
              We believe the true beauty of Kashmir lies beyond the crowded tourist destinations. Its real essence lives in its remote villages, traditional homes, rich culture, warm hospitality, and timeless heritage. 
            </p>
            
            <p className="text-slate-600 mb-12">
              Unfortunately, thousands of local homestays and family-run accommodations still have little or no online presence, making it difficult for travellers to discover these authentic experiences.
            </p>

            <div className="grid md:grid-cols-2 gap-8 my-12">
              <div className="bg-orange-500 rounded-2xl p-8 border border-orange-500 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 mb-6">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 mt-0">Our Mission</h3>
                <p className="text-slate-600 text-base m-0 leading-relaxed">
                  To empower local communities by giving every village home a digital identity. Through WanderKashmir, local hosts can showcase their properties, connect with travellers from around the world, and generate sustainable income while preserving their traditions and way of life.
                </p>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                  <Globe className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 mt-0">Beyond Booking</h3>
                <p className="text-slate-600 text-base m-0 leading-relaxed">
                  We are building more than a travel booking platform. We are creating a marketplace that connects travellers with authentic Kashmiri experiences—traditional homestays, local cuisine, cultural activities, experienced guides, transportation, and hidden destinations that are often overlooked.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 mb-12 p-8 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-rose-500 shrink-0 shadow-sm border border-slate-100">
                <Heart className="w-7 h-7" />
              </div>
              <div>
                <p className="text-slate-700 m-0 leading-relaxed text-lg">
                  By promoting responsible and community-based tourism, we aim to distribute tourism benefits across rural Kashmir, support local families, preserve cultural heritage, and encourage travellers to experience the region beyond the usual tourist routes.
                </p>
              </div>
            </div>

            <div className="text-center mt-16 pt-12 border-t border-slate-100">
              <div className="inline-flex items-center justify-center p-3 bg-rose-50 rounded-full mb-6 text-rose-500">
                <Sparkles className="w-8 h-8" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-slate-900 mb-10 leading-tight">
                WanderKashmir is committed to making every village discoverable, every local host visible, and every journey more authentic.
              </p>
              <div className="inline-block bg-slate-900 text-white px-10 py-5 rounded-full font-bold text-xl tracking-wide shadow-xl shadow-slate-900/20 hover:scale-105 transition-transform duration-300">
                One Village. One Story. One Platform.
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
