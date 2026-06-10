"use client";
import { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  Star,
  Settings,
  Bell,
  TrendingUp,
  Hotel,
  CheckCircle2,
  XCircle,
  Clock,
  Mountain,
  LogOut,
  ChevronRight,
  Plus,
  Edit,
  Eye,
  Users,
  Camera,
  AlertCircle,
  FileText,
} from "lucide-react";

const sidebarItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: Calendar, badge: 3 },
  { id: "calendar", label: "Availability", icon: Calendar },
  { id: "earnings", label: "Earnings", icon: DollarSign },
  { id: "property", label: "My Property", icon: Hotel },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "settings", label: "Settings", icon: Settings },
];

const stats = [
  { label: "This Month Revenue", value: "₹2,34,500", change: "+18%", icon: DollarSign, color: "orange" },
  { label: "Total Bookings", value: "42", change: "+8 this month", icon: FileText, color: "blue" },
  { label: "Occupancy Rate", value: "78%", change: "+12% vs last month", icon: TrendingUp, color: "emerald" },
  { label: "Avg. Rating", value: "4.9 ★", change: "312 reviews", icon: Star, color: "yellow" },
];

const upcomingBookings = [
  { id: "WK-2025-4821", guest: "Rahul Sharma", phone: "+91 98765 43210", checkIn: "Jun 10", checkOut: "Jun 13", nights: 3, guests: 2, amount: "₹21,450", status: "confirmed", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: "WK-2025-4820", guest: "Priya Menon", phone: "+91 87654 32109", checkIn: "Jun 14", checkOut: "Jun 16", nights: 2, guests: 4, amount: "₹14,300", status: "pending", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: "WK-2025-4819", guest: "Arjun & Divya", phone: "+91 76543 21098", checkIn: "Jun 18", checkOut: "Jun 22", nights: 4, guests: 2, amount: "₹28,600", status: "confirmed", avatar: "https://randomuser.me/api/portraits/men/68.jpg" },
];

const recentReviews = [
  { name: "Rahul S.", rating: 5, text: "Absolutely magical experience! The houseboat was spotless and Yusuf ji was the most gracious host.", date: "Apr 2025", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Priya M.", rating: 5, text: "Dream honeymoon stay. The shikara at sunset was just perfect. Will definitely return!", date: "Mar 2025", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-sky-100 text-sky-700",
  pending: "bg-orange-100 text-orange-700",
  cancelled: "bg-orange-100 text-orange-700",
};

export default function VendorDashboard() {
  const [activePage, setActivePage] = useState("overview");

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ─── Sidebar ─── */}
      <aside className="w-60 bg-white border-r border-slate-100 flex-shrink-0 flex flex-col sticky top-0 h-screen">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--grad-saffron)" }}>
              <Mountain className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-base font-bold">
              Wander<span style={{ color: "var(--saffron)" }}>Kashmir</span>
            </span>
          </div>
          <span className="text-xs text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md font-semibold">Vendor Dashboard</span>
        </div>

        {/* Property preview */}
        <div className="p-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 p-2.5 bg-orange-50 rounded-xl">
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&q=80"
              className="w-10 h-10 rounded-lg object-cover"
              alt="property"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">Grand Dal View Houseboat</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span className="text-xs text-sky-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {sidebarItems.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              className={`sidebar-item w-full ${activePage === id ? "active" : ""}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left text-sm">{label}</span>
              {badge && (
                <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-2.5 p-2 mb-2">
            <img src="https://randomuser.me/api/portraits/men/45.jpg" className="w-8 h-8 rounded-full object-cover" alt="host" />
            <div>
              <p className="text-xs font-semibold text-slate-900">Mohammad Yusuf</p>
              <p className="text-xs text-slate-400">Host since 2019</p>
            </div>
          </div>
          <button className="sidebar-item w-full text-orange-400 hover:bg-orange-50">
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Good morning, Yusuf ji 👋</h1>
            <p className="text-xs text-slate-500">Thursday, 5 June 2025 · Srinagar, J&K</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add New Property
            </button>
            <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
            </button>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Alert banner */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <p className="text-sm text-orange-800">
              <span className="font-semibold">Action needed:</span> You have 3 pending booking requests. Accept or decline within 24 hours to maintain your response rate.
            </p>
            <button className="ml-auto text-sm font-semibold text-orange-600 hover:text-orange-700 whitespace-nowrap">
              View now →
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map(({ label, value, change, icon: Icon, color }) => (
              <div key={label} className="stat-card">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-100`}>
                    <Icon className={`w-5 h-5 text-${color}-600`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-0.5">{value}</p>
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="text-xs text-sky-600 font-medium">{change}</p>
              </div>
            ))}
          </div>

          {/* Bookings + Calendar row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Bookings */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Upcoming Bookings</h2>
                <button className="text-sm text-orange-500 font-semibold flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                {upcomingBookings.map((b) => (
                  <div key={b.id} className="flex gap-3 p-3 border border-slate-100 rounded-xl hover:border-orange-200 transition-colors">
                    <img src={b.avatar} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" alt={b.guest} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{b.guest}</p>
                          <p className="text-xs text-slate-400">{b.phone}</p>
                        </div>
                        <span className={`badge text-xs ${statusColors[b.status]} capitalize px-2.5 py-1 rounded-full whitespace-nowrap`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {b.checkIn} → {b.checkOut} ({b.nights} nights)
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {b.guests} guests
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <p className="text-sm font-bold text-slate-900">{b.amount}</p>
                      {b.status === "pending" && (
                        <div className="flex gap-1.5">
                          <button className="w-7 h-7 bg-sky-100 rounded-lg flex items-center justify-center hover:bg-sky-200 transition-colors">
                            <CheckCircle2 className="w-4 h-4 text-sky-600" />
                          </button>
                          <button className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center hover:bg-orange-200 transition-colors">
                            <XCircle className="w-4 h-4 text-orange-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  {[
                    { icon: Calendar, label: "Update Availability", color: "orange" },
                    { icon: Camera, label: "Add New Photos", color: "blue" },
                    { icon: Edit, label: "Edit Property Details", color: "emerald" },
                    { icon: DollarSign, label: "Update Pricing", color: "purple" },
                    { icon: Eye, label: "Preview Listing", color: "gray" },
                  ].map(({ icon: Icon, label, color }) => (
                    <button
                      key={label}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-${color}-100 flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 text-${color}-600`} />
                      </div>
                      <span className="text-sm text-slate-700 font-medium">{label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Payout card */}
              <div className="rounded-2xl p-5 text-white" style={{ background: "var(--grad-saffron)" }}>
                <p className="text-sm font-medium text-orange-100 mb-1">Pending Payout</p>
                <p className="text-3xl font-bold mb-1">₹68,400</p>
                <p className="text-xs text-orange-200 mb-4">Releases on Jun 10, 2025</p>
                <button className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl border border-white/30 transition-colors">
                  View Payout Details →
                </button>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                Recent Reviews
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">4.9 avg</span>
              </h2>
              <button className="text-sm text-orange-500 font-semibold">View all</button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentReviews.map((r) => (
                <div key={r.name} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={r.avatar} className="w-8 h-8 rounded-full object-cover" alt={r.name} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{r.name}</p>
                      <p className="text-xs text-slate-400">{r.date}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 italic">&ldquo;{r.text}&rdquo;</p>
                  <button className="text-xs text-orange-500 font-semibold mt-2 hover:text-orange-600">Reply →</button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
