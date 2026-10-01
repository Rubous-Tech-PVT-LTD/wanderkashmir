import { Headphones, Phone } from "lucide-react";

export default function ToursNeedHelpBanner() {
  const whatsappUrl =
    "https://wa.me/916005888754?text=" +
    encodeURIComponent("Hi WanderKashmir, I need help choosing the best Kashmir tour package for my trip.");

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-gradient-to-r from-slate-50 via-white to-slate-50 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side: Headphone Icon + Text */}
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-2xs border border-[var(--season-border,#E5E7EB)] text-[var(--season-primary,#065F46)] flex items-center justify-center shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[var(--season-text,#111827)] font-display">
              Need Help Choosing?
            </h3>
            <p className="text-xs sm:text-sm text-[var(--season-muted,#4B5563)] mt-0.5">
              Talk directly to our Srinagar travel specialists for personalized recommendations and custom routes.
            </p>
          </div>
        </div>

        {/* Right Side: CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          {/* Chat on WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50 transition-all shadow-2xs"
          >
            <svg
              className="w-4 h-4 fill-current text-emerald-600"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.301-.15-1.782-.879-2.057-.98-.276-.1-.476-.15-.677.15-.2.301-.776.98-.952 1.181-.176.201-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.798-1.5-1.784-1.676-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.2-.301.301-.502.1-.2.05-.376-.025-.526-.075-.15-.677-1.632-.928-2.235-.244-.588-.493-.508-.677-.517-.176-.008-.376-.01-.577-.01-.2 0-.527.075-.803.376s-1.054 1.03-1.054 2.511c0 1.482 1.079 2.91 1.23 3.111.15.201 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.378.197 1.897.12.578-.087 1.782-.728 2.033-1.431.251-.703.251-1.305.176-1.431-.076-.126-.277-.201-.578-.352z" />
            </svg>
            <span>Chat on WhatsApp</span>
          </a>

          {/* Speak to an Expert */}
          <a
            href="tel:+916005888754"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[var(--season-primary,#065F46)] hover:bg-[var(--season-primary-hover,#047857)] transition-all shadow-xs"
          >
            <Phone className="w-4 h-4" />
            <span>Speak to an Expert</span>
          </a>
        </div>
      </div>
    </section>
  );
}
