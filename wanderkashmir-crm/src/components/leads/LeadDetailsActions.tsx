"use client";

import { useState } from "react";
import { MessageCircle, Phone, ArrowRightLeft } from "lucide-react";
import WhatsAppModal from "./WhatsAppModal";
import LogCallModal from "./LogCallModal";
import ConvertPartnerModal from "./ConvertPartnerModal";

type ActionProps = {
  leadId: string;
  leadPhone: string;
  leadContactName: string;
  leadCompanyName: string;
  baName: string;
  canConvert: boolean;
};

export default function LeadDetailsActions({ 
  leadId, 
  leadPhone, 
  leadContactName, 
  leadCompanyName, 
  baName,
  canConvert
}: ActionProps) {
  const [isWaOpen, setIsWaOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => {
            window.location.href = `tel:${leadPhone}`;
            setIsCallOpen(true); // Open modal after triggering dialer
          }}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
        >
          <Phone className="h-4 w-4" />
          Call & Log
        </button>

        <button
          onClick={() => setIsWaOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </button>

        {canConvert && (
          <button
            onClick={() => setIsConvertOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Convert to Partner
          </button>
        )}
      </div>

      {isWaOpen && (
        <WhatsAppModal
          isOpen={isWaOpen}
          onClose={() => setIsWaOpen(false)}
          leadData={{
            phone: leadPhone,
            contactName: leadContactName,
            companyName: leadCompanyName,
            baName: baName,
          }}
        />
      )}

      {isCallOpen && (
        <LogCallModal
          leadId={leadId}
          onClose={() => setIsCallOpen(false)}
          onSuccess={() => window.location.reload()}
        />
      )}

      {isConvertOpen && (
        <ConvertPartnerModal
          leadId={leadId}
          onClose={() => setIsConvertOpen(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
