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
export const validateCaretakerForm = (data: CaretakerFormData) => {
  try {
    caretakerSchema.parse(data);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path) {
          errors[err.path[0]] = err.message;
        }
      });
      return errors;
    }
    return false;
  }
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
    createdAt: new Date().toISOString(),
  };
};
