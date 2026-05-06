import { eq, desc, inArray, isNull, and } from "drizzle-orm";
import { db } from "./db";
import {
  users, leads, activities, emailConfigs, notifications,
  type User, type InsertUser,
  type Lead, type InsertLead,
  type Activity, type InsertActivity,
  type EmailConfig, type InsertEmailConfig,
  type Notification,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<{ username: string; name: string; password: string }>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  getLeads(): Promise<Lead[]>;
  getLeadsByAssignee(userId: string): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, data: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<boolean>;

  getActivities(leadId: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: string, text: string): Promise<Activity | undefined>;
  deleteActivity(id: string): Promise<boolean>;

  getEmailConfig(): Promise<EmailConfig | undefined>;
  saveEmailConfig(config: InsertEmailConfig): Promise<EmailConfig>;
  updateEmailConfig(id: string, data: Partial<EmailConfig>): Promise<EmailConfig | undefined>;

  bulkDeleteLeads(ids: string[]): Promise<number>;
  bulkUpdateLeads(ids: string[], data: Partial<InsertLead>): Promise<number>;

  createNotification(userId: string, leadId: string): Promise<Notification>;
  getUnseenNotifications(userId: string): Promise<Notification[]>;
  markNotificationSeen(userId: string, leadId: string): Promise<void>;
  deleteNotification(userId: string, leadId: string): Promise<void>;
  deleteNotificationsForLead(leadId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<{ username: string; name: string; password: string }>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getLeads(): Promise<Lead[]> {
    return db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLeadsByAssignee(userId: string): Promise<Lead[]> {
    return db.select().from(leads)
      .where(eq(leads.assignedTo, userId))
      .orderBy(desc(leads.createdAt));
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [created] = await db.insert(leads).values(lead).returning();
    return created;
  }

  async updateLead(id: string, data: Partial<InsertLead>): Promise<Lead | undefined> {
    const [updated] = await db.update(leads).set(data).where(eq(leads.id, id)).returning();
    return updated;
  }

  async deleteLead(id: string): Promise<boolean> {
    const result = await db.delete(leads).where(eq(leads.id, id)).returning();
    return result.length > 0;
  }

  async getActivities(leadId: string): Promise<Activity[]> {
    return db.select().from(activities).where(eq(activities.leadId, leadId)).orderBy(activities.timestamp);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [created] = await db.insert(activities).values(activity).returning();
    return created;
  }

  async updateActivity(id: string, text: string): Promise<Activity | undefined> {
    const [updated] = await db
      .update(activities)
      .set({ text, updatedAt: new Date().toISOString() })
      .where(eq(activities.id, id))
      .returning();
    return updated;
  }

  async deleteActivity(id: string): Promise<boolean> {
    const result = await db.delete(activities).where(eq(activities.id, id)).returning();
    return result.length > 0;
  }

  async bulkDeleteLeads(ids: string[]): Promise<number> {
    if (!ids.length) return 0;
    const result = await db.delete(leads).where(inArray(leads.id, ids));
    return ids.length;
  }

  async bulkUpdateLeads(ids: string[], data: Partial<InsertLead>): Promise<number> {
    if (!ids.length) return 0;
    await db.update(leads).set(data).where(inArray(leads.id, ids));
    return ids.length;
  }

  async createNotification(userId: string, leadId: string): Promise<Notification> {
    await db.delete(notifications).where(
      and(eq(notifications.userId, userId), eq(notifications.leadId, leadId))
    );
    const [created] = await db.insert(notifications).values({ userId, leadId }).returning();
    return created;
  }

  async getUnseenNotifications(userId: string): Promise<Notification[]> {
    return db.select().from(notifications).where(
      and(eq(notifications.userId, userId), isNull(notifications.seenAt))
    );
  }

  async markNotificationSeen(userId: string, leadId: string): Promise<void> {
    await db.update(notifications)
      .set({ seenAt: new Date().toISOString() })
      .where(and(eq(notifications.userId, userId), eq(notifications.leadId, leadId)));
  }

  async deleteNotification(userId: string, leadId: string): Promise<void> {
    await db.delete(notifications).where(
      and(eq(notifications.userId, userId), eq(notifications.leadId, leadId))
    );
  }

  async deleteNotificationsForLead(leadId: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.leadId, leadId));
  }

  async getEmailConfig(): Promise<EmailConfig | undefined> {
    const [config] = await db.select().from(emailConfigs).limit(1);
    return config;
  }

  async saveEmailConfig(config: InsertEmailConfig): Promise<EmailConfig> {
    const existing = await this.getEmailConfig();
    if (existing) {
      const [updated] = await db
        .update(emailConfigs)
        .set({ ...config, updatedAt: new Date().toISOString() })
        .where(eq(emailConfigs.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(emailConfigs).values(config).returning();
    return created;
  }

  async updateEmailConfig(id: string, data: Partial<EmailConfig>): Promise<EmailConfig | undefined> {
    const [updated] = await db
      .update(emailConfigs)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(emailConfigs.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
