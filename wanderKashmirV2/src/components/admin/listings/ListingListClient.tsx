"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  Download,
  Building,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  IndianRupee,
  Bed,
  Users,
} from "lucide-react";
import { AdminListingItem, AdminListingsStats } from "@/lib/admin/listings";
import {
  approveListingAction,
  rejectListingAction,
  suspendListingAction,
  reactivateListingAction,
} from "@/actions/adminListings";
import ListingDetailModal from "./ListingDetailModal";
import ListingActionDialog from "./ListingActionDialog";

interface ListingListClientProps {
  listings: AdminListingItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentType: string;
  currentStatus: string;
  currentSearch: string;
  stats: AdminListingsStats;
  moduleTitle?: string;
  moduleSubtitle?: string;
  fixedStatusTab?: "PENDING" | "APPROVED" | "LIVE" | null;
}

export default function ListingListClient({
  listings,
  totalCount,
  currentPage,
  totalPages,
  currentType,
  currentStatus,
  currentSearch,
  stats,
  moduleTitle = "Listing Management",
  moduleSubtitle = "Review and manage Kashmiri stays, hotels, resorts, homestays, and houseboats.",
  fixedStatusTab = null,
}: ListingListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [selectedListing, setSelectedListing] = useState<AdminListingItem | null>(null);

  // Dialog state for reject / suspend
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    listing: AdminListingItem | null;
    actionType: "REJECT" | "SUSPEND";
  }>({
    isOpen: false,
    listing: null,
    actionType: "REJECT",
  });

  const [processingId, setProcessingId] = useState<string | null>(null);

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

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: searchVal });
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await approveListingAction(id);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to approve listing.");
      }
    } catch {
      alert("Error approving listing.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReactivate = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await reactivateListingAction(id);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to reactivate listing.");
      }
    } catch {
      alert("Error reactivating listing.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmActionDialog = async (reason: string) => {
    if (!actionDialog.listing) return;
    const { id } = actionDialog.listing;
    setProcessingId(id);

    try {
      if (actionDialog.actionType === "REJECT") {
        const res = await rejectListingAction(id, reason);
        if (!res.success) throw new Error(res.error || "Failed to reject listing.");
      } else if (actionDialog.actionType === "SUSPEND") {
        const res = await suspendListingAction(id, reason);
        if (!res.success) throw new Error(res.error || "Failed to suspend listing.");
      }
      router.refresh();
    } finally {
      setProcessingId(null);
    }
  };

  const handleExportCsv = () => {
    const exportStatus = fixedStatusTab || currentStatus;
    const url = `/api/admin/listings/export?status=${exportStatus}&type=${currentType}&search=${encodeURIComponent(
      searchVal
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header and KPI cards */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {moduleTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{moduleSubtitle}</p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-white border border-slate-700 shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-emerald-400" /> Export CSV
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs font-medium text-slate-400">Total Listings</div>
          <div className="text-xl font-bold text-white mt-1">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Database records</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs font-medium text-slate-400">08. Pending Approvals</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{stats.pendingApprovals}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Awaiting verification</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs font-medium text-slate-400">09. Live Listings</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{stats.liveListings}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Approved & active</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs font-medium text-slate-400">Suspended / Rejected</div>
          <div className="text-xl font-bold text-rose-400 mt-1">
            {stats.suspended + stats.rejected}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Hidden from catalog</div>
        </div>
      </div>

      {/* Status Tabs (if not locked to fixed module view) */}
      {!fixedStatusTab && (
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2 text-xs font-semibold">
          {[
            { id: "ALL", label: "All Listings", count: stats.total },
            { id: "PENDING", label: "08. Listing Approvals", count: stats.pendingApprovals },
            { id: "APPROVED", label: "09. Live Listings", count: stats.liveListings },
            { id: "SUSPENDED", label: "Suspended", count: stats.suspended },
            { id: "REJECTED", label: "Rejected", count: stats.rejected },
          ].map((tab) => {
            const isActive = currentStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => applyFilters({ status: tab.id })}
                className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search by property, vendor, location..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </form>

        {/* Property Type Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={currentType}
              onChange={(e) => applyFilters({ type: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Property Types</option>
              <option value="HOTEL">Hotels</option>
              <option value="RESORT">Resorts</option>
              <option value="HOMESTAY">Homestays</option>
              <option value="HOUSEBOAT">Houseboats</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Vendor / Partner
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Price / Night
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Rooms & Specs
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {listings.length > 0 ? (
                listings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Property Name & Location */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-white">{item.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{item.location}</span>
                      </div>
                    </td>

                    {/* Property Type Badge */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {item.propertyType}
                      </span>
                    </td>

                    {/* Vendor Information */}
                    <td className="px-6 py-4">
                      {item.vendorProfile ? (
                        <div>
                          <div className="font-semibold text-xs text-slate-200">
                            {item.vendorProfile.businessName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {item.vendorProfile.vendorId || "Pending ID"} • {item.vendorProfile.type}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">No Vendor</span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs font-bold text-emerald-400 flex items-center">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {item.pricePerNight.toLocaleString()}
                      </div>
                    </td>

                    {/* Rooms & Specs */}
                    <td className="px-6 py-4 text-xs text-slate-300">
                      <div>
                        {item.totalRooms} Rooms ({item.availableRooms} avail)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.bedrooms} BR • {item.guests} Guests
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {item.isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Live
                        </span>
                      ) : item.status === "REJECTED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      ) : item.status === "SUSPENDED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Review / Eye Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedListing(item)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                          title="Review Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Approve Button (if pending or suspended/rejected) */}
                        {!item.isApproved && item.status !== "REJECTED" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setActionDialog({
                                  isOpen: true,
                                  listing: item,
                                  actionType: "REJECT",
                                })
                              }
                              disabled={processingId === item.id}
                              className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition-colors"
                              title="Reject Listing"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApprove(item.id)}
                              disabled={processingId === item.id}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {processingId === item.id ? "..." : "Approve"}
                            </button>
                          </>
                        )}

                        {/* Suspend Button (if live/approved) */}
                        {item.isApproved && (
                          <button
                            type="button"
                            onClick={() =>
                              setActionDialog({
                                isOpen: true,
                                listing: item,
                                actionType: "SUSPEND",
                              })
                            }
                            disabled={processingId === item.id}
                            className="p-1.5 text-amber-400 hover:text-amber-300 rounded-lg hover:bg-amber-500/10 transition-colors"
                            title="Suspend Listing"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Reactivate Button (if rejected or suspended) */}
                        {(item.status === "REJECTED" || item.status === "SUSPENDED") && (
                          <button
                            type="button"
                            onClick={() => handleReactivate(item.id)}
                            disabled={processingId === item.id}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {processingId === item.id ? "..." : "Reactivate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-xs">
                    No listings found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing Page {currentPage} of {totalPages} ({totalCount} items)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => applyFilters({ page: String(currentPage - 1) })}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => applyFilters({ page: String(currentPage + 1) })}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onApprove={handleApprove}
          onReject={(item) => {
            setSelectedListing(null);
            setActionDialog({
              isOpen: true,
              listing: item,
              actionType: "REJECT",
            });
          }}
          onSuspend={(item) => {
            setSelectedListing(null);
            setActionDialog({
              isOpen: true,
              listing: item,
              actionType: "SUSPEND",
            });
          }}
          onReactivate={handleReactivate}
          onListingUpdated={() => router.refresh()}
        />
      )}

      {/* Action Dialog (Reject / Suspend Reason) */}
      <ListingActionDialog
        isOpen={actionDialog.isOpen}
        onClose={() => setActionDialog({ isOpen: false, listing: null, actionType: "REJECT" })}
        onConfirm={handleConfirmActionDialog}
        propertyName={actionDialog.listing?.name || ""}
        title={actionDialog.actionType === "REJECT" ? "Reject Property Listing" : "Suspend Live Listing"}
        description={
          actionDialog.actionType === "REJECT"
            ? "Provide an audit reason for rejecting this property. The reason will be recorded and visible to admins."
            : "Provide an audit reason for suspending this live property listing. It will immediately be hidden from the public catalog."
        }
        actionLabel={actionDialog.actionType === "REJECT" ? "Reject Listing" : "Suspend Listing"}
        isDestructive={true}
        requireReason={true}
      />
    </div>
  );
}
