"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  Save,
  Loader2,
  Building,
  Compass,
  Car,
  Calendar,
  ExternalLink,
  User,
  Hash,
  Clock,
} from "lucide-react";
import { updateReviewAction } from "@/actions/adminReviews";
import {
  AdminPageHeader,
  AdminToastBanner,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

interface ReviewDetailFormProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
      createdAt: Date;
    };
    property?: {
      id: string;
      name: string;
      location: string;
      propertyType: string;
      status: string;
      isApproved: boolean;
    } | null;
    tour?: {
      id: string;
      title: string;
      slug: string;
      duration: string;
      isLive: boolean;
    } | null;
    vehicle?: {
      id: string;
      make: string;
      model: string;
      type: string;
    } | null;
    guideProfile?: {
      id: string;
    } | null;
    booking?: {
      id: string;
      status: string;
      amount: number;
      createdAt: Date;
    } | null;
  };
}

export default function ReviewDetailForm({ review }: ReviewDetailFormProps) {
  const router = useRouter();
  const basePath = useAdminBasePath();

  const [rating, setRating] = useState<number>(review.rating);
  const [comment, setComment] = useState<string>(review.comment || "");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (rating < 1 || rating > 5) {
      setFeedback({ type: "error", text: "Rating must be between 1 and 5 stars." });
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateReviewAction(review.id, {
        rating,
        comment: comment.trim() || null,
      });

      if (res.success) {
        setFeedback({ type: "success", text: "Review updated successfully." });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to update review." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error communicating with server." });
    } finally {
      setIsSaving(false);
    }
  };

  const initial = review.user?.name ? review.user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <AdminPageHeader
        title="Review Details"
        subtitle={`Review ID: ${review.id}`}
        backHref={`${basePath}/reviews`}
        backLabel="Back to Reviews"
        actions={
          review.property?.id ? (
            <Link
              href={`/stays/${review.property.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>View Stay</span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          ) : review.tour?.slug ? (
            <Link
              href={`/tours/${review.tour.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>View Tour</span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          ) : undefined
        }
      />

      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      {/* Reviewer & Associated Entity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-md border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span>Reviewer</span>
          </h2>

          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
              {review.user?.image ? (
                <Image
                  src={review.user.image}
                  alt={review.user.name || "Reviewer"}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 text-sm">
                {review.user?.name || "Anonymous Traveler"}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {review.user?.email || "No email address provided"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            {review.property ? (
              <Building className="h-3.5 w-3.5 text-slate-400" />
            ) : review.tour ? (
              <Compass className="h-3.5 w-3.5 text-slate-400" />
            ) : review.vehicle ? (
              <Car className="h-3.5 w-3.5 text-slate-400" />
            ) : (
              <Hash className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span>Associated Item</span>
          </h2>

          {review.property ? (
            <div className="space-y-1.5">
              <div className="text-sm font-semibold text-slate-900">{review.property.name}</div>
              <div className="text-xs text-slate-500">Location: {review.property.location}</div>
              <div className="flex items-center gap-2 pt-1">
                <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                  {review.property.propertyType}
                </span>
                <StatusBadge status={review.property.status} />
              </div>
            </div>
          ) : review.tour ? (
            <div className="space-y-1.5">
              <div className="text-sm font-semibold text-slate-900">{review.tour.title}</div>
              <div className="text-xs text-slate-500">Duration: {review.tour.duration}</div>
              <div className="flex items-center gap-2 pt-1">
                <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                  Tour Package
                </span>
                <StatusBadge status={review.tour.isLive ? "LIVE" : "DRAFT"} />
              </div>
            </div>
          ) : review.vehicle ? (
            <div className="space-y-1.5">
              <div className="text-sm font-semibold text-slate-900">
                {`${review.vehicle.make} ${review.vehicle.model}`.trim()}
              </div>
              <div className="text-xs text-slate-500">Vehicle Type: {review.vehicle.type}</div>
            </div>
          ) : review.guideProfile ? (
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-900">Guide Profile</div>
              <div className="text-xs font-mono text-slate-500">ID: {review.guideProfile.id}</div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic">
              Direct review (not attached to a specific listing, tour, vehicle, or guide).
            </div>
          )}
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-md border border-slate-200/90 bg-white p-5 sm:p-6 space-y-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">Review Content & Rating</h2>
            <span className="text-xs text-slate-500">Rating and comment are editable</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">
              Star Rating <span className="text-rose-600">*</span>
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isSelected = starVal <= rating;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(starVal)}
                    className="rounded-md p-1 hover:bg-slate-100 transition-colors cursor-pointer"
                    title={`Rate ${starVal} Star${starVal > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        isSelected ? "text-amber-500 fill-amber-400" : "text-slate-200"
                      }`}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-xs font-semibold text-slate-700">
                {rating} out of 5 stars
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="review-comment" className="block text-xs font-medium text-slate-700 mb-1.5">
              Review Comment
            </label>
            <textarea
              id="review-comment"
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Customer feedback details..."
              className="w-full rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>
                Submitted:{" "}
                <span className="font-medium text-slate-700">
                  {new Date(review.createdAt).toLocaleString("en-IN")}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>
                Last updated:{" "}
                <span className="font-medium text-slate-700">
                  {new Date(review.updatedAt).toLocaleString("en-IN")}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
