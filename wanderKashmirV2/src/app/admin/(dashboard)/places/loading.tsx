import { Loader2 } from "lucide-react";

export default function AdminPlacesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-slate-800 rounded-lg" />
          <div className="h-4 w-96 bg-slate-850 rounded" />
        </div>
        <div className="h-10 w-36 bg-slate-800 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-900/60 border border-slate-800 rounded-xl" />
        ))}
      </div>

      <div className="h-14 bg-slate-900/60 border border-slate-800 rounded-xl" />

      <div className="h-96 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin opacity-50" />
      </div>
    </div>
  );
}

