"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Send,
  Eye,
  Sparkles,
  Loader2,
  Users,
  Smartphone,
  Monitor,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  getAudienceCountAction,
  sendBulkEmailAction,
  generateEmailDraftWithAiAction,
} from "@/actions/adminBulkEmails";
import {
  AdminPageHeader,
  AdminToastBanner,
  AdminModal,
  type FeedbackMessage,
} from "@/components/admin/ui";

const DEFAULT_TEMPLATE = `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
  <div style="background: #0F5132; padding: 28px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 22px; font-weight: 700;">WanderKashmir Partner Update</h1>
  </div>
  <div style="padding: 28px; background: #ffffff;">
    <p style="font-size: 15px; margin-top: 0;">Hi <strong>[NAME]</strong>,</p>
    <p>We are sharing important platform updates and seasonal highlights to help grow your bookings and guest inquiries.</p>
    <div style="background: #f8fafc; border-left: 4px solid #0F5132; padding: 14px 16px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; font-weight: 600; color: #0f172a;">Key Update</p>
      <p style="margin: 4px 0 0;">Ensure your rates, seasonal availability, and photos are up to date on your dashboard for optimal traveler visibility.</p>
    </div>
    <p>Please sign in to your partner portal to review your listings or incoming inquiries.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="[BUTTON_URL]" style="background: #0F5132; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">[BUTTON_TEXT]</a>
    </div>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
    <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">Warm regards,<br/><strong>WanderKashmir Team</strong></p>
  </div>
  <div style="padding: 14px; text-align: center; background: #f8fafc; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
    © 2026 WanderKashmir. All rights reserved.
  </div>
</div>`;

export default function BulkEmailsClient() {
  const [audienceType, setAudienceType] = useState<string>("ALL");
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>("ALL");

  const [audienceCount, setAudienceCount] = useState<number>(0);
  const [audienceDesc, setAudienceDesc] = useState<string>("Loading audience count...");
  const [isCounting, setIsCounting] = useState<boolean>(true);

  const [subject, setSubject] = useState<string>("Important Update from WanderKashmir");
  const [bodyHtml, setBodyHtml] = useState<string>(DEFAULT_TEMPLATE);
  const [buttonText, setButtonText] = useState<string>("Go to Partner Dashboard");
  const [buttonUrl, setButtonUrl] = useState<string>("https://vendor.wanderkashmir.com");

  const [customRecipients, setCustomRecipients] = useState<{ email: string; businessName: string }[]>([]);
  const [csvFileName, setCsvFileName] = useState<string>("");

  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const [testEmail, setTestEmail] = useState<string>("");
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<FeedbackMessage | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState<FeedbackMessage | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAudienceChange = (nextAudience: string) => {
    setAudienceType(nextAudience);
    if (nextAudience === "TOURISTS") {
      setButtonText("Explore Trips");
      setButtonUrl("https://wanderkashmir.com");
    } else {
      setButtonText("Go to Partner Dashboard");
      setButtonUrl("https://vendor.wanderkashmir.com");
    }
  };

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
        if (!isMounted) return;
        if (res.success && res.data) {
          setAudienceCount(res.data.count);
          setAudienceDesc(res.data.description);
        } else {
          setAudienceCount(0);
          setAudienceDesc(res.error || "Unable to load recipient count.");
        }
      } catch {
        if (isMounted) {
          setAudienceCount(0);
          setAudienceDesc("Unable to query audience count.");
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
      handleAudienceChange("CSV");
    };
    reader.readAsText(file);
  };

  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      setTestResult({ type: "error", text: "Please enter a valid test email address." });
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
          type: "success",
          text: res.data?.mocked
            ? `[Mocked] Test email simulated for ${testEmail}.`
            : `Test email sent to ${testEmail}.`,
        });
      } else {
        setTestResult({ type: "error", text: res.error || "Failed to deliver test email." });
      }
    } catch (err: unknown) {
      setTestResult({
        type: "error",
        text: err instanceof Error ? err.message : "Communication error.",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleBroadcastConfirm = async () => {
    setIsBroadcasting(true);
    setModalError(null);
    setBroadcastFeedback(null);

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
        setBroadcastFeedback({
          type: "success",
          text: res.data?.mocked
            ? `[Mocked] Broadcast simulated to ${res.data.count} recipients.`
            : `Broadcast sent to ${res.data?.count} recipients.`,
        });
        setIsConfirmModalOpen(false);
      } else {
        const msg = res.error || "Broadcast failed.";
        setModalError(msg);
        setBroadcastFeedback({ type: "error", text: msg });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected broadcast error.";
      setModalError(msg);
      setBroadcastFeedback({ type: "error", text: msg });
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
      } else {
        setAiError(res.error || "Could not generate draft.");
      }
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : "AI generation failed.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const getRenderedPreviewHtml = () => {
    let rendered = bodyHtml.replace(/\[NAME\]/g, "Sample Partner");
    rendered = rendered.replace(/\[BUTTON_TEXT\]/g, buttonText);
    rendered = rendered.replace(/\[BUTTON_URL\]/g, buttonUrl);
    return `<!doctype html><html><head><meta charset="utf-8" /><style>body{margin:0;padding:12px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}</style></head><body>${rendered}</body></html>`;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Bulk Email Broadcast"
        subtitle="Compose, test, and send updates to verified vendors, tourists, or custom CSV recipient lists."
      />

      <AdminToastBanner message={broadcastFeedback} onDismiss={() => setBroadcastFeedback(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Audience */}
          <div className="rounded-md border border-slate-200/90 bg-white p-4.5 space-y-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              <span>1. Target Audience</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="email-audience" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Recipient Group
                </label>
                <select
                  id="email-audience"
                  value={audienceType}
                  onChange={(e) => handleAudienceChange(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
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
                  <label htmlFor="email-plan" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Subscription Plan
                  </label>
                  <select
                    id="email-plan"
                    value={subscriptionPlan}
                    onChange={(e) => setSubscriptionPlan(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
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

            {audienceType === "CSV" && (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                    <span>Upload CSV (Format: email, business_name)</span>
                  </span>
                  {csvFileName && (
                    <span className="text-xs font-medium text-[var(--season-primary)]">{csvFileName}</span>
                  )}
                </div>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCsvUpload}
                  className="text-xs text-slate-600 file:mr-3 file:rounded-md file:border file:border-slate-200 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-50 cursor-pointer"
                />
              </div>
            )}

            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3.5 py-2.5">
              <span className="text-xs text-slate-600">{audienceDesc}</span>
              {isCounting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
              ) : (
                <span className="rounded-md bg-[var(--season-primary-light)] border border-[var(--season-primary)]/25 px-2.5 py-0.5 text-xs font-semibold text-[var(--season-primary-hover)] tabular-nums">
                  {audienceCount} recipients
                </span>
              )}
            </div>
          </div>

          {/* AI Assistant */}
          <div className="rounded-md border border-slate-200/90 bg-white p-4.5 space-y-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-slate-400" />
              <span>AI Draft Assistant</span>
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Seasonal winter rate reminder and photo update guidelines..."
                className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleGenerateAi}
                disabled={isGeneratingAi || !aiPrompt.trim()}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                {isGeneratingAi ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-slate-500" />
                )}
                <span>Generate Draft</span>
              </button>
            </div>
            {aiError && <p className="text-xs text-rose-600">{aiError}</p>}
          </div>

          {/* 2. Content */}
          <div className="rounded-md border border-slate-200/90 bg-white p-4.5 space-y-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>2. Email Content & Call to Action</span>
            </h2>

            <div>
              <label htmlFor="email-subject" className="block text-xs font-medium text-slate-700 mb-1.5">
                Subject Line
              </label>
              <input
                id="email-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject line..."
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="email-cta-text" className="block text-xs font-medium text-slate-700 mb-1.5">
                  CTA Button Text
                </label>
                <input
                  id="email-cta-text"
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                />
              </div>
              <div>
                <label htmlFor="email-cta-url" className="block text-xs font-medium text-slate-700 mb-1.5">
                  CTA Button URL
                </label>
                <input
                  id="email-cta-url"
                  type="text"
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email-body-html" className="block text-xs font-medium text-slate-700 mb-1.5">
                Email Body HTML{" "}
                <span className="font-normal text-slate-500">
                  (Placeholders: <code className="text-slate-700">[NAME]</code>,{" "}
                  <code className="text-slate-700">[BUTTON_TEXT]</code>,{" "}
                  <code className="text-slate-700">[BUTTON_URL]</code>)
                </span>
              </label>
              <textarea
                id="email-body-html"
                rows={12}
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800 focus:border-[var(--season-primary)] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* 3. Test Email */}
          <div className="rounded-md border border-slate-200/90 bg-white p-4.5 space-y-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Send className="h-4 w-4 text-slate-400" />
              <span>3. Send Test Email</span>
            </h2>
            <p className="text-xs text-slate-500">
              Send a single test email tagged with [TEST] before dispatching to the full audience.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your.email@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={isSendingTest || !testEmail}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSendingTest ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5 text-slate-500" />
                )}
                <span>Send Test</span>
              </button>
            </div>
            <AdminToastBanner message={testResult} onDismiss={() => setTestResult(null)} />
          </div>

          {/* Primary Broadcast Trigger */}
          <button
            type="button"
            onClick={() => {
              setModalError(null);
              setIsConfirmModalOpen(true);
            }}
            disabled={audienceCount === 0 || !subject.trim() || !bodyHtml.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[var(--season-primary)] px-4 py-3 text-xs font-semibold text-white shadow-xs hover:bg-[var(--season-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Review & Send Broadcast ({audienceCount} recipients)</span>
          </button>
        </div>

        {/* Right Column: Sandboxed Live Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <div className="rounded-md border border-slate-200/90 bg-white p-4 space-y-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                <Eye className="h-3.5 w-3.5 text-slate-400" />
                <span>Sandboxed Email Preview</span>
              </div>
              <div className="inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-slate-50 p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`rounded-xs p-1.5 transition-colors cursor-pointer ${
                    previewDevice === "desktop"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  title="Desktop preview"
                  aria-label="Desktop preview"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`rounded-xs p-1.5 transition-colors cursor-pointer ${
                    previewDevice === "mobile"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  title="Mobile preview"
                  aria-label="Mobile preview"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-500">
              <div>
                <span className="font-medium text-slate-700">Subject:</span> {subject || "No Subject"}
              </div>
              <div>
                <span className="font-medium text-slate-700">From:</span> WanderKashmir Updates
                &lt;updates@wanderkashmir.com&gt;
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-100 p-3 flex justify-center">
              <iframe
                title="Sandboxed Email Preview"
                sandbox=""
                srcDoc={getRenderedPreviewHtml()}
                className={`bg-white rounded border border-slate-200 transition-all ${
                  previewDevice === "mobile" ? "w-[340px]" : "w-full"
                }`}
                style={{ height: "540px" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AdminModal
        open={isConfirmModalOpen}
        onClose={() => !isBroadcasting && setIsConfirmModalOpen(false)}
        title="Confirm Email Broadcast"
        subtitle="Review recipient count and subject before sending to live email addresses."
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isBroadcasting}
              className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBroadcastConfirm}
              disabled={isBroadcasting}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[var(--season-primary-hover)] disabled:opacity-50 cursor-pointer"
            >
              {isBroadcasting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Confirm & Send</span>
                </>
              )}
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          {modalError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-rose-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5 space-y-2">
            <div className="flex justify-between gap-2 pb-1.5 border-b border-slate-200/70">
              <span className="text-slate-500">Audience</span>
              <span className="font-medium text-slate-900 text-right">{audienceDesc}</span>
            </div>
            <div className="flex justify-between gap-2 pb-1.5 border-b border-slate-200/70">
              <span className="text-slate-500">Total Recipients</span>
              <span className="font-semibold text-[var(--season-primary)]">{audienceCount}</span>
            </div>
            <div className="flex justify-between gap-2 pb-1.5 border-b border-slate-200/70">
              <span className="text-slate-500">Subject</span>
              <span className="font-medium text-slate-900 truncate max-w-[260px]">{subject}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Delivery Provider</span>
              <span className="font-medium text-slate-700">Resend Batch API</span>
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
