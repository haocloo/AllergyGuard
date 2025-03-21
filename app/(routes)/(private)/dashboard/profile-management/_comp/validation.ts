import { z } from 'zod';

export const schema_create_child = z.object({
  id: z.string().uuid('Invalid ID'),
  name: z.string().min(1, 'Child name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  allergies: z.array(
    z.object({
      allergen: z.string().min(1, 'Allergen name is required'),
      severity: z.enum(['Low', 'Medium', 'High']),
      notes: z.string(),
    })
  ),
  parentId: z.string().uuid('Invalid parent ID'),
  classroomId: z.string().uuid('Invalid classroom ID'),
  createdAt: z.string(),
  createdBy: z.string().uuid('Invalid creator ID'),
});
