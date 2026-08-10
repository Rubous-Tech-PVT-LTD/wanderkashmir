import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

export const maxDuration = 60; // Allow function to run up to 60 seconds

export async function GET(request: Request) {
  // 1. Authenticate the Cron request
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    // In production, require Vercel Cron Secret (but we'll allow local testing)
    // To be safe and since user might trigger manually in local, we just log a warning if it fails in dev.
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // 2. Setup Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key is missing" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const { searchParams } = new URL(request.url);
  const requestedTopic = searchParams.get('topic');

  try {
    // 3. Fetch existing slugs and ContentSettings from the database
    const settings = await prisma.contentSettings.findFirst();
    const systemRules = settings?.defaultPromptRules || "";

    const existingPages = await prisma.seoLandingPage.findMany({
      select: { slug: true }
    });
    const existingSlugs = existingPages.map(p => p.slug);

    const prompt = `
    You are a world-class SEO copywriter and local travel expert for "WanderKashmir", a premium travel platform in Kashmir.
    Your task is to generate exactly 1 unique, highly-searched, high-converting SEO landing page for a Kashmir tourist route, homestay location, or specific travel package.
    
    CRITICAL BRAND GUIDELINES FROM ADMIN:
    ${systemRules}

    IMPORTANT RULES:
    1. Do NOT use any of these existing routes: ${existingSlugs.join(", ")}
    2. BE CREATIVE AND NICHE. Target high-intent, low-competition keywords (e.g. "Srinagar to Gurez Valley taxi fare", "best homestays near Dal Lake for families").
    ${requestedTopic ? `3. THE USER EXPLICITLY REQUESTED THIS TOPIC/KEYWORD: "${requestedTopic}". You MUST strictly write the page targeting this keyword.` : ''}
    
    JSON STRUCTURE:
    {
      "slug": "the-url-slug-in-kebab-case",
      "type": "TAXI" | "HOMESTAY" | "DESTINATION",
      "title": "SEO Meta Title (50-60 characters, include power words, highly optimized for CTR)",
      "description": "Meta description (150-160 chars, include primary keyword, USP, and a strong Call-To-Action)",
      "h1Heading": "The main H1 heading for the page (Engaging and keyword-rich)",
      "content": "A highly structured, 800-1200 word SEO optimized article in rich Markdown format, strictly following the MakeMyTrip (MMT) SEO content style. YOU MUST INCLUDE: 1. A captivating introduction. 2. A 'Quick Facts / At a Glance' section using a Markdown table (e.g., Best Time to Visit, Ideal Duration, Nearest Airport, Weather). 3. 'Top Things to Do / Places to Visit' with detailed H3 subheadings and bullet points. 4. 'How to Reach' guide. 5. 'Best Time to Visit' detailed explanation. 6. Why book with WanderKashmir seamlessly integrated. CRITICAL: You MUST use double newlines (\\n\\n) between EVERY paragraph. You MUST use ## for main headings and ### for subheadings, with a blank line before and after each heading. Do NOT output a single wall of text.",
      "imagePrompt": "A highly descriptive 1-sentence prompt for an AI image generator to create a stunning, realistic, wide-angle cinematic photo for this page. (e.g. 'A cinematic golden hour shot of a traditional wooden homestay in Aru Valley surrounded by mist and pine trees, 8k resolution')",
      "faqs": [
        { "question": "Highly searched Question 1?", "answer": "Detailed Answer 1" },
        { "question": "Highly searched Question 2?", "answer": "Detailed Answer 2" },
        { "question": "Highly searched Question 3?", "answer": "Detailed Answer 3" },
        { "question": "Highly searched Question 4?", "answer": "Detailed Answer 4" }
      ]
    }
    `;

    // 5. Generate content with Gemini
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    const responseText = result.response.text();
    
    // Clean JSON string (remove markdown if Gemini ignores instructions)
    const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(cleanedText);

    // 6. Save to Database
    const newPage = await prisma.seoLandingPage.create({
      data: {
        slug: parsedData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        type: parsedData.type === "HOMESTAY" ? "HOMESTAY" : "TAXI",
        title: parsedData.title,
        description: parsedData.description,
        h1Heading: parsedData.h1Heading,
        content: parsedData.content,
        faqs: parsedData.faqs,
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(parsedData.imagePrompt || parsedData.title)}?width=800&height=400&nologo=true`
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully generated and published SEO page for: ${newPage.slug}`,
      page: newPage
    });

  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
