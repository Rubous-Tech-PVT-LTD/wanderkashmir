"use client";

import { useState, useEffect } from "react";

const phrases = [
  "Authentic Village Stays",
  "Local Culture",
  "Hidden Experiences"
];

export default function HeroTypewriter() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [text, setText] = useState(phrases[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIdx];
    
    // Determine dynamic delay based on state
    let delay = 90; // standard typing speed

    if (isDeleting) {
      delay = 45; // fast backspace
    }

    if (!isDeleting && text === currentPhrase) {
      // Finished typing phrase: pause so user can read
      delay = 1800;
    } else if (isDeleting && text === "") {
      // Finished deleting: pause briefly before typing next phrase
      delay = 350;
    }

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (text === currentPhrase) {
          setIsDeleting(true);
        } else {
          setText(currentPhrase.slice(0, text.length + 1));
        }
      } else {
        if (text === "") {
          setIsDeleting(false);
          setPhraseIdx((prev) => (prev + 1) % phrases.length);
        } else {
          setText(currentPhrase.slice(0, text.length - 1));
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, isDeleting, phraseIdx]);

  return (
    <div className="m-0 min-h-5 flex items-center justify-center">
      {/* Hidden for SEO crawlers to index all terms */}
      <span className="sr-only">
        Authentic Village Stays, Local Culture, Hidden Experiences in Kashmir
      </span>

      {/* Visual Typewriter Text with WanderKashmir Saffron Color & Blinking Cursor */}
      <span
        aria-hidden="true"
        className="inline-flex items-center text-[18px] sm:text-[20px] font-bold tracking-tight text-[#f97316] drop-shadow-md leading-tight"
      >
        <span>{text}</span>
        <span className="ml-1 inline-block w-[2px] h-[18px] sm:h-[20px] bg-[#f97316] animate-pulse" />
      </span>
    </div>
  );
}
