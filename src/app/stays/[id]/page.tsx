import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";
import { MapPin, Star, Users, Home, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { getAvailableAddons } from "@/actions/addons";

// Lazy Loaded Components
const Footer = dynamic(() => import("@/components/Footer"));
const BookingSidebar = dynamic(() => import("@/components/BookingSidebar"));
const MobileBookingWrapperClient = dynamic(() => import("@/components/MobileBookingWrapperClient"));
const AddonsSelectorClient = dynamic(() => import("@/components/AddonsSelectorClient"));
const ReviewList = dynamic(() => import("@/components/ReviewList"));
const ReviewForm = dynamic(() => import("@/components/ReviewForm"));
import PropertyDescription from "@/components/PropertyDescription";
import { getReviews, getReviewStats } from "@/actions/reviews";
import { Metadata } from "next";
import PhotoGalleryClient from "@/components/PhotoGalleryClient";
import { getGooglePlaceReviews } from "@/actions/google-reviews";
import GoogleReviewsList from "@/components/GoogleReviewsList";
import PropertyStickyNav from "@/components/PropertyStickyNav";
import { Utensils, CheckCircle } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const property = await prisma.property.findUnique({ 
    where: { id },
    include: { vendorProfile: true }
  });
  
  if (!property) return { title: "Property Not Found | WanderKashmir" };
  
  const isVergan = property.name === "The Vergan Resort";
  
  const typeLabel = property.vendorProfile?.type 
      ? property.vendorProfile.type.charAt(0).toUpperCase() + property.vendorProfile.type.slice(1).toLowerCase()
      : "Stay";

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ["https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=1200"];

  return {
    title: isVergan 
      ? `The Vergan Resort Pahalgam | Rooms, Photos & Stay`
      : `Book ${property.name}, ${property.location} | Best ${typeLabel}`,
    description: isVergan
      ? `Book The Vergan Resort in Pahalgam. Experience a serene stay near Movera Rafting Point with stunning mountain views, king-size beds, free WiFi, and secure parking.`
      : property.description 
      ? property.description.substring(0, 160).trim() + (property.description.length > 160 ? "..." : "")
      : `Book ${property.name}, a beautiful ${typeLabel} located in ${property.location}. Enjoy top-rated amenities, verified reviews, and secure booking with WanderKashmir.`,
    openGraph: {
      images: images.map((url: string) => ({ url })),
      type: "website",
    },
    alternates: {
      canonical: `https://www.wanderkashmir.com/stays/${id}`,
    },
  };
}

export const revalidate = 60;

export default async function PropertyDetailPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const isSuccess = resolvedSearchParams.success === 'true';
  const { userId } = await auth();

  let property: any = null;

  try {
    property = await prisma.property.findUnique({
      where: { id },
      include: { vendorProfile: true, roomTypes: true }
    });
  } catch (error) {
    console.error("DB Error fetching property:", error);
  }

  if (!property) {
    notFound();
  }

  // Handle dynamic data & types
  const propData: any = property;
  const images = propData.images && propData.images.length > 0 
    ? propData.images 
    : ["https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=1200"];
  
  const mainImage = images[0];

  const addonsRes = await getAvailableAddons();

  const reviewStatsRes = await getReviewStats("PROPERTY", id);
  const reviewStats = { 
    averageRating: reviewStatsRes.success ? (reviewStatsRes.averageRating || 0) : 0, 
    totalCount: reviewStatsRes.success ? (reviewStatsRes.totalCount || 0) : 0 
  };
  const reviewsRes = await getReviews("PROPERTY", id);
  const dbReviews = reviewsRes.success ? reviewsRes.reviews : [];

  let googleData = null;
  if (property.googlePlaceId) {
    googleData = await getGooglePlaceReviews(property.googlePlaceId);
  }

  // Use Google Reviews for Schema if available, otherwise use native DB reviews
  const schemaRatingValue = googleData?.rating || reviewStats.averageRating;
  const schemaReviewCount = googleData?.userRatingsTotal || reviewStats.totalCount;

  return (
    <main className="min-h-screen bg-white pt-24">
      <Navbar />
      
      {isSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row">
            {/* Left Side */}
            <div className="bg-slate-50 md:w-2/5 p-8 flex flex-col items-center justify-center border-r border-slate-100">
              <div className="w-24 h-24 bg-orange-500 rounded-[2rem] flex items-center justify-center shadow-lg shadow-orange-500/30 mb-6">
                <ShieldCheck className="w-12 h-12 text-white" />
              </div>
              <div className="bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-200 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-xs font-bold text-slate-700 tracking-wider">SECURE</span>
              </div>
            </div>
            
            {/* Right Side */}
            <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center relative">
              <Link href="/trips" className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
              
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 italic tracking-tight uppercase">GREAT! <span className="text-orange-600">CONFIRMED.</span></h2>
              <p className="text-slate-500 mb-8 font-medium">
                Payment processed successfully. Get ready for your trip to Kashmir!
              </p>
              
              <Link href="/trips" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md flex items-center justify-between group">
                <span>VIEW MY TRIPS</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              
              <div className="mt-6 text-center text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                WANDERKASHMIR // BOOKING CONFIRMATION
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── JSON-LD STRUCTURED DATA FOR GOOGLE RICH SNIPPETS ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            property.name === "The Vergan Resort" ? {
              "@context": "https://schema.org",
              "@type": "Hotel",
              "name": "The Vergan Resort Pahalgam",
              "description": "A hotel located near Movera Rafting Point in Pahalgam, offering 8 mountain-facing rooms, king-size beds, heating, free WiFi, and parking.",
              "url": `https://www.wanderkashmir.com/stays/${property.id}`,
              "telephone": "+91-6005473783",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Near Rafting Point, Movera, Yanier",
                "addressLocality": "Pahalgam",
                "addressRegion": "Jammu and Kashmir",
                "postalCode": "192401",
                "addressCountry": "IN"
              },
              "amenityFeature": [
                { "@type": "LocationFeatureSpecification", "name": "Free WiFi", "value": true },
                { "@type": "LocationFeatureSpecification", "name": "Parking", "value": true },
                { "@type": "LocationFeatureSpecification", "name": "Room Service", "value": true },
                { "@type": "LocationFeatureSpecification", "name": "Heating", "value": true },
                { "@type": "LocationFeatureSpecification", "name": "On-site Restaurant", "value": true }
              ]
            } : {
              "@context": "https://schema.org",
              "@type": property.vendorProfile?.type === 'HOTEL' ? 'Hotel' : 'LodgingBusiness',
              "name": property.name,
              "description": property.description,
              "image": images,
              "address": {
                "@type": "PostalAddress",
                "addressLocality": property.location,
                "addressRegion": "Jammu and Kashmir",
                "addressCountry": "IN"
              },
              ...(property.pricePerNight ? {
                "priceRange": `₹${property.pricePerNight}`,
                "offers": {
                  "@type": "Offer",
                  "priceCurrency": "INR",
                  "price": property.pricePerNight,
                  "availability": "https://schema.org/InStock",
                  "url": `https://www.wanderkashmir.com/stays/${property.id}`
                }
              } : {}),
              ...(schemaReviewCount > 0 && {
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": schemaRatingValue.toFixed(1),
                  "reviewCount": schemaReviewCount
                }
              })
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.wanderkashmir.com" },
                { "@type": "ListItem", "position": 2, "name": "Stays", "item": "https://www.wanderkashmir.com/stays" },
                { "@type": "ListItem", "position": 3, "name": property.name, "item": `https://www.wanderkashmir.com/stays/${property.id}` }
              ]
            }
          ])
        }}
      />

      {/* ─── BREADCRUMBS & TITLE ─── */}
      <div className="container-custom py-6">
        <div className="text-sm text-slate-500 mb-4 flex items-center gap-2">
          <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/stays" className="hover:text-orange-500 transition-colors">Stays</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">{property.name}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          {property.name === "The Vergan Resort" 
            ? "The Vergan Resort Pahalgam" 
            : `${property.name} - ${property.vendorProfile?.type === 'HOTEL' ? 'Hotel' : 'Homestay'} in ${property.location}`}
        </h1>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1 font-medium text-slate-900">
            <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
            {schemaRatingValue.toFixed(1)} <span className="text-slate-500 font-normal">({schemaReviewCount} reviews)</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-slate-400" />
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-slate-300 underline-offset-4 hover:text-orange-500 transition-colors"
            >
              {property.location}
            </a>
          </div>
        </div>
      </div>

      {/* ─── IMAGE GALLERY ─── */}
      <div className="container-custom mb-12">
        <PhotoGalleryClient 
          images={images} 
          propertyName={property.name}
          altTexts={
            property.name === "The Vergan Resort" 
              ? [
                  "Exterior view of the resort building and grounds",
                  "Mountain-facing bedroom with king-size bed and large windows",
                  "View of the surrounding mountains from the room",
                  "On-site restaurant and indoor dining area",
                  "Garden and pine forest surroundings at the property",
                  "Guest common area at the property",
                  "Cozy evening view of the homestay",
                ] 
              : undefined
          }
        />
      </div>

      <PropertyStickyNav />

      {/* ─── CONTENT GRID ─── */}
      <div className="container-custom pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10" id="overview">
            {/* Host Info */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  Entire {property.vendorProfile.type.toLowerCase()} hosted by {property.vendorProfile.businessName}
                </h2>
                <p className="text-slate-500 flex flex-wrap items-center gap-4 text-sm mt-2">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {property.guests || 2} {(property.guests || 2) === 1 ? 'guest' : 'guests'}</span>
                  <span className="flex items-center gap-1"><Home className="w-4 h-4" /> {property.bedrooms || 1} {(property.bedrooms || 1) === 1 ? 'bedroom' : 'bedrooms'}</span>
                  {property.bedDetails && (
                    <span className="flex items-center gap-1 text-slate-400 border-l border-slate-200 pl-4">{property.bedDetails}</span>
                  )}
                </p>
              </div>
              <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${property.vendorProfile.businessName}`} alt="Host" className="w-full h-full" />
              </div>
            </div>

            {/* Description */}
            <PropertyDescription 
              title={property.name === "The Vergan Resort" ? "About The Vergan Resort Pahalgam" : undefined}
              description={property.name === "The Vergan Resort" ? "Located in the Yanier area, before the main Pahalgam town center, The Vergan Resort offers a peaceful stay away from the crowded markets. Situated near the Movera Rafting Point along the Lidder River, the property provides immediate access to both mountain scenery and outdoor activities.\n\nThe resort features 8 spacious, mountain-facing rooms equipped with dedicated heating, king-size beds, and uninterrupted high-speed WiFi. The on-site restaurant serves authentic Kashmiri Wazwan, and room service is available for guests." : (property.description || "Experience the unparalleled beauty of Kashmir in this cozy property. Perfectly situated to give you the best views and comfort.")} 
            />

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                {property.name === "The Vergan Resort" ? "Rooms & Facilities" : "What this place offers"}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {["Mountain view", "Free WiFi", "Dedicated workspace", "Free parking on premises", "Room service", "Heating"].map(amenity => (
                  <div key={amenity} className="flex items-center gap-3 text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rooms Section */}
            <div id="rooms" className="pt-10 border-t border-slate-100 mt-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Available Rooms</h2>
              {property.roomTypes && property.roomTypes.length > 0 ? (
                <div className="space-y-6">
                  {property.roomTypes.map((room: any) => (
                    <div key={room.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{room.name}</h3>
                          <p className="text-sm text-slate-500 mt-1">{room.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-slate-900">₹{room.basePrice}</div>
                          <div className="text-xs text-slate-500">per night (Base Price)</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 text-sm text-slate-600 mb-6 pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-1"><Users className="w-4 h-4" /> Up to {room.capacity} guests</div>
                        <div className="flex items-center gap-1"><Home className="w-4 h-4" /> {room.totalUnits} units</div>
                      </div>

                      {/* Meal Plans */}
                      {(room.priceEP || room.priceCP || room.priceMAP) && (
                        <div className="mb-6">
                          <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-orange-500" /> Meal Plans
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {room.priceEP && (
                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <div className="font-bold text-slate-800 text-sm">EP Plan</div>
                                <div className="text-xs text-slate-500 mb-1">Room Only</div>
                                <div className="font-bold text-orange-600">₹{room.priceEP} <span className="text-xs font-normal text-slate-500">/night</span></div>
                              </div>
                            )}
                            {room.priceCP && (
                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <div className="font-bold text-slate-800 text-sm">CP Plan</div>
                                <div className="text-xs text-slate-500 mb-1">Breakfast</div>
                                <div className="font-bold text-orange-600">₹{room.priceCP} <span className="text-xs font-normal text-slate-500">/night</span></div>
                              </div>
                            )}
                            {room.priceMAP && (
                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <div className="font-bold text-slate-800 text-sm">MAP Plan</div>
                                <div className="text-xs text-slate-500 mb-1">Breakfast + Dinner</div>
                                <div className="font-bold text-orange-600">₹{room.priceMAP} <span className="text-xs font-normal text-slate-500">/night</span></div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Extra Charges */}
                      {(room.extraBedPriceEP || room.extraBedPriceCP || room.extraBedPriceMAP || room.childNoBedPriceEP || room.childNoBedPriceCP || room.childNoBedPriceMAP) && (
                        <div>
                          <h4 className="font-bold text-slate-900 mb-3 text-sm">Extra Persons (Optional)</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(room.extraBedPriceEP || room.extraBedPriceCP || room.extraBedPriceMAP) && (
                              <div className="text-sm">
                                <div className="font-medium text-slate-700 mb-2">Extra Bed</div>
                                <ul className="space-y-1 text-slate-600 text-xs">
                                  {room.extraBedPriceEP && <li>EP: ₹{room.extraBedPriceEP}</li>}
                                  {room.extraBedPriceCP && <li>CP: ₹{room.extraBedPriceCP}</li>}
                                  {room.extraBedPriceMAP && <li>MAP: ₹{room.extraBedPriceMAP}</li>}
                                </ul>
                              </div>
                            )}
                            {(room.childNoBedPriceEP || room.childNoBedPriceCP || room.childNoBedPriceMAP) && (
                              <div className="text-sm">
                                <div className="font-medium text-slate-700 mb-2">Child (No Bed)</div>
                                <ul className="space-y-1 text-slate-600 text-xs">
                                  {room.childNoBedPriceEP && <li>EP: ₹{room.childNoBedPriceEP}</li>}
                                  {room.childNoBedPriceCP && <li>CP: ₹{room.childNoBedPriceCP}</li>}
                                  {room.childNoBedPriceMAP && <li>MAP: ₹{room.childNoBedPriceMAP}</li>}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-10 text-center">
                  <p className="text-slate-500 font-medium">Rooms information coming soon.</p>
                </div>
              )}
            </div>

            {/* Property Rules (J&K Govt) */}
            <div id="property-rules" className="pt-10 border-t border-slate-100 mt-10">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Property Rules & Guidelines
              </h3>
              <p className="text-sm text-slate-500 mb-6">As per the regulations of the Government of Jammu & Kashmir Tourism Department, the following rules apply to all guests:</p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-5">
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-slate-400 mt-2 shrink-0"></div>
                  <div>
                    <span className="font-bold text-slate-900 block">Valid ID Proof Mandatory</span>
                    <span className="text-sm text-slate-600 mt-1 block leading-relaxed">A valid, government-issued photo ID (Aadhar, Voter ID, Driving License, or Passport) is mandatory for all guests at the time of check-in. PAN Cards are not accepted as valid address proof.</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-slate-400 mt-2 shrink-0"></div>
                  <div>
                    <span className="font-bold text-slate-900 block">Foreign Nationals</span>
                    <span className="text-sm text-slate-600 mt-1 block leading-relaxed">All foreign guests must present their original Passport and a valid Indian Visa upon arrival. Submission of Form C to the local authorities by the property is mandatory.</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-slate-400 mt-2 shrink-0"></div>
                  <div>
                    <span className="font-bold text-slate-900 block">Right to Admission</span>
                    <span className="text-sm text-slate-600 mt-1 block leading-relaxed">The property reserves the right of admission. Accommodation can be denied to guests posing as a couple if suitable proof of identification is not presented at check-in.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions & Answers Section */}
            <div id="location">
              {property.name === "The Vergan Resort" && (
                <div className="pt-10 border-t border-slate-100 mt-10">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  Location & How to Reach
                </h2>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap"><strong>Address:</strong> Near Rafting Point, Movera, Yanier, Pahalgam, Anantnag, Jammu & Kashmir, 192401.<br/><br/>The Vergan Resort is situated before the main Pahalgam market on the Anantnag-Pahalgam road.<br/><br/>The resort features ample free on-site parking for guests arriving by private or rental vehicles.</p>
                </div>
                
                <h2 className="text-xl font-bold text-slate-900 mt-10 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-orange-500" />
                  Nearby Attractions & Things to Do
                </h2>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                  <ul className="space-y-4 text-slate-600 list-disc ml-4">
                    <li><strong>Movera Rafting Point:</strong> A nearby location for guests interested in white-water rafting on the Lidder River.</li>
                    <li><strong>Lidder River:</strong> Accessible by a short walk, suitable for evening strolls and enjoying the valley's natural landscape.</li>
                    <li><strong>Aru Valley:</strong> A scenic drive past Pahalgam town, serving as the basecamp for the Kolahoi Glacier trek.</li>
                    <li><strong>Betaab Valley:</strong> A popular meadow region known for its film history.</li>
                    <li><strong>Baisaran (Mini Switzerland):</strong> Accessible via a pony trip from the main Pahalgam taxi stand.</li>
                  </ul>
                </div>
              </div>
            )}

            {(property.name === "The Vergan Resort" || (Array.isArray(property.faqs) && property.faqs.length > 0)) && (
              <div className="pt-10 border-t border-slate-100 mt-10">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {property.name === "The Vergan Resort" ? "Frequently Asked Questions" : `Questions & Answers - When Booking ${property.name}`}
                </h2>
                <div className="space-y-6">
                  {property.name === "The Vergan Resort" && (
                    <>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                        <div className="flex gap-3 mb-3">
                          <span className="font-bold text-slate-900 shrink-0">Q:</span>
                          <h4 className="font-bold text-slate-900">Where is The Vergan Resort located in Pahalgam?</h4>
                        </div>
                        <div className="flex gap-3">
                          <span className="font-bold text-orange-500 shrink-0">A:</span>
                          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">The resort is located in Yanier, Movera, before the main Pahalgam town center.</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                        <div className="flex gap-3 mb-3">
                          <span className="font-bold text-slate-900 shrink-0">Q:</span>
                          <h4 className="font-bold text-slate-900">Is The Vergan Resort suitable for guests interested in river rafting?</h4>
                        </div>
                        <div className="flex gap-3">
                          <span className="font-bold text-orange-500 shrink-0">A:</span>
                          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">The resort is located near the Movera Rafting Point on the Lidder River, making it convenient for guests interested in rafting activities.</p>
                        </div>
                      </div>
                    </>
                  )}
                  {Array.isArray(property.faqs) && property.faqs.map((faq: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                      <div className="flex gap-3 mb-3">
                        <span className="font-bold text-slate-900 shrink-0">Q:</span>
                        <h4 className="font-bold text-slate-900">{faq.question}</h4>
                      </div>
                      <div className="flex gap-3">
                        <span className="font-bold text-orange-500 shrink-0">A:</span>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div id="reviews" className="pt-10 border-t border-slate-100 mt-10">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Guest Reviews</h3>
              
              {googleData ? (
                <GoogleReviewsList 
                  reviews={googleData.reviews} 
                  rating={googleData.rating} 
                  totalRatings={googleData.userRatingsTotal} 
                />
              ) : (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-10 text-center mb-10">
                  <p className="text-slate-500 font-medium">Google reviews are currently unavailable for this property.</p>
                </div>
              )}

              <Suspense fallback={<div className="h-16 lg:hidden"></div>}>
                <MobileBookingWrapperClient 
                  propertyId={property.id} 
                  pricePerNight={property.pricePerNight} 
                  rating={reviewStats.averageRating}
                  isLoggedIn={!!userId}
                  propertyType={property.vendorProfile.type}
                  maxGuests={property.guests || 2}
                />
              </Suspense>
            </div>
          </div>

          {/* Booking Card Sticky Sidebar */}
          <div className="hidden lg:block relative">
            <Suspense fallback={<div className="h-[400px] bg-slate-50 rounded-2xl animate-pulse"></div>}>
              <BookingSidebar 
                propertyId={property.id} 
                pricePerNight={property.pricePerNight} 
                rating={reviewStats.averageRating}
                isLoggedIn={!!userId}
                propertyType={property.vendorProfile.type}
                maxGuests={property.guests || 2}
              />
            </Suspense>

            <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-sm">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <span>100% Secure Checkout via Razorpay</span>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  );
}
