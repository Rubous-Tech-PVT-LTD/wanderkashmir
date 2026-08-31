"use client";

import { useState } from "react";
import { BellRing, X } from "lucide-react";

export default function NotifyBAsButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isNotifying, setIsNotifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Message cannot be empty.");
      return;
    }

    setIsNotifying(true);
    setSuccess(false);
    setError("");
    
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          userId: null // global notification
        })
      });
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setIsModalOpen(false);
          setMessage("");
        }, 2000);
      } else {
        setError("Failed to send notification");
      }
    } catch (error) {
      console.error(error);
      setError("Error sending notification");
    } finally {
      setIsNotifying(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)} 
        className="btn-secondary w-full sm:w-auto justify-center"
      >
        <BellRing className="h-4 w-4 mr-2" /> 
        Notify BAs
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Send Global Notification</h3>
              <button 
                onClick={() => !isNotifying && setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600"
                disabled={isNotifying}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleNotify} className="p-4 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">
                  Notification sent successfully!
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Message *
                </label>
                <textarea
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-sm"
                  rows={4}
                  placeholder="e.g. Please upload proof for all leads in the INTERESTED state."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isNotifying || success}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be sent to all Business Associates and will appear in their notification bell.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isNotifying}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isNotifying || success}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none"
                >
                  {isNotifying ? "Sending..." : "Send Notification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
