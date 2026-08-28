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
        // Fetch top BLOG opportunity if none specified
        const op = await prisma.seoOpportunity.findFirst({
            where: { type: 'CREATE', status: 'DISCOVERED', topic: { contains: 'blog', mode: 'insensitive' } },
            orderBy: { opportunityScore: 'desc' }
        });
        if (!op) {
            return NextResponse.json({ success: true, message: "No blog opportunities found to generate." });
        }
        requestedTopic = op.topic;
        opportunityId = op.id;
    }

    // 1. Research
    const research = await runSeoResearch(requestedTopic as string, "BLOG");
    
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
        type: "BLOG",
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
      message: `Successfully researched, generated, and VALIDATED BLOG: ${newPage.slug}. Awaiting Admin Approval.`,
      pageId: newPage.id
    });

  } catch (error: any) {
    console.error("Blog Cron Pipeline Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
