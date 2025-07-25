import { db } from "./db";
import { patriarchs } from "@shared/schema";

export const seedPatriarchs = [
  {
    name: "Saint Mark the Evangelist",
    arabicName: "القديس مرقس الرسول",
    orderNumber: 1,
    startYear: 42,
    endYear: 68,
    era: "apostolic",
    contributions: "مؤسس الكنيسة القبطية ومبشر مصر بالمسيحية، كاتب الإنجيل الثاني",
    biography: "القديس مرقس الرسول هو مؤسس الكنيسة القبطية الأرثوذكسية ومبشر مصر. وُلد في القيروان وكان أحد السبعين رسولاً. جاء إلى الإسكندرية عام 61م وأسس الكنيسة هناك.",
    heresiesFought: JSON.stringify([]),
    active: true
  },
  {
    name: "Pope Anianus",
    arabicName: "البابا أنيانوس",
    orderNumber: 2,
    startYear: 68,
    endYear: 85,
    era: "apostolic",
    contributions: "أول بطريرك بعد القديس مرقس، نظم الكنيسة وأسس المدرسة اللاهوتية",
    biography: "كان إسكافياً بسيطاً آمن على يد القديس مرقس. خلف القديس مرقس في رئاسة الكنيسة وأسس نظام الإكليريكية.",
    heresiesFought: JSON.stringify([]),
    active: true
  },
  {
    name: "Pope Athanasius I",
    arabicName: "البابا أثناسيوس الرسولي",
    orderNumber: 20,
    startYear: 328,
    endYear: 373,
    era: "golden",
    contributions: "محارب الآريوسية، لقب بـ'أبو الأرثوذكسية'، دافع عن لاهوت المسيح",
    biography: "من أعظم آباء الكنيسة، دافع عن الإيمان الأرثوذكسي ضد الهرطقات. نُفي خمس مرات بسبب دفاعه عن الإيمان.",
    heresiesFought: JSON.stringify(["Arianism"]),
    active: true
  },
  {
    name: "Pope Cyril I",
    arabicName: "البابا كيرلس الأول",
    orderNumber: 24,
    startYear: 412,
    endYear: 444,
    era: "councils",
    contributions: "حارب النسطورية، رئس مجمع أفسس، لقب بـ'عمود الدين'",
    biography: "من أعظم اللاهوتيين في تاريخ الكنيسة، دافع عن وحدة طبيعتي المسيح ضد النسطورية.",
    heresiesFought: JSON.stringify(["Nestorianism"]),
    active: true
  },
  {
    name: "Pope Dioscorus I",
    arabicName: "البابا ديسقوروس الأول",
    orderNumber: 25,
    startYear: 444,
    endYear: 454,
    era: "councils",
    contributions: "دافع عن الإيمان الأرثوذكسي في مجمع خلقيدونية، رفض التقسيم",
    biography: "خلف البابا كيرلس ودافع عن تعاليمه. رفض قرارات مجمع خلقيدونية ونُفي إلى جزيرة جاجري.",
    heresiesFought: JSON.stringify(["Chalcedonianism"]),
    active: true
  },
  {
    name: "Pope Benjamin I",
    arabicName: "البابا بنيامين الأول",
    orderNumber: 38,
    startYear: 622,
    endYear: 661,
    era: "persecution",
    contributions: "قاوم الاضطهاد البيزنطي، استقبل الفتح العربي بترحيب",
    biography: "عاش فترة الاضطهاد البيزنطي القاسي، اختبأ في الصحراء 13 عاماً. عاد بعد الفتح العربي وأعاد بناء الكنيسة.",
    heresiesFought: JSON.stringify([]),
    active: true
  },
  {
    name: "Pope Shenouda III",
    arabicName: "البابا شنودة الثالث",
    orderNumber: 117,
    startYear: 1971,
    endYear: 2012,
    era: "modern",
    contributions: "أعاد نهضة الكنيسة، أسس المعاهد اللاهوتية، طور الخدمات الكنسية",
    biography: "من أعظم البطاركة في العصر الحديث، أعاد للكنيسة القبطية مجدها وانتشارها عالمياً.",
    heresiesFought: JSON.stringify([]),
    active: true
  },
  {
    name: "Pope Tawadros II",
    arabicName: "البابا تواضروس الثاني",
    orderNumber: 118,
    startYear: 2012,
    endYear: null,
    era: "modern",
    contributions: "تطوير الكنيسة في العصر الرقمي، تعزيز الحوار المسكوني، بناء الكاتدرائية الجديدة",
    biography: "البطريرك الحالي للكنيسة القبطية الأرثوذكسية، يقود الكنيسة في عصر التحديات الحديثة والتطور التكنولوجي.",
    heresiesFought: JSON.stringify([]),
    active: true
  }
];

export async function seedDatabase() {
  try {
    console.log("جاري إدراج بيانات البطاركة...");

    // حذف البيانات الموجودة
    await db.delete(patriarchs);

    // إدراج البيانات الجديدة
    await db.insert(patriarchs).values(seedPatriarchs.map(patriarch => ({
      ...patriarch,
      heresiesFought: Array.isArray(JSON.parse(patriarch.heresiesFought))
          ? JSON.parse(patriarch.heresiesFought).join(', ')
          : (patriarch.heresiesFought as string) || '',
    })));

    console.log(`تم إدراج ${seedPatriarchs.length} بطاركة بنجاح`);
  } catch (error) {
    console.error("خطأ في إدراج البيانات:", error);
  }
}