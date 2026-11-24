"use client";

import { useState } from "react";
import Image from "next/image";
import {
  X,
  Building,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Plus,
  Trash2,
  Save,
  Globe,
  ImageIcon,
} from "lucide-react";
import { AdminListingItem } from "@/lib/admin/listings";
import {
  updateListingSeoFaqAction,
  updateListingGooglePlaceIdAction,
  updateListingImagesAction,
} from "@/actions/adminListings";
import { StatusBadge, AdminToastBanner, type FeedbackMessage } from "@/components/admin/ui";

interface ListingDetailModalProps {
  listing: AdminListingItem | null;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (listing: AdminListingItem) => void;
  onSuspend: (listing: AdminListingItem) => void;
  onReactivate?: (id: string) => Promise<void>;
  onListingUpdated?: () => void;
}

export default function ListingDetailModal({
  listing,
  onClose,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
  onListingUpdated,
}: ListingDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "media" | "seo" | "place">("overview");

  const [description, setDescription] = useState(listing?.description || "");
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(
    listing?.faqs || []
  );
  const [savingSeo, setSavingSeo] = useState(false);

  const [googlePlaceId, setGooglePlaceId] = useState(listing?.googlePlaceId || "");
  const [savingPlaceId, setSavingPlaceId] = useState(false);

  const [images, setImages] = useState<string[]>(listing?.images || []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [savingImages, setSavingImages] = useState(false);

  const [actionPending, setActionPending] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  if (!listing) return null;

  const statusKey = listing.isApproved
    ? "LIVE"
    : listing.status === "REJECTED"
    ? "REJECTED"
    : listing.status === "SUSPENDED"
    ? "SUSPENDED"
    : "PENDING";

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleFaqChange = (index: number, field: "question" | "answer", val: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: val };
    setFaqs(updated);
  };

  const handleSaveSeoFaq = async () => {
    setSavingSeo(true);
    setFeedback(null);
    try {
      const res = await updateListingSeoFaqAction(listing.id, description, faqs);
      if (res.success) {
        setFeedback({ type: "success", text: "SEO description and FAQs saved." });
        if (onListingUpdated) onListingUpdated();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to save SEO details." });
      }
    } catch {
      setFeedback({ type: "error", text: "Error saving SEO details." });
    } finally {
      setSavingSeo(false);
    }
  };

  const handleSavePlaceId = async () => {
    setSavingPlaceId(true);
    setFeedback(null);
    try {
      const res = await updateListingGooglePlaceIdAction(listing.id, googlePlaceId);
      if (res.success) {
        setFeedback({ type: "success", text: "Google Place ID updated." });
        if (onListingUpdated) onListingUpdated();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to save Google Place ID." });
      }
    } catch {
      setFeedback({ type: "error", text: "Error saving Google Place ID." });
    } finally {
      setSavingPlaceId(false);
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setFeedback({ type: "error", text: "Please enter a valid HTTP or HTTPS image URL." });
      return;
    }
    setFeedback(null);
    setImages([...images, url]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSaveImages = async () => {
    setSavingImages(true);
    setFeedback(null);
    try {
      const res = await updateListingImagesAction(listing.id, images);
      if (res.success) {
        setFeedback({ type: "success", text: "Property photos updated." });
        if (onListingUpdated) onListingUpdated();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to update property photos." });
      }
    } catch {
      setFeedback({ type: "error", text: "Error updating property photos." });
    } finally {
      setSavingImages(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Listing details: ${listing.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-slate-200 rounded-md shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-4 bg-white shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                {listing.propertyType}
              </span>
              <StatusBadge status={statusKey} />
            </div>

            <h2 className="text-base font-semibold text-slate-900 mt-1.5 truncate">
              {listing.name}
            </h2>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>{listing.location}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-200 bg-slate-50 flex items-center gap-4 text-xs font-medium text-slate-500 overflow-x-auto shrink-0">
          {[
            { id: "overview" as const, label: "Overview & Vendor", Icon: Building },
            { id: "media" as const, label: `Photos (${images.length})`, Icon: ImageIcon },
            { id: "seo" as const, label: `SEO & FAQs (${faqs.length})`, Icon: Globe },
            { id: "place" as const, label: "Google Place ID", Icon: MapPin },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveTab(id);
                setFeedback(null);
              }}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === id
                  ? "text-[var(--season-primary-hover)] border-[var(--season-primary)] font-semibold"
                  : "border-transparent hover:text-slate-800"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 bg-[#F8FAFC]">
          <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {listing.rejectionReason && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
                  <div className="font-semibold flex items-center gap-1.5 text-rose-900 mb-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                    <span>Rejection / Suspension Reason</span>
                  </div>
                  <p>{listing.rejectionReason}</p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-md border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <div className="text-[11px] font-medium text-slate-500">Price / Night</div>
                  <div className="text-base font-semibold text-slate-900 mt-1 tabular-nums">
                    ₹{listing.pricePerNight.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="rounded-md border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <div className="text-[11px] font-medium text-slate-500">Avail / Total Rooms</div>
                  <div className="text-base font-semibold text-slate-900 mt-1 tabular-nums">
                    {listing.availableRooms} / {listing.totalRooms}
                  </div>
                </div>
                <div className="rounded-md border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <div className="text-[11px] font-medium text-slate-500">Bedrooms & Beds</div>
                  <div className="text-base font-semibold text-slate-900 mt-1">
                    {listing.bedrooms} BR · {listing.beds} Beds
                  </div>
                </div>
                <div className="rounded-md border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <div className="text-[11px] font-medium text-slate-500">Max Guests</div>
                  <div className="text-base font-semibold text-slate-900 mt-1 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>{listing.guests}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-slate-200/90 bg-white p-4 flex flex-wrap gap-4 text-xs shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div>
                  <span className="text-slate-500">Breakfast Included: </span>
                  <span className={listing.breakfastIncluded ? "text-emerald-800 font-semibold" : "text-slate-500"}>
                    {listing.breakfastIncluded ? "Yes" : "No"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Dinner Included: </span>
                  <span className={listing.dinnerIncluded ? "text-emerald-800 font-semibold" : "text-slate-500"}>
                    {listing.dinnerIncluded ? "Yes" : "No"}
                  </span>
                </div>
                {listing.bedDetails && (
                  <div>
                    <span className="text-slate-500">Bed Details: </span>
                    <span className="text-slate-800">{listing.bedDetails}</span>
                  </div>
                )}
              </div>

              <div className="rounded-md border border-slate-200/90 bg-white p-4 space-y-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Property Description
                </h4>
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {listing.description || (
                    <span className="italic text-slate-400">No description provided.</span>
                  )}
                </div>
              </div>

              <div className="rounded-md border border-slate-200/90 bg-white p-4 space-y-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Amenities ({listing.amenities.length})
                </h4>
                {listing.amenities.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {listing.amenities.map((a, idx) => (
                      <span
                        key={idx}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">No amenities specified.</div>
                )}
              </div>

              <div className="rounded-md border border-slate-200/90 bg-white p-4 space-y-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Partner / Vendor Information
                </h4>
                {listing.vendorProfile ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                    <div>
                      <div className="text-slate-500">Business Name</div>
                      <div className="font-semibold text-slate-900 mt-0.5">
                        {listing.vendorProfile.businessName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        ID: {listing.vendorProfile.vendorId || "Pending"} · {listing.vendorProfile.type}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Primary Contact</div>
                      <div className="font-medium text-slate-900 mt-0.5">
                        {listing.vendorProfile.user?.name || "N/A"}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {listing.vendorProfile.email || listing.vendorProfile.user?.email || "N/A"} ·{" "}
                        {listing.vendorProfile.phone || listing.vendorProfile.user?.phone || "N/A"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">No vendor attached.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA */}
          {activeTab === "media" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-md border border-slate-200 bg-white p-4">
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Add image URL (https://res.cloudinary.com/...)"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    Add Photo
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSaveImages}
                  disabled={savingImages}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{savingImages ? "Saving..." : "Save Media"}</span>
                </button>
              </div>

              {images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-video bg-slate-100 border border-slate-200 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Photo ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        <a
                          href={imgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-white p-1.5 text-slate-700 hover:bg-slate-100"
                          title="View full size"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="rounded-lg bg-rose-600 p-1.5 text-white hover:bg-rose-700 cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-slate-200/90 bg-white text-center py-10 text-xs text-slate-500">
                  No photos uploaded for this listing yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SEO & FAQS */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">SEO Description & FAQs</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize customer-facing property copy and frequently asked questions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveSeoFaq}
                  disabled={savingSeo}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{savingSeo ? "Saving..." : "Save SEO Details"}</span>
                </button>
              </div>

              <div className="rounded-md border border-slate-200 bg-white p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    SEO Summary & Public Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Narrative description of the property, views, and setting..."
                    className="w-full rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700">
                      Frequently Asked Questions ({faqs.length})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddFaq}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add FAQ</span>
                    </button>
                  </div>

                  {faqs.length > 0 ? (
                    <div className="space-y-2.5">
                      {faqs.map((faq, idx) => (
                        <div
                          key={idx}
                          className="rounded-md border border-slate-200 bg-slate-50/70 p-3 relative space-y-2"
                        >
                          <button
                            type="button"
                            onClick={() => handleRemoveFaq(idx)}
                            className="absolute top-2.5 right-2.5 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                            title="Delete FAQ"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                            placeholder="Question: e.g. How far is Dal Lake from the property?"
                            className="w-[92%] rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
                          />
                          <textarea
                            value={faq.answer}
                            onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                            rows={2}
                            placeholder="Answer..."
                            className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                      No FAQs added yet. Click &ldquo;Add FAQ&rdquo; to create one.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GOOGLE PLACE ID */}
          {activeTab === "place" && (
            <div className="rounded-md border border-slate-200 bg-white p-5 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Google Place ID Integration</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Link this property to Google Maps Place ID for verified coordinates and location reviews.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Google Place ID
                </label>
                <input
                  type="text"
                  value={googlePlaceId}
                  onChange={(e) => setGooglePlaceId(e.target.value)}
                  placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Retrieve from Google Maps Place ID Finder. Leave blank if unavailable.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePlaceId}
                  disabled={savingPlaceId}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{savingPlaceId ? "Saving..." : "Save Place ID"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {!listing.isApproved && listing.status !== "REJECTED" && (
              <>
                <button
                  type="button"
                  onClick={() => onReject(listing)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setActionPending(true);
                    try {
                      await onApprove(listing.id);
                      onClose();
                    } finally {
                      setActionPending(false);
                    }
                  }}
                  disabled={actionPending}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{actionPending ? "Approving..." : "Approve Listing"}</span>
                </button>
              </>
            )}

            {listing.isApproved && (
              <button
                type="button"
                onClick={() => onSuspend(listing)}
                className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Suspend</span>
              </button>
            )}

            {(listing.status === "REJECTED" || listing.status === "SUSPENDED") && onReactivate && (
              <button
                type="button"
                onClick={async () => {
                  setActionPending(true);
                  try {
                    await onReactivate(listing.id);
                    onClose();
                  } finally {
                    setActionPending(false);
                  }
                }}
                disabled={actionPending}
                className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] disabled:opacity-50 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{actionPending ? "Reactivating..." : "Reactivate"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
