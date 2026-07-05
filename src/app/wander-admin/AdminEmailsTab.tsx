"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Eye, RefreshCw } from "lucide-react";
import { sendBulkEmailsAction } from "@/actions/emails";
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
  const [showPreview, setShowPreview] = useState(false);

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

    const confirmSend = confirm(
      `Are you sure you want to send this bulk email to all matching ${
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
      });

      if (res.success) {
        toast.success(`Success! Sent bulk emails to ${res.count} vendors.`, { id: toastId, duration: 5000 });
      } else {
        toast.error(res.error || "Failed to send bulk emails.", { id: toastId });
      }
    } catch (e) {
      toast.error("Something went wrong during bulk send.", { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  // Simple preview placeholder replacement
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
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Plan Level</label>
                <select
                  value={subscriptionPlan}
                  onChange={(e) => setSubscriptionPlan(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="ALL">All Plans</option>
                  <option value="FREE">Free Tier</option>
                  <option value="GROWTH">Growth Pro</option>
                  <option value="PRO">Pro Tier</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
            </div>

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
                disabled={isTesting || isSending}
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
              disabled={isSending || isTesting}
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
