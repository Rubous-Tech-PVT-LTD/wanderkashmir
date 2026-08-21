async function main() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = "ChIJN1t_tDeuEmsRUsoyG83frY4"; // Example Google Sydney Place ID
  
  console.log("Testing API Key:", apiKey.substring(0, 5) + "...");
  console.log("Using Place ID:", placeId);
  
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&reviews_sort=newest&key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log("Google API Response Status:", data.status);
    if (data.status !== "OK") {
      console.error("Error Message:", data.error_message);
    } else {
      console.log(`Success! Fetched ${data.result.reviews?.length || 0} reviews.`);
      console.log("Rating:", data.result.rating);
    }
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}
main();
