import React from "react";

export default function PlacesLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Hero Skeleton */}
      <div className="bg-slate-900 pt-24 pb-16 sm:pt-28 sm:pb-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="h-6 w-56 bg-slate-800 animate-pulse rounded-full mb-5" />
          <div className="h-10 sm:h-12 w-3/4 max-w-lg bg-slate-800 animate-pulse rounded-2xl mb-4" />
          <div className="h-5 w-full max-w-xl bg-slate-800/60 animate-pulse rounded-lg mb-8" />
          <div className="h-12 w-full max-w-2xl bg-slate-800/80 animate-pulse rounded-2xl" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Filter Pills Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
            <div className="h-4 w-32 bg-slate-200 animate-pulse rounded" />
          </div>
          <div className="flex items-center gap-2 pt-3 overflow-x-hidden">
            <div className="h-9 w-28 bg-slate-200 animate-pulse rounded-xl" />
            <div className="h-9 w-24 bg-slate-200 animate-pulse rounded-xl" />
            <div className="h-9 w-24 bg-slate-200 animate-pulse rounded-xl" />
            <div className="h-9 w-28 bg-slate-200 animate-pulse rounded-xl" />
          </div>
        </div>

        {/* Counter Skeleton */}
        <div className="h-4 w-40 bg-slate-200 animate-pulse rounded mb-6" />

        {/* Grid of Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col"
            >
              <div className="aspect-[16/10] w-full bg-slate-200 animate-pulse" />
              <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col">
                <div className="h-5 w-3/4 bg-slate-200 animate-pulse rounded" />
                <div className="h-4 w-full bg-slate-100 animate-pulse rounded" />
                <div className="h-4 w-5/6 bg-slate-100 animate-pulse rounded" />
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-4 w-32 bg-slate-200 animate-pulse rounded" />
                  <div className="h-4 w-4 bg-slate-200 animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

