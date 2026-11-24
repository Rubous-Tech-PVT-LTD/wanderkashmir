"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { AdminTourCategoryItem } from "@/lib/admin/tourCategories";
import {
  createTourCategoryAction,
  updateTourCategoryAction,
  deleteTourCategoryAction,
  assignUnassignedToursAction,
} from "@/actions/adminTourCategories";
import {
  AdminPageHeader,
  AdminFilterBar,
  AdminToastBanner,
  AdminModal,
  ConfirmActionDialog,
  AdminEmptyState,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

interface TourCategoriesClientProps {
  categories: AdminTourCategoryItem[];
  currentSearch: string;
  unassignedCount?: number;
}

export default function TourCategoriesClient({
  categories,
  currentSearch,
  unassignedCount = 0,
}: TourCategoriesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const basePath = useAdminBasePath();

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

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

  const [viewingCategory, setViewingCategory] = useState<AdminTourCategoryItem | null>(null);

  const [deleteModalCat, setDeleteModalCat] = useState<AdminTourCategoryItem | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [assignTarget, setAssignTarget] = useState<AdminTourCategoryItem | null>(null);

  const applySearch = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val.trim()) {
      params.set("search", val.trim());
    } else {
      params.delete("search");
    }
    const qs = params.toString();
    router.push(qs ? `${basePath}/tour-categories?${qs}` : `${basePath}/tour-categories`);
  };

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
        setFeedback({
          type: "success",
          text: editingCategory ? "Tour category updated." : "Tour category created.",
        });
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

  const handleDeleteConfirm = async () => {
    if (!deleteModalCat) return;

    if (deleteModalCat.totalToursCount > 0 && !reassignTargetId) {
      setDeleteError("Please choose a replacement category for the linked tours.");
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
        setFeedback({ type: "success", text: `Deleted category "${deleteModalCat.name}".` });
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

  const handleConfirmAssignUnassigned = async () => {
    if (!assignTarget) return;
    const res = await assignUnassignedToursAction(assignTarget.id);
    if (res.success) {
      setFeedback({
        type: "success",
        text: `Moved ${res.data?.reassignedCount || 0} unassigned tour(s) into "${assignTarget.name}".`,
      });
      setAssignTarget(null);
      router.refresh();
    } else {
      throw new Error(res.error || "Failed to assign unassigned tours.");
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tour Categories"
        subtitle={`Organize tour packages into filterable categories (${categories.length} total).`}
        actions={
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Category</span>
          </button>
        }
      />

      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      <AdminFilterBar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        onSearchSubmit={() => applySearch(searchVal)}
        searchPlaceholder="Search categories by name, slug, or description..."
        hasActiveFilters={Boolean(currentSearch)}
        onReset={() => {
          setSearchVal("");
          router.push(`${basePath}/tour-categories`);
        }}
      />

      <div className="rounded-md border border-slate-200/90 bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        {categories.length === 0 ? (
          <AdminEmptyState
            icon={<FolderTree className="h-5 w-5" />}
            title="No tour categories found"
            description={
              currentSearch
                ? "Try adjusting your search query."
                : "Create your first category to group tour packages."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4 text-center">Order</th>
                  <th className="py-3 px-4 text-center">Filter</th>
                  <th className="py-3 px-4 text-center">Linked Tours</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{cat.name}</div>
                      {cat.description && (
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-sm">
                          {cat.description}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {cat.slug}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-center font-mono text-slate-600">
                      #{cat.displayOrder ?? 0}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <StatusBadge
                        status={cat.showInFilter ? "ACTIVE" : "INACTIVE"}
                        label={cat.showInFilter ? "Visible" : "Hidden"}
                      />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <div className="font-semibold text-slate-900 tabular-nums">
                        {cat.totalToursCount}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {cat.liveToursCount} live · {cat.draftToursCount} draft
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 tabular-nums">
                      {new Date(cat.updatedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/tours/category/${cat.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="View public category page"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setViewingCategory(cat)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                          title="View linked tours"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                          title="Edit category"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteModalCat(cat);
                            setReassignTargetId("");
                            setDeleteError(null);
                          }}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        {unassignedCount > 0 && (
                          <button
                            type="button"
                            onClick={() => setAssignTarget(cat)}
                            className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                            title={`Move ${unassignedCount} unassigned tour(s) here`}
                          >
                            Move Unassigned ({unassignedCount})
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AdminModal
        open={isFormOpen}
        onClose={() => !formLoading && setIsFormOpen(false)}
        title={editingCategory ? "Edit Tour Category" : "New Tour Category"}
        maxWidth="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="cat-name" className="block text-xs font-medium text-slate-700 mb-1">
              Category Name <span className="text-rose-600">*</span>
            </label>
            <input
              id="cat-name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Tour Packages, Offbeat, Honeymoon"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label htmlFor="cat-slug" className="block text-xs font-medium text-slate-700 mb-1">
                URL Slug <span className="text-rose-600">*</span>
              </label>
              <input
                id="cat-slug"
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. tour-packages"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="cat-order" className="block text-xs font-medium text-slate-700 mb-1">
                Display Order
              </label>
              <input
                id="cat-order"
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
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
              />
            </div>
          </div>

          <label className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 cursor-pointer">
            <div>
              <span className="text-xs font-medium text-slate-800 block">Show in public tour filter</span>
              <span className="text-[11px] text-slate-500">
                Displays this category in the /tours filter bar.
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.showInFilter}
              onChange={(e) => setFormData({ ...formData, showInFilter: e.target.checked })}
              className="rounded border-slate-300 text-[var(--season-primary)] focus:ring-[var(--season-primary)]"
            />
          </label>

          <div>
            <label htmlFor="cat-desc" className="block text-xs font-medium text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="cat-desc"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Short description of packages belonging to this category..."
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              disabled={formLoading}
              onClick={() => setIsFormOpen(false)}
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] disabled:opacity-50 cursor-pointer"
            >
              {formLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Linked Tours Modal */}
      <AdminModal
        open={Boolean(viewingCategory)}
        onClose={() => setViewingCategory(null)}
        title={viewingCategory ? `Packages in "${viewingCategory.name}"` : "Linked Tours"}
        subtitle={
          viewingCategory
            ? `${viewingCategory.totalToursCount} tour package(s) linked to this category`
            : undefined
        }
        maxWidth="2xl"
        footer={
          viewingCategory ? (
            <Link
              href={`${basePath}/tours/new?categoryId=${viewingCategory.id}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Package</span>
            </Link>
          ) : undefined
        }
      >
        {viewingCategory && (
          viewingCategory.tours.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">
              No tour packages are currently linked to this category.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 rounded-md border border-slate-200 overflow-hidden">
              {viewingCategory.tours.map((t) => (
                <div
                  key={t.id}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {t.title}
                      </span>
                      <StatusBadge status={t.isLive ? "LIVE" : "DRAFT"} />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {t.duration} · ₹{t.price.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {t.isLive && (
                      <Link
                        href={`/tours/${t.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        title="View public page"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                    <Link
                      href={`${basePath}/tours/${t.id}`}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </AdminModal>

      {/* Delete Modal with Reassignment */}
      <AdminModal
        open={Boolean(deleteModalCat)}
        onClose={() => !deleteLoading && setDeleteModalCat(null)}
        title="Delete Tour Category"
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              disabled={deleteLoading}
              onClick={() => setDeleteModalCat(null)}
              className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={
                deleteLoading ||
                Boolean(deleteModalCat && deleteModalCat.totalToursCount > 0 && !reassignTargetId)
              }
              onClick={handleDeleteConfirm}
              className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
            >
              {deleteLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>
                {deleteModalCat && deleteModalCat.totalToursCount > 0
                  ? "Reassign & Delete"
                  : "Delete Category"}
              </span>
            </button>
          </>
        }
      >
        {deleteModalCat && (
          <div className="space-y-3 text-xs text-slate-600">
            {deleteError && (
              <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
                {deleteError}
              </div>
            )}

            {deleteModalCat.totalToursCount > 0 ? (
              <>
                <p className="leading-relaxed">
                  Category <strong className="text-slate-900">&ldquo;{deleteModalCat.name}&rdquo;</strong> has{" "}
                  <strong className="text-amber-700">{deleteModalCat.totalToursCount} linked tour(s)</strong>.
                  Select a replacement category before deleting.
                </p>
                <div>
                  <label htmlFor="reassign-cat" className="block text-xs font-medium text-slate-700 mb-1">
                    Reassign Linked Tours To <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="reassign-cat"
                    value={reassignTargetId}
                    onChange={(e) => {
                      setReassignTargetId(e.target.value);
                      setDeleteError(null);
                    }}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
                  >
                    <option value="">-- Select replacement category --</option>
                    {categories
                      .filter((c) => c.id !== deleteModalCat.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.totalToursCount} tours)
                        </option>
                      ))}
                  </select>
                </div>
              </>
            ) : (
              <p className="leading-relaxed">
                Permanently delete category{" "}
                <strong className="text-slate-900">&ldquo;{deleteModalCat.name}&rdquo;</strong>? It has 0
                linked tours.
              </p>
            )}
          </div>
        )}
      </AdminModal>

      <ConfirmActionDialog
        open={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        onConfirm={handleConfirmAssignUnassigned}
        title="Move Unassigned Tours"
        description={
          assignTarget
            ? `Assign all ${unassignedCount} unassigned tour package(s) to "${assignTarget.name}"?`
            : ""
        }
        confirmLabel="Move Tours"
        tone="primary"
      />
    </div>
  );
}
