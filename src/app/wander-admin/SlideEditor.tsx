import React from "react";
import { ArrowUp, ArrowDown, Trash2, RefreshCw } from "lucide-react";

export function SlideEditor({
  editingContent,
  setEditingContent,
  onRegenerateSlide
}: {
  editingContent: string,
  setEditingContent: (val: string) => void,
  onRegenerateSlide: (index: number) => void
}) {
  let parsed: any = {};
  try {
    parsed = JSON.parse(editingContent);
  } catch (e) {
    return <textarea value={editingContent} onChange={e => setEditingContent(e.target.value)} className="w-full h-96 p-4 border rounded-xl font-mono text-sm" />;
  }

  if (!parsed.slides || !Array.isArray(parsed.slides)) {
    return <textarea value={editingContent} onChange={e => setEditingContent(e.target.value)} className="w-full h-96 p-4 border rounded-xl font-mono text-sm" />;
  }

  const slides = parsed.slides;

  const updateSlide = (index: number, field: string, value: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setEditingContent(JSON.stringify({ ...parsed, slides: newSlides }, null, 2));
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newSlides = [...slides];
      [newSlides[index - 1], newSlides[index]] = [newSlides[index], newSlides[index - 1]];
      setEditingContent(JSON.stringify({ ...parsed, slides: newSlides }, null, 2));
    } else if (direction === 'down' && index < slides.length - 1) {
      const newSlides = [...slides];
      [newSlides[index + 1], newSlides[index]] = [newSlides[index], newSlides[index + 1]];
      setEditingContent(JSON.stringify({ ...parsed, slides: newSlides }, null, 2));
    }
  };

  const deleteSlide = (index: number) => {
    if (confirm("Are you sure you want to delete this slide?")) {
      const newSlides = slides.filter((_, i) => i !== index);
      setEditingContent(JSON.stringify({ ...parsed, slides: newSlides }, null, 2));
    }
  };

  return (
    <div className="space-y-4">
      {/* Caption & Hashtags Editor */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h4 className="font-semibold text-slate-700 mb-3">Post Caption & Metadata</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Caption</label>
            <textarea 
              value={parsed.caption || ""}
              onChange={(e) => setEditingContent(JSON.stringify({ ...parsed, caption: e.target.value }, null, 2))}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Hashtags (Comma Separated)</label>
            <input 
              type="text"
              value={(parsed.hashtags || []).join(", ")}
              onChange={(e) => setEditingContent(JSON.stringify({ ...parsed, hashtags: e.target.value.split(",").map((s: string) => s.trim()) }, null, 2))}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Slides Editor */}
      <div className="space-y-4">
        <h4 className="font-semibold text-slate-700">Carousel Slides ({slides.length})</h4>
        {slides.map((slide: any, i: number) => (
          <div key={i} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex gap-4">
            {/* Ordering Controls */}
            <div className="flex flex-col items-center justify-center gap-2 border-r border-slate-100 pr-4">
              <button 
                onClick={() => moveSlide(i, 'up')} 
                disabled={i === 0}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-30"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <span className="font-bold text-slate-400">{i + 1}</span>
              <button 
                onClick={() => moveSlide(i, 'down')} 
                disabled={i === slides.length - 1}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-30"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
            </div>

            {/* Content Form */}
            <div className="flex-1 space-y-3">
              <div className="flex justify-between">
                <input 
                  type="text"
                  value={slide.title || ""}
                  onChange={(e) => updateSlide(i, 'title', e.target.value)}
                  className="font-bold text-lg w-full p-1 border-b border-transparent hover:border-slate-200 focus:border-[#0284c7] focus:outline-none transition-colors"
                  placeholder="Slide Title"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => onRegenerateSlide(i)}
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md font-medium"
                  >
                    <RefreshCw className="w-3 h-3" /> AI Rewrite
                  </button>
                  <button onClick={() => deleteSlide(i)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <textarea 
                value={slide.body || ""}
                onChange={(e) => updateSlide(i, 'body', e.target.value)}
                className="w-full text-sm text-slate-600 p-2 border border-slate-200 rounded-lg focus:border-[#0284c7] focus:outline-none"
                rows={2}
                placeholder="Slide Body Content..."
              />
              
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <label className="block text-xs font-semibold text-slate-500 mb-1">AI Image Prompt (Midjourney/DALL-E)</label>
                <textarea 
                  value={slide.imagePrompt || ""}
                  onChange={(e) => updateSlide(i, 'imagePrompt', e.target.value)}
                  className="w-full text-xs text-slate-500 p-1 bg-transparent border-none focus:ring-0 resize-none"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
