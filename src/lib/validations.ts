import { z } from "zod";

export const vendorRegistrationSchema = z.object({
  vendorType: z.enum(["hotel", "homestay", "taxi", "guide"], {
    message: "Please select a vendor type",
  }),
  businessName: z.string().min(3, "Business Name must be at least 3 characters").regex(/^[a-zA-Z0-9\s&'-]+$/, "Business Name contains invalid characters"),
  gstNumber: z.string().trim().toUpperCase().min(15, "GST should be 15 characters").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain uppercase, lowercase, number, and special character"),
  address: z.string().min(10, "Please provide a complete address"),
  latitude: z.preprocess((val) => (val === "" || val === null || isNaN(Number(val)) ? undefined : Number(val)), z.number().optional()),
  longitude: z.preprocess((val) => (val === "" || val === null || isNaN(Number(val)) ? undefined : Number(val)), z.number().optional()),
  email: z.string().trim().toLowerCase().email("Invalid email address").refine(
    (val) => {
      const lower = val.toLowerCase();
      // Block common typos
      if (lower.endsWith('.con')) return false;
      if (lower.endsWith('.coom')) return false;
      if (lower.endsWith('.comm')) return false;
      if (lower.includes('@gmial.')) return false;
      if (lower.includes('@gamil.')) return false;
      return true;
    },
    { message: "Typo in email domain (e.g. .con instead of .com or gmial instead of gmail)" }
  ),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number. Must start with 6-9 and have 10 digits"),
  altContactPerson: z.string().optional(),
  altPhone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number").optional().or(z.literal("")),
  accountHolderName: z.string().min(3, "Account holder name is required").regex(/^[a-zA-Z\s'-]+$/, "Account holder name contains invalid characters"),
  bankName: z.string().min(3, "Bank name is required"),
  accountNumber: z.string().min(9, "Account number must be at least 9 characters"),
  ifscCode: z.string().trim().toUpperCase().min(11, "IFSC Code should be 11 characters"),
  kycDocuments: z.array(z.string()).optional(),
  agreeToTerms: z.literal(true, {
    error: "You must agree to the terms of service"
  }),
  
  // Conditional Fields
  panNumber: z.string().trim().toUpperCase().min(10, "PAN must be 10 characters").optional().or(z.literal("")),
  tradeLicense: z.string().optional(),
  
  // Taxi specific
  taxiRole: z.string().optional(), // 'individual' or 'stand'
  vehicleType: z.string().optional(),
  vehicleRegistration: z.string().trim().toUpperCase().min(4, "Registration (RC) is required").optional().or(z.literal("")),
  drivingLicense: z.string().optional(),
  
  // Guide specific
  guideLicense: z.string().optional(),
  languages: z.string().optional(),
  experienceYears: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.vendorType === 'hotel' || data.vendorType === 'homestay') {
    if (!data.panNumber || data.panNumber.length < 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valid PAN Number is required", path: ["panNumber"] });
    }
  }
  if (data.vendorType === 'taxi') {
    if (!data.taxiRole) {
       ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select if you are an Individual or a Taxi Stand", path: ["taxiRole"] });
    }
    
    if (data.taxiRole === 'individual') {
      if (!data.vehicleType || data.vehicleType.length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vehicle Type is required", path: ["vehicleType"] });
      }
      if (!data.vehicleRegistration || data.vehicleRegistration.length < 4) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vehicle Registration (RC) is required", path: ["vehicleRegistration"] });
      }
      if (!data.drivingLicense || data.drivingLicense.length < 5) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Driving License number is required", path: ["drivingLicense"] });
      }
    } else if (data.taxiRole === 'stand') {
      if (!data.tradeLicense || data.tradeLicense.length < 3) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Stand Registration or Trade License is required", path: ["tradeLicense"] });
      }
    }
  }
  if (data.vendorType === 'guide') {
    if (!data.languages || data.languages.length < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify languages spoken", path: ["languages"] });
    }
  }
});

export type VendorRegistrationData = z.infer<typeof vendorRegistrationSchema>;

export const propertySchema = z.object({
  name: z.string().min(3, "Property name must be at least 3 characters").regex(/^[a-zA-Z0-9\s&'-]+$/, "Property Name contains invalid characters"),
  location: z.string().min(5, "Please provide the full location"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  googlePlaceId: z.string().optional(),
  description: z.string().min(20, "Description should be at least 20 characters").optional(),
  pricePerNight: z.number().min(0, "Price cannot be negative"),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  totalRooms: z.number().min(1, "Must have at least 1 room").optional(),
  bedrooms: z.number().min(1).optional(),
  beds: z.number().min(1).optional(),
  guests: z.number().min(1).optional(),
  bedDetails: z.string().optional(),
});

export type PropertyData = z.infer<typeof propertySchema>;

export const vehicleSchema = z.object({
  make: z.string().min(2, "Make is required (e.g. Toyota)"),
  model: z.string().min(2, "Model is required (e.g. Innova)"),
  registrationNum: z.string().min(4, "Registration number is required"),
  images: z.array(z.string()).optional(),
  type: z.enum(["Sedan", "SUV", "Hatchback", "Traveller"], {
    message: "Please select a vehicle type",
  }),
});

export type VehicleData = z.infer<typeof vehicleSchema>;
