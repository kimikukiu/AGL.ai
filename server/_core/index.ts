import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

// Import provider system and API v1 routes
import { providerManager } from "../providers/manager";
import v1ChatRouter from "../api-v1/chat";
import v1CompletionRouter from "../api-v1/completion";
import v1ProvidersRouter from "../api-v1/providers";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // API v1 routes - Unified LLM endpoints
  app.use("/api/v1/llm", v1ChatRouter);
  app.use("/api/v1/llm", v1CompletionRouter);
  app.use("/api/v1", v1ProvidersRouter);

  // Initialize provider manager with GitHub token from env
  console.log("[Server] Initializing LLM Provider Manager...");
  const githubToken = process***REMOVED***.GITHUB_TOKEN || process***REMOVED***.GITHUB_API_KEY;
  if (githubToken) {
    console.log("[Server] GitHub token detected - GitHub Models API available");
  } else {
    console.warn("[Server] No GitHub token found - set GITHUB_TOKEN env var for free LLM access");
  }

  // Initialize and start Telegram bot if enabled
  if (process***REMOVED***.TELEGRAM_BOT_ENABLED === 'true' && process***REMOVED***.TELEGRAM_BOT_TOKEN) {
    console.log("[Server] Starting Telegram bot...");
    try {
      // Dynamic import to avoid circular dependencies
      import("../telegram-bot").then((module) => {
        const bot = new module.AGLTelegramBot();
        bot.start();
        console.log("[Server] Telegram bot started successfully!");
      }).catch(err => {
        console.error("[Server] Failed to start Telegram bot:", err.message);
      });
    } catch (err) {
      console.error("[Server] Telegram bot initialization error:", err);
    }
  } else {
    console.log("[Server] Telegram bot disabled or not configured");
  }

  // development mode uses Vite, production mode uses static files
  if (process***REMOVED***.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process***REMOVED***.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
