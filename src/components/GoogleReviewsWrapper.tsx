import { getGooglePlaceReviews } from "@/actions/google-reviews";
import GoogleReviewsList from "@/components/GoogleReviewsList";

export default async function GoogleReviewsWrapper({ placeId }: { placeId: string }) {
  const wkReviews = await getGooglePlaceReviews(placeId);

  if (!wkReviews || !wkReviews.reviews || wkReviews.reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-72 h-72 bg-[var(--primary)]/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[var(--primary)] font-bold text-sm tracking-wider uppercase mb-2 block">What people say</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Loved by Travelers
          </h2>
          <p className="text-slate-600 text-lg">
            See why thousands of travelers choose WanderKashmir for their authentic Kashmiri experiences.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/40 p-4 sm:p-8 border border-slate-100">
          <GoogleReviewsList 
            reviews={wkReviews.reviews}
            rating={wkReviews.rating}
            totalRatings={wkReviews.userRatingsTotal}
            autoPlay={true}
          />
        </div>
      </div>
    </section>
  );
}
