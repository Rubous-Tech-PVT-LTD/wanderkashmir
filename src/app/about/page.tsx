import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About Us | WanderKashmir",
  description: "Learn more about WanderKashmir and our mission as true locals of Kashmir.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden pt-16">
        <Image 
          src="/images/kashmir-hero.jpg"
          alt="Kashmir Valley at Sunrise"
          fill
          priority
          className="object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-slate-900/60 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        
        <div className="relative z-10 container-custom px-4 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md">
            The Heart of Kashmir, <br className="hidden md:block"/> By Kashmiris.
          </h1>
          <p className="text-lg md:text-2xl text-slate-200 font-light max-w-3xl mx-auto drop-shadow">
            Experience the true essence of paradise with locals who call it home.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="container-custom px-4 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 tracking-tight">Born & Raised in the Valley</h2>
          <div className="prose prose-slate prose-lg md:prose-xl mx-auto">
            <p className="text-slate-600 leading-relaxed">
              We aren&apos;t just a travel agency; we are the children of the valley. Growing up amidst the snow-capped peaks and serene lakes, we learned the true meaning of Kashmiri hospitality (Mehmaan Nawazi). 
            </p>
            <p className="text-slate-600 leading-relaxed mt-6">
              Our mission at WanderKashmir is to share our home with the world, offering experiences curated by the very people who live them every day. We know every hidden gem, every winding trail, and the authentic warmth that you won&apos;t find in standard guidebooks.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="container-custom px-4 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-16 text-center tracking-tight">Why Choose WanderKashmir</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">100% Local Expertise</h3>
              <p className="text-slate-600">Guided by locals who know the land better than anyone, ensuring you see the real Kashmir.</p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Authentic Experiences</h3>
              <p className="text-slate-600">From verified homestays with local families to off-the-beaten-path adventures tailored to you.</p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Community First</h3>
              <p className="text-slate-600">We empower local artisans, drivers, and hosts, ensuring your travel directly benefits the people of Kashmir.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500 via-slate-900 to-slate-900"></div>
        <div className="container-custom px-4 text-center relative z-10 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to discover the real Kashmir?</h2>
          <p className="text-slate-300 text-xl mb-10">Let us craft an unforgettable journey for you in paradise.</p>
          <Link href="/" className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-orange-600 rounded-full hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/30">
            Explore Our Packages
          </Link>
        </div>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </main>
  );
}
