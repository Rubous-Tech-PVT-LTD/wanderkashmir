import { getAdminUsersList, getAdminUserStats } from "@/lib/admin/users";
import UsersListClient from "@/components/admin/users/UsersListClient";

export const revalidate = 0;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    role?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10) || 1;
  const search = params.search || "";
  const status = (params.status?.toUpperCase() || "ALL") as "ALL" | "ACTIVE" | "BANNED";
  const role = (params.role?.toUpperCase() || "ALL") as "ALL" | "CUSTOMER" | "VENDOR" | "ADMIN";

  const [usersResult, stats] = await Promise.all([
    getAdminUsersList({
      search,
      status,
      role,
      page,
      limit: 15,
    }),
    getAdminUserStats(),
  ]);

  return (
    <UsersListClient
      users={usersResult.users}
      totalCount={usersResult.totalCount}
      currentPage={usersResult.page}
      totalPages={usersResult.totalPages}
      stats={stats}
      currentSearch={search}
      currentStatus={status}
      currentRole={role}
    />
  );
}
