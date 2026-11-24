import { getAdminLeads } from "@/lib/admin/data";
import QuickLeadFormModal from "@/components/admin/leads/QuickLeadFormModal";
import LeadsTableClient from "@/components/admin/leads/LeadsTableClient";
import { AdminPageHeader } from "@/components/admin/ui";

export const revalidate = 0;

export default async function AdminLeadsPage() {
  const leads = await getAdminLeads(100);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customer Leads"
        subtitle="Inbound trip inquiries from the website, custom itinerary builder, and WhatsApp."
        actions={<QuickLeadFormModal />}
      />

      <LeadsTableClient initialLeads={leads} />
    </div>
  );
}
