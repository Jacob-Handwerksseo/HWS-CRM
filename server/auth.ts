import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcrypt";
import { storage } from "./storage";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const PgSession = connectPgSimple(session);

export function setupAuth(app: Express) {
  app.use(
    session({
      store: new PgSession({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "handwerks-crm-secret-key-change-me",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
    })
  );

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Benutzername und Passwort erforderlich" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Ungültige Anmeldedaten" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Ungültige Anmeldedaten" });
      }

      req.session.userId = user.id;
      res.json({ id: user.id, username: user.username, name: user.name });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login fehlgeschlagen" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout fehlgeschlagen" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Nicht angemeldet" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Benutzer nicht gefunden" });
    }

    res.json({ id: user.id, username: user.username, name: user.name });
  });

  app.patch("/api/auth/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { username, name, currentPassword, newPassword } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Benutzer nicht gefunden" });
      }

      const updateData: Partial<{ username: string; name: string; password: string }> = {};

      if (username && username !== user.username) {
        const existing = await storage.getUserByUsername(username);
        if (existing) {
          return res.status(400).json({ message: "Benutzername bereits vergeben" });
        }
        updateData.username = username;
      }

      if (name) {
        updateData.name = name;
      }

      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ message: "Aktuelles Passwort erforderlich" });
        }
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) {
          return res.status(400).json({ message: "Aktuelles Passwort ist falsch" });
        }
        updateData.password = await bcrypt.hash(newPassword, 10);
      }

      if (Object.keys(updateData).length === 0) {
        return res.json({ id: user.id, username: user.username, name: user.name });
      }

      const updated = await storage.updateUser(userId, updateData);
      if (!updated) {
        return res.status(500).json({ message: "Update fehlgeschlagen" });
      }

      res.json({ id: updated.id, username: updated.username, name: updated.name });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Profil-Update fehlgeschlagen" });
    }
  });

  app.get("/api/users", requireAuth, async (_req: Request, res: Response) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers.map((u) => ({ id: u.id, username: u.username, name: u.name })));
    } catch (error) {
      res.status(500).json({ message: "Benutzer laden fehlgeschlagen" });
    }
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Nicht angemeldet" });
  }
  next();
}

export async function seedUsers() {
  const existing = await storage.getAllUsers();
  if (existing.length > 0) return;

  const hash1 = await bcrypt.hash("andre123", 10);
  const hash2 = await bcrypt.hash("jacob123", 10);

  await storage.createUser({ username: "andre", name: "André", password: hash1 });
  await storage.createUser({ username: "jacob", name: "Jacob", password: hash2 });

  console.log("Users seeded: andre/andre123, jacob/jacob123");
}
