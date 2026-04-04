import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, subscriptions, promoCodes, adminAuth } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process***REMOVED***.DATABASE_URL) {
    try {
      _db = drizzle(process***REMOVED***.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSubscriptionByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubscription(userId: number, planType: string = "free") {
  const db = await getDb();
  if (!db) return undefined;

  const tokenMap: Record<string, number> = {
    free: 10000,
    starter: 300000,
    professional: 1500000,
    elite: 3000000,
  };

  const result = await db.insert(subscriptions).values({
    userId,
    planType: planType as any,
    tokensIncluded: tokenMap[planType] || 10000,
  });

  return result;
}

export async function updateSubscriptionTokens(userId: number, tokensUsed: number) {
  const db = await getDb();
  if (!db) return undefined;

  return await db.update(subscriptions)
    .set({ tokensUsed })
    .where(eq(subscriptions.userId, userId));
}

export async function validatePromoCode(code: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(promoCodes)
    .where(
      and(
        eq(promoCodes.code, code.toUpperCase()),
        eq(promoCodes.isActive, true)
      )
    )
    .limit(1);

  if (result.length === 0) return null;

  const promo = result[0];
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return null;
  }

  if (promo.maxUses && promo.currentUses >= promo.maxUses) {
    return null;
  }

  return promo;
}

export async function incrementPromoCodeUse(promoId: number) {
  const db = await getDb();
  if (!db) return undefined;

  return await db.update(promoCodes)
    .set({ currentUses: (promoCodes.currentUses as any) + 1 })
    .where(eq(promoCodes.id, promoId));
}

export async function getAdminAuth(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(adminAuth).where(eq(adminAuth.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAdminAuth(userId: number, passwordHash: string, recoveryCode: string) {
  const db = await getDb();
  if (!db) return undefined;

  return await db.insert(adminAuth).values({
    userId,
    passwordHash,
    recoveryCode,
  });
}

export async function updateAdminLoginAttempt(userId: number, success: boolean) {
  const db = await getDb();
  if (!db) return undefined;

  if (success) {
    return await db.update(adminAuth)
      .set({ 
        lastLoginAt: new Date(),
        loginAttempts: 0,
        lockedUntil: null,
      })
      .where(eq(adminAuth.userId, userId));
  } else {
    const auth = await getAdminAuth(userId);
    if (!auth) return undefined;

    const newAttempts = auth.loginAttempts + 1;
    const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

    return await db.update(adminAuth)
      .set({ 
        loginAttempts: newAttempts,
        lockedUntil,
      })
      .where(eq(adminAuth.userId, userId));
  }
}

/**
 * Initialize free trial for new user (3 days + 100K tokens)
 */
export async function initializeFreeTrial(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const now = new Date();
  const trialEndDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

  return await db.update(users)
    .set({
      isTrialActive: true,
      trialStartDate: now,
      trialEndDate,
      trialTokensRemaining: 100000,
    })
    .where(eq(users.id, userId));
}

/**
 * Get all AI models
 */
export async function getAIModels() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(aiModels).where(eq(aiModels.isActive, true));
}

/**
 * Create default AI models if they don't exist
 */
export async function initializeAIModels() {
  const db = await getDb();
  if (!db) return undefined;

  const defaultModels = [
    {
      name: 'Kali GPT',
      slug: 'kali-gpt',
      emoji: '🛠️',
      tagline: 'Penetration Testing & Network Security',
      description: 'Specialized in network penetration testing, vulnerability assessment, and security tools',
    },
    {
      name: 'Dark GPT',
      slug: 'dark-gpt',
      emoji: '🧠',
      tagline: 'Advanced Threat Intelligence',
      description: 'Deep threat analysis, dark web intelligence, and advanced security research',
    },
    {
      name: 'Zero Day GPT',
      slug: 'zero-day-gpt',
      emoji: '💻',
      tagline: 'Exploit Development & PoC',
      description: 'Zero-day vulnerability research, exploit development, and proof of concept creation',
    },
    {
      name: 'Onion GPT',
      slug: 'onion-gpt',
      emoji: '🧅',
      tagline: 'Privacy & Anonymity',
      description: 'Privacy-first solutions, anonymity techniques, and secure communication methods',
    },
    {
      name: 'Red Team Operator',
      slug: 'red-team-operator',
      emoji: '🎯',
      tagline: 'Advanced Red Team Operations',
      description: 'Deep reasoning and advanced pentesting strategies for comprehensive security assessments',
    },
  ];

  for (const model of defaultModels) {
    try {
      await db.insert(aiModels).values(model).onDuplicateKeyUpdate({
        set: { description: model.description },
      });
    } catch (error) {
      console.warn(`Failed to insert AI model ${model.name}:`, error);
    }
  }
}
