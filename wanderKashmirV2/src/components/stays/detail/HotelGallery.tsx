"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";

interface HotelGalleryProps {
  title: string;
  images: string[];
  emptySubtitle?: string;
}

export default function HotelGallery({ title, images, emptySubtitle }: HotelGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const validImages = Array.isArray(images)
    ? images.filter((img) => typeof img === "string" && (img.startsWith("http") || img.startsWith("/")))
    : [];

  if (validImages.length === 0) {
    return (
      <div className="w-full h-[280px] sm:h-[340px] md:h-[400px] rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
          <Camera className="w-6 h-6 stroke-[1.5] text-slate-400" />
        </div>
        <h4 className="text-sm font-bold text-slate-700 font-display">No photos available yet</h4>
        <p className="text-xs text-slate-500 max-w-sm">
          {emptySubtitle || "Verified photography will appear here once submitted and approved by WanderKashmir inspectors."}
        </p>
      </div>
    );
  }

  const mainImage = validImages[0];
  const supportingImages = validImages.slice(1, 5);
  const totalCount = validImages.length;
  const isSingle = validImages.length === 1;

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % validImages.length);
    }
  };
  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + validImages.length) % validImages.length);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-2.5 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs">
        {/* Primary Image */}
        <div
          onClick={() => openLightbox(0)}
          className={`relative ${
            isSingle ? "md:col-span-12" : "md:col-span-7 lg:col-span-8"
          } h-[260px] sm:h-[340px] md:h-[400px] cursor-pointer group overflow-hidden bg-slate-100`}
        >
          <Image
            src={mainImage}
            alt={`${title} - Main Exterior/Interior View`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 65vw"
            className="object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button
            type="button"
            className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold bg-black/60 text-white backdrop-blur-xs flex items-center gap-1.5 opacity-90 group-hover:opacity-100"
          >
            <Maximize2 className="w-3 h-3" />
            <span>View Fullscreen</span>
          </button>
        </div>

        {/* Supporting Thumbnails */}
        {!isSingle && (
          <div
            className={`md:col-span-5 lg:col-span-4 grid ${
              supportingImages.length === 1 ? "grid-cols-1" : "grid-cols-2"
            } gap-2 sm:gap-2.5 h-[260px] sm:h-[340px] md:h-[400px]`}
          >
            {supportingImages.map((img, idx) => {
              const actualIdx = idx + 1;
              const isLast = idx === supportingImages.length - 1 && totalCount > 5;
              const remainingCount = totalCount - 5;

              return (
                <div
                  key={idx}
                  onClick={() => openLightbox(actualIdx)}
                  className="relative cursor-pointer group overflow-hidden bg-slate-100"
                >
                  <Image
                    src={img}
                    alt={`${title} - Photo ${actualIdx + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />

                  {isLast && (
                    <div className="absolute inset-0 bg-black/65 backdrop-blur-2xs flex flex-col items-center justify-center text-white">
                      <span className="text-base sm:text-lg font-extrabold font-display">
                        +{remainingCount}
                      </span>
                      <span className="text-[11px] font-semibold text-white/90">
                        More Photos
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
            aria-label="Close photo gallery"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative w-full max-w-5xl h-[70vh] sm:h-[80vh]">
            <Image
              src={validImages[lightboxIndex]}
              alt={`${title} - Photo ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {validImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white cursor-pointer transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white cursor-pointer transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-xs font-semibold bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
            {lightboxIndex + 1} / {validImages.length}
          </div>
        </div>
      )}
    </>
  );
}
