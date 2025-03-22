// utils.ts - For shared utilities
import { z } from 'zod';
import type { CaretakerFormData, TempCaretaker } from './types';

// Validation schema for caretaker form
export const caretakerSchema = z.object({
  type: z.enum(['personal', 'center']),
  userId: z.string().optional(),
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: z.string().optional(),
  phone: z.string().optional(),
  noteToCaretaker: z.string().optional(),
});

// Helper functions for caretaker management
export const validateCaretakerForm = (data: CaretakerFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (!data.phone?.trim()) {
    errors.phone = 'Phone number is required';
  }

  if (!data.role?.trim()) {
    errors.role = 'Role is required';
  }

  return errors;
};

export const createTempCaretaker = (data: CaretakerFormData): TempCaretaker => {
  return {
    id: `temp_${Date.now()}`,
    type: data.type,
    name: data.name,
    email: data.email,
    role: data.role,
    phone: data.phone,
    notes: data.noteToCaretaker,
  };
};
