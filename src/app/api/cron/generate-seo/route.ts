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

  try {
    // 3. Fetch existing slugs from the database to avoid duplicates
    const existingPages = await prisma.seoLandingPage.findMany({
      select: { slug: true }
    });
    const existingSlugs = existingPages.map(p => p.slug);

    // 4. Construct the Prompt for Gemini
    const prompt = `
    You are an expert SEO copywriter for "WanderKashmir", a premium travel platform in Kashmir.
    Your task is to generate exactly 1 unique, highly-searched SEO landing page for a Kashmir tourist route or homestay location.
    
    IMPORTANT RULES:
    1. Do NOT use any of these existing routes: ${existingSlugs.join(", ")}
    2. Pick a very popular, high-traffic route (e.g., "pahalgam-to-betaab-valley-taxi", "homestays-in-doodhpathri", "srinagar-airport-to-sonamarg-cab").
    3. The response MUST be a valid JSON object without any markdown wrapping.
    
    JSON STRUCTURE:
    {
      "slug": "the-url-slug-in-kebab-case",
      "type": "TAXI" | "HOMESTAY",
      "title": "SEO Meta Title (50-60 characters, include keywords like Book, Cab, Fare or Homestay)",
      "description": "Meta description (150-160 chars, compelling for CTR)",
      "h1Heading": "The main H1 heading for the page",
      "content": "A detailed 2-3 paragraph SEO optimized content written in Markdown format. Mention WanderKashmir, safety, pricing, and scenic views.",
      "faqs": [
        { "question": "Question 1", "answer": "Answer 1" },
        { "question": "Question 2", "answer": "Answer 2" },
        { "question": "Question 3", "answer": "Answer 3" }
      ]
    }
    `;

    // 5. Generate content with Gemini
    const result = await model.generateContent(prompt);
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
        imageUrl: parsedData.type === "HOMESTAY" 
          ? "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800" 
          : "https://images.unsplash.com/photo-1513568853683-146d9a109a96?auto=format&fit=crop&q=80&w=800"
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
