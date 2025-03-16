// db
import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  pgEnum,
  uuid,
  jsonb,
  unique,
  index,
  integer,
  boolean,
  decimal,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// external
import { z } from 'zod';

export const Translations = z.object({
  en: z.string(),
  zh: z.string(),
});

export const roleEnum = ['caretaker', 'parent', 'admin'] as const;

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  photo: text('photo').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull().$type<(typeof roleEnum)[number]>(),
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updated_at: timestamp('updated_at', { mode: 'date' }).$onUpdate(() => new Date()),
});

export const oauth_accounts = pgTable(
  'oauth_accounts',
  {
    provider: text('provider').notNull(),
    provider_user_id: text('provider_user_id').notNull(),
    access_token: text('access_token').notNull(),
    refresh_token: text('refresh_token').notNull(),
    user_id: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    primaryKey: primaryKey({ columns: [t.provider, t.provider_user_id] }),
  })
);

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});

export const taskStatusEnum = pgEnum('task_status', ['pending', 'in_progress', 'completed']);

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // work, personal, shopping, health, others
  status: taskStatusEnum('status').notNull().default('pending'),
  primaryImage: text('primary_image').notNull(),
  secondaryImage: text('secondary_image').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).$onUpdate(() => new Date()),
});

// relations
export const usersRelations = relations(users, ({ many, one }) => ({
  oauth_accounts: many(oauth_accounts),
  sessions: one(sessions, {
    fields: [users.id],
    references: [sessions.userId],
  }),
}));

export const oauth_accountsRelations = relations(oauth_accounts, ({ one }) => ({
  user: one(users, {
    fields: [oauth_accounts.user_id],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export type MyDatabase = PostgresJsDatabase<{
  users: typeof users;
  oauth_accounts: typeof oauth_accounts;
  sessions: typeof sessions;
}>;
