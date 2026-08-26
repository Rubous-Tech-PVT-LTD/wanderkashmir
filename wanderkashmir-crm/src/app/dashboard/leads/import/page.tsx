"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle, AlertTriangle } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import Link from "next/link";

export default function LeadImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<{ total: number; success: number; failed: number } | null>(null);
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
        data = XLSX.utils.sheet_to_json(sheet);
      }

      // Map columns based on generic variations
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedData = data.map((row: any) => {
        const findVal = (keys: string[]) => {
          const key = Object.keys(row).find(k => keys.includes(k.toLowerCase().trim()));
          return key ? row[key] : null;
        };
        
        return {
          companyName: findVal(["company", "company name", "agency", "business", "name"]) || "Unknown Company",
          contactPerson: findVal(["contact", "contact person", "person", "name"]),
          phone: findVal(["phone", "mobile", "contact no", "contact number"]),
          email: findVal(["email", "email id"]),
          city: findVal(["city", "location"]),
          state: findVal(["state"]),
          website: findVal(["website", "url"]),
        };
      }).filter(row => row.phone); // Phone is mandatory

      if (mappedData.length === 0) {
        throw new Error("No valid leads found. Please ensure the file has a 'Phone' column.");
      }

      // Send to API in batches of 100
      const batchSize = 100;
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < mappedData.length; i += batchSize) {
        const batch = mappedData.slice(i, i + batchSize);
        const res = await fetch("/api/leads/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leads: batch }),
        });
        
        if (res.ok) {
          const resData = await res.json();
          successCount += resData.imported;
          failCount += resData.failed;
        } else {
          throw new Error("Failed to upload batch.");
        }
      }

      setResults({
        total: mappedData.length,
        success: successCount,
        failed: failCount
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

      <div className="card-white p-8 max-w-3xl mx-auto">
        <div className="text-center space-y-4">
          <UploadCloud className="mx-auto h-12 w-12 text-primary" />
          <h3 className="text-lg font-medium text-gray-900">Upload CSV or Excel File</h3>
          <p className="text-sm text-gray-500">
            Make sure your file has a column for Phone (mandatory). <br />
            Recommended columns: Company Name, Contact Person, Phone, Email, City.
          </p>
          
          <div className="mt-6">
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-muted file:text-primary hover:file:bg-primary-light"
            />
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </div>
          )}

          {results && (
            <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-2 font-bold text-lg">
                <CheckCircle className="h-6 w-6" />
                Import Complete!
              </div>
              <p>Total Processed: {results.total}</p>
              <p>Successfully Imported: {results.success}</p>
              <p>Duplicates/Failed: {results.failed}</p>
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
