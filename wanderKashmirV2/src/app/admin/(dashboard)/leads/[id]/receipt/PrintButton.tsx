"use client";

import React from "react";
import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md hover:shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
    >
      <Printer className="w-4 h-4" />
      <span>Print Voucher / Save as PDF</span>
    </button>
  );
}
