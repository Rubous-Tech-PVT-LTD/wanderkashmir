"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

export default function AssignBaDropdown({
  leadId,
  currentBaId,
  baUsers
}: {
  leadId: string;
  currentBaId: string | null;
  baUsers: { id: string; name: string }[];
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleAssign = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const baId = e.target.value;
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baId: baId || null }),
      });
      
      if (res.ok) {
        router.refresh();
      } else {
        console.error("Failed to assign");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative inline-block w-full max-w-[150px]">
      <select
        value={currentBaId || ""}
        onChange={handleAssign}
        disabled={isUpdating}
        className="block w-full pl-3 pr-8 py-1.5 text-sm border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:opacity-50 appearance-none"
      >
        <option value="">Unassigned</option>
        {baUsers.map(ba => (
          <option key={ba.id} value={ba.id}>{ba.name}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>}
      </div>
    </div>
  );
}
