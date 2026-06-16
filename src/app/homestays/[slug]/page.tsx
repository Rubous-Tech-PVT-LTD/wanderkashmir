import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Home, Heart, Coffee, MapPin, Star, ChevronDown } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const revalidate = 3600; // ISR: Revalidate every hour for instant load times

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const page = await prisma.seoLandingPage.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!page || page.type !== "HOMESTAY") {
    return { title: "Homestay not found" };
  }

  return {
    title: page.title,
    description: page.description,
  };
}

export default async function HomestaySeoPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const page = await prisma.seoLandingPage.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!page || page.type !== "HOMESTAY") {
    notFound();
  }

  const faqs = (page.faqs as { question: string; answer: string }[]) || [];

  // Try to find matching homestays
  const slugWords = resolvedParams.slug.toLowerCase().split('-').filter(w => w !== 'in' && w !== 'homestays' && w !== 'homestay' && w !== 'stay' && w.length > 2);
  
  const allProperties = await prisma.property.findMany({
    where: {
      isApproved: true,
      status: "APPROVED",
      vendorProfile: {
        type: "HOMESTAY"
      }
    },
    include: {
      vendorProfile: true
    }
  });

  const matchedHomestays = allProperties.filter(prop => {
    const locWords = prop.location.toLowerCase().split(' ');
    let matches = 0;
    for (const sw of slugWords) {
      if (locWords.some(lw => lw.includes(sw) || sw.includes(lw))) {
        matches++;
      }
    }
    return matches > 0;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LodgingBusiness",
            "name": page.title,
            "description": page.description,
            "url": `https://wanderkashmir.com/homestays/${page.slug}`,
            "address": {
              "@type": "PostalAddress",
              "addressRegion": "Jammu and Kashmir",
              "addressCountry": "IN"
            },
            ...(page.imageUrl && { "image": page.imageUrl }),
            ...(faqs.length > 0 && {
              "mainEntity": faqs.map((faq) => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            })
          }),
        }}
      />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full pt-32">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-[#0284c7]">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/stays" className="hover:text-[#0284c7]">Stays</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-800 font-medium">{page.h1Heading}</span>
        </nav>

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12 flex flex-col md:flex-row bg-[#166534]/5">
          <div className="flex-1 space-y-6 p-8 md:p-12 z-10 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm text-[#166534] rounded-full text-sm font-semibold shadow-sm border border-green-100">
              <MapPin className="w-4 h-4" />
              Verified Homestays
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              {page.h1Heading}
            </h1>
            <p className="text-lg text-slate-700 leading-relaxed max-w-2xl">
              {page.description}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                href="/homestays" 
                className="px-8 py-3.5 bg-[#166534] text-white rounded-full font-medium hover:bg-[#14532d] transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#166534]/30"
              >
                Browse All Stays
              </Link>
            </div>
          </div>
          {page.imageUrl && (
            <div className="w-full md:w-5/12 min-h-[300px] md:min-h-full relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#166534]/5 to-transparent z-10 md:hidden" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 md:hidden" />
              <Image 
                src={page.imageUrl} 
                alt={page.h1Heading} 
                fill 
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
                priority
              />
            </div>
          )}
        </div>

        {/* Dynamic Content */}
        {page.content && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 mb-16">
            <div 
              className="prose prose-slate prose-lg md:prose-xl max-w-none prose-headings:text-[#166534] prose-a:text-[#166534] prose-img:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: page.content.replace(/\n/g, '<br/>') }} 
            />
          </div>
        )}

        {/* Dynamic Homestays Grid */}
        {matchedHomestays.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Available Homestays in this area</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedHomestays.map((property: any) => {
                const imageUrl = property.images && property.images.length > 0 
                  ? property.images[0] 
                  : "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800";
                  
                return (
                  <Link href={`/property/${property.id}`} key={property.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100">
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={property.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Home className="w-3 h-3 text-[#0284c7]" />
                        Homestay
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#0284c7] transition-colors line-clamp-1">
                          {property.name}
                        </h3>
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded text-sm font-semibold text-amber-700">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>4.5</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-slate-500 text-sm mb-4">
                        <MapPin className="w-4 h-4 mr-1 shrink-0" />
                        <span className="truncate">{property.location}</span>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between">
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">Starting from</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-slate-900">₹{property.pricePerNight.toLocaleString('en-IN')}</span>
                            <span className="text-slate-500 text-sm">/night</span>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                          View details
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-10 text-center">
               <Link 
                href={`/stays?q=${slugWords.join(' ')}`} 
                className="px-8 py-3 bg-[#0284c7] text-white rounded-full font-medium hover:bg-[#0369a1] transition-colors shadow-sm inline-block"
              >
                View All {slugWords.length > 0 ? slugWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : ''} Stays
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
            <Heart className="w-8 h-8 text-rose-500" />
            <h3 className="font-bold text-lg text-slate-900">Kashmiri Hospitality</h3>
            <p className="text-slate-600">Experience the warmth and culture of Kashmir directly from local host families.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
            <Coffee className="w-8 h-8 text-amber-600" />
            <h3 className="font-bold text-lg text-slate-900">Home-Cooked Meals</h3>
            <p className="text-slate-600">Enjoy traditional Wazwan and authentic homemade Kashmiri food during your stay.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
            <MapPin className="w-8 h-8 text-sky-500" />
            <h3 className="font-bold text-lg text-slate-900">Prime Locations</h3>
            <p className="text-slate-600">Stay in beautiful, scenic, and peaceful locations away from crowded tourist hotels.</p>
          </div>
        </div>

        {/* FAQs */}
        {faqs.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
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
        )}
      </main>

      <Footer />
    </div>
  );
}
