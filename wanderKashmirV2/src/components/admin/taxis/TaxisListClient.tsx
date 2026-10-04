"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Car,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Download,
  Eye,
  Trash2,
  Edit2,
  Plus,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Building,
  CreditCard,
  MapPin,
  Calendar,
  X,
  RefreshCw,
} from "lucide-react";
import {
  AdminVehicleItem,
  AdminVehicleStats,
  AdminRateCardItem,
  STANDARD_VEHICLE_TYPES,
} from "@/lib/admin/taxis";
import {
  approveVehicleAction,
  rejectVehicleAction,
  suspendVehicleAction,
  reactivateVehicleAction,
  deleteVehicleAction,
  upsertTaxiRateCardAction,
  deleteTaxiRateCardAction,
} from "@/actions/adminTaxis";

interface TaxisListClientProps {
  vehicles: AdminVehicleItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  stats: AdminVehicleStats;
  currentSearch: string;
  currentStatus: string;
  currentType: string;
  activeTab: "vehicles" | "rate_cards";
  rateCards: AdminRateCardItem[];
  rateCardsTotalCount: number;
  rateCardsPage: number;
  rateCardsTotalPages: number;
  fixedStatusTab?: string;
}

export default function TaxisListClient({
  vehicles,
  totalCount,
  currentPage,
  totalPages,
  stats,
  currentSearch,
  currentStatus,
  currentType,
  activeTab: initialTab,
  rateCards,
  rateCardsTotalCount,
  rateCardsPage,
  rateCardsTotalPages,
  fixedStatusTab,
}: TaxisListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"vehicles" | "rate_cards">(initialTab);
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [isExporting, setIsExporting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modals state
  const [selectedVehicle, setSelectedVehicle] = useState<AdminVehicleItem | null>(null);
  const [rejectingVehicle, setRejectingVehicle] = useState<AdminVehicleItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [suspendingVehicle, setSuspendingVehicle] = useState<AdminVehicleItem | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [deletingVehicle, setDeletingVehicle] = useState<AdminVehicleItem | null>(null);

  // Rate card modal state
  const [rateCardModalOpen, setRateCardModalOpen] = useState(false);
  const [editingRateCard, setEditingRateCard] = useState<AdminRateCardItem | null>(null);
  const [rateCardPlace, setRateCardPlace] = useState("");
  const [rateCardRates, setRateCardRates] = useState<Record<string, string>>({});
  const [deletingRateCard, setDeletingRateCard] = useState<AdminRateCardItem | null>(null);

  // Navigate helper
  const updateQuery = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === "") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery({ search: searchInput, page: "1" });
  };

  const handleStatusChange = (status: string) => {
    updateQuery({ status: status === "ALL" ? undefined : status, page: "1" });
  };

  const handleTypeChange = (type: string) => {
    updateQuery({ type: type === "ALL" ? undefined : type, page: "1" });
  };

  const handleTabChange = (tab: "vehicles" | "rate_cards") => {
    setActiveTab(tab);
    updateQuery({ tab: tab === "vehicles" ? undefined : tab, page: "1" });
  };

  // Approval handlers
  const handleApprove = async (vehicle: AdminVehicleItem) => {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await approveVehicleAction(vehicle.id);
      if (res.success) {
        setActionSuccess(`Vehicle ${vehicle.make} ${vehicle.model} approved and live.`);
        router.refresh();
      } else {
        setActionError(res.error || "Failed to approve vehicle.");
      }
    });
  };

  const handleRejectConfirm = async () => {
    if (!rejectingVehicle || !rejectionReason.trim()) return;
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await rejectVehicleAction(rejectingVehicle.id, rejectionReason.trim());
      if (res.success) {
        setActionSuccess(`Vehicle rejected.`);
        setRejectingVehicle(null);
        setRejectionReason("");
        router.refresh();
      } else {
        setActionError(res.error || "Failed to reject vehicle.");
      }
    });
  };

  const handleSuspendConfirm = async () => {
    if (!suspendingVehicle || !suspensionReason.trim()) return;
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await suspendVehicleAction(suspendingVehicle.id, suspensionReason.trim());
      if (res.success) {
        setActionSuccess(`Vehicle suspended.`);
        setSuspendingVehicle(null);
        setSuspensionReason("");
        router.refresh();
      } else {
        setActionError(res.error || "Failed to suspend vehicle.");
      }
    });
  };

  const handleReactivate = async (vehicle: AdminVehicleItem) => {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await reactivateVehicleAction(vehicle.id);
      if (res.success) {
        setActionSuccess(`Vehicle ${vehicle.make} ${vehicle.model} reactivated and live.`);
        router.refresh();
      } else {
        setActionError(res.error || "Failed to reactivate vehicle.");
      }
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingVehicle) return;
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await deleteVehicleAction(deletingVehicle.id);
      if (res.success) {
        setActionSuccess(`Vehicle removed.`);
        setDeletingVehicle(null);
        router.refresh();
      } else {
        setActionError(res.error || "Failed to delete vehicle.");
      }
    });
  };

  // Rate card handlers
  const handleOpenRateCardModal = (rc?: AdminRateCardItem) => {
    if (rc) {
      setEditingRateCard(rc);
      setRateCardPlace(rc.place);
      const strRates: Record<string, string> = {};
      Object.entries(rc.rates || {}).forEach(([k, v]) => {
        strRates[k] = String(v);
      });
      setRateCardRates(strRates);
    } else {
      setEditingRateCard(null);
      setRateCardPlace("");
      setRateCardRates({});
    }
    setRateCardModalOpen(true);
  };

  const handleSaveRateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rateCardPlace.trim()) return;

    const numRates: Record<string, number> = {};
    Object.entries(rateCardRates).forEach(([k, v]) => {
      const num = Number(v);
      if (!isNaN(num) && num > 0) {
        numRates[k] = num;
      }
    });

    if (Object.keys(numRates).length === 0) {
      setActionError("Please provide at least one valid vehicle rate.");
      return;
    }

    startTransition(async () => {
      const res = await upsertTaxiRateCardAction({
        id: editingRateCard?.id,
        place: rateCardPlace.trim(),
        rates: numRates,
      });

      if (res.success) {
        setActionSuccess(editingRateCard ? "Rate card updated." : "New rate card created.");
        setRateCardModalOpen(false);
        router.refresh();
      } else {
        setActionError(res.error || "Failed to save rate card.");
      }
    });
  };

  const handleDeleteRateCardConfirm = async () => {
    if (!deletingRateCard) return;
    startTransition(async () => {
      const res = await deleteTaxiRateCardAction(deletingRateCard.id);
      if (res.success) {
        setActionSuccess("Rate card deleted.");
        setDeletingRateCard(null);
        router.refresh();
      } else {
        setActionError(res.error || "Failed to delete rate card.");
      }
    });
  };

  // CSV Export handler
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      if (currentSearch) params.set("search", currentSearch);
      if (currentStatus && currentStatus !== "ALL") params.set("status", currentStatus);
      if (currentType && currentType !== "ALL") params.set("type", currentType);

      const res = await fetch(`/api/admin/taxis/export?${params.toString()}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wanderkashmir-vehicles-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      setActionError("Failed to export vehicles CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Module #14
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Taxis & Vehicles</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage transport fleets, vendor vehicle verifications, approvals, and destination rate cards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "vehicles" && (
            <button
              onClick={handleExportCsv}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              {isExporting ? "Exporting..." : "Export CSV"}
            </button>
          )}

          {activeTab === "rate_cards" && (
            <button
              onClick={() => handleOpenRateCardModal()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Rate Card
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-sm flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => handleStatusChange("ALL")}
          className={`p-4 rounded-xl border text-left transition ${
            currentStatus === "ALL"
              ? "bg-slate-800/90 border-slate-600"
              : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="text-xs text-slate-400 font-medium">Total Fleet</div>
          <div className="text-xl font-bold text-white mt-1">{stats.total}</div>
        </button>

        <button
          onClick={() => handleStatusChange("PENDING")}
          className={`p-4 rounded-xl border text-left transition ${
            currentStatus === "PENDING"
              ? "bg-amber-950/30 border-amber-600"
              : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Pending Approvals
          </div>
          <div className="text-xl font-bold text-amber-300 mt-1">{stats.pending}</div>
        </button>

        <button
          onClick={() => handleStatusChange("LIVE")}
          className={`p-4 rounded-xl border text-left transition ${
            currentStatus === "LIVE" || currentStatus === "APPROVED"
              ? "bg-emerald-950/30 border-emerald-600"
              : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Live / Approved
          </div>
          <div className="text-xl font-bold text-emerald-300 mt-1">{stats.live}</div>
        </button>

        <button
          onClick={() => handleStatusChange("SUSPENDED")}
          className={`p-4 rounded-xl border text-left transition ${
            currentStatus === "SUSPENDED"
              ? "bg-orange-950/30 border-orange-600"
              : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="text-xs text-orange-400 font-medium flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Suspended
          </div>
          <div className="text-xl font-bold text-orange-300 mt-1">{stats.suspended}</div>
        </button>

        <button
          onClick={() => handleStatusChange("REJECTED")}
          className={`p-4 rounded-xl border text-left transition ${
            currentStatus === "REJECTED"
              ? "bg-red-950/30 border-red-600"
              : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="text-xs text-red-400 font-medium flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </div>
          <div className="text-xl font-bold text-red-300 mt-1">{stats.rejected}</div>
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-px">
        <button
          onClick={() => handleTabChange("vehicles")}
          className={`pb-3 px-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === "vehicles"
              ? "border-emerald-500 text-emerald-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Car className="w-4 h-4" />
          Vehicles List ({totalCount})
        </button>

        <button
          onClick={() => handleTabChange("rate_cards")}
          className={`pb-3 px-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === "rate_cards"
              ? "border-emerald-500 text-emerald-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Destination Rate Cards ({rateCardsTotalCount})
        </button>
      </div>

      {/* Tab 1: Vehicles List */}
      {activeTab === "vehicles" && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by make, model, registration number, or vendor..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </form>

            <select
              value={currentType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Vehicle Types</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Van">Van</option>
              <option value="CRYSTA">Crysta</option>
              <option value="INNOVA">Innova</option>
              <option value="ERTIGA">Ertiga</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/70 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Registration</th>
                    <th className="py-3 px-4">Vendor Context</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Usage</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {vehicles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No vehicles found matching current criteria.
                      </td>
                    </tr>
                  ) : (
                    vehicles.map((v) => {
                      const isLive = v.status === "LIVE" || v.status === "APPROVED" || v.isApproved;
                      const isPending = v.status === "PENDING" || (!v.isApproved && v.status !== "REJECTED" && v.status !== "SUSPENDED");
                      const isSuspended = v.status === "SUSPENDED";
                      const isRejected = v.status === "REJECTED";

                      return (
                        <tr key={v.id} className="hover:bg-slate-800/40 transition">
                          {/* Vehicle Info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {v.images && v.images.length > 0 ? (
                                <div className="relative w-12 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                                  <Image
                                    src={v.images[0]}
                                    alt={v.model}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-10 rounded-lg border border-slate-700 bg-slate-800/80 flex items-center justify-center text-slate-500 shrink-0">
                                  <Car className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-white">
                                  {v.make ? `${v.make} ` : ""}
                                  {v.model}
                                </div>
                                <div className="text-xs text-slate-400">{v.type}</div>
                              </div>
                            </div>
                          </td>

                          {/* Registration */}
                          <td className="py-3.5 px-4 font-mono text-xs uppercase text-slate-200">
                            {v.registrationNum || "—"}
                          </td>

                          {/* Vendor Context */}
                          <td className="py-3.5 px-4">
                            <div>
                              <div className="font-medium text-slate-200">
                                {v.vendorProfile?.businessName || "Unknown Vendor"}
                              </div>
                              <div className="text-xs text-slate-400">
                                {v.vendorProfile?.user?.name || v.vendorProfile?.email || "No contact"}
                              </div>
                            </div>
                          </td>

                          {/* Capacity */}
                          <td className="py-3.5 px-4 text-xs">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {v.capacity} Seats
                            </span>
                          </td>

                          {/* Usage Count */}
                          <td className="py-3.5 px-4 text-xs text-slate-400">
                            <div>{v.bookingsCount} booking(s)</div>
                            <div>{v.tourTransportsCount} tour segment(s)</div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {isLive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> Live
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <Clock className="w-3 h-3" /> Pending
                              </span>
                            ) : isSuspended ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                <AlertCircle className="w-3 h-3" /> Suspended
                              </span>
                            ) : isRejected ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                <XCircle className="w-3 h-3" /> Rejected
                              </span>
                            ) : null}

                            {v.rejectionReason && (
                              <div
                                className="text-[11px] text-red-400 mt-1 max-w-[150px] truncate"
                                title={v.rejectionReason}
                              >
                                {v.rejectionReason}
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {/* View Details */}
                              <button
                                onClick={() => setSelectedVehicle(v)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Approve Button */}
                              {!isLive && (
                                <button
                                  onClick={() => handleApprove(v)}
                                  disabled={isPending}
                                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition disabled:opacity-50"
                                >
                                  Approve
                                </button>
                              )}

                              {/* Reject Button */}
                              {isPending && (
                                <button
                                  onClick={() => {
                                    setRejectingVehicle(v);
                                    setRejectionReason("");
                                  }}
                                  disabled={isPending}
                                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              )}

                              {/* Suspend Button */}
                              {isLive && (
                                <button
                                  onClick={() => {
                                    setSuspendingVehicle(v);
                                    setSuspensionReason("");
                                  }}
                                  disabled={isPending}
                                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 transition disabled:opacity-50"
                                >
                                  Suspend
                                </button>
                              )}

                              {/* Reactivate Button */}
                              {(isSuspended || isRejected) && (
                                <button
                                  onClick={() => handleReactivate(v)}
                                  disabled={isPending}
                                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition disabled:opacity-50"
                                >
                                  Reactivate
                                </button>
                              )}

                              {/* Delete Button (safeguarded) */}
                              <button
                                onClick={() => setDeletingVehicle(v)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                                title="Delete Vehicle"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400">
                <div>
                  Page {currentPage} of {totalPages} ({totalCount} total vehicles)
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => updateQuery({ page: String(currentPage - 1) })}
                    disabled={currentPage <= 1}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => updateQuery({ page: String(currentPage + 1) })}
                    disabled={currentPage >= totalPages}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Destination Rate Cards */}
      {activeTab === "rate_cards" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rateCards.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-xl">
                No destination rate cards found. Click "Add Rate Card" to create one.
              </div>
            ) : (
              rateCards.map((rc) => (
                <div
                  key={rc.id}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                          <MapPin className="w-3.5 h-3.5" />
                          Route / Destination
                        </div>
                        <h3 className="text-base font-bold text-white mt-1">{rc.place}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenRateCardModal(rc)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Edit Rate Card"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingRateCard(rc)}
                          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                          title="Delete Rate Card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Rates Matrix */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(rc.rates || {}).map(([vType, rate]) => (
                        <div
                          key={vType}
                          className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2 flex items-center justify-between"
                        >
                          <span className="text-slate-400 font-mono">{vType}</span>
                          <span className="text-emerald-400 font-semibold">₹{rate.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>{Object.keys(rc.rates || {}).length} vehicle tier(s)</span>
                    <span>Updated: {new Date(rc.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Vehicle Details Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs uppercase font-semibold text-emerald-400 tracking-wider">
                  Vehicle Specifications
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  {selectedVehicle.make ? `${selectedVehicle.make} ` : ""}
                  {selectedVehicle.model}
                </h2>
                <div className="text-sm font-mono text-slate-400 uppercase mt-0.5">
                  Registration: {selectedVehicle.registrationNum}
                </div>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vehicle Photos */}
            {selectedVehicle.images && selectedVehicle.images.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Fleet Photos</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedVehicle.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative h-28 rounded-lg overflow-hidden border border-slate-800 bg-slate-950"
                    >
                      <Image src={img} alt="Vehicle Photo" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block">Vehicle Category</span>
                <span className="text-white font-semibold mt-1 block">{selectedVehicle.type}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block">Seating Capacity</span>
                <span className="text-white font-semibold mt-1 block">{selectedVehicle.capacity} Persons</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block">Platform Commission</span>
                <span className="text-white font-semibold mt-1 block">
                  {selectedVehicle.platformCommissionRate}%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block">Approval Status</span>
                <span className="text-white font-semibold mt-1 block">{selectedVehicle.status}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block">Connected Bookings</span>
                <span className="text-white font-semibold mt-1 block">{selectedVehicle.bookingsCount}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block">Tour Itineraries</span>
                <span className="text-white font-semibold mt-1 block">
                  {selectedVehicle.tourTransportsCount}
                </span>
              </div>
            </div>

            {/* Vendor Context */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                Vendor Context
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Business / Operator:</span>
                  <span className="text-white font-medium ml-2">
                    {selectedVehicle.vendorProfile?.businessName || "Unknown"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Vendor Type:</span>
                  <span className="text-white font-medium ml-2">
                    {selectedVehicle.vendorProfile?.type || "TAXI"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Owner Name:</span>
                  <span className="text-white font-medium ml-2">
                    {selectedVehicle.vendorProfile?.user?.name || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Email:</span>
                  <span className="text-white font-medium ml-2">
                    {selectedVehicle.vendorProfile?.email || selectedVehicle.vendorProfile?.user?.email || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedVehicle(null)}
                className="px-4 py-2 rounded-lg text-sm bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Reject Vehicle Listing</h3>
            <p className="text-xs text-slate-400">
              Please provide a specific reason for rejecting{" "}
              <span className="text-white font-semibold">
                {rejectingVehicle.make} {rejectingVehicle.model} ({rejectingVehicle.registrationNum})
              </span>
              . This explanation will be documented on the listing record.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason (e.g. Invalid RC copy, missing insurance, vehicle age over limit)..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingVehicle(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectionReason.trim() || isPending}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {suspendingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Suspend Active Vehicle</h3>
            <p className="text-xs text-slate-400">
              Temporarily de-list{" "}
              <span className="text-white font-semibold">
                {suspendingVehicle.make} {suspendingVehicle.model} ({suspendingVehicle.registrationNum})
              </span>{" "}
              from public bookings. Provide a reason below.
            </p>

            <textarea
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              placeholder="Enter suspension reason (e.g. Document expired, maintenance audit, vendor request)..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSuspendingVehicle(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendConfirm}
                disabled={!suspensionReason.trim() || isPending}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white transition disabled:opacity-50"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Delete Vehicle</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to permanently delete{" "}
              <span className="text-white font-semibold">
                {deletingVehicle.make} {deletingVehicle.model} ({deletingVehicle.registrationNum})
              </span>
              ?
            </p>

            {deletingVehicle.bookingsCount > 0 && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">
                Warning: This vehicle is linked to {deletingVehicle.bookingsCount} booking(s). Hard
                deletion is prevented to maintain booking history. Suspend the vehicle instead.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingVehicle(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingVehicle.bookingsCount > 0 || isPending}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Rate Card Modal */}
      {rateCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleSaveRateCard}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingRateCard ? "Edit Taxi Rate Card" : "New Taxi Rate Card"}
              </h3>
              <button
                type="button"
                onClick={() => setRateCardModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Route / Place Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SRINAGAR TO GULMARG FULL DAY"
                value={rateCardPlace}
                onChange={(e) => setRateCardPlace(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                Vehicle Type Rates (INR)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {STANDARD_VEHICLE_TYPES.map((vType) => (
                  <div key={vType} className="space-y-1">
                    <span className="text-slate-400 font-mono text-[11px]">{vType}</span>
                    <input
                      type="number"
                      placeholder="e.g. 4500"
                      value={rateCardRates[vType] || ""}
                      onChange={(e) =>
                        setRateCardRates((prev) => ({
                          ...prev,
                          [vType]: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRateCardModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
              >
                {editingRateCard ? "Update Rates" : "Create Rate Card"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Rate Card Confirm Modal */}
      {deletingRateCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Delete Rate Card</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete rate card for{" "}
              <span className="text-white font-semibold">{deletingRateCard.place}</span>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingRateCard(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRateCardConfirm}
                disabled={isPending}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
