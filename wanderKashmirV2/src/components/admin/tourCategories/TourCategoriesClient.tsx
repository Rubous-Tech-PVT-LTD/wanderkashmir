"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Compass,
  ArrowRight,
  ExternalLink,
  Layers,
  X,
} from "lucide-react";
import { AdminTourCategoryItem } from "@/lib/admin/tourCategories";
import {
  createTourCategoryAction,
  updateTourCategoryAction,
  deleteTourCategoryAction,
  assignUnassignedToursAction,
} from "@/actions/adminTourCategories";

interface TourCategoriesClientProps {
  categories: AdminTourCategoryItem[];
  currentSearch: string;
}

export default function TourCategoriesClient({
  categories,
  currentSearch,
}: TourCategoriesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search input state
  const [searchVal, setSearchVal] = useState(currentSearch);

  // Form Modal State (Create / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminTourCategoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    showInFilter: true,
    displayOrder: 1,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // View Tours Modal State
  const [viewingCategory, setViewingCategory] = useState<AdminTourCategoryItem | null>(null);

  // Delete Modal State
  const [deleteModalCat, setDeleteModalCat] = useState<AdminTourCategoryItem | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Reassign Unassigned Tours State
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSuccessMessage, setAssignSuccessMessage] = useState<string | null>(null);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchVal.trim()) {
      params.set("search", searchVal.trim());
    } else {
      params.delete("search");
    }
    router.push(`/admin/tour-categories?${params.toString()}`);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCategory(null);
    const nextOrder =
      categories.length > 0
        ? Math.max(...categories.map((c) => c.displayOrder || 0)) + 1
        : 1;
    setFormData({
      name: "",
      slug: "",
      description: "",
      showInFilter: true,
      displayOrder: nextOrder,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (cat: AdminTourCategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      showInFilter: cat.showInFilter !== false,
      displayOrder: cat.displayOrder ?? 1,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  // Auto-generate slug when name changes (if creating or slug was identical)
  const handleNameChange = (val: string) => {
    if (!editingCategory) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormData({ ...formData, name: val, slug: generatedSlug });
    } else {
      setFormData({ ...formData, name: val });
    }
  };

  // Submit Create or Edit Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const res = editingCategory
        ? await updateTourCategoryAction(editingCategory.id, formData)
        : await createTourCategoryAction(formData);

      if (res.success) {
        setIsFormOpen(false);
        router.refresh();
      } else {
        setFormError(res.error || "Failed to save category.");
      }
    } catch {
      setFormError("A network error occurred while saving.");
    } finally {
      setFormLoading(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (cat: AdminTourCategoryItem) => {
    setDeleteModalCat(cat);
    setReassignTargetId("");
    setDeleteError(null);
  };

  // Confirm Delete (with optional reassign if linked tours exist)
  const handleDeleteConfirm = async () => {
    if (!deleteModalCat) return;

    if (deleteModalCat.totalToursCount > 0 && !reassignTargetId) {
      setDeleteError("Please choose a replacement category to receive the linked tours.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const res = await deleteTourCategoryAction(
        deleteModalCat.id,
        deleteModalCat.totalToursCount > 0 ? reassignTargetId : null
      );

      if (res.success) {
        setDeleteModalCat(null);
        router.refresh();
      } else {
        setDeleteError(res.error || "Failed to delete category.");
      }
    } catch {
      setDeleteError("A network error occurred while deleting.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle Assigning Unassigned Packages
  const handleAssignUnassigned = async (targetId: string, targetName: string) => {
    if (!confirm(`Are you sure you want to move all unassigned packages into "${targetName}"?`)) {
      return;
    }
    setAssignLoading(true);
    setAssignSuccessMessage(null);
    try {
      const res = await assignUnassignedToursAction(targetId);
      if (res.success) {
        setAssignSuccessMessage(
          `Successfully reassigned ${res.data?.reassignedCount || 0} tour package(s) to "${targetName}".`
        );
        router.refresh();
      } else {
        alert(res.error || "Failed to assign unassigned tours.");
      }
    } catch {
      alert("Network error while assigning tours.");
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2">
            <Layers className="w-7 h-7 text-emerald-500" />
            Tour Categories
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Organize production tour packages into structured categories ({categories.length} total)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {assignSuccessMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{assignSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setAssignSuccessMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search categories by name, slug, or description..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </form>

        <div className="text-xs text-slate-400">
          Showing <strong>{categories.length}</strong> categories
        </div>
      </div>

      {/* Categories Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-sm">
        {categories.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <FolderTree className="w-6 h-6" />
            </div>
            <p className="font-medium text-slate-300">No tour categories found.</p>
            <p className="text-xs text-slate-500">
              {searchVal ? "Try a different search query." : "Click 'Add Category' above to create your first category."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Category Name & Details</th>
                  <th className="px-5 py-3.5">Slug</th>
                  <th className="px-5 py-3.5 text-center">Order</th>
                  <th className="px-5 py-3.5 text-center">Filter Visibility</th>
                  <th className="px-5 py-3.5 text-center">Linked Tours</th>
                  <th className="px-5 py-3.5">Updated</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Name & Description */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white text-sm">{cat.name}</div>
                      {cat.description && (
                        <div className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-sm">
                          {cat.description}
                        </div>
                      )}
                    </td>

                    {/* Slug */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {cat.slug}
                      </span>
                    </td>

                    {/* Display Order */}
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <span className="font-mono text-xs font-semibold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                        #{cat.displayOrder ?? 0}
                      </span>
                    </td>

                    {/* Filter Visibility */}
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      {cat.showInFilter ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Visible in Filter
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                          Hidden from Filter
                        </span>
                      )}
                    </td>

                    {/* Linked Tours Count */}
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-xs font-bold text-white">
                          {cat.totalToursCount}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                          <span className="text-emerald-400 font-medium">
                            {cat.liveToursCount} live
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400 font-medium">
                            {cat.draftToursCount} draft
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Updated At */}
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-400">
                      {new Date(cat.updatedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* View Linked Tours */}
                        <button
                          type="button"
                          onClick={() => setViewingCategory(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                          title="View Linked Tour Packages"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer border border-transparent hover:border-emerald-500/20"
                          title="Edit Category"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer border border-transparent hover:border-rose-500/20"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Unassigned Tours Here */}
                        <button
                          type="button"
                          disabled={assignLoading}
                          onClick={() => handleAssignUnassigned(cat.id, cat.name)}
                          className="px-2 py-1 rounded text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer disabled:opacity-50"
                          title="Assign any unassigned tours to this category"
                        >
                          Move Unassigned
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-emerald-500" />
                {editingCategory ? "Edit Tour Category" : "New Tour Category"}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Tour packages, Offbeat, Honeymoon"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL Slug <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. tour-packages, offbeat"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Used for SEO indexing and filtering. Must be unique and alphanumeric.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Display Order <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayOrder: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Controls position in the public /tours filter (lower numbers appear first).
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-800/50">
                <div className="pr-3">
                  <span className="text-xs font-semibold text-slate-200 block">Show in Tour Filter</span>
                  <span className="text-[10px] text-slate-400">
                    Controls whether this category appears in the public /tours filter.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showInFilter}
                  onChange={(e) => setFormData({ ...formData, showInFilter: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description of packages belonging to this category..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={formLoading}
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW LINKED TOURS MODAL */}
      {viewingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  Packages in "{viewingCategory.name}"
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {viewingCategory.totalToursCount} tour(s) currently linked to this category
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/tours/new?categoryId=${viewingCategory.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Package
                </Link>
                <button
                  type="button"
                  onClick={() => setViewingCategory(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {viewingCategory.tours.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No tour packages are currently linked to this category.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                  {viewingCategory.tours.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-900/40 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-white text-xs flex items-center gap-2">
                          {t.title}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                              t.isLive
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            {t.isLive ? "LIVE" : "DRAFT"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>{t.duration}</span>
                          <span>•</span>
                          <span className="font-mono text-emerald-400 font-semibold">
                            ₹{t.price.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {t.isLive && (
                          <Link
                            href={`/tours/${t.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/tours/${t.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL WITH DEPENDENCY SAFETY */}
      {deleteModalCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Tour Category</h3>
                <p className="text-xs text-slate-400">Production Dependency Check</p>
              </div>
            </div>

            {deleteError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {deleteError}
              </div>
            )}

            {deleteModalCat.totalToursCount > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Category <strong className="text-white">"{deleteModalCat.name}"</strong> is currently used by{" "}
                  <strong className="text-amber-400">{deleteModalCat.totalToursCount} tour package(s)</strong>.
                  To protect production data from orphan states, you must choose a replacement category to move these tours into.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Reassign Linked Tours To: <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={reassignTargetId}
                    onChange={(e) => {
                      setReassignTargetId(e.target.value);
                      setDeleteError(null);
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Select Destination Category --</option>
                    {categories
                      .filter((c) => c.id !== deleteModalCat.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.totalToursCount} current tours)
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to delete category{" "}
                <strong className="text-white">"{deleteModalCat.name}"</strong>?
                This category has 0 linked tours and can be safely deleted.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => {
                  setDeleteModalCat(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading || (deleteModalCat.totalToursCount > 0 && !reassignTargetId)}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/20 cursor-pointer disabled:opacity-50"
              >
                {deleteLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {deleteModalCat.totalToursCount > 0 ? "Reassign & Delete" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
