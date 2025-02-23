// external
import { z } from 'zod';
import { getTranslations } from 'next-intl/server';

// db
import { roleEnum } from '@/lib/drizzle/schema';

// services

// #####################################################
//               COMMON
// #####################################################

export const schema_create_file_url = z.object({
  file: typeof File === 'undefined' ? z.any().optional() : z.instanceof(File).optional(),
  preview: z.string().min(1, 'Preview URL is required'),
});

export type T_schema_create_file_url = z.infer<typeof schema_create_file_url>;

export const schema_create_translation = async () => {
  const t = await getTranslations('validation');
  return z.object({
    en: z.string().trim().min(1, t('translation.en')),
    zh: z.string().trim().min(1, t('translation.zh')),
  });
};

export const emailSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(255, 'Subject is too long'),
  html: z.string().min(1, 'Email content is required'),
});

export const telegramSchema = z.object({
  message: z.string().min(1, 'Message is required').max(4096, 'Message is too long'),
  chatId: z.string().optional(), // Optional: Override default chat ID
});

// #####################################################
//               USER VALIDATION
// #####################################################

export const schema_create_user_basic = z.object({
  provider: z.string().min(1, 'Provider is required'),
  provider_user_id: z.string().min(1, 'Provider user ID is required'),
  access_token: z.string().min(1, 'Access token is required'),
  refresh_token: z.string().min(1, 'Refresh token is required'),
  name: z
    .string()
    .min(3, 'Full name is invalid')
    .regex(/^[a-zA-Z\s]+$/, 'English name only'),
  photo: z.string().min(1, 'Photo is required'),
  phone: z
    .string()
    .trim()
    .regex(/^(01)[02-46-9][0-9]{7}$|^(01)[1][0-9]{8}$/, 'Phone format is invalid'),
  email: z.string().email('Invalid email'),
  role: z.enum(roleEnum, {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
});

export const validRoles = roleEnum;

// #####################################################
//               CONDO MANAGEMENT VALIDATION
// #####################################################

export const schema_general_ai_response = z.object({
  content: z.string().min(1, 'Response content is required'),
  role: z.enum(['assistant', 'user', 'system']),
  id: z.string().optional(),
  createdAt: z.string().optional(),
  feedback: z.string().optional(),
  sample_answer: z.string().optional(),
});

export type GeneralAIResponse = z.infer<typeof schema_general_ai_response>;
