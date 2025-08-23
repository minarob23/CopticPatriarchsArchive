import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "fs";
import { storage } from './storage.js';

let geminiClient: GoogleGenAI | null = null;

export async function getGeminiClient(): Promise<GoogleGenAI | null> {
  try {
    const apiKey = (await storage.getSetting('gemini_api_key'))?.value;
    if (!apiKey) {
      console.log('No Gemini API key found');
      return null;
    }

    if (!geminiClient) {
      geminiClient = new GoogleGenAI({ apiKey });
    }
    
    return geminiClient;
  } catch (error) {
    console.error('Error initializing Gemini client:', error);
    return null;
  }
}

export async function summarizeArticle(text: string): Promise<string> {
  const client = await getGeminiClient();
  if (!client) {
    throw new Error('Gemini AI client not available');
  }

  const prompt = `Please summarize the following text concisely while maintaining key points:\n\n${text}`;

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "Something went wrong";
}

export interface Sentiment {
  rating: number;
  confidence: number;
}

export async function analyzeSentiment(text: string): Promise<Sentiment> {
  try {
    const client = await getGeminiClient();
    if (!client) {
      throw new Error('Gemini AI client not available');
    }

    const systemPrompt = `You are a sentiment analysis expert. 
Analyze the sentiment of the text and provide a rating
from 1 to 5 stars and a confidence score between 0 and 1.
Respond with JSON in this format: 
{'rating': number, 'confidence': number}`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            rating: { type: "number" },
            confidence: { type: "number" },
          },
          required: ["rating", "confidence"],
        },
      },
      contents: text,
    });

    const rawJson = response.text;

    if (rawJson) {
      const data: Sentiment = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    throw new Error(`Failed to analyze sentiment: ${error}`);
  }
}

export async function analyzeImage(jpegImagePath: string): Promise<string> {
  const client = await getGeminiClient();
  if (!client) {
    throw new Error('Gemini AI client not available');
  }

  const imageBytes = fs.readFileSync(jpegImagePath);

  const contents = [
    {
      inlineData: {
        data: imageBytes.toString("base64"),
        mimeType: "image/jpeg",
      },
    },
    `Analyze this image in detail and describe its key elements, context,
and any notable aspects.`,
  ];

  const response = await client.models.generateContent({
    model: "gemini-2.5-pro",
    contents: contents,
  });

  return response.text || "";
}

export async function analyzeVideo(mp4VideoPath: string): Promise<string> {
  const client = await getGeminiClient();
  if (!client) {
    throw new Error('Gemini AI client not available');
  }

  const videoBytes = fs.readFileSync(mp4VideoPath);

  const contents = [
    {
      inlineData: {
        data: videoBytes.toString("base64"),
        mimeType: "video/mp4",
      },
    },
    `Analyze this video in detail and describe its key elements, context,
    and any notable aspects.`,
  ];

  const response = await client.models.generateContent({
    model: "gemini-2.5-pro",
    contents: contents,
  });

  return response.text || "";
}

export async function generateImage(
  prompt: string,
  imagePath: string,
): Promise<void> {
  try {
    const client = await getGeminiClient();
    if (!client) {
      throw new Error('Gemini AI client not available');
    }

    const response = await client.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      return;
    }

    const content = candidates[0].content;
    if (!content || !content.parts) {
      return;
    }

    for (const part of content.parts) {
      if (part.text) {
        console.log(part.text);
      } else if (part.inlineData && part.inlineData.data) {
        const imageData = Buffer.from(part.inlineData.data, "base64");
        fs.writeFileSync(imagePath, imageData);
        console.log(`Image saved as ${imagePath}`);
      }
    }
  } catch (error) {
    throw new Error(`Failed to generate image: ${error}`);
  }
}

export async function generateAIContent(input: string): Promise<string> {
  const client = await getGeminiClient();
  if (!client) {
    throw new Error('Gemini AI غير متاح');
  }

  const response = await client.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: input,
    config: {
      temperature: 0.7,
      maxOutputTokens: 1500,
    }
  });

  // Check the standard response structure
  if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
    return response.candidates[0].content.parts[0].text.trim();
  }

  // If standard structure fails, try alternative
  if ((response as any).text) {
    return (response as any).text.trim();
  }

  throw new Error('Invalid response from Gemini API');
}

export async function testGeminiConnection(): Promise<boolean> {
  try {
    const client = await getGeminiClient();
    if (!client) return false;

    const response = await client.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: "اختبار الاتصال",
    });

    // Check standard response structure
    return !!(
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      (response as any).text
    );
  } catch (error) {
    console.error("Gemini connection test failed:", error);
    return false;
  }
}

// دالة لتنظيف النص من رموز التنسيق
function cleanFormattingFromText(text: string): string {
  return text
    // إزالة رموز Markdown
    .replace(/\*\*(.*?)\*\*/g, '$1')  // إزالة **نص غامق**
    .replace(/\*(.*?)\*/g, '$1')      // إزالة *نص مائل*
    .replace(/#{1,6}\s/g, '')         // إزالة عناوين #
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // إزالة كود `نص`
    .replace(/^\s*-\s+/gm, '• ')      // تحويل - إلى •
    .replace(/^\s*\*\s+/gm, '• ')     // تحويل * إلى •
    .replace(/^\s*\d+\.\s+/gm, '')   // إزالة الترقيم 1. 2. 3.
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // إزالة الروابط [نص](رابط)
    .replace(/_{2,}(.*?)_{2,}/g, '$1') // إزالة __تسطير__
    .replace(/~{2}(.*?)~{2}/g, '$1')  // إزالة ~~خط وسط~~
    .replace(/\n{3,}/g, '\n\n')       // تقليل الأسطر المتعددة
    .trim();
}

export async function askPatriarch(question: string): Promise<string> {
  const client = await getGeminiClient();
  if (!client) {
    return "عذراً، لم يتم تكوين مفتاح API الخاص بـ Gemini. يرجى إضافة المفتاح في صفحة الإدارة.";
  }

  try {
    // Get all patriarchs data for context
    const patriarchs = await storage.getPatriarchs();

    // Read additional external sources
    let externalSources = '';

    // 1. Read CSV data
    try {
      const fs = await import('fs');
      const path = await import('path');
      const csvPath = path.join(process.cwd(), 'attached_assets/patriarchs_data.csv');
      if (fs.existsSync(csvPath)) {
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        externalSources += `\n\nمصادر إضافية من ملف البيانات التاريخية:\n${csvContent.substring(0, 4000)}\n`;
      }
    } catch (error) {
      console.log('CSV file reading failed, continuing without it');
    }

    // 2. Read additional text files if available
    try {
      const fs = await import('fs');
      const path = await import('path');
      const assetsDir = path.join(process.cwd(), 'attached_assets');
      if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        const textFiles = files.filter(file => file.endsWith('.txt'));

        for (const file of textFiles.slice(0, 3)) { // Limit to 3 files to avoid token limits
          try {
            const content = fs.readFileSync(path.join(assetsDir, file), 'utf-8');
            externalSources += `\n\nمن ملف ${file}:\n${content.substring(0, 2000)}\n`;
          } catch (error) {
            console.log(`Failed to read ${file}`);
          }
        }
      }
    } catch (error) {
      console.log('External files reading failed, continuing without them');
    }

    // Format patriarch data for context, focusing on Arabic names and content
    const contextData = patriarchs.slice(0, 30).map(p => {
      let heresiesFought = [];
      try {
        if (Array.isArray(p.heresiesFought)) {
          heresiesFought = p.heresiesFought;
        } else if (typeof p.heresiesFought === 'string') {
          const heresiesString = p.heresiesFought;
          if (heresiesString.startsWith('{') && heresiesString.endsWith('}')) {
            // PostgreSQL array format: {"item1","item2"}
            const cleanString = heresiesString.slice(1, -1);
            heresiesFought = cleanString.split(',').map(item => item.replace(/"/g, '').trim()).filter(item => item !== '');
          } else if (heresiesString.trim().startsWith('[')) {
            // JSON array format
            heresiesFought = JSON.parse(heresiesString || '[]');
          } else if (heresiesString.includes(',')) {
            // Comma-separated format
            heresiesFought = heresiesString.split(',').map(item => item.trim()).filter(item => item !== '');
          } else if (heresiesString.trim()) {
            // Single heresy
            heresiesFought = [heresiesString.trim()];
          }
        }
      } catch (e) {
        console.error('Error parsing heresies for patriarch:', p.name, e);
        heresiesFought = [];
      }

      return `${p.orderNumber}. ${p.arabicName || p.name} (${p.startYear}-${p.endYear || 'الآن'}) - العصر: ${p.era} - المساهمات: ${(p.contributions || '').substring(0, 200)} - البدع المحاربة: ${heresiesFought.join(', ')} - السيرة: ${(p.biography || '').substring(0, 200)}`;
    }).join('\n');

    const prompt = `أنت خبير في تاريخ الكنيسة القبطية الأرثوذكسية والبطاركة. لديك معرفة شاملة بالـ 118 بطريركاً من القديس مرقس الرسول إلى البابا تواضروس الثاني الحالي.

السؤال: ${question}

معلومات البطاركة المتاحة:
${contextData}

${externalSources}

أجب بالعربية بطريقة مفصلة ودقيقة، مع ذكر أسماء البطاركة وتواريخهم عند الصلة بالموضوع. إذا كان السؤال يتطلب معلومات محددة عن بطريرك معين، قم بتقديم سيرة شاملة تشمل إنجازاته ومساهماته والبدع التي حاربها.

تنبيه مهم: اكتب الإجابة كنص عادي بدون أي رموز تنسيق مثل ** أو * أو # أو - أو أرقام للقوائم. استخدم فقط النص العادي والفقرات المنظمة بشكل طبيعي.`;

    const response = await client.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      }
    });


    // Check the standard response structure
    if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      const rawText = response.candidates[0].content.parts[0].text.trim();
      return cleanFormattingFromText(rawText);
    }

    // If standard structure fails, try alternative
    if ((response as any).text) {
      const rawText = (response as any).text.trim();
      return cleanFormattingFromText(rawText);
    }

    console.error('No text found in response:', JSON.stringify(response, null, 2));
    throw new Error('No text response from Gemini API');

  } catch (error) {
    console.error('Error asking patriarch:', error);
    return "عذراً، حدث خطأ أثناء البحث عن الإجابة. يرجى المحاولة مرة أخرى.";
  }
}

export async function setGeminiApiKey(apiKey: string): Promise<void> {
  await storage.setSetting('gemini_api_key', apiKey);
  geminiClient = null; // Reset client to use new key
}

export async function generateSmartSummary(patriarchs: any[]): Promise<string> {
  const client = await getGeminiClient();
  if (!client) {
    // Fallback summary without AI
    if (patriarchs.length === 1) {
      const patriarch = patriarchs[0];
      return `${patriarch.arabicName || patriarch.name} - البطريرك رقم ${patriarch.orderNumber} من بطاركة الكنيسة القبطية الأرثوذكسية، خدم في الفترة من ${patriarch.startYear} إلى ${patriarch.endYear || 'الآن'} في ${patriarch.era}. له مساهمات مهمة في تاريخ الكنيسة ودور بارز في محاربة البدع والدفاع عن الإيمان الأرثوذكسي.`;
    }
    return `قاعدة بيانات البطاركة تحتوي على ${patriarchs.length} بطريركاً من تاريخ الكنيسة القبطية الأرثوذكسية، من القديس مرقس الرسول مؤسس الكنيسة القبطية إلى البابا الحالي. تشمل البيانات العصور التاريخية المختلفة من العصر الرسولي إلى العصر الحديث، مع تفاصيل عن مساهمات كل بطريرك والبدع التي حاربها وإنجازاته التاريخية.`;
  }

  try {
    // إذا كان بطريرك واحد فقط، اكتب ملخصاً شخصياً عنه
    if (patriarchs.length === 1) {
      const patriarch = patriarchs[0];
      
      // إعداد بيانات البدع المحاربة
      let heresiesFought = [];
      try {
        heresiesFought = typeof patriarch.heresiesFought === 'string' 
          ? JSON.parse(patriarch.heresiesFought) 
          : patriarch.heresiesFought || [];
      } catch (e) {
        heresiesFought = [];
      }

      const prompt = `اكتب ملخصاً شخصياً مفصلاً بالعربية عن البطريرك التالي، بدون استخدام رموز التنسيق مثل # أو ** أو أي رموز أخرى:

الاسم: ${patriarch.arabicName || patriarch.name}
الاسم الإنجليزي: ${patriarch.name}
رقم البطريرك: ${patriarch.orderNumber}
فترة الخدمة: ${patriarch.startYear} - ${patriarch.endYear || 'حتى الآن'}
العصر التاريخي: ${patriarch.era}
المساهمات: ${patriarch.contributions || 'غير محددة'}
السيرة: ${patriarch.biography || 'غير متوفرة'}
البدع المحاربة: ${heresiesFought.join(', ') || 'غير محددة'}

اكتب ملخصاً شخصياً مفصلاً يحكي قصة هذا البطريرك كشخص، مع التركيز على المعلومات الشخصية التالية:

الاسم الكامل والأسماء المختلفة التي عرف بها
تاريخ ومكان الميلاد والوفاة
الخلفية الأسرية والتعليمية
الشخصية والصفات المميزة
الأحداث المهمة في حياته قبل وأثناء البطريركية
التحديات الشخصية والكنسية التي واجهها
الإنجازات والأعمال التي قام بها شخصياً
العلاقات مع معاصريه من القادة والشعب
القصص والمواقف التي تظهر شخصيته
تأثيره على الكنيسة والمجتمع في عصره
الإرث الذي تركه

اكتب النص كملخص متسلسل بدون استخدام أي رموز تنسيق مثل ## أو ** أو - أو أرقام أو نقاط، واجعله نصاً عادياً مقروءاً بشكل طبيعي كأنك تحكي قصة شخص لصديق.`;

      const response = await client.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
        config: {
          temperature: 0.8,
          maxOutputTokens: 1000,
        }
      });

      // Check the standard response structure
      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.candidates[0].content.parts[0].text.trim();
      }

      // If standard structure fails, try alternative
      if ((response as any).text) {
        return (response as any).text.trim();
      }

      return `${patriarch.arabicName || patriarch.name} - البطريرك رقم ${patriarch.orderNumber} من بطاركة الكنيسة القبطية الأرثوذكسية، خدم في الفترة من ${patriarch.startYear} إلى ${patriarch.endYear || 'الآن'} في ${patriarch.era}.`;
    }

    // إذا كان أكثر من بطريرك، اكتب ملخص عام عن قاعدة البيانات
    // Get era distribution
    const eraCount: { [key: string]: number } = {};
    patriarchs.forEach(p => {
      eraCount[p.era] = (eraCount[p.era] || 0) + 1;
    });

    // Get top heresies fought
    const heresiesCount: { [key: string]: number } = {};
    patriarchs.forEach(p => {
      try {
        const heresies = typeof p.heresiesFought === 'string' 
          ? JSON.parse(p.heresiesFought) 
          : p.heresiesFought || [];
        heresies.forEach((h: string) => {
          heresiesCount[h] = (heresiesCount[h] || 0) + 1;
        });
      } catch (e) {
        // Ignore parsing errors
      }
    });

    const topHeresies = Object.entries(heresiesCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([heresy, count]) => `${heresy} (${count})`)
      .join(', ');

    const eraDistribution = Object.entries(eraCount)
      .map(([era, count]) => `${era}: ${count}`)
      .join(', ');

    const prompt = `قم بإنشاء ملخص ذكي وشامل لقاعدة بيانات البطاركة القبط الأرثوذكس. 

إحصائيات القاعدة:
- العدد الإجمالي: ${patriarchs.length} بطريرك
- توزيع العصور: ${eraDistribution}
- أهم البدع المحاربة: ${topHeresies}

اكتب ملخصاً جذاباً ومفيداً بالعربية يبرز:
1. الأهمية التاريخية لهذه المجموعة
2. التنوع الزمني والعقائدي
3. أبرز الإنجازات والمعارك الفكرية
4. القيمة التعليمية والروحية

اجعل الملخص ملهماً ومناسباً للعرض على الصفحة الرئيسية.`;

    const response = await client.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 800,
      }
    });

    // Check the standard response structure
    if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      return response.candidates[0].content.parts[0].text.trim();
    }

    // If standard structure fails, try alternative
    if ((response as any).text) {
      return (response as any).text.trim();
    }

    return "قاعدة بيانات شاملة لتاريخ الكنيسة القبطية الأرثوذكسية";

  } catch (error) {
    console.error('Error generating smart summary:', error);
    if (patriarchs.length === 1) {
      const patriarch = patriarchs[0];
      return `${patriarch.arabicName || patriarch.name} - البطريرك رقم ${patriarch.orderNumber} من بطاركة الكنيسة القبطية الأرثوذكسية، خدم في الفترة من ${patriarch.startYear} إلى ${patriarch.endYear || 'الآن'} في ${patriarch.era}.`;
    }
    return `قاعدة بيانات البطاركة تحتوي على ${patriarchs.length} بطريركاً من تاريخ الكنيسة القبطية الأرثوذكسية، تشمل جميع العصور التاريخية والإنجازات الروحية والفكرية.`;
  }
}

export async function generateAIRecommendations(
  userProfile: any,
  preferences: any,
  patriarchs: any[]
): Promise<any> {
  // Always use local intelligent system first for better accuracy and no API limits
  const localRecommendations = generateLocalRecommendations(userProfile, preferences, patriarchs);
  
  // Return local recommendations immediately - they're often better than AI
  if (localRecommendations.recommendations.length > 0) {
    return localRecommendations;
  }
  
  // If local system finds nothing, use smart fallback (no API calls needed)
  return getSmartFallbackRecommendations(patriarchs, 'no-local-matches');
}

function getSmartFallbackRecommendations(patriarchs: any[], source: string) {
  // Provide diverse recommendations instead of always the same ones
  const significantPatriarchs = [
    { pattern: 'مرقس', advice: 'مؤسس الكنيسة القبطية' },
    { pattern: 'أثناسيوس', advice: 'أبو الأرثوذكسية ومحارب الأريوسية' },
    { pattern: 'كيرلس', advice: 'عمود الدين ومحارب النسطورية' },
    { pattern: 'ديونيسيوس', advice: 'قائد الكنيسة في الاضطهاد' },
    { pattern: 'شنوده', advice: 'باعث النهضة الحديثة' },
    { pattern: 'كيرلس السادس', advice: 'قائد التجديد في القرن العشرين' },
    { pattern: 'تواضروس', advice: 'البابا الحالي' },
    { pattern: 'ديمتريوس', advice: 'مؤسس التعليم اللاهوتي' }
  ];
  
  const randomSelection = significantPatriarchs
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);
  
  const recommendations = randomSelection.map((item, index) => {
    const patriarch = patriarchs.find(p => 
      (p.arabicName && p.arabicName.includes(item.pattern)) ||
      (p.name && p.name.toLowerCase().includes(item.pattern.toLowerCase()))
    );
    
    if (patriarch) {
      return {
        name: patriarch.name,
        arabicName: patriarch.arabicName,
        score: 90 - index * 5,
        reasons: [item.advice, `من عصر ${patriarch.era}`, 'شخصية تاريخية مهمة'],
        personalAdvice: `ادرس سيرة ${patriarch.arabicName} لتتعلم من تجربته`,
        highlights: ['مهم تاريخياً', patriarch.era],
        patriarch: patriarch,
        aiGenerated: false
      };
    }
    return null;
  }).filter(Boolean);
  
  return {
    recommendations,
    overallAdvice: 'هؤلاء من أهم البطاركة في تاريخ الكنيسة القبطية',
    source: `intelligent-fallback-${source}`,
    timestamp: new Date().toISOString()
  };
}

function generateLocalRecommendations(userProfile: any, preferences: any, patriarchs: any[]) {
  const userDesc = (userProfile.description || '').toLowerCase();
  
  if (!userDesc || userDesc.trim() === '' || userDesc === 'عام') {
    return { recommendations: [] }; // Let fallback handle generic requests
  }

  // Advanced heresy and topic mapping for intelligent matching
  const topicMap = {
    'أريوس': {
      keywords: ['أريوس', 'آريوس', 'الأريوسية', 'arius', 'arianism'],
      patriarchs: ['أثناسيوس', 'ألكسندروس', 'بطرس'],
      advice: 'محاربو الأريوسية هم حماة الإيمان الأرثوذكسي'
    },
    'نسطور': {
      keywords: ['نسطور', 'النسطورية', 'نسطوريوس', 'nestorius', 'nestorianism'],
      patriarchs: ['كيرلس الأول', 'ديوسقورس'],
      advice: 'دافعوا عن وحدة طبيعتي المسيح'
    },
    'مونوفيزية': {
      keywords: ['مونوفيزية', 'الطبيعة الواحدة', 'أوطاخي', 'monophysite'],
      patriarchs: ['تيموثاوس الثاني', 'بطرس منجوس'],
      advice: 'قادة الدفاع عن العقيدة القبطية'
    },
    'يعقوبية': {
      keywords: ['يعقوبية', 'يعاقبة', 'jacobite'],
      patriarchs: ['يعقوب البرادعي', 'ساويرس'],
      advice: 'مؤسسو الهوية القبطية المميزة'
    },
    'ملكية': {
      keywords: ['ملكية', 'ملكيين', 'الروم الملكيين', 'melkite'],
      patriarchs: ['ديوسقورس', 'تيموثاوس'],
      advice: 'محاربو التأثير البيزنطي'
    },
    'غنوسية': {
      keywords: ['غنوسية', 'الغنوسيين', 'gnostic'],
      patriarchs: ['ديمتريوس الأول', 'هيراكلا'],
      advice: 'حماة الإيمان من الهرطقات الأولى'
    },
    'اضطهاد': {
      keywords: ['اضطهاد', 'دقلديانوس', 'الشهداء', 'persecution'],
      patriarchs: ['ديونيسيوس الكبير', 'بطرس خاتم الشهداء', 'ثاونا'],
      advice: 'قادة الكنيسة في أصعب الأوقات'
    },
    'مجامع': {
      keywords: ['مجمع', 'المجامع', 'خلقيدونية', 'نيقية', 'council'],
      patriarchs: ['كيرلس الأول', 'ديوسقورس', 'أثناسيوس'],
      advice: 'محاربو البدع في المجامع المسكونية'
    },
    'رهبنة': {
      keywords: ['رهبنة', 'الأديرة', 'الرهبان', 'monastery'],
      patriarchs: ['أنطونيوس', 'مكاريوس', 'أثناسيوس'],
      advice: 'رواد الحياة الرهبانية في المسيحية'
    },
    'لاهوت': {
      keywords: ['لاهوت', 'عقيدة', 'إيمان', 'theology'],
      patriarchs: ['كيرلس الأول', 'أثناسيوس', 'ديمتريوس الأول'],
      advice: 'عمالقة الفكر اللاهوتي القبطي'
    },
    'إصلاح': {
      keywords: ['إصلاح', 'تجديد', 'نهضة', 'reform'],
      patriarchs: ['شنوده الثالث', 'كيرلس السادس', 'يوساب الثاني'],
      advice: 'قادة النهضة والتجديد الكنسي'
    },
    'حديث': {
      keywords: ['حديث', 'معاصر', 'القرن العشرين', 'modern'],
      patriarchs: ['شنوده الثالث', 'كيرلس السادس', 'تواضروس الثاني'],
      advice: 'قادة الكنيسة في العصر الحديث'
    }
  };

  const matchedPatriarchs: any[] = [];
  
  // Find matches based on user input
  for (const [topic, data] of Object.entries(topicMap)) {
    const hasMatch = data.keywords.some(keyword => 
      userDesc.includes(keyword.toLowerCase()) || 
      userDesc.includes(keyword)
    );
    
    if (hasMatch) {
      for (const patriarchName of data.patriarchs) {
        const foundPatriarch = patriarchs.find(p => 
          (p.arabicName && p.arabicName.includes(patriarchName)) ||
          (p.name && p.name.toLowerCase().includes(patriarchName.toLowerCase()))
        );
        
        if (foundPatriarch && !matchedPatriarchs.find(m => m.patriarch?.id === foundPatriarch.id)) {
          matchedPatriarchs.push({
            name: foundPatriarch.name,
            arabicName: foundPatriarch.arabicName,
            score: 95,
            reasons: [`متخصص في مجال ${topic}`, data.advice, `من عصر ${foundPatriarch.era}`],
            personalAdvice: `ادرس سيرة ${foundPatriarch.arabicName} لتفهم ${topic} بعمق`,
            highlights: [topic, foundPatriarch.era],
            patriarch: foundPatriarch,
            aiGenerated: false
          });
        }
      }
    }
  }
  
  // If we found matches, return them
  if (matchedPatriarchs.length > 0) {
    return {
      recommendations: matchedPatriarchs.slice(0, 6), // Limit to 6 recommendations
      overallAdvice: `هؤلاء البطاركة هم الأنسب لفهم موضوع اهتمامك: ${userDesc}`,
      source: 'intelligent-local-matching',
      timestamp: new Date().toISOString()
    };
  }
  
  // If no specific matches, return empty to trigger fallback
  return { recommendations: [] };
}