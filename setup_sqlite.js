import Database from 'better-sqlite3';
import fs from 'fs';

// Create SQLite database file
const db = new Database('./local.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expire DATETIME NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS patriarchs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    arabicName TEXT,
    orderNumber INTEGER NOT NULL,
    startYear INTEGER NOT NULL,
    endYear INTEGER,
    era TEXT NOT NULL,
    contributions TEXT NOT NULL,
    biography TEXT,
    heresiesFought TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
  );
`);

console.log('✅ SQLite database created successfully!');

// Import patriarch data
const patriarchsData = [
  {
    name: 'Saint Mark the Apostle',
    arabicName: 'القديس مرقس الرسول',
    orderNumber: 1,
    startYear: 61,
    endYear: 68,
    era: 'العصر الرسولي',
    contributions: 'تأسيس الكنيسة القبطية في مصر وكتابة إنجيل مرقس ونشر المسيحية في شمال أفريقيا',
    biography: 'مؤسس الكنيسة القبطية الأرثوذكسية، جاء إلى الإسكندرية عام 61م، استشهد في الإسكندرية عام 68م',
    heresiesFought: JSON.stringify(['الوثنية الرومانية']),
    active: true
  },
  {
    name: 'Anianus',
    arabicName: 'أنيانوس',
    orderNumber: 2,
    startYear: 68,
    endYear: 85,
    era: 'العصر الرسولي',
    contributions: 'تنظيم الكنيسة الأولى وتثبيت الإيمان المسيحي في مصر',
    biography: 'أول أسقف عين من قبل القديس مرقس، استمر البناء على أسس الكنيسة المسيحية',
    heresiesFought: JSON.stringify(['الوثنية اليونانية']),
    active: true
  }
  // Add more patriarchs as needed
];

// Insert patriarch data
const insertPatriarch = db.prepare(`
  INSERT OR REPLACE INTO patriarchs 
  (name, arabicName, orderNumber, startYear, endYear, era, contributions, biography, heresiesFought, active)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const patriarch of patriarchsData) {
  insertPatriarch.run(
    patriarch.name,
    patriarch.arabicName,
    patriarch.orderNumber,
    patriarch.startYear,
    patriarch.endYear,
    patriarch.era,
    patriarch.contributions,
    patriarch.biography,
    patriarch.heresiesFought,
    patriarch.active
  );
}

console.log(`✅ Imported ${patriarchsData.length} patriarch records`);
db.close();