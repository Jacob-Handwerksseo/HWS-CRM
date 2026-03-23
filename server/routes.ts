import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertActivitySchema } from "@shared/schema";
import { z } from "zod";
import { requireAuth } from "./auth";


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/leads", requireAuth, async (_req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const lead = await storage.getLead(req.params.id);
      if (!lead) return res.status(404).json({ message: "Lead not found" });
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  app.post("/api/leads", requireAuth, async (req, res) => {
    try {
      const parsed = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(parsed);
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating lead:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.patch("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const lead = await storage.updateLead(req.params.id, req.body);
      if (!lead) return res.status(404).json({ message: "Lead not found" });
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteLead(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Lead not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  app.get("/api/leads/:id/activities", requireAuth, async (req, res) => {
    try {
      const acts = await storage.getActivities(req.params.id);
      res.json(acts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/leads/:id/activities", requireAuth, async (req, res) => {
    try {
      const parsed = insertActivitySchema.parse({
        ...req.body,
        leadId: req.params.id,
      });
      const activity = await storage.createActivity(parsed);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating activity:", error);
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  app.patch("/api/activities/:id", requireAuth, async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ message: "Text is required" });
      const activity = await storage.updateActivity(req.params.id, text);
      if (!activity) return res.status(404).json({ message: "Activity not found" });
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to update activity" });
    }
  });

  app.post("/api/leads/bulk-delete", requireAuth, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ message: "IDs erforderlich" });
      const count = await storage.bulkDeleteLeads(ids);
      res.json({ success: true, deleted: count });
    } catch (error) {
      res.status(500).json({ message: "Bulk-Löschen fehlgeschlagen" });
    }
  });

  app.post("/api/leads/bulk-update", requireAuth, async (req, res) => {
    try {
      const { ids, data } = req.body;
      if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ message: "IDs erforderlich" });
      const count = await storage.bulkUpdateLeads(ids, data);
      res.json({ success: true, updated: count });
    } catch (error) {
      res.status(500).json({ message: "Bulk-Update fehlgeschlagen" });
    }
  });

  app.post("/api/seed", async (_req, res) => {
    try {
      const existingLeads = await storage.getLeads();
      if (existingLeads.length > 0) {
        return res.json({ message: "Database already has data", count: existingLeads.length });
      }

      const now = new Date();
      const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000).toISOString();
      const subDays = (d: Date, n: number) => new Date(d.getTime() - n * 86400000).toISOString();
      const subHours = (d: Date, n: number) => new Date(d.getTime() - n * 3600000).toISOString();

      const andre = await storage.getUserByUsername("andre");
      const jacob = await storage.getUserByUsername("jacob");
      const andreId = andre?.id || null;
      const jacobId = jacob?.id || null;

      const seedLeads = [
        { name: "Thomas Müller", role: "Geschäftsführer", company: "TechNova GmbH", status: "Neu" as const, source: "Website Leads", assignedTo: andreId, nextFollowUp: addDays(now, 1), phone: "+49 151 1234567", email: "thomas.m@technova.de", website: "www.technova.de", address: "Technologiering 1, 10115 Berlin", notes: "Sucht nach einer neuen CRM Lösung für 50 Mitarbeiter." },
        { name: "Sarah Becker", role: "Marketing Leitung", company: "WebSolutions AG", status: "Erstkontakt" as const, source: "Tool-Import", assignedTo: jacobId, lastContact: subHours(now, 2), nextFollowUp: addDays(now, 3), phone: "+49 172 9876543", email: "s.becker@websolutions.com", website: "www.websolutions.com", address: "Digitalweg 5, 80331 München", notes: "Interessiert an Enterprise Paket." },
        { name: "Michael Kraft", role: "Inhaber", company: "Kraft & Söhne", status: "Neu" as const, source: "Video-Analyse", assignedTo: null, nextFollowUp: addDays(now, 2), phone: "+49 30 555444", email: "info@kraft-soehne.de", website: "", address: "Handwerkergasse 12, 50667 Köln", notes: "Kaltakquise auf der Messe getroffen." },
        { name: "Julia Neumann", company: "Nexus Design", status: "Setting" as const, source: "Website Leads", assignedTo: andreId, lastContact: subDays(now, 1), nextFollowUp: addDays(now, 5), phone: "+49 160 1112223", email: "julia@nexus-design.io", website: "nexus-design.io", address: "Kreativplatz 8, 20457 Hamburg", notes: "Budget ist vorhanden, Entscheidungsträgerin." },
        { name: "Frank Hoffmann", company: "Hoffmann Logistics", status: "Closing" as const, source: "Tool-Import", assignedTo: jacobId, lastContact: subDays(now, 3), nextFollowUp: addDays(now, 1), phone: "+49 40 888999", email: "frank.h@h-logistics.de", website: "www.h-logistics.de", address: "Hafenstraße 100, 20457 Hamburg", notes: "Wir verhandeln über 10% Rabatt bei Jahresvertrag." },
        { name: "Elena Wagner", company: "Green Future e.V.", status: "Closing" as const, source: "Video-Analyse", assignedTo: andreId, lastContact: subDays(now, 7), phone: "+49 151 777666", email: "ewagner@greenfuture.org", website: "greenfuture.org", address: "Ökoweg 1, 10115 Berlin", notes: "Vertrag ist unterschrieben!" },
        { name: "Laura Meyer", company: "EduTech", status: "Neu" as const, source: "Website Leads", assignedTo: null, phone: "+49 170 5556667", email: "laura@edutech.de", website: "edutech.de", address: "", notes: "" },
        { name: "Christian Wolf", company: "Wolf Consulting", status: "Erstkontakt" as const, source: "Video-Analyse", assignedTo: andreId, lastContact: subHours(now, 1), nextFollowUp: addDays(now, 2), phone: "+49 89 777888", email: "cwolf@consulting-wolf.de", website: "", address: "", notes: "Erster Kontakt hergestellt. Rückruf am Freitag." },
        { name: "Sophie Bauer", company: "HealthCare Plus", status: "Neu" as const, source: "Tool-Import", assignedTo: jacobId, nextFollowUp: addDays(now, 1), phone: "+49 152 3334445", email: "s.bauer@healthcare-plus.de", website: "", address: "Medizinring 2, 80331 München", notes: "Wichtiger Lead, sofort anrufen!" },
        { name: "Markus Lehmann", company: "Lehmann Bau", status: "Setting" as const, source: "Video-Analyse", assignedTo: andreId, lastContact: subDays(now, 2), nextFollowUp: addDays(now, 4), phone: "+49 711 999000", email: "m.lehmann@lehmann-bau.de", website: "lehmann-bau.de", address: "Baustraße 4, 70173 Stuttgart", notes: "Suchen nach einer mobilen Lösung für Poliere." },
        { name: "Nadine Koch", company: "Retail Partners", status: "Closing" as const, source: "Website Leads", assignedTo: jacobId, lastContact: subDays(now, 1), nextFollowUp: addDays(now, 2), phone: "+49 40 111222", email: "n.koch@retail-partners.de", website: "", address: "Einkaufsmeile 1, 20095 Hamburg", notes: "Entscheidung fällt nächste Woche." },
        { name: "Simon Krause", company: "Smart Energy", status: "Neu" as const, source: "Tool-Import", assignedTo: null, phone: "+49 160 888777", email: "skrause@smart-energy.de", website: "", address: "", notes: "Importiert aus altem System." },
        { name: "Tanja Schmid", company: "Schmid Gastro", status: "Erstkontakt" as const, source: "Video-Analyse", assignedTo: andreId, lastContact: subDays(now, 4), nextFollowUp: addDays(now, 3), phone: "+49 89 555666", email: "t.schmid@schmid-gastro.de", website: "schmid-gastro.de", address: "Restaurantweg 8, 80331 München", notes: "Wartet auf Informationsmaterial." },
        { name: "Oliver Jäger", company: "Jäger IT", status: "Neu" as const, source: "Website Leads", assignedTo: jacobId, nextFollowUp: addDays(now, 1), phone: "+49 171 444555", email: "oliver@jaeger-it.de", website: "jaeger-it.de", address: "Systemstraße 10, 10115 Berlin", notes: "Interessiert an API Integration." },
      ];

      for (const leadData of seedLeads) {
        const lead = await storage.createLead(leadData);
        await storage.createActivity({
          leadId: lead.id,
          type: "system",
          text: `Lead erstellt (${leadData.source})`,
          authorId: null,
        });
      }

      res.json({ message: "Seeded successfully", count: seedLeads.length });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ message: "Failed to seed data" });
    }
  });

  return httpServer;
}
