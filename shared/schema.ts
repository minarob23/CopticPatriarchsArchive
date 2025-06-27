import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Patriarchs table
export const patriarchs = pgTable("patriarchs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  orderNumber: integer("order_number").notNull(),
  startYear: integer("start_year").notNull(),
  endYear: integer("end_year"),
  era: varchar("era").notNull(), // apostolic, golden, councils, persecution, modern
  contributions: text("contributions").notNull(),
  biography: text("biography"),
  heresiesFought: text("heresies_fought").array().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
