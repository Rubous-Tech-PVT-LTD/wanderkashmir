import Link from "next/link";
import Image from "next/image";
import { Star, Clock, MapPin, CheckCircle2, Heart } from "lucide-react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function TourCard({ tour }: { tour: any }) {
  return (
    <Link
      href={tour.isLive ? `/tours/${tour.slug}` : `https://wa.me/916005888754?text=I'm%20interested%20in%20the%20${encodeURIComponent(tour.title)}`}
      target={tour.isLive ? undefined : "_blank"}
      className="group block"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full transform hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative h-52 overflow-hidden flex-shrink-0">
          <Image 
            src={tour.image || "https://i.ibb.co/DfbJP98Q/OIP.webp"} 
            alt={tour.title} 
            fill 
            className="object-cover transition-transform duration-500 hover:scale-105" 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap pr-12">
            {tour.badge && (
              <span className="badge bg-orange-500 text-white text-xs px-2 py-1 rounded-lg font-semibold shadow-sm">
                {tour.badge}
              </span>
            )}
            {tour.category?.includes('Instagram') && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                <InstagramIcon className="w-3 h-3" /> Insta
              </div>
            )}
            {(() => {
              const categories = tour.category ? tour.category.split(',').map((c: string) => c.trim()).filter(Boolean) : [];
              const maxCats = tour.badge ? 1 : 2;
              const visibleCats = categories.slice(0, maxCats);
              const hiddenCount = categories.length - maxCats;
              
              return (
                <>
                  {visibleCats.map((cat: string, idx: number) => (
                    <span key={idx} className="badge bg-orange-500 text-white text-xs px-2 py-1 rounded-lg font-semibold shadow-sm">
                      {cat}
                    </span>
                  ))}
                  {hiddenCount > 0 && (
                    <span className="badge bg-slate-900/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg font-semibold shadow-sm" title={categories.slice(maxCats).join(', ')}>
                      +{hiddenCount}
                    </span>
                  )}
                </>
              );
            })()}
          </div>
          <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow">
            <Heart className="w-4 h-4 text-slate-400" />
          </button>
          <div className="absolute bottom-3 left-3 text-white">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-white/70" />
              <span className="text-xs text-white/80">{tour.duration}</span>
            </div>
            <div className="flex gap-1 flex-wrap mt-1">
              {tour.destinations.slice(0, 3).map((d: string) => (
                <span key={d} className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 flex-shrink-0" /> 
                  <span className="truncate max-w-[120px]">{d}</span>
                </span>
              ))}
              {tour.destinations.length > 3 && (
                <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center" title={tour.destinations.slice(3).join(', ')}>
                  +{tour.destinations.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-slate-900 mb-2 leading-tight">{tour.title}</h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ background: "rgba(232,99,26,0.12)" }}>
              <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span className="text-xs font-bold text-orange-700">4.8</span>
            </div>
            <span className="text-xs text-slate-400">(412 reviews)</span>
          </div>

          {/* Inclusions */}
          <div className="flex gap-1.5 flex-wrap mb-3">
            {tour.inclusions.slice(0, 4).map((inc: string) => (
              <span key={inc} className="flex items-center gap-1 text-xs bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-slate-600">
                <CheckCircle2 className="w-3 h-3 text-orange-500 flex-shrink-0" />
                <span className="truncate max-w-[150px]">{inc}</span>
              </span>
            ))}
            {tour.inclusions.length > 4 && (
              <span 
                className="flex items-center gap-1 text-xs bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-slate-500 cursor-help"
                title={tour.inclusions.slice(4).join(', ')}
              >
                +{tour.inclusions.length - 4} more
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-end justify-between mt-auto pt-3 border-t border-slate-100">
            <div>
              {tour.originalPrice && (
                <p className="text-xs text-slate-400 line-through">₹{tour.originalPrice.toLocaleString("en-IN")}</p>
              )}
              <p className="text-lg font-bold text-slate-900">
                ₹{tour.price.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-slate-400">/person</span>
              </p>
            </div>
            {tour.isLive ? (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm">
                View Details
              </span>
            ) : (
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded text-amber-700 bg-amber-100 uppercase tracking-wider">
                  Coming Soon
                </span>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-lg text-emerald-700 bg-emerald-100 shadow-sm flex items-center gap-1 hover:bg-emerald-200 transition-colors">
                  WhatsApp Now
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
