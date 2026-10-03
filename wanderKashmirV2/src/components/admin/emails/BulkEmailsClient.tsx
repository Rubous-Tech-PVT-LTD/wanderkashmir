"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Send,
  Eye,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  RefreshCw,
  Smartphone,
  Monitor,
  ShieldAlert,
  FileText,
  X,
} from "lucide-react";
import {
  getAudienceCountAction,
  sendBulkEmailAction,
  generateEmailDraftWithAiAction,
} from "@/actions/adminBulkEmails";

const DEFAULT_TEMPLATE = `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
  <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 24px; font-weight: 800;">WanderKashmir Partner Update</h1>
  </div>
  <div style="padding: 32px; background: #ffffff;">
    <p style="font-size: 16px; margin-top: 0;">Hi <strong>[NAME]</strong>,</p>
    <p>We are excited to share some important platform updates and marketing highlights with you to help grow your bookings and guest inquiries.</p>
    
    <div style="background: #f8fafc; border-left: 4px solid #f97316; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; font-weight: 600; color: #1e293b;">Key Update:</p>
      <p style="margin: 4px 0 0;">Ensure your rates, seasonal dates, and photos are up to date on your dashboard to receive optimal traveler visibility.</p>
    </div>

    <p>Please log in to your partner portal to inspect your listings or review incoming inquiries.</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="[BUTTON_URL]" style="background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(249,115,22,0.2);">[BUTTON_TEXT]</a>
    </div>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
    <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">Warm regards,<br/><strong>WanderKashmir Admin Team</strong></p>
  </div>
  <div style="padding: 16px; text-align: center; background: #f8fafc; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
    © 2026 WanderKashmir. All rights reserved.
  </div>
</div>`;

export default function BulkEmailsClient() {
  // Audience Filters
  const [audienceType, setAudienceType] = useState<string>("ALL");
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>("ALL");

  // Audience Count
  const [audienceCount, setAudienceCount] = useState<number>(0);
  const [audienceDesc, setAudienceDesc] = useState<string>("Loading audience count...");
  const [isCounting, setIsCounting] = useState<boolean>(true);

  // Content
  const [subject, setSubject] = useState<string>("Important Update from WanderKashmir");
  const [bodyHtml, setBodyHtml] = useState<string>(DEFAULT_TEMPLATE);
  const [buttonText, setButtonText] = useState<string>("Go to Partner Dashboard");
  const [buttonUrl, setButtonUrl] = useState<string>("https://vendor.wanderkashmir.com");

  // CSV State
  const [customRecipients, setCustomRecipients] = useState<{ email: string; businessName: string }[]>([]);
  const [csvFileName, setCsvFileName] = useState<string>("");

  // Preview Mode
  const [previewTab, setPreviewTab] = useState<"code" | "preview">("code");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Test Sending
  const [testEmail, setTestEmail] = useState<string>("");
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Real Broadcast
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastResult, setBroadcastResult] = useState<{ success: boolean; message: string } | null>(null);

  // AI Assistant
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Update default CTA when audience changes
  useEffect(() => {
    if (audienceType === "TOURISTS") {
      setButtonText("Explore Trips");
      setButtonUrl("https://wanderkashmir.com");
    } else {
      setButtonText("Go to Partner Dashboard");
      setButtonUrl("https://vendor.wanderkashmir.com");
    }
  }, [audienceType]);

  // Recalculate audience count on filter changes
  useEffect(() => {
    let isMounted = true;
    async function fetchCount() {
      setIsCounting(true);
      try {
        const res = await getAudienceCountAction({
          audienceType,
          subscriptionPlan,
          csvCount: customRecipients.length,
        });
        if (isMounted && res.success && res.data) {
          setAudienceCount(res.data.count);
          setAudienceDesc(res.data.description);
        }
      } catch {
        if (isMounted) {
          setAudienceDesc("Unable to query count");
        }
      } finally {
        if (isMounted) setIsCounting(false);
      }
    }
    fetchCount();
    return () => {
      isMounted = false;
    };
  }, [audienceType, subscriptionPlan, customRecipients.length]);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const cleanText = text.replace(/^\uFEFF/, "");
      const lines = cleanText.split(/\r?\n/);
      const parsed: { email: string; businessName: string }[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const parts = trimmed.split(",");
        const email = parts[0]?.trim();
        const businessName = parts[1]?.trim() || "Valued Partner";

        if (email && email.includes("@") && email.includes(".")) {
          parsed.push({ email, businessName });
        }
      }

      setCustomRecipients(parsed);
      setAudienceType("CSV");
    };
    reader.readAsText(file);
  };

  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      setTestResult({ success: false, message: "Please enter a valid test email address." });
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await sendBulkEmailAction({
        subject,
        bodyHtml,
        audienceType: "TEST",
        buttonText,
        buttonUrl,
        isTest: true,
        testEmail,
      });

      if (res.success) {
        setTestResult({
          success: true,
          message: res.data?.mocked
            ? `[Mocked] Test email simulated successfully to ${testEmail}.`
            : `Test email successfully dispatched to ${testEmail}.`,
        });
      } else {
        setTestResult({ success: false, message: res.error || "Failed to deliver test email." });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || "Communication error." });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleBroadcastConfirm = async () => {
    setIsBroadcasting(true);
    setBroadcastResult(null);

    try {
      const res = await sendBulkEmailAction({
        subject,
        bodyHtml,
        audienceType,
        subscriptionPlan,
        buttonText,
        buttonUrl,
        isTest: false,
        customRecipients: audienceType === "CSV" ? customRecipients : undefined,
      });

      if (res.success) {
        setBroadcastResult({
          success: true,
          message: res.data?.mocked
            ? `[Mocked Mode] Broadcast simulated to ${res.data.count} recipients without errors.`
            : `Broadcast successfully sent to ${res.data?.count} recipients!`,
        });
        setIsConfirmModalOpen(false);
      } else {
        setBroadcastResult({ success: false, message: res.error || "Broadcast failed." });
      }
    } catch (err: any) {
      setBroadcastResult({ success: false, message: err?.message || "Unexpected broadcast error." });
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleGenerateAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const res = await generateEmailDraftWithAiAction(aiPrompt);
      if (res.success && res.data) {
        setSubject(res.data.subject);
        setBodyHtml(res.data.bodyHtml);
        setPreviewTab("preview");
      } else {
        setAiError(res.error || "Could not generate draft.");
      }
    } catch (err: any) {
      setAiError(err?.message || "AI generation failed.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Preview HTML with replaced variables
  const getRenderedPreviewHtml = () => {
    let rendered = bodyHtml.replace(/\[NAME\]/g, "Sample Partner");
    rendered = rendered.replace(/\[BUTTON_TEXT\]/g, buttonText);
    rendered = rendered.replace(/\[BUTTON_URL\]/g, buttonUrl);
    return rendered;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Mail className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Bulk Email Broadcast Studio</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Compose and broadcast official updates to verified partners, tourists, or custom recipient lists.
          </p>
        </div>
      </div>

      {/* Broadcast Result Banner */}
      {broadcastResult && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            broadcastResult.success
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            {broadcastResult.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {broadcastResult.message}
          </div>
          <button
            onClick={() => setBroadcastResult(null)}
            className="text-xs hover:underline text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Left Controls / Right Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Targeting (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Target Audience Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              1. Target Audience & Recipients
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Recipient Group:</label>
                <select
                  value={audienceType}
                  onChange={(e) => setAudienceType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Approved Vendors</option>
                  <option value="HOTEL">Hotels Only</option>
                  <option value="HOMESTAY">Homestays Only</option>
                  <option value="TAXI">Taxi Operators Only</option>
                  <option value="GUIDE">Tour Guides Only</option>
                  <option value="TOURISTS">Registered Tourists & Customers</option>
                  <option value="CSV">Custom CSV Upload</option>
                </select>
              </div>

              {audienceType !== "TOURISTS" && audienceType !== "CSV" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subscription Plan:</label>
                  <select
                    value={subscriptionPlan}
                    onChange={(e) => setSubscriptionPlan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">All Plans (Free + Paid)</option>
                    <option value="FREE">Free Tier</option>
                    <option value="GROWTH">Growth Tier</option>
                    <option value="PRO">Pro Tier</option>
                    <option value="ENTERPRISE">Enterprise Tier</option>
                  </select>
                </div>
              )}
            </div>

            {/* CSV File Upload Section */}
            {audienceType === "CSV" && (
              <div className="p-4 bg-slate-950/80 border border-dashed border-slate-700 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-orange-400" />
                    Upload CSV (Format: email, business_name)
                  </span>
                  {csvFileName && <span className="text-xs text-emerald-400 font-medium">{csvFileName}</span>}
                </div>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCsvUpload}
                  className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700"
                />
              </div>
            )}

            {/* Live Count Indicator */}
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">{audienceDesc}</span>
              <div className="flex items-center gap-2">
                {isCounting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                    {audienceCount} Recipients
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* AI Drafting Assistant (Optional) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                AI Draft Assistant (Gemini)
              </h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Seasonal winter pricing updates and high-res photo recommendations..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              <button
                type="button"
                onClick={handleGenerateAi}
                disabled={isGeneratingAi || !aiPrompt.trim()}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 flex items-center gap-1.5 disabled:opacity-50 transition"
              >
                {isGeneratingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Generate Draft
              </button>
            </div>
            {aiError && <p className="text-xs text-red-400">{aiError}</p>}
          </div>

          {/* Message Composition Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-orange-400" />
              2. Email Content & Call To Action
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject Line:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject line..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">CTA Button Text:</label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">CTA Button Link URL:</label>
                <input
                  type="text"
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Email Body HTML (<span className="text-orange-400 font-mono">[NAME]</span>, <span className="text-orange-400 font-mono">[BUTTON_TEXT]</span>, <span className="text-orange-400 font-mono">[BUTTON_URL]</span> supported):
                </label>
              </div>
              <textarea
                rows={12}
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                className="w-full font-mono text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Test Dispatch Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-400" />
              3. Send Safe Test Email
            </h3>
            <p className="text-xs text-slate-400">
              Sends an isolated single test email to your inbox with a [TEST] subject tag before sending to the audience.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your.email@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={isSendingTest || !testEmail}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 text-slate-950 hover:bg-sky-400 flex items-center gap-1.5 disabled:opacity-50 transition"
              >
                {isSendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Send Test
              </button>
            </div>
            {testResult && (
              <div
                className={`p-2.5 rounded-xl text-xs font-medium ${
                  testResult.success
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                }`}
              >
                {testResult.message}
              </div>
            )}
          </div>

          {/* Final Broadcast Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={audienceCount === 0 || !subject.trim() || !bodyHtml.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Send className="w-4 h-4" />
              Review & Send Broadcast ({audienceCount} Recipients)
            </button>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sticky top-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Eye className="w-4 h-4 text-emerald-400" />
                Live Email Preview
              </div>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    previewDevice === "desktop" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                  }`}
                  title="Desktop Preview"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    previewDevice === "mobile" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                  }`}
                  title="Mobile Preview"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <div>
                <strong className="text-slate-300">Subject:</strong> {subject || "No Subject"}
              </div>
              <div>
                <strong className="text-slate-300">From:</strong> WanderKashmir Updates &lt;updates@wanderkashmir.com&gt;
              </div>
            </div>

            {/* Email Container Simulation */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-hidden flex justify-center">
              <div
                className={`bg-white rounded-lg shadow-inner overflow-hidden transition-all ${
                  previewDevice === "mobile" ? "w-[340px]" : "w-full"
                }`}
                style={{ maxHeight: "680px", overflowY: "auto" }}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: getRenderedPreviewHtml() }}
                  className="p-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explicit Safety Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto border border-orange-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Confirm Production Email Broadcast</h3>
              <p className="text-xs text-slate-400">
                You are about to dispatch an email to live production recipients. Please review the details carefully.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Audience:</span>
                <span className="text-white font-semibold">{audienceDesc}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Total Count:</span>
                <span className="text-orange-400 font-bold">{audienceCount} recipients</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Subject:</span>
                <span className="text-white font-semibold truncate max-w-[280px]">{subject}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Delivery Service:</span>
                <span className="text-emerald-400 font-semibold">Resend REST Batch API</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isBroadcasting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBroadcastConfirm}
                disabled={isBroadcasting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-400 text-slate-950 flex items-center gap-1.5 disabled:opacity-50 transition"
              >
                {isBroadcasting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Confirm & Send Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
