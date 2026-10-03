import { notFound } from "next/navigation";
import { getAdminSeoPageById } from "@/lib/admin/seo";
import { getSeoResearchStudioData } from "@/lib/admin/seoStudio";
import SeoDetailForm from "@/components/admin/seo/SeoDetailForm";
import SeoResearchStudioClient from "@/components/admin/seo/SeoResearchStudioClient";

export const revalidate = 0;

interface SeoDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ studio?: string }>;
}

export default async function SeoDetailPage({
  params,
  searchParams,
}: SeoDetailPageProps) {
  const { id } = await params;
  const sParams = await searchParams;

  if (sParams.studio === "true") {
    const studioPayload = await getSeoResearchStudioData(id);
    if (!studioPayload) {
      notFound();
    }
    return <SeoResearchStudioClient payload={studioPayload} />;
  }

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
