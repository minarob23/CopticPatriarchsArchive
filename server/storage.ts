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
import { eq, ilike, and, inArray, desc, or, like, asc } from "drizzle-orm";

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
  getPatriarchByName(name: string): Promise<Patriarch | undefined>;

  // Settings operations
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(key: string, value: string): Promise<Setting>;
  updateSetting(key: string, value: string): Promise<void>;
  deleteSetting(key: string): Promise<void>;

  // Swap patriarch order numbers
  swapPatriarchOrder(patriarch1Id: number, patriarch2Id: number): Promise<boolean>;
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
    try {
      // Build all conditions first
      const conditions = [eq(patriarchs.active, true)];

      // Add search condition if provided
      if (filters?.searchQuery && filters.searchQuery.trim()) {
        const searchTerm = `%${filters.searchQuery.trim()}%`;
        conditions.push(
          or(
            ilike(patriarchs.name, searchTerm),
            ilike(patriarchs.arabicName, searchTerm),
            ilike(patriarchs.biography, searchTerm),
            ilike(patriarchs.contributions, searchTerm)
          )!
        );
      }

      // Add era filter if provided
      if (filters?.era && filters.era !== "all") {
        conditions.push(eq(patriarchs.era, filters.era));
      }

      // Add heresies filter if provided
      if (filters?.heresies && filters.heresies.length > 0) {
        const heresyConditions = filters.heresies
          .filter(heresy => heresy && heresy.trim())
          .map(heresy => {
            const trimmedHeresy = heresy.trim();
            return or(
              like(patriarchs.heresiesFought, `%"${trimmedHeresy}"%`),
              like(patriarchs.heresiesFought, `%${trimmedHeresy}%`),
              like(patriarchs.heresiesFought, `{${trimmedHeresy}%`),
              like(patriarchs.heresiesFought, `%,${trimmedHeresy},%`),
              like(patriarchs.heresiesFought, `%${trimmedHeresy}}`)
            );
          });

        if (heresyConditions.length > 0) {
          conditions.push(or(...heresyConditions)!);
        }
      }

      // Build and execute query with all conditions
      const result = await db
        .select()
        .from(patriarchs)
        .where(and(...conditions))
        .orderBy(patriarchs.orderNumber);

      return result;
    } catch (error) {
      console.error("Error fetching patriarchs:", error);
      throw error;
    }
  }

  async getPatriarch(id: number): Promise<Patriarch | undefined> {
    const [patriarch] = await db
      .select()
      .from(patriarchs)
      .where(and(eq(patriarchs.id, id), eq(patriarchs.active, true)));
    return patriarch;
  }

  async createPatriarch(patriarch: InsertPatriarch): Promise<Patriarch> {
    try {
      // Check if we're dealing with PostgreSQL local setup
      const isLocal = process.env.NODE_ENV === 'development' && process.env.DATABASE_URL?.includes('localhost');

      // Format heresiesFought based on environment
      let heresiesFought = patriarch.heresiesFought || "";

      if (isLocal) {
        // For local PostgreSQL, convert to PostgreSQL array format
        if (Array.isArray(patriarch.heresiesFought)) {
          // Convert array to PostgreSQL array format: {"item1","item2"}
          heresiesFought = `{${patriarch.heresiesFought.map(h => `"${h.replace(/"/g, '\\"')}"`).join(',')}}`;
        } else if (typeof patriarch.heresiesFought === 'string') {
          try {
            // Try to parse as JSON first
            const parsed = JSON.parse(patriarch.heresiesFought);
            if (Array.isArray(parsed)) {
              heresiesFought = `{${parsed.map(h => `"${h.replace(/"/g, '\\"')}"`).join(',')}}`;
            } else {
              heresiesFought = `{"${patriarch.heresiesFought.replace(/"/g, '\\"')}"}`;
            }
          } catch (e) {
            // If not JSON, treat as single string
            heresiesFought = `{"${patriarch.heresiesFought.replace(/"/g, '\\"')}"}`;
          }
        }
      } else {
        // For Replit/Neon, keep as JSON string
        if (Array.isArray(patriarch.heresiesFought)) {
          heresiesFought = JSON.stringify(patriarch.heresiesFought);
        } else {
          heresiesFought = patriarch.heresiesFought || "";
        }
      }

      const values = {
        name: patriarch.name,
        arabicName: patriarch.arabicName,
        orderNumber: patriarch.orderNumber,
        startYear: patriarch.startYear,
        endYear: patriarch.endYear,
        era: patriarch.era,
        contributions: patriarch.contributions,
        biography: patriarch.biography,
        heresiesFought,
        active: patriarch.active ?? true
      };
      const [created] = await db
        .insert(patriarchs)
        .values(values)
        .returning();
      return created;
    } catch (error) {
      console.error('Error creating patriarch:', error);
      console.error('Insert data:', patriarch);
      throw new Error(`Failed to create patriarch: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updatePatriarch(id: number, patriarch: UpdatePatriarch): Promise<Patriarch | undefined> {
    try {
      // Check if we're dealing with PostgreSQL local setup
      const isLocal = process.env.NODE_ENV === 'development' && process.env.DATABASE_URL?.includes('localhost');

      // Format heresiesFought based on environment
      let heresiesFought = patriarch.heresiesFought || "";

      if (isLocal) {
        // For local PostgreSQL, convert to PostgreSQL array format
        if (Array.isArray(patriarch.heresiesFought)) {
          // Convert array to PostgreSQL array format: {"item1","item2"}
          heresiesFought = `{${patriarch.heresiesFought.map(h => `"${h.replace(/"/g, '\\"')}"`).join(',')}}`;
        } else if (typeof patriarch.heresiesFought === 'string') {
          try {
            // Try to parse as JSON first
            const parsed = JSON.parse(patriarch.heresiesFought);
            if (Array.isArray(parsed)) {
              heresiesFought = `{${parsed.map(h => `"${h.replace(/"/g, '\\"')}"`).join(',')}}`;
            } else {
              heresiesFought = `{"${patriarch.heresiesFought.replace(/"/g, '\\"')}"}`;
            }
          } catch (e) {
            // If not JSON, treat as single string
            heresiesFought = `{"${patriarch.heresiesFought.replace(/"/g, '\\"')}"}`;
          }
        }
      } else {
        // For Replit/Neon, keep as JSON string
        if (Array.isArray(patriarch.heresiesFought)) {
          heresiesFought = JSON.stringify(patriarch.heresiesFought);
        } else {
          heresiesFought = patriarch.heresiesFought || "";
        }
      }

      const updateData = {
        ...patriarch,
        heresiesFought,
        updatedAt: new Date()
      };

      const [updated] = await db
        .update(patriarchs)
        .set(updateData)
        .where(and(eq(patriarchs.id, id), eq(patriarchs.active, true)))
        .returning();
      return updated;
    } catch (error) {
      console.error('Error updating patriarch:', error);
      console.error('Update data:', patriarch);
      throw new Error(`Failed to update patriarch: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async deletePatriarch(id: number): Promise<boolean> {
    try {
      const [deleted] = await db
        .update(patriarchs)
        .set({ active: false, updatedAt: new Date() })
        .where(eq(patriarchs.id, id))
        .returning();
      return !!deleted;
    } catch (error) {
      console.error('Error deleting patriarch:', error);
      throw new Error('Failed to delete patriarch');
    }
  }

  async getPatriarchByName(name: string): Promise<Patriarch | undefined> {
    const searchName = name.toLowerCase().trim();

    const [patriarch] = await db
      .select()
      .from(patriarchs)
      .where(
        and(
          eq(patriarchs.active, true),
          or(
            ilike(patriarchs.name, `%${searchName}%`),
            ilike(patriarchs.arabicName, `%${searchName}%`)
          )
        )
      )
      .limit(1);

    return patriarch;
  }

  async getPatriarchStats(): Promise<{
    total: number;
    byEra: Record<string, number>;
    totalDefenders: number;
  }> {
    const allPatriarchs = await db
      .select()
      .from(patriarchs)
      .where(eq(patriarchs.active, true));

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
      .where(eq(settings.key, key))
      .limit(1);
    return setting;
  }

  async setSetting(key: string, value: string): Promise<Setting> {
    try {
      // Use upsert with ON CONFLICT for PostgreSQL
      const [result] = await db
        .insert(settings)
        .values({
          key,
          value,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: settings.key,
          set: {
            value: value,
            updatedAt: new Date()
          }
        })
        .returning();

      return result;
    } catch (error) {
      console.error('Error in setSetting:', error);
      throw error;
    }
  }

  async updateSetting(key: string, value: string): Promise<void> {
    await db.insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() }
      });
  }

  async deleteSetting(key: string): Promise<void> {
    await db.delete(settings).where(eq(settings.key, key));
  }

  async swapPatriarchOrder(patriarch1Id: number, patriarch2Id: number): Promise<boolean> {
    try {
      // Get the two patriarchs
      const patriarch1 = await db.select().from(patriarchs).where(eq(patriarchs.id, patriarch1Id));
      const patriarch2 = await db.select().from(patriarchs).where(eq(patriarchs.id, patriarch2Id));

      if (patriarch1.length === 0 || patriarch2.length === 0) {
        return false;
      }

      const order1 = patriarch1[0].orderNumber;
      const order2 = patriarch2[0].orderNumber;

      // Swap the order numbers
      await db.update(patriarchs).set({ orderNumber: order2 }).where(eq(patriarchs.id, patriarch1Id));
      await db.update(patriarchs).set({ orderNumber: order1 }).where(eq(patriarchs.id, patriarch2Id));

      return true;
    } catch (error) {
      console.error('Error swapping patriarch order:', error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();