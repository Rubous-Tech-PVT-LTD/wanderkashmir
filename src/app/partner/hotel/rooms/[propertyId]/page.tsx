"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { getRoomTypes, addRoomType, updateRoomType, deleteRoomType, updateRoomInventory } from "@/actions/rooms";
import { ArrowLeft, Plus, Trash2, Calendar as CalendarIcon, Save, Edit } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RoomManagementPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const resolvedParams = use(params);
  const propertyId = resolvedParams.propertyId;

  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState(4500);
  const [capacity, setCapacity] = useState(2);
  const [totalUnits, setTotalUnits] = useState(1);
  const [priceEP, setPriceEP] = useState<string>("");
  const [priceCP, setPriceCP] = useState<string>("");
  const [priceMAP, setPriceMAP] = useState<string>("");
  const [extraBedPrice, setExtraBedPrice] = useState<string>("");
  const [childNoBedPrice, setChildNoBedPrice] = useState<string>("");

  // Inventory State
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

  const handleAddNew = () => {
    setEditingRoomId(null);
    setName("");
    setDescription("");
    setBasePrice(4500);
    setCapacity(2);
    setTotalUnits(1);
    setPriceEP("");
    setPriceCP("");
    setPriceMAP("");
    setExtraBedPrice("");
    setChildNoBedPrice("");
    setShowAddForm(true);
  };

  const handleEditRoom = (room: any) => {
    setEditingRoomId(room.id);
    setName(room.name || "");
    setDescription(room.description || "");
    setBasePrice(room.basePrice || 4500);
    setCapacity(room.capacity || 2);
    setTotalUnits(room.totalUnits || 1);
    setPriceEP(room.priceEP ? String(room.priceEP) : "");
    setPriceCP(room.priceCP ? String(room.priceCP) : "");
    setPriceMAP(room.priceMAP ? String(room.priceMAP) : "");
    setExtraBedPrice(room.extraBedPrice ? String(room.extraBedPrice) : "");
    setChildNoBedPrice(room.childNoBedPrice ? String(room.childNoBedPrice) : "");
    setShowAddForm(true);
  };

  const handleSaveRoomType = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name, 
      description, 
      basePrice, 
      capacity, 
      totalUnits,
      priceEP: priceEP ? parseFloat(priceEP) : null,
      priceCP: priceCP ? parseFloat(priceCP) : null,
      priceMAP: priceMAP ? parseFloat(priceMAP) : null,
      extraBedPrice: extraBedPrice ? parseFloat(extraBedPrice) : null,
      childNoBedPrice: childNoBedPrice ? parseFloat(childNoBedPrice) : null,
    };

    let res;
    if (editingRoomId) {
      res = await updateRoomType(editingRoomId, data);
    } else {
      res = await addRoomType(propertyId, data);
    }

    if (res.success) {
      toast.success(editingRoomId ? "Room Type updated!" : "Room Type added!");
      setShowAddForm(false);
      setEditingRoomId(null);
      fetchRoomTypes();
    } else {
      toast.error(res.error || "Failed to save room type");
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
          {!showAddForm && (
            <button 
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Room Type
            </button>
          )}
        </div>

        {showAddForm && (
          <form onSubmit={handleSaveRoomType} className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-6 space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Room Name</label>
                  <input required value={name} onChange={e => setName(e.target.value)} type="text" placeholder="e.g. Double Room" className="w-full p-2 border border-slate-200 rounded-lg" />
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
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Meal Plan Pricing (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">EP (European Plan)</label>
                  <div className="text-xs text-slate-500 mb-2">Room Only</div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                    <input value={priceEP} onChange={e => setPriceEP(e.target.value)} type="number" placeholder="Leave empty if N/A" className="w-full p-2 pl-7 border border-slate-200 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">CP (Continental Plan)</label>
                  <div className="text-xs text-slate-500 mb-2">Room + Breakfast</div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                    <input value={priceCP} onChange={e => setPriceCP(e.target.value)} type="number" placeholder="Leave empty if N/A" className="w-full p-2 pl-7 border border-slate-200 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">MAP (Modified American Plan)</label>
                  <div className="text-xs text-slate-500 mb-2">Room + Breakfast + 1 Meal</div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                    <input value={priceMAP} onChange={e => setPriceMAP(e.target.value)} type="number" placeholder="Leave empty if N/A" className="w-full p-2 pl-7 border border-slate-200 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Additional Charges (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Extra Bed</label>
                  <div className="text-xs text-slate-500 mb-2">Additional Bed Charge</div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                    <input value={extraBedPrice} onChange={e => setExtraBedPrice(e.target.value)} type="number" placeholder="Leave empty if N/A" className="w-full p-2 pl-7 border border-slate-200 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">CNB (Child No Bed)</label>
                  <div className="text-xs text-slate-500 mb-2">Child Without Extra Bed</div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                    <input value={childNoBedPrice} onChange={e => setChildNoBedPrice(e.target.value)} type="number" placeholder="Leave empty if N/A" className="w-full p-2 pl-7 border border-slate-200 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
              <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors">
                {editingRoomId ? "Save Changes" : "Save Room Type"}
              </button>
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
              <div key={room.id} className="border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900">{room.name}</h3>
                    {(!room.priceEP && !room.priceCP && !room.priceMAP) && (
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Incomplete</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{room.capacity} Guests • {room.totalUnits} Units Total • Base: ₹{room.basePrice}/night</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {room.priceEP && <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">EP: ₹{room.priceEP}</span>}
                    {room.priceCP && <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">CP: ₹{room.priceCP}</span>}
                    {room.priceMAP && <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">MAP: ₹{room.priceMAP}</span>}
                    {room.extraBedPrice && <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">Ex. Bed: ₹{room.extraBedPrice}</span>}
                    {room.childNoBedPrice && <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">CNB: ₹{room.childNoBedPrice}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedRoomId(room.id);
                      setInventoryAvailable(room.totalUnits);
                    }}
                    className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-orange-100 transition-colors"
                  >
                    <CalendarIcon className="w-4 h-4" /> Calendar
                  </button>
                  <button onClick={() => handleEditRoom(room)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(room.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
          <h2 className="text-xl font-bold mb-4">Update Inventory & Pricing Override</h2>
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
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-slate-800 transition-colors">
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
