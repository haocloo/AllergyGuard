import { create } from 'zustand';
import type { TDiagnosis } from '@/services/dummy-data';

interface DiagnosisStore {
  selectedDiagnosis: TDiagnosis | null;
  setSelectedDiagnosis: (diagnosis: TDiagnosis | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  filteredDiagnoses: TDiagnosis[];
  setFilteredDiagnoses: (diagnoses: TDiagnosis[]) => void;
  hasSearched: boolean;
  setHasSearched: (searched: boolean) => void;
}

export const useDiagnosisStore = create<DiagnosisStore>((set) => ({
  selectedDiagnosis: null,
  setSelectedDiagnosis: (diagnosis) => set({ selectedDiagnosis: diagnosis }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  filteredDiagnoses: [],
  setFilteredDiagnoses: (diagnoses) => set({ filteredDiagnoses: diagnoses }),
  hasSearched: false,
  setHasSearched: (searched) => set({ hasSearched: searched }),
}));
