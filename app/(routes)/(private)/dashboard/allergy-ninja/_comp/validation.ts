import { z } from 'zod';

export const schema_select_profile = z.object({
  childId: z.string().min(1, {
    message: 'Please select a child profile',
  }),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export const schema_save_game_result = z.object({
  childId: z.string().min(1),
  score: z.number().int().nonnegative(),
  safeItemsSliced: z.number().int().nonnegative(),
  allergenItemsSliced: z.number().int().nonnegative(),
  totalItemsSliced: z.number().int().nonnegative(),
});

export const schema_update_badges = z.object({
  childId: z.string().min(1),
  badgeId: z.string().min(1),
}); 