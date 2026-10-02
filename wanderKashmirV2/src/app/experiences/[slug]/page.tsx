import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { ChevronRight, Clock, MapPin, CheckCircle2, Phone, CalendarHeart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TourCardCompact from "@/components/tours/TourCardCompact";

interface ExperienceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ExperienceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const experience = await prisma.experience.findUnique({
    where: { slug }
  });

  if (!experience || experience.status !== 'ACTIVE') {
    return {
      title: 'Experience Not Found | WanderKashmir',
      robots: { index: false, follow: false },
    };
  }

  const desc = experience.description 
    ? experience.description.substring(0, 160) 
    : `Discover ${experience.title} in ${experience.destination} with WanderKashmir.`;

  return {
    title: `${experience.title} in ${experience.destination} | WanderKashmir`,
    description: desc,
    alternates: {
      canonical: `https://www.wanderkashmir.com/experiences/${experience.slug}`,
    },
    openGraph: {
      title: `${experience.title} in ${experience.destination} | WanderKashmir`,
      description: desc,
      url: `https://www.wanderkashmir.com/experiences/${experience.slug}`,
      images: experience.images?.[0] ? [experience.images[0]] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${experience.title} in ${experience.destination} | WanderKashmir`,
      description: desc,
    },
  };
}

export const revalidate = 60;

export default async function ExperienceDetailPage({ params }: ExperienceDetailPageProps) {
  const { slug } = await params;
  const experience = await prisma.experience.findUnique({
    where: { slug },
    include: {
      tourExperiences: {
        include: {
          tour: true
        }
      }
    }
  });

  if (!experience || experience.status !== 'ACTIVE') {
    notFound();
  }

  const relatedTours = experience.tourExperiences
    .map((te: any) => te.tour)
    .filter((tour: { isLive: boolean }) => tour.isLive)
    .slice(0, 4); // Max 4 tours as requested

  // Helper to format tour data for TourCard
  const formatTourForCard = (t: any) => ({
    id: t.id,
    slug: t.slug,
    isLive: t.isLive,
    title: t.title,
    image: t.images[0] || null,
    badge: t.badge,
    category: t.category,
    duration: t.duration,
    destinations: t.destinations,
    inclusions: t.inclusions,
    originalPrice: t.originalPrice,
    price: t.price,
  });

  return (
    <main>
      <Navbar />
      
      <div className="pt-20 pb-16 bg-slate-50 min-h-screen">
        <div className="container-custom py-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/" className="hover:text-orange-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/experiences" className="hover:text-orange-600">Experiences</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-medium truncate">{experience.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Gallery / Main Image */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm relative h-64 md:h-96">
                <Image
                  src={experience.images?.[0] || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&q=80"}
                  alt={experience.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* Title & Core Details */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                  {experience.title}
                </h1>
                
                <div className="flex flex-wrap gap-4 text-sm mb-6">
                  {experience.destination && (
                    <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">{experience.destination}</span>
                    </div>
                  )}
                  {experience.duration && (
                    <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">{experience.duration}</span>
                    </div>
                  )}
                </div>

                {/* Price if available */}
                {experience.basePrice && (
                  <div className="flex items-end gap-2 mb-6 pb-6 border-b border-slate-100">
                    <div className="text-slate-500 text-sm mb-1 font-medium">Starting from</div>
                    <div className="text-2xl font-bold text-slate-900">
                      ₹{experience.basePrice.toLocaleString()}
                    </div>
                    <div className="text-slate-500 text-sm mb-1">per person</div>
                  </div>
                )}

                {/* Description if available */}
                {experience.description && (
                  <div className="prose prose-slate max-w-none">
                    <h2 className="text-lg font-bold text-slate-800 mb-3">About this experience</h2>
                    <p className="text-slate-600 leading-relaxed">
                      {experience.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar / CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                
                {/* Booking CTA Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Interested in this experience?</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Contact our travel experts to add this to your custom Kashmir itinerary.
                  </p>
                  <Link 
                    href={`https://wa.me/916005888754?text=I'm%20interested%20in%20adding%20the%20${encodeURIComponent(experience.title)}%20experience%20to%20my%20trip.`}
                    target="_blank"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors mb-3"
                  >
                    <Phone className="w-5 h-5" />
                    WhatsApp Us
                  </Link>
                  <Link 
                    href="/contact"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <CalendarHeart className="w-5 h-5" />
                    Enquire Now
                  </Link>
                </div>

              </div>
            </div>
          </div>

          {/* Related Tours Section */}
          {relatedTours.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900">
                    Tours including this experience
                  </h2>
                  <p className="text-slate-500 mt-1">
                    Book a complete package featuring {experience.title}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedTours.map((tour: any) => (
                  <TourCardCompact key={tour.id} tour={formatTourForCard(tour) as any} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </main>
  );
}
