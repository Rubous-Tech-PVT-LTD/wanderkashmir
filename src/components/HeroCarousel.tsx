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
    src: "https://res.cloudinary.com/dcmoseix9/image/upload/v1786007775/ChatGPT_Image_Aug_6_2026_02_45_58_PM_q22zzm.png",
    mobileSrc: "https://res.cloudinary.com/dcmoseix9/image/upload/v1786006582/ChatGPT_Image_Aug_6_2026_02_26_11_PM_qszczd.png",
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
 * Total cycle = 25s (Slide 1: 10s, Slide 2,3,4: 5s each)
 *
 * heroFadeFirst:  Starts at 1 (immediately visible!) → holds until 40% → covered by slide 2
 * heroFadeSecond: Invisible → fades in at 40–43% → holds 43–57% → fades out 57–60%
 * heroFadeThird:  Invisible → fades in at 60–63% → holds 63–77% → fades out 77–80%
 * heroFadeFourth: Invisible → fades in at 80–83% → holds 83–97% → fades out 97–100%
 *
 * By starting the first slide at opacity:1 at 0%, the hero image is visible
 * immediately on page load → browser selects it as the LCP element → no
 * font-loading bottleneck.
 */

export default function HeroCarousel() {
  const common = { fill: true, sizes: "100vw", className: "object-cover" };
  
  return (
    <div className="absolute inset-0 z-0 bg-black" aria-hidden="true">
      {images.map((img, index) => {
        // Only use getImageProps for the first (priority) slide to avoid double-downloading on mobile
        let PictureElement = null;
        
        if (index === 0 && img.mobileSrc) {
          const { getImageProps } = require("next/image");
          const { props: { srcSet: desktop } } = getImageProps({
            ...common,
            src: img.src,
            alt: img.alt,
            priority: true,
          });
          const { props: { srcSet: mobile, ...rest } } = getImageProps({
            ...common,
            src: img.mobileSrc,
            alt: img.alt,
            priority: true,
          });
          
          PictureElement = (
            <picture>
              <source media="(min-width: 768px)" srcSet={desktop} />
              <source media="(max-width: 767px)" srcSet={mobile} />
              <img {...rest} className={`object-cover w-full h-full max-w-full ${img.position || "object-center"}`} />
            </picture>
          );
        }

        return (
          <div
            key={img.src}
            className="hero-slide absolute inset-0"
            style={{
              opacity: index === 0 ? 1 : 0,
              animation: index === 0 ? "none" : `${img.keyframe} 25s ease-in-out infinite`,
              zIndex: index === 0 ? 0 : 1,
            }}
          >
            {PictureElement ? (
              PictureElement
            ) : img.mobileSrc ? (
              <>
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  loading="lazy"
                  sizes="100vw"
                  className={`hidden md:block object-cover ${img.position || "object-center"}`}
                />
                <Image
                  src={img.mobileSrc}
                  alt={img.alt}
                  fill
                  loading="lazy"
                  sizes="100vw"
                  className={`block md:hidden object-cover w-full h-full max-w-full ${img.position || "object-center"}`}
                />
              </>
            ) : (
              <Image
                src={img.src}
                alt={img.alt}
                fill
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                sizes="100vw"
                className={`object-cover ${img.position || "object-center"}`}
              />
            )}
          </div>
        );
      })}

      {/* Gradient overlay for text legibility */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
    </div>
  );
}
