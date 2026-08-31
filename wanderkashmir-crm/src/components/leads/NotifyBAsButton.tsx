"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";

export default function NotifyBAsButton() {
  const [isNotifying, setIsNotifying] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleNotify = async () => {
    setIsNotifying(true);
    setSuccess(false);
    
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Please upload proof (screenshot of email, WhatsApp, or call logs) for all leads in the INTERESTED state.",
          userId: null // global notification
        })
      });
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert("Failed to send notification");
      }
    } catch (error) {
      console.error(error);
      alert("Error sending notification");
    } finally {
      setIsNotifying(false);
    }
  };

  return (
    <button 
      onClick={handleNotify} 
      disabled={isNotifying}
      className={`btn-secondary w-full sm:w-auto justify-center ${success ? "bg-green-50 text-green-700 border-green-200" : ""}`}
    >
      <BellRing className="h-4 w-4 mr-2" /> 
      {isNotifying ? "Notifying..." : success ? "Notified!" : "Notify BAs (Proof)"}
    </button>
  );
}
