/**
 * HeroCarousel — Pure CSS crossfade (zero hydration JS).
 *
 * CRITICAL BUG FIXED (v2):
 * The previous version used a single @keyframes heroFade starting at opacity:0,
 * which meant the FIRST image was invisible for ~750ms (5% of 15s cycle) before
 * fading in. The browser then chose the "Kashmir" Dancing Script text as the
 * LCP element instead of the hero image, causing LCP = 4.1s (font-load delay).
 *
 * Fix: Three separate @keyframes, one per slide:
 * - heroFadeFirst: starts at opacity:1 → hero image is LCP-eligible from frame 0
 * - heroFadeSecond: fades in at 33%, visible until 63%
 * - heroFadeThird: fades in at 66%, visible until 96%
 *
 * prefers-reduced-motion: collapses to a static first image (no animation at all)
 */

import Image from "next/image";

const images = [
  {
    src: "https://res.cloudinary.com/dcmoseix9/image/upload/v1785051891/file_00000000049482079aff0e6317218e06_m3hbcf.png",
    alt: "Breathtaking Kashmir scenic landscape and valley view",
    keyframe: "heroFadeFirst",
    position: "object-[center_12%]", // Shift slightly up to show more full image while keeping hands visible
  },
  {
    src: "https://res.cloudinary.com/dcmoseix9/image/upload/q_auto/f_auto/v1781182033/ChatGPT_Image_Jun_11_2026_06_15_47_PM_npe0t1.png",
    alt: "Beautiful Kashmir landscape with snow-capped mountains and valleys",
    keyframe: "heroFadeSecond",
    position: "object-center",
  },
  {
    src: "https://res.cloudinary.com/dcmoseix9/image/upload/q_auto/f_auto/v1781183474/ChatGPT_Image_Jun_11_2026_06_40_42_PM_cztzx7.png",
    alt: "Dal Lake houseboats with serene reflections on calm water",
    keyframe: "heroFadeThird",
    position: "object-center",
  },
  {
    src: "https://res.cloudinary.com/dcmoseix9/image/upload/q_auto/f_auto/v1781183615/ChatGPT_Image_Jun_11_2026_06_43_20_PM_pnzlsf.png",
    alt: "Gulmarg meadows covered with wildflowers in summer",
    keyframe: "heroFadeFourth",
    position: "object-center",
  },
];

/**
 * Total cycle = 20s (4 slides × 5s each)
 *
 * heroFadeFirst:  Starts at 1 (immediately visible!) → holds until 25% → covered by slide 2
 * heroFadeSecond: Invisible → fades in at 25–28% → holds 28–47% → fades out 47–50%
 * heroFadeThird:  Invisible → fades in at 50–53% → holds 53–72% → fades out 72–75%
 * heroFadeFourth: Invisible → fades in at 75–78% → holds 78–97% → fades out 97–100%
 *
 * By starting the first slide at opacity:1 at 0%, the hero image is visible
 * immediately on page load → browser selects it as the LCP element → no
 * font-loading bottleneck.
 */

export default function HeroCarousel() {
  return (
    <div className="absolute inset-0 z-0 bg-black" aria-hidden="true">
      {images.map((img, index) => (
        <div
          key={img.src}
          className="hero-slide absolute inset-0"
          style={{
            opacity: index === 0 ? 1 : 0,
            animation: index === 0 ? "none" : `${img.keyframe} 20s ease-in-out infinite`,
            zIndex: index === 0 ? 0 : 1,
          }}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            // Only the first image is LCP-critical — priority + eager loading
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
            // fetchPriority="high" signals the preload scanner to prioritize
            // this image before the browser finishes parsing JS/CSS
            fetchPriority={index === 0 ? "high" : "auto"}
            sizes="100vw"
            className={`object-cover ${img.position || "object-center"}`}
          />
        </div>
      ))}

      {/* Gradient overlay for text legibility */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
    </div>
  );
}
