// This file contains: TYPES and DEFAULT values

// db
import { PgTransaction } from 'drizzle-orm/pg-core';
import { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import { ExtractTablesWithRelations } from 'drizzle-orm';
import { roleEnum } from '@/lib/drizzle/schema';

// ui
import { LucideIcon, PersonStanding, Store, User2, UserCog } from 'lucide-react';
import { z } from 'zod';

// services
import { emailSchema, telegramSchema } from '@/services/validation';

// ##########################################
//              COMMON TYPES
// ##########################################

export type tx = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof import('@/lib/drizzle/schema'),
  ExtractTablesWithRelations<typeof import('@/lib/drizzle/schema')>
>;

export type T_translation = {
  en: string;
  zh: string;
};

export type EmailSchema = z.infer<typeof emailSchema>;
export type TelegramSchema = z.infer<typeof telegramSchema>;

// ##########################################
//              USER TYPES
// ##########################################

export type T_role = (typeof roleEnum)[number];

export const T_roles: {
  label: string;
  value: T_role;
  icon: LucideIcon;
}[] = [
  {
    label: 'Admin',
    value: 'admin',
    icon: UserCog,
  },
  {
    label: 'Student',
    value: 'student',
    icon: PersonStanding,
  },
  {
    label: 'Employer',
    value: 'employer',
    icon: Store,
  },
  {
    label: 'Educator',
    value: 'educator',
    icon: User2,
  },
];

export type T_user_register_secret = {
  provider: string;
  provider_user_id: string;
  access_token: string;
  refresh_token: string;
  name: string;
  photo: string;
  phone: string;
  email: string;
  role: T_role | '';
};

export type T_user_register_form = {
  name: string;
  phone: string;
  role: T_role;
};

// ##########################################
//              NAVIGATION TYPES
// ##########################################

export type T_navItem = {
  label: string;
  children: {
    title: string;
    icon?: LucideIcon;
    items: {
      title: string;
      url: string;
      role: T_role[];
      icon?: LucideIcon;
    }[];
  }[];
};
