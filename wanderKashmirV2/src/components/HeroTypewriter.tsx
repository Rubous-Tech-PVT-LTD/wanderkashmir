"use client";

import { useState, useEffect } from "react";

const phrases = [
  "Authentic Village Stays",
  "Local Culture",
  "Hidden Experiences",
];

export default function HeroTypewriter() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [text, setText] = useState(phrases[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIdx];

    let delay = 90; // typing speed
    if (isDeleting) {
      delay = 45; // backspace speed
    }

    if (!isDeleting && text === currentPhrase) {
      delay = 1800; // pause to read
    } else if (isDeleting && text === "") {
      delay = 350; // pause before next phrase
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
      <span className="sr-only">
        Authentic Village Stays, Local Culture, Hidden Experiences in Kashmir
      </span>
      <p className="text-[14px] sm:text-[15px] text-[#E0E0E0] font-normal tracking-wide drop-shadow-md flex items-center gap-1">
        <span>{text}</span>
        <span
          className="inline-block w-[1.5px] h-[14px] bg-[#f97316] animate-pulse"
          aria-hidden="true"
        />
      </p>
    </div>
  );
}
