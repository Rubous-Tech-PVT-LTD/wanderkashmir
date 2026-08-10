"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Checkout Error:", error);
  }, [error]);

  return (
    <div className="container-custom py-24 flex justify-center min-h-[60vh] items-center">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 text-center max-w-lg w-full">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-4">Something went wrong!</h1>
        <p className="text-slate-500 mb-8">
          We encountered an issue while loading your checkout session. Don't worry, if your payment was successful, your booking is safe.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="btn-primary w-full inline-block text-center py-3"
          >
            Try again
          </button>
          <a href="/trips" className="text-slate-600 font-medium hover:text-slate-900 py-2">
            Check My Bookings
          </a>
        </div>
      </div>
    </div>
  );
}
