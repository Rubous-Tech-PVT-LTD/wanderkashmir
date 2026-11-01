"use client";

import { useState, useEffect } from "react";
import {
  Plus, Edit2, Trash2, Eye, X, ArrowUp, ArrowDown,
  Sparkles, CheckCircle2, XCircle, ExternalLink, Image as ImageIcon, Map
} from "lucide-react";
import {
  getTravelStylesAdmin,
  getAllToursForSelect,
  createTravelStyle,
  updateTravelStyle,
  deleteTravelStyle,
  toggleTravelStyleStatus,
  reorderTravelStyles,
  TravelStyleInput
} from "@/actions/admin-travel-styles";
import toast from "react-hot-toast";

export default function AdminTravelStylesTab() {
  const [styles, setStyles] = useState<any[]>([]);
  const [allTours, setAllTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<any>(null);

  // Viewing assigned tours modal
  const [viewingStyle, setViewingStyle] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    imageAlt: string;
    isActive: boolean;
    displayOrder: number;
    assignedTourIds: string[];
  }>({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    imageAlt: "",
    isActive: true,
    displayOrder: 1,
    assignedTourIds: [],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stylesData, toursData] = await Promise.all([
        getTravelStylesAdmin(),
        getAllToursForSelect(),
      ]);
      setStyles(stylesData);
      setAllTours(toursData);
    } catch (e: any) {
      toast.error("Failed to load travel styles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (style?: any) => {
    if (style) {
      setEditingStyle(style);
      const linkedTourIds = (style.tours || []).map((t: any) => t.tour?.id).filter(Boolean);
      setFormData({
        name: style.name || "",
        slug: style.slug || "",
        description: style.description || "",
        imageUrl: style.imageUrl || "",
        imageAlt: style.imageAlt || "",
        isActive: style.isActive ?? true,
        displayOrder: style.displayOrder ?? 1,
        assignedTourIds: linkedTourIds,
      });
    } else {
      setEditingStyle(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        imageUrl: "",
        imageAlt: "",
        isActive: true,
        displayOrder: styles.length + 1,
        assignedTourIds: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSlugify = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!editingStyle) {
      setFormData((prev) => ({
        ...prev,
        name: val,
        slug: handleSlugify(val),
      }));
    } else {
      setFormData((prev) => ({ ...prev, name: val }));
    }
  };

  const toggleTourAssignment = (tourId: string) => {
    setFormData((prev) => {
      const exists = prev.assignedTourIds.includes(tourId);
      const updated = exists
        ? prev.assignedTourIds.filter((id) => id !== tourId)
        : [...prev.assignedTourIds, tourId];
      return { ...prev, assignedTourIds: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Name is required");

    const tId = toast.loading(editingStyle ? "Updating travel style..." : "Creating travel style...");

    const payload: TravelStyleInput = {
      name: formData.name,
      slug: formData.slug || handleSlugify(formData.name),
      description: formData.description,
      imageUrl: formData.imageUrl,
      imageAlt: formData.imageAlt,
      isActive: formData.isActive,
      displayOrder: Number(formData.displayOrder) || 1,
      assignedTourIds: formData.assignedTourIds,
    };

    const res = editingStyle
      ? await updateTravelStyle(editingStyle.id, payload)
      : await createTravelStyle(payload);

    if (res.success) {
      toast.success(editingStyle ? "Travel style updated" : "Travel style created", { id: tId });
      setIsModalOpen(false);
      fetchData();
    } else {
      toast.error(res.error || "Failed to save", { id: tId });
    }
  };

  const handleToggleStatus = async (id: string) => {
    const tId = toast.loading("Updating status...");
    const res = await toggleTravelStyleStatus(id);
    if (res.success) {
      toast.success(res.isActive ? "Activated" : "Deactivated", { id: tId });
      fetchData();
    } else {
      toast.error(res.error || "Failed to update status", { id: tId });
    }
  };

  const handleDelete = async (style: any) => {
    const hasTours = style._count?.tours > 0;
    const confirmMsg = hasTours
      ? `"${style.name}" has ${style._count.tours} assigned published tour(s). Deleting will safely deactivate (archive) it so tour relationships and URLs remain intact. Proceed?`
      : `Are you sure you want to delete "${style.name}"?`;

    if (!confirm(confirmMsg)) return;

    const tId = toast.loading("Processing...");
    const res = await deleteTravelStyle(style.id);
    if (res.success) {
      toast.success(res.message || "Deleted", { id: tId });
      fetchData();
    } else {
      toast.error(res.error || "Failed to delete", { id: tId });
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= styles.length) return;

    const updated = [...styles];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Recalculate displayOrders
    const payload = updated.map((item, idx) => ({
      id: item.id,
      displayOrder: idx + 1,
    }));

    setStyles(updated);
    const res = await reorderTravelStyles(payload);
    if (!res.success) {
      toast.error("Failed to persist order");
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold text-slate-900">
              Travel Styles &quot;Help Me Choose&quot; CMS
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage public travel style intents, display order, CMS media, and assign real published tours.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Travel Style</span>
        </button>
      </div>

      {/* Main Table / Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading travel styles...</div>
        ) : styles.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-slate-700">No Travel Styles Found</h3>
            <p className="text-xs text-slate-400">Click &quot;Add Travel Style&quot; to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16 text-center">Order</th>
                  <th className="py-3 px-4 w-20">Media</th>
                  <th className="py-3 px-4">Name &amp; Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Live Tours</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {styles.map((style, idx) => {
                  const publishedCount = style._count?.tours || 0;
                  return (
                    <tr key={style.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Order + Move Buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-bold text-slate-600 text-xs w-4">{style.displayOrder}</span>
                          <div className="flex flex-col">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveOrder(idx, "up")}
                              className="text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer p-0.5"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === styles.length - 1}
                              onClick={() => handleMoveOrder(idx, "down")}
                              className="text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer p-0.5"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Image Preview */}
                      <td className="py-3 px-4">
                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative shrink-0 flex items-center justify-center">
                          {style.imageUrl ? (
                            <img
                              src={style.imageUrl}
                              alt={style.imageAlt || style.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </td>

                      {/* Name & Slug */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{style.name}</div>
                        <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>/tours/{style.slug}</span>
                          <a
                            href={`/tours/${style.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-600 inline-flex items-center"
                            title="Open public page"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 text-slate-600 text-xs max-w-xs truncate">
                        {style.description || <span className="text-slate-300 italic">No description</span>}
                      </td>

                      {/* Published Tour Count */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setViewingStyle(style)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer"
                          title="Click to view assigned tours"
                        >
                          <Map className="w-3 h-3" />
                          <span>{publishedCount} Tour{publishedCount === 1 ? "" : "s"}</span>
                        </button>
                      </td>

                      {/* Active Status */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(style.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                            style.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {style.isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(style)}
                            className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Travel Style"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(style)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Safe Delete / Archive"
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
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-bold text-slate-900">
                  {editingStyle ? `Edit Travel Style: ${editingStyle.name}` : "Create New Travel Style"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Nature, Culture, Adventure"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Slug <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: handleSlugify(e.target.value) })}
                    placeholder="e.g. nature, culture"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono text-slate-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Scenic Himalayan Escapes"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Image URL & Image Alt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Image Alt Text
                  </label>
                  <input
                    type="text"
                    value={formData.imageAlt}
                    onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                    placeholder="Descriptive image alt text"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Display Order & Active Checkbox */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-slate-800">
                      Active (Visible to Public)
                    </span>
                  </label>
                </div>
              </div>

              {/* Assigned Tours (Many-to-Many) */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Assign Real Tours ({formData.assignedTourIds.length} Selected)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    A tour can belong to multiple travel styles
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 max-h-52 overflow-y-auto space-y-2 bg-slate-50/50">
                  {allTours.length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-4">No tours available</div>
                  ) : (
                    allTours.map((tour) => {
                      const isChecked = formData.assignedTourIds.includes(tour.id);
                      return (
                        <label
                          key={tour.id}
                          className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                            isChecked
                              ? "bg-orange-50 border-orange-200 text-slate-900"
                              : "bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleTourAssignment(tour.id)}
                              className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate">{tour.title}</p>
                              <p className="text-[10px] text-slate-400 font-mono">/tours/{tour.slug}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-[10px] text-slate-500 font-medium">
                              {tour.duration}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                tour.isLive
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {tour.isLive ? "LIVE" : "DRAFT"}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  {editingStyle ? "Save Changes" : "Create Travel Style"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ASSIGNED TOURS MODAL */}
      {viewingStyle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Tours in &quot;{viewingStyle.name}&quot;
                </h3>
                <p className="text-xs text-slate-400">
                  {viewingStyle._count?.tours || 0} published tour(s) currently live
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingStyle(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              {(viewingStyle.tours || []).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No tours currently assigned to this travel style.
                </div>
              ) : (
                viewingStyle.tours.map((item: any) => {
                  const t = item.tour;
                  if (!t) return null;
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50"
                    >
                      <div>
                        <div className="font-semibold text-xs text-slate-800">{t.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">/tours/{t.slug}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            t.isLive ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {t.isLive ? "LIVE" : "DRAFT"}
                        </span>
                        <a
                          href={`/tours/${t.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-orange-500 p-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setViewingStyle(null)}
                className="px-4 py-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
