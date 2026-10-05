/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import type { OutputData } from "@editorjs/editorjs";
import { AlertTriangle, RotateCw } from "lucide-react";

export interface EditorJsFieldProps {
  value?: string | OutputData | null;
  onChange: (data: OutputData) => void;
  placeholder?: string;
  minHeight?: number;
  readOnly?: boolean;
}

/**
 * Safely resolves tool modules across Next.js dynamic import variations:
 * handles mod.default.default, mod.default, or mod directly.
 */
function resolveToolModule(mod: any, toolName: string): any {
  if (!mod) {
    throw new Error(`Tool module "${toolName}" resolved to empty/undefined.`);
  }

  let resolved = mod;
  if (resolved.default) {
    resolved = resolved.default;
  }
  if (resolved && resolved.default && typeof resolved !== "function") {
    resolved = resolved.default;
  }

  if (typeof resolved !== "function" && typeof resolved !== "object") {
    throw new Error(`Tool "${toolName}" could not be resolved to a valid constructor or tool object.`);
  }

  return resolved;
}

/**
 * Converts simple legacy Markdown text into valid Editor.js OutputData blocks
 * so existing markdown tours can be gracefully edited inside Editor.js.
 */
export function markdownToEditorBlocks(md: string): OutputData {
  if (typeof md !== "string" || !md.trim()) {
    return {
      time: Date.now(),
      blocks: [{ id: Math.random().toString(36).substring(2, 9), type: "paragraph", data: { text: "" } }],
    };
  }

  const trimmed = md.trim();

  // Guard against "[object Object]"
  if (trimmed === "[object Object]") {
    return {
      time: Date.now(),
      blocks: [{ id: Math.random().toString(36).substring(2, 9), type: "paragraph", data: { text: "" } }],
    };
  }

  // Check if string is already stringified Editor.js JSON
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}") && trimmed.includes('"blocks"')) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      const parsed = JSON.parse(trimmed);
      return normalizeToEditorData(parsed);
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
          items: currentList.items.map((itemText) => ({
            content: itemText,
            items: [],
          })),
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

    // Delimiter (--- or ***)
    if (/^(\*{3,}|-{3,})$/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({
        id: Math.random().toString(36).substring(2, 9),
        type: "delimiter",
        data: {},
      });
      continue;
    }

    // Headings
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

    // Blockquote
    if (line.startsWith(">")) {
      flushParagraph();
      flushList();
      const quoteText = line.replace(/^>\s*/, "");
      blocks.push({
        id: Math.random().toString(36).substring(2, 9),
        type: "quote",
        data: { text: quoteText, caption: "" },
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
    blocks:
      blocks.length > 0
        ? blocks
        : [{ id: Math.random().toString(36).substring(2, 9), type: "paragraph", data: { text: "" } }],
  };
}

/**
 * Robust normalization supporting:
 * 1. Legacy Markdown string
 * 2. JSON string containing OutputData
 * 3. Parsed OutputData object { time, blocks: [...], version }
 * 4. Raw array of blocks
 * 5. null / undefined / empty values
 */
export function normalizeToEditorData(val: any): OutputData {
  const emptyFallback: OutputData = {
    time: Date.now(),
    blocks: [{ id: Math.random().toString(36).substring(2, 9), type: "paragraph", data: { text: "" } }],
  };

  if (val === null || val === undefined) {
    return emptyFallback;
  }

  // Already an OutputData object
  if (typeof val === "object" && !Array.isArray(val)) {
    if (Array.isArray(val.blocks)) {
      if (val.blocks.length === 0) {
        return emptyFallback;
      }
      const validBlocks = val.blocks.filter(
        (b: any) =>
          b &&
          typeof b === "object" &&
          typeof b.type === "string" &&
          b.data !== undefined &&
          b.data !== null
      );
      return {
        time: typeof val.time === "number" ? val.time : Date.now(),
        blocks: validBlocks.length > 0 ? validBlocks : emptyFallback.blocks,
        version: typeof val.version === "string" ? val.version : "2.31.7",
      };
    }
  }

  // Raw array of blocks
  if (Array.isArray(val)) {
    const validBlocks = val.filter(
      (b: any) =>
        b &&
        typeof b === "object" &&
        typeof b.type === "string" &&
        b.data !== undefined &&
        b.data !== null
    );
    return {
      time: Date.now(),
      blocks: validBlocks.length > 0 ? validBlocks : emptyFallback.blocks,
      version: "2.31.7",
    };
  }

  // String format (JSON or Markdown)
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed || trimmed === "[object Object]") {
      return emptyFallback;
    }

    // Try parsing as JSON first
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        return normalizeToEditorData(parsed);
      } catch {
        // Fall back to markdown parsing
      }
    }

    return markdownToEditorBlocks(val);
  }

  return emptyFallback;
}

export default function EditorJsField({
  value,
  onChange,
  placeholder = "Write content here...",
  minHeight = 120,
  readOnly = false,
}: EditorJsFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<any>(null);
  const isInitializingRef = useRef<boolean>(false);
  const isDestroyedRef = useRef<boolean>(false);

  // Stable ID across re-renders
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [holderId] = useState(() => `editorjs-${rawId || Math.random().toString(36).substring(2, 9)}`);

  // UI state
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Stable refs for props
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Cache initial data at mount time so parent re-renders don't reset typing state
  const [initialData] = useState<OutputData>(() => normalizeToEditorData(value));

  useEffect(() => {
    let isCancelled = false;
    isDestroyedRef.current = false;

    async function initEditor() {
      if (typeof window === "undefined") return;
      if (isInitializingRef.current) return;

      const holderEl = holderRef.current;
      if (!holderEl) {
        return;
      }

      isInitializingRef.current = true;
      setStatus("loading");
      setErrorMessage(null);

      try {
        // Dynamically import Editor.js and plugins
        const [
          editorJsMod,
          headerMod,
          listMod,
          quoteMod,
          delimiterMod,
          tableMod,
        ] = await Promise.all([
          import("@editorjs/editorjs"),
          import("@editorjs/header" as any),
          import("@editorjs/list" as any),
          import("@editorjs/quote" as any),
          import("@editorjs/delimiter" as any),
          import("@editorjs/table" as any),
        ]);

        if (isCancelled || isDestroyedRef.current) {
          isInitializingRef.current = false;
          return;
        }

        // Safely resolve tool constructors
        const EditorJS = resolveToolModule(editorJsMod, "editorjs");
        const Header = resolveToolModule(headerMod, "header");
        const List = resolveToolModule(listMod, "list");
        const Quote = resolveToolModule(quoteMod, "quote");
        const Delimiter = resolveToolModule(delimiterMod, "delimiter");
        const Table = resolveToolModule(tableMod, "table");

        if (typeof EditorJS !== "function") {
          throw new Error("EditorJS constructor could not be resolved from module exports.");
        }

        // Safely tear down previous instance if any
        if (editorInstanceRef.current) {
          try {
            const oldInstance = editorInstanceRef.current;
            editorInstanceRef.current = null;
            if (typeof oldInstance.destroy === "function") {
              if (oldInstance.isReady && typeof oldInstance.isReady.then === "function") {
                await oldInstance.isReady.catch(() => {});
              }
              await oldInstance.destroy().catch(() => {});
            }
          } catch {
            // Ignore teardown errors
          }
        }

        if (isCancelled || isDestroyedRef.current) {
          isInitializingRef.current = false;
          return;
        }

        // Clean any stray children inside the holder from interrupted mounts
        if (holderEl) {
          holderEl.innerHTML = "";
        }

        const editor = new EditorJS({
          holder: holderEl,
          readOnly,
          placeholder,
          minHeight,
          data: initialData,
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
          onChange: async (api: any) => {
            try {
              const output = await api.saver.save();
              onChangeRef.current(output);
            } catch (err) {
              console.warn("Editor.js save warning:", err);
            }
          },
          onReady: () => {
            if (isCancelled || isDestroyedRef.current) {
              try {
                editor.destroy();
              } catch {}
              return;
            }
            editorInstanceRef.current = editor;
            setStatus("ready");
            isInitializingRef.current = false;
          },
        });

        // Also track isReady promise for robustness
        if (editor.isReady && typeof editor.isReady.then === "function") {
          editor.isReady
            .then(() => {
              if (!isCancelled && !isDestroyedRef.current) {
                editorInstanceRef.current = editor;
                setStatus("ready");
                isInitializingRef.current = false;
              }
            })
            .catch((err: any) => {
              if (!isCancelled && !isDestroyedRef.current) {
                console.error("Editor.js isReady rejected:", err);
                setStatus("error");
                setErrorMessage(err?.message || "Editor failed to become ready");
                isInitializingRef.current = false;
              }
            });
        }
      } catch (err: any) {
        if (!isCancelled && !isDestroyedRef.current) {
          console.error("Failed to initialize Editor.js:", err);
          setStatus("error");
          setErrorMessage(err?.message || "Failed to initialize rich editor");
          isInitializingRef.current = false;
        }
      }
    }

    initEditor();

    return () => {
      isCancelled = true;
      isDestroyedRef.current = true;
      isInitializingRef.current = false;

      const editor = editorInstanceRef.current;
      editorInstanceRef.current = null;

      if (editor && typeof editor.destroy === "function") {
        if (editor.isReady && typeof editor.isReady.then === "function") {
          editor.isReady
            .then(() => {
              try {
                editor.destroy();
              } catch {}
            })
            .catch(() => {});
        } else {
          try {
            editor.destroy();
          } catch {}
        }
      }
    };
    // Re-run if admin clicks Retry or container dimensions change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount, minHeight, placeholder, readOnly]);

  const handleContainerClick = (e: React.MouseEvent) => {
    if (status === "ready" && editorInstanceRef.current) {
      const target = e.target as HTMLElement;
      // If clicking outside an active interactive child (e.g. padding of container)
      if (
        !target.closest("[contenteditable='true']") &&
        !target.closest(".ce-toolbar") &&
        !target.closest(".ce-popover") &&
        !target.closest("button") &&
        !target.closest("input")
      ) {
        try {
          if (typeof editorInstanceRef.current.focus === "function") {
            editorInstanceRef.current.focus(true);
          }
        } catch {
          const editable = holderRef.current?.querySelector<HTMLElement>("[contenteditable='true']");
          editable?.focus();
        }
      }
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus("loading");
    setErrorMessage(null);
    setRetryCount((prev) => prev + 1);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="editorjs-dark-theme relative rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-100 transition-colors focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/20 cursor-text"
      style={{ minHeight: `${minHeight}px` }}
    >
      {/* Loading State */}
      {status === "loading" && (
        <div className="flex items-center gap-2 py-3 px-1 text-slate-400 text-xs italic select-none">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Loading editor...</span>
        </div>
      )}

      {/* Recoverable Error State */}
      {status === "error" && (
        <div className="flex items-center justify-between gap-3 p-3 my-1 rounded bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage || "Failed to load rich text editor."}</span>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded bg-rose-800 hover:bg-rose-700 text-white transition-colors shrink-0"
          >
            <RotateCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Actual Editor.js Holder */}
      <div
        ref={holderRef}
        id={holderId}
        className={`w-full prose-invert ${
          status === "ready" ? "opacity-100" : status === "loading" ? "opacity-20 pointer-events-none" : "hidden"
        }`}
      />

      {/* Editor.js dark theme overrides */}
      <style jsx global>{`
        .editorjs-dark-theme .codex-editor {
          color: #f1f5f9;
        }
        .editorjs-dark-theme .ce-block__content,
        .editorjs-dark-theme .ce-toolbar__content {
          max-width: 100%;
        }
        .editorjs-dark-theme .codex-editor__redactor {
          padding-bottom: 16px !important;
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
        .editorjs-dark-theme h2.ce-header {
          font-size: 1.25rem;
        }
        .editorjs-dark-theme h3.ce-header {
          font-size: 1.1rem;
        }
        .editorjs-dark-theme h4.ce-header {
          font-size: 0.95rem;
        }
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

