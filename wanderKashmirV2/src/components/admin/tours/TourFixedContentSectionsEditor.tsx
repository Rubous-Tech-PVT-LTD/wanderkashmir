/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
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
import NearbyPlacesEditor, {
  NearbyPlaceItemConfig,
  AvailablePlaceOption,
} from "@/components/admin/destinations/NearbyPlacesEditor";

interface TourFixedContentSectionsEditorProps {
  contentSections: TourContentSectionsInput;
  onChange: (updated: TourContentSectionsInput) => void;
  availablePlaces?: AvailablePlaceOption[];
}

export default function TourFixedContentSectionsEditor({
  contentSections = {},
  onChange,
  availablePlaces = [],
}: TourFixedContentSectionsEditorProps) {
  const faqs = contentSections.faqs || [];

  const initialNearbyConfig = contentSections.nearbyPlacesConfig;
  const initialNearbyIntro =
    initialNearbyConfig?.introContent !== undefined
      ? initialNearbyConfig.introContent || ""
      : typeof contentSections.nearby === "string"
      ? contentSections.nearby
      : contentSections.nearby?.blocks
      ? contentSections.nearby.blocks
          .map((b: any) => b.data?.text || "")
          .filter(Boolean)
          .join("\n\n")
      : "";
  const initialNearbyItems = Array.isArray(initialNearbyConfig?.items)
    ? initialNearbyConfig.items
    : [];

  const [nearbyIntro, setNearbyIntro] = useState<string>(initialNearbyIntro);
  const [nearbyItems, setNearbyItems] = useState<NearbyPlaceItemConfig[]>(initialNearbyItems);

  const handleNearbyIntroChange = (newIntro: string) => {
    setNearbyIntro(newIntro);
    onChange({
      ...contentSections,
      nearby: newIntro,
      nearbyPlacesConfig: {
        introContent: newIntro,
        items: nearbyItems,
      },
    });
  };

  const handleNearbyItemsChange = (newItems: NearbyPlaceItemConfig[]) => {
    setNearbyItems(newItems);
    onChange({
      ...contentSections,
      nearby: nearbyIntro,
      nearbyPlacesConfig: {
        introContent: nearbyIntro,
        items: newItems,
      },
    });
  };

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
    <div className="rounded-md border border-slate-200/90 bg-white p-5 sm:p-6 space-y-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Fixed Template Content Sections
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Rich content authoring for the accordion tabs on the public Tour page. Empty sections gracefully display the default seasonal fallback.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. How to Reach & Route Explanation */}
        <div className="space-y-3 p-4 rounded-md border border-slate-200 bg-slate-50/70">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <Compass className="w-3.5 h-3.5 text-[var(--season-primary)]" />
              <span>How to Reach & Route Explanation</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 select-none">
              <input
                type="checkbox"
                checked={contentSections.howToReachEnabled !== false}
                onChange={(e) => updateField("howToReachEnabled", e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[var(--season-primary)] focus:ring-[var(--season-primary)] cursor-pointer"
              />
              <span>Show How to Reach</span>
            </label>
          </div>

          <p className="text-xs text-slate-500">
            When enabled, the public page displays the route circuit and map. Use &ldquo;Why This Route&rdquo; below to explain route pacing and connectivity.
          </p>

          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-medium text-slate-700">
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
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <Clock className="w-3.5 h-3.5 text-[var(--season-primary)]" />
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
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[var(--season-primary)]" />
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
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-[var(--season-primary)]" />
            <span>Shopping & Local Souvenirs</span>
          </label>
          <EditorJsField
            value={contentSections.shopping}
            onChange={(val: any) => updateField("shopping", val)}
            placeholder="Highlight authentic Pashmina, walnut wood, saffron, paper-mâché, and local bazaars..."
            minHeight={140}
          />
        </div>

        {/* 5. Nearby Places to Explore */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <MapPin className="w-3.5 h-3.5 text-[var(--season-primary)]" />
            <span>Nearby Places to Explore</span>
          </label>
          <NearbyPlacesEditor
            introContent={nearbyIntro}
            onChangeIntroContent={handleNearbyIntroChange}
            items={nearbyItems}
            onChangeItems={handleNearbyItemsChange}
            availablePlaces={availablePlaces}
          />
        </div>

        {/* 6. Frequently Asked Questions */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <HelpCircle className="w-3.5 h-3.5 text-[var(--season-primary)]" />
              <span>Frequently Asked Questions ({faqs.length})</span>
            </label>
            <button
              type="button"
              onClick={addFaq}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add FAQ</span>
            </button>
          </div>

          {faqs.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              No tour-specific FAQs configured. Click &ldquo;Add FAQ&rdquo; to answer questions about permits, clothing, or transfers.
            </p>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-md border border-slate-200 bg-slate-50/70 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="h-6 w-6 rounded bg-white text-slate-600 text-[10px] font-semibold flex items-center justify-center shrink-0 border border-slate-200">
                      Q{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFaq(idx, "question", e.target.value)}
                      placeholder="e.g. Is a Shikara ride included in this package?"
                      className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                    />
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveFaq(idx, "up")}
                        disabled={idx === 0}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Move up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFaq(idx, "down")}
                        disabled={idx === faqs.length - 1}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Move down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFaq(idx)}
                        className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-500">
                      Answer Details
                    </label>
                    <EditorJsField
                      value={faq.answer}
                      onChange={(val: any) => updateFaq(idx, "answer", val)}
                      placeholder="e.g. Yes, a 1-hour private Shikara ride on Dal Lake is included..."
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
