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
  Compass,
  ArrowRight,
  Crosshair,
  RefreshCw,
  Trash2,
  Edit3,
  Sliders,
  HelpCircle,
  Link2,
  ChevronDown,
  ChevronUp,
  XCircle,
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
import { SeoValidationReport } from "@/lib/admin/seoValidation";
import {
  AdminToastBanner,
  ConfirmActionDialog,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

interface SeoResearchStudioClientProps {
  payload: SeoResearchStudioPayload;
}

export default function SeoResearchStudioClient({
  payload,
}: SeoResearchStudioClientProps) {
  const router = useRouter();
  const basePath = useAdminBasePath();
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
  const [toast, setToast] = useState<FeedbackMessage | null>(null);

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
  const [contentAngle] = useState(
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
    setToast(null);

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
        setToast({
          type: "success",
          text: "SEO research findings saved successfully into page record.",
        });
        router.refresh();
      } else {
        setToast({
          type: "error",
          text: res.error || "Failed to save research findings.",
        });
      }
    } catch {
      setToast({ type: "error", text: "Network error saving research findings." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStrategy = async () => {
    setIsSaving(true);
    setToast(null);

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
        setToast({
          type: "success",
          text: "SEO strategy blueprint saved successfully into page record.",
        });
        router.refresh();
      } else {
        setToast({
          type: "error",
          text: res.error || "Failed to save strategy blueprint.",
        });
      }
    } catch {
      setToast({ type: "error", text: "Network error saving strategy blueprint." });
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 3 HANDLERS: GENERATION STUDIO
  // -------------------------------------------------------------
  const handleGenerateDraft = async () => {
    if (!savedResearch) {
      setToast({
        type: "error",
        text: "Please complete Step 1 (Research) before generating content.",
      });
      return;
    }
    if (!savedStrategy) {
      setToast({
        type: "error",
        text: "Please complete Step 2 (Strategy) before generating content.",
      });
      return;
    }

    setIsGenerating(true);
    setToast(null);
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
        setToast({
          type: "success",
          text: "AI content draft generated and stored as a draft asset.",
        });
        router.refresh();
      } else {
        setToast({
          type: "error",
          text: res.error || "Generation failed to produce a valid draft.",
        });
      }
    } catch {
      setToast({
        type: "error",
        text: "Network error communicating with generation service.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEditedDraft = async () => {
    if (!editableDraft) return;
    setIsSavingDraft(true);
    setToast(null);

    try {
      const res = await saveGeneratedDraftAction(page.id, editableDraft);
      if (res.success) {
        setDraft(editableDraft);
        setIsEditingDraft(false);
        setToast({
          type: "success",
          text: "Manual edits saved to generated draft successfully.",
        });
        router.refresh();
      } else {
        setToast({
          type: "error",
          text: res.error || "Failed to save draft edits.",
        });
      }
    } catch {
      setToast({ type: "error", text: "Network error saving draft edits." });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleDiscardDraft = async () => {
    setToast(null);
    const res = await discardGeneratedDraftAction(page.id);
    if (!res.success) {
      throw new Error(res.error || "Failed to discard draft.");
    }
    setDraft(null);
    setEditableDraft(null);
    setIsEditingDraft(false);
    setShowDiscardConfirm(false);
    setToast({
      type: "success",
      text: "Draft discarded. Workflow state returned to Strategy.",
    });
    router.refresh();
  };

  const handleRunValidation = async () => {
    setIsValidating(true);
    setToast(null);

    try {
      const res = await runSeoValidationAction(page.id);
      if (res.success && res.data) {
        setValidationReport(res.data);
        if (res.data.overallStatus === "PASS") {
          setToast({
            type: "success",
            text: "Validation completed: All checks passed. Content is ready for Human Review.",
          });
        } else if (res.data.overallStatus === "WARNING") {
          setToast({
            type: "warning",
            text: "Validation completed with minor warnings. Content is acceptable for Human Review.",
          });
        } else {
          setToast({
            type: "error",
            text: "Validation completed with errors or critical issues. Review issues below before proceeding.",
          });
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
        setToast({
          type: "error",
          text: res.error || "Failed to execute SEO validation.",
        });
      }
    } catch {
      setToast({ type: "error", text: "Network error executing validation." });
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


  const cardClass = "rounded-md border border-slate-200/90 bg-white p-5 space-y-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]";
  const inputClass =
    "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--season-primary)]/15 transition-colors";
  const labelClass = "block text-xs font-medium text-slate-700 mb-1.5";

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 rounded-md border border-slate-200/90 bg-white p-5 sm:flex-row sm:items-center sm:justify-between shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Link
              href={`${basePath}/seo/${page.id}`}
              className="inline-flex items-center gap-1 hover:text-[var(--season-primary)] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Page Inspector</span>
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-700">Research &amp; Strategy Studio</span>
          </div>

          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            <Sparkles className="h-5 w-5 shrink-0 text-[var(--season-primary)]" />
            <span className="truncate">{page.title}</span>
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-slate-600">
              /{page.slug}
            </span>
            <StatusBadge status={page.type} tone="slate" />
            <StatusBadge status={page.workflowState} label={`State: ${page.workflowState}`} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
          {activeStep === 1 ? (
            <button
              type="button"
              onClick={handleSaveResearch}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Save Research Data</span>
            </button>
          ) : activeStep === 2 ? (
            <button
              type="button"
              onClick={handleSaveStrategy}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
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
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditedDraft}
                    disabled={isSavingDraft}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingDraft ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    <span>Save Draft Edits</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingDraft(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5 text-[var(--season-primary)]" />
                  <span>Edit Draft</span>
                </button>
              )}
            </div>
          ) : activeStep === 4 && draft ? (
            <button
              type="button"
              onClick={handleRunValidation}
              disabled={isValidating}
              className="inline-flex items-center gap-2 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isValidating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              <span>{validationReport ? "Re-run Validation" : "Run Validation"}</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Notifications */}
      <AdminToastBanner message={toast} onDismiss={() => setToast(null)} />

      {/* 5-Step Workflow Stepper */}
      <div className="overflow-x-auto rounded-md border border-slate-200/90 bg-white p-3 sm:p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex min-w-[650px] items-center justify-between gap-2">
          {(
            [
              { step: 1 as const, title: "1. Research", desc: "Evidence & GSC", active: activeStep === 1, done: !!savedResearch, locked: false },
              { step: 2 as const, title: "2. Strategy", desc: "Decisions & Protect", active: activeStep === 2, done: !!savedStrategy, locked: false },
              {
                step: 3 as const,
                title: "3. Generation",
                desc: "AI Draft Studio",
                active: activeStep === 3,
                done: !!draft || ["GENERATED", "VALIDATED", "PUBLISHED"].includes(page.workflowState),
                locked: false,
              },
              {
                step: 4 as const,
                title: "4. Validation",
                desc: "Audit & Consistency",
                active: activeStep === 4,
                done: !!validationReport || page.workflowState === "VALIDATED",
                locked: false,
              },
              {
                step: 5 as const,
                title: "5. Review & Publish",
                desc: "Human Review",
                active: activeStep === 5,
                done: page.workflowState === "PUBLISHED",
                locked: true,
              },
            ]
          ).map((s, idx) => (
            <React.Fragment key={s.step}>
              <button
                type="button"
                onClick={() => setActiveStep(s.step)}
                className={`flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left transition-colors ${
                  s.active
                    ? "border border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] text-slate-900"
                    : s.done
                    ? "text-[var(--season-primary)] hover:bg-slate-50"
                    : s.locked
                    ? "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    s.active
                      ? "bg-[var(--season-primary)] text-white"
                      : s.done
                      ? "border border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] text-[var(--season-primary-hover)]"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {s.done ? "✓" : s.step}
                </div>
                <div>
                  <div className="text-xs font-semibold">{s.title}</div>
                  <div className="text-[11px] text-slate-500">{s.desc}</div>
                </div>
              </button>
              {idx < 4 && <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />}
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
          <div className={cardClass}>
            <h2 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-semibold text-slate-900">
              <Search className="h-4 w-4 text-[var(--season-primary)]" />
              <span>Target Topic &amp; Search Intent</span>
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className={labelClass}>
                  Primary Target Query <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={targetQuery}
                  onChange={(e) => setTargetQuery(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Search Intent</label>
                <select
                  value={searchIntent}
                  onChange={(e) =>
                    setSearchIntent(
                      e.target.value as
                        | "informational"
                        | "commercial"
                        | "transactional"
                        | "local"
                        | "unknown"
                    )
                  }
                  className={inputClass}
                >
                  <option value="informational">Informational (Guides, Tips, Culture)</option>
                  <option value="commercial">Commercial (Best Stays, Comparison, Itineraries)</option>
                  <option value="transactional">Transactional (Book Tour, Hire Taxi)</option>
                  <option value="local">Local (Distances, Nearest Airport, Fares)</option>
                  <option value="unknown">Unknown / Mixed</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Secondary Queries (comma separated)</label>
                <input
                  type="text"
                  value={secondaryQueriesText}
                  onChange={(e) => setSecondaryQueriesText(e.target.value)}
                  placeholder="e.g. srinagar weather, srinagar houseboats, best time"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Evidence Grid: Live GSC + Production Opportunities */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Live GSC Evidence */}
            <div className="space-y-3 rounded-md border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                  <Globe className="h-4 w-4 text-[var(--season-primary)]" />
                  <span>Search Console Evidence</span>
                </h3>
                {liveGscEvidence.hasData ? (
                  <StatusBadge status="ACTIVE" label="Live Data Found" tone="season" />
                ) : (
                  <StatusBadge status="NONE" label="No Direct Data" tone="slate" />
                )}
              </div>

              {liveGscEvidence.hasData ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5 text-center sm:grid-cols-4">
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Clicks</div>
                      <div className="text-base font-semibold text-slate-900">{liveGscEvidence.clicks}</div>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Impressions</div>
                      <div className="text-base font-semibold text-slate-900">{liveGscEvidence.impressions}</div>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">CTR</div>
                      <div className="text-base font-semibold text-[var(--season-primary)]">{liveGscEvidence.ctr.toFixed(1)}%</div>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Avg Pos</div>
                      <div className="text-base font-semibold text-amber-700">{liveGscEvidence.position.toFixed(1)}</div>
                    </div>
                  </div>

                  {liveGscEvidence.topQueries.length > 0 && (
                    <div className="pt-1">
                      <div className="mb-1.5 text-[11px] font-medium text-slate-500">Top Verified Queries</div>
                      <div className="space-y-1.5">
                        {liveGscEvidence.topQueries.map((q, idx) => (
                          <div
                            key={idx}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs"
                          >
                            <span className="font-medium text-slate-800">{q.query}</span>
                            <span className="font-mono text-[11px] text-slate-500">
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
            <div className="space-y-3 rounded-md border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span>Production SEO Opportunities</span>
                </h3>
                {matchedOpportunity?.found ? (
                  <StatusBadge
                    status="SCORE"
                    label={`Score: ${matchedOpportunity.opportunityScore}`}
                    tone="amber"
                  />
                ) : (
                  <StatusBadge status="NONE" label="None Linked" tone="slate" />
                )}
              </div>

              {matchedOpportunity?.found ? (
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500">Discovered Topic</span>
                    <strong className="text-slate-900">{matchedOpportunity.topic}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500">Action Type</span>
                    <StatusBadge status={matchedOpportunity.type || "OPPORTUNITY"} tone="season" />
                  </div>
                  {matchedOpportunity.evidence && (
                    <div className="pt-1">
                      <span className="mb-1 block text-[11px] font-medium text-slate-500">
                        Opportunity Evidence
                      </span>
                      <p className="rounded-md border border-slate-200 bg-slate-50 p-2.5 text-xs leading-relaxed text-slate-700">
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
          <div className={cardClass}>
            <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Internal Keyword Cannibalization Check</span>
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Automated scan of landing pages, live tours, stays, and places for target keyword overlap.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge
                  status={cannibalization.status}
                  label={cannibalization.status.replace("_", " ")}
                  tone={
                    cannibalization.status === "HIGH_RISK"
                      ? "rose"
                      : cannibalization.status === "MEDIUM_RISK"
                      ? "amber"
                      : "season"
                  }
                />
                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-700">
                  {cannibalization.recommendation}
                </span>
              </div>
            </div>

            <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
              {cannibalization.reason}
            </p>

            {cannibalization.competingPages.length > 0 && (
              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-2.5">Competing Record</th>
                      <th className="px-3 py-2.5">Entity Type</th>
                      <th className="px-3 py-2.5">URL Path</th>
                      <th className="px-3 py-2.5 text-right">Intent Match</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cannibalization.competingPages.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50/80">
                        <td className="px-3 py-2.5 font-medium text-slate-900">{c.title}</td>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600">{c.entityType}</td>
                        <td className="px-3 py-2.5">
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[var(--season-primary)] hover:underline"
                          >
                            <span>{c.url}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <StatusBadge
                            status={c.intentAlignment}
                            tone={c.intentAlignment === "HIGH" ? "rose" : "amber"}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Verified Database Facts Card */}
          <div className="space-y-3 rounded-md border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <h3 className="flex items-center gap-2 border-b border-slate-100 pb-2.5 text-sm font-semibold text-slate-900">
              <Database className="h-4 w-4 text-[var(--season-primary)]" />
              <span>Verified Database Facts</span>
              <span className="rounded-full border border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] px-2 py-0.5 text-[10px] font-medium text-[var(--season-primary-hover)]">
                Ground Truth
              </span>
            </h3>

            <div className="space-y-2">
              {verifiedDbFacts.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-md border border-slate-200 bg-slate-50/70 p-2.5 text-xs"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--season-primary)]" />
                  <span className="text-slate-700">{f.fact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Manual Competitor & Trend Evidence Forms */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Competitor / SERP Observation Form */}
            <div className="space-y-3 rounded-md border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <h3 className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                <Compass className="h-4 w-4 text-[var(--season-primary)]" />
                <span>Manual Competitor / SERP Evidence</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className={labelClass}>Top Competitor URL</label>
                  <input
                    type="url"
                    value={competitorUrl}
                    onChange={(e) => setCompetitorUrl(e.target.value)}
                    placeholder="https://competitor.com/kashmir-guide"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Competitor Title</label>
                  <input
                    type="text"
                    value={competitorTitle}
                    onChange={(e) => setCompetitorTitle(e.target.value)}
                    placeholder="e.g. Complete Kashmir Travel Guide 2026"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Topics Covered (comma separated)</label>
                  <input
                    type="text"
                    value={topicsCoveredText}
                    onChange={(e) => setTopicsCoveredText(e.target.value)}
                    placeholder="e.g. itinerary, hotels, weather, local food"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Missing Topics / Content Gaps</label>
                  <input
                    type="text"
                    value={missingTopicsText}
                    onChange={(e) => setMissingTopicsText(e.target.value)}
                    placeholder="e.g. verified taxi rate cards, direct vendor booking"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>SERP Notes</label>
                  <textarea
                    rows={2}
                    value={competitorNotes}
                    onChange={(e) => setCompetitorNotes(e.target.value)}
                    placeholder="Observed ranking patterns, featured snippet formats..."
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Keyword Trends Observation Form */}
            <div className="space-y-3 rounded-md border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <h3 className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                <TrendingUp className="h-4 w-4 text-[var(--season-primary)]" />
                <span>Manual Google Trends Evidence</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Trend Direction</label>
                    <select
                      value={trendDirection}
                      onChange={(e) =>
                        setTrendDirection(
                          e.target.value as "RISING" | "STABLE" | "DECLINING" | "UNCLEAR"
                        )
                      }
                      className={inputClass}
                    >
                      <option value="RISING">RISING</option>
                      <option value="STABLE">STABLE</option>
                      <option value="DECLINING">DECLINING</option>
                      <option value="UNCLEAR">UNCLEAR</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Trend Strength</label>
                    <select
                      value={trendStrength}
                      onChange={(e) =>
                        setTrendStrength(
                          e.target.value as "STRONG" | "MODERATE" | "WEAK" | "UNCLEAR"
                        )
                      }
                      className={inputClass}
                    >
                      <option value="STRONG">STRONG</option>
                      <option value="MODERATE">MODERATE</option>
                      <option value="WEAK">WEAK</option>
                      <option value="UNCLEAR">UNCLEAR</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className={labelClass}>Seasonality</label>
                    <select
                      value={seasonality}
                      onChange={(e) =>
                        setSeasonality(e.target.value as "YES" | "NO" | "UNCLEAR")
                      }
                      className={inputClass}
                    >
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                      <option value="UNCLEAR">UNCLEAR</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Peak Period</label>
                    <input
                      type="text"
                      value={peakPeriod}
                      onChange={(e) => setPeakPeriod(e.target.value)}
                      placeholder="e.g. May - Jul"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Lowest Period</label>
                    <input
                      type="text"
                      value={lowestPeriod}
                      onChange={(e) => setLowestPeriod(e.target.value)}
                      placeholder="e.g. Jan - Feb"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Research Notes &amp; Evidence Justification</label>
                  <textarea
                    rows={3}
                    value={researchNotes}
                    onChange={(e) => setResearchNotes(e.target.value)}
                    placeholder="Specific observations, queries to address in content, seasonal notes..."
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 1 Footer Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <div className="text-xs text-slate-500">
              {savedResearch?.researchedAt
                ? `Last saved: ${new Date(savedResearch.researchedAt).toLocaleString()}`
                : "Research pending save."}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleSaveResearch}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save Research</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>Proceed to Step 2: Strategy</span>
                <ArrowRight className="h-4 w-4" />
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
          <div className={cardClass}>
            <h2 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-semibold text-slate-900">
              <Compass className="h-4 w-4 text-[var(--season-primary)]" />
              <span>Strategic Decision &amp; Recommendation</span>
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Strategic Decision</label>
                <select
                  value={adminDecision}
                  onChange={(e) =>
                    setAdminDecision(
                      e.target.value as
                        | "USE_EXISTING"
                        | "CONSOLIDATE"
                        | "CREATE_NEW"
                        | "IGNORE"
                    )
                  }
                  className={`${inputClass} font-medium`}
                >
                  <option value="USE_EXISTING">USE EXISTING (Designate this landing page as primary target)</option>
                  <option value="CONSOLIDATE">CONSOLIDATE (Merge intent from competing pages into this page)</option>
                  <option value="CREATE_NEW">CREATE NEW (Create distinct sub-page for specialized intent)</option>
                  <option value="IGNORE">IGNORE (Do not optimize or generate for this topic)</option>
                </select>
                <span className="mt-1 block text-[11px] text-slate-500">
                  Determines the architectural role for this landing page in the content pipeline.
                </span>
              </div>

              <div>
                <label className={labelClass}>Recommended Action</label>
                <select
                  value={recommendedAction}
                  onChange={(e) =>
                    setRecommendedAction(
                      e.target.value as
                        | "KEEP"
                        | "OPTIMIZE"
                        | "MONITOR"
                        | "CONSOLIDATE"
                        | "MANUAL_REVIEW"
                    )
                  }
                  className={inputClass}
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
          <div className={cardClass}>
            <div className="border-b border-slate-100 pb-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Lock className="h-4 w-4 text-[var(--season-primary)]" />
                <span>Protected SEO Components</span>
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Mark high-performing elements to protect them from unintended AI rewrites or ranking regression.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-slate-200 bg-slate-50/70 p-3 hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={protectPrimaryQuery}
                  onChange={(e) => setProtectPrimaryQuery(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[var(--season-primary)] focus:ring-[var(--season-primary)]"
                />
                <div>
                  <strong className="block text-slate-900">Protect Primary Query</strong>
                  <span className="text-[11px] text-slate-500">Keep core keyword anchor &apos;{targetQuery}&apos;</span>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-slate-200 bg-slate-50/70 p-3 hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={protectTitle}
                  onChange={(e) => setProtectTitle(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[var(--season-primary)] focus:ring-[var(--season-primary)]"
                />
                <div>
                  <strong className="block text-slate-900">Protect Page Title</strong>
                  <span className="text-[11px] text-slate-500">Retain current CTR-validated SERP title</span>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-slate-200 bg-slate-50/70 p-3 hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={protectH1}
                  onChange={(e) => setProtectH1(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[var(--season-primary)] focus:ring-[var(--season-primary)]"
                />
                <div>
                  <strong className="block text-slate-900">Protect H1 Heading</strong>
                  <span className="text-[11px] text-slate-500">Retain &apos;{page.h1Heading}&apos;</span>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-slate-200 bg-slate-50/70 p-3 hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={protectSlug}
                  onChange={(e) => setProtectSlug(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[var(--season-primary)] focus:ring-[var(--season-primary)]"
                />
                <div>
                  <strong className="block text-slate-900">Protect URL Slug</strong>
                  <span className="text-[11px] text-slate-500">Do not alter slug &apos;/{page.slug}&apos;</span>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-slate-200 bg-slate-50/70 p-3 hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={protectFaqs}
                  onChange={(e) => setProtectFaqs(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[var(--season-primary)] focus:ring-[var(--season-primary)]"
                />
                <div>
                  <strong className="block text-slate-900">Protect FAQ Schema</strong>
                  <span className="text-[11px] text-slate-500">Keep existing verified rich answers</span>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-slate-200 bg-slate-50/70 p-3 hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={protectMetaDescription}
                  onChange={(e) => setProtectMetaDescription(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[var(--season-primary)] focus:ring-[var(--season-primary)]"
                />
                <div>
                  <strong className="block text-slate-900">Protect Meta Snippet</strong>
                  <span className="text-[11px] text-slate-500">Lock current meta description</span>
                </div>
              </label>
            </div>
          </div>

          {/* Strategy Blueprint Fields */}
          <div className={cardClass}>
            <h3 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-semibold text-slate-900">
              <Layers className="h-4 w-4 text-[var(--season-primary)]" />
              <span>Content Architecture &amp; Editorial Blueprint</span>
            </h3>

            <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
              <div>
                <label className={labelClass}>Queries to Protect (comma separated)</label>
                <input
                  type="text"
                  value={queriesToProtectText}
                  onChange={(e) => setQueriesToProtectText(e.target.value)}
                  placeholder="Queries with strong CTR/impressions in GSC"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Queries to Improve / Striking Distance</label>
                <input
                  type="text"
                  value={queriesToImproveText}
                  onChange={(e) => setQueriesToImproveText(e.target.value)}
                  placeholder="Queries ranking positions 5-20 with search demand"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Content Angle &amp; Unique Differentiation</label>
                <textarea
                  rows={2}
                  value={strategyAngle}
                  onChange={(e) => setStrategyAngle(e.target.value)}
                  placeholder="Unique local perspective, ground truth details, avoiding generic guide copy..."
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Heading Hierarchy Blueprint</label>
                <input
                  type="text"
                  value={headingDirection}
                  onChange={(e) => setHeadingDirection(e.target.value)}
                  placeholder="H2 structure outline..."
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Internal Linking Blueprint</label>
                <input
                  type="text"
                  value={internalLinkingText}
                  onChange={(e) => setInternalLinkingText(e.target.value)}
                  placeholder="Links to parent destination, child attractions, stay listings, taxi fare cards..."
                  className={inputClass}
                />
              </div>

              {cannibalization.competingPages.length > 0 && (
                <div className="md:col-span-2">
                  <label className={labelClass}>Competing Pages Resolution Analysis</label>
                  <textarea
                    rows={2}
                    value={competingPagesAnalysis}
                    onChange={(e) => setCompetingPagesAnalysis(e.target.value)}
                    className={`${inputClass} border-amber-200 bg-amber-50/40 font-mono text-amber-900`}
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className={labelClass}>Strategy Notes &amp; Next Steps</label>
                <textarea
                  rows={2}
                  value={strategyNotes}
                  onChange={(e) => setStrategyNotes(e.target.value)}
                  placeholder="Editorial directions for Stage 3 generation..."
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Step 2 Footer Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <div className="text-xs text-slate-500">
              {savedStrategy?.strategisedAt
                ? `Last saved: ${new Date(savedStrategy.strategisedAt).toLocaleString()}`
                : "Strategy pending save."}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ← Back to Research
              </button>

              <button
                type="button"
                onClick={handleSaveStrategy}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save Strategy Blueprint</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>View Stage 3: Generation</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* STEP 3: CONTENT GENERATION STUDIO                             */}
      {/* ============================================================= */}
      {activeStep === 3 && (
        <div className="space-y-6">
          {/* Prerequisites Warning if Research or Strategy missing */}
          {(!savedResearch || !savedStrategy) && (
            <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Prerequisites Incomplete</span>
              </div>
              <p className="text-amber-800">
                AI generation requires a completed Research context and Strategy blueprint.
                {!savedResearch && " Please complete Step 1 (Research)."}
                {!savedStrategy && " Please complete Step 2 (Strategy)."}
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {!savedResearch && (
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100/50 transition-colors cursor-pointer"
                  >
                    Go to Step 1 (Research)
                  </button>
                )}
                {!savedStrategy && (
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100/50 transition-colors cursor-pointer"
                  >
                    Go to Step 2 (Strategy)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Strategy Context & Ground-Truth Strip */}
          <div className="space-y-3 rounded-md border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] text-[var(--season-primary)]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Stage 3 — Research-Backed AI Generation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Target Query: <span className="font-medium text-slate-900">{targetQuery || page.title}</span> · Intent: <span className="capitalize text-slate-700">{searchIntent}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                  Decision: <strong className="text-slate-900">{adminDecision}</strong>
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                  Action: <strong className="text-[var(--season-primary)]">{recommendedAction}</strong>
                </span>
                <span className="rounded-full border border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] px-2.5 py-1 text-xs font-medium text-[var(--season-primary-hover)]">
                  {verifiedDbFacts.length} DB Facts
                </span>
              </div>
            </div>

            {/* Protected Elements Badges */}
            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2.5 text-xs">
              <span className="font-medium text-slate-600">Protected Elements:</span>
              {protectTitle && (
                <span className="rounded border border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] px-2 py-0.5 text-[var(--season-primary-hover)]">
                  Title
                </span>
              )}
              {protectH1 && (
                <span className="rounded border border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] px-2 py-0.5 text-[var(--season-primary-hover)]">
                  H1 Heading
                </span>
              )}
              {protectMetaDescription && (
                <span className="rounded border border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] px-2 py-0.5 text-[var(--season-primary-hover)]">
                  Meta Snippet
                </span>
              )}
              {protectPrimaryQuery && (
                <span className="rounded border border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] px-2 py-0.5 text-[var(--season-primary-hover)]">
                  Primary Query
                </span>
              )}
              {protectFaqs && (
                <span className="rounded border border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] px-2 py-0.5 text-[var(--season-primary-hover)]">
                  Existing FAQs
                </span>
              )}
              {!protectTitle && !protectH1 && !protectMetaDescription && !protectPrimaryQuery && !protectFaqs && (
                <span className="italic text-slate-500">None designated (full optimization allowed)</span>
              )}
            </div>
          </div>

          {/* Setup & Generation Controls (If no draft or regenerating) */}
          {(!draft || showRegenerateConfirm) && (
            <div className="space-y-4 rounded-md border border-slate-200/90 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Sliders className="h-4 w-4 text-[var(--season-primary)]" />
                  <span>Generation Parameters</span>
                </h4>
                {showRegenerateConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowRegenerateConfirm(false)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel Regeneration
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
                <div>
                  <label className={labelClass}>Brand Voice &amp; Tone</label>
                  <select
                    value={generationTone}
                    onChange={(e) =>
                      setGenerationTone(
                        e.target.value as
                          | "professional_authoritative"
                          | "warm_inspirational"
                          | "adventurous_expert"
                      )
                    }
                    className={inputClass}
                  >
                    <option value="professional_authoritative">Professional &amp; Authoritative (Recommended)</option>
                    <option value="warm_inspirational">Warm &amp; Inspirational</option>
                    <option value="adventurous_expert">Adventurous &amp; High-Altitude Expert</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Content Depth</label>
                  <select
                    value={generationDepth}
                    onChange={(e) =>
                      setGenerationDepth(
                        e.target.value as "standard" | "comprehensive_deep_dive"
                      )
                    }
                    className={inputClass}
                  >
                    <option value="standard">Standard Expert Guide (1,200 - 1,800 words)</option>
                    <option value="comprehensive_deep_dive">Comprehensive Deep Dive (2,000+ words with itinerary/tips)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Custom Editorial Instructions (Optional)</label>
                  <input
                    type="text"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g., Emphasize private 4x4 transport in winter, highlight verified boutique homestays..."
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--season-primary)]" />
                  <span>Production Safety Guarantees</span>
                </div>
                <p>
                  · Generation writes exclusively to a draft ContentAsset. Published page content remains untouched.
                </p>
                <p>
                  · Factual details are bounded by the {verifiedDbFacts.length} verified database records.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="text-xs text-slate-500">
                  Gemini 2.5 Flash · Structured JSON Mode
                </div>

                <button
                  type="button"
                  onClick={handleGenerateDraft}
                  disabled={isGenerating || !savedResearch || !savedStrategy}
                  className="inline-flex items-center gap-2 rounded-md bg-[var(--season-primary)] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating SEO Content...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
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
              <div className="flex flex-col justify-between gap-3 rounded-md border border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] p-4 sm:flex-row sm:items-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--season-primary)]/25 bg-white text-[var(--season-primary)]">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900">Active Content Draft</h4>
                      <StatusBadge status="DRAFT" label="ContentAsset: DRAFT" tone="season" />
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600">
                      Generated: {draft.generatedAt ? new Date(draft.generatedAt).toLocaleString() : "Recently"} via {draft.model || "gemini-2.5-flash"} · Live page remains untouched.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {isEditingDraft ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingDraft(false);
                          setEditableDraft(draft);
                        }}
                        className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEditedDraft}
                        disabled={isSavingDraft}
                        className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isSavingDraft ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        <span>Save Edits</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsEditingDraft(true)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-[var(--season-primary)]" />
                        <span>Edit Draft</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRegenerateConfirm(true)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Regenerate</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDiscardConfirm(true)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Discard</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* SERP Snippet Preview (Google Result Mockup) */}
              <div className="space-y-3 rounded-md border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <Globe className="h-3.5 w-3.5 text-[var(--season-primary)]" />
                    <span>Search Engine Snippet Preview (SERP)</span>
                  </h4>
                  {protectTitle && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--season-primary)]">
                      <Lock className="h-3 w-3" />
                      <span>Title Protected</span>
                    </span>
                  )}
                </div>

                {isEditingDraft ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className={labelClass}>Page Meta Title</label>
                      <input
                        type="text"
                        value={editableDraft?.title || ""}
                        onChange={(e) =>
                          setEditableDraft((prev) => (prev ? { ...prev, title: e.target.value } : null))
                        }
                        className={`${inputClass} font-medium`}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Meta Description</label>
                      <textarea
                        rows={2}
                        value={editableDraft?.metaDescription || ""}
                        onChange={(e) =>
                          setEditableDraft((prev) => (prev ? { ...prev, metaDescription: e.target.value } : null))
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="max-w-2xl rounded-md border border-slate-200 bg-slate-50 p-4 font-sans">
                    <div className="mb-1 flex items-center gap-1 font-mono text-[11px] text-slate-500">
                      <span>https://wanderkashmir.com/{page.type.toLowerCase()}s/{page.slug}</span>
                    </div>
                    <div className="line-clamp-1 text-base font-medium text-blue-700">
                      {draft.title}
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
                      {draft.metaDescription}
                    </div>
                  </div>
                )}
              </div>

              {/* H1 & Main Content Body */}
              <div className="space-y-4 rounded-md border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <FileText className="h-3.5 w-3.5 text-[var(--season-primary)]" />
                    <span>Primary Heading &amp; Content Body</span>
                  </h4>
                  {protectH1 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--season-primary)]">
                      <Lock className="h-3 w-3" />
                      <span>H1 Protected</span>
                    </span>
                  )}
                </div>

                {isEditingDraft ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className={labelClass}>H1 Heading</label>
                      <input
                        type="text"
                        value={editableDraft?.h1Heading || ""}
                        onChange={(e) =>
                          setEditableDraft((prev) => (prev ? { ...prev, h1Heading: e.target.value } : null))
                        }
                        className={`${inputClass} font-semibold`}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Markdown Content Body</label>
                      <textarea
                        rows={16}
                        value={editableDraft?.content || ""}
                        onChange={(e) =>
                          setEditableDraft((prev) => (prev ? { ...prev, content: e.target.value } : null))
                        }
                        className={`${inputClass} font-mono leading-relaxed`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold tracking-tight text-slate-900">{draft.h1Heading}</h2>
                    <div className="max-h-[560px] overflow-y-auto whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50/70 p-4 font-sans text-xs leading-relaxed text-slate-700 sm:p-5">
                      {draft.content}
                    </div>
                  </div>
                )}
              </div>

              {/* FAQs Section */}
              <div className="space-y-3 rounded-md border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <HelpCircle className="h-3.5 w-3.5 text-[var(--season-primary)]" />
                    <span>Frequently Asked Questions ({draft.faqs?.length || 0})</span>
                  </h4>
                  {protectFaqs && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--season-primary)]">
                      <Lock className="h-3 w-3" />
                      <span>Existing FAQs Retained</span>
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {draft.faqs && draft.faqs.length > 0 ? (
                    draft.faqs.map((f, i) => (
                      <div key={i} className="space-y-1 rounded-md border border-slate-200 bg-slate-50/70 p-3">
                        <div className="flex items-start gap-2 text-xs font-semibold text-slate-900">
                          <span className="font-mono text-[var(--season-primary)]">Q{i + 1}:</span>
                          <span>{f.question}</span>
                        </div>
                        <p className="pl-7 text-xs leading-relaxed text-slate-600">{f.answer}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs italic text-slate-500">No FAQs generated.</p>
                  )}
                </div>
              </div>

              {/* Internal Link Suggestions */}
              {draft.internalLinkSuggestions && draft.internalLinkSuggestions.length > 0 && (
                <div className="space-y-3 rounded-md border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <Link2 className="h-3.5 w-3.5 text-[var(--season-primary)]" />
                    <span>Recommended Internal Links (Verified Real Routes)</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                    {draft.internalLinkSuggestions.map((l, i) => (
                      <div key={i} className="space-y-1 rounded-md border border-slate-200 bg-slate-50/70 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-slate-900">&quot;{l.anchorText}&quot;</span>
                          <span className="rounded border border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--season-primary-hover)]">
                            {l.url}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{l.context}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEO Strategic Alignment Notes */}
              {draft.seoNotes && (
                <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                  <strong className="text-slate-900">Strategic Alignment Notes:</strong>
                  <p className="leading-relaxed">{draft.seoNotes}</p>
                </div>
              )}

              {/* Stage 3 Footer Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  ← Back to Strategy Studio
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="inline-flex items-center gap-2 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors cursor-pointer"
                >
                  <span>Proceed to Stage 4: Validation</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Discard Confirmation Dialog */}
          <ConfirmActionDialog
            open={showDiscardConfirm}
            onClose={() => setShowDiscardConfirm(false)}
            title="Discard Content Draft?"
            description="This removes the current generated draft from ContentAsset and resets the workflow state from GENERATED back to STRATEGISED."
            confirmLabel="Yes, Discard Draft"
            tone="danger"
            onConfirm={handleDiscardDraft}
          />
        </div>
      )}

      {activeStep === 4 && (
        <div className="space-y-6">
          {!draft ? (
            <div className="space-y-4 rounded-md border border-slate-200/90 bg-white p-8 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-amber-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Draft Generation Required</h3>
                <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                  Generate a content draft before running validation. Validation audits the generated draft against your Research data, Strategy blueprint, and Ground-Truth database records.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="inline-flex items-center gap-2 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Go to Stage 3: Generation Studio</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Target Identification Card */}
              <div className="flex flex-col justify-between gap-4 rounded-md border border-slate-200/90 bg-white p-5 md:flex-row md:items-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--season-primary)]">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Target: Generated Draft</span>
                    </span>
                    <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                      Asset ID: {draft.assetId || "Latest Draft"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="text-slate-500">Page: </span>
                    <strong className="text-slate-900">{page.title}</strong>
                    <span className="font-mono text-slate-500"> (/{page.slug})</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500">
                    <span>
                      Generated:{" "}
                      <strong className="text-slate-700">
                        {draft.generatedAt ? new Date(draft.generatedAt).toLocaleString() : "Latest session"}
                      </strong>
                    </span>
                    <span>·</span>
                    <span>
                      Workflow State:{" "}
                      <strong className="font-mono text-[var(--season-primary)]">{page.workflowState}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                  {validationReport ? (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                        validationReport.overallStatus === "PASS"
                          ? "border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] text-[var(--season-primary-hover)]"
                          : validationReport.overallStatus === "WARNING"
                          ? "border-amber-200 bg-amber-50 text-amber-800"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                    >
                      {validationReport.overallStatus === "PASS" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : validationReport.overallStatus === "WARNING" ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <span>Overall: {validationReport.overallStatus}</span>
                    </span>
                  ) : (
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
                      Not Yet Validated
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleRunValidation}
                    disabled={isValidating}
                    className="inline-flex items-center gap-2 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isValidating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span>{validationReport ? "Re-run Validation" : "Run Validation"}</span>
                  </button>
                </div>
              </div>

              {/* Validation Summary Metrics */}
              {validationReport && (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <div className="space-y-1 rounded-md border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total Checks</div>
                      <div className="font-mono text-xl font-semibold text-slate-900">{validationReport.metrics.totalChecks}</div>
                      <div className="text-[10px] text-slate-500">11 Categories</div>
                    </div>
                    <div className="space-y-1 rounded-md border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--season-primary)]">Checks Passed</div>
                      <div className="font-mono text-xl font-semibold text-[var(--season-primary)]">{validationReport.metrics.passedChecks}</div>
                      <div className="text-[10px] text-slate-500">Satisfies rules</div>
                    </div>
                    <div className="space-y-1 rounded-md border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Warnings</div>
                      <div className="font-mono text-xl font-semibold text-amber-700">{validationReport.metrics.warnings}</div>
                      <div className="text-[10px] text-slate-500">Non-blocking</div>
                    </div>
                    <div className="space-y-1 rounded-md border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">Errors</div>
                      <div className="font-mono text-xl font-semibold text-rose-700">{validationReport.metrics.errors}</div>
                      <div className="text-[10px] text-slate-500">Requires fix</div>
                    </div>
                    <div className="space-y-1 rounded-md border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">Critical</div>
                      <div className="font-mono text-xl font-semibold text-rose-700">{validationReport.metrics.criticals}</div>
                      <div className="text-[10px] text-slate-500">Blocks publish</div>
                    </div>
                    <div className="space-y-1 rounded-md border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Content Stats</div>
                      <div className="mt-1 font-mono text-sm font-semibold text-slate-900">{validationReport.wordCount} words</div>
                      <div className="font-mono text-[10px] text-[var(--season-primary)]">{validationReport.keywordDensity.toFixed(2)}% density</div>
                    </div>
                  </div>

                  {/* Human Review & Publish Handoff Notice */}
                  <div
                    className={`flex items-start gap-3.5 rounded-md border p-4 sm:p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${
                      validationReport.overallStatus === "PASS" || validationReport.overallStatus === "WARNING"
                        ? "border-[var(--season-primary)]/25 bg-[var(--season-primary-light)]"
                        : "border-rose-200 bg-rose-50/70"
                    }`}
                  >
                    {validationReport.overallStatus === "PASS" || validationReport.overallStatus === "WARNING" ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--season-primary)]" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                    )}
                    <div className="space-y-1 text-xs">
                      <h4 className="text-sm font-semibold text-slate-900">
                        {validationReport.overallStatus === "PASS" || validationReport.overallStatus === "WARNING"
                          ? "Ready for Human Review & Publishing (Stage 5)"
                          : "Changes Required Before Human Review"}
                      </h4>
                      <p className="leading-relaxed text-slate-700">
                        {validationReport.overallStatus === "PASS"
                          ? "This draft has satisfied all critical SEO validation criteria and protected component constraints. It is ready for human editorial review."
                          : validationReport.overallStatus === "WARNING"
                          ? "Draft has non-blocking warnings (e.g. secondary query coverage or minor length variances). It is acceptable for human editorial review."
                          : "Draft has critical or blocking errors (such as altered protected titles/H1s or unresolved factual placeholders). Resolve them before proceeding."}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Validated at {new Date(validationReport.validatedAt).toLocaleString()} · Validation does not automatically publish or modify live website content.
                      </p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {validationReport.recommendations && validationReport.recommendations.length > 0 && (
                    <div className="space-y-2.5 rounded-md border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                      <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                        <Sparkles className="h-3.5 w-3.5 text-[var(--season-primary)]" />
                        <span>Actionable Optimization Recommendations ({validationReport.recommendations.length})</span>
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        {validationReport.recommendations.map((rec, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50/70 p-2.5 text-slate-700"
                          >
                            <span className="shrink-0 font-semibold text-[var(--season-primary)]">{i + 1}.</span>
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 11 Category Cards */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
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
                        className="text-xs font-medium text-[var(--season-primary)] hover:underline cursor-pointer"
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
                      { key: "protectedComponents" as const, label: "Protected Components", icon: Lock },
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
                          className="overflow-hidden rounded-md border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                        >
                          <div
                            onClick={() => toggleCategory(catMeta.key)}
                            className="flex cursor-pointer select-none items-center justify-between gap-2 p-3.5 hover:bg-slate-50 transition-colors sm:p-4"
                          >
                            <div className="flex flex-wrap items-center gap-2.5">
                              <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                                  cat.status === "PASS"
                                    ? "border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] text-[var(--season-primary-hover)]"
                                    : cat.status === "WARNING"
                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                    : "border-rose-200 bg-rose-50 text-rose-700"
                                }`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-xs font-semibold text-slate-900">{catMeta.label}</span>

                              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                {cat.criticalCount > 0 && (
                                  <span className="rounded border border-rose-300 bg-rose-100 px-1.5 py-0.5 font-semibold text-rose-800">
                                    {cat.criticalCount} Critical
                                  </span>
                                )}
                                {cat.errorCount > 0 && (
                                  <span className="rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 font-medium text-rose-700">
                                    {cat.errorCount} Error{cat.errorCount > 1 ? "s" : ""}
                                  </span>
                                )}
                                {cat.warningCount > 0 && (
                                  <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-medium text-amber-800">
                                    {cat.warningCount} Warning{cat.warningCount > 1 ? "s" : ""}
                                  </span>
                                )}
                                <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-slate-600">
                                  {cat.passedCount} Passed
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <StatusBadge
                                status={cat.status}
                                tone={
                                  cat.status === "PASS"
                                    ? "season"
                                    : cat.status === "WARNING"
                                    ? "amber"
                                    : "rose"
                                }
                              />
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="space-y-3 border-t border-slate-100 bg-slate-50/50 p-4">
                              {cat.issues.length === 0 ? (
                                <div className="flex items-center gap-2 rounded-md border border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] p-2.5 text-xs text-[var(--season-primary-hover)]">
                                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                                  <span>All configured checks in this category passed.</span>
                                </div>
                              ) : (
                                <div className="space-y-2.5">
                                  {cat.issues.map((issue, idx) => (
                                    <div
                                      key={idx}
                                      className={`space-y-2 rounded-md border p-3 text-xs ${
                                        issue.severity === "CRITICAL"
                                          ? "border-rose-300 bg-rose-50"
                                          : issue.severity === "ERROR"
                                          ? "border-rose-200 bg-rose-50/60"
                                          : issue.severity === "WARNING"
                                          ? "border-amber-200 bg-amber-50/60"
                                          : "border-slate-200 bg-white"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-2 font-semibold text-slate-900">
                                          <span
                                            className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                              issue.severity === "CRITICAL"
                                                ? "border-rose-300 bg-rose-100 text-rose-800"
                                                : issue.severity === "ERROR"
                                                ? "border-rose-200 bg-rose-100/70 text-rose-700"
                                                : issue.severity === "WARNING"
                                                ? "border-amber-200 bg-amber-100/70 text-amber-800"
                                                : "border-blue-200 bg-blue-50 text-blue-700"
                                            }`}
                                          >
                                            {issue.severity}
                                          </span>
                                          <span>{issue.title}</span>
                                        </div>
                                      </div>

                                      <p className="text-slate-700">{issue.message}</p>

                                      {(issue.expected || issue.observed) && (
                                        <div className="grid grid-cols-1 gap-2 pt-1 font-mono text-[11px] sm:grid-cols-2">
                                          {issue.expected && (
                                            <div className="space-y-1 rounded border border-slate-200 bg-white p-2">
                                              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                                                Expected / Ground-Truth
                                              </div>
                                              <div className="break-all text-slate-800">{issue.expected}</div>
                                            </div>
                                          )}
                                          {issue.observed && (
                                            <div className="space-y-1 rounded border border-rose-200 bg-white p-2">
                                              <div className="text-[10px] uppercase tracking-wider text-rose-700">
                                                Observed in Draft
                                              </div>
                                              <div className="break-all text-rose-700">{issue.observed}</div>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {issue.recommendation && (
                                        <div className="flex items-start gap-1.5 rounded-md border border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] p-2 text-[11px] text-[var(--season-primary-hover)]">
                                          <span className="shrink-0 font-semibold">Recommendation:</span>
                                          <span>{issue.recommendation}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {cat.passedCount > 0 && cat.issues.length > 0 && (
                                <details className="border-t border-slate-200 pt-2 text-xs text-slate-600">
                                  <summary className="cursor-pointer select-none font-medium hover:text-slate-900">
                                    View {cat.passedCount} passed check{cat.passedCount > 1 ? "s" : ""}
                                  </summary>
                                  <div className="mt-2 space-y-1 border-l-2 border-slate-200 pl-3">
                                    {validationReport.passedChecks
                                      .filter((c) => c.category === catMeta.key)
                                      .map((p, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-600">
                                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--season-primary)]" />
                                          <span>
                                            <strong className="font-medium text-slate-800">{p.title}:</strong> {p.message}
                                          </span>
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
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  ← Back to AI Generation Studio
                </button>

                {validationReport &&
                  (validationReport.overallStatus === "PASS" || validationReport.overallStatus === "WARNING") && (
                    <button
                      type="button"
                      onClick={() => setActiveStep(5)}
                      className="inline-flex items-center gap-2 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors cursor-pointer"
                    >
                      <span>Proceed to Stage 5: Review &amp; Publish Preview</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeStep === 5 && (
        <div className="space-y-4 rounded-md border border-slate-200/90 bg-white p-8 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] text-[var(--season-primary)]">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Stage 5 — Human Review &amp; Publishing
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
              Review the validated draft in the Page Inspector before transitioning to PUBLISHED in the public sitemap and canonical index.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href={`${basePath}/seo/${page.id}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors"
            >
              Open Page Inspector
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
