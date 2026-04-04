import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with subscription and admin role management.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isAdminAuthenticated: boolean("isAdminAuthenticated").default(false).notNull(),
  // Free trial fields (3 days + 100K tokens for new users)
  trialStartDate: timestamp("trialStartDate"),
  trialEndDate: timestamp("trialEndDate"),
  trialTokensRemaining: int("trialTokensRemaining").default(100000),
  isTrialActive: boolean("isTrialActive").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Subscriptions table for tracking user plans and token usage
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planType: mysqlEnum("planType", ["free", "starter", "professional", "elite"]).default("free").notNull(),
  tokensIncluded: int("tokensIncluded").default(0).notNull(),
  tokensUsed: int("tokensUsed").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  promoCode: varchar("promoCode", { length: 50 }),
  discountPercentage: decimal("discountPercentage", { precision: 5, scale: 2 }).default("0"),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "yearly"]).default("monthly").notNull(),
  nextBillingDate: timestamp("nextBillingDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Promo codes table for managing discount codes
 */
export const promoCodes = mysqlTable("promoCodes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountPercentage: decimal("discountPercentage", { precision: 5, scale: 2 }).notNull(),
  maxUses: int("maxUses"),
  currentUses: int("currentUses").default(0).notNull(),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = typeof promoCodes.$inferInsert;

/**
 * Admin authentication table for tracking admin login attempts and recovery codes
 */
export const adminAuth = mysqlTable("adminAuth", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  recoveryCode: varchar("recoveryCode", { length: 255 }).notNull(),
  lastLoginAt: timestamp("lastLoginAt"),
  loginAttempts: int("loginAttempts").default(0).notNull(),
  lockedUntil: timestamp("lockedUntil"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminAuth = typeof adminAuth.$inferSelect;
export type InsertAdminAuth = typeof adminAuth.$inferInsert;

/**
 * AI Models table for tracking the 4 available models
 */
export const aiModels = mysqlTable("aiModels", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  emoji: varchar("emoji", { length: 10 }),
  tagline: text("tagline"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIModel = typeof aiModels.$inferSelect;
export type InsertAIModel = typeof aiModels.$inferInsert;
