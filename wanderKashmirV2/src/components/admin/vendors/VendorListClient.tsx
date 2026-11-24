"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Download,
  Building,
  Eye,
  FileText,
  Loader2,
  Store,
} from "lucide-react";
import { AdminVendorListItem, AdminVendorsStats } from "@/lib/admin/vendors";
import {
  approveVendorAction,
  rejectVendorAction,
  suspendVendorAction,
  reactivateVendorAction,
} from "@/actions/adminVendors";
import VendorDetailModal from "./VendorDetailModal";
import VendorKycModal from "./VendorKycModal";
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

interface VendorListClientProps {
  vendors: AdminVendorListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentType: string;
  currentStatus: string;
  currentSearch: string;
  stats: AdminVendorsStats;
  baseRoute?: string;
}

function getVendorStatusKey(v: AdminVendorListItem): "LIVE" | "PENDING" | "SUSPENDED" | "REJECTED" {
  if (v.status === "SUSPENDED") return "SUSPENDED";
  if (v.status === "REJECTED") return "REJECTED";
  if (v.isApproved || v.status === "APPROVED" || v.status === "LIVE") return "LIVE";
  return "PENDING";
}

export default function VendorListClient({
  vendors,
  totalCount,
  currentPage,
  totalPages,
  currentType,
  currentStatus,
  currentSearch,
  stats,
}: VendorListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { adminHref } = useAdminBasePath();

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [selectedVendorForDetails, setSelectedVendorForDetails] =
    useState<AdminVendorListItem | null>(null);
  const [selectedVendorForKyc, setSelectedVendorForKyc] =
    useState<AdminVendorListItem | null>(null);
  const [dialogState, setDialogState] = useState<{
    vendor: AdminVendorListItem;
    action: "approve" | "reject" | "suspend" | "reactivate";
  } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
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
    router.push(qs ? `${adminHref("/admin/vendors")}?${qs}` : adminHref("/admin/vendors"));
  };

  const handleDirectAction = async (
    vendor: AdminVendorListItem,
    action: "approve" | "reactivate"
  ) => {
    setBusyId(vendor.id);
    setFeedback(null);
    try {
      const res =
        action === "approve"
          ? await approveVendorAction(vendor.id)
          : await reactivateVendorAction(vendor.id);
      if (res.success) {
        setFeedback({
          type: "success",
          text: `${vendor.businessName} ${action === "approve" ? "approved" : "reactivated"}.`,
        });
        setSelectedVendorForDetails(null);
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Action failed." });
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      if (currentSearch) params.set("search", currentSearch);
      if (currentStatus && currentStatus !== "ALL") params.set("status", currentStatus);
      if (currentType && currentType !== "ALL") params.set("type", currentType);
      const res = await fetch(`/api/admin/vendors/export?${params.toString()}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wanderkashmir-vendors-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setFeedback({ type: "error", text: "Failed to export vendors CSV." });
    } finally {
      setIsExporting(false);
    }
  };

  const hasFilters = Boolean(currentSearch) || currentStatus !== "ALL" || currentType !== "ALL";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Vendors"
        subtitle="Review partner KYC documents, approve onboarding applications, and manage active suppliers."
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
        searchPlaceholder="Search business name, owner, email, or phone..."
        tabs={[
          { key: "ALL", label: "All", count: stats.totalVendors },
          { key: "PENDING", label: "Pending Approvals", count: stats.pendingApprovals },
          { key: "LIVE", label: "Live", count: stats.liveVendors },
          { key: "SUSPENDED", label: "Suspended", count: stats.suspendedVendors },
          { key: "REJECTED", label: "Rejected", count: stats.rejectedVendors },
        ]}
        activeTab={currentStatus}
        onTabChange={(status) => applyFilters({ status })}
        hasActiveFilters={hasFilters}
        onReset={() => {
          setSearchVal("");
          router.push(adminHref("/admin/vendors"));
        }}
        filters={
          <select
            value={currentType}
            onChange={(e) => applyFilters({ type: e.target.value })}
            aria-label="Filter by vendor type"
            className="bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[var(--season-primary)] cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="HOTEL">Hotel</option>
            <option value="HOMESTAY">Homestay</option>
            <option value="HOUSEBOAT">Houseboat</option>
            <option value="CAB_OPERATOR">Cab Operator</option>
            <option value="TOUR_GUIDE">Tour Guide</option>
          </select>
        }
      />

      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        {vendors.length === 0 ? (
          <AdminEmptyState
            icon={<Store className="w-5 h-5" />}
            title="No vendors found"
            description="No supplier records match the current filter selection."
            action={
              hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchVal("");
                    router.push(adminHref("/admin/vendors"));
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
                  <th className="py-2.5 px-4">Business</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Contact</th>
                  <th className="py-2.5 px-4">KYC</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Joined</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.map((v) => {
                  const statusKey = getVendorStatusKey(v);
                  const isBusy = busyId === v.id;

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                            <Building className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 truncate max-w-[200px]">
                              {v.businessName}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                              {v.user?.name || "—"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80 text-[11px] font-medium">
                          {v.type}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800">{v.phone || "—"}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          {v.email || v.user?.email || "—"}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedVendorForKyc(v)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-slate-500" />
                          <span>Docs</span>
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={statusKey} />
                        {v.rejectionReason && (
                          <div className="text-[11px] text-rose-600 mt-1 max-w-[160px] truncate" title={v.rejectionReason}>
                            {v.rejectionReason}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap tabular-nums">
                        {new Date(v.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedVendorForDetails(v)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                            title="View Details"
                            aria-label={`View ${v.businessName}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {statusKey === "PENDING" && (
                            <>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleDirectAction(v, "approve")}
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] text-white disabled:opacity-50 cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => setDialogState({ vendor: v, action: "reject" })}
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
                              onClick={() => setDialogState({ vendor: v, action: "suspend" })}
                              className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 disabled:opacity-50 cursor-pointer"
                            >
                              Suspend
                            </button>
                          )}

                          {(statusKey === "SUSPENDED" || statusKey === "REJECTED") && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDirectAction(v, "reactivate")}
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
          itemLabel="vendors"
          onPageChange={(page) => applyFilters({ page: String(page) })}
        />
      </div>

      {/* Preserved Modals */}
      {selectedVendorForDetails && (
        <VendorDetailModal
          vendor={selectedVendorForDetails}
          onClose={() => setSelectedVendorForDetails(null)}
          onViewKyc={() => {
            const vendor = selectedVendorForDetails;
            setSelectedVendorForDetails(null);
            setSelectedVendorForKyc(vendor);
          }}
          onTriggerAction={(action) => {
            const vendor = selectedVendorForDetails;
            setSelectedVendorForDetails(null);
            if (action === "approve" || action === "reactivate") {
              handleDirectAction(vendor, action);
            } else {
              setDialogState({ vendor, action });
            }
          }}
        />
      )}

      {selectedVendorForKyc && (
        <VendorKycModal
          vendor={selectedVendorForKyc}
          onClose={() => setSelectedVendorForKyc(null)}
        />
      )}

      <ConfirmActionDialog
        open={Boolean(dialogState)}
        onClose={() => setDialogState(null)}
        title={
          dialogState?.action === "reject"
            ? `Reject "${dialogState.vendor.businessName}"?`
            : `Suspend "${dialogState?.vendor.businessName || ""}"?`
        }
        description={
          dialogState?.action === "reject"
            ? "Rejecting this vendor marks their application as rejected and stores your reason."
            : "Suspending pauses this vendor's storefront until reactivated."
        }
        confirmLabel={dialogState?.action === "reject" ? "Reject Vendor" : "Suspend Vendor"}
        tone={dialogState?.action === "reject" ? "danger" : "warning"}
        requireReason
        reasonLabel={dialogState?.action === "reject" ? "Rejection Reason" : "Suspension Reason"}
        onConfirm={async (reason) => {
          if (!dialogState) return;
          const res =
            dialogState.action === "reject"
              ? await rejectVendorAction(dialogState.vendor.id, reason || "")
              : await suspendVendorAction(dialogState.vendor.id, reason || "");
          if (!res.success) throw new Error(res.error || "Action failed.");
          setFeedback({
            type: "success",
            text: `${dialogState.vendor.businessName} ${dialogState.action === "reject" ? "rejected" : "suspended"}.`,
          });
          router.refresh();
        }}
      />
    </div>
  );
}
