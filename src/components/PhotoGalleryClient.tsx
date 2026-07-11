"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Grid, Play } from "lucide-react";

interface PhotoGalleryClientProps {
  images: string[];
  propertyName: string;
}

export default function PhotoGalleryClient({ images, propertyName }: PhotoGalleryClientProps) {
  const isVideo = (url: string) => url?.includes("/video/upload/") || /\.(mp4|webm|mov|ogg|avi|mkv)$/i.test(url || "");

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const mainImage = images[0];

  return (
    <>
      <div className={`grid gap-3 relative w-full ${images.length > 1 ? 'grid-cols-1 md:grid-cols-4 md:grid-rows-2 h-[45vh] md:h-[50vh]' : 'h-[50vh] md:h-[60vh]'}`}>
        
        {/* Main Cover Photo */}
        <div 
          onClick={() => openLightbox(0)}
          className={`relative rounded-2xl md:rounded-l-2xl overflow-hidden group cursor-pointer ${
            images.length > 1 ? 'md:col-span-2 md:row-span-2 h-full' : 'w-full h-full md:rounded-r-2xl'
          }`}
        >
          {isVideo(mainImage) ? (
            <video 
              src={mainImage} 
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
          ) : (
            <Image 
              src={mainImage} 
              alt={propertyName} 
              fill 
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105" 
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors pointer-events-none" />
          
          {/* View all photos button placed inside cover photo */}
          {images.length > 1 && (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openLightbox(0);
              }}
              className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-slate-800 backdrop-blur-sm px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 z-10 hover:scale-105 active:scale-95"
            >
              <Grid className="w-3.5 h-3.5 text-orange-500" />
              View all photos
            </button>
          )}
        </div>
        
        {/* Other thumbnails (Desktop Only) */}
        {images.slice(1, 5).map((img: string, idx: number) => {
          const actualIndex = idx + 1;
          const isLastThumb = idx === 3 && images.length > 5;
          return (
            <div 
              key={idx} 
              onClick={() => openLightbox(actualIndex)}
              className={`relative overflow-hidden group cursor-pointer hidden md:block ${
                idx === 1 && images.length === 3 ? 'md:row-span-2' : ''
              } ${
                idx === 1 && images.length >= 5 ? 'rounded-tr-2xl' : ''
              } ${
                idx === 3 ? 'rounded-br-2xl' : ''
              }`}
            >
              {isVideo(img) ? (
                <>
                  <video 
                    src={img} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Play className="w-8 h-8 text-white opacity-80 drop-shadow-md" />
                  </div>
                </>
              ) : (
                <Image 
                  src={img} 
                  alt={`${propertyName} - ${actualIndex + 1}`} 
                  fill 
                  sizes="25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              )}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              
              {isLastThumb && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white font-bold transition-all group-hover:bg-black/40">
                  <span className="text-lg">+{images.length - 5}</span>
                  <span className="text-xs tracking-wider uppercase">More Photos</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/95 z-[999] flex flex-col justify-between select-none"
          onClick={closeLightbox}
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between p-4 md:p-6 text-white shrink-0 z-20">
            <span className="text-sm font-semibold tracking-wide">
              {propertyName} &mdash; {currentIndex + 1} of {images.length}
            </span>
            <button 
              onClick={closeLightbox}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Photo Slider Area */}
          <div className="flex-1 flex items-center justify-between px-2 md:px-8 relative">
            {/* Prev Trigger */}
            <button 
              onClick={prevImage}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors shrink-0 z-20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Current Large Image */}
            <div 
              className="w-full h-[70vh] md:h-[80vh] relative mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {isVideo(images[currentIndex]) ? (
                <video 
                  src={images[currentIndex]} 
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <Image 
                  src={images[currentIndex]} 
                  alt={`${propertyName} - Gallery View`}
                  fill
                  className="object-contain"
                  priority
                />
              )}
            </div>

            {/* Next Trigger */}
            <button 
              onClick={nextImage}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors shrink-0 z-20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Thumbnail Strip (Desktop Only) */}
          <div 
            className="hidden md:flex justify-center gap-2 p-6 overflow-x-auto bg-black/50 shrink-0 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, idx) => (
              <div 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-20 h-14 rounded-lg overflow-hidden cursor-pointer border-2 transition-all shrink-0 ${
                  currentIndex === idx ? 'border-orange-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                {isVideo(img) ? (
                  <>
                    <video src={img} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                      <Play className="w-4 h-4 text-white drop-shadow-md" />
                    </div>
                  </>
                ) : (
                  <Image src={img} alt="Thumb" fill className="object-cover" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
