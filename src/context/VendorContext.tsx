"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type VendorType = "hotel" | "homestay" | "taxi" | "guide" | null;
export type SubscriptionPlan = "Free" | "Growth Pro" | "Pro" | "Enterprise";

interface VendorContextType {
  vendorType: VendorType;
  setVendorType: (type: VendorType) => void;
  vendorName: string | null;
  setVendorName: (name: string | null) => void;
  vendorEmail: string | null;
  setVendorEmail: (email: string | null) => void;
  isRegistered: boolean;
  setIsRegistered: (status: boolean) => void;
  isApproved: boolean;
  setIsApproved: (status: boolean) => void;
  subscriptionPlan: SubscriptionPlan;
  setSubscriptionPlan: (plan: SubscriptionPlan) => void;
  status: string;
  setStatus: (status: string) => void;
  rejectionReason: string | null;
  setRejectionReason: (reason: string | null) => void;
  role: string;
  setRole: (role: string) => void;
  taxiRole: string | null;
  setTaxiRole: (role: string | null) => void;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export interface InitialVendorProfile {
  vendorType: VendorType;
  businessName: string | null;
  email: string | null;
  isApproved: boolean;
  subscriptionPlan: SubscriptionPlan;
  status: string;
  rejectionReason: string | null;
  role: string;
  taxiRole: string | null;
}

export function VendorProvider({ children, initialProfile }: { children: ReactNode, initialProfile?: InitialVendorProfile | null }) {
  const [vendorType, setVendorType] = useState<VendorType>(initialProfile?.vendorType || null);
  const [vendorName, setVendorName] = useState<string | null>(initialProfile?.businessName || null);
  const [vendorEmail, setVendorEmail] = useState<string | null>(initialProfile?.email || null);
  const [isRegistered, setIsRegistered] = useState(!!initialProfile?.vendorType);
  const [isApproved, setIsApproved] = useState(initialProfile?.isApproved || false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>(initialProfile?.subscriptionPlan || "Free");
  const [status, setStatus] = useState(initialProfile?.status || "PENDING");
  const [rejectionReason, setRejectionReason] = useState<string | null>(initialProfile?.rejectionReason || null);
  const [role, setRole] = useState<string>(initialProfile?.role || "CUSTOMER");
  const [taxiRole, setTaxiRole] = useState<string | null>(initialProfile?.taxiRole || null);

  // Sync state when initialProfile changes (e.g., after router.refresh() on login)
  useEffect(() => {
    setVendorType(initialProfile?.vendorType || null);
    setVendorName(initialProfile?.businessName || null);
    setVendorEmail(initialProfile?.email || null);
    setIsRegistered(!!initialProfile?.vendorType);
    setIsApproved(initialProfile?.isApproved || false);
    setSubscriptionPlan(initialProfile?.subscriptionPlan || "Free");
    setStatus(initialProfile?.status || "PENDING");
    setRejectionReason(initialProfile?.rejectionReason || null);
    setRole(initialProfile?.role || "CUSTOMER");
    setTaxiRole(initialProfile?.taxiRole || null);
  }, [initialProfile]);

  return (
    <VendorContext.Provider value={{ 
      vendorType, setVendorType, 
      vendorName, setVendorName,
      vendorEmail, setVendorEmail,
      isRegistered, setIsRegistered, 
      isApproved, setIsApproved,
      subscriptionPlan, setSubscriptionPlan,
      status, setStatus,
      rejectionReason, setRejectionReason,
      role, setRole,
      taxiRole, setTaxiRole
    }}>
      {children}
    </VendorContext.Provider>
  );
}

export function useVendor() {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error("useVendor must be used within a VendorProvider");
  }
  return context;
}
