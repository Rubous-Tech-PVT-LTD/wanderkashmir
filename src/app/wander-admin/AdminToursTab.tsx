import { useState } from "react";
import { Edit2, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminToursTab({ initialTours }: { initialTours: any[] }) {
  const TOUR_CATEGORIES = [
    "Honeymoon", "Family", "Adventure", "Pilgrimage", "Nature",
    "Culture", "Skiing", "Trekking", "Wildlife", "Luxury", "Budget", "Group"
  ];

  const [tours, setTours] = useState(initialTours);
  const [isEditing, setIsEditing] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    duration: "",
    destinations: "",
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
  });

  const handleEdit = (tour: any) => {
    setIsEditing(tour);
    setFormData({
      title: tour.title,
      slug: tour.slug,
      duration: tour.duration,
      destinations: tour.destinations.join(", "),
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
    });
    setIsAdding(true);
  };

  const handleAddNew = () => {
    setIsEditing(null);
    setFormData({
      title: "",
      slug: "",
      duration: "",
      destinations: "",
      price: "",
      originalPrice: "",
      category: "",
      maxPersons: "2",
      images: "",
      overview: "",
      highlights: "",
      inclusions: "",
      exclusions: "",
      itinerary: [],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        destinations: formData.destinations.split(",").map(s => s.trim()).filter(Boolean),
        images: formData.images.split(",").map(s => s.trim()).filter(Boolean),
        highlights: formData.highlights.split(",").map(s => s.trim()).filter(Boolean),
        inclusions: formData.inclusions.split(",").map(s => s.trim()).filter(Boolean),
        exclusions: formData.exclusions.split(",").map(s => s.trim()).filter(Boolean),
        itinerary: formData.itinerary,
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
        router.refresh();
      } else {
        toast.error("Failed to save tour");
      }
    } catch (e) {
      toast.error("Error saving tour");
    } finally {
      setLoading(false);
    }
  };

  const addItineraryDay = () => {
    setFormData(prev => ({
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

  if (isAdding) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold mb-6">{isEditing ? "Edit Tour" : "Add New Tour"}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Title</label>
            <input required type="text" className="w-full border rounded-lg p-2" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Slug (URL friendly)</label>
            <input required type="text" className="w-full border rounded-lg p-2" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Duration</label>
            <input required type="text" className="w-full border rounded-lg p-2" placeholder="e.g. 5 Days / 4 Nights" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2">Category (Select multiple)</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {Array.from(new Set([...TOUR_CATEGORIES, ...customCategories, ...formData.category.split(',').map(c => c.trim()).filter(Boolean)])).map(cat => {
                const isSelected = formData.category.split(',').map(c => c.trim()).includes(cat);
                return (
                  <label key={cat} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                      checked={isSelected}
                      onChange={(e) => {
                        const currentCats = formData.category.split(',').map(c => c.trim()).filter(Boolean);
                        let newCats;
                        if (e.target.checked) {
                          newCats = [...currentCats, cat];
                        } else {
                          newCats = currentCats.filter(c => c !== cat);
                        }
                        setFormData({ ...formData, category: newCats.join(', ') });
                      }}
                    />
                    <span className="text-sm font-medium text-slate-700 select-none">{cat}</span>
                    {!TOUR_CATEGORIES.includes(cat) && (
                      <div className="flex items-center gap-1.5 ml-1" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
                        <button 
                          type="button"
                          onClick={() => {
                            const newName = prompt("Modify custom category name:", cat);
                            if (newName && newName.trim() && newName.trim() !== cat) {
                              const trimmed = newName.trim();
                              setCustomCategories(prev => prev.map(c => c === cat ? trimmed : c));
                              const currentCats = formData.category.split(',').map(c => c.trim()).filter(Boolean);
                              setFormData({ ...formData, category: currentCats.map(c => c === cat ? trimmed : c).join(', ') });
                            }
                          }}
                          className="text-slate-400 hover:text-sky-500"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete custom category "${cat}"?`)) {
                              setCustomCategories(prev => prev.filter(c => c !== cat));
                              const currentCats = formData.category.split(',').map(c => c.trim()).filter(Boolean);
                              setFormData({ ...formData, category: currentCats.filter(c => c !== cat).join(', ') });
                            }
                          }}
                          className="text-slate-400 hover:text-red-500"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </label>
                )
              })}
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                id="customCategoryInput"
                placeholder="Add custom category..." 
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-sky-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim();
                    if (val) {
                      const currentCats = formData.category.split(',').map(c => c.trim()).filter(Boolean);
                      setCustomCategories(prev => Array.from(new Set([...prev, val])));
                      if (!currentCats.includes(val)) {
                        setFormData({ ...formData, category: [...currentCats, val].join(', ') });
                      }
                      e.currentTarget.value = "";
                    }
                  }
                }}
              />
              <button 
                type="button"
                className="bg-sky-50 text-sky-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-sky-100 transition-colors border border-sky-100"
                onClick={(e) => {
                  const input = document.getElementById('customCategoryInput') as HTMLInputElement;
                  const val = input.value.trim();
                  if (val) {
                    const currentCats = formData.category.split(',').map(c => c.trim()).filter(Boolean);
                    setCustomCategories(prev => Array.from(new Set([...prev, val])));
                    if (!currentCats.includes(val)) {
                      setFormData({ ...formData, category: [...currentCats, val].join(', ') });
                    }
                    input.value = "";
                  }
                }}
              >
                Add
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Destinations (comma separated)</label>
            <input required type="text" className="w-full border rounded-lg p-2" placeholder="Srinagar, Gulmarg" value={formData.destinations} onChange={e => setFormData({ ...formData, destinations: e.target.value })} />
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
              <button type="button" onClick={addItineraryDay} className="flex items-center gap-1 bg-sky-100 text-sky-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-sky-200 transition-colors">
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
          
          <div className="md:col-span-2 flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 border rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
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
        <button onClick={handleAddNew} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-800">
          <Plus className="w-4 h-4" /> Add Tour
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tour Name</th>
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
                      <p className="font-bold text-slate-900">{tour.title}</p>
                      <p className="text-xs text-slate-500">{tour.destinations.join(", ")}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">{tour.duration}</td>
                <td className="px-6 py-4 text-sm font-bold text-emerald-600">₹{tour.price.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(tour)} className="p-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100">
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
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  No tour packages found. Click "Add Tour" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
