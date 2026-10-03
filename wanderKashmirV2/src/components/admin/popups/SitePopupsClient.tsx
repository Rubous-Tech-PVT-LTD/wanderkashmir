"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Sparkles,
  Layers,
  Clock,
  Globe,
  Compass,
  Building,
  Car,
  X,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  AdminSitePopupItem,
  SitePopupFormInput,
  createAdminSitePopupAction,
  updateAdminSitePopupAction,
  toggleAdminSitePopupAction,
  deleteAdminSitePopupAction,
} from "@/actions/adminSitePopups";

interface SitePopupsClientProps {
  initialPopups: AdminSitePopupItem[];
}

export default function SitePopupsClient({ initialPopups }: SitePopupsClientProps) {
  const router = useRouter();

  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Preview Modal
  const [previewPopup, setPreviewPopup] = useState<AdminSitePopupItem | null>(null);

  // Create / Edit Modal State
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT" | null>(null);
  const [editingItem, setEditingItem] = useState<AdminSitePopupItem | null>(null);
  const [formData, setFormData] = useState<SitePopupFormInput>({
    type: "MARKETING",
    title: "",
    description: "",
    buttonText: "Explore Now",
    buttonLink: "/tours",
    displayStyle: "MODAL",
    triggerRule: "DELAY_5S",
    targetPages: "ALL",
    isActive: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Modal State
  const [deleteModalItem, setDeleteModalItem] = useState<AdminSitePopupItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleToggleActive = async (popup: AdminSitePopupItem) => {
    setTogglingId(popup.id);
    try {
      const res = await toggleAdminSitePopupAction(popup.id, !popup.isActive);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to update popup status.");
      }
    } catch {
      alert("Network error updating popup status.");
    } finally {
      setTogglingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      type: "MARKETING",
      title: "",
      description: "",
      buttonText: "Explore Now",
      buttonLink: "/tours",
      displayStyle: "MODAL",
      triggerRule: "DELAY_5S",
      targetPages: "ALL",
      isActive: false,
    });
    setFormError(null);
    setModalMode("CREATE");
  };

  const openEditModal = (popup: AdminSitePopupItem) => {
    setEditingItem(popup);
    setFormData({
      type: popup.type,
      title: popup.title,
      description: popup.description,
      buttonText: popup.buttonText || "",
      buttonLink: popup.buttonLink || "",
      displayStyle: popup.displayStyle,
      triggerRule: popup.triggerRule,
      targetPages: popup.targetPages,
      isActive: popup.isActive,
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
        res = await createAdminSitePopupAction(formData);
      } else if (modalMode === "EDIT" && editingItem) {
        res = await updateAdminSitePopupAction(editingItem.id, formData);
      }

      if (res && res.success) {
        setModalMode(null);
        router.refresh();
      } else {
        setFormError(res?.error || "Failed to save popup.");
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
      const res = await deleteAdminSitePopupAction(deleteModalItem.id);
      if (res.success) {
        setDeleteModalItem(null);
        router.refresh();
      } else {
        setDeleteError(res.error || "Failed to delete popup.");
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
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Megaphone className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Site Popups & Promotion Banners</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Configure promotional banners, announcement modals, and seasonal discount popups across the site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.refresh()}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
            title="Refresh popups"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" />
            Create Site Popup
          </button>
        </div>
      </div>

      {/* Preservation Notice: Smart Customize Trip Popup */}
      <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-emerald-400 block">Smart Customize Trip Popup System Active</span>
          <p className="text-slate-300 leading-relaxed">
            The intelligent V2 Smart Customize Trip lead popup (with 35s timer, exit-intent detection, and localStorage
            guards) operates automatically on public tour and destination pages. Site Popups configured below serve as
            general announcements, marketing banners, and seasonal promo highlights.
          </p>
        </div>
      </div>

      {/* Popups Grid */}
      {initialPopups.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No site popups configured</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Create your first marketing popup or announcement banner to engage website visitors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {initialPopups.map((popup) => (
            <div
              key={popup.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between gap-4 transition ${
                popup.isActive ? "border-emerald-500/50 shadow-lg shadow-emerald-500/5" : "border-slate-800 opacity-80"
              }`}
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      popup.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-800 text-slate-500 border border-slate-700"
                    }`}
                  >
                    {popup.isActive ? "Active on Site" : "Inactive"}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {popup.type}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-white text-base leading-snug line-clamp-1">{popup.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{popup.description}</p>
                </div>

                {/* Rules & Scope */}
                <div className="space-y-1.5 pt-2 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Display Style:</span>
                    <strong className="text-white">{popup.displayStyle}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Trigger:</span>
                    <strong className="text-white">{popup.triggerRule}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>Target:</span>
                    <strong className="text-white">{popup.targetPages}</strong>
                  </div>
                </div>

                {/* CTA Button Badge */}
                {popup.buttonText && (
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      CTA: {popup.buttonText} &rarr; {popup.buttonLink || "/"}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-2">
                <button
                  onClick={() => handleToggleActive(popup)}
                  disabled={togglingId === popup.id}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                    popup.isActive
                      ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      : "bg-emerald-500 text-slate-950 font-bold border-emerald-400 hover:bg-emerald-400"
                  }`}
                >
                  {togglingId === popup.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : popup.isActive ? (
                    "Deactivate"
                  ) : (
                    "Activate"
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewPopup(popup)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                    title="Live Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(popup)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                    title="Edit Popup"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModalItem(popup)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                    title="Delete Popup"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Preview Modal */}
      {previewPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setPreviewPopup(null)}
              className="absolute -top-10 right-0 text-slate-300 hover:text-white p-1 text-xs flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Close Preview
            </button>

            {previewPopup.displayStyle === "BANNER" ? (
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-4 rounded-2xl shadow-2xl text-white flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-sm">{previewPopup.title}</div>
                  <div className="text-xs text-orange-100">{previewPopup.description}</div>
                </div>
                {previewPopup.buttonText && (
                  <span className="px-3 py-1.5 bg-white text-orange-600 font-bold text-xs rounded-xl shadow shrink-0">
                    {previewPopup.buttonText}
                  </span>
                )}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl shadow-2xl space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto border border-orange-500/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{previewPopup.title}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{previewPopup.description}</p>
                </div>
                {previewPopup.buttonText && (
                  <div className="pt-2">
                    <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs shadow-lg">
                      {previewPopup.buttonText}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalMode(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-emerald-400" />
              {modalMode === "CREATE" ? "Create Site Popup" : `Edit Popup: ${editingItem?.title}`}
            </h3>

            {formError && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Popup Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Autumn Discount: 15% OFF"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description / Content:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Book any 7-day Kashmir package this week and get complimentary Shikara rides..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Button Text:</label>
                  <input
                    type="text"
                    placeholder="e.g. Explore Offers"
                    value={formData.buttonText || ""}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Button Link:</label>
                  <input
                    type="text"
                    placeholder="/tours or https://..."
                    value={formData.buttonLink || ""}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Display Style:</label>
                  <select
                    value={formData.displayStyle}
                    onChange={(e) => setFormData({ ...formData, displayStyle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="MODAL">Modal Center</option>
                    <option value="BANNER">Top Banner</option>
                    <option value="SLIDE_IN">Bottom Slide-In</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Trigger Rule:</label>
                  <select
                    value={formData.triggerRule}
                    onChange={(e) => setFormData({ ...formData, triggerRule: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="DELAY_5S">Delay 5 Seconds</option>
                    <option value="IMMEDIATE">Immediate Load</option>
                    <option value="SCROLL_50">Scroll 50%</option>
                    <option value="EXIT_INTENT">Exit Intent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Pages:</label>
                  <select
                    value={formData.targetPages}
                    onChange={(e) => setFormData({ ...formData, targetPages: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">All Pages</option>
                    <option value="HOMEPAGE">Homepage Only</option>
                    <option value="TOURS">Tour Pages Only</option>
                    <option value="HOTELS">Hotel/Stay Pages</option>
                    <option value="TAXIS">Taxi Pages Only</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-0"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-medium text-slate-300 cursor-pointer">
                  Activate popup immediately (automatically pauses other active popups)
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
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Megaphone className="w-3.5 h-3.5" />}
                  {modalMode === "CREATE" ? "Create Popup" : "Save Changes"}
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
            <h3 className="text-base font-bold text-white text-center">Delete Site Popup</h3>
            <p className="text-xs text-slate-400 text-center mt-1">
              Are you sure you want to permanently delete popup &ldquo;{deleteModalItem.title}&rdquo;?
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
                Delete Popup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
