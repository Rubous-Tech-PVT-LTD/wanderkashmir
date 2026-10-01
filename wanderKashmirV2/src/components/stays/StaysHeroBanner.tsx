import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShieldCheck, Sparkles, Anchor, Hotel, Home } from "lucide-react";

export default function StaysHeroBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-slate-900 text-white">
      {/* Background Image with Scenic Kashmir Stays Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://res.cloudinary.com/dcmoseix9/image/upload/v1790893783/kashmir_stays_banner_consistent_grid_1_axjje8.webp"
          alt="Scenic Dal Lake Houseboats and Mountain Resorts in Kashmir"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-22 pb-28 sm:pb-32 lg:pb-36">
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
            <li className="text-white font-semibold" aria-current="page">
              Hotels & Resorts
            </li>
          </ol>
        </nav>

        {/* Title & Description */}
        <div className="max-w-3xl space-y-3">

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white drop-shadow-xs">
            Hotels, Resorts & Houseboats in Kashmir
          </h1>

        </div>


      </div>
    </section>
  );
}
