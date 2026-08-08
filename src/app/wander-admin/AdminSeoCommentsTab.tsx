"use client";

import { useState, useEffect } from "react";
import { getSeoComments, replyToSeoComment, deleteSeoComment } from "@/actions/admin-seo";
import toast from "react-hot-toast";
import { Trash2, MessageSquare, ExternalLink } from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/Pagination";

export default function AdminSeoCommentsTab() {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchComments();
  }, [currentPage]);

  const fetchComments = async () => {
    setIsLoading(true);
    const res = await getSeoComments(currentPage, 20);
    if (res.success) {
      setComments(res.comments);
      setTotalPages(res.totalPages || 1);
    } else {
      toast.error("Failed to load comments");
    }
    setIsLoading(false);
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return toast.error("Reply cannot be empty");
    
    const toastId = toast.loading("Saving reply...");
    const res = await replyToSeoComment(id, replyText);
    if (res.success) {
      toast.success("Replied successfully", { id: toastId });
      setReplyText("");
      setReplyingToId(null);
      fetchComments(); // Refresh list
    } else {
      toast.error(res.error || "Failed to save reply", { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    
    const res = await deleteSeoComment(id);
    if (res.success) {
      toast.success("Comment deleted");
      fetchComments();
    } else {
      toast.error(res.error || "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900">SEO Page & Blog Comments</h3>
          <p className="text-sm text-slate-500">Manage and reply to comments left by users on your generated pages.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : comments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Comments Yet</h3>
          <p className="text-slate-500">Comments will appear here once users leave them on your pages.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <ul className="divide-y divide-slate-100">
            {comments.map((comment) => (
              <li key={comment.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-slate-900">{comment.name}</h4>
                      <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleString()}</span>
                      {comment.rating && (
                         <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                           {comment.rating} ★
                         </span>
                      )}
                    </div>
                    
                    <Link 
                      href={`/${comment.seoPage.type === "BLOG" ? "blog" : "taxis"}/${comment.seoPage.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline mb-3 bg-indigo-50 px-2 py-1 rounded-md"
                    >
                      <ExternalLink className="w-3 h-3" /> {comment.seoPage.title}
                    </Link>

                    <p className="text-slate-700 text-sm whitespace-pre-wrap">{comment.comment}</p>
                    
                    {/* Admin Reply Logic */}
                    {comment.adminReply ? (
                      <div className="mt-4 bg-orange-50 p-4 rounded-xl border border-orange-100 relative group">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-[10px]">W</div>
                          <span className="font-semibold text-orange-900 text-xs">Your Reply</span>
                        </div>
                        <p className="text-sm text-orange-800 pl-7">{comment.adminReply}</p>
                        <button 
                          onClick={() => { setReplyingToId(comment.id); setReplyText(comment.adminReply); }}
                          className="absolute top-2 right-2 text-xs text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity underline"
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      replyingToId !== comment.id && (
                        <button 
                          onClick={() => setReplyingToId(comment.id)}
                          className="mt-3 text-sm text-orange-600 font-medium hover:underline flex items-center gap-1"
                        >
                          <MessageSquare className="w-4 h-4" /> Reply
                        </button>
                      )
                    )}

                    {/* Reply Input Box */}
                    {replyingToId === comment.id && (
                      <div className="mt-4 flex gap-2">
                        <textarea
                          autoFocus
                          placeholder="Type your response as WanderKashmir admin..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-1 p-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[60px]"
                        />
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => handleReply(comment.id)}
                            className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => { setReplyingToId(null); setReplyText(""); }}
                            className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => handleDelete(comment.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    title="Delete comment"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
