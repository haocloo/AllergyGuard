import { z } from 'zod';

// Class validation schema
export const classroomSchema = z.object({
  name: z.string().min(1, 'Classroom name is required').max(100, 'Name is too long'),
  accessCode: z
    .string()
    .min(4, 'Access code must be at least 4 characters')
    .max(10, 'Access code is too long'),
});

// Child profile validation schema
export const childSchema = z.object({
  name: z.string().min(1, 'Child name is required').max(100, 'Name is too long'),
  dob: z.string().min(1, 'Date of birth is required'),
  // Allergies will be validated separately
  parentId: z.string().optional(),
  classroomId: z.string().optional(),
});

// Allergy validation schema
export const allergySchema = z.object({
  allergen: z.string().min(1, 'Allergen name is required'),
  severity: z.enum(['Low', 'Medium', 'High']),
  notes: z.string().max(500, 'Notes are too long'),
});

// Email validation for linking child to parent
export const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});
