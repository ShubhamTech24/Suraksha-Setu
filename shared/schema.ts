import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number"),
  location: text("location"),
  role: text("role").notNull().default("user"), // 'admin', 'user'
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const threats = pgTable("threats", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'drone', 'cyber', 'ground', 'air'
  severity: text("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: jsonb("location"), // { lat: number, lng: number, address: string }
  status: text("status").notNull().default("active"), // 'active', 'resolved', 'investigating'
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // AI confidence score
  source: text("source").notNull().default("system"), // 'system', 'user', 'ai'
  metadata: jsonb("metadata"), // Additional threat-specific data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  threatType: text("threat_type").notNull(),
  description: text("description").notNull(),
  location: jsonb("location"), // { lat: number, lng: number, address: string }
  urgencyLevel: text("urgency_level").notNull(), // 'low', 'medium', 'high', 'critical'
  media: jsonb("media"), // Array of file URLs
  isAnonymous: boolean("is_anonymous").default(false),
  status: text("status").notNull().default("pending"), // 'pending', 'verified', 'rejected', 'investigating'
  aiAnalysis: jsonb("ai_analysis"), // AI analysis results
  verifiedBy: integer("verified_by").references(() => users.id),
  adminComment: text("admin_comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const safeZones = pgTable("safe_zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'bunker', 'hospital', 'military_post', 'evacuation_center'
  location: jsonb("location").notNull(), // { lat: number, lng: number, address: string }
  capacity: integer("capacity"),
  facilities: jsonb("facilities"), // Array of available facilities
  contact: text("contact"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  threatId: integer("threat_id").references(() => threats.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull(), // 'info', 'warning', 'alert', 'emergency'
  targetArea: jsonb("target_area"), // Geographic bounds or specific locations
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const educationResources = pgTable("education_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'article', 'video', 'interactive', 'guide'
  category: text("category").notNull(), // 'drone_response', 'evacuation', 'cyber_safety', 'first_aid'
  content: text("content"), // Article content or video URL
  duration: integer("duration"), // Reading time in minutes or video duration
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high', 'essential'
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'emergency', 'army', 'police', 'medical', 'local'
  phoneNumber: text("phone_number").notNull(),
  location: text("location"),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(1),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").references(() => users.id), // null for broadcast messages
  message: text("message").notNull(),
  messageType: text("message_type").notNull().default("text"), // 'text', 'emergency', 'alert', 'file'
  isRead: boolean("is_read").default(false),
  metadata: jsonb("metadata"), // Additional message data like file info
  createdAt: timestamp("created_at").defaultNow(),
});

export const reportComments = pgTable("report_comments", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull().references(() => reports.id),
  userId: integer("user_id").notNull().references(() => users.id),
  comment: text("comment").notNull(),
  isAdminResponse: boolean("is_admin_response").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  phoneNumber: true,
  location: true,
});

export const insertThreatSchema = createInsertSchema(threats).pick({
  type: true,
  severity: true,
  title: true,
  description: true,
  location: true,
  confidence: true,
  source: true,
  metadata: true,
});

export const insertReportSchema = createInsertSchema(reports).pick({
  threatType: true,
  description: true,
  location: true,
  urgencyLevel: true,
  media: true,
  isAnonymous: true,
});

export const insertSafeZoneSchema = createInsertSchema(safeZones).pick({
  name: true,
  type: true,
  location: true,
  capacity: true,
  facilities: true,
  contact: true,
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  threatId: true,
  title: true,
  message: true,
  severity: true,
  targetArea: true,
  expiresAt: true,
});

export const insertEducationResourceSchema = createInsertSchema(educationResources).pick({
  title: true,
  description: true,
  type: true,
  category: true,
  content: true,
  duration: true,
  priority: true,
});

export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).pick({
  name: true,
  type: true,
  phoneNumber: true,
  location: true,
  priority: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  senderId: true,
  receiverId: true,
  message: true,
  messageType: true,
  metadata: true,
});

export const insertReportCommentSchema = createInsertSchema(reportComments).pick({
  reportId: true,
  userId: true,
  comment: true,
  isAdminResponse: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Threat = typeof threats.$inferSelect;
export type InsertThreat = z.infer<typeof insertThreatSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type SafeZone = typeof safeZones.$inferSelect;
export type InsertSafeZone = z.infer<typeof insertSafeZoneSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type EducationResource = typeof educationResources.$inferSelect;
export type InsertEducationResource = z.infer<typeof insertEducationResourceSchema>;

export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type ReportComment = typeof reportComments.$inferSelect;
export type InsertReportComment = z.infer<typeof insertReportCommentSchema>;
