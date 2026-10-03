import BulkEmailsClient from "@/components/admin/emails/BulkEmailsClient";

export const metadata = {
  title: "Bulk Email Broadcast Studio | WanderKashmir Admin",
};

export default function AdminBulkEmailsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      <BulkEmailsClient />
    </div>
  );
}
