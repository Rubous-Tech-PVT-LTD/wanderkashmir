import { Star } from "lucide-react";

export default function GoogleReviewsList({ reviews, rating, totalRatings }: { reviews: any[], rating: number, totalRatings: number }) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="mt-12 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review, i) => (
          <div key={i} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <img src={review.profile_photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${review.author_name}`} alt={review.author_name} className="w-10 h-10 rounded-full" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">{review.author_name}</h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                  <span className="text-xs font-bold text-slate-700">{review.rating}</span>
                  <span className="text-xs text-slate-400 ml-1">{review.relative_time_description}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600 line-clamp-4">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
