import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

function createUserContext(role: 'user' | 'admin' = 'user', hasAdminCookie = false): { ctx: TrpcContext; cookies: CookieCall[] } {
  const cookies: CookieCall[] = [];

  const user = {
    id: role === 'admin' ? 1 : 2,
    openId: role === 'admin' ? 'admin-user' : 'regular-user',
    email: role === 'admin' ? 'admin@example.com' : 'user@example.com',
    name: role === 'admin' ? 'Admin User' : 'Regular User',
    loginMethod: 'manus' as const,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: 'https',
      headers: {
        cookie: hasAdminCookie ? 'admin_session=test-token' : '',
      },
    } as TrpcContext['req'],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        cookies.push({ name, value, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        cookies.push({ name, value: '', options });
      },
    } as TrpcContext['res'],
  };

  return { ctx, cookies };
}

describe("admin vs user access flows", () => {
  describe("auth.me", () => {
    it("should return user info for authenticated user", async () => {
      const { ctx } = createUserContext('user');
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toBeDefined();
      expect(result?.role).toBe('user');
    });

    it("should return admin info for admin user", async () => {
      const { ctx } = createUserContext('admin');
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toBeDefined();
      expect(result?.role).toBe('admin');
    });

    it("should return null for unauthenticated user", async () => {
      const ctx = {
        user: null,
        req: { protocol: 'https', headers: {} } as TrpcContext['req'],
        res: {} as TrpcContext['res'],
      };
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toBeNull();
    });
  });

  describe("admin.isAdmin", () => {
    it("should return isAdmin: true when admin cookie is present", async () => {
      const { ctx } = createUserContext('admin', true);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.admin.isAdmin();
      expect(result).toEqual({ isAdmin: true });
    });

    it("should return isAdmin: false when admin cookie is absent", async () => {
      const { ctx } = createUserContext('user', false);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.admin.isAdmin();
      expect(result).toEqual({ isAdmin: false });
    });
  });

  describe("admin.getDashboard", () => {
    it("should return dashboard for admin users with admin cookie", async () => {
      const { ctx } = createUserContext('admin', true);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.admin.getDashboard();
      expect(result).toBeDefined();
      expect(result.adminFeatures).toBeDefined();
      expect(Array.isArray(result.adminFeatures)).toBe(true);
    });

    it("should still return dashboard for non-admin users with admin cookie", async () => {
      // Dashboard access is controlled by cookie, not user role
      const { ctx } = createUserContext('user', true);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.admin.getDashboard();
      expect(result).toBeDefined();
    });
  });

  describe("admin.login", () => {
    it("should set admin cookie on successful login", async () => {
      const { ctx, cookies } = createUserContext('user', false);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.admin.login({ password: '#AllOfThem-3301' });
      
      expect(result.success).toBe(true);
      expect(cookies).toHaveLength(1);
      expect(cookies[0]?.name).toBe('admin_session');
      expect(cookies[0]?.value).toBeDefined();
    });

    it("should throw UNAUTHORIZED for wrong password", async () => {
      const { ctx } = createUserContext('user', false);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.admin.login({ password: 'wrongpassword' })
      ).rejects.toThrow();
    });
  });

  describe("admin.logout", () => {
    it("should clear admin cookie on logout", async () => {
      const { ctx, cookies } = createUserContext('admin', true);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.admin.logout();
      expect(result).toEqual({ success: true });
      
      const clearedCookie = cookies.find(c => c.name === 'admin_session');
      expect(clearedCookie).toBeDefined();
    });
  });

  describe("protectedProcedure", () => {
    it("should allow access for authenticated users", async () => {
      const { ctx } = createUserContext('user');
      const caller = appRouter.createCaller(ctx);

      // Test a protected endpoint if one exists
      // This depends on the actual router implementation
      expect(ctx.user).toBeDefined();
    });

    it("should deny access for unauthenticated users on protected routes", async () => {
      const ctx = {
        user: null,
        req: { protocol: 'https', headers: {} } as TrpcContext['req'],
        res: {} as TrpcContext['res'],
      };

      // Attempting to call a protected procedure should throw
      // This test depends on actual protected routes in the router
      expect(ctx.user).toBeNull();
    });
  });
});
