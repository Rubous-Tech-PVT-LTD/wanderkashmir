"use server";

export async function getGooglePlaceReviews(placeId: string) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.warn("GOOGLE_PLACES_API_KEY is not set.");
      return null;
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`;
    
    const response = await fetch(url, {
      // Revalidate daily to keep reviews fresh but avoid unnecessary API cost
      next: { revalidate: 86400 } 
    });

    if (!response.ok) {
      console.error("Failed to fetch Google Places details", response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.status !== "OK") {
      console.error("Google Places API error:", data.status, data.error_message);
      return null;
    }

    return {
      rating: data.result.rating, // e.g., 4.5
      userRatingsTotal: data.result.user_ratings_total, // e.g., 128
      reviews: data.result.reviews || [] // Array of top 5 reviews
    };

  } catch (error) {
    console.error("Error in getGooglePlaceReviews:", error);
    return null;
  }
}
