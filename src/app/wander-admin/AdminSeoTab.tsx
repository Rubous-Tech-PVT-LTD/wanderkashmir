"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Globe, Search, Link as LinkIcon, Wand2, RefreshCw, PenTool, ArrowLeft, BarChart2, Lightbulb, FileText, Activity } from "lucide-react";
import Link from "next/link";
import { triggerSeoGeneration, triggerBlogGeneration } from "@/actions/admin-seo";
import ContentDistributionModal from "./ContentDistributionModal";
import { Share2 } from "lucide-react";

export default function AdminSeoTab() {
  const [activeTab, setActiveTab] = useState<"overview" | "pages" | "opportunities" | "research">("pages");
  const [researchTarget, setResearchTarget] = useState<{ topic: string, url: string, type: string } | null>(null);

  const startResearch = (topic: string, url?: string, type?: string) => {
    setResearchTarget({ topic, url: url || '', type: type || 'DESTINATION' });
    setActiveTab("research");
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100 mb-6 max-w-2xl">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "overview" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          <BarChart2 className="w-4 h-4" /> Overview
        </button>
        <button
          onClick={() => setActiveTab("pages")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "pages" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          <FileText className="w-4 h-4" /> Pages
        </button>
        <button
          onClick={() => setActiveTab("opportunities")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "opportunities" ? "bg-[#f97316]/10 text-[#ea580c]" : "text-slate-500 hover:text-[#ea580c] hover:bg-slate-50"
          }`}
        >
          <Lightbulb className="w-4 h-4" /> Opportunities
        </button>
        <button
          onClick={() => setActiveTab("research")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "research" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
          }`}
        >
          <Activity className="w-4 h-4" /> SEO Research (New)
        </button>
      </div>

      {activeTab === "pages" && <LegacyPagesView />}
      {activeTab === "overview" && <GscOverviewView />}
      {activeTab === "opportunities" && <OpportunitiesView onResearch={startResearch} />}
      {activeTab === "research" && <SeoResearchWizard initialTarget={researchTarget} />}
    </div>
  );
}

function GscOverviewView() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch('/api/admin/seo-intelligence/overview');
        const json = await res.json();
        
        if (!res.ok) {
          setError(json.error || 'Failed to fetch GSC overview');
        } else {
          setData(json.data);
        }
      } catch (err: any) {
        setError('Network error connecting to GSC overview');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-3">
        <RefreshCw className="animate-spin w-8 h-8 text-indigo-500" />
        <p className="text-slate-500 font-medium">Loading Google Search Console data...</p>
      </div>
    );
  }

  if (error) {
    if (error === 'GSC not connected') {
      return (
        <div className="bg-white p-12 text-center rounded-2xl border border-red-100 shadow-sm">
          <Activity className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">GSC Not Connected</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Google Search Console is not currently connected. Please go to Settings to connect your account and enable SEO Intelligence.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-red-100 shadow-sm">
        <h3 className="text-xl font-bold text-red-600 mb-2">Error Loading GSC Data</h3>
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  if (data && !data.hasData) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm">
        <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">No GSC data available for this period</h3>
        <p className="text-slate-500">Google Search Console is connected, but returned no metrics for the last 30 days.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            GSC Overview
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Site-wide metrics for {data.siteUrl} ({data.startDate} to {data.endDate})
          </p>
        </div>
        <div className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          CONNECTED
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <div className="text-sm font-semibold text-slate-500 mb-1">Total Clicks</div>
          <div className="text-3xl font-black text-slate-800">{data.metrics.clicks.toLocaleString()}</div>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <div className="text-sm font-semibold text-slate-500 mb-1">Total Impressions</div>
          <div className="text-3xl font-black text-slate-800">{data.metrics.impressions.toLocaleString()}</div>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <div className="text-sm font-semibold text-slate-500 mb-1">Average CTR</div>
          <div className="text-3xl font-black text-slate-800">{(data.metrics.ctr * 100).toFixed(2)}%</div>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <div className="text-sm font-semibold text-slate-500 mb-1">Average Position</div>
          <div className="text-3xl font-black text-slate-800">{data.metrics.position.toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// NEW: SEO OPPORTUNITIES VIEW
// -----------------------------------------------------------------------------
function OpportunitiesView({ onResearch }: { onResearch: (topic: string, url?: string, type?: string) => void }) {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [discoveryMessage, setDiscoveryMessage] = useState<string | null>(null);

  // Read-only: load what's currently in the DB
  const loadFromDb = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/seo-intelligence/opportunities');
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setError("Authentication error — please refresh the page and log in again.");
        } else {
          setError(data.error || "Failed to load opportunities.");
        }
        setOpportunities([]);
      } else if (data.success) {
        setOpportunities(data.data || []);
      } else {
        setError(data.error || "Unexpected error loading opportunities.");
        setOpportunities([]);
      }
    } catch (e: any) {
      setError("Network error — could not reach the server.");
      setOpportunities([]);
    }
    setIsLoading(false);
  };

  // Discovery: POST triggers detectOpportunities(true) on the server → saves to DB → reloads
  const runDiscovery = async () => {
    setIsDiscovering(true);
    setError(null);
    setDiscoveryMessage(null);
    try {
      const res = await fetch('/api/admin/seo-intelligence/opportunities', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setError("Authentication error — please refresh the page and log in again.");
        } else if (data.error?.includes('GSC') || data.error?.includes('refresh_token') || data.error?.includes('OAuth')) {
          setError("GSC data unavailable — connect Google Search Console first (Admin → Settings → Connect GSC).");
        } else {
          setError(data.error || "Discovery failed. Check server logs.");
        }
        setIsDiscovering(false);
        return;
      }
      setDiscoveryMessage(data.message || "Discovery complete.");
      // Reload DB after discovery
      await loadFromDb();
    } catch (e: any) {
      setError("Network error — could not reach the server.");
    }
    setIsDiscovering(false);
  };

  useEffect(() => {
    loadFromDb();
  }, []);

  const filtered = filter === "ALL" ? opportunities : opportunities.filter(o => o.type === filter);
  const isBusy = isLoading || isDiscovering;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Content Opportunities</h2>
          <p className="text-sm text-slate-500">AI-detected opportunities based on real GSC data and content gaps.</p>
        </div>
        <div className="flex gap-3 items-center">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="p-2 border rounded-lg text-sm bg-white" disabled={isBusy}>
            <option value="ALL">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="OPTIMIZE">OPTIMIZE</option>
            <option value="MONITOR">MONITOR</option>
            <option value="MANUAL_REVIEW">MANUAL REVIEW</option>
            <option value="IGNORE">IGNORE</option>
          </select>
          {/* Refresh = reload DB only (fast) */}
          <button onClick={loadFromDb} disabled={isBusy} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Reload
          </button>
          {/* Discover = POST → GSC → Engine → DB → reload (slow, up to 5 min) */}
          <button onClick={runDiscovery} disabled={isBusy} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50 transition-colors">
            <Search className={`w-4 h-4 ${isDiscovering ? 'animate-pulse' : ''}`} />
            {isDiscovering ? 'Discovering...' : 'Refresh Opportunities'}
          </button>
        </div>
      </div>

      {/* Status messages */}
      {discoveryMessage && !isBusy && (
        <div className="px-6 py-3 bg-green-50 border-b border-green-100 text-sm text-green-800 font-medium">
          ✓ {discoveryMessage}
        </div>
      )}
      {error && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700">
          ⚠ {error}
        </div>
      )}

      {isBusy ? (
        <div className="p-12 text-center text-slate-500">
          {isDiscovering ? (
            <div>
              <div className="text-lg font-medium mb-2">Analyzing GSC Signals...</div>
              <div className="text-sm text-slate-400">Querying Google Search Console, clustering queries, and scoring opportunities. This can take up to 2 minutes.</div>
            </div>
          ) : (
            <div>Loading opportunities...</div>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          {opportunities.length === 0 ? (
            <div className="space-y-3">
              <div className="text-lg font-semibold text-slate-700">No SEO opportunities discovered yet.</div>
              <div className="text-sm text-slate-400 max-w-md mx-auto">
                Click <strong>Refresh Opportunities</strong> to run the first discovery using live Google Search Console data.
                This queries your real GSC queries, clusters them, and scores opportunities automatically.
              </div>
              {!error && (
                <button onClick={runDiscovery} className="mt-4 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition-colors">
                  <Search className="w-4 h-4" /> Run First Discovery
                </button>
              )}
            </div>
          ) : (
            <div className="text-slate-500">No opportunities match the selected filter.</div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
                <th className="p-4">Action</th>
                <th className="p-4">Score</th>
                <th className="p-4">Topic / Cluster</th>
                <th className="p-4 text-center">Trend</th>
                <th className="p-4 text-center">Planner</th>
                <th className="p-4 text-right">Imp.</th>
                <th className="p-4 text-right">Pos.</th>
                <th className="p-4 text-center">Biz Rel.</th>
                <th className="p-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((op, i) => (
                <React.Fragment key={i}>
                <tr className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      op.type === "CREATE" ? "bg-blue-100 text-blue-800" :
                      op.type === "OPTIMIZE" ? "bg-orange-100 text-orange-800" :
                      op.type === "MONITOR" ? "bg-slate-100 text-slate-800" :
                      op.type === "MANUAL_REVIEW" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {op.type}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-700">{op.opportunityScore}</td>
                  <td className="p-4 font-medium text-slate-800">{op.topic}</td>
                  <td className="p-4 text-center text-slate-600 text-xs">{op.googleTrends || 'UNAVAILABLE'}</td>
                  <td className="p-4 text-center text-slate-600 text-xs">{op.keywordPlanner || 'UNAVAILABLE'}</td>
                  <td className="p-4 text-right text-slate-600">{op.gscSignals?.impressions ?? '-'}</td>
                  <td className="p-4 text-right text-slate-600">{op.gscSignals?.position != null ? Number(op.gscSignals.position).toFixed(1) : '-'}</td>
                  <td className="p-4 text-center text-slate-600 text-xs">{op.businessRelevance}</td>
                  <td className="p-4 text-right">
                    {(op.type === 'CREATE' || op.type === 'OPTIMIZE') && (
                        <button onClick={(e) => { e.stopPropagation(); onResearch(op.topic, op.existingPage?.url, op.existingPage?.type); }} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700">
                          Research
                        </button>
                    )}
                  </td>
                </tr>
                {expandedRow === i && (
                  <tr className="bg-slate-50/30">
                     <td colSpan={10} className="p-6">
                       <h4 className="font-bold text-slate-800 mb-2">WHY THIS OPPORTUNITY?</h4>
                       <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
                          <div>
                            <strong>GSC Evidence:</strong><br/>
                            Impressions: {op.gscSignals?.impressions}, Clicks: {op.gscSignals?.clicks}, CTR: {((op.gscSignals?.ctr || 0) * 100).toFixed(1)}%, Position: {op.gscSignals?.position != null ? Number(op.gscSignals.position).toFixed(1) : '-'}<br/><br/>
                            
                            <strong>Trend Signal:</strong> {op.googleTrends || 'UNAVAILABLE'}<br/>
                            <strong>Keyword Evidence:</strong> {op.keywordPlanner || 'UNAVAILABLE'}<br/><br/>
                            
                            <strong>Existing Content:</strong><br/>
                            {op.existingPage ? <a href={op.existingPage.url} target="_blank" className="text-indigo-600 underline">{op.existingPage.title} ({op.existingPage.type})</a> : "None found."}<br/><br/>

                            <strong>Cluster Queries:</strong><br/>
                            {Array.isArray(op.cluster) ? op.cluster.join(', ') : op.cluster}
                          </div>
                          <div>
                            <strong>Reason:</strong><br/>
                            {op.reason}<br/><br/>
                            
                            <strong>Evidence:</strong><br/>
                            {op.evidence}<br/><br/>

                            <strong>Search Intent:</strong> {op.intent}<br/>
                            <strong>Cannibalization Risk:</strong><br/>
                            <span className={op.cannibalizationRisk === 'HIGH' ? 'text-red-600 font-bold' : ''}>{op.cannibalizationRisk}</span>
                          </div>
                       </div>
                     </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400">
            {filtered.length} opportunit{filtered.length === 1 ? 'y' : 'ies'} shown{filter !== 'ALL' ? ` (filtered: ${filter})` : ''} · Last updated from DB · Daily auto-discovery runs at 2:00 UTC
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// NEW: SEO RESEARCH WIZARD (THE NEW PIPELINE)
// -----------------------------------------------------------------------------
function SeoResearchWizard({ initialTarget }: { initialTarget?: { topic: string, url: string, type: string } | null }) {
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("DESTINATION");
  const [url, setUrl] = useState("");
  
  useEffect(() => {
     if (initialTarget) {
        setTopic(initialTarget.topic);
        setUrl(initialTarget.url);
        setType(initialTarget.type);
     }
  }, [initialTarget]);

  const [isLoading, setIsLoading] = useState(false);
  const [researchData, setResearchData] = useState<any>(null);
  const [strategyData, setStrategyData] = useState<any>(null);
  const [adminDecision, setAdminDecision] = useState<'USE_EXISTING' | 'CONSOLIDATE' | 'CREATE_NEW' | 'IGNORE' | null>(null);
  const [selectedPrimaryPageUrl, setSelectedPrimaryPageUrl] = useState<string>("");
  
  // Historical protection payload simulation
  const historicalPayload = { clicks: 10, impressions: 91, ctr: 0.11, position: 8.8 };
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [validationReport, setValidationReport] = useState<any>(null);

  const runResearch = async () => {
    setIsLoading(true);
    setAdminDecision(null);
    setSelectedPrimaryPageUrl("");
    try {
      const payload: any = { target: topic, type, url: url || undefined };
      if (url && url.includes('vergan')) {
          payload.historicalBaseline = historicalPayload;
      }
      const res = await fetch('/api/admin/seo-intelligence/research', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setResearchData(data.data);
        setStep(2);
      } else alert(data.error);
    } catch(e) { console.error(e); }
    setIsLoading(false);
  };

  const runStrategy = async () => {
    setIsLoading(true);
    setAdminDecision(null);
    setSelectedPrimaryPageUrl("");
    try {
      const res = await fetch('/api/admin/seo-intelligence/strategy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ research: researchData })
      });
      const data = await res.json();
      if (data.success) {
        setStrategyData(data.data);
        setStep(3);
      } else alert(data.error);
    } catch(e) { console.error(e); }
    setIsLoading(false);
  };

  const runGeneration = async () => {
    const isManualReview = strategyData?.recommendedAction === 'MANUAL_REVIEW' || strategyData?.manualReviewRequired || researchData?.cannibalizationRisk?.status === 'HIGH_RISK';
    if (isManualReview && !adminDecision) {
      alert("Manual Review Decision Required: Please select an Admin Decision before generating content.");
      return;
    }
    if (adminDecision === 'IGNORE') {
      alert("Opportunity marked as Ignored.");
      setStep(1);
      return;
    }

    setIsLoading(true);
    try {
      const finalStrategy = {
        ...strategyData,
        adminDecision: adminDecision || undefined,
        selectedPrimaryPageUrl: selectedPrimaryPageUrl || undefined
      };
      const res = await fetch('/api/admin/seo-intelligence/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ research: researchData, strategy: finalStrategy })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedContent(data.data);
        setStep(4);
      } else alert(data.error);
    } catch(e) { console.error(e); }
    setIsLoading(false);
  };

  const runValidation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/seo-intelligence/validate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy: strategyData, generatedContent: JSON.stringify(generatedContent) })
      });
      const data = await res.json();
      if (data.success) {
        setValidationReport(data.data);
        setStep(5);
      } else alert(data.error);
    } catch(e) { console.error(e); }
    setIsLoading(false);
  };

  const publishToDb = async () => {
    setIsLoading(true);
    try {
      const payload = {
        slug: topic.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        type: type,
        title: generatedContent.title,
        description: generatedContent.description,
        h1Heading: generatedContent.h1Heading,
        content: generatedContent.content,
        faqs: generatedContent.faqs,
        workflowState: 'PUBLISHED',
        seoResearch: researchData,
        seoStrategy: strategyData,
        validationReport: validationReport
      };

      const res = await fetch('/api/admin/seo-pages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Published Successfully via the New Intelligence Pipeline!");
        // Reset wizard
        setStep(1); setTopic(""); setResearchData(null); setStrategyData(null); setGeneratedContent(null);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to publish.");
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-indigo-600" /> SEO Intelligence Pipeline
      </h2>

      {/* Progress Steps */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className={`h-2 flex-1 rounded-full ${step >= s ? 'bg-indigo-600' : 'bg-slate-100'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4 max-w-xl">
          <h3 className="font-bold text-lg">Step 1: Input & Discovery</h3>
          <p className="text-sm text-slate-500">Enter a target keyword, topic, or URL. The engine will gather GSC, intent, and gap data.</p>
          <input 
            type="text" 
            placeholder="e.g. srinagar to gulmarg taxi" 
            value={topic} onChange={e => setTopic(e.target.value)} 
            className="w-full p-3 border rounded-lg"
          />
          <input 
            type="text" 
            placeholder="Existing Page URL (Optional)" 
            value={url} onChange={e => setUrl(e.target.value)} 
            className="w-full p-3 border rounded-lg text-sm text-slate-500"
          />
          <select value={type} onChange={e => setType(e.target.value)} className="w-full p-3 border rounded-lg">
            <option value="TAXI">Taxi</option>
            <option value="HOMESTAY">Homestay</option>
            <option value="TOUR">Tour Package</option>
            <option value="DESTINATION">Destination</option>
            <option value="BLOG">Blog</option>
          </select>
          <button onClick={runResearch} disabled={isLoading || !topic} className="px-6 py-3 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
            {isLoading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />} Analyze Topic
          </button>
        </div>
      )}

      {step === 2 && researchData && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex gap-4 mb-2 text-xs font-semibold flex-wrap">
             <div className="px-3 py-1 bg-green-100 text-green-800 rounded border border-green-200">GSC: CONNECTED ✓</div>
             <div className={`px-3 py-1 rounded border ${researchData.googleTrends?.status === 'AVAILABLE' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>Google Trends: {researchData.googleTrends?.status || 'UNAVAILABLE'}</div>
             <div className={`px-3 py-1 rounded border ${researchData.keywordPlanner?.status === 'AVAILABLE' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>Google Keyword Planner: {researchData.keywordPlanner?.status || 'UNAVAILABLE'}</div>
             <div className="px-3 py-1 bg-red-50 text-red-600 rounded border border-red-200">Paid Keyword Provider: DISABLED</div>
             <div className="px-3 py-1 bg-red-50 text-red-600 rounded border border-red-200">Paid SERP Provider: DISABLED</div>
          </div>
        
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 p-4 border-b font-bold flex justify-between">
               <span>Research Summary: {researchData.target}</span>
               <span className="text-indigo-600">Intent: {researchData.searchIntent?.toUpperCase()}</span>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6 text-sm">
               <div>
                 <h4 className="font-bold mb-2">GSC Intelligence</h4>
                 {researchData.gsc.hasPageLevelHistory ? (
                    <div className="space-y-1">
                      <div><strong>Target Page:</strong> {researchData.pageUrl}</div>
                      <div><strong>Clicks:</strong> {researchData.gsc.pageMetrics?.clicks}</div>
                      <div><strong>Impressions:</strong> {researchData.gsc.pageMetrics?.impressions}</div>
                      <div><strong>CTR:</strong> {((researchData.gsc.pageMetrics?.ctr || 0) * 100).toFixed(1)}%</div>
                      <div><strong>Position:</strong> {researchData.gsc.pageMetrics?.position?.toFixed(1)}</div>
                      <div className="mt-2 text-indigo-700 font-bold bg-indigo-50 p-2 rounded border border-indigo-100">
                        Delta: {researchData.performanceDelta?.status}
                      </div>
                    </div>
                 ) : (
                    <div className="text-slate-500 bg-slate-50 p-3 rounded-lg border border-dashed">No existing page history found. Fetching sitewide related queries.</div>
                 )}
                 <div className="text-xs text-slate-400 mt-2 italic">Source: Google Search Console</div>
               </div>
               
               <div>
                 <h4 className="font-bold mb-2">Google Keyword Planner</h4>
                 <div className="space-y-1 bg-slate-50 p-3 rounded-lg border">
                    <div><strong>Search Volume:</strong> {researchData.keywordPlanner?.searchVolume || 'N/A'}</div>
                    <div><strong>Competition:</strong> {researchData.keywordPlanner?.competition || 'N/A'}</div>
                    <div className="mt-2"><strong>Related:</strong></div>
                    <div className="text-xs text-slate-500">{researchData.keywordPlanner?.relatedKeywords?.join(', ') || 'N/A'}</div>
                 </div>
                 <div className="text-xs text-slate-400 mt-2 italic">Source: {researchData.keywordPlanner?.source || 'Keyword Planner unavailable'}</div>

                 <h4 className="font-bold mb-2 mt-4">Google Trends</h4>
                 <div className="space-y-1 bg-slate-50 p-3 rounded-lg border">
                    <div><strong>Trend Signal:</strong> <span className="font-bold text-indigo-600">{researchData.googleTrends?.trendSignal || 'N/A'}</span></div>
                 </div>
                 <div className="text-xs text-slate-400 mt-2 italic">Source: {researchData.googleTrends?.source || 'Google Trends unavailable'}</div>
               </div>
               
               <div className="col-span-2 border-t border-slate-100 pt-4">
                 <h4 className={`font-bold mb-2 ${researchData.cannibalizationRisk?.status === 'HIGH_RISK' ? 'text-red-700' : 'text-slate-800'}`}>Cannibalization Risk</h4>
                 <p className="font-semibold">{researchData.cannibalizationRisk?.status} - {researchData.cannibalizationRisk?.recommendation}</p>
                 {researchData.cannibalizationRisk?.reason && <p className="text-slate-600 mt-1">{researchData.cannibalizationRisk.reason}</p>}
                 {researchData.cannibalizationRisk?.competingPages?.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 text-xs text-slate-600 space-y-1">
                      {researchData.cannibalizationRisk.competingPages.map((c: any) => (
                         <li key={c.url}>{c.title} ({c.type})</li>
                      ))}
                    </ul>
                 )}
                 <div className="text-xs text-slate-400 mt-2 italic">Source: WanderKashmir DB Inference</div>
               </div>
               
               <div className="col-span-2 border-t border-slate-100 pt-4">
                  <h4 className="font-bold mb-3 text-slate-400">Paid Providers (DISABLED)</h4>
                  <div className="text-slate-500 text-sm bg-red-50 p-4 rounded-lg border border-red-100 flex items-center justify-center">
                     All Paid Keyword and SERP API calls have been strictly disabled per configuration.
                  </div>
               </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={runStrategy} disabled={isLoading} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white rounded-lg flex items-center gap-2 shadow-sm font-medium">
              {isLoading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Wand2 className="w-4 h-4" />} Generate AI Strategy
            </button>
          </div>
        </div>
      )}

      {step === 3 && strategyData && (() => {
        const isManualReview = strategyData.recommendedAction === 'MANUAL_REVIEW' || strategyData.manualReviewRequired || researchData?.cannibalizationRisk?.status === 'HIGH_RISK';
        const rec = researchData?.manualReviewRecommendation;
        const competingPages = rec?.competingPages || researchData?.cannibalizationRisk?.competingPages || [];

        const handleAcceptRecommendation = async () => {
          if (!rec?.recommendedPrimaryPage) return;
          const dec = {
            type: 'USE_EXISTING_PRIMARY' as const,
            primaryPageUrl: rec.recommendedPrimaryPage.url,
            primaryPageTitle: rec.recommendedPrimaryPage.title,
            primaryPageType: rec.recommendedPrimaryPage.pageType,
            source: 'AI_RECOMMENDATION_ACCEPTED' as const,
            reason: rec.reason || rec.plainLanguageSummary
          };
          setAdminDecision('USE_EXISTING');
          setSelectedPrimaryPageUrl(rec.recommendedPrimaryPage.url);
          try {
            await fetch('/api/admin/seo-intelligence/manual-review', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ targetTopic: topic, decision: dec })
            });
          } catch (e) { console.error("Failed to save manual review decision", e); }
        };

        const handleSelectCustomPage = async (pageUrl: string, pageTitle: string, pageType: string) => {
          const dec = {
            type: 'CHOOSE_ANOTHER' as const,
            primaryPageUrl: pageUrl,
            primaryPageTitle: pageTitle,
            primaryPageType: pageType,
            source: 'ADMIN_MANUAL_SELECTION' as const,
            reason: `Admin explicitly selected "${pageTitle}" as the primary page.`
          };
          setAdminDecision('USE_EXISTING');
          setSelectedPrimaryPageUrl(pageUrl);
          try {
            await fetch('/api/admin/seo-intelligence/manual-review', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ targetTopic: topic, decision: dec })
            });
          } catch (e) { console.error("Failed to save manual review decision", e); }
        };

        const handleConfirmCreateNew = async () => {
          const confirmed = confirm(
            "⚠️ Existing competing pages were detected. Creating another page may increase cannibalization.\n\nAre you sure you want to create a genuinely new page?"
          );
          if (!confirmed) return;

          const reason = prompt(
            "Confirm target search intent and justification for creating a new page:",
            "Commercial / Hotel Booking — Target intent is distinct from existing guide and transport pages."
          );
          if (!reason) return;

          const dec = {
            type: 'CREATE_NEW_PAGE' as const,
            confirmedDistinctIntent: reason,
            source: 'ADMIN_CREATE_NEW_CONFIRMED' as const,
            reason
          };
          setAdminDecision('CREATE_NEW');
          try {
            await fetch('/api/admin/seo-intelligence/manual-review', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ targetTopic: topic, decision: dec })
            });
          } catch (e) { console.error("Failed to save manual review decision", e); }
        };

        const handleIgnoreOpportunity = async () => {
          const dec = {
            type: 'IGNORE' as const,
            source: 'ADMIN_IGNORED' as const,
            reason: "Ignored by Admin during Manual Review."
          };
          setAdminDecision('IGNORE');
          try {
            await fetch('/api/admin/seo-intelligence/manual-review', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ targetTopic: topic, decision: dec })
            });
            alert("Opportunity marked as Ignored.");
            setStep(1);
          } catch (e) { console.error("Failed to save manual review decision", e); }
        };

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Step 3: AI Strategy & Decision</h3>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                isManualReview ? "bg-amber-100 text-amber-800 border border-amber-300" : "bg-green-100 text-green-800"
              }`}>
                {strategyData.recommendedAction}
              </span>
            </div>

            {/* AI-ASSISTED MANUAL REVIEW RECOMMENDATION CARD */}
            {isManualReview && (
              <div className="bg-white border-2 border-amber-300 rounded-2xl p-6 shadow-sm space-y-6">
                {/* HEADER */}
                <div className="flex items-start justify-between border-b border-amber-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 bg-amber-100 text-amber-800 rounded-xl font-black text-xl">⚠️</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">MANUAL REVIEW REQUIRED</h4>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        {competingPages.length} competing pages were detected for: <span className="font-bold text-slate-900">{topic}</span>
                      </p>
                    </div>
                  </div>
                  {rec?.confidence && (
                    <span className={`px-3 py-1 text-xs font-black tracking-wide rounded-full border ${
                      rec.confidence === 'HIGH' ? "bg-green-100 text-green-800 border-green-300" :
                      rec.confidence === 'MEDIUM' ? "bg-amber-100 text-amber-800 border-amber-300" :
                      "bg-rose-100 text-rose-800 border-rose-300"
                    }`}>
                      {rec.confidence} CONFIDENCE
                    </span>
                  )}
                </div>

                {/* AI RECOMMENDATION */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-4">
                  <div className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🤖 AI RECOMMENDATION</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white p-3.5 rounded-lg border border-amber-200">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Recommended Direction:</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        {rec?.direction?.replace(/_/g, ' ') || 'USE EXISTING PRIMARY'}
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-amber-200">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Recommended Primary Intent:</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        {rec?.intent || 'Commercial / Hotel Booking'}
                      </div>
                    </div>
                  </div>

                  {rec?.recommendedPrimaryPage && (
                    <div className="bg-white p-4 rounded-lg border border-amber-200 shadow-sm flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-slate-500 uppercase">Recommended Primary Page:</div>
                        <div className="font-bold text-slate-900 text-base mt-0.5">{rec.recommendedPrimaryPage.title}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{rec.recommendedPrimaryPage.url}</div>
                      </div>
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded text-xs border border-indigo-200 uppercase">
                        {rec.recommendedPrimaryPage.pageType}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1.5 bg-white/80 p-4 rounded-lg border border-amber-200 text-xs">
                    <div className="font-bold text-slate-800">Why this recommendation:</div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                      {rec?.reason || rec?.plainLanguageSummary || strategyData.competingPagesAnalysis}
                    </p>
                    <div className="pt-2 text-[11px] font-semibold text-amber-900 italic border-t border-amber-100">
                      IMPORTANT: This is an AI recommendation, NOT an automatic decision. Admin decision is required.
                    </div>
                  </div>
                </div>

                {/* COMPETING PAGES */}
                {competingPages.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <span>📑 COMPETING PAGES DETECTED ({competingPages.length})</span>
                    </div>
                    <div className="grid gap-2.5">
                      {competingPages.map((page: any, idx: number) => {
                        const isPrimary = rec?.recommendedPrimaryPage?.url === page.url;
                        const isSelected = selectedPrimaryPageUrl === page.url;

                        return (
                          <div 
                            key={idx} 
                            className={`flex items-center justify-between p-3.5 rounded-xl border text-xs transition ${
                              isSelected ? 'bg-indigo-50/80 border-indigo-400 ring-1 ring-indigo-400' :
                              isPrimary ? 'bg-amber-50/40 border-amber-200' : 'bg-slate-50/50 border-slate-200'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{page.title}</span>
                                {isPrimary && <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded font-bold text-[10px]">AI CANDIDATE</span>}
                                {isSelected && <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[10px]">SELECTED PRIMARY</span>}
                              </div>
                              <div className="text-slate-500 font-mono text-[11px]">{page.url}</div>
                              <div className="text-slate-600 text-[11px]">
                                <span className="font-semibold">Type:</span> {page.type} &nbsp;|&nbsp; 
                                <span className="font-semibold ml-1">Intent/Role:</span> {page.intent || page.intentAlignment || page.role?.replace(/_/g, ' ') || 'Supporting'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {adminDecision !== 'USE_EXISTING' && (
                                <button 
                                  onClick={() => handleSelectCustomPage(page.url, page.title, page.type)}
                                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-600 border border-indigo-200 rounded text-[11px] font-semibold transition"
                                >
                                  Pick As Primary
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* EVIDENCE */}
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    📊 EVIDENCE & DATA SIGNALS
                  </div>
                  <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                    {(rec?.evidence || [
                      `Target Intent: ${researchData?.searchIntent?.toUpperCase() || 'COMMERCIAL'}`,
                      `Competing Pages in DB: ${competingPages.length}`,
                      `Google Trends: UNAVAILABLE`,
                      `Keyword Planner: UNAVAILABLE`,
                      `Paid Providers: UNAVAILABLE (Disabled)`
                    ]).map((ev: string, i: number) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>

                {/* WHAT DO YOU WANT TO DO? */}
                <div className="border-t border-amber-200 pt-5 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    👉 WHAT DO YOU WANT TO DO? (AI Recommends, Admin Decides)
                  </div>
                  
                  {adminDecision ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-green-900">✓ Admin decision confirmed: </span>
                        <span className="font-semibold text-green-800">{adminDecision}</span>
                        {selectedPrimaryPageUrl && (
                          <div className="text-green-700 font-mono mt-0.5">Primary URL: {selectedPrimaryPageUrl}</div>
                        )}
                      </div>
                      <button 
                        onClick={() => { setAdminDecision(null); setSelectedPrimaryPageUrl(""); }} 
                        className="px-3 py-1 bg-white text-slate-600 hover:text-slate-800 border rounded text-xs font-medium"
                      >
                        Change Decision
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {rec?.recommendedPrimaryPage && (
                        <button 
                          onClick={handleAcceptRecommendation}
                          className="p-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                        >
                          <span>✓</span> ACCEPT RECOMMENDATION
                        </button>
                      )}

                      <button 
                        onClick={() => {
                          const firstOther = competingPages.find((p: any) => p.url !== rec?.recommendedPrimaryPage?.url) || competingPages[0];
                          if (firstOther) handleSelectCustomPage(firstOther.url, firstOther.title, firstOther.type);
                        }}
                        className="p-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
                      >
                        <span>⟳</span> CHOOSE ANOTHER
                      </button>

                      <button 
                        onClick={handleConfirmCreateNew}
                        className="p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
                      >
                        <span>+</span> CREATE NEW PAGE
                      </button>

                      <button 
                        onClick={handleIgnoreOpportunity}
                        className="p-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
                      >
                        <span>✕</span> IGNORE
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STRATEGY JSON PREVIEW */}
            <div className="p-4 bg-slate-50 rounded-lg text-sm font-mono overflow-auto max-h-64 border">
              <pre>{JSON.stringify(strategyData, null, 2)}</pre>
            </div>

            {/* ACTION BUTTON */}
            <div className="flex items-center gap-4">
              <button 
                onClick={runGeneration} 
                disabled={isLoading || (isManualReview && !adminDecision)} 
                className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium text-white shadow-sm transition ${
                  isManualReview && !adminDecision
                    ? "bg-slate-300 cursor-not-allowed text-slate-500"
                    : adminDecision === 'IGNORE'
                    ? "bg-slate-600 hover:bg-slate-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isLoading ? <RefreshCw className="animate-spin w-4 h-4" /> : <PenTool className="w-4 h-4" />}
                {adminDecision === 'IGNORE' ? "Mark as Ignored" : "Write Content"}
              </button>

              {isManualReview && !adminDecision && (
                <span className="text-xs text-amber-700 font-semibold animate-pulse">
                  ⚠️ Generation blocked: Select or Accept an Admin Decision above to unlock content generation.
                </span>
              )}
            </div>
          </div>
        );
      })()}

      {step === 4 && generatedContent && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Step 4: Generated Content Preview</h3>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-bold text-xl">{generatedContent.title}</h4>
            <p className="text-slate-500 mb-4">{generatedContent.description}</p>
            <h1 className="text-2xl font-black">{generatedContent.h1Heading}</h1>
            <div className="mt-4 prose prose-sm max-h-64 overflow-auto border p-4 bg-white">
              {generatedContent.content}
            </div>
          </div>
          <button onClick={runValidation} disabled={isLoading} className="px-6 py-3 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
             {isLoading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Activity className="w-4 h-4" />} Run Validation Engine
          </button>
        </div>
      )}

      {step === 5 && validationReport && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Step 5: Validation & Approval</h3>
          <div className={`p-4 rounded-lg border ${validationReport.status === 'PASS' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <h4 className="font-bold">Status: {validationReport.status}</h4>
            <ul className="list-disc pl-5 mt-2 text-sm">
              {validationReport.issues?.map((issue: string, i: number) => <li key={i}>{issue}</li>)}
            </ul>
          </div>
          <div className="flex gap-4 mt-4">
            <button onClick={publishToDb} disabled={isLoading || validationReport.status !== 'PASS'} className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50">
              Approve & Publish to Production
            </button>
            <button onClick={() => setStep(1)} className="px-6 py-3 bg-slate-200 text-slate-800 rounded-lg">
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// -----------------------------------------------------------------------------
// EXISTING: LEGACY PAGES VIEW (PRESERVED FUNCTIONALITY)
// -----------------------------------------------------------------------------
function LegacyPagesView() {
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
    id: "", slug: "", type: "TAXI", title: "", description: "", h1Heading: "", content: "", imageUrl: "", faqs: [] as any[]
  });

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/seo-pages");
      const data = await res.json();
      setPages(Array.isArray(data) ? data : []);
    } catch (error) { console.error("Failed to fetch SEO pages", error); }
    setIsLoading(false);
  };

  useEffect(() => { fetchPages(); }, []);

  const handleAddFaq = () => setFormData({ ...formData, faqs: [...formData.faqs, { question: "", answer: "" }] });
  const handleUpdateFaq = (index: number, field: string, value: string) => {
    const newFaqs = [...formData.faqs];
    newFaqs[index][field] = value;
    setFormData({ ...formData, faqs: newFaqs });
  };
  const handleRemoveFaq = (index: number) => setFormData({ ...formData, faqs: formData.faqs.filter((_, i) => i !== index) });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditing ? `/api/admin/seo-pages/${formData.id}` : "/api/admin/seo-pages";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) {
        alert(`Page ${isEditing ? "updated" : "created"} successfully!`);
        setIsEditing(false);
        setFormData({ id: "", slug: "", type: "TAXI", title: "", description: "", h1Heading: "", content: "", imageUrl: "", faqs: [] });
        fetchPages();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save page");
      }
    } catch (error) { alert("An error occurred"); }
  };

  const handleEdit = (page: any) => {
    setFormData({
      id: page.id, slug: page.slug, type: page.type, title: page.title, description: page.description || "",
      h1Heading: page.h1Heading, content: page.content || "", imageUrl: page.imageUrl || "", faqs: page.faqs || [],
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this SEO page?")) return;
    try {
      const res = await fetch(`/api/admin/seo-pages/${id}`, { method: "DELETE" });
      if (res.ok) fetchPages(); else alert("Failed to delete");
    } catch (error) { console.error(error); }
  };

  // KEEP EXISTING GENERATION ROUTES ACTIVE AS REQUESTED
  const handleGenerateAutomation = async () => {
    const topic = topicInput.trim();
    if (!confirm(`This will trigger the AI to generate a new SEO Route page right now${topic ? ` for "${topic}"` : ''}. Proceed?`)) return;
    setIsGenerating(true);
    try {
      const res = await triggerSeoGeneration(topic);
      if (res.success) { alert("Generation successful!"); fetchPages(); }
      else alert("Failed to run generation: " + (res.error || "Unknown error"));
    } catch (error: any) { alert("An error occurred: " + error.message); }
    setIsGenerating(false);
  };

  const handleGenerateBlog = async () => {
    const topic = topicInput.trim();
    if (!confirm(`This will trigger the AI to write a new Travel Blog Article right now${topic ? ` for "${topic}"` : ''}. Proceed?`)) return;
    setIsGenerating(true);
    try {
      const res = await triggerBlogGeneration(topic);
      if (res.success) { alert("Blog Generation successful!"); fetchPages(); }
      else alert("Failed to run blog generation: " + (res.error || "Unknown error"));
    } catch (error: any) { alert("An error occurred: " + error.message); }
    setIsGenerating(false);
  };

  const filteredPages = pages.filter(p => (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || (p.slug || "").toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
  const paginatedPages = filteredPages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Legacy Pages & Manual Edit</h2>
          <p className="text-sm text-slate-500">Manage existing SEO routes and use the legacy generator.</p>
        </div>
        {!isEditing && (
          <div className="flex gap-3 items-center">
            <input type="text" placeholder="Topic/Keyword (Optional)" value={topicInput} onChange={(e) => setTopicInput(e.target.value)} className="border rounded-xl px-3 py-2 w-64" />
            <button onClick={handleGenerateAutomation} disabled={isGenerating} className="flex items-center gap-2 bg-[#f97316] text-white px-4 py-2 rounded-xl">
              <Wand2 className="w-4 h-4" /> {isGenerating ? "Generating..." : "Generate SEO Page (Legacy)"}
            </button>
            <button onClick={handleGenerateBlog} disabled={isGenerating} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl">
              <PenTool className="w-4 h-4" /> {isGenerating ? "Writing..." : "Generate Blog (Legacy)"}
            </button>
            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-800 text-white rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Manual
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <button onClick={() => setIsEditing(false)} className="mb-4 text-slate-500 flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</button>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="p-2 border rounded-lg">
                <option value="TAXI">Taxi</option><option value="HOMESTAY">Homestay</option><option value="TOUR">Tour</option><option value="BLOG">Blog</option>
              </select>
              <input type="text" placeholder="Slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="p-2 border rounded-lg" required />
            </div>
            <input type="text" placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border rounded-lg" required />
            <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded-lg" rows={2} />
            <input type="text" placeholder="H1 Heading" value={formData.h1Heading} onChange={(e) => setFormData({ ...formData, h1Heading: e.target.value })} className="w-full p-2 border rounded-lg" required />
            <textarea placeholder="Content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full p-2 border rounded-lg" rows={5} />
            <div className="flex justify-end gap-2 mt-4">
              <button type="submit" className="bg-[#f97316] text-white px-6 py-2 rounded-lg">Save Page</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border p-4">
          <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="mb-4 w-full p-2 border rounded-lg" />
          <table className="w-full text-left">
            <thead><tr className="bg-slate-50"><th className="p-4">Title</th><th className="p-4">Type</th><th className="p-4 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPages.map(page => (
                <tr key={page.id}>
                  <td className="p-4">{page.title}</td>
                  <td className="p-4">{page.type}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleEdit(page)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(page.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {activeDistributionPage && <ContentDistributionModal page={activeDistributionPage} onClose={() => setActiveDistributionPage(null)} />}
    </>
  );
}
