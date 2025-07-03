
// ملف إعداد PostgreSQL لنظام Windows
import pkg from 'pg';
const { Pool } = pkg;

// إعداد الاتصال بقاعدة البيانات
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', // اتصل بقاعدة البيانات الافتراضية أولاً
  password: '123456', // ضع كلمة المرور الصحيحة هنا
  port: 5432,
});

async function setupDatabase() {
  try {
    console.log('بدء إعداد قاعدة البيانات...');
    
    // إنشاء قاعدة البيانات إذا لم تكن موجودة
    await pool.query(`CREATE DATABASE coptic_patriarchs`).catch(() => {
      console.log('قاعدة البيانات موجودة بالفعل أو تم إنشاؤها');
    });
    
    // إنشاء جدول الجلسات
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY NOT NULL,
        sess TEXT NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      );
    `);
    
    // إنشاء فهرس للجلسات
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions(expire);
    `);
    
    // إنشاء جدول المستخدمين
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        profile_image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // إنشاء جدول البطاركة
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patriarchs (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        "arabicName" TEXT,
        "orderNumber" INTEGER NOT NULL,
        "startYear" INTEGER NOT NULL,
        "endYear" INTEGER,
        era TEXT NOT NULL,
        contributions TEXT NOT NULL,
        biography TEXT,
        "heresiesFought" TEXT[] NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('تم إنشاء الجداول بنجاح!');
    console.log('يمكنك الآن تشغيل complete_patriarchs_data.js لاستيراد البيانات');
    
  } catch (error) {
    console.error('خطأ في إعداد قاعدة البيانات:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
