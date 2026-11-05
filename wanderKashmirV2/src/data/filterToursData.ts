export interface FilterTourInclusion {
  label: string;
  type: "hotel" | "cab" | "houseboat" | "meals" | "activities";
}

export interface FilterTourPackage {
  id: string;
  title: string;
  slug: string;
  duration: string; // e.g. "6 Days • 5 Nights"
  daysCount: number; // for filter logic
  nightsCount: number;
  badge?: string; // Single tag on image
  imageUrl: string;
  route: string[]; // ["Srinagar", "Gulmarg", "Pahalgam"]
  destinations: string[]; // for destination filter
  travelStyles: string[]; // ["Family", "Couples", "Adventure"]
  months: string[]; // ["All", "Mar", "Apr", "May", "Jun", etc.]
  rating: number;
  reviewsCount: number;
  inclusions: FilterTourInclusion[]; // 4 items (2x2)
  price: number;
  featured?: boolean;
}

export const FILTER_TOURS_CATALOG: FilterTourPackage[] = [
  {
    id: "cmq7osflh000b1657zhn016ok",
    title: "7 Days / 6 Nights Kashmir Tour Package",
    slug: "7-days-kashmir-tour-package",
    duration: "7 Days • 6 Nights",
    daysCount: 7,
    nightsCount: 6,
    badge: "Bestseller",
    imageUrl: "",
    route: ["Srinagar", "Gulmarg", "Pahalgam", "Sonamarg"],
    destinations: ["Srinagar", "Gulmarg", "Pahalgam", "Sonamarg"],
    travelStyles: ["Family", "Cultural", "Adventure"],
    months: ["All", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    rating: 4.8,
    reviewsCount: 412,
    inclusions: [
      { label: "Hotel & Houseboat", type: "hotel" },
      { label: "Private Cab", type: "cab" },
      { label: "Daily Meals", type: "meals" },
      { label: "Shikara Ride", type: "houseboat" },
    ],
    price: 10009,
    featured: true,
  },
  {
    id: "cmq7osefq000a16579nti4p57",
    title: "6 Days / 5 Nights Kashmir Tour Package",
    slug: "6-days-kashmir-tour-package",
    duration: "6 Days • 5 Nights",
    daysCount: 6,
    nightsCount: 5,
    badge: "Insta Pick",
    imageUrl: "",
    route: ["Srinagar", "Sonamarg", "Gulmarg", "Pahalgam"],
    destinations: ["Srinagar", "Sonamarg", "Gulmarg", "Pahalgam"],
    travelStyles: ["Adventure", "Family", "Cultural"],
    months: ["All", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
    rating: 4.8,
    reviewsCount: 320,
    inclusions: [
      { label: "Resort Stay", type: "hotel" },
      { label: "Private Cab", type: "cab" },
      { label: "Daily Meals", type: "meals" },
      { label: "Gondola Assist", type: "activities" },
    ],
    price: 8606,
    featured: true,
  },
  {
    id: "cmq7osd23000916572jea7hbh",
    title: "5 Days / 4 Nights Kashmir Tour Package",
    slug: "5-days-kashmir-tour-package",
    duration: "5 Days • 4 Nights",
    daysCount: 5,
    nightsCount: 4,
    badge: "Family Pick",
    imageUrl: "",
    route: ["Srinagar", "Gulmarg", "Pahalgam"],
    destinations: ["Srinagar", "Gulmarg", "Pahalgam"],
    travelStyles: ["Family", "Cultural"],
    months: ["All", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    rating: 4.8,
    reviewsCount: 295,
    inclusions: [
      { label: "Family Suites", type: "hotel" },
      { label: "Private Cab", type: "cab" },
      { label: "Daily Meals", type: "meals" },
      { label: "Houseboat Stay", type: "houseboat" },
    ],
    price: 7203,
  },
  {
    id: "cmvbb7qeu0002cjy4jpz793yv",
    title: "4 Days / 3 Nights Kashmir Tour Package",
    slug: "4-days-3-nights-kashmir-tour-package",
    duration: "4 Days • 3 Nights",
    daysCount: 4,
    nightsCount: 3,
    badge: "Best Value",
    imageUrl: "",
    route: ["Srinagar", "Gulmarg", "Pahalgam"],
    destinations: ["Srinagar", "Gulmarg", "Pahalgam"],
    travelStyles: ["Honeymoon", "Couples", "Cultural", "Family"],
    months: ["All", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    rating: 4.8,
    reviewsCount: 412,
    inclusions: [
      { label: "Deluxe Hotel", type: "hotel" },
      { label: "Private Cab", type: "cab" },
      { label: "Daily Breakfast", type: "meals" },
      { label: "Gondola Tour", type: "activities" },
    ],
    price: 5703,
  },
  {
    id: "cmvatadgp0002bjbs8ve7bvyo",
    title: "3 Days / 2 Nights Srinagar & Gulmarg Tour Package",
    slug: "3-days-2-nights-srinagar-gulmarg-tour-package",
    duration: "3 Days • 2 Nights",
    daysCount: 3,
    nightsCount: 2,
    badge: "Weekend Getaway",
    imageUrl: "",
    route: ["Srinagar", "Gulmarg"],
    destinations: ["Srinagar", "Gulmarg"],
    travelStyles: ["Solo", "Couples", "Adventure"],
    months: ["All", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    rating: 4.8,
    reviewsCount: 198,
    inclusions: [
      { label: "City Hotel", type: "hotel" },
      { label: "Private Sedan", type: "cab" },
      { label: "Breakfast & Dinner", type: "meals" },
      { label: "Dal Lake Shikara", type: "houseboat" },
    ],
    price: 4303,
  },
  {
    id: "cmuu45pa2000387bjbpmgs3wq",
    title: "2 Days / 1 Night Srinagar Tour Package",
    slug: "2-days-1-night-srinagar-tour-package",
    duration: "2 Days • 1 Night",
    daysCount: 2,
    nightsCount: 1,
    badge: "Quick Trip",
    imageUrl: "",
    route: ["Srinagar", "Dal Lake"],
    destinations: ["Srinagar"],
    travelStyles: ["Solo", "Cultural"],
    months: ["All", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    rating: 4.8,
    reviewsCount: 154,
    inclusions: [
      { label: "Cedar Houseboat", type: "houseboat" },
      { label: "Airport Cab", type: "cab" },
      { label: "Breakfast & Dinner", type: "meals" },
      { label: "Sunset Shikara", type: "activities" },
    ],
    price: 2875,
  },
];
