import { create } from 'zustand';
import type { TDiagnosis } from '@/services/dummy-data';

// Enhanced diagnosis type with percentage match and reason
export type EnhancedDiagnosis = TDiagnosis & {
  percentageMatch?: number;
  reason?: string;
};

interface DiagnosisStore {
  selectedDiagnosis: EnhancedDiagnosis | null;
  setSelectedDiagnosis: (diagnosis: EnhancedDiagnosis | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  filteredDiagnoses: EnhancedDiagnosis[];
  setFilteredDiagnoses: (diagnoses: EnhancedDiagnosis[]) => void;
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
