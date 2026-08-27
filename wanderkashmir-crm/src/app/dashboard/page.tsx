import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import BADashboard from "@/components/dashboard/BADashboard";

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  // Route to the appropriate dashboard based on role
  if (session.role === 'CRM_ADMIN') {
    return <AdminDashboard session={session} />;
  }

  // Fallback to BA dashboard for BUSINESS_ASSOCIATE and others
  return <BADashboard session={session} />;
}
