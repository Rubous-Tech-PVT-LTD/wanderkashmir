import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ToursLoading() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20 min-h-screen">
        {/* Header Hero Skeleton */}
        <div className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="container-custom text-center text-white relative z-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-200/80 mb-3">
              Curated Experiences
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3 text-white">
              Tour Packages in Kashmir
            </h1>
            <p className="text-orange-100/70 text-base max-w-xl mx-auto mb-6">
              Hand-crafted itineraries by local experts. Everything included — stays, meals, transfers &amp; guides.
            </p>
            <div className="flex justify-center">
              <div className="h-11 w-44 rounded-full bg-white/15 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container-custom py-8">
          {/* Filters Bar Skeleton */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="h-11 w-full md:w-48 bg-slate-100 animate-pulse rounded-xl" />
              <div className="h-11 w-full md:w-36 bg-slate-100 animate-pulse rounded-xl" />
              <div className="h-11 w-full md:w-44 bg-slate-100 animate-pulse rounded-xl" />
            </div>
            <div className="h-11 w-36 bg-slate-100 animate-pulse rounded-xl hidden md:block" />
          </div>

          {/* Cards Grid Skeleton (6 cards matching itemsPerPage) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full"
              >
                {/* Image Placeholder */}
                <div className="relative h-52 bg-slate-200 animate-pulse">
                  <div className="absolute top-3 left-3 h-6 w-20 bg-slate-300 animate-pulse rounded-lg" />
                  <div className="absolute top-3 right-3 w-8 h-8 bg-white/70 rounded-full" />
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <div className="h-4 w-24 bg-slate-300/70 rounded" />
                    <div className="h-4 w-20 bg-slate-300/70 rounded-full" />
                  </div>
                </div>

                {/* Body Placeholder */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="h-5 w-3/4 bg-slate-200 animate-pulse rounded mb-2.5" />
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-4 w-12 bg-orange-100 animate-pulse rounded" />
                    <div className="h-3 w-20 bg-slate-100 animate-pulse rounded" />
                  </div>
                  <div className="flex gap-1.5 flex-wrap mb-4">
                    <div className="h-6 w-24 bg-slate-100 animate-pulse rounded-lg" />
                    <div className="h-6 w-20 bg-slate-100 animate-pulse rounded-lg" />
                    <div className="h-6 w-28 bg-slate-100 animate-pulse rounded-lg" />
                  </div>
                  <div className="flex items-end justify-between mt-auto pt-3 border-t border-slate-100 gap-2">
                    <div>
                      <div className="h-3 w-16 bg-slate-100 animate-pulse rounded mb-1" />
                      <div className="h-6 w-24 bg-slate-200 animate-pulse rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-14 bg-slate-100 animate-pulse rounded-lg" />
                      <div className="h-8 w-24 bg-emerald-100 animate-pulse rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Placeholder */}
          <div className="flex justify-center items-center gap-2 mt-10">
            <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-xl" />
            <div className="h-10 w-10 bg-slate-200 animate-pulse rounded-xl" />
            <div className="h-10 w-10 bg-slate-100 animate-pulse rounded-xl" />
            <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-xl" />
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}
