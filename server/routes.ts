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
      console.error("Error updating patriarch:", error);
      console.error("Stack trace:", error.stack);
      res.status(500).json({ 
        message: "Failed to update patriarch",
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
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

   // Generate smart summary for a patriarch using Gemini AI
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

      // Generate summary using Gemini AI with the patriarch object
      const summary = await generateSmartSummary(patriarch, tone || 'easy');

      res.json({
        summary,
        patriarch: {
          name: patriarch.arabicName || patriarch.name,
          orderNumber: patriarch.orderNumber,
          startYear: patriarch.startYear,
          endYear: patriarch.endYear,
          era: patriarch.era
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