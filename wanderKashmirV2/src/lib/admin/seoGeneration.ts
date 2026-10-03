import prisma from "@/lib/prisma";
import { SeoWorkflowState } from "@prisma/client";
import { SeoResearchData, SeoStrategyData, VerifiedDbFact } from "@/lib/admin/seoStudio";

export interface GeneratedFaq {
  question: string;
  answer: string;
}

export interface GeneratedInternalLink {
  anchorText: string;
  url: string;
  context: string;
}

export interface GeneratedDraftContent {
  title: string;
  metaDescription: string;
  h1Heading: string;
  content: string; // Markdown body
  faqs: GeneratedFaq[];
  internalLinkSuggestions: GeneratedInternalLink[];
  seoNotes?: string;
  protectedRetained?: string[];
  generatedAt?: string;
  model?: string;
  assetId?: string;
}

export interface GenerationStudioOptions {
  tone?: "professional_authoritative" | "warm_inspirational" | "adventurous_expert";
  depth?: "standard" | "comprehensive_deep_dive";
  customInstructions?: string;
}

/**
 * Sanitizes AI output to prevent script execution, dangerous HTML attributes,
 * and malicious javascript: URIs while preserving clean markdown formatting.
 */
export function sanitizeGeneratedContent(input: string): string {
  if (!input || typeof input !== "string") return "";

  return input
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove iframes, objects, embeds
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    // Strip javascript: and data: URIs
    .replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"')
    .replace(/src\s*=\s*["']\s*javascript:[^"']*["']/gi, 'src=""')
    .replace(/href\s*=\s*["']\s*data:text\/html[^"']*["']/gi, 'href="#"')
    // Remove inline event handlers (onclick, onload, onerror, etc.)
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "");
}

/**
 * Validates the generated draft structure against required fields and strategy constraints.
 */
export function validateGenerationStructure(
  draft: any,
  strategy: SeoStrategyData,
  page: { title: string; h1Heading: string; description: string | null }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!draft || typeof draft !== "object") {
    return { valid: false, errors: ["Draft output is not a valid JSON object."] };
  }

  if (!draft.title || typeof draft.title !== "string" || draft.title.trim().length < 5) {
    errors.push("Missing or invalid page title.");
  }

  if (!draft.h1Heading || typeof draft.h1Heading !== "string" || draft.h1Heading.trim().length < 5) {
    errors.push("Missing or invalid H1 heading.");
  }

  if (!draft.metaDescription || typeof draft.metaDescription !== "string" || draft.metaDescription.trim().length < 10) {
    errors.push("Missing or invalid meta description.");
  }

  if (!draft.content || typeof draft.content !== "string" || draft.content.trim().length < 100) {
    errors.push("Content body is too short or empty (minimum 100 characters required).");
  }

  if (!Array.isArray(draft.faqs)) {
    errors.push("FAQs must be an array of questions and answers.");
  } else {
    for (let i = 0; i < draft.faqs.length; i++) {
      const f = draft.faqs[i];
      if (!f.question || !f.answer) {
        errors.push(`FAQ at index ${i} is missing a question or answer.`);
        break;
      }
    }
  }

  // Verify protected components
  if (strategy.protectedComponents?.protectTitle && draft.title !== page.title && draft.title !== "[RETAIN EXISTING]") {
    errors.push(`Protected title constraint violated. Expected: "${page.title}"`);
  }

  if (strategy.protectedComponents?.protectH1 && draft.h1Heading !== page.h1Heading && draft.h1Heading !== "[RETAIN EXISTING]") {
    errors.push(`Protected H1 heading constraint violated. Expected: "${page.h1Heading}"`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Constructs the research-backed, verified-facts-only Gemini system prompt.
 */
export function buildSeoGenerationPrompt(
  page: {
    title: string;
    h1Heading: string;
    description: string | null;
    slug: string;
    type: string;
    content: string | null;
    faqs: any;
  },
  research: SeoResearchData,
  strategy: SeoStrategyData,
  verifiedFacts: VerifiedDbFact[],
  verifiedInternalUrls: string[],
  options?: GenerationStudioOptions
): string {
  const tone = options?.tone || "professional_authoritative";
  const depth = options?.depth || "standard";

  const protectedComponentsList: string[] = [];
  if (strategy.protectedComponents?.protectPrimaryQuery) protectedComponentsList.push(`PRIMARY_QUERY ("${strategy.primaryTopic || research.targetQuery}")`);
  if (strategy.protectedComponents?.protectTitle) protectedComponentsList.push(`PAGE_TITLE ("${page.title}")`);
  if (strategy.protectedComponents?.protectH1) protectedComponentsList.push(`H1_HEADING ("${page.h1Heading}")`);
  if (strategy.protectedComponents?.protectMetaDescription) protectedComponentsList.push(`META_DESCRIPTION ("${page.description || ''}")`);
  if (strategy.protectedComponents?.protectSlug) protectedComponentsList.push(`CANONICAL_SLUG ("${page.slug}")`);
  if (strategy.protectedComponents?.protectFaqs) protectedComponentsList.push("EXISTING_FAQS");

  const prompt = `
You are the Lead SEO Content Strategist and local Kashmir travel authority for "WanderKashmir" (wanderkashmir.com).
Your mission is to generate a comprehensive, highly engaging, research-backed SEO landing page draft.

==================================================
PAGE CONTEXT & METADATA
==================================================
Target Query / Topic: ${research.targetQuery || page.title}
Page Type: ${page.type}
Slug / URL: /${page.type.toLowerCase()}s/${page.slug}
Search Intent: ${research.searchIntent || "informational"}
Selected Tone: ${tone}
Requested Depth: ${depth}
${options?.customInstructions ? `Custom Admin Instructions: ${options.customInstructions}` : ""}

==================================================
STRATEGY BLUEPRINT & DECISION
==================================================
Strategy Action: ${strategy.recommendedAction || "OPTIMIZE"}
Admin Decision: ${strategy.adminDecision || "USE_EXISTING"}
Content Angle: ${strategy.contentAngle || "Authoritative local expert guide"}
Heading Direction: ${strategy.recommendedHeadingDirection || "Comprehensive traveler guide with practical logistics"}
Queries To Protect: ${strategy.queriesToProtect?.join(", ") || "None specified"}
Queries To Target & Improve: ${strategy.queriesToImprove?.join(", ") || "None specified"}

==================================================
PROTECTED COMPONENTS — [RETAIN EXISTING] MANDATE
==================================================
The following components are marked as PROTECTED ([RETAIN EXISTING]).
You MUST NOT rewrite or replace protected components:
${protectedComponentsList.length > 0 ? protectedComponentsList.map((c) => `- ${c}`).join("\n") : "- None strictly protected"}

IMPORTANT: For any protected component, output exactly "[RETAIN EXISTING]" as the field value, or keep it verbatim.

==================================================
VERIFIED DATABASE FACTS (GROUND TRUTH)
==================================================
You may ONLY cite concrete business facts (prices, tours, stays, places) that match these verified database records:
${verifiedFacts.length > 0 ? verifiedFacts.map((f) => `- [${f.type}] ${f.fact}`).join("\n") : "- No specific database entities linked; write authoritative regional overview without inventing fictitious hotels/prices."}

==================================================
VERIFIED INTERNAL URL TARGETS (RECOMMENDED LINKS)
==================================================
Only suggest internal links matching these genuine verified routes. DO NOT invent fake URLs:
${verifiedInternalUrls.map((u) => `- ${u}`).join("\n")}

==================================================
ANTI-HALLUCINATION & EDITORIAL RULES
==================================================
1. STRICT TRUTH: NEVER invent fictitious hotel names, tour prices, travel distances, mobile numbers, emails, or opening hours.
2. NO PLACEHOLDERS: NEVER output bracketed placeholders such as [phone], [email], [insert price], [XYZ]. If specific factual data is not provided, frame the advice naturally without placeholders.
3. H1 / HEADING HIERARCHY:
   - Exactly ONE H1 heading (h1Heading field).
   - In the content body, start with ## (H2) and sub-sections with ### (H3). NEVER use # in the body content.
4. SEARCH INTENT: Address traveler queries directly in the first two paragraphs before diving into comprehensive sections.
5. FAQ ACCURACY: FAQs must be directly relevant to the target search queries. Provide practical, accurate Kashmir travel advice.
6. NO KEYWORD STUFFING: Integrate the primary query and secondary queries naturally.
7. RICH MARKDOWN: Use bolding, bulleted lists, and structured comparison or packing tips where appropriate.

==================================================
OUTPUT FORMAT
==================================================
Return ONLY a valid JSON object matching this exact schema:
{
  "title": "Optimized meta title (50-60 chars) or [RETAIN EXISTING]",
  "h1Heading": "Engaging primary H1 heading or [RETAIN EXISTING]",
  "metaDescription": "Compelling search snippet (140-160 chars) with CTA or [RETAIN EXISTING]",
  "content": "Rich markdown content body with ## H2 and ### H3 headings",
  "faqs": [
    {
      "question": "Clear traveler question",
      "answer": "Accurate, helpful answer based on ground truth and local expertise"
    }
  ],
  "internalLinkSuggestions": [
    {
      "anchorText": "Anchor text phrase",
      "url": "One of the verified internal URLs listed above",
      "context": "Why linking here enhances user journey"
    }
  ],
  "seoNotes": "Brief notes on query integration and semantic coverage"
}
`;

  return prompt.trim();
}

/**
 * Executes server-side AI generation for an SEO Landing Page.
 * Implements locking, prerequisite checks, prompt construction, validation,
 * ContentAsset draft storage, and non-destructive workflow state transition.
 */
export async function generateSeoContentDraft(
  pageId: string,
  options?: GenerationStudioOptions
): Promise<{
  success: boolean;
  data?: GeneratedDraftContent;
  error?: string;
  jobId?: string;
}> {
  // 1. Guard against invalid input
  if (!pageId || typeof pageId !== "string") {
    return { success: false, error: "Invalid SEO landing page identifier." };
  }

  // 2. Fetch page and verify it exists
  const page = await prisma.seoLandingPage.findUnique({
    where: { id: pageId },
  });

  if (!page) {
    return { success: false, error: "SEO Landing Page record not found." };
  }

  // 3. Prerequisite check: Research & Strategy data required
  const research = page.seoResearch as unknown as SeoResearchData | null;
  const strategy = page.seoStrategy as unknown as SeoStrategyData | null;

  if (!research) {
    return {
      success: false,
      error: "Complete Research before generating content. No research data found.",
    };
  }

  if (!strategy) {
    return {
      success: false,
      error: "Complete Strategy before generating content. No strategy blueprint found.",
    };
  }

  // 4. Cannibalization risk guard: If high risk, require explicit admin decision
  if (
    research.cannibalization?.status === "HIGH_RISK" &&
    (!strategy.adminDecision || strategy.adminDecision === "IGNORE")
  ) {
    return {
      success: false,
      error:
        "Generation blocked: High cannibalization risk detected. Admin must select a valid Strategy Decision (USE_EXISTING, CONSOLIDATE, or CREATE_NEW) before generating content.",
    };
  }

  // 5. Check AI API Key configuration
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "AI generation is not currently configured. (GEMINI_API_KEY environment variable is missing)",
    };
  }

  // 6. Concurrency Guard: Check for running job in last 3 minutes
  const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
  const activeJob = await prisma.contentGenerationJob.findFirst({
    where: {
      seoLandingPageId: page.id,
      platform: "SEO_PAGE",
      status: { in: ["PENDING", "IN_PROGRESS"] },
      createdAt: { gte: threeMinutesAgo },
    },
  });

  if (activeJob) {
    return {
      success: false,
      error: "Generation is already in progress for this SEO page. Please wait a moment.",
    };
  }

  // 7. Create ContentGenerationJob record
  let job: any;
  try {
    job = await prisma.contentGenerationJob.create({
      data: {
        seoLandingPageId: page.id,
        platform: "SEO_PAGE",
        status: "IN_PROGRESS",
        progress: 10,
        startedAt: new Date(),
        logs: {
          startedBy: "ADMIN",
          model: "gemini-2.5-flash",
          targetQuery: research.targetQuery || page.title,
        },
      },
    });
  } catch (e) {
    console.warn("Could not create ContentGenerationJob record:", e);
  }

  try {
    // 8. Gather Verified DB Facts and Verified Internal URLs
    const verifiedFacts: VerifiedDbFact[] = Array.isArray(research.verifiedDbFacts)
      ? research.verifiedDbFacts
      : [];

    // Query verified live URLs to provide genuine internal linking candidates
    let liveTours: Array<{ slug: string; title: string }> = [];
    let liveDestinations: Array<{ slug: string; title: string }> = [];

    try {
      liveTours = await prisma.tour.findMany({
        where: { isLive: true },
        select: { slug: true, title: true },
        take: 4,
      });
    } catch {}

    try {
      liveDestinations = await prisma.seoLandingPage.findMany({
        where: { type: "DESTINATION", workflowState: "PUBLISHED" },
        select: { slug: true, title: true },
        take: 4,
      });
    } catch {}

    const verifiedInternalUrls = [
      ...liveDestinations.map((d) => `/destinations/${d.slug}`),
      ...liveTours.map((t) => `/tours/${t.slug}`),
      "/tours",
      "/stays",
    ];

    // 9. Build Prompt
    const prompt = buildSeoGenerationPrompt(
      {
        title: page.title,
        h1Heading: page.h1Heading,
        description: page.description,
        slug: page.slug,
        type: page.type,
        content: page.content,
        faqs: page.faqs,
      },
      research,
      strategy,
      verifiedFacts,
      verifiedInternalUrls,
      options
    );

    // 10. Call Gemini 2.5 Flash via official REST API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4, // Controlled, fact-preserving temperature
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => null);
      const errorMsg =
        errorData?.error?.message ||
        `Gemini API returned HTTP status ${apiResponse.status}`;
      throw new Error(`AI generation failed: ${errorMsg}`);
    }

    const responseJson = await apiResponse.json();
    const candidateText =
      responseJson?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error("Gemini returned an empty or malformed generation response.");
    }

    // 11. Parse generated JSON
    let parsed: any;
    try {
      const cleaned = candidateText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      throw new Error("Failed to parse AI output into structured JSON format.");
    }

    // 12. Sanitize content and text fields
    parsed.title = sanitizeGeneratedContent(parsed.title || "");
    parsed.h1Heading = sanitizeGeneratedContent(parsed.h1Heading || "");
    parsed.metaDescription = sanitizeGeneratedContent(parsed.metaDescription || "");
    parsed.content = sanitizeGeneratedContent(parsed.content || "");
    if (Array.isArray(parsed.faqs)) {
      parsed.faqs = parsed.faqs.map((f: any) => ({
        question: sanitizeGeneratedContent(f.question || ""),
        answer: sanitizeGeneratedContent(f.answer || ""),
      }));
    } else {
      parsed.faqs = [];
    }

    // 13. Stitch Protected Components [RETAIN EXISTING]
    const protectedRetained: string[] = [];

    if (
      strategy.protectedComponents?.protectTitle ||
      parsed.title === "[RETAIN EXISTING]"
    ) {
      parsed.title = page.title;
      protectedRetained.push("PAGE_TITLE");
    }

    if (
      strategy.protectedComponents?.protectH1 ||
      parsed.h1Heading === "[RETAIN EXISTING]"
    ) {
      parsed.h1Heading = page.h1Heading;
      protectedRetained.push("H1_HEADING");
    }

    if (
      strategy.protectedComponents?.protectMetaDescription ||
      parsed.metaDescription === "[RETAIN EXISTING]"
    ) {
      parsed.metaDescription = page.description || "";
      protectedRetained.push("META_DESCRIPTION");
    }

    if (strategy.protectedComponents?.protectFaqs) {
      if (Array.isArray(page.faqs) && (page.faqs as any).length > 0) {
        parsed.faqs = page.faqs;
        protectedRetained.push("FAQS");
      }
    }

    // 14. Structural Validation
    const validation = validateGenerationStructure(parsed, strategy, page);
    if (!validation.valid) {
      throw new Error(
        `Generated draft failed structural validation: ${validation.errors.join("; ")}`
      );
    }

    const generatedDraft: GeneratedDraftContent = {
      title: parsed.title,
      metaDescription: parsed.metaDescription,
      h1Heading: parsed.h1Heading,
      content: parsed.content,
      faqs: parsed.faqs,
      internalLinkSuggestions: Array.isArray(parsed.internalLinkSuggestions)
        ? parsed.internalLinkSuggestions.map((l: any) => ({
            anchorText: sanitizeGeneratedContent(l.anchorText || ""),
            url: sanitizeGeneratedContent(l.url || ""),
            context: sanitizeGeneratedContent(l.context || ""),
          }))
        : [],
      seoNotes: parsed.seoNotes ? sanitizeGeneratedContent(parsed.seoNotes) : undefined,
      protectedRetained,
      generatedAt: new Date().toISOString(),
      model: "gemini-2.5-flash",
    };

    // 15. Store Draft safely in ContentAsset (Non-Destructive!)
    const asset = await prisma.contentAsset.upsert({
      where: {
        seoPageId_platform: {
          seoPageId: page.id,
          platform: "SEO_PAGE",
        },
      },
      create: {
        seoPageId: page.id,
        platform: "SEO_PAGE",
        contentType: "LANDING_PAGE",
        title: generatedDraft.title,
        content: generatedDraft.content,
        jsonData: generatedDraft as any,
        publishStatus: "Draft",
      },
      update: {
        title: generatedDraft.title,
        content: generatedDraft.content,
        jsonData: generatedDraft as any,
        publishStatus: "Draft",
        updatedAt: new Date(),
      },
    });

    generatedDraft.assetId = asset.id;

    // 16. Record Version in ContentAssetVersion
    try {
      await prisma.contentAssetVersion.create({
        data: {
          assetId: asset.id,
          content: generatedDraft.content,
          jsonData: generatedDraft as any,
          versionNote: `AI draft generated via gemini-2.5-flash at ${new Date().toISOString()}`,
        },
      });
    } catch (vErr) {
      console.warn("Could not record ContentAssetVersion:", vErr);
    }

    // 17. Advance workflowState to GENERATED (if currently DRAFT, RESEARCHED, or STRATEGISED)
    // NOTE: The live page title, description, content, etc. remain UNMODIFIED.
    const eligibleStates: SeoWorkflowState[] = ["DRAFT", "RESEARCHED", "STRATEGISED"];
    if (eligibleStates.includes(page.workflowState)) {
      await prisma.seoLandingPage.update({
        where: { id: page.id },
        data: { workflowState: "GENERATED" },
      });
    }

    // 18. Complete ContentGenerationJob
    if (job?.id) {
      await prisma.contentGenerationJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          progress: 100,
          finishedAt: new Date(),
        },
      });
    }

    return {
      success: true,
      data: generatedDraft,
      jobId: job?.id,
    };
  } catch (error: any) {
    console.error("Error during SEO AI Generation:", error);

    // Fail ContentGenerationJob
    if (job?.id) {
      try {
        await prisma.contentGenerationJob.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            error: error?.message || "Generation failed with an unexpected error.",
            finishedAt: new Date(),
          },
        });
      } catch (jErr) {
        console.warn("Failed to mark ContentGenerationJob as failed:", jErr);
      }
    }

    return {
      success: false,
      error: error?.message || "Failed to generate SEO content draft.",
      jobId: job?.id,
    };
  }
}

/**
 * Saves modifications made to the generated draft in ContentAsset.
 */
export async function saveGeneratedDraft(
  pageId: string,
  updatedDraft: GeneratedDraftContent
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!pageId || !updatedDraft) {
      return { success: false, error: "Invalid draft payload." };
    }

    // Sanitize before saving
    const sanitizedDraft: GeneratedDraftContent = {
      ...updatedDraft,
      title: sanitizeGeneratedContent(updatedDraft.title),
      h1Heading: sanitizeGeneratedContent(updatedDraft.h1Heading),
      metaDescription: sanitizeGeneratedContent(updatedDraft.metaDescription),
      content: sanitizeGeneratedContent(updatedDraft.content),
      faqs: (updatedDraft.faqs || []).map((f) => ({
        question: sanitizeGeneratedContent(f.question),
        answer: sanitizeGeneratedContent(f.answer),
      })),
      generatedAt: new Date().toISOString(),
    };

    const asset = await prisma.contentAsset.upsert({
      where: {
        seoPageId_platform: {
          seoPageId: pageId,
          platform: "SEO_PAGE",
        },
      },
      create: {
        seoPageId: pageId,
        platform: "SEO_PAGE",
        contentType: "LANDING_PAGE",
        title: sanitizedDraft.title,
        content: sanitizedDraft.content,
        jsonData: sanitizedDraft as any,
        publishStatus: "Draft",
      },
      update: {
        title: sanitizedDraft.title,
        content: sanitizedDraft.content,
        jsonData: sanitizedDraft as any,
        publishStatus: "Draft",
        updatedAt: new Date(),
      },
    });

    // Record an edit version
    try {
      await prisma.contentAssetVersion.create({
        data: {
          assetId: asset.id,
          content: sanitizedDraft.content,
          jsonData: sanitizedDraft as any,
          versionNote: `Manual draft edit saved at ${new Date().toISOString()}`,
        },
      });
    } catch {}

    return { success: true };
  } catch (error: any) {
    console.error("Error saving generated draft:", error);
    return { success: false, error: error?.message || "Failed to save draft." };
  }
}

/**
 * Discards the current draft from ContentAsset and resets workflowState
 * from GENERATED back to STRATEGISED if applicable.
 */
export async function discardGeneratedDraft(
  pageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!pageId) {
      return { success: false, error: "Invalid SEO Page ID." };
    }

    // Remove the ContentAsset
    await prisma.contentAsset.deleteMany({
      where: {
        seoPageId: pageId,
        platform: "SEO_PAGE",
      },
    });

    // Reset workflowState if it was GENERATED
    const page = await prisma.seoLandingPage.findUnique({
      where: { id: pageId },
      select: { workflowState: true },
    });

    if (page?.workflowState === "GENERATED") {
      await prisma.seoLandingPage.update({
        where: { id: pageId },
        data: { workflowState: "STRATEGISED" },
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error discarding generated draft:", error);
    return { success: false, error: error?.message || "Failed to discard draft." };
  }
}
