import { useState } from "react";
import { Edit2, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminToursTab({ initialTours }: { initialTours: any[] }) {
  const [tours, setTours] = useState(initialTours);
  const [isEditing, setIsEditing] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
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
        destinations: formData.destinations.split(",").map(s => s.trim()),
        images: formData.images.split(",").map(s => s.trim()),
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
          <div>
            <label className="block text-sm font-semibold mb-1">Category</label>
            <input required type="text" className="w-full border rounded-lg p-2" placeholder="e.g. Family, Adventure" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Destinations (comma separated)</label>
            <input required type="text" className="w-full border rounded-lg p-2" placeholder="Srinagar, Gulmarg" value={formData.destinations} onChange={e => setFormData({ ...formData, destinations: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Images URLs (comma separated)</label>
            <input required type="text" className="w-full border rounded-lg p-2" value={formData.images} onChange={e => setFormData({ ...formData, images: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Price (₹)</label>
            <input required type="number" className="w-full border rounded-lg p-2" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Original Price (optional)</label>
            <input type="number" className="w-full border rounded-lg p-2" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Overview</label>
            <textarea className="w-full border rounded-lg p-2 h-32" value={formData.overview} onChange={e => setFormData({ ...formData, overview: e.target.value })} />
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
