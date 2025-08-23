import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./simpleAuth";
import { askPatriarch, setGeminiApiKey, testGeminiConnection, generateSmartSummary, generateAIRecommendations } from "./gemini";
import { insertPatriarchSchema, updatePatriarchSchema } from "@shared/schema";
import { z } from "zod";
import { eq, and, like, desc, asc, or } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes are handled in simpleAuth.ts

  // Public patriarch routes
  app.get('/api/patriarchs', async (req, res) => {
    try {
      const { search, era, heresies } = req.query;
      console.log('Search request received:', { search, era, heresies });
      
      const filters = {
        searchQuery: search && typeof search === 'string' && search.trim() ? search.trim() : undefined,
        era: era && typeof era === 'string' && era !== 'all' ? era : undefined,
        heresies: heresies && typeof heresies === 'string' ? heresies.split(',').filter(h => h.trim()) : undefined,
      };

      console.log('Processed filters:', filters);
      
      const patriarchs = await storage.getPatriarchs(filters);
      console.log(`Found ${patriarchs.length} patriarchs with filters:`, filters);
      
      // Log some examples of heresies data for debugging
      if (patriarchs.length > 0) {
        const exampleWithHeresies = patriarchs.find(p => p.heresiesFought && p.heresiesFought.length > 0);
        if (exampleWithHeresies) {
          console.log('Example heresies data:', {
            name: exampleWithHeresies.arabicName || exampleWithHeresies.name,
            heresies: exampleWithHeresies.heresiesFought
          });
        }
      }
      
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

      console.log(`Updating patriarch ${id} with data:`, req.body);
      const validatedData = updatePatriarchSchema.parse(req.body);
      const patriarch = await storage.updatePatriarch(id, validatedData);

      if (!patriarch) {
        return res.status(404).json({ message: "Patriarch not found" });
      }

      res.json(patriarch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
     
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

  // Swap patriarch order numbers
  app.post('/api/admin/patriarchs/swap-order', isAuthenticated, async (req, res) => {
    try {
      const { patriarch1Id, patriarch2Id } = req.body;
      
      if (!patriarch1Id || !patriarch2Id) {
        return res.status(400).json({ message: "Both patriarch IDs are required" });
      }

      const success = await storage.swapPatriarchOrder(patriarch1Id, patriarch2Id);
      if (!success) {
        return res.status(404).json({ message: "One or both patriarchs not found" });
      }

      res.json({ message: "Patriarch order numbers swapped successfully" });
    } catch (error) {
      console.error("Error swapping patriarch order:", error);
      res.status(500).json({ message: "Failed to swap patriarch order" });
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

  // Delete Gemini API key
  app.delete('/api/admin/gemini-api-key', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteSetting('gemini_api_key');
      res.json({ message: "تم حذف مفتاح API بنجاح" });
    } catch (error) {
      console.error("Error deleting API key:", error);
      res.status(500).json({ message: "فشل في حذف مفتاح API" });
    }
  });

  // Public Gemini status (for public pages to check if AI features are available)
  app.get('/api/gemini-status', async (req, res) => {
    try {
      const apiKeySetting = await storage.getSetting('gemini_api_key');
      const hasApiKey = !!apiKeySetting?.value;
      
      let connected = false;
      if (hasApiKey) {
        try {
          connected = await testGeminiConnection();
        } catch (error) {
          console.error("Error testing Gemini connection during public status check:", error);
          connected = false;
        }
      }
      
      res.json({ hasApiKey, connected });
    } catch (error) {
      console.error("Error checking API key status for public:", error);
      res.status(500).json({ hasApiKey: false, connected: false });
    }
  });

  // Get current API key status
  app.get('/api/admin/gemini-status', isAuthenticated, async (req, res) => {
    try {
      const apiKeySetting = await storage.getSetting('gemini_api_key');
      const hasApiKey = !!apiKeySetting?.value;
      
      let connected = false;
      if (hasApiKey) {
        try {
          connected = await testGeminiConnection();
        } catch (error) {
          console.error("Error testing Gemini connection during status check:", error);
          connected = false;
        }
      }
      
      res.json({ hasApiKey, connected });
    } catch (error) {
      console.error("Error checking API key status:", error);
      res.status(500).json({ hasApiKey: false, connected: false });
    }
  });

   // Generate smart summary for a patriarch using Gemini AI
   app.post("/api/generate-smart-summary", async (req, res) => {
    try {
      const { name, tone } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: "اسم البطريرك مطلوب" });
      }

      console.log(`Searching for patriarch: "${name}"`);
      
      const searchTerm = name.trim();
      const allPatriarchs = await storage.getPatriarchs();
      
      // البحث المتقدم مع معالجة تنويعات الأسماء
      const searchResults = allPatriarchs.filter(p => {
        const arabicName = p.arabicName || '';
        const englishName = p.name || '';
        const orderNumber = p.orderNumber?.toString() || '';
        
        // تنويعات أسماء شائعة
        const nameVariations: { [key: string]: string[] } = {
          'شنودة': ['شنوده', 'شنودة', 'shenouda', 'shenoda'],
          'شنوده': ['شنودة', 'شنوده', 'shenouda', 'shenoda'],
          'كيرلس': ['كيريلوس', 'كيرلس', 'cyril', 'kyrillos'],
          'كيريلوس': ['كيرلس', 'كيريلوس', 'cyril', 'kyrillos'],
          'أثناسيوس': ['أثناسيوس', 'athanasius'],
          'مقار': ['مقاريوس', 'مقار', 'macarius'],
          'مقاريوس': ['مقار', 'مقاريوس', 'macarius']
        };

        // إنشاء قائمة بجميع الأسماء المحتملة للبحث
        let searchVariations = [searchTerm];
        if (nameVariations[searchTerm]) {
          searchVariations = [...searchVariations, ...nameVariations[searchTerm]];
        }
        
        // إذا كان البحث يحتوي على رقم البطريرك
        const orderNumberMatch = searchTerm.match(/البابا\s+(\d+)/);
        if (orderNumberMatch) {
          const extractedNumber = orderNumberMatch[1];
          const nameWithoutOrder = searchTerm.replace(/البابا\s+\d+/, '').trim();
          
          return (
            orderNumber === extractedNumber && (
              arabicName.includes(nameWithoutOrder) ||
              englishName.toLowerCase().includes(nameWithoutOrder.toLowerCase()) ||
              arabicName.split(' ').some(word => word.includes(nameWithoutOrder)) ||
              englishName.toLowerCase().split(' ').some(word => word.includes(nameWithoutOrder.toLowerCase()))
            )
          );
        }
        
        // البحث العادي مع التنويعات
        return searchVariations.some(variation => {
          const lowerVariation = variation.toLowerCase();
          return (
            arabicName.includes(variation) ||
            englishName.toLowerCase().includes(lowerVariation) ||
            arabicName.split(' ').some(word => word.includes(variation)) ||
            englishName.toLowerCase().split(' ').some(word => word.includes(lowerVariation)) ||
            orderNumber === variation ||
            // البحث الضبابي - إذا كان الاسم يحتوي على جزء من التنويع
            arabicName.toLowerCase().includes(lowerVariation) ||
            englishName.toLowerCase().includes(lowerVariation)
          );
        });
      });

      if (searchResults.length === 0) {
        // اقتراح أسماء مشابهة
        const suggestions = [];
        const searchLower = searchTerm.toLowerCase();
        
        // البحث عن أسماء مشابهة
        const similarNames = allPatriarchs.filter(p => {
          const arabicName = (p.arabicName || '').toLowerCase();
          const englishName = (p.name || '').toLowerCase();
          return (
            arabicName.includes(searchLower.substring(0, 3)) ||
            englishName.includes(searchLower.substring(0, 3)) ||
            searchLower.includes(arabicName.substring(0, 3)) ||
            searchLower.includes(englishName.substring(0, 3))
          );
        }).slice(0, 3);

        let errorMessage = `لم يتم العثور على أي بطريرك بالاسم "${searchTerm}".`;
        
        if (similarNames.length > 0) {
          const suggestionsList = similarNames.map(p => p.arabicName || p.name).join('، ');
          errorMessage += ` هل تقصد: ${suggestionsList}؟`;
        }
        
        errorMessage += " تأكد من كتابة الاسم بشكل صحيح.";
        
        return res.status(404).json({ 
          error: errorMessage,
          suggestions: similarNames.map(p => ({
            name: p.arabicName || p.name,
            englishName: p.name,
            orderNumber: p.orderNumber
          }))
        });
      }

      // إذا كانت النتائج متعددة وكان البحث بكلمة واحدة فقط
      const isSimpleSearch = searchTerm.split(' ').length === 1;
      
      if (searchResults.length > 1 && isSimpleSearch) {
        // إرجاع قائمة بجميع البطاركة المطابقين للاختيار
        const patriarchsList = searchResults.map(p => ({
          id: p.id,
          name: p.arabicName || p.name,
          englishName: p.name,
          orderNumber: p.orderNumber,
          startYear: p.startYear,
          endYear: p.endYear,
          era: p.era,
          shortDescription: p.contributions.substring(0, 100) + '...'
        }));

        return res.json({
          multipleResults: true,
          patriarchs: patriarchsList,
          message: `تم العثور على ${searchResults.length} بطريرك بهذا الاسم. اختر واحداً منهم:`
        });
      }

      // إذا كان البحث محدد أو نتيجة واحدة فقط
      let selectedPatriarch;
      
      if (searchResults.length === 1) {
        selectedPatriarch = searchResults[0];
      } else {
        // البحث عن تطابق دقيق أولاً
        const exactMatch = searchResults.find(p => 
          (p.arabicName && p.arabicName === searchTerm) ||
          (p.name && p.name.toLowerCase() === searchTerm.toLowerCase())
        );
        
        if (exactMatch) {
          selectedPatriarch = exactMatch;
        } else {
          // إذا لم يوجد تطابق دقيق، خذ الأول من النتائج
          selectedPatriarch = searchResults[0];
        }
      }

      console.log(`Found patriarch: ${selectedPatriarch.arabicName || selectedPatriarch.name} (Order: ${selectedPatriarch.orderNumber})`);

      // Generate summary using Gemini AI with the patriarch array
      const summary = await generateSmartSummary([selectedPatriarch]);

      res.json({
        summary,
        patriarch: {
          name: selectedPatriarch.arabicName || selectedPatriarch.name,
          englishName: selectedPatriarch.name,
          orderNumber: selectedPatriarch.orderNumber,
          startYear: selectedPatriarch.startYear,
          endYear: selectedPatriarch.endYear,
          era: selectedPatriarch.era
        }
      });
    } catch (error) {
      console.error("Error generating smart summary:", error);
      
      if (error instanceof Error && error.message.includes('API key')) {
        return res.status(500).json({ error: "لم يتم تكوين مفتاح API الخاص بـ Gemini" });
      }
      
      res.status(500).json({ error: "حدث خطأ أثناء توليد الملخص. يرجى المحاولة مرة أخرى." });
    }
  });

  // Get all patriarchs with optional filtering
  app.get("/api/patriarchs", async (req, res) => {
    try {
      const { search, era, heresies, showAll } = req.query;
      const filters = {
        searchQuery: search as string,
        era: era as string,
        heresies: heresies ? (heresies as string).split(',') : undefined,
      };

      const patriarchs = await storage.getPatriarchs(filters);
      
      // If showAll is requested, return with enhanced metadata
      if (showAll === 'true') {
        const enhancedPatriarchs = patriarchs.map(patriarch => {
          let heresiesList = [];
          try {
            heresiesList = Array.isArray(patriarch.heresiesFought) 
              ? patriarch.heresiesFought 
              : JSON.parse(patriarch.heresiesFought || '[]');
          } catch (e) {
            heresiesList = [];
          }
          
          const serviceDuration = patriarch.endYear 
            ? patriarch.endYear - patriarch.startYear 
            : new Date().getFullYear() - patriarch.startYear;
            
          return {
            ...patriarch,
            heresiesList,
            serviceDuration,
            displayName: patriarch.arabicName || patriarch.name,
            isCurrentPatriarch: !patriarch.endYear,
            centuryStart: Math.floor(patriarch.startYear / 100) + 1,
            formattedPeriod: `${patriarch.startYear} - ${patriarch.endYear || 'الآن'}`,
            shortBio: patriarch.biography ? patriarch.biography.substring(0, 200) + '...' : 'غير متوفر'
          };
        });
        
        return res.json({
          patriarchs: enhancedPatriarchs,
          totalCount: enhancedPatriarchs.length,
          metadata: {
            totalPatriarchs: enhancedPatriarchs.length,
            currentPatriarch: enhancedPatriarchs.find(p => p.isCurrentPatriarch),
            firstPatriarch: enhancedPatriarchs[0],
            eras: Array.from(new Set(enhancedPatriarchs.map(p => p.era))),
            averageService: Math.round(
              enhancedPatriarchs
                .filter(p => p.endYear)
                .reduce((sum, p) => sum + p.serviceDuration, 0) /
              enhancedPatriarchs.filter(p => p.endYear).length
            )
          }
        });
      }
      
      res.json(patriarchs);
    } catch (error) {
      console.error("Error fetching patriarchs:", error);
      res.status(500).json({ message: "Failed to fetch patriarchs" });
    }
  });

  // Generate summary for a specific patriarch by ID
  app.post("/api/generate-summary-by-id", async (req, res) => {
    try {
      const { patriarchId, tone } = req.body;

      if (!patriarchId || typeof patriarchId !== 'number') {
        return res.status(400).json({ error: "معرف البطريرك مطلوب" });
      }

      const patriarch = await storage.getPatriarch(patriarchId);
      
      if (!patriarch) {
        return res.status(404).json({ error: "لم يتم العثور على البطريرك" });
      }

      console.log(`Generating summary for patriarch: ${patriarch.arabicName || patriarch.name} (Order: ${patriarch.orderNumber})`);

      // Generate summary using Gemini AI with the patriarch array
      const summary = await generateSmartSummary([patriarch]);

      res.json({
        summary,
        patriarch: {
          name: patriarch.arabicName || patriarch.name,
          englishName: patriarch.name,
          orderNumber: patriarch.orderNumber,
          startYear: patriarch.startYear,
          endYear: patriarch.endYear,
          era: patriarch.era
        }
      });
    } catch (error) {
      console.error("Error generating summary by ID:", error);
      
      if (error instanceof Error && error.message.includes('API key')) {
        return res.status(500).json({ error: "لم يتم تكوين مفتاح API الخاص بـ Gemini" });
      }
      
      res.status(500).json({ error: "حدث خطأ أثناء توليد الملخص. يرجى المحاولة مرة أخرى." });
    }
  });

  // Generate AI-powered recommendations using Gemini
  app.post("/api/ai-recommendations", async (req, res) => {
    try {
      const { userProfile, preferences } = req.body;

      if (!userProfile || !preferences) {
        return res.status(400).json({ 
          error: "ملف المستخدم والتفضيلات مطلوبة" 
        });
      }

      // Get all patriarchs for AI analysis
      const allPatriarchs = await storage.getPatriarchs();

      if (allPatriarchs.length === 0) {
        return res.status(404).json({ 
          error: "لا توجد بيانات للبطاركة" 
        });
      }

      // Generate AI recommendations using Gemini
      const aiRecommendations = await generateAIRecommendations(
        userProfile, 
        preferences, 
        allPatriarchs
      );

      res.json(aiRecommendations);
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      res.status(500).json({ 
        error: "فشل في إنشاء الاقتراحات الذكية" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}