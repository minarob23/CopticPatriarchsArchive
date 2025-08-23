import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Simple admin credentials
const ADMIN_USERNAME = "admin@coptic-patriarchs.org";
const ADMIN_PASSWORD = "CopticPatriarchs2025!";

declare module 'express-session' {
  interface SessionData {
    isAuthenticated?: boolean;
    user?: {
      username: string;
      isAdmin: boolean;
    };
  }
}

export async function setupAuth(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    tableName: 'sessions'
  });

  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "fallback-secret-key-for-development",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: sessionTtl,
        sameSite: 'lax'
      },
    })
  );

  // Login route
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      req.session.isAuthenticated = true;
      req.session.user = {
        username: ADMIN_USERNAME,
        isAdmin: true
      };
      
      res.json({ 
        success: true, 
        user: { 
          username: ADMIN_USERNAME,
          isAdmin: true 
        } 
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: "اسم المستخدم أو كلمة المرور غير صحيحة" 
      });
    }
  });

  // Logout routes (both GET and POST for compatibility)
  const handleLogout = (req: any, res: any) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Logout error:', err);
        return res.redirect('/');
      }
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  };

  app.post('/api/auth/logout', handleLogout);
  app.get('/api/logout', handleLogout);

  // Get current user route
  app.get('/api/auth/user', (req, res) => {
    if (req.session.isAuthenticated && req.session.user) {
      res.json(req.session.user);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session.isAuthenticated && req.session.user?.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};