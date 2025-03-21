import { create } from 'zustand';
import { FormState } from '@/components/helpers/form-items';
import type { Child, ChildFormData } from './types';

interface ProfileStore {
  children: Child[];
  isLoading: boolean;
  isPending: boolean;
  formData: ChildFormData;
  formState: FormState;
  setChildren: (children: Child[]) => void;
  setIsLoading: (loading: boolean) => void;
  setIsPending: (pending: boolean) => void;
  setField: <K extends keyof ChildFormData>(field: K, value: ChildFormData[K]) => void;
  setFormState: (state: FormState) => void;
  addChild: (child: Child) => void;
  updateChild: (id: string, data: Partial<Child>) => void;
  deleteChild: (id: string) => void;
  reset: () => void;
  resetForm: () => void;
  initializeEditForm: (data: ChildFormData) => void;
}

const defaultFormData: ChildFormData = {
  firstName: '',
  lastName: '',
  dob: '',
  gender: 'male',
  photoUrl: '',
  allergies: [],
  symptoms: [],
  emergencyContacts: [],
};

export const useProfileStore = create<ProfileStore>((set) => ({
  children: [],
  isLoading: true,
  isPending: false,
  formData: defaultFormData,
  formState: {
    status: 'UNSET',
    message: '',
    fieldErrors: {},
    timestamp: Date.now(),
    redirect: '',
  },
  setChildren: (children) => set({ children, isLoading: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsPending: (isPending) => set({ isPending }),
  setField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),
  setFormState: (formState) => set({ formState }),
  addChild: (child) => set((state) => ({ children: [child, ...state.children] })),
  updateChild: (id, data) =>
    set((state) => ({
      children: state.children.map((child) => (child.id === id ? { ...child, ...data } : child)),
    })),
  deleteChild: (id) =>
    set((state) => ({
      children: state.children.filter((child) => child.id !== id),
    })),
  reset: () =>
    set({
      formData: defaultFormData,
      formState: {
        status: 'UNSET',
        message: '',
        fieldErrors: {},
        timestamp: Date.now(),
        redirect: '',
      },
    }),
  resetForm: () => set({ formData: { ...defaultFormData } }),
  initializeEditForm: (data) => set({ formData: { ...data } }),
}));
