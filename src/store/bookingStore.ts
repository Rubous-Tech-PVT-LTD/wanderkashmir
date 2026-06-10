import { create } from 'zustand';

interface BookingStore {
  selectedTaxiId: string;
  selectedGuideId: string;
  taxiAmount: number;
  guideAmount: number;
  setSelectedTaxi: (id: string, amount: number) => void;
  setSelectedGuide: (id: string, amount: number) => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  selectedTaxiId: "",
  selectedGuideId: "",
  taxiAmount: 0,
  guideAmount: 0,
  setSelectedTaxi: (id, amount) => set({ selectedTaxiId: id, taxiAmount: amount }),
  setSelectedGuide: (id, amount) => set({ selectedGuideId: id, guideAmount: amount }),
}));
