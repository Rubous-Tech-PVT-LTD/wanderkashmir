"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import Link from "next/link";

export default function LeadImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<{ total: number; success: number; failed: number; failedRows: any[] } | null>(null);
  const [error, setError] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
      setResults(null);
    }
  };

  const processImport = async () => {
    if (!file) return;
    setIsUploading(true);
    setError("");

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any[] = [];
      const isCSV = file.name.endsWith(".csv");
      
      if (isCSV) {
        data = await new Promise((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
            error: (err) => reject(err),
          });
        });
      } else {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // raw: false ensures we read text values (prevents dropping leading zeros from phones)
        data = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" });
      }

      // Map columns based on generic variations and specific requirements
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedData = data.map((row: any, index: number) => {
        const findVal = (keys: string[]) => {
          const key = Object.keys(row).find(k => keys.includes(k.toLowerCase().trim()));
          const val = key ? row[key] : null;
          return (typeof val === 'string' && val.trim() === '') ? null : val?.toString().trim();
        };
        
        const companyName = findVal(["agent / company name", "company", "company name", "agency", "business", "name"]) || "Unknown Company";
        const phone = findVal(["phone", "mobile", "contact no", "contact number"]);
        
        // Bundle additional unstructured info into Notes
        const kashmirPackages = findVal(["kashmir packages sold?"]);
        const monthlyLeads = findVal(["estimated monthly leads"]);
        const quotedPackage = findVal(["quoted package"]);
        const agentNetRate = findVal(["agent net rate"]);
        const ourMargin = findVal(["our margin"]);
        const lastContactNotes = findVal(["last contact notes"]);
        
        const notesArr = [];
        if (kashmirPackages) notesArr.push(`Kashmir Packages Sold?: ${kashmirPackages}`);
        if (monthlyLeads) notesArr.push(`Est. Monthly Leads: ${monthlyLeads}`);
        if (quotedPackage) notesArr.push(`Quoted Package: ${quotedPackage}`);
        if (agentNetRate) notesArr.push(`Agent Net Rate: ${agentNetRate}`);
        if (ourMargin) notesArr.push(`Our Margin: ${ourMargin}`);
        if (lastContactNotes) notesArr.push(`Last Contact Notes: ${lastContactNotes}`);

        // Normalize status
        let statusStr = findVal(["status"])?.toUpperCase();
        if (statusStr) {
          // ensure it matches valid enum if possible, or fallback to NEW
          const validStatuses = [
            "NEW", "ASSIGNED", "CALLED", "CONNECTED", "NOT_CONNECTED", 
            "INTERESTED", "NOT_INTERESTED", "WHATSAPP_SENT", 
            "PARTNER_REGISTERED", "REQUIREMENT_RECEIVED", "QUOTE_SENT", 
            "NEGOTIATION", "BOOKED", "COMPLETED", "LOST"
          ];
          statusStr = statusStr.replace(/ /g, '_');
          if (!validStatuses.includes(statusStr)) {
            statusStr = "NEW";
          }
        }

        return {
          rowNumber: index + 2, // +2 assuming row 1 is header (0-indexed array)
          companyName,
          contactPerson: findVal(["contact", "contact person", "person", "name"]),
          phone,
          whatsappNumber: findVal(["whatsapp", "whatsapp number"]),
          email: findVal(["email", "email id"]),
          city: findVal(["city", "location"]),
          state: findVal(["state"]),
          website: findVal(["website / instagram", "website", "url"]),
          source: findVal(["source"]),
          agentType: findVal(["b2b/b2c", "agent type"]),
          interestLevel: findVal(["interested?", "interest level"]),
          lastContactDate: findVal(["first contact date"]),
          nextFollowUpDate: findVal(["follow-up date", "followup date"]),
          status: statusStr || "NEW",
          notes: notesArr.length > 0 ? notesArr.join('\n') : null,
        };
      }).filter(row => row.phone); // Phone is mandatory

      if (mappedData.length === 0) {
        throw new Error("No valid leads found. Please ensure the file has a 'Phone' column.");
      }

      // Send to API in batches of 100
      const batchSize = 100;
      let successCount = 0;
      let failCount = 0;
      let allFailedRows: any[] = [];

      for (let i = 0; i < mappedData.length; i += batchSize) {
        const batch = mappedData.slice(i, i + batchSize);
        const res = await fetch("/api/leads/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leads: batch }),
        });
        
        let resData;
        try {
           resData = await res.json();
        } catch(e) {
           throw new Error("Server returned an invalid response.");
        }
        
        if (res.ok) {
          successCount += resData.imported || 0;
          failCount += resData.failed || 0;
          if (resData.failedRows && Array.isArray(resData.failedRows)) {
            allFailedRows = [...allFailedRows, ...resData.failedRows];
          }
        } else {
          throw new Error(resData.error || "Failed to upload batch.");
        }
      }

      setResults({
        total: mappedData.length,
        success: successCount,
        failed: failCount,
        failedRows: allFailedRows
      });

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred during import.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Import Leads</h2>
        <Link href="/dashboard/leads" className="btn-outline">
          Back to Leads
        </Link>
      </div>

      <div className="card-white p-8 max-w-4xl mx-auto">
        <div className="text-center space-y-4">
          <UploadCloud className="mx-auto h-12 w-12 text-primary" />
          <h3 className="text-lg font-medium text-gray-900">Upload CSV or Excel File</h3>
          <p className="text-sm text-gray-500">
            Make sure your file has a column for Phone (mandatory). <br />
            Recommended columns: Company Name, Contact Person, Phone, Email, City.
          </p>
          
          <div className="mt-6 flex justify-center">
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileUpload}
              className="block w-full max-w-md text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-muted file:text-primary hover:file:bg-primary-light"
            />
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </div>
          )}

          {results && (
            <div className="mt-6 text-left border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-5 sm:px-6 border-b">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Import Complete
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Total Processed: {results.total} | Successfully Imported: {results.success} | Skipped/Failed: {results.failed}
                </p>
              </div>
              
              {results.failedRows && results.failedRows.length > 0 && (
                <div className="bg-white px-4 py-5 sm:p-6">
                  <h4 className="text-sm font-medium text-red-600 mb-4 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Failed Rows Details
                  </h4>
                  <div className="max-h-60 overflow-y-auto border rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {results.failedRows.map((row, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-500">{row.rowNumber}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{row.companyName}</td>
                            <td className="px-4 py-2 text-sm text-red-500">{row.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={processImport}
              disabled={!file || isUploading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Processing..." : "Import Leads"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
