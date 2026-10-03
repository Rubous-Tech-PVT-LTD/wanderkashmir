"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  SearchCode,
  Sparkles,
  Layers,
  FileCheck,
  Calendar,
  Clock,
  Trash2,
  Plus,
} from "lucide-react";
import { updateSeoLandingPageAction, deleteSeoLandingPageAction } from "@/actions/adminSeo";
import { SeoWorkflowState } from "@prisma/client";

interface FaqItem {
  question: string;
  answer: string;
}

interface SeoDetailFormProps {
  page: {
    id: string;
    slug: string;
    type: string;
    title: string;
    description: string | null;
    h1Heading: string;
    content: string | null;
    imageUrl: string | null;
    workflowState: SeoWorkflowState;
    createdAt: Date;
    updatedAt: Date;
    seoResearch: unknown;
    seoStrategy: unknown;
    validationReport: unknown;
    gscInitialMetrics: unknown;
    faqs?: unknown;
    places?: {
      id: string;
      displayOrder: number;
      place: {
        id: string;
        name: string;
        slug: string;
        status: string;
      };
    }[];
  };
}

export default function SeoDetailForm({ page }: SeoDetailFormProps) {
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<"METADATA" | "RESEARCH" | "STRATEGY" | "VALIDATION">(
    "METADATA"
  );

  // Form State
  const [title, setTitle] = useState(page.title || "");
  const [slug, setSlug] = useState(page.slug || "");
  const [h1Heading, setH1Heading] = useState(page.h1Heading || "");
  const [description, setDescription] = useState(page.description || "");
  const [content, setContent] = useState(page.content || "");
  const [imageUrl, setImageUrl] = useState(page.imageUrl || "");
  const [workflowState, setWorkflowState] = useState<SeoWorkflowState>(page.workflowState);
  const [faqs, setFaqs] = useState<FaqItem[]>(() => {
    if (Array.isArray(page.faqs)) {
      return page.faqs.map((f: any) => ({
        question: typeof f?.question === "string" ? f.question : "",
        answer: typeof f?.answer === "string" ? f.answer : "",
      }));
    }
    return [];
  });

  // Status & Validation State
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const handleUpdateFaq = (index: number, field: "question" | "answer", val: string) => {
    const updated = [...faqs];
    updated[index][field] = val;
    setFaqs(updated);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleDeleteDraft = async () => {
    if (page.workflowState === "PUBLISHED") {
      setErrorMessage(
        "Cannot delete a published SEO page to prevent 404 crawl errors. Please change workflow state to DRAFT first."
      );
      return;
    }
    if (!confirm("Are you sure you want to delete this draft SEO page? This cannot be undone.")) {
      return;
    }
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      const res = await deleteSeoLandingPageAction(page.id);
      if (res.success) {
        router.push("/admin/seo");
      } else {
        setErrorMessage(res.error || "Failed to delete SEO page.");
      }
    } catch {
      setErrorMessage("Network error communicating with server.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage("Page title is required.");
      return;
    }
    if (!h1Heading.trim()) {
      setErrorMessage("H1 Heading is required.");
      return;
    }
    if (!slug.trim()) {
      setErrorMessage("URL slug is required.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateSeoLandingPageAction(page.id, {
        title: title.trim(),
        slug: slug.trim(),
        h1Heading: h1Heading.trim(),
        description: description.trim() || null,
        content: content.trim() || null,
        imageUrl: imageUrl.trim() || null,
        workflowState,
        faqs: faqs.filter((f) => f.question.trim().length > 0 || f.answer.trim().length > 0),
      });

      if (res.success) {
        setSuccessMessage("SEO Landing Page updated successfully.");
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to update SEO landing page.");
      }
    } catch {
      setErrorMessage("Network error communicating with server.");
    } finally {
      setIsSaving(false);
    }
  };

  const publicUrl =
    page.type === "DESTINATION" ? `/destinations/${page.slug}` : `/${page.slug}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/seo"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Globe className="w-6 h-6 text-cyan-400" />
              <span>SEO Page Intelligence</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Type: <span className="font-mono text-cyan-400 font-semibold">{page.type}</span> &bull;{" "}
              ID: <span className="font-mono text-slate-400">{page.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Link
            href={`/admin/seo/${page.id}?studio=true`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-sm transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Research Studio</span>
          </Link>

          {page.workflowState === "PUBLISHED" && page.type === "DESTINATION" && (
            <Link
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800 transition"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          {page.workflowState !== "PUBLISHED" && (
            <button
              type="button"
              onClick={handleDeleteDraft}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
              title="Delete draft page"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Delete Draft</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{successMessage}</div>
        </div>
      )}

      {/* Module Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-px overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("METADATA")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
            activeTab === "METADATA"
              ? "border-cyan-400 text-cyan-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Metadata & Content</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("RESEARCH")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
            activeTab === "RESEARCH"
              ? "border-blue-400 text-blue-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <SearchCode className="w-4 h-4" />
          <span>Research & GSC Metrics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("STRATEGY")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
            activeTab === "STRATEGY"
              ? "border-purple-400 text-purple-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Strategy & Structure</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("VALIDATION")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
            activeTab === "VALIDATION"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Validation Audit</span>
        </button>
      </div>

      {/* Tab 1: Metadata & Content Form */}
      {activeTab === "METADATA" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
            <h2 className="text-base font-semibold text-white border-b border-slate-800/80 pb-3 flex items-center justify-between">
              <span>On-Page SEO & Canonical Parameters</span>
              <span className="text-xs text-slate-400 font-mono font-normal">
                Type: {page.type}
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                  Page Title (Meta Title) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Length: {title.length} characters (Recommended: 50-60)
                </span>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                  URL Slug <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm font-mono text-cyan-400 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block truncate">
                  Public Canonical: {publicUrl}
                </span>
              </div>

              {/* H1 Heading */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                  H1 Heading <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={h1Heading}
                  onChange={(e) => setH1Heading(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Workflow State */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                  Workflow Publishing State
                </label>
                <select
                  value={workflowState}
                  onChange={(e) => setWorkflowState(e.target.value as SeoWorkflowState)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="DRAFT">DRAFT (Hidden from public index & sitemap)</option>
                  <option value="RESEARCHED">RESEARCHED (Research attached)</option>
                  <option value="STRATEGISED">STRATEGISED (Content strategy mapped)</option>
                  <option value="GENERATED">GENERATED (AI/Draft content created)</option>
                  <option value="VALIDATED">VALIDATED (Passed SEO validation tests)</option>
                  <option value="PUBLISHED">PUBLISHED (Live in sitemap & canonical index)</option>
                  <option value="REJECTED">REJECTED (Rejected by moderation)</option>
                </select>
              </div>

              {/* Image URL */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                  Hero / OpenGraph Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Meta Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Concise, keyword-optimized snippet for SERP appearance..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Length: {description.length} characters (Recommended: 140-160)
                </span>
              </div>

              {/* Content Body */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                  Body Content (Markdown / HTML)
                </label>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Full programmatic landing page copy, headings, and guide details..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
              </div>

              {/* FAQ Schema Section */}
              <div className="md:col-span-2 pt-3 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                      Structured FAQ Schema ({faqs.length})
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Frequently asked questions rendered in rich snippet FAQ markup.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Add FAQ</span>
                  </button>
                </div>

                {faqs.length > 0 ? (
                  <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 space-y-2.5 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-cyan-400 font-semibold">
                            FAQ #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFaq(idx)}
                            className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-900 transition"
                            title="Remove FAQ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => handleUpdateFaq(idx, "question", e.target.value)}
                          placeholder="Question, e.g. What is the best time to visit?"
                          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                        <textarea
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => handleUpdateFaq(idx, "answer", e.target.value)}
                          placeholder="Concise answer..."
                          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-2">
                    No FAQs defined yet. Click "Add FAQ" above to add structured questions.
                  </p>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>
                  Created on:{" "}
                  <span className="text-slate-300 font-medium">
                    {new Date(page.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>
                  Last modified:{" "}
                  <span className="text-slate-300 font-medium">
                    {new Date(page.updatedAt).toLocaleString("en-IN")}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/admin/seo"
              className="px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 text-sm font-medium transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition shadow-sm hover:shadow-cyan-500/20 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save SEO Metadata</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Research & GSC Metrics */}
      {activeTab === "RESEARCH" && (
        <div className="space-y-6">
          {/* Research Studio Launch Banner */}
          <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>SEO Research & Strategy Studio</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Run live Search Console performance analysis, cannibalization checks across 162 pages, verified database facts, and manual trend evidence.
              </p>
            </div>
            <Link
              href={`/admin/seo/${page.id}?studio=true`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shrink-0 transition shadow-sm"
            >
              <span>Launch Research Studio</span>
              <Sparkles className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <SearchCode className="w-5 h-5 text-blue-400" />
              <span>Keyword Research Payload (`seoResearch`)</span>
            </h2>

            {page.seoResearch ? (
              <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs text-blue-300 font-mono overflow-x-auto max-h-96">
                {JSON.stringify(page.seoResearch, null, 2)}
              </pre>
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg">
                <SearchCode className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No keyword research payload stored.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Click "Launch Research Studio" above to perform live research and save structured findings.
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span>Google Search Console Baseline Metrics (`gscInitialMetrics`)</span>
            </h2>

            {page.gscInitialMetrics ? (
              <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs text-cyan-300 font-mono overflow-x-auto max-h-96">
                {JSON.stringify(page.gscInitialMetrics, null, 2)}
              </pre>
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg">
                <Globe className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No historical GSC baseline recorded.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Zero fake rankings or impressions are shown. Actual metrics are recorded via Search Console sync.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Strategy & Structure */}
      {activeTab === "STRATEGY" && (
        <div className="space-y-6">
          {/* Strategy Studio Launch Banner */}
          <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>SEO Strategy Blueprint Studio</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure strategic decisions (USE_EXISTING / CONSOLIDATE / CREATE_NEW), mark protected winning queries, and generate editorial blueprints.
              </p>
            </div>
            <Link
              href={`/admin/seo/${page.id}?studio=true`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shrink-0 transition shadow-sm"
            >
              <span>Launch Strategy Studio</span>
              <Sparkles className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>SEO Content Strategy Payload (`seoStrategy`)</span>
            </h2>

            {page.seoStrategy ? (
              <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs text-purple-300 font-mono overflow-x-auto max-h-96">
                {JSON.stringify(page.seoStrategy, null, 2)}
              </pre>
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No strategy payload recorded for this page.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Click "Launch Strategy Studio" above to map out topical hierarchy and protect winning queries.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Validation Audit */}
      {activeTab === "VALIDATION" && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <span>SEO Validation Audit Report (`validationReport`)</span>
          </h2>

          {page.validationReport ? (
            <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs text-emerald-300 font-mono overflow-x-auto max-h-96">
              {JSON.stringify(page.validationReport, null, 2)}
            </pre>
          ) : (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg">
              <FileCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No automated validation report recorded.</p>
              <p className="text-xs text-slate-500 mt-1">
                Automated validation runs check for title length, heading hierarchy, keyword presence, and canonical integrity.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Safety Notice Footer */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Production SEO Guardrails</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
          <li>
            Zero fake data: Research, Strategy, and GSC metrics reflect real JSON records or honest empty states.
          </li>
          <li>
            Safe unpublishing: Destructive deletion is blocked; change workflowState to DRAFT to remove from sitemap and organic indexing.
          </li>
          <li>
            Separation of concerns: Editing destination SEO metadata never alters Tour, Stay, or Experience booking records.
          </li>
        </ul>
      </div>
    </div>
  );
}
