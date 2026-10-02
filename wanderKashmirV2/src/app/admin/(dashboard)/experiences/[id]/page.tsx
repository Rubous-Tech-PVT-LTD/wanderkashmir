import { notFound } from "next/navigation";
import { getAdminExperienceById, getAvailableToursForExperience } from "@/lib/admin/experiences";
import ExperienceForm from "@/components/admin/experiences/ExperienceForm";

export const revalidate = 0;

interface EditExperiencePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExperiencePage({ params }: EditExperiencePageProps) {
  const { id } = await params;
  const [experience, availableTours] = await Promise.all([
    getAdminExperienceById(id),
    getAvailableToursForExperience(),
  ]);

  if (!experience) {
    notFound();
  }

  return (
    <ExperienceForm
      initialData={{
        id: experience.id,
        title: experience.title,
        slug: experience.slug,
        destination: experience.destination,
        duration: experience.duration,
        basePrice: experience.basePrice,
        status: experience.status,
        description: experience.description ?? "",
        images: experience.images,
        tourExperiences: experience.tourExperiences,
      }}
      availableTours={availableTours}
    />
  );
}
