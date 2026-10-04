"use client";

import React from "react";
import { RichContentRenderer, RichContentNode } from "@/components/destinations/RichContentRenderer";
import { TourDynamicBlock } from "@/data/liveToursData";

export interface TourDynamicBlocksRendererProps {
  blocks?: TourDynamicBlock[];
  className?: string;
  minOrder?: number;
  maxOrder?: number;
}

/**
 * Normalizes any TourDynamicBlock into a standard RichContentNode
 * ensuring both legacy (b.data, b.content) and modern direct props (b.url, b.text) work seamlessly.
 */
function normalizeTourBlockToRichNode(b: TourDynamicBlock): RichContentNode {
  const blockType = (b.type || (b as any).blockType || "paragraph").toLowerCase();

  switch (blockType) {
    case "heading":
      return {
        type: "heading",
        level: (b.level || b.data?.level || 3) as 2 | 3 | 4,
        text: b.text || b.content || b.title || "",
      };

    case "paragraph":
      return {
        type: "paragraph",
        text: b.text || b.content || "",
      };

    case "image":
      return {
        type: "image",
        url: b.url || b.data?.url || b.content || "",
        alt: b.alt || b.title || "",
        caption: b.caption || b.data?.caption || "",
        layout: (b.layout || b.data?.layout || "full") as "full" | "inline-left" | "inline-right",
      };

    case "callout":
      return {
        type: "callout",
        variant: (b.variant || b.data?.variant || "tip") as "info" | "tip" | "warning" | "quote",
        title: b.title || b.data?.title,
        text: b.text || b.content || "",
      };

    case "list":
      return {
        type: "list",
        style: (b.style || b.data?.style || "bullet") as "bullet" | "numbered",
        items: Array.isArray(b.items)
          ? b.items
          : Array.isArray(b.data?.items)
          ? b.data.items
          : (b.content || "").split("\n").filter(Boolean),
      };

    case "table":
      return {
        type: "table",
        headers: b.headers || b.data?.headers || [],
        rows: b.rows || b.data?.rows || [],
      };

    case "link":
      return {
        type: "link",
        text: b.text || b.title || b.content || "Learn More",
        url: b.url || b.data?.url || "#",
        style: (b.style || b.data?.style || "button") as "button" | "inline",
        openInNewTab: b.openInNewTab !== false,
      };

    case "video":
      return {
        type: "video",
        url: b.url || b.data?.url || b.content || "",
        title: b.title || b.data?.title,
        caption: b.caption || b.data?.caption,
      };

    default:
      return {
        type: "paragraph",
        text: b.text || b.content || "",
      };
  }
}

/**
 * Individual Block Dispatcher:
 * Allows effortlessly adding new custom tour blocks in the future without touching page templates.
 */
function TourDynamicBlockItem({ block }: { block: TourDynamicBlock }) {
  const blockType = (block.type || (block as any).blockType || "").toLowerCase();

  try {
    switch (blockType) {
      // Future custom blocks can be added here easily:
      // case "customTourNotice":
      //   return <CustomTourNotice block={block} />;

      // Standard rich blocks delegate to RichContentRenderer
      case "heading":
      case "paragraph":
      case "image":
      case "callout":
      case "list":
      case "table":
      case "link":
      case "video":
      default: {
        const richNode = normalizeTourBlockToRichNode(block);
        return <RichContentRenderer content={[richNode]} />;
      }
    }
  } catch (err) {
    console.error(`Error rendering dynamic block "${blockType}":`, err);
    return null;
  }
}

/**
 * TourDynamicBlocksRenderer
 * Modular renderer for Tour dynamic content blocks, mirroring the destination dynamic architecture.
 */
export default function TourDynamicBlocksRenderer({
  blocks = [],
  className = "",
  minOrder,
  maxOrder,
}: TourDynamicBlocksRendererProps) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  // Filter visible blocks and sort by displayOrder
  const validBlocks = blocks
    .filter((b) => b && b.isVisible !== false)
    .filter((b) => {
      const order = typeof b.displayOrder === "number" ? b.displayOrder : 50;
      if (minOrder !== undefined && order < minOrder) return false;
      if (maxOrder !== undefined && order > maxOrder) return false;
      return true;
    })
    .sort((a, b) => (a.displayOrder ?? 50) - (b.displayOrder ?? 50));

  if (validBlocks.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-xl border border-slate-200/90 bg-white p-4 sm:p-6 space-y-6 ${className}`}>
      {validBlocks.map((block, idx) => (
        <TourDynamicBlockItem key={block.id || `tour-dyn-block-${idx}`} block={block} />
      ))}
    </div>
  );
}
