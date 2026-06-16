/**
 * Custom Cloudinary Image Loader for Next.js
 *
 * CRITICAL BUG FIXED: The previous version used `dpr_auto` alongside `w_{width}`.
 * Next.js already accounts for device pixel ratio when calculating `width`
 * (e.g., it requests w=750 for a 375px viewport at 2× DPR). Adding `dpr_auto`
 * on top of that caused Cloudinary to multiply the image size a second time,
 * serving 1500–2250px images on mobile — a 3–4× payload penalty that was the
 * primary cause of LCP=4.1s on mobile.
 *
 * HOW THIS LOADER WORKS:
 * 1. For Cloudinary URLs: strips all existing transforms from the URL path,
 *    then injects `w_{width},q_auto,f_auto` to get correctly sized, auto-format
 *    images without double-processing by the Vercel edge.
 *
 * 2. For Unsplash URLs: appends `w` and `q` query params.
 *
 * 3. For all other sources: returns the URL unchanged.
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
  if (src.includes("res.cloudinary.com")) {
    if (!src.includes("/upload/")) return src;

    const [base, afterUpload] = src.split("/upload/");

    // Extract only the version segment + filename, discarding any existing
    // transforms. Cloudinary version segments look like "v1781182033/...".
    // If no version, fall back to using everything after the last transform.
    //
    // Strategy: find the first segment that starts with "v" followed by digits,
    // OR the first segment that looks like a file path (contains a dot).
    const segments = afterUpload.split("/");
    let contentStart = 0;
    for (let i = 0; i < segments.length; i++) {
      // Version segment: v followed by 8+ digits
      if (/^v\d{8,}$/.test(segments[i])) {
        contentStart = i;
        break;
      }
      // File segment: contains a file extension
      if (segments[i].includes(".")) {
        contentStart = i;
        break;
      }
    }

    const contentPath = segments.slice(contentStart).join("/");
    const transforms = `w_${width},q_auto:eco,f_auto`;

    // contentPath already includes the version segment (e.g. v1781182033/filename.png)
    return `${base}/upload/${transforms}/${contentPath}`;
  }

  // Unsplash — append width + quality query params
  if (src.includes("images.unsplash.com")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 80));
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    return url.toString();
  }

  // All other sources — pass through unchanged
  return src;
}
