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
} from "lucide-react";
import { updateSeoLandingPageAction } from "@/actions/adminSeo";
import { SeoWorkflowState } from "@prisma/client";

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

  // Status & Validation State
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

        {page.workflowState === "PUBLISHED" && page.type === "DESTINATION" && (
          <Link
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800 transition self-start sm:self-auto"
          >
            <span>View Public Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
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
                  Research-first keywords and search volume are initialized during content generation.
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
                Topical hierarchy and internal linking strategy are generated during the content strategy phase.
              </p>
            </div>
          )}
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
