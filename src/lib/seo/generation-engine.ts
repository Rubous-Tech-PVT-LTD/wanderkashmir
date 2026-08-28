import { GoogleGenerativeAI } from "@google/generative-ai";
import { SeoResearch, SeoStrategy } from "./types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function generateSeoContent(
  research: SeoResearch,
  strategy: SeoStrategy,
  existingContent?: { title?: string; h1Heading?: string; description?: string; content?: string; faqs?: any[] }
): Promise<{ title: string; h1Heading: string; description: string; content: string; faqs: any[] }> {
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  // Server-side guard: Block generation if manual review is required and no admin decision exists
  if (
    (research.cannibalizationRisk?.status === 'HIGH_RISK' ||
     strategy.recommendedAction === 'MANUAL_REVIEW' ||
     strategy.manualReviewRequired) &&
    !strategy.adminDecision
  ) {
    throw new Error("Generation blocked: Manual Review is required. Admin must select a decision (e.g. Primary Page, Consolidate, Create New) before content generation.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // 1. Fetch Verified Entity Context
  let verifiedEntityContext = "";
  try {
    const property = await prisma.property.findFirst({
      where: { name: { contains: research.target, mode: "insensitive" } },
      select: { name: true, location: true, pricePerNight: true, amenities: true, faqs: true }
    });
    if (property) {
      verifiedEntityContext = `\nVERIFIED DATABASE FACTS (Use this real data instead of inventing):\n${JSON.stringify(property, null, 2)}\n`;
    }
  } catch (e) {
    console.warn("Failed to fetch verified entity context:", e);
  }

  const prompt = `
You are a world-class SEO copywriter and local travel expert for "WanderKashmir".
Your task is to generate high-converting SEO content strictly following the provided SEO Strategy.

CONTEXT:
Target: ${research.target}
Page Type Context: ${research.pageType}
Is Existing Page: ${research.isExistingPage}

SEO STRATEGY:
${JSON.stringify(strategy, null, 2)}

${existingContent ? `EXISTING CONTENT:\n${JSON.stringify(existingContent, null, 2)}\n` : ''}${verifiedEntityContext}
RULES:
1. STRICTLY follow the component-level actions from the strategy (PROTECT, OPTIMIZE, EXPAND, ADD).
2. If a component (e.g., title, h1Heading, metaDescription) has action "PROTECT", you MUST output exactly "[RETAIN EXISTING]" for that field. Do not rewrite it.
3. If sections are protected, output "[RETAIN EXISTING]" for those sections in the content block, and only append/modify what is explicitly requested.
4. STRICTLY enforce heading hierarchy: Strategy H2s MUST remain H2s (##). Do not elevate them to H1. The H1 is reserved for the page title only.
3. Ensure natural semantic coverage. Write for users first. Avoid keyword stuffing or repetitive exact-match insertion of the primary keyword.
4. Content must be rich Markdown (H2, H3, bullet points, bold text).
5. Do NOT output a single wall of text. Use double newlines between paragraphs.
6. NEVER generate placeholders like [phone], [email], [contact], or hypothetical names. If required factual data is missing, either omit the claim or write naturally without placeholders.
7. NEVER invent false information, prices, distances, or amenities. Stick to known facts about Kashmir or the VERIFIED DATABASE FACTS provided.
8. The tone must be Professional, Human, and Helpful. Never sound AI-generated.

OUTPUT REQUIREMENT:
Return ONLY valid JSON matching this exact structure, with no markdown formatting (\`\`\`json) and no explanations.
{
  "title": "Optimized meta title from strategy",
  "description": "Optimized meta description from strategy",
  "h1Heading": "Engaging H1 heading",
  "content": "Full markdown content body",
  "faqs": [
    { "question": "Question", "answer": "Answer" }
  ]
}
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const text = result.response.text();
    const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const generated = JSON.parse(cleanedText);

    // Stitch [RETAIN EXISTING] back together
    if (existingContent) {
      if (generated.title === '[RETAIN EXISTING]') generated.title = existingContent.title || '';
      if (generated.h1Heading === '[RETAIN EXISTING]') generated.h1Heading = existingContent.h1Heading || '';
      if (generated.description === '[RETAIN EXISTING]') generated.description = existingContent.description || '';
      
      // For content, if it just says [RETAIN EXISTING], keep the whole thing. If it's a mix, the AI should have handled it.
      if (generated.content === '[RETAIN EXISTING]') generated.content = existingContent.content || '';
      
      if (generated.faqs && typeof generated.faqs === 'string' && generated.faqs === '[RETAIN EXISTING]') {
         generated.faqs = existingContent.faqs || [];
      }
    }

    return generated;
  } catch (error) {
    console.error("Generation API failed, rate limit?", error);
    throw error;
  }
}
