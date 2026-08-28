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

  const prompt = `You are an expert SEO strategist and Content Director for WanderKashmir.
Your task is to analyze real Google Search Console data, Keyword Research, and SERP Analysis to generate a highly targeted SEO Strategy.

TARGET: ${research.target}
IS EXISTING PAGE: ${research.isExistingPage}
SEARCH INTENT: ${research.searchIntent}
CANNIBALIZATION RISK: ${research.cannibalizationRisk.status}

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
3. If Keyword Research or SERP Research is 'UNAVAILABLE', base your strategy solely on GSC data and Intent analysis. Do NOT fabricate missing metrics.
4. If Cannibalization Risk is HIGH_RISK, you MUST recommend 'CONSOLIDATE' or 'MANUAL_REVIEW', and advise the writer to pivot the intent to avoid competing with ${JSON.stringify(research.cannibalizationRisk.competingPages)}.
5. For SERP Analysis: Look for common topics and content types. Use these to recommend new sections (EXPAND) or FAQ additions (ADD), but DO NOT copy competitors exactly.
6. For Keyword Research: Use related keywords to suggest semantic variations for headings, but do NOT recommend keyword stuffing.

OUTPUT JSON FORMAT ONLY. Do not include markdown blocks.
{
  "primaryTopic": "string",
  "queriesToProtect": ["string"],
  "queriesToImprove": ["string"],
  "title": { "action": "PROTECT"|"OPTIMIZE", "reason": "string", "content": "string" },
  "metaDescription": { "action": "PROTECT"|"OPTIMIZE", "reason": "string", "content": "string" },
  "h1Heading": { "action": "PROTECT"|"OPTIMIZE", "reason": "string", "content": "string" },
  "sections": [
    { "heading": "string", "action": "PROTECT"|"OPTIMIZE"|"EXPAND"|"ADD"|"REMOVE", "reason": "string", "contentGuidelines": "string" }
  ],
  "faqs": { "action": "PROTECT"|"OPTIMIZE"|"ADD", "reason": "string", "content": "string" },
  "internalLinks": { "action": "PROTECT"|"OPTIMIZE"|"ADD", "reason": "string", "content": "string" },
  "recommendedAction": "KEEP"|"OPTIMIZE"|"MONITOR"|"CONSOLIDATE"
}`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const text = result.response.text();
    const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("SEO Strategy Engine Error:", error);
    throw error;
  }
}
