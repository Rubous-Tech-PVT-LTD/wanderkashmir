"use client";

import { useState } from "react";
import { X } from "lucide-react";

type LogCallModalProps = {
  leadId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function LogCallModal({ leadId, onClose, onSuccess }: LogCallModalProps) {
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTask, setFollowUpTask] = useState("");
  const [interestProof, setInterestProof] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcome) {
      setError("Outcome is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/leads/${leadId}/calls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome,
          notes,
          followUpDate: followUpDate ? new Date(followUpDate).toISOString() : null,
          followUpTask,
          interestProof: outcome === "INTERESTED" ? interestProof : null
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to log call");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred logging the call");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Manually Log Call</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Call Outcome *</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-sm"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            >
              <option value="">Select Outcome...</option>
              <option value="CONNECTED">Connected</option>
              <option value="INTERESTED">Interested</option>
              <option value="NOT_INTERESTED">Not Interested</option>
              <option value="NOT_CONNECTED">Not Connected</option>
              <option value="BUSY">Busy</option>
              <option value="CALL_BACK_REQUESTED">Call Back Requested</option>
              <option value="WRONG_NUMBER">Wrong Number</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Call Notes</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-sm"
              rows={3}
              placeholder="e.g. Agent handles Kashmir packages and is interested in B2B rates."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {outcome === "INTERESTED" && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
              <label className="block text-sm font-medium text-blue-900 mb-1">
                Upload Proof of Interest (Required)
              </label>
              <p className="text-xs text-blue-700 mb-2">
                Please upload a screenshot of email, WhatsApp chat, or call logs.
              </p>
              <input
                type="file"
                accept="image/*"
                required={outcome === "INTERESTED"}
                className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setInterestProof(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          )}

          <div className="pt-2 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Schedule Follow-up (Optional)</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Follow-up Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-sm"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Follow-up Task</label>
                <input
                  type="text"
                  placeholder="e.g. Call back to discuss pricing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-sm"
                  value={followUpTask}
                  onChange={(e) => setFollowUpTask(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Call Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
