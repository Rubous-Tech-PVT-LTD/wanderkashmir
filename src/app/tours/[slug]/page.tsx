import prisma from "@/lib/prisma";
import TourDetailClient from "./TourDetailClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

const fallbackTourMap: Record<string, any> = {
  "kashmir-grand-tour": {
    id: "t1",
    slug: "kashmir-grand-tour",
    title: "Kashmir Grand Tour",
    duration: "7 Days / 6 Nights",
    destinations: ["Srinagar", "Gulmarg", "Pahalgam"],
    price: 28500,
    originalPrice: 32000,
    category: "Family",
    inclusions: ["Hotels & Houseboat", "Daily Breakfast & Dinner", "Private Cab", "Shikara Ride"],
    maxPersons: 6,
    badge: "Bestseller",
    images: ["https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=1200"],
    overview: "Experience the timeless beauty of Kashmir with our 7-day Grand Tour covering Srinagar, Gulmarg, and Pahalgam.",
    highlights: ["Shikara ride on Dal Lake", "Gondola cable car ride in Gulmarg", "Aru and Betaab valleys in Pahalgam"],
    exclusions: ["Airfare", "Personal expenses", "Tips"],
    itinerary: [
      { day: 1, title: "Arrival in Srinagar & Dal Lake Shikara Ride", description: "Arrive at Srinagar Airport, transfer to luxury houseboat, enjoy sunset shikara." },
      { day: 2, title: "Srinagar to Gulmarg Day Trip", description: "Scenic drive to Gulmarg, take the Gondola ride to Apharwat Peak." },
      { day: 3, title: "Srinagar to Pahalgam (Valley of Shepherds)", description: "Drive along saffron fields, visit Avantipur ruins, check-in at Pahalgam." },
      { day: 4, title: "Explore Aru & Betaab Valleys", description: "Full day excursion to scenic Aru valley, Betaab valley, and Chandanwari." },
      { day: 5, title: "Pahalgam to Srinagar & Mughal Gardens", description: "Return to Srinagar, visit Nishat Bagh, Shalimar Bagh, and Chashme Shahi." },
      { day: 6, title: "Day Excursion to Sonamarg (Meadow of Gold)", description: "Visit Thajiwas glacier and Sind river in Sonamarg, return to Srinagar." },
      { day: 7, title: "Departure from Srinagar Airport", description: "Breakfast, souvenir shopping at Lal Chowk, transfer to airport for onward journey." }
    ],
    reviews: []
  },
  "gulmarg-ski-adventure": {
    id: "t2",
    slug: "gulmarg-ski-adventure",
    title: "Gulmarg Ski Adventure",
    duration: "4 Days / 3 Nights",
    destinations: ["Gulmarg", "Srinagar"],
    price: 18900,
    originalPrice: 22000,
    category: "Adventure",
    inclusions: ["Ski Resort Stay", "Gondola Phase 1 & 2 Passes", "Ski Equipment", "Local Instructor"],
    maxPersons: 4,
    badge: "Adventure",
    images: ["https://images.unsplash.com/photo-1606115915090-be18fea23ec7?w=1200&q=80"],
    overview: "Experience the powdery snow and world-class skiing slopes in Gulmarg with certified local instructors.",
    highlights: ["Gondola Phase 2 to 13,780 ft", "Skiing and snowboarding lessons", "Stay amidst snow-covered pines"],
    exclusions: ["Airfare", "Extreme sports insurance"],
    itinerary: [
      { day: 1, title: "Arrival & Transfer to Gulmarg", description: "Airport pickup and drive up to snowbound Gulmarg." },
      { day: 2, title: "Ski Lessons & Gondola Phase 1", description: "Morning ski tutorial, afternoon freeride." },
      { day: 3, title: "Gondola Phase 2 & Backcountry Skiing", description: "Summit Apharwat peak for panoramic Himalayan views." },
      { day: 4, title: "Departure", description: "Morning scenic drive to Srinagar airport." }
    ],
    reviews: []
  },
  "kashmir-honeymoon-special": {
    id: "t3",
    slug: "kashmir-honeymoon-special",
    title: "Kashmir Honeymoon Special",
    duration: "6 Days / 5 Nights",
    destinations: ["Srinagar", "Pahalgam", "Sonamarg"],
    price: 45000,
    originalPrice: 50000,
    category: "Honeymoon",
    inclusions: ["Luxury Dal Lake Houseboat", "Candlelight Dinner", "Flower Bed Decoration", "Private Transfers"],
    maxPersons: 2,
    badge: "Honeymoon",
    images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80"],
    overview: "A romantic fairytale getaway with candlelit dinners on Dal Lake, scenic walks in Pahalgam, and breathtaking mountain vistas.",
    highlights: ["Special honeymoon houseboat suite", "Candlelight dinner by the lake", "Private vehicle throughout"],
    exclusions: ["Airfare", "Personal purchases"],
    itinerary: [
      { day: 1, title: "Arrival & Romantic Shikara Sunset", description: "Welcome to Srinagar with flower bouquet and private shikara ride." },
      { day: 2, title: "Srinagar to Pahalgam Romance in Pines", description: "Private luxury cab to Pahalgam with stops at apple orchards." },
      { day: 3, title: "Betaab Valley & Candlelight Dinner", description: "Visit scenic Bollywood locations and private candlelight dinner." },
      { day: 4, title: "Sonamarg Glaciers", description: "Breathtaking landscapes of Sonamarg with pony ride to Thajiwas." },
      { day: 5, title: "Srinagar Heritage & Mughal Romance", description: "Heritage walk in Old Srinagar and evening shopping." },
      { day: 6, title: "Warm Farewell", description: "Drop at Srinagar Airport with sweet memories." }
    ],
    reviews: []
  }
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let tour = await prisma.tour.findUnique({ where: { slug } }).catch(() => null);
  if (!tour) tour = fallbackTourMap[slug];
  
  if (!tour) return { title: "Tour Not Found | WanderKashmir" };
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wanderkashmir.com';
  const url = `${baseUrl}/tours/${slug}`;
  const images = tour.images && tour.images.length > 0 ? tour.images : ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80"];
  const description = tour.overview ? `${tour.overview.substring(0, 150)}...` : `Book the ${tour.title} (${tour.duration}) with WanderKashmir. Best price guaranteed.`;

  return {
    title: `${tour.title} (${tour.duration}) | Best Kashmir Tour Package`,
    description,
    keywords: [
      ...(Array.isArray(tour.destinations) ? tour.destinations : []),
      "Kashmir Tour Package",
      `${tour.category || 'Custom'} Tour Kashmir`,
      "WanderKashmir Tours",
      tour.title,
      "Kashmir Holiday Itinerary"
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${tour.title} | WanderKashmir`,
      description,
      url,
      siteName: "WanderKashmir",
      images: images.map(imgUrl => ({ url: imgUrl })),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${tour.title} | WanderKashmir`,
      description,
      images: [images[0]],
    }
  };
}

export const revalidate = 60;

export default async function TourPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let tour: any = await prisma.tour.findUnique({
    where: { slug },
    include: {
      reviews: {
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  }).catch(() => null);

  if (!tour) {
    tour = fallbackTourMap[slug];
  }

  if (!tour) {
    notFound();
  }

  // Calculate rating
  const reviewCount = tour.reviews.length;
  const averageRating = reviewCount > 0 
    ? (tour.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
    : "0.0";

  // Format reviews for client
  const formattedTour = {
    ...tour,
    rating: averageRating,
    reviews: reviewCount,
    reviewsList: tour.reviews.map(r => ({
      name: r.user?.name || "Anonymous",
      avatar: r.user?.image || "https://ui-avatars.com/api/?name=" + (r.user?.name || "A"),
      location: "India", // Placeholder as location isn't in User model
      date: r.createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      rating: r.rating,
      text: r.comment || ""
    }))
  };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wanderkashmir.com';
  const itineraryList = Array.isArray(tour.itinerary) ? (tour.itinerary as any[]).map((day: any, idx: number) => ({
    "@type": "TouristAttraction",
    "name": `Day ${idx + 1}: ${day.title || day.day || "Kashmir Tour"}`,
    "description": day.desc || day.description || ""
  })) : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Tours",
            "item": `${baseUrl}/tours`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": tour.title,
            "item": `${baseUrl}/tours/${slug}`
          }
        ]
      },
      {
        "@type": ["Product", "TouristTrip"],
        "name": tour.title,
        "description": tour.overview || `Experience ${tour.title} with WanderKashmir.`,
        "image": tour.images && tour.images.length > 0 ? tour.images : ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80"],
        "touristType": [tour.category, "Leisure", "Family", "Adventure"],
        "url": `${baseUrl}/tours/${slug}`,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "INR",
          "price": tour.price,
          "availability": "https://schema.org/InStock",
          "url": `${baseUrl}/tours/${slug}`
        },
        "provider": {
          "@type": "TravelAgency",
          "name": "WanderKashmir",
          "url": baseUrl
        },
        ...(itineraryList.length > 0 && { "itinerary": itineraryList }),
        ...(reviewCount > 0 && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": averageRating,
            "reviewCount": reviewCount
          },
          "review": tour.reviews.map((r: any) => ({
            "@type": "Review",
            "author": {
              "@type": "Person",
              "name": r.user?.name || "Anonymous"
            },
            "datePublished": r.createdAt.toISOString().split('T')[0],
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": r.rating,
              "bestRating": "5",
              "worstRating": "1"
            },
            "reviewBody": r.comment || ""
          }))
        })
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TourDetailClient initialTour={formattedTour} />
    </>
  );
}
