"use client";

import { useState } from "react";
import { 
  Users, Building2, Car, Map, LayoutDashboard, 
  CheckCircle2, Clock, IndianRupee, FileText, Eye, EyeOff, ShieldCheck,
  AlertCircle, MapPin, X, XCircle, Globe
} from "lucide-react";
import { approveVendor, rejectVendor } from "@/actions/vendor";
import { approveListing, rejectListing } from "@/actions/listings";
import { suspendVendor, suspendListing } from "@/actions/admin-management";
import { banUser, unbanUser } from "@/actions/admin-management";
import { markVendorPaid } from "@/actions/payouts";
import { useRouter } from "next/navigation";
import { format, isSameDay, addDays } from "date-fns";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";
import AdminToursTab from "./AdminToursTab";
import AdminTaxisTab from "./AdminTaxisTab";
import AdminSeoTab from "./AdminSeoTab";
import { useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Pagination from "@/components/Pagination";
import { getPaginatedVendors, getPaginatedProperties, getPaginatedUsers, getPaginatedBookings } from "@/actions/admin-data";
const AdminMapView = dynamic(() => import("./AdminMapView"), { ssr: false });

// Define the type based on the props passed from Server
type VendorProfile = {
  id: string;
  businessName: string;
  type: string;
  isApproved: boolean;
  status: string;
  rejectionReason: string | null;
  createdAt: Date;
  kycDocuments: string[];
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  altContactPerson?: string | null;
  altPhone?: string | null;
  accountHolderName?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  user: {
    name: string | null;
  };
};

type PropertyProfile = {
  id: string;
  name: string;
  location: string;
  pricePerNight: number;
  totalRooms: number;
  images: string[];
  amenities: string[];
  isApproved: boolean;
  status: string;
  rejectionReason: string | null;
  createdAt: Date;
  vendorProfile: {
    businessName: string;
    type: string;
    user: {
      name: string | null;
    }
  }
};

// Utility to download CSV
const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    toast.error("No data to export");
    return;
  }
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map(row => headers.map(fieldName => {
      let cell = row[fieldName] === null || row[fieldName] === undefined ? "" : String(row[fieldName]);
      // Escape quotes and wrap in quotes if there's a comma
      if (cell.includes(",") || cell.includes('"')) {
        cell = `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(","))
  ].join("\n");
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function AdminDashboardClient({ 
  totalUsers, totalRevenue, totalLiveVendors, pendingVendors, rejectedVendors, payouts = [] 
}: { 
  totalUsers: number, totalRevenue: number, totalLiveVendors: number, pendingVendors: number, rejectedVendors: number, payouts?: any[] 
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const ITEMS_PER_PAGE = 20;

  // Data States
  const [vendorsData, setVendorsData] = useState<VendorProfile[]>([]);
  const [propertiesData, setPropertiesData] = useState<PropertyProfile[]>([]);
  const [usersData, setUsersData] = useState<any[]>([]);
  const [bookingsData, setBookingsData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [selectedVendorDetails, setSelectedVendorDetails] = useState<VendorProfile | null>(null);
  const [rejectingVendor, setRejectingVendor] = useState<VendorProfile | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const [showRevenue, setShowRevenue] = useState(false);
  const [kycVendor, setKycVendor] = useState<VendorProfile | null>(null);
  const [payoutConfirmModal, setPayoutConfirmModal] = useState<{ isOpen: boolean, vendorId: string, businessName: string, amount: number } | null>(null);
  
  // User Management
  const [banningUser, setBanningUser] = useState<any | null>(null);
  const [banReason, setBanReason] = useState("");
  
  // Property States
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState<PropertyProfile | null>(null);
  const [rejectingProperty, setRejectingProperty] = useState<PropertyProfile | null>(null);
  const [propertyRejectionRemarks, setPropertyRejectionRemarks] = useState("");
  const router = useRouter();

  // Filtering & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [filterDate, setFilterDate] = useState("ALL"); // For daily manifest

  // --- DATA FETCHING (SERVER ACTIONS) ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === "approvals" || activeTab === "live_vendors" || activeTab === "rejected" || activeTab === "map_view") {
        let status = "ALL";
        if (activeTab === "approvals") status = "PENDING";
        else if (activeTab === "live_vendors") status = "APPROVED";
        else if (activeTab === "rejected") status = "REJECTED";
        // for map_view, keep status = "ALL" to see everyone on the map
        
        const res = await getPaginatedVendors({ page: currentPage, limit: ITEMS_PER_PAGE, search: searchQuery, status, type: filterType });
        setVendorsData(res.data);
        setTotalPages(res.totalPages);
        setTotalItems(res.totalCount);
      } 
      else if (activeTab === "listings" || activeTab === "live_listings") {
        let status = activeTab === "listings" ? "PENDING" : "APPROVED";
        const res = await getPaginatedProperties({ page: currentPage, limit: ITEMS_PER_PAGE, search: searchQuery, status });
        setPropertiesData(res.data);
        setTotalPages(res.totalPages);
        setTotalItems(res.totalCount);
      }
      else if (activeTab === "users") {
        const res = await getPaginatedUsers({ page: currentPage, limit: ITEMS_PER_PAGE, search: searchQuery, status: filterStatus });
        setUsersData(res.data);
        setTotalPages(res.totalPages);
        setTotalItems(res.totalCount);
      }
      else if (activeTab === "manifest") {
        const res = await getPaginatedBookings({ page: currentPage, limit: ITEMS_PER_PAGE, search: searchQuery, status: "CONFIRMED", type: filterType, dateFilter: filterDate });
        setBookingsData(res.data);
        setTotalPages(res.totalPages);
        setTotalItems(res.totalCount);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, currentPage, searchQuery, filterStatus, filterType, filterDate]);

  useEffect(() => {
    // Only fetch for tabs that use the main generic fetching pattern
    if (["approvals", "live_vendors", "rejected", "listings", "live_listings", "users", "manifest", "map_view"].includes(activeTab)) {
      fetchData();
    }
  }, [fetchData, activeTab]);

  const filteredPayouts = payouts.filter(p => {
    const matchesSearch = p.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesStatus = true;
    if (filterStatus === "PENDING") matchesStatus = p.pendingAmount > 0;
    if (filterStatus === "PAID") matchesStatus = p.pendingAmount === 0;
    return matchesSearch && matchesStatus;
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
    setFilterStatus("ALL");
    setFilterType("ALL");
    setFilterDate("ALL");
  };

  const exportPayouts = () => {
    const data = filteredPayouts.map(p => ({
      "Business Name": p.businessName,
      "Vendor Name": p.vendorName || "N/A",
      "Account Holder Name": p.accountHolderName || "N/A",
      "Bank Name": p.bankName || "N/A",
      "Account Number": p.accountNumber ? `'${p.accountNumber}` : "N/A", // Quote to prevent scientific notation in Excel
      "IFSC Code": p.ifscCode || "N/A",
      "Total Revenue (₹)": p.totalRevenue,
      "Paid Out (₹)": p.totalPaid,
      "Pending Amount (₹)": p.pendingAmount,
      "Status": p.pendingAmount > 0 ? "PENDING" : "PAID"
    }));

    // Calculate Totals
    const totalRev = filteredPayouts.reduce((sum, p) => sum + p.totalRevenue, 0);
    const totalPaid = filteredPayouts.reduce((sum, p) => sum + p.totalPaid, 0);
    const totalPending = filteredPayouts.reduce((sum, p) => sum + p.pendingAmount, 0);

    data.push({
      "Business Name": "TOTAL",
      "Vendor Name": "",
      "Account Holder Name": "",
      "Bank Name": "",
      "Account Number": "",
      "IFSC Code": "",
      "Total Revenue (₹)": totalRev,
      "Paid Out (₹)": totalPaid,
      "Pending Amount (₹)": totalPending,
      "Status": ""
    });

    downloadCSV(data, `Vendor_Payouts_${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  const exportRevenueTaxReport = () => {
    let totalCollected = 0;
    let totalVendorCut = 0;
    let totalCommission = 0;

    const data = bookingsData.map((b: any) => {
      const amount = b.amount || 0;
      const vendorCut = amount * 0.85;
      const commission = amount * 0.15;
      
      totalCollected += amount;
      totalVendorCut += vendorCut;
      totalCommission += commission;

      return {
        "Booking ID": b.id,
        "Date of Transaction": format(new Date(b.createdAt), "dd MMM yyyy HH:mm"),
        "Customer Name": b.user?.name || "N/A",
        "Customer Email": b.user?.email || "N/A",
        "Service/Item Booked": b.property?.name || (b.vehicle ? `${b.vehicle.make} ${b.vehicle.model}` : "Unknown"),
        "Total Collected (₹)": amount,
        "Vendor Cut 85% (₹)": vendorCut.toFixed(2),
        "Platform Commission 15% (₹)": commission.toFixed(2),
        "Status": b.status
      };
    });

    data.push({
      "Booking ID": "TOTAL",
      "Date of Transaction": "",
      "Customer Name": "",
      "Customer Email": "",
      "Service/Item Booked": "",
      "Total Collected (₹)": totalCollected,
      "Vendor Cut 85% (₹)": totalVendorCut.toFixed(2),
      "Platform Commission 15% (₹)": totalCommission.toFixed(2),
      "Status": ""
    });

    downloadCSV(data, `Platform_Revenue_TaxReport_${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  const exportDailyManifest = () => {
    const data = bookingsData.map((b: any) => ({
      "Booking ID": b.id,
      "Customer Name": b.user?.name || "N/A",
      "Customer Email": b.user?.email || "N/A",
      "Customer Phone": "N/A", // Assuming phone is not fetched here currently
      "Service Booked": b.property?.name || (b.vehicle ? `${b.vehicle.make} ${b.vehicle.model}` : "Unknown"),
      "Vendor Type": b.property?.vendorProfile?.type || b.vehicle?.vendorProfile?.type || "Unknown",
      "Vendor Name": b.property?.vendorProfile?.businessName || b.vehicle?.vendorProfile?.businessName || "Unknown",
      "Check-In Date": b.checkIn ? format(new Date(b.checkIn), "dd MMM yyyy") : "N/A",
      "Check-Out Date": b.checkOut ? format(new Date(b.checkOut), "dd MMM yyyy") : "N/A",
      "Status": b.status
    }));

    data.push({
      "Booking ID": "TOTAL BOOKINGS:",
      "Customer Name": String(bookingsData.length),
      "Customer Email": "",
      "Customer Phone": "",
      "Service Booked": "",
      "Vendor Type": "",
      "Vendor Name": "",
      "Check-In Date": "",
      "Check-Out Date": "",
      "Status": ""
    });

    downloadCSV(data, `Booking_Manifest_${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  // Stats calculation
  // (using props now)
  const stats = [
    { label: "Total Platform Revenue", value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: "text-emerald-500", bg: "bg-emerald-50", tab: "payouts" },
    { label: "Total Registered Users", value: totalUsers.toString(), icon: Users, color: "text-sky-500", bg: "bg-sky-50", tab: "users" },
    { label: "Total Live Vendors", value: totalLiveVendors.toString(), icon: Building2, color: "text-indigo-500", bg: "bg-indigo-50", tab: "live_vendors" },
    { label: "Total Rejected", value: rejectedVendors.toString(), icon: XCircle, color: "text-red-500", bg: "bg-red-50", tab: "rejected" },
    { label: "Pending Vendor Approvals", value: pendingVendors.toString(), icon: Clock, color: "text-orange-500", bg: "bg-orange-50", tab: "approvals" },
  ];

  const handleApprove = async (vendorId: string) => {
    setIsProcessing(vendorId);
    try {
      const res = await approveVendor(vendorId);
      if (res.success) {
        toast.success("Vendor Approved!");
        router.refresh();
      } else {
        toast.error("Failed to approve vendor.");
      }
    } catch (e) {
      toast.error("Error occurred.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (vendorId: string) => {
    if (!rejectionRemarks.trim()) {
      toast.error("Please enter a reason for rejection.");
      return;
    }
    
    setIsProcessing(vendorId);
    try {
      const res = await rejectVendor(vendorId, rejectionRemarks);
      if (res.success) {
        toast.success("Vendor Rejected!");
        setRejectingVendor(null);
        setRejectionRemarks("");
        router.refresh();
      } else {
        toast.error("Failed to reject vendor.");
      }
    } catch (e) {
      toast.error("Error occurred.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleApproveProperty = async (propertyId: string) => {
    setIsProcessing(propertyId);
    try {
      const res = await approveListing(propertyId, 'PROPERTY');
      if (res.success) {
        toast.success("Property Approved!");
        router.refresh();
      } else {
        toast.error("Failed to approve property.");
      }
    } catch (e) {
      toast.error("Error occurred.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectProperty = async (propertyId: string) => {
    if (!propertyRejectionRemarks.trim()) {
      toast.error("Please enter a reason for rejection.");
      return;
    }
    
    setIsProcessing(propertyId);
    try {
      const res = await rejectListing(propertyId, 'PROPERTY', propertyRejectionRemarks);
      if (res.success) {
        toast.success("Property Rejected!");
        setRejectingProperty(null);
        setPropertyRejectionRemarks("");
        router.refresh();
      } else {
        toast.error("Failed to reject property.");
      }
    } catch (e) {
      toast.error("Error occurred.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleSuspendVendor = async (vendorId: string) => {
    if (!rejectionRemarks.trim()) {
      toast.error("Please enter a reason for suspension.");
      return;
    }
    
    setIsProcessing(vendorId);
    try {
      const res = await suspendVendor(vendorId, rejectionRemarks);
      if (res.success) {
        toast.success("Vendor Suspended!");
        setRejectingVendor(null);
        setRejectionRemarks("");
        router.refresh();
      } else {
        toast.error("Failed to suspend vendor.");
      }
    } catch (e) {
      toast.error("Error occurred.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleSuspendProperty = async (propertyId: string) => {
    if (!propertyRejectionRemarks.trim()) {
      toast.error("Please enter a reason for suspension.");
      return;
    }
    
    setIsProcessing(propertyId);
    try {
      const res = await suspendListing(propertyId, 'PROPERTY', propertyRejectionRemarks);
      if (res.success) {
        toast.success("Property Suspended!");
        setRejectingProperty(null);
        setPropertyRejectionRemarks("");
        router.refresh();
      } else {
        toast.error("Failed to suspend property.");
      }
    } catch (e) {
      toast.error("Error occurred.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleMarkPaid = async (vendorId: string) => {
    setIsProcessing(vendorId);
    try {
      const res = await markVendorPaid(vendorId);
      if (res.success) {
        toast.success("Vendor Marked as Paid!");
        router.refresh();
      } else {
        toast.error("Failed to update payout status.");
      }
    } catch (e) {
      toast.error("Error occurred.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleBanUser = async () => {
    if (!banningUser || !banReason.trim()) return;
    setIsProcessing(banningUser.id);
    try {
      const res = await banUser(banningUser.id, banReason);
      if (res.success) {
        toast.success("User has been banned.");
        setBanningUser(null);
        setBanReason("");
        router.refresh();
      } else {
        toast.error("Failed to ban user.");
      }
    } catch (e) {
      toast.error("An error occurred.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    setIsProcessing(userId);
    try {
      const res = await unbanUser(userId);
      if (res.success) {
        toast.success("User has been unbanned.");
        router.refresh();
      } else {
        toast.error("Failed to unban user.");
      }
    } catch (e) {
      toast.error("An error occurred.");
    } finally {
      setIsProcessing(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'HOTEL': return <Building2 className="w-5 h-5 text-slate-500" />;
      case 'HOMESTAY': return <Building2 className="w-5 h-5 text-sky-500" />;
      case 'TAXI': return <Car className="w-5 h-5 text-sky-500" />;
      case 'GUIDE': return <Map className="w-5 h-5 text-orange-500" />;
      default: return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  const exportUsers = () => {
    const data = usersData.map(u => ({
      "Name": u.name || "N/A",
      "Email": u.email,
      "Phone": u.phone || "N/A",
      "Status": u.isBanned ? "BANNED" : "ACTIVE",
      "Joined At": format(new Date(u.createdAt), "dd MMM yyyy HH:mm")
    }));
    downloadCSV(data, `Registered_Users_${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  const exportLiveVendors = () => {
    const data = vendorsData.filter(v => v.isApproved || v.status === "SUSPENDED").map(v => ({
      "Business Name": v.businessName,
      "Owner Name": v.user?.name || "N/A",
      "Email": v.email || "N/A",
      "Phone": v.phone || "N/A",
      "Type": v.type,
      "Status": v.status === "SUSPENDED" ? "SUSPENDED" : "LIVE",
      "Registered At": format(new Date(v.createdAt), "dd MMM yyyy")
    }));
    downloadCSV(data, `Live_Vendors_${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  const exportApprovals = () => {
    const data = vendorsData.filter(v => !v.isApproved && v.status !== "REJECTED" && v.status !== "SUSPENDED").map(v => ({
      "Business Name": v.businessName,
      "Owner Name": v.user?.name || "N/A",
      "Email": v.email || "N/A",
      "Phone": v.phone || "N/A",
      "Type": v.type,
      "Status": "PENDING",
      "Registered At": format(new Date(v.createdAt), "dd MMM yyyy")
    }));
    downloadCSV(data, `Pending_Vendor_Approvals_${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  const exportRejectedVendors = () => {
    const data = vendorsData.filter(v => v.status === "REJECTED").map(v => ({
      "Business Name": v.businessName,
      "Owner Name": v.user?.name || "N/A",
      "Email": v.email || "N/A",
      "Phone": v.phone || "N/A",
      "Type": v.type,
      "Status": "REJECTED",
      "Rejection Reason": v.rejectionReason || "No reason provided",
      "Registered At": format(new Date(v.createdAt), "dd MMM yyyy")
    }));
    downloadCSV(data, `Rejected_Vendors_${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  if (activeTab === "map_view") {
    return (
      <div className="w-full h-screen overflow-hidden">
        <AdminMapView vendors={vendorsData} onExit={() => handleTabChange("dashboard")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white min-h-screen p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-orange-500">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Admin<span className="text-orange-400">Panel</span></h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Overview" },
            { id: "map_view", icon: MapPin, label: "Map View" },
            { id: "manifest", icon: FileText, label: "Daily Operations" },
            { id: "approvals", icon: CheckCircle2, label: "Vendor Approvals" },
            { id: "live_vendors", label: "Live Vendors", icon: Users },
            { id: "listings", label: "Listing Approvals", icon: Building2 },
            { id: "live_listings", label: "Live Listings", icon: MapPin },
            { id: "tours", label: "Tours", icon: Map },
            { id: "taxis", label: "Taxis", icon: Car },
            { id: "payouts", label: "Payouts", icon: IndianRupee },
            { id: "rejected", label: "Rejected Vendors", icon: XCircle },
            { id: "users", label: "Tourists", icon: Users },
            { id: "seo_pages", label: "SEO Pages", icon: Globe },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === item.id ? "bg-orange-500 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 max-w-6xl">
        <header className="mb-10 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Platform Administration</h2>
            <p className="text-slate-500 mt-2">Manage vendors, approve documents, and oversee platform health.</p>
          </div>
          <button 
            onClick={async () => {
              await fetch("/api/auth/admin-logout", { method: "POST" });
              router.push("/wander-admin/login");
            }}
            className="flex items-center gap-2 text-slate-500 hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-bold transition-all bg-white border border-slate-100 shadow-sm"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </header>

        {/* Stats Row */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                onClick={() => handleTabChange(stat.tab)}
                className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start gap-3 cursor-pointer hover:shadow-md hover:border-orange-200 transition-all"
              >
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                    {stat.label}
                    {stat.label === "Total Platform Revenue" && (
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowRevenue(!showRevenue); }}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showRevenue ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </p>
                  <p className="text-2xl lg:text-3xl font-black text-slate-900">
                    {stat.label === "Total Platform Revenue" && !showRevenue ? "₹••••••" : stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Content Area */}
        {activeTab === "tours" && <AdminToursTab />}
        {activeTab === "taxis" && <AdminTaxisTab />}
        {activeTab === "seo_pages" && <AdminSeoTab />}

        {activeTab === "approvals" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50 gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Vendor Applications</h3>
                <p className="text-sm text-slate-500">Review and approve new vendor registrations</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="Search vendors..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="ALL">All Types</option>
                  <option value="HOTEL">Hotels</option>
                  <option value="HOMESTAY">Homestays</option>
                  <option value="TAXI">Taxis</option>
                  <option value="GUIDE">Guides</option>
                </select>
              </div>
            </div>
            
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex gap-3 overflow-x-auto">
              <button 
                onClick={exportApprovals}
                className="whitespace-nowrap flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-sky-600 transition-colors shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" /> Export Pending Approvals (CSV)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Business Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Registered At</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendorsData.filter(v => !v.isApproved && v.status !== "REJECTED").map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{vendor.businessName}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {vendor.user?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 capitalize font-medium text-slate-700">
                          {getTypeIcon(vendor.type)} {vendor.type.toLowerCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {!vendor.isApproved ? (
                          vendor.status === "REJECTED" ? (
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                              <XCircle className="w-3 h-3" /> Rejected
                            </span>
                          ) : (
                            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" /> Live
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {format(new Date(vendor.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setKycVendor(vendor)}
                            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" 
                            title="View KYC Documents"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setSelectedVendorDetails(vendor)}
                            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" 
                            title="Review Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {!vendor.isApproved && vendor.status !== "REJECTED" && (
                            <>
                              <button 
                                onClick={() => setRejectingVendor(vendor)}
                                className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" 
                                title="Reject"
                                disabled={isProcessing === vendor.id}
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleApprove(vendor.id)}
                                disabled={isProcessing === vendor.id}
                                className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                              >
                                {isProcessing === vendor.id ? "..." : <><CheckCircle2 className="w-4 h-4" /> Approve</>}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {vendorsData.filter(v => !v.isApproved && v.status !== "SUSPENDED").length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No pending vendor approvals.
                      </td>
                    </tr>
                  )}
                </tbody></table></div>
<Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
          </div>
        )}

        {activeTab === "live_vendors" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50 gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Live Vendors</h3>
                <p className="text-sm text-slate-500">Manage approved vendor accounts</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="Search live vendors..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="ALL">All Types</option>
                  <option value="HOTEL">Hotels</option>
                  <option value="HOMESTAY">Homestays</option>
                  <option value="TAXI">Taxis</option>
                  <option value="GUIDE">Guides</option>
                </select>
              </div>
            </div>
            
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex gap-3 overflow-x-auto">
              <button 
                onClick={exportLiveVendors}
                className="whitespace-nowrap flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-sky-600 transition-colors shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" /> Export Live Vendors (CSV)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Business Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Registered At</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendorsData.filter(v => v.isApproved && v.status !== "SUSPENDED").map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{vendor.businessName}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {vendor.user?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 capitalize font-medium text-slate-700">
                          {getTypeIcon(vendor.type)} {vendor.type.toLowerCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {vendor.status === "SUSPENDED" ? (
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                            <XCircle className="w-3 h-3" /> Suspended
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" /> Live
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {format(new Date(vendor.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedVendorDetails(vendor)}
                            className="text-slate-400 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>
                          {vendor.status !== "SUSPENDED" && (
                            <button 
                              onClick={() => setRejectingVendor(vendor)}
                              className="text-red-500 px-4 py-2 rounded-lg text-sm font-medium border border-red-200 hover:bg-red-50 flex items-center gap-2"
                            >
                              <AlertCircle className="w-4 h-4" /> Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {vendorsData.filter(v => v.isApproved || v.status === "SUSPENDED").length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No live vendors found.
                      </td>
                    </tr>
                  )}
                </tbody></table></div>
<Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
          </div>
        )}

        {activeTab === "rejected" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50 gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Rejected Vendors</h3>
                <p className="text-sm text-slate-500">Review all rejected vendor applications</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="Search rejected vendors..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="ALL">All Types</option>
                  <option value="HOTEL">Hotels</option>
                  <option value="HOMESTAY">Homestays</option>
                  <option value="TAXI">Taxis</option>
                  <option value="GUIDE">Guides</option>
                </select>
              </div>
            </div>
            
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex gap-3 overflow-x-auto">
              <button 
                onClick={exportRejectedVendors}
                className="whitespace-nowrap flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-sky-600 transition-colors shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" /> Export Rejected Vendors (CSV)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Business Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rejection Reason</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Registered At</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendorsData.filter(v => v.status === "REJECTED").map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{vendor.businessName}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {vendor.user?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 capitalize font-medium text-slate-700">
                          {getTypeIcon(vendor.type)} {vendor.type.toLowerCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg inline-block border border-red-100">
                          {vendor.rejectionReason || "No reason provided"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {format(new Date(vendor.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedVendorDetails(vendor)}
                            className="text-slate-400 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {vendorsData.filter(v => v.status === "REJECTED").length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No rejected vendors found.
                      </td>
                    </tr>
                  )}
                </tbody></table></div>
<Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
          </div>
        )}

        {activeTab === "listings" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50 gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Listing Approvals</h3>
                <p className="text-sm text-slate-500">Review new property and taxi listings</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="Search listings..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Property Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price / Night</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Listed At</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {propertiesData.filter(p => !p.isApproved && p.status !== "REJECTED").map((property) => (
                    <tr key={property.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{property.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {property.location}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {property.vendorProfile.businessName}
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-700">
                        ₹{property.pricePerNight}
                      </td>
                      <td className="px-6 py-4">
                        {!property.isApproved ? (
                          property.status === "REJECTED" ? (
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                              <XCircle className="w-3 h-3" /> Rejected
                            </span>
                          ) : (
                            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" /> Live
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {format(new Date(property.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedPropertyDetails(property)}
                            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" 
                            title="Review Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {!property.isApproved && property.status !== "REJECTED" && (
                            <>
                              <button 
                                onClick={() => setRejectingProperty(property)}
                                className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" 
                                title="Reject"
                                disabled={isProcessing === property.id}
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleApproveProperty(property.id)}
                                disabled={isProcessing === property.id}
                                className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                              >
                                {isProcessing === property.id ? "..." : <><CheckCircle2 className="w-4 h-4" /> Approve</>}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {propertiesData.filter(p => !p.isApproved && p.status !== "SUSPENDED").length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No pending properties.
                      </td>
                    </tr>
                  )}
                </tbody></table></div>
<Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
          </div>
        )}

        {activeTab === "live_listings" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50 gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Live Listings</h3>
                <p className="text-sm text-slate-500">Manage active properties and vehicles</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="Search live listings..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Property Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price / Night</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Listed At</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {propertiesData.filter(p => p.isApproved || p.status === "SUSPENDED").map((property) => (
                    <tr key={property.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{property.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {property.location}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {property.vendorProfile.businessName}
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-700">
                        ₹{property.pricePerNight}
                      </td>
                      <td className="px-6 py-4">
                        {property.status === "SUSPENDED" ? (
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                            <XCircle className="w-3 h-3" /> Suspended
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" /> Live
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {format(new Date(property.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedPropertyDetails(property)}
                            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" 
                            title="Review Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {property.status !== "SUSPENDED" && (
                            <button 
                              onClick={() => setRejectingProperty(property)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                              title="Suspend"
                            >
                              <AlertCircle className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {propertiesData.filter(p => p.isApproved || p.status === "SUSPENDED").length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No live properties.
                      </td>
                    </tr>
                  )}
                </tbody></table></div>
<Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50 gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Registered Tourists</h3>
                <p className="text-sm text-slate-500">Manage all customer accounts</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="Search tourists..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="BANNED">Banned</option>
                </select>
              </div>
            </div>
            
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex gap-3 overflow-x-auto">
              <button 
                onClick={exportUsers}
                className="whitespace-nowrap flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-sky-600 transition-colors shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" /> Export Users (CSV)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersData.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img src={user.image} alt={user.name || "User"} className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                              {user.name ? user.name[0].toUpperCase() : "U"}
                            </div>
                          )}
                          <div className="font-bold text-slate-900">{user.name || "Unnamed Tourist"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {user.isBanned ? (
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                            <XCircle className="w-3 h-3" /> Banned
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {format(new Date(user.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.isBanned ? (
                          <button 
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to unban ${user.name || user.email}?`)) {
                                handleUnbanUser(user.id);
                              }
                            }}
                            disabled={isProcessing === user.id}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-4 py-2 rounded-lg text-sm font-bold border border-emerald-200 transition-colors disabled:opacity-50"
                          >
                            {isProcessing === user.id ? "Updating..." : "Unban"}
                          </button>
                        ) : (
                          <button 
                            onClick={() => setBanningUser(user)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold border border-red-200 transition-colors"
                          >
                            Ban User
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                                  {(!usersData || usersData.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        No registered tourists found.
                      </td>
                    </tr>
                  )}
                </tbody></table></div>
<Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Platform Bookings</h3>
                  <p className="text-sm text-slate-500">Overview of all transactions</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    placeholder="Search bookings..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="ALL">All Status</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex gap-3 overflow-x-auto">
                <button 
                  onClick={exportRevenueTaxReport}
                  className="whitespace-nowrap flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-sky-600 transition-colors shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" /> Export Revenue/Tax Report (CSV)
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Booking ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Booking Details</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dates</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookingsData && bookingsData.map((booking: any) => (
                      <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                          {booking.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{booking.user?.name || "Unknown"}</div>
                          <div className="text-xs text-slate-500">{booking.user?.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">
                            {booking.property?.name || (booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : "Unknown Item")}
                          </div>
                          <div className="text-xs text-slate-500">
                            by {booking.property?.vendorProfile?.businessName || booking.vehicle?.vendorProfile?.businessName || "Unknown Vendor"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {format(new Date(booking.checkIn), "dd MMM")} - {format(new Date(booking.checkOut), "dd MMM yyyy")}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          ₹{booking.amount}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {booking.status === "CONFIRMED" ? (
                            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full inline-block">
                              CONFIRMED
                            </span>
                          ) : booking.status === "CANCELLED" ? (
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full inline-block">
                              CANCELLED
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full inline-block">
                              PENDING
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!bookingsData || bookingsData.length === 0) && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No bookings have been made on the platform yet.
                        </td>
                      </tr>
                    )}
                  </tbody></table></div>
<Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
            </div>
          </div>
        )}

        {activeTab === "payouts" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50 gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Vendor Payouts</h3>
                <p className="text-sm text-slate-500">Manage outstanding vendor payments (85% cuts)</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="Search payouts..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                  <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="ALL">All Payouts</option>
                  <option value="PENDING">Pending Only</option>
                  <option value="PAID">Paid Only</option>
                </select>
              </div>
            </div>
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex gap-3">
              <button 
                onClick={exportPayouts}
                className="flex items-center gap-2 text-xs font-bold bg-sky-600 text-white px-3 py-1.5 rounded-lg hover:bg-sky-700 transition-colors shadow-sm"
              >
                <IndianRupee className="w-3.5 h-3.5" /> Export Pending Payouts to Bank (CSV)
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bank Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Earnings (85%)</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount Paid</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Balance</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayouts.map((p, index) => (
                    <tr key={p.vendorId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{p.businessName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 font-medium">{p.accountHolderName || "N/A"}</div>
                        <div className="text-xs text-slate-500">{p.bankName || "No Bank"} | A/C: {p.accountNumber || "N/A"}</div>
                        <div className="text-xs text-slate-500">IFSC: {p.ifscCode || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-700">
                        ₹{p.totalEarnings.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-emerald-600">
                        ₹{p.amountPaid.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-orange-600">
                        ₹{p.pendingBalance.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {p.pendingBalance > 0 ? (
                          <button 
                            onClick={() => {
                              setPayoutConfirmModal({
                                isOpen: true,
                                vendorId: p.vendorId,
                                businessName: p.businessName,
                                amount: p.pendingBalance
                              });
                            }}
                            disabled={isProcessing === p.vendorId}
                            className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2 ml-auto"
                          >
                            <IndianRupee className="w-4 h-4" /> {isProcessing === p.vendorId ? "Updating..." : "Mark as Paid"}
                          </button>
                        ) : (
                          <span className="text-emerald-600 text-sm font-bold flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-4 h-4" /> Cleared
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(!payouts || payouts.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No vendor payouts to display. Wait for confirmed bookings.
                      </td>
                    </tr>
                  )}
                </tbody></table></div>
<Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
          </div>
        )}

        {activeTab === "manifest" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Daily Operations Manifest</h3>
                  <p className="text-sm text-slate-500">Track incoming tourists by date and service</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    placeholder="Search by Booking ID or Name..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
                  />
                  <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="ALL">All Services</option>
                    <option value="HOTEL">Hotels Only</option>
                    <option value="HOMESTAY">Homestays Only</option>
                    <option value="TAXI">Taxis Only</option>
                  </select>
                  <select 
                    value={filterDate} 
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white font-bold text-sky-700"
                  >
                    <option value="ALL">All Time</option>
                    <option value="TODAY">Today's Arrivals</option>
                    <option value="TOMORROW">Tomorrow's Arrivals</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex gap-3 overflow-x-auto">
                <button 
                  onClick={exportDailyManifest}
                  className="whitespace-nowrap flex items-center gap-2 text-xs font-bold bg-sky-600 text-white px-3 py-1.5 rounded-lg hover:bg-sky-700 transition-colors shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" /> Export Manifest (CSV)
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Booking ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Info</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Service Booked</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vendor Details</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Check-in Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookingsData && bookingsData.map((booking: any) => (
                      <tr key={`manifest-${booking.id}`} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-slate-500 font-bold">
                          {booking.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{booking.user?.name || "Unknown"}</div>
                          <div className="text-xs text-slate-500">{booking.user?.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">
                            {booking.property?.name || (booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : "Unknown Item")}
                          </div>
                          <div className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full inline-block mt-1">
                            {booking.property?.vendorProfile?.type || booking.vehicle?.vendorProfile?.type || "UNKNOWN"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {booking.property?.vendorProfile?.businessName || booking.vehicle?.vendorProfile?.businessName || "Unknown Vendor"}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                          {booking.checkIn ? format(new Date(booking.checkIn), "dd MMM yyyy") : "N/A"}
                        </td>
                      </tr>
                    ))}
                    {(!bookingsData || bookingsData.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <FileText className="w-10 h-10 mb-3 text-slate-300" />
                            <p className="font-medium">No arrivals match your filters.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody></table></div>
<Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
            </div>
          </div>
        )}

      </div>

      {/* KYC Modal */}
      {kycVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">KYC Documents</h2>
                <p className="text-sm text-slate-500">{kycVendor.businessName} ({kycVendor.type})</p>
              </div>
              <button onClick={() => setKycVendor(null)} className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1 space-y-6">
              {!kycVendor.kycDocuments || kycVendor.kycDocuments.length === 0 ? (
                <div className="text-center p-12 text-slate-500 font-medium">No KYC documents uploaded by this vendor yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {kycVendor.kycDocuments.map((doc, idx) => (
                    <div key={idx} className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                      <a href={doc} target="_blank" rel="noopener noreferrer" className="block relative aspect-[4/3] rounded-lg overflow-hidden group">
                        {doc.toLowerCase().endsWith('.pdf') ? (
                          <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 group-hover:bg-slate-200 transition-colors">
                            <FileText className="w-12 h-12 mb-2" />
                            <span className="font-semibold text-sm">View PDF</span>
                          </div>
                        ) : (
                          <img src={doc} alt={`KYC Document ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm">
                          Click to Enlarge
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vendor Details Modal */}
      {selectedVendorDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Vendor Application Details</h2>
                <p className="text-sm text-slate-500">Review all information before approving.</p>
              </div>
              <button onClick={() => setSelectedVendorDetails(null)} className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Business Info</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-slate-500 mb-1">Business Name</span>
                    <span className="font-semibold text-slate-900">{selectedVendorDetails.businessName}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Service Type</span>
                    <span className="font-semibold text-slate-900">{selectedVendorDetails.type}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-slate-500 mb-1">Address</span>
                    <span className="font-semibold text-slate-900">{selectedVendorDetails.address || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Contact Info</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-slate-500 mb-1">Owner Name</span>
                    <span className="font-semibold text-slate-900">{selectedVendorDetails.user?.name || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Email Address</span>
                    <span className="font-semibold text-slate-900">{selectedVendorDetails.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Primary Phone</span>
                    <span className="font-semibold text-slate-900">{selectedVendorDetails.phone || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Alt Contact ({selectedVendorDetails.altContactPerson || "N/A"})</span>
                    <span className="font-semibold text-slate-900">{selectedVendorDetails.altPhone || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Bank Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="col-span-2">
                    <span className="block text-slate-500 mb-1">Account Holder Name</span>
                    <span className="font-bold text-slate-900">{selectedVendorDetails.accountHolderName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Bank Name</span>
                    <span className="font-semibold text-slate-900">{selectedVendorDetails.bankName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Account Number</span>
                    <span className="font-mono font-semibold text-slate-900">{selectedVendorDetails.accountNumber || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">IFSC Code</span>
                    <span className="font-mono font-semibold text-slate-900 uppercase">{selectedVendorDetails.ifscCode || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedVendorDetails(null)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              {!selectedVendorDetails.isApproved && selectedVendorDetails.status !== "REJECTED" && (
                <>
                  <button 
                    onClick={() => {
                      setRejectingVendor(selectedVendorDetails);
                      setSelectedVendorDetails(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-bold hover:bg-orange-200 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button 
                    onClick={() => {
                      handleApprove(selectedVendorDetails.id);
                      setSelectedVendorDetails(null);
                    }}
                    disabled={isProcessing === selectedVendorDetails.id}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isProcessing === selectedVendorDetails.id ? "Processing..." : "Approve Vendor"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Suspend Vendor</h2>
              <p className="text-sm text-slate-500 mt-1">Provide a reason for suspending {rejectingVendor.businessName}.</p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Reason</label>
              <textarea
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                rows={4}
                placeholder="e.g., Policy violation."
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
              />
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setRejectingVendor(null);
                  setRejectionRemarks("");
                }}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => activeTab === 'live_vendors' ? handleSuspendVendor(rejectingVendor.id) : handleReject(rejectingVendor.id)}
                disabled={isProcessing === rejectingVendor.id}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isProcessing === rejectingVendor.id ? "Processing..." : (activeTab === 'live_vendors' ? "Suspend Vendor" : "Reject Vendor")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Details Modal */}
      {selectedPropertyDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Property Details</h2>
                <p className="text-sm text-slate-500">{selectedPropertyDetails.vendorProfile.businessName}</p>
              </div>
              <button onClick={() => setSelectedPropertyDetails(null)} className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Basic Info</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-slate-500">Name:</span> <span className="font-semibold text-slate-900">{selectedPropertyDetails.name}</span></p>
                    <p><span className="text-slate-500">Location:</span> <span className="font-semibold text-slate-900">{selectedPropertyDetails.location}</span></p>
                    <p><span className="text-slate-500">Price:</span> <span className="font-semibold text-slate-900 font-mono">₹{selectedPropertyDetails.pricePerNight} / night</span></p>
                    <p><span className="text-slate-500">Total Rooms:</span> <span className="font-semibold text-slate-900">{selectedPropertyDetails.totalRooms}</span></p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPropertyDetails.amenities.map(amenity => (
                      <span key={amenity} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">{amenity}</span>
                    ))}
                    {selectedPropertyDetails.amenities.length === 0 && <span className="text-slate-400 text-sm">None provided</span>}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Photos</h3>
                <div className="grid grid-cols-3 gap-3">
                  {selectedPropertyDetails.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Property ${idx}`} className="w-full h-32 object-cover rounded-lg" />
                  ))}
                  {selectedPropertyDetails.images.length === 0 && <div className="col-span-3 text-slate-400 text-sm">No photos provided</div>}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedPropertyDetails(null)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              {!selectedPropertyDetails.isApproved && selectedPropertyDetails.status !== "REJECTED" && (
                <>
                  <button 
                    onClick={() => {
                      setRejectingProperty(selectedPropertyDetails);
                      setSelectedPropertyDetails(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-bold hover:bg-orange-200 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button 
                    onClick={() => {
                      handleApproveProperty(selectedPropertyDetails.id);
                      setSelectedPropertyDetails(null);
                    }}
                    disabled={isProcessing === selectedPropertyDetails.id}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve Listing
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Property Reject Modal */}
      {rejectingProperty && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Suspend Listing</h2>
              <p className="text-sm text-slate-500 mt-1">Provide a reason for suspending {rejectingProperty.name}.</p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Reason</label>
              <textarea
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                rows={4}
                placeholder="e.g., Photos are blurry or price is unrealistic."
                value={propertyRejectionRemarks}
                onChange={(e) => setPropertyRejectionRemarks(e.target.value)}
              />
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setRejectingProperty(null);
                  setPropertyRejectionRemarks("");
                }}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => activeTab === 'live_listings' ? handleSuspendProperty(rejectingProperty.id) : handleRejectProperty(rejectingProperty.id)}
                disabled={isProcessing === rejectingProperty.id}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isProcessing === rejectingProperty.id ? "Processing..." : (activeTab === 'live_listings' ? "Suspend Listing" : "Reject Listing")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Payout Confirmation Modal */}
      {payoutConfirmModal?.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center pt-8">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-sky-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Confirm Payout</h3>
              <p className="text-slate-600">
                Are you sure you want to mark <span className="font-bold text-slate-900">₹{payoutConfirmModal.amount.toLocaleString()}</span> as PAID for <span className="font-bold text-slate-900">{payoutConfirmModal.businessName}</span>?
              </p>
              <div className="mt-4 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                <p className="text-sm text-orange-800 font-medium">
                  Make sure you have already transferred the money to their bank account before confirming.
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setPayoutConfirmModal(null)}
                className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleMarkPaid(payoutConfirmModal.vendorId);
                  setPayoutConfirmModal(null);
                }}
                disabled={isProcessing === payoutConfirmModal.vendorId}
                className="flex-1 px-4 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors shadow-md disabled:opacity-50"
              >
                {isProcessing === payoutConfirmModal.vendorId ? "Updating..." : "Yes, Mark as Paid"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
