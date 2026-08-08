"use client";

import { useState } from "react";
import { Star, Send } from "lucide-react";

export default function SeoCommentForm({ seoPageId }: { seoPageId: string }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 5,
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/seo-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, seoPageId }),
      });

      if (res.ok) {
        setIsSuccess(true);
        setFormData({ name: "", email: "", rating: 5, comment: "" });
      } else {
        alert("Failed to submit review. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 text-green-800 p-6 rounded-2xl border border-green-100 text-center">
        <h4 className="font-bold text-lg mb-2">Thank You for Your Review!</h4>
        <p className="text-sm">Your feedback has been submitted and is pending approval.</p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="mt-4 text-green-600 hover:text-green-700 font-medium text-sm underline"
        >
          Write another review
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="font-bold text-lg text-slate-800 mb-4">Leave a Reply / Review</h3>
      
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData({ ...formData, rating: star })}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star 
              className={`w-6 h-6 ${star <= formData.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} 
            />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Your Name *</label>
          <input
            type="text"
            required
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316] text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Your Email (Optional)</label>
          <input
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316] text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Your Review *</label>
        <textarea
          required
          rows={4}
          placeholder="Share your experience or thoughts..."
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316] text-sm resize-none"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full md:w-auto px-6 py-3 bg-[#f97316] text-white rounded-xl font-medium hover:bg-[#ea580c] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        {isSubmitting ? "Submitting..." : "Post Review"}
      </button>
    </form>
  );
}
