import { GoogleGenAI } from "@google/genai";
import { storage } from "./storage";

let geminiClient: GoogleGenAI | null = null;

async function getGeminiClient(): Promise<GoogleGenAI | null> {
  if (geminiClient) return geminiClient;
  
  const apiKeySetting = await storage.getSetting('gemini_api_key');
  if (!apiKeySetting?.value) {
    return null;
  }
  
  geminiClient = new GoogleGenAI({ apiKey: apiKeySetting.value });
  return geminiClient;
}

export async function askPatriarch(question: string): Promise<string> {
  const client = await getGeminiClient();
  if (!client) {
    return "عذراً، لم يتم تكوين مفتاح API الخاص بـ Gemini. يرجى إضافة المفتاح في صفحة الإدارة.";
  }

  try {
    // Get all patriarchs data for context
    const patriarchs = await storage.getPatriarchs();
    
    // Create context from patriarchs data
    const context = patriarchs.map(p => 
      `البطريرك ${p.name} (رقم ${p.orderNumber}) - العصر: ${p.era} - الفترة: ${p.startYear}${p.endYear ? `-${p.endYear}` : '-الآن'} - المساهمات: ${p.contributions} - السيرة: ${p.biography || 'غير متوفرة'} - البدع المحاربة: ${p.heresiesFought.join(', ')}`
    ).join('\n\n');

    const systemPrompt = `أنت خبير في تاريخ الكنيسة القبطية الأرثوذكسية والبطاركة الأقباط. 
تتحدث بالعربية فقط وتجيب على الأسئلة بناءً على المعلومات التاريخية الموثقة للبطاركة الأقباط الأرثوذكس.

معلومات البطاركة المتوفرة:
${context}

قواعد الإجابة:
1. أجب بالعربية فقط
2. استخدم المعلومات المتوفرة في قاعدة البيانات
3. كن دقيقاً تاريخياً
4. إذا لم تجد معلومة محددة، اذكر ذلك بوضوح
5. قدم معلومات مفيدة وتعليمية
6. حافظ على الطابع الروحي والتاريخي المناسب`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: question,
    });

    return response.text || "عذراً، لم أتمكن من معالجة سؤالك. يرجى المحاولة مرة أخرى.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "عذراً، حدث خطأ أثناء معالجة سؤالك. يرجى التأكد من صحة مفتاح API والمحاولة مرة أخرى.";
  }
}

export async function setGeminiApiKey(apiKey: string): Promise<void> {
  await storage.setSetting('gemini_api_key', apiKey);
  geminiClient = null; // Reset client to use new API key
}

export async function testGeminiConnection(): Promise<boolean> {
  try {
    const client = await getGeminiClient();
    if (!client) return false;
    
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "اختبار الاتصال",
    });
    
    return !!response.text;
  } catch (error) {
    console.error("Gemini connection test failed:", error);
    return false;
  }
}