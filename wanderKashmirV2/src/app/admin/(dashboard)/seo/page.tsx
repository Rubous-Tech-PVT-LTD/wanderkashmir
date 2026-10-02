import { Globe } from "lucide-react";
import MigrationPendingView from "@/components/admin/MigrationPendingView";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export default async function AdminSeoPage() {
  const [publishedPages, totalPages] = await Promise.all([
    prisma.seoLandingPage.count({ where: { workflowState: "PUBLISHED" } }),
    prisma.seoLandingPage.count(),
  ]);

  return (
    <MigrationPendingView
      title="SEO Engine & Intelligence"
      description="Automated content generation, programmatic landing pages, keyword tracking, and search indexing workflows are active in V1 and scheduled for V2 migration."
      icon={Globe}
      v1RouteName="V1 SEO Intelligence Tab"
      stats={[
        { label: "Published Pages", value: publishedPages },
        { label: "Total SEO Pages", value: totalPages },
      ]}
    />
  );
}
