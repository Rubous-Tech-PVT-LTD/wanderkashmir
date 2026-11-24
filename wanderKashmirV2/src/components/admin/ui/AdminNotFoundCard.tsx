import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

interface AdminNotFoundCardProps {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export function AdminNotFoundCard({
  title = "Record not found",
  description = "The item you are looking for does not exist or may have been removed.",
  backHref = "/admin",
  backLabel = "Return to Dashboard",
}: AdminNotFoundCardProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-8 text-center shadow-xs">
        <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-5 h-5" />
        </div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{description}</p>
        <div className="mt-5">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{backLabel}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

