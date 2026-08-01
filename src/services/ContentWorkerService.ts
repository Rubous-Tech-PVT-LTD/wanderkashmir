import { ContentJobRepository } from "@/repositories/ContentJobRepository";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

export class ContentWorkerService {
  static async processJob(jobId: string, options: any = {}) {
    const job = await ContentJobRepository.getJob(jobId);
    if (!job || job.status !== "PENDING") return { success: false, error: "Invalid or already processed job" };

    try {
      await ContentJobRepository.updateJobProgress(jobId, 10, "GENERATING");
      
      const page = await prisma.seoLandingPage.findUnique({ where: { id: job.seoLandingPageId } });
      if (!page) throw new Error("SEO Page not found");

      await ContentJobRepository.updateJobProgress(jobId, 30, "GENERATING");

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY missing");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      const prompt = this.buildPrompt(job.platform, page, options);
      
      await ContentJobRepository.updateJobProgress(jobId, 50, "GENERATING");

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      await ContentJobRepository.updateJobProgress(jobId, 80, "GENERATING");

      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedJson = JSON.parse(cleanedText);

      // Save to ContentAssets
      const assetTitle = parsedJson.title || parsedJson.subject || `${job.platform} content for ${page.title}`;
      let stringifiedContent = JSON.stringify(parsedJson, null, 2);

      const existingAsset = await prisma.contentAsset.findUnique({
        where: { seoPageId_platform: { seoPageId: page.id, platform: job.platform.toLowerCase() } }
      });

      // If this was a granular regeneration for a specific slide, we splice the newly generated slide into the existing JSON array.
      if (options.regenerateSlideIndex !== undefined && existingAsset && existingAsset.jsonData) {
        const currentData: any = existingAsset.jsonData;
        if (currentData.slides && parsedJson.slides && parsedJson.slides.length > 0) {
          // Splice in the single regenerated slide. (Gemini may return an array of 1, or try to return 5 but we told it to only focus on 1)
          // We take the first slide from the result and place it at the requested index.
          currentData.slides[options.regenerateSlideIndex] = parsedJson.slides[0];
          parsedJson.slides = currentData.slides;
          stringifiedContent = JSON.stringify(parsedJson, null, 2);
        }
      }

      if (existingAsset) {
        await prisma.contentAsset.update({
          where: { id: existingAsset.id },
          data: {
            title: assetTitle,
            content: stringifiedContent, 
            jsonData: parsedJson,
            publishStatus: "Draft",
          }
        });
      } else {
        await prisma.contentAsset.create({
          data: {
            seoPageId: page.id,
            platform: job.platform.toLowerCase(),
            title: assetTitle,
            content: stringifiedContent,
            jsonData: parsedJson,
            contentType: job.platform,
            publishStatus: "Draft",
          }
        });
      }

      // Update Audit Log
      const asset = await prisma.contentAsset.findUnique({ where: { seoPageId_platform: { seoPageId: page.id, platform: job.platform.toLowerCase() } } });
      if (asset) {
        await prisma.contentAuditLog.create({
          data: { assetId: asset.id, action: "Generated", user: "System" }
        });
      }

      await ContentJobRepository.updateJobProgress(jobId, 100, "COMPLETED");
      return { success: true };
    } catch (error: any) {
      await ContentJobRepository.updateJobProgress(jobId, 0, "FAILED", error.message);
      return { success: false, error: error.message };
    }
  }

  private static buildPrompt(platform: string, page: any, options: any = {}) {
    let platformInstructions = "";
    
    // Granular Regeneration Context
    const granularInstruction = options.regenerateSlideIndex !== undefined
      ? `\n\nCRITICAL INSTRUCTION: You are ONLY regenerating Slide ${options.regenerateSlideIndex + 1}. Return a JSON object with a "slides" array containing EXACTLY ONE slide (the regenerated slide). Do not return the other slides. Do not return caption or hashtags. Maintain the tone and context of the carousel.` 
      : "";

    switch (platform) {
      case 'instagram':
        platformInstructions = `Generate an Instagram Carousel (Exactly 5 Slides).
Each slide must have: slideNumber, title, body (maximum 40-50 words), and imagePrompt.
The 5th (final) slide MUST contain a Call To Action (CTA) encouraging users to save, share, or visit Wander Kashmir.
Also generate: caption, hashtags, and cta.
The carousel should educate users.
Image prompts rule: Ultra realistic, Travel photography, Golden hour lighting, Professional DSLR, No text inside image, No watermark, No logo, 4K, 9:16, Highly detailed.
Return JSON format: { "slides": [{ "slideNumber": number, "title": string, "body": string, "imagePrompt": string }], "caption": string, "hashtags": string[], "cta": string }${granularInstruction}`;
        break;
      case 'facebook':
        platformInstructions = `Generate a Facebook Carousel (Exactly 5 Slides).
Each slide must have: slideNumber, title, body (maximum 40-50 words), and imagePrompt.
The 5th (final) slide MUST contain a Call To Action (CTA) encouraging users to save, share, or visit Wander Kashmir.
Also generate: caption (longer than Instagram), hashtags, and cta.
Image prompts rule: Ultra realistic, Travel photography, Golden hour lighting, Professional DSLR, No text inside image, No watermark, No logo, 4K, Highly detailed.
Return JSON format: { "slides": [{ "slideNumber": number, "title": string, "body": string, "imagePrompt": string }], "caption": string, "hashtags": string[], "cta": string }${granularInstruction}`;
        break;
      case 'linkedin':
        platformInstructions = `Generate a LinkedIn Post and Article.
Professional tone. Focus on tourism, travel insights, local economy, travel tips.
Return JSON format: { "title": string, "article": string, "caption": string }`;
        break;
      case 'reddit':
        platformInstructions = `Generate a Reddit Post.
Natural language. No promotional tone. No marketing. No links. Encourage discussion. Never sound like an advertisement.
Return JSON format: { "title": string, "body": string, "suggestedSubreddits": string[] }`;
        break;
      case 'twitter':
      case 'x':
        platformInstructions = `Generate an X (Twitter) thread (8-12 tweets).
Tweet 1 must be an attention-grabbing hook. Final tweet must ask a question and encourage replies.
Return JSON format: { "tweets": [{ "tweetNumber": number, "body": string }] }`;
        break;
      case 'pinterest':
        platformInstructions = `Generate a Pinterest Pin.
SEO optimized.
Image prompt rule: Ultra realistic, Travel photography, Golden hour lighting, Professional DSLR, No text inside image, No watermark, No logo, 4K, 9:16, Highly detailed.
Return JSON format: { "title": string, "description": string, "imagePrompt": string }`;
        break;
      case 'email':
        platformInstructions = `Generate an Email Newsletter.
Friendly, helpful, travel-focused.
Return JSON format: { "subject": string, "previewText": string, "body": string, "cta": string }`;
        break;
      case 'whatsapp':
        platformInstructions = `Generate a WhatsApp Broadcast message.
Single message. Maximum 500 characters. Friendly. Use limited emojis.
Return JSON format: { "message": string }`;
        break;
      default:
        platformInstructions = `Generate content for ${platform}. Return JSON: { "content": string }`;
    }
    
    return `You are the Content Distribution Agent for Wander Kashmir.
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
  }
}
