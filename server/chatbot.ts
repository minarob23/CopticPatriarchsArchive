
import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "./storage";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function askChatbot(question: string): Promise<string> {
  try {
    // Get all patriarchs data to provide context
    const patriarchs = await storage.getPatriarchs({});
    
    // Prepare context about patriarchs
    const patriarchsContext = patriarchs.map(p => {
      return `
البطريرك: ${p.arabicName || p.name}
الترتيب: ${p.orderNumber}
الفترة: ${p.startYear} - ${p.endYear || "الآن"} م
العصر: ${p.era}
المساهمات: ${p.contributions}
السيرة: ${p.biography || "غير متوفرة"}
البدع المحاربة: ${p.heresiesFought.join(", ") || "لا توجد"}
      `.trim();
    }).join("\n\n---\n\n");

    const systemPrompt = `
أنت مساعد ذكي متخصص في تاريخ بطاركة الكنيسة القبطية الأرثوذكسية. لديك معلومات شاملة عن جميع البطاركة عبر التاريخ.

قاعدة بيانات البطاركة المتاحة:
${patriarchsContext}

عند الإجابة:
1. استخدم المعلومات المتوفرة في قاعدة البيانات أولاً
2. أجب باللغة العربية دائماً
3. كن دقيقاً ومفصلاً في إجاباتك
4. إذا لم تجد المعلومة في قاعدة البيانات، أذكر ذلك بوضوح
5. قدم معلومات إضافية مفيدة عندما تكون متاحة
6. استخدم تنسيقاً واضحاً ومنظماً
7. كن محترماً ومتدينًا في لغتك

العصور التاريخية:
- apostolic: العصر الرسولي
- golden: العصر الذهبي  
- councils: عصر المجامع
- persecution: عصر الاضطهاد
- modern: العصر الحديث
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `السؤال: ${question}` }
    ]);

    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Error in chatbot:", error);
    return "عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى لاحقاً.";
  }
}
