import Link from "next/link";
import {
  Compass,
  Palette,
  Building,
  Sparkles,
  MapPin,
  Inbox,
  ArrowUpRight,
  Shield,
  Database,
  ExternalLink,
} from "lucide-react";
import { getAdminDashboardMetrics, getAdminLeads } from "@/lib/admin/data";

export const revalidate = 0; // Always fresh read-only metrics for Admin

export default async function AdminDashboardPage() {
  const metrics = await getAdminDashboardMetrics();
  const recentLeads = await getAdminLeads(5);

  const metricCards = [
    {
      title: "Live Tours",
      value: metrics.liveTours,
      subtitle: `${metrics.totalTours} total tours registered`,
      icon: Compass,
      href: "/admin/tours",
      badge: "Real DB",
      color: "emerald",
    },
    {
      title: "Travel Styles",
      value: metrics.activeTravelStyles,
      subtitle: "Active travel categories",
      icon: Palette,
      href: "/admin/travel-styles",
      badge: "Real DB",
      color: "blue",
    },
    {
      title: "Approved Stays",
      value: metrics.approvedProperties,
      subtitle: `${metrics.totalProperties} total hotels & homestays`,
      icon: Building,
      href: "/admin/properties",
      badge: "Real DB",
      color: "amber",
    },
    {
      title: "Active Experiences",
      value: metrics.activeExperiences,
      subtitle: metrics.activeExperiences === 0 ? "0 active in production" : "Active activities",
      icon: Sparkles,
      href: "/admin/experiences",
      badge: "Real DB",
      color: "purple",
    },
    {
      title: "Destinations",
      value: metrics.publishedDestinations,
      subtitle: "Published SEO destination guides",
      icon: MapPin,
      href: "/admin/destinations",
      badge: "Real DB",
      color: "cyan",
    },
    {
      title: "Customer Leads",
      value: metrics.leadsCount,
      subtitle: "Custom trip & stay enquiries",
      icon: Inbox,
      href: "/admin/leads",
      badge: "Real DB",
      color: "emerald",
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
          Phase 5 Admin Foundation • Real-time aggregates directly from the shared production database
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

      {/* Architecture Safeguards Notice */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Phase 5 Read-Only Architecture Safeguards
            </h2>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              This V2 Admin portal operates directly on the shared production PostgreSQL database.
              In accordance with Phase 5 guidelines, all mutation handlers (create, update, delete, publish) are disabled
              in V2 to guarantee zero accidental writes. Full administrative CRUD operations continue to be actively serviced by the legacy V1 Admin.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800">
                <Database className="w-3 h-3 text-emerald-400" />
                Single Shared DB
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800">
                Database Writes: 0
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800">
                V1 Fallback: Operational
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
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Lead ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Dates / Duration</th>
                  <th className="px-5 py-3">Guests</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-sans">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-5 py-3 font-mono text-[11px] text-slate-400">
                      WK-{lead.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 font-medium text-white">
                      {lead.name}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-300">
                      {lead.phone}
                    </td>
                    <td className="px-5 py-3 text-slate-300">
                      {lead.travelDates || "Upcoming"}
                    </td>
                    <td className="px-5 py-3 text-slate-300">
                      {lead.guestsCount}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 border border-slate-700">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-slate-400 text-xs font-mono">
                      {new Date(lead.createdAt).toLocaleDateString()}
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
