import React from "react";

export default function PlaceDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-8 pt-22 sm:pt-26 pb-20">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6 sm:mb-8">
          <div className="h-4 w-12 bg-slate-200 animate-pulse rounded" />
          <div className="h-3 w-3 bg-slate-200 rounded-full" />
          <div className="h-4 w-20 bg-slate-200 animate-pulse rounded" />
          <div className="h-3 w-3 bg-slate-200 rounded-full" />
          <div className="h-4 w-16 bg-slate-200 animate-pulse rounded" />
          <div className="h-3 w-3 bg-slate-200 rounded-full" />
          <div className="h-4 w-32 bg-slate-200 animate-pulse rounded" />
        </div>

        {/* Entity Header Skeleton */}
        <div className="mb-8 sm:mb-10 space-y-3">
          <div className="h-6 w-28 bg-slate-200 animate-pulse rounded-full" />
          <div className="h-10 sm:h-12 w-3/4 max-w-xl bg-slate-200 animate-pulse rounded-2xl" />
        </div>

        {/* Visual Showcase Skeleton */}
        <div className="w-full aspect-[16/8] sm:aspect-[16/7] rounded-3xl bg-slate-200 animate-pulse mb-10 sm:mb-12 shadow-sm" />

        {/* Highlights Strip Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 sm:mb-14">
          <div className="h-20 bg-white border border-slate-200 rounded-2xl p-4 animate-pulse" />
          <div className="h-20 bg-white border border-slate-200 rounded-2xl p-4 animate-pulse" />
          <div className="h-20 bg-white border border-slate-200 rounded-2xl p-4 animate-pulse" />
        </div>

        {/* Description Box Skeleton */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs mb-14 space-y-6">
          <div className="h-7 w-48 bg-slate-200 animate-pulse rounded-lg" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-100 animate-pulse rounded" />
            <div className="h-4 w-11/12 bg-slate-100 animate-pulse rounded" />
            <div className="h-4 w-4/5 bg-slate-100 animate-pulse rounded" />
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-5 w-40 bg-slate-200 animate-pulse rounded-lg" />
            <div className="h-4 w-full bg-slate-100 animate-pulse rounded" />
            <div className="h-4 w-5/6 bg-slate-100 animate-pulse rounded" />
          </div>
        </div>

        {/* Related Section Skeleton */}
        <div className="space-y-6 mb-14">
          <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
              >
                <div className="aspect-[4/3] bg-slate-200 animate-pulse" />
                <div className="p-5 space-y-2.5">
                  <div className="h-5 w-3/4 bg-slate-200 animate-pulse rounded" />
                  <div className="h-4 w-full bg-slate-100 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

