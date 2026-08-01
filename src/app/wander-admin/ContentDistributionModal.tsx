"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, RefreshCw, Wand2, FileText, Send, Loader2, Save, Play, Copy, Trash2, Check } from "lucide-react";
import { getContentAssets, updateContentAssetStatus, updateContentAsset, deleteContentAsset, duplicateContentAsset } from "@/actions/admin-content";

const PLATFORMS = ['instagram', 'facebook', 'linkedin', 'reddit', 'twitter', 'pinterest', 'email', 'whatsapp'];

export default function ContentDistributionModal({ 
  page, 
  onClose 
}: { 
  page: any; 
  onClose: () => void 
}) {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generationStatuses, setGenerationStatuses] = useState<Record<string, string>>({});
  const [activePlatform, setActivePlatform] = useState<string>('instagram');
  const [editingContent, setEditingContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAssets();
  }, [page.id]);

  const fetchAssets = async () => {
    setLoading(true);
    const res = await getContentAssets(page.id);
    if (res.success) {
      setAssets(res.assets || []);
    }
    setLoading(false);
  };

  const getAssetForPlatform = (platform: string) => {
    return assets.find(a => a.platform === platform);
  };

  const generatePlatform = async (platform: string) => {
    setGenerationStatuses(prev => ({ ...prev, [platform]: 'Generating' }));
    try {
      const res = await fetch("/api/admin/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seoPageId: page.id, platform }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGenerationStatuses(prev => ({ ...prev, [platform]: 'Completed' }));
        // Replace or add the new asset in state
        setAssets(prev => {
          const filtered = prev.filter(a => a.platform !== platform);
          return [data.asset, ...filtered];
        });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error(err);
      setGenerationStatuses(prev => ({ ...prev, [platform]: 'Failed' }));
    }
  };

  const generateAll = async () => {
    const statuses: Record<string, string> = {};
    PLATFORMS.forEach(p => statuses[p] = 'Queued');
    setGenerationStatuses(statuses);

    // Fire all requests asynchronously (they will resolve independently)
    PLATFORMS.forEach(platform => {
      generatePlatform(platform);
    });
  };

  const handleSave = async (assetId: string) => {
    setSaving(true);
    const res = await updateContentAsset(assetId, editingContent);
    if (res.success) {
      setAssets(prev => prev.map(a => a.id === assetId ? res.asset : a));
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleStatusChange = async (assetId: string, status: string) => {
    const res = await updateContentAssetStatus(assetId, status);
    if (res.success) {
      setAssets(prev => prev.map(a => a.id === assetId ? { ...a, publishStatus: status } : a));
    }
  };

  const handleDelete = async (assetId: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      const res = await deleteContentAsset(assetId);
      if (res.success) {
        setAssets(prev => prev.filter(a => a.id !== assetId));
      }
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Content Distribution Hub</h2>
            <p className="text-sm text-slate-500 mt-1">Generate social assets for: <span className="font-semibold">{page.title}</span></p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={generateAll}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl shadow-sm transition-all font-medium"
            >
              <Wand2 className="w-4 h-4" />
              Generate All Platforms
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar - Platforms */}
          <div className="w-64 bg-slate-50 border-r border-slate-100 overflow-y-auto">
            <div className="p-4 space-y-2">
              {PLATFORMS.map(platform => {
                const asset = getAssetForPlatform(platform);
                const genStatus = generationStatuses[platform];
                
                return (
                  <button
                    key={platform}
                    onClick={() => setActivePlatform(platform)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      activePlatform === platform 
                        ? 'bg-white shadow-sm border border-slate-200 ring-1 ring-slate-200' 
                        : 'hover:bg-slate-200/50 border border-transparent'
                    }`}
                  >
                    <span className="capitalize font-medium text-slate-700">{platform}</span>
                    
                    {/* Status Indicators */}
                    {genStatus === 'Generating' ? (
                      <Loader2 className="w-4 h-4 text-[#0284c7] animate-spin" />
                    ) : genStatus === 'Queued' ? (
                      <span className="text-xs font-medium text-slate-400">Queued</span>
                    ) : genStatus === 'Failed' ? (
                      <span className="w-2 h-2 rounded-full bg-red-500" title="Failed"></span>
                    ) : asset ? (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        asset.publishStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                        asset.publishStatus === 'Published' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700' // Draft
                      }`}>
                        {asset.publishStatus}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white overflow-y-auto p-6">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 text-[#0284c7] animate-spin" />
              </div>
            ) : (
              (() => {
                const activeAsset = getAssetForPlatform(activePlatform);
                const genStatus = generationStatuses[activePlatform];

                return (
                  <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800 capitalize">{activePlatform} Content</h3>
                      
                      <div className="flex gap-2">
                        {activeAsset && !isEditing && (
                          <>
                            <button onClick={() => { setEditingContent(activeAsset.content || ""); setIsEditing(true); }} className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1">
                              Edit Text
                            </button>
                            <button onClick={() => handleCopy(activeAsset.content || "", activeAsset.id)} className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1">
                              {copiedId === activeAsset.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                              Copy
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => generatePlatform(activePlatform)}
                          disabled={genStatus === 'Generating'}
                          className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${genStatus === 'Generating' ? 'animate-spin' : ''}`} />
                          Regenerate
                        </button>
                      </div>
                    </div>

                    {genStatus === 'Generating' ? (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Wand2 className="w-12 h-12 mb-4 animate-pulse text-[#0284c7]" />
                        <p>AI is crafting content for {activePlatform}...</p>
                      </div>
                    ) : activeAsset ? (
                      <div className="space-y-6">
                        {/* Status Bar */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-500">Status:</span>
                            <select 
                              value={activeAsset.publishStatus}
                              onChange={(e) => handleStatusChange(activeAsset.id, e.target.value)}
                              className="text-sm border-slate-200 rounded-md font-medium"
                            >
                              <option value="Draft">Draft</option>
                              <option value="Approved">Approved</option>
                              <option value="Scheduled">Scheduled</option>
                              <option value="Published">Published</option>
                            </select>
                          </div>
                          <button onClick={() => handleDelete(activeAsset.id)} className="text-red-500 hover:text-red-700 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Content Viewer/Editor */}
                        {isEditing ? (
                          <div className="space-y-4">
                            <textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="w-full h-96 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0284c7] focus:border-transparent font-mono text-sm"
                            />
                            <div className="flex justify-end gap-3">
                              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                              <button onClick={() => handleSave(activeAsset.id)} disabled={saving} className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg flex items-center gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 whitespace-pre-wrap font-mono text-sm overflow-x-auto text-slate-800">
                            {activeAsset.content}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center">
                        <FileText className="w-12 h-12 mb-4 opacity-20" />
                        <p>No content generated for {activePlatform} yet.</p>
                        <button 
                          onClick={() => generatePlatform(activePlatform)}
                          className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                        >
                          Generate Now
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
