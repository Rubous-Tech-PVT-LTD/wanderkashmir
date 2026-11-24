"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  ExternalLink,
  Pencil,
  Trash2,
  Loader2,
  Palette,
  Image as ImageIcon,
} from "lucide-react";
import { AdminTravelStyleItem } from "@/lib/admin/travelStyles";
import {
  toggleTravelStyleActiveAction,
  deleteTravelStyleAction,
} from "@/actions/adminTravelStyles";
import {
  AdminPageHeader,
  AdminFilterBar,
  AdminToastBanner,
  AdminModal,
  AdminEmptyState,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

interface TravelStylesListClientProps {
  styles: AdminTravelStyleItem[];
  currentSearch: string;
}

export default function TravelStylesListClient({
  styles,
  currentSearch,
}: TravelStylesListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const basePath = useAdminBasePath();

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const [deleteModalStyle, setDeleteModalStyle] = useState<AdminTravelStyleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [forceHardDelete, setForceHardDelete] = useState(false);

  const applySearch = (search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (search && search.trim() !== "") {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    const qs = params.toString();
    router.push(qs ? `${basePath}/travel-styles?${qs}` : `${basePath}/travel-styles`);
  };

  const handleToggleActive = async (style: AdminTravelStyleItem) => {
    setTogglingId(style.id);
    setFeedback(null);
    try {
      const res = await toggleTravelStyleActiveAction(style.id, !style.isActive);
      if (res.success) {
        setFeedback({
          type: "success",
          text: `"${style.name}" is now ${!style.isActive ? "Active" : "Inactive"}.`,
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to update status." });
      }
    } catch {
      setFeedback({ type: "error", text: "Error communicating with server." });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalStyle) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await deleteTravelStyleAction(deleteModalStyle.id, forceHardDelete);
      if (res.success) {
        setFeedback({
          type: "success",
          text:
            deleteModalStyle.toursCount > 0 && !forceHardDelete
              ? `Archived travel style "${deleteModalStyle.name}".`
              : `Deleted travel style "${deleteModalStyle.name}".`,
        });
        setDeleteModalStyle(null);
        router.refresh();
      } else {
        setDeleteError(res.error || "Failed to delete travel style.");
      }
    } catch {
      setDeleteError("Network error while deleting travel style.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Travel Styles"
        subtitle={`Organize travel styles, display sequence, and linked tour packages (${styles.length} total).`}
        actions={
          <Link
            href={`${basePath}/travel-styles/new`}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Travel Style</span>
          </Link>
        }
      />

      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      <AdminFilterBar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        onSearchSubmit={() => applySearch(searchVal)}
        searchPlaceholder="Search style name, slug, or description..."
        hasActiveFilters={Boolean(currentSearch)}
        onReset={() => {
          setSearchVal("");
          router.push(`${basePath}/travel-styles`);
        }}
      />

      <div className="rounded-md border border-slate-200/90 bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        {styles.length === 0 ? (
          <AdminEmptyState
            icon={<Palette className="h-5 w-5" />}
            title="No travel styles found"
            description="No travel styles matched your search."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4 w-16">Order</th>
                  <th className="py-3 px-4">Travel Style</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Connected Tours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {styles.map((style) => {
                  const isToggling = togglingId === style.id;
                  return (
                    <tr key={style.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        #{style.displayOrder}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md overflow-hidden border border-slate-200 bg-slate-100 shrink-0 flex items-center justify-center">
                            {style.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={style.imageUrl}
                                alt={style.imageAlt || style.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <Link
                              href={`${basePath}/travel-styles/${style.id}`}
                              className="font-semibold text-slate-900 hover:text-[var(--season-primary)] transition-colors"
                            >
                              {style.name}
                            </Link>
                            <div className="font-mono text-[11px] text-slate-500">
                              /{style.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                        {style.description || <span className="text-slate-400">No description</span>}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 tabular-nums">
                          {style.toursCount} tours
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {style.liveToursCount} live · {style.draftToursCount} draft
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => handleToggleActive(style)}
                          className="inline-flex items-center cursor-pointer disabled:opacity-50"
                          title={`Click to ${style.isActive ? "deactivate" : "activate"}`}
                        >
                          {isToggling ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                          ) : (
                            <StatusBadge status={style.isActive ? "ACTIVE" : "INACTIVE"} />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {style.isActive && (
                            <Link
                              href={`/tours/${style.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                              title="View public page"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          )}
                          <Link
                            href={`${basePath}/travel-styles/${style.id}`}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Pencil className="h-3 w-3" />
                            <span>Edit</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteModalStyle(style);
                              setDeleteError(null);
                              setForceHardDelete(false);
                            }}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete or archive travel style"
                            aria-label={`Delete ${style.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Delete / Archive Modal */}
      <AdminModal
        open={Boolean(deleteModalStyle)}
        onClose={() => !isDeleting && setDeleteModalStyle(null)}
        title="Delete Travel Style"
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => {
                setDeleteModalStyle(null);
                setDeleteError(null);
              }}
              className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>
                {deleteModalStyle && deleteModalStyle.toursCount > 0 && !forceHardDelete
                  ? "Archive Style"
                  : "Permanently Delete"}
              </span>
            </button>
          </>
        }
      >
        {deleteModalStyle && (
          <div className="space-y-3 text-xs text-slate-600">
            {deleteError && (
              <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
                {deleteError}
              </div>
            )}

            {deleteModalStyle.toursCount > 0 ? (
              <div className="space-y-3">
                <p className="leading-relaxed">
                  Travel style <strong className="text-slate-900">&ldquo;{deleteModalStyle.name}&rdquo;</strong>{" "}
                  has <strong className="text-amber-700">{deleteModalStyle.toursCount} connected tour(s)</strong>.
                  By default it will be archived (deactivated) to preserve tour relationships.
                </p>

                <label className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forceHardDelete}
                    onChange={(e) => setForceHardDelete(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-600"
                  />
                  <span className="text-[11px] text-slate-600">
                    Force permanent deletion (removes all {deleteModalStyle.toursCount} tour style links)
                  </span>
                </label>
              </div>
            ) : (
              <p className="leading-relaxed">
                Permanently delete travel style{" "}
                <strong className="text-slate-900">&ldquo;{deleteModalStyle.name}&rdquo;</strong>? It has 0
                connected tours.
              </p>
            )}
          </div>
        )}
      </AdminModal>
    </div>
  );
}
