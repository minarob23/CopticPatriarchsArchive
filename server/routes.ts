import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { askPatriarch, setGeminiApiKey, testGeminiConnection } from "./gemini";
import { insertPatriarchSchema, updatePatriarchSchema } from "@shared/schema";
import { z } from "zod";
import { eq, and, like, desc, asc, or } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public patriarch routes
  app.get('/api/patriarchs', async (req, res) => {
    try {
      const { search, era, heresies } = req.query;
      const filters = {
        searchQuery: search as string,
        era: era as string,
        heresies: heresies ? (heresies as string).split(',') : undefined,
      };

      const patriarchs = await storage.getPatriarchs(filters);
      res.json(patriarchs);
    } catch (error) {
      console.error("Error fetching patriarchs:", error);
      res.status(500).json({ message: "Failed to fetch patriarchs" });
    }
  });

  app.get('/api/patriarchs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patriarch ID" });
      }

      const patriarch = await storage.getPatriarch(id);
      if (!patriarch) {
        return res.status(404).json({ message: "Patriarch not found" });
      }

      res.json(patriarch);
    } catch (error) {
      console.error("Error fetching patriarch:", error);
      res.status(500).json({ message: "Failed to fetch patriarch" });
    }
  });

  // Admin-only patriarch routes
  app.post('/api/admin/patriarchs', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPatriarchSchema.parse(req.body);
      const patriarch = await storage.createPatriarch(validatedData);
      res.status(201).json(patriarch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error creating patriarch:", error);
      res.status(500).json({ message: "Failed to create patriarch" });
    }
  });

  app.put('/api/admin/patriarchs/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patriarch ID" });
      }

      const validatedData = updatePatriarchSchema.parse(req.body);
      const patriarch = await storage.updatePatriarch(id, validatedData);

      if (!patriarch) {
        return res.status(404).json({ message: "Patriarch not found" });
      }

      res.json(patriarch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error updating patriarch:", error);
      res.status(500).json({ message: "Failed to update patriarch" });
    }
  });

  app.delete('/api/admin/patriarchs/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patriarch ID" });
      }

      const success = await storage.deletePatriarch(id);
      if (!success) {
        return res.status(404).json({ message: "Patriarch not found" });
      }

      res.json({ message: "Patriarch deleted successfully" });
    } catch (error) {
      console.error("Error deleting patriarch:", error);
      res.status(500).json({ message: "Failed to delete patriarch" });
    }
  });

  // Admin stats route
  app.get('/api/admin/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getPatriarchStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Chatbot route - public access
  app.post('/api/ask-patriarch', async (req, res) => {
    try {
      const { question } = req.body;

      if (!question || typeof question !== 'string') {
        return res.status(400).json({ message: "سؤال غير صحيح" });
      }

      const answer = await askPatriarch(question);
      res.json({ answer });
    } catch (error) {
      console.error("Error in ask-patriarch:", error);
      res.status(500).json({ message: "حدث خطأ أثناء معالجة السؤال" });
    }
  });

  // Admin API key management
  app.post('/api/admin/gemini-api-key', isAuthenticated, async (req, res) => {
    try {
      const { apiKey } = req.body;

      if (!apiKey || typeof apiKey !== 'string') {
        return res.status(400).json({ message: "مفتاح API غير صحيح" });
      }

      await setGeminiApiKey(apiKey);
      res.json({ message: "تم حفظ مفتاح API بنجاح" });
    } catch (error) {
      console.error("Error saving API key:", error);
      res.status(500).json({ message: "فشل في حفظ مفتاح API" });
    }
  });

  // Test Gemini connection
  app.post('/api/admin/test-gemini', isAuthenticated, async (req, res) => {
    try {
      const isConnected = await testGeminiConnection();
      res.json({ connected: isConnected });
    } catch (error) {
      console.error("Error testing connection:", error);
      res.status(500).json({ connected: false });
    }
  });

  // Get current API key status
  app.get('/api/admin/gemini-status', isAuthenticated, async (req, res) => {
    try {
      const apiKeySetting = await storage.getSetting('gemini_api_key');
      res.json({ hasApiKey: !!apiKeySetting?.value });
    } catch (error) {
      console.error("Error checking API key status:", error);
      res.status(500).json({ hasApiKey: false });
    }
  });

   // Generate smart summary for a patriarch
   app.post("/api/generate-smart-summary", async (req, res) => {
    try {
      const { name, tone } = req.body;

      if (!name) {
        return res.status(400).json({ error: "اسم البطريرك مطلوب" });
      }

      const patriarch = await storage.getPatriarchByName(name);

      if (!patriarch) {
        return res.status(404).json({ error: "لم يتم العثور على البطريرك" });
      }

      // Generate intelligent summary based on tone
      let summary = "";
      const patriarchData = patriarch;
      const serviceDuration = patriarchData.endYear ? 
        patriarchData.endYear - patriarchData.startYear : 
        new Date().getFullYear() - patriarchData.startYear;

      if (tone === "kids") {
        summary = `🌟 قصة البابا ${patriarchData.arabicName || patriarchData.name} 🌟

هل تعرف من هو البابا ${patriarchData.arabicName || patriarchData.name}؟ إنه البابا رقم ${patriarchData.orderNumber} في الكنيسة القبطية! 

كان بابا عظيماً عاش منذ زمن طويل في ${patriarchData.era}. خدم ربنا لمدة ${serviceDuration} سنة من عام ${patriarchData.startYear} ${patriarchData.endYear ? `إلى عام ${patriarchData.endYear}` : 'وحتى الآن'}.

🎯 ماذا فعل؟
${patriarchData.contributions}

💪 كان شجاعاً وقوياً ودافع عن الكنيسة ضد الذين يريدون تغيير تعاليم المسيح.

✨ هو مثال رائع لنا جميعاً في المحبة والخدمة!`;

      } else if (tone === "academic") {
        const heresiesText = (() => {
          try {
            const heresies = Array.isArray(patriarchData.heresiesFought) 
              ? patriarchData.heresiesFought 
              : JSON.parse(patriarchData.heresiesFought || '[]');
            return heresies.length > 0 ? heresies.join('، ') : 'لا توجد معلومات متاحة';
          } catch (e) {
            return 'لا توجد معلومات متاحة';
          }
        })();

        summary = `📚 دراسة أكاديمية للبابا ${patriarchData.arabicName || patriarchData.name} 📚

السيرة التاريخية والإدارية:
يُعد البابا ${patriarchData.arabicName || patriarchData.name} البطريرك رقم ${patriarchData.orderNumber} في السلسلة البطريركية للكنيسة القبطية الأرثوذكسية، والذي تولى مسؤولية الكرسي المرقسي في فترة تاريخية مهمة.

السياق التاريخي والزمني:
تولى البطريركية في عام ${patriarchData.startYear} ميلادية واستمر في خدمته لمدة ${serviceDuration} عاماً ${patriarchData.endYear ? `حتى عام ${patriarchData.endYear}` : 'ولا يزال يخدم'}، وهي فترة تقع في ${patriarchData.era}.

الإنجازات والمساهمات:
${patriarchData.contributions}

التحديات اللاهوتية والعقائدية:
واجه البطريرك تحديات عقائدية مهمة شملت: ${heresiesText}

الأثر التاريخي:
ترك هذا البطريرك إرثاً مهماً في تاريخ الكنيسة القبطية من خلال قيادته الحكيمة والمتوازنة في عصر تميز بتحدياته الخاصة.`;

      } else { // easy tone
        summary = `🏛️ تعرف على البابا ${patriarchData.arabicName || patriarchData.name} 🏛️

البابا ${patriarchData.arabicName || patriarchData.name} هو البطريرك رقم ${patriarchData.orderNumber} في تاريخ الكنيسة القبطية.

⏰ متى خدم؟
خدم لمدة ${serviceDuration} سنة، من ${patriarchData.startYear} ${patriarchData.endYear ? `إلى ${patriarchData.endYear}` : 'وحتى الآن'}

🌍 في أي عصر عاش؟
عاش في ${patriarchData.era}، وكان هذا وقتاً مهماً في تاريخ مصر والكنيسة.

✨ ما هي أهم أعماله؟
${patriarchData.contributions}

🛡️ كيف دافع عن الإيمان؟
دافع البابا عن تعاليم الكنيسة الصحيحة ووقف ضد من يحاولون تغيير الإيمان المسيحي.

💫 هو مثال رائع للقيادة الروحية والحكمة في خدمة الكنيسة والشعب.`;
      }

      res.json({
        summary,
        patriarch: {
          name: patriarchData.arabicName || patriarchData.name,
          orderNumber: patriarchData.orderNumber,
          startYear: patriarchData.startYear,
          endYear: patriarchData.endYear,
          era: patriarchData.era
        }
      });
    } catch (error) {
      console.error("Error generating smart summary:", error);
      res.status(500).json({ error: "خطأ في الخادم" });
    }
  });

  // Get all patriarchs with optional filtering
  app.get("/api/patriarchs", async (req, res) => {
    try {
      const { search, era, heresies } = req.query;
      const filters = {
        searchQuery: search as string,
        era: era as string,
        heresies: heresies ? (heresies as string).split(',') : undefined,
      };

      const patriarchs = await storage.getPatriarchs(filters);
      res.json(patriarchs);
    } catch (error) {
      console.error("Error fetching patriarchs:", error);
      res.status(500).json({ message: "Failed to fetch patriarchs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}