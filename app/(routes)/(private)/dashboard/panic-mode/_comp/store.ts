'use client';

// external
import { create } from 'zustand';

// services
import { FormState } from '@/components/helpers/form-items';
import type { SymptomResponse, SymptomHistory } from './types';

interface PanicModeStore {
  // Analysis state
  isAnalyzing: boolean;
  currentSymptomText: string;
  currentResponse: SymptomResponse | null;

  // History
  symptomHistory: SymptomHistory[];
  isHistoryLoading: boolean;

  // Dialog state
  isHistoryDialogOpen: boolean;

  // Form state
  formState: FormState;

  // Options
  selectedChildAge: string;
  selectedAllergies: string[];
  selectedLanguage: string;

  // Actions
  setIsAnalyzing: (value: boolean) => void;
  setCurrentSymptomText: (text: string) => void;
  setCurrentResponse: (response: SymptomResponse | null) => void;
  setSymptomHistory: (history: SymptomHistory[]) => void;
  setIsHistoryLoading: (loading: boolean) => void;
  setIsHistoryDialogOpen: (open: boolean) => void;
  setFormState: (state: FormState) => void;
  setSelectedChildAge: (age: string) => void;
  setSelectedAllergies: (allergies: string[]) => void;
  setSelectedLanguage: (language: string) => void;

  // Complex actions
  addToHistory: (item: SymptomHistory) => void;
  clearCurrentResponse: () => void;
  reset: () => void;
}

export const usePanicModeStore = create<PanicModeStore>((set) => ({
  // Initial state
  isAnalyzing: false,
  currentSymptomText: '',
  currentResponse: null,
  symptomHistory: [],
  isHistoryLoading: false,
  isHistoryDialogOpen: false,
  formState: {
    status: 'UNSET',
    message: '',
    fieldErrors: {},
    timestamp: Date.now(),
    redirect: '',
  },
  selectedChildAge: '',
  selectedAllergies: [],
  selectedLanguage: 'en',

  // Simple actions
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setCurrentSymptomText: (currentSymptomText) => set({ currentSymptomText }),
  setCurrentResponse: (currentResponse) => set({ currentResponse }),
  setSymptomHistory: (symptomHistory) => set({ symptomHistory, isHistoryLoading: false }),
  setIsHistoryLoading: (isHistoryLoading) => set({ isHistoryLoading }),
  setIsHistoryDialogOpen: (isHistoryDialogOpen) => set({ isHistoryDialogOpen }),
  setFormState: (formState) => set({ formState }),
  setSelectedChildAge: (selectedChildAge) => set({ selectedChildAge }),
  setSelectedAllergies: (selectedAllergies) => set({ selectedAllergies }),
  setSelectedLanguage: (selectedLanguage) => set({ selectedLanguage }),

  // Complex actions
  addToHistory: (item) =>
    set((state) => ({
      symptomHistory: [item, ...state.symptomHistory],
    })),

  clearCurrentResponse: () =>
    set({
      currentResponse: null,
      currentSymptomText: '',
    }),

  reset: () =>
    set({
      isAnalyzing: false,
      currentSymptomText: '',
      currentResponse: null,
      formState: {
        status: 'UNSET',
        message: '',
        fieldErrors: {},
        timestamp: Date.now(),
        redirect: '',
      },
      selectedChildAge: '',
      selectedAllergies: [],
      selectedLanguage: 'en',
    }),
}));
