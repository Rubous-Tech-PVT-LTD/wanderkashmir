import React from "react";
import { Star, MessageSquare, ExternalLink } from "lucide-react";
import { HotelReviewSummary } from "./types";
import { SectionEmptyState } from "./HotelEmptyState";

interface HotelReviewsProps {
  reviews: HotelReviewSummary;
  hotelName: string;
}

// Official Google Multicolor SVG Icon
function GoogleGIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function HotelReviews({ reviews, hotelName }: HotelReviewsProps) {
  const hasReviews = reviews.reviews && reviews.reviews.length > 0;
  const isGoogle = Boolean(reviews.googlePlaceId || reviews.googleRating);

  return (
    <section id="reviews" className="scroll-mt-28 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full bg-[var(--season-primary)]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--season-text,#111827)] font-display tracking-tight flex items-center gap-2">
            <span>Guest Reviews & Ratings</span>
            {isGoogle && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                <GoogleGIcon className="w-3.5 h-3.5" />
                Google Reviews
              </span>
            )}
          </h2>
        </div>

        {typeof reviews.rating === "number" && (
          <div className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-950 border border-amber-200 shadow-2xs">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-base font-extrabold font-display leading-none text-slate-900">
                {reviews.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-slate-600 font-medium">
              ({reviews.reviewCount} verified review{reviews.reviewCount === 1 ? "" : "s"})
            </span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white p-5 sm:p-6 shadow-2xs space-y-5">
        {hasReviews ? (
          <div className="space-y-4">
            {reviews.reviews.map((rev) => {
              const isGoogleRev = rev.source === "google";
              return (
                <div
                  key={rev.id}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {rev.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rev.avatarUrl}
                          alt={rev.author}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-orange-100 text-[var(--season-primary,#f97316)] font-bold flex items-center justify-center text-xs shrink-0 border border-orange-200">
                          {rev.author.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 font-display">
                            {rev.author}
                          </span>
                          {isGoogleRev && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md">
                              <GoogleGIcon className="w-2.5 h-2.5" />
                              Google
                            </span>
                          )}
                        </div>
                        {rev.date && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{rev.date}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? "fill-current" : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      {rev.authorUrl && (
                        <a
                          href={rev.authorUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                          title="View on Google Maps"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                    {rev.content}
                  </p>
                </div>
              );
            })}

            {isGoogle && (
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <GoogleGIcon className="w-3.5 h-3.5" />
                  Synced from verified Google Maps Place reviews
                </span>
                {reviews.googlePlaceId && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${reviews.googlePlaceId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--season-primary,#f97316)] hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Read all {reviews.reviewCount} reviews on Google</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
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
