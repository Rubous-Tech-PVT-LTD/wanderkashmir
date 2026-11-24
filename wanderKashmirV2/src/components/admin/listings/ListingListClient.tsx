"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Download,
  Building,
  MapPin,
  Eye,
  Loader2,
} from "lucide-react";
import { AdminListingItem, AdminListingsStats } from "@/lib/admin/listings";
import {
  approveListingAction,
  rejectListingAction,
  suspendListingAction,
  reactivateListingAction,
} from "@/actions/adminListings";
import ListingDetailModal from "./ListingDetailModal";
import {
  AdminPageHeader,
  AdminFilterBar,
  AdminToastBanner,
  AdminPagination,
  AdminEmptyState,
  ConfirmActionDialog,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

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

function getListingStatusKey(l: AdminListingItem): "LIVE" | "PENDING" | "SUSPENDED" | "REJECTED" {
  if (l.status === "SUSPENDED") return "SUSPENDED";
  if (l.status === "REJECTED") return "REJECTED";
  if (l.isApproved || l.status === "APPROVED" || l.status === "LIVE") return "LIVE";
  return "PENDING";
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
}: ListingListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { adminHref } = useAdminBasePath();

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [selectedListing, setSelectedListing] = useState<AdminListingItem | null>(null);
  const [dialogState, setDialogState] = useState<{
    listing: AdminListingItem;
    action: "REJECT" | "SUSPEND";
  } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

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
    const qs = params.toString();
    router.push(qs ? `${adminHref("/admin/listings")}?${qs}` : adminHref("/admin/listings"));
  };

  const handleDirectAction = async (
    listing: AdminListingItem,
    action: "approve" | "reactivate"
  ) => {
    setProcessingId(listing.id);
    setFeedback(null);
    try {
      const res =
        action === "approve"
          ? await approveListingAction(listing.id)
          : await reactivateListingAction(listing.id);
      if (res.success) {
        setFeedback({
          type: "success",
          text: `"${listing.name}" ${action === "approve" ? "approved and live" : "reactivated"}.`,
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Action failed." });
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      if (currentSearch) params.set("search", currentSearch);
      if (currentStatus && currentStatus !== "ALL") params.set("status", currentStatus);
      if (currentType && currentType !== "ALL") params.set("type", currentType);
      const res = await fetch(`/api/admin/listings/export?${params.toString()}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wanderkashmir-listings-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setFeedback({ type: "error", text: "Failed to export listings CSV." });
    } finally {
      setIsExporting(false);
    }
  };

  const hasFilters = Boolean(currentSearch) || currentStatus !== "ALL" || currentType !== "ALL";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Listings"
        subtitle="Review vendor stay submissions, approve hotels and houseboats, and manage live inventory."
        actions={
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-slate-500" />}
            <span>Export CSV</span>
          </button>
        }
      />

      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      <AdminFilterBar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        onSearchSubmit={() => applyFilters({ search: searchVal.trim() })}
        searchPlaceholder="Search property name, location, or vendor..."
        tabs={[
          { key: "ALL", label: "All", count: stats.total },
          { key: "PENDING", label: "Pending Approvals", count: stats.pendingApprovals },
          { key: "LIVE", label: "Live", count: stats.liveListings },
          { key: "SUSPENDED", label: "Suspended", count: stats.suspended },
          { key: "REJECTED", label: "Rejected", count: stats.rejected },
        ]}
        activeTab={currentStatus}
        onTabChange={(status) => applyFilters({ status })}
        hasActiveFilters={hasFilters}
        onReset={() => {
          setSearchVal("");
          router.push(adminHref("/admin/listings"));
        }}
        filters={
          <select
            value={currentType}
            onChange={(e) => applyFilters({ type: e.target.value })}
            aria-label="Filter by property type"
            className="bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[var(--season-primary)] cursor-pointer"
          >
            <option value="ALL">All Property Types</option>
            <option value="HOTEL">Hotel</option>
            <option value="RESORT">Resort</option>
            <option value="HOMESTAY">Homestay</option>
            <option value="HOUSEBOAT">Houseboat</option>
          </select>
        }
      />

      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        {listings.length === 0 ? (
          <AdminEmptyState
            icon={<Building className="w-5 h-5" />}
            title="No listings found"
            description="No stay listings match the active filters."
            action={
              hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchVal("");
                    router.push(adminHref("/admin/listings"));
                  }}
                  className="px-3.5 py-2 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Reset Filters
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Property</th>
                  <th className="py-2.5 px-4">Vendor</th>
                  <th className="py-2.5 px-4">Location</th>
                  <th className="py-2.5 px-4">Rate</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((item) => {
                  const statusKey = getListingStatusKey(item);
                  const isBusy = processingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-500">{item.propertyType}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {item.vendorProfile?.businessName || "Direct / Admin"}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{item.location}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-900 tabular-nums whitespace-nowrap">
                        ₹{item.pricePerNight.toLocaleString("en-IN")}/night
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={statusKey} />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedListing(item)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                            title="Inspect Listing"
                            aria-label={`Inspect ${item.name}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {statusKey === "PENDING" && (
                            <>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleDirectAction(item, "approve")}
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] text-white disabled:opacity-50 cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => setDialogState({ listing: item, action: "REJECT" })}
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 disabled:opacity-50 cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {statusKey === "LIVE" && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => setDialogState({ listing: item, action: "SUSPEND" })}
                              className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 disabled:opacity-50 cursor-pointer"
                            >
                              Suspend
                            </button>
                          )}

                          {(statusKey === "SUSPENDED" || statusKey === "REJECTED") && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDirectAction(item, "reactivate")}
                              className="px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--season-primary-light)] hover:bg-[var(--season-primary)]/15 text-[var(--season-primary-hover)] border border-[var(--season-primary)]/25 disabled:opacity-50 cursor-pointer"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          itemLabel="listings"
          onPageChange={(page) => applyFilters({ page: String(page) })}
        />
      </div>

      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onApprove={async () => {
            const target = selectedListing;
            setSelectedListing(null);
            await handleDirectAction(target, "approve");
          }}
          onReject={(listing) => {
            setSelectedListing(null);
            setDialogState({ listing, action: "REJECT" });
          }}
          onSuspend={(listing) => {
            setSelectedListing(null);
            setDialogState({ listing, action: "SUSPEND" });
          }}
          onReactivate={async () => {
            const target = selectedListing;
            setSelectedListing(null);
            await handleDirectAction(target, "reactivate");
          }}
          onListingUpdated={() => {
            router.refresh();
          }}
        />
      )}

      <ConfirmActionDialog
        open={Boolean(dialogState)}
        onClose={() => setDialogState(null)}
        title={
          dialogState?.action === "REJECT"
            ? `Reject "${dialogState.listing.name}"?`
            : `Suspend "${dialogState?.listing.name || ""}"?`
        }
        description={
          dialogState?.action === "REJECT"
            ? "Rejecting marks this stay listing as rejected and records the reason."
            : "Suspending removes this stay from public booking pages until reactivated."
        }
        confirmLabel={dialogState?.action === "REJECT" ? "Reject Listing" : "Suspend Listing"}
        tone={dialogState?.action === "REJECT" ? "danger" : "warning"}
        requireReason
        reasonLabel={dialogState?.action === "REJECT" ? "Rejection Reason" : "Suspension Reason"}
        onConfirm={async (reason) => {
          if (!dialogState) return;
          const res =
            dialogState.action === "REJECT"
              ? await rejectListingAction(dialogState.listing.id, reason || "")
              : await suspendListingAction(dialogState.listing.id, reason || "");
          if (!res.success) throw new Error(res.error || "Action failed.");
          setFeedback({
            type: "success",
            text: `"${dialogState.listing.name}" ${dialogState.action === "REJECT" ? "rejected" : "suspended"}.`,
          });
          router.refresh();
        }}
      />
    </div>
  );
}
