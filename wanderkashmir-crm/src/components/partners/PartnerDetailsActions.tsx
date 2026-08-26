"use client";

import { useState } from "react";
import { MessageCircle, Phone, Plus } from "lucide-react";
import WhatsAppModal from "@/components/leads/WhatsAppModal";

export default function PartnerDetailsActions({ 
  partnerPhone, 
  partnerContactName, 
  partnerCompanyName, 
  baName 
}: { 
  partnerPhone: string, 
  partnerContactName: string, 
  partnerCompanyName: string, 
  baName: string 
}) {
  const [isWaOpen, setIsWaOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => {
            window.location.href = `tel:${partnerPhone}`;
          }}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
        >
          <Phone className="h-4 w-4" />
          Call
        </button>

        <button
          onClick={() => setIsWaOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </button>

        <button
          onClick={() => alert("Requirements system coming in Phase 4")}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Requirement
        </button>
      </div>

      {isWaOpen && (
        <WhatsAppModal
          isOpen={isWaOpen}
          onClose={() => setIsWaOpen(false)}
          leadData={{
            phone: partnerPhone,
            contactName: partnerContactName,
            companyName: partnerCompanyName,
            baName: baName,
          }}
        />
      )}
    </>
  );
}
