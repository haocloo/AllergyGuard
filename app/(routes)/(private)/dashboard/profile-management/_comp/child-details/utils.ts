// utils.ts - For shared utilities
import { z } from 'zod';

// Validation schema for caretaker form
export const caretakerSchema = z.object({
  type: z.enum(['personal', 'center']),
  userId: z.string().optional(),
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: z.string().optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  noteToCaretaker: z.string().optional(),
});

// Helper functions for caretaker management
export const validateCaretakerForm = (formData: any, setFormErrors: (errors: any) => void) => {
  try {
    caretakerSchema.parse(formData);
    setFormErrors({});
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path) {
          errors[err.path[0]] = err.message;
        }
      });
      setFormErrors(errors);
    }
    return false;
  }
};

export const createTempCaretaker = (data: CaretakerFormData): TempCaretaker => {
  // Creation logic
};
