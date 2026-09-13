"use client";

import { useState, useEffect } from "react";

const phrases = [
  "Authentic Village Stays",
  "Local Culture",
  "Hidden Experiences"
];

export default function HeroTypewriter() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing phase
      if (displayedText.length < currentPhrase.length) {
        timer = setTimeout(() => {
          setDisplayedText(currentPhrase.slice(0, displayedText.length + 1));
        }, 80);
      } else {
        // Finished typing full phrase, pause before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 1800);
      }
    } else {
      // Deleting phase
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(currentPhrase.slice(0, displayedText.length - 1));
        }, 40);
      } else {
        // Finished deleting, move to next phrase
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, phraseIndex]);

  return (
    <div className="flex items-center justify-center min-h-[2rem] sm:min-h-[2.5rem] mt-3 mb-6">
      {/* Hidden for search engine bots to index all phrases */}
      <span className="sr-only">
        Authentic Village Stays, Local Culture, Hidden Experiences in Kashmir
      </span>

      {/* Visual Typewriter Text with WanderKashmir Primary Orange Color & Blinking Cursor */}
      <span
        aria-hidden="true"
        className="inline-flex items-center text-lg sm:text-2xl md:text-3xl font-bold tracking-wide text-[#f97316] drop-shadow-md"
      >
        <span>{displayedText}</span>
        <span className="ml-1 inline-block w-[2px] sm:w-[3px] h-5 sm:h-7 bg-[#f97316] animate-pulse" />
      </span>
    </div>
  );
}
