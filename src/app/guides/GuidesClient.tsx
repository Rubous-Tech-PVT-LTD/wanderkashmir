"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Star,
  MapPin,
  Calendar,
  Users,
  MessageCircle,
  Phone,
  CheckCircle2,
  Filter,
  SlidersHorizontal,
  Search,
  Camera,
  Mountain,
  Compass,
  Languages,
  Shield,
} from "lucide-react";

// Removed hardcoded guides array

const specialtyOptions = [
  "All",
  "Heritage Tours",
  "Trekking",
  "Photography",
  "Skiing",
  "Cultural",
  "Nature Walks",
  "Women's Tours",
  "Monastery Tours",
  "General Tourism",
];

const locationOptions = ["All", "Srinagar", "Gulmarg", "Pahalgam", "Sonamarg", "Ladakh / Leh"];

const availabilityColors: Record<string, string> = {
  "Available": "bg-sky-100 text-sky-700",
};

export default function GuidesClient({ initialGuides }: { initialGuides: any[] }) {
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [maxBudget, setMaxBudget] = useState(3000);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Recommended");

  const guides = initialGuides;

  let filtered = guides.filter((g) => {
    const specMatch =
      selectedSpecialty === "All" ||
      g.specialties.some((s: string) => s.toLowerCase().includes(selectedSpecialty.toLowerCase()));
    const locMatch = selectedLocation === "All" || g.location === selectedLocation;
    const budgetMatch = g.price <= maxBudget;
    const searchMatch =
      !searchQuery ||
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.specialties.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      g.destinations.some((d: string) => d.toLowerCase().includes(searchQuery.toLowerCase()));
    return specMatch && locMatch && budgetMatch && searchMatch;
  });

  if (sortBy === "Highest Rated") filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  if (sortBy === "Most Reviewed") filtered = [...filtered].sort((a, b) => b.reviews - a.reviews);
  if (sortBy === "Price: Low to High") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "Most Experienced") filtered = [...filtered].sort((a, b) => b.experience - a.experience);
  if (sortBy === "Recommended") filtered = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <main>
      <Navbar />
      <div className="pt-20 min-h-screen bg-slate-50">
        {/* Hero */}
        <div className="relative py-20 overflow-hidden bg-[var(--slate-900)]">
          <div className="container-custom relative z-10 text-center">
            <p className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-2">
              Local Expertise
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Hire a Kashmir Guide
            </h1>
            <p className="text-slate-300 text-base max-w-2xl mx-auto mb-8">
              Connect with certified, background-verified local guides across Kashmir. From Dal Lake to
              Ladakh — our guides know every hidden gem.
            </p>

            {/* Search */}
            <div className="bg-white rounded-2xl shadow-xl p-2 max-w-2xl mx-auto flex gap-2">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search guides by name, specialty or destination..."
                  className="flex-1 text-sm text-slate-800 focus:outline-none placeholder-slate-400 font-medium"
                />
              </div>
              <button className="btn-primary px-6 py-3 rounded-xl">
                Search
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-slate-300 text-sm font-medium">
              {["250+ Certified Guides", "4.8★ Average Rating", "All Languages"].map((s) => (
                <span key={s} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="container-custom py-8 flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sticky top-28">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  Filters
                </h3>
                <button
                  onClick={() => {
                    setSelectedSpecialty("All");
                    setSelectedLocation("All");
                    setMaxBudget(3000);
                  }}
                  className="text-xs text-[var(--primary)] font-semibold hover:text-[var(--primary-hover)]"
                >
                  Clear all
                </button>
              </div>

              {/* Location */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-700 mb-3">Location</p>
                <div className="space-y-2">
                  {locationOptions.map((loc) => (
                    <label key={loc} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="location"
                        checked={selectedLocation === loc}
                        onChange={() => setSelectedLocation(loc)}
                        className="accent-[var(--primary)]"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900">{loc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-700 mb-1">
                  Max Daily Rate
                  <span className="text-[var(--primary)] ml-2 font-bold">
                    ₹{maxBudget.toLocaleString("en-IN")}
                  </span>
                </p>
                <input
                  type="range"
                  min={1000}
                  max={5000}
                  step={200}
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="w-full accent-[var(--primary)] mt-2"
                />
              </div>

              {/* Specialty */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-700 mb-3">Specialty</p>
                <div className="space-y-2">
                  {specialtyOptions.map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="specialty"
                        checked={selectedSpecialty === s}
                        onChange={() => setSelectedSpecialty(s)}
                        className="accent-[var(--primary)]"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Become a Guide CTA */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center mt-6">
                <p className="text-sm text-slate-900 font-semibold mb-1">Are you a local guide?</p>
                <a
                  href="/guides/register"
                  className="text-xs font-bold text-[var(--primary)] hover:underline mt-2 inline-block"
                >
                  Register as Guide →
                </a>
              </div>
            </div>
          </aside>

          {/* Guide Cards */}
          <div className="flex-1 min-w-0">
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <p className="text-sm text-slate-500 font-medium">
                <span className="font-bold text-slate-900">{filtered.length}</span> guides available
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 font-medium whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-[var(--primary)] bg-white font-medium cursor-pointer"
                >
                  {["Recommended", "Highest Rated", "Most Reviewed", "Price: Low to High", "Most Experienced"].map(
                    (o) => (
                      <option key={o}>{o}</option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* Guide Cards */}
            {filtered.length > 0 ? (
              <div className="space-y-5">
                {filtered.map((guide) => (
                  <div
                    key={guide.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Side Image */}
                      <div className="md:w-56 h-56 md:h-auto relative flex-shrink-0">
                        <img
                          src={guide.image}
                          alt={guide.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {guide.featured && (
                          <div className="absolute top-3 left-3">
                            <span className="badge badge-white">Featured</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-start gap-4 mb-4">
                            <img
                              src={guide.avatar}
                              alt={guide.name}
                              className="w-16 h-16 rounded-full object-cover flex-shrink-0 border border-slate-100"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-xl text-slate-900">{guide.name}</h3>
                                {guide.verified && (
                                  <CheckCircle2 className="w-5 h-5 text-sky-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                {guide.location}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-slate-900 text-slate-900" />
                                  <span className="font-bold text-slate-900">{guide.rating}</span>
                                  <span>({guide.reviews})</span>
                                </div>
                                <span>·</span>
                                <span>{guide.experience} yrs exp</span>
                              </div>
                            </div>
                          </div>

                          {/* Bio */}
                          <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">
                            {guide.bio}
                          </p>

                          {/* Specialties */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {guide.specialties.map((s: string) => (
                              <span
                                key={s}
                                className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Right — Price & CTA */}
                        <div className="flex flex-col items-start md:items-end justify-between md:min-w-[140px] pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6">
                          <div className="text-left md:text-right w-full">
                            <p className="text-sm text-slate-500 mb-1">From</p>
                            <p className="text-2xl font-bold text-slate-900">
                              ₹{guide.price.toLocaleString("en-IN")}
                            </p>
                            <p className="text-xs text-slate-500">per day</p>
                            <div className="mt-3">
                              <span
                                className={`text-xs font-semibold px-3 py-1 rounded-full inline-block ${
                                  guide.availability === "Available"
                                    ? "bg-sky-50 text-sky-700 border border-sky-100"
                                    : "bg-orange-50 text-orange-700 border border-orange-100"
                                }`}
                              >
                                {guide.availability === "Available" ? "Available" : "Busy"}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 w-full mt-4">
                            <button className="btn-primary w-full justify-center">
                              Book Guide
                            </button>
                            <button className="btn-secondary w-full justify-center text-sm px-4 py-2">
                              Message
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                <p className="text-4xl mb-4">🔍</p>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No guides found</h3>
                <p className="text-slate-500 text-sm">Try adjusting your filters to see more results</p>
                <button
                  onClick={() => {
                    setSelectedSpecialty("All");
                    setSelectedLocation("All");
                    setMaxBudget(3000);
                    setSearchQuery("");
                  }}
                  className="mt-6 btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Register CTA */}
        <section className="container-custom pb-16 pt-8">
          <div className="rounded-3xl p-10 md:p-14 bg-[var(--slate-900)] text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Are You a Local Guide?
              </h2>
              <p className="text-slate-300 text-lg mb-6 max-w-xl">
                Join WanderKashmir's guide network and connect with thousands of travelers. 
                Free registration, instant bookings, weekly payouts.
              </p>
              <div className="flex flex-wrap gap-6 text-slate-300 font-medium">
                <span>✓ Free to register</span>
                <span>✓ Weekly payouts</span>
                <span>✓ Verified badge</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <a
                href="/guides/register"
                className="bg-white text-[var(--slate-900)] px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors inline-block"
              >
                Apply Now
              </a>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
