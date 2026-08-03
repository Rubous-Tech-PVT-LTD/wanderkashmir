"use client";

import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useState } from "react";

function ReviewCard({ review }: { review: any }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.text && review.text.length > 200;

  return (
    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <img 
          src={review.profile_photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${review.author_name}`} 
          alt={review.author_name} 
          className="w-10 h-10 rounded-full object-cover" 
        />
        <div>
          <h4 className="font-bold text-sm text-slate-900">{review.author_name}</h4>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
            <span className="text-xs font-bold text-slate-700">{review.rating}</span>
            <span className="text-xs text-slate-400 ml-1">{review.relative_time_description}</span>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <p className={`text-sm text-slate-600 ${!expanded ? 'line-clamp-4' : ''}`}>
          {review.text}
        </p>
        {isLong && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-sky-600 font-medium text-xs mt-2 hover:underline"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function GoogleReviewsList({ reviews, rating, totalRatings }: { reviews: any[], rating: number, totalRatings: number }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="mt-12 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-8 h-8" />
          <div>
            <h3 className="text-xl font-bold text-slate-900">Google Reviews</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.round(rating) ? 'fill-orange-400 text-orange-400' : 'fill-slate-200 text-slate-200'}`} 
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-900">{rating} / 5</span>
              <span className="text-sm text-slate-500">({totalRatings} reviews)</span>
            </div>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        {reviews.length > 2 && (
          <div className="flex gap-2 hidden md:flex">
            <button 
              onClick={scrollPrev} 
              className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={scrollNext} 
              className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {reviews.map((review, i) => (
            <div key={i} className="pl-4 min-w-0 flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      </div>
      
      {reviews.length > 2 && (
        <div className="flex justify-center gap-2 mt-6 md:hidden">
          <button 
            onClick={scrollPrev} 
            className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={scrollNext} 
            className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
