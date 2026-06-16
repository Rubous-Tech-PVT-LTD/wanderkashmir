/**
 * HeroCarousel — Pure CSS crossfade implementation.
 *
 * Key performance decisions:
 * - Removed useEffect/useState entirely (eliminates ~3KB hydration JS + timer execution)
 * - CSS @keyframes handles the 3-image crossfade with staggered animation-delay
 * - `priority` on the first image ensures LCP is fast
 * - `prefers-reduced-motion` collapses all images to static, showing only the first
 * - Images 2 & 3 use `loading="lazy"` since they appear after several seconds
 */

import Image from "next/image";

const images = [
  {
    src: "https://res.cloudinary.com/dcmoseix9/image/upload/q_auto/f_auto/v1781182033/ChatGPT_Image_Jun_11_2026_06_15_47_PM_npe0t1.png",
    alt: "Beautiful Kashmir landscape with snow-capped mountains",
  },
  {
    src: "https://res.cloudinary.com/dcmoseix9/image/upload/q_auto/f_auto/v1781183474/ChatGPT_Image_Jun_11_2026_06_40_42_PM_cztzx7.png",
    alt: "Dal Lake houseboat with serene reflections",
  },
  {
    src: "https://res.cloudinary.com/dcmoseix9/image/upload/q_auto/f_auto/v1781183615/ChatGPT_Image_Jun_11_2026_06_43_20_PM_pnzlsf.png",
    alt: "Gulmarg meadows in summer with wildflowers",
  },
];

// Total cycle = 15s (3 images × 5s each)
// Each slide is visible for 5s out of every 15s cycle.
// Timing: fade-in at 0%, hold at 5%-30%, fade-out at 33%, hidden 33%-100%
const KEYFRAMES = `
@keyframes heroFade {
  0%   { opacity: 0; }
  5%   { opacity: 1; }
  30%  { opacity: 1; }
  33%  { opacity: 0; }
  100% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .hero-slide { animation: none !important; }
  .hero-slide:not(:first-child) { display: none !important; }
  .hero-slide:first-child { opacity: 1 !important; }
}
`;

export default function HeroCarousel() {
  return (
    <div className="absolute inset-0 z-0 bg-black" aria-hidden="true">
      {/* Inject keyframes once into <head> via a style tag */}
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      {images.map((img, index) => (
        <div
          key={img.src}
          className="hero-slide absolute inset-0"
          style={{
            animation: `heroFade 15s ease-in-out ${index * 5}s infinite`,
            // First slide starts visible; others start invisible
            opacity: index === 0 ? 1 : 0,
          }}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            // Only the first (LCP) image gets priority + eager loading
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
    </div>
  );
}
