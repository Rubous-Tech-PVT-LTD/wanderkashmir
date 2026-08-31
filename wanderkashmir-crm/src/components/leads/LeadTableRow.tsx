"use client";

import { useState } from "react";
import { Phone, CheckSquare, MessageCircle, Eye } from "lucide-react";
import LogCallModal from "./LogCallModal";
import WhatsAppModal from "./WhatsAppModal";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AssignBaDropdown from "./AssignBaDropdown";
import RejectProofModal from "./RejectProofModal";
import { Check, XCircle } from "lucide-react";

type Lead = {
  id: string;
  companyName: string;
  contactPerson: string | null;
  phone: string;
  email: string | null;
  city: string | null;
  state: string | null;
  status: string;
  assignedBa: { name: string } | null;
  assignedBaId?: string | null;
  interestProofStatus?: string | null;
  interestProofUrl?: string | null;
};

export default function LeadTableRow({ 
  lead, 
  isAdmin = false,
  baUsers = []
}: { 
  lead: Lead;
  isAdmin?: boolean;
  baUsers?: { id: string; name: string }[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWaOpen, setIsWaOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const router = useRouter();

  const handleCall = () => {
    // Standard phone dialer opening, no automatic tracking
    window.location.href = `tel:${lead.phone}`;
  };

  const handleWhatsApp = () => {
    setIsWaOpen(true);
  };

  const handleSuccess = () => {
    router.refresh(); // Refresh the page to reflect the new lead status and call log
  };

  const handleAccept = async () => {
    if (!window.confirm("Are you sure you want to approve this proof and convert the lead to a Partner?")) return;
    
    setIsConverting(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/convert`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to convert lead");
      }
      alert("Lead successfully converted to Partner!");
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
      {/* Desktop Row */}
      <tr className="hover:bg-gray-50 transition-colors hidden md:table-row">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{lead.companyName}</span>
            <span className="text-sm text-gray-500">{lead.contactPerson || "-"}</span>
            <div className="flex gap-2 mt-1 text-xs">
              <span className="text-gray-600">{lead.phone}</span>
              {lead.email && <span className="text-gray-400">• {lead.email}</span>}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{lead.city || "-"}</div>
          <div className="text-sm text-gray-500">{lead.state || ""}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex flex-col gap-1 items-start">
            <span className={`badge ${lead.status === 'NEW' ? 'badge-primary' : lead.status === 'CONNECTED' ? 'bg-blue-100 text-blue-800' : lead.status === 'INTERESTED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {lead.status === 'INTERESTED' ? 'PENDING ACCEPTED' : lead.status.replace(/_/g, " ")}
            </span>
            {lead.interestProofStatus === 'PENDING' && (
              <span className="badge bg-yellow-100 text-yellow-800 text-[10px] uppercase tracking-wide">
                Pending Approval
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {isAdmin ? (
            <AssignBaDropdown leadId={lead.id} currentBaId={lead.assignedBaId || null} baUsers={baUsers} />
          ) : (
            lead.assignedBa ? lead.assignedBa.name : <span className="text-gray-400 italic">Unassigned</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end gap-2">
            {isAdmin && lead.status === 'INTERESTED' && (
              <>
                <button
                  onClick={handleAccept}
                  disabled={isConverting}
                  className="p-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  title="Approve & Convert to Partner"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  className="p-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                  title="Reject Proof"
                >
                  <XCircle className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
              </>
            )}
            <button
              onClick={handleCall}
              className="p-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              title="Call"
            >
              <Phone className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 text-emerald-600 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors flex items-center gap-1"
              title="Log Call"
            >
              <CheckSquare className="h-4 w-4" />
              <span className="hidden lg:inline text-xs font-semibold uppercase tracking-wider pr-1">Log</span>
            </button>
            <button
              onClick={handleWhatsApp}
              className="p-2 text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
              title="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
            <Link
              href={`/dashboard/leads/${lead.id}`}
              className="p-2 text-gray-600 bg-gray-50 rounded-md hover:bg-gray-200 transition-colors"
              title="View Lead"
            >
              <Eye className="h-4 w-4" />
            </Link>
          </div>
        </td>
      </tr>

      {/* Mobile Card Row */}
      <tr className="md:hidden">
        <td colSpan={5} className="p-0">
          <div className="p-4 border-b border-gray-100 space-y-3 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{lead.companyName}</h3>
                <p className="text-sm text-gray-600">{lead.contactPerson || "No Contact Person"}</p>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className={`badge text-xs ${lead.status === 'NEW' ? 'badge-primary' : lead.status === 'CONNECTED' ? 'bg-blue-100 text-blue-800' : lead.status === 'INTERESTED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {lead.status === 'INTERESTED' ? 'PENDING ACCEPTED' : lead.status.replace(/_/g, " ")}
                </span>
                {lead.interestProofStatus === 'PENDING' && (
                  <span className="badge bg-yellow-100 text-yellow-800 text-[10px] uppercase tracking-wide">
                    Pending Approval
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wider">Phone</span>
                <span>{lead.phone}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wider">Location</span>
                <span>{lead.city || "-"} {lead.state ? `, ${lead.state}` : ""}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              {isAdmin && lead.status === 'INTERESTED' && (
                <div className="flex gap-2 w-full pb-2 border-b border-gray-100">
                  <button
                    onClick={handleAccept}
                    disabled={isConverting}
                    className="flex-1 flex justify-center items-center gap-1 py-2 px-3 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    className="flex-1 flex justify-center items-center gap-1 py-2 px-3 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors font-medium text-sm"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              )}
              <div className="flex gap-2 flex-1">
                <button
                  onClick={handleCall}
                  className="flex-1 flex justify-center items-center py-2.5 px-3 text-blue-600 bg-blue-50 rounded-md active:bg-blue-100 transition-colors"
                  title="Call"
                >
                  <Phone className="h-5 w-5" />
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 flex justify-center items-center py-2.5 px-3 text-green-600 bg-green-50 rounded-md active:bg-green-100 transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex-[2] flex justify-center items-center gap-2 py-2.5 px-3 text-emerald-700 bg-emerald-50 rounded-md active:bg-emerald-100 transition-colors font-medium"
                >
                  <CheckSquare className="h-5 w-5" />
                  <span>Log</span>
                </button>
              </div>
              <Link
                href={`/dashboard/leads/${lead.id}`}
                className="flex justify-center items-center py-2.5 px-3 text-gray-600 bg-gray-50 rounded-md active:bg-gray-200 transition-colors"
                title="View Lead"
              >
                <Eye className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </td>
      </tr>

      {isModalOpen && (
        <LogCallModal
          leadId={lead.id}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}

      {isWaOpen && (
        <WhatsAppModal
          isOpen={isWaOpen}
          onClose={() => setIsWaOpen(false)}
          leadData={{
            phone: lead.phone,
            contactName: lead.contactPerson || lead.companyName,
            companyName: lead.companyName,
            baName: lead.assignedBa?.name || "",
          }}
        />
      )}

      {isRejectModalOpen && (
        <RejectProofModal
          leadId={lead.id}
          onClose={() => setIsRejectModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
