import { Banknote, Download, ArrowRightLeft } from "lucide-react";
import { getPayoutsSummary, markVendorPaid } from "@/actions/payouts";
import { redirect } from "next/navigation";

export default async function PayoutsView() {
  const { success, payouts, error } = await getPayoutsSummary();

  if (!success) {
    if (error === "Unauthorized" || error === "Forbidden") {
      redirect("/sign-in");
    }
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  const validPayouts = payouts || [];
  
  const totalPending = validPayouts.reduce((acc, p) => acc + p.pendingBalance, 0);
  const totalProfit = validPayouts.reduce((acc, p) => acc + (p.totalGenerated - p.totalEarnings), 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vendor Payouts</h1>
          <p className="text-slate-500 mt-1">Manage commissions and transfer funds to your partners.</p>
        </div>
        <button className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-sky-600 transition-colors shadow-sm">
          <ArrowRightLeft className="w-4 h-4" />
          Process Batch Payout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-500 mb-2">Pending Payouts</h3>
          <p className="text-3xl font-bold text-slate-900">₹{totalPending.toLocaleString()}</p>
          <p className="text-slate-500 text-sm mt-1">To be transferred</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-500 mb-2">Your Commission (Profit)</h3>
          <p className="text-3xl font-bold text-sky-600">₹{totalProfit.toLocaleString()}</p>
          <p className="text-slate-500 text-sm mt-1">From all settlements</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center items-center text-center border-dashed">
          <Banknote className="w-8 h-8 text-slate-400 mb-2" />
          <h3 className="text-sm font-semibold text-slate-900">Automated Transfers</h3>
          <p className="text-xs text-slate-500 mt-1 px-4">Connect Razorpay Route to automate this process.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Settlement Queue</h2>
          <button className="text-sky-600 text-sm font-medium hover:text-sky-700 flex items-center gap-1">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="p-4">Vendor</th>
              <th className="p-4">Bank Details</th>
              <th className="p-4">Gross Sales</th>
              <th className="p-4 text-orange-600">Platform Comm.</th>
              <th className="p-4 text-sky-600">Pending Transfer</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {validPayouts.map((payout) => (
              <tr key={payout.vendorId} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <div className="text-sm font-bold text-slate-900">{payout.businessName}</div>
                </td>
                <td className="p-4 text-xs text-slate-600">
                  <div className="font-medium text-slate-900">{payout.accountHolderName || "N/A"}</div>
                  <div>{payout.bankName || "N/A"} - {payout.accountNumber || "N/A"}</div>
                  <div className="text-slate-400">{payout.ifscCode || "N/A"}</div>
                </td>
                <td className="p-4 text-sm font-medium text-slate-900">₹{payout.totalGenerated.toLocaleString()}</td>
                <td className="p-4 text-sm font-medium text-orange-600">-₹{(payout.totalGenerated - payout.totalEarnings).toLocaleString()}</td>
                <td className="p-4 text-sm font-bold text-sky-600">₹{payout.pendingBalance.toLocaleString()}</td>
                <td className="p-4">
                  {payout.pendingBalance > 0 ? (
                    <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">To Pay</span>
                  ) : (
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Settled</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {payout.pendingBalance > 0 && (
                    <form action={async () => {
                      "use server";
                      await markVendorPaid(payout.vendorId);
                    }}>
                      <button type="submit" className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors">
                        Mark Paid
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {validPayouts.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No vendors have generated revenue yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
