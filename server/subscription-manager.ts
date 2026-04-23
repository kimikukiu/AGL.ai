/**
 * Enhanced Subscription System
 * Supports multiple plans, token quotas, and promotion codes
 * Admin can manage all via Telegram or web panel
 */

import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  users, 
  subscriptions, 
  promoCodes, 
  adminAuth 
} from "../drizzle/schema";
import { ENV } from './_core/env';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // in USD
  xmrPrice: number; // in XMR
  tokens: number; // total tokens included
  durationDays: number;
  features: string[];
  isActive: boolean;
}

interface UserSubscription {
  userId: number;
  planId: string;
  tokensUsed: number;
  tokensRemaining: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

// Subscription plans
const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    xmrPrice: 0,
    tokens: 100000,
    durationDays: 3,
    features: [
      'Access to GitHub Models (FREE)',
      '100,000 tokens',
      '3-day trial period',
      'Basic support',
      'Limited to 2 req/min',
    ],
    isActive: true,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 25,
    xmrPrice: 0.05,
    tokens: 300000,
    durationDays: 30,
    features: [
      'All 5 LLM Providers',
      '300,000 tokens',
      '30-day access',
      'Email support',
      'Basic analytics',
      'Higher rate limits',
    ],
    isActive: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 90,
    xmrPrice: 0.18,
    tokens: 1500000,
    durationDays: 90,
    features: [
      'All 5 LLM Providers',
      '1.5M tokens',
      '90-day access',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
      'API access',
    ],
    isActive: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 150,
    xmrPrice: 0.30,
    tokens: 3000000,
    durationDays: 180,
    features: [
      'All 5 LLM Providers',
      '3M tokens',
      '180-day access',
      '24/7 VIP support',
      'Full analytics suite',
      'Custom integrations',
      'Dedicated account manager',
      'Whitelabel options',
    ],
    isActive: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 500,
    xmrPrice: 1.0,
    tokens: 10000000, // 10M tokens
    durationDays: 365,
    features: [
      'All LLM Providers + Custom',
      '10M+ tokens',
      '1-year access',
      '24/7 Dedicated support',
      'Full white-label solution',
      'On-premise deployment',
      'Custom model training',
      'SLA guarantee',
    ],
    isActive: true,
  },
];

export class SubscriptionManager {
  /**
   * Get all available plans
   */
  getPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS.filter(p => p.isActive);
  }

  /**
   * Get plan by ID
   */
  getPlan(planId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(p => p.id === planId);
  }

  /**
   * Check if user has sufficient tokens
   */
  async checkTokenQuota(userId: number, estimatedTokens: number = 1000): Promise<{
    allowed: boolean;
    remaining: number;
    plan: string;
  }> {
    const db = await this.getDb();
    if (!db) {
      return { allowed: false, remaining: 0, plan: 'none' };
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      return { allowed: false, remaining: 0, plan: 'none' };
    }

    const subscription = await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (!subscription.length) {
      // No subscription - use free tier
      return { allowed: estimatedTokens <= 1000, remaining: 1000, plan: 'free' };
    }

    const sub = subscription[0];
    const remaining = (sub.tokensIncluded || 0) - (sub.tokensUsed || 0);

    // Check if subscription expired
    if (sub.endDate && new Date(sub.endDate) < new Date()) {
      return { allowed: false, remaining: 0, plan: sub.planType || 'expired' };
    }

    return {
      allowed: remaining >= estimatedTokens,
      remaining,
      plan: sub.planType || 'unknown',
    };
  }

  /**
   * Deduct tokens after API usage
   */
  async deductTokens(userId: number, tokensUsed: number): Promise<boolean> {
    const db = await this.getDb();
    if (!db) return false;

    const subscription = await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (!subscription.length) return false;

    const currentUsed = subscription[0].tokensUsed || 0;
    await db.update(subscriptions)
      .set({ tokensUsed: currentUsed + tokensUsed })
      .where(eq(subscriptions.userId, userId));

    return true;
  }

  /**
   * Create or update subscription
   */
  async createSubscription(userId: number, planId: string): Promise<boolean> {
    const plan = this.getPlan(planId);
    if (!plan) return false;

    const db = await this.getDb();
    if (!db) return false;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    await db.insert(subscriptions).values({
      userId,
      planType: planId,
      tokensIncluded: plan.tokens,
      tokensUsed: 0,
      startDate,
      endDate,
      isActive: true,
    }).onDuplicateKeyUpdate({
      set: {
        planType: planId,
        tokensIncluded: plan.tokens,
        startDate,
        endDate,
        isActive: true,
      },
    });

    return true;
  }

  /**
   * Get user's subscription details
   */
  async getUserSubscription(userId: number): Promise<UserSubscription | null> {
    const db = await this.getDb();
    if (!db) return null;

    const subscription = await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (!subscription.length) return null;

    const sub = subscription[0];
    return {
      userId,
      planId: sub.planType || 'free',
      tokensUsed: sub.tokensUsed || 0,
      tokensRemaining: (sub.tokensIncluded || 0) - (sub.tokensUsed || 0),
      startDate: sub.startDate || new Date(),
      endDate: sub.endDate || new Date(),
      isActive: sub.isActive || false,
    };
  }

  private async getDb() {
    if (!process.env.DATABASE_URL) return null;
    try {
      return drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.error('[Subscription] Database error:', error);
      return null;
    }
  }
}

export const subscriptionManager = new SubscriptionManager();

// Export plan definitions for web UI
export { SUBSCRIPTION_PLANS };
