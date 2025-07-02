
const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const patriarchsData = [];

// قراءة ملف CSV وتحويل البيانات
fs.createReadStream('./attached_assets/coptic_patriarchs_2025_1751464991874.csv')
  .pipe(csv())
  .on('data', (row) => {
    const heresiesFought = row['البدع المحاربة'] ? row['البدع المحاربة'].split(';').map(h => h.trim()) : [];
    
    patriarchsData.push({
      name: row['الاسم'],
      arabicName: row['الاسم'],
      orderNumber: parseInt(row['الرقم']),
      startYear: parseInt(row['سنة البداية']),
      endYear: row['سنة النهاية'] && row['سنة النهاية'] !== '' ? parseInt(row['سنة النهاية']) : null,
      era: row['العصر'],
      contributions: row['المساهمات'],
      biography: row['المساهمات'], // يمكن تحسينها لاحقاً
      heresiesFought: JSON.stringify(heresiesFought),
      isActive: true
    });
  })
  .on('end', async () => {
    console.log('تم قراءة', patriarchsData.length, 'بطريرك من ملف CSV');
    
    try {
      // حذف البيانات الحالية
      await pool.query('DELETE FROM patriarchs');
      console.log('تم حذف البيانات القديمة');
      
      // إدراج البيانات الجديدة
      for (const patriarch of patriarchsData) {
        await pool.query(`
          INSERT INTO patriarchs 
          (name, arabic_name, order_number, start_year, end_year, era, contributions, biography, heresies_fought, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          patriarch.name,
          patriarch.arabicName,
          patriarch.orderNumber,
          patriarch.startYear,
          patriarch.endYear,
          patriarch.era,
          patriarch.contributions,
          patriarch.biography,
          patriarch.heresiesFought,
          patriarch.isActive
        ]);
      }
      
      console.log('تم استيراد جميع البيانات بنجاح!');
      console.log('إجمالي البطاركة المستوردين:', patriarchsData.length);
      
    } catch (error) {
      console.error('خطأ في استيراد البيانات:', error);
    } finally {
      await pool.end();
    }
  });
