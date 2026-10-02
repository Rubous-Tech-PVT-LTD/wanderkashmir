"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Building,
  Bed,
  Plus,
  Trash2,
  Star,
  ShieldAlert,
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

interface PropertyFormProps {
  initialData?: {
    id: string;
    name: string;
    location: string;
    description: string | null;
    pricePerNight: number;
    propertyType: "HOTEL" | "RESORT" | "HOMESTAY" | "HOUSEBOAT";
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

export default function PropertyForm({
  initialData,
  vendors,
  isEdit = false,
}: PropertyFormProps) {
  const router = useRouter();

  // Basic Form States
  const [name, setName] = useState(initialData?.name || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [propertyType, setPropertyType] = useState<"HOTEL" | "RESORT" | "HOMESTAY" | "HOUSEBOAT">(
    initialData?.propertyType || "HOTEL"
  );
  const [vendorProfileId, setVendorProfileId] = useState(
    initialData?.vendorProfileId || (vendors[0]?.id || "")
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
  const [googlePlaceId, setGooglePlaceId] = useState(initialData?.googlePlaceId || "");
  const [latitude, setLatitude] = useState(initialData?.latitude ? String(initialData.latitude) : "");
  const [longitude, setLongitude] = useState(initialData?.longitude ? String(initialData.longitude) : "");

  // Amenities & Dining States
  const [breakfastIncluded, setBreakfastIncluded] = useState(
    Boolean(initialData?.breakfastIncluded)
  );
  const [dinnerIncluded, setDinnerIncluded] = useState(
    Boolean(initialData?.dinnerIncluded)
  );
  const [amenitiesStr, setAmenitiesStr] = useState(
    initialData?.amenities?.join(", ") || "Free Wi-Fi, Mountain View, Heating, Kashmiri Cuisine, Room Service"
  );

  // Images State
  const [imagesStr, setImagesStr] = useState(
    initialData?.images?.join("\n") || ""
  );

  // Approval State
  const [isApproved, setIsApproved] = useState(Boolean(initialData?.isApproved));
  const [status, setStatus] = useState(initialData?.status || "PENDING");
  const [rejectionReason, setRejectionReason] = useState(initialData?.rejectionReason || "");

  // Room Management States
  const [rooms, setRooms] = useState<RoomTypeData[]>(initialData?.roomTypes || []);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomTypeData | null>(null);
  const [roomName, setRoomName] = useState("");
  const [roomDesc, setRoomDesc] = useState("");
  const [roomBasePrice, setRoomBasePrice] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("2");
  const [roomUnits, setRoomUnits] = useState("1");
  const [roomPriceCP, setRoomPriceCP] = useState("");
  const [roomPriceMAP, setRoomPriceMAP] = useState("");
  const [roomActionLoading, setRoomActionLoading] = useState(false);

  // Feedback States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const parsedPrice = parseFloat(pricePerNight);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        setError("Price per night must be a valid positive number.");
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
          setError(res.error || "Failed to update property.");
          setLoading(false);
          return;
        }
        setSuccessMsg("Property updated successfully.");
      } else {
        const res = await createPropertyAction(payload);
        if (!res.success) {
          setError(res.error || "Failed to create property.");
          setLoading(false);
          return;
        }
        setSuccessMsg("Property created successfully (Pending verification).");
        if (res.data?.id) {
          router.push(`/admin/properties/${res.data.id}`);
          return;
        }
      }

      router.refresh();
    } catch {
      setError("An unexpected error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalToggle = async (approve: boolean) => {
    if (!initialData) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await togglePropertyApprovalAction(initialData.id, approve, rejectionReason);
      if (res.success && res.data) {
        setIsApproved(res.data.isApproved);
        setStatus(res.data.status);
        setSuccessMsg(
          approve ? "Property approved successfully." : "Property unapproved successfully."
        );
        router.refresh();
      } else {
        setError(res.error || "Failed to update approval.");
      }
    } catch {
      setError("Error communicating with server.");
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
    setShowRoomModal(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData) return;
    setRoomActionLoading(true);

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
          alert(res.error || "Failed to update room");
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
      } else {
        const res = await addRoomTypeAction(initialData.id, roomPayload);
        if (!res.success || !res.data) {
          alert(res.error || "Failed to create room");
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
      }
      setShowRoomModal(false);
      router.refresh();
    } catch {
      alert("Error saving room.");
    } finally {
      setRoomActionLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room type?")) return;
    try {
      const res = await deleteRoomTypeAction(roomId);
      if (res.success) {
        setRooms((prev) => prev.filter((r) => r.id !== roomId));
        router.refresh();
      } else {
        alert(res.error || "Failed to delete room");
      }
    } catch {
      alert("Error communicating with server.");
    }
  };

  const isLiveApproved = isApproved && status === "APPROVED";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/admin/properties"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Properties
        </Link>

        {isEdit && initialData && (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isLiveApproved
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isLiveApproved ? "bg-emerald-400" : "bg-amber-400"}`} />
              {isLiveApproved ? "Approved & Live" : status}
            </span>

            {isLiveApproved && (
              <Link
                href={`/stays/${initialData.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Public Stay
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Title & Description */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {isEdit ? `Edit Property: ${initialData?.name}` : "Create New Property"}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure property details, property taxonomy, room inventories, and verification approval.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Overview & Classification */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Building className="w-4 h-4 text-emerald-400" />
            1. Property Overview & Classification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Property Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Property Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hotel Ulfat or Dal Lake Royal Houseboat"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* PropertyType Taxonomy (Source of Truth) */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Property Type Taxonomy <span className="text-rose-400">*</span>
                <span className="ml-1 text-[10px] text-emerald-400 font-normal">(Property.propertyType)</span>
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="HOTEL">Hotel (Standard / Boutique)</option>
                <option value="RESORT">Resort (Alpine / Luxury)</option>
                <option value="HOMESTAY">Homestay (Traditional Kashmiri Heritage)</option>
                <option value="HOUSEBOAT">Houseboat (Dal Lake / Nigeen Lake)</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Location <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Pahalgam, Kashmir or Boulevard Road, Srinagar"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Vendor Profile Association */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Associated Vendor Profile <span className="text-rose-400">*</span>
                {isEdit && <span className="ml-1 text-[10px] text-slate-500">(Ownership protected)</span>}
              </label>
              <select
                value={vendorProfileId}
                disabled={isEdit}
                onChange={(e) => setVendorProfileId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.businessName} ({v.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Description / Overview
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the stay, surroundings, architecture, and Kashmiri hospitality..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Section 2: Pricing & Capacity */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Bed className="w-4 h-4 text-emerald-400" />
            2. Pricing & Capacity
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Price Per Night */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Base Rate / Night (₹) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                required
                min="100"
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                placeholder="4500"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Total Rooms */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Total Rooms</label>
              <input
                type="number"
                min="1"
                value={totalRooms}
                onChange={(e) => setTotalRooms(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Available Rooms */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Available Rooms</label>
              <input
                type="number"
                min="0"
                value={availableRooms}
                onChange={(e) => setAvailableRooms(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Guests Capacity */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Max Guests</label>
              <input
                type="number"
                min="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Bedrooms</label>
              <input
                type="number"
                min="1"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Beds</label>
              <input
                type="number"
                min="1"
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Bed Details</label>
              <input
                type="text"
                value={bedDetails}
                onChange={(e) => setBedDetails(e.target.value)}
                placeholder="e.g. 1 King Bed + 1 Single Bed"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Amenities & Meals */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-white border-b border-slate-800/80 pb-3">
            3. Amenities & Dining Inclusions
          </h2>

          <div className="flex flex-wrap gap-6 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={breakfastIncluded}
                onChange={(e) => setBreakfastIncluded(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs text-slate-300 font-medium">Breakfast Included (CP)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dinnerIncluded}
                onChange={(e) => setDinnerIncluded(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs text-slate-300 font-medium">Dinner Included (MAP)</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Amenities (comma separated)
            </label>
            <textarea
              rows={2}
              value={amenitiesStr}
              onChange={(e) => setAmenitiesStr(e.target.value)}
              placeholder="Free Wi-Fi, Mountain View, Heating, Kashmiri Cuisine, Garden, Lake View, 24/7 Power Backup"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Section 4: Media & Photos */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-white border-b border-slate-800/80 pb-3">
            4. Photos & Media (Cloudinary URLs)
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Image URLs (one per line or comma-separated)
            </label>
            <textarea
              rows={4}
              value={imagesStr}
              onChange={(e) => setImagesStr(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
            />
          </div>

          {/* Image Previews */}
          {imagesStr.trim() && (
            <div className="flex flex-wrap gap-2 pt-2">
              {imagesStr
                .split(/[\n,]+/)
                .map((url) => url.trim())
                .filter((url) => url.startsWith("http"))
                .slice(0, 6)
                .map((url, idx) => (
                  <div
                    key={idx}
                    className="w-20 h-16 rounded-lg bg-slate-800 relative overflow-hidden border border-slate-700/60"
                  >
                    <Image src={url} alt={`Preview ${idx + 1}`} fill className="object-cover" sizes="80px" />
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Section 5: Verification & Approval Workflow (Only in Edit Mode) */}
        {isEdit && initialData && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-white border-b border-slate-800/80 pb-3 flex items-center justify-between">
              <span>5. Verification & Approval Workflow</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full border ${
                  isLiveApproved
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                {isLiveApproved ? "Approved & Live" : status}
              </span>
            </h2>

            <p className="text-xs text-slate-400">
              Approved properties satisfy the production publishing guard (
              <code className="text-emerald-400">isApproved === true && status === &apos;APPROVED&apos;</code>) and are
              instantly visible on <code className="text-slate-300">/stays</code> and sitemap.
            </p>

            {!isLiveApproved && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Rejection / Suspension Reason (Optional)
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incomplete high-resolution photos or missing Kashmiri tourism registration."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              {isLiveApproved ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleApprovalToggle(false)}
                  className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors cursor-pointer"
                >
                  Suspend / Unapprove Property
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleApprovalToggle(true)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  Approve Property & Make Live
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 text-slate-500 text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                Delete: <strong>NOT IMPLEMENTED</strong>. Destructive deletion is intentionally excluded to preserve
                historical booking relations and data integrity.
              </span>
            </div>
          </div>
        )}

        {/* Section 6: Room Types Management (Only in Edit Mode) */}
        {isEdit && initialData && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Bed className="w-4 h-4 text-emerald-400" />
                  6. Room Types & Rates ({rooms.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure specific rooms, capacities, and optional meal plan supplements.
                </p>
              </div>

              <button
                type="button"
                onClick={openNewRoomModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Room Type
              </button>
            </div>

            {rooms.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No individual room types configured yet. Public stays will use the base property rate.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {rooms.map((room) => (
                  <div key={room.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-white text-xs">{room.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Capacity: {room.capacity} Guests • Total Units: {room.totalUnits}
                        {room.description ? ` • ${room.description}` : ""}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
                        ₹{Math.round(room.basePrice).toLocaleString("en-IN")} / night
                        {room.priceCP ? ` • CP: ₹${Math.round(room.priceCP)}` : ""}
                        {room.priceMAP ? ` • MAP: ₹${Math.round(room.priceMAP)}` : ""}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditRoomModal(room)}
                        className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-1 rounded text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                        title="Delete Room Type"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section 7: Reviews Preview (Read-only) */}
        {isEdit && initialData?.reviews && initialData.reviews.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              7. Reviews ({initialData.reviews.length})
            </h2>

            <div className="divide-y divide-slate-800/80 max-h-60 overflow-y-auto pr-2">
              {initialData.reviews.map((rev) => (
                <div key={rev.id} className="py-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold text-white">{rev.user?.name || "Verified Guest"}</span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" /> {rev.rating} / 5
                    </span>
                  </div>
                  {rev.comment && <p className="text-slate-400 mt-1 text-[11px]">{rev.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/properties"
            className="px-4 py-2.5 rounded-lg border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> {isEdit ? "Update Property" : "Create Property"}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingRoom ? "Edit Room Type" : "Add New Room Type"}
            </h3>

            <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Room Name *</label>
                <input
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Deluxe Alpine View Room"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Base Price / Night (₹) *</label>
                <input
                  type="number"
                  required
                  min="100"
                  value={roomBasePrice}
                  onChange={(e) => setRoomBasePrice(e.target.value)}
                  placeholder="4500"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Capacity (Guests)</label>
                  <input
                    type="number"
                    min="1"
                    value={roomCapacity}
                    onChange={(e) => setRoomCapacity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Total Units</label>
                  <input
                    type="number"
                    min="1"
                    value={roomUnits}
                    onChange={(e) => setRoomUnits(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Breakfast Rate (CP)</label>
                  <input
                    type="number"
                    min="0"
                    value={roomPriceCP}
                    onChange={(e) => setRoomPriceCP(e.target.value)}
                    placeholder="Optional ₹"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Half Board (MAP)</label>
                  <input
                    type="number"
                    min="0"
                    value={roomPriceMAP}
                    onChange={(e) => setRoomPriceMAP(e.target.value)}
                    placeholder="Optional ₹"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={roomDesc}
                  onChange={(e) => setRoomDesc(e.target.value)}
                  placeholder="e.g. Wooden paneling, private balcony facing snow peaks"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={roomActionLoading}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 cursor-pointer disabled:opacity-50"
                >
                  {roomActionLoading ? "Saving..." : "Save Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
