"use client";

import React, { useState } from "react";
import { UserPlus, X, CheckCircle, Loader2, Phone, Mail, User, Shield } from "lucide-react";
import { createAdminUserAction } from "@/actions/adminUsers";
import { useRouter } from "next/navigation";

export default function AddUserModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "VENDOR">("CUSTOMER");

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setRole("CUSTOMER");
    setError(null);
    setSuccess(false);
  };

  const handleOpen = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() && !email.trim()) {
      setError("Please provide at least a phone/WhatsApp number or email.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await createAdminUserAction({
        name: name.trim() || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
        role,
      });

      if (!res.success) {
        setError(res.error || "Failed to add user.");
      } else {
        setSuccess(true);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs hover:shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
      >
        <UserPlus className="w-4 h-4" />
        <span>+ Add User / Contact</span>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Add User / Marketing Contact
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Database me marketing aur WhatsApp campaigns ke liye user add karein
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            {success ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">User Successfully Added!</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    User account database me create ho gaya hai aur CSV Export ya Marketing list me shamil ho chuka hai.
                  </p>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    + Add Another
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-5 space-y-3.5 overflow-y-auto flex-1">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-200 text-xs">
                      {error}
                    </div>
                  )}

                  {/* 1. Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Customer / User Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Vikram Malhotra"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* 2. Phone / WhatsApp */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Phone / WhatsApp Number <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* 3. Email (Optional) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email Address <span className="text-slate-500">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. customer@gmail.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Agar email nahi hai, to system automatically unique marketing identifier assign kar dega.
                    </p>
                  </div>

                  {/* 4. Role */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      User Type / Role
                    </label>
                    <div className="relative">
                      <Shield className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as "CUSTOMER" | "VENDOR")}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden focus:border-emerald-500"
                      >
                        <option value="CUSTOMER">Customer / Tourist (Marketing Contact)</option>
                        <option value="VENDOR">Vendor / Partner</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Save to Database</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
