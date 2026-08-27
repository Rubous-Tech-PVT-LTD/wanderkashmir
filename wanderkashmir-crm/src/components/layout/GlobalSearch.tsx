"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any>({
    leads: [],
    partners: [],
    requirements: [],
    quotations: []
  });
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 3) {
        setResults({ leads: [], partners: [], requirements: [], quotations: [] });
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (query) {
        fetchResults();
      }
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const hasResults = Object.values(results).some((arr: any) => arr.length > 0);

  return (
    <div className="relative w-full max-w-md hidden md:block" ref={wrapperRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
          placeholder="Search leads, partners, requirements..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 3) setIsOpen(true);
          }}
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          </div>
        )}
      </div>

      {isOpen && query.trim().length >= 3 && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-100 max-h-96 overflow-y-auto">
          {!isSearching && !hasResults ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No results found for "{query}"
            </div>
          ) : (
            <div className="py-2">
              {results.leads?.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">Leads</div>
                  {results.leads.map((lead: any) => (
                    <Link 
                      key={lead.id} 
                      href={`/dashboard/leads/${lead.id}`}
                      className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="font-medium">{lead.companyName}</span>
                      {lead.phone && <span className="text-gray-500 text-xs ml-2">{lead.phone}</span>}
                    </Link>
                  ))}
                </div>
              )}
              
              {results.partners?.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">Partners</div>
                  {results.partners.map((partner: any) => (
                    <Link 
                      key={partner.id} 
                      href={`/dashboard/partners/${partner.id}`}
                      className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="font-medium">{partner.companyName}</span>
                      <span className="text-gray-500 text-xs ml-2">{partner.city || partner.state}</span>
                    </Link>
                  ))}
                </div>
              )}
              
              {results.requirements?.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">Requirements</div>
                  {results.requirements.map((req: any) => (
                    <Link 
                      key={req.id} 
                      href={`/dashboard/requirements`}
                      className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="font-medium">{req.customerName}</span>
                      <span className="text-gray-500 text-xs ml-2">ID: {req.id.slice(-6)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
