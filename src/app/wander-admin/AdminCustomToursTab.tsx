"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Phone, Mail, Calendar, Users, MapPin, Hotel, Car, MessageSquare, Trash2, CheckCircle, Clock, AlertCircle, RefreshCw, Filter, Search, FileText, Send, Edit3, X } from "lucide-react";
import { getCustomTourRequests, updateCustomTourStatus, deleteCustomTourRequest } from "@/actions/customTour";
import toast from "react-hot-toast";

export default function AdminCustomToursTab() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");

  const fetchInquiries = async () => {
    setLoading(true);
    const res = await getCustomTourRequests();
    if (res.success) {
      setInquiries(res.inquiries || []);
    } else {
      toast.error("Failed to load inquiries");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const toastId = toast.loading("Updating status...");
    const res = await updateCustomTourStatus(id, newStatus);
    toast.dismiss(toastId);
    if (res.success) {
      toast.success("Status updated!");
      setInquiries(inquiries.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq)));
    } else {
      toast.error(res.error || "Failed to update status");
    }
  };

  const handleSaveNotes = async (id: string) => {
    const toastId = toast.loading("Saving note...");
    const res = await updateCustomTourStatus(id, inquiries.find((i) => i.id === id)?.status || "PENDING", notesText);
    toast.dismiss(toastId);
    if (res.success) {
      toast.success("Admin note saved!");
      setInquiries(inquiries.map((inq) => (inq.id === id ? { ...inq, adminNotes: notesText } : inq)));
      setEditingNotesId(null);
    } else {
      toast.error(res.error || "Failed to save note");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    const toastId = toast.loading("Deleting inquiry...");
    const res = await deleteCustomTourRequest(id);
    toast.dismiss(toastId);
    if (res.success) {
      toast.success("Inquiry deleted");
      setInquiries(inquiries.filter((inq) => inq.id !== id));
    } else {
      toast.error(res.error || "Failed to delete");
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.destinations?.some((d: string) => d.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> New / Pending</span>;
      case "CONTACTED":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Contacted</span>;
      case "QUOTED":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Quote Sent</span>;
      case "BOOKED":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Booked / Won</span>;
      case "CLOSED":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 flex items-center gap-1.5">Closed / Lost</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-500" />
            Custom Tour Inquiries
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage tailor-made Kashmir travel quotes, assign prices, and chat directly with tourists on WhatsApp.
          </p>
        </div>
        <button
          onClick={fetchInquiries}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Inquiries</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{inquiries.length}</p>
        </div>
        <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 shadow-sm">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">New / Pending</p>
          <p className="text-2xl font-extrabold text-amber-950 mt-1">
            {inquiries.filter((i) => i.status === "PENDING").length}
          </p>
        </div>
        <div className="bg-purple-50/80 p-5 rounded-2xl border border-purple-200 shadow-sm">
          <p className="text-xs font-semibold text-purple-800 uppercase tracking-wider">Quotes Sent</p>
          <p className="text-2xl font-extrabold text-purple-950 mt-1">
            {inquiries.filter((i) => i.status === "QUOTED" || i.status === "CONTACTED").length}
          </p>
        </div>
        <div className="bg-green-50/80 p-5 rounded-2xl border border-green-200 shadow-sm">
          <p className="text-xs font-semibold text-green-800 uppercase tracking-wider">Confirmed Bookings</p>
          <p className="text-2xl font-extrabold text-green-950 mt-1">
            {inquiries.filter((i) => i.status === "BOOKED").length}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, phone, destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {["ALL", "PENDING", "CONTACTED", "QUOTED", "BOOKED", "CLOSED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === status
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status === "ALL" ? "All Inquiries" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium">Loading inquiries...</div>
      ) : filteredInquiries.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-lg font-bold text-slate-700">No custom tour inquiries found</p>
          <p className="text-sm mt-1">When tourists submit the customization form on the hero page, they will appear right here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInquiries.map((inq) => {
            const cleanPhone = inq.phone?.replace(/[^0-9]/g, "") || "";
            const waMsg = encodeURIComponent(`Hi ${inq.name}, thanks for your custom tour inquiry on Indiahiles! We saw you are interested in visiting ${inq.destinations?.join(", ") || "Kashmir"} for ${inq.guestsCount}. Here is our customized itinerary and best quote for you:`);
            const waLink = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone}?text=${waMsg}`;

            return (
              <div
                key={inq.id}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-700 font-extrabold flex items-center justify-center text-lg shadow-inner shrink-0">
                      {inq.name?.charAt(0).toUpperCase() || "T"}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">{inq.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-green-600" /> {inq.phone}
                        </span>
                        {inq.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" /> {inq.email}
                          </span>
                        )}
                        <span>• Submitted on {new Date(inq.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(inq.status)}

                    <select
                      value={inq.status}
                      onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                      className="text-xs font-bold border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="PENDING">Mark as Pending</option>
                      <option value="CONTACTED">Mark as Contacted</option>
                      <option value="QUOTED">Mark as Quoted</option>
                      <option value="BOOKED">Mark as Booked</option>
                      <option value="CLOSED">Mark as Closed</option>
                    </select>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl text-xs sm:text-sm">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Travel Dates
                    </span>
                    <p className="font-bold text-slate-800 mt-1">{inq.travelDates || "Not specified / Flexible"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Guests
                    </span>
                    <p className="font-bold text-slate-800 mt-1">{inq.guestsCount}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
                      <Hotel className="w-3.5 h-3.5" /> Hotel Category
                    </span>
                    <p className="font-bold text-slate-800 mt-1">{inq.hotelType}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
                      <Car className="w-3.5 h-3.5" /> Cab Preference
                    </span>
                    <p className="font-bold text-slate-800 mt-1">{inq.cabType}</p>
                  </div>
                </div>

                {/* Destinations Requested */}
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" /> Requested Destinations:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {inq.destinations && inq.destinations.length > 0 ? (
                      inq.destinations.map((dest: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-900 border border-orange-200 text-xs font-bold">
                          {dest}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No specific destinations checked</span>
                    )}
                  </div>
                </div>

                {/* Special Requests */}
                {inq.specialRequests && (
                  <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/80 text-xs">
                    <span className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600" /> Tourist Special Note / Request:
                    </span>
                    <p className="text-amber-950 font-medium leading-relaxed">"{inq.specialRequests}"</p>
                  </div>
                )}

                {/* Admin Notes Section */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    {editingNotesId === inq.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Write private admin note (e.g. Quoted 45,000 INR)..."
                          value={notesText}
                          onChange={(e) => setNotesText(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                          onClick={() => handleSaveNotes(inq.id)}
                          className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
                        >
                          Save Note
                        </button>
                        <button
                          onClick={() => setEditingNotesId(null)}
                          className="p-1.5 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-500">Admin Note:</span>
                        <span className="text-slate-700 italic">
                          {inq.adminNotes || "No internal notes written yet."}
                        </span>
                        <button
                          onClick={() => {
                            setEditingNotesId(inq.id);
                            setNotesText(inq.adminNotes || "");
                          }}
                          className="text-orange-600 hover:text-orange-700 font-bold ml-1 flex items-center gap-1 underline"
                        >
                          <Edit3 className="w-3 h-3" /> {inq.adminNotes ? "Edit" : "Add Note"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2 justify-end">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm transition-transform hover:scale-105"
                    >
                      <Send className="w-3.5 h-3.5" /> Chat on WhatsApp
                    </a>

                    <button
                      onClick={() => handleDelete(inq.id)}
                      title="Delete Inquiry"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
