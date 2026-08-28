import { GoogleGenerativeAI } from "@google/generative-ai";
import { SeoStrategy } from "./types";

export interface ValidationReport {
  status: 'PASS' | 'FIX' | 'FLAG';
  issues: string[];
  keywordDensity: number;
}

export async function validateSeoContent(
  strategy: SeoStrategy,
  generatedContent: string
): Promise<ValidationReport> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Use the supported model

  const prompt = `
You are the Chief SEO Auditor for WanderKashmir.
Your task is to validate the newly generated SEO content against the AI Strategy.

STRATEGY:
${JSON.stringify(strategy, null, 2)}

GENERATED CONTENT:
${generatedContent}

VALIDATION CRITERIA:
1. Did it follow the recommended sections?
2. Did it protect the existing high-performing queries?
3. Is there any evidence of keyword stuffing? (Primary keyword used unnaturally often)
4. Are there any obviously fake facts (e.g. fake distances, fake phone numbers)?
5. Does the content fulfill the Search Intent?

OUTPUT REQUIREMENT:
Return ONLY valid JSON matching this exact structure, with no markdown formatting (\`\`\`json) and no explanations.
{
  "status": "PASS" | "FIX" | "FLAG",
  "issues": ["string"],
  "keywordDensity": number
}

Rule: If there are major violations, status must be FLAG or FIX. If it is high quality, status must be PASS.
`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });
  
  const text = result.response.text();
  const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  return JSON.parse(cleanedText) as ValidationReport;
}
