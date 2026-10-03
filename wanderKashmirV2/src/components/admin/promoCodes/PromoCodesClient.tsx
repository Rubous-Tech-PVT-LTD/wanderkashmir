"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tag,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Percent,
  Compass,
  Building,
  Car,
  Copy,
  Check,
  Globe,
  AlertTriangle,
  X,
  Sparkles,
  RefreshCw,
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

interface PromoCodesClientProps {
  initialPromoCodes: AdminPromoCodeItem[];
  targets: {
    tours: { id: string; title: string }[];
    properties: { id: string; name: string }[];
    vehicles: { id: string; model: string; type: string }[];
  };
}

export default function PromoCodesClient({
  initialPromoCodes,
  targets,
}: PromoCodesClientProps) {
  const router = useRouter();

  const [searchVal, setSearchVal] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "PENDING">("ALL");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create / Edit Modal State
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

  // Delete Modal State
  const [deleteModalItem, setDeleteModalItem] = useState<AdminPromoCodeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filteredCodes = initialPromoCodes.filter((p) => {
    if (statusFilter === "ACTIVE" && !p.isActive) return false;
    if (statusFilter === "INACTIVE" && p.isActive) return false;
    if (statusFilter === "PENDING" && p.status !== "PENDING") return false;

    if (searchVal.trim()) {
      const term = searchVal.toLowerCase();
      const codeMatch = p.code.toLowerCase().includes(term);
      const tourMatch = p.tour?.title.toLowerCase().includes(term);
      const propMatch = p.property?.name.toLowerCase().includes(term);
      return codeMatch || tourMatch || propMatch;
    }
    return true;
  });

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = async (item: AdminPromoCodeItem) => {
    setTogglingId(item.id);
    try {
      const res = await togglePromoCodeStatusAction(item.id, !item.isActive);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to update promo status");
      }
    } catch {
      alert("Network error updating status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleApprove = async (id: string, isApproved: boolean) => {
    setTogglingId(id);
    try {
      const res = await approvePromoCodeAction(id, isApproved);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to approve promo code.");
      }
    } catch {
      alert("Network error approving code.");
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
    setIsSaving(true);
    setFormError(null);

    try {
      let res;
      if (modalMode === "CREATE") {
        res = await createAdminPromoCodeAction(formData);
      } else if (modalMode === "EDIT" && editingItem) {
        res = await updateAdminPromoCodeAction(editingItem.id, formData);
      }

      if (res && res.success) {
        setModalMode(null);
        router.refresh();
      } else {
        setFormError(res?.error || "Failed to save promo code.");
      }
    } catch (err: any) {
      setFormError(err?.message || "Communication error.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalItem) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await deleteAdminPromoCodeAction(deleteModalItem.id);
      if (res.success) {
        setDeleteModalItem(null);
        router.refresh();
      } else {
        setDeleteError(res.error || "Failed to delete promo code.");
      }
    } catch (err: any) {
      setDeleteError(err?.message || "Communication error.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Tag className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Promo Codes & Discounts</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Create and manage promotional discount vouchers for tours, hotels, taxis, and seasonal campaigns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.refresh()}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" />
            Create Promo Code
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by promo code or target..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-medium text-slate-400 mr-1 hidden sm:inline">Status:</span>
          {(["ALL", "ACTIVE", "INACTIVE", "PENDING"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === st
                  ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {st === "ALL" ? "All Codes" : st === "ACTIVE" ? "Active" : st === "INACTIVE" ? "Inactive" : "Pending"}
            </button>
          ))}
        </div>
      </div>

      {/* Promo Codes Grid */}
      {filteredCodes.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Tag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No promo codes found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            {searchVal || statusFilter !== "ALL"
              ? "No promo codes matched your current filter criteria."
              : "No promotional discount codes exist yet. Click 'Create Promo Code' to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCodes.map((promo) => (
            <div
              key={promo.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between gap-4 transition ${
                promo.isActive ? "border-slate-800 hover:border-slate-700" : "border-slate-800/60 opacity-75"
              }`}
            >
              <div className="space-y-3">
                {/* Header: Code & Discount */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-lg text-emerald-400 tracking-wider bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                      {promo.code}
                    </span>
                    <button
                      onClick={() => handleCopy(promo.code, promo.id)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                      title="Copy promo code"
                    >
                      {copiedId === promo.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-lg font-black text-white bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-xl">
                    {promo.discountPercent}% OFF
                  </span>
                </div>

                {/* Target Scope */}
                <div className="text-xs text-slate-300 flex items-center gap-1.5">
                  {promo.tour ? (
                    <span className="flex items-center gap-1 text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20 truncate">
                      <Compass className="w-3.5 h-3.5 shrink-0" />
                      {promo.tour.title}
                    </span>
                  ) : promo.property ? (
                    <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 truncate">
                      <Building className="w-3.5 h-3.5 shrink-0" />
                      {promo.property.name}
                    </span>
                  ) : promo.vehicle ? (
                    <span className="flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20 truncate">
                      <Car className="w-3.5 h-3.5 shrink-0" />
                      {promo.vehicle.model}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      <Globe className="w-3.5 h-3.5" />
                      All Services & Bookings
                    </span>
                  )}
                </div>

                {/* Metadata & Status */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      promo.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-800 text-slate-500 border border-slate-700"
                    }`}
                  >
                    {promo.isActive ? "Active" : "Inactive"}
                  </span>

                  {promo.status === "PENDING" && (
                    <span className="px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Pending Approval
                    </span>
                  )}

                  {promo.showOnHomepage && (
                    <span className="px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Homepage Banner
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleStatus(promo)}
                    disabled={togglingId === promo.id}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                      promo.isActive
                        ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                    }`}
                  >
                    {togglingId === promo.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : promo.isActive ? (
                      "Deactivate"
                    ) : (
                      "Activate"
                    )}
                  </button>

                  {promo.status === "PENDING" && (
                    <button
                      onClick={() => handleApprove(promo.id, true)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                    >
                      Approve
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(promo)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                    title="Edit Promo Code"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModalItem(promo)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                    title="Delete Promo Code"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setModalMode(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-400" />
              {modalMode === "CREATE" ? "Create Promo Code" : `Edit Promo: ${editingItem?.code}`}
            </h3>

            {formError && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Coupon Code (Uppercase Alphanumeric):
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KASHMIR10, WINTER2026"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, "") })}
                  className="w-full bg-slate-950 font-mono tracking-wider font-bold border border-slate-800 rounded-xl px-3 py-2 text-sm text-emerald-400 uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Discount Percentage (1% - 100%):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                    className="w-24 bg-slate-950 font-bold border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                    className="flex-1 accent-emerald-500"
                  />
                  <span className="text-sm font-bold text-white w-12 text-right">{formData.discountPercent}%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Applicable Target Scope:</label>
                <select
                  value={formData.targetType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetType: e.target.value as any,
                      targetId: null,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">Universal (All Tours, Stays & Taxis)</option>
                  <option value="TOUR">Specific Tour Only</option>
                  <option value="PROPERTY">Specific Hotel/Homestay Only</option>
                  <option value="VEHICLE">Specific Taxi/Vehicle Only</option>
                </select>
              </div>

              {formData.targetType === "TOUR" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Tour:</label>
                  <select
                    value={formData.targetId || ""}
                    onChange={(e) => setFormData({ ...formData, targetId: e.target.value || null })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Property:</label>
                  <select
                    value={formData.targetId || ""}
                    onChange={(e) => setFormData({ ...formData, targetId: e.target.value || null })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Vehicle:</label>
                  <select
                    value={formData.targetId || ""}
                    onChange={(e) => setFormData({ ...formData, targetId: e.target.value || null })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
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

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-slate-800 text-emerald-500 focus:ring-0"
                  />
                  Immediately Active
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-purple-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnHomepage}
                    onChange={(e) => setFormData({ ...formData, showOnHomepage: e.target.checked })}
                    className="rounded border-slate-800 text-purple-500 focus:ring-0"
                  />
                  Highlight on Homepage
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />}
                  {modalMode === "CREATE" ? "Save Promo Code" : "Update Promo Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white text-center">Delete Promo Code</h3>
            <p className="text-xs text-slate-400 text-center mt-1">
              Are you sure you want to permanently delete code{" "}
              <strong className="text-white font-mono">{deleteModalItem.code}</strong>? Past bookings that already
              used this code will retain their historical discount record.
            </p>

            {deleteError && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-center">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500 text-white hover:bg-red-600 font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
