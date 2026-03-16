import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leadStatusEnum = pgEnum("lead_status", [
  "Neu",
  "Erstkontakt",
  "Setting",
  "Closing",
  "Wiedervorlage",
  "Verlorener Lead",
]);

export const leadSourceEnum = pgEnum("lead_source", [
  "Google Ads",
  "Organisch",
  "Tool-Import",
  "Manuell",
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "comment",
  "system",
]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role"),
  company: text("company").notNull(),
  status: leadStatusEnum("status").notNull().default("Neu"),
  source: leadSourceEnum("source").notNull().default("Manuell"),
  assignedTo: text("assigned_to"),
  lastContact: timestamp("last_contact", { mode: "string" }),
  nextFollowUp: timestamp("next_follow_up", { mode: "string" }),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  website: text("website").notNull().default(""),
  address: text("address").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  type: activityTypeEnum("type").notNull().default("comment"),
  text: text("text").notNull(),
  authorId: text("author_id"),
  timestamp: timestamp("timestamp", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  timestamp: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type LeadStatus = "Neu" | "Erstkontakt" | "Setting" | "Closing" | "Wiedervorlage" | "Verlorener Lead";
export type LeadSource = "Google Ads" | "Organisch" | "Tool-Import" | "Manuell";
