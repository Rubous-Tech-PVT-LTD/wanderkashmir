import { getAdminTravelStylesList } from "@/lib/admin/travelStyles";
import TravelStylesListClient from "@/components/admin/travelStyles/TravelStylesListClient";

export const revalidate = 0; // Fresh admin data on every request

export default async function AdminTravelStylesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.search || "";

  const styles = await getAdminTravelStylesList({ search });

  return <TravelStylesListClient styles={styles} currentSearch={search} />;
}
