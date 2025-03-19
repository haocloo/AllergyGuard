// external
import { create } from 'zustand';

// services
import { FormState } from '@/components/helpers/form-items';
import type { Task, TaskCategory, TaskStatus } from './types';
import type { T_File } from '@/services/types';

interface TaskStore {
  // update this after server actoin success
  tasks: Task[];
  isLoading: boolean;
  isDialogOpen: boolean;
  isPending: boolean;
  // for individual edit info
  formData: {
    name: string;
    category: TaskCategory;
    image: {
      primary: T_File;
      secondary: T_File;
    };
  };
  formState: FormState;
  sqlFilters: {
    category: string | null;
    status: string | null;
  };
  firestoreFilters: {
    category: string | null;
    status: string | null;
  };
  setTasks: (tasks: Task[]) => void;
  setIsLoading: (loading: boolean) => void;
  setIsDialogOpen: (open: boolean) => void;
  setIsPending: (pending: boolean) => void;
  setField: (field: string, value: any) => void;
  setFormState: (state: FormState) => void;
  addTask: (task: Task) => void;
  reset: () => void;
  openCreateDialog: () => void;
  deleteTask: (taskId: string) => void;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  setSqlFilter: (type: 'category' | 'status', value: string | null) => void;
  setFirestoreFilter: (type: 'category' | 'status', value: string | null) => void;
  firestoreTasks: Task[];
  setFirestoreTasks: (tasks: Task[]) => void;
  addFirestoreTask: (task: Task) => void;
  updateFirestoreTask: (id: string, updatedTask: Partial<Task>) => void;
  deleteFirestoreTask: (id: string) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  isLoading: false,
  isDialogOpen: false,
  isPending: false,
  formData: {
    name: '',
    category: 'work',
    image: {
      primary: { file: undefined, preview: '' },
      secondary: { file: undefined, preview: '' },
    },
  },
  formState: {
    status: 'UNSET',
    message: '',
    fieldErrors: {},
    timestamp: Date.now(),
    redirect: '',
  },
  sqlFilters: {
    category: null,
    status: null,
  },
  firestoreFilters: {
    category: null,
    status: null,
  },
  setTasks: (tasks) => set({ tasks, isLoading: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsDialogOpen: (isDialogOpen) => set({ isDialogOpen }),
  setIsPending: (isPending) => set({ isPending }),
  setField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),
  setFormState: (formState) => set({ formState }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  reset: () =>
    set({
      formData: {
        name: '',
        category: 'work',
        image: {
          primary: { file: undefined, preview: '' },
          secondary: { file: undefined, preview: '' },
        },
      },
      formState: {
        status: 'UNSET',
        message: '',
        fieldErrors: {},
        timestamp: Date.now(),
        redirect: '',
      },
    }),
  openCreateDialog: () => set({ isDialogOpen: true }),
  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    })),
  updateTask: (taskId, updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, ...updatedTask } : task)),
    })),
  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
    })),
  setSqlFilter: (type, value) =>
    set((state) => ({
      sqlFilters: {
        ...state.sqlFilters,
        [type]: value,
      },
    })),
  setFirestoreFilter: (type, value) =>
    set((state) => ({
      firestoreFilters: {
        ...state.firestoreFilters,
        [type]: value,
      },
    })),
  firestoreTasks: [],
  setFirestoreTasks: (tasks) => set({ firestoreTasks: tasks }),
  addFirestoreTask: (task) => set((state) => ({ firestoreTasks: [task, ...state.firestoreTasks] })),
  updateFirestoreTask: (id, updatedTask) =>
    set((state) => ({
      firestoreTasks: state.firestoreTasks.map((task) =>
        task.id === id ? { ...task, ...updatedTask } : task
      ),
    })),
  deleteFirestoreTask: (id) =>
    set((state) => ({
      firestoreTasks: state.firestoreTasks.filter((task) => task.id !== id),
    })),
}));

// #####################################################
//               AI TASK STORE
// #####################################################

interface AI_TaskStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
}

export const useAI_TaskStore = create<AI_TaskStore>((set) => ({
  tasks: [],
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updatedTask } : task)),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
  setTasks: (tasks) => set({ tasks }),
}));
