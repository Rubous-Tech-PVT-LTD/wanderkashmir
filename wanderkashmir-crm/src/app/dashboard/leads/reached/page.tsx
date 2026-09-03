"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

type ReachedLead = {
  id: string;
  leadId: string;
  baId: string;
  source: 'MANUAL' | 'AUTOMATIC';
  reachedAt: string;
  remarks: string | null;
  lead: {
    id: string;
    companyName: string;
    contactPerson: string | null;
    status: string;
    phone: string;
  };
  ba: {
    id: string;
    name: string;
  };
};

export default function ReachedLeadsPage() {
  const [reachedLeads, setReachedLeads] = useState<ReachedLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [baFilter, setBaFilter] = useState("ALL");
  const [bas, setBas] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    fetchLeads();
  }, [baFilter]);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const url = new URL("/api/leads/reached", window.location.origin);
      if (baFilter !== "ALL") {
        url.searchParams.set("baId", baFilter);
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch reached leads");
      const data = await res.json();
      setReachedLeads(data.data || []);
      
      // Extract unique BAs for filter if not already populated
      if (bas.length === 0) {
        const uniqueBas = Array.from(new Set(data.data.map((r: any) => JSON.stringify(r.ba)))).map((r: any) => JSON.parse(r));
        setBas(uniqueBas as {id: string, name: string}[]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reached Leads</h1>
          <p className="text-sm text-gray-500 mt-1">
            Leads that have reached the end of the follow-up process or were marked directly completed.
          </p>
        </div>
        
        {bas.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter by BA:</label>
            <select 
              value={baFilter}
              onChange={(e) => setBaFilter(e.target.value)}
              className="border border-gray-300 rounded-md shadow-sm px-3 py-1.5 text-sm focus:ring-primary focus:border-primary"
            >
              <option value="ALL">All BAs</option>
              {bas.map(ba => (
                <option key={ba.id} value={ba.id}>{ba.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reached At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : reachedLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No reached leads found.</td>
                </tr>
              ) : (
                reachedLeads.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.lead.companyName}</div>
                      {record.lead.contactPerson && (
                        <div className="text-sm text-gray-500">{record.lead.contactPerson}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.lead.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {record.lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.source === 'AUTOMATIC' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {record.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.ba.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(record.reachedAt), "dd MMM yyyy, HH:mm")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={record.remarks || ''}>
                      {record.remarks || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
