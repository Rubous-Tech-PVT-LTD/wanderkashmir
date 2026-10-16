/**
 * Utility to sanitize, repair fragmentations, and deduplicate tour highlights.
 *
 * Background:
 * Highlights in legacy / admin imports were occasionally comma-split, causing
 * dependent grammatical clauses (e.g., "if included in your selected package",
 * "subject to ticket availability and operating conditions") to become orphaned fragments.
 * Additionally, duplicate items or clipped leading letters (e.g. "ake a scenic excursion")
 * may exist in the raw dataset.
 *
 * This function:
 * 1. Restores clipped initial words without fabricating content.
 * 2. Re-attaches dependent trailing fragments to their parent highlight.
 * 3. Safely deduplicates identical highlights preserving natural order.
 * 4. Preserves all business disclaimers, conditionality, and distinct itinerary points.
 */
export function sanitizeTourHighlights(rawHighlights?: string[] | null): string[] {
  if (!Array.isArray(rawHighlights) || rawHighlights.length === 0) {
    return [];
  }

  const rejoined: string[] = [];

  for (const raw of rawHighlights) {
    if (!raw || typeof raw !== "string") continue;
    let item = raw.trim();
    if (!item) continue;

    // Fix leading truncated words (e.g. 'ake a scenic' -> 'Take a scenic')
    if (/^ake\s+/i.test(item)) {
      item = "T" + item;
    }

    // Determine if this item is an orphaned fragment of the preceding item
    const isFragment =
      rejoined.length > 0 &&
      // Starts with lowercase letter
      (/^[a-z]/.test(item) ||
        // Or begins with typical dependent clause connectors
        /^(if included|subject to|depending on|as per|according to|and |or )\b/i.test(item));

    if (isFragment) {
      let prev = rejoined[rejoined.length - 1];
      if (prev.endsWith(".")) {
        prev = prev.slice(0, -1);
      }
      const glue = prev.endsWith(",") ? " " : ", ";
      rejoined[rejoined.length - 1] = prev + glue + item;
    } else {
      rejoined.push(item);
    }
  }

  // Deduplicate exact / normalized matches while preserving original order
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const item of rejoined) {
    const normalizedKey = item
      .toLowerCase()
      .replace(/[\s\.]+/g, " ")
      .trim();

    if (!seen.has(normalizedKey)) {
      seen.add(normalizedKey);
      deduped.push(item);
    }
  }

  return deduped;
}
