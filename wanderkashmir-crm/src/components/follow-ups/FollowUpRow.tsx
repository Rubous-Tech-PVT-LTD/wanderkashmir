"use client";

import { useState } from "react";
import { Check, Calendar, MessageCircle, Phone, ArrowRight } from "lucide-react";
import Link from "next/link";
import WhatsAppModal from "@/components/leads/WhatsAppModal";
import LogCallModal from "@/components/leads/LogCallModal";

type FollowUpProps = {
  id: string;
  task: string;
  dueDate: string | Date;
  leadId?: string | null;
  partnerId?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lead?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  partner?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ba?: any;
};

export default function FollowUpRow({ followUp, isOverdue, isAdmin }: { followUp: FollowUpProps, isOverdue?: boolean, isAdmin?: boolean }) {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isWaOpen, setIsWaOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);

  const handleComplete = async () => {
    try {
      await fetch(`/api/follow-ups/${followUp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'COMPLETE' })
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReschedule = async () => {
    if (!newDate) return;
    setIsSubmitting(true);
    try {
      await fetch(`/api/follow-ups/${followUp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESCHEDULE', newDate })
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const dateObj = new Date(followUp.dueDate);
  const dateStr = dateObj.toLocaleDateString();
  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const lead = followUp.lead;
  const companyName = followUp.partner ? followUp.partner.companyName : lead.companyName;
  const contactName = followUp.partner ? followUp.partner.contactPerson : lead.contactPerson;
  const phone = followUp.partner ? followUp.partner.phone : lead.phone;
  const targetUrl = followUp.partner ? `/dashboard/partners/${followUp.partner.id}` : `/dashboard/leads/${lead.id}`;

  return (
    <>
      {/* Desktop Row */}
      <tr className="hover:bg-gray-50 transition-colors hidden md:table-row">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm font-medium ${isOverdue ? "text-red-600" : "text-gray-900"}`}>
            {dateStr}
          </div>
          <div className={`text-xs ${isOverdue ? "text-red-500" : "text-gray-500"}`}>
            {timeStr}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm font-medium text-gray-900">{companyName}</div>
          <div className="text-xs text-gray-500">{contactName || "No contact name"}</div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-900 line-clamp-2 max-w-xs">{followUp.task}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="badge badge-primary text-xs">{followUp.partner ? "PARTNER" : lead.status.replace(/_/g, " ")}</span>
        </td>
        {isAdmin && (
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="text-sm text-gray-700 font-medium">{followUp.ba?.name || "Unassigned"}</span>
          </td>
        )}
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          {isRescheduling ? (
            <div className="flex items-center justify-end gap-2">
              <input 
                type="datetime-local" 
                className="text-xs border border-gray-300 rounded px-2 py-1"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
              <button 
                onClick={handleReschedule} 
                disabled={isSubmitting || !newDate}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button 
                onClick={() => setIsRescheduling(false)}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={() => {
                  window.location.href = `tel:${phone}`;
                  setIsCallOpen(true);
                }}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" 
                title="Call"
              >
                <Phone className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setIsWaOpen(true)}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded" 
                title="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setIsRescheduling(true)}
                className="p-1.5 text-orange-600 hover:bg-orange-50 rounded" 
                title="Reschedule"
              >
                <Calendar className="h-4 w-4" />
              </button>
              <button 
                onClick={handleComplete}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" 
                title="Complete"
              >
                <Check className="h-4 w-4" />
              </button>
              <Link 
                href={targetUrl}
                className="p-1.5 text-gray-400 hover:text-gray-900 rounded" 
                title="Open Details"
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </td>
      </tr>

      {/* Mobile Card Row */}
      <tr className="md:hidden">
        <td colSpan={5} className="p-0">
          <div className="p-4 border-b border-gray-100 bg-white space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{companyName}</h3>
                <p className="text-sm text-gray-600">{followUp.task}</p>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${isOverdue ? "text-red-600" : "text-gray-900"}`}>{dateStr}</div>
                <div className={`text-xs ${isOverdue ? "text-red-500" : "text-gray-500"}`}>{timeStr}</div>
              </div>
            </div>

            {isRescheduling ? (
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Reschedule Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsRescheduling(false)}
                    className="flex-1 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleReschedule} 
                    disabled={isSubmitting || !newDate}
                    className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-100 grid grid-cols-4 gap-2">
                <button 
                  onClick={() => {
                    window.location.href = `tel:${phone}`;
                    setIsCallOpen(true);
                  }}
                  className="flex flex-col items-center justify-center py-2 text-blue-600 bg-blue-50 rounded-lg active:bg-blue-100"
                >
                  <Phone className="h-5 w-5 mb-1" />
                  <span className="text-[10px] uppercase font-semibold">Call</span>
                </button>
                <button 
                  onClick={() => setIsWaOpen(true)}
                  className="flex flex-col items-center justify-center py-2 text-green-600 bg-green-50 rounded-lg active:bg-green-100"
                >
                  <MessageCircle className="h-5 w-5 mb-1" />
                  <span className="text-[10px] uppercase font-semibold">WhatsApp</span>
                </button>
                <button 
                  onClick={() => setIsRescheduling(true)}
                  className="flex flex-col items-center justify-center py-2 text-orange-600 bg-orange-50 rounded-lg active:bg-orange-100"
                >
                  <Calendar className="h-5 w-5 mb-1" />
                  <span className="text-[10px] uppercase font-semibold">Delay</span>
                </button>
                <button 
                  onClick={handleComplete}
                  className="flex flex-col items-center justify-center py-2 text-emerald-700 bg-emerald-50 rounded-lg active:bg-emerald-100"
                >
                  <Check className="h-5 w-5 mb-1" />
                  <span className="text-[10px] uppercase font-semibold">Done</span>
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>
      
      {isWaOpen && (
        <WhatsAppModal
          isOpen={isWaOpen}
          onClose={() => setIsWaOpen(false)}
          leadData={{
            phone: phone,
            contactName: contactName || companyName,
            companyName: companyName,
            baName: followUp.ba?.name || "",
          }}
        />
      )}

      {isCallOpen && followUp.leadId && !followUp.partnerId && (
        <LogCallModal
          leadId={followUp.leadId}
          onClose={() => setIsCallOpen(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
