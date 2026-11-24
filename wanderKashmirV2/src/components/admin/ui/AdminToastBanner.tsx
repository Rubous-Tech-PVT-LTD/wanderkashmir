import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export interface FeedbackMessage {
  type: "success" | "error" | "warning" | "info";
  text: string;
}

const STYLES: Record<FeedbackMessage["type"], string> = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-900",
  error: "bg-rose-50 border-rose-200 text-rose-900",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
  info: "bg-sky-50 border-sky-200 text-sky-900",
};

const ICON_STYLES: Record<FeedbackMessage["type"], string> = {
  success: "text-emerald-700",
  error: "text-rose-600",
  warning: "text-amber-600",
  info: "text-sky-600",
};

export function AdminToastBanner({
  message,
  onDismiss,
}: {
  message: FeedbackMessage | null;
  onDismiss?: () => void;
}) {
  if (!message) return null;

  const Icon =
    message.type === "success"
      ? CheckCircle2
      : message.type === "error"
      ? AlertCircle
      : message.type === "warning"
      ? AlertTriangle
      : Info;

  return (
    <div
      role={message.type === "error" ? "alert" : "status"}
      className={`flex items-start justify-between gap-3 px-4 py-3 rounded-md border text-xs leading-relaxed ${STYLES[message.type]}`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${ICON_STYLES[message.type]}`} />
        <span className="font-medium break-words">{message.text}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-0.5 rounded hover:bg-black/5 transition-colors shrink-0 cursor-pointer"
          aria-label="Dismiss message"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

