import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  serial,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(), // JSON as text
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Patriarchs table
export const patriarchs = pgTable("patriarchs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  arabicName: text("arabic_name"),
  orderNumber: integer("order_number").notNull(),
  startYear: integer("start_year").notNull(),
  endYear: integer("end_year"),
  era: text("era").notNull(), // apostolic, golden, councils, persecution, modern
  contributions: text("contributions").notNull(),
  biography: text("biography"),
  heresiesFought: text("heresies_fought").notNull().default("[]"), // JSON array as text
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Settings table for storing API keys and configuration
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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