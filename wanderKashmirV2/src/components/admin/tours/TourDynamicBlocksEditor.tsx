"use client";

import { useState, type ComponentType } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Pencil,
  Check,
  Layers,
  Heading,
  AlignLeft,
  ImageIcon,
  List,
  Table as TableIcon,
  Lightbulb,
  Link as LinkIcon,
  Video,
} from "lucide-react";
import { TourDynamicBlockInput } from "@/actions/adminTours";

function createBlockId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `block_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

interface TourDynamicBlocksEditorProps {
  blocks: TourDynamicBlockInput[];
  onChange: (blocks: TourDynamicBlockInput[]) => void;
}

export default function TourDynamicBlocksEditor({
  blocks = [],
  onChange,
}: TourDynamicBlocksEditorProps) {
  const [editingBlockIdx, setEditingBlockIdx] = useState<number | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [blockDraft, setBlockDraft] = useState<TourDynamicBlockInput | null>(null);

  const presets: {
    type: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
    init: Partial<TourDynamicBlockInput>;
  }[] = [
    {
      type: "heading",
      label: "Heading (H2 / H3 / H4)",
      icon: Heading,
      init: { type: "heading", level: 2, text: "" },
    },
    {
      type: "paragraph",
      label: "Paragraph (Markdown)",
      icon: AlignLeft,
      init: { type: "paragraph", text: "" },
    },
    {
      type: "image",
      label: "Featured Image",
      icon: ImageIcon,
      init: { type: "image", url: "", alt: "", caption: "", layout: "full" },
    },
    {
      type: "callout",
      label: "Callout / Pro Tip",
      icon: Lightbulb,
      init: { type: "callout", variant: "tip", title: "Traveler Tip", text: "" },
    },
    {
      type: "list",
      label: "Key Points / List",
      icon: List,
      init: { type: "list", style: "bullet", items: [""] },
    },
    {
      type: "table",
      label: "Comparison Table",
      icon: TableIcon,
      init: {
        type: "table",
        headers: ["Feature / Circuit", "Details"],
        rows: [["Route", "Scenic mountain highway"]],
      },
    },
    {
      type: "link",
      label: "Action Button / Link",
      icon: LinkIcon,
      init: { type: "link", text: "Explore Details", url: "https://", style: "button" },
    },
    {
      type: "video",
      label: "Video Embed",
      icon: Video,
      init: { type: "video", url: "", title: "", caption: "" },
    },
  ];

  const handleAddPreset = (init: Partial<TourDynamicBlockInput>) => {
    const newBlock: TourDynamicBlockInput = {
      id: createBlockId(),
      isVisible: true,
      displayOrder: blocks.length + 1,
      ...init,
    } as TourDynamicBlockInput;

    const updated = [...blocks, newBlock];
    onChange(updated);
    setEditingBlockIdx(updated.length - 1);
    setBlockDraft({ ...newBlock });
    setShowAddMenu(false);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= blocks.length) return;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    const reordered = updated.map((b, i) => ({ ...b, displayOrder: i + 1 }));
    onChange(reordered);
    if (editingBlockIdx === index) setEditingBlockIdx(target);
    else if (editingBlockIdx === target) setEditingBlockIdx(index);
  };

  const handleToggleVisibility = (index: number) => {
    const updated = [...blocks];
    updated[index] = {
      ...updated[index],
      isVisible: updated[index].isVisible === false ? true : false,
    };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = blocks
      .filter((_, i) => i !== index)
      .map((b, i) => ({ ...b, displayOrder: i + 1 }));
    onChange(updated);
    if (editingBlockIdx === index) {
      setEditingBlockIdx(null);
      setBlockDraft(null);
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingBlockIdx(index);
    setBlockDraft({ ...blocks[index] });
  };

  const handleSaveDraft = () => {
    if (editingBlockIdx === null || !blockDraft) return;
    const updated = [...blocks];
    updated[editingBlockIdx] = { ...blockDraft };
    onChange(updated);
    setEditingBlockIdx(null);
    setBlockDraft(null);
  };

  const handleCancelEdit = () => {
    setEditingBlockIdx(null);
    setBlockDraft(null);
  };

  return (
    <div className="rounded-md border border-slate-200/90 bg-white p-5 sm:p-6 space-y-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--season-primary)]" />
            <h2 className="text-sm font-semibold text-slate-900">Dynamic Content Blocks</h2>
            <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              {blocks.length} {blocks.length === 1 ? "block" : "blocks"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Add structured rich content sections (headings, paragraphs, callouts, tables, video, and media) to this tour.
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAddMenu((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Block</span>
          </button>

          {showAddMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowAddMenu(false)} />
              <div className="absolute right-0 top-10 z-30 w-64 rounded-md border border-slate-200 bg-white shadow-lg p-1.5 space-y-0.5">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Choose Block Type
                </div>
                {presets.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.type}
                      type="button"
                      onClick={() => handleAddPreset(preset.init)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors text-left cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5 text-[var(--season-primary)] shrink-0" />
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-xs text-slate-500">
          No dynamic blocks added yet. Click &ldquo;Add Block&rdquo; to insert custom headings, stories, photos, or tips.
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, idx) => {
            const isEditing = editingBlockIdx === idx;
            const isVisible = block.isVisible !== false;

            return (
              <div
                key={block.id || idx}
                className={`rounded-md border transition-colors ${
                  isVisible ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50 opacity-75"
                }`}
              >
                {/* Block Header Bar */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 rounded-t-md">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="h-5 w-5 rounded bg-white text-slate-600 text-[10px] font-semibold flex items-center justify-center shrink-0 border border-slate-200">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-[var(--season-primary)] uppercase tracking-wider">
                      {block.type}
                    </span>
                    {block.text && (
                      <span className="text-xs text-slate-500 truncate max-w-xs">
                        — {String(block.text).slice(0, 45)}
                      </span>
                    )}
                    {block.title && !block.text && (
                      <span className="text-xs text-slate-500 truncate max-w-xs">
                        — {String(block.title).slice(0, 45)}
                      </span>
                    )}
                    {!isVisible && (
                      <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                        Hidden
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(idx)}
                      className={`rounded p-1.5 hover:bg-slate-200/70 transition-colors cursor-pointer ${
                        isVisible ? "text-slate-500 hover:text-slate-800" : "text-amber-600"
                      }`}
                      title={isVisible ? "Hide block" : "Show block"}
                    >
                      {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, "up")}
                      disabled={idx === 0}
                      className="rounded p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 hover:bg-slate-200/70 transition-colors cursor-pointer"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, "down")}
                      disabled={idx === blocks.length - 1}
                      className="rounded p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 hover:bg-slate-200/70 transition-colors cursor-pointer"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => (isEditing ? handleCancelEdit() : handleStartEdit(idx))}
                      className="rounded p-1.5 text-slate-500 hover:text-[var(--season-primary)] hover:bg-slate-200/70 transition-colors cursor-pointer"
                      title="Edit block"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="rounded p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete block"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Block Editor */}
                {isEditing && blockDraft && (
                  <div className="p-4 space-y-3.5 bg-white rounded-b-md">
                    {/* HEADING */}
                    {blockDraft.type === "heading" && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={blockDraft.level || 2}
                          onChange={(e) =>
                            setBlockDraft({
                              ...blockDraft,
                              level: Number(e.target.value) as 2 | 3 | 4,
                            })
                          }
                          className="sm:w-40 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                        >
                          <option value={2}>H2 — Section Title</option>
                          <option value={3}>H3 — Subsection</option>
                          <option value={4}>H4 — Sub-heading</option>
                        </select>
                        <input
                          type="text"
                          value={blockDraft.text || ""}
                          onChange={(e) => setBlockDraft({ ...blockDraft, text: e.target.value })}
                          placeholder="Heading text..."
                          className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                        />
                      </div>
                    )}

                    {/* PARAGRAPH */}
                    {blockDraft.type === "paragraph" && (
                      <div className="space-y-1">
                        <textarea
                          rows={4}
                          value={blockDraft.text || ""}
                          onChange={(e) => setBlockDraft({ ...blockDraft, text: e.target.value })}
                          placeholder="Write paragraph content... (Markdown supported: **bold**, *italic*, [link](url))"
                          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 leading-relaxed focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                        />
                        <p className="text-[11px] text-slate-500">Supports Markdown formatting.</p>
                      </div>
                    )}

                    {/* IMAGE */}
                    {blockDraft.type === "image" && (
                      <div className="space-y-2.5">
                        <input
                          type="url"
                          value={blockDraft.url || ""}
                          onChange={(e) => setBlockDraft({ ...blockDraft, url: e.target.value })}
                          placeholder="Image URL (https://...)"
                          className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={blockDraft.alt || ""}
                            onChange={(e) => setBlockDraft({ ...blockDraft, alt: e.target.value })}
                            placeholder="Alt text / description"
                            className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                          />
                          <input
                            type="text"
                            value={blockDraft.caption || ""}
                            onChange={(e) => setBlockDraft({ ...blockDraft, caption: e.target.value })}
                            placeholder="Optional caption"
                            className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                          />
                        </div>
                        {blockDraft.url && (
                          <div className="relative aspect-video w-full max-w-sm rounded-md overflow-hidden border border-slate-200 bg-slate-100">
                            <Image
                              src={blockDraft.url}
                              alt={blockDraft.alt || "Preview"}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* CALLOUT */}
                    {blockDraft.type === "callout" && (
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <select
                            value={blockDraft.variant || "tip"}
                            onChange={(e) =>
                              setBlockDraft({
                                ...blockDraft,
                                variant: e.target.value as "tip" | "info" | "warning" | "quote",
                              })
                            }
                            className="sm:w-32 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                          >
                            <option value="tip">Tip</option>
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="quote">Quote</option>
                          </select>
                          <input
                            type="text"
                            value={blockDraft.title || ""}
                            onChange={(e) => setBlockDraft({ ...blockDraft, title: e.target.value })}
                            placeholder="Callout title..."
                            className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={blockDraft.text || ""}
                          onChange={(e) => setBlockDraft({ ...blockDraft, text: e.target.value })}
                          placeholder="Callout explanation or advice..."
                          className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                        />
                      </div>
                    )}

                    {/* LIST */}
                    {blockDraft.type === "list" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <select
                            value={blockDraft.style || "bullet"}
                            onChange={(e) =>
                              setBlockDraft({
                                ...blockDraft,
                                style: e.target.value as "bullet" | "numbered",
                              })
                            }
                            className="w-36 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                          >
                            <option value="bullet">Bullet List</option>
                            <option value="numbered">Numbered List</option>
                          </select>
                          <button
                            type="button"
                            onClick={() =>
                              setBlockDraft({
                                ...blockDraft,
                                items: [...(blockDraft.items || []), ""],
                              })
                            }
                            className="text-xs font-medium text-[var(--season-primary)] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Add Item
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {(blockDraft.items || [""]).map((item: string, iIdx: number) => (
                            <div key={iIdx} className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 w-4 text-center">{iIdx + 1}.</span>
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => {
                                  const items = [...(blockDraft.items || [])];
                                  items[iIdx] = e.target.value;
                                  setBlockDraft({ ...blockDraft, items });
                                }}
                                placeholder={`Item ${iIdx + 1}...`}
                                className="flex-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const items = (blockDraft.items || []).filter(
                                    (_: string, i: number) => i !== iIdx
                                  );
                                  setBlockDraft({ ...blockDraft, items });
                                }}
                                className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TABLE */}
                    {blockDraft.type === "table" && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-medium text-slate-500">
                          Table columns & rows
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {(blockDraft.headers || ["Col 1", "Col 2"]).map(
                            (header: string, hIdx: number) => (
                              <input
                                key={hIdx}
                                type="text"
                                value={header}
                                onChange={(e) => {
                                  const headers = [...(blockDraft.headers || [])];
                                  headers[hIdx] = e.target.value;
                                  setBlockDraft({ ...blockDraft, headers });
                                }}
                                placeholder={`Column ${hIdx + 1} Header`}
                                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:bg-white focus:outline-hidden"
                              />
                            )
                          )}
                        </div>
                        <div className="space-y-1.5">
                          {(blockDraft.rows || [["", ""]]).map((row: string[], rIdx: number) => (
                            <div key={rIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={row[0] || ""}
                                onChange={(e) => {
                                  const rows = (blockDraft.rows || []).map((r: string[], i: number) =>
                                    i === rIdx ? [e.target.value, r[1] || ""] : r
                                  );
                                  setBlockDraft({ ...blockDraft, rows });
                                }}
                                placeholder="Col 1 value..."
                                className="flex-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                              />
                              <input
                                type="text"
                                value={row[1] || ""}
                                onChange={(e) => {
                                  const rows = (blockDraft.rows || []).map((r: string[], i: number) =>
                                    i === rIdx ? [r[0] || "", e.target.value] : r
                                  );
                                  setBlockDraft({ ...blockDraft, rows });
                                }}
                                placeholder="Col 2 value..."
                                className="flex-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const rows = (blockDraft.rows || []).filter(
                                    (_: string[], i: number) => i !== rIdx
                                  );
                                  setBlockDraft({ ...blockDraft, rows });
                                }}
                                className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                                aria-label="Delete row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setBlockDraft({
                              ...blockDraft,
                              rows: [...(blockDraft.rows || []), ["", ""]],
                            })
                          }
                          className="text-xs font-medium text-[var(--season-primary)] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Table Row
                        </button>
                      </div>
                    )}

                    {/* VIDEO */}
                    {blockDraft.type === "video" && (
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={blockDraft.url || ""}
                          onChange={(e) => setBlockDraft({ ...blockDraft, url: e.target.value })}
                          placeholder="YouTube or Vimeo URL (https://...)"
                          className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                        />
                        <input
                          type="text"
                          value={blockDraft.caption || ""}
                          onChange={(e) => setBlockDraft({ ...blockDraft, caption: e.target.value })}
                          placeholder="Video caption (optional)"
                          className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                        />
                      </div>
                    )}

                    {/* LINK */}
                    {blockDraft.type === "link" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={blockDraft.text || ""}
                          onChange={(e) => setBlockDraft({ ...blockDraft, text: e.target.value })}
                          placeholder="Button / link text"
                          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                        />
                        <input
                          type="url"
                          value={blockDraft.url || ""}
                          onChange={(e) => setBlockDraft({ ...blockDraft, url: e.target.value })}
                          placeholder="Destination URL (https://...)"
                          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                        />
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveDraft}
                        className="inline-flex items-center gap-1 rounded-md bg-[var(--season-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] transition-colors cursor-pointer shadow-xs"
                      >
                        <Check className="w-3 h-3" />
                        <span>Done</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
