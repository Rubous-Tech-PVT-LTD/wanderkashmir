import { useEffect, useState } from "react";
import { Edit2, Trash2, Plus, ArrowLeft, ArrowUp, ArrowDown, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getPaginatedTours, getApprovedPropertiesForSelect, getApprovedVehiclesForSelect, getActiveDriversForSelect, getApprovedExperiencesForSelect } from "@/actions/admin-data";
import { getDestinations, type DestinationItem } from "@/actions/destinations";
import Pagination from "@/components/Pagination";

export default function AdminToursTab({ initialEditTour, initialCategory, onInitialPropsConsumed, onExitEdit }: { initialEditTour?: any, initialCategory?: string | null, onInitialPropsConsumed?: () => void, onExitEdit?: () => void }) {
  const TOUR_CATEGORIES = [
    "General",
    "Family",
    "Short Kashmir Trips",
    "Weekend Escape"
  ];

  const [tours, setTours] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isEditing, setIsEditing] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approvedProperties, setApprovedProperties] = useState<any[]>([]);
  const [approvedVehicles, setApprovedVehicles] = useState<any[]>([]);
  const [activeDrivers, setActiveDrivers] = useState<any[]>([]);
  const [approvedExperiences, setApprovedExperiences] = useState<any[]>([]);
  const [availableDestinations, setAvailableDestinations] = useState<DestinationItem[]>([]);
  const [availableTravelGuides, setAvailableTravelGuides] = useState<any[]>([]);
  const [destSearch, setDestSearch] = useState("");
  const [guideSearch, setGuideSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    getApprovedPropertiesForSelect().then((props) => setApprovedProperties(props || [])).catch(() => {});
    getApprovedVehiclesForSelect().then((v) => setApprovedVehicles(v || [])).catch(() => {});
    getActiveDriversForSelect().then((d) => setActiveDrivers(d || [])).catch(() => {});
    getApprovedExperiencesForSelect().then((e) => setApprovedExperiences(e || [])).catch(() => {});
    getDestinations(false).then((dests) => setAvailableDestinations(dests || [])).catch(() => {});
    fetch("/api/admin/seo-pages?type=BLOG")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableTravelGuides(data.filter((g: any) => g.type === "BLOG" && g.workflowState === "PUBLISHED"));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await getPaginatedTours({ page: currentPage, limit: 20 });
        setTours(res.data);
        setTotalPages(res.totalPages);
        setTotalItems(res.totalCount);
      } catch (err) {
        toast.error("Failed to load tours");
      }
    };
    fetchTours();
  }, [currentPage]);

  useEffect(() => {
    if (initialEditTour) {
      handleEdit(initialEditTour);
      if (onInitialPropsConsumed) onInitialPropsConsumed();
    } else if (initialCategory) {
      handleAddNew(initialCategory);
      if (onInitialPropsConsumed) onInitialPropsConsumed();
    }
  }, [initialEditTour, initialCategory]);

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    duration: "",
    destinations: [] as string[],
    travelGuides: [] as { guideId: string; title?: string; slug?: string; displayOrder: number }[],
    price: "",
    originalPrice: "",
    category: "",
    maxPersons: "2",
    images: "",
    overview: "",
    highlights: "",
    inclusions: "",
    exclusions: "",
    itinerary: [] as { day: number, title: string, description: string }[],
    transports: [] as any[],
    experiences: [] as any[],
    stays: [] as {
      id?: string;
      destination: string;
      nights: number;
      stayType: string;
      propertyId: string | null;
      displayOrder: number;
    }[],
    isLive: true,
  });

  const handleEdit = (tour: any) => {
    setIsEditing(tour);
    setFormData({
      title: tour.title,
      slug: tour.slug,
      duration: tour.duration,
      destinations: Array.isArray(tour.destinations) ? tour.destinations : [],
      travelGuides: Array.isArray(tour.travelGuides)
        ? tour.travelGuides.map((tg: any, idx: number) => ({
            guideId: tg.guideId,
            title: tg.guide?.title || tg.title || "",
            slug: tg.guide?.slug || tg.slug || "",
            displayOrder: tg.displayOrder ?? idx + 1,
          }))
        : [],
      price: String(tour.price),
      originalPrice: tour.originalPrice ? String(tour.originalPrice) : "",
      category: tour.category,
      maxPersons: String(tour.maxPersons),
      images: tour.images.join(", "),
      overview: tour.overview || "",
      highlights: tour.highlights?.join(", ") || "",
      inclusions: tour.inclusions?.join(", ") || "",
      exclusions: tour.exclusions?.join(", ") || "",
      itinerary: tour.itinerary && Array.isArray(tour.itinerary) ? tour.itinerary : [],
      stays: Array.isArray(tour.stays)
        ? tour.stays.map((s: any, idx: number) => ({
            id: s.id,
            destination: s.destination || "Srinagar",
            nights: Number(s.nights) || 1,
            stayType: s.stayType || "Hotel",
            propertyId: s.propertyId || null,
            displayOrder: s.displayOrder || idx + 1,
          }))
        : [],
      transports: tour.transports || [],
      experiences: tour.experiences || [],
      isLive: tour.isLive ?? true,
    });
    setIsAdding(true);
  };

  const handleAddNew = (defaultCategory: string = "General") => {
    setIsEditing(null);
    setFormData({
      title: "",
      slug: "",
      duration: "",
      destinations: [],
      travelGuides: [],
      price: "",
      originalPrice: "",
      category: defaultCategory || "General",
      maxPersons: "2",
      images: "",
      overview: "",
      highlights: "",
      inclusions: "",
      exclusions: "",
      itinerary: [],
      transports: [],
      experiences: [],
      stays: [],
      isLive: true,
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tour?")) return;
    try {
      const res = await fetch(`/api/admin/tours/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Tour deleted");
        setTours(tours.filter(t => t.id !== id));
        router.refresh();
      } else {
        toast.error("Failed to delete tour");
      }
    } catch (e) {
      toast.error("Error deleting tour");
    }
  };

  const parseTourNights = (durationStr: string): number => {
    if (!durationStr) return 0;
    const nightMatch = durationStr.match(/(\d+)\s*(?:Nights?|N\b)/i);
    if (nightMatch) return parseInt(nightMatch[1], 10);
    const dayMatch = durationStr.match(/(\d+)\s*(?:Days?|D\b)/i);
    if (dayMatch) return Math.max(0, parseInt(dayMatch[1], 10) - 1);
    const num = parseInt(durationStr, 10);
    return isNaN(num) ? 0 : Math.max(0, num - 1);
  };

  const getMatchingProperties = (destination: string) => {
    if (!destination || !destination.trim()) return approvedProperties;
    const destLower = destination.trim().toLowerCase();
    return approvedProperties.filter((p) => {
      const locLower = (p.location || "").toLowerCase();
      const nameLower = (p.name || "").toLowerCase();
      if (locLower.includes(destLower) || destLower.includes(locLower)) return true;
      if (destLower.includes("srinagar") && (locLower.includes("srinagar") || locLower.includes("dal lake") || locLower.includes("nigeen"))) return true;
      if (destLower.includes("gulmarg") && (locLower.includes("gulmarg") || nameLower.includes("gulmarg"))) return true;
      if (destLower.includes("pahalgam") && (locLower.includes("pahalgam") || nameLower.includes("pahalgam"))) return true;
      if (destLower.includes("sonamarg") && (locLower.includes("sonamarg") || nameLower.includes("sonamarg"))) return true;
      return false;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const totalStayNights = formData.stays.reduce((sum, s) => sum + (Number(s.nights) || 0), 0);
      const expectedNights = parseTourNights(formData.duration);

      if (formData.stays.length > 0 && expectedNights > 0 && totalStayNights !== expectedNights) {
        toast.error(`Accommodation nights (${totalStayNights}) do not match the tour's ${expectedNights} nights. Please adjust accommodation rows.`);
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        destinations: Array.isArray(formData.destinations)
          ? formData.destinations
          : typeof formData.destinations === "string"
          ? (formData.destinations as string).split(",").map(s => s.trim()).filter(Boolean)
          : [],
        travelGuides: formData.travelGuides.map((tg, idx) => ({
          guideId: tg.guideId,
          displayOrder: idx + 1,
        })),
        images: formData.images.split(",").map(s => s.trim()).filter(Boolean),
        highlights: formData.highlights.split(",").map(s => s.trim()).filter(Boolean),
        inclusions: formData.inclusions.split(",").map(s => s.trim()).filter(Boolean),
        exclusions: formData.exclusions.split(",").map(s => s.trim()).filter(Boolean),
        itinerary: formData.itinerary,
        stays: formData.stays,
        isLive: formData.isLive,
      };

      let res;
      if (isEditing) {
        res = await fetch(`/api/admin/tours/${isEditing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/admin/tours`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const savedTour = await res.json();
        toast.success(isEditing ? "Tour updated" : "Tour created");
        if (isEditing) {
          setTours(tours.map(t => t.id === savedTour.id ? savedTour : t));
        } else {
          setTours([savedTour, ...tours]);
        }
        setIsAdding(false);
        if (onExitEdit) onExitEdit();
        router.refresh();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "Failed to save tour");
      }
    } catch (e: any) {
      toast.error(e?.message || "Error saving tour");
    } finally {
      setLoading(false);
    }
  };

  const addItineraryDay = () => {
    setFormData((prev) => ({
      ...prev,
      itinerary: [...prev.itinerary, { day: prev.itinerary.length + 1, title: "", description: "" }]
    }));
  };

  const updateItineraryDay = (index: number, field: string, value: string) => {
    const newItin = [...formData.itinerary];
    newItin[index] = { ...newItin[index], [field]: value };
    setFormData({ ...formData, itinerary: newItin });
  };

  const removeItineraryDay = (index: number) => {
    const newItin = formData.itinerary.filter((_, i) => i !== index).map((day, i) => ({ ...day, day: i + 1 }));
    setFormData({ ...formData, itinerary: newItin });
  };

  const addStay = () => {
    const defaultDest = (Array.isArray(formData.destinations) ? formData.destinations[0] : "") || "Srinagar";
    setFormData((prev) => ({
      ...prev,
      stays: [
        ...prev.stays,
        {
          destination: defaultDest,
          nights: 1,
          stayType: "Hotel",
          propertyId: null,
          displayOrder: prev.stays.length + 1,
        },
      ],
    }));
  };

  const updateStay = (index: number, field: string, value: any) => {
    const newStays = [...formData.stays];
    newStays[index] = { ...newStays[index], [field]: value };
    setFormData({ ...formData, stays: newStays });
  };

  const removeStay = (index: number) => {
    const newStays = formData.stays
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, displayOrder: i + 1 }));
    setFormData({ ...formData, stays: newStays });
  };

  const moveStay = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.stays.length) return;
    const newStays = [...formData.stays];
    const [removed] = newStays.splice(index, 1);
    newStays.splice(newIndex, 0, removed);
    const reindexed = newStays.map((s, idx) => ({ ...s, displayOrder: idx + 1 }));
    setFormData({ ...formData, stays: reindexed });
  };

  const addTransport = () => {
    setFormData((prev) => ({
      ...prev,
      transports: [
        ...prev.transports,
        { origin: "Srinagar", destination: "", purpose: "Transfer", vehicleId: null, driverId: null, displayOrder: prev.transports.length + 1 }
      ]
    }));
  };
  const updateTransport = (index: number, field: string, value: any) => {
    const newTransports = [...formData.transports];
    newTransports[index] = { ...newTransports[index], [field]: value };
    setFormData({ ...formData, transports: newTransports });
  };
  const removeTransport = (index: number) => {
    setFormData({ ...formData, transports: formData.transports.filter((_, i) => i !== index) });
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        { experienceId: null, isOptional: false, dayNumber: null, displayOrder: prev.experiences.length + 1 }
      ]
    }));
  };
  const updateExperience = (index: number, field: string, value: any) => {
    const newExps = [...formData.experiences];
    newExps[index] = { ...newExps[index], [field]: value };
    setFormData({ ...formData, experiences: newExps });
  };
  const removeExperience = (index: number) => {
    setFormData({ ...formData, experiences: formData.experiences.filter((_, i) => i !== index) });
  };

  if (isAdding) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <button 
            type="button" 
            onClick={() => {
              setIsAdding(false);
              if (onExitEdit) onExitEdit();
            }}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h3 className="text-xl font-bold">{isEditing ? "Edit Tour" : "Add New Tour"}</h3>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Title</label>
            <input 
              required 
              type="text" 
              className="w-full border rounded-lg p-2" 
              value={formData.title} 
              onChange={e => {
                const title = e.target.value;
                setFormData({ ...formData, title, slug: generateSlug(title) });
              }} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Slug (URL friendly)</label>
            <input required type="text" className="w-full border rounded-lg p-2" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Duration</label>
            <input required type="text" className="w-full border rounded-lg p-2" placeholder="e.g. 5 Days / 4 Nights" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Tour Category</label>
            <select
              required
              className="w-full border rounded-lg p-2 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="" disabled>Select Tour Category</option>
              {TOUR_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              {formData.category && !TOUR_CATEGORIES.includes(formData.category) && (
                <option value={formData.category}>{formData.category} (Current / Legacy)</option>
              )}
            </select>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {TOUR_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    formData.category === cat
                      ? "bg-orange-500 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Tour Status</label>
            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="tourStatus" 
                  className="w-5 h-5 accent-orange-500 border-slate-300" 
                  checked={formData.isLive === true} 
                  onChange={() => setFormData({ ...formData, isLive: true })} 
                />
                <span className="font-medium text-slate-700">Live (Visible)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="tourStatus" 
                  className="w-5 h-5 accent-orange-500 border-slate-300" 
                  checked={formData.isLive === false} 
                  onChange={() => setFormData({ ...formData, isLive: false })} 
                />
                <span className="font-medium text-slate-700">Coming Soon</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Multiple Image URLs (comma separated)</label>
            <input required type="text" className="w-full border rounded-lg p-2" placeholder="url1.jpg, url2.jpg" value={formData.images} onChange={e => setFormData({ ...formData, images: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Price (₹)</label>
            <input required type="number" className="w-full border rounded-lg p-2" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Original Price (optional)</label>
            <input type="number" className="w-full border rounded-lg p-2" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Max Persons</label>
            <input required type="number" min="1" className="w-full border rounded-lg p-2" placeholder="e.g. 10" value={formData.maxPersons} onChange={e => setFormData({ ...formData, maxPersons: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Overview</label>
            <textarea className="w-full border rounded-lg p-2 h-32" value={formData.overview} onChange={e => setFormData({ ...formData, overview: e.target.value })} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Tour Highlights (comma separated)</label>
            <textarea className="w-full border rounded-lg p-2 h-20" placeholder="Shikara ride on Dal Lake, Gulmarg Gondola ride" value={formData.highlights} onChange={e => setFormData({ ...formData, highlights: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">What's Included (comma separated)</label>
            <textarea className="w-full border rounded-lg p-2 h-24" placeholder="Breakfast, Hotel Stay, Airport Transfer" value={formData.inclusions} onChange={e => setFormData({ ...formData, inclusions: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">What's Excluded (comma separated)</label>
            <textarea className="w-full border rounded-lg p-2 h-24" placeholder="Flight tickets, Lunch, Personal expenses" value={formData.exclusions} onChange={e => setFormData({ ...formData, exclusions: e.target.value })} />
          </div>

          {/* Dynamic Itinerary Section */}
          <div className="md:col-span-2 border-t border-slate-200 pt-6 mt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-slate-800">Day-by-Day Itinerary</h4>
              <button type="button" onClick={addItineraryDay} className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-orange-500 transition-colors">
                <Plus className="w-4 h-4" /> Add Day
              </button>
            </div>
            
            {formData.itinerary.length === 0 && (
              <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-500 text-sm">
                No itinerary days added yet. Click "Add Day" to start building your tour schedule.
              </div>
            )}

            <div className="space-y-4">
              {formData.itinerary.map((day, index) => (
                <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-slate-800 bg-white px-3 py-1 rounded-md shadow-sm text-sm border border-slate-100">Day {day.day}</span>
                    <button type="button" onClick={() => removeItineraryDay(index)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-md">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input 
                      type="text" 
                      placeholder="Title (e.g., Arrival in Srinagar)" 
                      className="w-full border rounded-lg p-2 text-sm font-semibold"
                      value={day.title}
                      onChange={(e) => updateItineraryDay(index, 'title', e.target.value)}
                    />
                    <textarea 
                      placeholder="Description of activities for the day..." 
                      className="w-full border rounded-lg p-2 text-sm h-20"
                      value={day.description}
                      onChange={(e) => updateItineraryDay(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dedicated Accommodation Section */}
          <div className="md:col-span-2 border-t border-slate-200 pt-6 mt-4">
            {(() => {
              const totalStayNights = formData.stays.reduce((sum, s) => sum + (Number(s.nights) || 0), 0);
              const expectedTourNights = parseTourNights(formData.duration);
              const isNightsMismatch = expectedTourNights > 0 && totalStayNights !== expectedTourNights;

              return (
                <>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-bold text-slate-900">Accommodation</h4>
                        <span
                          className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
                            expectedTourNights > 0 && !isNightsMismatch
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-800 border-amber-300"
                          }`}
                        >
                          Total Accommodation Nights: {totalStayNights} {expectedTourNights > 0 ? `/ ${expectedTourNights}` : ""}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Define destination, number of nights, and assign verified properties for each accommodation segment.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addStay}
                      className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" /> Add Accommodation
                    </button>
                  </div>

                  {isNightsMismatch && formData.stays.length > 0 && (
                    <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2.5 font-medium">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>
                        <strong>Warning:</strong> Accommodation nights do not match the tour&apos;s {expectedTourNights} nights ({totalStayNights} / {expectedTourNights}).
                      </span>
                    </div>
                  )}

                  {formData.stays.length === 0 && (
                    <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-500 text-sm">
                      No accommodations assigned yet. Click &quot;Add Accommodation&quot; to configure destination nights and properties.
                    </div>
                  )}

                  <datalist id="admin-tour-destinations">
                    <option value="Srinagar" />
                    <option value="Gulmarg" />
                    <option value="Pahalgam" />
                    <option value="Sonamarg" />
                    <option value="Doodhpathri" />
                    <option value="Yusmarg" />
                    <option value="Gurez" />
                  </datalist>

                  <div className="space-y-3">
                    {formData.stays.map((stay, index) => {
                      const matchingProps = getMatchingProperties(stay.destination);
                      const currentSelectedProp = stay.propertyId
                        ? approvedProperties.find((p) => p.id === stay.propertyId)
                        : null;
                      const isOrphanedSelection =
                        stay.propertyId && !matchingProps.some((p) => p.id === stay.propertyId);

                      return (
                        <div
                          key={index}
                          className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 transition-all"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 bg-white px-3 py-1 rounded-md shadow-xs text-xs border border-slate-200">
                                Segment #{index + 1}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => moveStay(index, "up")}
                                  className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={index === formData.stays.length - 1}
                                  onClick={() => moveStay(index, "down")}
                                  className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeStay(index)}
                              className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-md cursor-pointer"
                              title="Remove Accommodation Segment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Destination
                              </label>
                              <input
                                type="text"
                                list="admin-tour-destinations"
                                required
                                placeholder="e.g. Srinagar, Gulmarg, Pahalgam"
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white"
                                value={stay.destination}
                                onChange={(e) => updateStay(index, "destination", e.target.value)}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Nights
                              </label>
                              <input
                                type="number"
                                min="1"
                                required
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white"
                                value={stay.nights}
                                onChange={(e) =>
                                  updateStay(index, "nights", Math.max(1, Number(e.target.value) || 1))
                                }
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Stay Type
                              </label>
                              <select
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white"
                                value={stay.stayType}
                                onChange={(e) => updateStay(index, "stayType", e.target.value)}
                              >
                                <option value="Hotel">Hotel</option>
                                <option value="Houseboat">Houseboat</option>
                                <option value="Homestay">Homestay</option>
                                <option value="Resort">Resort</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Property Assignment
                              </label>
                              <select
                                className={`w-full border rounded-lg p-2 text-sm bg-white ${
                                  isOrphanedSelection ? "border-amber-400 bg-amber-50/50" : "border-slate-300"
                                }`}
                                value={stay.propertyId || ""}
                                onChange={(e) => updateStay(index, "propertyId", e.target.value || null)}
                              >
                                <option value="">To be assigned</option>
                                {matchingProps.length === 0 ? (
                                  <option value="" disabled>
                                    No property available yet — accommodation can remain unassigned
                                  </option>
                                ) : (
                                  matchingProps.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name} ({p.type || "HOTEL"} - {p.location})
                                    </option>
                                  ))
                                )}
                                {isOrphanedSelection && currentSelectedProp && (
                                  <option value={currentSelectedProp.id}>
                                    {currentSelectedProp.name} ({currentSelectedProp.location}) [Location Warning]
                                  </option>
                                )}
                              </select>
                            </div>
                          </div>

                          {isOrphanedSelection && currentSelectedProp && (
                            <p className="text-[11px] text-amber-700 font-medium">
                              ⚠️ Warning: Property &quot;{currentSelectedProp.name}&quot; ({currentSelectedProp.location}) does not match destination &quot;{stay.destination}&quot;. Server validation will reject this assignment.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>

          {/* Dedicated Transports Section */}
          <div className="md:col-span-2 border-t border-slate-200 pt-6 mt-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <div>
                <h4 className="text-lg font-bold text-slate-900">Transport</h4>
                <p className="text-xs text-slate-500 mt-0.5">Define route segments and assign vehicles/drivers.</p>
              </div>
              <button type="button" onClick={addTransport} className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-emerald-700">
                <Plus className="w-4 h-4" /> Add Transport
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.transports.map((t: any, index: number) => (
                <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 bg-white px-3 py-1 rounded-md text-xs border border-slate-200">Segment #{index + 1}</span>
                    <button type="button" onClick={() => removeTransport(index)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Origin</label>
                      <input type="text" className="w-full border rounded-lg p-2 text-sm bg-white" value={t.origin || ""} onChange={(e) => updateTransport(index, "origin", e.target.value)} placeholder="e.g. Srinagar" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Destination</label>
                      <input type="text" className="w-full border rounded-lg p-2 text-sm bg-white" value={t.destination || ""} onChange={(e) => updateTransport(index, "destination", e.target.value)} placeholder="e.g. Gulmarg" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose</label>
                      <input type="text" className="w-full border rounded-lg p-2 text-sm bg-white" value={t.purpose || ""} onChange={(e) => updateTransport(index, "purpose", e.target.value)} placeholder="e.g. Transfer" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle</label>
                      <select className="w-full border rounded-lg p-2 text-sm bg-white" value={t.vehicleId || ""} onChange={(e) => updateTransport(index, "vehicleId", e.target.value || null)}>
                        <option value="">To be assigned</option>
                        {approvedVehicles.map(v => (
                          <option key={v.id} value={v.id}>{v.make} {v.model} ({v.type}) - {v.capacity} pax</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Driver</label>
                      <select className="w-full border rounded-lg p-2 text-sm bg-white" value={t.driverId || ""} onChange={(e) => updateTransport(index, "driverId", e.target.value || null)}>
                        <option value="">To be assigned</option>
                        {activeDrivers.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.vendorName})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dedicated Experiences Section */}
          <div className="md:col-span-2 border-t border-slate-200 pt-6 mt-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <div>
                <h4 className="text-lg font-bold text-slate-900">Experiences</h4>
                <p className="text-xs text-slate-500 mt-0.5">Assign local experiences and activities to this tour.</p>
              </div>
              <button type="button" onClick={addExperience} className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-emerald-700">
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.experiences.map((exp: any, index: number) => (
                <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 bg-white px-3 py-1 rounded-md text-xs border border-slate-200">Activity #{index + 1}</span>
                    <button type="button" onClick={() => removeExperience(index)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Experience</label>
                      <select className="w-full border rounded-lg p-2 text-sm bg-white" value={exp.experienceId || ""} onChange={(e) => updateExperience(index, "experienceId", e.target.value || null)}>
                        <option value="">Select Experience</option>
                        {approvedExperiences.map(e => (
                          <option key={e.id} value={e.id}>{e.title} ({e.destination})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Inclusion Type</label>
                      <select className="w-full border rounded-lg p-2 text-sm bg-white" value={exp.isOptional ? "true" : "false"} onChange={(e) => updateExperience(index, "isOptional", e.target.value === "true")}>
                        <option value="false">Included in Base Price</option>
                        <option value="true">Optional (Add-on)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Day Number</label>
                      <input type="number" min="1" className="w-full border rounded-lg p-2 text-sm bg-white" value={exp.dayNumber || ""} onChange={(e) => updateExperience(index, "dayNumber", e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Destinations Management Area */}
          <div className="md:col-span-2 border-t border-slate-200 pt-6 mt-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
              <div>
                <label className="block text-sm font-bold text-slate-900">
                  Destinations
                </label>
                <p className="text-xs text-slate-500">
                  Select and order the destinations covered by this tour.
                </p>
              </div>
              <a
                href="#destinations"
                onClick={(e) => {
                  e.preventDefault();
                  toast("Manage or add new destinations in the Destinations Tab in Admin.", { icon: "ℹ️" });
                }}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                Manage / Create Destinations <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Destination Search & Select */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <input
                type="text"
                placeholder="Search destination to add..."
                className="flex-1 border rounded-lg p-2 text-sm bg-white"
                value={destSearch}
                onChange={(e) => setDestSearch(e.target.value)}
              />
              <select
                className="border rounded-lg p-2 text-sm bg-white min-w-[200px]"
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !formData.destinations.includes(val)) {
                    setFormData((prev) => ({
                      ...prev,
                      destinations: [...prev.destinations, val],
                    }));
                  }
                  setDestSearch("");
                }}
              >
                <option value="">-- Choose to Add --</option>
                {availableDestinations
                  .filter((d) => !destSearch.trim() || d.name.toLowerCase().includes(destSearch.toLowerCase()))
                  .map((d) => {
                    const isSelected = formData.destinations.includes(d.name);
                    return (
                      <option key={d.id} value={d.name} disabled={isSelected}>
                        {d.name} {isSelected ? "(Selected)" : ""}
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* Selected Destinations Ordered List */}
            {formData.destinations.length === 0 ? (
              <div className="text-xs text-slate-400 italic p-3 border border-dashed rounded-lg bg-slate-50">
                Yet to be assigned. Select at least one destination above.
              </div>
            ) : (
              <div className="space-y-1.5">
                {formData.destinations.map((destName, idx) => (
                  <div
                    key={destName}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800">{destName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          const updated = [...formData.destinations];
                          const [moved] = updated.splice(idx, 1);
                          updated.splice(idx - 1, 0, moved);
                          setFormData((prev) => ({ ...prev, destinations: updated }));
                        }}
                        className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === formData.destinations.length - 1}
                        onClick={() => {
                          const updated = [...formData.destinations];
                          const [moved] = updated.splice(idx, 1);
                          updated.splice(idx + 1, 0, moved);
                          setFormData((prev) => ({ ...prev, destinations: updated }));
                        }}
                        className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            destinations: prev.destinations.filter((_, i) => i !== idx),
                          }));
                        }}
                        className="p-1 text-red-500 hover:text-red-700 ml-1"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Travel Guides Management Area */}
          <div className="md:col-span-2 border-t border-slate-200 pt-6 mt-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  Travel Guides
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Link relevant published travel guides and articles to this tour.
                </p>
              </div>
              <a
                href="#seo"
                onClick={(e) => {
                  e.preventDefault();
                  toast("Create and manage travel guides in the SEO/Blog Tab in Admin.", { icon: "ℹ️" });
                }}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                Manage / Create Travel Guides <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Travel Guide Search & Select */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <input
                type="text"
                placeholder="Search published travel guides..."
                className="flex-1 border rounded-lg p-2 text-sm bg-white"
                value={guideSearch}
                onChange={(e) => setGuideSearch(e.target.value)}
              />
              <select
                className="border rounded-lg p-2 text-sm bg-white max-w-xs"
                value=""
                onChange={(e) => {
                  const selectedId = e.target.value;
                  if (selectedId && !formData.travelGuides.some((g) => g.guideId === selectedId)) {
                    const found = availableTravelGuides.find((g) => g.id === selectedId);
                    if (found) {
                      setFormData((prev) => ({
                        ...prev,
                        travelGuides: [
                          ...prev.travelGuides,
                          {
                            guideId: found.id,
                            title: found.title,
                            slug: found.slug,
                            displayOrder: prev.travelGuides.length + 1,
                          },
                        ],
                      }));
                    }
                  }
                  setGuideSearch("");
                }}
              >
                <option value="">-- Choose Guide to Link --</option>
                {availableTravelGuides
                  .filter((g) => !guideSearch.trim() || g.title?.toLowerCase().includes(guideSearch.toLowerCase()))
                  .map((g) => {
                    const isSelected = formData.travelGuides.some((tg) => tg.guideId === g.id);
                    return (
                      <option key={g.id} value={g.id} disabled={isSelected}>
                        {g.title} {isSelected ? "(Selected)" : ""}
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* Selected Guides List */}
            {formData.travelGuides.length === 0 ? (
              <div className="text-xs text-slate-400 italic p-3 border border-dashed rounded-lg bg-slate-50">
                Yet to be assigned
              </div>
            ) : (
              <div className="space-y-1.5">
                {formData.travelGuides.map((guide, idx) => (
                  <div
                    key={guide.guideId}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 truncate">
                        {guide.title || guide.guideId}
                      </span>
                      {guide.slug && (
                        <span className="text-xs text-slate-400 hidden sm:inline truncate">
                          (/blog/{guide.slug})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          const updated = [...formData.travelGuides];
                          const [moved] = updated.splice(idx, 1);
                          updated.splice(idx - 1, 0, moved);
                          setFormData((prev) => ({ ...prev, travelGuides: updated }));
                        }}
                        className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === formData.travelGuides.length - 1}
                        onClick={() => {
                          const updated = [...formData.travelGuides];
                          const [moved] = updated.splice(idx, 1);
                          updated.splice(idx + 1, 0, moved);
                          setFormData((prev) => ({ ...prev, travelGuides: updated }));
                        }}
                        className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            travelGuides: prev.travelGuides.filter((_, i) => i !== idx),
                          }));
                        }}
                        className="p-1 text-red-500 hover:text-red-700 ml-1"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="md:col-span-2 flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => { setIsAdding(false); if (onExitEdit) onExitEdit(); }} className="px-6 py-2 border rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50">
              {loading ? "Saving..." : "Save Tour"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Tour Packages</h3>
          <p className="text-sm text-slate-500">Manage curated tour packages available to users.</p>
        </div>
        <button onClick={() => handleAddNew()} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-800">
          <Plus className="w-4 h-4" /> Add Tour
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tour Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Category</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Duration</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Price</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tours.map(tour => (
              <tr key={tour.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={tour.images[0] || "https://placehold.co/100x100"} alt="tour" className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{tour.title}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tour.isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {tour.isLive ? "LIVE" : "COMING SOON"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{tour.destinations.join(", ")}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                    {tour.category || "Unassigned"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">{tour.duration}</td>
                <td className="px-6 py-4 text-sm font-bold text-emerald-600">₹{tour.price.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(tour)} className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-500">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(tour.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {tours.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No tour packages found. Click "Add Tour" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={20} onPageChange={setCurrentPage} />
    </div>
  );
}
