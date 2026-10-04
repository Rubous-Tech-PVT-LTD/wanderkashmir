"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Edit2,
  Check,
  X,
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

  const presets: { type: string; label: string; icon: any; init: Partial<TourDynamicBlockInput> }[] = [
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
      id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
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
    onChange(updated);
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
    const updated = blocks.filter((_, i) => i !== index);
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
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Dynamic Content Blocks</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {blocks.length} {blocks.length === 1 ? "Block" : "Blocks"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Inject structured rich content sections (headings, paragraphs, callouts, tables, media) into this tour.
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAddMenu((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Block
          </button>

          {showAddMenu && (
            <div className="absolute right-0 top-10 z-30 w-64 rounded-xl border border-slate-700 bg-slate-900 shadow-xl p-1.5 space-y-1">
              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Choose Block Type
              </div>
              {presets.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.type}
                    type="button"
                    onClick={() => handleAddPreset(preset.init)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
                  >
                    <Icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center text-xs text-slate-400">
          No dynamic blocks added yet. Click &quot;Add Block&quot; to insert custom headings, stories, photos, or tips.
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, idx) => {
            const isEditing = editingBlockIdx === idx;
            const isVisible = block.isVisible !== false;

            return (
              <div
                key={block.id || idx}
                className={`rounded-lg border transition-all ${
                  isVisible
                    ? "border-slate-800 bg-slate-900/60"
                    : "border-slate-800/60 bg-slate-950/40 opacity-70"
                }`}
              >
                {/* Block Header Bar */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 rounded-t-lg">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0 border border-slate-700">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      {block.type}
                    </span>
                    {block.text && (
                      <span className="text-xs text-slate-400 truncate max-w-xs">
                        — {String(block.text).slice(0, 45)}
                      </span>
                    )}
                    {block.title && !block.text && (
                      <span className="text-xs text-slate-400 truncate max-w-xs">
                        — {String(block.title).slice(0, 45)}
                      </span>
                    )}
                    {!isVisible && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-400/20">
                        Hidden
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(idx)}
                      className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
                        isVisible ? "text-slate-400 hover:text-white" : "text-amber-400"
                      }`}
                      title={isVisible ? "Hide Block" : "Show Block"}
                    >
                      {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, "up")}
                      disabled={idx === 0}
                      className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition-colors"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, "down")}
                      disabled={idx === blocks.length - 1}
                      className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition-colors"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => (isEditing ? handleCancelEdit() : handleStartEdit(idx))}
                      className="p-1.5 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-800 transition-colors"
                      title="Edit Block"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                      title="Delete Block"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Block Editor */}
                {isEditing && blockDraft && (
                  <div className="p-4 space-y-3.5 bg-slate-900/40 border-t border-slate-800">
                    {/* HEADING */}
                    {blockDraft.type === "heading" && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <select
                            value={blockDraft.level || 2}
                            onChange={(e) =>
                              setBlockDraft({ ...blockDraft, level: Number(e.target.value) as any })
                            }
                            className="w-36 rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white"
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
                            className="flex-1 rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-white"
                          />
                        </div>
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
                          className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs font-mono text-white leading-relaxed"
                        />
                        <p className="text-[11px] text-slate-400">
                          Supports Markdown formatting.
                        </p>
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
                          className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={blockDraft.alt || ""}
                            onChange={(e) => setBlockDraft({ ...blockDraft, alt: e.target.value })}
                            placeholder="Alt text / Description"
                            className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={blockDraft.caption || ""}
                            onChange={(e) => setBlockDraft({ ...blockDraft, caption: e.target.value })}
                            placeholder="Optional Caption"
                            className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        {blockDraft.url && (
                          <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
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
                        <div className="flex gap-2">
                          <select
                            value={blockDraft.variant || "tip"}
                            onChange={(e) => setBlockDraft({ ...blockDraft, variant: e.target.value as any })}
                            className="w-32 rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white"
                          >
                            <option value="tip">💡 Tip</option>
                            <option value="info">ℹ️ Info</option>
                            <option value="warning">⚠️ Warning</option>
                            <option value="quote">💬 Quote</option>
                          </select>
                          <input
                            type="text"
                            value={blockDraft.title || ""}
                            onChange={(e) => setBlockDraft({ ...blockDraft, title: e.target.value })}
                            placeholder="Callout title..."
                            className="flex-1 rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-white"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={blockDraft.text || ""}
                          onChange={(e) => setBlockDraft({ ...blockDraft, text: e.target.value })}
                          placeholder="Callout explanation or advice..."
                          className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    )}

                    {/* LIST */}
                    {blockDraft.type === "list" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <select
                            value={blockDraft.style || "bullet"}
                            onChange={(e) => setBlockDraft({ ...blockDraft, style: e.target.value as any })}
                            className="w-36 rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-white"
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
                            className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Item
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {(blockDraft.items || [""]).map((item: string, iIdx: number) => (
                            <div key={iIdx} className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 w-4 text-center">{iIdx + 1}.</span>
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => {
                                  const items = [...(blockDraft.items || [])];
                                  items[iIdx] = e.target.value;
                                  setBlockDraft({ ...blockDraft, items });
                                }}
                                placeholder={`Item ${iIdx + 1}...`}
                                className="flex-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const items = (blockDraft.items || []).filter((_: any, i: number) => i !== iIdx);
                                  setBlockDraft({ ...blockDraft, items });
                                }}
                                className="p-1 text-slate-500 hover:text-rose-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TABLE */}
                    {blockDraft.type === "table" && (
                      <div className="space-y-2">
                        <p className="text-[11px] text-slate-400">
                          Table columns & rows editor:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {(blockDraft.headers || ["Col 1", "Col 2"]).map((header: string, hIdx: number) => (
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
                              className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-bold text-white"
                            />
                          ))}
                        </div>
                        <div className="space-y-1.5">
                          {(blockDraft.rows || [["", ""]]).map((row: string[], rIdx: number) => (
                            <div key={rIdx} className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={row[0] || ""}
                                onChange={(e) => {
                                  const rows = [...(blockDraft.rows || [])];
                                  rows[rIdx][0] = e.target.value;
                                  setBlockDraft({ ...blockDraft, rows });
                                }}
                                placeholder="Col 1 value..."
                                className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white"
                              />
                              <input
                                type="text"
                                value={row[1] || ""}
                                onChange={(e) => {
                                  const rows = [...(blockDraft.rows || [])];
                                  rows[rIdx][1] = e.target.value;
                                  setBlockDraft({ ...blockDraft, rows });
                                }}
                                placeholder="Col 2 value..."
                                className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white"
                              />
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
                          className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Table Row
                        </button>
                      </div>
                    )}

                    {/* LINK */}
                    {blockDraft.type === "link" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={blockDraft.text || ""}
                          onChange={(e) => setBlockDraft({ ...blockDraft, text: e.target.value })}
                          placeholder="Button / Link text"
                          className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="url"
                          value={blockDraft.url || ""}
                          onChange={(e) => setBlockDraft({ ...blockDraft, url: e.target.value })}
                          placeholder="Destination URL (https://...)"
                          className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-3 py-1 text-xs text-slate-400 hover:text-white rounded transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveDraft}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors"
                      >
                        <Check className="w-3 h-3" /> Done
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
