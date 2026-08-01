import prisma from "@/lib/prisma";

export class ContentJobRepository {
  static async createJobs(seoLandingPageId: string, platforms: string[]) {
    const jobs = await Promise.all(
      platforms.map(platform =>
        prisma.contentGenerationJob.create({
          data: {
            seoLandingPageId,
            platform,
            status: "PENDING",
            progress: 0,
          },
        })
      )
    );
    return jobs;
  }

  static async getJob(id: string) {
    return prisma.contentGenerationJob.findUnique({ where: { id } });
  }

  static async getJobsForPage(seoLandingPageId: string) {
    return prisma.contentGenerationJob.findMany({
      where: { seoLandingPageId },
      orderBy: { createdAt: "desc" }
    });
  }

  static async updateJobProgress(id: string, progress: number, status: string, error?: string) {
    const data: any = { progress, status };
    if (status === 'GENERATING' && progress === 5) data.startedAt = new Date();
    if (status === 'COMPLETED' || status === 'FAILED') data.finishedAt = new Date();
    if (error) data.error = error;

    return prisma.contentGenerationJob.update({
      where: { id },
      data,
    });
  }
}
