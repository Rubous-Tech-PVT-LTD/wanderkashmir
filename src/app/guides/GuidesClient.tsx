"use client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomDatePicker from "@/components/CustomDatePicker";
import {
  Star,
  MapPin,
  CheckCircle2,
  Filter,
  Search,
  UserCircle2,
  Calendar,
  Users
} from "lucide-react";

export default function GuidesClient({ initialGuides }: { initialGuides: any[] }) {
  const [showGuides, setShowGuides] = useState(false);

  // Form State
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [time, setTime] = useState("10:00");
  const [noOfGuides, setNoOfGuides] = useState(1);
  const [preference, setPreference] = useState("Certified Local");

  // Guide Grid State
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [maxBudget, setMaxBudget] = useState(3000);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Recommended");

  const specialtyOptions = ["All", "Heritage Tours", "Trekking", "Photography", "Skiing", "Cultural"];
  const locationOptions = ["All", "Srinagar", "Gulmarg", "Pahalgam", "Sonamarg", "Ladakh / Leh"];

  let filtered = initialGuides.filter((g) => {
    const specMatch = selectedSpecialty === "All" || g.specialties?.some((s: string) => s.toLowerCase().includes(selectedSpecialty.toLowerCase()));
    const locMatch = selectedLocation === "All" || g.location === selectedLocation;
    const budgetMatch = g.price <= maxBudget;
    const searchMatch = !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase());
    return specMatch && locMatch && budgetMatch && searchMatch;
  });

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromLocation || !toLocation) {
      toast.error("Please enter from and to locations.");
      return;
    }
    toast.success("Booking has been confirmed and your Guide details will be shared over email/Whataspp", { duration: 5000 });
  };

  return (
    <main>
      <Navbar />
      <div className="pt-20 min-h-screen bg-slate-50">
        
        {/* Header */}
        <div className="relative py-16 overflow-hidden bg-[var(--slate-900)]">
          <div className="container-custom relative z-10 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Hire a Guide
            </h1>
            <p className="text-slate-300 text-base max-w-2xl mx-auto mb-2">
              Connect with certified, background-verified local guides across Kashmir.
            </p>
          </div>
        </div>

        <div className="container-custom py-12 max-w-4xl mx-auto">
          
          {/* Booking Form */}
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <UserCircle2 className="w-6 h-6 text-[var(--primary)]" /> Plan Your Guided Tour
            </h2>
            
            <form onSubmit={handleBooking} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-2"><MapPin className="w-3.5 h-3.5" /> From Location</label>
                  <input required type="text" value={fromLocation} onChange={e => setFromLocation(e.target.value)} placeholder="e.g. Srinagar" className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-2"><MapPin className="w-3.5 h-3.5 text-orange-500" /> To Location</label>
                  <input required type="text" value={toLocation} onChange={e => setToLocation(e.target.value)} placeholder="e.g. Pahalgam" className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-2"><Users className="w-3.5 h-3.5" /> No of Guides</label>
                  <input type="number" min="1" max="10" value={noOfGuides} onChange={e => setNoOfGuides(Number(e.target.value))} className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none transition-colors" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-2"><Calendar className="w-3.5 h-3.5" /> Date / Time</label>
                  <div className="flex gap-2">
                    <div className="flex-1 border-2 border-slate-200 p-3 rounded-xl focus-within:border-orange-500 transition-colors bg-white">
                      <CustomDatePicker selected={date} onChange={setDate} minDate={new Date()} className="w-full focus:outline-none" />
                    </div>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-32 border-2 border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none transition-colors" />
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-2"><CheckCircle2 className="w-3.5 h-3.5" /> Preference</label>
                  <select value={preference} onChange={e => setPreference(e.target.value)} className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none transition-colors bg-white">
                    <option>Certified Local</option>
                    <option>Female Guide</option>
                    <option>Historian</option>
                    <option>Trekking Expert</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full mt-4 bg-[var(--primary)] text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-[var(--primary-hover)] transition-all">
                Confirm Booking
              </button>
            </form>
          </div>

          {/* Expandable Guide Team Section */}
          <div className="text-center">
            <button 
              onClick={() => setShowGuides(!showGuides)} 
              className="inline-flex items-center gap-2 bg-white border-2 border-slate-200 px-6 py-3 rounded-full font-bold text-slate-700 hover:border-orange-500 hover:text-orange-500 transition-colors shadow-sm"
            >
              {showGuides ? "Hide Guide Team" : "View Our Guide Team"}
            </button>
          </div>

          {showGuides && (
            <div className="mt-10 animate-in fade-in slide-in-from-top-4 duration-500">
              {/* Filters Sidebar + Grid (Simplified for length) */}
              <div className="flex flex-col lg:flex-row gap-8">
                <aside className="w-full lg:w-64 flex-shrink-0">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4"><Filter className="w-4 h-4 text-slate-500" /> Filters</h3>
                    
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-slate-700 mb-3">Location</p>
                      <div className="space-y-2">
                        {locationOptions.map(loc => (
                          <label key={loc} className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" checked={selectedLocation === loc} onChange={() => setSelectedLocation(loc)} className="accent-[var(--primary)]" />
                            <span className="text-sm text-slate-600 group-hover:text-slate-900">{loc}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </aside>

                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map(guide => (
                      <div key={guide.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
                        <div className="flex items-start gap-4">
                          <img src={guide.image || guide.avatar || "https://placehold.co/100"} alt={guide.name} className="w-16 h-16 rounded-full object-cover" />
                          <div>
                            <h3 className="font-bold text-lg text-slate-900">{guide.name}</h3>
                            <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {guide.location}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Star className="w-3.5 h-3.5 fill-slate-900 text-slate-900" />
                              <span className="text-sm font-bold text-slate-900">{guide.rating}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{guide.bio}</p>
                        <div className="pt-4 border-t border-slate-100 mt-auto flex justify-between items-center">
                          <span className="text-xs font-bold px-3 py-1 bg-orange-500 text-white rounded-full">{guide.availability || 'Available'}</span>
                          <span className="font-bold text-slate-900">₹{guide.price.toLocaleString("en-IN")}/day</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </main>
  );
}
