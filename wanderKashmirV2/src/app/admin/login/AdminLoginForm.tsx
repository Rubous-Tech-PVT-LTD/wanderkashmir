"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdminAction } from "@/actions/adminAuth";
import { Lock, Mail, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";

interface AdminLoginFormProps {
  initialFrom?: string;
  isWanderAdminAlias?: boolean;
}

export default function AdminLoginForm({
  initialFrom,
  isWanderAdminAlias,
}: AdminLoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginAdminAction(formData);
      if (res.success) {
        const isAlias =
          isWanderAdminAlias ||
          (typeof window !== "undefined" &&
            window.location.pathname.startsWith("/wander-admin"));
        const defaultPath = isAlias ? "/wander-admin" : "/admin";
        const target =
          initialFrom &&
          (initialFrom.startsWith("/admin") || initialFrom.startsWith("/wander-admin"))
            ? initialFrom
            : defaultPath;
        router.push(target);
        router.refresh();
      } else {
        setError(res.error || "Authentication failed. Please verify credentials.");
      }
    } catch {
      setError("An unexpected network or server error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="leading-snug">{error}</div>
        </div>
      )}

      <div>
        <label
          htmlFor="admin-email"
          className="block text-xs font-medium text-slate-700 mb-1.5"
        >
          Email Address
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="admin-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="admin@wanderkashmir.com"
            className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[var(--season-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--season-primary)]/15"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="admin-password"
          className="block text-xs font-medium text-slate-700 mb-1.5"
        >
          Password
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[var(--season-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--season-primary)]/15"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center rounded-md bg-[var(--season-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[var(--season-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--season-primary)]/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign In</span>
        )}
      </button>
    </form>
  );
}
