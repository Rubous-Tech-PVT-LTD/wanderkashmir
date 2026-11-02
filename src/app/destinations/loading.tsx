export default function DestinationsLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 font-sans">
      {/* Top Breadcrumb & Title Skeleton */}
      <div className="w-full bg-white pt-3 pb-3 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-4 w-32 bg-slate-200 animate-pulse rounded mb-2" />
          <div className="h-8 w-64 bg-slate-200 animate-pulse rounded" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Sidebar Skeleton */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6">
              <div className="space-y-3 pb-6 border-b border-slate-100">
                <div className="h-4 w-24 bg-slate-200 animate-pulse rounded" />
                <div className="h-8 bg-slate-100 animate-pulse rounded-lg" />
                <div className="h-8 bg-slate-100 animate-pulse rounded-lg" />
                <div className="h-8 bg-slate-100 animate-pulse rounded-lg" />
                <div className="h-8 bg-slate-100 animate-pulse rounded-lg" />
                <div className="h-8 bg-slate-100 animate-pulse rounded-lg" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-32 bg-slate-200 animate-pulse rounded" />
                <div className="h-7 bg-slate-100 animate-pulse rounded-lg" />
                <div className="h-7 bg-slate-100 animate-pulse rounded-lg" />
                <div className="h-7 bg-slate-100 animate-pulse rounded-lg" />
                <div className="h-7 bg-slate-100 animate-pulse rounded-lg" />
                <div className="h-7 bg-slate-100 animate-pulse rounded-lg" />
                <div className="h-7 bg-slate-100 animate-pulse rounded-lg" />
              </div>
            </div>
          </aside>

          {/* Cards Grid Skeleton */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
              <div className="h-6 w-48 bg-slate-200 animate-pulse rounded" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs"
                >
                  <div className="h-48 sm:h-56 w-full bg-slate-100 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-3/4 bg-slate-200 animate-pulse rounded" />
                    <div className="h-4 w-full bg-slate-100 animate-pulse rounded" />
                    <div className="h-4 w-2/3 bg-slate-100 animate-pulse rounded" />
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <div className="h-4 w-16 bg-slate-200 animate-pulse rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
