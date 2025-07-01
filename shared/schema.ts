
import {
  sqliteTable,
  text,
  integer,
  blob,
  index,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(), // JSON as text in SQLite
    expire: integer("expire", { mode: 'timestamp' }).notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(new Date()),
});

// Patriarchs table
export const patriarchs = sqliteTable("patriarchs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  arabicName: text("arabic_name"),
  orderNumber: integer("order_number").notNull(),
  startYear: integer("start_year").notNull(),
  endYear: integer("end_year"),
  era: text("era").notNull(), // apostolic, golden, councils, persecution, modern
  contributions: text("contributions").notNull(),
  biography: text("biography"),
  heresiesFought: text("heresies_fought").notNull().default("[]"), // JSON array as text
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(new Date()),
});

// Settings table for storing API keys and configuration
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(new Date()),
});

export const insertPatriarchSchema = createInsertSchema(patriarchs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePatriarchSchema = insertPatriarchSchema.partial();

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Patriarch = typeof patriarchs.$inferSelect;
export type InsertPatriarch = z.infer<typeof insertPatriarchSchema>;
export type UpdatePatriarch = z.infer<typeof updatePatriarchSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;
