/**
 * WanderKashmir V2 - Places Gallery Data Contract & Runtime Validation
 * 
 * Enforces strict typing, domain whitelisting, URL safety, alt-text sanitization,
 * order normalization, and JSON payload serialization for Place galleries.
 */

export interface GalleryImageItem {
  url: string;
  alt: string;
  caption?: string | null;
  order: number;
  isFeatured?: boolean;
}

export interface GalleryValidationResult {
  valid: boolean;
  data: GalleryImageItem[];
  errors: string[];
}

/** Allowed image hostnames aligned with Next.js remotePatterns and trusted CDNs */
const ALLOWED_IMAGE_HOSTS = new Set([
  "res.cloudinary.com",
  "images.unsplash.com",
  "i.ibb.co",
  "imgd.aeplcdn.com",
  "randomuser.me",
  "lh3.googleusercontent.com",
  "wanderkashmir.com",
  "www.wanderkashmir.com",
]);

/**
 * Validates whether a URL is secure and matches allowed domains or relative static paths.
 */
export function isValidImageUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== "string") {
    return false;
  }

  const trimmed = urlStr.trim();

  // Relative path (e.g., /images/nishat.jpg)
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return !trimmed.includes("<") && !trimmed.includes(">") && !trimmed.includes('"');
  }

  try {
    const parsed = new URL(trimmed);

    // Strictly HTTPS (reject http, javascript, data, ftp, file)
    if (parsed.protocol !== "https:") {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check exact match or googleusercontent / cloudinary subdomains
    if (ALLOWED_IMAGE_HOSTS.has(hostname)) {
      return true;
    }

    if (hostname.endsWith(".googleusercontent.com") || hostname.endsWith(".cloudinary.com")) {
      return true;
    }

    // In non-production environments, allow localhost / 127.0.0.1 for local testing
    if (process.env.NODE_ENV !== "production" && (hostname === "localhost" || hostname === "127.0.0.1")) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Sanitizes plain text input by stripping dangerous tags and control characters.
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/[<>]/g, "") // strip HTML brackets
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // strip control characters
    .trim();
}

/**
 * Maximum number of gallery images permitted per Place.
 */
export const MAX_GALLERY_IMAGES = 24;

/**
 * Validates and normalizes gallery input from form submissions, API requests, or database JSON.
 */
export function validateGalleryData(input: unknown): GalleryValidationResult {
  const errors: string[] = [];

  // Null, undefined, or empty string are valid empty states
  if (input === null || input === undefined || input === "") {
    return { valid: true, data: [], errors: [] };
  }

  let rawList: unknown = input;

  // Handle JSON string inputs
  if (typeof input === "string") {
    try {
      rawList = JSON.parse(input);
    } catch {
      return {
        valid: false,
        data: [],
        errors: ["Gallery payload must be valid JSON or an array of image items."],
      };
    }
  }

  if (!Array.isArray(rawList)) {
    return {
      valid: false,
      data: [],
      errors: ["Gallery payload must be an array."],
    };
  }

  if (rawList.length > MAX_GALLERY_IMAGES) {
    errors.push(`Gallery exceeds maximum allowed image count (${MAX_GALLERY_IMAGES}). Found ${rawList.length}.`);
  }

  const validatedImages: GalleryImageItem[] = [];

  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i];
    const itemPrefix = `Image item #${i + 1}`;

    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push(`${itemPrefix} is not a valid object.`);
      continue;
    }

    const candidate = item as Record<string, unknown>;

    // 1. URL Validation
    const rawUrl = typeof candidate.url === "string" ? candidate.url.trim() : "";
    if (!rawUrl) {
      errors.push(`${itemPrefix}: Missing required "url" property.`);
      continue;
    }

    if (!isValidImageUrl(rawUrl)) {
      errors.push(
        `${itemPrefix}: Invalid or untrusted image URL. Must be an HTTPS URL from an approved CDN (e.g. Cloudinary, Unsplash) or a local relative path.`
      );
      continue;
    }

    // 2. Alt text validation
    const rawAlt = typeof candidate.alt === "string" ? candidate.alt : "";
    const sanitizedAlt = sanitizeText(rawAlt);
    if (!sanitizedAlt) {
      errors.push(`${itemPrefix}: Alt text is required for accessibility and SEO.`);
    } else if (sanitizedAlt.length > 250) {
      errors.push(`${itemPrefix}: Alt text must not exceed 250 characters.`);
    }

    // 3. Caption validation (optional)
    let sanitizedCaption: string | null = null;
    if (candidate.caption !== undefined && candidate.caption !== null && candidate.caption !== "") {
      const rawCaption = String(candidate.caption);
      sanitizedCaption = sanitizeText(rawCaption);
      if (sanitizedCaption.length > 400) {
        errors.push(`${itemPrefix}: Caption must not exceed 400 characters.`);
      }
    }

    // 4. Order validation
    let order = i;
    if (typeof candidate.order === "number" && Number.isInteger(candidate.order) && candidate.order >= 0) {
      order = candidate.order;
    }

    // 5. Featured flag
    const isFeatured = Boolean(candidate.isFeatured);

    validatedImages.push({
      url: rawUrl,
      alt: sanitizedAlt,
      caption: sanitizedCaption,
      order,
      isFeatured,
    });
  }

  // Sort by order ascending
  validatedImages.sort((a, b) => a.order - b.order);

  // Normalize sequential order (0, 1, 2, ...) to prevent ordering gaps or collisions
  const normalizedData = validatedImages.map((img, idx) => ({
    ...img,
    order: idx,
  }));

  return {
    valid: errors.length === 0,
    data: normalizedData,
    errors,
  };
}

