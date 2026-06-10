"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { addReview } from "@/actions/reviews";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  entityType: "PROPERTY" | "VEHICLE" | "GUIDE";
  entityId: string;
}

export default function ReviewForm({ entityType, entityId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    const data: any = { rating, comment };
    if (entityType === "PROPERTY") data.propertyId = entityId;
    if (entityType === "VEHICLE") data.vehicleId = entityId;
    if (entityType === "GUIDE") data.guideProfileId = entityId;

    const res = await addReview(data);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Review submitted successfully!");
      setRating(0);
      setComment("");
      router.refresh();
    } else {
      if (res.error === "Unauthorized") {
        toast.error("You must be logged in to leave a review.");
      } else {
        toast.error(res.error || "Failed to submit review");
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-xl font-bold text-slate-900 mb-4">Leave a Review</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">Overall Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-200"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">Your Experience (Optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience..."
            className="w-full rounded-xl border border-slate-200 p-4 focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none min-h-[120px] text-slate-700"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[var(--primary)] text-white px-6 py-3 rounded-xl font-bold hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            "Submit Review"
          )}
        </button>
      </form>
    </div>
  );
}
