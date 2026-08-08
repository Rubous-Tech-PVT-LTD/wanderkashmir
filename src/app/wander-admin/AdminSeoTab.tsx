"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Globe, Search, Link as LinkIcon, Wand2, RefreshCw, PenTool } from "lucide-react";
import Link from "next/link";
import { triggerSeoGeneration, triggerBlogGeneration } from "@/actions/admin-seo";
import ContentDistributionModal from "./ContentDistributionModal";
import { Share2 } from "lucide-react";

export default function AdminSeoTab() {
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDistributionPage, setActiveDistributionPage] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    id: "",
    slug: "",
    type: "TAXI",
    title: "",
    description: "",
    h1Heading: "",
    content: "",
    imageUrl: "",
    faqs: [] as { question: string; answer: string }[],
  });

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/seo-pages");
      const data = await res.json();
      setPages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch SEO pages", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);


  const handleAddFaq = () => {
    setFormData({ ...formData, faqs: [...formData.faqs, { question: "", answer: "" }] });
  };

  const handleUpdateFaq = (index: number, field: "question" | "answer", value: string) => {
    const newFaqs = [...formData.faqs];
    newFaqs[index][field] = value;
    setFormData({ ...formData, faqs: newFaqs });
  };

  const handleRemoveFaq = (index: number) => {
    setFormData({ ...formData, faqs: formData.faqs.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditing ? `/api/admin/seo-pages/${formData.id}` : "/api/admin/seo-pages";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(`Page ${isEditing ? "updated" : "created"} successfully!`);
        setIsEditing(false);
        setFormData({
          id: "", slug: "", type: "TAXI", title: "", description: "",
          h1Heading: "", content: "", imageUrl: "", faqs: []
        });
        fetchPages();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save page");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleEdit = (page: any) => {
    setFormData({
      id: page.id,
      slug: page.slug,
      type: page.type,
      title: page.title,
      description: page.description || "",
      h1Heading: page.h1Heading,
      content: page.content || "",
      imageUrl: page.imageUrl || "",
      faqs: page.faqs || [],
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this SEO page?")) return;
    try {
      const res = await fetch(`/api/admin/seo-pages/${id}`, { method: "DELETE" });
      if (res.ok) fetchPages();
      else alert("Failed to delete");
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerateAutomation = async () => {
    const topic = topicInput.trim();
    if (!confirm(`This will trigger the AI to generate a new SEO Route page right now${topic ? ` for "${topic}"` : ''}. Proceed?`)) return;
    setIsGenerating(true);
    try {
      const res = await triggerSeoGeneration(topic);
      if (res.success) {
        alert("Magic AI Generation successful! A new SEO Route page has been created.");
        fetchPages();
      } else {
        alert("Failed to run generation: " + (res.error || "Unknown error"));
      }
    } catch (error: any) {
      alert("An error occurred while generating: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateBlog = async () => {
    const topic = topicInput.trim();
    if (!confirm(`This will trigger the AI to write a new Travel Blog Article right now${topic ? ` for "${topic}"` : ''}. Proceed?`)) return;
    setIsGenerating(true);
    try {
      const res = await triggerBlogGeneration(topic);
      if (res.success) {
        alert("Magic AI Blog Generation successful! A new Blog has been published.");
        fetchPages();
      } else {
        alert("Failed to run blog generation: " + (res.error || "Unknown error"));
      }
    } catch (error: any) {
      alert("An error occurred while generating blog: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredPages = pages.filter(p => 
    (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.slug || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
  const paginatedPages = filteredPages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">SEO Landing Pages</h2>
          <p className="text-sm text-slate-500">Manage dynamic SEO routes. Pages load instantly with Next.js ISR.</p>
        </div>
        {!isEditing && (
          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Topic/Keyword (Optional)"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] w-64"
            />
            <button
              onClick={handleGenerateAutomation}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-[#f97316] text-white px-4 py-2.5 rounded-xl hover:bg-[#ea580c] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium"
            >
              <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? "Generating..." : "Generate SEO Page"}
            </button>
            <button
              onClick={handleGenerateBlog}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium"
            >
              <PenTool className={`w-4 h-4 ${isGenerating ? 'animate-bounce' : ''}`} />
              {isGenerating ? "Writing..." : "Generate Blog Article"}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-[#f97316] text-white rounded-lg flex items-center gap-2 hover:bg-[#ea580c] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Page
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Page Type</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]"
              >
                <option value="TAXI">Taxi Route</option>
                <option value="HOMESTAY">Homestay Location</option>
                <option value="TOUR">Tour Package</option>
                <option value="BLOG">Travel Blog Article</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL Slug</label>
              <input
                required
                type="text"
                placeholder="e.g. srinagar-to-gulmarg"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SEO Meta Title</label>
            <input
              required
              type="text"
              placeholder="e.g. Book Srinagar to Gulmarg Taxi at Best Price"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SEO Meta Description</label>
            <textarea
              rows={2}
              placeholder="Write a compelling meta description for Google search results..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Page H1 Heading</label>
            <input
              required
              type="text"
              placeholder="e.g. Reliable Srinagar to Gulmarg Taxi Service"
              value={formData.h1Heading}
              onChange={(e) => setFormData({ ...formData, h1Heading: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Page Content (Markdown / Text)</label>
            <textarea
              rows={5}
              placeholder="Write detailed content about this route or location..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hero Image URL (Optional)</label>
            <input
              type="text"
              placeholder="https://res.cloudinary.com/..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f97316]"
            />
          </div>

          {/* FAQs Section */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-bold text-slate-800">Frequently Asked Questions (FAQs)</h3>
              <button
                type="button"
                onClick={handleAddFaq}
                className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
              >
                + Add FAQ
              </button>
            </div>
            <div className="space-y-4">
              {formData.faqs.map((faq, index) => (
                <div key={index} className="flex gap-2 items-start bg-slate-50 p-3 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <input
                      required
                      type="text"
                      placeholder="Question"
                      value={faq.question}
                      onChange={(e) => handleUpdateFaq(index, "question", e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none text-sm"
                    />
                    <textarea
                      required
                      rows={2}
                      placeholder="Answer"
                      value={faq.answer}
                      onChange={(e) => handleUpdateFaq(index, "answer", e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({ id: "", slug: "", type: "TAXI", title: "", description: "", h1Heading: "", content: "", imageUrl: "", faqs: [] });
              }}
              className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors font-medium shadow-sm"
            >
              {formData.id ? "Update Page" : "Publish Page"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading pages...</div>
          ) : pages.length === 0 ? (
            <div className="p-12 text-center">
              <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-800">No SEO Pages Found</h3>
              <p className="text-slate-500 mt-1">Create your first dynamic landing page to start ranking on Google.</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by title or slug..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
                    <th className="p-4">Type</th>
                    <th className="p-4">Page Title</th>
                    <th className="p-4">Route Slug</th>
                    <th className="p-4">FAQs</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {paginatedPages.map((page) => (
                    <tr key={page.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          page.type === "TAXI" ? "bg-yellow-100 text-yellow-800" :
                          page.type === "HOMESTAY" ? "bg-green-100 text-green-800" :
                          page.type === "BLOG" ? "bg-purple-100 text-purple-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {page.type}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-800">{page.title}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <LinkIcon className="w-3.5 h-3.5" />
                          <span>/{(page.type || "").toLowerCase() === "taxi" ? "taxis" : (page.type || "").toLowerCase() === "homestay" ? "homestays" : (page.type || "").toLowerCase() === "blog" ? "blog" : "tours"}/{page.slug}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500">
                        {page.faqs ? (page.faqs as any[]).length : 0} items
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Link 
                          href={`/${(page.type || "").toLowerCase() === "taxi" ? "taxis" : (page.type || "").toLowerCase() === "homestay" ? "homestays" : (page.type || "").toLowerCase() === "blog" ? "blog" : "tours"}/${page.slug}`}
                          target="_blank"
                          className="inline-flex p-2 text-slate-400 hover:text-[#f97316] hover:bg-[#f97316]/10 rounded-lg transition-colors"
                          title="View Live Page"
                        >
                          <Globe className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleEdit(page)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActiveDistributionPage(page)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Generate Social Content"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
                  <div className="text-sm text-slate-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPages.length)} of {filteredPages.length} entries
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
          )}
        </div>
      )}

      {activeDistributionPage && (
        <ContentDistributionModal 
          page={activeDistributionPage} 
          onClose={() => setActiveDistributionPage(null)} 
        />
      )}
    </div>
  );
}
