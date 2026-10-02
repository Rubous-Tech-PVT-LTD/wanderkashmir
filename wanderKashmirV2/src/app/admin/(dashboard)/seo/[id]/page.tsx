import { notFound } from "next/navigation";
import { getAdminSeoPageById } from "@/lib/admin/seo";
import SeoDetailForm from "@/components/admin/seo/SeoDetailForm";

export const revalidate = 0;

interface SeoDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SeoDetailPage({ params }: SeoDetailPageProps) {
  const { id } = await params;
  const page = await getAdminSeoPageById(id);

  if (!page) {
    notFound();
  }

  return (
    <SeoDetailForm
      page={{
        id: page.id,
        slug: page.slug,
        type: page.type,
        title: page.title,
        description: page.description,
        h1Heading: page.h1Heading,
        content: page.content,
        imageUrl: page.imageUrl,
        workflowState: page.workflowState,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        seoResearch: page.seoResearch,
        seoStrategy: page.seoStrategy,
        validationReport: page.validationReport,
        gscInitialMetrics: page.gscInitialMetrics,
        places: page.places,
      }}
    />
  );
}
