"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Tag,
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Compass,
  Building,
  Car,
  Copy,
  Check,
  Globe,
  RefreshCw,
  Info,
  X,
} from "lucide-react";
import {
  AdminPromoCodeItem,
  PromoCodeFormInput,
  createAdminPromoCodeAction,
  updateAdminPromoCodeAction,
  togglePromoCodeStatusAction,
  approvePromoCodeAction,
  deleteAdminPromoCodeAction,
} from "@/actions/adminPromoCodes";
import {
  AdminPageHeader,
  AdminToastBanner,
  AdminModal,
  ConfirmActionDialog,
  AdminEmptyState,
  StatusBadge,
  type FeedbackMessage,
} from "@/components/admin/ui";

interface PromoCodesClientProps {
  initialPromoCodes: AdminPromoCodeItem[];
  targets: {
    tours: { id: string; title: string }[];
    properties: { id: string; name: string }[];
    vehicles: { id: string; model: string; type: string }[];
  };
}

type PromoStatusFilter = "ALL" | "ACTIVE" | "INACTIVE" | "PENDING" | "REJECTED";

export default function PromoCodesClient({
  initialPromoCodes,
  targets,
}: PromoCodesClientProps) {
  const router = useRouter();

  const [searchVal, setSearchVal] = useState("");
  const [statusFilter, setStatusFilter] = useState<PromoStatusFilter>("ALL");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT" | null>(null);
  const [editingItem, setEditingItem] = useState<AdminPromoCodeItem | null>(null);
  const [formData, setFormData] = useState<PromoCodeFormInput>({
    code: "",
    discountPercent: 10,
    targetType: "ALL",
    targetId: null,
    isActive: true,
    showOnHomepage: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteModalItem, setDeleteModalItem] = useState<AdminPromoCodeItem | null>(null);

  const counts = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let pending = 0;
    let rejected = 0;
    for (const p of initialPromoCodes) {
      if (p.isActive) active++;
      else inactive++;
      if (p.status === "PENDING") pending++;
      if (p.status === "REJECTED") rejected++;
    }
    return { all: initialPromoCodes.length, active, inactive, pending, rejected };
  }, [initialPromoCodes]);

  const filteredCodes = useMemo(() => {
    return initialPromoCodes.filter((p) => {
      if (statusFilter === "ACTIVE" && !p.isActive) return false;
      if (statusFilter === "INACTIVE" && p.isActive) return false;
      if (statusFilter === "PENDING" && p.status !== "PENDING") return false;
      if (statusFilter === "REJECTED" && p.status !== "REJECTED") return false;

      if (searchVal.trim()) {
        const term = searchVal.toLowerCase().trim();
        const codeMatch = p.code.toLowerCase().includes(term);
        const tourMatch = p.tour?.title.toLowerCase().includes(term);
        const propMatch = p.property?.name.toLowerCase().includes(term);
        const vehicleMatch = p.vehicle?.model.toLowerCase().includes(term);
        const vendorMatch = p.vendorProfile?.businessName.toLowerCase().includes(term);
        return Boolean(codeMatch || tourMatch || propMatch || vehicleMatch || vendorMatch);
      }
      return true;
    });
  }, [initialPromoCodes, searchVal, statusFilter]);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = async (item: AdminPromoCodeItem) => {
    setTogglingId(item.id);
    setFeedback(null);
    try {
      const res = await togglePromoCodeStatusAction(item.id, !item.isActive);
      if (res.success) {
        setFeedback({
          type: "success",
          text: `${item.code} is now ${!item.isActive ? "Active" : "Inactive"}.`,
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to update promo status." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error updating promo status." });
    } finally {
      setTogglingId(null);
    }
  };

  const handleApprove = async (item: AdminPromoCodeItem, isApproved: boolean) => {
    setTogglingId(item.id);
    setFeedback(null);
    try {
      const res = await approvePromoCodeAction(item.id, isApproved);
      if (res.success) {
        setFeedback({
          type: "success",
          text: `${item.code} ${isApproved ? "approved" : "rejected"}.`,
        });
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          text: res.error || `Failed to ${isApproved ? "approve" : "reject"} promo code.`,
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error updating promo approval." });
    } finally {
      setTogglingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      code: "",
      discountPercent: 10,
      targetType: "ALL",
      targetId: null,
      isActive: true,
      showOnHomepage: false,
    });
    setFormError(null);
    setModalMode("CREATE");
  };

  const openEditModal = (item: AdminPromoCodeItem) => {
    setEditingItem(item);
    let targetType: "ALL" | "TOUR" | "PROPERTY" | "VEHICLE" = "ALL";
    let targetId: string | null = null;

    if (item.tourId) {
      targetType = "TOUR";
      targetId = item.tourId;
    } else if (item.propertyId) {
      targetType = "PROPERTY";
      targetId = item.propertyId;
    } else if (item.vehicleId) {
      targetType = "VEHICLE";
      targetId = item.vehicleId;
    }

    setFormData({
      code: item.code,
      discountPercent: item.discountPercent,
      targetType,
      targetId,
      isActive: item.isActive,
      showOnHomepage: item.showOnHomepage,
    });
    setFormError(null);
    setModalMode("EDIT");
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (formData.targetType !== "ALL" && !formData.targetId) {
      setFormError(`Please select a specific ${formData.targetType.toLowerCase()} target.`);
      return;
    }

    setIsSaving(true);
    try {
      let res;
      if (modalMode === "CREATE") {
        res = await createAdminPromoCodeAction(formData);
      } else if (modalMode === "EDIT" && editingItem) {
        res = await updateAdminPromoCodeAction(editingItem.id, formData);
      }

      if (res && res.success) {
        setModalMode(null);
        setFeedback({
          type: "success",
          text: modalMode === "CREATE" ? "Promo code created." : "Promo code updated.",
        });
        router.refresh();
      } else {
        setFormError(res?.error || "Failed to save promo code.");
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Communication error.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalItem) return;
    const res = await deleteAdminPromoCodeAction(deleteModalItem.id);
    if (res.success) {
      setFeedback({ type: "success", text: `Deleted promo code ${deleteModalItem.code}.` });
      setDeleteModalItem(null);
      router.refresh();
    } else {
      throw new Error(res.error || "Failed to delete promo code.");
    }
  };

  const statusTabs: { key: PromoStatusFilter; label: string; count: number }[] = [
    { key: "ALL", label: "All Codes", count: counts.all },
    { key: "ACTIVE", label: "Active", count: counts.active },
    { key: "INACTIVE", label: "Inactive", count: counts.inactive },
    { key: "PENDING", label: "Pending", count: counts.pending },
    { key: "REJECTED", label: "Rejected", count: counts.rejected },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Promo Codes & Discounts"
        subtitle="Manage discount vouchers for tours, stays, taxis, and seasonal campaigns."
        badge={
          <StatusBadge
            status="PENDING"
            label="Ready — Pending Public Integration"
            tone="amber"
          />
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.refresh()}
              className="rounded-md border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Refresh list"
              aria-label="Refresh promo codes"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[var(--season-primary-hover)] transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Promo Code</span>
            </button>
          </div>
        }
      />

      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      {/* Public Integration Status Notice */}
      <div className="rounded-md border border-amber-200/80 bg-amber-50/70 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-0.5">
          <div className="font-semibold">Ready — Pending Public Integration</div>
          <p className="text-amber-800 leading-relaxed">
            Promo codes and Homepage Highlight flags are managed and persisted here, ready for
            checkout and homepage banner integration on the public site.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-md border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
          {statusTabs.map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-[var(--season-primary)] text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 text-[10px] font-semibold ${
                    active ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative max-w-md">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by code, tour, property, vehicle, or vendor..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:bg-white focus:outline-hidden"
          />
          {searchVal && (
            <button
              type="button"
              onClick={() => setSearchVal("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Promo Codes Grid */}
      {filteredCodes.length === 0 ? (
        <AdminEmptyState
          icon={<Tag className="h-5 w-5" />}
          title="No promo codes found"
          description={
            searchVal || statusFilter !== "ALL"
              ? "No promo codes match your active filter criteria."
              : "Create your first promotional voucher to prepare seasonal discounts."
          }
          action={
            searchVal || statusFilter !== "ALL" ? (
              <button
                type="button"
                onClick={() => {
                  setSearchVal("");
                  setStatusFilter("ALL");
                }}
                className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Reset Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[var(--season-primary-hover)] cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Promo Code</span>
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCodes.map((promo) => {
            const isBusy = togglingId === promo.id;
            return (
              <div
                key={promo.id}
                className="rounded-md border border-slate-200/90 bg-white p-4.5 flex flex-col justify-between gap-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-sm text-[var(--season-primary-hover)] tracking-wide bg-[var(--season-primary-light)] border border-[var(--season-primary)]/25 px-2.5 py-1 rounded-md">
                        {promo.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(promo.code, promo.id)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                        title="Copy promo code"
                        aria-label={`Copy ${promo.code}`}
                      >
                        {copiedId === promo.id ? (
                          <Check className="h-3.5 w-3.5 text-[var(--season-primary)]" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-900 tabular-nums">
                      {promo.discountPercent}% OFF
                    </span>
                  </div>

                  {/* Scope */}
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    {promo.tour ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-slate-700 truncate">
                        <Compass className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{promo.tour.title}</span>
                      </span>
                    ) : promo.property ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-slate-700 truncate">
                        <Building className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{promo.property.name}</span>
                      </span>
                    ) : promo.vehicle ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-slate-700 truncate">
                        <Car className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{promo.vehicle.model}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-slate-700">
                        <Globe className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span>All Services & Bookings</span>
                      </span>
                    )}
                  </div>

                  {promo.vendorProfile && (
                    <div className="text-[11px] text-slate-500">
                      Vendor: <span className="font-medium text-slate-700">{promo.vendorProfile.businessName}</span>
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={promo.isActive ? "ACTIVE" : "INACTIVE"} />
                    {promo.status === "PENDING" && (
                      <StatusBadge status="PENDING" label="Pending Approval" />
                    )}
                    {promo.status === "REJECTED" && <StatusBadge status="REJECTED" />}
                    {promo.showOnHomepage && (
                      <StatusBadge
                        status="PENDING"
                        label="Homepage Highlight (Pending Integration)"
                        tone="amber"
                        showDot={false}
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(promo)}
                      disabled={isBusy}
                      className={`rounded-md px-2.5 py-1.5 text-xs font-medium border transition-colors cursor-pointer disabled:opacity-50 ${
                        promo.isActive
                          ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          : "border-[var(--season-primary)]/30 bg-[var(--season-primary-light)] text-[var(--season-primary-hover)] hover:bg-[var(--season-primary)]/20"
                      }`}
                    >
                      {isBusy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : promo.isActive ? (
                        "Deactivate"
                      ) : (
                        "Activate"
                      )}
                    </button>

                    {promo.status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleApprove(promo, true)}
                          className="rounded-md bg-[var(--season-primary)] px-2.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-[var(--season-primary-hover)] disabled:opacity-50 cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleApprove(promo, false)}
                          className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50 cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(promo)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Edit promo code"
                      aria-label={`Edit ${promo.code}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteModalItem(promo)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete promo code"
                      aria-label={`Delete ${promo.code}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AdminModal
        open={Boolean(modalMode)}
        onClose={() => !isSaving && setModalMode(null)}
        title={modalMode === "CREATE" ? "Create Promo Code" : `Edit Promo: ${editingItem?.code || ""}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveSubmit} className="space-y-4">
          {formError && (
            <div
              role="alert"
              className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
            >
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="promo-code-input" className="block text-xs font-medium text-slate-700 mb-1">
              Coupon Code (Uppercase Alphanumeric) <span className="text-rose-600">*</span>
            </label>
            <input
              id="promo-code-input"
              type="text"
              required
              placeholder="e.g. KASHMIR10, WINTER2026"
              value={formData.code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  code: e.target.value.toUpperCase().replace(/\s+/g, ""),
                })
              }
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm font-semibold uppercase tracking-wider text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
            />
          </div>

          <div>
            <label htmlFor="promo-discount" className="block text-xs font-medium text-slate-700 mb-1">
              Discount Percentage (1% – 100%)
            </label>
            <div className="flex items-center gap-3">
              <input
                id="promo-discount"
                type="number"
                min="1"
                max="100"
                required
                value={formData.discountPercent}
                onChange={(e) =>
                  setFormData({ ...formData, discountPercent: Number(e.target.value) })
                }
                className="w-20 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
              />
              <input
                type="range"
                min="1"
                max="100"
                value={formData.discountPercent}
                onChange={(e) =>
                  setFormData({ ...formData, discountPercent: Number(e.target.value) })
                }
                className="flex-1 accent-[var(--season-primary)]"
              />
              <span className="w-10 text-right text-xs font-semibold text-slate-900 tabular-nums">
                {formData.discountPercent}%
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="promo-scope" className="block text-xs font-medium text-slate-700 mb-1">
              Applicable Target Scope
            </label>
            <select
              id="promo-scope"
              value={formData.targetType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetType: e.target.value as PromoCodeFormInput["targetType"],
                  targetId: null,
                })
              }
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
            >
              <option value="ALL">Universal (All Tours, Stays & Taxis)</option>
              <option value="TOUR">Specific Tour Only</option>
              <option value="PROPERTY">Specific Stay / Hotel Only</option>
              <option value="VEHICLE">Specific Taxi / Vehicle Only</option>
            </select>
          </div>

          {formData.targetType === "TOUR" && (
            <div>
              <label htmlFor="promo-tour" className="block text-xs font-medium text-slate-700 mb-1">
                Select Tour <span className="text-rose-600">*</span>
              </label>
              <select
                id="promo-tour"
                required
                value={formData.targetId || ""}
                onChange={(e) => setFormData({ ...formData, targetId: e.target.value || null })}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
              >
                <option value="">-- Choose a Tour --</option>
                {targets.tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.targetType === "PROPERTY" && (
            <div>
              <label htmlFor="promo-property" className="block text-xs font-medium text-slate-700 mb-1">
                Select Property <span className="text-rose-600">*</span>
              </label>
              <select
                id="promo-property"
                required
                value={formData.targetId || ""}
                onChange={(e) => setFormData({ ...formData, targetId: e.target.value || null })}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
              >
                <option value="">-- Choose a Property --</option>
                {targets.properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.targetType === "VEHICLE" && (
            <div>
              <label htmlFor="promo-vehicle" className="block text-xs font-medium text-slate-700 mb-1">
                Select Vehicle <span className="text-rose-600">*</span>
              </label>
              <select
                id="promo-vehicle"
                required
                value={formData.targetId || ""}
                onChange={(e) => setFormData({ ...formData, targetId: e.target.value || null })}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
              >
                <option value="">-- Choose a Vehicle --</option>
                {targets.vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.model} ({v.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.isActive)}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded-xs border-slate-300 text-[var(--season-primary)] accent-[var(--season-primary)] focus:ring-[var(--season-primary)]"
              />
              <span>Active</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.showOnHomepage)}
                onChange={(e) => setFormData({ ...formData, showOnHomepage: e.target.checked })}
                className="rounded-xs border-slate-300 text-[var(--season-primary)] accent-[var(--season-primary)] focus:ring-[var(--season-primary)]"
              />
              <span>
                Highlight on Homepage{" "}
                <span className="text-amber-700 font-medium">
                  (Ready — Pending Public Integration)
                </span>
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setModalMode(null)}
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[var(--season-primary-hover)] disabled:opacity-50 cursor-pointer"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{modalMode === "CREATE" ? "Save Promo Code" : "Update Promo Code"}</span>
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmActionDialog
        open={Boolean(deleteModalItem)}
        onClose={() => setDeleteModalItem(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Promo Code"
        description={
          deleteModalItem
            ? `Permanently delete code ${deleteModalItem.code}? Past bookings that already applied this code keep their historical discount record.`
            : ""
        }
        confirmLabel="Delete Code"
        tone="danger"
      />
    </div>
  );
}
