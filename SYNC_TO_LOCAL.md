# مزامنة مشروع بطاركة الكنيسة من Replit إلى الجهاز المحلي

## 🚨 المشكلة: جهازك يظهر نسخة قديمة مختلفة

## ✅ الحل: نسخ كل شيء من Replit

### **الخطوة الأولى: الملفات الحرجة (انسخها أولاً)**

#### 1. ملفات الجذر:
```
📄 package.json ← نسخ كامل من Replit
📄 vite.config.ts ← إعدادات البناء
📄 tailwind.config.ts ← تصميم CSS
📄 .env.local ← بيانات الاتصال
```

#### 2. الصفحة الرئيسية (الأهم!):
```
📄 client/src/pages/home.tsx ← هذا سبب الاختلاف!
```

#### 3. قاعدة البيانات:
```
📄 shared/schema.ts ← هيكل قاعدة البيانات
📄 server/storage.ts ← استعلامات البحث
📄 server/routes.ts ← واجهة برمجة التطبيقات
```

#### 4. المكونات الحديثة:
```
📁 client/src/components/ ← كل المجلد
📁 client/src/hooks/ ← كل المجلد  
📁 client/src/lib/ ← كل المجلد
```

### **الخطوة الثانية: نسخ البيانات**

#### نسخ مجلد backups كاملاً:
```
📁 backups/
├── patriarchs_data_2025-08-21_22-37-00.csv
├── patriarchs_data_2025-08-21_22-37-00.sql
├── database_schema_2025-08-21_22-37-00.sql
└── BACKUP_SUMMARY.md
```

### **الخطوة الثالثة: تشغيل المشروع**

```bash
# 1. تنصيب التبعيات
npm install

# 2. إنشاء قاعدة البيانات
createdb coptic_patriarchs

# 3. استيراد البيانات
psql -d coptic_patriarchs -f backups/database_schema_2025-08-21_22-37-00.sql
psql -d coptic_patriarchs -f backups/patriarchs_data_2025-08-21_22-37-00.sql

# 4. تحديث المخطط
npm run db:push

# 5. تشغيل التطبيق
npm run dev
```

### **ملف .env.local المطلوب:**
```
DATABASE_URL=postgresql://postgres:كلمة_السر@localhost:5432/coptic_patriarchs
GEMINI_API_KEY=your_key_here
SESSION_SECRET=local-secret-key
NODE_ENV=development
PORT=5000
```

## **ما ستراه بعد النسخ:**
✅ نفس التصميم الأزرق البنفسجي
✅ 118 بطريرك كامل  
✅ البحث بالعربية يعمل
✅ زر "البطاقات" و"الخط الزمني" و"الإحصائيات"
✅ البحث عن "شنوده" يظهر النتائج
✅ فلاتر البدع المحاربة (الأريوسية في المقدمة)

## **طريقة سريعة:**
1. في Replit: Files → Right Click → Download as ZIP
2. فك الضغط واستبدل مشروعك المحلي
3. تشغيل الأوامر أعلاه

## **التحقق من النجاح:**
افتح http://localhost:5000 ويجب أن ترى نفس ما في Replit تماماً!