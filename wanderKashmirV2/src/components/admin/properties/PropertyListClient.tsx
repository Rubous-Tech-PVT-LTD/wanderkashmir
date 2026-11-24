"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  ExternalLink,
  Pencil,
  Loader2,
  CheckCircle2,
  EyeOff,
  Building,
  Bed,
  Star,
  MapPin,
} from "lucide-react";
import { AdminPropertyListItem, AdminPropertiesStats } from "@/lib/admin/properties";
import { togglePropertyApprovalAction } from "@/actions/adminProperties";
import {
  AdminPageHeader,
  AdminStatStrip,
  AdminFilterBar,
  AdminToastBanner,
  ConfirmActionDialog,
  AdminEmptyState,
  AdminPagination,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

interface PropertyListClientProps {
  properties: AdminPropertyListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentType: string;
  currentStatus: string;
  currentSearch: string;
  stats: AdminPropertiesStats;
}

const TYPE_LABELS: Record<string, string> = {
  HOTEL: "Hotel",
  RESORT: "Resort",
  HOMESTAY: "Homestay",
  HOUSEBOAT: "Houseboat",
};

export default function PropertyListClient({
  properties,
  totalCount,
  currentPage,
  totalPages,
  currentType,
  currentStatus,
  currentSearch,
  stats,
}: PropertyListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const basePath = useAdminBasePath();

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminPropertyListItem | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const applyFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || val === "ALL") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    if (!updates.page) {
      params.delete("page");
    }
    const qs = params.toString();
    router.push(qs ? `${basePath}/properties?${qs}` : `${basePath}/properties`);
  };

  const handleApprove = async (property: AdminPropertyListItem) => {
    setTogglingId(property.id);
    setFeedback(null);
    try {
      const res = await togglePropertyApprovalAction(property.id, true);
      if (res.success) {
        setFeedback({ type: "success", text: `"${property.name}" approved and published.` });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to approve property." });
      }
    } catch {
      setFeedback({ type: "error", text: "Error communicating with server." });
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmSuspend = async (reason?: string) => {
    if (!suspendTarget) return;
    const res = await togglePropertyApprovalAction(suspendTarget.id, false, reason);
    if (res.success) {
      setFeedback({ type: "success", text: `"${suspendTarget.name}" suspended.` });
      setSuspendTarget(null);
      router.refresh();
    } else {
      throw new Error(res.error || "Failed to suspend property.");
    }
  };

  const hasFilters = Boolean(currentSearch || currentType !== "ALL" || currentStatus !== "ALL");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Stays & Properties"
        subtitle={`Manage hotels, resorts, heritage homestays, and houseboats (${totalCount} total).`}
        actions={
          <Link
            href={`${basePath}/properties/new`}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Property</span>
          </Link>
        }
      />

      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      <AdminStatStrip
        columns={4}
        items={[
          { label: "Approved & Live", value: stats.approved, tone: "primary" },
          { label: "Pending Review", value: stats.pending, tone: "amber" },
          {
            label: "Suspended / Rejected",
            value: stats.suspended + stats.rejected,
            tone: "rose",
          },
          {
            label: "Hotels / Resorts / Stays",
            value: `${stats.byType.hotel} / ${stats.byType.resort} / ${stats.byType.homestay + stats.byType.houseboat}`,
            helper: `${stats.byType.homestay} homestays · ${stats.byType.houseboat} houseboats`,
          },
        ]}
      />

      <AdminFilterBar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        onSearchSubmit={() => applyFilters({ search: searchVal.trim() })}
        searchPlaceholder="Search property, location, or vendor..."
        tabs={[
          { key: "ALL", label: "All", count: totalCount },
          { key: "APPROVED", label: "Live", count: stats.approved },
          { key: "PENDING", label: "Pending", count: stats.pending },
          { key: "SUSPENDED", label: "Suspended", count: stats.suspended },
          { key: "REJECTED", label: "Rejected", count: stats.rejected },
        ]}
        activeTab={currentStatus}
        onTabChange={(status) => applyFilters({ status })}
        hasActiveFilters={hasFilters}
        onReset={() => {
          setSearchVal("");
          router.push(`${basePath}/properties`);
        }}
        filters={
          <select
            value={currentType}
            onChange={(e) => applyFilters({ type: e.target.value })}
            aria-label="Filter by accommodation type"
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-[var(--season-primary)] focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="HOTEL">Hotels</option>
            <option value="RESORT">Resorts</option>
            <option value="HOMESTAY">Homestays</option>
            <option value="HOUSEBOAT">Houseboats</option>
          </select>
        }
      />

      <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-xs">
        {properties.length === 0 ? (
          <AdminEmptyState
            icon={<Building className="h-5 w-5" />}
            title="No properties found"
            description="No properties match your active filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Base Rate</th>
                  <th className="py-3 px-4">Rooms / Reviews</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map((p) => {
                  const isLiveApproved = p.isApproved && p.status === "APPROVED";
                  const isToggling = togglingId === p.id;
                  const thumb = p.images && p.images.length > 0 ? p.images[0] : null;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            {thumb ? (
                              <Image
                                src={thumb}
                                alt={p.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-400">
                                <Building className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`${basePath}/properties/${p.id}`}
                              className="font-semibold text-slate-900 hover:text-[var(--season-primary)] truncate max-w-[220px] block transition-colors"
                            >
                              {p.name}
                            </Link>
                            <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                              {p.vendorProfile?.businessName || "Direct / Admin"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {TYPE_LABELS[p.propertyType] || p.propertyType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{p.location}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 tabular-nums">
                          ₹{Math.round(p.pricePerNight).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-slate-400">per night</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3 text-slate-600">
                          <span className="inline-flex items-center gap-1" title="Room types">
                            <Bed className="h-3.5 w-3.5 text-slate-400" />
                            <span>{p.roomTypesCount}</span>
                          </span>
                          <span className="inline-flex items-center gap-1" title="Reviews">
                            <Star className="h-3.5 w-3.5 text-amber-500" />
                            <span>{p.reviewsCount}</span>
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={isLiveApproved ? "LIVE" : p.status} />
                        {p.rejectionReason && (
                          <div
                            className="text-[11px] text-rose-600 mt-1 truncate max-w-[150px]"
                            title={p.rejectionReason}
                          >
                            {p.rejectionReason}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {isLiveApproved ? (
                            <button
                              type="button"
                              disabled={isToggling}
                              onClick={() => setSuspendTarget(p)}
                              title="Suspend property"
                              className="rounded-lg border border-amber-200 bg-amber-50 p-1.5 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <EyeOff className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isToggling}
                              onClick={() => handleApprove(p)}
                              title="Approve property"
                              className="rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {isToggling ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}

                          <Link
                            href={`${basePath}/properties/${p.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Pencil className="h-3 w-3" />
                            <span>Edit</span>
                          </Link>

                          {isLiveApproved && (
                            <Link
                              href={`/stays/${p.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                              title="View public page"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          )}
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
          itemLabel="properties"
          onPageChange={(page) => applyFilters({ page: String(page) })}
        />
      </div>

      <ConfirmActionDialog
        open={Boolean(suspendTarget)}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleConfirmSuspend}
        title="Suspend Property"
        description={
          suspendTarget
            ? `Unpublish "${suspendTarget.name}" from public listings? Historical bookings remain intact.`
            : ""
        }
        confirmLabel="Suspend Property"
        tone="warning"
        requireReason
        reasonLabel="Suspension Reason"
        reasonPlaceholder="Briefly explain why this property is being suspended..."
      />
    </div>
  );
}
