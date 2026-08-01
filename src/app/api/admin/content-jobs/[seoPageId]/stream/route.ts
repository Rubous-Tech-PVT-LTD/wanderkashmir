import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// SSE endpoint to track job progress for a specific SEO Page
export async function GET(
  request: Request,
  { params }: { params: Promise<{ seoPageId: string }> }
) {
  const { seoPageId } = await params;

  if (!seoPageId) {
    return NextResponse.json({ error: "seoPageId is required" }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isConnected = true;

      const pushUpdate = async () => {
        if (!isConnected) return;
        try {
          // Fetch current job status ordered by descending creation
          const jobs = await prisma.contentGenerationJob.findMany({
            where: { seoLandingPageId: seoPageId },
            orderBy: { createdAt: 'desc' }
          });
          
          const data = JSON.stringify(jobs);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          
          // Check if all jobs are finished (COMPLETED or FAILED) to eventually close the stream, 
          // or we just let the client close it. We'll let the client close it.
        } catch (err) {
          console.error("SSE Poll error:", err);
        }
      };

      // Poll every 1.5 seconds
      const interval = setInterval(pushUpdate, 1500);

      // Push an immediate update
      await pushUpdate();

      // Handle stream close
      request.signal.addEventListener("abort", () => {
        isConnected = false;
        clearInterval(interval);
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
