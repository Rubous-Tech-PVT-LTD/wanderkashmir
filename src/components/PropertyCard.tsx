import Link from "next/link";
import Image from "next/image";
import { Star, Heart } from "lucide-react";

interface PropertyProps {
  id: string;
  name: string;
  location: string;
  type: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  featured?: boolean;
}

export default function PropertyCard({
  id,
  name,
  location,
  type,
  price,
  rating,
  reviews,
  image,
  featured,
}: PropertyProps) {
  return (
    <Link href={`/stays/${id}`} className="block group">
      <div className="card-white h-full flex flex-col relative">
        
        {/* Heart Icon Top Right */}
        <button className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-orange-500 transition-colors shadow-sm">
          <Heart className="w-4 h-4" />
        </button>

        {featured && (
          <div className="absolute top-3 left-3 z-10">
            <span className="badge bg-orange-500 text-white shadow-sm border-none">
              Best Seller
            </span>
          </div>
        )}

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold text-slate-900 text-base leading-snug mb-1 line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
            {name}
          </h3>
          <p className="text-xs text-slate-500 mb-3">{location}</p>

          <div className="mt-auto flex items-end justify-between">
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Star className="w-4 h-4 fill-[var(--primary)] text-[var(--primary)]" />
              <span className="font-bold text-[var(--primary)]">{rating}</span>
              <span className="text-xs">({reviews})</span>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-slate-900 text-lg leading-none">
                ₹{price.toLocaleString("en-IN")}
                <span className="text-xs text-slate-500 font-normal ml-1">/ night</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
