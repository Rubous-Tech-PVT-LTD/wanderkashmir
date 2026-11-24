"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Download,
  Eye,
  Shield,
  ShieldAlert,
  Lock,
  Users as UsersIcon,
  Loader2,
} from "lucide-react";
import { AdminUserItem, AdminUserStats } from "@/lib/admin/users";
import { banUserAction, unbanUserAction } from "@/actions/adminUsers";
import AddUserModal from "./AddUserModal";
import {
  AdminPageHeader,
  AdminStatStrip,
  AdminFilterBar,
  AdminToastBanner,
  AdminPagination,
  AdminEmptyState,
  AdminModal,
  ConfirmActionDialog,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

interface UsersListClientProps {
  users: AdminUserItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  stats: AdminUserStats;
  currentSearch: string;
  currentStatus: string;
  currentRole: string;
}

export default function UsersListClient({
  users,
  totalCount,
  currentPage,
  totalPages,
  stats,
  currentSearch,
  currentStatus,
  currentRole,
}: UsersListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { adminHref } = useAdminBasePath();
  const [isTransitionPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [banningUser, setBanningUser] = useState<AdminUserItem | null>(null);
  const [unbanningUser, setUnbanningUser] = useState<AdminUserItem | null>(null);

  const updateQuery = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === "" || val === "ALL") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${adminHref("/admin/users")}?${qs}` : adminHref("/admin/users"));
    });
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      if (currentSearch) params.set("search", currentSearch);
      if (currentStatus && currentStatus !== "ALL") params.set("status", currentStatus);
      if (currentRole && currentRole !== "ALL") params.set("role", currentRole);

      const res = await fetch(`/api/admin/users/export?${params.toString()}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wanderkashmir-users-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setFeedback({ type: "error", text: "Failed to export users CSV." });
    } finally {
      setIsExporting(false);
    }
  };

  const hasFilters = Boolean(currentSearch) || currentStatus !== "ALL" || currentRole !== "ALL";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users & Tourists"
        subtitle="Manage registered traveler accounts, vendor logins, and platform access controls."
        actions={
          <>
            <AddUserModal />
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-slate-500" />}
              <span>Export CSV</span>
            </button>
          </>
        }
      />

      <AdminStatStrip
        columns={4}
        items={[
          {
            label: "Total Accounts",
            value: stats.total,
            helper: `${stats.customers} tourists · ${stats.vendors} vendors`,
            active: currentStatus === "ALL" && currentRole === "ALL",
            onClick: () => updateQuery({ status: "ALL", role: "ALL", page: "1" }),
          },
          {
            label: "Active Users",
            value: stats.active,
            tone: "emerald",
            active: currentStatus === "ACTIVE",
            onClick: () => updateQuery({ status: currentStatus === "ACTIVE" ? "ALL" : "ACTIVE", page: "1" }),
          },
          {
            label: "Banned Accounts",
            value: stats.banned,
            tone: stats.banned > 0 ? "rose" : "default",
            active: currentStatus === "BANNED",
            onClick: () => updateQuery({ status: currentStatus === "BANNED" ? "ALL" : "BANNED", page: "1" }),
          },
          {
            label: "Admins",
            value: stats.admins,
            active: currentRole === "ADMIN",
            onClick: () => updateQuery({ role: currentRole === "ADMIN" ? "ALL" : "ADMIN", page: "1" }),
          },
        ]}
      />

      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      <AdminFilterBar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={() => updateQuery({ search: searchInput.trim(), page: "1" })}
        searchPlaceholder="Search by name, email, or phone..."
        hasActiveFilters={hasFilters}
        onReset={() => {
          setSearchInput("");
          router.push(adminHref("/admin/users"));
        }}
        filters={
          <>
            <select
              value={currentStatus}
              onChange={(e) => updateQuery({ status: e.target.value, page: "1" })}
              aria-label="Filter by account status"
              className="bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-700 focus:outline-hidden focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="BANNED">Banned</option>
            </select>

            <select
              value={currentRole}
              onChange={(e) => updateQuery({ role: e.target.value, page: "1" })}
              aria-label="Filter by role"
              className="bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-700 focus:outline-hidden focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="CUSTOMER">Tourists / Customers</option>
              <option value="VENDOR">Vendors</option>
              <option value="EDITOR">Editors</option>
              <option value="ADMIN">Admins</option>
            </select>
          </>
        }
      />

      <div className="bg-white border border-slate-200/90 rounded-md shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
        {users.length === 0 ? (
          <AdminEmptyState
            icon={<UsersIcon className="w-5 h-5" />}
            title="No users found"
            description="No accounts match the active search or filters."
            action={
              hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    router.push(adminHref("/admin/users"));
                  }}
                  className="px-3.5 py-2 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Reset Filters
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Contact</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Activity</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Joined</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isBanned = u.isBanned;
                  const isAdmin = u.role === "ADMIN";
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs shrink-0">
                            {u.image ? (
                              <Image src={u.image} alt={u.name || "User"} fill className="object-cover" sizes="32px" />
                            ) : (
                              (u.name || u.email || "?").charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="font-medium text-slate-900">{u.name || "Unnamed User"}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800">{u.email || "—"}</div>
                        <div className="text-[11px] text-slate-500">{u.phone || "—"}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80 text-[11px] font-medium">
                          {isAdmin && <Shield className="w-3 h-3 text-[var(--season-primary)]" />}
                          <span>{u.role}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                        {u.bookingsCount} booking(s) · {u.reviewsCount} review(s)
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={isBanned ? "BANNED" : "ACTIVE"} />
                      </td>

                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap tabular-nums">
                        {new Date(u.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                            title="View User"
                            aria-label={`View ${u.name || u.email || "user"}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isAdmin ? (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] text-slate-400"
                              title="Admin accounts cannot be banned here"
                            >
                              <Lock className="w-3 h-3" />
                              <span>Protected</span>
                            </span>
                          ) : isBanned ? (
                            <button
                              type="button"
                              onClick={() => setUnbanningUser(u)}
                              className="px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--season-primary-light)] hover:bg-[var(--season-primary)]/20 text-[var(--season-primary-hover)] border border-[var(--season-primary)]/25 cursor-pointer"
                            >
                              Unban
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setBanningUser(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                            >
                              <ShieldAlert className="w-3 h-3" />
                              <span>Ban</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          itemLabel="users"
          disabled={isTransitionPending}
          onPageChange={(page) => updateQuery({ page: String(page) })}
        />
      </div>

      {/* User Details Modal */}
      <AdminModal
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title={selectedUser?.name || "User Profile"}
        subtitle={selectedUser?.email || selectedUser?.phone || undefined}
        maxWidth="md"
        footer={
          <button
            type="button"
            onClick={() => setSelectedUser(null)}
            className="px-3.5 py-2 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            Close
          </button>
        }
      >
        {selectedUser && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-base shrink-0">
                {selectedUser.image ? (
                  <Image src={selectedUser.image} alt={selectedUser.name || "User"} fill className="object-cover" sizes="48px" />
                ) : (
                  (selectedUser.name || selectedUser.email || "?").charAt(0).toUpperCase()
                )}
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-slate-900 text-sm">
                  {selectedUser.name || "Unnamed User"}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                    {selectedUser.role}
                  </span>
                  <StatusBadge status={selectedUser.isBanned ? "BANNED" : "ACTIVE"} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-md bg-slate-50 border border-slate-200">
              <div>
                <div className="text-[11px] text-slate-500">Email</div>
                <div className="font-medium text-slate-900 mt-0.5 break-all">{selectedUser.email || "—"}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Phone</div>
                <div className="font-medium text-slate-900 mt-0.5">{selectedUser.phone || "—"}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Bookings</div>
                <div className="font-medium text-slate-900 mt-0.5">{selectedUser.bookingsCount}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Reviews</div>
                <div className="font-medium text-slate-900 mt-0.5">{selectedUser.reviewsCount}</div>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      <ConfirmActionDialog
        open={Boolean(banningUser)}
        onClose={() => setBanningUser(null)}
        title={`Ban "${banningUser?.name || banningUser?.email || "user"}"?`}
        description="Banning blocks this user from signing in or creating new bookings."
        confirmLabel="Ban Account"
        tone="danger"
        requireReason
        reasonLabel="Ban Reason"
        reasonPlaceholder="Provide a reason for banning this account..."
        onConfirm={async (reason) => {
          if (!banningUser) return;
          const res = await banUserAction(banningUser.id, reason || "");
          if (!res.success) throw new Error(res.error || "Failed to ban user.");
          setFeedback({ type: "success", text: "User account banned." });
          router.refresh();
        }}
      />

      <ConfirmActionDialog
        open={Boolean(unbanningUser)}
        onClose={() => setUnbanningUser(null)}
        title={`Unban "${unbanningUser?.name || unbanningUser?.email || "user"}"?`}
        description="Restores full login and booking access for this user account."
        confirmLabel="Unban Account"
        tone="primary"
        onConfirm={async () => {
          if (!unbanningUser) return;
          const res = await unbanUserAction(unbanningUser.id);
          if (!res.success) throw new Error(res.error || "Failed to unban user.");
          setFeedback({ type: "success", text: "User account restored." });
          router.refresh();
        }}
      />
    </div>
  );
}
