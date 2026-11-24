"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  Layers,
  Clock,
  Globe,
  RefreshCw,
  Info,
} from "lucide-react";
import {
  AdminSitePopupItem,
  SitePopupFormInput,
  createAdminSitePopupAction,
  updateAdminSitePopupAction,
  toggleAdminSitePopupAction,
  deleteAdminSitePopupAction,
} from "@/actions/adminSitePopups";
import {
  AdminPageHeader,
  AdminToastBanner,
  AdminModal,
  ConfirmActionDialog,
  AdminEmptyState,
  StatusBadge,
  type FeedbackMessage,
} from "@/components/admin/ui";

interface SitePopupsClientProps {
  initialPopups: AdminSitePopupItem[];
}

const DISPLAY_STYLE_LABELS: Record<string, string> = {
  MODAL: "Center Modal",
  BANNER: "Top Banner",
  SLIDE_IN: "Bottom Slide-In",
};

const TRIGGER_RULE_LABELS: Record<string, string> = {
  DELAY_5S: "Delay 5 seconds",
  IMMEDIATE: "Immediate load",
  SCROLL_50: "Scroll 50%",
  EXIT_INTENT: "Exit intent",
};

const TARGET_PAGE_LABELS: Record<string, string> = {
  ALL: "All pages",
  HOMEPAGE: "Homepage only",
  TOURS: "Tour pages",
  HOTELS: "Stay / hotel pages",
  TAXIS: "Taxi pages",
};

const POPUP_TYPE_LABELS: Record<string, string> = {
  MARKETING: "Marketing",
  ANNOUNCEMENT: "Announcement",
  SEASONAL: "Seasonal Offer",
  DISCOUNT: "Discount",
};

export default function SitePopupsClient({ initialPopups }: SitePopupsClientProps) {
  const router = useRouter();

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const [previewPopup, setPreviewPopup] = useState<AdminSitePopupItem | null>(null);

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

  const [deleteModalItem, setDeleteModalItem] = useState<AdminSitePopupItem | null>(null);

  const handleToggleActive = async (popup: AdminSitePopupItem) => {
    setTogglingId(popup.id);
    setFeedback(null);
    try {
      const res = await toggleAdminSitePopupAction(popup.id, !popup.isActive);
      if (res.success) {
        setFeedback({
          type: "success",
          text: `"${popup.title}" is now ${!popup.isActive ? "Active" : "Inactive"}.`,
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to update popup status." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error updating popup status." });
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
        setFeedback({
          type: "success",
          text: modalMode === "CREATE" ? "Site popup created." : "Site popup updated.",
        });
        router.refresh();
      } else {
        setFormError(res?.error || "Failed to save popup.");
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Communication error.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalItem) return;
    const res = await deleteAdminSitePopupAction(deleteModalItem.id);
    if (res.success) {
      setFeedback({ type: "success", text: `Deleted "${deleteModalItem.title}".` });
      setDeleteModalItem(null);
      router.refresh();
    } else {
      throw new Error(res.error || "Failed to delete popup.");
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Site Popups & Banners"
        subtitle="Configure announcement modals, promotional banners, and seasonal offers."
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
              title="Refresh popups"
              aria-label="Refresh popups"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[var(--season-primary-hover)] transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Site Popup</span>
            </button>
          </div>
        }
      />

      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      {/* Integration Status & Smart Trip Popup Notice */}
      <div className="rounded-md border border-amber-200/80 bg-amber-50/70 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1">
          <div className="font-semibold">Ready — Pending Public Integration</div>
          <p className="leading-relaxed text-amber-800">
            Site Popups saved here are stored in the database and ready for public frontend
            integration. Separately, the built-in Smart Customize Trip lead popup (15s timer,
            exit-intent detection, and localStorage frequency guard) runs automatically on public
            tour and destination pages.
          </p>
        </div>
      </div>

      {/* Popups Grid */}
      {initialPopups.length === 0 ? (
        <AdminEmptyState
          icon={<Megaphone className="h-5 w-5" />}
          title="No site popups configured"
          description="Create a promotional banner or announcement modal to prepare upcoming campaigns."
          action={
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[var(--season-primary-hover)] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Site Popup</span>
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialPopups.map((popup) => (
            <div
              key={popup.id}
              className={`rounded-md border bg-white p-4.5 flex flex-col justify-between gap-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors ${
                popup.isActive ? "border-[var(--season-primary)]/40 ring-1 ring-[var(--season-primary)]/10" : "border-slate-200/90"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge
                    status={popup.isActive ? "ACTIVE" : "INACTIVE"}
                    label={popup.isActive ? "Active (Pending Public Wire)" : "Inactive"}
                    tone={popup.isActive ? "emerald" : "slate"}
                  />
                  <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {POPUP_TYPE_LABELS[popup.type] || popup.type}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                    {popup.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {popup.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-500">Style:</span>
                    <span className="font-medium text-slate-800">
                      {DISPLAY_STYLE_LABELS[popup.displayStyle] || popup.displayStyle}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-500">Trigger:</span>
                    <span className="font-medium text-slate-800">
                      {TRIGGER_RULE_LABELS[popup.triggerRule] || popup.triggerRule}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-500">Target:</span>
                    <span className="font-medium text-slate-800">
                      {TARGET_PAGE_LABELS[popup.targetPages] || popup.targetPages}
                    </span>
                  </div>
                </div>

                {popup.buttonText && (
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 rounded-md border border-[var(--season-primary)]/20 bg-[var(--season-primary-light)] px-2.5 py-1 text-[11px] font-medium text-[var(--season-primary-hover)]">
                      CTA: {popup.buttonText} → {popup.buttonLink || "/"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleActive(popup)}
                  disabled={togglingId === popup.id}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer disabled:opacity-50 ${
                    popup.isActive
                      ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      : "border-[var(--season-primary)] bg-[var(--season-primary)] text-white hover:bg-[var(--season-primary-hover)]"
                  }`}
                >
                  {togglingId === popup.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : popup.isActive ? (
                    "Deactivate"
                  ) : (
                    "Activate"
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewPopup(popup)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                    title="Preview popup"
                    aria-label="Preview popup"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(popup)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                    title="Edit popup"
                    aria-label="Edit popup"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteModalItem(popup)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete popup"
                    aria-label="Delete popup"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <AdminModal
        open={Boolean(previewPopup)}
        onClose={() => setPreviewPopup(null)}
        title="Popup Preview"
        subtitle={
          previewPopup
            ? `${DISPLAY_STYLE_LABELS[previewPopup.displayStyle] || previewPopup.displayStyle} · ${
                TARGET_PAGE_LABELS[previewPopup.targetPages] || previewPopup.targetPages
              }`
            : undefined
        }
        maxWidth="md"
      >
        {previewPopup && (
          <div className="py-2">
            {previewPopup.displayStyle === "BANNER" ? (
              <div className="rounded-md bg-[var(--season-primary)] p-4 text-white flex items-center justify-between gap-4 shadow-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-sm">{previewPopup.title}</div>
                  <div className="text-xs text-white/80">{previewPopup.description}</div>
                </div>
                {previewPopup.buttonText && (
                  <span className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-[var(--season-primary)] shrink-0">
                    {previewPopup.buttonText}
                  </span>
                )}
              </div>
            ) : previewPopup.displayStyle === "SLIDE_IN" ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-6 flex justify-end items-end min-h-[200px]">
                <div className="w-72 rounded-md border border-slate-200 bg-white p-4 shadow-lg space-y-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--season-primary)]">
                    {POPUP_TYPE_LABELS[previewPopup.type] || previewPopup.type}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{previewPopup.title}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {previewPopup.description}
                  </p>
                  {previewPopup.buttonText && (
                    <div className="pt-1">
                      <span className="inline-block w-full text-center rounded-md bg-[var(--season-primary)] py-2 text-xs font-semibold text-white">
                        {previewPopup.buttonText}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-slate-200 bg-white p-6 shadow-md space-y-4 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--season-primary)]">
                  {POPUP_TYPE_LABELS[previewPopup.type] || previewPopup.type}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{previewPopup.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {previewPopup.description}
                  </p>
                </div>
                {previewPopup.buttonText && (
                  <div className="pt-1">
                    <span className="inline-block w-full rounded-md bg-[var(--season-primary)] py-2.5 text-xs font-semibold text-white">
                      {previewPopup.buttonText}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {/* Create / Edit Modal */}
      <AdminModal
        open={Boolean(modalMode)}
        onClose={() => !isSaving && setModalMode(null)}
        title={modalMode === "CREATE" ? "Create Site Popup" : `Edit Popup: ${editingItem?.title || ""}`}
        subtitle="Saved popups are ready for public frontend integration."
        maxWidth="lg"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label htmlFor="popup-title" className="block text-xs font-medium text-slate-700 mb-1">
                Popup Title <span className="text-rose-600">*</span>
              </label>
              <input
                id="popup-title"
                type="text"
                required
                placeholder="e.g. Autumn Kashmir Offer: 15% Off"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="popup-type" className="block text-xs font-medium text-slate-700 mb-1">
                Popup Type
              </label>
              <select
                id="popup-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
              >
                <option value="MARKETING">Marketing</option>
                <option value="ANNOUNCEMENT">Announcement</option>
                <option value="SEASONAL">Seasonal Offer</option>
                <option value="DISCOUNT">Discount</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="popup-desc" className="block text-xs font-medium text-slate-700 mb-1">
              Description / Content <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="popup-desc"
              rows={3}
              required
              placeholder="Book a 7-day Kashmir package and receive complimentary Shikara rides..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="popup-btn-text" className="block text-xs font-medium text-slate-700 mb-1">
                Button Text
              </label>
              <input
                id="popup-btn-text"
                type="text"
                placeholder="e.g. Explore Offers"
                value={formData.buttonText || ""}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
              />
            </div>
            <div>
              <label htmlFor="popup-btn-link" className="block text-xs font-medium text-slate-700 mb-1">
                Button Link
              </label>
              <input
                id="popup-btn-link"
                type="text"
                placeholder="/tours or https://..."
                value={formData.buttonLink || ""}
                onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="popup-style" className="block text-xs font-medium text-slate-700 mb-1">
                Display Style
              </label>
              <select
                id="popup-style"
                value={formData.displayStyle}
                onChange={(e) => setFormData({ ...formData, displayStyle: e.target.value })}
                className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
              >
                <option value="MODAL">Center Modal</option>
                <option value="BANNER">Top Banner</option>
                <option value="SLIDE_IN">Bottom Slide-In</option>
              </select>
            </div>

            <div>
              <label htmlFor="popup-trigger" className="block text-xs font-medium text-slate-700 mb-1">
                Trigger Rule
              </label>
              <select
                id="popup-trigger"
                value={formData.triggerRule}
                onChange={(e) => setFormData({ ...formData, triggerRule: e.target.value })}
                className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
              >
                <option value="DELAY_5S">Delay 5 seconds</option>
                <option value="IMMEDIATE">Immediate load</option>
                <option value="SCROLL_50">Scroll 50%</option>
                <option value="EXIT_INTENT">Exit intent</option>
              </select>
            </div>

            <div>
              <label htmlFor="popup-target" className="block text-xs font-medium text-slate-700 mb-1">
                Target Pages
              </label>
              <select
                id="popup-target"
                value={formData.targetPages}
                onChange={(e) => setFormData({ ...formData, targetPages: e.target.value })}
                className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
              >
                <option value="ALL">All pages</option>
                <option value="HOMEPAGE">Homepage only</option>
                <option value="TOURS">Tour pages</option>
                <option value="HOTELS">Stay / hotel pages</option>
                <option value="TAXIS">Taxi pages</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 pt-1 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded-xs border-slate-300 text-[var(--season-primary)] accent-[var(--season-primary)] focus:ring-[var(--season-primary)]"
            />
            <span>Mark as active (deactivates other active popups)</span>
          </label>

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
              <span>{modalMode === "CREATE" ? "Create Popup" : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmActionDialog
        open={Boolean(deleteModalItem)}
        onClose={() => setDeleteModalItem(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Site Popup"
        description={
          deleteModalItem
            ? `Permanently delete "${deleteModalItem.title}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete Popup"
        tone="danger"
      />
    </div>
  );
}
