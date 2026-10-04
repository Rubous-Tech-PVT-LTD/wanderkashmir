"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  Shield,
  ShieldAlert,
  User as UserIcon,
  Phone,
  Mail,
  Calendar,
  X,
  Lock,
} from "lucide-react";
import {
  AdminUserItem,
  AdminUserStats,
  AdminUserDetail,
} from "@/lib/admin/users";
import { banUserAction, unbanUserAction } from "@/actions/adminUsers";

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
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [isExporting, setIsExporting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modals state
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [banningUser, setBanningUser] = useState<AdminUserItem | null>(null);
  const [banReason, setBanReason] = useState("");

  const updateQuery = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === "") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery({ search: searchInput, page: "1" });
  };

  const handleStatusChange = (status: string) => {
    updateQuery({ status: status === "ALL" ? undefined : status, page: "1" });
  };

  const handleRoleChange = (role: string) => {
    updateQuery({ role: role === "ALL" ? undefined : role, page: "1" });
  };

  // Ban confirmation
  const handleBanConfirm = async () => {
    if (!banningUser || !banReason.trim()) return;
    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const res = await banUserAction(banningUser.id, banReason.trim());
      if (res.success) {
        setActionSuccess(`User ${banningUser.name || banningUser.email} has been banned.`);
        setBanningUser(null);
        setBanReason("");
        router.refresh();
      } else {
        setActionError(res.error || "Failed to ban user.");
      }
    });
  };

  // Unban confirmation
  const handleUnban = async (user: AdminUserItem) => {
    if (!confirm(`Are you sure you want to unban ${user.name || user.email}?`)) return;
    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const res = await unbanUserAction(user.id);
      if (res.success) {
        setActionSuccess(`User ${user.name || user.email} has been unbanned.`);
        router.refresh();
      } else {
        setActionError(res.error || "Failed to unban user.");
      }
    });
  };

  // CSV Export
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
    } catch (e) {
      console.error(e);
      setActionError("Failed to export users CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Module #17
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Users & Tourists</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage customer accounts, review booking activity, and enforce platform security policies.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          {isExporting ? "Exporting..." : "Export Users (CSV)"}
        </button>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-sm flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <button
          onClick={() => {
            handleStatusChange("ALL");
            handleRoleChange("ALL");
          }}
          className={`p-4 rounded-xl border text-left transition ${
            currentStatus === "ALL" && currentRole === "ALL"
              ? "bg-slate-800/90 border-slate-600"
              : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="text-xs text-slate-400 font-medium">Total Users</div>
          <div className="text-xl font-bold text-white mt-1">{stats.total}</div>
        </button>

        <button
          onClick={() => handleRoleChange("CUSTOMER")}
          className={`p-4 rounded-xl border text-left transition ${
            currentRole === "CUSTOMER"
              ? "bg-emerald-950/30 border-emerald-600"
              : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="text-xs text-emerald-400 font-medium">Tourists / Customers</div>
          <div className="text-xl font-bold text-emerald-300 mt-1">{stats.customers}</div>
        </button>

        <button
          onClick={() => handleRoleChange("VENDOR")}
          className={`p-4 rounded-xl border text-left transition ${
            currentRole === "VENDOR"
              ? "bg-blue-950/30 border-blue-600"
              : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="text-xs text-blue-400 font-medium">Vendors</div>
          <div className="text-xl font-bold text-blue-300 mt-1">{stats.vendors}</div>
        </button>

        <button
          onClick={() => handleRoleChange("ADMIN")}
          className={`p-4 rounded-xl border text-left transition ${
            currentRole === "ADMIN"
              ? "bg-purple-950/30 border-purple-600"
              : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="text-xs text-purple-400 font-medium flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            Admins
          </div>
          <div className="text-xl font-bold text-purple-300 mt-1">{stats.admins}</div>
        </button>

        <button
          onClick={() => handleStatusChange("ACTIVE")}
          className={`p-4 rounded-xl border text-left transition ${
            currentStatus === "ACTIVE"
              ? "bg-emerald-950/30 border-emerald-600"
              : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active
          </div>
          <div className="text-xl font-bold text-emerald-300 mt-1">{stats.active}</div>
        </button>

        <button
          onClick={() => handleStatusChange("BANNED")}
          className={`p-4 rounded-xl border text-left transition ${
            currentStatus === "BANNED"
              ? "bg-red-950/30 border-red-600"
              : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="text-xs text-red-400 font-medium flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Banned
          </div>
          <div className="text-xl font-bold text-red-300 mt-1">{stats.banned}</div>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone number, or User ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </form>

        <select
          value={currentStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active Only</option>
          <option value="BANNED">Banned Only</option>
        </select>

        <select
          value={currentRole}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">All Roles</option>
          <option value="CUSTOMER">Customers (Tourists)</option>
          <option value="VENDOR">Vendors</option>
          <option value="ADMIN">Administrators</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Activity</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isAdmin = u.role === "ADMIN";
                  const initial = u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase();

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {u.image ? (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                              <Image src={u.image} alt={u.name || "User"} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300 shrink-0">
                              {initial}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-white">
                              {u.name || "Unnamed Tourist"}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 truncate max-w-[140px]">
                              {u.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200">{u.email}</div>
                        {u.phone && <div className="text-xs text-slate-400 font-mono mt-0.5">{u.phone}</div>}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        {u.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        ) : u.role === "VENDOR" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Vendor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Customer
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {u.isBanned ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                              <XCircle className="w-3 h-3" /> Banned
                            </span>
                            {u.banReason && (
                              <div
                                className="text-[11px] text-red-400 mt-1 max-w-[150px] truncate"
                                title={u.banReason}
                              >
                                {u.banReason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>

                      {/* Activity */}
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        <div>{u.bookingsCount} booking(s)</div>
                        <div>{u.reviewsCount} review(s)</div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View Detail */}
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="View Profile Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Ban / Unban */}
                          {isAdmin ? (
                            <span
                              className="px-2.5 py-1 text-xs text-slate-500 font-mono flex items-center gap-1 cursor-not-allowed"
                              title="Administrator accounts cannot be banned"
                            >
                              <Lock className="w-3 h-3" /> Protected
                            </span>
                          ) : u.isBanned ? (
                            <button
                              onClick={() => handleUnban(u)}
                              disabled={isPending}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition disabled:opacity-50"
                            >
                              Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setBanningUser(u);
                                setBanReason("");
                              }}
                              disabled={isPending}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition disabled:opacity-50"
                            >
                              Ban User
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400">
            <div>
              Page {currentPage} of {totalPages} ({totalCount} total users)
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => updateQuery({ page: String(currentPage - 1) })}
                disabled={currentPage <= 1}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition"
              >
                Previous
              </button>
              <button
                onClick={() => updateQuery({ page: String(currentPage + 1) })}
                disabled={currentPage >= totalPages}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">
                  {selectedUser.name ? selectedUser.name[0].toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedUser.name || "Unnamed Tourist"}
                  </h3>
                  <div className="text-xs text-slate-400">{selectedUser.email}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block">User ID</span>
                <span className="font-mono text-slate-300 mt-0.5 block break-all">
                  {selectedUser.id}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block">Role</span>
                <span className="font-semibold text-white mt-0.5 block">{selectedUser.role}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block">Phone</span>
                <span className="text-slate-300 mt-0.5 block">{selectedUser.phone || "—"}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block">Status</span>
                <span
                  className={`font-semibold mt-0.5 block ${
                    selectedUser.isBanned ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {selectedUser.isBanned ? "Banned" : "Active"}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block">Total Bookings</span>
                <span className="text-white font-semibold mt-0.5 block">
                  {selectedUser.bookingsCount}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block">Reviews Submitted</span>
                <span className="text-white font-semibold mt-0.5 block">
                  {selectedUser.reviewsCount}
                </span>
              </div>
            </div>

            {selectedUser.isBanned && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">
                <span className="font-semibold block">Ban Reason:</span>
                <span className="mt-1 block">{selectedUser.banReason || "No reason specified."}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
              <span>Updated: {new Date(selectedUser.updatedAt).toLocaleDateString()}</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban User Modal */}
      {banningUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Ban User Account</h3>
            </div>

            <p className="text-xs text-slate-400">
              Are you sure you want to ban{" "}
              <span className="text-white font-semibold">
                {banningUser.name || banningUser.email}
              </span>
              ? Banned accounts are prohibited from logging in, making bookings, or submitting reviews.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Ban Reason (Required)
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Specify reason for suspension (e.g. Terms violation, abusive behavior, fraudulent activity)..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setBanningUser(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBanConfirm}
                disabled={!banReason.trim() || isPending}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition disabled:opacity-50"
              >
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
