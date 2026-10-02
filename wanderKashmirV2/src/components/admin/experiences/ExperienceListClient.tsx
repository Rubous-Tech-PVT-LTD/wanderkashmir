"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Search,
  Plus,
  ExternalLink,
  Edit,
  Loader2,
  CheckCircle,
  EyeOff,
  Sparkles,
  Compass,
  MapPin,
  Clock,
  IndianRupee,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AdminExperienceListItem, AdminExperiencesStats } from "@/lib/admin/experiences";
import { toggleExperienceStatusAction } from "@/actions/adminExperiences";

interface ExperienceListClientProps {
  experiences: AdminExperienceListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentStatus: string;
  currentSearch: string;
  stats: AdminExperiencesStats;
}

export default function ExperienceListClient({
  experiences,
  totalCount,
  currentPage,
  totalPages,
  currentStatus,
  currentSearch,
  stats,
}: ExperienceListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const applyFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || val === "ALL") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    if (!updates.page) {
      params.delete("page");
    }
    router.push(`/admin/experiences?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: searchVal });
  };

  const handleToggleStatus = async (experienceId: string, currentStatus: string) => {
    setTogglingId(experienceId);
    try {
      const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const res = await toggleExperienceStatusAction(experienceId, nextStatus);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to update experience status.");
      }
    } catch {
      alert("Network error communicating with server.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Experiences & Activities
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage curated Kashmiri experiences, activities, pricing, and their tour package associations.
          </p>
        </div>
        <Link
          href="/admin/experiences/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-sm hover:shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Experience</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-slate-500 mt-1">Curated activities in DB</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.active}</div>
          <div className="text-xs text-slate-500 mt-1">Publicly visible</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Inactive</span>
            <EyeOff className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.inactive}</div>
          <div className="text-xs text-slate-500 mt-1">Draft or hidden</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Tour Links</span>
            <Compass className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.totalTourLinks}</div>
          <div className="text-xs text-slate-500 mt-1">Package associations</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map((statusKey) => {
              const active = currentStatus === statusKey;
              return (
                <button
                  key={statusKey}
                  onClick={() => applyFilters({ status: statusKey })}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${
                    active
                      ? "bg-slate-800 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {statusKey === "ALL"
                    ? "All"
                    : statusKey === "ACTIVE"
                    ? "Active"
                    : "Inactive"}
                </button>
              );
            })}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search by title, slug, or destination..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-20 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {searchVal && (
              <button
                type="button"
                onClick={() => {
                  setSearchVal("");
                  applyFilters({ search: null });
                }}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium"
            >
              Go
            </button>
          </form>
        </div>
      </div>

      {/* Experiences Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {experiences.length === 0 ? (
          <div className="p-12 text-center">
            <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-medium text-slate-300">No experiences found</h3>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your search criteria or create a new experience.
            </p>
            {(currentSearch || currentStatus !== "ALL") && (
              <button
                onClick={() => {
                  setSearchVal("");
                  router.push("/admin/experiences");
                }}
                className="mt-4 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-300 hover:text-white"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Duration & Pricing</th>
                  <th className="py-3 px-4">Tour Links</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {experiences.map((exp) => {
                  const isActive = exp.status === "ACTIVE";
                  const isToggling = togglingId === exp.id;
                  const thumb = exp.images?.[0] || "/images/placeholder.jpg";

                  return (
                    <tr
                      key={exp.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Experience Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-700/50">
                            {exp.images?.[0] ? (
                              <Image
                                src={thumb}
                                alt={exp.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500">
                                <Sparkles className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="font-medium text-white truncate hover:text-emerald-400 transition">
                              <Link href={`/admin/experiences/${exp.id}`}>
                                {exp.title}
                              </Link>
                            </div>
                            <div className="text-xs text-slate-500 font-mono truncate">
                              /{exp.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{exp.destination}</span>
                        </div>
                      </td>

                      {/* Duration & Pricing */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 text-xs">
                          {exp.duration && (
                            <div className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <span>{exp.duration}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-slate-300 font-medium">
                            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                            <span>
                              {exp.basePrice !== null && exp.basePrice !== undefined
                                ? `₹${exp.basePrice.toLocaleString("en-IN")}`
                                : "Custom / On request"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tour Links */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-blue-400 border border-blue-500/20">
                          <Compass className="w-3.5 h-3.5" />
                          {exp.toursCount} {exp.toursCount === 1 ? "tour" : "tours"}
                        </span>
                      </td>

                      {/* Status & Quick Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(exp.id, exp.status)}
                          disabled={isToggling}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition border ${
                            isActive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                          }`}
                          title={`Click to ${isActive ? "deactivate" : "activate"}`}
                        >
                          {isToggling ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isActive ? (
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-slate-500" />
                          )}
                          <span>{isActive ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isActive && (
                            <Link
                              href={`/experiences/${exp.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                              title="View Public Experience Page"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/experiences/${exp.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Safety Note & Pagination Footer */}
        <div className="bg-slate-950 px-4 py-3.5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              Safe database rules: Destructive experience deletion is disabled. Toggle status to manage visibility.
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-slate-400 mr-2">
                Page {currentPage} of {totalPages} ({totalCount} items)
              </span>
              <button
                onClick={() => applyFilters({ page: String(currentPage - 1) })}
                disabled={currentPage <= 1}
                className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => applyFilters({ page: String(currentPage + 1) })}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
