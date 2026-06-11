import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import HeroCarousel from "@/components/HeroCarousel";
import Link from "next/link";
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
      include: { vendorProfile: true },
    });

    if (dbProperties.length > 0) {
      return dbProperties.map((p, i) => ({
        id: p.id,
        name: p.name,
        type: p.vendorProfile.type === "HOTEL" ? "Hotel" : "Homestay",
        location: p.location,
        price: p.pricePerNight,
        rating: 4.5 + Math.random() * 0.5,
        reviews: Math.floor(Math.random() * 150) + 10,
        image:
          (p as any).images && (p as any).images.length > 0
            ? (p as any).images[0]
            : (i % 2 === 0
              ? "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800"
              : "https://images.unsplash.com/photo-1605537964076-2cb0caf302d9?auto=format&fit=crop&q=80&w=800"),
        featured: true,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch properties:", error);
  }

  // Fallback to mock data if no properties in DB
  return featuredPropertiesMock;
}

async function getDestinationCounts() {
  try {
    const properties = await prisma.property.findMany({
      select: { location: true },
    });
    
    const counts: Record<string, number> = {
      srinagar: 0,
      gulmarg: 0,
      pahalgam: 0,
      sonamarg: 0,
      ladakh: 0,
    };

    properties.forEach(prop => {
      const loc = prop.location.toLowerCase();
      // Check if the vendor's location string contains our keywords
      if (loc.includes('srinagar') || loc.includes('dal lake')) counts.srinagar++;
      if (loc.includes('gulmarg') || loc.includes('tangmarg')) counts.gulmarg++;
      if (loc.includes('pahalgam') || loc.includes('chandanwari') || loc.includes('aru')) counts.pahalgam++;
      if (loc.includes('sonamarg') || loc.includes('gagangeer')) counts.sonamarg++;
      if (loc.includes('ladakh') || loc.includes('leh')) counts.ladakh++;
    });
    
    return counts;
  } catch (error) {
    console.error("Failed to fetch location counts:", error);
    return {};
  }
}


const destinations = [
  {
    name: "Srinagar",
    subtitle: "City of Lakes",
    count: "320+ stays",
    image:
      "https://res.cloudinary.com/dcmoseix9/image/upload/q_auto/f_auto/v1781184060/ChatGPT_Image_Jun_11_2026_06_50_39_PM_sagjr5.png",
    href: "/stays/srinagar",
  },
  {
    name: "Gulmarg",
    subtitle: "Meadow of Flowers",
    count: "85+ stays",
    image:
      "https://res.cloudinary.com/dcmoseix9/image/upload/q_auto/f_auto/v1781184317/ChatGPT_Image_Jun_11_2026_06_54_50_PM_rot3s8.png",
    href: "/stays/gulmarg",
  },
  {
    name: "Pahalgam",
    subtitle: "Valley of Shepherds",
    count: "140+ stays",
    image:
      "https://res.cloudinary.com/dcmoseix9/image/upload/q_auto/f_auto/v1781184496/ChatGPT_Image_Jun_11_2026_06_57_52_PM_ohjz8z.png",
    href: "/stays/pahalgam",
  },
  {
    name: "Sonamarg",
    subtitle: "Meadow of Gold",
    count: "60+ stays",
    image:
      "https://res.cloudinary.com/dcmoseix9/image/upload/q_auto/f_auto/v1781184714/ChatGPT_Image_Jun_11_2026_07_01_39_PM_lwcndk.png",
    href: "/stays/sonamarg",
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
    href: "/stays/ladakh",
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

export default async function HomePage() {
  const featuredProperties = await getFeaturedProperties();
  const locationCounts = await getDestinationCounts();

  // Fetch tours from DB
  let tours = await prisma.tour.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3
  });

  // Seed static tours if empty
  if (tours.length === 0) {
    for (const tour of popularTours) {
      await prisma.tour.create({
        data: {
          title: tour.title,
          slug: tour.slug,
          duration: tour.duration,
          destinations: tour.destinations,
          price: tour.price,
          category: tour.category,
          images: [tour.image],
          maxPersons: 2,
        }
      });
    }
    tours = await prisma.tour.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3
    });
  }

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
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative h-[100vh] md:h-[85vh] flex flex-col justify-center overflow-visible">
        {/* Background Image Carousel */}
        <HeroCarousel />

        {/* Hero Content */}
        <div className="relative z-10 container-custom mt-[-15vh] md:mt-[-5vh] text-left">
          <h1 className="text-[3rem] md:text-[4.5rem] font-bold text-white leading-[1.1] drop-shadow-xl tracking-tight mb-2">
            Discover <span className="text-orange-500">Paradise</span> <br className="hidden md:block" />
            <div className="font-['Dancing_Script'] text-[#38bdf8] font-normal drop-shadow-md mt-2 flex items-baseline justify-start gap-4">
              <span className="text-[2.5rem] md:text-[3.5rem]">in</span>
              <span className="text-[4.5rem] md:text-[6rem]">Kashmir</span>
            </div>
          </h1>
          <p className="text-white text-base md:text-lg font-medium drop-shadow-lg max-w-2xl tracking-wide mt-4 mb-6">
            Book Homestays, Hotels, Taxis & Tour Packages<br />
            <span className="font-normal opacity-90">Explore the Beauty of Heaven on Earth</span>
          </p>
          <Link 
            href="/partner" 
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/40 text-white px-6 py-3 rounded-full font-bold hover:bg-white hover:text-slate-900 transition-all shadow-lg"
          >
            Register your property
            <span>&rarr;</span>
          </Link>
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
                <img src={dest.image} alt={dest.name} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
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

      {/* ─── TOUR PACKAGES & TAXI ───────────────────────────────── */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Popular Tour Packages</h2>
                <p className="text-sm text-slate-500 mt-1">Curated packages for unforgettable experiences</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tours.map((tour) => (
                  <Link key={tour.id} href={`/tours/${tour.slug}`} className="group block relative h-72 overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <img src={tour.images[0] || ""} alt={tour.title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-md">
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
                
                <button className="w-full bg-[var(--primary)] text-white font-semibold py-3 rounded-xl mt-6 hover:bg-[var(--primary-hover)] transition-colors">
                  Search Taxi
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
