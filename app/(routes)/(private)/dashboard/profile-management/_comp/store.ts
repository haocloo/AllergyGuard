// external
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// services
import { FormState } from '@/components/helpers/form-items';
import type { Allergy, Child, Classroom, AllergySeverity } from './types';

// #####################################################
//               CLASSROOM STORE
// #####################################################
interface ClassroomStore {
  // State
  classrooms: Classroom[];
  selectedClassroom: Classroom | null;
  isLoading: boolean;
  isDialogOpen: boolean;
  isPending: boolean;
  searchTerm: string;
  mode: 'create' | 'edit';
  formData: {
    name: string;
    accessCode: string;
  };
  formState: FormState;

  // Actions
  setClassrooms: (classrooms: Classroom[]) => void;
  setSelectedClassroom: (classroom: Classroom | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsDialogOpen: (open: boolean) => void;
  setIsPending: (pending: boolean) => void;
  setSearchTerm: (searchTerm: string) => void;
  setMode: (mode: 'create' | 'edit') => void;
  setField: (field: keyof ClassroomStore['formData'], value: string) => void;
  setFormState: (state: FormState) => void;

  // CRUD operations
  addClassroom: (classroom: Classroom) => void;
  updateClassroom: (id: string, updatedClassroom: Partial<Classroom>) => void;
  deleteClassroom: (id: string) => void;

  // Modal operations
  openCreateDialog: () => void;
  openEditDialog: (classroom: Classroom) => void;
  resetForm: () => void;

  // Children operations
  addChildToClassroom: (classroomId: string, childId: string) => void;
  removeChildFromClassroom: (classroomId: string, childId: string) => void;
}

export const useClassroomStore = create<ClassroomStore>((set) => ({
  // State
  classrooms: [],
  selectedClassroom: null,
  isLoading: false,
  isDialogOpen: false,
  isPending: false,
  searchTerm: '',
  mode: 'create',
  formData: {
    name: '',
    accessCode: '',
  },
  formState: {
    status: 'UNSET',
    message: '',
    fieldErrors: {},
    timestamp: Date.now(),
    redirect: '',
  },

  // Actions
  setClassrooms: (classrooms) => set({ classrooms, isLoading: false }),
  setSelectedClassroom: (selectedClassroom) => set({ selectedClassroom }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsDialogOpen: (isDialogOpen) => set({ isDialogOpen }),
  setIsPending: (isPending) => set({ isPending }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setMode: (mode) => set({ mode }),
  setField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),
  setFormState: (formState) => set({ formState }),

  // CRUD operations
  addClassroom: (classroom) =>
    set((state) => ({
      classrooms: [classroom, ...state.classrooms],
    })),
  updateClassroom: (id, updatedClassroom) =>
    set((state) => ({
      classrooms: state.classrooms.map((classroom) =>
        classroom.id === id ? { ...classroom, ...updatedClassroom } : classroom
      ),
    })),
  deleteClassroom: (id) =>
    set((state) => ({
      classrooms: state.classrooms.filter((classroom) => classroom.id !== id),
    })),

  // Modal operations
  openCreateDialog: () =>
    set({
      isDialogOpen: true,
      mode: 'create',
      formData: {
        name: '',
        accessCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      },
    }),
  openEditDialog: (classroom) =>
    set({
      isDialogOpen: true,
      mode: 'edit',
      formData: {
        name: classroom.name,
        accessCode: classroom.accessCode,
      },
      selectedClassroom: classroom,
    }),
  resetForm: () =>
    set({
      formData: {
        name: '',
        accessCode: '',
      },
      formState: {
        status: 'UNSET',
        message: '',
        fieldErrors: {},
        timestamp: Date.now(),
        redirect: '',
      },
      selectedClassroom: null,
    }),

  // Children operations
  addChildToClassroom: (classroomId, childId) =>
    set((state) => ({
      classrooms: state.classrooms.map((classroom) =>
        classroom.id === classroomId
          ? { ...classroom, children: [...classroom.children, childId] }
          : classroom
      ),
    })),
  removeChildFromClassroom: (classroomId, childId) =>
    set((state) => ({
      classrooms: state.classrooms.map((classroom) =>
        classroom.id === classroomId
          ? { ...classroom, children: classroom.children.filter((id) => id !== childId) }
          : classroom
      ),
    })),
}));

// #####################################################
//               CHILD PROFILE STORE
// #####################################################
interface ChildProfileStore {
  // State
  children: Child[];
  selectedChild: Child | null;
  isLoading: boolean;
  isDialogOpen: boolean;
  isPending: boolean;
  searchTerm: string;
  mode: 'create' | 'edit';
  formData: {
    name: string;
    dob: string;
    allergies: Allergy[];
    parentId: string;
    classroomId?: string;
  };
  formState: FormState;
  currentAllergyEdit: {
    index: number;
    allergen: string;
    severity: AllergySeverity;
    notes: string;
  };
  isAllergyDialogOpen: boolean;

  // Actions
  setChildren: (children: Child[]) => void;
  setSelectedChild: (child: Child | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsDialogOpen: (open: boolean) => void;
  setIsPending: (pending: boolean) => void;
  setSearchTerm: (searchTerm: string) => void;
  setMode: (mode: 'create' | 'edit') => void;
  setField: (field: keyof Omit<ChildProfileStore['formData'], 'allergies'>, value: string) => void;
  setFormState: (state: FormState) => void;

  // CRUD operations
  addChild: (child: Child) => void;
  updateChild: (id: string, updatedChild: Partial<Child>) => void;
  deleteChild: (id: string) => void;

  // Modal operations
  openCreateDialog: () => void;
  openEditDialog: (child: Child) => void;
  resetForm: () => void;

  // Allergy operations
  setIsAllergyDialogOpen: (open: boolean) => void;
  setCurrentAllergyEdit: (data: Partial<ChildProfileStore['currentAllergyEdit']>) => void;
  openAddAllergyDialog: () => void;
  openEditAllergyDialog: (index: number) => void;
  saveAllergy: () => void;
  deleteAllergy: (index: number) => void;
}

export const useChildProfileStore = create<ChildProfileStore>((set) => ({
  // State
  children: [],
  selectedChild: null,
  isLoading: false,
  isDialogOpen: false,
  isPending: false,
  searchTerm: '',
  mode: 'create',
  formData: {
    name: '',
    dob: '',
    allergies: [],
    parentId: '',
    classroomId: undefined,
  },
  formState: {
    status: 'UNSET',
    message: '',
    fieldErrors: {},
    timestamp: Date.now(),
    redirect: '',
  },
  currentAllergyEdit: {
    index: -1,
    allergen: '',
    severity: 'Low',
    notes: '',
  },
  isAllergyDialogOpen: false,

  // Actions
  setChildren: (children) => set({ children, isLoading: false }),
  setSelectedChild: (selectedChild) => set({ selectedChild }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsDialogOpen: (isDialogOpen) => set({ isDialogOpen }),
  setIsPending: (isPending) => set({ isPending }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setMode: (mode) => set({ mode }),
  setField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),
  setFormState: (formState) => set({ formState }),

  // CRUD operations
  addChild: (child) =>
    set((state) => ({
      children: [child, ...state.children],
    })),
  updateChild: (id, updatedChild) =>
    set((state) => ({
      children: state.children.map((child) =>
        child.id === id ? { ...child, ...updatedChild } : child
      ),
    })),
  deleteChild: (id) =>
    set((state) => ({
      children: state.children.filter((child) => child.id !== id),
    })),

  // Modal operations
  openCreateDialog: () =>
    set({
      isDialogOpen: true,
      mode: 'create',
      formData: {
        name: '',
        dob: '',
        allergies: [],
        parentId: '',
        classroomId: undefined,
      },
    }),
  openEditDialog: (child) =>
    set({
      isDialogOpen: true,
      mode: 'edit',
      formData: {
        name: child.name,
        dob: child.dob,
        allergies: [...child.allergies],
        parentId: child.parentId,
        classroomId: child.classroomId,
      },
      selectedChild: child,
    }),
  resetForm: () =>
    set({
      formData: {
        name: '',
        dob: '',
        allergies: [],
        parentId: '',
        classroomId: undefined,
      },
      formState: {
        status: 'UNSET',
        message: '',
        fieldErrors: {},
        timestamp: Date.now(),
        redirect: '',
      },
      selectedChild: null,
    }),

  // Allergy operations
  setIsAllergyDialogOpen: (isAllergyDialogOpen) => set({ isAllergyDialogOpen }),
  setCurrentAllergyEdit: (data) =>
    set((state) => ({
      currentAllergyEdit: { ...state.currentAllergyEdit, ...data },
    })),
  openAddAllergyDialog: () =>
    set({
      isAllergyDialogOpen: true,
      currentAllergyEdit: {
        index: -1,
        allergen: '',
        severity: 'Low',
        notes: '',
      },
    }),
  openEditAllergyDialog: (index) =>
    set((state) => {
      const allergy = state.formData.allergies[index];
      return {
        isAllergyDialogOpen: true,
        currentAllergyEdit: {
          index,
          allergen: allergy.allergen,
          severity: allergy.severity,
          notes: allergy.notes,
        },
      };
    }),
  saveAllergy: () =>
    set((state) => {
      const { index, allergen, severity, notes } = state.currentAllergyEdit;
      const newAllergy = { allergen, severity, notes };

      const updatedAllergies = [...state.formData.allergies];

      if (index === -1) {
        // Add new allergy
        updatedAllergies.push(newAllergy);
      } else {
        // Update existing allergy
        updatedAllergies[index] = newAllergy;
      }

      return {
        formData: { ...state.formData, allergies: updatedAllergies },
        isAllergyDialogOpen: false,
      };
    }),
  deleteAllergy: (index) =>
    set((state) => ({
      formData: {
        ...state.formData,
        allergies: state.formData.allergies.filter((_, i) => i !== index),
      },
    })),
}));
