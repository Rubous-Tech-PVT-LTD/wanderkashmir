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
  RefreshCw,
  Trash2,
  Edit3,
  Check,
  Copy,
  Sliders,
  HelpCircle,
  Link2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  XCircle,
  Info,
} from "lucide-react";
import {
  SeoResearchStudioPayload,
  SeoResearchData,
  SeoStrategyData,
} from "@/lib/admin/seoStudio";
import {
  saveSeoResearchAction,
  saveSeoStrategyAction,
  generateSeoContentDraftAction,
  saveGeneratedDraftAction,
  discardGeneratedDraftAction,
  runSeoValidationAction,
} from "@/actions/adminSeo";
import { GeneratedDraftContent } from "@/lib/admin/seoGeneration";
import {
  SeoValidationReport,
  SeoValidationIssue,
  ValidationSeverity,
  ValidationCategoryKey,
} from "@/lib/admin/seoValidation";
import { SeoWorkflowState } from "@prisma/client";

interface SeoResearchStudioClientProps {
  payload: SeoResearchStudioPayload;
}

export default function SeoResearchStudioClient({
  payload,
}: SeoResearchStudioClientProps) {
  const router = useRouter();
  const {
    page,
    savedResearch,
    savedStrategy,
    liveGscEvidence,
    matchedOpportunity,
    cannibalization,
    verifiedDbFacts,
    generatedDraft: initialDraft,
    savedValidationReport,
  } = payload;

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(
    page.workflowState === "VALIDATED" || savedValidationReport
      ? 4
      : initialDraft
      ? 3
      : savedStrategy
      ? 2
      : 1
  );

  // Status & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // -------------------------------------------------------------
  // STEP 4 STATE: VALIDATION STUDIO
  // -------------------------------------------------------------
  const [validationReport, setValidationReport] = useState<SeoValidationReport | null>(
    savedValidationReport || (page.validationReport as unknown as SeoValidationReport) || null
  );
  const [isValidating, setIsValidating] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    metadata: true,
    headings: true,
    protectedComponents: true,
    factualAlignment: true,
  });

  // -------------------------------------------------------------
  // STEP 3 STATE: GENERATION STUDIO
  // -------------------------------------------------------------
  const [draft, setDraft] = useState<GeneratedDraftContent | null>(initialDraft || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationTone, setGenerationTone] = useState<
    "professional_authoritative" | "warm_inspirational" | "adventurous_expert"
  >("professional_authoritative");
  const [generationDepth, setGenerationDepth] = useState<"standard" | "comprehensive_deep_dive">(
    "standard"
  );
  const [customInstructions, setCustomInstructions] = useState("");
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [editableDraft, setEditableDraft] = useState<GeneratedDraftContent | null>(initialDraft || null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isDiscardingDraft, setIsDiscardingDraft] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

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

  // -------------------------------------------------------------
  // STEP 3 HANDLERS: GENERATION STUDIO
  // -------------------------------------------------------------
  const handleGenerateDraft = async () => {
    if (!savedResearch) {
      setErrorMsg("Please complete Step 1 (Research) before generating content.");
      return;
    }
    if (!savedStrategy) {
      setErrorMsg("Please complete Step 2 (Strategy) before generating content.");
      return;
    }

    setIsGenerating(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    setShowRegenerateConfirm(false);

    try {
      const res = await generateSeoContentDraftAction(page.id, {
        tone: generationTone,
        depth: generationDepth,
        customInstructions: customInstructions.trim() || undefined,
      });

      if (res.success && res.data) {
        setDraft(res.data);
        setEditableDraft(res.data);
        setSuccessMsg("AI content draft generated successfully and stored in draft asset!");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Generation failed to produce a valid draft.");
      }
    } catch {
      setErrorMsg("Network error communicating with Generation service.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEditedDraft = async () => {
    if (!editableDraft) return;
    setIsSavingDraft(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await saveGeneratedDraftAction(page.id, editableDraft);
      if (res.success) {
        setDraft(editableDraft);
        setIsEditingDraft(false);
        setSuccessMsg("Manual edits saved to generated draft successfully.");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to save draft edits.");
      }
    } catch {
      setErrorMsg("Network error saving draft edits.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleDiscardDraft = async () => {
    setIsDiscardingDraft(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    setShowDiscardConfirm(false);

    try {
      const res = await discardGeneratedDraftAction(page.id);
      if (res.success) {
        setDraft(null);
        setEditableDraft(null);
        setIsEditingDraft(false);
        setSuccessMsg("Draft discarded. Workflow state returned to Strategy.");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to discard draft.");
      }
    } catch {
      setErrorMsg("Network error discarding draft.");
    } finally {
      setIsDiscardingDraft(false);
    }
  };

  const handleRunValidation = async () => {
    setIsValidating(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await runSeoValidationAction(page.id);
      if (res.success && res.data) {
        setValidationReport(res.data);
        if (res.data.overallStatus === "PASS") {
          setSuccessMsg("Validation completed: All checks passed! Content is ready for Human Review.");
        } else if (res.data.overallStatus === "WARNING") {
          setSuccessMsg("Validation completed with minor warnings. Content is acceptable for Human Review.");
        } else {
          setErrorMsg("Validation completed with errors/critical issues. Review issues below before review.");
        }
        // Expand all categories that have issues or warnings
        const newExpanded: Record<string, boolean> = {};
        Object.entries(res.data.categories).forEach(([k, cat]) => {
          if (cat.errorCount > 0 || cat.criticalCount > 0 || cat.warningCount > 0) {
            newExpanded[k] = true;
          }
        });
        setExpandedCategories(newExpanded);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to execute SEO validation.");
      }
    } catch {
      setErrorMsg("Network error executing validation.");
    } finally {
      setIsValidating(false);
    }
  };

  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
          ) : activeStep === 3 && draft ? (
            <div className="flex items-center gap-2">
              {isEditingDraft ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingDraft(false);
                      setEditableDraft(draft);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditedDraft}
                    disabled={isSavingDraft}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
                  >
                    {isSavingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Draft Edits</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingDraft(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium"
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Edit Draft</span>
                </button>
              )}
            </div>
          ) : activeStep === 4 && draft ? (
            <button
              type="button"
              onClick={handleRunValidation}
              disabled={isValidating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow-sm disabled:opacity-50"
            >
              {isValidating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>{validationReport ? "Re-run Validation" : "Run Validation"}</span>
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
            {
              step: 3,
              title: "3. Generation",
              desc: "AI Draft Studio",
              active: activeStep === 3,
              done: !!draft || ["GENERATED", "VALIDATED", "PUBLISHED"].includes(page.workflowState),
              locked: false,
            },
            {
              step: 4,
              title: "4. Validation",
              desc: "Audit & Consistency",
              active: activeStep === 4,
              done: !!validationReport || page.workflowState === "VALIDATED",
              locked: false,
            },
            {
              step: 5,
              title: "5. Review & Publish",
              desc: "Human Review",
              active: activeStep === 5,
              done: page.workflowState === "PUBLISHED",
              locked: true,
            },
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
      {/* ============================================================= */}
      {/* STEP 3: CONTENT GENERATION STUDIO                             */}
      {/* ============================================================= */}
      {activeStep === 3 && (
        <div className="space-y-6">
          {/* Prerequisites Warning if Research or Strategy missing */}
          {(!savedResearch || !savedStrategy) && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Prerequisites Incomplete</span>
              </div>
              <p className="text-slate-300">
                AI Generation requires a completed Research context and Strategy blueprint.
                {!savedResearch && " Please complete Step 1 (Research)."}
                {!savedStrategy && " Please complete Step 2 (Strategy)."}
              </p>
              <div className="flex items-center gap-3 pt-2">
                {!savedResearch && (
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/30 text-amber-200 text-xs font-medium"
                  >
                    Go to Step 1 (Research)
                  </button>
                )}
                {!savedStrategy && (
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/30 text-amber-200 text-xs font-medium"
                  >
                    Go to Step 2 (Strategy)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Strategy Context & Ground-Truth Strip */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Stage 3 — Research-Backed AI Generation</h3>
                  <p className="text-xs text-slate-400">
                    Target Query: <span className="text-purple-300 font-semibold">{targetQuery || page.title}</span> • Intent: <span className="capitalize text-slate-300">{searchIntent}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-950 border border-slate-800 text-slate-300">
                  Decision: <strong className="text-white">{adminDecision}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-950 border border-slate-800 text-slate-300">
                  Action: <strong className="text-cyan-400">{recommendedAction}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  {verifiedDbFacts.length} DB Facts
                </span>
              </div>
            </div>

            {/* Protected Elements Badges */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400 font-medium">Protected Elements ([RETAIN EXISTING]):</span>
              {protectTitle && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Title
                </span>
              )}
              {protectH1 && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  H1 Heading
                </span>
              )}
              {protectMetaDescription && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Meta Snippet
                </span>
              )}
              {protectPrimaryQuery && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Primary Query
                </span>
              )}
              {protectFaqs && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Existing FAQs
                </span>
              )}
              {!protectTitle && !protectH1 && !protectMetaDescription && !protectPrimaryQuery && !protectFaqs && (
                <span className="text-slate-500 italic">None designated (full optimization allowed)</span>
              )}
            </div>
          </div>

          {/* Setup & Generation Controls (If no draft or regenerating) */}
          {(!draft || showRegenerateConfirm) && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Generation Parameters</span>
                </h4>
                {showRegenerateConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowRegenerateConfirm(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel Regeneration
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Brand Voice & Tone:</label>
                  <select
                    value={generationTone}
                    onChange={(e: any) => setGenerationTone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="professional_authoritative">Professional & Authoritative (Recommended)</option>
                    <option value="warm_inspirational">Warm & Inspirational</option>
                    <option value="adventurous_expert">Adventurous & High-Altitude Expert</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Content Depth:</label>
                  <select
                    value={generationDepth}
                    onChange={(e: any) => setGenerationDepth(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="standard">Standard Expert Guide (1,200 - 1,800 words)</option>
                    <option value="comprehensive_deep_dive">Comprehensive Deep Dive (2,000+ words with itinerary/tips)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-400 block mb-1">Custom Editorial Instructions (Optional):</label>
                  <input
                    type="text"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g., Emphasize private 4x4 transport in winter, highlight verified boutique homestays..."
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Production Safety Guarantees:</span>
                </div>
                <p>
                  • Generation writes exclusively to a draft ContentAsset. The published page content remains 100% untouched.
                </p>
                <p>
                  • Factual information is strictly bounded by the {verifiedDbFacts.length} verified database records.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Powered by Gemini 2.5 Flash • Structured JSON Mode
                </div>

                <button
                  type="button"
                  onClick={handleGenerateDraft}
                  disabled={isGenerating || !savedResearch || !savedStrategy}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-medium text-xs shadow-md transition disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating SEO Content...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{draft ? "Confirm & Regenerate Draft" : "Generate SEO Content Draft"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Generated Draft Display & Review Workspace */}
          {draft && !showRegenerateConfirm && (
            <div className="space-y-6">
              {/* Draft Status Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/60 border border-cyan-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Active Content Draft</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        ContentAsset: DRAFT
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Generated: {draft.generatedAt ? new Date(draft.generatedAt).toLocaleString() : "Recently"} via {draft.model || "gemini-2.5-flash"} • Live page remains untouched.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  {isEditingDraft ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingDraft(false);
                          setEditableDraft(draft);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEditedDraft}
                        disabled={isSavingDraft}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
                      >
                        {isSavingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Save Edits</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsEditingDraft(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Edit Draft</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRegenerateConfirm(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 text-xs font-medium"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Regenerate</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDiscardConfirm(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Discard</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* SERP Snippet Preview (Google Result Mockup) */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Search Engine Snippet Preview (SERP)</span>
                  </h4>
                  {protectTitle && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>[RETAIN EXISTING] Title Protected</span>
                    </span>
                  )}
                </div>

                {isEditingDraft ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Page Meta Title:</label>
                      <input
                        type="text"
                        value={editableDraft?.title || ""}
                        onChange={(e) =>
                          setEditableDraft((prev) => (prev ? { ...prev, title: e.target.value } : null))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Meta Description:</label>
                      <textarea
                        rows={2}
                        value={editableDraft?.metaDescription || ""}
                        onChange={(e) =>
                          setEditableDraft((prev) => (prev ? { ...prev, metaDescription: e.target.value } : null))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 max-w-2xl font-sans">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1 font-mono">
                      <span>https://wanderkashmir.com/{page.type.toLowerCase()}s/{page.slug}</span>
                    </div>
                    <div className="text-base text-cyan-400 hover:underline cursor-pointer font-medium line-clamp-1">
                      {draft.title}
                    </div>
                    <div className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {draft.metaDescription}
                    </div>
                  </div>
                )}
              </div>

              {/* H1 & Main Content Body */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    <span>Primary Heading & Content Body</span>
                  </h4>
                  {protectH1 && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>[RETAIN EXISTING] H1 Protected</span>
                    </span>
                  )}
                </div>

                {isEditingDraft ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">H1 Heading:</label>
                      <input
                        type="text"
                        value={editableDraft?.h1Heading || ""}
                        onChange={(e) =>
                          setEditableDraft((prev) => (prev ? { ...prev, h1Heading: e.target.value } : null))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Markdown Content Body:</label>
                      <textarea
                        rows={16}
                        value={editableDraft?.content || ""}
                        onChange={(e) =>
                          setEditableDraft((prev) => (prev ? { ...prev, content: e.target.value } : null))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 leading-relaxed"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white tracking-tight">{draft.h1Heading}</h2>
                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 sm:p-6 text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-sans space-y-3 max-h-[600px] overflow-y-auto">
                      {draft.content}
                    </div>
                  </div>
                )}
              </div>

              {/* FAQs Section */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Frequently Asked Questions ({draft.faqs?.length || 0})</span>
                  </h4>
                  {protectFaqs && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Existing FAQs Retained</span>
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {draft.faqs && draft.faqs.length > 0 ? (
                    draft.faqs.map((f, i) => (
                      <div key={i} className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 space-y-1">
                        <div className="font-semibold text-white text-xs flex items-center gap-2">
                          <span className="text-cyan-400 font-mono">Q{i + 1}:</span>
                          <span>{f.question}</span>
                        </div>
                        <p className="text-slate-300 text-xs pl-6">{f.answer}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No FAQs generated.</p>
                  )}
                </div>
              </div>

              {/* Internal Link Suggestions */}
              {draft.internalLinkSuggestions && draft.internalLinkSuggestions.length > 0 && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Recommended Internal Links (Verified Real Routes)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {draft.internalLinkSuggestions.map((l, i) => (
                      <div key={i} className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">"{l.anchorText}"</span>
                          <span className="font-mono text-[10px] text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                            {l.url}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{l.context}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEO Strategic Alignment Notes */}
              {draft.seoNotes && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-1">
                  <strong className="text-slate-300">Strategic Alignment Notes:</strong>
                  <p>{draft.seoNotes}</p>
                </div>
              )}

              {/* Stage 3 Footer Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs font-medium"
                >
                  ← Back to Strategy Studio
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep(4)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition shadow-sm"
                  >
                    <span>Proceed to Stage 4: Validation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Discard Confirmation Modal */}
          {showDiscardConfirm && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4">
                <div className="flex items-center gap-3 text-rose-400">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <h3 className="text-sm font-bold text-white">Discard Content Draft?</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This will remove the current generated draft from ContentAsset and reset the workflow state from GENERATED back to STRATEGISED.
                </p>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDiscardConfirm(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardDraft}
                    disabled={isDiscardingDraft}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium disabled:opacity-50"
                  >
                    {isDiscardingDraft ? "Discarding..." : "Yes, Discard Draft"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeStep === 4 && (
        <div className="space-y-6">
          {!draft ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Draft Generation Required</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Generate a content draft before running validation. Validation audits the generated draft against your Research data, Strategy blueprint, and Ground-Truth database records.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Go to Stage 3: Generation Studio</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Target Identification Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Target: Generated Draft</span>
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Asset ID: {draft.assetId || "Latest Draft"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500">Page: </span>
                    <strong className="text-white">{page.title}</strong>
                    <span className="text-slate-500 font-mono"> (/{page.slug})</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                    <span>
                      Generated:{" "}
                      <strong className="text-slate-300">
                        {draft.generatedAt ? new Date(draft.generatedAt).toLocaleString() : "Latest session"}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Workflow State:{" "}
                      <strong className="font-mono text-cyan-400">{page.workflowState}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                  {validationReport ? (
                    <span
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        validationReport.overallStatus === "PASS"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : validationReport.overallStatus === "WARNING"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {validationReport.overallStatus === "PASS" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : validationReport.overallStatus === "WARNING" ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span>Overall: {validationReport.overallStatus}</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs font-medium">
                      Not Yet Validated
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleRunValidation}
                    disabled={isValidating}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow-sm disabled:opacity-50"
                  >
                    {isValidating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span>{validationReport ? "Re-run Validation" : "Run Validation"}</span>
                  </button>
                </div>
              </div>

              {/* Validation Summary Metrics */}
              {validationReport && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Checks</div>
                      <div className="text-xl font-bold text-white font-mono">{validationReport.metrics.totalChecks}</div>
                      <div className="text-[10px] text-slate-500">11 Categories</div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Checks Passed</div>
                      <div className="text-xl font-bold text-emerald-400 font-mono">{validationReport.metrics.passedChecks}</div>
                      <div className="text-[10px] text-slate-500">Satisfies rules</div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Warnings</div>
                      <div className="text-xl font-bold text-amber-400 font-mono">{validationReport.metrics.warnings}</div>
                      <div className="text-[10px] text-slate-500">Non-blocking</div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-rose-400">Errors</div>
                      <div className="text-xl font-bold text-rose-400 font-mono">{validationReport.metrics.errors}</div>
                      <div className="text-[10px] text-slate-500">Requires fix</div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-rose-500">Critical</div>
                      <div className="text-xl font-bold text-rose-500 font-mono">{validationReport.metrics.criticals}</div>
                      <div className="text-[10px] text-slate-500">Blocks publish</div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">Content Stats</div>
                      <div className="text-xs font-bold text-white font-mono mt-1">{validationReport.wordCount} words</div>
                      <div className="text-[10px] text-cyan-400 font-mono">{validationReport.keywordDensity.toFixed(2)}% density</div>
                    </div>
                  </div>

                  {/* Human Review & Publish Handoff Notice */}
                  <div
                    className={`rounded-xl border p-4 sm:p-5 flex items-start gap-3.5 ${
                      validationReport.overallStatus === "PASS" || validationReport.overallStatus === "WARNING"
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-950/20 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {validationReport.overallStatus === "PASS" || validationReport.overallStatus === "WARNING" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-sm text-white">
                        {validationReport.overallStatus === "PASS" || validationReport.overallStatus === "WARNING"
                          ? "Ready for Human Review & Publishing (Stage 5)"
                          : "Changes Required Before Human Review"}
                      </h4>
                      <p className="text-slate-300 leading-relaxed">
                        {validationReport.overallStatus === "PASS"
                          ? "This draft has satisfied all critical SEO validation criteria and protected component constraints. It is ready for human editorial review."
                          : validationReport.overallStatus === "WARNING"
                          ? "Draft has non-blocking warnings (e.g. secondary query coverage or minor length variances). It is acceptable for human editorial review."
                          : "Draft has critical or blocking errors (such as altered protected titles/H1s or unresolved factual placeholders). Resolve them before proceeding."}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Validated at {new Date(validationReport.validatedAt).toLocaleString()} • Note: Validation does not automatically publish or modify live website content.
                      </p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {validationReport.recommendations && validationReport.recommendations.length > 0 && (
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Actionable Optimization Recommendations ({validationReport.recommendations.length})</span>
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        {validationReport.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-2 text-slate-300 bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5">
                            <span className="text-cyan-400 font-bold shrink-0">{i + 1}.</span>
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 11 Category Cards */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Category Audit Breakdown (11 Rulesets)
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          const allOpen = Object.values(expandedCategories).some(Boolean);
                          const next: Record<string, boolean> = {};
                          if (!allOpen) {
                            [
                              "metadata",
                              "headings",
                              "searchIntent",
                              "primaryQuery",
                              "secondaryQueries",
                              "keywordUsage",
                              "completeness",
                              "factualAlignment",
                              "protectedComponents",
                              "internalLinks",
                              "faqs",
                            ].forEach((k) => (next[k] = true));
                          }
                          setExpandedCategories(next);
                        }}
                        className="text-[11px] text-cyan-400 hover:underline"
                      >
                        {Object.values(expandedCategories).some(Boolean) ? "Collapse All" : "Expand All"}
                      </button>
                    </div>

                    {[
                      { key: "metadata" as const, label: "SEO Metadata", icon: Tag },
                      { key: "headings" as const, label: "Heading Hierarchy", icon: Layers },
                      { key: "searchIntent" as const, label: "Search Intent Alignment", icon: Crosshair },
                      { key: "primaryQuery" as const, label: "Primary Target Query", icon: Search },
                      { key: "secondaryQueries" as const, label: "Secondary Query Coverage", icon: TrendingUp },
                      { key: "keywordUsage" as const, label: "Keyword Density & Usage", icon: BarChart3 },
                      { key: "completeness" as const, label: "Content Completeness", icon: FileText },
                      { key: "factualAlignment" as const, label: "Ground-Truth Factual Alignment", icon: Database },
                      { key: "protectedComponents" as const, label: "Protected Components [RETAIN EXISTING]", icon: Lock },
                      { key: "internalLinks" as const, label: "Internal Linking (Real Routes)", icon: Link2 },
                      { key: "faqs" as const, label: "FAQ Consistency & Quality", icon: HelpCircle },
                    ].map((catMeta) => {
                      const cat = validationReport.categories[catMeta.key];
                      if (!cat) return null;
                      const Icon = catMeta.icon;
                      const isExpanded = !!expandedCategories[catMeta.key];

                      return (
                        <div
                          key={catMeta.key}
                          className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden transition"
                        >
                          <div
                            onClick={() => toggleCategory(catMeta.key)}
                            className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-800/40 transition gap-2"
                          >
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  cat.status === "PASS"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : cat.status === "WARNING"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-white">{catMeta.label}</span>

                              <div className="flex items-center gap-1.5 text-[10px]">
                                {cat.criticalCount > 0 && (
                                  <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                                    {cat.criticalCount} Critical
                                  </span>
                                )}
                                {cat.errorCount > 0 && (
                                  <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                                    {cat.errorCount} Error{cat.errorCount > 1 ? "s" : ""}
                                  </span>
                                )}
                                {cat.warningCount > 0 && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                                    {cat.warningCount} Warning{cat.warningCount > 1 ? "s" : ""}
                                  </span>
                                )}
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                  {cat.passedCount} Passed
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  cat.status === "PASS"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : cat.status === "WARNING"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                }`}
                              >
                                {cat.status}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-4 pt-1 border-t border-slate-800/80 space-y-3 bg-slate-950/40">
                              {cat.issues.length === 0 ? (
                                <div className="text-xs text-emerald-400 flex items-center gap-2 p-2 rounded bg-emerald-500/5 border border-emerald-500/10">
                                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                                  <span>All configured checks in this category passed.</span>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {cat.issues.map((issue, idx) => (
                                    <div
                                      key={idx}
                                      className={`rounded-lg p-3 space-y-2 text-xs border ${
                                        issue.severity === "CRITICAL"
                                          ? "bg-rose-950/40 border-rose-600/60"
                                          : issue.severity === "ERROR"
                                          ? "bg-rose-950/20 border-rose-500/40"
                                          : issue.severity === "WARNING"
                                          ? "bg-amber-950/20 border-amber-500/40"
                                          : "bg-slate-900 border-slate-800"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 font-semibold text-white">
                                          <span
                                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                              issue.severity === "CRITICAL"
                                                ? "bg-rose-900 text-rose-200 border border-rose-600"
                                                : issue.severity === "ERROR"
                                                ? "bg-rose-900/60 text-rose-300 border border-rose-500"
                                                : issue.severity === "WARNING"
                                                ? "bg-amber-900/60 text-amber-300 border border-amber-500"
                                                : "bg-blue-900/60 text-blue-300 border border-blue-500"
                                            }`}
                                          >
                                            {issue.severity}
                                          </span>
                                          <span>{issue.title}</span>
                                        </div>
                                      </div>

                                      <p className="text-slate-300">{issue.message}</p>

                                      {(issue.expected || issue.observed) && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                                          {issue.expected && (
                                            <div className="p-2 rounded bg-slate-900 border border-slate-800 space-y-1">
                                              <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                                                Expected / Ground-Truth:
                                              </div>
                                              <div className="text-slate-300 break-all">{issue.expected}</div>
                                            </div>
                                          )}
                                          {issue.observed && (
                                            <div className="p-2 rounded bg-slate-900 border border-slate-800 space-y-1">
                                              <div className="text-[10px] text-rose-400 uppercase tracking-wider">
                                                Observed in Draft:
                                              </div>
                                              <div className="text-rose-300 break-all">{issue.observed}</div>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {issue.recommendation && (
                                        <div className="p-2 rounded bg-cyan-950/20 border border-cyan-800/40 text-[11px] text-cyan-300 flex items-start gap-1.5">
                                          <span className="font-semibold shrink-0">Recommendation:</span>
                                          <span>{issue.recommendation}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {cat.passedCount > 0 && cat.issues.length > 0 && (
                                <details className="text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                                  <summary className="cursor-pointer hover:text-slate-200 select-none font-medium">
                                    View {cat.passedCount} passed check{cat.passedCount > 1 ? "s" : ""}
                                  </summary>
                                  <div className="mt-2 space-y-1 pl-2 border-l border-slate-800">
                                    {validationReport.passedChecks
                                      .filter((c) => c.category === catMeta.key)
                                      .map((p, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-slate-400 text-[11px]">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                          <span className="font-medium text-slate-300">{p.title}:</span>
                                          <span>{p.message}</span>
                                        </div>
                                      ))}
                                  </div>
                                </details>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Stage 4 Footer Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs font-medium"
                >
                  ← Back to AI Generation Studio
                </button>

                {validationReport &&
                  (validationReport.overallStatus === "PASS" || validationReport.overallStatus === "WARNING") && (
                    <button
                      type="button"
                      onClick={() => setActiveStep(5)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition shadow-sm"
                    >
                      <span>Proceed to Stage 5: Review & Publish Preview</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
              </div>
            </div>
          )}
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
