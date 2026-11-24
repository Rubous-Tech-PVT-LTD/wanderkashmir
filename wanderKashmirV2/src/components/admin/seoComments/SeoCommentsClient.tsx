"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Trash2,
  Reply,
  Star,
  ExternalLink,
  Loader2,
  Calendar,
  User,
  Mail,
  Send,
  RefreshCw,
} from "lucide-react";
import {
  AdminSeoCommentItem,
  toggleSeoCommentApprovalAction,
  replyToSeoCommentAction,
  deleteSeoCommentAction,
} from "@/actions/adminSeoComments";
import {
  AdminPageHeader,
  AdminFilterBar,
  AdminToastBanner,
  AdminModal,
  ConfirmActionDialog,
  AdminEmptyState,
  AdminPagination,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

interface SeoCommentsClientProps {
  initialComments: AdminSeoCommentItem[];
  total: number;
  totalPages: number;
  currentPage: number;
  currentSearch: string;
  currentStatus: "ALL" | "APPROVED" | "PENDING";
}

function getPublicSeoUrl(page: AdminSeoCommentItem["seoPage"]): string {
  const type = (page.type || "").toUpperCase();
  if (type === "DESTINATION") return `/destinations/${page.slug}`;
  return `/blog/${page.slug}`;
}

export default function SeoCommentsClient({
  initialComments,
  total,
  totalPages,
  currentPage,
  currentSearch,
  currentStatus,
}: SeoCommentsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const basePath = useAdminBasePath();

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const [replyModalComment, setReplyModalComment] = useState<AdminSeoCommentItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSavingReply, setIsSavingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const [deleteModalComment, setDeleteModalComment] = useState<AdminSeoCommentItem | null>(null);

  const applyFilters = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== "ALL" && !(k === "page" && v === "1")) {
        params.set(k, v);
      } else {
        params.delete(k);
      }
    });
    const qs = params.toString();
    router.push(qs ? `${basePath}/seo-comments?${qs}` : `${basePath}/seo-comments`);
  };

  const handleToggleApproval = async (comment: AdminSeoCommentItem) => {
    setTogglingId(comment.id);
    setFeedback(null);
    try {
      const res = await toggleSeoCommentApprovalAction(comment.id, !comment.isApproved);
      if (res.success) {
        setFeedback({
          type: "success",
          text: `Comment by ${comment.name} ${!comment.isApproved ? "approved" : "moved to pending"}.`,
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to update comment status." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error updating comment status." });
    } finally {
      setTogglingId(null);
    }
  };

  const openReplyModal = (comment: AdminSeoCommentItem) => {
    setReplyModalComment(comment);
    setReplyText(comment.adminReply || "");
    setReplyError(null);
  };

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyModalComment) return;
    setIsSavingReply(true);
    setReplyError(null);

    try {
      const res = await replyToSeoCommentAction(replyModalComment.id, replyText);
      if (res.success) {
        setReplyModalComment(null);
        setFeedback({ type: "success", text: "Official reply saved." });
        router.refresh();
      } else {
        setReplyError(res.error || "Failed to save reply.");
      }
    } catch (err: unknown) {
      setReplyError(err instanceof Error ? err.message : "Error communicating with server.");
    } finally {
      setIsSavingReply(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalComment) return;
    const res = await deleteSeoCommentAction(deleteModalComment.id);
    if (res.success) {
      setFeedback({ type: "success", text: `Deleted comment by ${deleteModalComment.name}.` });
      setDeleteModalComment(null);
      router.refresh();
    } else {
      throw new Error(res.error || "Failed to delete comment.");
    }
  };

  const hasFilters = Boolean(currentSearch || currentStatus !== "ALL");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="SEO Comments Moderation"
        subtitle="Approve, reply to, and moderate traveler comments on public guide and destination pages."
        actions={
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
        }
      />

      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      <AdminFilterBar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        onSearchSubmit={() => applyFilters({ search: searchVal.trim(), page: "1" })}
        searchPlaceholder="Search commenter, email, message, or page..."
        tabs={[
          { key: "ALL", label: "All Comments", count: currentStatus === "ALL" ? total : undefined },
          { key: "PENDING", label: "Pending Review" },
          { key: "APPROVED", label: "Approved" },
        ]}
        activeTab={currentStatus}
        onTabChange={(status) => applyFilters({ status, page: "1" })}
        hasActiveFilters={hasFilters}
        onReset={() => {
          setSearchVal("");
          router.push(`${basePath}/seo-comments`);
        }}
      />

      {initialComments.length === 0 ? (
        <AdminEmptyState
          icon={<MessageSquare className="h-5 w-5" />}
          title="No comments found"
          description={
            hasFilters
              ? "No comments matched your search or status filter."
              : "No traveler comments have been submitted on SEO pages yet."
          }
          action={
            hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearchVal("");
                  router.push(`${basePath}/seo-comments`);
                }}
                className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Reset Filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {initialComments.map((c) => (
            <div
              key={c.id}
              className={`rounded-md border bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors ${
                c.isApproved ? "border-slate-200/90" : "border-amber-200 bg-amber-50/20"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>{c.name}</span>
                    </span>
                    {c.email && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span>{c.email}</span>
                      </span>
                    )}
                    {c.rating != null && c.rating > 0 && (
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < (c.rating ?? 0)
                                ? "text-amber-500 fill-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400 tabular-nums">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(c.createdAt).toLocaleDateString("en-IN")}</span>
                    </span>
                    <StatusBadge status={c.isApproved ? "APPROVED" : "PENDING"} />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                    <span>On:</span>
                    <Link
                      href={getPublicSeoUrl(c.seoPage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-[var(--season-primary)] hover:underline"
                    >
                      <span>{c.seoPage.title || c.seoPage.slug}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <span className="text-slate-300">·</span>
                    <span className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 uppercase">
                      {c.seoPage.type}
                    </span>
                  </div>

                  <p className="rounded-md border border-slate-200/80 bg-slate-50 p-3 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    &ldquo;{c.comment}&rdquo;
                  </p>

                  {c.adminReply && (
                    <div className="ml-3 pl-3 border-l-2 border-[var(--season-primary)] bg-[var(--season-primary-light)] p-3 rounded-r-md">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--season-primary-hover)] mb-1">
                        <Reply className="h-3 w-3" />
                        <span>Official Admin Reply</span>
                      </div>
                      <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {c.adminReply}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 md:w-32">
                  <button
                    type="button"
                    onClick={() => handleToggleApproval(c)}
                    disabled={togglingId === c.id}
                    className={`w-full inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer disabled:opacity-50 ${
                      c.isApproved
                        ? "border-slate-200 bg-white text-amber-700 hover:bg-amber-50"
                        : "border-[var(--season-primary)] bg-[var(--season-primary)] text-white hover:bg-[var(--season-primary-hover)] shadow-xs"
                    }`}
                  >
                    {togglingId === c.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : c.isApproved ? (
                      <>
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Unapprove</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => openReplyModal(c)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Reply className="h-3.5 w-3.5 text-slate-500" />
                    <span>{c.adminReply ? "Edit Reply" : "Reply"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteModalComment(c)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete comment"
                    aria-label={`Delete comment by ${c.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={total}
        itemLabel="comments"
        onPageChange={(page) => applyFilters({ page: String(page) })}
      />

      {/* Reply Modal */}
      <AdminModal
        open={Boolean(replyModalComment)}
        onClose={() => !isSavingReply && setReplyModalComment(null)}
        title={replyModalComment ? `Reply to ${replyModalComment.name}` : "Reply"}
        subtitle={replyModalComment ? `"${replyModalComment.comment}"` : undefined}
        maxWidth="md"
      >
        <form onSubmit={handleSaveReply} className="space-y-4">
          {replyError && (
            <div
              role="alert"
              className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
            >
              {replyError}
            </div>
          )}

          <div>
            <label htmlFor="seo-comment-reply" className="block text-xs font-medium text-slate-700 mb-1.5">
              Official Admin Response (Visible publicly on page)
            </label>
            <textarea
              id="seo-comment-reply"
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Thank you for sharing your experience! ..."
              className="w-full rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setReplyModalComment(null)}
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingReply}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSavingReply ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>Save Reply</span>
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmActionDialog
        open={Boolean(deleteModalComment)}
        onClose={() => setDeleteModalComment(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Comment"
        description={
          deleteModalComment
            ? `Permanently delete the comment by ${deleteModalComment.name}? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete Comment"
        tone="danger"
      />
    </div>
  );
}
