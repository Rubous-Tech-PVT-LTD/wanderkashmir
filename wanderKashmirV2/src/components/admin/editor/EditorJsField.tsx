/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import type { OutputData } from "@editorjs/editorjs";

export interface EditorJsFieldProps {
  value?: string | OutputData | null;
  onChange: (data: OutputData) => void;
  placeholder?: string;
  minHeight?: number;
  readOnly?: boolean;
}

/**
 * Converts simple legacy Markdown text into Editor.js OutputData blocks
 * so existing markdown tours can be gracefully loaded into Editor.js.
 */
export function markdownToEditorBlocks(md: string): OutputData {
  if (!md || !md.trim()) {
    return { time: Date.now(), blocks: [] };
  }

  // Check if string is already stringified Editor.js JSON
  const trimmed = md.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}") && trimmed.includes('"blocks"')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed.blocks)) {
        return parsed as OutputData;
      }
    } catch {
      // Continue to markdown parse
    }
  }

  const lines = md.split(/\r?\n/);
  const blocks: any[] = [];
  let currentList: { style: "ordered" | "unordered"; items: string[] } | null = null;
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      let text = paragraphBuffer.join("<br>");
      // Transform basic markdown inline tags to HTML
      text = text
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/\*(.*?)\*/g, "<i>$1</i>")
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
      blocks.push({
        id: Math.random().toString(36).substring(2, 9),
        type: "paragraph",
        data: { text },
      });
      paragraphBuffer = [];
    }
  };

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      blocks.push({
        id: Math.random().toString(36).substring(2, 9),
        type: "list",
        data: {
          style: currentList.style,
          items: currentList.items,
        },
      });
      currentList = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    // Heading
    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({
        id: Math.random().toString(36).substring(2, 9),
        type: "header",
        data: { text: line.replace(/^###\s+/, ""), level: 4 },
      });
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({
        id: Math.random().toString(36).substring(2, 9),
        type: "header",
        data: { text: line.replace(/^##\s+/, ""), level: 3 },
      });
      continue;
    }
    if (line.startsWith("# ")) {
      flushParagraph();
      flushList();
      blocks.push({
        id: Math.random().toString(36).substring(2, 9),
        type: "header",
        data: { text: line.replace(/^#\s+/, ""), level: 2 },
      });
      continue;
    }

    // Unordered list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph();
      let itemText = line.replace(/^[-*]\s+/, "");
      itemText = itemText
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/\*(.*?)\*/g, "<i>$1</i>");
      if (currentList && currentList.style === "unordered") {
        currentList.items.push(itemText);
      } else {
        flushList();
        currentList = { style: "unordered", items: [itemText] };
      }
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      let itemText = line.replace(/^\d+\.\s+/, "");
      itemText = itemText
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/\*(.*?)\*/g, "<i>$1</i>");
      if (currentList && currentList.style === "ordered") {
        currentList.items.push(itemText);
      } else {
        flushList();
        currentList = { style: "ordered", items: [itemText] };
      }
      continue;
    }

    // Regular line
    flushList();
    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushList();

  return {
    time: Date.now(),
    blocks: blocks.length > 0 ? blocks : [{ type: "paragraph", data: { text: "" } }],
  };
}

export default function EditorJsField({
  value,
  onChange,
  placeholder = "Write content here...",
  minHeight = 120,
  readOnly = false,
}: EditorJsFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<any>(null);
  const [holderId] = useState(() => `editorjs-${Math.random().toString(36).substring(2, 9)}`);
  const [, setIsReady] = useState(false);

  // Normalize initial data
  const getInitialData = (): OutputData => {
    if (!value) {
      return { time: Date.now(), blocks: [] };
    }
    if (typeof value === "object" && Array.isArray(value.blocks)) {
      return value as OutputData;
    }
    if (typeof value === "string") {
      return markdownToEditorBlocks(value);
    }
    return { time: Date.now(), blocks: [] };
  };

  useEffect(() => {
    let isMounted = true;

    async function initEditor() {
      if (typeof window === "undefined" || !containerRef.current) return;

      try {
        // Dynamically import Editor.js and plugins
        const [
          { default: EditorJS },
          { default: Header },
          { default: List },
          { default: Quote },
          { default: Delimiter },
          { default: Table },
        ] = await Promise.all([
          import("@editorjs/editorjs"),
          import("@editorjs/header" as any),
          import("@editorjs/list" as any),
          import("@editorjs/quote" as any),
          import("@editorjs/delimiter" as any),
          import("@editorjs/table" as any),
        ]);

        if (!isMounted) return;

        // Destroy previous instance if any
        if (editorInstanceRef.current && typeof editorInstanceRef.current.destroy === "function") {
          try {
            await editorInstanceRef.current.destroy();
          } catch {
            // Ignore teardown errors
          }
          editorInstanceRef.current = null;
        }

        const editor = new EditorJS({
          holder: holderId,
          readOnly,
          placeholder,
          minHeight,
          data: getInitialData(),
          tools: {
            header: {
              class: Header,
              inlineToolbar: ["link", "bold", "italic"],
              config: {
                placeholder: "Heading...",
                levels: [2, 3, 4],
                defaultLevel: 3,
              },
            },
            list: {
              class: List,
              inlineToolbar: true,
              config: {
                defaultStyle: "unordered",
              },
            },
            quote: {
              class: Quote,
              inlineToolbar: true,
              config: {
                quotePlaceholder: "Quote text...",
                captionPlaceholder: "Author / Reference...",
              },
            },
            table: {
              class: Table,
              inlineToolbar: true,
              config: {
                rows: 2,
                cols: 2,
              },
            },
            delimiter: Delimiter,
          },
          onChange: async (api) => {
            try {
              const output = await api.saver.save();
              onChange(output);
            } catch (err) {
              console.warn("Editor.js save warning:", err);
            }
          },
          onReady: () => {
            if (isMounted) {
              setIsReady(true);
            }
          },
        });

        editorInstanceRef.current = editor;
      } catch (err) {
        console.error("Failed to initialize Editor.js:", err);
      }
    }

    initEditor();

    return () => {
      isMounted = false;
      if (editorInstanceRef.current && typeof editorInstanceRef.current.destroy === "function") {
        try {
          editorInstanceRef.current.destroy();
        } catch {
          // Ignore
        }
        editorInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className="editorjs-dark-theme rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-100 transition-colors focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/20"
      style={{ minHeight: `${minHeight}px` }}
    >
      <div id={holderId} className="w-full prose-invert" />
      
      {/* Editor.js dark theme overrides */}
      <style jsx global>{`
        .editorjs-dark-theme .codex-editor {
          color: #f1f5f9;
        }
        .editorjs-dark-theme .ce-paragraph {
          line-height: 1.6;
          font-size: 0.8125rem;
          color: #e2e8f0;
        }
        .editorjs-dark-theme .ce-header {
          color: #ffffff;
          font-weight: 700;
          letter-spacing: -0.015em;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .editorjs-dark-theme h2.ce-header { font-size: 1.25rem; }
        .editorjs-dark-theme h3.ce-header { font-size: 1.1rem; }
        .editorjs-dark-theme h4.ce-header { font-size: 0.95rem; }
        .editorjs-dark-theme .cdx-list {
          padding-left: 1.25rem;
          color: #e2e8f0;
          font-size: 0.8125rem;
        }
        .editorjs-dark-theme .cdx-list__item {
          padding: 0.15rem 0;
        }
        .editorjs-dark-theme .cdx-quote {
          border-left: 3px solid #10b981;
          padding: 0.5rem 0.75rem;
          margin: 0.5rem 0;
          color: #cbd5e1;
          font-style: italic;
        }
        .editorjs-dark-theme .cdx-quote__text {
          font-size: 0.8125rem;
          margin-bottom: 0.25rem;
        }
        .editorjs-dark-theme .cdx-quote__caption {
          font-size: 0.7rem;
          color: #94a3b8;
          font-style: normal;
        }
        .editorjs-dark-theme .ce-delimiter {
          line-height: 1.6em;
          text-align: center;
          color: #64748b;
        }
        .editorjs-dark-theme .tc-table {
          border-collapse: collapse;
          width: 100%;
          border: 1px solid #334155;
        }
        .editorjs-dark-theme .tc-row {
          border-bottom: 1px solid #334155;
        }
        .editorjs-dark-theme .tc-cell {
          border-right: 1px solid #334155;
          padding: 0.4rem 0.5rem;
          font-size: 0.8125rem;
          color: #e2e8f0;
        }
        .editorjs-dark-theme .ce-toolbar__plus,
        .editorjs-dark-theme .ce-toolbar__settings-btn {
          color: #94a3b8;
          background-color: #1e293b;
          border: 1px solid #334155;
        }
        .editorjs-dark-theme .ce-toolbar__plus:hover,
        .editorjs-dark-theme .ce-toolbar__settings-btn:hover {
          color: #ffffff;
          background-color: #334155;
        }
        .editorjs-dark-theme .ce-popover {
          background-color: #0f172a;
          border: 1px solid #334155;
          color: #f1f5f9;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
        }
        .editorjs-dark-theme .ce-popover-item {
          color: #cbd5e1;
        }
        .editorjs-dark-theme .ce-popover-item:hover {
          background-color: #1e293b;
          color: #ffffff;
        }
        .editorjs-dark-theme .ce-popover-item__icon {
          background-color: #1e293b;
          color: #10b981;
        }
        .editorjs-dark-theme .ce-inline-toolbar {
          background-color: #0f172a;
          border: 1px solid #334155;
          color: #f1f5f9;
        }
        .editorjs-dark-theme .ce-inline-tool {
          color: #cbd5e1;
        }
        .editorjs-dark-theme .ce-inline-tool:hover {
          background-color: #1e293b;
          color: #ffffff;
        }
        .editorjs-dark-theme .ce-inline-tool--active {
          color: #10b981;
        }
        .editorjs-dark-theme .ce-inline-toolbar__dropdown {
          border-right: 1px solid #334155;
          color: #cbd5e1;
        }
        .editorjs-dark-theme .ce-inline-toolbar__dropdown:hover {
          background-color: #1e293b;
        }
        .editorjs-dark-theme [data-placeholder]:empty::before {
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
