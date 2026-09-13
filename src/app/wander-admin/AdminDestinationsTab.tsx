"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Edit2, Trash2, ArrowUp, ArrowDown, MapPin, 
  ExternalLink, Upload, CheckCircle2, Eye, EyeOff, Loader2 
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import toast from "react-hot-toast";
import Image from "next/image";
import { 
  getDestinations, 
  saveDestination, 
  deleteDestination, 
  reorderDestinations, 
  type DestinationItem 
} from "@/actions/destinations";

export default function AdminDestinationsTab() {
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DestinationItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    link: "",
    isActive: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getDestinations(false);
      setDestinations(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load destinations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      image: "",
      link: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: DestinationItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      image: item.image,
      link: item.link || `/tours?destination=${encodeURIComponent(item.name)}`,
      isActive: item.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return toast.error("Please enter a destination name");
    }
    if (!formData.image.trim()) {
      return toast.error("Please provide an image URL or upload a photo");
    }

    setIsSaving(true);
    const toastId = toast.loading(editingItem ? "Updating destination..." : "Adding destination...");

    const res = await saveDestination({
      id: editingItem ? editingItem.id : undefined,
      name: formData.name.trim(),
      image: formData.image.trim(),
      link: formData.link.trim() || `/tours?destination=${encodeURIComponent(formData.name.trim())}`,
      isActive: formData.isActive,
    });

    setIsSaving(false);
    if (res.success) {
      toast.success(editingItem ? "Destination updated!" : "Destination added!", { id: toastId });
      setIsModalOpen(false);
      loadData();
    } else {
      toast.error(res.error || "Failed to save destination", { id: toastId });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from destinations?`)) {
      return;
    }
    const toastId = toast.loading("Removing destination...");
    const res = await deleteDestination(id);
    if (res.success) {
      toast.success("Destination removed", { id: toastId });
      loadData();
    } else {
      toast.error(res.error || "Failed to delete", { id: toastId });
    }
  };

  const handleToggleActive = async (item: DestinationItem) => {
    const updated = !item.isActive;
    const res = await saveDestination({
      id: item.id,
      name: item.name,
      image: item.image,
      link: item.link,
      isActive: updated,
    });
    if (res.success) {
      toast.success(`${item.name} is now ${updated ? "Active" : "Hidden"}`);
      loadData();
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= destinations.length) return;

    const reordered = [...destinations];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    setDestinations(reordered);
    const orderedIds = reordered.map((d) => d.id);
    const res = await reorderDestinations(orderedIds);
    if (!res.success) {
      toast.error("Failed to update order");
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <MapPin className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Destinations (Story Circles)</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Manage circular Instagram-style destination cards displayed right below the Hero Action Bar.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#f97316] text-white font-bold text-sm rounded-xl hover:bg-[#ea580c] transition-colors shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Destination
        </button>
      </div>

      {/* Live Preview Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
            Live Website Preview
          </span>
          <span className="text-xs text-slate-400">
            Active: {destinations.filter((d) => d.isActive !== false).length} / {destinations.length}
          </span>
        </div>
        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2">
          <div className="flex items-center gap-4">
            {destinations
              .filter((d) => d.isActive !== false)
              .map((d) => (
                <div key={d.id} className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500">
                    <div className="w-14 h-14 rounded-full p-[2px] bg-white">
                      <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={d.image}
                          alt={d.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-200 text-center truncate max-w-[64px]">
                    {d.name}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Destinations List / Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 flex items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          <span>Loading destinations...</span>
        </div>
      ) : destinations.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center space-y-3">
          <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Destinations Added</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Click &quot;Add Destination&quot; above to add your first circular story highlight destination.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add First Destination
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4">Target Link</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {destinations.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Order Controls */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, "up")}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-30 transition-colors"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-slate-700 w-4 text-center">
                          {idx + 1}
                        </span>
                        <button
                          type="button"
                          disabled={idx === destinations.length - 1}
                          onClick={() => handleMove(idx, "down")}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-30 transition-colors"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Circular Preview + Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative p-[1.5px] rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 shrink-0">
                          <div className="w-11 h-11 rounded-full p-[1.5px] bg-white">
                            <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[200px]">ID: {item.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Target Link */}
                    <td className="py-3.5 px-4 text-slate-600 max-w-[240px]">
                      <a
                        href={item.link || `/tours?destination=${encodeURIComponent(item.name)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline truncate max-w-full"
                      >
                        <span className="truncate">{item.link || `/tours?destination=${item.name}`}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>

                    {/* Active Status */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                          item.isActive !== false
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {item.isActive !== false ? (
                          <>
                            <Eye className="w-3 h-3" /> Live
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Hidden
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit Destination"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Destination"
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
        </div>
      )}

      {/* Add / Edit Destination Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingItem ? "Edit Destination" : "Add New Destination"}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Enter the destination name, upload or paste an image, and configure its click link.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Destination Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Destination Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gulmarg, Pahalgam, Dal Lake"
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name: val,
                      link:
                        !editingItem && (!prev.link || prev.link.startsWith("/tours?destination="))
                          ? `/tours?destination=${encodeURIComponent(val)}`
                          : prev.link,
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              {/* Image Preview & Upload / URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Destination Image <span className="text-red-500">*</span>
                </label>

                {/* Circular Preview */}
                <div className="flex items-center gap-3.5 mb-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 shrink-0">
                    <div className="w-14 h-14 rounded-full p-[2px] bg-white">
                      <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-200">
                        {formData.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <MapPin className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">
                      {formData.name || "Destination Preview"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {formData.image ? "Image loaded" : "No image selected"}
                    </p>
                  </div>

                  {/* Cloudinary Upload Button */}
                  <CldUploadWidget
                    uploadPreset="wanderkashmir_preset"
                    onSuccess={(result: any) => {
                      if (result?.event === "success" && result?.info?.secure_url) {
                        setFormData((prev) => ({ ...prev, image: result.info.secure_url }));
                        toast.success("Image uploaded successfully!");
                      }
                    }}
                    options={{
                      multiple: false,
                      resourceType: "image",
                      clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
                    }}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => open()}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 text-xs font-bold rounded-lg shadow-sm transition-all shrink-0 flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload
                      </button>
                    )}
                  </CldUploadWidget>
                </div>

                {/* Direct Image URL input */}
                <input
                  type="url"
                  placeholder="Or paste direct image URL (Cloudinary / Unsplash)"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              {/* Target Link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Click Link / URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. /tours?destination=Gulmarg or /stays?q=Gulmarg"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Display this destination publicly on the homepage
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-sm font-bold text-white bg-[#f97316] hover:bg-[#ea580c] rounded-xl transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingItem ? "Save Changes" : "Create Destination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
