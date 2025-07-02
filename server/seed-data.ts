
import { db } from "./db";
import { patriarchs } from "@shared/schema";

export const seedPatriarchs = [
  {
    name: "Saint Mark the Evangelist",
    arabicName: "القديس مرقس الرسول",
    orderNumber: 1,
    startYear: 61,
    endYear: 68,
    era: "العصر الرسولي",
    contributions: "تأسيس الكنيسة القبطية في مصر وكتابة إنجيل مرقس ونشر المسيحية في شمال أفريقيا",
    biography: "القديس مرقس الرسول هو مؤسس الكنيسة القبطية الأرثوذكسية ومبشر مصر. وُلد في القيروان وكان أحد السبعين رسولاً. جاء إلى الإسكندرية عام 61م وأسس الكنيسة هناك.",
    heresiesFought: JSON.stringify(["الوثنية الرومانية"]),
    isActive: true
  },
  {
    name: "Pope Anianus",
    arabicName: "أنيانوس",
    orderNumber: 2,
    startYear: 68,
    endYear: 85,
    era: "العصر الرسولي",
    contributions: "تنظيم الكنيسة الأولى وتثبيت الإيمان المسيحي في مصر",
    biography: "كان إسكافياً بسيطاً آمن على يد القديس مرقس. خلف القديس مرقس في رئاسة الكنيسة وأسس نظام الإكليريكية.",
    heresiesFought: JSON.stringify(["الوثنية اليونانية"]),
    isActive: true
  },
  {
    name: "Pope Avilius",
    arabicName: "أبيليوس",
    orderNumber: 3,
    startYear: 85,
    endYear: 98,
    era: "العصر الرسولي",
    contributions: "تقوية الكنيسة ونشر التعليم المسيحي",
    biography: "ثالث بطاركة الكنيسة القبطية، واصل مسيرة تقوية الإيمان المسيحي في مصر",
    heresiesFought: JSON.stringify(["الوثنية الرومانية"]),
    isActive: true
  },
  {
    name: "Pope Kedron",
    arabicName: "كدرون",
    orderNumber: 4,
    startYear: 98,
    endYear: 109,
    era: "العصر الرسولي",
    contributions: "الحفاظ على الإيمان المسيحي خلال الاضطهاد",
    biography: "قاد الكنيسة خلال فترة اضطهاد صعبة وحافظ على استمرارية الإيمان",
    heresiesFought: JSON.stringify(["الوثنية الرومانية"]),
    isActive: true
  },
  {
    name: "Pope Athanasius I",
    arabicName: "البابا أثناسيوس الرسولي",
    orderNumber: 20,
    startYear: 328,
    endYear: 373,
    era: "عصر المجامع",
    contributions: "محارب الآريوسية، لقب بـ'أبو الأرثوذكسية'، دافع عن لاهوت المسيح",
    biography: "من أعظم آباء الكنيسة، دافع عن الإيمان الأرثوذكسي ضد الهرطقات. نُفي خمس مرات بسبب دفاعه عن الإيمان.",
    heresiesFought: JSON.stringify(["الأريوسية"]),
    isActive: true
  },
  {
    name: "Pope Cyril I",
    arabicName: "البابا كيرلس الأول",
    orderNumber: 24,
    startYear: 412,
    endYear: 444,
    era: "عصر المجامع",
    contributions: "حارب النسطورية، رئس مجمع أفسس، لقب بـ'عمود الدين'",
    biography: "من أعظم اللاهوتيين في تاريخ الكنيسة، دافع عن وحدة طبيعتي المسيح ضد النسطورية.",
    heresiesFought: JSON.stringify(["النسطورية"]),
    isActive: true
  },
  {
    name: "Pope Dioscorus I",
    arabicName: "البابا ديسقوروس الأول",
    orderNumber: 25,
    startYear: 444,
    endYear: 454,
    era: "عصر المجامع",
    contributions: "دافع عن الإيمان الأرثوذكسي في مجمع خلقيدونية، رفض التقسيم",
    biography: "خلف البابا كيرلس ودافع عن تعاليمه. رفض قرارات مجمع خلقيدونية ونُفي إلى جزيرة جاجري.",
    heresiesFought: JSON.stringify(["الخلقيدونية"]),
    isActive: true
  },
  {
    name: "Pope Benjamin I",
    arabicName: "البابا بنيامين الأول",
    orderNumber: 38,
    startYear: 622,
    endYear: 661,
    era: "العصر الإسلامي المبكر",
    contributions: "قاوم الاضطهاد البيزنطي، استقبل الفتح العربي بترحيب",
    biography: "عاش فترة الاضطهاد البيزنطي القاسي، اختبأ في الصحراء 13 عاماً. عاد بعد الفتح العربي وأعاد بناء الكنيسة.",
    heresiesFought: JSON.stringify(["الخلقيدونية"]),
    isActive: true
  },
  {
    name: "Pope Cyril IV",
    arabicName: "البابا كيرلس الرابع (أبو الإصلاح)",
    orderNumber: 110,
    startYear: 1854,
    endYear: 1861,
    era: "عصر التحديث",
    contributions: "إصلاح شامل للكنيسة وتأسيس التعليم الحديث",
    biography: "أدخل إصلاحات جذرية على الكنيسة وأسس المدارس الحديثة والمطبعة القبطية",
    heresiesFought: JSON.stringify(["الخلقيدونية"]),
    isActive: true
  },
  {
    name: "Pope Shenouda III",
    arabicName: "البابا شنودة الثالث",
    orderNumber: 117,
    startYear: 1971,
    endYear: 2012,
    era: "العصر المعاصر",
    contributions: "أعاد نهضة الكنيسة، أسس المعاهد اللاهوتية، طور الخدمات الكنسية",
    biography: "من أعظم البطاركة في العصر الحديث، أعاد للكنيسة القبطية مجدها وانتشارها عالمياً.",
    heresiesFought: JSON.stringify(["الخلقيدونية", "البروتستانتية", "العلمانية"]),
    isActive: true
  },
  {
    name: "Pope Tawadros II",
    arabicName: "البابا تواضروس الثاني",
    orderNumber: 118,
    startYear: 2012,
    endYear: null,
    era: "العصر المعاصر",
    contributions: "تطوير الكنيسة في العصر الرقمي، تعزيز الحوار المسكوني، بناء الكاتدرائية الجديدة",
    biography: "البطريرك الحالي للكنيسة القبطية الأرثوذكسية، يقود الكنيسة في عصر التحديات الحديثة والتطور التكنولوجي.",
    heresiesFought: JSON.stringify(["الخلقيدونية", "البروتستانتية", "العلمانية", "الإلحاد"]),
    isActive: true
  }
];

export async function seedDatabase() {
  try {
    console.log("جاري إدراج بيانات البطاركة...");
    
    // حذف البيانات الموجودة
    await db.delete(patriarchs);
    
    // إدراج البيانات الجديدة
    await db.insert(patriarchs).values(seedPatriarchs);
    
    console.log(`تم إدراج ${seedPatriarchs.length} بطاركة بنجاح`);
  } catch (error) {
    console.error("خطأ في إدراج البيانات:", error);
  }
}
