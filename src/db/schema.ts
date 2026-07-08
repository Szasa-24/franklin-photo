import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const schools = pgTable('schools', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  passwordPlain: text('password_plain'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const photos = pgTable('photos', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id')
    .references(() => schools.id)
    .notNull(),
  originalPath: text('original_path').notNull(),
  thumbnailPath: text('thumbnail_path').notNull(),
  filename: text('filename').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const schoolsRelations = relations(schools, ({ many }) => ({
  photos: many(photos),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  school: one(schools, {
    fields: [photos.schoolId],
    references: [schools.id],
  }),
}));
