"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Car,
  Download,
  Eye,
  Trash2,
  Edit2,
  Plus,
  CreditCard,
  MapPin,
  Loader2,
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
import {
  AdminPageHeader,
  AdminStatStrip,
  AdminFilterBar,
  AdminToastBanner,
  AdminPagination,
  AdminEmptyState,
  AdminModal,
  ConfirmActionDialog,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

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

function getVehicleStatusKey(v: AdminVehicleItem): "LIVE" | "PENDING" | "SUSPENDED" | "REJECTED" {
  if (v.status === "SUSPENDED") return "SUSPENDED";
  if (v.status === "REJECTED") return "REJECTED";
  if (v.status === "LIVE" || v.status === "APPROVED" || v.isApproved) return "LIVE";
  return "PENDING";
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
}: TaxisListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { adminHref } = useAdminBasePath();
  const [isTransitionPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"vehicles" | "rate_cards">(initialTab);
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [isExporting, setIsExporting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  // Modals
  const [selectedVehicle, setSelectedVehicle] = useState<AdminVehicleItem | null>(null);
  const [rejectingVehicle, setRejectingVehicle] = useState<AdminVehicleItem | null>(null);
  const [suspendingVehicle, setSuspendingVehicle] = useState<AdminVehicleItem | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<AdminVehicleItem | null>(null);

  // Rate card modal
  const [rateCardModalOpen, setRateCardModalOpen] = useState(false);
  const [editingRateCard, setEditingRateCard] = useState<AdminRateCardItem | null>(null);
  const [rateCardPlace, setRateCardPlace] = useState("");
  const [rateCardRates, setRateCardRates] = useState<Record<string, string>>({});
  const [rateCardError, setRateCardError] = useState<string | null>(null);
  const [savingRateCard, setSavingRateCard] = useState(false);
  const [deletingRateCard, setDeletingRateCard] = useState<AdminRateCardItem | null>(null);

  const updateQuery = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === "" || val === "ALL") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${adminHref("/admin/taxis")}?${qs}` : adminHref("/admin/taxis"));
    });
  };

  const handleApprove = async (vehicle: AdminVehicleItem) => {
    setBusyId(vehicle.id);
    setFeedback(null);
    try {
      const res = await approveVehicleAction(vehicle.id);
      if (res.success) {
        setFeedback({
          type: "success",
          text: `${vehicle.make || ""} ${vehicle.model} approved and set live.`,
        });
        setSelectedVehicle(null);
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to approve vehicle." });
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleReactivate = async (vehicle: AdminVehicleItem) => {
    setBusyId(vehicle.id);
    setFeedback(null);
    try {
      const res = await reactivateVehicleAction(vehicle.id);
      if (res.success) {
        setFeedback({
          type: "success",
          text: `${vehicle.make || ""} ${vehicle.model} reactivated.`,
        });
        setSelectedVehicle(null);
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to reactivate vehicle." });
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleOpenRateCardModal = (rc?: AdminRateCardItem) => {
    setRateCardError(null);
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
    setRateCardError(null);
    if (!rateCardPlace.trim()) {
      setRateCardError("Destination / route name is required.");
      return;
    }

    const numRates: Record<string, number> = {};
    Object.entries(rateCardRates).forEach(([k, v]) => {
      const num = Number(v);
      if (!Number.isNaN(num) && num > 0) {
        numRates[k] = num;
      }
    });

    if (Object.keys(numRates).length === 0) {
      setRateCardError("Enter at least one valid rate greater than 0.");
      return;
    }

    setSavingRateCard(true);
    try {
      const res = await upsertTaxiRateCardAction({
        id: editingRateCard?.id,
        place: rateCardPlace.trim(),
        rates: numRates,
      });
      if (res.success) {
        setFeedback({
          type: "success",
          text: editingRateCard ? "Rate card updated." : "Rate card created.",
        });
        setRateCardModalOpen(false);
        router.refresh();
      } else {
        setRateCardError(res.error || "Failed to save rate card.");
      }
    } finally {
      setSavingRateCard(false);
    }
  };

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
    } catch {
      setFeedback({ type: "error", text: "Failed to export vehicles CSV." });
    } finally {
      setIsExporting(false);
    }
  };

  const hasFilters = Boolean(currentSearch) || currentStatus !== "ALL" || currentType !== "ALL";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Taxis & Fleet"
        subtitle="Review vendor vehicle submissions, manage fleet status, and maintain destination taxi rate cards."
        actions={
          <>
            {activeTab === "vehicles" ? (
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-slate-500" />}
                <span>Export CSV</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenRateCardModal()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rate Card</span>
              </button>
            )}
          </>
        }
      />

      {/* Primary Domain Switcher */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-px">
        <button
          type="button"
          onClick={() => {
            setActiveTab("vehicles");
            updateQuery({ tab: "vehicles", page: "1" });
          }}
          className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "vehicles"
              ? "border-[var(--season-primary)] text-[var(--season-primary-hover)] font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Vehicles</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 tabular-nums">
            {stats.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("rate_cards");
            updateQuery({ tab: "rate_cards", page: "1" });
          }}
          className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "rate_cards"
              ? "border-[var(--season-primary)] text-[var(--season-primary-hover)] font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Destination Rate Cards</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 tabular-nums">
            {rateCardsTotalCount}
          </span>
        </button>
      </div>

      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      {/* VEHICLES VIEW */}
      {activeTab === "vehicles" && (
        <div className="space-y-5">
          <AdminStatStrip
            columns={4}
            items={[
              {
                label: "Pending Approvals",
                value: stats.pending,
                tone: stats.pending > 0 ? "amber" : "default",
                active: currentStatus === "PENDING",
                onClick: () => updateQuery({ status: currentStatus === "PENDING" ? "ALL" : "PENDING", page: "1" }),
              },
              {
                label: "Live Vehicles",
                value: stats.live,
                tone: "primary",
                active: currentStatus === "LIVE",
                onClick: () => updateQuery({ status: currentStatus === "LIVE" ? "ALL" : "LIVE", page: "1" }),
              },
              {
                label: "Suspended",
                value: stats.suspended,
                active: currentStatus === "SUSPENDED",
                onClick: () => updateQuery({ status: currentStatus === "SUSPENDED" ? "ALL" : "SUSPENDED", page: "1" }),
              },
              {
                label: "Rejected",
                value: stats.rejected,
                tone: stats.rejected > 0 ? "rose" : "default",
                active: currentStatus === "REJECTED",
                onClick: () => updateQuery({ status: currentStatus === "REJECTED" ? "ALL" : "REJECTED", page: "1" }),
              },
            ]}
          />

          <AdminFilterBar
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            onSearchSubmit={() => updateQuery({ search: searchInput.trim(), page: "1" })}
            searchPlaceholder="Search make, model, registration, or vendor..."
            hasActiveFilters={hasFilters}
            onReset={() => {
              setSearchInput("");
              router.push(adminHref("/admin/taxis"));
            }}
            filters={
              <>
                <select
                  value={currentType}
                  onChange={(e) => updateQuery({ type: e.target.value, page: "1" })}
                  aria-label="Filter by vehicle type"
                  className="bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[var(--season-primary)] cursor-pointer"
                >
                  <option value="ALL">All Types</option>
                  {STANDARD_VEHICLE_TYPES.map((vt) => (
                    <option key={vt} value={vt}>
                      {vt}
                    </option>
                  ))}
                </select>
                <select
                  value={currentStatus}
                  onChange={(e) => updateQuery({ status: e.target.value, page: "1" })}
                  aria-label="Filter by vehicle status"
                  className="bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[var(--season-primary)] cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="LIVE">Live</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </>
            }
          />

          <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
            {vehicles.length === 0 ? (
              <AdminEmptyState
                icon={<Car className="w-5 h-5" />}
                title="No vehicles found"
                description="No vehicles match your current filter selection."
                action={
                  hasFilters ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput("");
                        router.push(adminHref("/admin/taxis"));
                      }}
                      className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
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
                      <th className="py-2.5 px-4">Vehicle</th>
                      <th className="py-2.5 px-4">Registration</th>
                      <th className="py-2.5 px-4">Vendor</th>
                      <th className="py-2.5 px-4">Capacity</th>
                      <th className="py-2.5 px-4">Usage</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehicles.map((v) => {
                      const statusKey = getVehicleStatusKey(v);
                      const isRowBusy = isTransitionPending || busyId === v.id;

                      return (
                        <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-11 h-9 rounded-md overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                                {v.images && v.images.length > 0 ? (
                                  <Image src={v.images[0]} alt={v.model} fill className="object-cover" sizes="44px" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <Car className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">
                                  {v.make ? `${v.make} ` : ""}
                                  {v.model}
                                </div>
                                <div className="text-[11px] text-slate-500">{v.type}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px] uppercase text-slate-700">
                            {v.registrationNum || "—"}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-800">
                              {v.vendorProfile?.businessName || "Unknown Vendor"}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {v.vendorProfile?.user?.name || v.vendorProfile?.email || "No contact"}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                            {v.capacity} Seats
                          </td>

                          <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                            <div>{v.bookingsCount} booking(s)</div>
                            <div>{v.tourTransportsCount} tour leg(s)</div>
                          </td>

                          <td className="py-3 px-4">
                            <StatusBadge status={statusKey} />
                            {v.rejectionReason && (
                              <div
                                className="text-[11px] text-rose-600 mt-1 max-w-[160px] truncate"
                                title={v.rejectionReason}
                              >
                                {v.rejectionReason}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedVehicle(v)}
                                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="View Details"
                                aria-label="View vehicle details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {statusKey === "PENDING" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(v)}
                                    disabled={isRowBusy}
                                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] text-white disabled:opacity-50 transition-colors cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRejectingVehicle(v)}
                                    disabled={isRowBusy}
                                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 disabled:opacity-50 transition-colors cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {statusKey === "LIVE" && (
                                <button
                                  type="button"
                                  onClick={() => setSuspendingVehicle(v)}
                                  disabled={isRowBusy}
                                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                  Suspend
                                </button>
                              )}

                              {(statusKey === "SUSPENDED" || statusKey === "REJECTED") && (
                                <button
                                  type="button"
                                  onClick={() => handleReactivate(v)}
                                  disabled={isRowBusy}
                                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--season-primary-light)] hover:bg-[var(--season-primary)]/15 text-[var(--season-primary-hover)] border border-[var(--season-primary)]/25 disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                  Reactivate
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setDeletingVehicle(v)}
                                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Vehicle"
                                aria-label="Delete vehicle"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
              itemLabel="vehicles"
              disabled={isTransitionPending}
              onPageChange={(page) => updateQuery({ page: String(page) })}
            />
          </div>
        </div>
      )}

      {/* RATE CARDS VIEW */}
      {activeTab === "rate_cards" && (
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          {rateCards.length === 0 ? (
            <AdminEmptyState
              icon={<MapPin className="w-5 h-5" />}
              title="No taxi rate cards configured"
              description="Add destination pricing across standard Kashmir vehicle categories."
              action={
                <button
                  type="button"
                  onClick={() => handleOpenRateCardModal()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Rate Card</span>
                </button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-4">Destination / Route</th>
                    <th className="py-2.5 px-4">Configured Rates</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rateCards.map((rc) => (
                    <tr key={rc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">{rc.place}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(rc.rates || {}).map(([type, price]) => (
                            <span
                              key={type}
                              className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/80 text-[11px] text-slate-700"
                            >
                              {type}: <strong className="text-slate-900">₹{Number(price).toLocaleString("en-IN")}</strong>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenRateCardModal(rc)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-[var(--season-primary-hover)] hover:bg-[var(--season-primary-light)] cursor-pointer"
                            title="Edit rate card"
                            aria-label={`Edit ${rc.place}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingRateCard(rc)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Delete rate card"
                            aria-label={`Delete ${rc.place}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <AdminPagination
            currentPage={rateCardsPage}
            totalPages={rateCardsTotalPages}
            totalCount={rateCardsTotalCount}
            itemLabel="rate cards"
            disabled={isTransitionPending}
            onPageChange={(page) => updateQuery({ tab: "rate_cards", page: String(page) })}
          />
        </div>
      )}

      {/* Vehicle Details Modal */}
      <AdminModal
        open={Boolean(selectedVehicle)}
        onClose={() => setSelectedVehicle(null)}
        title={
          selectedVehicle
            ? `${selectedVehicle.make || ""} ${selectedVehicle.model}`.trim()
            : "Vehicle Details"
        }
        subtitle={selectedVehicle?.registrationNum ? `Reg: ${selectedVehicle.registrationNum}` : undefined}
        maxWidth="lg"
        footer={
          selectedVehicle && (
            <>
              <button
                type="button"
                onClick={() => setSelectedVehicle(null)}
                className="px-3.5 py-2 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              {getVehicleStatusKey(selectedVehicle) === "PENDING" && (
                <button
                  type="button"
                  onClick={() => handleApprove(selectedVehicle)}
                  className="px-3.5 py-2 rounded-md text-xs font-medium text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] cursor-pointer"
                >
                  Approve Vehicle
                </button>
              )}
            </>
          )
        }
      >
        {selectedVehicle && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <StatusBadge status={getVehicleStatusKey(selectedVehicle)} />
              <span className="text-slate-500">
                {selectedVehicle.type} · {selectedVehicle.capacity} Seats
              </span>
            </div>

            {selectedVehicle.images && selectedVehicle.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {selectedVehicle.images.slice(0, 6).map((url, idx) => (
                  <div key={idx} className="relative aspect-[4/3] rounded-md overflow-hidden border border-slate-200 bg-slate-100">
                    <Image src={url} alt={selectedVehicle.model} fill className="object-cover" sizes="180px" />
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <div className="text-[11px] text-slate-500">Vendor</div>
                <div className="font-medium text-slate-900 mt-0.5">
                  {selectedVehicle.vendorProfile?.businessName || "—"}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Contact</div>
                <div className="font-medium text-slate-900 mt-0.5">
                  {selectedVehicle.vendorProfile?.phone || selectedVehicle.vendorProfile?.email || "—"}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Bookings</div>
                <div className="font-medium text-slate-900 mt-0.5">{selectedVehicle.bookingsCount}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Tour Segments</div>
                <div className="font-medium text-slate-900 mt-0.5">{selectedVehicle.tourTransportsCount}</div>
              </div>
            </div>

            {selectedVehicle.rejectionReason && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
                <strong className="block mb-0.5">Reason on file:</strong>
                {selectedVehicle.rejectionReason}
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {/* Reject / Suspend / Delete Dialogs */}
      <ConfirmActionDialog
        open={Boolean(rejectingVehicle)}
        onClose={() => setRejectingVehicle(null)}
        title={`Reject "${rejectingVehicle?.model || ""}"?`}
        description="Rejecting this vehicle prevents it from going live and records your reason for the vendor."
        confirmLabel="Reject Vehicle"
        tone="danger"
        requireReason
        reasonLabel="Rejection Reason"
        reasonPlaceholder="Explain why this vehicle submission was rejected..."
        onConfirm={async (reason) => {
          if (!rejectingVehicle) return;
          const res = await rejectVehicleAction(rejectingVehicle.id, reason || "");
          if (!res.success) throw new Error(res.error || "Failed to reject vehicle.");
          setFeedback({ type: "success", text: "Vehicle rejected." });
          router.refresh();
        }}
      />

      <ConfirmActionDialog
        open={Boolean(suspendingVehicle)}
        onClose={() => setSuspendingVehicle(null)}
        title={`Suspend "${suspendingVehicle?.model || ""}"?`}
        description="Suspending hides this vehicle from active bookings until reactivated."
        confirmLabel="Suspend Vehicle"
        tone="warning"
        requireReason
        reasonLabel="Suspension Reason"
        reasonPlaceholder="Provide the reason for suspending this vehicle..."
        onConfirm={async (reason) => {
          if (!suspendingVehicle) return;
          const res = await suspendVehicleAction(suspendingVehicle.id, reason || "");
          if (!res.success) throw new Error(res.error || "Failed to suspend vehicle.");
          setFeedback({ type: "success", text: "Vehicle suspended." });
          router.refresh();
        }}
      />

      <ConfirmActionDialog
        open={Boolean(deletingVehicle)}
        onClose={() => setDeletingVehicle(null)}
        title={`Delete "${deletingVehicle?.model || ""}"?`}
        description="Permanently remove this vehicle from the database. Vehicles with linked bookings or tour segments cannot be deleted."
        confirmLabel="Delete Vehicle"
        tone="danger"
        onConfirm={async () => {
          if (!deletingVehicle) return;
          const res = await deleteVehicleAction(deletingVehicle.id);
          if (!res.success) throw new Error(res.error || "Failed to delete vehicle.");
          setFeedback({ type: "success", text: "Vehicle deleted." });
          router.refresh();
        }}
      />

      {/* Rate Card Add/Edit Modal */}
      <AdminModal
        open={rateCardModalOpen}
        onClose={() => setRateCardModalOpen(false)}
        title={editingRateCard ? `Edit Rate Card: ${editingRateCard.place}` : "Add Taxi Rate Card"}
        subtitle="Set per-route pricing in INR for each applicable vehicle type."
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setRateCardModalOpen(false)}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="rate-card-form"
              disabled={savingRateCard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] disabled:opacity-50 cursor-pointer"
            >
              {savingRateCard && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingRateCard ? "Save Changes" : "Create Rate Card"}</span>
            </button>
          </>
        }
      >
        <form id="rate-card-form" onSubmit={handleSaveRateCard} className="space-y-4">
          {rateCardError && (
            <div role="alert" className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {rateCardError}
            </div>
          )}

          <div>
            <label htmlFor="rate-card-place" className="block text-xs font-medium text-slate-700 mb-1.5">
              Destination / Route Name <span className="text-rose-600">*</span>
            </label>
            <input
              id="rate-card-place"
              type="text"
              required
              value={rateCardPlace}
              onChange={(e) => setRateCardPlace(e.target.value)}
              placeholder="e.g., Srinagar to Gulmarg (Day Trip)"
              className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[var(--season-primary)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {STANDARD_VEHICLE_TYPES.map((vt) => (
              <div key={vt}>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">{vt} (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={rateCardRates[vt] || ""}
                  onChange={(e) =>
                    setRateCardRates((prev) => ({ ...prev, [vt]: e.target.value }))
                  }
                  placeholder="0"
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[var(--season-primary)]"
                />
              </div>
            ))}
          </div>
        </form>
      </AdminModal>

      <ConfirmActionDialog
        open={Boolean(deletingRateCard)}
        onClose={() => setDeletingRateCard(null)}
        title={`Delete rate card "${deletingRateCard?.place || ""}"?`}
        description="This permanently removes the destination taxi rate card."
        confirmLabel="Delete Rate Card"
        tone="danger"
        onConfirm={async () => {
          if (!deletingRateCard) return;
          const res = await deleteTaxiRateCardAction(deletingRateCard.id);
          if (!res.success) throw new Error(res.error || "Failed to delete rate card.");
          setFeedback({ type: "success", text: "Rate card deleted." });
          router.refresh();
        }}
      />
    </div>
  );
}
