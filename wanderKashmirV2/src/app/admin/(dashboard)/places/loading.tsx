export default function AdminPlacesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 rounded-md" />
          <div className="h-3.5 w-80 bg-slate-100 rounded" />
        </div>
        <div className="h-9 w-36 bg-slate-200 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white border border-slate-200/80 rounded-lg" />
        ))}
      </div>

      <div className="h-12 bg-white border border-slate-200/80 rounded-lg" />
      <div className="h-80 bg-white border border-slate-200/80 rounded-lg" />
    </div>
  );
}
