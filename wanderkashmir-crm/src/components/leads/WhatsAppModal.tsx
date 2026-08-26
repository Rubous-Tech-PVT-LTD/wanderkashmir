"use client";

import { useState, useEffect } from "react";
import { X, Copy, ExternalLink, MessageCircle } from "lucide-react";

export type WhatsAppModalProps = {
  isOpen: boolean;
  onClose: () => void;
  leadData: {
    phone: string;
    contactName: string;
    companyName: string;
    baName: string;
  };
};

const TEMPLATES = [
  {
    id: "first_introduction",
    name: "1. First Introduction",
    body: "Hello {contact_name},\n\nThis is {ba_name} from WanderKashmir.\n\nWe work with travel agencies for Kashmir B2B bookings, including hotels, homestays, taxis, tour packages and customized itineraries.\n\nAre you currently handling Kashmir bookings for your clients?\n\nRegards,\n{ba_name}\nWanderKashmir",
  },
  {
    id: "after_call",
    name: "2. After Call",
    body: "Hello {contact_name},\n\nThank you for speaking with me.\n\nAs discussed, WanderKashmir works with travel agencies for Kashmir B2B requirements including accommodation, transportation and customized packages.\n\nYou can share your upcoming Kashmir requirements with us and our team will prepare the quotation.\n\nRegards,\n{ba_name}\nWanderKashmir",
  },
  {
    id: "b2b_partnership",
    name: "3. B2B Partnership",
    body: "Hello {contact_name},\n\nWe would be happy to work with {company_name} as a B2B travel partner for Kashmir.\n\nWanderKashmir can support your Kashmir requirements with:\n\n• Hotels & Homestays\n• Taxi & Transfers\n• Kashmir Tour Packages\n• Customized Itineraries\n• Local Ground Support\n\nWhenever you receive a Kashmir requirement, you can share the details with us and we will prepare the best available quotation.\n\nRegards,\n{ba_name}\nWanderKashmir",
  },
  {
    id: "requirement_followup",
    name: "4. Requirement Follow-up",
    body: "Hello {contact_name},\n\nJust following up regarding the Kashmir requirement.\n\nPlease share the travel dates, number of travellers and preferred itinerary whenever convenient.\n\nWe will prepare the quotation accordingly.\n\nRegards,\n{ba_name}\nWanderKashmir",
  },
  {
    id: "quotation_followup",
    name: "5. Quotation Follow-up",
    body: "Hello {contact_name},\n\nJust checking in regarding the Kashmir quotation we shared.\n\nPlease let us know if you would like any changes in the hotels, itinerary, transportation or package.\n\nWe will be happy to revise the quotation according to your requirement.\n\nRegards,\n{ba_name}\nWanderKashmir",
  },
  {
    id: "booking_confirmation",
    name: "6. Booking Confirmation",
    body: "Hello {contact_name},\n\nThank you for confirming the Kashmir booking.\n\nWe have received the confirmation and our team will coordinate the necessary arrangements.\n\nBooking ID: {booking_id}\n\nWe will keep you updated regarding the trip arrangements.\n\nRegards,\n{ba_name}\nWanderKashmir",
  }
];

export default function WhatsAppModal({ isOpen, onClose, leadData }: WhatsAppModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      updateMessage(TEMPLATES[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const updateMessage = (template: typeof TEMPLATES[0]) => {
    let newMsg = template.body;
    newMsg = newMsg.replace(/{contact_name}/g, leadData.contactName || "Sir/Madam");
    newMsg = newMsg.replace(/{company_name}/g, leadData.companyName || "your company");
    newMsg = newMsg.replace(/{ba_name}/g, leadData.baName || "our team");
    // Leave these as placeholders if not provided, allowing manual edit
    newMsg = newMsg.replace(/{booking_id}/g, "[Booking ID]");
    newMsg = newMsg.replace(/{travel_date}/g, "[Travel Date]");
    newMsg = newMsg.replace(/{destination}/g, "[Destination]");
    newMsg = newMsg.replace(/{quotation_id}/g, "[Quotation ID]");
    
    setSelectedTemplate(template);
    setMessage(newMsg);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    const phone = leadData.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            Send WhatsApp Message
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 border-r border-gray-100 pr-4 space-y-2">
            <p className="text-sm font-semibold text-gray-900 mb-3">Select Template</p>
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => updateMessage(tmpl)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedTemplate.id === tmpl.id
                    ? "bg-green-50 text-green-700 font-medium border border-green-200"
                    : "text-gray-600 hover:bg-gray-50 border border-transparent"
                }`}
              >
                {tmpl.name}
              </button>
            ))}
          </div>

          <div className="md:col-span-2 flex flex-col">
            <label className="text-sm font-semibold text-gray-900 mb-2">Message Preview</label>
            <p className="text-xs text-gray-500 mb-3">You can edit this message before sending. No automatic message will be sent.</p>
            
            <textarea
              className="flex-1 min-h-[300px] p-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 resize-none whitespace-pre-wrap"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Sending to: <span className="font-medium text-gray-900">{leadData.phone}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleOpenWhatsApp}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              <ExternalLink className="h-4 w-4" />
              Open WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
