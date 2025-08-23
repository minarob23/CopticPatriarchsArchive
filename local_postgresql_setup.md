
# إعداد PostgreSQL المحلي

## 1. تثبيت PostgreSQL

### Windows:
- حمل من https://www.postgresql.org/download/windows/
- اتبع معالج التثبيت واحفظ كلمة المرور

### macOS:
```bash
brew install postgresql
brew services start postgresql
```

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 2. إنشاء قاعدة البيانات

```sql
-- دخول إلى PostgreSQL
psql -U postgres

-- إنشاء قاعدة بيانات جديدة
CREATE DATABASE coptic_patriarchs;

-- إنشاء مستخدم جديد (اختياري)
CREATE USER patriarchs_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE coptic_patriarchs TO patriarchs_user;

-- التبديل إلى قاعدة البيانات
\c coptic_patriarchs;
```

## 3. تحديث ملف .env.local

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/coptic_patriarchs
NODE_ENV=development
```

## 4. تشغيل المشروع

```bash
npm install
npm run dev
```

## حل مشاكل الاتصال الشائعة

### 1. خطأ في الاتصال:
- تأكد من أن PostgreSQL يعمل
- تحقق من صحة DATABASE_URL
- تأكد من أن المنفذ 5432 مفتوح

### 2. خطأ في الصلاحيات:
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

### 3. إعادة تشغيل PostgreSQL:
```bash
# Windows
net stop postgresql-x64-XX
net start postgresql-x64-XX

# macOS
brew services restart postgresql

# Ubuntu/Debian
sudo systemctl restart postgresql
```
