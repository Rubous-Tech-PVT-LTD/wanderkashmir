import { getAvailableToursForExperience } from "@/lib/admin/experiences";
import ExperienceForm from "@/components/admin/experiences/ExperienceForm";

export const revalidate = 0;

export default async function NewExperiencePage() {
  const availableTours = await getAvailableToursForExperience();

  return <ExperienceForm availableTours={availableTours} />;
}
