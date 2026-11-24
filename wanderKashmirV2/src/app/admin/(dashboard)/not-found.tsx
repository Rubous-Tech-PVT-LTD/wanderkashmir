import { AdminNotFoundCard } from "@/components/admin/ui";

export default function AdminDashboardNotFound() {
  return (
    <AdminNotFoundCard
      title="Page not found"
      description="The admin page or record you requested does not exist."
      backHref="/admin"
      backLabel="Return to Dashboard"
    />
  );
}

