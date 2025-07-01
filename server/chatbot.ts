
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from './db';
import { patriarchs } from '@shared/schema';
import { Request, Response } from 'express';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function handleChatbotMessage(req: Request, res: Response) {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get patriarch data from database
    const patriarchData = await db.select().from(patriarchs);
    
    // Create context about the patriarchs
    const patriarchContext = patriarchData.map(p => 
      `البطريرك ${p.arabicName || p.name}: من ${p.startYear} إلى ${p.endYear || 'الآن'} م، ` +
      `العصر: ${p.era}، المساهمات: ${p.contributions}، ` +
      `البدع التي حاربها: ${p.heresiesFought.join(', ')}`
    ).join('\n');

    const systemPrompt = `
أنت مساعد ذكي متخصص في تاريخ الكنيسة القبطية الأرثوذكسية وبطاركتها. 
لديك معلومات شاملة عن البطاركة التالية:

${patriarchContext}

تعليمات مهمة:
1. أجب باللغة العربية فقط
2. كن مهذباً ومحترماً
3. استخدم المعلومات المتاحة في قاعدة البيانات
4. إذا لم تجد معلومة محددة، اذكر ذلك بوضوح
5. يمكنك تقديم معلومات عامة عن تاريخ الكنيسة القبطية
6. اجعل إجاباتك مفيدة وتعليمية
7. لا تخترع معلومات غير موجودة في البيانات المتاحة

سؤال المستخدم: ${message}
    `;

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      error: 'حدث خطأ في المعالجة',
      response: 'عذراً، لا يمكنني الرد في الوقت الحالي. يرجى المحاولة مرة أخرى لاحقاً.'
    });
  }
}
