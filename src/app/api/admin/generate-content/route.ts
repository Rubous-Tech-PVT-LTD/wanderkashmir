import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

export const maxDuration = 300; // 5 minutes max duration for LLM processing

// Helper to get platform-specific instructions and JSON schema
function getPlatformPrompt(platform: string) {
  switch (platform) {
    case 'instagram':
      return `Generate an Instagram Carousel (10 Slides).
Each slide must have: slideNumber, title, body (30-60 words), and imagePrompt.
Also generate: caption, hashtags, and cta.
The carousel should educate users.
Image prompts rule: Ultra realistic, Travel photography, Golden hour lighting, Professional DSLR, No text inside image, No watermark, No logo, 4K, 9:16, Highly detailed.
Return JSON format: { "slides": [{ "slideNumber": number, "title": string, "body": string, "imagePrompt": string }], "caption": string, "hashtags": string[], "cta": string }`;
    
    case 'facebook':
      return `Generate a Facebook Carousel (10 Slides).
Each slide must have: slideNumber, title, body, and imagePrompt.
Also generate: caption (longer than Instagram), hashtags, and cta.
Image prompts rule: Ultra realistic, Travel photography, Golden hour lighting, Professional DSLR, No text inside image, No watermark, No logo, 4K, Highly detailed.
Return JSON format: { "slides": [{ "slideNumber": number, "title": string, "body": string, "imagePrompt": string }], "caption": string, "hashtags": string[], "cta": string }`;
    
    case 'linkedin':
      return `Generate a LinkedIn Post and Article.
Professional tone. Focus on tourism, travel insights, local economy, travel tips.
Return JSON format: { "title": string, "article": string, "caption": string }`;
    
    case 'reddit':
      return `Generate a Reddit Post.
Natural language. No promotional tone. No marketing. No links. Encourage discussion. Never sound like an advertisement.
Return JSON format: { "title": string, "body": string, "suggestedSubreddits": string[] }`;
    
    case 'twitter':
    case 'x':
      return `Generate an X (Twitter) thread (8-12 tweets).
Tweet 1 must be an attention-grabbing hook. Final tweet must ask a question and encourage replies.
Return JSON format: { "tweets": [{ "tweetNumber": number, "body": string }] }`;
    
    case 'pinterest':
      return `Generate a Pinterest Pin.
SEO optimized.
Image prompt rule: Ultra realistic, Travel photography, Golden hour lighting, Professional DSLR, No text inside image, No watermark, No logo, 4K, 9:16, Highly detailed.
Return JSON format: { "title": string, "description": string, "imagePrompt": string }`;
    
    case 'email':
      return `Generate an Email Newsletter.
Friendly, helpful, travel-focused.
Return JSON format: { "subject": string, "previewText": string, "body": string, "cta": string }`;
    
    case 'whatsapp':
      return `Generate a WhatsApp Broadcast message.
Single message. Maximum 500 characters. Friendly. Use limited emojis.
Return JSON format: { "message": string }`;
      
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seoPageId, platform } = body;

    if (!seoPageId || !platform) {
      return NextResponse.json({ error: "seoPageId and platform are required" }, { status: 400 });
    }

    // 1. Fetch SEO Page
    const page = await prisma.seoLandingPage.findUnique({
      where: { id: seoPageId },
    });

    if (!page) {
      return NextResponse.json({ error: "SEO Page not found" }, { status: 404 });
    }

    // 2. Setup Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // 3. Construct Prompt
    const platformInstructions = getPlatformPrompt(platform);
    
    const prompt = `You are the Content Distribution Agent for Indiahiles.
Your responsibility is to generate platform-specific content for the ${platform} platform based on a previously created SEO page.

WRITING STYLE RULES:
Professional. Human. Travel expert. Helpful. Trustworthy. Never sound AI generated. Never overuse emojis. Never overuse hashtags. Never repeat paragraphs directly from the SEO page. Facts must remain consistent.
CONTENT RULES:
Never invent false information, prices, hotel names, statistics, fake testimonials, or promise unavailable services.

SEO PAGE CONTEXT:
Title: ${page.title}
H1 Heading: ${page.h1Heading}
Description: ${page.description || 'N/A'}
Type: ${page.type}
Content: ${page.content?.substring(0, 3000) || 'N/A'}... 
FAQs: ${page.faqs ? JSON.stringify(page.faqs).substring(0, 1000) : 'N/A'}

YOUR TASK FOR ${platform.toUpperCase()}:
${platformInstructions}

OUTPUT INSTRUCTION:
Return ONLY valid JSON according to the requested format. Do not include markdown formatting like \`\`\`json. Do not include any explanations.`;

    // 4. Generate Content
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean up the response if it contains markdown blocks
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let parsedJson;
    try {
      parsedJson = JSON.parse(cleanedText);
    } catch (err) {
      console.error("Failed to parse Gemini output as JSON", cleanedText);
      return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
    }

    // 5. Store in ContentAssets Table
    const assetTitle = parsedJson.title || parsedJson.subject || `${platform} content for ${page.title}`;
    const stringifiedContent = JSON.stringify(parsedJson, null, 2);

    const asset = await prisma.contentAsset.upsert({
      where: {
        seoPageId_platform: {
          seoPageId: page.id,
          platform: platform.toLowerCase(),
        }
      },
      update: {
        title: assetTitle,
        content: stringifiedContent, 
        jsonData: parsedJson,        
        contentType: platform,
        publishStatus: "Draft",
      },
      create: {
        seoPageId: page.id,
        platform: platform.toLowerCase(),
        title: assetTitle,
        content: stringifiedContent,
        jsonData: parsedJson,
        contentType: platform,
        publishStatus: "Draft",
      }
    });

    return NextResponse.json({ success: true, asset });
  } catch (error: any) {
    console.error(`Content Agent Error [${error.message}]`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
