import Link from "next/link";
import { ArrowLeft, Clock, ShieldAlert, LucideIcon } from "lucide-react";

interface MigrationPendingViewProps {
  title: string;
  description: string;
  icon: LucideIcon;
  v1RouteName: string;
  stats?: { label: string; value: number | string }[];
}

export default function MigrationPendingView({
  title,
  description,
  icon: Icon,
  v1RouteName,
  stats,
}: MigrationPendingViewProps) {
  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin"
          className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Link>
      </div>

      {/* Main Container Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-5 shadow-lg shadow-amber-500/5">
          <Icon className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          {description}
        </p>

        {stats && stats.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 min-w-[120px]"
              >
                <div className="text-lg font-bold text-white">{s.value}</div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 border border-slate-800 px-4 py-1.5 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Module Migration Status: <strong>Pending Next Phase</strong></span>
          </div>

          <p className="text-xs text-slate-500 mt-3 max-w-md mx-auto">
            Full editing and CRUD management for {title.toLowerCase()} remains securely handled by the legacy V1 Admin ({v1RouteName}). No mutation handlers exist in V2 yet.
          </p>
        </div>
      </div>
    </div>
  );
}
