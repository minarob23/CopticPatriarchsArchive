import {
  users,
  patriarchs,
  settings,
  type User,
  type UpsertUser,
  type Patriarch,
  type InsertPatriarch,
  type UpdatePatriarch,
  type Setting,
  type InsertSetting,
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, inArray, desc } from "drizzle-orm";

export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Patriarch operations
  getPatriarchs(filters?: {
    searchQuery?: string;
    era?: string;
    heresies?: string[];
  }): Promise<Patriarch[]>;
  getPatriarch(id: number): Promise<Patriarch | undefined>;
  createPatriarch(patriarch: InsertPatriarch): Promise<Patriarch>;
  updatePatriarch(id: number, patriarch: UpdatePatriarch): Promise<Patriarch | undefined>;
  deletePatriarch(id: number): Promise<boolean>;
  getPatriarchStats(): Promise<{
    total: number;
    byEra: Record<string, number>;
    totalDefenders: number;
  }>;
  
  // Settings operations
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(key: string, value: string): Promise<Setting>;
}

export class DatabaseStorage implements IStorage {
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Patriarch operations
  async getPatriarchs(filters?: {
    searchQuery?: string;
    era?: string;
    heresies?: string[];
  }): Promise<Patriarch[]> {
    const conditions = [eq(patriarchs.isActive, true)];

    if (filters?.searchQuery) {
      conditions.push(ilike(patriarchs.name, `%${filters.searchQuery}%`));
    }

    if (filters?.era && filters.era !== "all") {
      conditions.push(eq(patriarchs.era, filters.era));
    }

    if (filters?.heresies && filters.heresies.length > 0) {
      // Check if any of the patriarch's heresies match the filter
      conditions.push(
        // This is a simplified approach - in production you might want a more sophisticated array query
        inArray(patriarchs.era, filters.heresies)
      );
    }

    return await db
      .select()
      .from(patriarchs)
      .where(and(...conditions))
      .orderBy(patriarchs.orderNumber);
  }

  async getPatriarch(id: number): Promise<Patriarch | undefined> {
    const [patriarch] = await db
      .select()
      .from(patriarchs)
      .where(and(eq(patriarchs.id, id), eq(patriarchs.isActive, true)));
    return patriarch;
  }

  async createPatriarch(patriarch: InsertPatriarch): Promise<Patriarch> {
    const [created] = await db
      .insert(patriarchs)
      .values({
        ...patriarch,
        heresiesFought: patriarch.heresiesFought || []
      })
      .returning();
    return created;
  }

  async updatePatriarch(id: number, patriarch: UpdatePatriarch): Promise<Patriarch | undefined> {
    const [updated] = await db
      .update(patriarchs)
      .set({ ...patriarch, updatedAt: new Date() })
      .where(and(eq(patriarchs.id, id), eq(patriarchs.isActive, true)))
      .returning();
    return updated;
  }

  async deletePatriarch(id: number): Promise<boolean> {
    const [deleted] = await db
      .update(patriarchs)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(patriarchs.id, id))
      .returning();
    return !!deleted;
  }

  async getPatriarchStats(): Promise<{
    total: number;
    byEra: Record<string, number>;
    totalDefenders: number;
  }> {
    const allPatriarchs = await db
      .select()
      .from(patriarchs)
      .where(eq(patriarchs.isActive, true));

    const total = allPatriarchs.length;
    const byEra: Record<string, number> = {};
    let totalDefenders = 0;

    allPatriarchs.forEach(p => {
      byEra[p.era] = (byEra[p.era] || 0) + 1;
      if (p.heresiesFought.length > 0) {
        totalDefenders++;
      }
    });

    return { total, byEra, totalDefenders };
  }

  // Settings operations
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key));
    return setting;
  }

  async setSetting(key: string, value: string): Promise<Setting> {
    const [setting] = await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() }
      })
      .returning();
    return setting;
  }
}

export const storage = new DatabaseStorage();
