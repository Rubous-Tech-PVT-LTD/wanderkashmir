import { Metadata } from "next";
import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { Star, Clock, MapPin, CheckCircle2, Heart, ShieldCheck, ChevronDown, ChevronRight, BookOpen } from "lucide-react";
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
  const [tours, blogs] = await Promise.all([
    prisma.tour.findMany({
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
    }),
    prisma.seoLandingPage.findMany({
      where: { type: "BLOG" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        title: true,
        slug: true,
        imageUrl: true,
        description: true
      }
    }).catch(() => []) // Gracefully fallback if DB connection times out
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wanderkashmir.com';

  const faqs = [
    {
      question: "What are the best Kashmir tour packages?",
      answer: "The best packages typically cover the 'Golden Triangle' of Kashmir: Srinagar, Gulmarg, and Pahalgam. Our most popular options include 5 to 6-day itineraries that balance sightseeing, relaxing houseboat stays, and mountain excursions."
    },
    {
      question: "How many days are enough for a Kashmir trip?",
      answer: "A trip of 5 to 7 days is ideal to comfortably explore major destinations like Srinagar, Gulmarg, Pahalgam, and Sonamarg without rushing."
    },
    {
      question: "What is included in Kashmir tour packages?",
      answer: "WanderKashmir packages generally include accommodation (hotels/houseboats), breakfast and dinner, private taxi transfers, and local sightseeing. Specific inclusions are clearly listed on each package page."
    },
    {
      question: "Which Kashmir package is best for families?",
      answer: "Family packages are paced slower and focus on comfortable stays and accessible attractions like Shikara rides, Gondola rides in Gulmarg, and Betaab Valley in Pahalgam."
    },
    {
      question: "Are Kashmir honeymoon packages available?",
      answer: "Yes. Our honeymoon packages include romantic stays on Dal Lake houseboats, private transfers, and premium accommodations with options for special arrangements."
    },
    {
      question: "Can I customize a Kashmir tour package?",
      answer: "Yes, all WanderKashmir itineraries are 100% customizable. You can adjust your hotel category, transport type, duration, and destinations to fit your budget and preferences."
    },
    {
      question: "Which places are covered in Kashmir tour packages?",
      answer: "Our standard packages cover Srinagar, Gulmarg, Pahalgam, and Sonamarg. Offbeat packages can also include Doodhpathri, Gurez Valley, and Bangus Valley."
    },
    {
      question: "What is the best time to visit Kashmir?",
      answer: "March to October is ideal for lush valleys, blooming gardens, and pleasant weather. December to February is best if you want to experience snow and winter sports like skiing in Gulmarg."
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
        
        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-100">
          <div className="container-custom py-3 flex items-center text-sm text-slate-500">
            <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-slate-900 font-medium">Kashmir Tour Packages</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative py-12 md:py-20 overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600">
          <div className="absolute inset-0 bg-black/10 z-0" />
          <div className="container-custom text-center text-white relative z-10 max-w-4xl mx-auto px-4">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-white leading-tight">
              Kashmir Tour Packages
            </h1>
            <p className="text-orange-50 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Book expertly crafted Kashmir holiday packages with WanderKashmir. Complete your trip with verified hotels, reliable cabs, and local guides in one seamless itinerary.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link 
                href="/tours" 
                className="w-full sm:w-auto px-8 py-4 bg-white text-orange-600 rounded-full font-bold hover:bg-slate-50 transition-all shadow-lg transform hover:-translate-y-0.5 text-lg"
              >
                Browse All Packages
              </Link>
            </div>
          </div>
        </div>

        {/* Introduction Section */}
        <section className="py-16 bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Discover the Best Kashmir Holiday Packages</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Planning a trip to the "Paradise on Earth"? WanderKashmir offers a wide range of verified <strong>Kashmir tour packages</strong> designed for every type of traveler. Whether you are looking for romantic <strong>Kashmir honeymoon packages</strong>, action-packed <strong>sightseeing itineraries</strong>, or relaxing <strong>Kashmir family tour packages</strong>, we provide complete transparency. All packages include reliable accommodations, local taxi transfers, and expert guidance covering top destinations like Srinagar, Gulmarg, and Pahalgam. Plus, every trip is fully customizable to your schedule.
            </p>
          </div>
        </section>

        {/* Popular Packages Section */}
        <section className="py-16 bg-slate-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Popular Kashmir Tour Packages</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Explore our highest-rated itineraries, carefully designed for unforgettable travel experiences.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour, index) => (
                <div key={tour.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full transform hover:-translate-y-1">
                  <div className="relative h-52 overflow-hidden flex-shrink-0">
                    <Link href={`/tours/${tour.slug}`}>
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
                    </Link>
                    <div className="absolute top-3 left-3 flex gap-2 flex-wrap pr-12 pointer-events-none">
                      {tour.badge && (
                        <span className="badge bg-orange-500 text-white text-xs px-2 py-1 rounded-lg font-semibold shadow-sm">
                          {tour.badge}
                        </span>
                      )}
                    </div>
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow">
                      <Heart className="w-4 h-4 text-slate-400" />
                    </button>
                    <div className="absolute bottom-3 left-3 text-white pointer-events-none">
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
                    <Link href={`/tours/${tour.slug}`}>
                      <h3 className="font-semibold text-slate-900 mb-2 leading-tight hover:text-orange-600 transition-colors">{tour.title}</h3>
                    </Link>
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
                      <Link 
                        href={`/tours/${tour.slug}`}
                        className="text-xs md:text-sm font-semibold px-4 py-2 rounded-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm hover:shadow-md transition-shadow text-center"
                      >
                        View {tour.title}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/tours" className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-full font-medium hover:bg-slate-50 transition-colors inline-block shadow-sm">
                View All Kashmir Packages
              </Link>
            </div>
          </div>
        </section>

        {/* Plan Your Trip Section */}
        <section className="py-16 bg-white border-y border-slate-100">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Plan Your Kashmir Trip</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Choose a trip style that matches your travel preferences.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Short Kashmir Trip", desc: "Perfect for quick weekend getaways (3-4 days).", link: "/tours", q: "All Packages" },
                { title: "Classic Kashmir Itinerary", desc: "The standard complete tour (5-6 days).", link: "/tours", q: "All Packages" },
                { title: "Family-Friendly Packages", desc: "Relaxed pacing with comfortable sightseeing.", link: "/tours?category=Family", q: "Family" },
                { title: "Kashmir Honeymoon", desc: "Romantic stays and private shikara rides.", link: "/tours?category=Honeymoon", q: "Honeymoon" },
                { title: "Adventure & Winter Trips", desc: "Skiing in Gulmarg and snow activities.", link: "/tours?category=Adventure", q: "Adventure" },
                { title: "Custom Itineraries", desc: "Build a trip exactly how you want it.", link: "/contact", q: "Custom" }
              ].map((style, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:border-orange-200 transition-colors">
                  <h3 className="font-bold text-slate-800 text-lg mb-2">{style.title}</h3>
                  <p className="text-slate-600 text-sm mb-4">{style.desc}</p>
                  <Link href={style.link} className="text-orange-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    Explore {style.q} <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-slate-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Kashmir Tour Packages by Travel Style</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: "Family", q: "Family" },
                { name: "Honeymoon", q: "Honeymoon" },
                { name: "Budget", q: "Budget" },
                { name: "Adventure", q: "Adventure" },
                { name: "Winter", q: "Winter" },
                { name: "Culture", q: "Culture" }
              ].map((cat) => (
                <Link key={cat.name} href={`/tours?category=${cat.q}`} className="bg-white hover:bg-orange-50 border border-slate-100 hover:border-orange-200 rounded-2xl p-6 text-center transition-colors group shadow-sm">
                  <h3 className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors">{cat.name}</h3>
                  <p className="text-xs text-slate-500 mt-2">Packages</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Destinations Covered */}
        <section className="py-16 bg-white border-y border-slate-100">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Destinations Covered</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Discover the iconic locations included in our itineraries by filtering tours for specific regions.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { name: 'Srinagar', slug: 'srinagar' },
                { name: 'Gulmarg', slug: 'gulmarg' },
                { name: 'Pahalgam', slug: 'pahalgam' },
                { name: 'Sonamarg', slug: 'sonamarg' },
                { name: 'Doodhpathri', slug: 'doodhpathri' },
                { name: 'Gurez Valley', slug: 'gurez-valley' },
                { name: 'Bangus Valley', slug: 'bangus-valley' }
              ].map((dest) => (
                <Link 
                  key={dest.slug} 
                  href={`/tours?destination=${dest.slug}`} 
                  className="bg-slate-50 px-4 py-2 md:px-6 md:py-3 rounded-full border border-slate-200 shadow-sm text-slate-700 text-sm md:text-base font-medium hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                >
                  {dest.name} Tour Packages
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-slate-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose WanderKashmir</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Local Kashmir Expertise", desc: "Our on-ground team ensures you experience reliable routes and local guidance." },
                { title: "Verified Providers", desc: "We actively vet our hotel, homestay, and taxi partners for quality." },
                { title: "Customizable Itineraries", desc: "Flexible packages that can be adjusted to fit your exact travel dates and preferences." },
                { title: "Transparent Pricing", desc: "Clear inclusions and exclusions with no hidden surprise charges upon arrival." },
                { title: "Personalized Assistance", desc: "Accessible support during your stay in Kashmir for a smooth trip." },
                { title: "Integrated Booking", desc: "Secure your verified accommodation and transport through one unified platform." }
              ].map((benefit, i) => (
                <div key={i} className="flex gap-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 text-center relative">
              {[
                { step: 1, title: "Choose a package" },
                { step: 2, title: "Customize your trip" },
                { step: 3, title: "Confirm requirements" },
                { step: 4, title: "Travel to Kashmir" }
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold mb-3 md:mb-4 shadow-lg shadow-orange-500/20 z-10 relative">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-sm md:text-lg">{item.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Travel Guides (Blog Integration) */}
        {blogs.length > 0 && (
          <section className="py-16 bg-white border-y border-slate-100">
            <div className="container-custom">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Kashmir Travel Guides</h2>
                <p className="text-slate-600 max-w-2xl mx-auto">Read our latest resources and itineraries to help plan your Kashmir tour.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                  <Link key={blog.slug} href={`/blog/${blog.slug}`} className="group block bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all">
                    {blog.imageUrl && (
                      <div className="relative h-48 overflow-hidden">
                        <Image 
                          src={blog.imageUrl} 
                          alt={blog.title} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">
                        <BookOpen className="w-4 h-4" /> Travel Guide
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {blog.title}
                      </h3>
                      {blog.description && (
                        <p className="text-slate-600 text-sm line-clamp-2">{blog.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

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
