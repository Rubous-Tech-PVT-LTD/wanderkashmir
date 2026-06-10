"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Plus, Image as ImageIcon } from "lucide-react";

import React from "react";

interface ImageUploadProps {
  uploadedPhotos: string[];
  setUploadedPhotos: React.Dispatch<React.SetStateAction<string[]>>;
  photoLimit: number;
}

export default function ImageUpload({ uploadedPhotos, setUploadedPhotos, photoLimit }: ImageUploadProps) {
  const handleUpload = (result: any) => {
    if (result.event === "success") {
      const newPhotoUrl = result.info.secure_url;
      setUploadedPhotos((prev: string[]) => {
        if (!prev.includes(newPhotoUrl)) {
          return [...prev, newPhotoUrl];
        }
        return prev;
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-4">
      {uploadedPhotos.map((photo, idx) => (
        <div key={idx} className="w-24 h-24 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 relative group">
          <img src={photo} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
          <button 
            type="button"
            onClick={() => setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== idx))}
            className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
          >
            Remove
          </button>
        </div>
      ))}
      
      <CldUploadWidget 
        uploadPreset="wanderkashmir_preset" 
        onSuccess={handleUpload}
        options={{
          multiple: true,
          maxFiles: Math.max(1, photoLimit - uploadedPhotos.length),
        }}
      >
        {({ open }) => {
          if (uploadedPhotos.length >= photoLimit) return null;
          return (
            <button 
              type="button" 
              onClick={() => open()}
              className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600 transition-colors"
            >
              <Plus className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Add Photo</span>
            </button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}
