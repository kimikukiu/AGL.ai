import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { 
  verifyAdminCredentials, 
  verifyRecoveryCode, 
  hashPassword,
  generateSessionToken 
} from "./auth";
import {
  getUserById,
  getSubscriptionByUserId,
  createSubscription,
  validatePromoCode,
  incrementPromoCodeUse,
  getAdminAuth,
  createAdminAuth,
  updateAdminLoginAttempt,
} from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  admin: router({
    /**
     * Admin login with password
     */
    login: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!verifyAdminCredentials(input.password)) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid admin password',
          });
        }

        // Set admin session
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie('admin_session', generateSessionToken(), {
          ...cookieOptions,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });

        return { success: true, message: 'Admin authenticated' };
      }),

    /**
     * Verify recovery code for password reset
     */
    verifyRecoveryCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .mutation(({ input }) => {
        const isValid = verifyRecoveryCode(input.code);
        if (!isValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid recovery code',
          });
        }
        return { success: true, message: 'Recovery code verified' };
      }),

    /**
     * Check if user is admin
     */
    isAdmin: publicProcedure.query(({ ctx }) => {
      const adminCookie = ctx.req.headers.cookie?.includes('admin_session=');
      return { isAdmin: !!adminCookie };
    }),

    /**
     * Admin logout
     */
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie('admin_session');
      return { success: true };
    }),
  }),

  pricing: router({
    /**
     * Get all pricing plans
     */
    getPlans: publicProcedure.query(() => {
      return [
        {
          id: 'free',
          name: 'Start Free',
          description: '10,000 Tokens',
          price: 0,
          tokens: 10000,
          features: [
            '10K tokens',
            'All 5 AI models access',
            'Max 2K tokens per request',
            'Up to 2 agent loops',
            '1 file context per session',
            'Standard processing speed',
            'Email support',
          ],
        },
        {
          id: 'starter',
          name: 'Starter',
          description: 'Entry plan for light users',
          price: 25,
          tokens: 300000,
          recommended: false,
          features: [
            '300K tokens / month',
            'All 5 AI models access',
            'Max 8K tokens per request',
            'Up to 5 agent loops',
            '3 files context per session',
            'Standard processing speed',
            'AI Chat & Code Generation',
            'File & Document Upload (OCR)',
            '7-Day Refund Window',
            'Email support',
          ],
        },
        {
          id: 'professional',
          name: 'Professional',
          description: 'Recommended for daily users',
          price: 90,
          tokens: 1500000,
          recommended: true,
          features: [
            '1.5M tokens / month',
            'All 5 AI models access',
            'Max 32K tokens per request',
            'Up to 15 agent loops',
            '15 files context per session',
            'Faster processing speed',
            'Agent IDE with Cursor-style editing',
            'Dark Web Intelligence Search',
            'Priority support',
            '7-Day Refund Window',
          ],
        },
        {
          id: 'elite',
          name: 'Elite',
          description: 'For heavy operators and pro-level users',
          price: 150,
          tokens: 3000000,
          recommended: false,
          features: [
            '3M tokens / month',
            'All 5 AI models access',
            'Unlimited practical context size',
            'Deep reasoning enabled',
            'Unlimited agent loops',
            'Priority queue processing',
            'Agent IDE with Cursor-style editing',
            'Dark Web Intelligence Search',
            'Advanced code obfuscation',
            '7-Day Refund Window',
          ],
        },
      ];
    }),

    /**
     * Validate and apply promo code
     */
    validatePromo: publicProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ input }) => {
        const promo = await validatePromoCode(input.code);
        if (!promo) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invalid or expired promo code',
          });
        }
        return {
          success: true,
          code: promo.code,
          discount: Number(promo.discountPercentage),
        };
      }),

    /**
     * Get user subscription (requires auth)
     */
    getUserSubscription: protectedProcedure.query(async ({ ctx }) => {
      const subscription = await getSubscriptionByUserId(ctx.user.id);
      if (!subscription) {
        // Create default free subscription
        await createSubscription(ctx.user.id, 'free');
        return { planType: 'free', tokensIncluded: 10000, tokensUsed: 0 };
      }
      return subscription;
    }),

    /**
     * Get AI personas
     */
    getPersonas: publicProcedure.query(() => {
      return [
        {
          id: 'quick-assistant',
          name: 'Quick Security Assistant',
          tagline: 'Quick answers for security pros',
          description: 'Fast pentesting queries',
        },
        {
          id: 'red-team',
          name: 'Red Team Operator',
          tagline: 'Think like an attacker',
          description: 'Deep reasoning & pentesting',
        },
        {
          id: 'exploit-engineer',
          name: 'Exploit Engineer',
          tagline: 'Where vulnerabilities meet code',
          description: 'PoC & security automation',
        },
        {
          id: 'adversarial-strategist',
          name: 'Adversarial Strategist',
          tagline: 'Think beyond the rules',
          description: 'Red team tradecraft',
        },
        {
          id: 'opsec-specialist',
          name: 'OPSEC Specialist',
          tagline: 'Privacy first. Trace nothing',
          description: 'Anonymity & threat modeling',
        },
      ];
    }),
  }),
});

export type AppRouter = typeof appRouter;
