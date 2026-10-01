import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface ToursHeroBannerProps {
  title?: string;
  description?: string;
  travelStyleName?: string;
  heroImage?: string;
}

export default function ToursHeroBanner({
  title = "Kashmir Tour Packages",
  description = "Handcrafted journeys through Kashmir’s breathtaking valleys, serene lakes, and authentic local hospitality.",
  travelStyleName,
  heroImage = "https://res.cloudinary.com/dcmoseix9/image/upload/v1790176178/WhatsApp_Image_2026-09-23_at_8.30.43_PM_xk1tmz.jpg",
}: ToursHeroBannerProps) {
  return (
    <section className="relative w-full overflow-hidden bg-slate-900 text-white">
      {/* Background Image with scenic overlay - Left side only, less opacity */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt="Scenic Kashmir Valley with snow peaks and serene waters"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-22 pb-20 sm:pb-24 lg:pb-28">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
          <ol className="flex items-center space-x-2 text-xs sm:text-sm text-white/80 font-medium">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-white/50 inline" />
            </li>
            <li>
              {travelStyleName ? (
                <Link href="/tours" className="hover:text-white transition-colors">
                  Tour Packages
                </Link>
              ) : (
                <span className="text-white font-semibold" aria-current="page">
                  Tour Packages
                </span>
              )}
            </li>
            {travelStyleName && (
              <>
                <li>
                  <ChevronRight className="w-3.5 h-3.5 text-white/50 inline" />
                </li>
                <li className="text-white font-semibold" aria-current="page">
                  {travelStyleName}
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* Title & Description */}
        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white drop-shadow-xs">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-white/85 leading-relaxed font-normal max-w-xl">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
