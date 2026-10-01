export const getValidImageUrl = (images: string[] | undefined | null, fallback = "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800") => {
  if (!images || !Array.isArray(images) || images.length === 0) return fallback;
  
  // Find first non-video image
  const firstImage = images.find(url => typeof url === 'string' && !url.includes("/video/upload/") && !/\.(mp4|webm|mov|ogg|avi|mkv)$/i.test(url));
  
  if (firstImage) return firstImage;
  
  // If only videos exist, try to convert cloudinary video URL to jpg thumbnail
  const firstVid = images[0];
  if (typeof firstVid === 'string' && firstVid.includes("res.cloudinary.com") && firstVid.includes("/video/upload/")) {
    return firstVid.replace("/video/upload/", "/image/upload/").replace(/\.(mp4|webm|mov|ogg|avi|mkv)$/i, ".jpg");
  }

  return fallback;
};
