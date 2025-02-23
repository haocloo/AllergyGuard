import { z } from 'zod';
import { schema_create_file_url } from '@/services/validation';

export const schema_create_task = z.object({
  id: z.string().uuid('Invalid ID'),
  name: z.string().min(1, 'Task name is required'),
  userId: z.string().uuid('Invalid user ID'),
  category: z.enum(['work', 'personal', 'shopping', 'health', 'others'], {
    required_error: 'Category is required',
  }),
  status: z.enum(['pending', 'in_progress', 'completed']),
  primaryImage: schema_create_file_url.refine(
    (data) => data.file || data.preview,
    'Primary image is required'
  ),
  secondaryImage: schema_create_file_url.refine(
    (data) => data.file || data.preview,
    'Secondary image is required'
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
});
