import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MapPin, CheckCircle } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await prisma.seoLandingPage.findUnique({
    where: { slug: params.slug },
  });

  if (!page || page.type !== "TAXI") {
    return { title: "Taxi not found" };
  }

  return {
    title: page.title,
    description: page.description,
  };
}

export default async function TaxiSeoPage({ params }: { params: { slug: string } }) {
  const page = await prisma.seoLandingPage.findUnique({
    where: { slug: params.slug },
  });

  if (!page || page.type !== "TAXI") {
    notFound();
  }

  // Define faqs type
  const faqs = (page.faqs as { question: string; answer: string }[]) || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* JSON-LD Schema for LocalBusiness / Service */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": page.title,
            "description": page.description,
            "url": `https://wanderkashmir.com/taxis/${page.slug}`,
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
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-[#0284c7]">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/taxis" className="hover:text-[#0284c7]">Taxis</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-800 font-medium">{page.h1Heading}</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mb-12 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-100 text-[#0284c7] rounded-full text-sm font-semibold">
              <MapPin className="w-4 h-4" />
              Verified Taxi Service
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              {page.h1Heading}
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              {page.description}
            </p>
            <div className="flex gap-4 pt-4">
              <Link 
                href="/taxis" 
                className="px-8 py-3 bg-[#0284c7] text-white rounded-full font-medium hover:bg-[#0369a1] transition-colors shadow-sm"
              >
                View Cabs & Prices
              </Link>
              <a 
                href="https://wa.me/917006871321" 
                target="_blank" 
                rel="noreferrer"
                className="px-8 py-3 bg-green-50 text-green-700 rounded-full font-medium hover:bg-green-100 transition-colors"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
          {page.imageUrl && (
            <div className="w-full md:w-1/3 aspect-square relative rounded-2xl overflow-hidden shadow-lg">
              <Image 
                src={page.imageUrl} 
                alt={page.h1Heading} 
                fill 
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          )}
        </div>

        {/* Dynamic Content */}
        {page.content && (
          <div className="prose prose-slate prose-lg max-w-none mb-16 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
            <div dangerouslySetInnerHTML={{ __html: page.content.replace(/\n/g, '<br/>') }} />
          </div>
        )}

        {/* Why Choose Us */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
            <CheckCircle className="w-8 h-8 text-[#0284c7]" />
            <h3 className="font-bold text-lg text-slate-900">Local Expert Drivers</h3>
            <p className="text-slate-600">Our drivers know the safest and most scenic routes across Kashmir.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
            <CheckCircle className="w-8 h-8 text-[#0284c7]" />
            <h3 className="font-bold text-lg text-slate-900">Transparent Pricing</h3>
            <p className="text-slate-600">No hidden fees. Pay exactly what you see for your taxi booking.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
            <CheckCircle className="w-8 h-8 text-[#0284c7]" />
            <h3 className="font-bold text-lg text-slate-900">Well-Maintained Fleet</h3>
            <p className="text-slate-600">Clean, comfortable, and regularly serviced vehicles for your safety.</p>
          </div>
        </div>

        {/* FAQs */}
        {faqs.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{faq.question}</h3>
                  <p className="text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
