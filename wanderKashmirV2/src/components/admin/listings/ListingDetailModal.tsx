"use client";

import { useState } from "react";
import Image from "next/image";
import {
  X,
  Building,
  MapPin,
  IndianRupee,
  Bed,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Plus,
  Trash2,
  Save,
  Globe,
  HelpCircle,
  ImageIcon,
} from "lucide-react";
import { AdminListingItem } from "@/lib/admin/listings";
import {
  updateListingSeoFaqAction,
  updateListingGooglePlaceIdAction,
  updateListingImagesAction,
} from "@/actions/adminListings";

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

  // SEO & FAQ edit state
  const [description, setDescription] = useState(listing?.description || "");
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(
    listing?.faqs || []
  );
  const [savingSeo, setSavingSeo] = useState(false);
  const [seoSuccess, setSeoSuccess] = useState(false);

  // Google Place ID edit state
  const [googlePlaceId, setGooglePlaceId] = useState(listing?.googlePlaceId || "");
  const [savingPlaceId, setSavingPlaceId] = useState(false);
  const [placeIdSuccess, setPlaceIdSuccess] = useState(false);

  // Media edit state
  const [images, setImages] = useState<string[]>(listing?.images || []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [savingImages, setSavingImages] = useState(false);
  const [imagesSuccess, setImagesSuccess] = useState(false);

  // Action pending state
  const [actionPending, setActionPending] = useState(false);

  if (!listing) return null;

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
    setSeoSuccess(false);
    try {
      const res = await updateListingSeoFaqAction(listing.id, description, faqs);
      if (res.success) {
        setSeoSuccess(true);
        if (onListingUpdated) onListingUpdated();
        setTimeout(() => setSeoSuccess(false), 3000);
      } else {
        alert(res.error || "Failed to save SEO details.");
      }
    } catch {
      alert("Error saving SEO details.");
    } finally {
      setSavingSeo(false);
    }
  };

  const handleSavePlaceId = async () => {
    setSavingPlaceId(true);
    setPlaceIdSuccess(false);
    try {
      const res = await updateListingGooglePlaceIdAction(listing.id, googlePlaceId);
      if (res.success) {
        setPlaceIdSuccess(true);
        if (onListingUpdated) onListingUpdated();
        setTimeout(() => setPlaceIdSuccess(false), 3000);
      } else {
        alert(res.error || "Failed to save Google Place ID.");
      }
    } catch {
      alert("Error saving Google Place ID.");
    } finally {
      setSavingPlaceId(false);
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      alert("Please enter a valid HTTP/HTTPS URL.");
      return;
    }
    setImages([...images, url]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSaveImages = async () => {
    setSavingImages(true);
    setImagesSuccess(false);
    try {
      const res = await updateListingImagesAction(listing.id, images);
      if (res.success) {
        setImagesSuccess(true);
        if (onListingUpdated) onListingUpdated();
        setTimeout(() => setImagesSuccess(false), 3000);
      } else {
        alert(res.error || "Failed to update property media.");
      }
    } catch {
      alert("Error updating property media.");
    } finally {
      setSavingImages(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/80">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {listing.propertyType}
              </span>
              {listing.isApproved ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Live
                </span>
              ) : listing.status === "REJECTED" ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Rejected
                </span>
              ) : listing.status === "SUSPENDED" ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Suspended
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Pending Review
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-white mt-1.5">{listing.name}</h2>
            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{listing.location}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 bg-slate-950 flex items-center gap-4 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "text-emerald-400 border-emerald-400"
                : "border-transparent hover:text-slate-200"
            }`}
          >
            <Building className="w-3.5 h-3.5" /> Overview & Vendor
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "media"
                ? "text-emerald-400 border-emerald-400"
                : "border-transparent hover:text-slate-200"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Photos ({images.length})
          </button>
          <button
            onClick={() => setActiveTab("seo")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "seo"
                ? "text-emerald-400 border-emerald-400"
                : "border-transparent hover:text-slate-200"
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> SEO & FAQs ({faqs.length})
          </button>
          <button
            onClick={() => setActiveTab("place")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "place"
                ? "text-emerald-400 border-emerald-400"
                : "border-transparent hover:text-slate-200"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Google Place ID
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Rejection / Suspension Notice */}
              {listing.rejectionReason && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  <div className="font-bold flex items-center gap-1.5 text-rose-400 mb-1">
                    <AlertTriangle className="w-4 h-4" /> Rejection / Suspension Reason:
                  </div>
                  <p>{listing.rejectionReason}</p>
                </div>
              )}

              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[11px] font-medium text-slate-400">Price / Night</div>
                  <div className="text-lg font-bold text-white mt-1 flex items-center">
                    <IndianRupee className="w-4 h-4 text-emerald-400" />
                    {listing.pricePerNight.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[11px] font-medium text-slate-400">Total / Avail Rooms</div>
                  <div className="text-lg font-bold text-white mt-1">
                    {listing.availableRooms} / {listing.totalRooms}
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[11px] font-medium text-slate-400">Bedrooms & Beds</div>
                  <div className="text-lg font-bold text-white mt-1">
                    {listing.bedrooms} BR • {listing.beds} Beds
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[11px] font-medium text-slate-400">Max Guests</div>
                  <div className="text-lg font-bold text-white mt-1 flex items-center gap-1">
                    <Users className="w-4 h-4 text-sky-400" />
                    {listing.guests} Guests
                  </div>
                </div>
              </div>

              {/* Meals & Bed Details */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Breakfast Included: </span>
                  <span className={listing.breakfastIncluded ? "text-emerald-400 font-bold" : "text-slate-500"}>
                    {listing.breakfastIncluded ? "Yes" : "No"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Dinner Included: </span>
                  <span className={listing.dinnerIncluded ? "text-emerald-400 font-bold" : "text-slate-500"}>
                    {listing.dinnerIncluded ? "Yes" : "No"}
                  </span>
                </div>
                {listing.bedDetails && (
                  <div>
                    <span className="text-slate-400">Bed Details: </span>
                    <span className="text-slate-200">{listing.bedDetails}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Property Description
                </h4>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {listing.description || <span className="italic text-slate-500">No description provided.</span>}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Amenities ({listing.amenities.length})
                </h4>
                {listing.amenities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {listing.amenities.map((a, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">No amenities specified.</div>
                )}
              </div>

              {/* Vendor Profile Card */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Partner / Vendor Information
                </h4>
                {listing.vendorProfile ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-slate-400">Business Name:</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {listing.vendorProfile.businessName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Vendor ID: {listing.vendorProfile.vendorId || "Pending ID"} • Type: {listing.vendorProfile.type}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Primary Contact:</div>
                      <div className="text-sm font-semibold text-slate-200 mt-0.5">
                        {listing.vendorProfile.user?.name || "N/A"}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {listing.vendorProfile.email || listing.vendorProfile.user?.email || "N/A"} •{" "}
                        {listing.vendorProfile.phone || listing.vendorProfile.user?.phone || "N/A"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">No vendor attached.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA & PHOTOS */}
          {activeTab === "media" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <div className="flex-1 w-full flex items-center gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Add Cloudinary image URL (https://res.cloudinary.com/...)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
                  >
                    Add Photo
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSaveImages}
                  disabled={savingImages}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingImages ? "Saving..." : "Save Media"}
                </button>
              </div>

              {imagesSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                  Property media successfully updated!
                </div>
              )}

              {images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-video bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Photo ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        <a
                          href={imgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-slate-800/90 text-white rounded-lg hover:bg-slate-700 text-xs"
                          title="View Full Size"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1.5 bg-rose-600/90 text-white rounded-lg hover:bg-rose-500 text-xs"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-500">
                  No photos uploaded for this listing yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SEO & FAQS */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">SEO Description & FAQs</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Review and customize customer-facing SEO copy and frequently asked questions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveSeoFaq}
                  disabled={savingSeo}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingSeo ? "Saving..." : "Save SEO Details"}
                </button>
              </div>

              {seoSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                  SEO description and FAQs saved successfully!
                </div>
              )}

              {/* SEO Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  SEO Summary & Public Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Rich narrative description of the property, views, warmth, and setting..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* FAQs List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Frequently Asked Questions ({faqs.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add FAQ
                  </button>
                </div>

                {faqs.length > 0 ? (
                  <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 relative space-y-2"
                      >
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(idx)}
                          className="absolute top-2.5 right-2.5 p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                          title="Delete FAQ"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                          placeholder="Question: e.g. How far is Dal Lake from the property?"
                          className="w-[90%] bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <textarea
                          value={faq.answer}
                          onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                          rows={2}
                          placeholder="Answer: e.g. It is approximately 1.5 km and reachable in 5 minutes by car."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
                    No FAQs added for this property yet. Click &quot;Add FAQ&quot; above to create one.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: GOOGLE PLACE ID */}
          {activeTab === "place" && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-white">Google Place ID Integration</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Link this property to Google Maps Place ID for verified coordinates and live location reviews.
                </p>
              </div>

              {placeIdSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                  Google Place ID updated successfully!
                </div>
              )}

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Google Place ID
                  </label>
                  <input
                    type="text"
                    value={googlePlaceId}
                    onChange={(e) => setGooglePlaceId(e.target.value)}
                    placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Can be retrieved from Google Maps Place ID Finder. Leave blank if not available.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSavePlaceId}
                    disabled={savingPlaceId}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingPlaceId ? "Saving..." : "Save Place ID"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {/* If pending review: show Reject & Approve */}
            {!listing.isApproved && listing.status !== "REJECTED" && (
              <>
                <button
                  type="button"
                  onClick={() => onReject(listing)}
                  className="px-3.5 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject Listing
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {actionPending ? "Approving..." : "Approve Listing"}
                </button>
              </>
            )}

            {/* If live: show Suspend */}
            {listing.isApproved && (
              <button
                type="button"
                onClick={() => onSuspend(listing)}
                className="px-3.5 py-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Suspend Listing
              </button>
            )}

            {/* If rejected or suspended: show Reactivate */}
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
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {actionPending ? "Reactivating..." : "Reactivate Listing"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
