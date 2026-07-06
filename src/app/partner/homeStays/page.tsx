"use client";

import { useState, useEffect } from "react";
import { Home, Save, Plus, MapPin, IndianRupee, CheckCircle2, AlertTriangle, Lock, Award, Image as ImageIcon, LineChart as LineChartIcon, Zap, MessageCircle, BookOpen, Camera, Users, Edit, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Download } from "lucide-react";
import { useVendor } from "@/context/VendorContext";
import Script from "next/script";
import dynamic from "next/dynamic";
const ImageUpload = dynamic(() => import("@/components/ImageUpload"), { ssr: false });

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addProperty, updateProperty, deleteProperty } from "@/actions/listings";
import { updateSubscriptionPlan } from "@/actions/vendor";
import { propertySchema } from "@/lib/validations";
import toast from 'react-hot-toast';
import { calculateDashboardMetrics } from "@/lib/chartUtils";

// --- ZOD SCHEMA FOR HOMESTAY LISTING ---
const homestayListingSchema = propertySchema.omit({ pricePerNight: true }).extend({
  name: z.string().min(3, "Homestay name must be at least 3 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters"),
  basePrice: z.number().min(300, "Base price must be at least ₹300").max(20000),
  location: z.string().min(5, "Please provide a complete address/location"),
  maxGuests: z.number().min(1, "Must accommodate at least 1 guest").max(20),
  instantBooking: z.boolean().optional(),
});

type HomestayListingFormValues = z.infer<typeof homestayListingSchema>;
type SubscriptionPlan = "Free" | "Growth Pro" | "Pro" | "Enterprise";

export default function HomestayDashboard({ bookings = [], properties = [] }: { bookings?: any[], properties?: any[] }) {
  const { vendorName, isApproved, status, rejectionReason, subscriptionPlan, setSubscriptionPlan } = useVendor();
  const [activeTab, setActiveTab] = useState("overview");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [timeRange, setTimeRange] = useState("7D");
  const [chartMetric, setChartMetric] = useState("views");

  // Chart Mock Data
  const viewData7D = [
    { name: 'Mon', views: 8, revenue: 8000, bookings: 2 },
    { name: 'Tue', views: 14, revenue: 14000, bookings: 3 },
    { name: 'Wed', views: 11, revenue: 11000, bookings: 2 },
    { name: 'Thu', views: 22, revenue: 22000, bookings: 4 },
    { name: 'Fri', views: 35, revenue: 35000, bookings: 6 },
    { name: 'Sat', views: 51, revenue: 51000, bookings: 8 },
    { name: 'Sun', views: 40, revenue: 40000, bookings: 7 },
  ];

  const viewData30D = [
    { name: 'Week 1', views: 110, revenue: 95000, bookings: 15 },
    { name: 'Week 2', views: 140, revenue: 120000, bookings: 18 },
    { name: 'Week 3', views: 165, revenue: 140000, bookings: 22 },
    { name: 'Week 4', views: 210, revenue: 175000, bookings: 28 },
  ];

  const viewData90D = [
    { name: 'Month 1', views: 450, revenue: 380000, bookings: 65 },
    { name: 'Month 2', views: 580, revenue: 490000, bookings: 80 },
    { name: 'Month 3', views: 690, revenue: 580000, bookings: 95 },
  ];

  const getChartData = () => {
    if (timeRange === "7D") return viewData7D;
    if (timeRange === "30D") return viewData30D;
    return viewData90D;
  };

  const demographicData = [
    { name: 'Couples', value: 45 },
    { name: 'Families', value: 35 },
    { name: 'Solo', value: 15 },
    { name: 'Groups', value: 5 },
  ];
  const COLORS = ['#f43f5e', '#8b5cf6', '#0ea5e9', '#10b981'];

  const [coverPhoto, setCoverPhoto] = useState<string>("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const availableAmenities = [
    "Mountain view", "Lake view", "Free WiFi", "Dedicated workspace",
    "Room service", "Free parking on premises", "Heating", "AC", "Breakfast included"
  ];

  // Feature Gating Logic
  const photoLimit = 100;
  const videoLimit = 20;
  const hasAnalytics = true;
  const hasInstantBooking = true;

  // React Hook Form Integration
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<HomestayListingFormValues>({
    resolver: zodResolver(homestayListingSchema),
    mode: "onChange",
    defaultValues: {
      basePrice: 1500,
      maxGuests: 4,
      instantBooking: false,
    }
  });

  useEffect(() => {
    if (hasInstantBooking) {
      setValue("instantBooking", true);
    }
  }, [hasInstantBooking, setValue]);

  const watchBasePrice = watch("basePrice", 1500);

  // Business Model Logic: 8% commission for homestays
  const commissionRate = 0.08;
  const platformFee = Math.round((watchBasePrice || 0) * commissionRate);
  const netEarnings = (watchBasePrice || 0) - platformFee;

  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleSimulateUpgrade = async (planName: SubscriptionPlan, priceString: string) => {
    if (subscriptionPlan === planName) return;
    
    if (planName === "Enterprise") {
      toast.success("Our sales team will contact you shortly to setup your Enterprise account!", { icon: '📞' });
      return;
    }

    setIsUpgrading(true);
    const toastId = toast.loading("Initializing payment...");
    
    try {
      const numericPrice = parseInt(priceString.replace(/[^0-9]/g, ""));
      if (isNaN(numericPrice) || numericPrice <= 0) {
        toast.error("Invalid price", { id: toastId });
        setIsUpgrading(false);
        return;
      }

      const response = await fetch("/api/razorpay/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: planName,
          amount: numericPrice,
        }),
      });

      const orderData = await response.json();

      if (orderData.error) {
        toast.error(orderData.error, { id: toastId });
        setIsUpgrading(false);
        return;
      }

      toast.dismiss(toastId);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "WanderKashmir",
        description: `${planName} Subscription`,
        image: "/images/razorpay.svg",
        order_id: orderData.id,
        handler: async function (response: any) {
          const verifyToast = toast.loading("Verifying payment...");
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              const updateRes = await updateSubscriptionPlan(planName);
              if (updateRes.success) {
                setSubscriptionPlan(planName);
                toast.success(`Success! You are now on the ${planName} plan. New features have been unlocked.`, { id: verifyToast });
              } else {
                toast.error(updateRes.error || "Payment verified, but failed to update plan. Please contact support.", { id: verifyToast });
              }
            } else {
              toast.error("Payment Verification Failed!", { id: verifyToast });
            }
          } catch (e) {
            toast.error("Something went wrong during verification", { id: verifyToast });
          } finally {
            setIsUpgrading(false);
          }
        },
        theme: { color: "#ea580c" },
      };

      // @ts-ignore
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
        setIsUpgrading(false);
      });
      razorpayInstance.open();

    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate checkout", { id: toastId });
      setIsUpgrading(false);
    }
  };

  const handlePhotoUpload = () => {
    if (uploadedPhotos.length >= photoLimit) {
      toast.error(`Your ${subscriptionPlan} plan only allows up to ${photoLimit} photos. Upgrade your plan to add more!`);
      return;
    }
    setUploadedPhotos([...uploadedPhotos, `photo-${uploadedPhotos.length + 1}.jpg`]);
  };

  const hasReachedLimit = false;

  const handleAddNewClick = () => {
    if (hasReachedLimit) {
      toast.error("You have reached the maximum limit of 1 property on the Free plan. Please upgrade to add more properties.", { duration: 5000, id: 'limit-error' });
      setActiveTab("financials");
      return;
    }

    reset({
      name: "",
      description: "",
      location: "",
      basePrice: 1500,
      maxGuests: 4,
      instantBooking: false
    });
    setCoverPhoto("");
    setUploadedPhotos([]);
    setSelectedAmenities([]);
    setEditingId(null);
    setActiveTab("listings");
  };

  const handleEdit = (property: any) => {
    reset({
      name: property.name,
      description: property.description,
      location: property.location,
      basePrice: property.pricePerNight,
      maxGuests: property.maxGuests || 4,
      instantBooking: false
    });
    setCoverPhoto(property.images?.[0] || "");
    setUploadedPhotos(property.images?.slice(1) || []);
    setSelectedAmenities(property.amenities || []);
    setEditingId(property.id);
    setActiveTab("listings");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      const res = await deleteProperty(id);
      if (res.success) {
        toast.success("Property deleted successfully.");
      } else {
        toast.error("Failed to delete property.");
      }
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: HomestayListingFormValues) => {
    if (!isApproved) {
      toast.error("Error: Your profile is pending Admin approval. You cannot publish this listing yet.");
      return;
    }
    setIsSubmitting(true);
    try {
      const allImages = coverPhoto ? [coverPhoto, ...uploadedPhotos] : uploadedPhotos;
      let res;
      if (editingId) {
        res = await updateProperty(editingId, {
          name: data.name,
          description: data.description,
          location: data.location,
          pricePerNight: data.basePrice,
          images: allImages,
          amenities: selectedAmenities,
          totalRooms: 1 // homestays are single units usually
        });
      } else {
        if (hasReachedLimit) {
          toast.error("You have reached the maximum limit of 1 property on the Free plan.");
          setIsSubmitting(false);
          setActiveTab("financials");
          return;
        }
        res = await addProperty({
          name: data.name,
          description: data.description,
          location: data.location,
          pricePerNight: data.basePrice,
          images: allImages,
          amenities: selectedAmenities,
          totalRooms: 1 // homestays are single units usually
        });
      }

      if (res.success) {
        toast.success(`Listing ${editingId ? "updated" : "published"} successfully!`);
        reset();
        setCoverPhoto("");
        setUploadedPhotos([]);
        setSelectedAmenities([]);
        setEditingId(null);
        setActiveTab("overview");
      } else {
        toast.error(`Failed to ${editingId ? "update" : "publish"} listing: ` + res.error);
      }
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subscriptionTiers = [
    { name: "Free", price: "₹0", description: "Basic listing for new properties", features: ["Standard Ranking", "3 Property Photos", "Basic Dashboard"], isPopular: false },
    { name: "Growth Pro", price: "₹599/mo", description: "Get more visibility and bookings", features: ["Priority Listing", "20 Property Photos", "Advanced Analytics", "Onboarding Helpline (WhatsApp)", "Help Center & Tutorials (Hindi/English)"], isPopular: true },
    { name: "Enterprise", price: "₹1,499/mo", description: "For large homestays or multiples", features: ["All Growth Pro Features", "Featured Badge & Homepage", "Dedicated Account Manager", "Free Professional Photography", "Trilingual Support (Kashmiri/Hindi/EN)", "Lowest Platform Commission (5%)"], isPopular: false }
  ];

  return (
    <>
    <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{vendorName || "Homestay"} Dashboard</h1>
            {subscriptionPlan !== "Free" && (
              <span className="bg-gradient-to-r from-sky-200 to-sky-400 text-sky-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider shadow-sm">
                <Award className="w-4 h-4" /> {subscriptionPlan} Host
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500">Manage your homestay listings and bookings.</p>
            {!isApproved && status === "PENDING" && (
              <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                <AlertTriangle className="w-3 h-3" /> Pending Approval
              </span>
            )}
            {!isApproved && status === "REJECTED" && (
              <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                <AlertTriangle className="w-3 h-3" /> Application Rejected
              </span>
            )}
            {status === "SUSPENDED" && (
              <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                <Lock className="w-3 h-3" /> Suspended
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={handleAddNewClick}
          disabled={!isApproved || status === "SUSPENDED"}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
            (!isApproved || status === "SUSPENDED")
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : hasReachedLimit 
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                : 'bg-sky-500 text-white hover:bg-sky-600'
          }`}
        >
          <Plus className="w-5 h-5" />
          <span>Add New Homestay</span>
        </button>
      </div>

      {status === "SUSPENDED" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-red-900 text-lg">Your account has been suspended by the Admin</h3>
            <p className="text-red-700 mt-1">Reason: <span className="font-semibold">{rejectionReason || "Policy violation."}</span></p>
            <p className="text-red-600 text-sm mt-2">Your listings are currently hidden from tourists and you cannot add new listings. Please contact support.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200 mb-8 overflow-x-auto whitespace-nowrap">
        {["overview", "listings", "bookings"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              if (tab === "listings" && hasReachedLimit && !editingId) {
                toast.error("You have reached the maximum limit of 1 property on the Free plan. Please upgrade to add more properties.", { duration: 5000, id: 'limit-error-tab' });
                setActiveTab("financials");
              } else {
                if (tab === "listings" && !editingId) {
                  handleAddNewClick();
                }
                setActiveTab(tab);
              }
            }}
            className={`pb-4 text-sm font-semibold capitalize transition-colors relative ${
              activeTab === tab ? "text-sky-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
            {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-500 rounded-t-full" />}
          </button>
        ))}
      </div>

      {activeTab === "financials" && (
        <div className="space-y-8">
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-sky-900 mb-2">Welcome Homestay Host!</h2>
            <p className="text-sky-800">You enjoy our special lowest commission tier of 8% to help grow local tourism. Choose a subscription plan to boost visibility.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionTiers.map((tier) => {
                const isActive = subscriptionPlan === tier.name;
                
                return (
                  <div key={tier.name} className={`bg-white rounded-2xl border relative ${isActive ? 'border-sky-500 shadow-md ring-4 ring-sky-50' : tier.isPopular ? 'border-sky-500 shadow-md' : 'border-slate-200 shadow-sm'} p-6 flex flex-col transition-all`}>
                    {tier.isPopular && !isActive && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>}
                    {isActive && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active Plan
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                    <div className="mt-4 mb-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-slate-900">{tier.price}</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-6">{tier.description}</p>
                    <ul className="space-y-3 mb-8 flex-1">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={() => handleSimulateUpgrade(tier.name as SubscriptionPlan, tier.price)}
                      disabled={isActive || tier.name === "Free"}
                      className={`w-full py-2.5 rounded-lg font-bold transition-colors ${
                        isActive ? 'bg-sky-50 text-sky-600 border border-sky-200 cursor-default' : tier.name === 'Free' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {isActive ? "Current Plan" : "Upgrade Now"}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Commission Structure</h3>
            <p className="text-slate-600">As a local homestay, you are on our preferred tier. WanderKashmir deducts only a flat <strong className="text-slate-900">8% platform fee</strong> on successful bookings.</p>
          </div>
        </div>
      )}

      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <span className="text-slate-500 text-sm font-medium mb-2">Total Earnings</span>
              <span className="text-3xl font-bold text-slate-900">₹0</span>
              <span className="text-slate-400 text-sm font-medium mt-2">New Account</span>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <span className="text-slate-500 text-sm font-medium mb-2">Active Properties</span>
              <span className="text-3xl font-bold text-slate-900">{properties.length}</span>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <span className="text-slate-500 text-sm font-medium mb-2">Total Views</span>
              <span className="text-3xl font-bold text-slate-900">0</span>
            </div>
          </div>

          {/* Display Properties List */}
          {properties.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Your Properties</h2>
              </div>
              
              {hasReachedLimit && (
                <div className="bg-orange-50 border-b border-orange-100 p-4 px-6 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <p className="text-orange-900 font-bold text-sm">Property Limit Reached</p>
                      <p className="text-orange-700 text-sm mt-0.5">Upgrade your plan to add more properties and get priority listings.</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab("financials")} className="whitespace-nowrap bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors flex-shrink-0">
                    Upgrade Plan
                  </button>
                </div>
              )}
              <div className="divide-y divide-slate-100">
                {properties.map((prop: any) => (
                  <div key={prop.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{prop.name}</h3>
                      <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {prop.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-lg">₹{prop.pricePerNight} <span className="text-sm font-normal text-slate-500">/ night</span></p>
                      <p className="text-xs font-semibold text-sky-600 mt-1">Up to {prop.totalRooms * 2} Guests</p>
                      <div className="flex items-center justify-end gap-2 mt-2">
                        {!prop.isApproved ? (
                          prop.status === "REJECTED" ? (
                            <div className="flex flex-col items-end">
                              <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">Rejected</span>
                              {prop.rejectionReason && <span className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={prop.rejectionReason}>{prop.rejectionReason}</span>}
                            </div>
                          ) : prop.status === "SUSPENDED" ? (
                            <div className="flex flex-col items-end">
                              <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><Lock className="w-3 h-3" /> Suspended</span>
                              {prop.rejectionReason && <span className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={prop.rejectionReason}>{prop.rejectionReason}</span>}
                            </div>
                          ) : (
                            <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">Pending Approval</span>
                          )
                        ) : (
                          <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">Live</span>
                        )}
                        <button onClick={() => handleEdit(prop)} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="Edit Property">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(prop.id)} className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Delete Property">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADVANCED ANALYTICS (FEATURE GATED) */}
          <div className={`relative bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-hidden mt-8 ${!hasAnalytics ? 'min-h-[350px] bg-slate-50 flex flex-col' : ''}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <LineChartIcon className="w-6 h-6 text-sky-500" />
                <h2 className="text-xl font-bold text-slate-900">Advanced Analytics</h2>
              </div>
              {hasAnalytics && (
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-1 rounded-lg flex items-center">
                    <button onClick={() => setTimeRange("7D")} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${timeRange === "7D" ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>7D</button>
                    <button onClick={() => setTimeRange("30D")} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${timeRange === "30D" ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>30D</button>
                    <button onClick={() => setTimeRange("90D")} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${timeRange === "90D" ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>90D</button>
                  </div>
                  <button onClick={() => toast.success("Analytics report downloaded successfully!")} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors" title="Export Data">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {!hasAnalytics && (
              <>
                <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-4 ring-4 ring-slate-100">
                    <Lock className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Analytics Locked</h3>
                  <p className="text-slate-600 max-w-md mb-6">Upgrade to the Growth Pro or Enterprise plan to view detailed conversion rates, customer demographics, and search appearances.</p>
                  <button onClick={() => setActiveTab("financials")} className="bg-sky-500 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-sky-600 transition-colors shadow-sm">
                    View Upgrade Plans
                  </button>
                </div>
                {/* Fake blurred background to give it shape */}
                <div className="flex-1 opacity-20 pointer-events-none mt-4 flex items-end gap-2 px-8">
                  <div className="w-1/6 h-24 bg-sky-200 rounded-t-lg"></div>
                  <div className="w-1/6 h-32 bg-sky-300 rounded-t-lg"></div>
                  <div className="w-1/6 h-16 bg-sky-200 rounded-t-lg"></div>
                  <div className="w-1/6 h-40 bg-sky-400 rounded-t-lg"></div>
                  <div className="w-1/6 h-28 bg-sky-300 rounded-t-lg"></div>
                  <div className="w-1/6 h-48 bg-sky-500 rounded-t-lg"></div>
                </div>
              </>
            )}

            {hasAnalytics && (() => {
              const { totalViews, totalBookings, totalRevenue, growthViews, growthBookings, growthRevenue } = calculateDashboardMetrics(bookings, "HOMESTAY", timeRange);
              return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-4">
                  <button onClick={() => setChartMetric("views")} className={`p-4 rounded-xl border-2 transition-all text-left ${chartMetric === "views" ? 'border-sky-500 bg-sky-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                    <div className="text-slate-500 text-sm font-medium mb-1">Profile Views</div>
                    <div className="text-2xl font-black text-slate-900">{totalViews.toLocaleString()}</div>
                    <div className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">+{growthViews}%</div>
                  </button>
                  <button onClick={() => setChartMetric("bookings")} className={`p-4 rounded-xl border-2 transition-all text-left ${chartMetric === "bookings" ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                    <div className="text-slate-500 text-sm font-medium mb-1">Confirmed Bookings</div>
                    <div className="text-2xl font-black text-slate-900">{totalBookings}</div>
                    <div className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">+{growthBookings}%</div>
                  </button>
                  <button onClick={() => setChartMetric("revenue")} className={`p-4 rounded-xl border-2 transition-all text-left ${chartMetric === "revenue" ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                    <div className="text-slate-500 text-sm font-medium mb-1">Net Earnings</div>
                    <div className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</div>
                    <div className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">+{growthRevenue}%</div>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <h3 className="text-sm font-bold text-slate-700 mb-6">Performance Trend</h3>
                    <div className="h-64 w-full -ml-4">
                      <ResponsiveContainer width="100%" height="100%">
                        {chartMetric === "views" ? (
                          <BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="views" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={timeRange === "7D" ? 30 : 40} />
                          </BarChart>
                        ) : chartMetric === "bookings" ? (
                          <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" />
                          </AreaChart>
                        ) : (
                          <LineChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val/1000}k`} />
                            <RechartsTooltip formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-2">Guest Demographics</h3>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={demographicData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {demographicData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-2">
                      {demographicData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                            <span className="text-slate-600 font-medium">{item.name}</span>
                          </div>
                          <span className="font-bold text-slate-900">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-100">
                  <div className="bg-slate-50 rounded-lg p-4 flex flex-col justify-center border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium mb-1">Search Appearance</p>
                    <div className="flex items-end gap-2">
                      <p className="text-xl font-bold text-slate-900">{totalViews.toLocaleString()}</p>
                      <span className="text-emerald-500 text-xs font-bold mb-1">+{growthViews}%</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 flex flex-col justify-center border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium mb-1">Click-Through Rate</p>
                    <div className="flex items-end gap-2">
                      <p className="text-xl font-bold text-slate-900">11.4%</p>
                      <span className="text-emerald-500 text-xs font-bold mb-1">+4.1%</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 flex flex-col justify-center border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium mb-1">Checkout Initiated</p>
                    <div className="flex items-end gap-2">
                      <p className="text-xl font-bold text-slate-900">{totalBookings}</p>
                      <span className="text-emerald-500 text-xs font-bold mb-1">+{growthBookings}%</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 flex flex-col justify-center border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium mb-1">Booking Conversion</p>
                    <div className="flex items-end gap-2">
                      <p className="text-xl font-bold text-slate-900">4.5%</p>
                      <span className="text-emerald-500 text-xs font-bold mb-1">+1.2%</span>
                    </div>
                  </div>
                </div>
              </>
              );
            })()}
          </div>

          {/* PREMIUM SUPPORT HUB */}
          {(subscriptionPlan === "Growth Pro" || subscriptionPlan === "Enterprise") && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 shadow-md text-white border border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Premium Support Hub</h2>
                  <p className="text-slate-300 text-sm">{subscriptionPlan} privileges unlocked</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="https://wa.me/1234567890?text=Hi%20WanderKashmir%20Support,%20I%20am%20a%20Growth%20Pro%20Vendor" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 transition-colors p-4 rounded-xl flex items-center gap-3 border border-white/5">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Onboarding Helpline</h3>
                    <p className="text-xs text-slate-300 mt-0.5">WhatsApp support for queries</p>
                  </div>
                </a>
                
                <button onClick={() => toast.success("Help Center opening soon!")} className="bg-white/10 hover:bg-white/20 transition-colors p-4 rounded-xl flex items-center gap-3 border border-white/5 text-left">
                  <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Help Center</h3>
                    <p className="text-xs text-slate-300 mt-0.5">FAQ & Tutorials in Hindi/English</p>
                  </div>
                </button>

                {subscriptionPlan === "Enterprise" && (
                  <>
                    <button onClick={() => toast.success("Request sent! Our photography team will contact you within 24 hours.", { icon: "📸" })} className="bg-white/10 hover:bg-white/20 transition-colors p-4 rounded-xl flex items-center gap-3 border border-white/5 text-left">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">Photo Assistance</h3>
                        <p className="text-xs text-slate-300 mt-0.5">Request free professional shoot</p>
                      </div>
                    </button>
                    
                    <a href="tel:+1234567890" className="bg-white/10 hover:bg-white/20 transition-colors p-4 rounded-xl flex items-center gap-3 border border-white/5">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">Dedicated Account Manager</h3>
                        <p className="text-xs text-slate-300 mt-0.5">Trilingual (Kashmiri, Hindi, EN)</p>
                      </div>
                    </a>
                  </>
                )}
              </div>
            </div>
          )}

          {/* PRO & ENTERPRISE TOOLS HUB */}
          {(subscriptionPlan === "Pro" || subscriptionPlan === "Enterprise") && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Pro Seller Tools</h2>
                  <p className="text-slate-500 text-sm">Advanced tools to maximize your bookings</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-slate-100 bg-slate-50 rounded-xl p-4">
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Instant Booking</h3>
                  <p className="text-xs text-slate-500 mb-3">Allow guests to book without manual approval.</p>
                  <button onClick={() => toast.success("Instant Booking enabled for all properties!")} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors w-full">Manage Settings</button>
                </div>
                
                <div className="border border-slate-100 bg-slate-50 rounded-xl p-4">
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Promotional Offers</h3>
                  <p className="text-xs text-slate-500 mb-3">Create custom discounts and coupon codes.</p>
                  <button onClick={() => toast.success("Promo code builder opening soon!")} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors w-full">Create Offer</button>
                </div>

                <div className="border border-slate-100 bg-slate-50 rounded-xl p-4">
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Featured Placement</h3>
                  <p className="text-xs text-slate-500 mb-3">Manage your homepage visibility slots.</p>
                  <button onClick={() => toast.success("Homepage slot requested successfully!")} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors w-full">Request Slot</button>
                </div>
              </div>
            </div>
          )}

          {/* ENTERPRISE ONLY API HUB */}
          {subscriptionPlan === "Enterprise" && (
            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800 mt-6 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Enterprise API & Integrations</h2>
                  <p className="text-slate-400 text-sm">Connect your own PMS or Channel Manager</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm">REST API Access Keys</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Generate tokens for custom integrations</p>
                  </div>
                  <button onClick={() => toast.success("API Keys generated and sent to your email!")} className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 text-sm font-bold rounded-lg transition-colors">Generate</button>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm">Bulk Room Management</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Upload CSV/Excel for pricing updates</p>
                  </div>
                  <button onClick={() => toast.success("CSV Upload modal opening soon!")} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-bold rounded-lg transition-colors">Upload</button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* LISTINGS MODULE WITH ZOD VALIDATION */}
      {activeTab === "listings" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Homestay' : 'Your First Homestay Listing'}</h2>
                <p className="text-sm text-slate-500 mt-1">Fill out the details below to make your property live on WanderKashmir.</p>
              </div>
            </div>
            
            {/* APPROVAL WARNING */}
            {!isApproved && (
              <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-orange-900 text-sm">Profile Pending Verification</h3>
                  <p className="text-sm text-orange-700 mt-1">You can fill out the form and save it as a draft, but you <strong className="font-bold">cannot publish</strong> this listing until your KYC documents are approved by the Admin.</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-8">
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Homestay Name</label>
                  <input 
                    type="text" 
                    {...register("name")}
                    className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${errors.name ? 'border-orange-500 focus:border-orange-500' : 'border-slate-200 focus:border-sky-500'}`} 
                    placeholder="e.g. Ali's Heritage House" 
                  />
                  {errors.name && <p className="text-orange-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea 
                    rows={4} 
                    {...register("description")}
                    className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${errors.description ? 'border-orange-500 focus:border-orange-500' : 'border-slate-200 focus:border-sky-500'}`} 
                    placeholder="Describe the cultural experience..." 
                  />
                  {errors.description && <p className="text-orange-500 text-xs mt-1 font-medium">{errors.description.message}</p>}
                </div>
              </div>

              {/* PHOTO UPLOAD (FEATURE GATED) */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="mb-8 border-b border-slate-200 pb-8">
                  <h3 className="font-bold text-slate-900 mb-2">Cover Photo (Required)</h3>
                  <p className="text-sm text-slate-500 mb-4">This will be the main photo displayed on your listing card.</p>
                  <ImageUpload 
                    uploadedPhotos={coverPhoto ? [coverPhoto] : []} 
                    setUploadedPhotos={(photos: any) => {
                      const arr = typeof photos === 'function' ? photos(coverPhoto ? [coverPhoto] : []) : photos;
                      setCoverPhoto(arr.length > 0 ? arr[arr.length - 1] : "");
                    }} 
                    photoLimit={1} 
                  />
                </div>

                 <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900">Gallery Photos &amp; Videos (Optional)</h3>
                    <p className="text-sm text-slate-500">Your {subscriptionPlan} plan allows up to <strong className="text-slate-900">{photoLimit}</strong> photos and <strong className="text-slate-900">{videoLimit}</strong> videos.</p>
                  </div>
                  <span className="text-sm font-bold text-slate-400">
                    {uploadedPhotos.filter(u => !u.includes("/video/upload/") && !/\.(mp4|webm|mov|ogg|avi|mkv)$/i.test(u)).length} / {photoLimit} Photos, {uploadedPhotos.filter(u => u.includes("/video/upload/") || /\.(mp4|webm|mov|ogg|avi|mkv)$/i.test(u)).length} / {videoLimit} Videos
                  </span>
                </div>
                
                <ImageUpload 
                  uploadedPhotos={uploadedPhotos} 
                  setUploadedPhotos={setUploadedPhotos} 
                  photoLimit={photoLimit} 
                  videoLimit={videoLimit}
                />
                
                {uploadedPhotos.length >= (photoLimit + videoLimit) && subscriptionPlan === "Free" && (
                  <p className="text-orange-600 text-sm mt-4 font-medium flex items-center gap-1">
                    <Lock className="w-4 h-4" /> You've reached the media limit for the Free plan. <button type="button" onClick={() => setActiveTab("financials")} className="underline font-bold">Upgrade to add more.</button>
                  </p>
                )}
              </div>
              
              {/* Amenities */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4">What this place offers (Amenities)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableAmenities.map(amenity => (
                    <label key={amenity} className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAmenities(prev => [...prev, amenity]);
                          } else {
                            setSelectedAmenities(prev => prev.filter(a => a !== amenity));
                          }
                        }}
                        className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 accent-sky-500"
                      />
                      <span className="text-sm font-medium text-slate-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pricing & Commission Breakdown */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4">Pricing & Earnings (Per Night)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Customer Pays (Base Price)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="number" 
                        {...register("basePrice", { valueAsNumber: true })}
                        className={`w-full border rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white ${errors.basePrice ? 'border-orange-500 focus:border-orange-500' : 'border-slate-200 focus:border-sky-500'}`} 
                        placeholder="1500" 
                      />
                    </div>
                    {errors.basePrice && <p className="text-orange-500 text-xs mt-1 font-medium">{errors.basePrice.message}</p>}
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Platform Fee (8%)</span>
                    <span className="text-orange-500 font-medium">- ₹{platformFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-px bg-slate-200 w-full my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">You Earn (Net Payout)</span>
                    <span className="text-xl font-bold text-sky-600">₹{netEarnings.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      {...register("location")}
                      className={`w-full border rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${errors.location ? 'border-orange-500 focus:border-orange-500' : 'border-slate-200 focus:border-sky-500'}`} 
                      placeholder="Boulevard Road, Dal Lake" 
                    />
                  </div>
                  {errors.location && <p className="text-orange-500 text-xs mt-1 font-medium">{errors.location.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Guests</label>
                  <input 
                    type="number" 
                    {...register("maxGuests", { valueAsNumber: true })}
                    className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${errors.maxGuests ? 'border-orange-500 focus:border-orange-500' : 'border-slate-200 focus:border-sky-500'}`} 
                    placeholder="4" 
                  />
                  {errors.maxGuests && <p className="text-orange-500 text-xs mt-1 font-medium">{errors.maxGuests.message}</p>}
                </div>
              </div>

              {/* INSTANT BOOKING (FEATURE GATED) */}
              <div className={`p-6 rounded-xl border ${hasInstantBooking ? 'bg-sky-50 border-sky-200' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${hasInstantBooking ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {hasInstantBooking ? <Zap className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      Enable Instant Booking
                      {!hasInstantBooking && <span className="bg-orange-100 text-orange-800 text-[10px] uppercase px-2 py-0.5 rounded font-bold">Pro Feature</span>}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 mb-3">Allow travelers to book your rooms instantly without requiring manual approval. Properties with Instant Booking see a 30% increase in conversions.</p>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        {...register("instantBooking")}
                        disabled={!hasInstantBooking}
                        className="w-5 h-5 rounded text-sky-500 focus:ring-sky-500 disabled:opacity-50" 
                      />
                      <span className={`font-medium ${hasInstantBooking ? 'text-slate-900' : 'text-slate-400'}`}>
                        Yes, I want to enable Instant Booking
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  className="px-6 py-2.5 rounded-lg font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Save as Draft
                </button>
                <button 
                  type="submit" 
                  disabled={!isApproved || isSubmitting}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
                    isApproved 
                      ? 'bg-slate-900 text-white hover:bg-slate-800' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? "Publishing..." : "Publish Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOOKINGS MODULE */}
      {activeTab === "bookings" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">Your Bookings</h2>
            <p className="text-sm text-slate-500 mt-1">Manage all your homestay reservations.</p>
          </div>
          
          <div className="p-0">
            {bookings && bookings.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Guest Details</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Property</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Dates</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Amount</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{booking.guestName || "Guest"}</div>
                        <div className="text-sm text-slate-500">{booking.guestPhone || "No phone provided"}</div>
                        <div className="text-xs text-slate-400 mt-1">{booking.guests} Guests</div>
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {booking.property?.name || "Unknown Property"}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        <div>In: {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : "N/A"}</div>
                        <div>Out: {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : "N/A"}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">₹{booking.baseAmount?.toLocaleString() || booking.amount?.toLocaleString()}</div>
                        <div className="text-xs text-slate-500">
                          Payout: <span className={booking.hotelPayoutStatus === "PAID" ? "text-emerald-600 font-bold" : "text-orange-600 font-bold"}>{booking.hotelPayoutStatus}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          booking.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700" :
                          booking.status === "PENDING" ? "bg-orange-100 text-orange-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <LineChart className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Bookings Yet</h3>
                <p className="text-slate-500 mt-1 max-w-sm">When tourists book your properties, they will appear here along with your payout status.</p>
              </div>
            )}
          </div>
        </div>
      )}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    </div>
    </>
  );
}
