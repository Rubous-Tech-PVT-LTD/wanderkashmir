"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, Mail, XCircle, CheckCircle2, ArrowRight, LogOut, Eye, EyeOff } from "lucide-react";

type PendingState = {
  businessName: string | null;
  vendorEmail: string | null;
  status: string;
  rejectionReason: string | null;
};

export default function VendorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingState, setPendingState] = useState<PendingState | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/vendor-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // If vendor is not yet approved, show the pending card
      if (!data.isApproved) {
        setPendingState({
          businessName: data.businessName,
          vendorEmail: data.vendorEmail || email,
          status: data.status,
          rejectionReason: data.rejectionReason,
        });
        return;
      }

      // Approved → go to dashboard
      router.push("/partner/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/vendor-logout", { method: "POST" });
    setPendingState(null);
    router.refresh();
  };

  // ── REJECTED CARD ──
  if (pendingState && pendingState.status === "REJECTED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          {/* Top bar */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/15 rounded-full flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-lg leading-tight">Application Rejected</p>
              <p className="text-red-200 text-sm">WanderKashmir Partner Program</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1.5">Reason</p>
              <p className="text-red-800 text-sm font-medium leading-relaxed">
                {pendingState.rejectionReason || "Please contact support for more information."}
              </p>
            </div>
            <p className="text-slate-500 text-sm text-center">
              You can resubmit with updated documents.
            </p>
            <a
              href="/partner/register"
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
            >
              Resubmit Application <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={handleSignOut}
              className="w-full border border-slate-200 text-slate-500 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PENDING CARD ──
  if (pendingState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          {/* Top gradient bar */}
          <div
            className="px-6 py-5 flex items-center gap-4"
            style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}
          >
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center shrink-0 ring-2 ring-orange-500/30">
              <Clock className="w-6 h-6 text-orange-400 animate-pulse" />
            </div>
            <div>
              <p className="text-white font-black text-lg leading-tight">Application Under Review</p>
              <p className="text-slate-400 text-sm">WanderKashmir Partner Program</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Status badge */}
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-amber-900 text-sm">Pending Approval</p>
                <p className="text-amber-700 text-xs mt-0.5">Expected review time: 24–48 hours</p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-slate-700 text-sm font-medium">Documents submitted &amp; received</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 font-black text-xs">2</div>
                <span className="text-amber-900 text-sm font-medium">Admin review in progress ⏳</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 opacity-40">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-400 font-black text-xs">3</div>
                <span className="text-slate-400 text-sm font-medium">Dashboard access &amp; go live 🚀</span>
              </div>
            </div>

            {/* Email note */}
            <div className="flex items-start gap-3 bg-sky-50 border border-sky-100 rounded-xl p-3.5">
              <Mail className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <p className="text-sky-800 text-xs leading-relaxed">
                Confirmation email will be sent to{" "}
                <strong className="font-bold">{pendingState.vendorEmail}</strong> once approved.
              </p>
            </div>

            {/* Business info */}
            {pendingState.businessName && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs">
                <p className="text-slate-400 font-bold uppercase tracking-wider mb-1.5">Your Application</p>
                <p className="text-slate-700"><span className="text-slate-400">Business: </span><strong>{pendingState.businessName}</strong></p>
              </div>
            )}

            <button
              onClick={handleSignOut}
              className="w-full border border-slate-200 text-slate-500 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── LOGIN FORM ──
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Vendor Portal</h1>
          <p className="text-slate-500 mt-2">Sign in to manage your business</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email / Vendor ID</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. contact@business.com or WK-75182"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-xs font-medium text-[var(--primary)] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Eye className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--primary)] text-white font-bold py-2.5 rounded-lg hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-slate-600">
              New partner? <Link href="/partner/register" className="text-[var(--primary)] font-semibold hover:underline">Register here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
