import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import HeroCarousel from "@/components/HeroCarousel";
import ComingSoonButton from "@/components/ComingSoonButton";
import CustomizeTourModal from "@/components/CustomizeTourModal";
import { getValidImageUrl } from "@/lib/imageUtils";
import { getGooglePlaceReviews } from "@/actions/google-reviews";
import GoogleReviewsList from "@/components/GoogleReviewsList";
import PromoPopup from "@/components/PromoPopup";
import { getHomepagePromos } from "@/actions/promo-codes";

import PopularSeoRoutes from "@/components/PopularSeoRoutes";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  ArrowRight,
  Shield,
  Headphones,
  CreditCard,
  MapPin,
  TrendingUp,
  Users,
  Hotel,
  Car,
  Package,
  ChevronRight,
  Play,
} from "lucide-react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
import dynamic from "next/dynamic";

const FeaturedTaxisClient = dynamic(
  () => import("@/components/FeaturedTaxisClient"),
  { ssr: true } // Keep SSR so content is in initial HTML for SEO
);


export const revalidate = 60;

/* ─── Mock Data ─────────────────────────────────────────── */
const featuredPropertiesMock = [
  {
    id: "1",
    name: "The Kaboora Homestay",
    type: "Homestay",
    location: "Srinagar",
    price: 2500,
    rating: 4.8,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800",
    featured: true,
  },
  {
    id: "2",
    name: "Houseboat New Montana",
    type: "Houseboat",
    location: "Dal Lake, Srinagar",
    price: 4000,
    rating: 4.6,
    reviews: 96,
    image: "https://images.unsplash.com/photo-1605537964076-2cb0caf302d9?auto=format&fit=crop&q=80&w=800",
    featured: true,
  },
  {
    id: "3",
    name: "Pine View Cottage",
    type: "Cottage",
    location: "Pahalgam",
    price: 3200,
    rating: 4.7,
    reviews: 78,
    image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=800",
    featured: false,
  },
  {
    id: "4",
    name: "Gulmarg Retreat",
    type: "Hotel",
    location: "Gulmarg",
    price: 3800,
    rating: 4.5,
    reviews: 64,
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800",
    featured: false,
  },
];

async function getFeaturedProperties() {
  try {
    const dbProperties = await prisma.property.findMany({
      where: {
        isApproved: true,
        status: "APPROVED"
      },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { vendorProfile: true, reviews: true },
    });

    if (dbProperties.length > 0) {
      return await Promise.all(dbProperties.map(async (p, i) => {
        let rating = 0;
        let reviewsCount = 0;

        if (p.reviews && (p as any).reviews.length > 0) {
          const totalRating = (p as any).reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
          rating = totalRating / (p as any).reviews.length;
          reviewsCount = (p as any).reviews.length;
        } else if (p.googlePlaceId) {
          try {
            const googleData = await getGooglePlaceReviews(p.googlePlaceId);
            if (googleData) {
              rating = googleData.rating || 0;
              reviewsCount = googleData.userRatingsTotal || 0;
            }
          } catch (e) {
            console.error("Failed to fetch google reviews for", p.name);
          }
        }

        return {
          id: p.id,
          name: p.name,
          type: p.vendorProfile.type === "HOTEL" ? "Hotel" : "Homestay",
          location: p.location,
          price: p.pricePerNight,
          rating: Number(rating.toFixed(1)),
          reviews: reviewsCount,
          image: getValidImageUrl((p as any).images, i % 2 === 0
                ? "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800"
                : "https://images.unsplash.com/photo-1605537964076-2cb0caf302d9?auto=format&fit=crop&q=80&w=800"),
          featured: true,
        };
      }));
    }
  } catch (error) {
    console.error("Failed to fetch properties:", error);
  }

  // Fallback to mock data if no properties in DB
  return featuredPropertiesMock;
}

async function getDestinationCounts(): Promise<Record<string, number>> {
  try {
    const [srinagar, gulmarg, pahalgam, sonamarg, ladakh, dalLake] = await Promise.all([
      prisma.property.count({
        where: {
          OR: [
            { location: { contains: 'srinagar', mode: 'insensitive' } },
            { location: { contains: 'dal lake', mode: 'insensitive' } },
            { location: { contains: 'nigeen', mode: 'insensitive' } }
          ]
        }
      }),
      prisma.property.count({
        where: {
          OR: [
            { location: { contains: 'gulmarg', mode: 'insensitive' } },
            { location: { contains: 'tangmarg', mode: 'insensitive' } }
          ]
        }
      }),
      prisma.property.count({
        where: {
          OR: [
            { location: { contains: 'pahalgam', mode: 'insensitive' } },
            { location: { contains: 'chandanwari', mode: 'insensitive' } },
            { location: { contains: 'aru', mode: 'insensitive' } }
          ]
        }
      }),
      prisma.property.count({
        where: {
          OR: [
            { location: { contains: 'sonamarg', mode: 'insensitive' } },
            { location: { contains: 'gagangeer', mode: 'insensitive' } }
          ]
        }
      }),
      prisma.property.count({
        where: {
          OR: [
            { location: { contains: 'ladakh', mode: 'insensitive' } },
            { location: { contains: 'leh', mode: 'insensitive' } }
          ]
        }
      }),
      prisma.property.count({
        where: {
          location: { contains: 'dal lake', mode: 'insensitive' }
        }
      })
    ]);

    return { srinagar, gulmarg, pahalgam, sonamarg, ladakh, 'dal lake': dalLake };
  } catch (error) {
    console.error("Failed to fetch location counts:", error);
    return {};
  }
}

async function getFeaturedGuides() {
  try {
    const dbGuides = await prisma.guideProfile.findMany({
      where: {
        vendorProfile: {
          isApproved: true,
          status: "APPROVED"
        }
      },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        vendorProfile: {
          include: {
            user: true
          }
        }
      },
    });

    if (dbGuides.length > 0) {
      return dbGuides.map((g) => ({
        id: g.id,
        name: g.vendorProfile.user.name || "Local Guide",
        location: g.location || "Srinagar",
        price: g.pricePerDay || 1500,
        rating: 4.8 + Math.random() * 0.2,
        reviews: Math.floor(Math.random() * 100) + 20,
        image: g.images && g.images.length > 1 ? g.images[1] : (g.images && g.images.length > 0 ? g.images[0] : "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800"),
        languages: g.languages || [],
        experience: g.experienceYears || 5
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch featured guides:", error);
    return [];
  }
}

async function getFeaturedTaxis() {
  try {
    const dbTaxis = await prisma.vendorProfile.findMany({
      where: {
        type: 'TAXI',
        isApproved: true
      },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        vehicles: true
      }
    });

    if (dbTaxis.length > 0) {
      return dbTaxis.map((t) => {
        const primaryVehicle = t.vehicles && t.vehicles.length > 0 ? t.vehicles[0] : null;
        return {
          id: t.id,
          name: t.businessName || "Local Taxi Driver",
          vehicleType: t.vehicleType || primaryVehicle?.model || "Taxi",
          image: primaryVehicle?.images?.[0] || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800",
          rating: 4.8 + Math.random() * 0.2,
          trips: Math.floor(Math.random() * 200) + 50,
          vehicleRegistration: t.vehicleRegistration || primaryVehicle?.registrationNum || "Verified"
        };
      });
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch featured taxis:", error);
    return [];
  }
}

const destinations = [
  {
    name: "Srinagar",
    subtitle: "City of Lakes",
    count: "320+ stays",
    image:
      "https://res.cloudinary.com/dcmoseix9/image/upload/q_auto/f_auto/v1781184060/ChatGPT_Image_Jun_11_2026_06_50_39_PM_sagjr5.png",
    href: "/stays?q=srinagar",
  },
  {
    name: "Gulmarg",
    subtitle: "Meadow of Flowers",
    count: "85+ stays",
    image:
      "https://res.cloudinary.com/dcmoseix9/image/upload/q_auto/f_auto/v1781184317/ChatGPT_Image_Jun_11_2026_06_54_50_PM_rot3s8.png",
    href: "/stays?q=gulmarg",
  },
  {
    name: "Pahalgam",
    subtitle: "Valley of Shepherds",
    count: "140+ stays",
    image:
      "https://res.cloudinary.com/dcmoseix9/image/upload/q_auto/f_auto/v1781184496/ChatGPT_Image_Jun_11_2026_06_57_52_PM_ohjz8z.png",
    href: "/stays?q=pahalgam",
  },
  {
    name: "Sonamarg",
    subtitle: "Meadow of Gold",
    count: "60+ stays",
    image:
      "https://res.cloudinary.com/dcmoseix9/image/upload/q_auto/f_auto/v1781184714/ChatGPT_Image_Jun_11_2026_07_01_39_PM_lwcndk.png",
    href: "/stays?q=sonamarg",
  },
  {
    name: "Dal Lake",
    subtitle: "Jewel of Kashmir",
    count: "200+ houseboats",
    image:
      "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=500&q=80",
    href: "/stays?type=houseboat",
  },
  {
    name: "Ladakh",
    subtitle: "Land of High Passes",
    count: "110+ stays",
    image:
      "https://images.unsplash.com/photo-1592466932854-4cf8c0fa04ec?w=500&q=80",
    href: "/stays?q=ladakh",
  },
];

const popularTours = [
  {
    id: "t1",
    title: "Kashmir Grand Tour",
    duration: "7 Days / 6 Nights",
    destinations: ["Srinagar", "Gulmarg", "Pahalgam"],
    price: 28500,
    rating: 4.9,
    reviews: 412,
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80",
    category: "Family",
    slug: "kashmir-grand-tour",
  },
  {
    id: "t2",
    title: "Gulmarg Ski Adventure",
    duration: "4 Days / 3 Nights",
    destinations: ["Gulmarg", "Srinagar"],
    price: 18900,
    rating: 4.8,
    reviews: 231,
    image:
      "https://images.unsplash.com/photo-1606115915090-be18fea23ec7?w=500&q=80",
    category: "Adventure",
    slug: "gulmarg-ski-adventure",
  },
  {
    id: "t3",
    title: "Kashmir Honeymoon Special",
    duration: "6 Days / 5 Nights",
    destinations: ["Srinagar", "Pahalgam", "Sonamarg"],
    price: 45000,
    rating: 5.0,
    reviews: 189,
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&q=80",
    category: "Honeymoon",
    slug: "kashmir-honeymoon-special",
  },
];

const stats = [
  { value: "5,000+", label: "Verified Properties", icon: Hotel },
  { value: "2,00,000+", label: "Happy Travelers", icon: Users },
  { value: "40+", label: "Destinations", icon: MapPin },
  { value: "4.8★", label: "Average Rating", icon: Star },
];

const testimonials = [
  {
    name: "Rahul Sharma",
    location: "Delhi",
    text: "The Dal Lake houseboat experience was absolutely magical. WanderKashmir made the entire booking seamless. Will definitely use again!",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    stay: "Grand Dal View Houseboat",
  },
  {
    name: "Priya Menon",
    location: "Bangalore",
    text: "Found the perfect homestay in Gulmarg through this platform. The host was incredibly warm and the views were breathtaking. 10/10!",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    stay: "Pine Valley Homestay",
  },
  {
    name: "Arjun Singh",
    location: "Mumbai",
    text: "Booked the 7-day Kashmir tour package and it was absolutely worth every rupee. The guides were knowledgeable and the itinerary was perfect.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/68.jpg",
    stay: "Kashmir Grand Tour",
  },
];

const whyUs = [
  {
    icon: Shield,
    title: "Verified Listings",
    desc: "Every property and vendor is personally verified by our local team before going live.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    desc: "100% secure payments via Razorpay. Full refund if booking is cancelled by host.",
  },
  {
    icon: Headphones,
    title: "24/7 Kashmir Support",
    desc: "Local support team available round-the-clock in Kashmiri, Hindi & English.",
  },
  {
    icon: TrendingUp,
    title: "Best Price Guarantee",
    desc: "We guarantee the best prices. Find it cheaper? We'll match it — no questions asked.",
  },
];
/* ─── End Mock Data ──────────────────────────────────────── */

export default async function Home() {
  const wanderkashmirPlaceId = "ChIJUZCKLqkR4jgRN3yVZt9_LYE";
  const [featuredProperties, locationCounts, featuredGuides, featuredTaxis, wkReviews, activePromosRes] = await Promise.all([
    getFeaturedProperties(),
    getDestinationCounts(),
    getFeaturedGuides(),
    getFeaturedTaxis(),
    getGooglePlaceReviews(wanderkashmirPlaceId),
    getHomepagePromos()
  ]);

  // Fetch tours from DB
  let tours = await prisma.tour.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3
  });

  // Fetch upcoming packages
  const upcomingTours = await prisma.tour.findMany({
    where: { 
      isLive: true,
      category: { contains: 'Upcoming', mode: 'insensitive' }
    },
    orderBy: { createdAt: 'desc' },
    take: 4
  });

  // Fetch Instagram packages
  const instagramTours = await prisma.tour.findMany({
    where: { 
      isLive: true,
      category: { contains: 'Instagram', mode: 'insensitive' }
    },
    orderBy: { createdAt: 'desc' },
    take: 4
  });

  // Merge dynamic counts into destinations
  const dynamicDestinations = destinations.map(dest => {
    const dbCount = locationCounts[dest.name.toLowerCase()] || 0;
    return {
      ...dest,
      count: dbCount > 0 ? `${dbCount} stays` : "Coming Soon",
    };
  });

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            "name": "WanderKashmir",
            "image": "https://www.wanderkashmir.com/icon.jpg",
            "@id": "https://www.wanderkashmir.com",
            "url": "https://www.wanderkashmir.com",
            "telephone": "+91-9999999999",
            "priceRange": "$$",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Srinagar",
              "addressRegion": "JK",
              "addressCountry": "IN"
            },
            "description": "Book verified hotels, homestays, houseboats, taxi services and tour packages across Jammu & Kashmir."
          })
        }}
      />
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative h-[99vh] md:h-[95vh] flex flex-col justify-center overflow-visible">
        {/* Background Image Carousel */}
        <HeroCarousel />

        {/* Hero Content */}
        <div className="relative z-10 container-custom mb-32 md:mb-0 pt-32 md:pt-0 mt-24 md:mt-48 text-center flex flex-col items-center">
          <h1 className="sr-only">Discover the Real INDIA</h1>
          <p className="text-white text-base md:text-lg font-medium drop-shadow-lg max-w-2xl tracking-wide mt-4 mb-6">
            Authentic Village Stays • Local Culture • Hidden Experiences
          </p>
          <div className="flex flex-wrap justify-center items-center gap-3.5 mt-2">
            <CustomizeTourModal />
          </div>
        </div>

        {/* Floating Search Bar Overlap */}
        <div className="absolute -bottom-20 left-0 right-0 z-20 container-custom">
          <div className="max-w-5xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Spacing for floating search bar */}
      <div className="h-32"></div>

      {/* ─── TRENDING ON INSTAGRAM ────────────────────────────── */}
      {instagramTours.length > 0 && (
        <section className="section-padding pb-4 bg-gradient-to-br from-pink-50/50 via-purple-50/30 to-orange-50/50 relative">
          <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[size:20px_20px]" />
          <div className="container-custom relative">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-1.5 rounded-full">
                    <InstagramIcon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">Trending on Instagram</h2>
                </div>
                <p className="text-sm text-slate-500 mt-1">Book the exact packages you saw on our reels and stories</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {instagramTours.map((tour) => (
                <Link key={tour.id} href={`/tours/${tour.slug}`} className="group block bg-white rounded-2xl border border-pink-100 overflow-hidden hover:shadow-xl hover:shadow-pink-500/10 transition-all hover:-translate-y-1 relative">
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-pink-500/20 rounded-2xl z-10 pointer-events-none transition-colors" />
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <Image 
                      src={tour.images[0] || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80"} 
                      alt={tour.title} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 25vw" 
                      className="object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md">
                      <InstagramIcon className="w-3 h-3" /> As seen on Insta
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <span className="bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                        {tour.duration}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 text-base leading-tight mb-1 line-clamp-1">{tour.title}</h3>
                    <p className="text-sm text-slate-500 mb-2 truncate">{tour.destinations.join(" • ")}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        {tour.originalPrice && tour.originalPrice > tour.price && (
                          <span className="text-xs text-slate-400 line-through mr-2">₹{tour.originalPrice.toLocaleString('en-IN')}</span>
                        )}
                        <span className="font-bold text-emerald-600">₹{tour.price.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-pink-50 p-1.5 rounded-full text-pink-600 group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 group-hover:text-white transition-all shadow-sm">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── UPCOMING PACKAGES ────────────────────────────────── */}
      {upcomingTours.length > 0 && (
        <section className="section-padding pb-4">
          <div className="container-custom">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Upcoming Packages</h2>
                <p className="text-sm text-slate-500 mt-1">Book early and get the best deals on our newest tours</p>
              </div>
              <Link
                href="/tours"
                className="text-sm font-semibold text-slate-600 border border-slate-200 px-4 py-2 rounded-full hover:bg-slate-50 transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {upcomingTours.map((tour) => (
                <Link key={tour.id} href={`/tours/${tour.slug}`} className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <Image 
                      src={tour.images[0] || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80"} 
                      alt={tour.title} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 25vw" 
                      className="object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {tour.category?.includes('Instagram') && (
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md w-fit">
                          <InstagramIcon className="w-3 h-3" /> As seen on Insta
                        </div>
                      )}
                      <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm w-fit">
                        Upcoming
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                        {tour.duration}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 text-base leading-tight mb-1 line-clamp-1">{tour.title}</h3>
                    <p className="text-sm text-slate-500 mb-2 truncate">{tour.destinations.join(" • ")}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        {tour.originalPrice && tour.originalPrice > tour.price && (
                          <span className="text-xs text-slate-400 line-through mr-2">₹{tour.originalPrice.toLocaleString('en-IN')}</span>
                        )}
                        <span className="font-bold text-emerald-600">₹{tour.price.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-slate-100 p-1.5 rounded-full text-slate-600 group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── POPULAR DESTINATIONS ────────────────────────────────── */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Popular Destinations</h2>
              <p className="text-sm text-slate-500 mt-1">Explore top destinations in Kashmir</p>
            </div>
            <Link
              href="/destinations"
              className="text-sm font-semibold text-slate-600 border border-slate-200 px-4 py-2 rounded-full hover:bg-slate-50 transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {dynamicDestinations.slice(0, 4).map((dest) => (
              <Link key={dest.name} href={dest.href} className="group block relative h-64 overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <Image 
                  src={dest.image} 
                  alt={dest.name} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-105" 
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5">
                  <h3 className="font-bold text-white text-xl">{dest.name}</h3>
                  <p className="text-white/80 text-sm mt-0.5">{dest.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED STAYS ──────────────────────────────── */}
      <section className="py-12 bg-slate-50">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Stays</h2>
              <p className="text-sm text-slate-500 mt-1">Handpicked stays for your perfect trip</p>
            </div>
            <Link
              href="/stays"
              className="text-sm font-semibold text-slate-600 border border-slate-200 px-4 py-2 rounded-full hover:bg-slate-50 transition-colors bg-white"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((p) => (
              <PropertyCard key={p.id} {...p} rating={Number(p.rating.toFixed(1))} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED LOCAL GUIDES ──────────────────────────── */}
      {featuredGuides.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container-custom">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Featured Local Guides</h2>
                <p className="text-sm text-slate-500 mt-1">Explore Kashmir with our top-rated local experts</p>
              </div>
              <Link
                href="/guides"
                className="text-sm font-semibold text-slate-600 border border-slate-200 px-4 py-2 rounded-full hover:bg-slate-50 transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredGuides.map((g) => (
                <Link key={g.id} href={`/guides`} className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <Image src={g.image} alt={g.name} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-slate-700 flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 text-orange-400 fill-orange-400" /> {g.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 text-lg mb-1">{g.name}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mb-2"><MapPin className="w-3.5 h-3.5" /> {g.location}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {g.languages.slice(0, 2).map((lang: string) => (
                        <span key={lang} className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{lang}</span>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
                      <span className="bg-slate-50 text-slate-700 text-sm font-bold px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-colors w-full text-center">
                        View Details
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── POPULAR TAXI DRIVERS ──────────────────────────── */}
      <FeaturedTaxisClient taxis={featuredTaxis} />

      {/* ─── TOUR PACKAGES & TAXI ───────────────────────────────── */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Popular Cultural Tour Packages</h2>
                <p className="text-sm text-slate-500 mt-1">Curated packages for unforgettable experiences</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tours.map((tour) => (
                  <Link key={tour.id} href={`/tours/${tour.slug}`} className="group block relative h-72 overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <Image 
                      src={tour.images[0] || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80"} 
                      alt={tour.title} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {tour.category?.includes('Instagram') && (
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md w-fit">
                          <InstagramIcon className="w-3 h-3" /> As seen on Insta
                        </div>
                      )}
                      <span className="bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-md w-fit">
                        {tour.duration}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 p-4 w-full">
                      <h3 className="font-semibold text-white text-base leading-tight mb-1">{tour.title}</h3>
                      <p className="text-white/80 text-xs truncate">{tour.destinations.join(" • ")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Book Taxi</h2>
                <p className="text-sm text-slate-500 mt-1">Affordable & reliable taxi service</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="space-y-4">
                  <div className="bg-white rounded-xl px-4 py-3 border border-slate-200">
                    <p className="text-xs text-slate-500 font-semibold mb-1">From</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <input type="text" placeholder="Srinagar Airport (SXR)" className="w-full text-sm font-medium focus:outline-none" />
                    </div>
                  </div>
                  
                  <div className="flex justify-center -my-3 relative z-10">
                    <div className="bg-white rounded-full p-1.5 border border-slate-200 shadow-sm text-slate-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3v18M7 3v18M3 7h18M3 17h18"/></svg>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl px-4 py-3 border border-slate-200">
                    <p className="text-xs text-slate-500 font-semibold mb-1">To</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <input type="text" placeholder="Dal Lake" className="w-full text-sm font-medium focus:outline-none" />
                    </div>
                  </div>
                </div>
                <ComingSoonButton className="w-full bg-[var(--primary)] text-white font-semibold py-3 rounded-xl mt-6 hover:bg-[var(--primary-hover)] transition-colors">
                  Search Taxi
                </ComingSoonButton>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* WanderKashmir Google Reviews Section */}
      {wkReviews && wkReviews.reviews && wkReviews.reviews.length > 0 && (
        <section className="py-20 bg-slate-50 border-t border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-72 h-72 bg-[var(--primary)]/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[var(--primary)] font-bold text-sm tracking-wider uppercase mb-2 block">What people say</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Loved by Travelers
              </h2>
              <p className="text-slate-600 text-lg">
                See why thousands of travelers choose WanderKashmir for their authentic Kashmiri experiences.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/40 p-4 sm:p-8 border border-slate-100">
              <GoogleReviewsList 
                reviews={wkReviews.reviews}
                rating={wkReviews.rating}
                totalRatings={wkReviews.userRatingsTotal}
                autoPlay={true}
              />
            </div>
          </div>
        </section>
      )}

      <PopularSeoRoutes />

      {activePromosRes.success && activePromosRes.promos && activePromosRes.promos.length > 0 && (
        <PromoPopup promos={activePromosRes.promos} />
      )}

      <Footer />
    </main>
  );
}
