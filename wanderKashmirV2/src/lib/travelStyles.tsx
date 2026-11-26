import React from "react";

// =============================================================================
// 1. BESPOKE OUTLINE SVG ICONS (Shared by HelpMeChoose & MobileHeroCarousel)
// =============================================================================

export function HouseboatIcon({
  className = "w-9 h-9",
  "aria-hidden": ariaHidden = true,
}: {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M4 11L12 4L20 11H4Z" />
      <rect x="7" y="11" width="10" height="5" rx="0.5" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <path d="M2 18C4 18 5 19 7 19C9 19 10 18 12 18C14 18 15 19 17 19C19 19 20 18 22 18" />
      <path d="M4 18L5 20H19L20 18" />
    </svg>
  );
}

export function ShrineIcon({
  className = "w-9 h-9",
  "aria-hidden": ariaHidden = true,
}: {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M12 2V4" />
      <circle cx="12" cy="4" r="1" fill="currentColor" />
      <path d="M12 5C9 7.5 7 10 7 13H17C17 10 15 7.5 12 5Z" />
      <path d="M5 21V13H19V21" />
      <path d="M9 21V16C9 14.9 10.3 14 12 14C13.7 14 15 14.9 15 16V21" />
    </svg>
  );
}

export function BackpackIcon({
  className = "w-9 h-9",
  "aria-hidden": ariaHidden = true,
}: {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <rect x="5" y="6" width="14" height="15" rx="3" />
      <rect x="8" y="12" width="8" height="6" rx="1.5" />
      <line x1="8" y1="9" x2="16" y2="9" />
    </svg>
  );
}

export function TraditionalChinarIcon({
  className = "w-9 h-9",
  "aria-hidden": ariaHidden = true,
}: {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M12 2C12 5 9 6.5 8 8C7 9.5 7.5 11 6 12C4.5 13 3 13 3 15C3 17 5 18 7 17.5C8 17.2 9 16 10 17C10.5 17.5 10 19 11 20C11.5 20.5 12 21 12 22C12 21 12.5 20.5 13 20C14 19 13.5 17.5 14 17C15 16 16 17.2 17 17.5C19 18 21 17 21 15C21 13 19.5 13 18 12C16.5 11 17 9.5 16 8C15 6.5 12 5 12 2Z" />
      <line x1="12" y1="10" x2="12" y2="22" />
    </svg>
  );
}

export function HikingBootIcon({
  className = "w-9 h-9",
  "aria-hidden": ariaHidden = true,
}: {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

export function MountainLakeIcon({
  className = "w-9 h-9",
  "aria-hidden": ariaHidden = true,
}: {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M3 14L8 7L13 14" />
      <path d="M11 14L15 9L21 14" />
      <path d="M2 18C4 18 6 17 8 17C10 17 12 18 14 18C16 18 18 17 20 17C21 17 22 18 22 18" />
      <path d="M2 21C4 21 6 20 8 20C10 20 12 21 14 21C16 21 18 20 20 20C21 20 22 21 22 21" />
    </svg>
  );
}

// =============================================================================
// 2. SHARED TRAVEL STYLE TYPES, ICON MAP & DATA MAPPER
// =============================================================================

export interface TravelStyleInput {
  id?: string;
  slug: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
}

export interface PathwayCardItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  svgUrl?: string;
  iconClassName?: string;
  fallbackIcon: React.ComponentType<{
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
  href: string;
  actionText: string;
}

export const STYLE_ICON_MAP: Record<
  string,
  {
    svgUrl?: string;
    iconClassName?: string;
    fallbackIcon: React.ComponentType<{
      className?: string;
      "aria-hidden"?: boolean | "true" | "false";
    }>;
  }
> = {
  culture: {
    svgUrl: "https://res.cloudinary.com/dcmoseix9/image/upload/v1789793264/palace_igvqrj.png",
    fallbackIcon: HouseboatIcon,
  },
  spiritual: {
    svgUrl: "https://res.cloudinary.com/dcmoseix9/image/upload/v1789793902/dervish_jr9igw.png",
    fallbackIcon: ShrineIcon,
  },
  nature: {
    svgUrl: "https://res.cloudinary.com/dcmoseix9/image/upload/v1789793956/solo-traveller_uiybia.png",
    fallbackIcon: BackpackIcon,
  },
  family: {
    svgUrl: "https://res.cloudinary.com/dcmoseix9/image/upload/v1789794097/building_grx3vy.png",
    fallbackIcon: TraditionalChinarIcon,
  },
  adventure: {
    svgUrl: "https://res.cloudinary.com/dcmoseix9/image/upload/v1789794239/hiking_rpczgx.png",
    iconClassName: "-scale-x-100",
    fallbackIcon: HikingBootIcon,
  },
  trekking: {
    svgUrl: "",
    fallbackIcon: MountainLakeIcon,
  },
};

export function mapTravelStylesToCards(
  travelStyles?: TravelStyleInput[]
): PathwayCardItem[] {
  if (!travelStyles || travelStyles.length === 0) {
    return [];
  }

  return travelStyles.map((style) => {
    const iconConfig = STYLE_ICON_MAP[style.slug.toLowerCase()] || {
      fallbackIcon: MountainLakeIcon,
    };
    return {
      id: style.slug,
      title: style.name.toUpperCase(),
      subtitle: style.description || style.name,
      imageUrl:
        style.imageUrl ||
        "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=1000&auto=format&fit=crop",
      imageAlt: style.imageAlt || `${style.name} in Kashmir`,
      svgUrl: iconConfig.svgUrl,
      iconClassName: iconConfig.iconClassName,
      fallbackIcon: iconConfig.fallbackIcon,
      href: `/tours/${style.slug}`,
      actionText: `Explore ${style.name}`,
    };
  });
}
