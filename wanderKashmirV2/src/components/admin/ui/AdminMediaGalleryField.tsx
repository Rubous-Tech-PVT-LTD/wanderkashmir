"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  LayoutGrid,
} from "lucide-react";
import { GalleryImageItem, isValidImageUrl } from "@/lib/places/galleryValidation";

interface AdminMediaGalleryFieldProps {
  items: GalleryImageItem[];
  onChange: (items: GalleryImageItem[]) => void;
  entityName?: string;
  showBentoPreview?: boolean;
  showCaption?: boolean;
  showFeaturedStar?: boolean;
  title?: string;
  description?: string;
}

export function AdminMediaGalleryField({
  items,
  onChange,
  entityName = "Item",
  showBentoPreview = true,
  showCaption = true,
  showFeaturedStar = true,
  title = "Photo Gallery",
  description = "Add Cloudinary or HTTPS image URLs. Reorder images and provide descriptive alt text.",
}: AdminMediaGalleryFieldProps) {
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const normalizeOrder = (list: GalleryImageItem[]) =>
    list.map((item, idx) => ({ ...item, order: idx }));

  const addItem = () => {
    onChange(
      normalizeOrder([
        ...items,
        {
          url: "",
          alt: `${entityName} photo ${items.length + 1}`,
          caption: null,
          order: items.length,
          isFeatured: items.length === 0,
        },
      ])
    );
  };

  const updateItem = (index: number, patch: Partial<GalleryImageItem>) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onChange(normalizeOrder(next));
  };

  const moveItem = (index: number, dir: "up" | "down") => {
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(normalizeOrder(next));
  };

  const setFeatured = (index: number) => {
    onChange(
      items.map((item, i) => ({
        ...item,
        isFeatured: i === index,
      }))
    );
  };

  const handleBulkImport = () => {
    const urls = bulkInput
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    if (urls.length === 0) return;

    const added: GalleryImageItem[] = urls.map((url, idx) => ({
      url,
      alt: `${entityName} view ${items.length + idx + 1}`,
      caption: null,
      order: items.length + idx,
      isFeatured: items.length === 0 && idx === 0,
    }));

    onChange(normalizeOrder([...items, ...added]));
    setBulkInput("");
    setShowBulkAdd(false);
  };

  const validPreviewItems = items.filter((i) => i.url && isValidImageUrl(i.url));
  const sortedPreview = [...validPreviewItems].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return (a.order ?? 0) - (b.order ?? 0);
  });

  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {title} ({items.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {showBentoPreview && sortedPreview.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{showPreview ? "Hide Bento Preview" : "Bento Preview"}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowBulkAdd(!showBulkAdd)}
            className="px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {showBulkAdd ? "Close Bulk Import" : "Bulk Add URLs"}
          </button>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Image</span>
          </button>
        </div>
      </div>

      {showBulkAdd && (
        <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-2.5">
          <label className="block text-xs font-medium text-slate-700">
            Paste Image URLs (one per line or comma-separated)
          </label>
          <textarea
            rows={4}
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
            className="w-full bg-white border border-slate-200 rounded-md p-2.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowBulkAdd(false)}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBulkImport}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] cursor-pointer"
            >
              Import URLs
            </button>
          </div>
        </div>
      )}

      {showPreview && sortedPreview.length > 0 && (
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-medium text-slate-700">Live Bento Grid Preview</span>
            <span>{sortedPreview.length} valid image{sortedPreview.length === 1 ? "" : "s"}</span>
          </div>
          {sortedPreview.length >= 4 ? (
            <div className="grid grid-cols-4 grid-rows-2 gap-1.5 h-48 rounded-lg overflow-hidden">
              <div className="col-span-2 row-span-2 relative bg-slate-200">
                <Image
                  src={sortedPreview[0].url}
                  alt={sortedPreview[0].alt || "Cover"}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
                <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-900/75 text-white text-[10px] font-medium">
                  Cover
                </span>
              </div>
              {sortedPreview.slice(1, 5).map((img, i) => (
                <div
                  key={`${img.url}-${i}`}
                  className={`relative bg-slate-200 ${
                    sortedPreview.length === 4 && i === 2 ? "col-span-2" : ""
                  }`}
                >
                  <Image src={img.url} alt={img.alt || `Tile ${i + 2}`} fill className="object-cover" sizes="200px" />
                </div>
              ))}
            </div>
          ) : (
            <div className={`grid gap-1.5 h-40 rounded-lg overflow-hidden ${sortedPreview.length === 1 ? "grid-cols-1" : sortedPreview.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {sortedPreview.map((img, i) => (
                <div key={`${img.url}-${i}`} className="relative bg-slate-200">
                  <Image src={img.url} alt={img.alt || `Image ${i + 1}`} fill className="object-cover" sizes="300px" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="py-8 px-4 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
          <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-700">No gallery images added</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Add landscape photos to populate the public Bento gallery.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, index) => {
            const valid = Boolean(item.url && isValidImageUrl(item.url));
            return (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-slate-50/70 border border-slate-200/90 rounded-lg"
              >
                <div className="w-20 h-14 rounded-md bg-white border border-slate-200 relative overflow-hidden shrink-0">
                  {valid ? (
                    <Image
                      key={item.url}
                      src={item.url}
                      alt={item.alt || "Gallery image"}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                      {item.url ? "Invalid URL" : "Empty"}
                    </div>
                  )}
                  {(index === 0 || item.isFeatured) && (
                    <span className="absolute bottom-0.5 left-0.5 px-1 rounded bg-slate-900/75 text-white text-[9px] font-medium">
                      {item.isFeatured ? "Cover" : "#1"}
                    </span>
                  )}
                </div>

                <div className={`flex-1 grid grid-cols-1 ${showCaption ? "md:grid-cols-3" : "sm:grid-cols-2"} gap-2 w-full`}>
                  <input
                    type="url"
                    value={item.url}
                    onChange={(e) => updateItem(index, { url: e.target.value })}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
                  />
                  <input
                    type="text"
                    value={item.alt}
                    onChange={(e) => updateItem(index, { alt: e.target.value })}
                    placeholder="Alt text (SEO & accessibility)"
                    className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
                  />
                  {showCaption && (
                    <input
                      type="text"
                      value={item.caption || ""}
                      onChange={(e) => updateItem(index, { caption: e.target.value || null })}
                      placeholder="Caption (optional)"
                      className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
                    />
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                  {showFeaturedStar && (
                    <button
                      type="button"
                      onClick={() => setFeatured(index)}
                      className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                        item.isFeatured
                          ? "bg-amber-50 border-amber-200 text-amber-600"
                          : "bg-white border-slate-200 text-slate-400 hover:text-amber-600"
                      }`}
                      title={item.isFeatured ? "Featured cover image" : "Set as cover image"}
                      aria-label="Set as featured cover"
                    >
                      <Star className={`w-3.5 h-3.5 ${item.isFeatured ? "fill-amber-500" : ""}`} />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveItem(index, "up")}
                    className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-35 cursor-pointer"
                    title="Move up"
                    aria-label="Move image up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(index, "down")}
                    className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-35 cursor-pointer"
                    title="Move down"
                    aria-label="Move image down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 cursor-pointer"
                    title="Remove image"
                    aria-label="Remove image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

