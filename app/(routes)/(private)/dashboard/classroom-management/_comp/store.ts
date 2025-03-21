import { create } from 'zustand';
import { Classroom } from '@/services/dummy-data';

interface ClassroomStore {
  classrooms: Classroom[];
  isLoading: boolean;
  isDialogOpen: boolean;
  setClassrooms: (classrooms: Classroom[]) => void;
  setLoading: (loading: boolean) => void;
  setDialogOpen: (open: boolean) => void;
  deleteClassroom: (id: string) => Promise<void>;
  addClassroom: (code: string) => Promise<void>;
}

export const useClassroomStore = create<ClassroomStore>((set) => ({
  classrooms: [],
  isLoading: false,
  isDialogOpen: false,
  setClassrooms: (classrooms) => set({ classrooms }),
  setLoading: (loading) => set({ isLoading: loading }),
  setDialogOpen: (open) => set({ isDialogOpen: open }),
  deleteClassroom: async (id) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set((state) => ({
      classrooms: state.classrooms.filter((classroom) => classroom.id !== id),
      isLoading: false,
    }));
  },
  addClassroom: async (code) => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const newClassroom: Classroom = {
      id: `cls-${Date.now()}`,
      code: code,
      name: `Classroom ${code}`,
      centerName: 'Sample Center',
      address: 'Sample Address',
      teacher: {
        id: `tchr-${Date.now()}`,
        name: 'New Teacher',
        phone: '12345678',
        email: 'teacher@example.com'
      }
    };

    set((state) => ({
      classrooms: [...state.classrooms, newClassroom],
      isLoading: false,
      isDialogOpen: false
    }));
  }
}));