import React, { useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

export function ContentPreviewRenderer({ platform, asset }: { platform: string, asset: any }) {
  const [activeSlide, setActiveSlide] = useState(0);

  // Reset slide when switching platforms
  React.useEffect(() => {
    setActiveSlide(0);
  }, [platform]);

  if (!asset || !asset.jsonData) {
    return <div className="p-4 text-slate-500">No structured data to preview.</div>;
  }

  const data = asset.jsonData;

  const nextSlide = () => {
    if (data.slides && activeSlide < data.slides.length - 1) setActiveSlide(prev => prev + 1);
  };
  const prevSlide = () => {
    if (activeSlide > 0) setActiveSlide(prev => prev - 1);
  };

  switch (platform) {
    case 'instagram':
    case 'facebook':
      const isFb = platform === 'facebook';
      return (
        <div className="max-w-sm mx-auto border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm relative group">
          {/* Mock Header */}
          <div className="p-3 flex items-center gap-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-slate-200" />
            <span className="font-semibold text-sm">indiahiles</span>
          </div>
          
          {/* Mock Interactive Image Carousel */}
          <div className="aspect-square bg-slate-100 relative flex flex-col p-6 text-center shadow-inner group">
            {data.slides && data.slides.length > 0 ? (
              <>
                {/* Arrow Overlays */}
                {activeSlide > 0 && (
                  <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full shadow-sm hover:bg-white z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronLeft className="w-5 h-5 text-slate-800" />
                  </button>
                )}
                {activeSlide < data.slides.length - 1 && (
                  <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full shadow-sm hover:bg-white z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-slate-800" />
                  </button>
                )}
                
                {/* Slide Content (With Realistic Background Image) */}
                <div 
                  className="flex-1 flex flex-col justify-center items-center relative overflow-hidden rounded-md"
                  style={{
                    backgroundImage: `url('https://picsum.photos/seed/${encodeURIComponent(data.slides[activeSlide].title || 'kashmir')}/800/800')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Dark Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
                  
                  {/* Text Overlay */}
                  <div className="relative z-10 p-6 flex flex-col h-full justify-end pb-12">
                    <h3 className="font-bold text-2xl mb-3 text-white drop-shadow-md">{data.slides[activeSlide].title}</h3>
                    <p className="text-sm text-slate-200 drop-shadow mb-2 line-clamp-4">{data.slides[activeSlide].body}</p>
                  </div>
                </div>
                
                {/* Image Prompt Box (Simulating the visual photo) */}
                <div className="bg-slate-200/50 rounded-lg p-3 text-xs text-slate-500 text-left border border-slate-200 flex items-start gap-2 h-24 overflow-y-auto mt-auto">
                  <ImageIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-1">AI Image Prompt:</span>
                    {data.slides[activeSlide].imagePrompt}
                  </div>
                </div>

                {/* Dot Indicators */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                  {data.slides.map((_: any, i: number) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeSlide ? (isFb ? 'bg-blue-600' : 'bg-blue-500') : 'bg-slate-300'}`} />
                  ))}
                </div>
              </>
            ) : (
              <span className="text-slate-400 m-auto">Image Placeholder</span>
            )}
          </div>
          
          {/* Mock Actions */}
          <div className="p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-4">
                <Heart className="w-6 h-6 hover:text-red-500 cursor-pointer transition-colors" />
                <MessageCircle className="w-6 h-6 hover:text-slate-500 cursor-pointer transition-colors" />
                <Send className="w-6 h-6 hover:text-slate-500 cursor-pointer transition-colors" />
              </div>
              <Bookmark className="w-6 h-6 hover:text-slate-500 cursor-pointer transition-colors" />
            </div>
            
            {/* Caption */}
            <div className="text-sm mt-3">
              <span className="font-semibold mr-2">indiahiles</span>
              <span className="whitespace-pre-wrap">{data.caption}</span>
            </div>
            {data.hashtags && (
              <div className="text-blue-600 text-sm mt-2 font-medium">
                {data.hashtags.join(" ")}
              </div>
            )}
          </div>
        </div>
      );
      
    case 'twitter':
    case 'x':
      return (
        <div className="max-w-md mx-auto space-y-4">
          {data.tweets?.map((tweet: any, i: number) => (
            <div key={i} className="border border-slate-200 p-4 rounded-xl bg-white shadow-sm flex gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold">Indiahiles</span>
                  <span className="text-slate-500">@Indiahiles</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap">{tweet.body}</p>
              </div>
            </div>
          ))}
        </div>
      );
      
    default:
      return (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 whitespace-pre-wrap font-mono text-sm overflow-x-auto text-slate-800">
          {JSON.stringify(data, null, 2)}
        </div>
      );
  }
}
