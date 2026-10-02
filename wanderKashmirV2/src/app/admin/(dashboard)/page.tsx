import Link from "next/link";
import {
  Compass,
  Palette,
  Building,
  Sparkles,
  MapPin,
  Inbox,
  ArrowUpRight,
  ShieldCheck,
  Database,
  Star,
  Globe,
} from "lucide-react";
import { getAdminDashboardMetrics, getAdminLeads } from "@/lib/admin/data";

export const revalidate = 0; // Fresh real-time metrics for Admin

export default async function AdminDashboardPage() {
  const metrics = await getAdminDashboardMetrics();
  const recentLeads = await getAdminLeads(5);

  const metricCards = [
    {
      title: "Live Tours",
      value: metrics.liveTours,
      subtitle: `${metrics.totalTours} total packages registered`,
      icon: Compass,
      href: "/admin/tours",
      badge: "Production DB",
    },
    {
      title: "Travel Styles",
      value: metrics.activeTravelStyles,
      subtitle: "Active travel categories",
      icon: Palette,
      href: "/admin/travel-styles",
      badge: "Production DB",
    },
    {
      title: "Approved Stays",
      value: metrics.approvedProperties,
      subtitle: `${metrics.totalProperties} total hotels & homestays`,
      icon: Building,
      href: "/admin/properties",
      badge: "Production DB",
    },
    {
      title: "Destinations",
      value: metrics.publishedDestinations,
      subtitle: "Published destination guides",
      icon: MapPin,
      href: "/admin/destinations",
      badge: "Production DB",
    },
    {
      title: "Active Experiences",
      value: metrics.activeExperiences,
      subtitle: metrics.activeExperiences === 0 ? "0 active in production" : "Active activities",
      icon: Sparkles,
      href: "/admin/experiences",
      badge: "Production DB",
    },
    {
      title: "Customer Reviews",
      value: metrics.reviewsCount,
      subtitle: "Verified customer reviews",
      icon: Star,
      href: "/admin/reviews",
      badge: "Production DB",
    },
    {
      title: "SEO Pages",
      value: metrics.seoPagesCount,
      subtitle: "Programmatic landing pages",
      icon: Globe,
      href: "/admin/seo",
      badge: "Production DB",
    },
    {
      title: "Customer Leads",
      value: metrics.leadsCount,
      subtitle: "Custom trip & stay enquiries",
      icon: Inbox,
      href: "/admin/leads",
      badge: "Production DB",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          System Overview
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Phase 7 Consolidated Admin &bull; Real-time aggregates directly from the shared production database
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 shadow-sm hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {card.title}
                  </span>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {card.value}
                </div>
                <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold text-emerald-400/80 tracking-wider">
                  {card.badge}
                </span>
                <Link
                  href={card.href}
                  className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 font-medium transition-colors"
                >
                  View Details <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Architecture Consolidation Notice */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Phase 7 Consolidated Admin Architecture
            </h2>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              All core administrative domains (Tours, Travel Styles, Stays & Properties, Destinations & Places, Experiences, Customer Reviews, and SEO Intelligence) are fully operational under the unified V2 Admin shell. All mutations enforce server-side authentication, role authorization, mass assignment protection, and targeted revalidation across the shared Neon PostgreSQL production database.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800">
                <Database className="w-3 h-3 text-emerald-400" />
                Single Shared Production DB
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800">
                Auth: Phase 5 JWT (admin_session)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800">
                All 7 Admin Modules Active
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800">
                V1 Fallback: Preserved & Untouched
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Inquiries Preview */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Recent Customer Leads</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live inquiries recorded via Customize Trip and Property Enquiry forms
            </p>
          </div>
          <Link
            href="/admin/leads"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition-colors"
          >
            All Leads <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No customer inquiries found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Travel Dates</th>
                  <th className="py-3 px-4">Destinations</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">{lead.name}</td>
                    <td className="py-3 px-4">
                      <div>{lead.phone}</div>
                      {lead.email && <div className="text-xs text-slate-400">{lead.email}</div>}
                    </td>
                    <td className="py-3 px-4">{lead.travelDates || "Flexible"}</td>
                    <td className="py-3 px-4">
                      {lead.destinations.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {lead.destinations.slice(0, 2).map((d) => (
                            <span
                              key={d}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300"
                            >
                              {d}
                            </span>
                          ))}
                          {lead.destinations.length > 2 && (
                            <span className="text-[10px] text-slate-400">
                              +{lead.destinations.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">Unspecified</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          lead.status === "CONFIRMED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : lead.status === "CONTACTED"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">
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
      </div>
    </div>
  );
}
