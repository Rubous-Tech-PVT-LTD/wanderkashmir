"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Reply,
  Star,
  ExternalLink,
  Loader2,
  Calendar,
  User,
  Mail,
  AlertTriangle,
  Send,
  X,
  RefreshCw,
} from "lucide-react";
import {
  AdminSeoCommentItem,
  toggleSeoCommentApprovalAction,
  replyToSeoCommentAction,
  deleteSeoCommentAction,
} from "@/actions/adminSeoComments";

interface SeoCommentsClientProps {
  initialComments: AdminSeoCommentItem[];
  total: number;
  totalPages: number;
  currentPage: number;
  currentSearch: string;
  currentStatus: "ALL" | "APPROVED" | "PENDING";
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

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Reply Modal State
  const [replyModalComment, setReplyModalComment] = useState<AdminSeoCommentItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSavingReply, setIsSavingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Delete Modal State
  const [deleteModalComment, setDeleteModalComment] = useState<AdminSeoCommentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const applyFilters = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== "ALL" && !(k === "page" && v === "1")) {
        params.set(k, v);
      } else {
        params.delete(k);
      }
    });
    router.push(`/admin/seo-comments?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: searchVal, page: "1" });
  };

  const handleToggleApproval = async (comment: AdminSeoCommentItem) => {
    setTogglingId(comment.id);
    try {
      const res = await toggleSeoCommentApprovalAction(comment.id, !comment.isApproved);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to update status");
      }
    } catch {
      alert("Network error updating status.");
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
        router.refresh();
      } else {
        setReplyError(res.error || "Failed to save reply.");
      }
    } catch (err: any) {
      setReplyError(err?.message || "Error communicating with server.");
    } finally {
      setIsSavingReply(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalComment) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await deleteSeoCommentAction(deleteModalComment.id);
      if (res.success) {
        setDeleteModalComment(null);
        router.refresh();
      } else {
        setDeleteError(res.error || "Failed to delete comment.");
      }
    } catch (err: any) {
      setDeleteError(err?.message || "Failed to communicate with server.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">SEO Traveler Comments & Reviews</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Moderate, approve, and respond to traveler feedback submitted on public SEO and guide pages.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
            {total} Total Comments
          </span>
          <button
            onClick={() => router.refresh()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search commenter, email, text, or page..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-medium text-slate-400 mr-1 hidden sm:inline">Status:</span>
          {(["ALL", "APPROVED", "PENDING"] as const).map((status) => (
            <button
              key={status}
              onClick={() => applyFilters({ status, page: "1" })}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                currentStatus === status
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {status === "ALL" ? "All Comments" : status === "APPROVED" ? "Approved" : "Pending Review"}
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      {initialComments.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No comments found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            {currentSearch || currentStatus !== "ALL"
              ? "No comments matched your search or moderation filters. Try clearing your search."
              : "There are currently no traveler comments submitted on SEO landing pages."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {initialComments.map((c) => (
            <div
              key={c.id}
              className={`bg-slate-900 border rounded-2xl p-5 transition ${
                c.isApproved ? "border-slate-800" : "border-amber-500/30 bg-amber-500/[0.02]"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  {/* Author Header */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-white text-base flex items-center gap-1.5">
                      <User className="w-4 h-4 text-emerald-400" />
                      {c.name}
                    </span>
                    {c.email && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        {c.email}
                      </span>
                    )}
                    {c.rating && (
                      <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < c.rating! ? "fill-amber-400" : "text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.isApproved
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {c.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>

                  {/* Target Page Info */}
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span>On:</span>
                    <Link
                      href={`/blog/${c.seoPage.slug}`}
                      target="_blank"
                      className="font-medium text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      {c.seoPage.title || c.seoPage.slug}
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </Link>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {c.seoPage.type}
                    </span>
                  </div>

                  {/* Comment Body */}
                  <p className="text-sm text-slate-200 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 whitespace-pre-wrap">
                    &ldquo;{c.comment}&rdquo;
                  </p>

                  {/* Admin Reply (if exists) */}
                  {c.adminReply && (
                    <div className="ml-4 pl-3 border-l-2 border-emerald-500/50 bg-emerald-500/5 p-3 rounded-r-xl">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                        <Reply className="w-3.5 h-3.5" />
                        Admin Reply
                      </div>
                      <p className="text-xs text-slate-300 whitespace-pre-wrap">{c.adminReply}</p>
                    </div>
                  )}
                </div>

                {/* Actions Toolbar */}
                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                  <button
                    onClick={() => handleToggleApproval(c)}
                    disabled={togglingId === c.id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 w-full justify-center transition border ${
                      c.isApproved
                        ? "bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700"
                        : "bg-emerald-500 text-slate-950 font-bold border-emerald-400 hover:bg-emerald-400"
                    }`}
                  >
                    {togglingId === c.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : c.isApproved ? (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        Unapprove
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => openReplyModal(c)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 w-full justify-center transition"
                  >
                    <Reply className="w-3.5 h-3.5 text-emerald-400" />
                    {c.adminReply ? "Edit Reply" : "Reply"}
                  </button>

                  <button
                    onClick={() => setDeleteModalComment(c)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition"
                    title="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Showing Page <span className="text-white font-bold">{currentPage}</span> of{" "}
            <span className="text-white font-bold">{totalPages}</span> ({total} items)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => applyFilters({ page: (currentPage - 1).toString() })}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
            >
              Previous
            </button>
            <button
              onClick={() => applyFilters({ page: (currentPage + 1).toString() })}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyModalComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setReplyModalComment(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Reply className="w-5 h-5 text-emerald-400" />
              Reply to {replyModalComment.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              &ldquo;{replyModalComment.comment}&rdquo;
            </p>

            {replyError && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                {replyError}
              </div>
            )}

            <form onSubmit={handleSaveReply} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Official Admin Response (Visible publicly on page):
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank you for sharing your experience! We are delighted to..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyModalComment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingReply}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Save Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white text-center">Delete Comment</h3>
            <p className="text-xs text-slate-400 text-center mt-1">
              Are you sure you want to permanently delete this comment by{" "}
              <strong className="text-white">{deleteModalComment.name}</strong>? This action cannot be undone.
            </p>

            {deleteError && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-center">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeleteModalComment(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500 text-white hover:bg-red-600 font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
