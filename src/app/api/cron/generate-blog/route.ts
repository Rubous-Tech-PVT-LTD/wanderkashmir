import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

export const maxDuration = 60; // Allow function to run up to 60 seconds

export async function GET(request: Request) {
  // 1. Authenticate the Cron request
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
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
    // 3. Fetch existing slugs and ContentSettings
    const settings = await prisma.contentSettings.findFirst();
    const systemRules = settings?.defaultPromptRules || "";

    const existingPages = await prisma.seoLandingPage.findMany({
      select: { slug: true }
    });
    const existingSlugs = existingPages.map(p => p.slug);

    // 4. Construct Prompt
    const prompt = `
    You are a world-class Travel Blogger and Kashmir Destination Expert writing for "WanderKashmir", a premium travel platform.
    Your task is to generate exactly 1 unique, viral-worthy, and highly informative Travel Blog article about Kashmir tourism.
    
    CRITICAL BRAND GUIDELINES FROM ADMIN:
    ${systemRules}

    IMPORTANT RULES:
    1. Do NOT use any of these existing topics/slugs: ${existingSlugs.join(", ")}
    2. BE NICHE AND TRENDING. Write about trending topics like "Hidden winter cafes in Gulmarg", "Ultimate 5-day Kashmir itinerary for couples", "What to pack for Kashmir in December", etc.
    ${requestedTopic ? `3. THE USER EXPLICITLY REQUESTED THIS TOPIC/KEYWORD: "${requestedTopic}". You MUST strictly write the blog targeting this keyword.` : ''}
    
    JSON STRUCTURE:
    {
      "slug": "the-url-slug-in-kebab-case",
      "type": "BLOG",
      "title": "Clickable SEO Meta Title (50-60 chars, use numbers or emotional triggers)",
      "description": "Meta description (150-160 chars, hook the reader and include keywords)",
      "h1Heading": "Catchy and Viral H1 Title for the blog",
      "content": "An authoritative, 1000-1500 word blog post written in rich Markdown format, strictly following the MakeMyTrip (MMT) SEO content style. YOU MUST INCLUDE: 1. A 'Table of Contents' style summary at the top if applicable. 2. A 'Quick Information' markdown table (e.g., Ideal for, Best Time, Key Highlights). 3. Story-driven engaging content broken down with clear H2 (##) and H3 (###) subheadings. 4. Practical travel tips (budget estimates, what to pack, local etiquette). 5. Native mentions of booking taxis, homestays, or tours through 'WanderKashmir' seamlessly integrated as helpful resources, not just ads. CRITICAL: You MUST use double newlines (\\n\\n) between EVERY paragraph. You MUST use ## for main headings and ### for subheadings, with a blank line before and after each heading. Do NOT output a single wall of text.",
      "imagePrompt": "A highly descriptive 1-sentence prompt for an AI image generator to create a breathtaking cover photo for this blog. (e.g. 'A breathtaking, ultra-realistic landscape of Dal Lake in winter at sunrise with shikaras breaking the ice, 8k resolution, cinematic lighting')",
      "faqs": [
        { "question": "Commonly asked Question 1?", "answer": "Informative Answer 1" },
        { "question": "Commonly asked Question 2?", "answer": "Informative Answer 2" },
        { "question": "Commonly asked Question 3?", "answer": "Informative Answer 3" }
      ]
    }
    `;

    // 5. Generate content
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedText);

    // 6. Save to Database
    const newPage = await prisma.seoLandingPage.create({
      data: {
        slug: parsedData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        type: "BLOG",
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
      message: `Successfully generated BLOG: ${newPage.slug}`,
      page: newPage
    });

  } catch (error: any) {
    console.error("Blog Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
