export interface TourInclusionItem {
  label: string;
  type: "hotel" | "cab" | "houseboat" | "meals" | "activities";
}

export interface PopularTourCard {
  id: string;
  title: string;
  slug: string;
  duration: string;
  badge: string;
  imageUrl: string; // If empty string, indicates image yet to be assigned
  destinations: string[];
  rating: number;
  reviewsCount: number;
  inclusions: TourInclusionItem[];
  price: number;
}
