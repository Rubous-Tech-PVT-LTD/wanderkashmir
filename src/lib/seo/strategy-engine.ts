import { GoogleGenerativeAI } from "@google/generative-ai";
import { SeoResearch, SeoStrategy } from "./types";

export async function generateSeoStrategy(
  research: SeoResearch,
  existingContent?: string
): Promise<SeoStrategy> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const isHighCannibalization = research.cannibalizationRisk.status === 'HIGH_RISK' || research.cannibalizationRisk.recommendation === 'MANUAL_REVIEW';

  const prompt = `You are an expert SEO strategist and Content Director for WanderKashmir.
Your task is to analyze real Google Search Console data, Keyword Research, and SERP Analysis to generate a highly targeted SEO Strategy.

TARGET: ${research.target}
IS EXISTING PAGE: ${research.isExistingPage}
SEARCH INTENT: ${research.searchIntent}
CANNIBALIZATION RISK: ${research.cannibalizationRisk.status}
RECOMMENDED RESEARCH ACTION: ${research.cannibalizationRisk.recommendation}
COMPETING EXISTING PAGES: ${JSON.stringify(research.cannibalizationRisk.competingPages, null, 2)}

=== RESEARCH DATA ===
GSC PERFORMANCE: ${JSON.stringify(research.gsc)}
GOOGLE TRENDS (FREE): ${JSON.stringify(research.googleTrends)}
KEYWORD PLANNER (FREE): ${JSON.stringify(research.keywordPlanner)}
KEYWORD RESEARCH (PAID): ${JSON.stringify(research.keywordResearch)}
SERP RESEARCH (PAID): ${JSON.stringify(research.serpResearch)}
HISTORICAL BASELINE: ${JSON.stringify(research.historicalBaseline)}
PERFORMANCE DELTA: ${JSON.stringify(research.performanceDelta)}
=====================

CRITICAL INSTRUCTIONS:
1. HISTORICAL SEO PROTECTION IS SUPREME. If the GSC data or historical baseline shows strong performance (e.g., High CTR, Top 10 position, high clicks) for a title, heading, or meta description, YOU MUST RESPOND WITH "PROTECT" for that component.
2. DO NOT OVERRIDE GSC SUCCESS WITH KEYWORD TOOL DATA. If a keyword tool suggests a "better" title, but GSC shows the current title gets 10% CTR on Page 1, you MUST PROTECT the current title.
3. CANNIBALIZATION & MANUAL REVIEW RULES:
   ${isHighCannibalization ? `
   - CANNIBALIZATION RISK IS HIGH. Multiple existing pages (${JSON.stringify(research.cannibalizationRisk.competingPages.map(p => p.title))}) already target or overlap with this entity.
   - YOU MUST NOT TREAT THIS AS A CLEAN "NEW PAGE". DO NOT use phrases like "New page, needs..." or "Create new page" in reasons or guidelines.
   - YOU MUST SET "recommendedAction": "MANUAL_REVIEW" and "manualReviewRequired": true.
   - In "competingPagesAnalysis", detail why each competing page conflicts, what search intent each page appears to serve, and advise the Admin whether to designate an existing page as primary or consolidate intent.
   ` : `
   - If Cannibalization Risk is SAFE, advise normal optimization or creation based on research.
   `}
4. If Keyword Research or SERP Research is 'UNAVAILABLE', base your strategy solely on GSC data and Intent analysis. Do NOT fabricate missing metrics.
5. For SERP Analysis: Look for common topics and content types. Use these to recommend new sections (EXPAND) or FAQ additions (ADD), but DO NOT copy competitors exactly.
6. For Keyword Research: Use related keywords to suggest semantic variations for headings, but do NOT recommend keyword stuffing.

OUTPUT JSON FORMAT ONLY. Do not include markdown blocks.
{
  "primaryTopic": "string",
  "queriesToProtect": ["string"],
  "queriesToImprove": ["string"],
  "competingPagesAnalysis": "string (mandatory when competing pages exist)",
  "manualReviewRequired": boolean,
  "title": { "action": "PROTECT"|"OPTIMIZE", "reason": "string", "content": "string" },
  "metaDescription": { "action": "PROTECT"|"OPTIMIZE", "reason": "string", "content": "string" },
  "h1Heading": { "action": "PROTECT"|"OPTIMIZE", "reason": "string", "content": "string" },
  "sections": [
    { "heading": "string", "action": "PROTECT"|"OPTIMIZE"|"EXPAND"|"ADD"|"REMOVE", "reason": "string", "contentGuidelines": "string" }
  ],
  "faqs": { "action": "PROTECT"|"OPTIMIZE"|"ADD", "reason": "string", "content": "string" },
  "internalLinks": { "action": "PROTECT"|"OPTIMIZE"|"ADD", "reason": "string", "content": "string" },
  "recommendedAction": "KEEP"|"OPTIMIZE"|"MONITOR"|"CONSOLIDATE"|"MANUAL_REVIEW"
}`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const text = result.response.text();
    const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const parsed: SeoStrategy = JSON.parse(cleanedText);

    // Programmatic enforcement: If research flagged high cannibalization or manual review, enforce consistency
    if (isHighCannibalization) {
      parsed.recommendedAction = 'MANUAL_REVIEW';
      parsed.manualReviewRequired = true;
      if (!parsed.competingPagesAnalysis) {
        parsed.competingPagesAnalysis = `Found ${research.cannibalizationRisk.competingPages.length} competing pages in DB targeting this entity: ${research.cannibalizationRisk.competingPages.map(p => `${p.title} (${p.type})`).join(', ')}. Admin manual review required to select primary page before generation.`;
      }
      
      // Clean up any rogue "New page" phrases from component reasons
      const sanitizeReason = (r?: string) => {
        if (!r) return 'Cannibalization conflict detected. Awaiting admin decision on primary page.';
        return r.replace(/new page,?\s*(needs|requires)?/gi, 'Manual review required: multiple competing pages detected. ');
      };
      if (parsed.title) parsed.title.reason = sanitizeReason(parsed.title.reason);
      if (parsed.metaDescription) parsed.metaDescription.reason = sanitizeReason(parsed.metaDescription.reason);
      if (parsed.h1Heading) parsed.h1Heading.reason = sanitizeReason(parsed.h1Heading.reason);
    }

    return parsed;
  } catch (error) {
    console.error("SEO Strategy Engine Error:", error);
    throw error;
  }
}
