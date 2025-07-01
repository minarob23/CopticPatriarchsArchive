// ملف لاستيراد بيانات البطاركة محلياً
import fs from 'fs';
import { Pool } from 'pg';
import Database from 'better-sqlite3';

// اختر نوع قاعدة البيانات
const USE_SQLITE = process.env.USE_SQLITE === 'true';

// بيانات البطاركة الـ 118
const patriarchsData = [
  {
    name: 'Saint Mark the Apostle',
    arabic_name: 'القديس مرقس الرسول',
    order_number: 1,
    start_year: 61,
    end_year: 68,
    era: 'العصر الرسولي',
    contributions: 'تأسيس الكنيسة القبطية في مصر، كتابة إنجيل مرقس، نشر المسيحية في شمال أفريقيا',
    biography: 'مؤسس الكنيسة القبطية الأرثوذكسية، استشهد في الإسكندرية عام 68م',
    heresies_fought: ['الوثنية الرومانية'],
    is_active: true
  },
  // يمكن إضافة باقي البطاركة هنا...
  // أو قراءة من ملف CSV
];

async function importToPostgreSQL() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('بدء استيراد البيانات إلى PostgreSQL...');
    
    for (const patriarch of patriarchsData) {
      await pool.query(`
        INSERT INTO patriarchs (name, arabic_name, order_number, start_year, end_year, era, contributions, biography, heresies_fought, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        patriarch.name,
        patriarch.arabic_name,
        patriarch.order_number,
        patriarch.start_year,
        patriarch.end_year,
        patriarch.era,
        patriarch.contributions,
        patriarch.biography,
        patriarch.heresies_fought,
        patriarch.is_active
      ]);
    }
    
    console.log('تم استيراد البيانات بنجاح!');
  } catch (error) {
    console.error('خطأ في استيراد البيانات:', error);
  } finally {
    await pool.end();
  }
}

function importToSQLite() {
  const db = new Database('./local.db');
  
  try {
    console.log('بدء استيراد البيانات إلى SQLite...');
    
    // إنشاء الجدول
    db.exec(`
      CREATE TABLE IF NOT EXISTS patriarchs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        arabic_name TEXT,
        order_number INTEGER NOT NULL,
        start_year INTEGER NOT NULL,
        end_year INTEGER,
        era TEXT NOT NULL,
        contributions TEXT,
        biography TEXT,
        heresies_fought TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const insert = db.prepare(`
      INSERT INTO patriarchs (name, arabic_name, order_number, start_year, end_year, era, contributions, biography, heresies_fought, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const patriarch of patriarchsData) {
      insert.run(
        patriarch.name,
        patriarch.arabic_name,
        patriarch.order_number,
        patriarch.start_year,
        patriarch.end_year,
        patriarch.era,
        patriarch.contributions,
        patriarch.biography,
        JSON.stringify(patriarch.heresies_fought),
        patriarch.is_active
      );
    }
    
    console.log('تم استيراد البيانات بنجاح!');
  } catch (error) {
    console.error('خطأ في استيراد البيانات:', error);
  } finally {
    db.close();
  }
}

// تشغيل الاستيراد
if (USE_SQLITE) {
  importToSQLite();
} else {
  importToPostgreSQL();
}