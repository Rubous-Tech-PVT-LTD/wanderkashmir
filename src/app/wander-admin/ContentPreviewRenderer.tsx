import React from "react";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";

export function ContentPreviewRenderer({ platform, asset }: { platform: string, asset: any }) {
  if (!asset || !asset.jsonData) {
    return <div className="p-4 text-slate-500">No structured data to preview.</div>;
  }

  const data = asset.jsonData;

  switch (platform) {
    case 'instagram':
      return (
        <div className="max-w-sm mx-auto border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          {/* Mock Header */}
          <div className="p-3 flex items-center gap-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-slate-200" />
            <span className="font-semibold text-sm">wanderkashmir</span>
          </div>
          
          {/* Mock Image Carousel */}
          <div className="aspect-square bg-slate-100 relative flex items-center justify-center p-6 text-center">
            {data.slides && data.slides.length > 0 ? (
              <div>
                <h3 className="font-bold text-xl mb-2">{data.slides[0].title}</h3>
                <p className="text-sm text-slate-600">{data.slides[0].body}</p>
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                  {data.slides.map((_: any, i: number) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-slate-300'}`} />
                  ))}
                </div>
              </div>
            ) : (
              <span className="text-slate-400">Image Placeholder</span>
            )}
          </div>
          
          {/* Mock Actions */}
          <div className="p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-4">
                <Heart className="w-6 h-6" />
                <MessageCircle className="w-6 h-6" />
                <Send className="w-6 h-6" />
              </div>
              <Bookmark className="w-6 h-6" />
            </div>
            
            {/* Caption */}
            <div className="text-sm">
              <span className="font-semibold mr-2">wanderkashmir</span>
              {data.caption}
            </div>
            {data.hashtags && (
              <div className="text-blue-600 text-sm mt-1">
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
                  <span className="font-bold">Wander Kashmir</span>
                  <span className="text-slate-500">@WanderKashmir</span>
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
