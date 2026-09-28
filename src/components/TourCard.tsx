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

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "w-3.5 h-3.5"}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export default function TourCard({ tour }: { tour: any }) {
  const whatsappUrl = `https://wa.me/916005888754?text=${encodeURIComponent(
    `Hello WanderKashmir, I would like to inquire/book the tour: *${tour?.title || 'Tour'}* (${tour?.duration || ""}). Please share details.`
  )}`;
  const detailUrl = `/tours/${tour?.slug || ''}`;
  const destinations: string[] = Array.isArray(tour?.destinations) ? tour.destinations : [];
  const inclusions: string[] = Array.isArray(tour?.inclusions) ? tour.inclusions : [];

  return (
    <div className="group block h-full">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full transform hover:-translate-y-1">
        {/* Image Container */}
        <Link href={detailUrl} className="relative h-52 overflow-hidden flex-shrink-0 block">
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
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white"
          >
            <Heart className="w-4 h-4 text-slate-400 hover:text-red-500 transition-colors" />
          </button>
          <div className="absolute bottom-3 left-3 text-white">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-white/70" />
              <span className="text-xs text-white/80">{tour.duration}</span>
            </div>
            <div className="flex gap-1 flex-wrap mt-1">
              {destinations.slice(0, 3).map((d: string) => (
                <span key={d} className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 flex-shrink-0" /> 
                  <span className="truncate max-w-[120px]">{d}</span>
                </span>
              ))}
              {destinations.length > 3 && (
                <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center" title={destinations.slice(3).join(', ')}>
                  +{destinations.length - 3}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <Link href={detailUrl} className="group-hover:text-orange-600 transition-colors">
            <h3 className="font-semibold text-slate-900 mb-2 leading-tight">{tour?.title}</h3>
          </Link>

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
            {inclusions.slice(0, 4).map((inc: string) => (
              <span key={inc} className="flex items-center gap-1 text-xs bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-slate-600">
                <CheckCircle2 className="w-3 h-3 text-orange-500 flex-shrink-0" />
                <span className="truncate max-w-[150px]">{inc}</span>
              </span>
            ))}
            {inclusions.length > 4 && (
              <span 
                className="flex items-center gap-1 text-xs bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-slate-500 cursor-help"
                title={inclusions.slice(4).join(', ')}
              >
                +{inclusions.length - 4} more
              </span>
            )}
          </div>

          {/* Price & Action */}
          <div className="flex items-end justify-between mt-auto pt-3 border-t border-slate-100 gap-2">
            <div>
              {tour.originalPrice && (
                <p className="text-xs text-slate-400 line-through">₹{tour.originalPrice.toLocaleString("en-IN")}</p>
              )}
              <p className="text-lg font-bold text-slate-900 leading-tight">
                ₹{tour.price.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-slate-400">/person</span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {tour.isLive ? (
                <Link
                  href={detailUrl}
                  className="text-xs font-medium text-slate-500 hover:text-orange-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Details
                </Link>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded text-amber-700 bg-amber-100 uppercase tracking-wider">
                  Soon
                </span>
              )}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
