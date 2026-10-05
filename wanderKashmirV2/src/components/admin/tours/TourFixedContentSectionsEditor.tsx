/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Clock,
  UtensilsCrossed,
  Sparkles,
  MapPin,
  HelpCircle,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Compass,
} from "lucide-react";
import { TourContentSectionsInput } from "@/actions/adminTours";
import EditorJsField from "@/components/admin/editor/EditorJsField";

interface TourFixedContentSectionsEditorProps {
  contentSections: TourContentSectionsInput;
  onChange: (updated: TourContentSectionsInput) => void;
}

export default function TourFixedContentSectionsEditor({
  contentSections = {},
  onChange,
}: TourFixedContentSectionsEditorProps) {
  const faqs = contentSections.faqs || [];

  const updateField = (field: keyof TourContentSectionsInput, val: any) => {
    onChange({
      ...contentSections,
      [field]: val,
    });
  };

  const addFaq = () => {
    const updated = [...faqs, { question: "", answer: "" }];
    updateField("faqs", updated);
  };

  const updateFaq = (index: number, field: "question" | "answer", val: any) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: val };
    updateField("faqs", updated);
  };

  const removeFaq = (index: number) => {
    const updated = faqs.filter((_, i) => i !== index);
    updateField("faqs", updated);
  };

  const moveFaq = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= faqs.length) return;
    const updated = [...faqs];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    updateField("faqs", updated);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white">
          Fixed Template Content Sections
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Full rich content authoring inside the fixed accordion tabs on the public Tour page. Use headings, lists, tables, quotes, and links. Empty sections gracefully display the default seasonal placeholder.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. How to Reach & Route Explanation */}
        <div className="space-y-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>How to Reach & Route Explanation</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300 select-none">
              <input
                type="checkbox"
                checked={contentSections.howToReachEnabled !== false}
                onChange={(e) => updateField("howToReachEnabled", e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
              />
              <span>Show How to Reach</span>
            </label>
          </div>

          <p className="text-xs text-slate-400">
            When enabled, the public page displays the dynamic route circuit and map. Use &quot;Why This Route&quot; below to explain route pacing and connectivity. If left empty, no marketing copy will be shown.
          </p>

          <div className="space-y-2 pt-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Why This Route Details
            </label>
            <EditorJsField
              value={contentSections.whyThisRoute}
              onChange={(val: any) => updateField("whyThisRoute", val)}
              placeholder="Explain the travel circuit sequence, pacing, and route connectivity..."
              minHeight={120}
            />
          </div>
        </div>

        {/* 2. Best Time to Visit */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Best Time to Visit</span>
          </label>
          <EditorJsField
            value={contentSections.bestTime}
            onChange={(val: any) => updateField("bestTime", val)}
            placeholder="Describe the best seasons, weather patterns, and seasonal highlights..."
            minHeight={120}
          />
        </div>

        {/* 3. Food Recommendations */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400" />
            <span>Food & Dining Recommendations</span>
          </label>
          <EditorJsField
            value={contentSections.food}
            onChange={(val: any) => updateField("food", val)}
            placeholder="Recommend Kashmiri specialties, Wazwan, vegetarian choices, and top cafes..."
            minHeight={140}
          />
        </div>

        {/* 4. Shopping Recommendations */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Shopping & Local Souvenirs</span>
          </label>
          <EditorJsField
            value={contentSections.shopping}
            onChange={(val: any) => updateField("shopping", val)}
            placeholder="Highlight authentic Pashmina, walnut wood, saffron, paper-mâché, and local bazaars..."
            minHeight={140}
          />
        </div>

        {/* 5. Nearby Places */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nearby Places to Explore</span>
          </label>
          <EditorJsField
            value={contentSections.nearby}
            onChange={(val: any) => updateField("nearby", val)}
            placeholder="Suggest scenic day excursions, offbeat valleys, and hidden gems..."
            minHeight={120}
          />
        </div>

        {/* 6. Frequently Asked Questions */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Frequently Asked Questions ({faqs.length})</span>
            </label>
            <button
              type="button"
              onClick={addFaq}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add FAQ
            </button>
          </div>

          {faqs.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              No tour-specific FAQs configured. Click &quot;Add FAQ&quot; to answer questions about permits, clothing, or transfers.
            </p>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0 border border-slate-700">
                      Q{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFaq(idx, "question", e.target.value)}
                      placeholder="e.g. Is a Shikara ride included in this package?"
                      className="flex-1 rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveFaq(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFaq(idx, "down")}
                        disabled={idx === faqs.length - 1}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFaq(idx)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                      Answer Details
                    </label>
                    <EditorJsField
                      value={faq.answer}
                      onChange={(val: any) => updateFaq(idx, "answer", val)}
                      placeholder="e.g. Yes, a 1-hour private Shikara ride on Dal Lake is included for all travelers..."
                      minHeight={80}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
