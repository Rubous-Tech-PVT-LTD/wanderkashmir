"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, UploadCloud, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminExperiencesTab() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    slug: "",
    description: "",
    destination: "",
    duration: "",
    basePrice: "",
    status: "ACTIVE",
    images: [] as string[]
  });

  const fetchExperiences = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/experiences");
      const data = await res.json();
      if (data.data) {
        setExperiences(data.data);
      }
    } catch (e) {
      toast.error("Failed to fetch experiences");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const resetForm = () => {
    setFormData({
      id: "",
      title: "",
      slug: "",
      description: "",
      destination: "",
      duration: "",
      basePrice: "",
      status: "ACTIVE",
      images: []
    });
    setIsEditing(false);
  };

  const openModal = (experience?: any) => {
    if (experience) {
      setFormData({
        id: experience.id,
        title: experience.title,
        slug: experience.slug,
        description: experience.description || "",
        destination: experience.destination,
        duration: experience.duration || "",
        basePrice: experience.basePrice ? String(experience.basePrice) : "",
        status: experience.status,
        images: experience.images || []
      });
      setIsEditing(true);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditing 
        ? `/api/admin/experiences/${formData.id}`
        : `/api/admin/experiences`;
      
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success(isEditing ? "Experience updated" : "Experience created");
        setIsModalOpen(false);
        fetchExperiences();
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Failed to save experience");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;
    try {
      const res = await fetch(`/api/admin/experiences/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Experience deleted");
        fetchExperiences();
      } else {
        toast.error(data.error || "Failed to delete experience");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading experiences...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Experiences</h2>
          <p className="text-slate-500">Manage reusable experiences, activities, and attractions.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Experience
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
              <th className="p-4">Title</th>
              <th className="p-4">Destination</th>
              <th className="p-4">Base Price</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {experiences.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No experiences found. Create one above.</td>
              </tr>
            ) : (
              experiences.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{exp.title}</td>
                  <td className="p-4 text-slate-600">{exp.destination}</td>
                  <td className="p-4 text-slate-600">{exp.basePrice ? `₹${exp.basePrice}` : "-"}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${exp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => openModal(exp)}
                      className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(exp.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-900">{isEditing ? "Edit Experience" : "Add Experience"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Title <span className="text-red-500">*</span></label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2" placeholder="e.g. Shikara Ride on Dal Lake" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Slug <span className="text-red-500">*</span></label>
                  <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2" placeholder="e.g. shikara-ride-dal-lake" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Destination <span className="text-red-500">*</span></label>
                  <input required type="text" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2" placeholder="e.g. Srinagar" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Duration</label>
                  <input type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2" placeholder="e.g. 1 Hour" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Base Price (₹)</label>
                  <input type="number" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2" placeholder="e.g. 800" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2" placeholder="Describe the experience..." />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors">
                  {isEditing ? "Save Changes" : "Create Experience"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
