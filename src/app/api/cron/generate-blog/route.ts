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

  try {
    // 3. Fetch existing slugs
    const existingPages = await prisma.seoLandingPage.findMany({
      select: { slug: true }
    });
    const existingSlugs = existingPages.map(p => p.slug);

    const blogTopics = [
      "Best time to visit", "Hidden gems in", "How to reach", 
      "Top cafes in", "Winter packing list for", "Summer itinerary for",
      "Adventure sports in", "Cultural guide to", "Budget travel in",
      "Luxury staycation in", "Photography spots in", "Local food in"
    ];
    const kashmirLocations = [
      "Srinagar", "Gulmarg", "Pahalgam", "Sonamarg", "Doodhpathri", "Gurez Valley"
    ];
    
    // Randomly pick a topic and location to inspire the AI
    const randomTopic = blogTopics[Math.floor(Math.random() * blogTopics.length)];
    const randomLocation = kashmirLocations[Math.floor(Math.random() * kashmirLocations.length)];
    const randomIdea = \`\${randomTopic} \${randomLocation}\`;

    // 4. Construct Prompt
    const prompt = \`
    You are an expert Travel Blogger for "WanderKashmir", a premium travel platform in Kashmir.
    Your task is to generate exactly 1 unique, highly-searched Travel Blog article for Kashmir tourism.
    
    IMPORTANT RULES:
    1. Do NOT use any of these existing topics/slugs: \${existingSlugs.join(", ")}
    2. BE CREATIVE. Invent a completely new, engaging blog topic. For example, you could write about: "\${randomIdea}". Do not just copy this exact idea, but use it as inspiration for a high-traffic travel article.
    3. The response MUST be a valid JSON object without any markdown wrapping.
    
    JSON STRUCTURE:
    {
      "slug": "the-url-slug-in-kebab-case",
      "type": "BLOG",
      "title": "SEO Meta Title (50-60 characters)",
      "description": "Meta description (150-160 chars, compelling for CTR)",
      "h1Heading": "The main H1 heading for the blog article",
      "content": "A detailed 4-5 paragraph SEO optimized content written in Markdown format. Make it an engaging article with headings. Mention WanderKashmir.",
      "faqs": [
        { "question": "Question 1", "answer": "Answer 1" },
        { "question": "Question 2", "answer": "Answer 2" }
      ]
    }
    `;

    // 5. Generate content
    const result = await model.generateContent(prompt);
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
        imageUrl: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=800"
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
