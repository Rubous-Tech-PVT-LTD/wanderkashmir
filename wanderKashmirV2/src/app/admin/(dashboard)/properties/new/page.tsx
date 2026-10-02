import { getVendorsForSelection } from "@/lib/admin/properties";
import PropertyForm from "@/components/admin/properties/PropertyForm";

export const revalidate = 0;

export default async function NewPropertyPage() {
  const vendors = await getVendorsForSelection();

  return <PropertyForm vendors={vendors} isEdit={false} />;
}
