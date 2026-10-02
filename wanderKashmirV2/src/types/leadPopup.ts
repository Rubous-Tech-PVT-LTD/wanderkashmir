export interface LeadContextPayload {
  sourcePage?: string;
  sourceType?: "tour" | "travel-style" | "destination" | "tours" | "homepage" | "property" | "experience" | "general" | string;
  tourId?: string;
  tourSlug?: string;
  destination?: string;
  travelStyle?: string;
  propertyId?: string;
  experienceId?: string;
  triggerType?: "time" | "scroll" | "exit_intent" | "cta";
  [key: string]: any;
}
