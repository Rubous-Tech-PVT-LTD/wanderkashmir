import { getAdminSitePopupsAction } from "@/actions/adminSitePopups";
import SitePopupsClient from "@/components/admin/popups/SitePopupsClient";

export const metadata = {
  title: "Site Popups & Promotions | WanderKashmir Admin",
};

export default async function AdminSitePopupsPage() {
  const res = await getAdminSitePopupsAction();
  const popups = res.data?.popups || [];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      <SitePopupsClient initialPopups={popups} />
    </div>
  );
}
