import { z } from "zod";

export const vendorRegistrationSchema = z.object({
  vendorType: z.enum(["hotel", "homestay", "taxi", "guide"], {
    message: "Please select a vendor type",
  }),
  businessName: z.string().min(3, "Business Name must be at least 3 characters"),
  gstNumber: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  address: z.string().min(10, "Please provide a complete address"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  altContactPerson: z.string().optional(),
  altPhone: z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits").optional().or(z.literal("")),
  accountHolderName: z.string().min(3, "Account holder name is required"),
  bankName: z.string().min(3, "Bank name is required"),
  accountNumber: z.string().min(9, "Account number must be at least 9 characters"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC Code format"),
  kycDocuments: z.array(z.string()).optional(),
  agreeToTerms: z.literal(true, {
    error: "You must agree to the terms of service"
  }),
});

export type VendorRegistrationData = z.infer<typeof vendorRegistrationSchema>;

export const propertySchema = z.object({
  name: z.string().min(3, "Property name must be at least 3 characters"),
  location: z.string().min(5, "Please provide the full location"),
  description: z.string().min(20, "Description should be at least 20 characters").optional(),
  pricePerNight: z.number().min(0, "Price cannot be negative"),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  totalRooms: z.number().min(1, "Must have at least 1 room").optional(),
});

export type PropertyData = z.infer<typeof propertySchema>;

export const vehicleSchema = z.object({
  make: z.string().min(2, "Make is required (e.g. Toyota)"),
  model: z.string().min(2, "Model is required (e.g. Innova)"),
  registrationNum: z.string().min(4, "Registration number is required"),
  type: z.enum(["Sedan", "SUV", "Hatchback", "Traveller"], {
    message: "Please select a vehicle type",
  }),
});

export type VehicleData = z.infer<typeof vehicleSchema>;
