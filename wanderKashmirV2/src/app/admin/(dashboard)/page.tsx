import Link from "next/link";
import { headers } from "next/headers";
import { ArrowUpRight, Plus } from "lucide-react";
import { getAdminOrEditorSession } from "@/lib/admin/auth";
import {
  getAdminDashboardMetrics,
  getAdminLeads,
  getRecentDraftContent,
} from "@/lib/admin/data";
import {
  AdminPageHeader,
  AdminStatStrip,
  StatusBadge,
  type StatStripItem,
} from "@/components/admin/ui";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [session, headerList] = await Promise.all([
    getAdminOrEditorSession(),
    headers(),
  ]);

  const isEditor = session?.role === "EDITOR";
  const base = headerList.get("x-admin-alias") === "wander-admin" ? "/wander-admin" : "/admin";

  const [metrics, recentLeads, recentDrafts] = await Promise.all([
    getAdminDashboardMetrics(),
    isEditor ? Promise.resolve([]) : getAdminLeads(6),
    getRecentDraftContent(6),
  ]);

  const pendingQueueItems: StatStripItem[] = isEditor
    ? [
        {
          label: "Draft Places",
          value: metrics.draftPlaces,
          helper: "Unpublished place guides",
          tone: metrics.draftPlaces > 0 ? "amber" : "default",
          href: `${base}/places?status=INACTIVE`,
        },
        {
          label: "Draft Destinations",
          value: metrics.draftDestinations,
          helper: "Unpublished hubs",
          tone: metrics.draftDestinations > 0 ? "amber" : "default",
          href: `${base}/destinations?status=DRAFT`,
        },
        {
          label: "Pending SEO Comments",
          value: metrics.pendingSeoComments,
          helper: "Awaiting moderation",
          tone: metrics.pendingSeoComments > 0 ? "amber" : "default",
          href: `${base}/seo-comments?status=PENDING`,
        },
      ]
    : [
        {
          label: "New Leads",
          value: metrics.newLeadsCount,
          helper: `${metrics.leadsCount} total inquiries`,
          tone: metrics.newLeadsCount > 0 ? "amber" : "default",
          href: `${base}/leads`,
        },
        {
          label: "Pending Vendors",
          value: metrics.pendingVendors,
          helper: "Awaiting KYC approval",
          tone: metrics.pendingVendors > 0 ? "amber" : "default",
          href: `${base}/vendors?status=PENDING`,
        },
        {
          label: "Pending Listings",
          value: metrics.pendingListings,
          helper: "Stays pending review",
          tone: metrics.pendingListings > 0 ? "amber" : "default",
          href: `${base}/listings?status=PENDING`,
        },
        {
          label: "Pending Vehicles",
          value: metrics.pendingVehicles,
          helper: "Fleet awaiting approval",
          tone: metrics.pendingVehicles > 0 ? "amber" : "default",
          href: `${base}/taxis?status=PENDING`,
        },
        {
          label: "Pending Comments",
          value: metrics.pendingSeoComments,
          helper: "SEO comment moderation",
          tone: metrics.pendingSeoComments > 0 ? "amber" : "default",
          href: `${base}/seo-comments?status=PENDING`,
        },
      ];

  const catalogItems: StatStripItem[] = [
    {
      label: "Live Tours",
      value: metrics.liveTours,
      helper: `${metrics.totalTours} total packages`,
      tone: "primary",
      href: `${base}/tours`,
    },
    ...(!isEditor
      ? [
          {
            label: "Approved Stays",
            value: metrics.approvedProperties,
            helper: `${metrics.totalProperties} registered properties`,
            tone: "primary" as const,
            href: `${base}/properties`,
          },
        ]
      : []),
    {
      label: "Destinations",
      value: metrics.publishedDestinations,
      helper: `${metrics.draftDestinations} drafts`,
      tone: "primary",
      href: `${base}/destinations`,
    },
    {
      label: "Active Places",
      value: metrics.activePlaces,
      helper: `${metrics.draftPlaces} drafts`,
      tone: "primary",
      href: `${base}/places`,
    },
    {
      label: "SEO & Blog Pages",
      value: metrics.seoPagesCount,
      helper: "Managed landing & blog pages",
      tone: "primary",
      href: `${base}/seo`,
    },
  ];

  const urgentPendingCount = isEditor
    ? metrics.draftPlaces + metrics.draftDestinations + metrics.pendingSeoComments
    : metrics.newLeadsCount +
      metrics.pendingVendors +
      metrics.pendingListings +
      metrics.pendingVehicles +
      metrics.pendingSeoComments;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Overview"
        subtitle={
          isEditor
            ? "Editorial overview of drafts, places, destinations, and SEO pages."
            : "Pending approvals, customer inquiries, and published travel inventory."
        }
        actions={
          <>
            <Link
              href={`${base}/places/new`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Place</span>
            </Link>
            <Link
              href={`${base}/tours/new`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Tour</span>
            </Link>
          </>
        }
      />

      {/* Dynamic Seasonal Action Required Banner */}
      {urgentPendingCount > 0 && (
        <div className="rounded-md border border-[var(--season-secondary)]/40 bg-[var(--season-secondary-light)]/40 p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[var(--season-secondary)] shrink-0 animate-pulse" />
            <span className="text-xs font-semibold text-slate-900">Action Required:</span>
            <span className="text-xs text-slate-700 truncate">
              {metrics.pendingSeoComments > 0
                ? `${metrics.pendingSeoComments} pending SEO comment awaiting moderation`
                : `${urgentPendingCount} operational items awaiting your review`}
            </span>
          </div>
          <Link
            href={
              metrics.pendingSeoComments > 0
                ? `${base}/seo-comments?status=PENDING`
                : `${base}/leads`
            }
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--season-primary)] hover:underline shrink-0"
          >
            <span>Review Queue</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      )}

      {/* Actionable Pending Queue */}
      <section className="space-y-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {isEditor ? "Editorial Queue" : "Needs Attention"}
        </h2>
        <AdminStatStrip
          items={pendingQueueItems}
          columns={isEditor ? 3 : 5}
        />
      </section>

      {/* Catalog & Content Summary */}
      <section className="space-y-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Catalog &amp; Content
        </h2>
        <AdminStatStrip
          items={catalogItems}
          columns={isEditor ? 4 : 5}
        />
      </section>

      {/* Operational Tables */}
      <div className={`grid grid-cols-1 ${!isEditor ? "xl:grid-cols-3" : ""} gap-6`}>
        {!isEditor && (
          <section className="xl:col-span-2 bg-white border border-slate-200/90 rounded-md shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200/90 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Recent Customer Leads</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest trip and stay inquiries submitted on WanderKashmir.
                </p>
              </div>
              <Link
                href={`${base}/leads`}
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--season-primary)] hover:text-[var(--season-primary-hover)] shrink-0"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentLeads.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                No customer inquiries recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-medium uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Customer</th>
                      <th className="py-2.5 px-4">Travel Dates</th>
                      <th className="py-2.5 px-4">Destinations</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4">
                          <div className="font-medium text-slate-900">{lead.name}</div>
                          <div className="text-[11px] text-slate-500">{lead.phone}</div>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                          {lead.travelDates || "Flexible"}
                        </td>
                        <td className="py-2.5 px-4">
                          {lead.destinations.length > 0 ? (
                            <span className="text-slate-700">
                              {lead.destinations.slice(0, 2).join(", ")}
                              {lead.destinations.length > 2 && ` +${lead.destinations.length - 2}`}
                            </span>
                          ) : (
                            <span className="text-slate-400">Unspecified</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          <StatusBadge status={lead.status} />
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-500 whitespace-nowrap tabular-nums">
                          {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Recent Draft Content */}
        <section className="bg-white border border-slate-200/90 rounded-md shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200/90 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Unpublished Drafts</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Places, destinations, and articles not yet live.
              </p>
            </div>
            <Link
              href={`${base}/places?status=INACTIVE`}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--season-primary)] hover:text-[var(--season-primary-hover)] shrink-0"
            >
              <span>Places</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentDrafts.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              All places, destinations, and SEO pages are currently published.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentDrafts.map((item) => {
                const editHref =
                  item.kind === "PLACE"
                    ? `${base}/places/${item.id}/edit`
                    : item.kind === "DESTINATION"
                    ? `${base}/destinations/${item.id}`
                    : `${base}/seo/${item.id}`;
                return (
                  <li key={`${item.kind}-${item.id}`}>
                    <Link
                      href={editHref}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-900 truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                          /{item.slug}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.kind}
                        </span>
                        <StatusBadge status={item.status} showDot={false} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
