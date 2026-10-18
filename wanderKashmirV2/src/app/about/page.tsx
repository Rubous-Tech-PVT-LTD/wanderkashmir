import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import {
  Building2,
  MapPin,
  ShieldCheck,
  Compass,
  Users,
  HeartHandshake,
  Car,
  Home,
  Mountain,
  FileText,
  CheckCircle2,
  Phone,
  Mail,
  Globe,
  Calendar,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Target,
  Eye,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About WanderKashmir | Our Team, Mission & Company",
  description:
    "Discover WanderKashmir, a travel marketplace operated by GTM Adventures LLP, connecting travellers with Kashmir stays, tour packages, transport and local experiences.",
  alternates: {
    canonical: "https://www.wanderkashmir.com/about",
  },
  openGraph: {
    title: "About WanderKashmir | Our Team, Mission & Company",
    description:
      "Discover WanderKashmir, a travel marketplace operated by GTM Adventures LLP, connecting travellers with Kashmir stays, tour packages, transport and local experiences.",
    url: "https://www.wanderkashmir.com/about",
    siteName: "WanderKashmir",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/kashmir-hero.jpg",
        width: 1200,
        height: 630,
        alt: "About WanderKashmir - GTM Adventures LLP",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About WanderKashmir | Our Team, Mission & Company",
    description:
      "Discover WanderKashmir, a travel marketplace operated by GTM Adventures LLP, connecting travellers with Kashmir stays, tour packages, transport and local experiences.",
    images: ["/images/kashmir-hero.jpg"],
  },
};

export default function AboutPage() {
  const jsonLdData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TravelAgency",
        "@id": "https://www.wanderkashmir.com/#organization",
        name: "WanderKashmir",
        legalName: "GTM Adventures LLP",
        alternateName: "WanderKashmir Travel Marketplace",
        url: "https://www.wanderkashmir.com",
        logo: "https://www.wanderkashmir.com/brand-logo.png",
        image: "https://www.wanderkashmir.com/images/kashmir-hero.jpg",
        description:
          "WanderKashmir is a curated Kashmir travel marketplace operated by GTM Adventures LLP, connecting travellers with authentic stays, tour packages, local transport, and valley experiences.",
        telephone: "+91 60058 88754",
        email: "support@wanderkashmir.com",
        foundingDate: "2026-01-19",
        identifier: {
          "@type": "PropertyValue",
          name: "LLPIN",
          value: "ACU-5017",
        },
        address: {
          "@type": "PostalAddress",
          streetAddress:
            "House No. 5A, 1st Floor, Devlok Colony, Chandrabani Road, Majra",
          addressLocality: "Dehradun",
          addressRegion: "Uttarakhand",
          addressCountry: "IN",
        },
        location: [
          {
            "@type": "Place",
            name: "WanderKashmir Ground Operations Office",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Hati Gam",
              addressLocality: "Anantnag",
              addressRegion: "Jammu and Kashmir",
              postalCode: "192401",
              addressCountry: "IN",
            },
          },
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: "+91 60058 88754",
            contactType: "customer support",
            areaServed: "IN",
            availableLanguage: ["English", "Hindi", "Kashmiri", "Urdu"],
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": "https://www.wanderkashmir.com/about#webpage",
        url: "https://www.wanderkashmir.com/about",
        name: "About WanderKashmir | Our Team, Mission & Company",
        description:
          "Discover WanderKashmir, a travel marketplace operated by GTM Adventures LLP, connecting travellers with Kashmir stays, tour packages, transport and local experiences.",
        isPartOf: {
          "@id": "https://www.wanderkashmir.com/#website",
        },
        about: {
          "@id": "https://www.wanderkashmir.com/#organization",
        },
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <Navbar />

      <main className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
        {/* =========================================================================
            1. HERO SECTION
            - Editorial banner with authentic project imagery & subtle season tint
            - Single primary H1 with clear branding & company tagline
        ========================================================================= */}
        <section className="relative w-full min-h-[520px] md:min-h-[580px] lg:min-h-[620px] flex items-center justify-center overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
          <Image
            src="/images/kashmir-hero.jpg"
            alt="Scenic view of Kashmir valley with pine forests and snow-capped Himalayan peaks"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Refined gradient scrim for optimal contrast & editorial warmth */}
          <div className="absolute inset-0 bg-slate-950/70 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/40" />

          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            {/* Seasonal Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide uppercase bg-white/10 backdrop-blur-md border border-white/20 text-white mb-6">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: "var(--season-secondary, #F4A261)" }}
              />
              About WanderKashmir
            </div>

            {/* Main Single H1 */}
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight md:leading-tight">
              Discover Kashmir. Connect Locally.{" "}
              <span
                className="block sm:inline"
                style={{ color: "var(--season-secondary, #F4A261)" }}
              >
                Travel Meaningfully.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-200 max-w-3xl mx-auto font-light leading-relaxed">
              WanderKashmir is the curated travel marketplace operated by{" "}
              <strong className="font-semibold text-white">
                GTM Adventures LLP
              </strong>
              , connecting travellers worldwide directly with verified Kashmir
              stays, handcrafted holiday itineraries, private transport, and
              authentic valley experiences.
            </p>

            {/* Quick Stat Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-slate-200">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Operated by GTM Adventures LLP
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
                <MapPin
                  className="w-4 h-4"
                  style={{ color: "var(--season-secondary, #F4A261)" }}
                />
                On-Ground Team in Anantnag, Kashmir
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
                <FileText className="w-4 h-4 text-sky-400" />
                LLPIN: ACU-5017
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. INTRODUCTION & RELATIONSHIP WITH GTM ADVENTURES LLP
        ========================================================================= */}
        <section className="py-16 md:py-20 bg-white border-b border-slate-200/80">
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span
                className="text-xs sm:text-sm font-bold uppercase tracking-wider block mb-2"
                style={{ color: "var(--season-primary, #D62828)" }}
              >
                Corporate Structure &amp; Brand
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Who We Are &amp; How We Operate
              </h2>
            </div>

            <div className="prose prose-slate prose-base sm:prose-lg max-w-none text-slate-700 leading-relaxed space-y-5">
              <p>
                <strong>WanderKashmir</strong> is a dedicated tourism marketplace
                created to bring clarity, genuine local insight, and digital ease
                to planning a journey through Kashmir. Whether someone is
                seeking a quiet heritage houseboat on Dal Lake, a boutique
                alpine stay nestled among the pine groves of Pahalgam, a
                well-paced multi-destination tour, or dependable private mountain
                transport, our platform serves as the bridge between travellers
                and local Kashmiri hospitality providers.
              </p>
              <p>
                The platform is owned, operated, and legally administered by{" "}
                <strong>GTM Adventures LLP</strong>, a registered Limited
                Liability Partnership incorporated under the provisions of the
                Limited Liability Partnership Act, 2008 in India (LLPIN:{" "}
                <span className="font-mono font-medium text-slate-900">
                  ACU-5017
                </span>
                ; incorporated on 19 January 2026).
              </p>
              <p>
                This collaborative structure combines professional corporate
                governance, secure digital transaction standards, and rigorous
                customer service safeguards with an authentic, on-ground
                operations presence based right inside the valley.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. OUR STORY — MAKING KASHMIR EASIER TO DISCOVER
        ========================================================================= */}
        <section className="py-16 md:py-24 bg-slate-50">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Text Column */}
              <div className="lg:col-span-7 space-y-5 text-slate-700 leading-relaxed text-base sm:text-lg">
                <span
                  className="text-xs sm:text-sm font-bold uppercase tracking-wider block"
                  style={{ color: "var(--season-primary, #D62828)" }}
                >
                  Our Story
                </span>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Making Kashmir Easier to Discover
                </h2>
                <p>
                  Kashmir has captivated travellers for centuries with its
                  snow-draped peaks, terraced saffron plateaus, pristine alpine
                  meadows, and the timeless warmth of Kashmiri hospitality—known
                  locally as <em>Mehmaan Nawazi</em>. Yet, for too long, planning
                  a trip to the valley has been complicated by fragmented
                  information, opaque pricing, and layers of disengaged
                  intermediaries.
                </p>
                <p>
                  Visitors often found it challenging to differentiate between
                  genuine local homestays and commercial agents, verify road
                  conditions across high passes, or secure transparent,
                  pre-agreed cab fares. Simultaneously, authentic family-run
                  lodges, licensed shikara rowers, and seasoned local drivers in
                  lesser-known hamlets remained digitally invisible.
                </p>
                <p>
                  WanderKashmir was created to resolve that gap. By combining
                  intuitive web technology with real, on-the-ground relationships
                  throughout Srinagar, Gulmarg, Pahalgam, Sonamarg, and South
                  Kashmir, we built a transparent digital home where travellers
                  can book with total confidence and locals can share their home
                  on fair, dignified terms.
                </p>
              </div>

              {/* Story Visual / Pillars Card */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200/80 space-y-5">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
                      style={{
                        backgroundColor: "var(--season-primary, #D62828)",
                      }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-lg">
                        The WanderKashmir Promise
                      </h3>
                      <p className="text-xs text-slate-500">
                        Bridging technology and local tradition
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-4 text-sm text-slate-600">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-800">
                          Direct Local Partnerships:
                        </strong>{" "}
                        We work directly with hotel owners, homestay hosts, and
                        licensed drivers without layers of brokers.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-800">
                          Clear, Upfront Pricing:
                        </strong>{" "}
                        All rates, inclusions, vehicle models, and seasonal
                        tariffs are stated clearly before booking.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-800">
                          Valley-Based Assistance:
                        </strong>{" "}
                        Real team members in Kashmir ready to assist you
                        throughout your stay.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. WHAT WE DO — THE 5 TOURISM MARKETPLACE PILLARS
        ========================================================================= */}
        <section className="py-16 md:py-24 bg-white border-y border-slate-200/80">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span
                className="text-xs sm:text-sm font-bold uppercase tracking-wider block mb-2"
                style={{ color: "var(--season-primary, #D62828)" }}
              >
                Our Services
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                What We Do
              </h2>
              <p className="mt-3 text-base sm:text-lg text-slate-600">
                WanderKashmir provides an integrated, end-to-end travel
                marketplace designed around every stage of a Kashmir holiday.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Pillar 1: Stays and Accommodation */}
              <div className="bg-slate-50/70 rounded-2xl p-6 sm:p-7 border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      backgroundColor: "var(--season-primary-light, #FCECEB)",
                      color: "var(--season-primary, #D62828)",
                    }}
                  >
                    <Home className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-slate-900 mb-2.5">
                    Stays &amp; Accommodation
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    A verified collection of properties across the valley,
                    including cedarwood Dal Lake houseboats, boutique riverside
                    resorts in Pahalgam, alpine hotels in Gulmarg, and authentic
                    village homestays that introduce guests to traditional
                    Kashmiri home life.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60">
                  <Link
                    href="/stays"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                    style={{ color: "var(--season-primary, #D62828)" }}
                  >
                    Browse Stays <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Pillar 2: Kashmir Tour Packages */}
              <div className="bg-slate-50/70 rounded-2xl p-6 sm:p-7 border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      backgroundColor:
                        "var(--season-secondary-light, #FEF3EA)",
                      color: "var(--season-secondary, #F4A261)",
                    }}
                  >
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-slate-900 mb-2.5">
                    Kashmir Tour Packages
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Thoughtfully paced itineraries created for families, couples,
                    and adventurous travellers. From comprehensive 7D/6N circuit
                    tours covering Srinagar, Sonamarg, Gulmarg, and Pahalgam to
                    romantic honeymoon escapes and winter snow adventures.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60">
                  <Link
                    href="/tours"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                    style={{ color: "var(--season-primary, #D62828)" }}
                  >
                    Explore Tour Packages <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Pillar 3: Local Transport */}
              <div className="bg-slate-50/70 rounded-2xl p-6 sm:p-7 border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-5">
                    <Car className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-slate-900 mb-2.5">
                    Local Transport &amp; Transfers
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Dependable point-to-point and multi-day taxi services operated
                    by experienced local mountain drivers. Clean, well-maintained
                    sedans, SUVs, and tempo travellers equipped for Himalayan
                    terrain, airport pickups, and winter transfers.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60">
                  <span className="text-xs font-semibold text-slate-500">
                    Transparent Fixed Tariffs
                  </span>
                </div>
              </div>

              {/* Pillar 4: Local Guides & Experiences */}
              <div className="bg-slate-50/70 rounded-2xl p-6 sm:p-7 border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-slate-900 mb-2.5">
                    Local Guides &amp; Experiences
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Immersive valley experiences led by certified local guides:
                    early morning Dal Lake vegetable market shikara tours,
                    artisan pashmina and woodcarving studio visits, heritage Old
                    City walks, and guided nature hikes.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60">
                  <Link
                    href="/experiences"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                    style={{ color: "var(--season-primary, #D62828)" }}
                  >
                    View Experiences <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Pillar 5: Destination Guides & Travel Information */}
              <div className="bg-slate-50/70 rounded-2xl p-6 sm:p-7 border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow md:col-span-2 lg:col-span-2">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5">
                    <Mountain className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-slate-900 mb-2.5">
                    Destination Guides &amp; Practical Travel Information
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Accurate, fact-checked editorial travel guides covering
                    Srinagar, Gulmarg, Pahalgam, Sonamarg, Doodhpathri, Yusmarg,
                    and offbeat hamlets. We offer seasonal weather updates,
                    clothing advice, permit information, and local travel
                    etiquette to ensure you are fully prepared for every season.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60">
                  <Link
                    href="/destinations"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                    style={{ color: "var(--season-primary, #D62828)" }}
                  >
                    Explore Kashmir Destinations{" "}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. MISSION & VISION SECTION
        ========================================================================= */}
        <section className="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden">
          {/* Subtle background glow */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 30%, var(--season-secondary, #F4A261) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span
                className="text-xs sm:text-sm font-bold uppercase tracking-wider block mb-2"
                style={{ color: "var(--season-secondary, #F4A261)" }}
              >
                Guiding Principles
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Our Mission &amp; Our Vision
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Mission Card */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-white"
                  style={{
                    backgroundColor: "var(--season-primary, #D62828)",
                  }}
                >
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="font-display font-extrabold text-2xl text-white mb-4">
                  Our Mission
                </h3>
                <p className="text-slate-300 text-base leading-relaxed">
                  To empower local Kashmiri hosts, drivers, artisans, and
                  service providers by giving them a reliable, dignified digital
                  platform to showcase their offerings, while providing travellers
                  with straightforward, transparent, and culturally respectful
                  access to the true essence of Kashmir.
                </p>
              </div>

              {/* Vision Card */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-white"
                  style={{
                    backgroundColor: "var(--season-secondary, #F4A261)",
                  }}
                >
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="font-display font-extrabold text-2xl text-white mb-4">
                  Our Vision
                </h3>
                <p className="text-slate-300 text-base leading-relaxed">
                  To transform Kashmir tourism into a sustainable,
                  community-anchored travel ecosystem where every valley and
                  village finds digital visibility, tourism revenue flows
                  directly to local families, and every visitor departs with a
                  genuine connection to the land and its people.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. MEET THE TEAM BEHIND WANDERKASHMIR — LEADERSHIP PROFILES
        ========================================================================= */}
        <section className="py-16 md:py-24 bg-white border-b border-slate-200/80">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span
                className="text-xs sm:text-sm font-bold uppercase tracking-wider block mb-2"
                style={{ color: "var(--season-primary, #D62828)" }}
              >
                Leadership
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Meet the Team Behind WanderKashmir
              </h2>
              <p className="mt-3 text-base sm:text-lg text-slate-600">
                A dedicated leadership team combining operational on-ground
                expertise in Kashmir, digital engineering, and people-first
                management.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Leader 1: Aubaid Amin Shah */}
              <div className="bg-slate-50 rounded-2xl p-6 sm:p-7 border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  {/* Refined Monogram Badge (Accurate & Professional, No Stock/AI Photo) */}
                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-extrabold text-xl text-white shadow-xs"
                      style={{
                        backgroundColor: "var(--season-primary, #D62828)",
                      }}
                    >
                      AS
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-slate-900">
                        Aubaid Amin Shah
                      </h3>
                      <p
                        className="text-xs font-semibold tracking-wide uppercase"
                        style={{ color: "var(--season-primary, #D62828)" }}
                      >
                        Operations Manager
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Based in Anantnag, Jammu &amp; Kashmir</span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    Leads on-ground tourism operations across Kashmir,
                    spearheading local service provider coordination, hotel and
                    homestay relations, and day-to-day operational execution to
                    ensure seamless traveler logistics.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs text-slate-500 font-medium">
                  Focus: Operations &amp; Local Provider Coordination
                </div>
              </div>

              {/* Leader 2: Ubaid Ahmad Bhat */}
              <div className="bg-slate-50 rounded-2xl p-6 sm:p-7 border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-extrabold text-xl text-white shadow-xs"
                      style={{
                        backgroundColor: "var(--season-secondary, #F4A261)",
                      }}
                    >
                      UB
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-slate-900">
                        Ubaid Ahmad Bhat
                      </h3>
                      <p
                        className="text-xs font-semibold tracking-wide uppercase"
                        style={{ color: "var(--season-primary, #D62828)" }}
                      >
                        Chief Technology Officer (CTO)
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Based in Anantnag, Jammu &amp; Kashmir</span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    Directs the digital platform development, cloud
                    infrastructure, and technical systems powering the
                    WanderKashmir marketplace, ensuring high availability,
                    secure booking transactions, and fast mobile performance.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs text-slate-500 font-medium">
                  Focus: Digital Platform &amp; Technical Infrastructure
                </div>
              </div>

              {/* Leader 3: Vinamra */}
              <div className="bg-slate-50 rounded-2xl p-6 sm:p-7 border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center font-display font-extrabold text-xl text-white shadow-xs">
                      V
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-slate-900">
                        Vinamra
                      </h3>
                      <p
                        className="text-xs font-semibold tracking-wide uppercase"
                        style={{ color: "var(--season-primary, #D62828)" }}
                      >
                        HR &amp; People Management
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200 mb-4">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>People &amp; Organisation</span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    Manages human resources, talent acquisition, cross-functional
                    team coordination, and internal organizational processes to
                    foster an agile, collaborative, and mission-aligned company
                    culture.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs text-slate-500 font-medium">
                  Focus: Human Resources &amp; Team Coordination
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-slate-500 italic max-w-2xl mx-auto">
              Note: The titles listed above reflect key operational leadership
              responsibilities within the WanderKashmir team and are distinct from
              statutory legal designations under GTM Adventures LLP.
            </p>
          </div>
        </section>

        {/* =========================================================================
            7. OFFICES & LEGAL ENTITY — CLEAR SEPARATION (DEHRADUN & ANANTNAG)
        ========================================================================= */}
        <section className="py-16 md:py-24 bg-slate-50">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span
                className="text-xs sm:text-sm font-bold uppercase tracking-wider block mb-2"
                style={{ color: "var(--season-primary, #D62828)" }}
              >
                Governance &amp; Presence
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Our Offices &amp; Legal Entity
              </h2>
              <p className="mt-3 text-base sm:text-lg text-slate-600">
                To maintain regulatory compliance and operational excellence, our
                corporate legal entity and on-ground Kashmir operations are
                distinctly organized.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card 1: Kashmir Operations Office */}
              <div className="bg-white rounded-2xl p-7 sm:p-8 shadow-sm border border-slate-200/90 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
                        style={{
                          backgroundColor: "var(--season-primary, #D62828)",
                        }}
                      >
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-xl text-slate-900">
                          Kashmir Office
                        </h3>
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                          Ground Operations &amp; Support Hub
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100 shrink-0">
                      Active Operations
                    </span>
                  </div>

                  <div className="space-y-4 text-sm text-slate-600">
                    <div>
                      <span className="block font-semibold text-slate-900 text-xs uppercase tracking-wider mb-1 text-slate-500">
                        Brand Name
                      </span>
                      <p className="text-slate-800 font-medium text-base">
                        WanderKashmir
                      </p>
                    </div>

                    <div>
                      <span className="block font-semibold text-slate-900 text-xs uppercase tracking-wider mb-1 text-slate-500">
                        Operational Address
                      </span>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        Hati Gam, Anantnag,
                        <br />
                        Jammu and Kashmir – 192401, India.
                      </p>
                    </div>

                    <div>
                      <span className="block font-semibold text-slate-900 text-xs uppercase tracking-wider mb-1 text-slate-500">
                        Scope of Operations
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Local host relations, mountain driver dispatch, hotel &amp;
                        homestay verification, valley-wide guest coordination, and
                        on-ground emergency traveler assistance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Operating Base: South Kashmir</span>
                  <span className="font-semibold text-slate-700">
                    Pin: 192401
                  </span>
                </div>
              </div>

              {/* Card 2: Registered Legal Office */}
              <div className="bg-white rounded-2xl p-7 sm:p-8 shadow-sm border border-slate-200/90 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-white shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-xl text-slate-900">
                          Registered Office
                        </h3>
                        <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
                          Statutory &amp; Corporate Entity
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 font-semibold border border-sky-100 shrink-0">
                      Legal Headquarters
                    </span>
                  </div>

                  <div className="space-y-4 text-sm text-slate-600">
                    <div>
                      <span className="block font-semibold text-slate-900 text-xs uppercase tracking-wider mb-1 text-slate-500">
                        Operating Legal Entity
                      </span>
                      <p className="text-slate-800 font-medium text-base">
                        GTM Adventures LLP
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="block font-semibold text-slate-900 text-xs uppercase tracking-wider mb-0.5 text-slate-500">
                          LLPIN
                        </span>
                        <p className="font-mono font-bold text-slate-900 text-sm">
                          ACU-5017
                        </p>
                      </div>
                      <div>
                        <span className="block font-semibold text-slate-900 text-xs uppercase tracking-wider mb-0.5 text-slate-500">
                          Incorporation Date
                        </span>
                        <p className="font-medium text-slate-900 text-sm">
                          19 January 2026
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="block font-semibold text-slate-900 text-xs uppercase tracking-wider mb-1 text-slate-500">
                        Registered Office Address
                      </span>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        House No. 5A, 1st Floor, Devlok Colony,
                        <br />
                        Chandrabani Road, Majra, Dehradun,
                        <br />
                        Uttarakhand, India.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Entity Type: Limited Liability Partnership</span>
                  <span className="font-semibold text-slate-700">MCA India</span>
                </div>
              </div>
            </div>

            {/* Clear Distinguishment Banner */}
            <div className="mt-8 p-4 sm:p-5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-blue-900 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p>
                <strong>Transparency Note:</strong> In accordance with Indian
                corporate disclosure guidelines, the Registered Office in
                Dehradun (Uttarakhand) serves as the legal seat of{" "}
                <strong>GTM Adventures LLP</strong> for regulatory filings and
                governance. WanderKashmir&apos;s Kashmir office in Anantnag serves
                as the operational, logistics, and partner management center
                inside Jammu &amp; Kashmir.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. OUR APPROACH TO TRUST, TRANSPARENCY & SUPPORTING LOCAL TOURISM
        ========================================================================= */}
        <section className="py-16 md:py-24 bg-white border-y border-slate-200/80">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span
                className="text-xs sm:text-sm font-bold uppercase tracking-wider block mb-2"
                style={{ color: "var(--season-primary, #D62828)" }}
              >
                Our Values
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Trust, Transparency &amp; Supporting Local Tourism
              </h2>
              <p className="mt-3 text-base sm:text-lg text-slate-600">
                How we protect travellers while creating genuine, lasting
                economic value for local Kashmiri families.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
              {/* Trust Pillar */}
              <div className="bg-slate-50 rounded-2xl p-7 sm:p-8 border border-slate-200/80 space-y-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                  style={{
                    backgroundColor: "var(--season-primary, #D62828)",
                  }}
                >
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900">
                  Our Approach to Trust &amp; Transparency
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We believe travellers deserve utter clarity when planning a
                  dream trip. We eliminate hidden agent commissions, provide
                  unambiguous room category definitions, publish clear
                  cancellation terms, and utilize PCI-DSS certified payment
                  gateways with instant digital booking confirmations.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Fixed, competitive pricing without roadside markups</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Strict vetting for safety, heating, and hygiene</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Direct phone &amp; WhatsApp communication channels</span>
                  </li>
                </ul>
              </div>

              {/* Supporting Local Tourism Pillar */}
              <div className="bg-slate-50 rounded-2xl p-7 sm:p-8 border border-slate-200/80 space-y-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                  style={{
                    backgroundColor: "var(--season-secondary, #F4A261)",
                  }}
                >
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900">
                  Supporting Local Tourism &amp; Communities
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tourism is the economic lifeblood of thousands of Kashmiri
                  households. When you book through WanderKashmir, your travel
                  spend goes directly to native homestay families, shikara
                  owners on Dal and Nigeen lakes, licensed local guides, and
                  independent mountain drivers.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Fostering fair livelihoods across rural hamlets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Promoting offbeat, eco-conscious valley travel</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Preserving traditional Kashmiri artisan crafts</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            9. CONTACT DETAILS & DIRECT COMMUNICATION
        ========================================================================= */}
        <section className="py-16 md:py-20 bg-slate-50 border-b border-slate-200/80">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl p-8 sm:p-10 md:p-12 shadow-sm border border-slate-200/80">
              <div className="max-w-3xl mb-8">
                <span
                  className="text-xs sm:text-sm font-bold uppercase tracking-wider block mb-2"
                  style={{ color: "var(--season-primary, #D62828)" }}
                >
                  Get In Touch
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Reach Out to WanderKashmir
                </h2>
                <p className="text-sm sm:text-base text-slate-600 mt-2">
                  Have questions about an upcoming holiday, need assistance with a
                  custom itinerary, or interested in partnering with us as a local
                  host? Our team is always here to assist.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Phone */}
                <a
                  href="tel:+916005888754"
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors flex items-start gap-4 group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor:
                        "var(--season-primary-light, #FCECEB)",
                      color: "var(--season-primary, #D62828)",
                    }}
                  >
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Phone &amp; WhatsApp
                    </span>
                    <span className="font-display font-bold text-slate-900 text-sm group-hover:underline">
                      +91 60058 88754
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mon – Sun: 9:00 AM – 9:00 PM IST
                    </p>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:support@wanderkashmir.com"
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Email Support
                    </span>
                    <span className="font-display font-bold text-slate-900 text-sm group-hover:underline break-all">
                      support@wanderkashmir.com
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Prompt responses within 24 hours
                    </p>
                  </div>
                </a>

                {/* Website */}
                <a
                  href="https://www.wanderkashmir.com"
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Official Portal
                    </span>
                    <span className="font-display font-bold text-slate-900 text-sm group-hover:underline">
                      www.wanderkashmir.com
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Curated Kashmir travel marketplace
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            10. CLOSING CALL TO ACTION
        ========================================================================= */}
        <section
          className="py-16 md:py-24 text-white relative overflow-hidden"
          style={{ backgroundColor: "var(--season-footer-bg, #220D0D)" }}
        >
          {/* Subtle decorative glow */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, var(--season-primary, #D62828) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span
              className="text-xs sm:text-sm font-bold uppercase tracking-wider block mb-3"
              style={{ color: "var(--season-secondary, #F4A261)" }}
            >
              Start Your Journey
            </span>
            <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Ready to Experience the Real Kashmir?
            </h2>
            <p className="mt-4 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
              Explore handpicked stays, balanced itineraries, and authentic local
              experiences crafted by true locals of the valley.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/tours"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] focus:outline-hidden"
                style={{
                  backgroundColor: "var(--season-primary, #D62828)",
                }}
              >
                <span>Explore Tour Packages</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/stays"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-md transition-colors"
              >
                <span>Browse Stays &amp; Resorts</span>
              </Link>

              <Link
                href="/destinations"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-md transition-colors"
              >
                <span>Destination Guides</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
