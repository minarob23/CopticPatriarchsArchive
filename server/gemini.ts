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

    // Read additional external sources
    let externalSources = '';
    
    // 1. Read CSV data
    try {
      const fs = await import('fs');
      const path = await import('path');
      const csvPath = path.join(process.cwd(), 'attached_assets/coptic_patriarchs_2025_1751464991874.csv');
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
            externalSources += `\n\nمصدر إضافي من ${file}:\n${content.substring(0, 2000)}\n`;
          } catch (err) {
            console.log(`Could not read ${file}`);
          }
        }
      }
    } catch (error) {
      console.log('Additional text files reading failed, continuing without them');
    }

    // Create enhanced context from patriarchs data
    const context = patriarchs.map(p => {
      let heresiesList = '';
      try {
        const heresies = Array.isArray(p.heresiesFought) 
          ? p.heresiesFought 
          : JSON.parse(p.heresiesFought || '[]');
        heresiesList = heresies.join(', ');
      } catch (error) {
        heresiesList = 'غير متوفرة';
      }
      
      return `البطريرك ${p.name} (رقم ${p.orderNumber}) - العصر: ${p.era} - الفترة: ${p.startYear}${p.endYear ? `-${p.endYear}` : '-الآن'} - المساهمات: ${p.contributions} - السيرة: ${p.biography || 'غير متوفرة'} - البدع المحاربة: ${heresiesList}`;
    }).join('\n\n');

    const enhancedSystemPrompt = `أنت خبير في تاريخ الكنيسة القبطية الأرثوذكسية والبطاركة الأقباط. 
تتحدث بالعربية فقط وتجيب على الأسئلة بناءً على المعلومات التاريخية الموثقة للبطاركة الأقباط الأرثوذكس.

معلومات البطاركة من قاعدة البيانات الرئيسية:
${context}

${externalSources}

قواعد الإجابة المحسنة:
1. أجب بالعربية فقط
2. استخدم جميع المصادر المتاحة (قاعدة البيانات والمصادر الخارجية)
3. اربط المعلومات من مصادر مختلفة لتقديم إجابة شاملة
4. كن دقيقاً تاريخياً ومرجع المعلومات عند الإمكان
5. إذا وجدت معلومات متضاربة، اذكر ذلك وقدم التفسير
6. قدم معلومات مفيدة وتعليمية مع سياق تاريخي
7. حافظ على الطابع الروحي والتاريخي المناسب
8. استخدم المعرفة العامة عن التاريخ المسيحي والقبطي لإثراء الإجابة
9. قدم روابط منطقية بين الأحداث والشخصيات
10. اذكر التأثير الروحي والكنسي للبطاركة على الكنيسة والمجتمع`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-pro", // استخدام النموذج المتقدم للحصول على إجابات أفضل
      config: {
        systemInstruction: enhancedSystemPrompt,
        temperature: 0.7, // توازن بين الدقة والإبداع
        topP: 0.9,
        topK: 40,
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

export async function generateSmartSummary(patriarch: any, tone: string): Promise<string> {
  const apiKey = await storage.getSetting("gemini_api_key");

  if (!apiKey?.value) {
    throw new Error("Gemini API key not configured");
  }

  // Read CSV data with better parsing
  let csvPatriarchData = '';
  try {
    const fs = await import('fs');
    const path = await import('path');
    const csvPath = path.join(process.cwd(), 'attached_assets/coptic_patriarchs_2025_1751464991874.csv');
    if (fs.existsSync(csvPath)) {
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n');
      
      // Find matching patriarch in CSV
      for (const line of lines) {
        if (line.includes(patriarch.name) || 
            line.includes(patriarch.arabicName || '') ||
            line.includes(patriarch.orderNumber?.toString() || '')) {
          csvPatriarchData = line;
          break;
        }
      }
      
      // If no exact match, provide general CSV context
      if (!csvPatriarchData) {
        csvPatriarchData = csvContent.substring(0, 3000);
      }
    }
  } catch (error) {
    console.log('CSV file not found, using database data only');
  }

  const toneInstructions = {
    easy: "استخدم لغة سهلة ومبسطة مناسبة للعامة",
    academic: "استخدم لغة أكاديمية ومتخصصة مناسبة للباحثين والطلاب",
    kids: "استخدم لغة مبسطة جداً مناسبة للأطفال مع أمثلة واضحة"
  };

  const instruction = toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.easy;

  const heresiesFought = (() => {
    try {
      if (Array.isArray(patriarch.heresiesFought)) {
        return patriarch.heresiesFought.join(', ');
      }
      if (typeof patriarch.heresiesFought === 'string') {
        const parsed = JSON.parse(patriarch.heresiesFought);
        return Array.isArray(parsed) ? parsed.join(', ') : patriarch.heresiesFought;
      }
      return 'غير متوفر';
    } catch (error) {
      return patriarch.heresiesFought || 'غير متوفر';
    }
  })();

  const prompt = `
أنت خبير في تاريخ الكنيسة القبطية الأرثوذكسية. اكتب ملخصاً ذكياً ومفصلاً عن البطريرك التالي:

معلومات البطريرك من قاعدة البيانات:
- الاسم: ${patriarch.name}
- الاسم العربي: ${patriarch.arabicName || "غير متوفر"}
- رقم البطريرك: ${patriarch.orderNumber}
- فترة الخدمة: ${patriarch.startYear} - ${patriarch.endYear || "الآن"}
- العصر: ${patriarch.era}
- المساهمات: ${patriarch.contributions}
- السيرة الذاتية: ${patriarch.biography || "غير متوفر"}
- البدع التي حاربها: ${heresiesFought}

${csvPatriarchData ? `معلومات إضافية من ملف البيانات التاريخية:\n${csvPatriarchData}\n` : ''}

المطلوب:
- ${instruction}
- اكتب ملخصاً شاملاً يغطي حياته وإنجازاته الروحية والكنسية
- اذكر أهم المساهمات والأحداث في فترة خدمته
- أضف معلومات عن السياق التاريخي للفترة التي عاش فيها
- اذكر البدع التي حاربها وكيف دافع عن الإيمان الأرثوذكسي
- اكتب بطريقة شيقة وجذابة تجعل القارئ يفهم أهمية هذا البطريرك
- استخدم المعلومات المتاحة من المصادر لإثراء الملخص
- إذا كانت المعلومات محدودة، اكتب عن السياق التاريخي العام لفترته

متطلبات الكتابة:
- طول الملخص: حوالي 300-500 كلمة
- اللغة: العربية فقط
- أسلوب متدرج ومنظم
- معلومات دقيقة ومفيدة
`;

  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024
    }
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey.value}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response from Gemini API');
  }

  const responseText = data.candidates[0].content.parts[0].text;
  return responseText.trim();
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

export async function generateAIRecommendations(
  userProfile: any, 
  preferences: any, 
  patriarchs: any[]
): Promise<any> {
  try {
    const client = await getGeminiClient();
    if (!client) {
      throw new Error('Gemini AI غير متاح');
    }

    // Create detailed user profile for AI analysis
    const userDescription = `
ملف المستخدم:
- الاهتمامات: ${preferences.interests?.join(', ') || 'غير محدد'}
- الفترة الزمنية المفضلة: ${preferences.timeInterest || 'غير محدد'}
- المجال المفضل: ${preferences.topicInterest || 'غير محدد'}
- نوع الشخصية المفضل: ${preferences.personalityTrait || 'غير محدد'}
- العصور المختارة: ${preferences.selectedEras?.join(', ') || 'لا توجد'}
- البدع المختارة: ${preferences.selectedHeresies?.join(', ') || 'لا توجد'}
- وصف إضافي: ${userProfile.description || 'لا يوجد'}
`;

    // Prepare patriarchs data for AI (limit to first 20 for token efficiency)
    const patriarchsData = patriarchs.slice(0, 20).map(p => ({
      name: p.name,
      arabicName: p.arabicName,
      era: p.era,
      startYear: p.startYear,
      endYear: p.endYear,
      contributions: p.contributions.substring(0, 200),
      heresiesFought: Array.isArray(p.heresiesFought) ? p.heresiesFought : []
    }));

    const prompt = `
أنت خبير في تاريخ الكنيسة القبطية الأرثوذكسية. بناءً على ملف المستخدم التالي، أريد منك أن تقترح أفضل 5 بطاركة مناسبين له من القائمة المتاحة.

${userDescription}

قائمة البطاركة المتاحة:
${JSON.stringify(patriarchsData, null, 2)}

المطلوب:
1. اختر أفضل 5 بطاركة مناسبين لاهتمامات المستخدم
2. رتبهم حسب درجة المطابقة (الأعلى أولاً)
3. لكل بطريرك، اكتب:
   - اسم البطريرك
   - درجة المطابقة (من 1-100)
   - 3-5 أسباب مقنعة لماذا يناسب المستخدم
   - نصيحة شخصية للمستخدم حول ما يمكن تعلمه من هذا البطريرك

أجب بصيغة JSON بالتنسيق التالي:
{
  "recommendations": [
    {
      "name": "اسم البطريرك بالإنجليزية",
      "arabicName": "اسم البطريرك بالعربية", 
      "score": 95,
      "reasons": ["السبب الأول", "السبب الثاني", "السبب الثالث"],
      "personalAdvice": "نصيحة شخصية للمستخدم",
      "highlights": ["نقطة مميزة 1", "نقطة مميزة 2"]
    }
  ],
  "overallAdvice": "نصيحة عامة للمستخدم حول كيفية الاستفادة من هذه الاقتراحات"
}

تأكد من أن الإجابة باللغة العربية وتركز على التطبيق العملي والروحي.
`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
      },
      contents: prompt,
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('لم يتم الحصول على رد من الذكاء الاصطناعي');
    }

    const aiResult = JSON.parse(responseText);
    
    // Add full patriarch data to recommendations
    const enhancedRecommendations = aiResult.recommendations.map((rec: any) => {
      const fullPatriarch = patriarchs.find(p => 
        p.name === rec.name || p.arabicName === rec.arabicName
      );
      
      return {
        ...rec,
        patriarch: fullPatriarch,
        aiGenerated: true
      };
    });

    return {
      ...aiResult,
      recommendations: enhancedRecommendations,
      source: 'gemini-ai',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    throw new Error(`فشل في إنشاء الاقتراحات الذكية: ${error}`);
  }
}