const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const props = await prisma.property.findMany({
    where: { googlePlaceId: { not: null } },
    select: { name: true, googlePlaceId: true },
    take: 1
  });
  
  if (props.length === 0) {
    console.log("No properties with googlePlaceId found.");
    return;
  }
  
  const placeId = props[0].googlePlaceId;
  console.log(`Found place ID for ${props[0].name}: ${placeId}`);
  
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  console.log("Testing with API Key from .env");
  
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&reviews_sort=newest&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  console.log("Google API Response Status:", data.status);
  if (data.status !== "OK") {
    console.error("Google API Error:", data.error_message || "No error message provided");
  } else {
    console.log(`Success! Fetched ${data.result.reviews?.length || 0} reviews.`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
