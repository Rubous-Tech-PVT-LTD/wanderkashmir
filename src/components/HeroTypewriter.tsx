"use client";

import { useState, useEffect } from "react";

const phrases = [
  "Authentic Village Stays",
  "Local Culture",
  "Hidden Experiences"
];

export default function HeroTypewriter() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(phrases[0].length);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  // Initial display: keep first phrase visible for 2 seconds before starting backspace
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setIsPaused(false);
      setIsDeleting(true);
    }, 2000);
    return () => clearTimeout(initialTimer);
  }, []);

  // Infinite Typewriter Loop (Non-stop cycle)
  useEffect(() => {
    if (isPaused) return;

    const currentPhrase = phrases[phraseIdx];

    if (!isDeleting) {
      // 1. Typing forward character-by-character
      if (charIdx < currentPhrase.length) {
        const timer = setTimeout(() => {
          setCharIdx((prev) => prev + 1);
        }, 80);
        return () => clearTimeout(timer);
      } else {
        // 2. Phrase complete — pause for 1.8s so user can read
        setIsPaused(true);
        const timer = setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, 1800);
        return () => clearTimeout(timer);
      }
    } else {
      // 3. Deleting backward character-by-character
      if (charIdx > 0) {
        const timer = setTimeout(() => {
          setCharIdx((prev) => prev - 1);
        }, 40);
        return () => clearTimeout(timer);
      } else {
        // 4. Switch to next phrase in infinite loop (0 -> 1 -> 2 -> 0 -> 1 ...)
        setIsPaused(true);
        const timer = setTimeout(() => {
          setIsDeleting(false);
          setPhraseIdx((prev) => (prev + 1) % phrases.length);
          setIsPaused(false);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [charIdx, isDeleting, isPaused, phraseIdx]);

  const currentText = phrases[phraseIdx].substring(0, charIdx);

  return (
    <div className="flex items-center justify-center min-h-[1.75rem] sm:min-h-[2.25rem] mt-1.5 mb-3">
      {/* Hidden for SEO crawlers to index all terms */}
      <span className="sr-only">
        Authentic Village Stays, Local Culture, Hidden Experiences in Kashmir
      </span>

      {/* Visual Typewriter Text with WanderKashmir Saffron Color & Blinking Cursor */}
      <span
        aria-hidden="true"
        className="inline-flex items-center text-sm sm:text-lg md:text-xl font-bold tracking-wide text-[#f97316] drop-shadow-md"
      >
        <span>{currentText}</span>
        <span className="ml-1 inline-block w-[2px] h-4 sm:h-5 bg-[#f97316] animate-pulse" />
      </span>
    </div>
  );
}
