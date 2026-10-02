import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ChevronRight, MapPin, Star, ChevronDown, Building, Home, 
  Clock, UtensilsCrossed, Sparkles, Map, Calendar, Navigation, 
  Compass, BookOpen 
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { JsonLd } from "@/components/JsonLd";
import TourBentoGallery from "@/components/tours/TourBentoGallery";
import { DynamicSectionRenderer } from "@/components/destinations/DynamicSectionRenderer";

import { 
  RichContentRenderer, 
  hasRichContent, 
  SectionRichContent 
} from "@/components/destinations/RichContentRenderer";
import { getDestinationData } from "@/lib/destinationMapper";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const destination = await getDestinationData(resolvedParams.slug);

  if (!destination) {
    return {
      title: "Destination Not Found | WanderKashmir",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: destination.seo.title,
    description: destination.seo.description,
    alternates: {
      canonical: destination.seo.canonicalUrl,
    },
    openGraph: {
      title: destination.seo.title,
      description: destination.seo.description,
      url: destination.seo.canonicalUrl,
      images: destination.seo.ogImage ? [destination.seo.ogImage] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: destination.seo.title,
      description: destination.seo.description,
    },
  };
}

function EmptyStateSection({ 
  id, 
  title, 
  icon: Icon, 
  description, 
  emptyMsg 
}: { 
  id: string; 
  title: string; 
  icon: any; 
  description: string; 
  emptyMsg: string; 
}) {
  return (
    <div id={id} className="mb-14 sm:mb-16">
      <div className="flex flex-col items-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center font-display tracking-tight">{title}</h2>
        {description && <p className="text-slate-500 mt-2 font-sans text-sm sm:text-base text-center">{description}</p>}
      </div>
      <div className="p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-3 min-h-[200px]">
        <div className="w-12 h-12 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 mb-2 shadow-sm">
          <Icon className="w-6 h-6 stroke-[1.5]" />
        </div>
        <p className="text-slate-500 font-medium font-sans text-sm sm:text-base">{emptyMsg}</p>
      </div>
    </div>
  );
}

export default async function DestinationSeoPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const destination = await getDestinationData(resolvedParams.slug);

  if (!destination) {
    notFound();
  }

  // 1. Structured Data Schemas
  const schemas: any[] = [
    {
      "@context": "https://schema.org",
      "@type": "TouristDestination",
      "name": destination.title,
      "description": destination.description,
      "url": destination.seo.canonicalUrl,
      ...(destination.gallery.length > 0 && { "image": destination.gallery[0].url }),
    },
  ];

  if (destination.faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": destination.faqs.map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer,
        },
      })),
    });
  }

  // Gallery URLs for Bento Gallery
  const galleryUrls = destination.gallery.map((g) => g.url);

  // Helper for rendering structured rich content section or empty state
  const renderSectionOrEmpty = (
    id: string, 
    title: string, 
    content: SectionRichContent, 
    icon: any, 
    desc: string, 
    emptyMsg: string
  ) => {
    if (hasRichContent(content)) {
      return (
        <div id={id} className="mb-14 sm:mb-16">
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center font-display tracking-tight">{title}</h2>
          </div>
          <RichContentRenderer content={content} />
        </div>
      );
    }
    return <EmptyStateSection id={id} title={title} icon={icon} description={desc} emptyMsg={emptyMsg} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {schemas.map((schema, idx) => (
        <JsonLd key={idx} data={schema} />
      ))}
      <Navbar />

      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-5 md:px-6 pt-20 sm:pt-24 pb-20">
        {/* 1. Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-sans">
          <Link href="/" className="hover:text-[var(--season-primary,#065F46)] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/destinations" className="hover:text-[var(--season-primary,#065F46)] transition-colors">
            Destinations
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-medium truncate">
            {destination.h1Heading}
          </span>
        </nav>

        {/* 2. Top Bento Media Gallery */}
        <div className="mt-4 sm:mt-5">
          <TourBentoGallery title={destination.h1Heading} images={galleryUrls} />
        </div>

        {/* 3. Title and Description Block */}
        <div className="mt-6 sm:mt-8 mb-12 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-slate-900 font-display tracking-tight leading-tight">
            {destination.h1Heading}
          </h1>
          <p className="font-sans text-base sm:text-lg text-slate-600 leading-relaxed w-full mt-4 sm:mt-4.5">
            {destination.description}
          </p>
        </div>

        {/* Dynamic CMS Sections in Early Page */}
        <DynamicSectionRenderer blocks={destination.dynamicSections} maxOrder={30} />


        {/* 4. OVERVIEW (Dedicated Structured Rich Content Field) */}
        {hasRichContent(destination.overview) ? (
          <div id="overview" className="mb-14 sm:mb-16">
            <div className="flex flex-col items-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center font-display tracking-tight">Overview</h2>
            </div>
            <RichContentRenderer content={destination.overview} />
          </div>
        ) : (
          <EmptyStateSection 
            id="overview-empty"
            title="Overview"
            icon={BookOpen}
            description="Introduction and detailed overview."
            emptyMsg="Overview content for this destination has not been configured yet."
          />
        )}

        {/* 5. PLACES TO VISIT (Ordered Explicit Relationships) */}
        {destination.places.length > 0 ? (
          <div id="places" className="mb-14 sm:mb-16">
            <div className="flex flex-col items-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center font-display tracking-tight">
                Places To Visit In {destination.cleanName}
              </h2>
              <p className="text-slate-500 mt-2 text-center font-sans text-sm sm:text-base">
                Explore top attractions, scenic spots, and must-visit landmarks.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destination.places.map((place) => {
                const placeImg = place.imageUrl || "/images/placeholder-place.jpg";
                return (
                  <Link
                    key={place.id}
                    href={`/destinations/${destination.slug}/${place.slug}`}
                    className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                      {place.imageUrl ? (
                        <Image
                          src={place.imageUrl}
                          alt={place.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <MapPin className="w-8 h-8" />
                        </div>
                      )}
                      {place.destination && (
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-sm">
                          <MapPin className="w-3 h-3 text-[#f97316]" />
                          <span>{place.destination}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#f97316] transition-colors mb-2">
                        {place.name}
                      </h3>
                      {place.description && (
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                          {place.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        ) : (
          <EmptyStateSection
            id="places"
            title={`Places To Visit In ${destination.cleanName}`}
            icon={MapPin}
            description="Explore top attractions and sightseeing spots."
            emptyMsg="Verified places to visit will appear here once configured for this destination."
          />
        )}

        {/* 6. WHERE TO STAY (Explicit Featured Accommodations) */}
        <div id="where-to-stay" className="mb-14 sm:mb-16">
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center font-display tracking-tight">Where to Stay</h2>
            <p className="text-slate-500 mt-2 font-sans text-sm sm:text-base">Verified accommodations and properties in this area.</p>
          </div>
          
          {destination.featuredProperties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destination.featuredProperties.map((property) => {
                  const imageUrl = property.images && property.images.length > 0 ? property.images[0] : "";
                  const isHotel = property.type === 'HOTEL';
                    
                  return (
                    <Link href={`/stays/${property.id}`} key={property.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100">
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={property.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Building className="w-8 h-8" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-700 flex items-center gap-1">
                          {isHotel ? <Building className="w-3 h-3 text-indigo-600" /> : <Home className="w-3 h-3 text-[#f97316]" />}
                          {isHotel ? 'Hotel/Resort' : 'Homestay'}
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {property.name}
                          </h3>
                          {property.rating ? (
                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded text-sm font-semibold text-amber-700">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{property.rating.toFixed(1)}</span>
                            </div>
                          ) : null}
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
            </>
          ) : (
            <EmptyStateSection 
              id="where-to-stay-empty"
              title=""
              icon={Building}
              description=""
              emptyMsg="Accommodation options are not yet configured for this destination."
            />
          )}
        </div>

        {/* 7. BEST TIME TO VISIT (Dedicated Structured Field) */}
        {renderSectionOrEmpty(
          "best-time", 
          "Best Time to Visit", 
          destination.bestTimeToVisit, 
          Clock, 
          "Discover the perfect season for your trip.", 
          "Seasonal insights and best time to visit will appear here once configured."
        )}

        {/* 8. ITINERARY (Dedicated Structured Field) */}
        {renderSectionOrEmpty(
          "itinerary", 
          "Itinerary", 
          destination.itinerary, 
          Calendar, 
          "Suggested day-by-day plans.", 
          "Suggested itineraries will appear here once configured."
        )}

        {/* 9. HOW TO REACH (Dedicated Structured Field) */}
        {renderSectionOrEmpty(
          "how-to-reach", 
          "How to Reach", 
          destination.howToReach, 
          Navigation, 
          "Transportation options and directions.", 
          "Travel directions will appear here once configured."
        )}

        {/* 10. FOOD (Dedicated Structured Field) */}
        {renderSectionOrEmpty(
          "food", 
          "Food", 
          destination.food, 
          UtensilsCrossed, 
          "Local culinary experiences and popular dining.", 
          "Local food guides will appear here once configured."
        )}

        {/* 11. SHOPPING (Dedicated Structured Field) */}
        {renderSectionOrEmpty(
          "shopping", 
          "Shopping", 
          destination.shopping, 
          Sparkles, 
          "Best places to buy souvenirs and local crafts.", 
          "Shopping recommendations will appear here once configured."
        )}

        {/* 12. ACTIVITIES (Dedicated Structured Field) */}
        {renderSectionOrEmpty(
          "activities", 
          "Activities", 
          destination.activities, 
          Star, 
          "Top things to do and experiences.", 
          "Popular activities will appear here once configured."
        )}
        
        {/* Dynamic CMS Sections in Mid Page */}
        <DynamicSectionRenderer blocks={destination.dynamicSections} minOrder={31} maxOrder={89} />


        {/* 13. FEATURED TOURS (Explicit Relationships) */}
        <div id="tours" className="mb-14 sm:mb-16">
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center font-display tracking-tight">Featured Tours</h2>
            <p className="text-slate-500 mt-2 font-sans text-sm sm:text-base">Top-rated tour packages featuring this destination.</p>
          </div>
          
          {destination.featuredTours.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {destination.featuredTours.map((tour) => (
                  <Link href={`/tours/${tour.slug}`} key={tour.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                      {tour.heroImage && (
                        <Image
                          src={tour.heroImage}
                          alt={tour.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 25vw"
                        />
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
                        {tour.title}
                      </h3>
                      <div className="flex items-center text-slate-500 text-sm mb-4">
                        <Clock className="w-4 h-4 mr-1 shrink-0" />
                        <span>{tour.duration}</span>
                      </div>
                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between font-bold">
                        <span className="text-slate-900">₹{tour.price?.toLocaleString('en-IN')}</span>
                        <span className="text-indigo-600 text-sm">View Tour</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-10 text-center">
                 <Link 
                  href={`/tours?destination=${encodeURIComponent(destination.cleanName || destination.h1Heading)}`} 
                  className="px-8 py-3 bg-[#f97316] text-white rounded-full font-medium hover:bg-[#ea580c] transition-colors shadow-sm inline-block"
                >
                  View All Tours
                </Link>
              </div>
            </>
          ) : (
            <EmptyStateSection 
              id="tours-empty"
              title=""
              icon={Compass}
              description=""
              emptyMsg="Tour packages featuring this destination will appear here once configured."
            />
          )}
        </div>

        {/* 14. NEARBY PLACES (Structured Cards or Guide Content) */}
        {destination.nearbyDestinations.length > 0 ? (
          <div id="nearby-places" className="mb-14 sm:mb-16">
            <div className="flex flex-col items-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center font-display tracking-tight">Nearby Places</h2>
              <p className="text-slate-500 mt-2 font-sans text-sm sm:text-base">Other destinations and scenic valleys close by.</p>
            </div>
            {hasRichContent(destination.nearbyPlacesContent) && (
              <div className="mb-8">
                <RichContentRenderer content={destination.nearbyPlacesContent} />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {destination.nearbyDestinations.map((nearby) => (
                <Link
                  href={`/destinations/${nearby.slug}`}
                  key={nearby.id}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    {nearby.imageUrl ? (
                      <Image
                        src={nearby.imageUrl}
                        alt={nearby.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Map className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors mb-1.5">
                      {nearby.title}
                    </h3>
                    {nearby.description && (
                      <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                        {nearby.description}
                      </p>
                    )}
                    <span className="mt-auto pt-3 text-xs font-semibold text-[var(--season-primary)] flex items-center gap-1">
                      Explore guide →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          renderSectionOrEmpty(
            "nearby-places", 
            "Nearby Places", 
            destination.nearbyPlacesContent, 
            Map, 
            "Other destinations close by.", 
            "Nearby places will appear here once configured."
          )
        )}

        {/* Dynamic CMS Sections in Late Page (e.g. Travel Tips) */}
        <DynamicSectionRenderer blocks={destination.dynamicSections} minOrder={90} />

        {/* 15. FAQ (Structured CMS FAQ Block) */}
        <div id="faq" className="mb-14 sm:mb-16">
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center font-display tracking-tight">FAQ</h2>
            <p className="text-slate-500 mt-2 font-sans text-sm sm:text-base">Frequently asked questions about this destination.</p>
          </div>
          {destination.faqs.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-4">
              {destination.faqs.map((faq, idx) => (
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
          ) : (
            <div className="p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-3 min-h-[200px]">
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 mb-2 shadow-sm">
                <ChevronDown className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="text-slate-500 font-medium">FAQs haven't been configured for this destination yet.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
