"use client";

import { useState, useEffect } from "react";

const images = [
  "https://res.cloudinary.com/dcmoseix9/image/upload/q_auto/f_auto/v1781182033/ChatGPT_Image_Jun_11_2026_06_15_47_PM_npe0t1.png",
  "https://res.cloudinary.com/dcmoseix9/image/upload/q_auto/f_auto/v1781183474/ChatGPT_Image_Jun_11_2026_06_40_42_PM_cztzx7.png",
  "https://res.cloudinary.com/dcmoseix9/image/upload/q_auto/f_auto/v1781183615/ChatGPT_Image_Jun_11_2026_06_43_20_PM_pnzlsf.png"
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-0 bg-black">
      {images.map((img, index) => (
        <div
          key={img}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={img}
            alt={`Hero Background ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
    </div>
  );
}
