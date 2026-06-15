"use client";

import { useState, useEffect } from "react";
import { UserCircle2, Save, IndianRupee, CheckCircle2, AlertTriangle, Languages, Award, Lock, Zap, LineChart as LineChartIcon, MessageCircle, BookOpen, Camera, Users, Download, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { useVendor } from "@/context/VendorContext";
import toast from "react-hot-toast";

import { z } from "zod";
import { useForm } from "react-hook-form";

import { calculateDashboardMetrics } from "@/lib/chartUtils";
import Script from "next/script";
import { updateSubscriptionPlan } from "@/actions/vendor";
import { Edit, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import dynamic from "next/dynamic";
const ImageUpload = dynamic(() => import("@/components/ImageUpload"), { ssr: false });
import { saveGuideProfile } from "@/actions/guide";
import { useRouter } from "next/navigation";

// --- ZOD SCHEMA FOR GUIDE PROFILE ---
const guideProfileSchema = z.object({
  bio: z.string().min(50, "Bio must be at least 50 characters to build trust").max(1000),
  languages: z.string().min(3, "Please list languages spoken (e.g., English, Hindi, Kashmiri)"),
  location: z.string().min(2, "Please enter your primary operating location"),
  specializations: z.string().min(5, "Please list specializations (e.g., Trekking, History)"),
  dailyRate: z.number().min(500, "Daily rate must be at least ₹500").max(10000),
  experienceYears: z.number().min(0, "Experience cannot be negative").max(50),
  instantBooking: z.boolean().optional(),
});

type GuideProfileFormValues = z.infer<typeof guideProfileSchema>;

export default function GuideDashboard({ bookings = [], vendorProfileId, initialGuideProfile }: { bookings?: any[], vendorProfileId?: string, initialGuideProfile?: any }) {
  const { isApproved, subscriptionPlan, setSubscriptionPlan } = useVendor();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditMode, setIsEditMode] = useState(false);

  // Feature Gating Logic
  const hasInstantBooking = subscriptionPlan === "Growth Pro" || subscriptionPlan === "Pro" || subscriptionPlan === "Enterprise";
  const hasAnalytics = subscriptionPlan !== "Free";

  const [timeRange, setTimeRange] = useState("7D");
  const [chartMetric, setChartMetric] = useState("views");

  const { totalRevenue, totalBookings: totalTours, totalViews: simulatedViews, chartData, growthRevenue, growthBookings: growthTours, growthViews } = calculateDashboardMetrics(bookings, "GUIDE", timeRange);
  
  const totalViews = initialGuideProfile?.profileViews || 0;

  const missingFields: string[] = [];
  if (initialGuideProfile) {
    if (!initialGuideProfile.bio) missingFields.push("Bio");
    if (!initialGuideProfile.images?.[1]) missingFields.push("Profile Picture");
    if (!initialGuideProfile.images?.[0]) missingFields.push("Cover Photo");
    if (!initialGuideProfile.languages || initialGuideProfile.languages.length === 0) missingFields.push("Languages");
    if (!initialGuideProfile.specialties || initialGuideProfile.specialties.length === 0) missingFields.push("Specialties");
    if (!initialGuideProfile.location) missingFields.push("Location");
  }

  const isProfileLocked = subscriptionPlan === "Free" && initialGuideProfile !== null && missingFields.length === 0 && !isEditMode;

  const getChartData = () => {
    return chartData.map(d => ({ ...d, tours: d.bookings })); // Rename bookings to tours for chart tooltips
  };

  const demographicData = [
    { name: 'Couples', value: 45 },
    { name: 'Families', value: 35 },
    { name: 'Solo', value: 15 },
    { name: 'Corporate', value: 5 },
  ];
  const COLORS = ['#0ea5e9', '#6366f1', '#f59e0b', '#10b981'];

  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleSimulateUpgrade = async (planName: any, priceString: string) => {
    if (subscriptionPlan === planName) return;
    if (planName === "Enterprise") {
      toast.success("Our sales team will contact you shortly!", { icon: '📞' });
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
                toast.success(`Success! Upgraded to ${planName}.`, { id: verifyToast });
              } else {
                toast.error("Payment verified, but failed to update plan. Please contact support.", { id: verifyToast });
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GuideProfileFormValues>({
    resolver: zodResolver(guideProfileSchema),
    mode: "onChange",
    defaultValues: {
      bio: initialGuideProfile?.bio || "",
      languages: initialGuideProfile?.languages?.join(", ") || "",
      location: initialGuideProfile?.location || "Srinagar",
      specializations: initialGuideProfile?.specialties?.join(", ") || "",
      dailyRate: initialGuideProfile?.pricePerDay || 1500,
      experienceYears: initialGuideProfile?.experienceYears || 2,
      instantBooking: false,
    }
  });

  useEffect(() => {
    if (hasInstantBooking) {
      setValue("instantBooking", true);
    }
  }, [hasInstantBooking, setValue]);

  const watchDailyRate = watch("dailyRate", 1500);

  // Business Model Logic: 15% commission for Guides
  const commissionRate = 0.15;
  const platformFee = Math.round((watchDailyRate || 0) * commissionRate);
  const netEarnings = (watchDailyRate || 0) - platformFee;

  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const [avatar, setAvatar] = useState<string[]>(initialGuideProfile?.images?.[1] ? [initialGuideProfile.images[1]] : []);
  const [coverPhoto, setCoverPhoto] = useState<string[]>(initialGuideProfile?.images?.[0] ? [initialGuideProfile.images[0]] : []);

  const onSubmit = async (data: GuideProfileFormValues) => {
    if (!vendorProfileId) return;

    if (!avatar || avatar.length === 0 || !avatar[0]) {
      toast.error("Please upload a Profile Picture (Avatar)", { id: "save-guide" });
      return;
    }

    if (!coverPhoto || coverPhoto.length === 0 || !coverPhoto[0]) {
      toast.error("Please upload a Cover Photo", { id: "save-guide" });
      return;
    }

    setIsSaving(true);
    toast.loading("Saving profile...", { id: "save-guide" });
    
    const submitData = {
      ...data,
      images: [coverPhoto[0] || "", avatar[0] || ""]
    };
    
    const res = await saveGuideProfile(vendorProfileId, submitData);
    setIsSaving(false);
    
    if (res.success) {
      toast.success("Profile saved successfully!", { id: "save-guide" });
      router.refresh();
      setActiveTab("overview");
    } else {
      toast.error(res.error || "Failed to save profile", { id: "save-guide" });
    }
  };

  return (
    <>
    <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Guide Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500">Manage your profile, availability, and bookings.</p>
            {!isApproved && (
              <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                <AlertTriangle className="w-3 h-3" /> Pending Approval
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <Award className="w-5 h-5 text-orange-500" />
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-bold uppercase">Reputation Score</span>
            <span className="text-sm font-black text-slate-900">New Guide</span>
          </div>
        </div>
      </div>

      <div className="flex gap-6 border-b border-slate-200 mb-8 overflow-x-auto whitespace-nowrap">
        {["overview", "profile", "bookings", "financials"].map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setIsEditMode(false); }}
            className={`pb-4 text-sm font-semibold capitalize transition-colors relative ${activeTab === tab ? "text-sky-600" : "text-slate-500 hover:text-slate-800"}`}
          >
            {tab === "financials" ? "Financials & Subscription" : tab}
            {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-500 rounded-t-full" />}
          </button>
        ))}
      </div>

      {/* FINANCIALS MODULE */}
      {activeTab === "financials" && (
        <div className="space-y-8">
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-sky-900 mb-2">Welcome to WanderKashmir!</h2>
            <p className="text-sky-800">Your registration is complete. Choose a subscription plan below to unlock premium features and increase your bookings.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "Free", price: "₹0/mo", description: "Basic listing features", features: ["1 Profile Listing", "Basic Analytics", "Standard Support"], isPopular: false },
                { name: "Growth Pro", price: "₹299/mo", description: "Get more visibility", features: ["Priority Listing", "Advanced Analytics", "Onboarding Helpline"], isPopular: true },
                { name: "Pro", price: "₹599/mo", description: "Max out your bookings", features: ["Instant Booking", "Promotional Offers", "Featured Placement"], isPopular: false },
                { name: "Enterprise", price: "Custom", description: "For tour agencies", features: ["API Access", "Account Manager", "Custom Pricing"], isPopular: false },
              ].map((tier) => {
                const isActive = subscriptionPlan === tier.name;
                
                return (
                  <div key={tier.name} className={`bg-white rounded-2xl border relative ${isActive ? 'border-sky-500 shadow-md ring-4 ring-sky-50' : tier.isPopular ? 'border-sky-500 shadow-md' : 'border-slate-200 shadow-sm'} p-6 flex flex-col transition-all`}>
                    {tier.isPopular && !isActive && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
                    )}
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
                      onClick={() => handleSimulateUpgrade(tier.name, tier.price)}
                      disabled={isActive || tier.name === "Free"}
                      className={`w-full py-2.5 rounded-lg font-bold transition-colors ${
                        isActive 
                          ? 'bg-sky-50 text-sky-600 border border-sky-200 cursor-default' 
                          : tier.name === 'Free' 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {isActive ? "Current Plan" : tier.name === "Enterprise" ? "Contact Sales" : "Upgrade Now"}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Commission Structure</h3>
            <p className="text-slate-600 mb-4">As per our platform policy, WanderKashmir deducts a flat <strong className="text-slate-900">15% platform fee</strong> on all successful guide bookings.</p>
          </div>
        </div>
      )}

      {/* OVERVIEW MODULE */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <span className="text-slate-500 text-sm font-medium mb-2">Total Earnings</span>
              <span className="text-3xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</span>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <span className="text-slate-500 text-sm font-medium mb-2">Completed Tours</span>
              <span className="text-3xl font-bold text-slate-900">{totalTours}</span>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <span className="text-slate-500 text-sm font-medium mb-2">Profile Views</span>
              <span className="text-3xl font-bold text-slate-900">{totalViews.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Guide Profile Status Box */}
          {initialGuideProfile ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Your Guide Profile</h2>
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                  {isApproved ? 'Live' : 'Pending Approval'}
                </span>
              </div>
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                   <h3 className="font-bold text-slate-900 text-lg mb-1">{isApproved ? 'Public Listing is Active' : 'Profile is Pending Approval'}</h3>
                   <p className="text-slate-500 text-sm">
                     {isApproved 
                       ? "Tourists can find and book your services directly from the public listing."
                       : "You have saved your profile, but it won't be visible to tourists until Admin approves it."}
                   </p>
                   
                   {missingFields.length > 0 && (
                     <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3 max-w-lg">
                       <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                       <div>
                         <p className="text-sm text-amber-900 font-semibold">Incomplete Profile Fields</p>
                         <p className="text-xs text-amber-700 mt-0.5">Please complete the following missing fields to get the best out of your profile: <strong className="font-semibold">{missingFields.join(", ")}</strong></p>
                       </div>
                     </div>
                   )}
                   
                   {subscriptionPlan === "Free" && (
                     <div className="mt-3 bg-sky-50 border border-sky-100 rounded-lg p-3 flex items-start gap-3 max-w-lg">
                       <Award className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                       <div>
                         <p className="text-sm text-sky-900 font-semibold">Boost your visibility and get more bookings!</p>
                         <p className="text-xs text-sky-700 mt-0.5">You are currently on the Free plan. Upgrade to Growth Pro to get priority ranking.</p>
                         <button onClick={() => setActiveTab("financials")} className="text-xs font-bold text-sky-600 hover:text-sky-700 mt-2 underline">View Upgrade Plans</button>
                       </div>
                     </div>
                   )}

                   <div className="flex gap-4 mt-4">
                     <p className="font-semibold text-slate-900 text-sm">Rate: <span className="font-normal text-slate-600">₹{initialGuideProfile.pricePerDay}/day</span></p>
                     <p className="font-semibold text-slate-900 text-sm">Exp: <span className="font-normal text-slate-600">{initialGuideProfile.experienceYears} Years</span></p>
                   </div>
                </div>
                <button onClick={() => { setActiveTab("profile"); setIsEditMode(true); }} className="btn-secondary whitespace-nowrap text-sm px-6 py-2.5">
                   Edit Profile
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-orange-900">Complete Your Profile</h2>
                <p className="text-orange-800 text-sm mt-1">Your guide profile is empty. You must complete your profile to be listed on WanderKashmir and receive bookings.</p>
              </div>
              <button onClick={() => setActiveTab("profile")} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold transition-colors whitespace-nowrap">
                Complete Profile
              </button>
            </div>
          )}


          {/* ADVANCED ANALYTICS (FEATURE GATED) */}
          <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-hidden mt-8">
            <div className={`transition-all duration-500 ${!hasAnalytics ? 'blur-sm opacity-60 select-none' : ''}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Advanced Analytics</h2>
                  <p className="text-slate-500 text-sm mt-1">Track your performance and conversion rates</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    {["7D", "30D", "90D"].map(t => (
                      <button key={t} onClick={() => setTimeRange(t)} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${timeRange === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t}</button>
                    ))}
                  </div>
                  <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

            {/* ALWAYS RENDER CHARTS SO CONTAINER HAS HEIGHT FOR PAYWALL */}
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <button onClick={() => setChartMetric("views")} className={`p-4 rounded-xl border-2 transition-all text-left ${chartMetric === "views" ? 'border-sky-500 bg-sky-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                    <div className="text-slate-500 text-sm font-medium mb-1">Profile Views</div>
                    <div className="text-2xl font-black text-slate-900">{totalViews.toLocaleString()}</div>
                    <div className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">+{growthViews}%</div>
                  </button>
                  <button onClick={() => setChartMetric("bookings")} className={`p-4 rounded-xl border-2 transition-all text-left ${chartMetric === "bookings" ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                    <div className="text-slate-500 text-sm font-medium mb-1">Completed Tours</div>
                    <div className="text-2xl font-black text-slate-900">{totalTours}</div>
                    <div className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">+{growthTours}%</div>
                  </button>
                  <button onClick={() => setChartMetric("revenue")} className={`p-4 rounded-xl border-2 transition-all text-left ${chartMetric === "revenue" ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                    <div className="text-slate-500 text-sm font-medium mb-1">Guide Earnings</div>
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
                              <linearGradient id="colorTours" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="tours" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTours)" />
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
                    <h3 className="text-sm font-bold text-slate-700 mb-2">Tour Demographics</h3>
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
                    <p className="text-xs text-slate-500 font-medium mb-1">Profile Click Rate</p>
                    <div className="flex items-end gap-2">
                      <p className="text-xl font-bold text-slate-900">18.4%</p>
                      <span className="text-emerald-500 text-xs font-bold mb-1">+6.1%</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 flex flex-col justify-center border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium mb-1">Contact Initiated</p>
                    <div className="flex items-end gap-2">
                      <p className="text-xl font-bold text-slate-900">{totalTours}</p>
                      <span className="text-emerald-500 text-xs font-bold mb-1">+{growthTours}%</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 flex flex-col justify-center border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium mb-1">Tour Conversion</p>
                    <div className="flex items-end gap-2">
                      <p className="text-xl font-bold text-slate-900">8.2%</p>
                      <span className="text-orange-500 text-xs font-bold mb-1">-0.8%</span>
                    </div>
                  </div>
                </div>
              </>
            </div>

            {/* Paywall Overlay */}
            {!hasAnalytics && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-[2px]">
                <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-4 ring-4 ring-slate-100">
                  <Lock className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Unlock Advanced Analytics</h3>
                <p className="text-slate-600 text-sm max-w-md text-center mb-6">Upgrade to Growth Pro or higher to see who is viewing your profile, track conversion rates, and optimize your earnings.</p>
                <button onClick={() => { setActiveTab('financials'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-md">
                  View Upgrade Plans
                </button>
              </div>
            )}
          </div>

          {/* PREMIUM SUPPORT HUB */}
          {(subscriptionPlan === "Growth Pro" || subscriptionPlan === "Pro" || subscriptionPlan === "Enterprise") && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 shadow-md text-white border border-slate-700 mt-6">
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
                <a href="https://wa.me/1234567890?text=Hi%20WanderKashmir%20Support,%20I%20am%20a%20Growth%20Pro%20Guide" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 transition-colors p-4 rounded-xl flex items-center gap-3 border border-white/5">
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
                  <h2 className="text-xl font-bold text-slate-900">Pro Guide Tools</h2>
                  <p className="text-slate-500 text-sm">Advanced tools to maximize your tours</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-slate-100 bg-slate-50 rounded-xl p-4">
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Instant Booking</h3>
                  <p className="text-xs text-slate-500 mb-3">Allow travelers to book without manual approval.</p>
                  <button onClick={() => toast.success("Instant Booking enabled for your profile!")} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors w-full">Manage Settings</button>
                </div>
                
                <div className="border border-slate-100 bg-slate-50 rounded-xl p-4">
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Promotional Offers</h3>
                  <p className="text-xs text-slate-500 mb-3">Create custom discounts for group tours.</p>
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
                  <p className="text-slate-400 text-sm">Connect your own Tour Management Software</p>
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
                    <h3 className="font-bold text-sm">Bulk Schedule Management</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Upload CSV/Excel for availability updates</p>
                  </div>
                  <button onClick={() => toast.success("CSV Upload modal opening soon!")} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-bold rounded-lg transition-colors">Upload</button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {activeTab === "profile" && (
        <div className="space-y-8">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Your Guide Profile</h2>
              {!isApproved && (
                <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-orange-900 text-sm">Profile Pending Verification</h3>
                    <p className="text-sm text-orange-700 mt-1">You can save your bio and rates, but you <strong className="font-bold">cannot receive bookings</strong> until your Guide License is verified.</p>
                  </div>
                </div>
              )}
              {isApproved && subscriptionPlan === "Free" && (
                <div className="mt-4 bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-start gap-3">
                  <Award className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sky-900 text-sm">Boost your visibility and get more bookings!</h3>
                    <p className="text-sm text-sky-700 mt-1">You are currently on the Free plan. Upgrade to Growth Pro to get <strong className="font-bold">priority ranking</strong> in search results.</p>
                    <button type="button" onClick={() => setActiveTab("financials")} className="text-xs font-bold text-sky-600 hover:text-sky-700 mt-2 underline">View Upgrade Plans</button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6">
              {isProfileLocked && (
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 mb-8 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-bold text-sky-900 text-sm">Your limit reached</h3>
                    <p className="text-sm text-sky-800 mt-1">Your profile is complete and has been saved! On the Free plan, profiles cannot be edited after completion from this tab. Please upgrade to Growth Pro to unlock unlimited profile edits and priority ranking.</p>
                    <button type="button" onClick={() => { setActiveTab("financials"); setIsEditMode(false); }} className="mt-3 text-xs font-bold text-white bg-sky-600 px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors">View Upgrade Plans</button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">About Me (Bio)</label>
                  <textarea disabled={isProfileLocked} rows={5} {...register("bio")} className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${errors.bio ? 'border-orange-500' : 'border-slate-200'} ${isProfileLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} placeholder="Tell travelers about your experience, your connection to Kashmir, and what makes your tours special..." />
                  {errors.bio && <p className="text-orange-500 text-xs mt-1 font-medium">{errors.bio.message}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Profile Picture (Avatar) <span className="text-red-500">*</span></label>
                    <div className={`bg-slate-50 border border-slate-200 rounded-xl p-4 ${isProfileLocked ? 'pointer-events-none opacity-70' : ''}`}>
                      <ImageUpload 
                        uploadedPhotos={avatar} 
                        setUploadedPhotos={setAvatar} 
                        photoLimit={1}
                      />
                      <p className="text-xs text-slate-500 mt-2">A clear, friendly photo of your face builds trust.</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Cover Photo <span className="text-red-500">*</span></label>
                    <div className={`bg-slate-50 border border-slate-200 rounded-xl p-4 ${isProfileLocked ? 'pointer-events-none opacity-70' : ''}`}>
                      <ImageUpload 
                        uploadedPhotos={coverPhoto} 
                        setUploadedPhotos={setCoverPhoto} 
                        photoLimit={1}
                      />
                      <p className="text-xs text-slate-500 mt-2">A landscape photo of you in action or a beautiful location.</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Location / Base City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input disabled={isProfileLocked} type="text" {...register("location")} className={`w-full border rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${errors.location ? 'border-orange-500' : 'border-slate-200'} ${isProfileLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} placeholder="e.g. Srinagar, Gulmarg" />
                    </div>
                    {errors.location && <p className="text-orange-500 text-xs mt-1 font-medium">{errors.location.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1"><Languages className="w-4 h-4" /> Languages Spoken</label>
                    <input disabled={isProfileLocked} type="text" {...register("languages")} className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${errors.languages ? 'border-orange-500' : 'border-slate-200'} ${isProfileLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} placeholder="e.g. English, Hindi, Kashmiri" />
                    {errors.languages && <p className="text-orange-500 text-xs mt-1 font-medium">{errors.languages.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Years of Experience</label>
                    <input disabled={isProfileLocked} type="number" {...register("experienceYears", { valueAsNumber: true })} className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${errors.experienceYears ? 'border-orange-500' : 'border-slate-200'} ${isProfileLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} placeholder="5" />
                    {errors.experienceYears && <p className="text-orange-500 text-xs mt-1 font-medium">{errors.experienceYears.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Specializations</label>
                  <input disabled={isProfileLocked} type="text" {...register("specializations")} className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${errors.specializations ? 'border-orange-500' : 'border-slate-200'} ${isProfileLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} placeholder="e.g. History Walks, Trekking, Photography" />
                  {errors.specializations && <p className="text-orange-500 text-xs mt-1 font-medium">{errors.specializations.message}</p>}
                </div>
                
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-4">Pricing & Commission</h3>
                  <p className="text-sm text-slate-500 mb-6">WanderKashmir deducts a flat 15% fee on guide bookings to cover marketing and payment processing.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Daily Rate (What the customer pays)</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input disabled={isProfileLocked} type="number" {...register("dailyRate", { valueAsNumber: true })} className={`w-full border rounded-lg pl-10 pr-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${errors.dailyRate ? 'border-orange-500' : 'border-slate-200'} ${isProfileLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} placeholder="1500" />
                      </div>
                      {errors.dailyRate && <p className="text-orange-500 text-xs mt-1 font-medium">{errors.dailyRate.message}</p>}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm pt-2">
                      <span className="text-slate-500">Platform Fee (15%)</span>
                      <span className="text-orange-500 font-medium">- ₹{platformFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-px bg-slate-200 w-full my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">Your Net Earnings (Per Day)</span>
                      <span className="text-xl font-bold text-sky-600">₹{netEarnings.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
                
                {/* INSTANT BOOKING (FEATURE GATED) */}
                <div className={`p-6 rounded-xl border mt-6 ${hasInstantBooking ? 'bg-sky-50 border-sky-200' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${hasInstantBooking ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {hasInstantBooking ? <Zap className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        Enable Instant Booking
                        {!hasInstantBooking && <span className="bg-orange-100 text-orange-800 text-[10px] uppercase px-2 py-0.5 rounded font-bold">Pro Feature</span>}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1 mb-3">Allow travelers to book your tours instantly without requiring manual approval. Guides with Instant Booking see a 30% increase in bookings.</p>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          {...register("instantBooking")}
                          disabled={!hasInstantBooking || isProfileLocked}
                          className="w-5 h-5 rounded text-sky-500 focus:ring-sky-500 disabled:opacity-50" 
                        />
                        <span className={`font-medium ${hasInstantBooking ? 'text-slate-900' : 'text-slate-400'}`}>
                          Yes, I want to enable Instant Booking
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-3">
                  <button type="submit" disabled={isSaving || isProfileLocked} className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold shadow-sm transition-transform ${!isSaving && !isProfileLocked ? 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                    <Save className="w-4 h-4" /> {isSaving ? "Saving..." : isProfileLocked ? "Profile Locked" : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* BOOKINGS MODULE */}
      {activeTab === "bookings" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Recent Tours</h2>
              <p className="text-sm text-slate-500 mt-1">Manage all your upcoming guided tours and experiences.</p>
            </div>
            <button className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-sky-600 transition-colors">
              <Download className="w-4 h-4" /> Download Report
            </button>
          </div>
          
          <div className="p-0">
            {bookings && bookings.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Tourist Details</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Group Size</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Tour Date</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Guide Fee</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{booking.guestName || "Tourist"}</div>
                        <div className="text-sm text-slate-500">{booking.guestPhone || "No contact"}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {booking.guests || 2} People
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        <div>{booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : "N/A"}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">₹{booking.guideAmount?.toLocaleString() || booking.amount?.toLocaleString()}</div>
                        <div className="text-xs text-slate-500">
                          Payout: <span className={booking.guidePayoutStatus === "PAID" ? "text-emerald-600 font-bold" : "text-orange-600 font-bold"}>{booking.guidePayoutStatus || "PENDING"}</span>
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
                  <UserCircle2 className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Tours Yet</h3>
                <p className="text-slate-500 mt-1 max-w-sm">When tourists book your guide services, they will appear here along with your payout status.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
