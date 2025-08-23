import dotenv from "dotenv";
// Load environment variables from .env.local first
dotenv.config({ path: '.env.local' });

import express, { type Request, Response, NextFunction } from "express";

// Load environment variables silently - This line is not needed because dotenv.config({ path: '.env.local' }); already load environment variables from .env.local
// dotenv.config({ 
//   path: '.env.local',
//   silent: true,
//   debug: false
// });

import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed-data";
import { db } from "./db";

const app = express();

// Secure CORS headers - only allow same origin in production
app.use((req, res, next) => {
  const allowedOrigins = process.env.NODE_ENV === 'development' 
    ? ['http://localhost:5000', 'https://*.replit.dev', 'https://*.replit.app']
    : [req.get('origin') || req.get('host')];
  
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.some(allowed => {
    if (allowed && allowed.includes('*')) {
      return new RegExp(allowed.replace('*', '.*')).test(origin);
    }
    return allowed === origin;
  })) {
    res.header('Access-Control-Allow-Origin', origin || 'same-origin');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

    // إدراج البيانات الأولية إذا كانت قاعدة البيانات فارغة
  try {
    const existingPatriarchs = await db.query.patriarchs.findMany();
    if (existingPatriarchs.length === 0) {
      await seedDatabase();
    }
  } catch (error) {
    console.error("خطأ في فحص قاعدة البيانات:", error);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();