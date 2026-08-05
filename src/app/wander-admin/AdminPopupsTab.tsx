"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, AlertTriangle, Monitor, Smartphone, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { 
  getSitePopups, 
  createSitePopup, 
  updateSitePopup, 
  deleteSitePopup, 
  togglePopupActive 
} from "@/actions/site-popups";

export default function AdminPopupsTab() {
  const [popups, setPopups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPopup, setEditingPopup] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    type: "OFFER",
    title: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    displayStyle: "MODAL",
    triggerRule: "IMMEDIATE",
    targetPages: "ALL",
    isActive: false
  });

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    setIsLoading(true);
    const res = await getSitePopups();
    if (res.success && res.popups) {
      setPopups(res.popups);
    } else {
      toast.error("Failed to load popups");
    }
    setIsLoading(false);
  };

  const handleOpenModal = (popup: any = null) => {
    if (popup) {
      setEditingPopup(popup);
      setFormData({
        type: popup.type,
        title: popup.title,
        description: popup.description,
        buttonText: popup.buttonText || "",
        buttonLink: popup.buttonLink || "",
        displayStyle: popup.displayStyle,
        triggerRule: popup.triggerRule,
        targetPages: popup.targetPages,
        isActive: popup.isActive
      });
    } else {
      setEditingPopup(null);
      setFormData({
        type: "OFFER",
        title: "",
        description: "",
        buttonText: "",
        buttonLink: "",
        displayStyle: "MODAL",
        triggerRule: "IMMEDIATE",
        targetPages: "ALL",
        isActive: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    
    setIsSubmitting(true);
    
    let res;
    if (editingPopup) {
      res = await updateSitePopup(editingPopup.id, formData);
    } else {
      res = await createSitePopup(formData);
    }
    
    if (res.success) {
      toast.success(`Popup ${editingPopup ? 'updated' : 'created'} successfully`);
      setIsModalOpen(false);
      fetchPopups();
    } else {
      toast.error(res.error || "An error occurred");
    }
    
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this popup?")) return;
    
    const res = await deleteSitePopup(id);
    if (res.success) {
      toast.success("Popup deleted");
      fetchPopups();
    } else {
      toast.error("Failed to delete popup");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const res = await togglePopupActive(id, !currentStatus);
    if (res.success) {
      toast.success(`Popup is now ${!currentStatus ? 'Active' : 'Inactive'}`);
      fetchPopups(); // Refresh to show other popups deactivated if needed
    } else {
      toast.error("Failed to toggle status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Global Site Popups</h2>
          <p className="text-sm text-slate-500 mt-1">Create and manage alerts, offers, and sign-in prompts.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Popup
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : popups.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No popups yet</h3>
            <p className="text-slate-500 mb-4 max-w-sm mx-auto">Create your first global popup to notify users about offers or important updates.</p>
            <button 
              onClick={() => handleOpenModal()}
              className="text-indigo-600 font-medium hover:underline"
            >
              Create your first popup &rarr;
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Title & Type</th>
                  <th className="px-6 py-4">Target Page</th>
                  <th className="px-6 py-4">Trigger & Style</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {popups.map(popup => (
                  <tr key={popup.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{popup.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{popup.type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                        {popup.targetPages}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{popup.displayStyle}</div>
                      <div className="text-xs text-slate-500">{popup.triggerRule}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(popup.id, popup.isActive)}
                        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                          popup.isActive 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-500 border border-transparent'
                        }`}
                      >
                        {popup.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {popup.isActive ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(popup)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded bg-white hover:bg-indigo-50 shadow-sm border border-slate-200"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(popup.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded bg-white hover:bg-red-50 shadow-sm border border-slate-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">
                {editingPopup ? 'Edit Popup' : 'Create New Popup'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Content Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-medium text-slate-700"
                  >
                    <option value="OFFER">Special Offer (Orange Theme)</option>
                    <option value="SIGN_IN">Sign In Prompt (Blue Theme)</option>
                    <option value="UPDATE">Important Update (Red Theme)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Pages</label>
                  <select 
                    value={formData.targetPages}
                    onChange={(e) => setFormData({...formData, targetPages: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-medium text-slate-700"
                  >
                    <option value="ALL">All Pages</option>
                    <option value="HOMEPAGE">Homepage Only</option>
                    <option value="TOURS">Tour Pages Only</option>
                    <option value="HOTELS">Hotel/Homestay Pages Only</option>
                    <option value="TAXIS">Taxi Pages Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700 border-b pb-2">Popup Content</h4>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-indigo-500 text-slate-800"
                    placeholder="e.g., Summer Special Discount!"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description *</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-indigo-500 text-slate-800 min-h-[100px]"
                    placeholder="e.g., Get 20% off on all hotel bookings this week."
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Button Text (Optional)</label>
                    <input 
                      type="text" 
                      value={formData.buttonText}
                      onChange={(e) => setFormData({...formData, buttonText: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-indigo-500 text-slate-800"
                      placeholder="e.g., Claim Now"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Button Link (Optional)</label>
                    <input 
                      type="text" 
                      value={formData.buttonLink}
                      onChange={(e) => setFormData({...formData, buttonLink: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-indigo-500 text-slate-800"
                      placeholder="e.g., /tours or https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700 border-b pb-2">Appearance & Trigger</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Display Style</label>
                    <select 
                      value={formData.displayStyle}
                      onChange={(e) => setFormData({...formData, displayStyle: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-indigo-500 text-slate-800"
                    >
                      <option value="MODAL">Center Modal (Focus demanding)</option>
                      <option value="TOAST">Corner Toast (Less intrusive)</option>
                      <option value="BANNER">Top Banner (Subtle)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Trigger Rule</label>
                    <select 
                      value={formData.triggerRule}
                      onChange={(e) => setFormData({...formData, triggerRule: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-indigo-500 text-slate-800"
                    >
                      <option value="IMMEDIATE">Immediately on load</option>
                      <option value="DELAY_3S">After 3 Seconds Delay</option>
                      <option value="DELAY_10S">After 10 Seconds Delay</option>
                      <option value="ON_SCROLL">After scrolling 300px</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Set as Active Popup</span>
                </label>
                
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Popup'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
