import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function DestinationsHeroBanner() {
  return (
    <section className="w-full bg-white pt-3 pb-3 border-b border-[var(--season-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-1">
          <ol className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-[var(--season-muted)]">
            <li>
              <Link href="/" className="hover:text-[var(--season-primary)] transition-colors">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </li>
            <li className="text-[var(--season-text)]" aria-current="page">
              Destinations
            </li>
          </ol>
        </nav>

        {/* Title & Description */}
        <div className="max-w-3xl space-y-1">
          <h1 className="text-3xl sm:text-4xl lg:text-4xl font-extrabold tracking-tight font-display text-slate-900 leading-none">
            Discover Kashmir
          </h1>
        </div>
      </div>
    </section>
  );
}
