export interface TourItineraryDay {
  day: number | string;
  title: string;
  desc: string;
  activities?: string[];
  location?: string;
  stay?: string;
  meals?: string;
  image?: string;
}

export interface TourReviewItem {
  name: string;
  avatar: string;
  location: string;
  date: string;
  rating: number;
  text: string;
}

export interface TourStayItem {
  id: string;
  destination: string;
  nights: number;
  stayType?: string;
  displayOrder: number;
  propertyId?: string | null;
  name?: string | null;
  type?: string | null;
  location?: string | null;
  image?: string | null;
}

export interface TourTransportItem {
  id: string;
  origin: string;
  destination: string;
  purpose?: string | null;
  displayOrder: number;
  status?: string;
  vehicleId?: string | null;
  vehicle?: {
    id: string;
    make?: string | null;
    model: string;
    type?: string | null;
    registrationNum?: string | null;
    capacity?: number;
    images?: string[];
    vendorProfile?: {
      businessName?: string | null;
    } | null;
  } | null;
  driverId?: string | null;
  driver?: {
    id: string;
    name: string;
    status?: string;
  } | null;
}

export interface TourExperienceItem {
  id: string;
  experienceId: string;
  title: string;
  description?: string | null;
  destination: string;
  duration?: string | null;
  basePrice?: number | null;
  status: string;
  isOptional: boolean;
  dayNumber?: number | null;
  displayOrder: number;
}

export interface TourTravelGuideItem {
  id: string;
  guideId: string;
  title: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
  displayOrder: number;
}

export interface TourResolvedDestinationItem {
  name: string;
  slug?: string;
  hasPublicPage: boolean;
}

export interface TourPackageDetail {
  id: string;
  slug: string;
  title: string;
  duration: string;
  daysCount: number;
  nightsCount: number;
  badge?: string | null;
  category: "general" | "family" | "short-kashmir-trips" | "weekend-escape" | string;
  categoryDisplay?: string;
  destinations: string[];
  routeDisplay: string[];
  resolvedDestinations?: TourResolvedDestinationItem[];
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  overview: string;
  images: string[];
  whyThisRoute: string[];
  itinerary: TourItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  highlights: string[];
  reviewsList: TourReviewItem[];
  stays: TourStayItem[];
  transports?: TourTransportItem[];
  experiences?: TourExperienceItem[];
  travelGuides?: TourTravelGuideItem[];
  isLive: boolean;
  maxPersons: number;
}

export const TOUR_CATEGORIES = [
  { slug: "general", label: "General", description: "Comprehensive Kashmir circuits covering major valleys and highlights" },
  { slug: "family", label: "Family", description: "Leisurely paced itineraries crafted for families, kids, and seniors" },
  { slug: "short-kashmir-trips", label: "Short Kashmir Trips", description: "Compact 3 to 4 day trips covering core Himalayan destinations" },
  { slug: "weekend-escape", label: "Weekend Escape", description: "Quick 2-day micro-escapes on Dal Lake and Srinagar city" },
] as const;

export type TourCategorySlug = typeof TOUR_CATEGORIES[number]["slug"];

export function getCategoryLabel(categorySlug: string): string {
  const match = TOUR_CATEGORIES.find(c => c.slug === categorySlug.toLowerCase().trim());
  return match ? match.label : categorySlug;
}

export const LIVE_TOURS_CATALOG: TourPackageDetail[] = [
  {
    id: "cmq7osflh000b1657zhn016ok",
    slug: "7-days-complete-kashmir",
    title: "7 Days Tour - Complete Kashmir Experience",
    duration: "7D/6N",
    daysCount: 7,
    nightsCount: 6,
    badge: "Premium",
    category: "general",
    categoryDisplay: "General",
    destinations: ["Srinagar","Gulmarg","Pahalgam","Sonamarg"],
    routeDisplay: ["Srinagar","Gulmarg","Pahalgam","Sonamarg"],
    price: 23999,
    originalPrice: 31999,
    rating: 5,
    reviewsCount: 1,
    overview: "Experience the best of Kashmir with our 7 Days Complete Kashmir Experience package. Discover the enchanting beauty of Srinagar, Gulmarg, Sonamarg, and Pahalgam as you journey through breathtaking valleys, snow-capped mountains, pristine lakes, and lush meadows. Enjoy a relaxing Shikara ride on Dal Lake, explore the scenic landscapes of Gulmarg, witness the majestic beauty of Sonamarg, and immerse yourself in the natural charm of Pahalgam.",
    images: [],
    whyThisRoute: [],
    itinerary: [
      {
            "day": 1,
            "title": "Day 1: Arrival in Srinagar",
            "desc": "Airport pickup and hotel check-in\nVisit Mughal Gardens: Shalimar Bagh, Nishat Bagh\nExplore Dal Lake\nEvening Shikara Ride\nOvernight stay in Srinagar",
            "activities": []
      },
      {
            "day": 2,
            "title": "Day 2: Srinagar – Sonamarg – Srinagar",
            "desc": "Full-day excursion to Sonamarg\nVisit Thajiwas Glacier (optional pony ride)\nEnjoy Sindh Valley views\nReturn to Srinagar\nOvernight stay in Srinagar",
            "activities": []
      },
      {
            "day": 3,
            "title": "Day 3: Srinagar – Gulmarg",
            "desc": "Drive to Gulmarg\nEnjoy Gondola Ride (optional)\nVisit meadows and scenic viewpoints\nLeisure activities and photography\nOvernight stay in Gulmarg",
            "activities": []
      },
      {
            "day": 4,
            "title": "Day 4: Gulmarg – Pahalgam",
            "desc": "Drive to Pahalgam\nEn route visit saffron fields and apple orchards\nExplore local market\nOvernight stay in Pahalgam",
            "activities": []
      },
      {
            "day": 5,
            "title": "Day 5: Pahalgam Sightseeing",
            "desc": "Visit Betaab Valley\nVisit Aru Valley\nVisit Chandanwari\nEnjoy Lidder River views\nOvernight stay in Pahalgam",
            "activities": []
      },
      {
            "day": 6,
            "title": "Day 6: Pahalgam – Srinagar Houseboat",
            "desc": "Return to Srinagar\nFree time for shopping and local sightseeing\nStay in a traditional houseboat on Dal Lake\nOvernight stay in Houseboat",
            "activities": []
      },
      {
            "day": 7,
            "title": "Day 7: Departure",
            "desc": "Breakfast\nAirport drop\nTour concludes with unforgettable memories of Kashmir",
            "activities": []
      }
],
    inclusions: ["Airport Transfers","Comfortable Accommodation","Daily Breakfast & Dinner","Private Cab for Sightseeing","Houseboat Stay (1 Night)","Driver Allowance","Toll & Parking"],
    exclusions: ["Airfare/Train Fare","Gondola Tickets","Pony Rides","Personal Expenses","Entry Tickets."],
    highlights: ["Explore the beauty of Dal Lake with a traditional Shikara Ride","Visit the famous Mughal Gardens of Srinagar","Experience the snow-capped mountains and meadows of Gulmarg","Enjoy the world-famous Gulmarg Gondola Ride (optional)","Discover the breathtaking landscapes of Sonamarg","Explore the scenic valleys of Pahalgam","Visit the iconic Betaab Valley Aru Valley and Chandanwari","Enjoy a memorable overnight stay in a traditional Houseboat","Capture stunning views of mountains","rivers lakes","and valleysShop for authentic Kashmiri handicrafts dry fruits and souvenirs","Comfortable private cab with experienced local driver throughout the tour","Carefully selected hotels and houseboat accommodations","Daily Breakfast & Dinner Included","Perfect package for Families","Couples Honeymooners and Friends seeking a complete Kashmir experience"],
    reviewsList: [
      {
            "name": "WanderKashmir User",
            "avatar": "https://ui-avatars.com/api/?name=WanderKashmir User",
            "location": "India",
            "date": "June 2026",
            "rating": 5,
            "text": "Great Exp"
      }
],
    stays: [
      {
        id: "cmu9h3nq60001iexl9ocf04or",
        destination: "Srinagar",
        nights: 1,
        stayType: "Houseboat",
        displayOrder: 1,
        propertyId: "cmqxlru2w000414hu5ckg5vde",
        name: "Houseboat zogila",
        type: "Houseboat",
        location: "Nigeen lake | Private Houseboat",
        image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "cmu9h3p470003iexl3t0bg9vz",
        destination: "Srinagar",
        nights: 2,
        stayType: "Hotel",
        displayOrder: 2,
        propertyId: "cmrg3uuba0001kulxbc0dinds",
        name: "HOTEL LIEU D'AMOUR",
        type: "Hotel",
        location: "Sanat Nagar, Srinagar",
        image: "https://res.cloudinary.com/dcmoseix9/image/upload/v1783759098/ybzbxkfpw1ytyl7mea9q.jpg",
      },
      {
        id: "cmu9h3pz50005iexlxrklxsr6",
        destination: "Gulmarg",
        nights: 1,
        stayType: "Hotel",
        displayOrder: 3,
        propertyId: null,
        name: null,
        type: "Hotel",
        location: "Gulmarg Meadow",
        image: null,
      },
      {
        id: "cmu9h3qnv0007iexl934o8xn6",
        destination: "Pahalgam",
        nights: 2,
        stayType: "Hotel",
        displayOrder: 4,
        propertyId: "cmr8spc6x000111tfmrdr691a",
        name: "Pine palace Resort pahalgam",
        type: "Hotel",
        location: "Pahalgam Valley",
        image: "https://res.cloudinary.com/dcmoseix9/image/upload/v1783316377/iuioql5clpkniuaceycs.jpg",
      },
    ],
    transports: [
      {
        id: "cmu9t1nq60001trans01",
        origin: "Srinagar",
        destination: "Gulmarg",
        purpose: "Transfer & Sightseeing",
        displayOrder: 1,
        status: "ACTIVE",
        vehicleId: "cmrg5kn4g0001bdk98xs3g5fs",
        vehicle: {
          id: "cmrg5kn4g0001bdk98xs3g5fs",
          make: "",
          model: "Maruti Ertiga",
          type: "SUV",
          registrationNum: "JK05N0427",
          capacity: 4,
          images: [
            "https://res.cloudinary.com/dcmoseix9/image/upload/v1783761521/anxcsg5fg8pgvjcylw1e.jpg",
          ],
          vendorProfile: {
            businessName: "Rameez Raja",
          },
        },
        driverId: null,
        driver: null,
      },
      {
        id: "cmu9t2nq60002trans02",
        origin: "Gulmarg",
        destination: "Pahalgam",
        purpose: "Valley Transit",
        displayOrder: 2,
        status: "ACTIVE",
        vehicleId: null,
        vehicle: null,
        driverId: null,
        driver: null,
      },
      {
        id: "cmu9t3nq60003trans03",
        origin: "Pahalgam",
        destination: "Srinagar",
        purpose: "Return Transfer",
        displayOrder: 3,
        status: "ACTIVE",
        vehicleId: "cmqdqnyv00001njl6b8tv1ki0",
        vehicle: {
          id: "cmqdqnyv00001njl6b8tv1ki0",
          make: "",
          model: "Swift Dzire",
          type: "Sedan",
          registrationNum: "jk03n 2649",
          capacity: 4,
          images: [
            "https://res.cloudinary.com/dcmoseix9/image/upload/v1781438772/aghypht8nmhqp7eylg7x.jpg",
          ],
          vendorProfile: {
            businessName: "Shadil Hussain Shah",
          },
        },
        driverId: null,
        driver: null,
      },
    ],
    isLive: true,
    maxPersons: 9,
  },
  {
    id: "cmq7osefq000a16579nti4p57",
    slug: "6-days-tour-kashmir-explorer-package",
    title: "6 Days Tour – Kashmir Explorer Package",
    duration: "6D/5N",
    daysCount: 6,
    nightsCount: 5,
    badge: "Popular Explorer",
    category: "general",
    categoryDisplay: "General",
    destinations: ["Srinagar – Dal Lake","Mughal Gardens","Local Sightseeing Sonamarg – Meadows","Glacier Views & Sindh Valley Gulmarg – Gondola Ride","Scenic Meadows Pahalgam – Valleys","Lidder River","Local Attractions","Betaab Valley","Aru Valley","Chandanwar"],
    routeDisplay: ["Srinagar – Dal Lake","Mughal Gardens","Local Sightseeing Sonamarg – Meadows","Glacier Views & Sindh Valley Gulmarg – Gondola Ride","Scenic Meadows Pahalgam – Valleys","Lidder River","Local Attractions","Betaab Valley","Aru Valley","Chandanwar"],
    price: 18000,
    originalPrice: 28999,
    rating: 5,
    reviewsCount: 0,
    overview: "Discover the breathtaking beauty of Kashmir with our 6 Days Kashmir Explorer Package. Explore the stunning valleys of Srinagar, Gulmarg, Sonamarg, and Pahalgam while enjoying picturesque landscapes, snow-capped mountains, serene lakes, and authentic Kashmiri hospitality. Experience a relaxing Shikara ride on Dal Lake, visit the lush meadows of Gulmarg, witness the scenic beauty of Sonamarg, and explore the famous valleys of Pahalgam.\n\nPerfect for families, couples, honeymooners, and friends looking for a complete Kashmir experience in 6 days.",
    images: [],
    whyThisRoute: [],
    itinerary: [
      {
            "day": 1,
            "title": "Day 1: Arrival in Srinagar",
            "desc": "Airport pickup\nLocal sightseeing\nMughal Gardens visit\nShikara Ride on Dal Lake\nOvernight stay in Srinagar",
            "activities": []
      },
      {
            "day": 2,
            "title": "Day 2: Srinagar – Sonamarg – Srinagar",
            "desc": "Full-day excursion to Sonamarg\nThajiwas Glacier (optional)\nScenic sightseeing\nReturn to Srinagar\nOvernight stay in Srinagar",
            "activities": []
      },
      {
            "day": 3,
            "title": "Day 3: Srinagar – Gulmarg",
            "desc": "Transfer to Gulmarg\nGondola Ride (optional)\nLocal sightseeing\nOvernight stay in Gulmarg",
            "activities": []
      },
      {
            "day": 4,
            "title": "Day 4: Gulmarg – Pahalgam",
            "desc": "Transfer to Pahalgam\nEn-route saffron fields and apple orchards\nLeisure time\nOvernight stay in Pahalgam",
            "activities": []
      },
      {
            "day": 5,
            "title": "Day 5: Pahalgam Sightseeing",
            "desc": "Visit Betaab Valley\nVisit Aru Valley\nVisit Chandanwari\nLocal sightseeing\nOvernight stay in Pahalgam",
            "activities": []
      },
      {
            "day": 6,
            "title": "Day 6: Srinagar Departure",
            "desc": "Return to Srinagar\nAirport drop\nTour ends",
            "activities": []
      }
],
    inclusions: ["Airport pickup and drop-off","Private cab for all sightseeing and transfers","5 nights hotel accommodation","Daily breakfast and dinner","Srinagar local sightseeing","Sonamarg day excursion","Gulmarg sightseeing","Pahalgam sightseeing","Visit to Betaab Valley","Visit to Aru Valley","Visit to Chandanwari","Shikara ride on Dal Lake (if included)","Experienced driver","Driver allowance","Fuel charges","Toll taxes","Parking fees","All applicable transportation charges","24/7 travel assistance."],
    exclusions: ["Airfare or train tickets","Gondola ride tickets","Pony ride charges","Entry fees to parks and attractions","Lunch and personal meals","Personal expenses","Tips and gratuities","Travel insurance","Adventure activities","Camera or video fees","Laundry services","Room service charges","Any expenses arising due to weather conditions or road closures","Anything not mentioned under inclusions","GST (if applicable)."],
    highlights: ["Shikara ride on the iconic Dal Lake","Srinagar local sightseeing","Visit to Mughal Gardens","Full-day excursion to Sonamarg","Scenic views of Thajiwas Glacier","Gulmarg Gondola ride (optional)","Explore Gulmarg meadows and snow points","Visit Betaab Valley","Explore Aru Valley","Excursion to Chandanwari","Lidder River sightseeing","Private cab for the entire tour","Comfortable hotel accommodation","Daily breakfast and dinner","Perfect for families","couples and honeymooners","Experience authentic Kashmiri hospitality","Stunning mountain and valley landscapes","Airport pickup and drop-off services."],
    reviewsList: [],
    stays: [],
    isLive: true,
    maxPersons: 10,
  },
  {
    id: "cmq7osd23000916572jea7hbh",
    slug: "5-days-family-special",
    title: "5 Days Tour - Family Special Package",
    duration: "5D/4N",
    daysCount: 5,
    nightsCount: 4,
    badge: "Family Pick",
    category: "general",
    categoryDisplay: "General",
    destinations: ["Srinagar","Gulmarg","Pahalgam","Sonamarg"],
    routeDisplay: ["Srinagar","Gulmarg","Pahalgam","Sonamarg"],
    price: 13999,
    originalPrice: 15999,
    rating: 5,
    reviewsCount: 0,
    overview: "Enjoy a memorable 5-day family vacation in Kashmir, covering the beautiful destinations of Srinagar, Gulmarg, Pahalgam, and Sonamarg. Experience serene lakes, lush valleys, snow-capped mountains, and scenic landscapes while staying in comfortable family-friendly accommodations. This package is designed to provide a perfect blend of relaxation, sightseeing, and unforgettable experiences for families of all sizes.",
    images: [],
    whyThisRoute: [],
    itinerary: [
      {
            "day": 1,
            "title": "Day 1: Arrival in Srinagar",
            "desc": "Meet & greet at Srinagar Airport\nTransfer to hotel and check-in\nVisit Mughal Gardens\nExplore local markets\nEvening Shikara ride on Dal Lake\nOvernight stay in Srinagar",
            "activities": []
      },
      {
            "day": 2,
            "title": "Day 2: Srinagar – Sonamarg – Srinagar",
            "desc": "Breakfast at hotel\nFull-day excursion to Sonamarg\nEnjoy views of Sindh Valley and surrounding mountains\nVisit Thajiwas Glacier (optional pony ride)\nReturn to Srinagar\nOvernight stay in Srinagar",
            "activities": []
      },
      {
            "day": 3,
            "title": "Day 3: Srinagar – Gulmarg – Srinagar",
            "desc": "Breakfast at hotel\nDrive to Gulmarg\nExplore Gulmarg meadows\nEnjoy Gondola ride (optional)\nFamily leisure time and photography\nReturn to Srinagar\nOvernight stay in Srinagar",
            "activities": []
      },
      {
            "day": 4,
            "title": "Day 4: Srinagar – Pahalgam",
            "desc": "Breakfast at hotel\nDrive to Pahalgam\nEn-route visit saffron fields and apple orchards\nVisit Betaab Valley\nExplore Aru Valley\nOvernight stay in Pahalgam",
            "activities": []
      },
      {
            "day": 5,
            "title": "Day 5: Pahalgam – Srinagar Airport Drop",
            "desc": "Breakfast at hotel\nVisit Chandanwari and Lidder River viewpoints\nTransfer to Srinagar Airport\nDeparture with unforgettable family memories of Kashmir",
            "activities": []
      }
],
    inclusions: ["Airport pickup and drop-off","Private cab for all sightseeing and transfers","4 nights hotel accommodation","Daily breakfast and dinner","Srinagar local sightseeing","Sonamarg excursion","Gulmarg sightseeing","Pahalgam sightseeing","Visit to Betaab Valley","Visit to Aru Valley","Visit to Chandanwari","Experienced driver","Driver allowance","Fuel charges","Toll taxes","Parking fees","All transportation charges","24/7 travel assistance"],
    exclusions: ["Airfare or train tickets","Gondola ride tickets","Pony ride charges","Entry fees to parks and attractions","Lunch and personal meals","Personal expenses","Tips and gratuities","Travel insurance","Adventure activities","Camera or video fees","Laundry services","Room service charges","Expenses due to weather conditions or road closures","Anything not mentioned under inclusions","GST (if applicable)"],
    highlights: ["Shikara ride","Srinagar local sightseeing","Visit to Mughal Gardens","Full-day excursion to Sonamarg","Scenic views of Thajiwas Glacier","Explore Gulmarg meadows","Gulmarg Gondola ride (optional)","Family-friendly sightseeing experiences","Visit Betaab Valley","Explore Aru Valley","Visit Chandanwari","Lidder River sightseeing","Comfortable family accommodations","Private cab for the entire tour","Authentic Kashmiri hospitality","Airport pickup and drop-off","Perfect for families with kids and senior citizen"],
    reviewsList: [],
    stays: [],
    isLive: true,
    maxPersons: 8,
  },
  {
    id: "cmq7osc0n00081657222ldlek",
    slug: "4-days-srinagar-gulmarg-pahalgam",
    title: "4 Days Tour - Complete First-Timer",
    duration: "4D/3N",
    daysCount: 4,
    nightsCount: 3,
    badge: "Best Value",
    category: "short-kashmir-trips",
    categoryDisplay: "Short Kashmir Trips",
    destinations: ["Srinagar","Gulmarg","Pahalgam"],
    routeDisplay: ["Srinagar","Gulmarg","Pahalgam"],
    price: 11999,
    originalPrice: 18999,
    rating: 5,
    reviewsCount: 0,
    overview: "Discover three of Kashmir's most sought-after experiences in four days with our Srinagar, Gulmarg & Pahalgam Tour Package. This short Kashmir holiday is designed for first-time visitors who want a balanced introduction to the valley without extending their trip for a full week. Experience Srinagar's lakes and Mughal gardens, explore the mountain landscapes of Gulmarg and spend a full day surrounded by the valleys and rivers of Pahalgam. The itinerary is planned to cover the key destinations efficiently while keeping the journey comfortable.",
    images: [],
    whyThisRoute: [],
    itinerary: [
      {
            "day": "Day 1",
            "title": "Arrival in Srinagar & Srinagar Sightseeing",
            "desc": "Arrive in Srinagar, the gateway to Kashmir, and begin your holiday with a scenic introduction to the Valley. Explore Srinagar’s local attractions and enjoy the peaceful beauty surrounding Dal Lake. You can also opt for a relaxing Shikara ride across Dal Lake, offering beautiful views of floating gardens and traditional houseboats. Overnight stay in Srinagar",
            "activities": []
      },
      {
            "day": "Day 2",
            "title": "Srinagar to Pahalgam via Apple Valley",
            "desc": "After breakfast, depart from Srinagar for the picturesque hill destination of Pahalgam. Enjoy a scenic drive through Kashmir’s famous Apple Valley, with lush orchards and beautiful countryside along the route. Stop at scenic viewpoints near the Lidder River for photographs before arriving in Pahalgam. Spend the evening exploring the local market and riverside at leisure. Overnight stay in Pahalgam.",
            "activities": []
      },
      {
            "day": "Day 3",
            "title": "Day 3 — Pahalgam Local Sightseeing, Aru Valley & Betaab Valley",
            "desc": "After breakfast, explore the natural beauty of Pahalgam with a full-day sightseeing experience. Visit the serene Aru Valley, surrounded by pine forests and impressive mountain landscapes, followed by a visit to the lush green Betaab Valley. Enjoy the peaceful surroundings and views of the Lidder River flowing through the valley. A pony ride at Aru or Betaab Valley can be enjoyed as an optional activity at your own cost. Overnight stay in Pahalgam.",
            "activities": []
      },
      {
            "day": "Day 4",
            "title": "Pahalgam to Srinagar & Departure",
            "desc": "After breakfast, check out from your hotel in Pahalgam and begin your return journey to Srinagar. Enjoy the scenic drive through Kashmir and, depending on your available time, stop for some last-minute shopping or sightseeing. Upon reaching Srinagar, enjoy some free time before your onward journey. Later, proceed to Srinagar Airport or Railway Station for departure, taking back unforgettable memories of your Kashmir holiday.",
            "activities": []
      }
],
    inclusions: ["3 nights accommodation (1N Srinagar + 2N Pahalgam) on double/triple sharing basis","Daily breakfast at the hotel for all 4 days","Airport/railway station to hotel and hotel to airport/railway station transfers","All inter-city travel between Srinagar and Pahalgam","Local sightseeing transport as per the itinerary","All applicable toll charges","Parking charges","Daily breakfast and dinner","Driver charges","All currently applicable taxes"],
    exclusions: ["Airfare / train fare to and from Srinagar","Lunch and any meals not mentioned in inclusions","Horse/pony rides","pony charges at Aru & Betaab Valley (optional","direct payment)","Entry fees / camera fees at monuments and gardens","if any","Any personal expenses such as tips","laundry","phone calls","etc.","Anything not specifically mentioned under “Inclusions”","Dal Lake Shikara ride (approx. 1 hour) in Srinagar"],
    highlights: ["Shikara ride on the iconic Dal Lake","Gulmarg Gondola ride to 13","500 ft","Betaab Valley and Aru Valley day excursion"],
    reviewsList: [],
    stays: [],
    isLive: true,
    maxPersons: 12,
  },
  {
    id: "cmq7osays00071657xajx15yp",
    slug: "3-days-srinagar-gulmarg",
    title: "3 Days Tour - Srinagar & Gulmarg",
    duration: "3D/2N",
    daysCount: 3,
    nightsCount: 2,
    badge: "Most Popular",
    category: "short-kashmir-trips",
    categoryDisplay: "Short Kashmir Trips",
    destinations: ["Srinagar","Gulmarg"],
    routeDisplay: ["Srinagar","Gulmarg"],
    price: 8999,
    originalPrice: 10999,
    rating: 5,
    reviewsCount: 0,
    overview: "Our 3 Days Srinagar & Gulmarg Tour Package is designed for travellers who want to combine the cultural and scenic charm of Srinagar with the mountain landscapes of Gulmarg in a compact Kashmir holiday. The itinerary gives you time to explore Dal Lake and Srinagar's famous gardens before spending a full day discovering Gulmarg, with the option to experience the Gondola and seasonal mountain activities. It is a practical choice for couples, families and first-time visitors looking for a short Kashmir getaway.",
    images: [],
    whyThisRoute: [],
    itinerary: [
      {
            "day": "Day 1",
            "title": "Arrival in Srinagar & Srinagar Sightseeing",
            "desc": "Arrive at Srinagar Airport and meet your driver for a comfortable transfer to your accommodation.\n\nAfter check-in and some time to relax, begin your Srinagar sightseeing. Visit the famous Mughal Gardens, including Nishat Bagh, Shalimar Bagh and Chashme Shahi, subject to time and seasonal accessibility.\n\nLater, explore the Dal Lake and Boulevard area. You may enjoy a Shikara ride on Dal Lake as part of the evening experience, depending on weather and operating conditions.\n\nReturn to your accommodation for an overnight stay in Srinagar.\n\nOvernight: Srinagar",
            "activities": []
      },
      {
            "day": "Day 2",
            "title": "Full-Day Gulmarg Excursion",
            "desc": "After breakfast, depart for Gulmarg, one of Kashmir's most popular mountain destinations.\n\nEnjoy the scenic journey towards Gulmarg and spend the day exploring its meadows and mountain surroundings. During the appropriate season, guests can choose activities such as the Gulmarg Gondola, snow activities or other locally available experiences at additional cost and subject to weather/operational conditions.\n\nSpend time enjoying Gulmarg's landscape before returning to Srinagar in the evening.\n\nOvernight: Srinagar",
            "activities": []
      },
      {
            "day": "Day 3",
            "title": "Srinagar Morning & Departure",
            "desc": "After breakfast, enjoy some free time or visit a nearby Srinagar attraction depending on your departure schedule.\n\nLater, transfer to Srinagar Airport for your onward journey.\n\nTour ends with departure from Srinagar.",
            "activities": []
      }
],
    inclusions: ["Hotel","Meals","Taxi"],
    exclusions: [],
    highlights: ["Shikara ride on the iconic Dal Lake","Gulmarg Gondola ride to 13","500 ft","Betaab Valley and Aru Valley day excursion"],
    reviewsList: [],
    stays: [],
    isLive: true,
    maxPersons: 15,
  },
  {
    id: "cmq7os9jk000616573el6x5k6",
    slug: "2-days-quick-srinagar",
    title: "2 Days Tour - Quick Srinagar Getaway",
    duration: "2D/1N",
    daysCount: 2,
    nightsCount: 1,
    badge: "Weekend Escape",
    category: "weekend-escape",
    categoryDisplay: "Weekend Escape",
    destinations: ["Srinagar","Dal Lake"],
    routeDisplay: ["Srinagar","Dal Lake"],
    price: 6999,
    originalPrice: 8999,
    rating: 5,
    reviewsCount: 0,
    overview: "Make the most of a short Kashmir escape with our 2 Days Quick Srinagar Tour Package, designed for travellers who want to experience the highlights of Srinagar without committing to a longer itinerary. The trip combines Srinagar's scenic Dal Lake, Mughal-era gardens and local character with time to relax and enjoy the city's natural surroundings. It is ideal for a short weekend break, a stopover, couples, families or travellers with limited time in Kashmir.",
    images: [],
    whyThisRoute: [],
    itinerary: [
      {
            "day": "Day 1",
            "title": "Arrival in Srinagar & Local Sightseeing",
            "desc": "Arrive in Srinagar, the beautiful gateway to Kashmir, and begin your Kashmir holiday with a relaxing day of local sightseeing. Visit the iconic Dal Lake, enjoy a scenic Shikara ride, and explore the famous Mughal Gardens including Nishat Bagh and Shalimar Bagh. Experience Srinagar’s natural beauty, traditional Kashmiri culture, and picturesque landscapes while settling into your stay. Overnight stay in Srinagar.",
            "activities": []
      },
      {
            "day": "Day 2",
            "title": "Sonamarg Sightseeing & Departure",
            "desc": "After breakfast, proceed towards Sonamarg, the picturesque “Meadow of Gold” surrounded by snow-capped mountains and alpine landscapes. Enjoy the scenic drive through Kashmir’s beautiful countryside and explore the natural surroundings of Sonamarg. Spend some time taking in the mountain views and capturing memorable photographs before concluding your Kashmir trip with departure as per your travel schedule.",
            "activities": []
      }
],
    inclusions: ["Airport pickup and drop-off","Private vehicle for sightseeing and transfers","3-star hotel accommodation","Daily breakfast and dinner","Srinagar sightseeing","Sonamarg excursion","Sightseeing at destinations included in the selected itinerary","Experienced local driver","Driver allowance","Fuel charges","Toll taxes","Parking fees","Transportation charges","24/7 travel assistance","3-star package category covering accommodation","transportation and hospitality","Flexible pickup from Srinagar or Anantnag","Pickup from other locations available at additional cost depending on distance and location"],
    exclusions: ["Travel insurance","Airfare or train tickets","Lunch and other meals not mentioned in the package","Personal expenses","Laundry and telephone charges","Tips and gratuities","Entry fees to monuments","gardens and attractions","Shikara ride charges","Gondola ride charges in Gulmarg","Pony rides and horse riding","Adventure activities","Cable car or local sightseeing charges not specified in the itinerary","Additional sightseeing beyond the planned itinerary","Additional vehicle charges due to route changes or personal requirements","Expenses caused by weather conditions","road closures or unforeseen circumstances","Any services not specifically mentioned under inclusions"],
    highlights: ["Shikara ride","Srinagar local sightseeing","Visit to Mughal Gardens\nFull-day excursion to Sonamarg\nScenic views of Thajiwas Glacier\nExplore Gulmarg meadows\nGulmarg Gondola ride (optional)\nFamily-friendly sightseeing experiences\nVisit Betaab Valley\nExplore Aru Valley\nVisit Chandanwari\nLidder River sightseeing\nComfortable family accommodations\nPrivate cab for the entire tour\nAuthentic Kashmiri hospitality\nAirport pickup and drop-off\nPerfect for families with kids and senior citizen"],
    reviewsList: [],
    stays: [],
    isLive: true,
    maxPersons: 4,
  },
];

export function getTourBySlug(slug: string): TourPackageDetail | undefined {
  return LIVE_TOURS_CATALOG.find((t) => t.slug === slug);
}

export function getDefaultTour(): TourPackageDetail {
  return LIVE_TOURS_CATALOG[0];
}

export interface TourFilters {
  category?: string;
  duration?: string;
  destination?: string;
  maxPrice?: number;
  sort?: string;
}

export function filterLiveTours(filters: TourFilters): TourPackageDetail[] {
  let result = [...LIVE_TOURS_CATALOG];

  if (filters.category) {
    const targetCat = filters.category.toLowerCase().trim();
    if (targetCat !== "all") {
      result = result.filter(
        (t) => t.category.toLowerCase() === targetCat
      );
    }
  }

  if (filters.duration) {
    const dur = filters.duration.toLowerCase();
    if (dur.includes("weekend") || dur.includes("2")) {
      result = result.filter((t) => t.daysCount <= 2);
    } else if (dur.includes("short") || dur.includes("3") || dur.includes("4")) {
      result = result.filter((t) => t.daysCount >= 3 && t.daysCount <= 4);
    } else if (dur.includes("week") || dur.includes("5") || dur.includes("6") || dur.includes("7")) {
      result = result.filter((t) => t.daysCount >= 5);
    }
  }

  if (filters.destination) {
    const dest = filters.destination.toLowerCase().trim();
    result = result.filter((t) =>
      t.destinations.some((d) => d.toLowerCase().includes(dest))
    );
  }

  if (filters.maxPrice) {
    result = result.filter((t) => t.price <= filters.maxPrice!);
  }

  if (filters.sort) {
    switch (filters.sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "duration-asc":
        result.sort((a, b) => a.daysCount - b.daysCount);
        break;
      case "duration-desc":
        result.sort((a, b) => b.daysCount - a.daysCount);
        break;
      case "popular":
      default:
        result.sort((a, b) => b.rating - a.rating);
        break;
    }
  }

  return result;
}
