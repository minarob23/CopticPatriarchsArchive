import { db } from "./db";
import { patriarchs } from "@shared/schema";
import { completeOfficialPatriarchs } from "./complete-official-patriarchs";

export async function seedDatabase() {
  try {
    console.log("جاري إدراج بيانات البطاركة الـ118...");
    
    // Clear existing data
    await db.delete(patriarchs);
    
    // Insert all 118 patriarchs in order
    for (const patriarch of completeOfficialPatriarchs) {
      await db.insert(patriarchs).values(patriarch);
    }
    
    console.log(`تم إدراج ${completeOfficialPatriarchs.length} بطريرك بنجاح`);
    console.log("تمت إضافة جميع البطاركة من القديس مرقس حتى البابا تواضروس الثاني");
  } catch (error) {
    console.error("خطأ في إدراج البيانات:", error);
    throw error;
  }
}