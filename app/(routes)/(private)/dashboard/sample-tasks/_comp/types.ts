import { z } from 'zod';
import { schema_create_task } from './validation';

export type T_schema_create_task = z.infer<typeof schema_create_task>;
export type TaskCategory = 'work' | 'personal' | 'shopping' | 'health' | 'others';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export type ImageUpload = {
  file?: File | null;
  preview: string;
};

export type Task = {
  id: string;
  name: string;
  category: string;
  status: string;
  primaryImage: string;
  secondaryImage: string;
  createdAt: string;
};

export type TaskFormData = {
  name: string;
  category: TaskCategory;
  status: TaskStatus;
  image: {
    primary: ImageUpload;
    secondary: ImageUpload;
  };
};

export const CATEGORIES = [
  { value: 'work' as TaskCategory, label: 'Work' },
  { value: 'personal' as TaskCategory, label: 'Personal' },
  { value: 'shopping' as TaskCategory, label: 'Shopping' },
  { value: 'health' as TaskCategory, label: 'Health' },
  { value: 'others' as TaskCategory, label: 'Others' },
] as const;
