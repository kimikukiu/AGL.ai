/**
 * Admin API Routes for LLM Provider Management
 * Protected by admin authentication
 */

import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { providerManager } from '../providers/manager';
import { ProviderConfig } from '../providers/manager';

export const providersAdminRouter = router({
  // Get all providers and their status
  list: protectedProcedure.query(async () => {
    return await providerManager.getAvailableProviders();
  }),

  // Get provider configurations
  getConfigs: protectedProcedure.query(async () => {
    return providerManager.getProviderConfigs();
  }),

  // Update provider configuration (API key, enable/disable)
  updateConfig: protectedProcedure
    .input(z.object({
      name: z.string(),
      enabled: z.boolean().optional(),
      apiKey: z.string().optional(),
      priority: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const updates: Partial<ProviderConfig> = {};
      if (input.enabled !== undefined) updates.enabled = input.enabled;
      if (input.apiKey !== undefined) updates.apiKey = input.apiKey;
      if (input.priority !== undefined) updates.priority = input.priority;

      providerManager.updateProviderConfig(input.name, updates);

      // In production, save to database
      console.log(`[Admin] Updated provider ${input.name}:`, updates);

      return { success: true, message: `Provider ${input.name} updated` };
    }),

  // Test a provider
  test: protectedProcedure
    .input(z.object({
      name: z.string(),
      model: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const response = await providerManager.chat(
          {
            model: input.model || '',
            messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
          },
          input.name
        );
        return {
          success: true,
          response: response.text.substring(0, 200),
          model: response.model,
          provider: response.provider,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  // Get usage statistics
  getUsage: protectedProcedure.query(async () => {
    return Array.from(providerManager.getProviderConfigs()).map(config => ({
      name: config.name,
      config,
    }));
  }),

  // Chat using any available provider (for testing)
  chat: protectedProcedure
    .input(z.object({
      message: z.string(),
      model: z.string().optional(),
      provider: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const response = await providerManager.chat(
          {
            model: input.model || '',
            messages: [{ role: 'user', content: input.message }],
          },
          input.provider
        );
        return response;
      } catch (error) {
        throw new Error(`Chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),
});
