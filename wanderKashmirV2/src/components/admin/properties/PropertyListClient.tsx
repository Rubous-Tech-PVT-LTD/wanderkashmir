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
  Building,
  Bed,
  Star,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import { AdminPropertyListItem, AdminPropertiesStats } from "@/lib/admin/properties";
import { togglePropertyApprovalAction } from "@/actions/adminProperties";

interface PropertyListClientProps {
  properties: AdminPropertyListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentType: string;
  currentStatus: string;
  currentSearch: string;
  stats: AdminPropertiesStats;
}

const TYPE_LABELS: Record<string, string> = {
  HOTEL: "Hotel",
  RESORT: "Resort",
  HOMESTAY: "Homestay",
  HOUSEBOAT: "Houseboat",
};

export default function PropertyListClient({
  properties,
  totalCount,
  currentPage,
  totalPages,
  currentType,
  currentStatus,
  currentSearch,
  stats,
}: PropertyListClientProps) {
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
    // Reset to page 1 on filter/search change
    if (!updates.page) {
      params.delete("page");
    }
    router.push(`/admin/properties?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: searchVal });
  };

  const handleToggleApproval = async (propertyId: string, currentApproved: boolean) => {
    setTogglingId(propertyId);
    try {
      const res = await togglePropertyApprovalAction(propertyId, !currentApproved);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to update approval status.");
      }
    } catch {
      alert("Error communicating with server.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Create CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Properties & Stays
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage Kashmiri hotels, alpine resorts, heritage homestays, and Dal Lake houseboats ({totalCount} total)
          </p>
        </div>

        <Link
          href="/admin/properties/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Property
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs font-medium text-slate-400">Approved & Live</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{stats.approved}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Publicly visible</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs font-medium text-slate-400">Pending Review</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{stats.pending}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Awaiting verification</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs font-medium text-slate-400">Suspended / Rejected</div>
          <div className="text-xl font-bold text-rose-400 mt-1">{stats.suspended + stats.rejected}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Hidden from catalog</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs font-medium text-slate-400">Property Taxonomy</div>
          <div className="text-xs text-slate-300 font-semibold mt-1 flex flex-wrap gap-1">
            <span className="text-sky-400">{stats.byType.hotel} Hotels</span> • 
            <span className="text-purple-400">{stats.byType.resort} Resorts</span> • 
            <span className="text-amber-400">{stats.byType.homestay} Homestays</span> • 
            <span className="text-teal-400">{stats.byType.houseboat} Houseboats</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Property.propertyType</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search property, location, vendor..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </form>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* PropertyType Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Type:</span>
            <select
              value={currentType}
              onChange={(e) => applyFilters({ type: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Accommodations</option>
              <option value="HOTEL">Hotels</option>
              <option value="RESORT">Resorts</option>
              <option value="HOMESTAY">Homestays</option>
              <option value="HOUSEBOAT">Houseboats</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={currentStatus}
              onChange={(e) => applyFilters({ status: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved & Live</option>
              <option value="PENDING">Pending Approval</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Base Rate</th>
                <th className="py-3 px-4">Rooms / Reviews</th>
                <th className="py-3 px-4">Approval</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {properties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Building className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                    No properties match the selected criteria.
                  </td>
                </tr>
              ) : (
                properties.map((p) => {
                  const isLiveApproved = p.isApproved && p.status === "APPROVED";
                  const isToggling = togglingId === p.id;
                  const thumb = p.images && p.images.length > 0 ? p.images[0] : null;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0 relative border border-slate-700/50">
                            {thumb ? (
                              <Image
                                src={thumb}
                                alt={p.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600">
                                <Building className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate max-w-[200px] sm:max-w-[240px]">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                              Vendor: {p.vendorProfile?.businessName || "Direct / Admin"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Property Type */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                            p.propertyType === "HOTEL"
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                              : p.propertyType === "RESORT"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : p.propertyType === "HOMESTAY"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                          }`}
                        >
                          {TYPE_LABELS[p.propertyType] || p.propertyType}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[150px]">{p.location}</span>
                        </div>
                      </td>

                      {/* Base Rate */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-emerald-400">
                          ₹{Math.round(p.pricePerNight).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-slate-500">per night</div>
                      </td>

                      {/* Rooms / Reviews */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-slate-300" title="Room Types">
                            <Bed className="w-3.5 h-3.5 text-slate-500" />
                            <span>{p.roomTypesCount}</span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-400" title="Reviews">
                            <Star className="w-3.5 h-3.5 fill-amber-400/20" />
                            <span>{p.reviewsCount}</span>
                          </div>
                        </div>
                      </td>

                      {/* Approval Status */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              isLiveApproved
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : p.status === "PENDING"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {isLiveApproved ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <EyeOff className="w-3 h-3" />
                            )}
                            {isLiveApproved ? "Approved & Live" : p.status}
                          </span>
                          {p.rejectionReason && (
                            <span className="text-[10px] text-slate-500 truncate max-w-[140px]" title={p.rejectionReason}>
                              {p.rejectionReason}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Approval Toggle */}
                          <button
                            onClick={() => handleToggleApproval(p.id, isLiveApproved)}
                            disabled={isToggling}
                            title={isLiveApproved ? "Suspend / Unapprove" : "Approve Listing"}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isLiveApproved
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                          >
                            {isToggling ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : isLiveApproved ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Edit */}
                          <Link
                            href={`/admin/properties/${p.id}`}
                            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                            title="Edit Property & Rooms"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          {/* View on Public */}
                          {isLiveApproved && (
                            <Link
                              href={`/stays/${p.id}`}
                              target="_blank"
                              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                              title="View Public Stay Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Pagination & Safety Notice */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Delete: <strong className="text-slate-400">NOT IMPLEMENTED</strong> (Soft unapproval preserves historical bookings)</span>
          </div>

          <div className="flex items-center gap-2">
            <span>
              Page {currentPage} of {totalPages} ({totalCount} items)
            </span>
            <div className="flex gap-1 ml-2">
              <button
                onClick={() => applyFilters({ page: String(currentPage - 1) })}
                disabled={currentPage <= 1}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Prev
              </button>
              <button
                onClick={() => applyFilters({ page: String(currentPage + 1) })}
                disabled={currentPage >= totalPages}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
