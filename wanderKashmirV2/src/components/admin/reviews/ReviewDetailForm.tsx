"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Star,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building,
  Compass,
  Calendar,
  ExternalLink,
  ShieldCheck,
  User,
  Hash,
  Clock,
} from "lucide-react";
import { updateReviewAction } from "@/actions/adminReviews";

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

  const [rating, setRating] = useState<number>(review.rating);
  const [comment, setComment] = useState<string>(review.comment || "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (rating < 1 || rating > 5) {
      setErrorMessage("Rating must be between 1 and 5 stars.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateReviewAction(review.id, {
        rating,
        comment: comment.trim() || null,
      });

      if (res.success) {
        setSuccessMessage("Review updated successfully.");
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to update review.");
      }
    } catch {
      setErrorMessage("Network error communicating with server.");
    } finally {
      setIsSaving(false);
    }
  };

  const initial = review.user?.name ? review.user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/reviews"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              <span>Review Details</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Review ID: <span className="font-mono text-slate-300">{review.id}</span>
            </p>
          </div>
        </div>

        {/* Public Link if attached to property or tour */}
        {review.property?.id && (
          <Link
            href={`/stays/${review.property.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800 transition self-start sm:self-auto"
          >
            <span>View Public Stay</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}

        {review.tour?.slug && (
          <Link
            href={`/tours/${review.tour.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800 transition self-start sm:self-auto"
          >
            <span>View Public Tour</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{successMessage}</div>
        </div>
      )}

      {/* Reviewer & Associated Entity Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Reviewer Information Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span>Reviewer Information</span>
          </h2>

          <div className="flex items-center gap-3 pt-1">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
              {review.user?.image ? (
                <Image
                  src={review.user.image}
                  alt={review.user.name || "Reviewer"}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-white text-sm">
                {review.user?.name || "Anonymous Traveler"}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {review.user?.email || "No email address provided"}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                User ID: {review.user?.id}
              </div>
            </div>
          </div>
        </div>

        {/* Associated Entity Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
            {review.property ? (
              <Building className="w-4 h-4 text-blue-400" />
            ) : review.tour ? (
              <Compass className="w-4 h-4 text-purple-400" />
            ) : (
              <Hash className="w-4 h-4 text-slate-400" />
            )}
            <span>Associated Destination / Package</span>
          </h2>

          {review.property ? (
            <div className="space-y-1.5 pt-1">
              <div className="text-sm font-semibold text-white">
                {review.property.name}
              </div>
              <div className="text-xs text-slate-400">
                Location: {review.property.location}
              </div>
              <div className="flex items-center gap-2 text-xs pt-1">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                  {review.property.propertyType}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  {review.property.status}
                </span>
              </div>
            </div>
          ) : review.tour ? (
            <div className="space-y-1.5 pt-1">
              <div className="text-sm font-semibold text-white">
                {review.tour.title}
              </div>
              <div className="text-xs text-slate-400">
                Duration: {review.tour.duration}
              </div>
              <div className="flex items-center gap-2 text-xs pt-1">
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                  Tour Package
                </span>
                {review.tour.isLive ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    Live
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                    Draft
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 pt-1 italic">
              Direct review (not attached to a specific property or tour).
            </div>
          )}
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
          <h2 className="text-base font-semibold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Review Content & Rating</span>
            <span className="text-xs font-normal text-slate-400">
              Only rating & comment are editable
            </span>
          </h2>

          {/* Rating Selection */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-2">
              Star Rating <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isSelected = starVal <= rating;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(starVal)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 transition focus:outline-none"
                    title={`Rate ${starVal} Star${starVal > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        isSelected
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-700"
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-sm font-semibold text-white ml-2">
                {rating} out of 5 Stars
              </span>
            </div>
          </div>

          {/* Comment Textarea */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
              Review Comment
            </label>
            <textarea
              rows={6}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Customer feedback details..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>
                Submitted on:{" "}
                <span className="text-slate-300 font-medium">
                  {new Date(review.createdAt).toLocaleString("en-IN")}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>
                Last updated:{" "}
                <span className="text-slate-300 font-medium">
                  {new Date(review.updatedAt).toLocaleString("en-IN")}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Safety Guarantees Notice */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Production Database Safety Rules</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
            <li>
              Review moderation status: Not supported by the production schema and was intentionally not added.
            </li>
            <li>
              Destructive deletion: Not implemented to preserve rating aggregates and customer booking integrity.
            </li>
            <li>
              Tour and Stay safety: Editing review content never modifies connected property or tour package records.
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/reviews"
            className="px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 text-sm font-medium transition"
          >
            Back to Reviews
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow-sm hover:shadow-amber-500/20 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
