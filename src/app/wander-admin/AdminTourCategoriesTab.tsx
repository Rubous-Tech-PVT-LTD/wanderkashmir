"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, FolderSync, Eye, X } from "lucide-react";
import { 
  getTourCategories, 
  createTourCategory, 
  updateTourCategory, 
  deleteTourCategory,
  migrateExistingToursToCategory,
  getToursByCategory
} from "@/actions/admin-tour-categories";
import toast from "react-hot-toast";

export default function AdminTourCategoriesTab({ onEditTour, onAddTour }: { onEditTour?: (tour: any) => void, onAddTour?: (categoryName: string) => void }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  
  const [viewingCategory, setViewingCategory] = useState<any>(null);
  const [categoryTours, setCategoryTours] = useState<any[]>([]);
  const [isLoadingTours, setIsLoadingTours] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const fetchCategories = async () => {
    setLoading(true);
    const data = await getTourCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat?: any) => {
    if (cat) {
      setEditingCat(cat);
      setFormData({
        name: cat.name,
        description: cat.description || "",
      });
    } else {
      setEditingCat(null);
      setFormData({ name: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Name is required");

    const tId = toast.loading(editingCat ? "Updating category..." : "Creating category...");
    
    const res = editingCat 
      ? await updateTourCategory(editingCat.id, formData)
      : await createTourCategory(formData);

    if (res.success) {
      toast.success(editingCat ? "Category updated" : "Category created", { id: tId });
      setIsModalOpen(false);
      fetchCategories();
    } else {
      toast.error(res.error || "Something went wrong", { id: tId });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will remove this category from associated tours.")) return;
    const tId = toast.loading("Deleting category...");
    const res = await deleteTourCategory(id);
    if (res.success) {
      toast.success("Category deleted", { id: tId });
      fetchCategories();
    } else {
      toast.error(res.error || "Failed to delete", { id: tId });
    }
  };

  const handleMigrate = async (catId: string, catName: string) => {
    if (!confirm(`Are you sure you want to move ALL unassigned packages to "${catName}"?`)) return;
    const tId = toast.loading("Migrating packages...");
    const res = await migrateExistingToursToCategory(catId, catName);
    if (res.success) {
      toast.success(res.message || "Migration successful", { id: tId });
      fetchCategories();
    } else {
      toast.error(res.error || "Migration failed", { id: tId });
    }
  };

  const handleViewTours = async (cat: any) => {
    setViewingCategory(cat);
    setIsLoadingTours(true);
    const tours = await getToursByCategory(cat.id);
    setCategoryTours(tours);
    setIsLoadingTours(false);
  };

  const handleDeleteTour = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tour?")) return;
    try {
      const res = await fetch(`/api/admin/tours/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Tour deleted");
        setCategoryTours(categoryTours.filter(t => t.id !== id));
        fetchCategories(); // Refresh category counts
      } else {
        toast.error("Failed to delete tour");
      }
    } catch (e) {
      toast.error("Error deleting tour");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tour Categories</h2>
          <p className="text-sm text-slate-500">Manage categories for tour packages</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600">Name</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Packages Count</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{cat.name}</div>
                  {cat.description && <div className="text-xs text-slate-500">{cat.description}</div>}
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">
                  {cat._count.tours}
                </td>
                <td className="px-6 py-4 flex gap-3">
                  <button onClick={() => handleViewTours(cat)} className="text-indigo-500 hover:text-indigo-700" title="View Packages">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleOpenModal(cat)} className="text-blue-500 hover:text-blue-700" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleMigrate(cat.id, cat.name)}
                    className="text-amber-600 hover:text-amber-800 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded" 
                    title="Migrate existing tours to this category"
                  >
                    <FolderSync className="w-3.5 h-3.5" /> Move Unassigned Here
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                  No categories found. Create "Cultural packages" and "Offbeat" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">{editingCat ? "Edit Category" : "New Category"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  placeholder="e.g. Cultural packages"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 h-24"
                  placeholder="Short description"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingCategory && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Packages in "{viewingCategory.name}"</h3>
                <p className="text-sm text-slate-500">{viewingCategory._count.tours} tours total</p>
              </div>
              <div className="flex gap-3">
                {onAddTour && (
                  <button 
                    onClick={() => {
                      onAddTour(viewingCategory.name);
                      setViewingCategory(null);
                    }} 
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-800 text-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Package
                  </button>
                )}
                <button onClick={() => setViewingCategory(null)} className="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {isLoadingTours ? (
                <div className="text-center text-slate-500 py-8">Loading packages...</div>
              ) : categoryTours.length === 0 ? (
                <div className="text-center text-slate-500 py-8">No packages found in this category.</div>
              ) : (
                <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg">
                  {categoryTours.map(tour => (
                    <li key={tour.id} className="p-4 hover:bg-slate-50 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          {tour.title}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tour.isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {tour.isLive ? "LIVE" : "DRAFT"}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500 mt-1 flex gap-3">
                          <span>{tour.duration}</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-600">₹{tour.price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {onEditTour && (
                          <button onClick={() => onEditTour(tour)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Tour">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDeleteTour(tour.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Tour">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
