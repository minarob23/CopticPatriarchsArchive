import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPatriarchSchema, updatePatriarchSchema } from "@shared/schema";
import { z } from "zod";
import { chatbotService } from "./chatbot";

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

  // Chatbot routes
  app.post('/api/chatbot/chat', async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      const response = await chatbotService.chat(message);
      res.json({ response });
    } catch (error) {
      console.error("Error in chatbot chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Admin chatbot configuration
  app.post('/api/admin/chatbot/config', isAuthenticated, async (req, res) => {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey || typeof apiKey !== 'string') {
        return res.status(400).json({ message: "API key is required" });
      }

      const success = await chatbotService.setApiKey(apiKey);
      
      if (success) {
        res.json({ message: "Gemini API key configured successfully" });
      } else {
        res.status(400).json({ message: "Invalid API key or configuration failed" });
      }
    } catch (error) {
      console.error("Error configuring chatbot:", error);
      res.status(500).json({ message: "Failed to configure chatbot" });
    }
  });

  app.get('/api/admin/chatbot/status', isAuthenticated, async (req, res) => {
    try {
      const isConfigured = chatbotService.isConfigured();
      res.json({ configured: isConfigured });
    } catch (error) {
      console.error("Error checking chatbot status:", error);
      res.status(500).json({ message: "Failed to check chatbot status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
