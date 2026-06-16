/**
 * Custom Cloudinary Image Loader for Next.js
 *
 * Cloudinary already delivers optimized images via q_auto,f_auto in the URL.
 * This loader detects Cloudinary URLs and serves them as-is (bypassing Next.js
 * Vercel Image Optimization), avoiding double-processing that delays LCP.
 *
 * For all other image sources (Unsplash, ibb.co, etc.) it returns the URL
 * with width appended for responsive delivery.
 */
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Cloudinary URLs — inject w_ and dpr_ transformations to get the right
  // size without double-processing by the Vercel edge.
  if (src.includes("res.cloudinary.com")) {
    // If the URL already contains /upload/, insert our transforms after it.
    if (src.includes("/upload/")) {
      // Strip any existing w_ or q_ transforms to avoid conflicts
      const parts = src.split("/upload/");
      const base = parts[0];
      const rest = parts[1].replace(/w_\d+,?/g, "").replace(/q_\d+,?/g, "");
      const transforms = `w_${width},q_${quality ?? "auto"},f_auto,dpr_auto`;
      return `${base}/upload/${transforms}/${rest}`;
    }
    return src;
  }

  // Unsplash — append width query param for responsive delivery
  if (src.includes("images.unsplash.com")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 80));
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    return url.toString();
  }

  // All other sources — return as-is
  return src;
}
