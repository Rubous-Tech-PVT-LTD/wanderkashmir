"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Save,
  Loader2,
  ExternalLink,
  Building,
  Bed,
  Plus,
  Trash2,
  Star,
  Info,
  Pencil,
} from "lucide-react";
import {
  createPropertyAction,
  updatePropertyAction,
  togglePropertyApprovalAction,
  addRoomTypeAction,
  updateRoomTypeAction,
  deleteRoomTypeAction,
  PropertyFormInput,
  RoomTypeFormInput,
} from "@/actions/adminProperties";
import {
  AdminModal,
  AdminPageHeader,
  AdminToastBanner,
  ConfirmActionDialog,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

interface VendorOption {
  id: string;
  businessName: string;
  type: string;
}

interface RoomTypeData {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  capacity: number;
  totalUnits: number;
  priceEP: number | null;
  priceCP: number | null;
  priceMAP: number | null;
  extraBedPrice: number | null;
  childNoBedPrice: number | null;
}

interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    name: string | null;
  } | null;
}

type PropertyCategory = "HOTEL" | "RESORT" | "HOMESTAY" | "HOUSEBOAT";

interface PropertyFormProps {
  initialData?: {
    id: string;
    name: string;
    location: string;
    description: string | null;
    pricePerNight: number;
    propertyType: PropertyCategory;
    vendorProfileId: string;
    images: string[];
    amenities: string[];
    bedrooms: number;
    beds: number;
    guests: number;
    totalRooms: number;
    availableRooms: number;
    breakfastIncluded: boolean;
    dinnerIncluded: boolean;
    bedDetails: string | null;
    googlePlaceId: string | null;
    latitude: number | null;
    longitude: number | null;
    isApproved: boolean;
    status: string;
    rejectionReason: string | null;
    roomTypes?: RoomTypeData[];
    reviews?: ReviewData[];
  };
  vendors: VendorOption[];
  isEdit?: boolean;
}

const inputClass =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--season-primary)]/20 transition-colors disabled:bg-slate-50 disabled:text-slate-500";
const labelClass = "block text-xs font-medium text-slate-700 mb-1.5";
const cardClass = "rounded-md border border-slate-200 bg-white p-5 space-y-4";

export default function PropertyForm({
  initialData,
  vendors,
  isEdit = false,
}: PropertyFormProps) {
  const router = useRouter();
  const basePath = useAdminBasePath();

  // Basic Form States
  const [name, setName] = useState(initialData?.name || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [propertyType, setPropertyType] = useState<PropertyCategory>(
    initialData?.propertyType || "HOTEL"
  );
  const [vendorProfileId, setVendorProfileId] = useState(
    initialData?.vendorProfileId || vendors[0]?.id || ""
  );

  // Pricing & Capacity States
  const [pricePerNight, setPricePerNight] = useState(
    initialData?.pricePerNight ? String(initialData.pricePerNight) : ""
  );
  const [totalRooms, setTotalRooms] = useState(
    initialData?.totalRooms ? String(initialData.totalRooms) : "1"
  );
  const [availableRooms, setAvailableRooms] = useState(
    initialData?.availableRooms ? String(initialData.availableRooms) : "1"
  );
  const [bedrooms, setBedrooms] = useState(
    initialData?.bedrooms ? String(initialData.bedrooms) : "1"
  );
  const [beds, setBeds] = useState(
    initialData?.beds ? String(initialData.beds) : "1"
  );
  const [guests, setGuests] = useState(
    initialData?.guests ? String(initialData.guests) : "2"
  );
  const [bedDetails, setBedDetails] = useState(initialData?.bedDetails || "");
  const [googlePlaceId] = useState(initialData?.googlePlaceId || "");
  const [latitude] = useState(initialData?.latitude ? String(initialData.latitude) : "");
  const [longitude] = useState(initialData?.longitude ? String(initialData.longitude) : "");

  // Amenities & Dining States
  const [breakfastIncluded, setBreakfastIncluded] = useState(
    Boolean(initialData?.breakfastIncluded)
  );
  const [dinnerIncluded, setDinnerIncluded] = useState(
    Boolean(initialData?.dinnerIncluded)
  );
  const [amenitiesStr, setAmenitiesStr] = useState(
    initialData?.amenities?.join(", ") ||
      "Free Wi-Fi, Mountain View, Heating, Kashmiri Cuisine, Room Service"
  );

  // Images State
  const [imagesStr, setImagesStr] = useState(initialData?.images?.join("\n") || "");

  // Approval State
  const [isApproved, setIsApproved] = useState(Boolean(initialData?.isApproved));
  const [status, setStatus] = useState(initialData?.status || "PENDING");
  const [rejectionReason, setRejectionReason] = useState(initialData?.rejectionReason || "");

  // Room Management States
  const [rooms, setRooms] = useState<RoomTypeData[]>(initialData?.roomTypes || []);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomTypeData | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<RoomTypeData | null>(null);
  const [roomName, setRoomName] = useState("");
  const [roomDesc, setRoomDesc] = useState("");
  const [roomBasePrice, setRoomBasePrice] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("2");
  const [roomUnits, setRoomUnits] = useState("1");
  const [roomPriceCP, setRoomPriceCP] = useState("");
  const [roomPriceMAP, setRoomPriceMAP] = useState("");
  const [roomActionLoading, setRoomActionLoading] = useState(false);
  const [roomModalError, setRoomModalError] = useState<string | null>(null);

  // Feedback States
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<FeedbackMessage | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      const parsedPrice = parseFloat(pricePerNight);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        setToast({
          type: "error",
          text: "Price per night must be a valid positive number.",
        });
        setLoading(false);
        return;
      }

      const images = imagesStr
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter((s) => s.startsWith("http://") || s.startsWith("https://"));

      const amenities = amenitiesStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: PropertyFormInput = {
        name,
        location,
        description: description || null,
        pricePerNight: parsedPrice,
        propertyType,
        vendorProfileId,
        images,
        amenities,
        bedrooms: parseInt(bedrooms, 10) || 1,
        beds: parseInt(beds, 10) || 1,
        guests: parseInt(guests, 10) || 2,
        totalRooms: parseInt(totalRooms, 10) || 1,
        availableRooms: parseInt(availableRooms, 10) || 1,
        breakfastIncluded,
        dinnerIncluded,
        bedDetails: bedDetails || null,
        googlePlaceId: googlePlaceId || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      };

      if (isEdit && initialData) {
        const res = await updatePropertyAction(initialData.id, payload);
        if (!res.success) {
          setToast({
            type: "error",
            text: res.error || "Failed to update property.",
          });
          setLoading(false);
          return;
        }
        setToast({ type: "success", text: "Property updated successfully." });
      } else {
        const res = await createPropertyAction(payload);
        if (!res.success) {
          setToast({
            type: "error",
            text: res.error || "Failed to create property.",
          });
          setLoading(false);
          return;
        }
        setToast({
          type: "success",
          text: "Property created successfully (pending verification).",
        });
        if (res.data?.id) {
          router.push(`${basePath}/properties/${res.data.id}`);
          return;
        }
      }

      router.refresh();
    } catch {
      setToast({
        type: "error",
        text: "An unexpected error occurred while saving.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalToggle = async (approve: boolean) => {
    if (!initialData) return;
    setLoading(true);
    setToast(null);

    try {
      const res = await togglePropertyApprovalAction(
        initialData.id,
        approve,
        rejectionReason
      );
      if (res.success && res.data) {
        setIsApproved(res.data.isApproved);
        setStatus(res.data.status);
        setToast({
          type: "success",
          text: approve
            ? "Property approved and live on public stays."
            : "Property unapproved and removed from public listings.",
        });
        router.refresh();
      } else {
        setToast({
          type: "error",
          text: res.error || "Failed to update approval.",
        });
      }
    } catch {
      setToast({ type: "error", text: "Error communicating with server." });
    } finally {
      setLoading(false);
    }
  };

  // Room modal openers
  const openNewRoomModal = () => {
    setEditingRoom(null);
    setRoomName("");
    setRoomDesc("");
    setRoomBasePrice(pricePerNight || "");
    setRoomCapacity("2");
    setRoomUnits("1");
    setRoomPriceCP("");
    setRoomPriceMAP("");
    setRoomModalError(null);
    setShowRoomModal(true);
  };

  const openEditRoomModal = (room: RoomTypeData) => {
    setEditingRoom(room);
    setRoomName(room.name);
    setRoomDesc(room.description || "");
    setRoomBasePrice(String(room.basePrice));
    setRoomCapacity(String(room.capacity));
    setRoomUnits(String(room.totalUnits));
    setRoomPriceCP(room.priceCP ? String(room.priceCP) : "");
    setRoomPriceMAP(room.priceMAP ? String(room.priceMAP) : "");
    setRoomModalError(null);
    setShowRoomModal(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData) return;
    setRoomActionLoading(true);
    setRoomModalError(null);

    const roomPayload: RoomTypeFormInput = {
      name: roomName,
      description: roomDesc || null,
      basePrice: parseFloat(roomBasePrice) || 0,
      capacity: parseInt(roomCapacity, 10) || 2,
      totalUnits: parseInt(roomUnits, 10) || 1,
      priceCP: roomPriceCP ? parseFloat(roomPriceCP) : null,
      priceMAP: roomPriceMAP ? parseFloat(roomPriceMAP) : null,
    };

    try {
      if (editingRoom) {
        const res = await updateRoomTypeAction(editingRoom.id, roomPayload);
        if (!res.success) {
          setRoomModalError(res.error || "Failed to update room type.");
          setRoomActionLoading(false);
          return;
        }
        setRooms((prev) =>
          prev.map((r) =>
            r.id === editingRoom.id
              ? {
                  ...r,
                  name: roomPayload.name,
                  description: roomPayload.description ?? null,
                  basePrice: roomPayload.basePrice,
                  capacity: roomPayload.capacity,
                  totalUnits: roomPayload.totalUnits,
                  priceCP: roomPayload.priceCP ?? null,
                  priceMAP: roomPayload.priceMAP ?? null,
                }
              : r
          )
        );
        setToast({ type: "success", text: `Updated room type "${roomPayload.name}".` });
      } else {
        const res = await addRoomTypeAction(initialData.id, roomPayload);
        if (!res.success || !res.data) {
          setRoomModalError(res.error || "Failed to create room type.");
          setRoomActionLoading(false);
          return;
        }
        setRooms((prev) => [
          ...prev,
          {
            id: res.data!.id,
            name: roomPayload.name,
            description: roomPayload.description ?? null,
            basePrice: roomPayload.basePrice,
            capacity: roomPayload.capacity,
            totalUnits: roomPayload.totalUnits,
            priceCP: roomPayload.priceCP ?? null,
            priceMAP: roomPayload.priceMAP ?? null,
            priceEP: null,
            extraBedPrice: null,
            childNoBedPrice: null,
          },
        ]);
        setToast({ type: "success", text: `Added room type "${roomPayload.name}".` });
      }
      setShowRoomModal(false);
      router.refresh();
    } catch {
      setRoomModalError("Error saving room type.");
    } finally {
      setRoomActionLoading(false);
    }
  };

  const handleConfirmDeleteRoom = async () => {
    if (!deletingRoom) return;
    const res = await deleteRoomTypeAction(deletingRoom.id);
    if (!res.success) {
      throw new Error(res.error || "Failed to delete room type.");
    }
    setRooms((prev) => prev.filter((r) => r.id !== deletingRoom.id));
    setToast({ type: "success", text: `Deleted room type "${deletingRoom.name}".` });
    setDeletingRoom(null);
    router.refresh();
  };

  const isLiveApproved = isApproved && status === "APPROVED";

  const previewUrls = imagesStr
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter((url) => url.startsWith("http://") || url.startsWith("https://"))
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <AdminPageHeader
        title={isEdit ? initialData?.name || "Edit Property" : "Create New Property"}
        subtitle="Configure property details, category, room inventory, and verification status."
        backHref={`${basePath}/properties`}
        backLabel="Back to Properties"
        badge={
          isEdit && initialData ? (
            <StatusBadge
              status={isLiveApproved ? "APPROVED" : status}
              label={isLiveApproved ? "Approved & Live" : status}
              showDot
            />
          ) : undefined
        }
        actions={
          isEdit && initialData && isLiveApproved ? (
            <Link
              href={`/stays/${initialData.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Public Stay
            </Link>
          ) : undefined
        }
      />

      <AdminToastBanner message={toast} onDismiss={() => setToast(null)} />

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Overview & Classification */}
        <section className={cardClass}>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="h-4 w-4 text-[var(--season-primary)]" />
            <h2 className="text-sm font-semibold text-slate-900">
              1. Property Overview & Classification
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                Property Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hotel Ulfat or Dal Lake Royal Houseboat"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Property Type <span className="text-rose-600">*</span>
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyCategory)}
                className={inputClass}
              >
                <option value="HOTEL">Hotel (Standard / Boutique)</option>
                <option value="RESORT">Resort (Alpine / Luxury)</option>
                <option value="HOMESTAY">Homestay (Traditional Kashmiri Heritage)</option>
                <option value="HOUSEBOAT">Houseboat (Dal Lake / Nigeen Lake)</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Location <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Pahalgam, Kashmir or Boulevard Road, Srinagar"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Associated Vendor Profile <span className="text-rose-600">*</span>
                {isEdit && (
                  <span className="ml-1.5 text-[11px] font-normal text-slate-500">
                    (Ownership protected)
                  </span>
                )}
              </label>
              <select
                value={vendorProfileId}
                disabled={isEdit}
                onChange={(e) => setVendorProfileId(e.target.value)}
                className={inputClass}
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.businessName} ({v.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Description / Overview</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the stay, surroundings, architecture, and hospitality..."
              className={inputClass}
            />
          </div>
        </section>

        {/* Section 2: Pricing & Capacity */}
        <section className={cardClass}>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bed className="h-4 w-4 text-[var(--season-primary)]" />
            <h2 className="text-sm font-semibold text-slate-900">2. Pricing & Capacity</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className={labelClass}>
                Base Rate / Night (₹) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                required
                min="100"
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                placeholder="4500"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Total Rooms</label>
              <input
                type="number"
                min="1"
                value={totalRooms}
                onChange={(e) => setTotalRooms(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Available Rooms</label>
              <input
                type="number"
                min="0"
                value={availableRooms}
                onChange={(e) => setAvailableRooms(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Max Guests</label>
              <input
                type="number"
                min="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Bedrooms</label>
              <input
                type="number"
                min="1"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Beds</label>
              <input
                type="number"
                min="1"
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Bed Details</label>
              <input
                type="text"
                value={bedDetails}
                onChange={(e) => setBedDetails(e.target.value)}
                placeholder="e.g. 1 King Bed + 1 Single Bed"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Section 3: Amenities & Meals */}
        <section className={cardClass}>
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              3. Amenities & Dining Inclusions
            </h2>
          </div>

          <div className="flex flex-wrap gap-6 py-1">
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={breakfastIncluded}
                onChange={(e) => setBreakfastIncluded(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[var(--season-primary)] focus:ring-[var(--season-primary)]"
              />
              Breakfast Included (CP)
            </label>

            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={dinnerIncluded}
                onChange={(e) => setDinnerIncluded(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[var(--season-primary)] focus:ring-[var(--season-primary)]"
              />
              Dinner Included (MAP)
            </label>
          </div>

          <div>
            <label className={labelClass}>Amenities (comma separated)</label>
            <textarea
              rows={2}
              value={amenitiesStr}
              onChange={(e) => setAmenitiesStr(e.target.value)}
              placeholder="Free Wi-Fi, Mountain View, Heating, Kashmiri Cuisine, Garden, Lake View, 24/7 Power Backup"
              className={inputClass}
            />
          </div>
        </section>

        {/* Section 4: Media & Photos */}
        <section className={cardClass}>
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">4. Photos & Media</h2>
          </div>

          <div>
            <label className={labelClass}>Image URLs (one per line or comma-separated)</label>
            <textarea
              rows={4}
              value={imagesStr}
              onChange={(e) => setImagesStr(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className={`${inputClass} font-mono text-xs`}
            />
          </div>

          {previewUrls.length > 0 && (
            <div className="flex flex-wrap gap-2.5 pt-1">
              {previewUrls.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className="relative h-16 w-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                >
                  <Image
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 5: Verification & Approval Workflow (Only in Edit Mode) */}
        {isEdit && initialData && (
          <section className={cardClass}>
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h2 className="text-sm font-semibold text-slate-900">
                5. Verification & Approval
              </h2>
              <StatusBadge
                status={isLiveApproved ? "APPROVED" : status}
                label={isLiveApproved ? "Approved & Live" : status}
                showDot
              />
            </div>

            <p className="text-xs leading-relaxed text-slate-600">
              Approved properties appear immediately on public <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">/stays</code> listings and sitemap. Unapproving hides the property from public discovery without losing booking history.
            </p>

            {!isLiveApproved && (
              <div>
                <label className={labelClass}>Rejection / Suspension Reason (Optional)</label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incomplete high-resolution photos or missing tourism registration."
                  className={inputClass}
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {isLiveApproved ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleApprovalToggle(false)}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Suspend / Unapprove Property
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleApprovalToggle(true)}
                  className="rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-medium text-white hover:bg-[var(--season-primary-hover)] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Approve Property & Make Live
                </button>
              )}
            </div>

            <div className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>
                Permanent property deletion is disabled to preserve historical booking records and financial integrity. Use unapprove/suspend to take a listing offline.
              </span>
            </div>
          </section>
        )}

        {/* Section 6: Room Types Management (Only in Edit Mode) */}
        {isEdit && initialData && (
          <section className={cardClass}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Bed className="h-4 w-4 text-[var(--season-primary)]" />
                  6. Room Types & Rates ({rooms.length})
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Configure room categories, guest capacities, and optional meal plan supplements.
                </p>
              </div>

              <button
                type="button"
                onClick={openNewRoomModal}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Room Type
              </button>
            </div>

            {rooms.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/70 py-8 text-center text-xs text-slate-500">
                No individual room types configured yet. Public stays will use the base property rate.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{room.name}</div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        Capacity: {room.capacity} Guests · Total Units: {room.totalUnits}
                        {room.description ? ` · ${room.description}` : ""}
                      </div>
                      <div className="mt-1 text-xs font-medium text-[var(--season-primary)]">
                        ₹{Math.round(room.basePrice).toLocaleString("en-IN")} / night
                        {room.priceCP ? ` · CP: ₹${Math.round(room.priceCP).toLocaleString("en-IN")}` : ""}
                        {room.priceMAP ? ` · MAP: ₹${Math.round(room.priceMAP).toLocaleString("en-IN")}` : ""}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditRoomModal(room)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingRoom(room)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Room Type"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Section 7: Reviews Preview (Read-only) */}
        {isEdit && initialData?.reviews && initialData.reviews.length > 0 && (
          <section className={cardClass}>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-900">
                7. Guest Reviews ({initialData.reviews.length})
              </h2>
            </div>

            <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto pr-1">
              {initialData.reviews.map((rev) => (
                <div key={rev.id} className="py-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">
                      {rev.user?.name || "Verified Guest"}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                      {rev.rating} / 5
                    </span>
                  </div>
                  {rev.comment && (
                    <p className="mt-1 leading-relaxed text-slate-600">{rev.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <Link
            href={`${basePath}/properties`}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--season-primary)] px-5 py-2 text-xs font-medium text-white hover:bg-[var(--season-primary-hover)] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEdit ? "Update Property" : "Create Property"}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Room Type Modal */}
      <AdminModal
        open={showRoomModal}
        onClose={() => !roomActionLoading && setShowRoomModal(false)}
        title={editingRoom ? "Edit Room Type" : "Add New Room Type"}
        subtitle="Set base nightly rate, guest capacity, inventory, and optional meal supplements."
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={roomActionLoading}
              onClick={() => setShowRoomModal(false)}
              className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="room-type-form"
              disabled={roomActionLoading}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-medium text-white hover:bg-[var(--season-primary-hover)] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {roomActionLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Room"
              )}
            </button>
          </div>
        }
      >
        <form id="room-type-form" onSubmit={handleSaveRoom} className="space-y-4">
          {roomModalError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {roomModalError}
            </div>
          )}

          <div>
            <label className={labelClass}>
              Room Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g. Deluxe Alpine View Room"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Base Price / Night (₹) <span className="text-rose-600">*</span>
            </label>
            <input
              type="number"
              required
              min="100"
              value={roomBasePrice}
              onChange={(e) => setRoomBasePrice(e.target.value)}
              placeholder="4500"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Capacity (Guests)</label>
              <input
                type="number"
                min="1"
                value={roomCapacity}
                onChange={(e) => setRoomCapacity(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Total Units</label>
              <input
                type="number"
                min="1"
                value={roomUnits}
                onChange={(e) => setRoomUnits(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Breakfast Rate (CP)</label>
              <input
                type="number"
                min="0"
                value={roomPriceCP}
                onChange={(e) => setRoomPriceCP(e.target.value)}
                placeholder="Optional ₹"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Half Board (MAP)</label>
              <input
                type="number"
                min="0"
                value={roomPriceMAP}
                onChange={(e) => setRoomPriceMAP(e.target.value)}
                placeholder="Optional ₹"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description (Optional)</label>
            <textarea
              rows={2}
              value={roomDesc}
              onChange={(e) => setRoomDesc(e.target.value)}
              placeholder="e.g. Wooden paneling, private balcony facing snow peaks"
              className={inputClass}
            />
          </div>
        </form>
      </AdminModal>

      {/* Delete Room Confirmation */}
      <ConfirmActionDialog
        open={Boolean(deletingRoom)}
        onClose={() => setDeletingRoom(null)}
        title="Delete Room Type"
        description={`Are you sure you want to delete "${deletingRoom?.name || "this room type"}"? This cannot be undone.`}
        confirmLabel="Delete Room Type"
        tone="danger"
        onConfirm={handleConfirmDeleteRoom}
      />
    </div>
  );
}
