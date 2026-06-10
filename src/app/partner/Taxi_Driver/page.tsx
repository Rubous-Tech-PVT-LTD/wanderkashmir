"use client";

import { useState, useEffect } from "react";
import { Car, Save, Plus, IndianRupee, CheckCircle2, AlertTriangle, Route, Lock, Zap, LineChart as LineChartIcon, MessageCircle, BookOpen, Camera, Users, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { useVendor } from "@/context/VendorContext";
import toast from "react-hot-toast";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, VehicleData } from "@/lib/validations";
import { addVehicle } from "@/actions/listings";
import { calculateDashboardMetrics } from "@/lib/chartUtils";
import { format } from "date-fns";

// Extend VehicleData with local UI fields that aren't in DB yet
const taxiListingSchema = z.object({
  vehicleName: z.string().min(3, "Vehicle name must be at least 3 characters").max(100),
  vehicleType: z.enum(["Sedan", "SUV", "Hatchback", "Traveller"]),
  registrationNo: z.string().min(5, "Valid registration number required"),
  baseRateLocal: z.number().min(500, "Base rate must be at least ₹500").max(10000),
  baseRateOutstation: z.number().min(10, "Outstation rate must be at least ₹10/km").max(500),
  acAvailable: z.boolean(),
  instantBooking: z.boolean().optional(),
});

type TaxiListingFormValues = z.infer<typeof taxiListingSchema>;

export default function TaxiDashboard({ bookings = [] }: { bookings?: any[] }) {
  const { isApproved, subscriptionPlan, setSubscriptionPlan } = useVendor();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Feature Gating Logic
  const hasInstantBooking = subscriptionPlan === "Growth Pro" || subscriptionPlan === "Pro" || subscriptionPlan === "Enterprise";
  const hasAnalytics = subscriptionPlan !== "Free";

  const [timeRange, setTimeRange] = useState("7D");
  const [chartMetric, setChartMetric] = useState("views");

  const { totalRevenue, totalBookings: totalTrips, totalViews, chartData, growthRevenue, growthBookings: growthTrips, growthViews } = calculateDashboardMetrics(bookings, "TAXI", timeRange);

  const getChartData = () => {
    return chartData.map(d => ({ ...d, trips: d.bookings })); // Rename bookings to trips for chart tooltips
  };

  const demographicData = [
    { name: 'Airport Drops', value: 40 },
    { name: 'Local Tours', value: 30 },
    { name: 'Outstation', value: 20 },
    { name: 'Corporate', value: 10 },
  ];
  const COLORS = ['#0ea5e9', '#6366f1', '#f59e0b', '#10b981'];

  const handleSimulateUpgrade = async (planName: any, price: string) => {
    if (subscriptionPlan === planName) return;
    if (planName === "Enterprise") {
      toast.success("Our sales team will contact you shortly!", { icon: '📞' });
      return;
    }
    const confirmed = window.confirm(`Simulated Payment Gateway:\n\nConfirm payment of ${price} to upgrade to ${planName}?`);
    if (confirmed) {
      toast.loading("Upgrading plan...", { id: 'upgrade' });
      setTimeout(() => {
        setSubscriptionPlan(planName);
        toast.success(`Success! Upgraded to ${planName}.`, { id: 'upgrade' });
      }, 1000);
    }
  };

  // For the dynamic commission calculator
  const [calcTripType, setCalcTripType] = useState<"airport" | "local" | "outstation">("local");
  const [calcFare, setCalcFare] = useState<number>(2500);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TaxiListingFormValues>({
    resolver: zodResolver(taxiListingSchema),
    mode: "onChange",
    defaultValues: {
      vehicleType: "Sedan",
      acAvailable: true,
      baseRateLocal: 2500,
      baseRateOutstation: 25,
      instantBooking: false,
    }
  });

  useEffect(() => {
    if (hasInstantBooking) {
      setValue("instantBooking", true);
    }
  }, [hasInstantBooking, setValue]);

  // Business Model Logic: Dynamic commission for Taxis
  const getCommissionRate = (type: "airport" | "local" | "outstation") => {
    switch (type) {
      case "airport": return 0.15; // 15%
      case "local": return 0.12; // 12%
      case "outstation": return 0.10; // 10%
    }
  };

  const commissionRate = getCommissionRate(calcTripType);
  const platformFee = Math.round(calcFare * commissionRate);
  const netEarnings = calcFare - platformFee;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: TaxiListingFormValues) => {
    if (!isApproved) {
      toast.error("Error: Your profile is pending Admin approval. You cannot publish this vehicle yet.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await addVehicle({
        make: "Default", // In a real app we'd split the vehicleName or add a make field
        model: data.vehicleName,
        registrationNum: data.registrationNo,
        type: data.vehicleType as any,
      });

      if (res.success) {
        toast.success("Vehicle added successfully to the database!");
        setActiveTab("trips");
      } else {
        toast.error("Failed to add vehicle: " + res.error);
      }
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Taxi Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500">Manage your vehicles, trips, and earnings.</p>
            {!isApproved && (
              <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                <AlertTriangle className="w-3 h-3" /> Pending Approval
              </span>
            )}
          </div>
        </div>
        <button 
          disabled={!isApproved}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
            isApproved ? 'bg-sky-500 text-white hover:bg-sky-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Plus className="w-5 h-5" /> Add New Vehicle
        </button>
      </div>

      <div className="flex gap-6 border-b border-slate-200 mb-8 overflow-x-auto whitespace-nowrap">
        {["overview", "vehicles", "trips", "earnings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-semibold capitalize transition-colors relative ${activeTab === tab ? "text-sky-600" : "text-slate-500 hover:text-slate-800"}`}
          >
            {tab}
            {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-500 rounded-t-full" />}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8">
          
          {/* SUBSCRIPTION UPGRADE PLANS */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Your Subscription Plan</h2>
                <p className="text-sm text-slate-500 mt-1">Upgrade your plan to unlock premium seller tools and increase visibility.</p>
              </div>
              <div className="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-sm font-bold border border-sky-200">
                Current: {subscriptionPlan}
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { name: "Free", price: "₹0/mo", description: "Basic listing features", features: ["1 Vehicle Listing", "Basic Analytics", "Standard Support"], isPopular: false },
                { name: "Growth Pro", price: "₹499/mo", description: "Get more visibility", features: ["Priority Listing", "Advanced Analytics", "Onboarding Helpline"], isPopular: true },
                { name: "Pro", price: "₹999/mo", description: "Max out your bookings", features: ["Instant Booking", "Promotional Offers", "Featured Placement"], isPopular: false },
                { name: "Enterprise", price: "Custom", description: "For fleet operators", features: ["API Access", "Account Manager", "Custom Pricing"], isPopular: false },
              ].map((plan) => (
                <div key={plan.name} className={`relative rounded-2xl border-2 p-5 flex flex-col ${subscriptionPlan === plan.name ? 'border-sky-500 bg-sky-50/50' : plan.isPopular ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-100 bg-white'}`}>
                  {plan.isPopular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">Most Popular</div>}
                  <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
                  <div className="my-2">
                    <span className="text-2xl font-black text-slate-900">{plan.price}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">{plan.description}</p>
                  
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${subscriptionPlan === plan.name ? 'text-sky-500' : 'text-slate-400'}`} /> {f}
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => handleSimulateUpgrade(plan.name, plan.price)}
                    disabled={subscriptionPlan === plan.name}
                    className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${
                      subscriptionPlan === plan.name ? 'bg-sky-100 text-sky-700 cursor-default' : 
                      plan.isPopular ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm' : 
                      'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                    }`}
                  >
                    {subscriptionPlan === plan.name ? "Current Plan" : "Upgrade"}
                  </button>
                </div>
              ))}
            </div>
          </div>

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

              {hasAnalytics && (() => {
              // totalViews and others already mapped from component state via calculateDashboardMetrics above
              return (
              <>
                <div className="grid grid-cols-3 gap-4 mb-8 mt-4">
                  <button onClick={() => setChartMetric("views")} className={`p-4 rounded-xl text-left border transition-all ${chartMetric === "views" ? 'border-sky-500 bg-sky-50 shadow-sm' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Profile Views</p>
                    <p className="text-2xl font-bold text-slate-900">{totalViews.toLocaleString()}</p>
                    <p className="text-xs text-emerald-600 font-bold mt-1">+{growthViews}%</p>
                  </button>
                  <button onClick={() => setChartMetric("bookings")} className={`p-4 rounded-xl text-left border transition-all ${chartMetric === "bookings" ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Completed Trips</p>
                    <p className="text-2xl font-bold text-slate-900">{totalTrips}</p>
                    <p className="text-xs text-emerald-600 font-bold mt-1">+{growthTrips}%</p>
                  </button>
                  <button onClick={() => setChartMetric("revenue")} className={`p-4 rounded-xl text-left border transition-all ${chartMetric === "revenue" ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Taxi Earnings</p>
                    <p className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-emerald-600 font-bold mt-1">+{growthRevenue}%</p>
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
                              <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="trips" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTrips)" />
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
                    <h3 className="text-sm font-bold text-slate-700 mb-2">Trip Demographics</h3>
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
                      <p className="text-xl font-bold text-slate-900">14.2%</p>
                      <span className="text-emerald-500 text-xs font-bold mb-1">+5.1%</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 flex flex-col justify-center border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium mb-1">Contact Initiated</p>
                    <div className="flex items-end gap-2">
                      <p className="text-xl font-bold text-slate-900">{totalTrips}</p>
                      <span className="text-emerald-500 text-xs font-bold mb-1">+{growthTrips}%</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 flex flex-col justify-center border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium mb-1">Trip Conversion</p>
                    <div className="flex items-end gap-2">
                      <p className="text-xl font-bold text-slate-900">5.8%</p>
                      <span className="text-orange-500 text-xs font-bold mb-1">-1.2%</span>
                    </div>
                  </div>
                </div>
              </>
              );
            })()}
            </div>

            {/* Paywall Overlay */}
            {!hasAnalytics && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm">
                <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Unlock Advanced Analytics</h3>
                <p className="text-slate-600 text-sm max-w-md text-center mb-6">Upgrade to Growth Pro or higher to see who is viewing your vehicles, track conversion rates, and optimize your earnings.</p>
                <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-md">
                  View Upgrade Plans
                </button>
              </div>
            )}
          </div>

          {/* PREMIUM SUPPORT HUB */}
          <div className="bg-sky-50 rounded-2xl p-6 shadow-sm border border-sky-100 mt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <MessageCircle className="w-6 h-6 text-sky-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Premium Support Hub</h2>
                <p className="text-slate-500 text-sm">Dedicated help for our active drivers</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a href="#" className="bg-white rounded-xl p-4 border border-sky-100 flex items-start gap-3 hover:border-sky-300 hover:shadow-md transition-all group">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">WhatsApp Onboarding</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Chat directly with your account manager</p>
                </div>
              </a>
              <a href="#" className="bg-white rounded-xl p-4 border border-sky-100 flex items-start gap-3 hover:border-sky-300 hover:shadow-md transition-all group">
                <div className="bg-sky-100 p-2 rounded-lg text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Driver Success Center</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Tutorials & tips in Hindi and English</p>
                </div>
              </a>
              <a href="#" className="bg-white rounded-xl p-4 border border-sky-100 flex items-start gap-3 hover:border-sky-300 hover:shadow-md transition-all group">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Request Photo Shoot</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Get professional photos for your vehicles</p>
                </div>
              </a>
            </div>
          </div>

          {/* PRO & ENTERPRISE TOOLS HUB */}
          {(subscriptionPlan === "Pro" || subscriptionPlan === "Enterprise") && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Pro Driver Tools</h2>
                  <p className="text-slate-500 text-sm">Advanced tools to maximize your rides</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-slate-100 bg-slate-50 rounded-xl p-4">
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Instant Booking</h3>
                  <p className="text-xs text-slate-500 mb-3">Allow riders to book without manual approval.</p>
                  <button onClick={() => toast.success("Instant Booking enabled for all vehicles!")} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors w-full">Manage Settings</button>
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
                  <p className="text-slate-400 text-sm">Connect your own Fleet Management Software</p>
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
                    <h3 className="font-bold text-sm">Bulk Vehicle Management</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Upload CSV/Excel for pricing updates</p>
                  </div>
                  <button onClick={() => toast.success("CSV Upload modal opening soon!")} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-bold rounded-lg transition-colors">Upload</button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {activeTab === "vehicles" && (
        <div className="space-y-8">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Register a Vehicle</h2>
              {!isApproved && (
                <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-orange-900 text-sm">Documents Pending Verification</h3>
                    <p className="text-sm text-orange-700 mt-1">You can add your vehicle details, but you <strong className="font-bold">cannot receive bookings</strong> until your RC and Permits are approved.</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Name</label>
                    <input type="text" {...register("vehicleName")} className={`w-full border rounded-lg px-4 py-2.5 ${errors.vehicleName ? 'border-orange-500' : 'border-slate-200'}`} placeholder="e.g. Toyota Innova Crysta" />
                    {errors.vehicleName && <p className="text-orange-500 text-xs mt-1 font-medium">{errors.vehicleName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Type</label>
                    <select {...register("vehicleType")} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-white">
                      <option value="Hatchback">Hatchback</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Traveller">Tempo Traveller</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Registration Number (Number Plate)</label>
                  <input type="text" {...register("registrationNo")} className={`w-full border rounded-lg px-4 py-2.5 uppercase ${errors.registrationNo ? 'border-orange-500' : 'border-slate-200'}`} placeholder="JK01 AB 1234" />
                  {errors.registrationNo && <p className="text-orange-500 text-xs mt-1 font-medium">{errors.registrationNo.message}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Local Sightseeing Rate (Per Day)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" {...register("baseRateLocal", { valueAsNumber: true })} className={`w-full border rounded-lg pl-10 pr-4 py-2.5 ${errors.baseRateLocal ? 'border-orange-500' : 'border-slate-200'}`} placeholder="2500" />
                    </div>
                    {errors.baseRateLocal && <p className="text-orange-500 text-xs mt-1 font-medium">{errors.baseRateLocal.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Outstation Rate (Per Km)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" {...register("baseRateOutstation", { valueAsNumber: true })} className={`w-full border rounded-lg pl-10 pr-4 py-2.5 ${errors.baseRateOutstation ? 'border-orange-500' : 'border-slate-200'}`} placeholder="25" />
                    </div>
                    {errors.baseRateOutstation && <p className="text-orange-500 text-xs mt-1 font-medium">{errors.baseRateOutstation.message}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="ac" {...register("acAvailable")} className="w-4 h-4 text-sky-500 rounded border-slate-300" />
                  <label htmlFor="ac" className="text-sm font-medium text-slate-700">AC Available</label>
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
                      <p className="text-sm text-slate-600 mt-1 mb-3">Allow travelers to book your vehicle instantly without requiring manual approval. Vehicles with Instant Booking see a 30% increase in conversions.</p>
                      
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

                <div className="pt-6 flex justify-end gap-3">
                  <button type="submit" disabled={!isApproved || isSubmitting} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium ${isApproved ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                    <Save className="w-4 h-4" /> {isSubmitting ? "Saving..." : "Save Vehicle"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Dynamic Commission Calculator */}
          <div className="bg-sky-50 p-8 rounded-2xl border border-sky-100">
            <h3 className="text-xl font-bold text-sky-900 mb-6 flex items-center gap-2"><Route className="w-6 h-6" /> Dynamic Earnings Calculator</h3>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sky-800 mb-2">Select Trip Type</label>
                  <div className="flex bg-white rounded-lg p-1 border border-sky-200">
                    <button onClick={() => setCalcTripType("airport")} className={`flex-1 py-2 text-sm font-bold rounded-md ${calcTripType === "airport" ? 'bg-sky-500 text-white shadow-sm' : 'text-sky-700 hover:bg-sky-50'}`}>Airport (15%)</button>
                    <button onClick={() => setCalcTripType("local")} className={`flex-1 py-2 text-sm font-bold rounded-md ${calcTripType === "local" ? 'bg-sky-500 text-white shadow-sm' : 'text-sky-700 hover:bg-sky-50'}`}>Local (12%)</button>
                    <button onClick={() => setCalcTripType("outstation")} className={`flex-1 py-2 text-sm font-bold rounded-md ${calcTripType === "outstation" ? 'bg-sky-500 text-white shadow-sm' : 'text-sky-700 hover:bg-sky-50'}`}>Outstation (10%)</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-sky-800 mb-2">Total Trip Fare</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="number" value={calcFare} onChange={(e) => setCalcFare(Number(e.target.value) || 0)} className="w-full border border-sky-200 rounded-lg pl-10 pr-4 py-3 text-lg font-bold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200" />
                  </div>
                </div>
              </div>
              
              <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center text-slate-600 mb-3">
                  <span>Customer Pays</span>
                  <span className="font-medium">₹{calcFare.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-orange-500 mb-4 pb-4 border-b border-slate-100">
                  <span>Platform Fee ({(commissionRate * 100).toFixed(0)}%)</span>
                  <span className="font-medium">- ₹{platformFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-lg">Your Take-Home</span>
                  <span className="text-2xl font-black text-sky-600">₹{netEarnings.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* BOOKINGS MODULE */}
      {activeTab === "bookings" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Recent Trips</h2>
              <p className="text-sm text-slate-500 mt-1">Manage all your upcoming rides and airport transfers.</p>
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
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Passenger Details</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Vehicle Type</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Fare Amount</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{booking.guestName || "Passenger"}</div>
                        <div className="text-sm text-slate-500">{booking.guestPhone || "No contact"}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {booking.vehicle?.make || "Taxi"} {booking.vehicle?.model || ""}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        <div>{booking.checkIn ? format(new Date(booking.checkIn), "MMM dd, yyyy") : "N/A"}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">₹{booking.taxiAmount?.toLocaleString() || booking.amount?.toLocaleString()}</div>
                        <div className="text-xs text-slate-500">
                          Payout: <span className={booking.taxiPayoutStatus === "PAID" ? "text-emerald-600 font-bold" : "text-orange-600 font-bold"}>{booking.taxiPayoutStatus || "PENDING"}</span>
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
                  <Route className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Trips Yet</h3>
                <p className="text-slate-500 mt-1 max-w-sm">When tourists book your taxi, the rides will appear here along with your payout status.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
