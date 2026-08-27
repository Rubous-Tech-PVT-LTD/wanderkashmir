"use client";

import { useState, useEffect } from "react";
import { Share2, History, CheckCircle, RefreshCw, AlertTriangle, Plus, ChevronRight } from "lucide-react";

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
  action: string;
  totalAssigned: number;
  baCount: number;
  distribution: Record<string, number>;
}

interface RotationBatch {
  id: string;
  createdAt: string;
  selectedBaIds: string[];
  currentRotation: number;
  maxRotations: number;
  _count: { leads: number };
}

export default function LeadAssignmentPage() {
  const [activeTab, setActiveTab] = useState<"ASSIGN" | "ROTATE">("ASSIGN");
  
  // Shared state
  const [availableBAs, setAvailableBAs] = useState<BA[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<string>("");
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Assign state
  const [unassignedCount, setUnassignedCount] = useState<number>(0);
  const [selectedAssignBaIds, setSelectedAssignBaIds] = useState<string[]>([]);
  const [includeAdminBA, setIncludeAdminBA] = useState(false);
  const [mode, setMode] = useState<"EQUAL" | "ROUND_ROBIN">("ROUND_ROBIN");
  const [assignMaxR, setAssignMaxR] = useState<number>(0);
  
  // Rotate state
  const [activeBatches, setActiveBatches] = useState<RotationBatch[]>([]);
  const [selectedRotateBaIds, setSelectedRotateBaIds] = useState<string[]>([]);
  const [rotateMaxR, setRotateMaxR] = useState<number>(0);
  const [includePartners, setIncludePartners] = useState(false);
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [previewRotation, setPreviewRotation] = useState<any>(null);

  // Common UI State
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/leads/assign-bulk");
      if (!res.ok) throw new Error("Failed to load assignment config");
      const data = await res.json();
      
      setUnassignedCount(data.unassignedCount);
      setAvailableBAs(data.activeBAs);
      setCurrentAdminId(data.currentAdminId);
      
      const defaultIds = data.activeBAs
        .filter((ba: BA) => ba.id !== data.currentAdminId)
        .map((ba: BA) => ba.id);
        
      setSelectedAssignBaIds(defaultIds);
      setAssignMaxR(defaultIds.length);
      setSelectedRotateBaIds(defaultIds);
      setRotateMaxR(defaultIds.length);
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

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/leads/rotation-batches");
      if (res.ok) {
        const data = await res.json();
        setActiveBatches(data.batches);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchConfig();
    fetchHistory();
    fetchBatches();
  }, []);

  // --- Assign Helpers ---
  const toggleAssignBa = (baId: string) => {
    setSelectedAssignBaIds(prev => {
      const next = prev.includes(baId) ? prev.filter(id => id !== baId) : [...prev, baId];
      setAssignMaxR(next.length);
      return next;
    });
  };

  const toggleAssignSelectAll = () => {
    const eligible = availableBAs.filter(ba => includeAdminBA || ba.id !== currentAdminId).map(ba => ba.id);
    if (selectedAssignBaIds.length === eligible.length) {
      setSelectedAssignBaIds([]);
      setAssignMaxR(0);
    } else {
      setSelectedAssignBaIds(eligible);
      setAssignMaxR(eligible.length);
    }
  };

  const submitAssignment = async () => {
    if (selectedAssignBaIds.length === 0) return;
    setIsAssigning(true);
    setError("");
    setSuccess(null);
    
    try {
      const res = await fetch("/api/leads/assign-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baIds: selectedAssignBaIds,
          mode,
          maxRotations: assignMaxR
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign leads");
      
      setSuccess({ message: `Successfully assigned ${data.assigned} leads.` });
      setShowPreview(false);
      fetchConfig();
      fetchHistory();
      fetchBatches(); // Might have created a new batch
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  // --- Rotate Helpers ---
  const toggleRotateBa = (baId: string) => {
    setSelectedRotateBaIds(prev => {
      const next = prev.includes(baId) ? prev.filter(id => id !== baId) : [...prev, baId];
      setRotateMaxR(next.length);
      return next;
    });
  };

  const toggleRotateSelectAll = () => {
    const eligible = availableBAs.filter(ba => ba.id !== currentAdminId).map(ba => ba.id);
    if (selectedRotateBaIds.length === eligible.length) {
      setSelectedRotateBaIds([]);
      setRotateMaxR(0);
    } else {
      setSelectedRotateBaIds(eligible);
      setRotateMaxR(eligible.length);
    }
  };

  const createRotationBatch = async () => {
    setIsCreatingBatch(true);
    setError("");
    setSuccess(null);
    try {
      const res = await fetch("/api/leads/rotation-batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baIds: selectedRotateBaIds,
          maxRotations: rotateMaxR,
          includePartners
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create batch");
      setSuccess({ message: `Successfully grouped and rotated ${data.rotated} leads.` });
      fetchBatches();
      fetchHistory();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreatingBatch(false);
    }
  };

  const executeRotation = async (batchId: string) => {
    if (!previewRotation) {
      // Just showing preview before acting
      setPreviewRotation(batchId);
      return;
    }
    
    setIsRotating(true);
    setError("");
    setSuccess(null);
    try {
      const res = await fetch("/api/leads/rotate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId,
          includePartners: false // UI doesn't support changing this once batch is live
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to rotate leads");
      
      setSuccess({ message: `Successfully rotated ${data.rotated} leads. Now at cycle ${data.newRotationCount}.` });
      setPreviewRotation(null);
      fetchBatches();
      fetchHistory();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRotating(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading Configuration...</div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-2">
        <Share2 className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-gray-900">Lead Assignment & Rotation</h2>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-full max-w-md">
        <button
          onClick={() => { setActiveTab("ASSIGN"); setError(""); setSuccess(null); }}
          className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === "ASSIGN" ? "bg-white text-primary shadow" : "text-gray-500 hover:text-gray-700"}`}
        >
          Assign New Leads
        </button>
        <button
          onClick={() => { setActiveTab("ROTATE"); setError(""); setSuccess(null); }}
          className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === "ROTATE" ? "bg-white text-primary shadow" : "text-gray-500 hover:text-gray-700"}`}
        >
          Rotate Existing Leads
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm">{error}</div>}
          {success && <div className="p-4 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm">{success.message}</div>}

          {/* TAB 1: ASSIGN */}
          {activeTab === "ASSIGN" && (
            <>
              <div className="card-white p-6 border-t-4 border-t-primary">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">1. Select Target Leads</h3>
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                    Unassigned Leads: <span className="text-primary font-bold">{unassignedCount}</span>
                  </div>
                </div>
              </div>

              <div className="card-white p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">2. Select BAs</h3>
                  <button onClick={toggleAssignSelectAll} className="text-sm text-primary hover:underline">
                    {selectedAssignBaIds.length > 0 ? "Clear" : "Select All"}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1 mb-4">
                  {availableBAs.map(ba => {
                    if (!includeAdminBA && ba.id === currentAdminId) return null;
                    return (
                      <label key={ba.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${selectedAssignBaIds.includes(ba.id) ? 'bg-primary/5 border-primary' : 'hover:bg-gray-50'}`}>
                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary w-5 h-5" checked={selectedAssignBaIds.includes(ba.id)} onChange={() => toggleAssignBa(ba.id)} />
                        <span className="font-medium text-sm text-gray-900 truncate">{ba.name}</span>
                      </label>
                    );
                  })}
                </div>
                
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <label className="text-sm font-medium text-gray-700 flex-1">Max Future Rotations:</label>
                  <input type="number" min="0" max={selectedAssignBaIds.length} value={assignMaxR} onChange={e => setAssignMaxR(Number(e.target.value))} className="border rounded p-2 w-24 text-center" />
                </div>
                <p className="text-xs text-gray-500 mt-1">This sets the limit for manual rotations later.</p>
              </div>

              <div className="card-white p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">3. Assignment Mode</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${mode === 'EQUAL' ? 'border-primary ring-1 ring-primary' : 'border-gray-300'}`}>
                    <input type="radio" name="mode" value="EQUAL" className="sr-only" onChange={() => setMode("EQUAL")} checked={mode === "EQUAL"} />
                    <span className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">Equal Workload</span>
                      <span className="mt-1 text-xs text-gray-500">Distributes evenly. Difference never exceeds 1.</span>
                    </span>
                    <CheckCircle className={`ml-auto h-5 w-5 ${mode === 'EQUAL' ? 'text-primary' : 'text-transparent'}`} />
                  </label>
                  <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${mode === 'ROUND_ROBIN' ? 'border-primary ring-1 ring-primary' : 'border-gray-300'}`}>
                    <input type="radio" name="mode" value="ROUND_ROBIN" className="sr-only" onChange={() => setMode("ROUND_ROBIN")} checked={mode === "ROUND_ROBIN"} />
                    <span className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">Balanced Round-Robin</span>
                      <span className="mt-1 text-xs text-gray-500">Preserves historical rotation state.</span>
                    </span>
                    <CheckCircle className={`ml-auto h-5 w-5 ${mode === 'ROUND_ROBIN' ? 'text-primary' : 'text-transparent'}`} />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 sticky bottom-4">
                {!showPreview ? (
                  <button onClick={() => setShowPreview(true)} disabled={selectedAssignBaIds.length === 0 || unassignedCount === 0} className="btn-primary shadow-lg">
                    Preview Assignment
                  </button>
                ) : (
                  <div className="flex flex-col w-full bg-white p-4 border rounded-lg shadow-xl">
                    <p className="font-semibold text-gray-800 mb-2">Ready to assign ~{unassignedCount} leads to {selectedAssignBaIds.length} BAs.</p>
                    <div className="flex justify-end gap-3 mt-4">
                      <button onClick={() => setShowPreview(false)} className="px-4 py-2 text-gray-600 border rounded-md">Cancel</button>
                      <button onClick={submitAssignment} disabled={isAssigning} className="btn-primary">{isAssigning ? "Assigning..." : "Confirm Assignment"}</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: ROTATE */}
          {activeTab === "ROTATE" && (
            <>
              {activeBatches.length > 0 && (
                <div className="card-white p-6 border-t-4 border-t-amber-500">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-amber-500" /> Active Rotation Batches
                  </h3>
                  <div className="space-y-4">
                    {activeBatches.map(batch => (
                      <div key={batch.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm text-gray-500">{new Date(batch.createdAt).toLocaleDateString()}</div>
                          <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">
                            Cycle {batch.currentRotation} / {batch.maxRotations}
                          </div>
                        </div>
                        <p className="font-medium text-gray-800">{batch._count.leads} Leads actively tracking rotation</p>
                        <p className="text-xs text-gray-500 mt-1">
                          BAs involved: {batch.selectedBaIds.map(id => availableBAs.find(b=>b.id===id)?.name).filter(Boolean).join(", ")}
                        </p>
                        
                        {previewRotation === batch.id ? (
                          <div className="mt-4 p-4 border rounded bg-white shadow-inner">
                            <p className="text-sm font-semibold mb-2 text-red-600 flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" /> This will shift ownership mapping deterministically.
                            </p>
                            <div className="flex justify-end gap-2 mt-4">
                              <button onClick={() => setPreviewRotation(null)} className="px-3 py-1 text-sm border rounded">Cancel</button>
                              <button onClick={() => executeRotation(batch.id)} disabled={isRotating} className="btn-primary text-sm px-4 py-1">
                                {isRotating ? "Rotating..." : "Confirm Rotation"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 flex justify-end">
                            <button 
                              onClick={() => executeRotation(batch.id)}
                              disabled={batch.currentRotation >= batch.maxRotations}
                              className="btn-outline text-sm px-4 py-1 flex items-center gap-1"
                            >
                              <RefreshCw className="h-4 w-4" /> 
                              {batch.currentRotation >= batch.maxRotations ? "Cycle Complete" : "Rotate Now"}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="card-white p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-gray-500" /> Start New Rotation Pool
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select BAs to group their currently assigned leads into a new rotation batch. 
                  This will IMMEDIATELY execute Rotation 1.
                </p>

                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-gray-700 text-sm">Select BAs to Pool:</span>
                  <button onClick={toggleRotateSelectAll} className="text-sm text-primary hover:underline">
                    {selectedRotateBaIds.length > 0 ? "Clear" : "Select All"}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1 mb-4">
                  {availableBAs.map(ba => {
                    if (ba.id === currentAdminId) return null; // Admin usually excluded from manual rotation pools
                    return (
                      <label key={ba.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${selectedRotateBaIds.includes(ba.id) ? 'bg-primary/5 border-primary' : 'hover:bg-gray-50'}`}>
                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary w-5 h-5" checked={selectedRotateBaIds.includes(ba.id)} onChange={() => toggleRotateBa(ba.id)} />
                        <span className="font-medium text-sm text-gray-900 truncate">{ba.name}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <label className="text-sm font-medium text-gray-700 flex-1">Maximum Rotations:</label>
                  <input type="number" min="1" max={selectedRotateBaIds.length} value={rotateMaxR} onChange={e => setRotateMaxR(Number(e.target.value))} className="border rounded p-2 w-24 text-center" />
                </div>

                <label className="flex items-center gap-2 mt-4 text-sm text-red-700 p-3 bg-red-50 rounded border border-red-200 cursor-pointer">
                  <input type="checkbox" checked={includePartners} onChange={e => setIncludePartners(e.target.checked)} className="rounded border-red-300 text-red-600 focus:ring-red-500 w-4 h-4" />
                  Include active Partners & Converted leads (WARNING: Highly disruptive)
                </label>

                <div className="mt-6 flex justify-end">
                  <button onClick={createRotationBatch} disabled={selectedRotateBaIds.length < 2 || isCreatingBatch} className="btn-primary shadow-lg">
                    {isCreatingBatch ? "Creating..." : "Start & Rotate Now"}
                  </button>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Right column - History */}
        <div className="lg:col-span-1">
          <div className="card-white p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-gray-500" />
              History Log
            </h3>
            
            {history.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No recent history.</p>
            ) : (
              <div className="space-y-4">
                {history.map(item => (
                  <div key={item.id} className={`border rounded-lg p-3 text-sm relative group ${item.action === 'ROTATE_LEADS' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}`}>
                    <div className="font-medium text-gray-900">{new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                      {item.action === 'ROTATE_LEADS' ? 'Rotation' : 'Bulk Assign'}
                    </div>
                    
                    {item.action === 'ROTATE_LEADS' ? (
                      <div className="text-gray-700 mt-2 space-y-1">
                        <div className="flex justify-between"><span>Rotated Leads:</span> <span>{item.totalAssigned}</span></div>
                      </div>
                    ) : (
                      <div className="text-gray-700 mt-2 space-y-1">
                        <div className="flex justify-between"><span>Assigned Leads:</span> <span>{item.totalAssigned}</span></div>
                        <div className="flex justify-between"><span>Mode:</span> <span>{item.mode === 'EQUAL' ? 'Equal' : 'Round-Robin'}</span></div>
                      </div>
                    )}
                    
                    <div className="hidden group-hover:block absolute top-0 right-full mr-2 w-56 bg-gray-800 text-white text-xs rounded p-3 shadow-xl z-10">
                      <p className="font-bold mb-2 border-b border-gray-600 pb-1">Distribution</p>
                      {item.distribution && Object.entries(item.distribution).map(([name, count]) => {
                        // Attempt to resolve BA names if they are IDs
                        const baMatch = availableBAs.find(b => b.id === name);
                        const label = baMatch ? baMatch.name : name;
                        return (
                          <div key={name} className="flex justify-between mb-1">
                            <span className="truncate pr-2 opacity-80">{label}</span>
                            <span className="font-mono">{count as number}</span>
                          </div>
                        );
                      })}
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
