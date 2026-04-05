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
    login: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        try {
          if (!verifyAdminCredentials(input.password)) {
            throw new TRPCError({
              code: 'UNAUTHORIZED',
              message: 'Invalid admin password',
            });
          }
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie('admin_session', generateSessionToken(), {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000,
          });
          return { success: true, message: 'Admin authenticated' };
        } catch (error: any) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message || 'Authentication failed',
          });
        }
      }),

    verifyRecoveryCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .mutation(({ input }) => {
        try {
          const isValid = verifyRecoveryCode(input.code);
          if (!isValid) {
            throw new TRPCError({
              code: 'UNAUTHORIZED',
              message: 'Invalid recovery code',
            });
          }
          return { success: true, message: 'Recovery code verified' };
        } catch (error: any) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message || 'Verification failed',
          });
        }
      }),

    isAdmin: publicProcedure.query(({ ctx }) => {
      const adminCookie = ctx.req.headers.cookie?.includes('admin_session=');
      return { isAdmin: !!adminCookie };
    }),

    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie('admin_session');
      return { success: true };
    }),

    getDashboard: publicProcedure.query(({ ctx }) => {
      const isAdmin = ctx.req.headers.cookie?.includes('admin_session=');
      if (!isAdmin) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Admin access required',
        });
      }
      return {
        isAdmin: true,
        features: {
          allToolsFree: true,
          unlimitedTokens: true,
          allModels: ['Kali GPT', 'Dark GPT', 'Zero Day GPT', 'Onion GPT', 'Red Team Operator'],
          adminFeatures: [
            'User Management',
            'Token Allocation',
            'Payment Monitoring',
            'System Analytics',
            'Subscriber Management',
          ],
        },
      };
    }),
  }),

  pricing: router({
    getPlans: publicProcedure.query(() => {
      return [
        {
          id: 'free',
          name: 'Free Trial',
          price: 0,
          tokens: 100000,
          duration: '3 days',
          features: [
            'Access to 5 AI Models',
            '100,000 tokens',
            '3-day trial period',
            'Basic support',
          ],
        },
        {
          id: 'starter',
          name: 'Starter',
          price: 25,
          tokens: 300000,
          features: [
            'All 5 AI Models',
            '300,000 tokens',
            '30-day access',
            'Email support',
            'Basic analytics',
          ],
        },
        {
          id: 'professional',
          name: 'Professional',
          price: 90,
          tokens: 1500000,
          features: [
            'All 5 AI Models',
            '1.5M tokens',
            '90-day access',
            'Priority support',
            'Advanced analytics',
            'Custom integrations',
          ],
        },
        {
          id: 'elite',
          name: 'Elite',
          price: 150,
          tokens: 3000000,
          features: [
            'All 5 AI Models',
            '3M tokens',
            '180-day access',
            '24/7 VIP support',
            'Full analytics suite',
            'Custom integrations',
            'Dedicated account manager',
          ],
        },
      ];
    }),

    getPersonas: publicProcedure.query(() => {
      return [
        {
          id: 'kali-gpt',
          name: 'Kali GPT',
          emoji: '🛠️',
          tagline: 'Penetration Testing & Network Security',
          description: 'Specialized in network penetration testing, vulnerability assessment, and security tools',
        },
        {
          id: 'dark-gpt',
          name: 'Dark GPT',
          emoji: '🧠',
          tagline: 'Advanced Threat Intelligence',
          description: 'Deep threat analysis, dark web intelligence, and advanced security research',
        },
        {
          id: 'zero-day-gpt',
          name: 'Zero Day GPT',
          emoji: '💻',
          tagline: 'Exploit Development & PoC',
          description: 'Zero-day vulnerability research, exploit development, and proof of concept creation',
        },
        {
          id: 'onion-gpt',
          name: 'Onion GPT',
          emoji: '🧅',
          tagline: 'Privacy & Anonymity',
          description: 'Privacy-first solutions, anonymity techniques, and secure communication methods',
        },
        {
          id: 'red-team-operator',
          name: 'Red Team Operator',
          emoji: '🎯',
          tagline: 'Advanced Red Team Operations',
          description: 'Deep reasoning and advanced pentesting strategies for comprehensive security assessments',
        },
      ];
    }),

    validatePromo: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        try {
          const isValid = await validatePromoCode(input.code);
          if (!isValid) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid promo code',
            });
          }
          const discount = input.code === 'FIRST20' ? 20 : 0;
          await incrementPromoCodeUse(input.code);
          return { valid: true, discount };
        } catch (error: any) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message || 'Promo validation failed',
          });
        }
      }),
  }),

  training: router({
    startTraining: publicProcedure
      .input(z.object({ 
        model: z.enum(['kali-gpt', 'dark-gpt', 'zero-day-gpt', 'onion-gpt', 'red-team-operator']),
        epochs: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          return {
            success: true,
            message: `Training started for ${input.model}`,
            trainingId: `train-${Date.now()}`,
            estimatedTime: '2-4 hours',
          };
        } catch (error: any) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message || 'Training failed to start',
          });
        }
      }),

    getTrainingStatus: publicProcedure
      .input(z.object({ trainingId: z.string() }))
      .query(() => {
        return {
          trainingId: 'train-123456',
          model: 'kali-gpt',
          status: 'in-progress',
          progress: 65,
          epoch: 2,
          totalEpochs: 3,
          skillsProcessed: 500,
          totalSkills: 734,
        };
      }),

    getTrainingDataSources: publicProcedure.query(() => {
      return {
        cybersecuritySkills: {
          source: 'github.com/kimikukiu/700-Cybersecurity-Skills',
          totalSkills: 734,
          categories: ['penetration-testing', 'forensics', 'malware-analysis', 'cloud-security', 'threat-intelligence'],
        },
        pentestSwarmAI: {
          source: 'github.com/kimikukiu/Pentest-Swarm-AI',
          agents: ['classifier', 'exploit', 'orchestrator', 'reporter'],
          capabilities: ['automated-scanning', 'vulnerability-classification', 'exploit-execution', 'reporting'],
        },
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
