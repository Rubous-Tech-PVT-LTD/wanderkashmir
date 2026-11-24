"use client";

import React from "react";

interface AdminSeoSectionProps {
  seoTitle: string;
  onSeoTitleChange: (val: string) => void;
  metaDescription: string;
  onMetaDescriptionChange: (val: string) => void;
  canonicalUrl?: string;
  onCanonicalUrlChange?: (val: string) => void;
  h1Heading?: string;
  onH1HeadingChange?: (val: string) => void;
  previewUrl: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export function AdminSeoSection({
  seoTitle,
  onSeoTitleChange,
  metaDescription,
  onMetaDescriptionChange,
  canonicalUrl,
  onCanonicalUrlChange,
  h1Heading,
  onH1HeadingChange,
  previewUrl,
  fallbackTitle = "Page Title | WanderKashmir",
  fallbackDescription = "Meta description preview will appear here once configured.",
}: AdminSeoSectionProps) {
  const effectiveTitle = seoTitle.trim() || fallbackTitle;
  const effectiveDesc = metaDescription.trim() || fallbackDescription;

  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
      <div className="pb-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">Search Engine Optimization</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure search title, meta description, and canonical URL for indexing.
        </p>
      </div>

      {onH1HeadingChange && (
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Primary H1 Heading
          </label>
          <input
            type="text"
            value={h1Heading ?? ""}
            onChange={(e) => onH1HeadingChange(e.target.value)}
            placeholder="On-page H1 heading"
            className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-2 focus:ring-[var(--season-primary)]/15"
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-slate-700">SEO Title</label>
          <span
            className={`text-[11px] tabular-nums ${
              seoTitle.length > 60 ? "text-amber-700 font-medium" : "text-slate-400"
            }`}
          >
            {seoTitle.length} / 60 chars
          </span>
        </div>
        <input
          type="text"
          value={seoTitle}
          onChange={(e) => onSeoTitleChange(e.target.value)}
          placeholder="Concise title targeting primary search query..."
          className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-2 focus:ring-[var(--season-primary)]/15"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-slate-700">Meta Description</label>
          <span
            className={`text-[11px] tabular-nums ${
              metaDescription.length > 160 ? "text-amber-700 font-medium" : "text-slate-400"
            }`}
          >
            {metaDescription.length} / 160 chars
          </span>
        </div>
        <textarea
          rows={3}
          value={metaDescription}
          onChange={(e) => onMetaDescriptionChange(e.target.value)}
          placeholder="Clear summary of what travelers will find on this page..."
          className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-2 focus:ring-[var(--season-primary)]/15"
        />
      </div>

      {onCanonicalUrlChange && (
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Canonical URL (Optional Override)
          </label>
          <input
            type="url"
            value={canonicalUrl ?? ""}
            onChange={(e) => onCanonicalUrlChange(e.target.value)}
            placeholder={previewUrl}
            className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-2 focus:ring-[var(--season-primary)]/15"
          />
        </div>
      )}

      {/* Search Snippet Preview */}
      <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200/80 space-y-1">
        <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          Search Result Preview
        </div>
        <div className="text-[11px] text-[var(--season-primary)] truncate font-mono">
          {canonicalUrl?.trim() || previewUrl}
        </div>
        <div className="text-sm font-medium text-blue-800 line-clamp-1">
          {effectiveTitle}
        </div>
        <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {effectiveDesc}
        </div>
      </div>
    </div>
  );
}

