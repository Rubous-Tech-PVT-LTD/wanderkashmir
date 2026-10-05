import { TourItineraryDay, TourResolvedDestinationItem } from "@/data/liveToursData";

export interface CanvasCoord {
  key: string;
  name: string;
  x: number; // ViewBox 0..400
  y: number; // ViewBox 0..300
  left: string; // CSS percentage
  top: string; // CSS percentage
}

export const CANONICAL_COORDS: Record<string, CanvasCoord> = {
  srinagar: { key: "srinagar", name: "Srinagar", x: 160, y: 140, left: "40%", top: "46.7%" },
  gulmarg: { key: "gulmarg", name: "Gulmarg", x: 95, y: 220, left: "23.8%", top: "73.3%" },
  sonamarg: { key: "sonamarg", name: "Sonamarg", x: 265, y: 75, left: "66.3%", top: "25%" },
  pahalgam: { key: "pahalgam", name: "Pahalgam", x: 310, y: 195, left: "77.5%", top: "65%" },
  doodhpathri: { key: "doodhpathri", name: "Doodhpathri", x: 110, y: 160, left: "27.5%", top: "53.3%" },
  yusmarg: { key: "yusmarg", name: "Yusmarg", x: 130, y: 245, left: "32.5%", top: "81.7%" },
  gurez: { key: "gurez", name: "Gurez", x: 190, y: 40, left: "47.5%", top: "13.3%" },
};

interface KnownDestinationMeta {
  key: string;
  name: string;
  aliases: string[];
}

const KNOWN_DESTINATIONS: KnownDestinationMeta[] = [
  {
    key: "srinagar",
    name: "Srinagar",
    aliases: ["srinagar", "dal lake", "shikara", "mughal garden", "nishat", "shalimar", "chashme shahi", "nigeen", "houseboat", "hari parbat"],
  },
  {
    key: "gulmarg",
    name: "Gulmarg",
    aliases: ["gulmarg", "gondola", "kongdoori", "apharwat", "golf course", "drung"],
  },
  {
    key: "sonamarg",
    name: "Sonamarg",
    aliases: ["sonamarg", "sonmarg", "thajiwas", "sindh valley", "zero point", "zojila"],
  },
  {
    key: "pahalgam",
    name: "Pahalgam",
    aliases: ["pahalgam", "betaab", "aru valley", "aru", "chandanwari", "lidder", "baisaran", "apple valley", "saffron fields"],
  },
  {
    key: "doodhpathri",
    name: "Doodhpathri",
    aliases: ["doodhpathri", "doodh pathri", "shaliganga"],
  },
  {
    key: "yusmarg",
    name: "Yusmarg",
    aliases: ["yusmarg", "yousmarg", "doodh ganga", "nilnag"],
  },
  {
    key: "gurez",
    name: "Gurez",
    aliases: ["gurez", "gurez valley", "habba khatoon", "dawer"],
  },
];

export interface ResolvedDayRoute {
  dayNumber: number | string;
  title: string;
  destination: string;
  destinationKey: string;
  isExcursion: boolean;
  desc?: string;
  activities?: string[];
  stay?: string;
}

export interface UniqueRouteStop {
  key: string;
  name: string;
  order: number; // 1-based order in which it is visited
  isHub: boolean;
  coord: CanvasCoord;
  slug?: string;
  hasPublicPage?: boolean;
}

export interface TourRouteAnalysis {
  circuit: string[]; // e.g. ["Srinagar", "Gulmarg", "Srinagar"]
  circuitKeys: string[];
  uniqueStops: UniqueRouteStop[];
  days: ResolvedDayRoute[];
  baseHub: string;
  excursionDestinations: string[];
  overnightDestinations: string[];
  whyThisRouteBullets: string[];
  svgPath: string;
}

function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

/**
 * Resolves the primary destination for an itinerary day.
 * Priority:
 * 1. day.location (explicit DB field)
 * 2. day.destination
 * 3. Parsed tokens in day.title
 * 4. Overnight / stay mentions in day.desc
 * 5. Fallback based on itinerary sequence
 */
function resolveDayDestination(
  day: TourItineraryDay,
  canonicalDestinations: string[],
  prevKey: string
): { key: string; name: string; isExcursion: boolean } {
  // 1. Explicit location on day
  const rawLoc = (day.location || (day as any).destination || "").trim();
  if (rawLoc) {
    const normLoc = rawLoc.toLowerCase();
    for (const kd of KNOWN_DESTINATIONS) {
      if (kd.key === normLoc || kd.aliases.some((a) => normLoc.includes(a))) {
        return { key: kd.key, name: kd.name, isExcursion: false };
      }
    }
    const matchedCanonical = canonicalDestinations.find(
      (c) => c.toLowerCase().includes(normLoc) || normLoc.includes(c.toLowerCase())
    );
    if (matchedCanonical) {
      const key = normalizeKey(matchedCanonical);
      return { key, name: matchedCanonical, isExcursion: false };
    }
  }

  const title = (day.title || "").toLowerCase();
  const desc = (typeof day.desc === "string" ? day.desc : "").toLowerCase();

  // Excursion detection: Day trips returning to base
  const isExcursion =
    title.includes("excursion") ||
    desc.includes("excursion") ||
    title.includes("srinagar – sonamarg – srinagar") ||
    title.includes("srinagar - sonamarg - srinagar") ||
    title.includes("srinagar – gulmarg – srinagar") ||
    title.includes("srinagar - gulmarg - srinagar") ||
    (desc.includes("return to srinagar") && !title.includes("departure"));

  // Check directional titles: "X to Y" or "X – Y"
  if (title.includes(" to ") || title.includes(" – ") || title.includes(" - ")) {
    const parts = title.split(/\s+(?:to|–|-)\s+/i).map((p) => p.trim());
    const lastPart = parts[parts.length - 1];

    // If the title starts and ends with Srinagar (e.g. "Srinagar – Sonamarg – Srinagar"),
    // the excursion destination of the day is the middle destination!
    if (parts.length >= 3 && lastPart.toLowerCase().includes("srinagar")) {
      for (const middlePart of parts.slice(0, parts.length - 1)) {
        for (const kd of KNOWN_DESTINATIONS.filter((d) => d.key !== "srinagar")) {
          if (kd.aliases.some((a) => middlePart.toLowerCase().includes(a))) {
            return { key: kd.key, name: kd.name, isExcursion: true };
          }
        }
      }
    }

    // Otherwise priority: target destination of the hop (non-Srinagar first)
    for (const kd of KNOWN_DESTINATIONS.filter((d) => d.key !== "srinagar")) {
      if (kd.aliases.some((a) => lastPart.includes(a))) {
        return { key: kd.key, name: kd.name, isExcursion };
      }
    }

    if (lastPart.includes("srinagar") || lastPart.includes("airport") || lastPart.includes("departure")) {
      return { key: "srinagar", name: "Srinagar", isExcursion: false };
    }
  }

  // Scan title for non-Srinagar mountain destinations first
  for (const kd of KNOWN_DESTINATIONS.filter((d) => d.key !== "srinagar")) {
    if (kd.aliases.some((a) => title.includes(a))) {
      return { key: kd.key, name: kd.name, isExcursion };
    }
  }

  // Scan title for Srinagar keywords
  if (
    title.includes("srinagar") ||
    title.includes("dal lake") ||
    title.includes("mughal") ||
    title.includes("arrival") ||
    title.includes("departure")
  ) {
    return { key: "srinagar", name: "Srinagar", isExcursion: false };
  }

  // Scan description for overnight indicators
  for (const kd of KNOWN_DESTINATIONS.filter((d) => d.key !== "srinagar")) {
    if (
      desc.includes(`overnight: ${kd.key}`) ||
      desc.includes(`overnight stay in ${kd.key}`) ||
      desc.includes(`stay in ${kd.key}`)
    ) {
      return { key: kd.key, name: kd.name, isExcursion: false };
    }
  }

  for (const kd of KNOWN_DESTINATIONS.filter((d) => d.key !== "srinagar")) {
    if (kd.aliases.some((a) => desc.includes(a))) {
      return { key: kd.key, name: kd.name, isExcursion };
    }
  }

  // Fallback to previous destination or Srinagar
  if (prevKey && CANONICAL_COORDS[prevKey]) {
    const prev = KNOWN_DESTINATIONS.find((d) => d.key === prevKey);
    if (prev) return { key: prev.key, name: prev.name, isExcursion: false };
  }

  return { key: "srinagar", name: "Srinagar", isExcursion: false };
}

/**
 * Builds a dynamic SVG path string connecting sequential points smoothly.
 */
function buildDynamicSvgPath(coords: CanvasCoord[]): string {
  if (!coords || coords.length < 2) return "";

  if (coords.length === 2) {
    // Elegant bidirectional/single arc between two points
    const p1 = coords[0];
    const p2 = coords[1];
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    // Perpendicular subtle curve
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const curveOffset = 18;
    const cx = midX - (dy / Math.hypot(dx, dy)) * curveOffset;
    const cy = midY + (dx / Math.hypot(dx, dy)) * curveOffset;

    return `M ${p1.x} ${p1.y} Q ${Math.round(cx)} ${Math.round(cy)}, ${p2.x} ${p2.y}`;
  }

  // 3 or more points: chain quadratic curves
  let pathStr = `M ${coords[0].x} ${coords[0].y}`;

  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i];
    const next = coords[i + 1];

    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;

    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const dist = Math.hypot(dx, dy);
    const curveOffset = dist > 120 ? 20 : 12;

    // Direct alternate curvature for realistic mountain valley passes
    const sign = i % 2 === 0 ? 1 : -1;
    const cx = midX + sign * (-(dy / dist) * curveOffset);
    const cy = midY + sign * ((dx / dist) * curveOffset);

    pathStr += ` Q ${Math.round(cx)} ${Math.round(cy)}, ${next.x} ${next.y}`;
  }

  return pathStr;
}

/**
 * Deterministically generates 2-3 route-specific rationale bullets.
 * All statements are directly derived from the tour's itinerary facts, sequence,
 * and day structures without unverified marketing assumptions or traveler benefit claims.
 */
export function generateWhyThisRoute(params: {
  duration?: string;
  daysCount?: number;
  circuit: string[];
  uniqueStops: UniqueRouteStop[];
  excursions: string[];
  overnights: string[];
  cmsOverride?: string[];
  days?: ResolvedDayRoute[];
}): string[] {
  // If CMS-authored override exists and is populated, pass it through
  if (params.cmsOverride && Array.isArray(params.cmsOverride) && params.cmsOverride.length > 0) {
    const valid = params.cmsOverride.map((s) => s.trim()).filter(Boolean);
    if (valid.length > 0) return valid;
  }

  // No automatic marketing copy fallback - editorial copy must be Admin-controlled
  return [];
}

/**
 * Main Tour Route Analyzer.
 * Takes the current tour data and generates a complete, route-accurate analysis.
 */
export function analyzeTourRoute(
  itinerary: TourItineraryDay[] = [],
  tourDestinations: string[] = [],
  resolvedDestinations: TourResolvedDestinationItem[] = [],
  cmsWhyThisRoute?: string[],
  duration?: string
): TourRouteAnalysis {
  const days: ResolvedDayRoute[] = [];
  const circuitHops: string[] = [];
  const circuitKeys: string[] = [];
  const excursionDestinations = new Set<string>();
  const overnightDestinations = new Set<string>();

  let prevKey = "srinagar";

  // 1. Process each day in itinerary order
  for (let idx = 0; idx < itinerary.length; idx++) {
    const day = itinerary[idx];
    const res = resolveDayDestination(day, tourDestinations, prevKey);

    days.push({
      dayNumber: day.day ?? idx + 1,
      title: day.title || `Day ${idx + 1}`,
      destination: res.name,
      destinationKey: res.key,
      isExcursion: res.isExcursion,
      desc: typeof day.desc === "string" ? day.desc : "",
      activities: Array.isArray(day.activities) ? day.activities : [],
      stay: day.stay,
    });

    if (res.isExcursion) {
      excursionDestinations.add(res.name);
      // Circuit includes the excursion and the return
      if (circuitHops.length === 0 || circuitHops[circuitHops.length - 1] !== "Srinagar") {
        circuitHops.push("Srinagar");
        circuitKeys.push("srinagar");
      }
      circuitHops.push(res.name);
      circuitKeys.push(res.key);
      circuitHops.push("Srinagar");
      circuitKeys.push("srinagar");
    } else {
      if (res.key !== "srinagar") {
        overnightDestinations.add(res.name);
      }
      // Collapse consecutive duplicate hops in circuit display
      if (circuitHops.length === 0 || circuitHops[circuitHops.length - 1] !== res.name) {
        circuitHops.push(res.name);
        circuitKeys.push(res.key);
      }
    }

    prevKey = res.key;
  }

  // Ensure arrival and departure hub is represented if tour begins/ends in Srinagar
  if (circuitHops.length === 0) {
    circuitHops.push("Srinagar");
    circuitKeys.push("srinagar");
  }

  // 2. Identify unique visited stops in order of appearance
  const visitedOrderKeys: string[] = [];
  for (const k of circuitKeys) {
    if (!visitedOrderKeys.includes(k)) {
      visitedOrderKeys.push(k);
    }
  }

  const uniqueStops: UniqueRouteStop[] = visitedOrderKeys.map((key, index) => {
    const coord = CANONICAL_COORDS[key] || {
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      x: 160 + index * 40,
      y: 140 + (index % 2 === 0 ? 30 : -30),
      left: `${40 + index * 10}%`,
      top: `${50 + (index % 2 === 0 ? 10 : -10)}%`,
    };

    const resolved = resolvedDestinations.find(
      (r) => r.name.toLowerCase() === coord.name.toLowerCase() || normalizeKey(r.name) === key
    );

    return {
      key,
      name: coord.name,
      order: index + 1,
      isHub: key === "srinagar",
      coord,
      slug: resolved?.slug,
      hasPublicPage: resolved?.hasPublicPage ?? false,
    };
  });

  // 3. Generate dynamic SVG path linking the unique stops in circuit order
  const circuitCoords = circuitKeys
    .map((k) => CANONICAL_COORDS[k])
    .filter(Boolean);

  const svgPath = buildDynamicSvgPath(circuitCoords);

  // 4. Parse days count for bullet logic
  const daysCount = parseInt((duration || "").match(/(\d+)/)?.[0] || String(days.length), 10);

  // 5. Generate Why This Route bullets
  const whyThisRouteBullets = generateWhyThisRoute({
    duration,
    daysCount,
    circuit: circuitHops,
    uniqueStops,
    excursions: Array.from(excursionDestinations),
    overnights: Array.from(overnightDestinations),
    cmsOverride: cmsWhyThisRoute,
    days,
  });

  return {
    circuit: circuitHops,
    circuitKeys,
    uniqueStops,
    days,
    baseHub: "Srinagar",
    excursionDestinations: Array.from(excursionDestinations),
    overnightDestinations: Array.from(overnightDestinations),
    whyThisRouteBullets,
    svgPath,
  };
}
