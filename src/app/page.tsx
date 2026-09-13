import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import HeroCarousel from "@/components/HeroCarousel";
import ComingSoonButton from "@/components/ComingSoonButton";
import CustomizeTourModal from "@/components/CustomizeTourModal";
import HeroTypewriter from "@/components/HeroTypewriter";
import { getValidImageUrl } from "@/lib/imageUtils";
import { Suspense } from "react";
import GoogleReviewsWrapper from "@/components/GoogleReviewsWrapper";
import PromoWrapper from "@/components/PromoWrapper";
import { getGooglePlaceReviews } from "@/actions/google-reviews";

// import PopularSeoRoutes from "@/components/PopularSeoRoutes";
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
  Sparkles,
  Sliders,
  PhoneCall,
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
  const [featuredProperties, locationCounts, featuredGuides, featuredTaxis] = await Promise.all([
    getFeaturedProperties(),
    getDestinationCounts(),
    getFeaturedGuides(),
    getFeaturedTaxis()
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
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              "name": "WanderKashmir",
              "image": "https://www.wanderkashmir.com/icon.jpg",
              "@id": "https://www.wanderkashmir.com",
              "url": "https://www.wanderkashmir.com",
              "telephone": "+91-6005888754",
              "priceRange": "$$",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Srinagar",
                "addressRegion": "JK",
                "addressCountry": "IN"
              },
              "description": "Book verified hotels, homestays, houseboats, taxi services and tour packages across Jammu & Kashmir."
            },
            {
              "@context": "https://schema.org",
              "@type": "VideoObject",
              "name": "Discover Kashmir - WanderKashmir Travel",
              "description": "Experience authentic Kashmir tours, village stays, local culture, and hidden travel experiences with WanderKashmir.",
              "thumbnailUrl": "https://res.cloudinary.com/dcmoseix9/video/upload/so_0,f_auto,q_auto/v1789298475/Hereovideomobile_gdy2nn.jpg",
              "uploadDate": "2026-09-13T00:00:00Z",
              "contentUrl": "https://res.cloudinary.com/dcmoseix9/video/upload/f_auto,q_auto/v1789298475/Hereovideomobile_gdy2nn.mp4"
            }
          ])
        }}
      />
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative h-[99vh] md:h-[95vh] flex flex-col justify-center overflow-visible">
        {/* Background Image Carousel */}
        <HeroCarousel />

        {/* ─── MOBILE ONLY: Hero Content (Video + H1 + Typewriter) ─── */}
        <div className="flex md:hidden relative z-10 container-custom text-center flex-col items-center justify-center px-4">
          <h1 className="text-white font-extrabold text-[1.05rem] sm:text-2xl tracking-tight drop-shadow-xl whitespace-nowrap leading-none">
            Kashmir&apos;s Largest Community of Travelers
          </h1>
          <HeroTypewriter />
        </div>

        {/* ─── DESKTOP ONLY: Original Hero Layout (Preserved 100%) ─── */}
        <div className="hidden md:flex relative z-10 container-custom text-center flex-col items-center justify-center pt-24 mt-12">
          <h1 className="sr-only">Discover the Real INDIA</h1>
          <p className="text-white text-base md:text-lg font-medium drop-shadow-lg max-w-2xl tracking-wide mt-4 mb-6">
            Authentic Village Stays • Local Culture • Hidden Experiences
          </p>
          <div className="flex flex-wrap justify-center items-center gap-3.5 mt-2">
            <CustomizeTourModal />
          </div>
        </div>

        {/* Floating Search Bar Overlap (Hidden per request - code preserved) */}
        {/*
        <div className="absolute -bottom-20 left-0 right-0 z-20 container-custom">
          <div className="max-w-5xl mx-auto">
            <SearchBar />
          </div>
        </div>
        */}
      </section>

      {/* ─── MOBILE ONLY: ACTION SECTION (Below Hero - Height Auto, Soft Saffron, Clickable & Workable) ─── */}
      <section className="block md:hidden h-auto bg-[#fff8f2] border-y border-[#fed7aa]/60 py-3 px-3.5 shadow-xs relative z-20">
        <CustomizeTourModal
          renderTrigger={(openModal) => (
            <div className="container-custom flex flex-col items-center gap-2.5">
              {/* 3 Clickable Action Cards: Google Reviews | Instagram | Call */}
              <div className="w-full grid grid-cols-3 gap-2">
                {/* 1. Google Reviews Badge (Exact screenshot design) */}
                <a
                  href="#reviews"
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-white/95 border border-orange-200/60 shadow-xs hover:bg-white active:scale-95 transition-all"
                >
                  {/* Google Multicolor G Logo */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <div className="flex flex-col text-left leading-none">
                    <div className="flex items-center gap-0.5">
                      <span className="text-amber-500 text-[11px] font-bold">★</span>
                      <span className="text-[11px] font-extrabold text-slate-800">4.9</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-medium mt-0.5">Reviews</span>
                  </div>
                </a>

                {/* 2. Instagram Link */}
                <a
                  href="https://www.instagram.com/wander____kashmir/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-white/95 border border-orange-200/60 shadow-xs hover:bg-white active:scale-95 transition-all"
                >
                  <div className="w-4 h-4 rounded-[4px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[11px] font-bold text-slate-800">Instagram</span>
                    <span className="text-[9px] text-slate-500 mt-0.5">@wander</span>
                  </div>
                </a>

                {/* 3. Call Us */}
                <a
                  href="tel:+916005888754"
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-white/95 border border-orange-200/60 shadow-xs hover:bg-white active:scale-95 transition-all"
                >
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-2.5 h-2.5" />
                  </div>
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[11px] font-bold text-slate-800">Call Us</span>
                    <span className="text-[9px] text-emerald-600 font-semibold mt-0.5">Instant</span>
                  </div>
                </a>
              </div>

              {/* Customization & Tailor-Made Trips Button */}
              <button
                type="button"
                onClick={openModal}
                className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-full shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                <span>Customization &amp; Tailor-Made Trips</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        />
      </section>

      {/* Spacing for floating search bar (Hidden while search bar is hidden) */}
      {/* <div className="h-32"></div> */}

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
      <Suspense fallback={null}>
        <GoogleReviewsWrapper placeId={wanderkashmirPlaceId} />
      </Suspense>

      {/* Popular Routes & Destinations (Hidden per request - code preserved) */}
      {/* <PopularSeoRoutes /> */}

      <Suspense fallback={null}>
        <PromoWrapper />
      </Suspense>

      <Footer />
    </main>
  );
}
