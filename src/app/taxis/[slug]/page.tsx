import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MapPin, CheckCircle, Car, ChevronDown } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { marked } from "marked";
import { getValidImageUrl } from "@/lib/imageUtils";
import { JsonLd } from "@/components/JsonLd";
import SeoCommentForm from "@/components/SeoCommentForm";
import ShareButtons from "@/components/ShareButtons";

export const revalidate = 3600; // ISR: Revalidate every hour for instant load times

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const page = await prisma.seoLandingPage.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      comments: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!page || page.type !== "TAXI") {
    return { title: "Taxi not found" };
  }

  return {
    title: page.title,
    description: page.description,
  };
}

export default async function TaxiSeoPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const page = await prisma.seoLandingPage.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      comments: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!page || page.type !== "TAXI") {
    notFound();
  }

  // Define faqs type
  const faqs = (page.faqs as { question: string; answer: string }[]) || [];

  // Try to find matching taxi rate card
  const allRateCards = await prisma.taxiRateCard.findMany();
  
  // Create an array of searchable words from slug (e.g. "srinagar-to-gulmarg-taxi" -> ["srinagar", "gulmarg"])
  const slugWords = resolvedParams.slug.toLowerCase().split('-').filter(w => w !== 'to' && w !== 'taxi' && w !== 'cab' && w !== 'service' && w.length > 2);
  
  // Find the rate card that matches the most words
  let matchedRateCard = null;
  let maxMatches = 0;

  for (const card of allRateCards) {
    const placeWords = card.place.toLowerCase().split(' ');
    let matches = 0;
    for (const sw of slugWords) {
      if (placeWords.some(pw => pw.includes(sw) || sw.includes(pw))) {
        matches++;
      }
    }
    if (matches > maxMatches && matches >= 1) { // Require at least 1 significant word match (like "gulmarg")
      maxMatches = matches;
      matchedRateCard = card;
    }
  }

  const rates = matchedRateCard ? (matchedRateCard.rates as Record<string, number>) : null;

  // Fetch Related Blogs for Internal Linking
  const relatedBlogs = await prisma.seoLandingPage.findMany({
    where: { type: "BLOG", slug: { not: resolvedParams.slug } },
    take: 3,
    orderBy: { createdAt: 'desc' },
    select: { title: true, slug: true, description: true, imageUrl: true }
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wanderkashmir.com';
  const url = `${baseUrl}/taxis/${page.slug}`;

  const schemas: any[] = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": page.title,
      "description": page.description,
      "url": url,
      "provider": {
        "@type": "LocalBusiness",
        "name": "WanderKashmir",
        "address": {
          "@type": "PostalAddress",
          "addressRegion": "Jammu and Kashmir",
          "addressCountry": "IN"
        }
      },
      "areaServed": {
        "@type": "State",
        "name": "Jammu and Kashmir"
      },
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
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-[#f97316]">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/taxis" className="hover:text-[#f97316]">Taxis</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-800 font-medium">{page.h1Heading}</span>
        </nav>

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12 flex flex-col md:flex-row bg-[#f97316]/5">
          <div className="flex-1 space-y-6 p-8 md:p-12 z-10 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm text-[#f97316] rounded-full text-sm font-semibold shadow-sm border border-orange-500">
              <MapPin className="w-4 h-4" />
              Verified Taxi Service
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              {page.h1Heading}
            </h1>
            <p className="text-lg text-slate-700 leading-relaxed max-w-2xl">
              {page.description}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                href="/taxis" 
                className="px-8 py-3.5 bg-[#f97316] text-white rounded-full font-medium hover:bg-[#ea580c] transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#f97316]/30"
              >
                View Cabs & Prices
              </Link>
              <a 
                href="https://wa.me/916005888754" 
                target="_blank" 
                rel="noreferrer"
                className="px-8 py-3.5 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-green-500/30"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
          {page.imageUrl && (
            <div className="w-full md:w-5/12 min-h-[300px] md:min-h-full relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#f97316]/5 to-transparent z-10 md:hidden" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 md:hidden" />
              <Image 
                src={getValidImageUrl([page.imageUrl])} 
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
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 mb-8">
            <div 
              className="prose prose-slate prose-lg max-w-none prose-headings:text-[#f97316] prose-a:text-[#f97316]"
              dangerouslySetInnerHTML={{ __html: await marked.parse(page.content) }} 
            />
          </div>
        )}

        <ShareButtons title={page.title} />

        {/* Dynamic Taxi Rates Table */}
        {matchedRateCard && rates && Object.keys(rates).length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">
              Taxi Fares: {matchedRateCard.place}
            </h2>
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-sm uppercase tracking-wider font-bold text-slate-600">
                      <th className="p-4 rounded-tl-xl">Vehicle Type</th>
                      <th className="p-4 text-right rounded-tr-xl">Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(rates).map(([vehicle, price]) => (
                      <tr key={vehicle} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <div className="p-2 bg-orange-500 text-[#f97316] rounded-lg">
                            <Car className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-slate-800">{vehicle}</span>
                        </td>
                        <td className="p-4 text-right font-bold text-lg text-emerald-600">
                          ₹{price.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-center">
                 <Link 
                  href="/taxis" 
                  className="px-8 py-3 bg-[#f97316] text-white rounded-full font-medium hover:bg-[#ea580c] transition-colors shadow-sm inline-block"
                >
                  Proceed to Booking
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Why Choose Us */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
            <CheckCircle className="w-8 h-8 text-[#f97316]" />
            <h3 className="font-bold text-lg text-slate-900">Local Expert Drivers</h3>
            <p className="text-slate-600">Our drivers know the safest and most scenic routes across Kashmir.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
            <CheckCircle className="w-8 h-8 text-[#f97316]" />
            <h3 className="font-bold text-lg text-slate-900">Transparent Pricing</h3>
            <p className="text-slate-600">No hidden fees. Pay exactly what you see for your taxi booking.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
            <CheckCircle className="w-8 h-8 text-[#f97316]" />
            <h3 className="font-bold text-lg text-slate-900">Well-Maintained Fleet</h3>
            <p className="text-slate-600">Clean, comfortable, and regularly serviced vehicles for your safety.</p>
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
        {/* Customer Reviews & Testimonials Section */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <h2 className="text-3xl font-bold text-slate-900 text-center md:text-left">
              Traveler Reviews & Comments
            </h2>
          </div>
          <div className="mb-10">
            <SeoCommentForm seoPageId={page.id} />
          </div>
          <div className="grid grid-cols-1 gap-6">
            {page.comments && page.comments.length > 0 ? (
              page.comments.map((comment: any) => (
                <div key={comment.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
                  <div className="flex gap-1 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < (comment.rating || 5) ? "text-yellow-400" : "text-slate-200"}>★</span>
                    ))}
                  </div>
                  <p className="text-slate-600 italic leading-relaxed whitespace-pre-wrap">
                    "{comment.comment}"
                  </p>
                  <div className="mt-auto pt-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                      {comment.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{comment.name}</h4>
                      <p className="text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {comment.adminReply && (
                    <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3">
                      <div className="w-8 h-8 bg-[#f97316] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                        W
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm mb-1">Response from WanderKashmir</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{comment.adminReply}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center p-8 bg-white rounded-3xl border border-slate-100">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </div>

        {/* Related Blogs Section */}
        {relatedBlogs.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              More Travel Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map(blog => (
                <Link href={`/blog/${blog.slug}`} key={blog.slug} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all flex flex-col">
                  {blog.imageUrl ? (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image 
                        src={getValidImageUrl([blog.imageUrl])} 
                        alt={blog.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-slate-100 flex items-center justify-center">
                      <span className="text-slate-400 font-medium">WanderKashmir</span>
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-[#f97316] transition-colors">{blog.title}</h3>
                    <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">{blog.description}</p>
                    <span className="text-[#f97316] font-medium text-sm flex items-center gap-1 mt-auto">
                      Read Guide <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
