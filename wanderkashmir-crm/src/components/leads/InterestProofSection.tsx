"use client";

import { useState } from "react";
import { Check, X, Image as ImageIcon } from "lucide-react";

type InterestProofSectionProps = {
  leadId: string;
  proofUrl: string;
  status: string | null;
  isAdmin: boolean;
};

export default function InterestProofSection({ leadId, proofUrl, status, isAdmin }: InterestProofSectionProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/proof-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      alert("Error updating status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="card-white p-6">
      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex justify-between items-center">
        <span>Interest Proof</span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          status === 'APPROVED' ? 'bg-green-100 text-green-800' :
          status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {status || 'PENDING'}
        </span>
      </h3>
      
      <div className="space-y-4">
        {proofUrl.startsWith('data:image') ? (
          <img src={proofUrl} alt="Proof of interest" className="w-full h-auto rounded-md border border-gray-200" />
        ) : (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
            <ImageIcon className="h-5 w-5 text-gray-400" />
            <a href={proofUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate">
              View Attached Proof
            </a>
          </div>
        )}

        {isAdmin && status === 'PENDING' && (
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button 
              onClick={() => handleUpdate('APPROVED')}
              disabled={isUpdating}
              className="flex-1 btn-primary bg-green-600 hover:bg-green-700 border-green-600 justify-center"
            >
              <Check className="h-4 w-4 mr-2" /> Approve
            </button>
            <button 
              onClick={() => handleUpdate('REJECTED')}
              disabled={isUpdating}
              className="flex-1 btn-secondary text-red-600 border-red-200 bg-red-50 hover:bg-red-100 justify-center"
            >
              <X className="h-4 w-4 mr-2" /> Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
