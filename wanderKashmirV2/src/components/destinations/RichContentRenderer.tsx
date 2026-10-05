/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
import React from "react";
import { marked } from "marked";
import { 
  Info, 
  Lightbulb, 
  AlertTriangle, 
  Quote, 
  ExternalLink, 
  CheckCircle2 
} from "lucide-react";

export type RichContentNode =
  | { type: "heading"; level?: 2 | 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; url: string; alt?: string; caption?: string; layout?: "full" | "inline-left" | "inline-right" }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "list"; style?: "bullet" | "numbered"; items: string[] }
  | { type: "callout"; variant?: "info" | "tip" | "warning" | "quote"; title?: string; text: string }
  | { type: "link"; text: string; url: string; openInNewTab?: boolean; style?: "button" | "inline" }
  | { type: "video"; url: string; title?: string; caption?: string };

export type SectionRichContent = 
  | string 
  | { text?: string; blocks?: RichContentNode[] } 
  | RichContentNode[] 
  | null 
  | undefined;

/**
 * Checks if a rich content payload has meaningful displayable content
 */
export function hasRichContent(content: SectionRichContent): boolean {
  if (!content) return false;
  if (typeof content === "string") {
    const trimmed = content.trim();
    if (!trimmed) return false;
    // Check if empty JSON string
    if (trimmed === "[]" || trimmed === "{}") return false;
    return true;
  }
  if (Array.isArray(content)) {
    return content.length > 0;
  }
  if (typeof content === "object") {
    if (Array.isArray(content.blocks) && content.blocks.length > 0) return true;
    if (typeof content.text === "string" && content.text.trim()) return true;
  }
  return false;
}

export function normalizeEditorJsBlock(b: any): RichContentNode | null {
  if (!b || typeof b !== "object") return null;
  const type = String(b.type || "").toLowerCase();
  const data = b.data || {};

  switch (type) {
    case "header":
    case "heading": {
      return {
        type: "heading",
        level: (data.level || 3) as 2 | 3 | 4,
        text: data.text || "",
      };
    }
    case "paragraph": {
      return {
        type: "paragraph",
        text: data.text || "",
      };
    }
    case "list": {
      const rawItems = Array.isArray(data.items) ? data.items : [];
      const flatItems = rawItems.map((item: any) =>
        typeof item === "string" ? item : item?.content || String(item || "")
      );
      return {
        type: "list",
        style: data.style === "ordered" ? "numbered" : "bullet",
        items: flatItems,
      };
    }
    case "quote": {
      return {
        type: "callout",
        variant: "quote",
        title: data.caption || "Quote",
        text: data.text || "",
      };
    }
    case "table": {
      const content = Array.isArray(data.content) ? data.content : [];
      const withHeadings = Boolean(data.withHeadings);
      if (content.length === 0) return null;
      let headers: string[] = [];
      let rows: string[][] = [];
      if (withHeadings && content.length > 0) {
        headers = content[0] || [];
        rows = content.slice(1);
      } else {
        rows = content;
      }
      return {
        type: "table",
        headers,
        rows,
      };
    }
    case "delimiter": {
      return {
        type: "paragraph",
        text: "✦ ✦ ✦",
      };
    }
    default:
      if (data.text) {
        return {
          type: "paragraph",
          text: data.text,
        };
      }
      return null;
  }
}

/**
 * Parses raw input into a normalized array of RichContentNode or null
 */
export function normalizeRichBlocks(content: SectionRichContent): RichContentNode[] | null {
  if (!content) return null;

  let rawBlocks: any[] | null = null;

  if (Array.isArray(content)) {
    rawBlocks = content;
  } else if (typeof content === "object" && Array.isArray((content as any).blocks)) {
    rawBlocks = (content as any).blocks;
  } else if (typeof content === "string") {
    const trimmed = content.trim();
    if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) rawBlocks = parsed;
        else if (parsed && Array.isArray(parsed.blocks)) rawBlocks = parsed.blocks;
      } catch {
        // Fall back to markdown text
      }
    }
  }

  if (rawBlocks && Array.isArray(rawBlocks)) {
    const isEditorJs = rawBlocks.some((b) => b && typeof b === "object" && "data" in b);
    if (isEditorJs) {
      const converted = rawBlocks
        .map((b) => (b && typeof b === "object" && "data" in b ? normalizeEditorJsBlock(b) : b))
        .filter(Boolean) as RichContentNode[];
      return converted.length > 0 ? converted : null;
    }
    return rawBlocks as RichContentNode[];
  }

  return null;
}

function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/\s*on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "blocked-javascript:");
}

export function RichContentRenderer({
  content,
  className = "",
}: {
  content: SectionRichContent;
  className?: string;
}) {
  if (!hasRichContent(content)) {
    return null;
  }

  const blocks = normalizeRichBlocks(content);

  // If structured blocks exist, render them natively
  if (blocks && blocks.length > 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        {blocks.map((block, idx) => (
          <RichBlockItem key={idx} block={block} />
        ))}
      </div>
    );
  }

  // Otherwise, render as rich markdown
  let markdownText = "";
  if (typeof content === "string") {
    markdownText = content;
  } else if (content && !Array.isArray(content) && typeof content === "object" && typeof content.text === "string") {
    markdownText = content.text;
  }

  if (!markdownText.trim()) {
    return null;
  }

  const parsedHtml = sanitizeHtml(marked.parse(markdownText) as string);

  return (
    <div
      className={`prose prose-slate max-w-none font-sans prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[var(--season-primary,#f97316)] hover:prose-a:text-orange-700 leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: parsedHtml }}
    />
  );
}

function RichBlockItem({ block }: { block: RichContentNode }) {
  if (!block || !block.type) return null;

  switch (block.type) {
    case "heading": {
      const level = block.level || 3;
      if (level === 2) {
        return (
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight mt-8 mb-4">
            {block.text}
          </h2>
        );
      }
      if (level === 4) {
        return (
          <h4 className="text-lg sm:text-xl font-bold text-slate-900 font-display tracking-tight mt-6 mb-3">
            {block.text}
          </h4>
        );
      }
      return (
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-display tracking-tight mt-6 mb-3">
          {block.text}
        </h3>
      );
    }

    case "paragraph": {
      if (!block.text) return null;
      const parsedParagraph = sanitizeHtml(marked.parse(block.text) as string);
      return (
        <div
          className="prose prose-slate max-w-none font-sans text-slate-600 leading-relaxed text-base sm:text-lg"
          dangerouslySetInnerHTML={{ __html: parsedParagraph }}
        />
      );
    }

    case "image": {
      if (!block.url) return null;
      const layout = block.layout || "full";

      if (layout === "inline-left") {
        return (
          <figure className="float-none sm:float-left sm:mr-6 sm:mb-4 w-full sm:w-1/2 my-4">
            <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
              <img
                src={block.url}
                alt={block.alt || "Destination visual"}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            {block.caption && (
              <figcaption className="text-xs text-slate-500 mt-2 text-center italic">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );
      }

      if (layout === "inline-right") {
        return (
          <figure className="float-none sm:float-right sm:ml-6 sm:mb-4 w-full sm:w-1/2 my-4">
            <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
              <img
                src={block.url}
                alt={block.alt || "Destination visual"}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            {block.caption && (
              <figcaption className="text-xs text-slate-500 mt-2 text-center italic">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );
      }

      // Default full width
      return (
        <figure className="my-6">
          <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
            <img
              src={block.url}
              alt={block.alt || "Destination visual"}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          {block.caption && (
            <figcaption className="text-xs text-slate-500 mt-2 text-center italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "table": {
      const headers = Array.isArray(block.headers) ? block.headers : [];
      const rows = Array.isArray(block.rows) ? block.rows : [];
      if (headers.length === 0 && rows.length === 0) return null;

      return (
        <div className="my-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              {headers.length > 0 && (
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-800 font-semibold text-xs uppercase tracking-wider">
                    {headers.map((head, hIdx) => (
                      <th key={hIdx} className="px-4 py-3.5">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                    {(Array.isArray(row) ? row : []).map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="px-4 py-3 text-slate-600"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(String(cell || "")) }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    case "list": {
      const items = Array.isArray(block.items) ? block.items : [];
      if (items.length === 0) return null;

      if (block.style === "numbered") {
        return (
          <ol className="my-4 space-y-2.5">
            {items.map((item, iIdx) => (
              <li key={iIdx} className="flex items-start gap-3 text-slate-700 text-base sm:text-lg leading-relaxed">
                <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-bold text-xs mt-0.5">
                  {iIdx + 1}
                </span>
                <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(String(item || "")) }} />
              </li>
            ))}
          </ol>
        );
      }

      // Default bullet list
      return (
        <ul className="my-4 space-y-2.5">
          {items.map((item, iIdx) => (
            <li key={iIdx} className="flex items-start gap-3 text-slate-700 text-base sm:text-lg leading-relaxed">
              <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-orange-500 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(String(item || "")) }} />
            </li>
          ))}
        </ul>
      );
    }

    case "callout": {
      const variant = block.variant || "info";

      const variantConfig = {
        info: {
          bg: "bg-blue-50/80 border-blue-500 text-blue-950",
          icon: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
          defaultTitle: "Traveler Note",
        },
        tip: {
          bg: "bg-emerald-50/80 border-emerald-500 text-emerald-950",
          icon: <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
          defaultTitle: "Insider Tip",
        },
        warning: {
          bg: "bg-amber-50/80 border-amber-500 text-amber-950",
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
          defaultTitle: "Important Advisory",
        },
        quote: {
          bg: "bg-slate-50/90 border-slate-900 text-slate-900 italic",
          icon: <Quote className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />,
          defaultTitle: "Local Insight",
        },
      };

      const cfg = variantConfig[variant] || variantConfig.info;

      return (
        <div className={`my-6 p-4 sm:p-5 rounded-r-2xl rounded-l-md border-l-4 ${cfg.bg} shadow-xs flex items-start gap-3.5`}>
          {cfg.icon}
          <div className="flex-1 min-w-0">
            {block.title && (
              <h5 className="font-bold text-sm uppercase tracking-wider mb-1 not-italic font-display">
                {block.title || cfg.defaultTitle}
              </h5>
            )}
            <div
              className="text-sm sm:text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(String(block.text || "")) }}
            />
          </div>
        </div>
      );
    }

    case "link": {
      if (!block.url || !block.text) return null;
      const isExternal = block.openInNewTab || block.url.startsWith("http");

      if (block.style === "button") {
        return (
          <div className="my-4">
            <a
              href={block.url}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-xl transition shadow-xs"
            >
              <span>{block.text}</span>
              {isExternal && <ExternalLink className="w-3.5 h-3.5" />}
            </a>
          </div>
        );
      }

      return (
        <p className="my-2">
          <a
            href={block.url}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-semibold underline underline-offset-4 decoration-orange-300 transition"
          >
            <span>{block.text}</span>
            {isExternal && <ExternalLink className="w-3 h-3" />}
          </a>
        </p>
      );
    }

    case "video": {
      if (!block.url) return null;
      const isYoutube = block.url.includes("youtube.com") || block.url.includes("youtu.be");
      const isVimeo = block.url.includes("vimeo.com");

      let embedUrl = block.url;
      if (isYoutube) {
        const idMatch = block.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        if (idMatch && idMatch[1]) {
          embedUrl = `https://www.youtube.com/embed/${idMatch[1]}`;
        }
      } else if (isVimeo) {
        const idMatch = block.url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        if (idMatch && idMatch[1]) {
          embedUrl = `https://player.vimeo.com/video/${idMatch[1]}`;
        }
      }

      return (
        <figure className="my-6">
          <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-xs">
            {isYoutube || isVimeo ? (
              <iframe
                src={embedUrl}
                title={block.title || "Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <video
                src={block.url}
                controls
                className="w-full h-full object-cover"
                title={block.title || "Video"}
              />
            )}
          </div>
          {block.caption && (
            <figcaption className="text-xs text-slate-500 mt-2 text-center italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    default:
      return null;
  }
}
