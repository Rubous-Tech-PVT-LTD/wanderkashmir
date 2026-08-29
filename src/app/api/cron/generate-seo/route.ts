import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { runSeoResearch } from "@/lib/seo/research-engine";
import { generateSeoStrategy } from "@/lib/seo/strategy-engine";
import { generateSeoContent } from "@/lib/seo/generation-engine";
import { validateSeoContent } from "@/lib/seo/validation-engine";

export const maxDuration = 120; // AI processes can take time

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    let requestedTopic = searchParams.get('topic');
    let opportunityId = null;

    if (!requestedTopic) {
        // Fetch top non-blog opportunity
        const op = await prisma.seoOpportunity.findFirst({
            where: { type: 'CREATE', status: 'DISCOVERED', NOT: { topic: { contains: 'blog', mode: 'insensitive' } } },
            orderBy: { opportunityScore: 'desc' }
        });
        if (!op) {
            return NextResponse.json({ success: true, message: "No SEO opportunities found to generate." });
        }
        requestedTopic = op.topic;
        opportunityId = op.id;
    }

    // Determine Page Type based on Prioritized Intent Rules
    let pageType = "TAXI"; // Safe Fallback
    const lowerTopic = (requestedTopic as string).toLowerCase();

    // 1. General Roundup / Listicle Intent (BLOG)
    if (
      (lowerTopic.includes('best') || lowerTopic.includes('top') || lowerTopic.includes('cheap')) &&
      (lowerTopic.includes('hotels') || lowerTopic.includes('resorts') || lowerTopic.includes('places to stay'))
    ) {
      pageType = "BLOG";
    }
    // 2. Homestay (HOMESTAY)
    else if (lowerTopic.includes('homestay')) {
      pageType = "HOMESTAY";
    }
    // 3. Tour / Package (TOUR)
    else if (/\btour\b/.test(lowerTopic) || lowerTopic.includes('package')) {
      pageType = "TOUR";
    }
    // 4. Specific Entity / Destination Guide (DESTINATION)
    else if (
      lowerTopic.includes('hotel') || 
      lowerTopic.includes('resort') || 
      lowerTopic.includes('place') || 
      lowerTopic.includes('destination') || 
      lowerTopic.includes('sightseeing')
    ) {
      pageType = "DESTINATION";
    }
    // 5. Taxi / Cab (TAXI)
    else if (lowerTopic.includes('taxi') || lowerTopic.includes('cab') || lowerTopic.includes('transfer')) {
      pageType = "TAXI";
    }

    // 1. Research
    const research = await runSeoResearch(requestedTopic as string, pageType);
    
    // 2. Strategy
    const strategy = await generateSeoStrategy(research);
    
    // 3. Generate
    const generatedContent = await generateSeoContent(research, strategy);

    // 4. Validate
    const validation = await validateSeoContent(strategy, JSON.stringify(generatedContent, null, 2));

    if (validation.status !== 'PASS') {
        if (opportunityId) {
            await prisma.seoOpportunity.update({
                where: { id: opportunityId },
                data: { status: 'REJECTED' }
            });
        }
        return NextResponse.json({ success: false, message: "Validation Failed", issues: validation.issues });
    }

    // 5. Save as VALIDATED (Requires Admin Approval to go PUBLISHED)
    const newPage = await prisma.seoLandingPage.create({
      data: {
        slug: (requestedTopic as string).toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        type: pageType,
        title: generatedContent.title,
        description: generatedContent.description,
        h1Heading: generatedContent.h1Heading,
        content: generatedContent.content,
        faqs: generatedContent.faqs,
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(requestedTopic as string)}?width=800&height=400&nologo=true`,
        workflowState: "VALIDATED",
        seoResearch: research as any,
        seoStrategy: strategy as any,
        validationReport: validation as any
      }
    });

    if (opportunityId) {
        await prisma.seoOpportunity.update({
            where: { id: opportunityId },
            data: { status: 'VALIDATED' }
        });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully researched, generated, and VALIDATED SEO Page: ${newPage.slug}. Awaiting Admin Approval.`,
      pageId: newPage.id
    });

  } catch (error: any) {
    console.error("SEO Cron Pipeline Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
