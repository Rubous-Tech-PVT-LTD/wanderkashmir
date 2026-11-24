"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, AlertCircle } from "lucide-react";
import { createAdminUserAction } from "@/actions/adminUsers";
import { AdminModal } from "@/components/admin/ui";

export default function AddUserModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "VENDOR">("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setRole("CUSTOMER");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!phone.trim() && !email.trim()) {
      setError("Provide at least a phone number or an email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await createAdminUserAction({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        role,
      });

      if (res.success) {
        resetForm();
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error || "Failed to create user.");
      }
    } catch {
      setError("Network error while creating user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          resetForm();
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors cursor-pointer"
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span>Add User</span>
      </button>

      <AdminModal
        open={open}
        onClose={() => !loading && setOpen(false)}
        title="Add User / Contact"
        subtitle="Register a customer, vendor, editor, or administrator account."
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              disabled={loading}
              onClick={() => setOpen(false)}
              className="px-3.5 py-2 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-admin-user-form"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save User</span>
            </button>
          </>
        }
      >
        <form id="add-admin-user-form" onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div role="alert" className="flex items-start gap-2 p-2.5 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="add-user-name" className="block text-xs font-medium text-slate-700 mb-1.5">
              Full Name <span className="text-rose-600">*</span>
            </label>
            <input
              id="add-user-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Aarav Sharma"
              className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="add-user-phone" className="block text-xs font-medium text-slate-700 mb-1.5">
                Phone Number
              </label>
              <input
                id="add-user-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
              />
            </div>

            <div>
              <label htmlFor="add-user-email" className="block text-xs font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                id="add-user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
              />
            </div>
          </div>

          <div>
            <label htmlFor="add-user-role" className="block text-xs font-medium text-slate-700 mb-1.5">
              Role
            </label>
            <select
              id="add-user-role"
              value={role}
              onChange={(e) => setRole(e.target.value as "CUSTOMER" | "VENDOR")}
              className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
            >
              <option value="CUSTOMER">Tourist / Customer</option>
              <option value="VENDOR">Vendor Partner</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Provide at least a phone number or email address.
            </p>
          </div>
        </form>
      </AdminModal>
    </>
  );
}
