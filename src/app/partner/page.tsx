"use client";

import { useState, useEffect } from "react";
import { useVendor } from "@/context/VendorContext";
import { useRouter } from "next/navigation";
import { CheckCircle2, Building2, Home, Car, UserCircle2, ArrowRight, UploadCloud, Info, Lock, Mail, AlertCircle } from "lucide-react";
import { registerVendor } from "@/actions/vendor";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vendorRegistrationSchema, VendorRegistrationData } from "@/lib/validations";
import { toast } from "react-hot-toast";
import ImageUpload from "@/components/ImageUpload";

export default function VendorEntryPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycPhotos, setKycPhotos] = useState<string[]>([]);
  const { setVendorType, setVendorName, setIsRegistered, setIsApproved, isRegistered, status, rejectionReason } = useVendor();
  const router = useRouter();

  // Auto-redirect registered vendors to their dashboard
  useEffect(() => {
    if (isRegistered) {
      router.push("/partner/dashboard");
    }
  }, [isRegistered, router]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const vendorOptions = [
    { id: "hotel", title: "Hotel Owner", desc: "List your hotel or resort", icon: Building2 },
    { id: "homestay", title: "Homestay Host", desc: "Rent out your local Kashmiri home", icon: Home },
    { id: "taxi", title: "Taxi Driver", desc: "Offer airport transfers & local trips", icon: Car },
    { id: "guide", title: "Travel Guide", desc: "Provide local expertise to tourists", icon: UserCircle2 },
  ];

  // Initialize React Hook Form
  const { register, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm<VendorRegistrationData>({
    resolver: zodResolver(vendorRegistrationSchema),
    mode: "onChange",
  });

  const selectedType = watch("vendorType");

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    
    if (step === 1) fieldsToValidate = ["vendorType"];
    if (step === 2) fieldsToValidate = [
      "businessName", "password", "address", "email", "phone", 
      "accountHolderName", "bankName", "accountNumber", "ifscCode",
      "altPhone", "altContactPerson", "gstNumber"
    ];

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) setStep((prev) => prev + 1);
  };

  const onSubmit = async (data: VendorRegistrationData) => {
    setIsSubmitting(true);
    data.kycDocuments = kycPhotos;
    try {
      const res = await registerVendor(data);
      if (res.success) {
        setVendorType(data.vendorType as any);
        setVendorName(data.businessName);
        setIsRegistered(true);
        setIsApproved(false);
        setStep(4);
      } else {
        if (res.error === "Unauthorized") {
          router.push("/sign-in");
        } else {
          toast.error("Registration failed: " + res.error);
        }
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteRegistration = () => {
    router.push("/partner/dashboard");
  };

  const FileUploadBox = ({ title, desc }: { title: string, desc: string }) => (
    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
      <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mb-3 group-hover:bg-sky-100 group-hover:text-sky-500 transition-colors">
        <UploadCloud className="w-5 h-5" />
      </div>
      <span className="text-sm font-bold text-slate-900">{title}</span>
      <span className="text-xs text-slate-500 mt-1">{desc}</span>
    </div>
  );

  // if (isRegistered) {
  //   return null; // Prevents flashing while redirecting
  // }

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vendor Onboarding</h1>
            <p className="text-slate-500 mt-2">Partner with WanderKashmir by completing your legal profile.</p>

            {status === "REJECTED" && (
              <div className="max-w-2xl mx-auto mt-6 bg-red-50 border border-red-200 rounded-xl p-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-900">Application Needs Update</h3>
                    <p className="text-sm text-red-700 mt-1">
                      Your vendor application was reviewed but could not be approved for the following reason:
                    </p>
                    <div className="mt-3 p-3 bg-white rounded-lg border border-red-100 text-sm font-medium text-slate-800">
                      "{rejectionReason || "Please verify your documents and try again."}"
                    </div>
                    <p className="text-xs text-red-600 mt-3 font-semibold">
                      You can scroll down and resubmit your updated documents below.
                    </p>
                  </div>
                </div>
              </div>
            )}
            

          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-between relative mb-12 max-w-2xl mx-auto">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0 rounded-full"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-sky-500 z-0 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
            {["Service Type", "Business Details", "Legal Documents", "Complete"].map((label, index) => (
              <div key={label} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-4 border-white shadow-sm ${step > index + 1 ? "bg-sky-500 text-white" : step === index + 1 ? "bg-sky-500 text-white ring-4 ring-sky-100" : "bg-slate-200 text-slate-500"}`}>
                  {step > index + 1 ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                </div>
                <span className={`text-xs font-semibold ${step >= index + 1 ? "text-slate-900" : "text-slate-400"}`}>{label}</span>
              </div>
            ))}
          </div>

          {/* Form Wrapper */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Vendor Type */}
            {step === 1 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-3xl mx-auto">
                <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">What type of service do you provide?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vendorOptions.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <div 
                        key={opt.id}
                        onClick={() => setValue("vendorType", opt.id as any, { shouldValidate: true })}
                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedType === opt.id ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className={`w-8 h-8 mb-4 ${selectedType === opt.id ? "text-sky-500" : "text-slate-400"}`} />
                        <h3 className="font-bold text-slate-900">{opt.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{opt.desc}</p>
                      </div>
                    );
                  })}
                </div>
                {errors.vendorType && <p className="text-orange-500 text-sm mt-3 font-medium text-center">{errors.vendorType.message}</p>}
                
                <div className="mt-8 flex justify-end">
                  <button type="button" onClick={nextStep} disabled={!selectedType} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Comprehensive Profile Setup */}
            {step === 2 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Comprehensive Business Profile</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Legal Business Name / Owner Name *</label>
                    <input {...register("businessName")} className={`w-full border rounded-lg px-4 py-2.5 outline-none ${errors.businessName ? "border-orange-500" : "border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"}`} placeholder="e.g. Tariq Ahmad / Grand Royal Hotel" />
                    {errors.businessName && <span className="text-orange-500 text-xs font-medium mt-1">{errors.businessName.message}</span>}
                  </div>
                  
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">GST Number (Optional)</label>
                    <input {...register("gstNumber")} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none uppercase" placeholder="e.g. 01AAAAA0000A1Z5" />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Complete Business Address *</label>
                    <textarea {...register("address")} rows={2} className={`w-full border rounded-lg px-4 py-2.5 outline-none ${errors.address ? "border-orange-500" : "border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"}`} placeholder="e.g. 123 Boulevard Road, Srinagar, J&K, 190001" />
                    {errors.address && <span className="text-orange-500 text-xs font-medium mt-1">{errors.address.message}</span>}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Primary Email Address *</label>
                    <input {...register("email")} type="email" className={`w-full border rounded-lg px-4 py-2.5 outline-none ${errors.email ? "border-orange-500" : "border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"}`} placeholder="contact@business.com" />
                    {errors.email && <span className="text-orange-500 text-xs font-medium mt-1">{errors.email.message}</span>}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Create Password *</label>
                    <input {...register("password")} type="password" className={`w-full border rounded-lg px-4 py-2.5 outline-none ${errors.password ? "border-orange-500" : "border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"}`} placeholder="••••••••" />
                    {errors.password && <span className="text-orange-500 text-xs font-medium mt-1">{errors.password.message}</span>}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Primary Contact Number *</label>
                    <input {...register("phone")} type="tel" className={`w-full border rounded-lg px-4 py-2.5 outline-none ${errors.phone ? "border-orange-500" : "border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"}`} placeholder="10-digit number" />
                    {errors.phone && <span className="text-orange-500 text-xs font-medium mt-1">{errors.phone.message}</span>}
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Alternate Contact Person</label>
                    <input {...register("altContactPerson")} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none" placeholder="Manager Name" />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Alternate Phone Number</label>
                    <input {...register("altPhone")} type="tel" className={`w-full border rounded-lg px-4 py-2.5 outline-none ${errors.altPhone ? "border-orange-500" : "border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"}`} placeholder="10-digit number" />
                    {errors.altPhone && <span className="text-orange-500 text-xs font-medium mt-1">{errors.altPhone.message}</span>}
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-8">
                  <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Bank Details for Payouts</h3>
                    <div className="bg-sky-50 text-sky-600 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Info className="w-3 h-3" /> Secure
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Account Holder Name *</label>
                      <input {...register("accountHolderName")} className={`w-full border rounded-lg px-4 py-2.5 outline-none ${errors.accountHolderName ? "border-orange-500" : "border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"}`} placeholder="Must match bank records" />
                      {errors.accountHolderName && <span className="text-orange-500 text-xs font-medium mt-1">{errors.accountHolderName.message}</span>}
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name & Branch *</label>
                      <input {...register("bankName")} className={`w-full border rounded-lg px-4 py-2.5 outline-none ${errors.bankName ? "border-orange-500" : "border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"}`} placeholder="e.g. J&K Bank, Lal Chowk" />
                      {errors.bankName && <span className="text-orange-500 text-xs font-medium mt-1">{errors.bankName.message}</span>}
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Account Number *</label>
                      <input {...register("accountNumber")} className={`w-full border rounded-lg px-4 py-2.5 outline-none ${errors.accountNumber ? "border-orange-500" : "border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"}`} placeholder="16-digit account number" />
                      {errors.accountNumber && <span className="text-orange-500 text-xs font-medium mt-1">{errors.accountNumber.message}</span>}
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code *</label>
                      <input {...register("ifscCode")} className={`w-full border rounded-lg px-4 py-2.5 outline-none uppercase ${errors.ifscCode ? "border-orange-500" : "border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"}`} placeholder="e.g. JAKA0LALCHW" />
                      {errors.ifscCode && <span className="text-orange-500 text-xs font-medium mt-1">{errors.ifscCode.message}</span>}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setStep(1)} className="text-slate-500 font-medium hover:text-slate-800">Back</button>
                  <button type="button" onClick={nextStep} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800">
                    Save & Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Legal Documents Verification */}
            {step === 3 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Legal Document Upload</h2>
                <p className="text-sm text-slate-500 mb-8">As per J&K Tourism guidelines, we require valid identification and business licenses before your listing goes live.</p>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Standard KYC</h3>
                    <p className="text-xs text-slate-500 mb-4">Please upload clear photos of your Aadhaar Card, PAN Card, and Cancelled Cheque.</p>
                    <ImageUpload 
                      uploadedPhotos={kycPhotos} 
                      setUploadedPhotos={setKycPhotos} 
                      photoLimit={10} 
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
                      {selectedType === 'hotel' || selectedType === 'homestay' ? 'Property Licenses' : selectedType === 'taxi' ? 'Transport Documents' : 'Guide Credentials'}
                    </h3>
                    
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <p className="text-sm font-bold text-slate-800 mb-3">Please ensure you upload the following documents above:</p>
                      <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                        <li><strong>Aadhaar Card</strong> (Front & Back)</li>
                        <li><strong>PAN Card</strong> (Business or Individual)</li>
                        <li><strong>Cancelled Cheque</strong> (For bank verification)</li>
                        
                        {(selectedType === "hotel" || selectedType === "homestay") && (
                          <>
                            <li><strong>J&K Tourism Registration Certificate</strong> (Mandatory)</li>
                            <li><strong>Trade License / Municipality Permission</strong> (Mandatory)</li>
                            <li><strong>Fire Safety NOC</strong> (Recommended)</li>
                          </>
                        )}

                        {selectedType === "taxi" && (
                          <>
                            <li><strong>Driving License</strong> (Valid HMV/LMV)</li>
                            <li><strong>Vehicle RC</strong> (Registration Certificate)</li>
                            <li><strong>Commercial Permit & Active Insurance</strong></li>
                          </>
                        )}

                        {selectedType === "guide" && (
                          <>
                            <li><strong>J&K Tourism Guide License</strong> (Mandatory)</li>
                            <li><strong>Identity Badge</strong> (Clear photo)</li>
                            <li><strong>Experience Certificates</strong> (Optional)</li>
                          </>
                        )}
                      </ul>
                      <p className="text-xs text-slate-500 mt-4 italic">* All documents must be clear and readable. You can upload multiple files using the 'Add Photo' button above.</p>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 flex gap-3 items-start">
                    <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-orange-800">Verification Process</p>
                      <p className="text-sm text-orange-700 mt-1">Our team will verify your documents within 24-48 hours. You can still set up your profile, but your listings will remain unpublishable until approval.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="agreeToTerms" 
                      {...register("agreeToTerms")} 
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <label htmlFor="agreeToTerms" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                      I agree to WanderKashmir's <a href="/terms" target="_blank" className="text-sky-600 font-medium hover:underline">Terms of Service</a>, <a href="/terms" target="_blank" className="text-sky-600 font-medium hover:underline">Privacy Policy</a>, and the <a href="/terms" target="_blank" className="text-sky-600 font-medium hover:underline">Vendor Agreement</a>. I confirm that all uploaded documents are authentic and legally valid.
                    </label>
                  </div>
                  {errors.agreeToTerms && <p className="text-orange-500 text-xs font-medium mt-2 ml-7">{errors.agreeToTerms.message}</p>}
                </div>

                <div className="mt-8 flex justify-between pt-6 border-t border-slate-100">
                  <button type="button" onClick={() => setStep(2)} className="text-slate-500 font-medium hover:text-slate-800">Back</button>
                  <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 shadow-sm disabled:opacity-50">
                    {isSubmitting ? "Submitting..." : "Submit Documents"} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-sky-100 text-sky-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Registration Submitted!</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg">
                Your legal documents are pending verification. You can now access your dashboard and start drafting your first <strong className="text-slate-700 capitalize">{selectedType}</strong> listing.
              </p>
              <button 
                onClick={handleCompleteRegistration}
                className="bg-sky-500 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-sky-600 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Access My Dashboard
              </button>
            </div>
          )}
        </div>
    </div>
  );
}
