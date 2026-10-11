/**
 * Production Safe Cloudinary & Multi-Origin Image Loader for WanderKashmir V2.
 * Compatible with Next.js 16.
 *
 * Responsibilities:
 * 1. SVG Safety: Preserves SVGs without format transcoding (avoids rasterization).
 * 2. Cloudinary Edge Optimization: Injects responsive width and perceptual quality
 *    (w_${width},q_auto:good,f_auto) into res.cloudinary.com URLs, discarding any
 *    stale or stacked transformations.
 * 3. Unsplash Dynamic Optimization: Appends width, quality, and auto-format parameters.
 * 4. Other Origins: Passes Google avatars, local assets, and other external domains
 *    through untouched and safe.
 */

function isSvgUrl(url: string): boolean {
  try {
    const cleanUrl = url.split("?")[0].split("#")[0].toLowerCase();
    return cleanUrl.endsWith(".svg");
  } catch {
    return false;
  }
}

function isTransformDirective(part: string): boolean {
  if (!part) return false;
  const trimmed = part.trim();
  // Matches Cloudinary directives like w_1080, h_720, c_fill, q_auto:good, f_auto, ar_16:9, etc.
  return /^(?:[a-z]{1,3}_|q_auto|f_auto)/.test(trimmed);
}

function isTransformSegment(segment: string): boolean {
  if (!segment) return false;
  const parts = segment.split(",");
  return parts.length > 0 && parts.every(isTransformDirective);
}

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src || typeof src !== "string") {
    return src;
  }

  // 1. SVG SAFETY: Never transcode vector SVGs (preserve vector format without f_auto)
  if (isSvgUrl(src)) {
    return src;
  }

  // 2. CLOUDINARY ASSETS
  if (src.includes("res.cloudinary.com")) {
    if (!src.includes("/upload/")) {
      return src;
    }

    const [base, afterUpload] = src.split("/upload/");
    if (!afterUpload) {
      return src;
    }

    // Split path segments after /upload/ to safely identify content path vs old transforms
    const segments = afterUpload.split("/");
    let contentStart = 0;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];

      // A. Version segment (e.g., v1790176178 or v1) marks the exact start of content
      if (/^v\d+$/.test(seg)) {
        contentStart = i;
        break;
      }

      // B. If the segment is NOT a transformation directive, content starts here (unversioned asset)
      if (!isTransformSegment(seg)) {
        contentStart = i;
        break;
      }

      // If it IS a transform segment, skip it so we discard prior/stacked transformations
    }

    const contentPath = segments.slice(contentStart).join("/");
    if (!contentPath) {
      return src;
    }

    // Use q_auto:good by default for high visual fidelity in travel photography;
    // honor explicit non-default quality overrides if specified.
    const q = quality && quality !== 75 ? `q_${quality}` : "q_auto:good";
    const transforms = `w_${width},${q},f_auto`;

    return `${base}/upload/${transforms}/${contentPath}`;
  }

  // 3. UNSPLASH ASSETS
  if (src.includes("images.unsplash.com")) {
    try {
      const url = new URL(src);
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", String(quality ?? 80));
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      return url.toString();
    } catch {
      return src;
    }
  }

  // 4. OTHER ORIGINS & LOCAL / PUBLIC IMAGES (Google, i.ibb.co, aeplcdn, /images/..., etc.)
  return src;
}
