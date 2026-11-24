"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SeoWorkflowState } from "@prisma/client";
import {
  Save,
  ExternalLink,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import { updateSeoLandingPageAction, deleteSeoLandingPageAction } from "@/actions/adminSeo";
import {
  AdminPageHeader,
  AdminToastBanner,
  ConfirmActionDialog,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

interface SeoDetailPageData {
  id: string;
  slug: string;
  type: string;
  title: string;
  description: string | null;
  h1Heading: string;
  content: string | null;
  imageUrl: string | null;
  workflowState: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  seoResearch: unknown;
  seoStrategy: unknown;
  validationReport: unknown;
  gscInitialMetrics: unknown;
  faqs?: unknown;
  places?: Array<{
    id: string;
    displayOrder: number;
    place: {
      id: string;
      name: string;
      slug: string;
      status: string;
    };
  }>;
}

interface SeoDetailFormProps {
  page: SeoDetailPageData;
}

function resolvePublicUrl(type: string, slug: string): string | null {
  if (type === "DESTINATION") return `/destinations/${slug}`;
  if (type === "BLOG") return `/blog/${slug}`;
  return null;
}

export default function SeoDetailForm({ page }: SeoDetailFormProps) {
  const router = useRouter();
  const { adminHref } = useAdminBasePath();

  const [activeTab, setActiveTab] = useState<"metadata" | "research" | "strategy" | "validation">(
    "metadata"
  );

  // Editable Fields
  const [title, setTitle] = useState(page.title || "");
  const [slug, setSlug] = useState(page.slug || "");
  const [h1Heading, setH1Heading] = useState(page.h1Heading || "");
  const [description, setDescription] = useState(page.description || "");
  const [content, setContent] = useState(page.content || "");
  const [imageUrl, setImageUrl] = useState(page.imageUrl || "");
  const [workflowState, setWorkflowState] = useState(page.workflowState || "DRAFT");

  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(() => {
    if (Array.isArray(page.faqs)) {
      return (page.faqs as Array<Record<string, unknown>>).map((f) => ({
        question: String(f.question || f.q || ""),
        answer: String(f.answer || f.a || ""),
      }));
    }
    return [];
  });

  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const publicUrl = resolvePublicUrl(page.type, slug || page.slug);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await updateSeoLandingPageAction(page.id, {
        title: title.trim(),
        slug: slug.trim(),
        h1Heading: h1Heading.trim(),
        description: description.trim() || null,
        content: content.trim() || null,
        imageUrl: imageUrl.trim() || null,
        workflowState: workflowState as SeoWorkflowState,
        faqs: faqs.filter((f) => f.question.trim().length > 0 || f.answer.trim().length > 0),
      });

      if (res.success) {
        setFeedback({ type: "success", text: "SEO page saved." });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to save SEO page." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error communicating with server." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    const res = await deleteSeoLandingPageAction(page.id);
    if (!res.success) {
      throw new Error(res.error || "Failed to delete draft page.");
    }
    router.push(adminHref("/admin/seo"));
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <AdminPageHeader
        title={page.title || "SEO Page Editor"}
        subtitle={`${page.type} · ${publicUrl || `/${page.slug}`}`}
        backHref={adminHref("/admin/seo")}
        backLabel="Back to SEO Intelligence"
        badge={<StatusBadge status={workflowState} />}
        actions={
          <>
            <Link
              href={`${adminHref(`/admin/seo/${page.id}`)}?studio=true`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--season-primary)]" />
              <span>Research Studio</span>
            </Link>

            {workflowState === "PUBLISHED" && publicUrl && (
              <Link
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>View Live</span>
              </Link>
            )}

            {workflowState !== "PUBLISHED" && (
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Draft</span>
              </button>
            )}
          </>
        }
      />

      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      {/* Section Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { key: "metadata" as const, label: "Content & Metadata" },
          { key: "research" as const, label: "Research Data" },
          { key: "strategy" as const, label: "SEO Strategy" },
          { key: "validation" as const, label: "Validation Report" },
        ].map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                active
                  ? "border-[var(--season-primary)] text-[var(--season-primary-hover)] font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: METADATA & CONTENT */}
      {activeTab === "metadata" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-md p-5 space-y-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <h2 className="text-sm font-semibold text-slate-900 pb-2.5 border-b border-slate-100">
              Page Identity &amp; Workflow
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  SEO Meta Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[var(--season-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  URL Slug <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[var(--season-primary)]"
                />
                {publicUrl && (
                  <p className="text-[11px] text-slate-500 font-mono mt-1">
                    Canonical: https://www.wanderkashmir.com{publicUrl}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  H1 Heading <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={h1Heading}
                  onChange={(e) => setH1Heading(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[var(--season-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Workflow State
                </label>
                <select
                  value={workflowState}
                  onChange={(e) => setWorkflowState(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[var(--season-primary)]"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="RESEARCHED">Researched</option>
                  <option value="STRATEGISED">Strategised</option>
                  <option value="GENERATED">Generated</option>
                  <option value="VALIDATED">Validated</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-700">Meta Description</label>
                <span className={`text-[11px] tabular-nums ${description.length > 160 ? "text-amber-700" : "text-slate-400"}`}>
                  {description.length} / 160 chars
                </span>
              </div>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-md p-3 text-xs text-slate-900 focus:outline-none focus:border-[var(--season-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Featured Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[var(--season-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Article / Landing Content (Markdown)
              </label>
              <textarea
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-md p-3 text-xs font-mono text-slate-900 leading-relaxed focus:outline-none focus:border-[var(--season-primary)]"
              />
            </div>
          </div>

          {/* Structured FAQs (Preserved & Editable) */}
          <div className="bg-white border border-slate-200/90 rounded-md p-5 space-y-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Structured FAQs ({faqs.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rendered in FAQ accordions and FAQPage structured data.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add FAQ</span>
              </button>
            </div>

            {faqs.length === 0 ? (
              <p className="text-xs text-slate-500">No FAQs configured for this page.</p>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-3.5 rounded-md bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) =>
                          setFaqs(
                            faqs.map((item, i) =>
                              i === idx ? { ...item, question: e.target.value } : item
                            )
                          )
                        }
                        placeholder={`Question ${idx + 1}`}
                        className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[var(--season-primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                        aria-label="Remove FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) =>
                        setFaqs(
                          faqs.map((item, i) =>
                            i === idx ? { ...item, answer: e.target.value } : item
                          )
                        )
                      }
                      placeholder="Answer..."
                      className="w-full bg-white border border-slate-200 rounded-md p-2.5 text-xs text-slate-700 focus:outline-none focus:border-[var(--season-primary)]"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Link
              href={adminHref("/admin/seo")}
              className="px-4 py-2 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: RESEARCH DATA */}
      {activeTab === "research" && (
        <div className="bg-white border border-slate-200/90 rounded-md p-5 space-y-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="pb-2.5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Keyword Research &amp; GSC Snapshot</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Saved research payload from Research Studio.
            </p>
          </div>
          {page.seoResearch ? (
            <pre className="p-4 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 overflow-x-auto max-h-[500px]">
              {JSON.stringify(page.seoResearch, null, 2)}
            </pre>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              No research data recorded yet. Open Research Studio from the header to run keyword analysis.
            </p>
          )}
        </div>
      )}

      {/* TAB 3: STRATEGY */}
      {activeTab === "strategy" && (
        <div className="bg-white border border-slate-200/90 rounded-md p-5 space-y-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="pb-2.5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">SEO Strategy Payload</h2>
          </div>
          {page.seoStrategy ? (
            <pre className="p-4 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 overflow-x-auto max-h-[500px]">
              {JSON.stringify(page.seoStrategy, null, 2)}
            </pre>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              No strategy payload stored for this page yet.
            </p>
          )}
        </div>
      )}

      {/* TAB 4: VALIDATION */}
      {activeTab === "validation" && (
        <div className="bg-white border border-slate-200/90 rounded-md p-5 space-y-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="pb-2.5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Validation Report</h2>
          </div>
          {page.validationReport ? (
            <pre className="p-4 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 overflow-x-auto max-h-[500px]">
              {JSON.stringify(page.validationReport, null, 2)}
            </pre>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              No validation report recorded yet.
            </p>
          )}
        </div>
      )}

      <ConfirmActionDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title={`Delete draft "${page.title}"?`}
        description="This permanently removes this unpublished SEO draft. Published pages cannot be deleted from here."
        confirmLabel="Delete Draft"
        tone="danger"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
