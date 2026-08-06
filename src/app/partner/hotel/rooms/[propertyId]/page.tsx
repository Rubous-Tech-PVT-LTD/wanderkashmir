"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { getRoomTypes, addRoomType, deleteRoomType, updateRoomInventory } from "@/actions/rooms";
import { ArrowLeft, Plus, Trash2, Calendar as CalendarIcon, Save } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RoomManagementPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const resolvedParams = use(params);
  const propertyId = resolvedParams.propertyId;

  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Room State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState(4500);
  const [capacity, setCapacity] = useState(2);
  const [totalUnits, setTotalUnits] = useState(1);

  // Inventory State (simple MVP: set today's availability)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [inventoryDate, setInventoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [inventoryAvailable, setInventoryAvailable] = useState(1);
  const [inventoryPrice, setInventoryPrice] = useState("");

  useEffect(() => {
    fetchRoomTypes();
  }, [propertyId]);

  const fetchRoomTypes = async () => {
    setLoading(true);
    const res = await getRoomTypes(propertyId);
    if (res.success) {
      setRoomTypes(res.roomTypes || []);
    }
    setLoading(false);
  };

  const handleAddRoomType = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await addRoomType(propertyId, {
      name, description, basePrice, capacity, totalUnits
    });
    if (res.success) {
      toast.success("Room Type added!");
      setShowAddForm(false);
      setName("");
      setDescription("");
      fetchRoomTypes();
    } else {
      toast.error(res.error || "Failed to add room type");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure? This will delete all calendar data for this room type.")) {
      const res = await deleteRoomType(id);
      if (res.success) {
        toast.success("Room Type deleted!");
        fetchRoomTypes();
      }
    }
  };

  const handleUpdateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) return;

    const res = await updateRoomInventory(
      selectedRoomId, 
      inventoryDate, 
      inventoryAvailable, 
      inventoryPrice ? parseFloat(inventoryPrice) : undefined
    );
    
    if (res.success) {
      toast.success(`Inventory updated for ${inventoryDate}!`);
      fetchRoomTypes();
    } else {
      toast.error("Failed to update inventory");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/partner/hotel" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Manage Rooms</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Room Types</h2>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-orange- text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-orange- transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Room Type
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddRoomType} className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Room Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} type="text" placeholder="e.g. Deluxe Room" className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Base Price (₹)</label>
              <input required value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} type="number" className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Capacity (Guests)</label>
              <input required value={capacity} onChange={e => setCapacity(Number(e.target.value))} type="number" className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Total Physical Units</label>
              <input required value={totalUnits} onChange={e => setTotalUnits(Number(e.target.value))} type="number" className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Room details..." className="w-full p-2 border border-slate-200 rounded-lg" rows={3}></textarea>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold">Save Room Type</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="py-8 text-center text-slate-500">Loading rooms...</div>
        ) : roomTypes.length === 0 ? (
          <div className="py-8 text-center text-slate-500">No room types found. Create one to get started!</div>
        ) : (
          <div className="space-y-4">
            {roomTypes.map(room => (
              <div key={room.id} className="border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center hover:bg-slate-50">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{room.name}</h3>
                  <p className="text-sm text-slate-500">{room.capacity} Guests • {room.totalUnits} Units Total • ₹{room.basePrice}/night</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedRoomId(room.id);
                      setInventoryAvailable(room.totalUnits);
                    }}
                    className="flex items-center gap-1 bg-orange- text-orange- px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-orange-"
                  >
                    <CalendarIcon className="w-4 h-4" /> Calendar
                  </button>
                  <button onClick={() => handleDelete(room.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRoomId && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold mb-4">Update Inventory & Pricing</h2>
          <form onSubmit={handleUpdateInventory} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
              <input required type="date" value={inventoryDate} onChange={e => setInventoryDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Available Rooms</label>
              <input required type="number" min="0" value={inventoryAvailable} onChange={e => setInventoryAvailable(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Custom Price (Optional)</label>
              <input type="number" placeholder="e.g. 5000" value={inventoryPrice} onChange={e => setInventoryPrice(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-slate-800">
                <Save className="w-4 h-4" /> Update
              </button>
            </div>
          </form>
          
          <div className="mt-6 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-500 mb-3">Currently Set Dates</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {roomTypes.find(r => r.id === selectedRoomId)?.inventories?.map((inv: any) => (
                <div key={inv.id} className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-sm">
                  <p className="font-bold">{new Date(inv.date).toLocaleDateString()}</p>
                  <p className="text-slate-600">{inv.available} Available</p>
                  {inv.priceOverride && <p className="text-emerald-600 font-bold">₹{inv.priceOverride}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
