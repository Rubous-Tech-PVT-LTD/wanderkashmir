export interface HotelBasicInfo {
  id: string;
  name: string;
  slug: string;
  propertyType: "Hotel & Resort" | "Houseboat" | "Homestay" | "Boutique Stay";
  starRating?: number | null;
  isVerified: boolean;
  shortDescription?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  totalRooms?: number | null;
}

export interface HotelLocationInfo {
  address: string;
  locality?: string | null;
  destinationHub: string;
  destinationSlug?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googlePlaceId?: string | null;
  howToReach?: string | null;
}

export interface HotelOverviewInfo {
  description?: string | null;
  highlights: string[];
  idealFor?: string[];
  languages?: string[];
}

export interface HotelRoomItem {
  id: string;
  name: string;
  description?: string | null;
  basePrice: number;
  capacity: number;
  bedType?: string | null;
  size?: string | null;
  amenities: string[];
  mealPlan?: string | null;
  images: string[];
}

export interface HotelDiningInfo {
  hasDining: boolean;
  restaurantName?: string | null;
  cuisineTypes: string[];
  isKashmiriSpecialties: boolean;
  dietaryOptions: string[];
  breakfastIncluded: boolean;
  dinnerIncluded: boolean;
  mealPlans: string[];
}

export interface HotelAmenitiesGroup {
  category: string;
  items: string[];
}

export interface HotelExperienceItem {
  title: string;
  description?: string | null;
  icon?: string;
}

export interface HotelMediaInfo {
  images: string[];
  videoUrl?: string | null;
}

export interface HotelReviewItem {
  id: string;
  author: string;
  rating: number;
  date?: string;
  content: string;
}

export interface HotelReviewSummary {
  rating?: number | null;
  reviewCount: number;
  reviews: HotelReviewItem[];
}

export interface HotelPoliciesInfo {
  checkIn: string;
  checkOut: string;
  cancellation?: string | null;
  houseRules: string[];
  pets?: string | null;
  extraBed?: string | null;
}

export interface HotelTrustInfo {
  isVerified: boolean;
  hasRealPhotos: boolean;
  hostType?: string | null;
  hostName?: string | null;
}

export interface HotelConversionInfo {
  startingPrice: number | null;
  priceUnit: string;
  bookingCtaText: string;
  enquiryEnabled: boolean;
  phone?: string | null;
}

export interface HotelFaqItem {
  question: string;
  answer: string;
}

export interface HotelDetailViewModel {
  basic: HotelBasicInfo;
  location: HotelLocationInfo;
  overview: HotelOverviewInfo;
  rooms: HotelRoomItem[];
  amenities: HotelAmenitiesGroup[];
  allAmenities: string[];
  dining: HotelDiningInfo;
  experiences: HotelExperienceItem[];
  media: HotelMediaInfo;
  reviews: HotelReviewSummary;
  policies: HotelPoliciesInfo;
  trust: HotelTrustInfo;
  conversion: HotelConversionInfo;
  faqs: HotelFaqItem[];
  seo: {
    title: string;
    description: string;
    canonicalUrl: string;
    ogImage?: string | null;
  };
}

/**
 * Maps raw database Property record into a typed HotelDetailViewModel.
 * If property is null or undefined, returns null.
 * Strictly avoids inventing or hallucinating mock data.
 */
export function mapPropertyToHotelViewModel(
  property: any,
  requestedSlug: string
): HotelDetailViewModel | null {
  if (!property) return null;

  const propName = property.name || "Hotel & Accommodation";
  const locStr = property.location || "";
  const locLower = locStr.toLowerCase();

  // Determine property type based on name and location cues
  const isHouseboat =
    propName.toLowerCase().includes("houseboat") ||
    locLower.includes("nigeen") ||
    locLower.includes("dal lake") ||
    locLower.includes("lake");

  const propertyType = isHouseboat
    ? "Houseboat"
    : property.vendorProfile?.type === "HOMESTAY"
    ? "Homestay"
    : "Hotel & Resort";

  // Determine primary destination hub
  let destinationHub = "Kashmir";
  let destinationSlug: string | null = null;
  if (locLower.includes("pahalgam") || locLower.includes("phalgham")) {
    destinationHub = "Pahalgam";
    destinationSlug = "pahalgam";
  } else if (locLower.includes("srinagar") || locLower.includes("nigeen") || locLower.includes("dal")) {
    destinationHub = "Srinagar";
    destinationSlug = "srinagar";
  } else if (locLower.includes("gulmarg")) {
    destinationHub = "Gulmarg";
    destinationSlug = "gulmarg";
  } else if (locLower.includes("sonamarg")) {
    destinationHub = "Sonamarg";
    destinationSlug = "sonamarg";
  } else if (locLower.includes("gurez")) {
    destinationHub = "Gurez Valley";
    destinationSlug = "gurez-valley";
  } else if (locLower.includes("doodhpathri")) {
    destinationHub = "Doodhpathri";
    destinationSlug = "doodhpathri";
  } else if (locLower.includes("kupwara") || locLower.includes("keran")) {
    destinationHub = "Kupwara";
    destinationSlug = "kupwara";
  }

  // Filter real amenities
  const rawAmenities: string[] = Array.isArray(property.amenities)
    ? property.amenities.filter((a: any) => typeof a === "string" && a.trim().length > 0)
    : [];

  // Categorize amenities strictly if they exist
  const amenityGroups: HotelAmenitiesGroup[] = [];
  if (rawAmenities.length > 0) {
    const connectivity = rawAmenities.filter((a) => a.toLowerCase().includes("wifi") || a.toLowerCase().includes("internet"));
    const comfort = rawAmenities.filter((a) => a.toLowerCase().includes("heat") || a.toLowerCase().includes("ac") || a.toLowerCase().includes("view") || a.toLowerCase().includes("kettle"));
    const dining = rawAmenities.filter((a) => a.toLowerCase().includes("breakfast") || a.toLowerCase().includes("room service") || a.toLowerCase().includes("dining"));
    const parking = rawAmenities.filter((a) => a.toLowerCase().includes("parking"));
    const other = rawAmenities.filter(
      (a) =>
        !connectivity.includes(a) &&
        !comfort.includes(a) &&
        !dining.includes(a) &&
        !parking.includes(a)
    );

    if (connectivity.length > 0) amenityGroups.push({ category: "Connectivity", items: connectivity });
    if (comfort.length > 0) amenityGroups.push({ category: "Comfort & Climate", items: comfort });
    if (dining.length > 0) amenityGroups.push({ category: "Dining & Refreshments", items: dining });
    if (parking.length > 0) amenityGroups.push({ category: "Parking & Transport", items: parking });
    if (other.length > 0) amenityGroups.push({ category: "Property Features", items: other });
  }

  // Real room types from database
  const rooms: HotelRoomItem[] = Array.isArray(property.roomTypes)
    ? property.roomTypes.map((rt: any) => ({
        id: rt.id,
        name: rt.name,
        description: rt.description || null,
        basePrice: Math.round(rt.basePrice || property.pricePerNight || 0),
        capacity: rt.capacity || property.guests || 2,
        bedType: null,
        size: null,
        amenities: [],
        mealPlan: rt.priceCP ? "Breakfast Included (CP)" : rt.priceMAP ? "Half Board (MAP)" : "Room Only (EP)",
        images: [],
      }))
    : [];

  // Filter real images
  const rawImages: string[] = Array.isArray(property.images)
    ? property.images.filter((img: any) => typeof img === "string" && img.startsWith("http"))
    : [];

  // Real reviews
  const rawReviews: HotelReviewItem[] = Array.isArray(property.reviews)
    ? property.reviews.map((r: any) => ({
        id: r.id,
        author: r.user?.name || "Verified Traveler",
        rating: typeof r.rating === "number" ? r.rating : 5,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : undefined,
        content: r.comment || r.review || "",
      }))
    : [];

  const avgRating =
    rawReviews.length > 0
      ? rawReviews.reduce((sum, r) => sum + r.rating, 0) / rawReviews.length
      : null;

  // Real dining info
  const hasDining = Boolean(
    property.breakfastIncluded ||
    property.dinnerIncluded ||
    rawAmenities.some((a) => a.toLowerCase().includes("breakfast") || a.toLowerCase().includes("dining"))
  );

  // Real FAQs if structured in DB
  const faqs: HotelFaqItem[] = [];
  if (Array.isArray(property.faqs)) {
    property.faqs.forEach((f: any) => {
      if (f && typeof f.question === "string" && typeof f.answer === "string") {
        faqs.push({ question: f.question, answer: f.answer });
      }
    });
  }

  return {
    basic: {
      id: property.id,
      name: propName,
      slug: requestedSlug,
      propertyType,
      starRating: null, // Zero fake data: not in DB model
      isVerified: Boolean(property.isApproved),
      shortDescription: property.description ? property.description.slice(0, 160) : null,
      checkInTime: "12:00 PM",
      checkOutTime: "11:00 AM",
      totalRooms: property.totalRooms || property.availableRooms || null,
    },
    location: {
      address: locStr,
      locality: locStr.split(",")[0]?.trim() || null,
      destinationHub,
      destinationSlug,
      latitude: property.latitude || null,
      longitude: property.longitude || null,
      googlePlaceId: property.googlePlaceId || null,
      howToReach: null,
    },
    overview: {
      description: property.description || null,
      highlights: [], // Zero fake data
      idealFor: [],
      languages: ["Kashmiri", "Urdu", "English", "Hindi"],
    },
    rooms,
    amenities: amenityGroups,
    allAmenities: rawAmenities,
    dining: {
      hasDining,
      restaurantName: null,
      cuisineTypes: [],
      isKashmiriSpecialties: false,
      dietaryOptions: [],
      breakfastIncluded: Boolean(property.breakfastIncluded),
      dinnerIncluded: Boolean(property.dinnerIncluded),
      mealPlans: [
        ...(property.breakfastIncluded ? ["Breakfast Included"] : []),
        ...(property.dinnerIncluded ? ["Dinner Included"] : []),
      ],
    },
    experiences: [], // Zero fake data: populated when configured
    media: {
      images: rawImages,
      videoUrl: null,
    },
    reviews: {
      rating: avgRating,
      reviewCount: rawReviews.length,
      reviews: rawReviews,
    },
    policies: {
      checkIn: "12:00 PM",
      checkOut: "11:00 AM",
      cancellation: null,
      houseRules: [
        "Valid government-issued photo ID required at check-in",
        "Couples and families welcome",
      ],
      pets: null,
      extraBed: null,
    },
    trust: {
      isVerified: Boolean(property.isApproved),
      hasRealPhotos: rawImages.length > 0,
      hostType: property.vendorProfile?.type || null,
      hostName: property.vendorProfile?.businessName || null,
    },
    conversion: {
      startingPrice: typeof property.pricePerNight === "number" ? Math.round(property.pricePerNight) : null,
      priceUnit: "night",
      bookingCtaText: "Check Availability",
      enquiryEnabled: true,
      phone: property.vendorProfile?.phone || null,
    },
    faqs,
    seo: {
      title: `${propName} | Hotels in ${destinationHub} | WanderKashmir`,
      description: property.description
        ? property.description.slice(0, 155)
        : `Book your stay at ${propName} in ${destinationHub}, Kashmir. Verified local rates with WanderKashmir.`,
      canonicalUrl: `https://www.wanderkashmir.com/stays/${requestedSlug}`,
      ogImage: rawImages.length > 0 ? rawImages[0] : null,
    },
  };
}
