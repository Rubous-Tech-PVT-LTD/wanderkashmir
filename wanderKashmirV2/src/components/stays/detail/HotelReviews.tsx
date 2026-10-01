import React from "react";
import { Star, MessageSquare } from "lucide-react";
import { HotelReviewSummary } from "./types";
import { SectionEmptyState } from "./HotelEmptyState";

interface HotelReviewsProps {
  reviews: HotelReviewSummary;
  hotelName: string;
}

export default function HotelReviews({ reviews, hotelName }: HotelReviewsProps) {
  const hasReviews = reviews.reviews && reviews.reviews.length > 0;

  return (
    <section id="reviews" className="scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full bg-[var(--season-primary)]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--season-text,#111827)] font-display tracking-tight">
            Guest Reviews & Experiences
          </h2>
        </div>

        {typeof reviews.rating === "number" && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
            <Star className="w-4 h-4 fill-current text-amber-500" />
            <span className="text-sm font-extrabold font-display">
              {reviews.rating.toFixed(1)}
            </span>
            <span className="text-xs text-amber-800/80 font-medium">
              ({reviews.reviewCount})
            </span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white p-5 sm:p-6 shadow-2xs">
        {hasReviews ? (
          <div className="space-y-4">
            {reviews.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[var(--season-primary-light,#FFF7ED)] text-[var(--season-primary)] flex items-center justify-center text-xs font-bold font-display">
                      {rev.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{rev.author}</div>
                      {rev.date && (
                        <div className="text-[10px] text-slate-400">{rev.date}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? "fill-current" : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {rev.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <SectionEmptyState
            icon={MessageSquare}
            title="No Verified Guest Reviews Available Yet"
            message={`Reviews will appear once verified travelers complete their stay at ${hotelName}.`}
          />
        )}
      </div>
    </section>
  );
}
