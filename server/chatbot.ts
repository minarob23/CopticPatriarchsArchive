
import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "./storage";

export class ChatbotService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    this.initializeGemini();
  }

  private async initializeGemini() {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("GEMINI_API_KEY not found in environment variables");
        return;
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      console.log("Gemini AI initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Gemini AI:", error);
    }
  }

  async chat(userMessage: string): Promise<string> {
    if (!this.model) {
      return "عذراً، خدمة الذكاء الاصطناعي غير متاحة حالياً. يرجى التأكد من إعداد مفتاح Gemini API في لوحة الإدارة.";
    }

    try {
      // Get patriarch data from database
      const patriarchs = await storage.getPatriarchs();
      
      // Create context from patriarch data
      const patriarchContext = patriarchs.map(p => 
        `البطريرك ${p.name} (${p.arabicName || p.name}):
        - الترتيب: ${p.orderNumber}
        - العصر: ${p.era}
        - الفترة: ${p.startYear} - ${p.endYear || 'الحاضر'}
        - الإنجازات: ${p.contributions}
        ${p.biography ? `- السيرة: ${p.biography}` : ''}
        ${p.heresiesFought.length > 0 ? `- البدع المحاربة: ${p.heresiesFought.join(', ')}` : ''}
        `
      ).join('\n\n');

      const systemPrompt = `أنت مساعد ذكي متخصص في تاريخ بطاركة الكنيسة القبطية الأرثوذكسية. اسمك "اسأل البطريرك".

معلومات البطاركة المتاحة:
${patriarchContext}

التعليمات:
1. أجب باللغة العربية فقط
2. كن مهذباً ومحترماً
3. ركز على المعلومات التاريخية الدقيقة
4. إذا سُئلت عن بطريرك محدد، قدم معلومات مفصلة عنه
5. إذا لم تجد المعلومة في البيانات المتاحة، اذكر ذلك بوضوح
6. يمكنك مقارنة البطاركة أو شرح العصور التاريخية المختلفة
7. استخدم أسلوباً تعليمياً ومفيداً

العصور التاريخية:
- العصر الرسولي (apostolic): بداية المسيحية
- العصر الذهبي (golden): فترة ازدهار الكنيسة
- عصر المجامع (councils): فترة المجامع المسكونية
- عصر الاضطهاد (persecution): فترات الاضطهاد
- العصر الحديث (modern): العصر المعاصر

المستخدم سأل: ${userMessage}`;

      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();

      return text || "عذراً، لم أتمكن من إنتاج إجابة مناسبة. يرجى إعادة صياغة سؤالك.";

    } catch (error) {
      console.error("Error in chatbot service:", error);
      return "عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى لاحقاً.";
    }
  }

  async setApiKey(apiKey: string): Promise<boolean> {
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Test the API key with a simple request
      await this.model.generateContent("test");
      
      // Store the API key in environment (in production, this should be stored securely)
      process.env.GEMINI_API_KEY = apiKey;
      
      return true;
    } catch (error) {
      console.error("Failed to set Gemini API key:", error);
      this.genAI = null;
      this.model = null;
      return false;
    }
  }

  isConfigured(): boolean {
    return this.model !== null;
  }
}

export const chatbotService = new ChatbotService();
