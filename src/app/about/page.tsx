import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "About Us | Indiahiles",
  description: "Learn more about Indiahiles and our mission.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="bg-slate-900 text-white pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-400 via-slate-900 to-slate-900"></div>
        <div className="container-custom max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">About Us</h1>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Discover the story behind Indiahiles.
          </p>
        </div>
      </div>
      <div className="container-custom max-w-4xl mx-auto py-8 px-4 -mt-16 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 mb-16">
          <div className="prose prose-slate prose-lg max-w-none">
            <p className="text-slate-700 text-lg leading-relaxed">
              We are passionate about showcasing the true beauty of Kashmir to the world. Our platform connects travelers with authentic local experiences, from verified homestays and hotels to reliable transport and guided tours. 
            </p>
            <p className="text-slate-600 mt-4">
              Our mission is to empower local communities, preserve our rich cultural heritage, and provide a seamless booking experience for every traveler visiting our paradise.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
