import { 
  users, threats, reports, safeZones, alerts, educationResources, emergencyContacts, chatMessages, reportComments,
  type User, type InsertUser, type Threat, type InsertThreat, type Report, type InsertReport,
  type SafeZone, type InsertSafeZone, type Alert, type InsertAlert,
  type EducationResource, type InsertEducationResource, type EmergencyContact, type InsertEmergencyContact,
  type ChatMessage, type InsertChatMessage, type ReportComment, type InsertReportComment
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, or, lt, gt } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Threat management
  getThreats(limit?: number): Promise<Threat[]>;
  getThreat(id: number): Promise<Threat | undefined>;
  createThreat(threat: InsertThreat): Promise<Threat>;
  updateThreat(id: number, updates: Partial<Threat>): Promise<Threat | undefined>;
  getActiveThreatCount(): Promise<number>;

  // Report management
  getReports(userId?: number): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: number, updates: Partial<Report>): Promise<Report | undefined>;
  getPendingReportsCount(): Promise<number>;

  // Safe zone management
  getSafeZones(location?: { lat: number; lng: number; radius?: number }): Promise<SafeZone[]>;
  getSafeZone(id: number): Promise<SafeZone | undefined>;
  createSafeZone(safeZone: InsertSafeZone): Promise<SafeZone>;

  // Alert management
  getActiveAlerts(): Promise<Alert[]>;
  getAlert(id: number): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, updates: Partial<Alert>): Promise<Alert | undefined>;

  // Education resources
  getEducationResources(category?: string): Promise<EducationResource[]>;
  getEducationResource(id: number): Promise<EducationResource | undefined>;
  createEducationResource(resource: InsertEducationResource): Promise<EducationResource>;

  // Emergency contacts
  getEmergencyContacts(): Promise<EmergencyContact[]>;
  getEmergencyContact(id: number): Promise<EmergencyContact | undefined>;
  createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact>;

  // Chat messages
  getChatMessages(userId?: number, receiverId?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markMessageAsRead(messageId: number): Promise<void>;

  // Report comments
  getReportComments(reportId: number): Promise<ReportComment[]>;
  createReportComment(comment: InsertReportComment): Promise<ReportComment>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getThreats(limit = 50): Promise<Threat[]> {
    return await db.select().from(threats)
      .orderBy(desc(threats.createdAt))
      .limit(limit);
  }

  async getThreat(id: number): Promise<Threat | undefined> {
    const [threat] = await db.select().from(threats).where(eq(threats.id, id));
    return threat || undefined;
  }

  async createThreat(threat: InsertThreat): Promise<Threat> {
    const [newThreat] = await db.insert(threats).values(threat).returning();
    return newThreat;
  }

  async updateThreat(id: number, updates: Partial<Threat>): Promise<Threat | undefined> {
    const [updatedThreat] = await db.update(threats)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(threats.id, id))
      .returning();
    return updatedThreat || undefined;
  }

  async getActiveThreatCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(threats)
      .where(eq(threats.status, "active"));
    return result.count;
  }

  async getReports(userId?: number): Promise<Report[]> {
    const query = db.select().from(reports);
    
    if (userId) {
      return await query.where(eq(reports.userId, userId)).orderBy(desc(reports.createdAt));
    }
    
    return await query.orderBy(desc(reports.createdAt));
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report || undefined;
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async updateReport(id: number, updates: Partial<Report>): Promise<Report | undefined> {
    const [updatedReport] = await db.update(reports)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(reports.id, id))
      .returning();
    return updatedReport || undefined;
  }

  async getPendingReportsCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(reports)
      .where(eq(reports.status, "pending"));
    return result.count;
  }

  async getSafeZones(location?: { lat: number; lng: number; radius?: number }): Promise<SafeZone[]> {
    const query = db.select().from(safeZones).where(eq(safeZones.isActive, true));
    
    // Note: For production, implement proper geospatial queries
    // This is a simplified version
    return await query;
  }

  async getSafeZone(id: number): Promise<SafeZone | undefined> {
    const [safeZone] = await db.select().from(safeZones).where(eq(safeZones.id, id));
    return safeZone || undefined;
  }

  async createSafeZone(safeZone: InsertSafeZone): Promise<SafeZone> {
    const [newSafeZone] = await db.insert(safeZones).values(safeZone).returning();
    return newSafeZone;
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts)
      .where(
        and(
          eq(alerts.isActive, true),
          or(
            sql`${alerts.expiresAt} IS NULL`,
            gt(alerts.expiresAt, new Date())
          )
        )
      )
      .orderBy(desc(alerts.createdAt));
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, id));
    return alert || undefined;
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async updateAlert(id: number, updates: Partial<Alert>): Promise<Alert | undefined> {
    const [updatedAlert] = await db.update(alerts)
      .set(updates)
      .where(eq(alerts.id, id))
      .returning();
    return updatedAlert || undefined;
  }

  async getEducationResources(category?: string): Promise<EducationResource[]> {
    const query = db.select().from(educationResources)
      .where(eq(educationResources.isPublished, true));
    
    if (category) {
      return await query.where(
        and(
          eq(educationResources.isPublished, true),
          eq(educationResources.category, category)
        )
      ).orderBy(desc(educationResources.priority));
    }
    
    return await query.orderBy(desc(educationResources.priority));
  }

  async getEducationResource(id: number): Promise<EducationResource | undefined> {
    const [resource] = await db.select().from(educationResources).where(eq(educationResources.id, id));
    return resource || undefined;
  }

  async createEducationResource(resource: InsertEducationResource): Promise<EducationResource> {
    const [newResource] = await db.insert(educationResources).values(resource).returning();
    return newResource;
  }

  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    return await db.select().from(emergencyContacts)
      .where(eq(emergencyContacts.isActive, true))
      .orderBy(emergencyContacts.priority);
  }

  async getEmergencyContact(id: number): Promise<EmergencyContact | undefined> {
    const [contact] = await db.select().from(emergencyContacts).where(eq(emergencyContacts.id, id));
    return contact || undefined;
  }

  async createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact> {
    const [newContact] = await db.insert(emergencyContacts).values(contact).returning();
    return newContact;
  }

  // Chat messages implementation
  async getChatMessages(userId?: number, receiverId?: number): Promise<ChatMessage[]> {
    let query = db.select().from(chatMessages);
    
    if (userId && receiverId) {
      query = query.where(
        or(
          and(eq(chatMessages.senderId, userId), eq(chatMessages.receiverId, receiverId)),
          and(eq(chatMessages.senderId, receiverId), eq(chatMessages.receiverId, userId))
        )
      );
    } else if (userId) {
      query = query.where(
        or(eq(chatMessages.senderId, userId), eq(chatMessages.receiverId, userId))
      );
    }
    
    return await query.orderBy(desc(chatMessages.createdAt));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await db.update(chatMessages)
      .set({ isRead: true })
      .where(eq(chatMessages.id, messageId));
  }

  // Report comments implementation
  async getReportComments(reportId: number): Promise<ReportComment[]> {
    return await db.select().from(reportComments)
      .where(eq(reportComments.reportId, reportId))
      .orderBy(desc(reportComments.createdAt));
  }

  async createReportComment(comment: InsertReportComment): Promise<ReportComment> {
    const [newComment] = await db.insert(reportComments).values(comment).returning();
    return newComment;
  }
}

export const storage = new DatabaseStorage();
