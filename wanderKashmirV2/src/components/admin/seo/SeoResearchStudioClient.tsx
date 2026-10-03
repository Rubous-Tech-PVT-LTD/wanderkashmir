"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Sparkles,
  ShieldCheck,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  FileText,
  BarChart3,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Tag,
  Save,
  Loader2,
  Database,
  Building,
  MapPin,
  Compass,
  ArrowRight,
  Eye,
  Crosshair,
} from "lucide-react";
import {
  SeoResearchStudioPayload,
  SeoResearchData,
  SeoStrategyData,
} from "@/lib/admin/seoStudio";
import {
  saveSeoResearchAction,
  saveSeoStrategyAction,
} from "@/actions/adminSeo";
import { SeoWorkflowState } from "@prisma/client";

interface SeoResearchStudioClientProps {
  payload: SeoResearchStudioPayload;
}

export default function SeoResearchStudioClient({
  payload,
}: SeoResearchStudioClientProps) {
  const router = useRouter();
  const { page, savedResearch, savedStrategy, liveGscEvidence, matchedOpportunity, cannibalization, verifiedDbFacts } = payload;

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(
    savedStrategy ? 2 : 1
  );

  // Status & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // -------------------------------------------------------------
  // STEP 1 STATE: RESEARCH
  // -------------------------------------------------------------
  const [targetQuery, setTargetQuery] = useState(
    savedResearch?.targetQuery || page.title || ""
  );
  const [secondaryQueriesText, setSecondaryQueriesText] = useState(
    savedResearch?.secondaryQueries?.join(", ") || ""
  );
  const [searchIntent, setSearchIntent] = useState<
    "informational" | "commercial" | "transactional" | "local" | "unknown"
  >(savedResearch?.searchIntent || "informational");

  // Competitor SERP Evidence
  const [competitorUrl, setCompetitorUrl] = useState(
    savedResearch?.competitorResearch?.competitorUrl || ""
  );
  const [competitorTitle, setCompetitorTitle] = useState(
    savedResearch?.competitorResearch?.competitorTitle || ""
  );
  const [contentAngle, setContentAngle] = useState(
    savedResearch?.competitorResearch?.contentAngle || ""
  );
  const [topicsCoveredText, setTopicsCoveredText] = useState(
    savedResearch?.competitorResearch?.topicsCovered?.join(", ") || ""
  );
  const [missingTopicsText, setMissingTopicsText] = useState(
    savedResearch?.competitorResearch?.missingTopics?.join(", ") || ""
  );
  const [competitorNotes, setCompetitorNotes] = useState(
    savedResearch?.competitorResearch?.notes || ""
  );

  // Keyword & Trend Evidence
  const [trendDirection, setTrendDirection] = useState<
    "RISING" | "STABLE" | "DECLINING" | "UNCLEAR"
  >(savedResearch?.trendResearch?.trendDirection || "STABLE");
  const [trendStrength, setTrendStrength] = useState<
    "STRONG" | "MODERATE" | "WEAK" | "UNCLEAR"
  >(savedResearch?.trendResearch?.trendStrength || "MODERATE");
  const [seasonality, setSeasonality] = useState<"YES" | "NO" | "UNCLEAR">(
    savedResearch?.trendResearch?.seasonality || "YES"
  );
  const [peakPeriod, setPeakPeriod] = useState(
    savedResearch?.trendResearch?.peakPeriod || "May - September"
  );
  const [lowestPeriod, setLowestPeriod] = useState(
    savedResearch?.trendResearch?.lowestPeriod || "December - February"
  );
  const [researchNotes, setResearchNotes] = useState(
    savedResearch?.researchNotes || ""
  );

  // -------------------------------------------------------------
  // STEP 2 STATE: STRATEGY
  // -------------------------------------------------------------
  const [adminDecision, setAdminDecision] = useState<
    "USE_EXISTING" | "CONSOLIDATE" | "CREATE_NEW" | "IGNORE"
  >(savedStrategy?.adminDecision || "USE_EXISTING");

  const [recommendedAction, setRecommendedAction] = useState<
    "KEEP" | "OPTIMIZE" | "MONITOR" | "CONSOLIDATE" | "MANUAL_REVIEW"
  >(
    savedStrategy?.recommendedAction ||
      (cannibalization.status === "HIGH_RISK" ? "MANUAL_REVIEW" : "OPTIMIZE")
  );

  // Protected Components [RETAIN EXISTING]
  const [protectPrimaryQuery, setProtectPrimaryQuery] = useState(
    savedStrategy?.protectedComponents?.protectPrimaryQuery ?? true
  );
  const [protectTitle, setProtectTitle] = useState(
    savedStrategy?.protectedComponents?.protectTitle ?? (liveGscEvidence.ctr > 5)
  );
  const [protectH1, setProtectH1] = useState(
    savedStrategy?.protectedComponents?.protectH1 ?? true
  );
  const [protectMetaDescription, setProtectMetaDescription] = useState(
    savedStrategy?.protectedComponents?.protectMetaDescription ?? false
  );
  const [protectSlug, setProtectSlug] = useState(
    savedStrategy?.protectedComponents?.protectSlug ?? true
  );
  const [protectFaqs, setProtectFaqs] = useState(
    savedStrategy?.protectedComponents?.protectFaqs ?? true
  );

  const [queriesToProtectText, setQueriesToProtectText] = useState(
    savedStrategy?.queriesToProtect?.join(", ") ||
      (liveGscEvidence.topQueries.slice(0, 3).map((q) => q.query).join(", ") || targetQuery)
  );
  const [queriesToImproveText, setQueriesToImproveText] = useState(
    savedStrategy?.queriesToImprove?.join(", ") || ""
  );
  const [strategyAngle, setStrategyAngle] = useState(
    savedStrategy?.contentAngle || contentAngle || "Comprehensive local expert guide covering logistics, verified places, and seasonal travel advice."
  );
  const [headingDirection, setHeadingDirection] = useState(
    savedStrategy?.recommendedHeadingDirection || "H1 (Protected) -> Overview -> Verified Attractions -> Best Time & Weather -> How to Reach -> FAQs"
  );
  const [internalLinkingText, setInternalLinkingText] = useState(
    savedStrategy?.internalLinkingIdeas?.join(", ") || "Link to related destination stays, verified tour packages, and taxi routes"
  );
  const [competingPagesAnalysis, setCompetingPagesAnalysis] = useState(
    savedStrategy?.competingPagesAnalysis || cannibalization.reason || ""
  );
  const [strategyNotes, setStrategyNotes] = useState(
    savedStrategy?.strategyNotes || ""
  );

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------
  const handleSaveResearch = async () => {
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const secondaryQueries = secondaryQueriesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const topicsCovered = topicsCoveredText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const missingTopics = missingTopicsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const researchData: SeoResearchData = {
      targetQuery: targetQuery.trim(),
      secondaryQueries,
      searchIntent,
      gscEvidence: liveGscEvidence,
      opportunityEvidence: matchedOpportunity,
      cannibalization,
      competitorResearch: {
        competitorUrl: competitorUrl.trim() || undefined,
        competitorTitle: competitorTitle.trim() || undefined,
        contentAngle: contentAngle.trim() || undefined,
        topicsCovered,
        missingTopics,
        notes: competitorNotes.trim() || undefined,
      },
      keywordResearch: {
        primaryKeyword: targetQuery.trim(),
        relatedKeywords: secondaryQueries,
        searchIntent,
        notes: researchNotes.trim() || undefined,
      },
      trendResearch: {
        trendDirection,
        trendStrength,
        seasonality,
        peakPeriod: peakPeriod.trim() || undefined,
        lowestPeriod: lowestPeriod.trim() || undefined,
        notes: researchNotes.trim() || undefined,
      },
      verifiedDbFacts,
      researchNotes: researchNotes.trim(),
      researchedAt: new Date().toISOString(),
    };

    try {
      const res = await saveSeoResearchAction(page.id, researchData);
      if (res.success) {
        setSuccessMsg("SEO Research findings saved successfully into page record.");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to save research findings.");
      }
    } catch {
      setErrorMsg("Network error saving research findings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStrategy = async () => {
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const queriesToProtect = queriesToProtectText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const queriesToImprove = queriesToImproveText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const internalLinkingIdeas = internalLinkingText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const strategyData: SeoStrategyData = {
      primaryTopic: targetQuery.trim(),
      adminDecision,
      recommendedAction,
      protectedComponents: {
        protectPrimaryQuery,
        protectTitle,
        protectH1,
        protectMetaDescription,
        protectSlug,
        protectSections: [],
        protectFaqs,
      },
      queriesToProtect,
      queriesToImprove,
      contentAngle: strategyAngle.trim(),
      recommendedHeadingDirection: headingDirection.trim(),
      internalLinkingIdeas,
      competingPagesAnalysis: competingPagesAnalysis.trim() || undefined,
      strategyNotes: strategyNotes.trim(),
      strategisedAt: new Date().toISOString(),
    };

    try {
      const res = await saveSeoStrategyAction(page.id, strategyData);
      if (res.success) {
        setSuccessMsg("SEO Strategy Blueprint saved successfully into page record.");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to save strategy blueprint.");
      }
    } catch {
      setErrorMsg("Network error saving strategy blueprint.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link
              href={`/admin/seo/${page.id}`}
              className="hover:text-cyan-400 inline-flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Page Inspector</span>
            </Link>
            <span>/</span>
            <span className="text-slate-300 font-medium">Research & Strategy Studio</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span>{page.title}</span>
          </h1>

          <div className="flex items-center gap-2.5 mt-2 flex-wrap text-xs">
            <span className="font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              /{page.slug}
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
              {page.type}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              State: {page.workflowState}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeStep === 1 ? (
            <button
              type="button"
              onClick={handleSaveResearch}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition shadow-sm disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Research Data</span>
            </button>
          ) : activeStep === 2 ? (
            <button
              type="button"
              onClick={handleSaveStrategy}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition shadow-sm disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Strategy Blueprint</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* 5-Step Workflow Stepper */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[650px] gap-2">
          {[
            { step: 1, title: "1. Research", desc: "Evidence & GSC", active: activeStep === 1, done: !!savedResearch },
            { step: 2, title: "2. Strategy", desc: "Decisions & Protect", active: activeStep === 2, done: !!savedStrategy },
            { step: 3, title: "3. Generation", desc: "Coming Next", active: activeStep === 3, done: false, locked: true },
            { step: 4, title: "4. Validation", desc: "Coming Next", active: activeStep === 4, done: false, locked: true },
            { step: 5, title: "5. Review & Publish", desc: "Final Stage", active: activeStep === 5, done: false, locked: true },
          ].map((s, idx) => (
            <React.Fragment key={s.step}>
              <button
                type="button"
                onClick={() => setActiveStep(s.step as any)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition ${
                  s.active
                    ? "bg-slate-800 text-white shadow border border-slate-700"
                    : s.done
                    ? "text-emerald-400 hover:bg-slate-900"
                    : s.locked
                    ? "text-slate-500 hover:text-slate-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    s.active
                      ? "bg-cyan-500 text-white"
                      : s.done
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : s.locked
                      ? "bg-slate-800 text-slate-500"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {s.done ? "✓" : s.step}
                </div>
                <div>
                  <div className="text-xs font-semibold">{s.title}</div>
                  <div className="text-[10px] text-slate-400">{s.desc}</div>
                </div>
              </button>
              {idx < 4 && <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ============================================================= */}
      {/* STEP 1: RESEARCH WORKSPACE                                    */}
      {/* ============================================================= */}
      {activeStep === 1 && (
        <div className="space-y-6">
          {/* Target Query & Search Intent */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Target Topic & Search Intent</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                  Primary Target Query <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={targetQuery}
                  onChange={(e) => setTargetQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                  Search Intent
                </label>
                <select
                  value={searchIntent}
                  onChange={(e) => setSearchIntent(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="informational">Informational (Guides, Tips, Culture)</option>
                  <option value="commercial">Commercial (Best Stays, Comparison, Itineraries)</option>
                  <option value="transactional">Transactional (Book Tour, Hire Taxi)</option>
                  <option value="local">Local (Distances, Nearest Airport, Fares)</option>
                  <option value="unknown">Unknown / Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                  Secondary Queries (comma separated)
                </label>
                <input
                  type="text"
                  value={secondaryQueriesText}
                  onChange={(e) => setSecondaryQueriesText(e.target.value)}
                  placeholder="e.g. srinagar weather, srinagar houseboats, best time"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Evidence Grid: Live GSC + Production Opportunities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live GSC Evidence */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Search Console Evidence</span>
                </h3>
                {liveGscEvidence.hasData ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">
                    Live Data Found
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                    No Direct Data
                  </span>
                )}
              </div>

              {liveGscEvidence.hasData ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">Clicks</div>
                      <div className="text-base font-bold text-white">{liveGscEvidence.clicks}</div>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">Impressions</div>
                      <div className="text-base font-bold text-indigo-400">{liveGscEvidence.impressions}</div>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">CTR</div>
                      <div className="text-base font-bold text-emerald-400">{liveGscEvidence.ctr.toFixed(1)}%</div>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">Avg Pos</div>
                      <div className="text-base font-bold text-amber-400">{liveGscEvidence.position.toFixed(1)}</div>
                    </div>
                  </div>

                  {liveGscEvidence.topQueries.length > 0 && (
                    <div className="pt-2">
                      <div className="text-[11px] font-medium text-slate-400 mb-1.5">Top Verified Queries:</div>
                      <div className="space-y-1">
                        {liveGscEvidence.topQueries.map((q, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-950/60 border border-slate-800/80">
                            <span className="text-slate-200">{q.query}</span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              {q.clicks} clicks · {q.impressions} impr · pos {q.position}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  Google Search Console data is currently unavailable for this specific URL slug.
                </div>
              )}
            </div>

            {/* Production Opportunities */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>Production SEO Opportunities</span>
                </h3>
                {matchedOpportunity?.found ? (
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-medium">
                    Score: {matchedOpportunity.opportunityScore}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                    None Linked
                  </span>
                )}
              </div>

              {matchedOpportunity?.found ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Discovered Topic:</span>
                    <strong className="text-white">{matchedOpportunity.topic}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Action Type:</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                      {matchedOpportunity.type}
                    </span>
                  </div>
                  {matchedOpportunity.evidence && (
                    <div className="pt-2">
                      <span className="text-slate-400 block mb-1 text-[11px]">Opportunity Evidence:</span>
                      <p className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-xs">
                        {matchedOpportunity.evidence}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  No SEO opportunities are currently associated with this page.
                </div>
              )}
            </div>
          </div>

          {/* Cannibalization Risk Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Internal Keyword Cannibalization Check</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated scan of all 162 landing pages, live tours, stays, and places for target keyword overlap.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    cannibalization.status === "HIGH_RISK"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : cannibalization.status === "MEDIUM_RISK"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  {cannibalization.status.replace("_", " ")}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                  {cannibalization.recommendation}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
              {cannibalization.reason}
            </p>

            {cannibalization.competingPages.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase text-[10px]">
                      <th className="py-2 px-3">Competing Record</th>
                      <th className="py-2 px-3">Entity Type</th>
                      <th className="py-2 px-3">URL Path</th>
                      <th className="py-2 px-3 text-right">Intent Match</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {cannibalization.competingPages.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-medium text-white">{c.title}</td>
                        <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{c.entityType}</td>
                        <td className="py-2 px-3">
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
                          >
                            <span>{c.url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              c.intentAlignment === "HIGH"
                                ? "bg-rose-500/10 text-rose-400"
                                : "bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            {c.intentAlignment}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Verified Database Facts Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Verified Database Facts</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-normal">
                Ground Truth
              </span>
            </h3>

            <div className="space-y-2">
              {verifiedDbFacts.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">{f.fact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Manual Competitor & Trend Evidence Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Competitor / SERP Observation Form */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Manual Competitor / SERP Evidence</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Top Competitor URL:</label>
                  <input
                    type="url"
                    value={competitorUrl}
                    onChange={(e) => setCompetitorUrl(e.target.value)}
                    placeholder="https://competitor.com/kashmir-guide"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Competitor Title:</label>
                  <input
                    type="text"
                    value={competitorTitle}
                    onChange={(e) => setCompetitorTitle(e.target.value)}
                    placeholder="e.g. Complete Kashmir Travel Guide 2026"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Topics Covered (comma separated):</label>
                  <input
                    type="text"
                    value={topicsCoveredText}
                    onChange={(e) => setTopicsCoveredText(e.target.value)}
                    placeholder="e.g. itinerary, hotels, weather, local food"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Missing Topics / Content Gaps:</label>
                  <input
                    type="text"
                    value={missingTopicsText}
                    onChange={(e) => setMissingTopicsText(e.target.value)}
                    placeholder="e.g. verified taxi rate cards, direct vendor booking"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">SERP Notes:</label>
                  <textarea
                    rows={2}
                    value={competitorNotes}
                    onChange={(e) => setCompetitorNotes(e.target.value)}
                    placeholder="Observed ranking patterns, featured snippet formats..."
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Keyword Trends Observation Form */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Manual Google Trends Evidence</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Trend Direction:</label>
                    <select
                      value={trendDirection}
                      onChange={(e) => setTrendDirection(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="RISING">RISING</option>
                      <option value="STABLE">STABLE</option>
                      <option value="DECLINING">DECLINING</option>
                      <option value="UNCLEAR">UNCLEAR</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Trend Strength:</label>
                    <select
                      value={trendStrength}
                      onChange={(e) => setTrendStrength(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="STRONG">STRONG</option>
                      <option value="MODERATE">MODERATE</option>
                      <option value="WEAK">WEAK</option>
                      <option value="UNCLEAR">UNCLEAR</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Seasonality:</label>
                    <select
                      value={seasonality}
                      onChange={(e) => setSeasonality(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                      <option value="UNCLEAR">UNCLEAR</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Peak Period:</label>
                    <input
                      type="text"
                      value={peakPeriod}
                      onChange={(e) => setPeakPeriod(e.target.value)}
                      placeholder="e.g. May - Jul"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Lowest Period:</label>
                    <input
                      type="text"
                      value={lowestPeriod}
                      onChange={(e) => setLowestPeriod(e.target.value)}
                      placeholder="e.g. Jan - Feb"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Research Notes & Evidence Justification:</label>
                  <textarea
                    rows={3}
                    value={researchNotes}
                    onChange={(e) => setResearchNotes(e.target.value)}
                    placeholder="Specific observations, queries to address in content, seasonal notes..."
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 1 Footer Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-500">
              {savedResearch?.researchedAt ? `Last saved: ${new Date(savedResearch.researchedAt).toLocaleString()}` : "Research pending save."}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveResearch}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition shadow-sm disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Research</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition border border-slate-700"
              >
                <span>Proceed to Step 2: Strategy</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* STEP 2: STRATEGY STUDIO                                       */}
      {/* ============================================================= */}
      {activeStep === 2 && (
        <div className="space-y-6">
          {/* Decision & Action Selector */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Compass className="w-4 h-4 text-purple-400" />
              <span>Strategic Decision & Recommendation</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                  Strategic Decision
                </label>
                <select
                  value={adminDecision}
                  onChange={(e) => setAdminDecision(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                >
                  <option value="USE_EXISTING">USE EXISTING (Designate this landing page as primary target)</option>
                  <option value="CONSOLIDATE">CONSOLIDATE (Merge intent from competing pages into this page)</option>
                  <option value="CREATE_NEW">CREATE NEW (Create distinct sub-page for specialized intent)</option>
                  <option value="IGNORE">IGNORE (Do not optimize or generate for this topic)</option>
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Determines the architectural role for this landing page in the content pipeline.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                  Recommended Action
                </label>
                <select
                  value={recommendedAction}
                  onChange={(e) => setRecommendedAction(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="OPTIMIZE">OPTIMIZE (Enhance content while protecting winning queries)</option>
                  <option value="KEEP">KEEP (Retain current content without major alterations)</option>
                  <option value="MONITOR">MONITOR (Track performance in Search Console before rewriting)</option>
                  <option value="CONSOLIDATE">CONSOLIDATE (Plan 301 redirect or intent absorption)</option>
                  <option value="MANUAL_REVIEW">MANUAL REVIEW (Requires editorial verification of cannibalization)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Protected Components [RETAIN EXISTING] */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Protected SEO Components [RETAIN EXISTING]</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mark high-performing elements to protect them from unintended AI rewrites or ranking regression.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <label className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={protectPrimaryQuery}
                  onChange={(e) => setProtectPrimaryQuery(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <strong className="text-white block">Protect Primary Query</strong>
                  <span className="text-slate-400 text-[11px]">Keep core keyword anchor '{targetQuery}'</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={protectTitle}
                  onChange={(e) => setProtectTitle(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <strong className="text-white block">Protect Page Title</strong>
                  <span className="text-slate-400 text-[11px]">Retain current CTR-validated SERP title</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={protectH1}
                  onChange={(e) => setProtectH1(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <strong className="text-white block">Protect H1 Heading</strong>
                  <span className="text-slate-400 text-[11px]">Retain '{page.h1Heading}'</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={protectSlug}
                  onChange={(e) => setProtectSlug(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <strong className="text-white block">Protect URL Slug</strong>
                  <span className="text-slate-400 text-[11px]">Do not alter slug '/{page.slug}'</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={protectFaqs}
                  onChange={(e) => setProtectFaqs(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <strong className="text-white block">Protect FAQ Schema</strong>
                  <span className="text-slate-400 text-[11px]">Keep existing verified rich answers</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={protectMetaDescription}
                  onChange={(e) => setProtectMetaDescription(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <strong className="text-white block">Protect Meta Snippet</strong>
                  <span className="text-slate-400 text-[11px]">Lock current meta description</span>
                </div>
              </label>
            </div>
          </div>

          {/* Strategy Blueprint Fields */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Content Architecture & Editorial Blueprint</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Queries to Protect (comma separated):</label>
                <input
                  type="text"
                  value={queriesToProtectText}
                  onChange={(e) => setQueriesToProtectText(e.target.value)}
                  placeholder="Queries with strong CTR/impressions in GSC"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Queries to Improve / Striking Distance:</label>
                <input
                  type="text"
                  value={queriesToImproveText}
                  onChange={(e) => setQueriesToImproveText(e.target.value)}
                  placeholder="Queries ranking positions 5-20 with search demand"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-400 block mb-1">Content Angle & Unique Differentiation:</label>
                <textarea
                  rows={2}
                  value={strategyAngle}
                  onChange={(e) => setStrategyAngle(e.target.value)}
                  placeholder="Unique local perspective, ground truth details, avoiding generic guide copy..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-400 block mb-1">Heading Hierarchy Blueprint:</label>
                <input
                  type="text"
                  value={headingDirection}
                  onChange={(e) => setHeadingDirection(e.target.value)}
                  placeholder="H2 structure outline..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-400 block mb-1">Internal Linking Blueprint:</label>
                <input
                  type="text"
                  value={internalLinkingText}
                  onChange={(e) => setInternalLinkingText(e.target.value)}
                  placeholder="Links to parent destination, child attractions, stay listings, taxi fare cards..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {cannibalization.competingPages.length > 0 && (
                <div className="md:col-span-2">
                  <label className="text-slate-400 block mb-1">Competing Pages Resolution Analysis:</label>
                  <textarea
                    rows={2}
                    value={competingPagesAnalysis}
                    onChange={(e) => setCompetingPagesAnalysis(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-amber-300 font-mono text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="text-slate-400 block mb-1">Strategy Notes & Next Steps:</label>
                <textarea
                  rows={2}
                  value={strategyNotes}
                  onChange={(e) => setStrategyNotes(e.target.value)}
                  placeholder="Editorial directions for Stage 3 generation..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Step 2 Footer Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-500">
              {savedStrategy?.strategisedAt ? `Last saved: ${new Date(savedStrategy.strategisedAt).toLocaleString()}` : "Strategy pending save."}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs font-medium"
              >
                ← Back to Research
              </button>

              <button
                type="button"
                onClick={handleSaveStrategy}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition shadow-sm disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Strategy Blueprint</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition border border-slate-700"
              >
                <span>View Stage 3: Generation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* STEPS 3, 4, 5: NEXT PHASE PIPELINE PREVIEWS                   */}
      {/* ============================================================= */}
      {activeStep === 3 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Stage 3 — Content Generation Engine</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Coming in next SEO pipeline phase. Generation will consume the Step 2 Strategy Blueprint while strictly enforcing Protected Components ({protectTitle ? "Title Protected, " : ""}{protectH1 ? "H1 Protected, " : ""}Protected Queries).
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Generation Engine Locked in Step 3</span>
          </div>
          <div className="pt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-medium"
            >
              Back to Strategy Studio
            </button>
          </div>
        </div>
      )}

      {activeStep === 4 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Stage 4 — Automated Validation Engine</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Coming in next SEO pipeline phase. Validation will verify heading tags, meta snippet lengths, keyword presence, and canonical integrity.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Validation Engine Locked in Step 3</span>
          </div>
          <div className="pt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-medium"
            >
              Back to Strategy Studio
            </button>
          </div>
        </div>
      )}

      {activeStep === 5 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Stage 5 — Human Review & Publishing</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Final review of content before transition to PUBLISHED state in public sitemap and canonical index.
            </p>
          </div>
          <div className="pt-4 flex justify-center gap-3">
            <Link
              href={`/admin/seo/${page.id}`}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium"
            >
              Open Page Inspector
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
