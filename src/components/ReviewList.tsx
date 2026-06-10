import { Star, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface ReviewListProps {
  reviews: Review[];
  averageRating: number;
  totalCount: number;
}

export default function ReviewList({ reviews, averageRating, totalCount }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
        <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">No reviews yet</h3>
        <p className="text-slate-500">Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6 pb-6 border-b border-slate-200">
        <div className="text-center">
          <p className="text-5xl font-black text-slate-900">{averageRating.toFixed(1)}</p>
          <div className="flex items-center justify-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-200 fill-slate-200"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-500 font-medium">{totalCount} Reviews</p>
        </div>

        {/* Rating Bars (Simplified for demo) */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="w-4 font-medium text-slate-600">{star}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-slate-500">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {review.user.image ? (
                  <Image
                    src={review.user.image}
                    alt={review.user.name || "User"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-900">{review.user.name || "Guest"}</h4>
                  <p className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-200 fill-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>
            {review.comment && (
              <p className="text-slate-700 leading-relaxed text-sm">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
