"use client";

import { useState, useEffect } from "react";
import { Users, Filter, CheckCircle, Share2, History, X } from "lucide-react";
import Link from "next/link";

interface BA {
  id: string;
  name: string;
  email: string;
}

interface HistoryLog {
  id: string;
  createdAt: string;
  adminName: string;
  mode: string;
  totalAssigned: number;
  baCount: number;
  distribution: Record<string, number>;
  lastAssignedBaId: string | null;
}

export default function LeadAssignmentPage() {
  const [unassignedCount, setUnassignedCount] = useState<number>(0);
  const [availableBAs, setAvailableBAs] = useState<BA[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<string>("");
  const [selectedBaIds, setSelectedBaIds] = useState<string[]>([]);
  const [includeAdminBA, setIncludeAdminBA] = useState(false);
  const [mode, setMode] = useState<"EQUAL" | "ROUND_ROBIN">("ROUND_ROBIN");
  const [includeAssigned, setIncludeAssigned] = useState(false);
  const [history, setHistory] = useState<HistoryLog[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/leads/assign-bulk");
      if (!res.ok) throw new Error("Failed to load assignment config");
      const data = await res.json();
      
      setUnassignedCount(data.unassignedCount);
      setAvailableBAs(data.activeBAs);
      setCurrentAdminId(data.currentAdminId);
      
      // Default selection: all active BAs EXCEPT the admin's own profile
      const defaultIds = data.activeBAs
        .filter((ba: BA) => ba.id !== data.currentAdminId)
        .map((ba: BA) => ba.id);
        
      setSelectedBaIds(defaultIds);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/leads/assignment-history");
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchConfig();
    fetchHistory();
  }, []);

  const handleBaToggle = (baId: string) => {
    setSelectedBaIds(prev => 
      prev.includes(baId) ? prev.filter(id => id !== baId) : [...prev, baId]
    );
  };

  const toggleSelectAll = () => {
    const eligibleBAs = availableBAs
      .filter(ba => includeAdminBA || ba.id !== currentAdminId)
      .map(ba => ba.id);
      
    if (selectedBaIds.length === eligibleBAs.length) {
      setSelectedBaIds([]);
    } else {
      setSelectedBaIds(eligibleBAs);
    }
  };

  const handleIncludeAdminBAToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIncludeAdminBA(checked);
    if (checked) {
      // Add admin BA if not present
      if (!selectedBaIds.includes(currentAdminId) && availableBAs.some(ba => ba.id === currentAdminId)) {
        setSelectedBaIds(prev => [...prev, currentAdminId]);
      }
    } else {
      // Remove admin BA
      setSelectedBaIds(prev => prev.filter(id => id !== currentAdminId));
    }
  };

  // Preview logic
  const renderPreview = () => {
    if (selectedBaIds.length === 0) return null;
    const leadsToDistribute = unassignedCount; // Simplification, if includeAssigned is true this might be different but we don't know total count
    const base = Math.floor(leadsToDistribute / selectedBaIds.length);
    const remainder = leadsToDistribute % selectedBaIds.length;
    
    return (
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">Assignment Preview</h4>
        <p className="text-sm text-blue-800 mb-4">
          Distributing ~{leadsToDistribute} leads among {selectedBaIds.length} selected BAs.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {selectedBaIds.map((baId, index) => {
            const ba = availableBAs.find(b => b.id === baId);
            const approxLeads = base + (index < remainder && mode === "EQUAL" ? 1 : 0);
            return (
              <div key={baId} className="bg-white p-2 rounded border text-sm flex justify-between">
                <span className="font-medium truncate pr-2">{ba?.name}</span>
                <span className="text-gray-500">~{approxLeads}</span>
              </div>
            );
          })}
        </div>
        {mode === "ROUND_ROBIN" && (
          <p className="text-xs text-blue-600 mt-3 italic">
            * Actual distribution counts may shift slightly based on previous batch's rotation state.
          </p>
        )}
      </div>
    );
  };

  const submitAssignment = async () => {
    if (selectedBaIds.length === 0) return;
    setIsAssigning(true);
    setError("");
    setSuccess(null);
    
    try {
      const res = await fetch("/api/leads/assign-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baIds: selectedBaIds,
          mode,
          includeAssigned
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to assign leads");
      
      setSuccess(data);
      setShowPreview(false);
      fetchConfig();
      fetchHistory();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading Configuration...</div>;
  }

  const adminBAExists = availableBAs.some(ba => ba.id === currentAdminId);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Share2 className="h-6 w-6 text-primary" />
            Lead Assignment Control Center
          </h2>
          <p className="text-gray-500 text-sm mt-1">Bulk distribute leads to your Business Associates safely.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-white p-6 border-t-4 border-t-primary">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">1. Select Target Leads</h3>
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                Unassigned Leads: <span className="text-primary font-bold">{unassignedCount}</span>
              </div>
            </div>
            
            <label className="flex items-center gap-2 text-sm text-gray-700 mt-4 p-3 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-primary focus:ring-primary"
                checked={includeAssigned}
                onChange={e => setIncludeAssigned(e.target.checked)}
              />
              Include existing assigned leads (Warning: May disrupt active workloads)
            </label>
          </div>

          <div className="card-white p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-2">
              <h3 className="text-lg font-semibold text-gray-800">2. Select Business Associates</h3>
              <button onClick={toggleSelectAll} className="text-sm text-primary hover:underline self-start md:self-auto">
                {selectedBaIds.length > 0 ? "Clear Selection" : "Select All BAs"}
              </button>
            </div>

            {adminBAExists && (
              <label className="flex items-center gap-2 text-sm text-gray-700 mb-4 p-2 bg-yellow-50 rounded border border-yellow-200 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
                  checked={includeAdminBA}
                  onChange={handleIncludeAdminBAToggle}
                />
                Include my BA account ({availableBAs.find(b => b.id === currentAdminId)?.name}) in distribution
              </label>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
              {availableBAs.map(ba => {
                if (!includeAdminBA && ba.id === currentAdminId) return null;
                return (
                  <label 
                    key={ba.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedBaIds.includes(ba.id) ? 'bg-primary/5 border-primary' : 'hover:bg-gray-50'}`}
                  >
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5"
                      checked={selectedBaIds.includes(ba.id)}
                      onChange={() => handleBaToggle(ba.id)}
                    />
                    <div className="flex-1 truncate">
                      <div className="font-medium text-sm text-gray-900 truncate">{ba.name}</div>
                      <div className="text-xs text-gray-500 truncate">{ba.email}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="card-white p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">3. Assignment Mode</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${mode === 'EQUAL' ? 'border-primary ring-1 ring-primary' : 'border-gray-300'}`}>
                <input type="radio" name="mode" value="EQUAL" className="sr-only" onChange={() => setMode("EQUAL")} checked={mode === "EQUAL"} />
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">Equal Workload</span>
                    <span className="mt-1 flex items-center text-xs text-gray-500">Distributes leads as evenly as possible. Max difference is 1 lead.</span>
                  </span>
                </span>
                <CheckCircle className={`h-5 w-5 ${mode === 'EQUAL' ? 'text-primary' : 'text-transparent'}`} aria-hidden="true" />
              </label>

              <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${mode === 'ROUND_ROBIN' ? 'border-primary ring-1 ring-primary' : 'border-gray-300'}`}>
                <input type="radio" name="mode" value="ROUND_ROBIN" className="sr-only" onChange={() => setMode("ROUND_ROBIN")} checked={mode === "ROUND_ROBIN"} />
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">Balanced Round-Robin</span>
                    <span className="mt-1 flex items-center text-xs text-gray-500">Preserves rotation state across batches to prevent same BA always getting first leads.</span>
                  </span>
                </span>
                <CheckCircle className={`h-5 w-5 ${mode === 'ROUND_ROBIN' ? 'text-primary' : 'text-transparent'}`} aria-hidden="true" />
              </label>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm">
                <p className="font-bold">Successfully assigned {success.assigned} leads.</p>
                <div className="mt-2 text-xs">
                  {Object.entries(success.distribution).map(([baId, count]) => (
                    <div key={baId}>{availableBAs.find(b => b.id === baId)?.name}: {count as number}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t flex flex-col md:flex-row justify-end gap-3 sticky bottom-4">
              {!showPreview ? (
                <button
                  onClick={() => setShowPreview(true)}
                  disabled={selectedBaIds.length === 0 || unassignedCount === 0}
                  className="btn-outline w-full md:w-auto disabled:opacity-50"
                >
                  Preview Assignment
                </button>
              ) : (
                <>
                  <button onClick={() => setShowPreview(false)} className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    onClick={submitAssignment}
                    disabled={isAssigning}
                    className="btn-primary w-full md:w-auto flex justify-center items-center gap-2"
                  >
                    {isAssigning ? "Assigning..." : `Confirm Assignment`}
                  </button>
                </>
              )}
            </div>

            {showPreview && (
              <div className="mt-6">
                {renderPreview()}
              </div>
            )}
          </div>
        </div>

        {/* Right column - History */}
        <div className="lg:col-span-1">
          <div className="card-white p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-gray-500" />
              Recent Assignments
            </h3>
            
            {history.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No recent assignments found.</p>
            ) : (
              <div className="space-y-4">
                {history.map(item => (
                  <div key={item.id} className="border rounded-lg p-3 text-sm bg-gray-50 relative group">
                    <div className="font-medium text-gray-900">{new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-gray-600 mt-1 flex justify-between">
                      <span>Total Leads:</span>
                      <span className="font-medium">{item.totalAssigned}</span>
                    </div>
                    <div className="text-gray-600 flex justify-between">
                      <span>BAs Involved:</span>
                      <span>{item.baCount}</span>
                    </div>
                    <div className="text-gray-600 flex justify-between">
                      <span>Mode:</span>
                      <span className="text-xs bg-gray-200 px-1 rounded">{item.mode === 'EQUAL' ? 'Equal' : 'Round-Robin'}</span>
                    </div>
                    <div className="text-gray-600 flex justify-between">
                      <span>Admin:</span>
                      <span className="truncate max-w-[100px]">{item.adminName}</span>
                    </div>
                    
                    {/* Hover tooltip for breakdown */}
                    <div className="hidden group-hover:block absolute top-0 right-full mr-2 w-48 bg-gray-800 text-white text-xs rounded p-2 shadow-xl z-10">
                      <p className="font-bold mb-1 border-b border-gray-600 pb-1">Distribution</p>
                      {Object.entries(item.distribution).map(([name, count]) => (
                        <div key={name} className="flex justify-between">
                          <span className="truncate pr-2">{name}</span>
                          <span>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
