"use client";

import { useEffect, useState } from "react";

const NAV_LINKS = [
  { id: "overview", label: "Overview" },
  { id: "rooms", label: "Rooms" },
  { id: "location", label: "Location" },
  { id: "property-rules", label: "Property Rules" },
  { id: "reviews", label: "Reviews" },
];

export default function PropertyStickyNav() {
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const observers = new Map();

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    };

    const observerOptions = {
      rootMargin: "-120px 0px -60% 0px", // Trigger when element hits top part of viewport
      threshold: 0,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    NAV_LINKS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
        observers.set(id, element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Offset by height of sticky nav + navbar
      const offset = 140;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="sticky top-[72px] z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 hidden md:block mb-8 shadow-sm">
      <div className="container-custom">
        <nav className="flex items-center gap-8 overflow-x-auto no-scrollbar">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className={`py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
                activeTab === link.id
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
