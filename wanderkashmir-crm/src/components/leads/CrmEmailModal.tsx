"use client";

import { useState } from "react";
import { Mail, Sparkles, X, AlertTriangle, Send, Eye, Code, Paperclip, Trash2 } from "lucide-react";
import { generateCrmEmailWithAiAction, sendCrmEmailAction } from "@/actions/email";

type CrmEmailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadEmail: string | null;
  leadName: string;
};

const TEMPLATES = [
  { id: "b2b_intro", label: "B2B Partnership Introduction", prompt: "Write a concise and professional B2B partnership introduction email from WanderKashmir to this travel agency. Explain the partnership opportunity and encourage a response. Use the provided Lead context. Do not invent pricing, commitments, facts, or previous conversations." },
  { id: "first_followup", label: "First Follow-up", prompt: "Write a concise professional follow-up email based only on the available CRM interaction history and Lead information. Do not invent previous conversations, promises, prices, or commitments." },
  { id: "second_followup", label: "Second Follow-up", prompt: "Write a polite second follow-up email checking if they received the previous information. Reiterate the value of partnering with WanderKashmir." },
  { id: "proposal", label: "Kashmir Partnership Proposal", prompt: "Write a formal partnership proposal email highlighting our B2B rates, reliability, and ground handling services in Kashmir." },
  { id: "intro", label: "Introduction to WanderKashmir", prompt: "Write a general introductory email explaining who WanderKashmir is, our position as a leading DMC in Kashmir, and how we help travel agents." },
  { id: "rate_discussion", label: "Package / Rate Discussion", prompt: "Write an email inviting the agency to discuss B2B package rates and customization options for their clients." },
  { id: "meeting", label: "Meeting Request", prompt: "Write a professional email requesting a brief phone or video meeting to discuss potential synergies." },
  { id: "reminder", label: "Partnership Reminder", prompt: "Write a gentle reminder email about our partnership opportunity, highlighting recent successes or season updates in Kashmir." },
  { id: "thank_you", label: "Thank You / Follow-up", prompt: "Write a warm thank you email for a recent conversation or interaction, summarizing next steps." },
  { id: "custom", label: "Custom Prompt Only", prompt: "" },
];

export default function CrmEmailModal({ isOpen, onClose, leadId, leadEmail, leadName }: CrmEmailModalProps) {
  const [template, setTemplate] = useState(TEMPLATES[0].prompt);
  const [customPrompt, setCustomPrompt] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [viewMode, setViewMode] = useState<"code" | "preview">("code");
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [showWarning, setShowWarning] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15 MB
  const MAX_FILES = 4;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files);
    let currentTotalSize = attachments.reduce((acc, file) => acc + file.size, 0);
    const validFiles: File[] = [];

    let currentError = "";

    for (const file of newFiles) {
      if (attachments.length + validFiles.length >= MAX_FILES) {
        currentError = `Maximum of ${MAX_FILES} attachments allowed.`;
        break;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        currentError = `File ${file.name} exceeds the 5MB limit.`;
        continue;
      }
      
      if (currentTotalSize + file.size > MAX_TOTAL_SIZE) {
        currentError = `Adding ${file.name} exceeds the total 15MB limit.`;
        break;
      }
      
      currentTotalSize += file.size;
      validFiles.push(file);
    }
    
    if (currentError) {
      setError(currentError);
    } else {
      setError("");
    }
    
    if (validFiles.length > 0) {
      setAttachments(prev => [...prev, ...validFiles]);
    }
    
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setError("");
    setIsGenerating(true);
    
    try {
      const res = await generateCrmEmailWithAiAction(leadId, template, customPrompt);
      if (res.success && res.data) {
        setSubject(res.data.subject || "");
        setBodyHtml(res.data.bodyHtml || "");
      } else {
        setError(res.error || "Failed to generate draft.");
      }
    } catch (e) {
      setError("Unable to generate draft. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInitiateSend = () => {
    if (!leadEmail) {
      setError("Lead does not have an email address.");
      return;
    }
    if (!subject.trim() || !bodyHtml.trim()) {
      setError("Subject and body are required.");
      return;
    }
    // Show AI warning BEFORE actual send
    setShowWarning(true);
  };

  const handleConfirmSend = async () => {
    setError("");
    setIsSending(true);
    
    try {
      const formData = new FormData();
      formData.append("leadId", leadId);
      formData.append("subject", subject);
      formData.append("bodyHtml", bodyHtml);
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const res = await sendCrmEmailAction(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => onClose(), 2000);
      } else {
        setError(res.error || "Failed to send email.");
        setShowWarning(false);
      }
    } catch (e) {
      setError("An unexpected error occurred while sending.");
      setShowWarning(false);
    } finally {
      setIsSending(false);
    }
  };

  if (showWarning) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">⚠️ AI-Generated Content</h3>
            <p className="text-gray-600 text-sm">
              AI can make mistakes. Please review the email carefully before sending.
            </p>
            
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            <div className="flex w-full gap-3 pt-4">
              <button
                onClick={() => setShowWarning(false)}
                disabled={isSending}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium disabled:opacity-50"
              >
                Go Back & Review
              </button>
              <button
                onClick={handleConfirmSend}
                disabled={isSending}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSending ? "Sending..." : "Confirm Send"}
                {!isSending && <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email {leadName}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {success ? (
            <div className="text-center py-8 text-green-600 font-medium">
              Email sent successfully!
            </div>
          ) : (
            <>
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>}
              
              {!leadEmail && (
                <div className="p-3 bg-amber-50 text-amber-700 text-sm rounded-md mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  This lead does not have an email address provided.
                </div>
              )}

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose / Template</label>
                  <select 
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary text-sm p-2 border bg-white"
                    onChange={(e) => setTemplate(e.target.value)}
                    disabled={isGenerating}
                  >
                    {TEMPLATES.map(t => (
                      <option key={t.id} value={t.prompt}>{t.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Prompt Instructions (Optional)</label>
                  <textarea 
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary text-sm p-2 border bg-white min-h-[60px]"
                    placeholder="E.g., Keep it under 120 words and make the tone friendly."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>
                
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !leadEmail}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 text-sm font-medium transition-colors"
                >
                  {isGenerating ? "Generating..." : "Generate Draft with AI"}
                  {!isGenerating && <Sparkles className="h-4 w-4 text-orange-400" />}
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input 
                    type="text"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary text-sm p-2 border"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Body (HTML)</label>
                    <div className="flex bg-gray-100 rounded-md p-0.5">
                      <button
                        onClick={() => setViewMode("code")}
                        className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-sm ${viewMode === "code" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                      >
                        <Code className="h-3 w-3" /> Code
                      </button>
                      <button
                        onClick={() => setViewMode("preview")}
                        className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-sm ${viewMode === "preview" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                      >
                        <Eye className="h-3 w-3" /> Preview
                      </button>
                    </div>
                  </div>
                  
                  {viewMode === "code" ? (
                    <textarea 
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary text-sm p-2 border font-mono min-h-[300px]"
                      value={bodyHtml}
                      onChange={(e) => setBodyHtml(e.target.value)}
                    />
                  ) : (
                    <div 
                      className="w-full border border-gray-300 rounded-md shadow-sm min-h-[300px] bg-white overflow-auto p-4"
                      dangerouslySetInnerHTML={{ __html: bodyHtml || "<p class='text-gray-400 text-sm'>No content to preview.</p>" }}
                    />
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  You can manually edit the HTML code above before sending.
                </div>

                {/* Attachments Section */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      Attachments
                    </label>
                    <span className="text-xs text-gray-500">
                      Max {MAX_FILES} files, 5MB each (15MB total)
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {attachments.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200 text-sm">
                            <span className="truncate flex-1 mr-2 text-gray-700">{file.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </span>
                              <button
                                onClick={() => removeAttachment(index)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        disabled={attachments.length >= MAX_FILES}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div className={`w-full border-2 border-dashed rounded-md p-3 text-center text-sm transition-colors ${attachments.length >= MAX_FILES ? 'bg-gray-50 border-gray-200 text-gray-400' : 'bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-600'}`}>
                        Click to add files or drag and drop
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleInitiateSend}
              disabled={isGenerating || !leadEmail || !subject || !bodyHtml}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
