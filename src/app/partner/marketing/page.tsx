import React from "react";
import { getVendorSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Award, Download, Copy, Share2, Info } from "lucide-react";
import Image from "next/image";

export default async function MarketingBadgesPage() {
  const session = await getVendorSession();
  if (!session || (session.role !== "VENDOR" && session.role !== "ADMIN")) {
    redirect("/partner");
  }

  const vendorProfile = session.vendorProfileId
    ? await prisma.vendorProfile.findUnique({
        where: { id: session.vendorProfileId },
      })
    : await prisma.vendorProfile.findFirst({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
      });

  if (!vendorProfile || !vendorProfile.isApproved) {
    redirect("/partner/dashboard");
  }

  const businessName = vendorProfile.businessName || "Your Business";
  const vendorUrl = `https://www.wanderkashmir.com/stays`; // In a real app, this would link to their specific profile

  const embedCode = `
<a href="${vendorUrl}" target="_blank" rel="noopener noreferrer">
  <img src="https://www.wanderkashmir.com/images/badges/listed-on-wanderkashmir-light.png" alt="Listed on WanderKashmir" width="200" height="60" />
</a>
  `.trim();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Award className="w-8 h-8 text-orange-500" />
          Digital Marketing Badges
        </h1>
        <p className="text-slate-500 mt-2">
          Promote your partnership with WanderKashmir. Display these official badges on your website and social media to build trust with travelers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Light Badge Card */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-slate-50 p-8 flex items-center justify-center border-b border-slate-100 min-h-[240px]">
            {/* The actual badge design (CSS simulated for now, but usually they'd download a real image) */}
            <div className="bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden flex flex-row items-center w-[260px] select-none hover:scale-105 transition-transform duration-300">
              <div className="bg-sky-500 p-4 flex items-center justify-center">
                <Image src="/icon.png" alt="WanderKashmir" width={32} height={32} className="rounded-md" />
              </div>
              <div className="p-3">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">Listed on</p>
                <p className="text-base font-black text-slate-900 leading-none font-display">
                  Wander<span className="text-sky-500">Kashmir</span>
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Standard Light Badge</h3>
            <p className="text-sm text-slate-500 mb-6">Best for light-colored websites and social media posts.</p>
            
            <div className="flex gap-3">
              <button className="flex-1 bg-sky-500 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-sky-600 transition-colors text-sm">
                <Download className="w-4 h-4" /> Download PNG
              </button>
            </div>
          </div>
        </div>

        {/* Dark Badge Card */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-slate-900 p-8 flex items-center justify-center border-b border-slate-800 min-h-[240px]">
            {/* The actual badge design */}
            <div className="bg-slate-800 border border-slate-700 shadow-xl rounded-xl overflow-hidden flex flex-row items-center w-[260px] select-none hover:scale-105 transition-transform duration-300">
              <div className="bg-sky-500 p-4 flex items-center justify-center">
                <Image src="/icon.png" alt="WanderKashmir" width={32} height={32} className="rounded-md" />
              </div>
              <div className="p-3">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Listed on</p>
                <p className="text-base font-black text-white leading-none font-display">
                  Wander<span className="text-sky-400">Kashmir</span>
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Standard Dark Badge</h3>
            <p className="text-sm text-slate-500 mb-6">Designed specifically for dark mode and dark website footers.</p>
            
            <div className="flex gap-3">
              <button className="flex-1 bg-slate-900 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors text-sm">
                <Download className="w-4 h-4" /> Download PNG
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mt-8">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <Share2 className="w-6 h-6 text-slate-400" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">Website Embed Code</h3>
            <p className="text-sm text-slate-500">Copy this HTML code to embed the badge directly on your website footer.</p>
          </div>
        </div>
        <div className="p-6 bg-slate-50 relative">
          <pre className="text-sm text-slate-600 font-mono bg-slate-900 text-slate-200 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap">
            {embedCode}
          </pre>
          {/* Note: This is a static copy button for UI demonstration. In a real app we'd use a Client Component for clipboard. */}
          <div className="mt-4 flex items-start gap-2 text-sm text-slate-500">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-sky-500" />
            <p>Paste this code right before the closing <code className="bg-slate-200 px-1 py-0.5 rounded text-xs">&lt;/body&gt;</code> tag or in your website's footer widget area.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
