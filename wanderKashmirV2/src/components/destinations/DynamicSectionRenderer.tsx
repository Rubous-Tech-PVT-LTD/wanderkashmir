"use client";

import React from "react";
import Image from "next/image";
import { 
  Camera, Landmark, Info, AlertTriangle, Lightbulb, 
  Compass, Sparkles, CheckCircle2, ChevronRight 
} from "lucide-react";
import { marked } from "marked";
import { RichContentRenderer } from "./RichContentRenderer";

export interface DynamicSectionBlockProps {
  blockType: string;
  id?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  isVisible?: boolean;
  displayOrder?: number;
  [key: string]: any;
}

export function DynamicSectionRenderer({ 
  blocks, 
  minOrder, 
  maxOrder 
}: { 
  blocks?: DynamicSectionBlockProps[];
  minOrder?: number;
  maxOrder?: number;
}) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  // Filter by visibility and optional displayOrder range
  const filteredBlocks = blocks
    .filter((b) => b && b.isVisible !== false)
    .filter((b) => {
      const order = typeof b.displayOrder === "number" ? b.displayOrder : 50;
      if (minOrder !== undefined && order < minOrder) return false;
      if (maxOrder !== undefined && order > maxOrder) return false;
      return true;
    })
    .sort((a, b) => (a.displayOrder ?? 50) - (b.displayOrder ?? 50));

  if (filteredBlocks.length === 0) {
    return null;
  }

  return (
    <>
      {filteredBlocks.map((block, idx) => (
        <BlockItem key={block.id || `${block.blockType}-${idx}`} block={block} />
      ))}
    </>
  );
}

function BlockItem({ block }: { block: any }) {
  try {
    // If it's a rich content node from our Dynamic Blocks manager (has `type` like 'heading', 'paragraph', 'table', 'list', 'callout', 'image', 'link', 'video')
    if (block.type && !block.blockType) {
      return (
        <div className="mb-6">
          <RichContentRenderer content={[block]} />
        </div>
      );
    }

    switch (block.blockType) {
      case "localCulture":
        return <LocalCultureSection block={block} />;
      case "photographySpots":
        return <PhotographySpotsSection block={block} />;
      case "travelTips":
        return <TravelTipsSection block={block} />;
      case "callout":
        return <CalloutSection block={block} />;
      case "imageText":
        return <ImageTextSection block={block} />;
      case "richContent":
        return <RichContentSection block={block} />;
      default:
        if (block.type) {
          return (
            <div className="mb-6">
              <RichContentRenderer content={[block]} />
            </div>
          );
        }
        // Graceful fallback for unknown/unsupported block types
        return null;
    }
  } catch (err) {
    console.error(`Error rendering dynamic block "${block.blockType || block.type}":`, err);
    return null;
  }
}

/* 1. Local Culture & Traditions Block */
function LocalCultureSection({ block }: { block: DynamicSectionBlockProps }) {
  const items = Array.isArray(block.items) ? block.items : [];
  if (items.length === 0) return null;

  return (
    <div className="mb-14 sm:mb-16">
      <div className="flex flex-col items-center mb-6 sm:mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight">
          {block.sectionTitle || "Local Culture & Traditions"}
        </h2>
        {block.sectionSubtitle && (
          <p className="text-slate-500 mt-2 font-sans text-sm sm:text-base max-w-2xl">
            {block.sectionSubtitle}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item: any, idx: number) => {
          const imgUrl = typeof item.image === "string" ? item.image : item.image?.url;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {imgUrl ? (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-4 bg-slate-100">
                    <Image
                      src={imgUrl}
                      alt={item.title || "Culture"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                    <Landmark className="w-5 h-5" />
                  </div>
                )}
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* 2. Photography Spots Block */
function PhotographySpotsSection({ block }: { block: DynamicSectionBlockProps }) {
  const spots = Array.isArray(block.spots) ? block.spots : [];
  if (spots.length === 0) return null;

  return (
    <div className="mb-14 sm:mb-16">
      <div className="flex flex-col items-center mb-6 sm:mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight">
          {block.sectionTitle || "Top Photography & Sunset Spots"}
        </h2>
        {block.sectionSubtitle && (
          <p className="text-slate-500 mt-2 font-sans text-sm sm:text-base max-w-2xl">
            {block.sectionSubtitle}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spots.map((spot: any, idx: number) => {
          const imgUrl = typeof spot.image === "string" ? spot.image : spot.image?.url;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              {imgUrl && (
                <div className="relative aspect-[4/3] w-full bg-slate-100">
                  <Image
                    src={imgUrl}
                    alt={spot.spotName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {spot.bestTime && (
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>{spot.bestTime}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1.5">
                    {spot.spotName}
                  </h3>
                  {spot.tip && (
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      {spot.tip}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* 3. Travel Tips & Guidelines Block */
function TravelTipsSection({ block }: { block: DynamicSectionBlockProps }) {
  const tips = Array.isArray(block.tips) ? block.tips : [];
  if (tips.length === 0) return null;

  return (
    <div className="mb-14 sm:mb-16">
      <div className="flex flex-col items-center mb-6 sm:mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight">
          {block.sectionTitle || "Essential Travel Tips & Guidelines"}
        </h2>
        {block.sectionSubtitle && (
          <p className="text-slate-500 mt-2 font-sans text-sm sm:text-base max-w-2xl">
            {block.sectionSubtitle}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tips.map((t: any, idx: number) => (
          <div
            key={idx}
            className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3.5"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-[var(--season-primary,#065F46)] flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <div>
              {t.category && (
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded mb-1.5 inline-block">
                  {t.category}
                </span>
              )}
              <p className="text-slate-700 text-sm leading-relaxed font-sans">
                {t.tip}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 4. Callout / Notice Block */
function CalloutSection({ block }: { block: DynamicSectionBlockProps }) {
  const isWarning = block.type === "warning";
  const isTip = block.type === "tip";

  const bgClass = isWarning
    ? "bg-amber-50/70 border-amber-200 text-amber-900"
    : isTip
    ? "bg-indigo-50/70 border-indigo-200 text-indigo-900"
    : "bg-emerald-50/70 border-emerald-200 text-emerald-950";

  const Icon = isWarning ? AlertTriangle : isTip ? Lightbulb : Info;

  return (
    <div className={`mb-14 sm:mb-16 p-6 rounded-2xl border ${bgClass} flex items-start gap-4 shadow-2xs`}>
      <div className="p-2 rounded-xl bg-white/80 shrink-0 shadow-2xs">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-bold text-base sm:text-lg mb-1">{block.title}</h3>
        <p className="text-sm leading-relaxed opacity-90">{block.message}</p>
      </div>
    </div>
  );
}

/* 5. Image + Text Block */
function ImageTextSection({ block }: { block: DynamicSectionBlockProps }) {
  const isRight = block.layout === "imageRight";
  const imgUrl = typeof block.image === "string" ? block.image : block.image?.url;
  const contentHtml = typeof block.content === "string" ? marked.parse(block.content) : "";

  return (
    <div className="mb-14 sm:mb-16">
      <div className="flex flex-col items-center mb-6 sm:mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight">
          {block.sectionTitle}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {imgUrl && (
          <div className={`md:col-span-6 relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 ${isRight ? "md:order-2" : ""}`}>
            <Image
              src={imgUrl}
              alt={block.sectionTitle || "Section"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}
        <div className={`${imgUrl ? "md:col-span-6" : "md:col-span-12"} ${isRight ? "md:order-1" : ""}`}>
          <RichContentRenderer content={block.content} />
        </div>
      </div>
    </div>
  );
}

/* 6. Rich Content Block */
function RichContentSection({ block }: { block: DynamicSectionBlockProps }) {
  return (
    <div className="mb-14 sm:mb-16">
      <div className="flex flex-col items-center mb-6 sm:mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight">
          {block.sectionTitle}
        </h2>
        {block.sectionSubtitle && (
          <p className="text-slate-500 mt-2 font-sans text-sm sm:text-base max-w-2xl">
            {block.sectionSubtitle}
          </p>
        )}
      </div>
      <RichContentRenderer content={block.content} />
    </div>
  );
}
