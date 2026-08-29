import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Heart, Coffee, MapPin, Star, ChevronDown, Building, Home } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { marked } from "marked";
import { getValidImageUrl } from "@/lib/imageUtils";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 3600; // ISR: Revalidate every hour for instant load times

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const page = await prisma.seoLandingPage.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!page || page.type !== "DESTINATION") {
    return { title: "Destination not found" };
  }

  return {
    title: page.title,
    description: page.description?.replace(/^Meta\s*Description:\s*/i, ""),
  };
}

export default async function DestinationSeoPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const page = await prisma.seoLandingPage.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!page || page.type !== "DESTINATION") {
    notFound();
  }

  const faqs = (page.faqs as { question: string; answer: string }[]) || [];

  // Try to find matching properties (Hotels/Resorts/Homestays)
  const slugWords = resolvedParams.slug.toLowerCase().split('-').filter(w => w !== 'in' && w !== 'hotel' && w !== 'resort' && w !== 'destinations' && w.length > 2);
  
  const allProperties = await prisma.property.findMany({
    where: {
      isApproved: true,
      status: "APPROVED"
    },
    include: {
      vendorProfile: true
    }
  });

  // Basic matching algorithm
  const matchedProperties = allProperties.filter(prop => {
    // If it's a specific hotel, try to match the name as well
    const nameWords = prop.name.toLowerCase().split(' ');
    const locWords = prop.location.toLowerCase().split(' ');
    const searchWords = [...nameWords, ...locWords];
    
    let matches = 0;
    for (const sw of slugWords) {
      if (searchWords.some(lw => lw.includes(sw) || sw.includes(lw))) {
        matches++;
      }
    }
    // High threshold if slug has many words, or exact matches
    return matches >= Math.min(2, slugWords.length);
  }).slice(0, 6); // Limit to 6 properties

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wanderkashmir.com';
  const url = `${baseUrl}/destinations/${page.slug}`;

  const schemas: any[] = [
    {
      "@context": "https://schema.org",
      "@type": "TouristDestination",
      "name": page.title,
      "description": page.description?.replace(/^Meta\s*Description:\s*/i, ""),
      "url": url,
      ...(page.imageUrl && { "image": page.imageUrl })
    }
  ];

  if (faqs.length > 0) {
    schemas.push({
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
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {schemas.map((schema, idx) => (
        <JsonLd key={idx} data={schema} />
      ))}
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full pt-32">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/destinations" className="hover:text-indigo-600">Destinations</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-800 font-medium">{page.h1Heading}</span>
        </nav>

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12 flex flex-col md:flex-row bg-indigo-900">
          <div className="flex-1 space-y-6 p-8 md:p-12 z-10 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm text-indigo-100 rounded-full text-sm font-semibold shadow-sm border border-indigo-500/30">
              <MapPin className="w-4 h-4" />
              Destination Guide
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {page.h1Heading}
            </h1>
            <p className="text-lg text-indigo-100 leading-relaxed max-w-2xl">
              {page.description?.replace(/^Meta\s*Description:\s*/i, "")}
            </p>
          </div>
          {page.imageUrl && (
            <div className="w-full md:w-5/12 relative flex items-center justify-center bg-slate-50">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-transparent z-10 md:hidden" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 md:hidden" />
              <Image 
                src={getValidImageUrl([page.imageUrl])} 
                alt={page.h1Heading} 
                width={0}
                height={0}
                sizes="(max-width: 768px) 100vw, 40vw"
                style={{ width: '100%', height: 'auto' }}
                className="object-cover h-full"
                priority
              />
            </div>
          )}
        </div>

        {/* Dynamic Content */}
        {page.content && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 mb-16">
            <div 
              className="prose prose-slate prose-lg md:prose-xl max-w-none prose-headings:text-indigo-900 prose-a:text-indigo-600 prose-img:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: await marked.parse(page.content, { breaks: true, gfm: true }) }} 
            />
          </div>
        )}

        {/* Dynamic Properties Grid */}
        {matchedProperties.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Featured Stays in this Area</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedProperties.map((property: any) => {
                const imageUrl = getValidImageUrl(property.images);
                const isHotel = property.vendorProfile?.type === 'HOTEL';
                  
                return (
                  <Link href={`/stays/${property.id}`} key={property.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100">
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={property.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className={`absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-700 flex items-center gap-1`}>
                        {isHotel ? <Building className="w-3 h-3 text-indigo-600" /> : <Home className="w-3 h-3 text-[#f97316]" />}
                        {isHotel ? 'Hotel/Resort' : 'Homestay'}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
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
                href={`/stays`} 
                className="px-8 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors shadow-sm inline-block"
              >
                View All Stays
              </Link>
            </div>
          </div>
        )}

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
