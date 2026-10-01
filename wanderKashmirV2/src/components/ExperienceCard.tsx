import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin } from "lucide-react";

export default function ExperienceCard({ experience }: { experience: any }) {
  return (
    <Link
      href={`/experiences/${experience.slug}`}
      className="group block h-full"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full transform hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative h-52 overflow-hidden flex-shrink-0">
          <Image 
            src={experience.images?.[0] || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80"} 
            alt={experience.title} 
            fill 
            className="object-cover transition-transform duration-500 hover:scale-105" 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute bottom-3 left-3 text-white">
            <div className="flex gap-2 flex-wrap mb-1">
              {experience.destination && (
                <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 flex-shrink-0" /> 
                  <span className="truncate max-w-[150px]">{experience.destination}</span>
                </span>
              )}
              {experience.duration && (
                <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 flex-shrink-0" /> 
                  <span className="truncate max-w-[100px]">{experience.duration}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-orange-500 transition-colors line-clamp-2 mb-2">
            {experience.title}
          </h3>
          
          {experience.description && (
            <p className="text-sm text-slate-500 line-clamp-2 mb-4">
              {experience.description}
            </p>
          )}

          <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">From</p>
              <div className="flex items-baseline gap-1">
                {experience.basePrice ? (
                  <>
                    <span className="text-lg font-bold text-slate-900">₹{experience.basePrice.toLocaleString()}</span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-slate-600">Price on request</span>
                )}
              </div>
            </div>
            <span className="text-orange-500 text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform">
              View Details <span className="ml-1">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
