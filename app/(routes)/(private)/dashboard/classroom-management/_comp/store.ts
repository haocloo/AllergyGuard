import { create } from 'zustand';
import type { Classroom } from './types';

interface ClassroomStore {
  classrooms: Classroom[];
  isLoading: boolean;
  isCreateDialogOpen: boolean;
  setClassrooms: (classrooms: Classroom[]) => void;
  addClassroom: (classroom: Classroom) => void;
  updateClassroom: (id: string, data: Partial<Classroom>) => void;
  deleteClassroom: (id: string) => void;
  setCreateDialogOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useClassroomStore = create<ClassroomStore>((set) => ({
  classrooms: [],
  isLoading: false,
  isCreateDialogOpen: false,
  setClassrooms: (classrooms) =>
    set({
      classrooms: classrooms.map((classroom) => ({
        ...classroom,
        children: Array.isArray(classroom.children) ? classroom.children : [],
        allergenAlerts: Array.isArray(classroom.allergenAlerts) ? classroom.allergenAlerts : [],
      })),
    }),
  addClassroom: (classroom) =>
    set((state) => ({
      classrooms: [
        ...state.classrooms,
        {
          ...classroom,
          children: Array.isArray(classroom.children) ? classroom.children : [],
          allergenAlerts: Array.isArray(classroom.allergenAlerts) ? classroom.allergenAlerts : [],
        },
      ],
    })),
  updateClassroom: (id, data) =>
    set((state) => ({
      classrooms: state.classrooms.map((classroom) =>
        classroom.id === id ? { ...classroom, ...data } : classroom
      ),
    })),
  deleteClassroom: (id) =>
    set((state) => ({
      classrooms: state.classrooms.filter((classroom) => classroom.id !== id),
    })),
  setCreateDialogOpen: (open) => set({ isCreateDialogOpen: open }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
