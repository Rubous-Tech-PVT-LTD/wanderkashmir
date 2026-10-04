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
} from "lucide-react";
import { TourContentSectionsInput } from "@/actions/adminTours";

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

  const updateFaq = (index: number, field: "question" | "answer", val: string) => {
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
          Configure the text and guidance rendered inside the fixed accordion tabs on the public Tour page. Empty sections gracefully display the default seasonal placeholder.
        </p>
      </div>

      <div className="space-y-5">
        {/* 1. Best Time to Visit */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Best Time to Visit</span>
          </label>
          <textarea
            rows={3}
            value={contentSections.bestTime || ""}
            onChange={(e) => updateField("bestTime", e.target.value)}
            placeholder="e.g. April to October offers pleasant weather, blossoming gardens, and open passes. For snow lovers, December to February is ideal..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* 2. Food Recommendations */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400" />
            <span>Food & Dining Recommendations</span>
          </label>
          <textarea
            rows={3}
            value={contentSections.food || ""}
            onChange={(e) => updateField("food", e.target.value)}
            placeholder="e.g. Authentic Kashmiri Wazwan (Rogan Josh, Gushtaba, Rista), fresh Dal Lake lotus stem (Nadru), and traditional saffron Kahwa..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* 3. Shopping Recommendations */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Shopping & Local Souvenirs</span>
          </label>
          <textarea
            rows={3}
            value={contentSections.shopping || ""}
            onChange={(e) => updateField("shopping", e.target.value)}
            placeholder="e.g. Pure Pashmina shawls, hand-knotted silk carpets, walnut wood carvings, saffron, dried morels (Gucchi), and paper-mâché handicrafts..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* 4. Nearby Places */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nearby Places to Explore</span>
          </label>
          <textarea
            rows={3}
            value={contentSections.nearby || ""}
            onChange={(e) => updateField("nearby", e.target.value)}
            placeholder="e.g. Doodhpathri (Valley of Milk), Yusmarg alpine meadows, Verinag Spring, and Daksum forest retreat..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* 5. Frequently Asked Questions */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
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
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 p-3.5 space-y-2.5"
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
                      className="flex-1 rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none"
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

                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                    placeholder="e.g. Yes, a 1-hour private Shikara ride on Dal Lake is included for all travelers..."
                    className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
