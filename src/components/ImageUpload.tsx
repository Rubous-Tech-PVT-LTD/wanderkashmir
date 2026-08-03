"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Plus, Image as ImageIcon } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";

interface ImageUploadProps {
  uploadedPhotos: string[];
  setUploadedPhotos: React.Dispatch<React.SetStateAction<string[]>> | ((photos: string[] | ((prev: string[]) => string[])) => void);
  photoLimit?: number;
  videoLimit?: number;
}

export default function ImageUpload({ 
  uploadedPhotos = [], 
  setUploadedPhotos, 
  photoLimit = 50, 
  videoLimit = 10 
}: ImageUploadProps) {

  const isVideoUrl = (url: string) => {
    return url.includes("/video/upload/") || /\.(mp4|webm|mov|ogg|avi|mkv)$/i.test(url);
  };

  const photos = uploadedPhotos.filter(url => !isVideoUrl(url));
  const videos = uploadedPhotos.filter(url => isVideoUrl(url));

  const handleUpload = (result: any) => {
    if (result.event === "success") {
      const newMediaUrl = result.info.secure_url;
      const isVideo = isVideoUrl(newMediaUrl);

      const updater = (prev: string[]) => {
        const currentPhotos = prev.filter(url => !isVideoUrl(url));
        const currentVideos = prev.filter(url => isVideoUrl(url));

        if (isVideo) {
          if (currentVideos.length >= videoLimit) {
            toast.error(`You can only upload up to ${videoLimit} videos.`);
            return prev;
          }
        } else {
          if (currentPhotos.length >= photoLimit) {
            toast.error(`You can only upload up to ${photoLimit} photos.`);
            return prev;
          }
        }

        if (!prev.includes(newMediaUrl)) {
          return [...prev, newMediaUrl];
        }
        return prev;
      };

      if (typeof setUploadedPhotos === "function") {
        setUploadedPhotos(updater);
      }
    }
  };

  const isLimitReached = (photoLimit !== undefined && photos.length >= photoLimit) && (videoLimit !== undefined && videos.length >= videoLimit);

  const renderMedia = (mediaUrl: string, originalIndex: number, isVideo: boolean) => (
    <div key={originalIndex} className="w-24 h-24 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 relative group shrink-0">
      {isVideo ? (
        <video 
          src={mediaUrl} 
          className="w-full h-full object-cover" 
          muted 
          playsInline 
        />
      ) : (
        <img src={mediaUrl} alt={`Upload ${originalIndex + 1}`} className="w-full h-full object-cover" />
      )}
      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const filtered = uploadedPhotos.filter((_, i) => i !== originalIndex);
          if (typeof setUploadedPhotos === "function") {
            setUploadedPhotos(filtered);
          }
        }}
        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
      >
        Remove
      </button>
      {isVideo && (
        <div className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">
          Video
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* Photos Section */}
      {(photos.length > 0 || (!isLimitReached && photos.length < photoLimit)) && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Photos ({photos.length}/{photoLimit})
          </h4>
          <div className="flex flex-wrap gap-4">
            {photos.map((mediaUrl) => renderMedia(mediaUrl, uploadedPhotos.indexOf(mediaUrl), false))}
            
            {photos.length < photoLimit && (
              <CldUploadWidget 
                uploadPreset="wanderkashmir_preset" 
                onSuccess={handleUpload}
                options={{
                  multiple: true,
                  resourceType: "image",
                  clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "gif"],
                  maxFiles: Math.max(1, photoLimit - photos.length),
                }}
              >
                {({ open }) => (
                  <button 
                    type="button" 
                    onClick={() => open()}
                    className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600 transition-colors shrink-0"
                  >
                    <Plus className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold text-center px-1 uppercase">Add Photo</span>
                  </button>
                )}
              </CldUploadWidget>
            )}
          </div>
        </div>
      )}

      {/* Videos Section */}
      {(videos.length > 0 || (!isLimitReached && videos.length < videoLimit)) && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Videos ({videos.length}/{videoLimit})
          </h4>
          <div className="flex flex-wrap gap-4">
            {videos.map((mediaUrl) => renderMedia(mediaUrl, uploadedPhotos.indexOf(mediaUrl), true))}
            
            {videos.length < videoLimit && (
              <CldUploadWidget 
                uploadPreset="wanderkashmir_preset" 
                onSuccess={handleUpload}
                options={{
                  multiple: true,
                  resourceType: "video",
                  clientAllowedFormats: ["mp4", "mov", "webm", "avi", "mkv", "ogg"],
                  maxFiles: Math.max(1, videoLimit - videos.length),
                }}
              >
                {({ open }) => (
                  <button 
                    type="button" 
                    onClick={() => open()}
                    className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600 transition-colors shrink-0"
                  >
                    <Plus className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold text-center px-1 uppercase">Add Video</span>
                  </button>
                )}
              </CldUploadWidget>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
