import { create } from 'zustand';

interface BookingStore {
  selectedTaxiId: string;
  selectedGuideId: string;
  taxiAmount: number;
  guideAmount: number;
  
  // New room selection state
  selectedRoomId: string | null;
  selectedRoomName: string | null;
  selectedMealPlan: string | null; // 'EP', 'CP', 'MAP', etc.
  roomBasePrice: number | null;

  setSelectedTaxi: (id: string, amount: number) => void;
  setSelectedGuide: (id: string, amount: number) => void;
  setSelectedRoom: (id: string | null, name: string | null, mealPlan: string | null, price: number | null) => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  selectedTaxiId: "",
  selectedGuideId: "",
  taxiAmount: 0,
  guideAmount: 0,

  selectedRoomId: null,
  selectedRoomName: null,
  selectedMealPlan: null,
  roomBasePrice: null,

  setSelectedTaxi: (id, amount) => set({ selectedTaxiId: id, taxiAmount: amount }),
  setSelectedGuide: (id, amount) => set({ selectedGuideId: id, guideAmount: amount }),
  setSelectedRoom: (id, name, mealPlan, price) => set({
    selectedRoomId: id,
    selectedRoomName: name,
    selectedMealPlan: mealPlan,
    roomBasePrice: price
  }),
}));
