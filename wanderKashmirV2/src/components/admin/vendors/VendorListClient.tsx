"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  Download,
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  FileText,
  Loader2,
  Hotel,
  Home,
  Car,
  Compass,
  ChevronLeft,
  ChevronRight,
  Filter,
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
import VendorActionDialog, { VendorActionType } from "./VendorActionDialog";

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

export default function VendorListClient({
  vendors,
  totalCount,
  currentPage,
  totalPages,
  currentType,
  currentStatus,
  currentSearch,
  stats,
  baseRoute = "/admin/vendors",
}: VendorListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isWanderAdmin = pathname.startsWith("/wander-admin");
  const effectiveBase = isWanderAdmin ? baseRoute.replace(/^\/admin/, "/wander-admin") : baseRoute;

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [selectedVendorForDetails, setSelectedVendorForDetails] = useState<AdminVendorListItem | null>(null);
  const [selectedVendorForKyc, setSelectedVendorForKyc] = useState<AdminVendorListItem | null>(null);
  const [actionDialogVendor, setActionDialogVendor] = useState<AdminVendorListItem | null>(null);
  const [actionType, setActionType] = useState<VendorActionType>("approve");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

    const queryStr = params.toString();
    router.push(queryStr ? `${pathname}?${queryStr}` : pathname);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: searchVal });
  };

  const handleOpenAction = (vendor: AdminVendorListItem, type: VendorActionType) => {
    setActionDialogVendor(vendor);
    setActionType(type);
  };

  const handleExecuteAction = async (vendorId: string, reason?: string) => {
    setIsProcessing(true);
    setFeedbackMessage(null);

    try {
      let res;
      if (actionType === "approve") {
        res = await approveVendorAction(vendorId);
      } else if (actionType === "reject") {
        res = await rejectVendorAction(vendorId, reason || "");
      } else if (actionType === "suspend") {
        res = await suspendVendorAction(vendorId, reason || "");
      } else if (actionType === "reactivate") {
        res = await reactivateVendorAction(vendorId);
      }

      if (res?.success) {
        setFeedbackMessage({
          type: "success",
          text: `Vendor successfully ${
            actionType === "approve"
              ? "approved and assigned Vendor ID: " + (res.vendorId || "")
              : actionType === "reject"
              ? "rejected"
              : actionType === "suspend"
              ? "suspended"
              : "reactivated"
          }.`,
        });
        setActionDialogVendor(null);
        setSelectedVendorForDetails(null);
        router.refresh();
      } else {
        setFeedbackMessage({
          type: "error",
          text: res?.error || "Action failed to execute. Please try again.",
        });
      }
    } catch {
      setFeedbackMessage({
        type: "error",
        text: "A network error occurred while communicating with the server.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (currentSearch) params.set("search", currentSearch);
    if (currentType !== "ALL") params.set("type", currentType);
    if (currentStatus !== "ALL") params.set("status", currentStatus);

    const exportUrl = `/api/admin/vendors/export?${params.toString()}`;
    window.open(exportUrl, "_blank");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "HOTEL":
        return <Hotel className="w-3.5 h-3.5 text-blue-400" />;
      case "HOMESTAY":
        return <Home className="w-3.5 h-3.5 text-emerald-400" />;
      case "TAXI":
        return <Car className="w-3.5 h-3.5 text-amber-400" />;
      case "GUIDE":
        return <Compass className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Building className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getStatusBadge = (v: AdminVendorListItem) => {
    if (v.status === "SUSPENDED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3 h-3" /> Suspended
        </span>
      );
    }
    if (v.status === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      );
    }
    if (v.isApproved) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" /> Live
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
        <Clock className="w-3 h-3" /> Pending
      </span>
    );
  };

  // Determine current active tab
  const activeTab = (() => {
    if (pathname.endsWith("/pending") || currentStatus === "PENDING") return "pending";
    if (pathname.endsWith("/live") || currentStatus === "APPROVED") return "live";
    if (pathname.endsWith("/rejected") || currentStatus === "REJECTED") return "rejected";
    if (currentStatus === "SUSPENDED") return "suspended";
    return "all";
  })();

  const tabs = [
    {
      id: "all",
      label: "All Vendors",
      count: stats.totalVendors,
      href: effectiveBase,
      statusValue: "ALL",
    },
    {
      id: "pending",
      label: "06 Vendor Approvals",
      count: stats.pendingApprovals,
      href: `${effectiveBase}/pending`,
      statusValue: "PENDING",
      badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    },
    {
      id: "live",
      label: "07 Live Vendors",
      count: stats.liveVendors,
      href: `${effectiveBase}/live`,
      statusValue: "APPROVED",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      id: "rejected",
      label: "16 Rejected Vendors",
      count: stats.rejectedVendors,
      href: `${effectiveBase}/rejected`,
      statusValue: "REJECTED",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
    },
    {
      id: "suspended",
      label: "Suspended",
      count: stats.suspendedVendors,
      href: `${effectiveBase}?status=SUSPENDED`,
      statusValue: "SUSPENDED",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Vendor Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review partner registrations, verify KYC compliance, manage live operations, and manage vendor lifecycles.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export {activeTab.toUpperCase()} (CSV)</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm animate-in fade-in duration-150 ${
            feedbackMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-red-500/10 border-red-500/20 text-red-300"
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-white ml-3 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Vendors</span>
          <div className="mt-2 text-2xl font-bold text-white">{stats.totalVendors}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {stats.hotelCount} Hotels • {stats.taxiCount} Taxis
          </span>
        </div>

        <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Pending Approvals</span>
          <div className="mt-2 text-2xl font-bold text-orange-300">{stats.pendingApprovals}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Requires admin review</span>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Live Vendors</span>
          <div className="mt-2 text-2xl font-bold text-emerald-300">{stats.liveVendors}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Active on marketplace</span>
        </div>

        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-red-400">Rejected / Suspended</span>
          <div className="mt-2 text-2xl font-bold text-red-300">
            {stats.rejectedVendors + stats.suspendedVendors}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {stats.rejectedVendors} rejected • {stats.suspendedVendors} suspended
          </span>
        </div>
      </div>

      {/* Navigation Tabs (06, 07, 16 order alignment) */}
      <div className="border-b border-slate-800 flex items-center gap-1 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                router.push(tab.href);
              }}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-emerald-500 text-emerald-400 bg-slate-900/60"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : tab.badgeColor || "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search by business name, vendor ID, email, owner..."
            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 py-2 pl-9 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={currentType}
              onChange={(e) => applyFilters({ type: e.target.value })}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Service Types</option>
              <option value="HOTEL" className="bg-slate-900">Hotels</option>
              <option value="HOMESTAY" className="bg-slate-900">Homestays</option>
              <option value="TAXI" className="bg-slate-900">Taxis</option>
              <option value="GUIDE" className="bg-slate-900">Guides</option>
            </select>
          </div>

          {(currentSearch || currentType !== "ALL" || currentStatus !== "ALL") && (
            <button
              onClick={() => {
                setSearchVal("");
                router.push(pathname);
              }}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Vendors Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Business & Partner ID</th>
                <th className="px-5 py-3.5">Owner / Contact</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">KYC Docs</th>
                <th className="px-5 py-3.5">Registered</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 px-4">
                    <Building className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-300">
                      {activeTab === "pending"
                        ? "No Pending Vendor Approvals"
                        : activeTab === "live"
                        ? "No Live Vendors Found"
                        : activeTab === "rejected"
                        ? "No Rejected Vendors"
                        : "No Vendors Found"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {currentSearch || currentType !== "ALL"
                        ? "Try clearing your filters or search terms to broaden the query."
                        : "Vendor registrations matching this view will be listed here automatically."}
                    </p>
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-900/50 transition-colors">
                    {/* Business & Partner ID */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-white text-sm tracking-tight">{vendor.businessName}</div>
                      <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                        {vendor.vendorId || "ID: Pending"}
                      </div>
                    </td>

                    {/* Owner / Contact */}
                    <td className="px-5 py-4 text-slate-300">
                      <div className="font-medium text-white">{vendor.user?.name || "N/A"}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{vendor.email || vendor.user?.email || "N/A"}</div>
                      <div className="text-[11px] text-slate-500">{vendor.phone || vendor.user?.phone || "N/A"}</div>
                    </td>

                    {/* Type */}
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200">
                        {getTypeIcon(vendor.type)}
                        <span>{vendor.type}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">{getStatusBadge(vendor)}</td>

                    {/* KYC Docs */}
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedVendorForKyc(vendor)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                          vendor.kycDocuments?.length > 0
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-400"
                        }`}
                        title="Inspect KYC verification documents"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{vendor.kycDocuments?.length || 0} Docs</span>
                      </button>
                    </td>

                    {/* Registered Date */}
                    <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => setSelectedVendorForDetails(vendor)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Review complete vendor details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Approve for Pending */}
                        {!vendor.isApproved && vendor.status !== "REJECTED" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenAction(vendor, "reject")}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenAction(vendor, "approve")}
                              className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                          </>
                        )}

                        {/* Suspend for Live */}
                        {vendor.isApproved && vendor.status !== "SUSPENDED" && (
                          <button
                            type="button"
                            onClick={() => handleOpenAction(vendor, "suspend")}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer"
                          >
                            Suspend
                          </button>
                        )}

                        {/* Reactivate for Rejected or Suspended */}
                        {(vendor.status === "REJECTED" || vendor.status === "SUSPENDED") && (
                          <button
                            type="button"
                            onClick={() => handleOpenAction(vendor, "reactivate")}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-xs text-slate-400">
              Showing page <strong className="text-white">{currentPage}</strong> of{" "}
              <strong className="text-white">{totalPages}</strong> ({totalCount} total vendors)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => applyFilters({ page: (currentPage - 1).toString() })}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => applyFilters({ page: (currentPage + 1).toString() })}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals & Dialogs */}
      {selectedVendorForDetails && (
        <VendorDetailModal
          vendor={selectedVendorForDetails}
          onClose={() => setSelectedVendorForDetails(null)}
          onTriggerAction={(type) => {
            const v = selectedVendorForDetails;
            setSelectedVendorForDetails(null);
            handleOpenAction(v, type);
          }}
          onViewKyc={() => {
            const v = selectedVendorForDetails;
            setSelectedVendorForDetails(null);
            setSelectedVendorForKyc(v);
          }}
        />
      )}

      {selectedVendorForKyc && (
        <VendorKycModal
          vendor={selectedVendorForKyc}
          onClose={() => setSelectedVendorForKyc(null)}
        />
      )}

      {actionDialogVendor && (
        <VendorActionDialog
          vendor={actionDialogVendor}
          actionType={actionType}
          onClose={() => setActionDialogVendor(null)}
          onConfirm={handleExecuteAction}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}
