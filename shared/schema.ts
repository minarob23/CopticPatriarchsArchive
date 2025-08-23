import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
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
  arabicName: text("arabicName"),
  orderNumber: integer("orderNumber").notNull(),
  startYear: integer("startYear").notNull(),
  endYear: integer("endYear"),
  era: text("era").notNull(), // العصر الرسولي، العصر الذهبي، عصر المجامع، عصر الاضطهاد، العصر الحديث
  contributions: text("contributions").notNull(),
  biography: text("biography"),
  heresiesFought: text("heresiesFought").notNull().default(""),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// Settings table for storing API keys and configuration
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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