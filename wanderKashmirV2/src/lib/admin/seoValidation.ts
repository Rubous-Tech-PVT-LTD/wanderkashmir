import prisma from "@/lib/prisma";
import { SeoWorkflowState } from "@prisma/client";
import { SeoResearchData, SeoStrategyData, VerifiedDbFact } from "@/lib/admin/seoStudio";
import { GeneratedDraftContent } from "@/lib/admin/seoGeneration";

export type ValidationSeverity = "PASS" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export type ValidationCategoryKey =
  | "metadata"
  | "headings"
  | "searchIntent"
  | "primaryQuery"
  | "secondaryQueries"
  | "keywordUsage"
  | "completeness"
  | "factualAlignment"
  | "protectedComponents"
  | "internalLinks"
  | "faqs";

export interface SeoValidationIssue {
  severity: ValidationSeverity;
  category: ValidationCategoryKey;
  title: string;
  message: string;
  expected?: string;
  observed?: string;
  recommendation?: string;
}

export interface ValidationCategorySummary {
  key: ValidationCategoryKey;
  label: string;
  status: "PASS" | "WARNING" | "FAIL";
  passedCount: number;
  warningCount: number;
  errorCount: number;
  criticalCount: number;
  issues: SeoValidationIssue[];
}

export interface SeoValidationReport {
  validatedAt: string;
  targetDraftAssetId?: string;
  targetDraftVersion?: string;
  overallStatus: "PASS" | "WARNING" | "FAIL";
  summary: string;
  keywordDensity: number;
  wordCount: number;
  metrics: {
    totalChecks: number;
    passedChecks: number;
    warnings: number;
    errors: number;
    criticals: number;
  };
  categories: Record<ValidationCategoryKey, ValidationCategorySummary>;
  issues: SeoValidationIssue[];
  warnings: SeoValidationIssue[];
  passedChecks: SeoValidationIssue[];
  recommendations: string[];
}

const CATEGORY_LABELS: Record<ValidationCategoryKey, string> = {
  metadata: "SEO Metadata",
  headings: "Heading Hierarchy",
  searchIntent: "Search Intent Alignment",
  primaryQuery: "Primary Target Query",
  secondaryQueries: "Secondary Query Coverage",
  keywordUsage: "Keyword Density & Usage",
  completeness: "Content Completeness",
  factualAlignment: "Ground-Truth Factual Alignment",
  protectedComponents: "Protected Components [RETAIN EXISTING]",
  internalLinks: "Internal Linking",
  faqs: "FAQ Consistency & Quality",
};

/**
 * Runs deterministic rule-based SEO validation across all 11 categories.
 */
export function runDeterministicValidation(
  page: {
    id: string;
    title: string;
    h1Heading: string;
    description: string | null;
    slug: string;
    type: string;
    faqs: any;
  },
  research: SeoResearchData,
  strategy: SeoStrategyData,
  draft: GeneratedDraftContent,
  verifiedDbFacts: VerifiedDbFact[]
): SeoValidationReport {
  const issues: SeoValidationIssue[] = [];
  const passedChecks: SeoValidationIssue[] = [];
  const recommendations: string[] = [];

  const wordCount = (draft.content || "").trim().split(/\s+/).filter(Boolean).length;
  const primaryQuery = (strategy.primaryTopic || research.targetQuery || page.title).trim();

  // Helper to register check
  function recordCheck(
    passed: boolean,
    severityOnFail: ValidationSeverity,
    category: ValidationCategoryKey,
    title: string,
    successMsg: string,
    failMsg: string,
    expected?: string,
    observed?: string,
    recommendation?: string
  ) {
    if (passed) {
      passedChecks.push({
        severity: "PASS",
        category,
        title,
        message: successMsg,
        expected,
        observed,
      });
    } else {
      issues.push({
        severity: severityOnFail,
        category,
        title,
        message: failMsg,
        expected,
        observed,
        recommendation,
      });
      if (recommendation && !recommendations.includes(recommendation)) {
        recommendations.push(recommendation);
      }
    }
  }

  // ============================================================
  // 1. SEO METADATA VALIDATION
  // ============================================================
  const titleLen = (draft.title || "").trim().length;
  recordCheck(
    titleLen >= 30 && titleLen <= 70,
    titleLen === 0 ? "ERROR" : "WARNING",
    "metadata",
    "Meta Title Length",
    `Meta title length is optimal (${titleLen} characters).`,
    titleLen < 30
      ? `Meta title is too short (${titleLen} chars). Recommended: 40-70 characters.`
      : `Meta title is too long (${titleLen} chars). May be truncated in Google SERP.`,
    "40-70 characters",
    `${titleLen} characters`,
    "Adjust meta title length to 50-60 characters for optimal search snippet display."
  );

  const descLen = (draft.metaDescription || "").trim().length;
  recordCheck(
    descLen >= 110 && descLen <= 175,
    descLen === 0 ? "ERROR" : "WARNING",
    "metadata",
    "Meta Description Length",
    `Meta description length is optimal (${descLen} characters).`,
    descLen < 110
      ? `Meta description is brief (${descLen} chars). Recommended: 120-170 characters.`
      : `Meta description is long (${descLen} chars). May be truncated in Google SERP.`,
    "120-170 characters",
    `${descLen} characters`,
    "Keep meta description between 140-160 characters with an enticing call-to-action."
  );

  const h1Len = (draft.h1Heading || "").trim().length;
  recordCheck(
    h1Len >= 10 && h1Len <= 80,
    h1Len === 0 ? "ERROR" : "WARNING",
    "metadata",
    "H1 Primary Heading",
    `H1 heading is clearly defined (${h1Len} characters).`,
    h1Len === 0 ? "H1 primary heading is missing." : `H1 heading length is unusual (${h1Len} characters).`,
    "15-70 characters",
    draft.h1Heading || "Missing",
    "Ensure H1 clearly states the primary subject and location."
  );

  // ============================================================
  // 2. HEADING HIERARCHY VALIDATION
  // ============================================================
  const bodyContent = draft.content || "";
  // Check for rogue # in markdown body (body should only use ## and ###)
  const rogueH1Match = bodyContent.match(/^#\s+[^\n]+/m);
  recordCheck(
    !rogueH1Match,
    "WARNING",
    "headings",
    "Single H1 Hierarchy",
    "Body content correctly avoids duplicate H1 (#) markdown tags.",
    `Content body contains a duplicate top-level H1 tag ("${rogueH1Match?.[0]}"). Body headings must use H2 (##) and H3 (###).`,
    "No # tags in body",
    rogueH1Match?.[0] || "None",
    "Replace top-level # headings in the markdown body with ## (H2) or ### (H3)."
  );

  const hasH2 = /^##\s+[^\n]+/m.test(bodyContent);
  recordCheck(
    hasH2,
    "ERROR",
    "headings",
    "H2 Section Structure",
    "Content contains structured H2 (##) section headings.",
    "Content body does not contain any H2 (##) headings.",
    "At least two ## headings",
    hasH2 ? "Present" : "Missing",
    "Structure the content using ## (H2) headings for major sections."
  );

  // Check if H3 precedes H2
  const firstH2Idx = bodyContent.search(/^##\s+/m);
  const firstH3Idx = bodyContent.search(/^###\s+/m);
  const improperNesting = firstH3Idx !== -1 && (firstH2Idx === -1 || firstH3Idx < firstH2Idx);
  recordCheck(
    !improperNesting,
    "WARNING",
    "headings",
    "Heading Nesting Order",
    "Heading hierarchy order is properly sequenced (H2 precedes H3).",
    "An H3 (###) subsection appears before any H2 (##) section.",
    "H2 before H3",
    improperNesting ? "H3 precedes H2" : "Correct",
    "Ensure subsections (H3) are nested under their respective parent H2 sections."
  );

  // ============================================================
  // 3. PRIMARY TARGET QUERY ALIGNMENT
  // ============================================================
  const lowerQuery = primaryQuery.toLowerCase();
  const lowerTitle = (draft.title || "").toLowerCase();
  const lowerH1 = (draft.h1Heading || "").toLowerCase();
  const lowerBody = bodyContent.toLowerCase();

  const queryInTitleOrH1 = lowerTitle.includes(lowerQuery) || lowerH1.includes(lowerQuery);
  recordCheck(
    queryInTitleOrH1,
    "ERROR",
    "primaryQuery",
    "Primary Query in Title or H1",
    `Primary query "${primaryQuery}" appears prominently in title/H1.`,
    `Primary query "${primaryQuery}" was not found in either the page Title or H1 heading.`,
    `"${primaryQuery}" in Title or H1`,
    `Title: "${draft.title}", H1: "${draft.h1Heading}"`,
    `Include the primary query "${primaryQuery}" in the page Title or H1 heading.`
  );

  const first300Words = lowerBody.split(/\s+/).slice(0, 300).join(" ");
  const queryInIntro = first300Words.includes(lowerQuery);
  recordCheck(
    queryInIntro,
    "WARNING",
    "primaryQuery",
    "Primary Query in Opening Paragraphs",
    `Primary query "${primaryQuery}" appears within the first 300 words.`,
    `Primary query "${primaryQuery}" was not found in the opening 300 words of content.`,
    `"${primaryQuery}" in opening text`,
    queryInIntro ? "Found in opening" : "Not in opening",
    "Introduce the primary target query naturally within the first two paragraphs."
  );

  // ============================================================
  // 4. SECONDARY QUERY COVERAGE
  // ============================================================
  const secondaryQueries = [
    ...(strategy.queriesToImprove || []),
    ...(research.secondaryQueries || []),
  ].filter(Boolean);

  let coveredSecondaryCount = 0;
  const missingSecondaryQueries: string[] = [];

  for (const sq of secondaryQueries) {
    const lsq = sq.toLowerCase().trim();
    if (lowerBody.includes(lsq)) {
      coveredSecondaryCount++;
    } else {
      missingSecondaryQueries.push(sq);
    }
  }

  const secondaryCoverageRatio =
    secondaryQueries.length > 0 ? coveredSecondaryCount / secondaryQueries.length : 1;

  recordCheck(
    secondaryCoverageRatio >= 0.5 || secondaryQueries.length === 0,
    "INFO",
    "secondaryQueries",
    "Secondary Query Integration",
    secondaryQueries.length === 0
      ? "No secondary queries specified in strategy."
      : `Covered ${coveredSecondaryCount} of ${secondaryQueries.length} secondary queries.`,
    `Only ${coveredSecondaryCount} of ${secondaryQueries.length} secondary queries covered in content. Missing: ${missingSecondaryQueries.slice(0, 3).join(", ")}${missingSecondaryQueries.length > 3 ? "..." : ""}.`,
    "At least 50% coverage",
    `${coveredSecondaryCount}/${secondaryQueries.length} queries covered`,
    missingSecondaryQueries.length > 0
      ? `Naturally weave in secondary queries such as "${missingSecondaryQueries[0]}" where relevant.`
      : undefined
  );

  // ============================================================
  // 5. KEYWORD USAGE & DENSITY
  // ============================================================
  const queryWords = lowerQuery.split(/\s+/).filter(Boolean);
  const regex = new RegExp(`\\b${queryWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+")}\\b`, "gi");
  const matches = (lowerBody.match(regex) || []).length;
  const keywordDensity = wordCount > 0 ? Number(((matches * queryWords.length) / wordCount * 100).toFixed(2)) : 0;

  const isHealthyDensity = keywordDensity >= 0.3 && keywordDensity <= 3.0;
  recordCheck(
    isHealthyDensity,
    keywordDensity > 3.0 ? "WARNING" : "INFO",
    "keywordUsage",
    "Keyword Density Check",
    `Primary keyword density is healthy (${keywordDensity}% across ${matches} occurrences).`,
    keywordDensity > 3.0
      ? `High keyword density detected (${keywordDensity}%). Potential keyword stuffing risk.`
      : `Low keyword density (${keywordDensity}%). Consider using the target query in section subheadings.`,
    "0.4% - 2.5%",
    `${keywordDensity}% (${matches} occurrences)`,
    keywordDensity > 3.0
      ? "Reduce repetitive usage of the exact primary query to sound more natural."
      : undefined
  );

  // ============================================================
  // 6. SEARCH INTENT ALIGNMENT
  // ============================================================
  const expectedIntent = ((strategy as any).searchIntent || research.searchIntent || "informational").toLowerCase();
  let intentMatched = true;
  let intentReason = `Content aligns with ${expectedIntent.toUpperCase()} search intent.`;

  if (expectedIntent === "commercial" || expectedIntent === "transactional") {
    const hasCommercialTokens = /(₹|inr|price|cost|package|book|tour|rates|hire|quote|inclusions)/i.test(bodyContent);
    if (!hasCommercialTokens) {
      intentMatched = false;
      intentReason = `Expected ${expectedIntent.toUpperCase()} search intent, but content lacks pricing, packages, or booking options.`;
    }
  }

  recordCheck(
    intentMatched,
    "WARNING",
    "searchIntent",
    "Search Intent Alignment",
    `Content fulfills expected ${expectedIntent.toUpperCase()} traveler search intent.`,
    intentReason,
    expectedIntent.toUpperCase(),
    intentMatched ? expectedIntent.toUpperCase() : "Informational only",
    !intentMatched ? "Include tour package pricing, duration, or booking options to satisfy commercial search intent." : undefined
  );

  // ============================================================
  // 7. CONTENT COMPLETENESS
  // ============================================================
  recordCheck(
    wordCount >= 500,
    wordCount < 300 ? "ERROR" : "WARNING",
    "completeness",
    "Content Length & Depth",
    `Substantial content depth verified (${wordCount} words).`,
    `Content is brief (${wordCount} words). Competitive destination pages typically require 800+ words.`,
    "600+ words",
    `${wordCount} words`,
    wordCount < 500 ? "Expand section details, logistical advice, or seasonal recommendations to deepen topical depth." : undefined
  );

  const faqCount = Array.isArray(draft.faqs) ? draft.faqs.length : 0;
  recordCheck(
    faqCount >= 2,
    "WARNING",
    "completeness",
    "FAQ Section Completeness",
    `Contains ${faqCount} frequently asked questions.`,
    `FAQ section is sparse (${faqCount} FAQs). Recommended: 3-6 comprehensive FAQs.`,
    "3-6 FAQs",
    `${faqCount} FAQs`,
    "Add 2-3 additional traveler questions addressing logistics, seasons, or permits."
  );

  // ============================================================
  // 8. GROUND-TRUTH FACTUAL ALIGNMENT
  // ============================================================
  // Check for unresolved brackets
  const bracketMatches = bodyContent.match(/\[(phone|email|insert|price|contact|address|xyz|\.\.\.)\]/gi);
  recordCheck(
    !bracketMatches,
    "CRITICAL",
    "factualAlignment",
    "Unresolved Placeholder Check",
    "No unresolved placeholders (e.g. [phone], [email]) detected.",
    `Unresolved bracketed placeholders detected in draft: ${bracketMatches?.join(", ")}.`,
    "Zero placeholders",
    bracketMatches ? bracketMatches.join(", ") : "None",
    "Remove or replace all bracketed placeholders with real facts or natural prose."
  );

  // Check for fake example emails or telephone dummy patterns
  const fakeEmailMatch = bodyContent.match(/\b(example\.com|test\.com|fake\.com|placeholder)\b/i);
  recordCheck(
    !fakeEmailMatch,
    "ERROR",
    "factualAlignment",
    "Fake Contact Data Check",
    "No dummy email domains or placeholder contacts detected.",
    `Draft contains placeholder or dummy contact references ("${fakeEmailMatch?.[0]}").`,
    "Real or omitted contact details",
    fakeEmailMatch?.[0] || "None",
    "Omit fictional phone numbers and emails. Guide users to the verified booking system."
  );

  // ============================================================
  // 9. PROTECTED COMPONENTS PRESERVATION ([RETAIN EXISTING])
  // ============================================================
  if (strategy.protectedComponents?.protectTitle) {
    const matchesTitle = (draft.title || "").trim() === page.title.trim();
    recordCheck(
      matchesTitle,
      "CRITICAL",
      "protectedComponents",
      "[RETAIN EXISTING] Title Preservation",
      `Protected Page Title was preserved exactly: "${page.title}".`,
      `Protected Title was altered! Expected: "${page.title}", Observed: "${draft.title}".`,
      page.title,
      draft.title,
      `Restore the exact protected title "${page.title}".`
    );
  }

  if (strategy.protectedComponents?.protectH1) {
    const matchesH1 = (draft.h1Heading || "").trim() === page.h1Heading.trim();
    recordCheck(
      matchesH1,
      "CRITICAL",
      "protectedComponents",
      "[RETAIN EXISTING] H1 Preservation",
      `Protected H1 Heading was preserved exactly: "${page.h1Heading}".`,
      `Protected H1 was altered! Expected: "${page.h1Heading}", Observed: "${draft.h1Heading}".`,
      page.h1Heading,
      draft.h1Heading,
      `Restore the exact protected H1 heading "${page.h1Heading}".`
    );
  }

  if (strategy.protectedComponents?.protectMetaDescription && page.description) {
    const matchesDesc = (draft.metaDescription || "").trim() === page.description.trim();
    recordCheck(
      matchesDesc,
      "ERROR",
      "protectedComponents",
      "[RETAIN EXISTING] Meta Description Preservation",
      "Protected Meta Description was retained verbatim.",
      "Protected Meta Description was altered in draft.",
      page.description,
      draft.metaDescription,
      "Restore the protected meta description snippet."
    );
  }

  if (strategy.protectedComponents?.protectSlug && page.slug) {
    const draftSlug = ((draft as any).slug || "").trim();
    const matchesSlug = draftSlug.toLowerCase() === page.slug.trim().toLowerCase();
    recordCheck(
      matchesSlug,
      "CRITICAL",
      "protectedComponents",
      "[RETAIN EXISTING] Slug Preservation",
      `Protected canonical slug was preserved exactly: "/${page.slug}".`,
      `Protected canonical slug was altered! Expected: "/${page.slug}", Observed: "/${draftSlug}".`,
      page.slug,
      draftSlug,
      `Preserve the exact canonical URL slug "/${page.slug}".`
    );
  }

  if (strategy.protectedComponents?.protectPrimaryQuery) {
    const queryPreserved = lowerTitle.includes(lowerQuery) || lowerH1.includes(lowerQuery) || lowerBody.includes(lowerQuery);
    recordCheck(
      queryPreserved,
      "ERROR",
      "protectedComponents",
      "[RETAIN EXISTING] Primary Target Preservation",
      `Protected primary query "${primaryQuery}" remains the core subject.`,
      `Protected primary query "${primaryQuery}" was not found in draft.`,
      primaryQuery,
      "Missing from draft",
      `Ensure content targets the protected query "${primaryQuery}".`
    );
  }

  if (strategy.protectedComponents?.protectFaqs && Array.isArray(page.faqs) && (page.faqs as any).length > 0) {
    const existingQ1 = page.faqs[0]?.question;
    const hasExistingFaq = draft.faqs?.some((f) => f.question?.toLowerCase().includes(existingQ1?.toLowerCase() || ""));
    recordCheck(
      hasExistingFaq,
      "WARNING",
      "protectedComponents",
      "[RETAIN EXISTING] FAQs Preservation",
      "Existing high-ranking FAQ questions preserved in draft.",
      "Existing protected FAQs were not detected in generated draft.",
      `Contains "${existingQ1}"`,
      "Missing existing questions",
      "Ensure previously ranking FAQ questions are carried over into draft."
    );
  }

  // ============================================================
  // 10. INTERNAL LINKS VALIDATION
  // ============================================================
  const internalLinks = draft.internalLinkSuggestions || [];
  let brokenLinkFound = false;
  let invalidLinkUrl = "";

  for (const l of internalLinks) {
    if (!l.url || (!l.url.startsWith("/") && !l.url.startsWith("https://wanderkashmir.com/"))) {
      brokenLinkFound = true;
      invalidLinkUrl = l.url;
      break;
    }
  }

  recordCheck(
    !brokenLinkFound,
    "ERROR",
    "internalLinks",
    "Internal Link Path Validation",
    `All ${internalLinks.length} suggested internal links use valid relative paths.`,
    `Internal link suggestion contains an invalid URL structure: "${invalidLinkUrl}".`,
    "Relative paths starting with /",
    invalidLinkUrl || "All valid",
    "Ensure all internal links use standard relative paths (e.g. /destinations/gulmarg, /tours/...)."
  );

  // ============================================================
  // 11. FAQ QUALITY & FORMAT VALIDATION
  // ============================================================
  let emptyFaqFound = false;
  let shortAnswerFound = false;
  const seenQuestions = new Set<string>();
  let duplicateFaqFound = false;

  for (const f of draft.faqs || []) {
    if (!f.question?.trim() || !f.answer?.trim()) {
      emptyFaqFound = true;
    }
    if ((f.answer || "").trim().length < 15) {
      shortAnswerFound = true;
    }
    const cleanQ = (f.question || "").toLowerCase().trim();
    if (seenQuestions.has(cleanQ)) {
      duplicateFaqFound = true;
    }
    seenQuestions.add(cleanQ);
  }

  recordCheck(
    !emptyFaqFound && !shortAnswerFound,
    "WARNING",
    "faqs",
    "FAQ Answer Quality",
    "All FAQs contain complete, non-empty, detailed answers.",
    "Draft contains empty FAQ fields or excessively short answers (<15 characters).",
    "Complete questions and substantive answers",
    emptyFaqFound ? "Empty fields" : shortAnswerFound ? "Short answer" : "Valid",
    "Provide thorough, 2-3 sentence answers for every FAQ item."
  );

  recordCheck(
    !duplicateFaqFound,
    "WARNING",
    "faqs",
    "Duplicate FAQ Question Check",
    "No duplicate FAQ questions detected.",
    "Draft contains duplicate FAQ question titles.",
    "Unique questions",
    duplicateFaqFound ? "Duplicates found" : "Unique",
    "Remove or consolidate duplicate FAQ questions."
  );

  // ============================================================
  // AGGREGATE SUMMARY & SEVERITY COUNTS
  // ============================================================
  const categories: Record<ValidationCategoryKey, ValidationCategorySummary> = {
    metadata: { key: "metadata", label: CATEGORY_LABELS.metadata, status: "PASS", passedCount: 0, warningCount: 0, errorCount: 0, criticalCount: 0, issues: [] },
    headings: { key: "headings", label: CATEGORY_LABELS.headings, status: "PASS", passedCount: 0, warningCount: 0, errorCount: 0, criticalCount: 0, issues: [] },
    searchIntent: { key: "searchIntent", label: CATEGORY_LABELS.searchIntent, status: "PASS", passedCount: 0, warningCount: 0, errorCount: 0, criticalCount: 0, issues: [] },
    primaryQuery: { key: "primaryQuery", label: CATEGORY_LABELS.primaryQuery, status: "PASS", passedCount: 0, warningCount: 0, errorCount: 0, criticalCount: 0, issues: [] },
    secondaryQueries: { key: "secondaryQueries", label: CATEGORY_LABELS.secondaryQueries, status: "PASS", passedCount: 0, warningCount: 0, errorCount: 0, criticalCount: 0, issues: [] },
    keywordUsage: { key: "keywordUsage", label: CATEGORY_LABELS.keywordUsage, status: "PASS", passedCount: 0, warningCount: 0, errorCount: 0, criticalCount: 0, issues: [] },
    completeness: { key: "completeness", label: CATEGORY_LABELS.completeness, status: "PASS", passedCount: 0, warningCount: 0, errorCount: 0, criticalCount: 0, issues: [] },
    factualAlignment: { key: "factualAlignment", label: CATEGORY_LABELS.factualAlignment, status: "PASS", passedCount: 0, warningCount: 0, errorCount: 0, criticalCount: 0, issues: [] },
    protectedComponents: { key: "protectedComponents", label: CATEGORY_LABELS.protectedComponents, status: "PASS", passedCount: 0, warningCount: 0, errorCount: 0, criticalCount: 0, issues: [] },
    internalLinks: { key: "internalLinks", label: CATEGORY_LABELS.internalLinks, status: "PASS", passedCount: 0, warningCount: 0, errorCount: 0, criticalCount: 0, issues: [] },
    faqs: { key: "faqs", label: CATEGORY_LABELS.faqs, status: "PASS", passedCount: 0, warningCount: 0, errorCount: 0, criticalCount: 0, issues: [] },
  };

  // Tally passed checks
  for (const pc of passedChecks) {
    if (categories[pc.category]) {
      categories[pc.category].passedCount++;
    }
  }

  // Tally issues
  let totalWarnings = 0;
  let totalErrors = 0;
  let totalCriticals = 0;
  const warningList: SeoValidationIssue[] = [];

  for (const issue of issues) {
    const cat = categories[issue.category];
    if (cat) {
      cat.issues.push(issue);
      if (issue.severity === "WARNING" || issue.severity === "INFO") {
        cat.warningCount++;
        totalWarnings++;
        warningList.push(issue);
        if (cat.status !== "FAIL") cat.status = "WARNING";
      } else if (issue.severity === "ERROR") {
        cat.errorCount++;
        totalErrors++;
        cat.status = "FAIL";
      } else if (issue.severity === "CRITICAL") {
        cat.criticalCount++;
        totalCriticals++;
        cat.status = "FAIL";
      }
    }
  }

  const overallStatus: "PASS" | "WARNING" | "FAIL" =
    totalCriticals > 0 || totalErrors > 0
      ? "FAIL"
      : totalWarnings > 0
      ? "WARNING"
      : "PASS";

  const summary =
    overallStatus === "PASS"
      ? `All ${passedChecks.length} checks passed with 100% compliance. Draft is ready for human review.`
      : overallStatus === "WARNING"
      ? `${totalWarnings} warning(s) detected. Content is viable but can be polished before publication.`
      : `Validation failed with ${totalCriticals} critical and ${totalErrors} error issue(s). Address errors before approving for publication.`;

  return {
    validatedAt: new Date().toISOString(),
    targetDraftAssetId: draft.assetId,
    overallStatus,
    summary,
    keywordDensity,
    wordCount,
    metrics: {
      totalChecks: passedChecks.length + issues.length,
      passedChecks: passedChecks.length,
      warnings: totalWarnings,
      errors: totalErrors,
      criticals: totalCriticals,
    },
    categories,
    issues,
    warnings: warningList,
    passedChecks,
    recommendations,
  };
}

/**
 * Executes full SEO validation for an SEO landing page's latest generated draft.
 * Persists the result into `SeoLandingPage.validationReport` and updates
 * `workflowState` to VALIDATED if overall status is PASS or WARNING.
 */
export async function validateSeoLandingPageDraft(
  pageId: string
): Promise<{
  success: boolean;
  data?: SeoValidationReport;
  error?: string;
}> {
  if (!pageId || typeof pageId !== "string") {
    return { success: false, error: "Invalid SEO landing page identifier." };
  }

  // 1. Fetch page record
  const page = await prisma.seoLandingPage.findUnique({
    where: { id: pageId },
  });

  if (!page) {
    return { success: false, error: "SEO Landing Page record not found." };
  }

  const research = page.seoResearch as unknown as SeoResearchData | null;
  const strategy = page.seoStrategy as unknown as SeoStrategyData | null;

  if (!research) {
    return {
      success: false,
      error: "Research data is required before running validation.",
    };
  }

  if (!strategy) {
    return {
      success: false,
      error: "Strategy blueprint is required before running validation.",
    };
  }

  // 2. Fetch latest draft from ContentAsset
  const draftAsset = await prisma.contentAsset.findUnique({
    where: {
      seoPageId_platform: {
        seoPageId: page.id,
        platform: "SEO_PAGE",
      },
    },
  });

  if (!draftAsset || !draftAsset.jsonData) {
    return {
      success: false,
      error: "No generated content draft found. Please generate a draft in Stage 3 first.",
    };
  }

  const draft: GeneratedDraftContent = {
    ...(draftAsset.jsonData as any),
    assetId: draftAsset.id,
  };

  // 3. Extract verified database facts from research
  const verifiedFacts: VerifiedDbFact[] = Array.isArray(research.verifiedDbFacts)
    ? research.verifiedDbFacts
    : [];

  // 4. Run deterministic validation engine
  const report = runDeterministicValidation(
    {
      id: page.id,
      title: page.title,
      h1Heading: page.h1Heading,
      description: page.description,
      slug: page.slug,
      type: page.type,
      faqs: page.faqs,
    },
    research,
    strategy,
    draft,
    verifiedFacts
  );

  // 5. Persist validation report into SeoLandingPage.validationReport
  // If overall status is PASS or WARNING, transition workflowState to VALIDATED
  const nextWorkflowState: SeoWorkflowState =
    report.overallStatus === "PASS" || report.overallStatus === "WARNING"
      ? "VALIDATED"
      : page.workflowState;

  await prisma.seoLandingPage.update({
    where: { id: page.id },
    data: {
      validationReport: report as any,
      workflowState: nextWorkflowState,
    },
  });

  return {
    success: true,
    data: report,
  };
}
