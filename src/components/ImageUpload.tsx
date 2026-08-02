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

  const isLimitReached = (photoLimit !== undefined && photos.length >= photoLimit) || (videoLimit !== undefined && videos.length >= videoLimit);

  return (
    <div className="flex flex-wrap gap-4">
      {uploadedPhotos.map((mediaUrl, idx) => {
        const isVideo = isVideoUrl(mediaUrl);
        return (
          <div key={idx} className="w-24 h-24 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 relative group">
            {isVideo ? (
              <video 
                src={mediaUrl} 
                className="w-full h-full object-cover" 
                muted 
                playsInline 
              />
            ) : (
              <img src={mediaUrl} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
            )}
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const filtered = uploadedPhotos.filter((_, i) => i !== idx);
                if (typeof setUploadedPhotos === "function") {
                  setUploadedPhotos(filtered);
                }
              }}
              className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
            >
              Remove
            </button>
          </div>
        );
      })}
      
      <CldUploadWidget 
        uploadPreset="wanderkashmir_preset" 
        onSuccess={handleUpload}
        options={{
          multiple: true,
          resourceType: "auto",
          clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "gif", "mp4", "mov", "webm", "avi", "mkv", "ogg"],
          maxFiles: Math.max(1, (photoLimit + videoLimit) - uploadedPhotos.length),
        }}
      >
        {({ open }) => {
          if (isLimitReached) return null;
          return (
            <button 
              type="button" 
              onClick={() => open()}
              className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600 transition-colors"
            >
              <Plus className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium text-center px-1">Add Photo / Video</span>
            </button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}
