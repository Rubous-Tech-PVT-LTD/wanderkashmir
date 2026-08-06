"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Eye, RefreshCw, Sparkles, Upload } from "lucide-react";
import { sendBulkEmailsAction, generateEmailWithAiAction } from "@/actions/emails";
import toast from "react-hot-toast";

export default function AdminEmailsTab() {
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState(
    `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #334155; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
  <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 24px; font-weight: 800;">WanderKashmir Partner Update</h1>
  </div>
  <div style="padding: 32px; background: #ffffff;">
    <p style="font-size: 16px; margin-top: 0;">Hi <strong>[NAME]</strong>,</p>
    <p>We are excited to share some important platform updates and marketing highlights with you to help grow your listings and bookings.</p>
    
    <div style="background: #f8fafc; border-left: 4px solid #f97316; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; font-weight: 600; color: #1e293b;">Key Update:</p>
      <p style="margin: 4px 0 0;">We have updated the free-tier listing limits! You can now upload up to 50 photos and 10 videos directly to your gallery to showcase your services in high resolution.</p>
    </div>

    <p>Please log in to your dashboard to inspect your listings or complete your details.</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://wanderkashmir.com/partner" style="background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(249,115,22,0.2);">Go to Partner Dashboard</a>
    </div>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
    <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">Warm regards,<br/><strong>WanderKashmir Admin Team</strong></p>
  </div>
  <div style="padding: 16px; text-align: center; background: #f8fafc; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
    © 2024 WanderKashmir. All rights reserved.
  </div>
</div>`
  );

  const [vendorType, setVendorType] = useState("ALL");
  const [subscriptionPlan, setSubscriptionPlan] = useState("ALL");
  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  
  const [customRecipients, setCustomRecipients] = useState<{ email: string; businessName: string }[]>([]);
  const [csvFileName, setCsvFileName] = useState("");

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        toast.error("Could not read file content.");
        return;
      }
      
      try {
        // Remove BOM if present (e.g. \ufeff from Excel exports)
        const cleanText = text.replace(/^\uFEFF/, "");
        const lines = cleanText.split(/\r?\n/);
        
        if (lines.length === 0) {
          toast.error("CSV file is empty.");
          return;
        }

        // Helper to parse CSV line respecting quotes
        const splitCsvLine = (line: string) => {
          const result: string[] = [];
          let current = "";
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result.map(c => c.replace(/^["']|["']$/g, '').trim());
        };

        // Parse headers to match index
        const headers = splitCsvLine(lines[0]);
        let emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));
        let nameIndex = headers.findIndex(h => 
          h.toLowerCase().includes('hotel') || 
          h.toLowerCase().includes('name') || 
          h.toLowerCase().includes('business') || 
          h.toLowerCase().includes('company')
        );

        const parsedList: { email: string; businessName: string }[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const columns = splitCsvLine(line);
          let email = "";
          let businessName = "";
          
          if (emailIndex !== -1 && columns[emailIndex]) {
            email = columns[emailIndex];
          } else {
            const foundEmail = columns.find(c => c.includes('@'));
            if (foundEmail) email = foundEmail;
          }
          
          if (nameIndex !== -1 && columns[nameIndex]) {
            businessName = columns[nameIndex];
          } else {
            const foundName = columns.find(c => !c.includes('@') && c.length > 1);
            if (foundName) businessName = foundName;
          }
          
          // Strictly clean email values from spaces, non-ASCII characters, and quotes
          const cleanEmail = email
            .replace(/[^\x20-\x7E]/g, "") // Keep only printable ASCII
            .replace(/["'\s]/g, "")       // Remove quotes and whitespace
            .trim();
            
          if (cleanEmail && cleanEmail.includes('@') && cleanEmail.includes('.')) {
            parsedList.push({
              email: cleanEmail.toLowerCase(),
              businessName: businessName.trim() || "Partner",
            });
          }
        }
        
        if (parsedList.length === 0) {
          toast.error("No valid emails found in the CSV. Make sure you have an 'email' column.");
        } else {
          setCustomRecipients(parsedList);
          toast.success(`Successfully loaded ${parsedList.length} recipients from CSV!`);
        }
      } catch (err) {
        toast.error("Failed to parse CSV file. Ensure it is comma-separated.");
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateWithAi = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a description for the email topic.");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading("Generating email campaign using Gemini AI...");
    try {
      const res = await generateEmailWithAiAction(aiPrompt);
      if (res.success && res.data) {
        setSubject(res.data.subject || "");
        setBodyHtml(res.data.bodyHtml || "");
        toast.success("Email generated successfully!", { id: toastId });
      } else {
        toast.error(res.error || "Failed to generate email.", { id: toastId });
      }
    } catch (e) {
      toast.error("An error occurred during AI generation.", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail.trim() || !testEmail.includes("@")) {
      toast.error("Please enter a valid test email address.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Subject is required.");
      return;
    }
    if (!bodyHtml.trim()) {
      toast.error("Email body is required.");
      return;
    }

    setIsTesting(true);
    const toastId = toast.loading("Sending test email...");
    try {
      const res = await sendBulkEmailsAction({
        subject,
        bodyHtml,
        vendorType,
        subscriptionPlan,
        testEmail,
      });

      if (res.success) {
        toast.success("Test email sent successfully!", { id: toastId });
      } else {
        toast.error(res.error || "Failed to send test email.", { id: toastId });
      }
    } catch (e) {
      toast.error("Something went wrong.", { id: toastId });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendBulk = async () => {
    if (!subject.trim()) {
      toast.error("Subject is required.");
      return;
    }
    if (!bodyHtml.trim()) {
      toast.error("Email body is required.");
      return;
    }

    if (vendorType === "CSV" && customRecipients.length === 0) {
      toast.error("Please upload a CSV file with valid emails first.");
      return;
    }

    const confirmSend = confirm(
      vendorType === "CSV"
        ? `Are you sure you want to send this bulk email to the ${customRecipients.length} uploaded CSV recipients?`
        : `Are you sure you want to send this bulk email to all matching ${
            vendorType === "ALL" ? "" : vendorType.toLowerCase()
          } vendors on the ${
            subscriptionPlan === "ALL" ? "any" : subscriptionPlan.toLowerCase()
          } plan?`
    );
    if (!confirmSend) return;

    setIsSending(true);
    const toastId = toast.loading("Fetching matching vendors and sending...");
    try {
      const res = await sendBulkEmailsAction({
        subject,
        bodyHtml,
        vendorType,
        subscriptionPlan,
        customRecipients: vendorType === "CSV" ? customRecipients : undefined,
      });

      if (res.success) {
        toast.success(`Success! Sent bulk emails to ${res.count} recipients.`, { id: toastId, duration: 5000 });
      } else {
        toast.error(res.error || "Failed to send bulk emails.", { id: toastId });
      }
    } catch (e) {
      toast.error("Something went wrong during bulk send.", { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  const getPreviewHtml = () => {
    return bodyHtml.replace(/\[NAME\]/g, "Sample Partner Co.");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Mail className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-sans">Bulk Vendor Emails</h3>
            <p className="text-sm text-slate-500">Draft updates or marketing newsletters to select groups of partners.</p>
          </div>
        </div>

        {/* AI GENERATOR CARD */}
        <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200/50 rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">AI Campaign Generator</h4>
              <p className="text-xs text-slate-500">Enter a topic or context, and Gemini AI will write a beautiful HTML template and subject line.</p>
            </div>
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2 flex-1">
            <input
              type="text"
              placeholder="e.g. Announce 50 photo limit for hotel vendors to update profiles"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full text-xs border border-orange-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-slate-700 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={handleGenerateWithAi}
              disabled={isGenerating || isSending}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 whitespace-nowrap disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Generate
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Composer */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Vendor Type</label>
                <select
                  value={vendorType}
                  onChange={(e) => setVendorType(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="ALL">All Vendors (Combined)</option>
                  <option value="HOTEL">Hotels Only</option>
                  <option value="HOMESTAY">Homestays Only</option>
                  <option value="TAXI">Taxis Only</option>
                  <option value="GUIDE">Guides Only</option>
                  <option value="CSV">Upload Custom List (CSV)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Plan Level</label>
                <select
                  value={subscriptionPlan}
                  onChange={(e) => setSubscriptionPlan(e.target.value)}
                  disabled={vendorType === "CSV"}
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 disabled:bg-slate-50"
                >
                  <option value="ALL">All Plans</option>
                  <option value="FREE">Free Tier</option>
                  <option value="GROWTH">Growth Pro</option>
                  <option value="PRO">Pro Tier</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
            </div>

            {/* Custom CSV Upload block */}
            {vendorType === "CSV" && (
              <div className="bg-orange-50/20 border border-dashed border-orange-200 rounded-xl p-5 text-center transition-all">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-700 mb-0.5">Upload Custom Recipient List (.csv)</p>
                <p className="text-[10px] text-slate-500 mb-3">CSV must contain columns named "email" and "name" or "businessName".</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="block w-full text-xs text-slate-500
                      file:mr-4 file:py-1.5 file:px-3
                      file:rounded-lg file:border-0
                      file:text-xs file:font-semibold
                      file:bg-orange-500 file:text-white
                      hover:file:bg-orange-600 file:cursor-pointer"
                  />
                </div>
                {customRecipients.length > 0 && (
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-green-600 font-semibold bg-green-50/50 py-1.5 px-3 rounded-lg border border-green-100">
                    <CheckCircle2 className="w-4 h-4" />
                    Successfully loaded {customRecipients.length} custom recipients from "{csvFileName}"
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Subject</label>
              <input
                type="text"
                placeholder="e.g. Important Update: Expanded Media Upload Limits"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Body (HTML format)</label>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">Use [NAME] for recipient name</span>
              </div>
              <textarea
                rows={14}
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                className="w-full text-xs font-mono border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-slate-50"
              />
            </div>

            {/* Test Mail Section */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="email"
                placeholder="test-email@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full sm:flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={isTesting || isSending || isGenerating}
                className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Send Test Email
              </button>
            </div>

            {/* Main Dispatch button */}
            <button
              type="button"
              onClick={handleSendBulk}
              disabled={isSending || isTesting || isGenerating}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
            >
              {isSending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {isSending ? "Sending Bulk Broadcast..." : "Send Bulk Broadcast"}
            </button>
          </div>

          {/* Real-time HTML Preview */}
          <div className="flex flex-col border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 h-[650px] lg:h-auto">
            <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex justify-between items-center shrink-0">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-500" /> Real-time Email Preview
              </h4>
              <div className="flex gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
              </div>
            </div>
            
            <div className="p-4 bg-white border-b border-slate-100 flex flex-col gap-1 text-xs text-slate-500 shrink-0">
              <p><strong>From:</strong> WanderKashmir Updates &lt;updates@wanderkashmir.com&gt;</p>
              <p><strong>Subject:</strong> {subject || "(No Subject)"}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
              {bodyHtml.trim() ? (
                <div 
                  className="bg-transparent"
                  dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                  Draft content to preview
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
