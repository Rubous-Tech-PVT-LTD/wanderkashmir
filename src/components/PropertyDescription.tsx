"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface PropertyDescriptionProps {
  description: string;
}

export default function PropertyDescription({ description }: PropertyDescriptionProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Truncate description for preview
  const previewText = description.length > 150 
    ? description.substring(0, 150) + "..." 
    : description;

  return (
    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-4">About Property</h3>
      <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
        {previewText}
      </div>
      
      {description.length > 150 && (
        <button 
          onClick={() => setIsOpen(true)}
          className="mt-2 text-orange- font-bold hover:underline flex items-center gap-1"
        >
          Read more <span className="text-xl leading-none">›</span>
        </button>
      )}

      {/* Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900">About Property</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">
                {description}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
