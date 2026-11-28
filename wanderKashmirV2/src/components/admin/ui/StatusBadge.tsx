import React from "react";

export type StatusTone =
  | "season"
  | "emerald"
  | "amber"
  | "rose"
  | "blue"
  | "slate"
  | "orange";

const TONE_CLASSES: Record<StatusTone, string> = {
  season: "bg-[var(--season-primary-light)] text-[var(--season-primary-hover)] border-[var(--season-primary)]/25",
  emerald: "bg-[var(--season-primary-light)] text-[var(--season-primary-hover)] border-[var(--season-primary)]/25",
  amber: "bg-amber-50 text-amber-800 border-amber-200/80",
  rose: "bg-rose-50 text-rose-700 border-rose-200/80",
  blue: "bg-sky-50 text-sky-800 border-sky-200/80",
  orange: "bg-orange-50 text-orange-800 border-orange-200/80",
  slate: "bg-slate-100 text-slate-600 border-slate-200/80",
};

const DOT_CLASSES: Record<StatusTone, string> = {
  season: "bg-[var(--season-primary)]",
  emerald: "bg-[var(--season-primary)]",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  blue: "bg-sky-600",
  orange: "bg-orange-500",
  slate: "bg-slate-400",
};

const STATUS_PRESETS: Record<string, { label: string; tone: StatusTone }> = {
  ACTIVE: { label: "Active", tone: "season" },
  PUBLISHED: { label: "Published", tone: "season" },
  LIVE: { label: "Live", tone: "season" },
  APPROVED: { label: "Approved", tone: "season" },
  CONFIRMED: { label: "Confirmed", tone: "season" },
  COMPLETED: { label: "Completed", tone: "emerald" },
  VALIDATED: { label: "Validated", tone: "season" },
  PENDING: { label: "Pending", tone: "amber" },
  NEW: { label: "New", tone: "amber" },
  DRAFT: { label: "Draft", tone: "slate" },
  INACTIVE: { label: "Inactive", tone: "slate" },
  RESEARCHED: { label: "Researched", tone: "blue" },
  STRATEGISED: { label: "Strategised", tone: "blue" },
  GENERATED: { label: "Generated", tone: "blue" },
  CONTACTED: { label: "Quote Sent", tone: "blue" },
  SUSPENDED: { label: "Suspended", tone: "orange" },
  BANNED: { label: "Banned", tone: "rose" },
  REJECTED: { label: "Rejected", tone: "rose" },
  CANCELLED: { label: "Cancelled", tone: "rose" },
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  tone?: StatusTone;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  label,
  tone,
  showDot = true,
  className = "",
}: StatusBadgeProps) {
  const key = (status || "").toUpperCase().trim();
  const preset = STATUS_PRESETS[key];
  const resolvedTone = tone || preset?.tone || "slate";
  const resolvedLabel = label || preset?.label || status || "Unknown";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border whitespace-nowrap ${TONE_CLASSES[resolvedTone]} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_CLASSES[resolvedTone]}`} />}
      <span>{resolvedLabel}</span>
    </span>
  );
}

