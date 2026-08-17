import { Metadata } from "next";
import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { Star, Clock, MapPin, CheckCircle2, Heart, ShieldCheck, ChevronDown } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Kashmir Tour Packages 2026 | Best Kashmir Holiday Packages | WanderKashmir",
  description: "Explore Kashmir tour packages for families, couples, honeymooners and adventure travellers. Discover Srinagar, Gulmarg, Pahalgam, Sonamarg and more with WanderKashmir.",
  alternates: {
    canonical: "https://www.wanderkashmir.com/kashmir-tour-packages",
  },
  openGraph: {
    title: "Kashmir Tour Packages 2026 | WanderKashmir",
    description: "Explore Kashmir tour packages for families, couples, honeymooners and adventure travellers. Discover Srinagar, Gulmarg, Pahalgam, Sonamarg and more with WanderKashmir.",
    url: "https://www.wanderkashmir.com/kashmir-tour-packages",
    siteName: "WanderKashmir",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kashmir Tour Packages 2026 | WanderKashmir",
    description: "Explore Kashmir tour packages for families, couples, honeymooners and adventure travellers.",
  },
};

export const revalidate = 3600;

export default async function KashmirTourPackagesPage() {
  const tours = await prisma.tour.findMany({
    where: { isLive: true },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      slug: true,
      isLive: true,
      title: true,
      images: true,
      badge: true,
      category: true,
      duration: true,
      destinations: true,
      inclusions: true,
      originalPrice: true,
      price: true,
    }
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wanderkashmir.com';

  const faqs = [
    {
      question: "Which Kashmir tour package is best for a first-time visitor?",
      answer: "For first-time visitors, a 5-6 days classic Kashmir tour package covering Srinagar, Gulmarg, Pahalgam, and Sonamarg is highly recommended. It offers a balanced mix of sightseeing, shikara rides, and nature."
    },
    {
      question: "How many days are enough for a Kashmir trip?",
      answer: "A standard trip of 5 to 7 days is usually enough to explore the major destinations like Srinagar, Gulmarg, Pahalgam, and Sonamarg comfortably."
    },
    {
      question: "What is included in Kashmir tour packages?",
      answer: "Our standard Kashmir tour packages include hotel or houseboat accommodation, daily breakfast and dinner, private cab transfers, airport pickup/drop, and local sightseeing. We can also customize inclusions based on your preferences."
    },
    {
      question: "Are Kashmir tour packages customizable?",
      answer: "Yes, all our Kashmir tour packages are 100% customizable. You can change the hotels, transport type, and itinerary to suit your family's needs and budget."
    },
    {
      question: "Which is the best time to visit Kashmir?",
      answer: "Kashmir is a year-round destination. March to October is best for lush valleys and pleasant weather, while December to February is perfect for experiencing snow and winter sports like skiing in Gulmarg."
    },
    {
      question: "Are Kashmir honeymoon packages available?",
      answer: "Absolutely. We offer specialized Kashmir honeymoon packages featuring romantic houseboat stays on Dal Lake, private flower-decorated shikara rides, and premium couple-friendly hotels."
    },
    {
      question: "Can I book hotels and taxis with my Kashmir package?",
      answer: "Yes, our Kashmir tour packages are all-inclusive, covering stays, taxis, and sightseeing."
    }
  ];

  const schemas: any[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Kashmir Tour Packages",
          "item": `${baseUrl}/kashmir-tour-packages`
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Popular Kashmir Tour Packages",
      "itemListElement": tours.map((tour, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${baseUrl}/tours/${tour.slug}`,
        "name": tour.title
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {schemas.map((schema, idx) => (
        <JsonLd key={idx} data={schema} />
      ))}
      <Navbar />

      <main className="flex-1 w-full pt-20">
        {/* Hero Section */}
        <div className="relative py-20 overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600">
          <div className="absolute inset-0 bg-black/10 z-0" />
          <div className="container-custom text-center text-white relative z-10 max-w-4xl mx-auto px-4">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
              Kashmir Tour Packages
            </h1>
            <p className="text-orange-50 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Curated experiences for families, couples, and adventure seekers. Discover the paradise on earth with WanderKashmir's premium customizable itineraries.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link 
                href="/tours" 
                className="w-full sm:w-auto px-8 py-4 bg-white text-orange-600 rounded-full font-bold hover:bg-slate-50 transition-all shadow-lg transform hover:-translate-y-0.5 text-lg"
              >
                Explore Tour Packages
              </Link>
              <Link 
                href="/contact" 
                className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-all text-lg"
              >
                Plan a Custom Trip
              </Link>
            </div>
          </div>
        </div>

        {/* Introduction Section */}
        <section className="py-16 bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Discover the Magic of Kashmir</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              WanderKashmir offers carefully curated <strong>Kashmir tour packages</strong> that bring you the best of this heavenly destination. Whether you need reliable <strong>accommodation</strong>, safe <strong>taxi/travel</strong> arrangements, mesmerizing <strong>sightseeing</strong>, or authentic <strong>local experiences</strong> guided by experts, we provide it all under one roof. Every trip is 100% <strong>customizable</strong> to suit your unique preferences and schedule.
            </p>
          </div>
        </section>

        {/* Popular Packages Section */}
        <section className="py-16 bg-slate-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Popular Kashmir Tour Packages</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Explore our most booked packages, featuring the best routes and stays.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour, index) => (
                <Link
                  key={tour.id}
                  href={tour.isLive ? `/tours/${tour.slug}` : `https://wa.me/916005888754?text=I'm%20interested%20in%20the%20${encodeURIComponent(tour.title)}`}
                  target={tour.isLive ? undefined : "_blank"}
                  className="group block"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full transform hover:-translate-y-1">
                    <div className="relative h-52 overflow-hidden flex-shrink-0">
                      <Image 
                        src={tour.images[0] || "https://i.ibb.co/DfbJP98Q/OIP.webp"} 
                        alt={tour.title} 
                        fill 
                        unoptimized
                        priority={index < 3}
                        className="object-cover transition-transform duration-500 hover:scale-105" 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2 flex-wrap pr-12">
                        {tour.badge && (
                          <span className="badge bg-orange-500 text-white text-xs px-2 py-1 rounded-lg font-semibold shadow-sm">
                            {tour.badge}
                          </span>
                        )}
                      </div>
                      <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow">
                        <Heart className="w-4 h-4 text-slate-400" />
                      </button>
                      <div className="absolute bottom-3 left-3 text-white">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3.5 h-3.5 text-white/70" />
                          <span className="text-xs text-white/80">{tour.duration}</span>
                        </div>
                        <div className="flex gap-1 flex-wrap mt-1">
                          {tour.destinations.slice(0, 3).map((d: string) => (
                            <span key={d} className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 flex-shrink-0" /> 
                              <span className="truncate max-w-[120px]">{d}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-slate-900 mb-2 leading-tight">{tour.title}</h3>
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ background: "rgba(232,99,26,0.12)" }}>
                          <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                          <span className="text-xs font-bold text-orange-700">4.8</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-wrap mb-3">
                        {tour.inclusions.slice(0, 4).map((inc: string) => (
                          <span key={inc} className="flex items-center gap-1 text-xs bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-slate-600">
                            <CheckCircle2 className="w-3 h-3 text-orange-500 flex-shrink-0" />
                            <span className="truncate max-w-[150px]">{inc}</span>
                          </span>
                        ))}
                      </div>
                      <div className="flex items-end justify-between mt-auto pt-3 border-t border-slate-100">
                        <div>
                          {tour.originalPrice && (
                            <p className="text-xs text-slate-400 line-through">₹{tour.originalPrice.toLocaleString("en-IN")}</p>
                          )}
                          <p className="text-lg font-bold text-slate-900">
                            ₹{tour.price.toLocaleString("en-IN")}
                            <span className="text-xs font-normal text-slate-400">/person</span>
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm">
                          View Package
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/tours" className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-full font-medium hover:bg-slate-50 transition-colors inline-block shadow-sm">
                View All Packages
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-white border-y border-slate-100">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Find Your Perfect Trip</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: "Family", q: "Family" },
                { name: "Honeymoon", q: "Honeymoon" },
                { name: "Budget", q: "Budget" },
                { name: "Adventure", q: "Adventure" },
                { name: "Winter", q: "Winter" },
                { name: "Custom", q: "Custom" }
              ].map((cat) => (
                <Link key={cat.name} href={`/tours?category=${cat.q}`} className="bg-slate-50 hover:bg-orange-50 border border-slate-100 hover:border-orange-200 rounded-2xl p-6 text-center transition-colors group">
                  <h3 className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors">{cat.name}</h3>
                  <p className="text-xs text-slate-500 mt-2">Packages</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Destinations Covered */}
        <section className="py-16 bg-slate-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Destinations Covered</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Discover the iconic locations included in our itineraries.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {['Srinagar', 'Gulmarg', 'Pahalgam', 'Sonamarg', 'Doodhpathri', 'Gurez Valley', 'Bangus Valley'].map((dest) => (
                <div key={dest} className="bg-white px-6 py-3 rounded-full border border-slate-200 shadow-sm text-slate-700 font-medium">
                  {dest}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-white border-y border-slate-100">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose WanderKashmir</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Local Kashmir Expertise", desc: "Our local team knows the hidden gems and best routes." },
                { title: "Verified Providers", desc: "All our hotels, homestays, and taxis are carefully vetted." },
                { title: "Customizable Itineraries", desc: "Modify your trip down to the smallest detail." },
                { title: "Local Transport Options", desc: "Reliable, clean, and comfortable private cabs." },
                { title: "Personalized Assistance", desc: "24/7 on-ground support during your entire stay." },
                { title: "One Platform", desc: "Book your stay, taxi, and tours all in one seamless place." }
              ].map((benefit, i) => (
                <div key={i} className="flex gap-4 p-6 rounded-2xl bg-slate-50">
                  <ShieldCheck className="w-8 h-8 text-orange-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">{benefit.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-slate-900 text-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center relative">
              {[
                { step: 1, title: "Choose a package" },
                { step: 2, title: "Customize your trip" },
                { step: 3, title: "Confirm requirements" },
                { step: 4, title: "Travel to Kashmir" }
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg shadow-orange-500/20 z-10 relative">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-slate-50">
          <div className="container-custom max-w-3xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <details key={idx} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-slate-900 font-semibold hover:bg-slate-50 transition-colors">
                    <span className="text-lg pr-4">{faq.question}</span>
                    <span className="shrink-0 bg-slate-100 p-1.5 rounded-full text-slate-500 group-open:-rotate-180 transition-transform duration-300">
                      <ChevronDown className="w-5 h-5" />
                    </span>
                  </summary>
                  <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-50 mt-2 bg-slate-50/50">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
