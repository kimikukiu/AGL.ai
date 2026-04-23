/**
 * Enhanced Telegram Bot for AGL.ai Admin Control
 * Full admin panel via Telegram
 */

import TelegramBot from 'node-telegram-bot-api';
import { providerManager } from '../providers/manager';
import { getDb } from './db';

export interface TelegramBotConfig {
  botToken: string;
  adminChatId: string;
  enabled: boolean;
}

export class AGLTelegramBot {
  private bot: TelegramBot;
  private adminChatId: string;
  private enabled: boolean;

  constructor(config: TelegramBotConfig) {
    this.adminChatId = config.adminChatId;
    this.enabled = config.enabled;

    if (!config.botToken) {
      console.warn('[TelegramBot] No bot token provided. Bot disabled.');
      this.enabled = false;
      return;
    }

    this.bot = new TelegramBot(config.botToken, { polling: true });

    if (this.enabled) {
      this.setupCommands();
      console.log('[TelegramBot] Admin bot started successfully');
    }
  }

  private setupCommands() {
    // Start command
    this.bot.onText(/\/start/, (msg) => {
      if (!this.isAdmin(msg)) return;
      this.sendMessage(this.getStartMessage());
    });

    // List providers
    this.bot.onText(/\/providers$/, async (msg) => {
      if (!this.isAdmin(msg)) return;
      const providers = await providerManager.getAvailableProviders();
      this.sendMessage(this.formatProvidersList(providers));
    });

    // Test a provider
    this.bot.onText(/\/test_provider (.+)/, async (msg, match) => {
      if (!this.isAdmin(msg)) return;
      const providerName = match?.[1];
      if (!providerName) {
        this.sendMessage('Usage: /test_provider <provider-name>');
        return;
      }

      try {
        const response = await providerManager.chat(
          {
            model: '',
            messages: [{ role: 'user', content: 'Hello, test message' }],
          },
          providerName
        );
        this.sendMessage(`✅ Provider ${providerName} is working!\nResponse: ${response.text.substring(0, 200)}...`);
      } catch (error) {
        this.sendMessage(`❌ Provider ${providerName} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    // Get system stats
    this.bot.onText(/\/stats$/, async (msg) => {
      if (!this.isAdmin(msg)) return;
      const db = await getDb();
      // TODO: Get actual stats from database
      const message = `
📊 **System Statistics**

🔹 **LLM Providers:**
${await this.getProvidersSummary()}

🔹 **Users:** 0 active
🔹 **Subscriptions:** 0 active
🔹 **Tokens Used:** 0 / 0
🔹 **Payments:** 0 pending

_Updated: ${new Date().toLocaleString()}_
      `;
      this.sendMessage(message);
    });

    // Manage tokens
    this.bot.onText(/\/tokens (.+) (.+)/, async (msg, match) => {
      if (!this.isAdmin(msg)) return;
      const userId = match?.[1];
      const action = match?.[2];

      if (!userId || !action) {
        this.sendMessage('Usage: /tokens <userId> <add|set|check> [amount]');
        return;
      }

      // TODO: Implement token management
      this.sendMessage(`🔑 Token management for user ${userId}: ${action}\n(Implementation pending database integration)`);
    });

    // Deploy project
    this.bot.onText(/\/deploy (.+)/, async (msg, match) => {
      if (!this.isAdmin(msg)) return;
      const project = match?.[1];

      if (!project) {
        this.sendMessage('Usage: /deploy <project-name>\n\nAvailable: AGL.ai, whm-un1c, Nexu5, whm-pv, full-whm-exp, productivity-pro-mobile');
        return;
      }

      this.sendMessage(`🚀 Triggering deployment for ${project}...\n(Requires GitHub Actions workflow)`);
      // TODO: Trigger GitHub Actions workflow via API
    });

    // List users
    this.bot.onText(/\/users$/, async (msg) => {
      if (!this.isAdmin(msg)) return;
      // TODO: Fetch from database
      this.sendMessage('👤 **Active Users**\n(Implementation pending database integration)');
    });

    // Git API status
    this.bot.onText(/\/git_api$/, async (msg) => {
      if (!this.isAdmin(msg)) return;
      const githubToken = process.env.GITHUB_TOKEN;
      if (githubToken) {
        this.sendMessage(`✅ Git API (GitHub Models) is configured\nToken: ${githubToken.substring(0, 10)}...\n\nUse /test_provider github-models to test.`);
      } else {
        this.sendMessage('❌ Git API not configured. Set GITHUB_TOKEN env var.');
      }
    });

    // Help menu
    this.bot.onText(/\/help$/, (msg) => {
      if (!this.isAdmin(msg)) return;
      this.sendMessage(this.getHelpMessage());
    });

    // Error handler
    this.bot.on('polling_error', (error) => {
      console.error('[TelegramBot] Polling error:', error);
    });
  }

  private isAdmin(msg: TelegramBot.Message): boolean {
    const chatId = msg.chat.id.toString();
    const isAdmin = chatId === this.adminChatId;
    
    if (!isAdmin) {
      this.bot.sendMessage(chatId, '❌ You do not have permission to use admin commands.');
    }
    
    return isAdmin;
  }

  private async getProvidersSummary(): Promise<string> {
    const providers = await providerManager.getAvailableProviders();
    return providers.map(p => 
      `${p.enabled && p.available ? '✅' : '❌'} **${p.displayName}**`
    ).join('\n');
  }

  private formatProvidersList(providers: any[]): string {
    let message = '🔧 **LLM Providers**\n\n';
    providers.forEach(p => {
      message += `${p.enabled && p.available ? '✅' : '❌'} **${p.displayName}**\n`;
      message += `   Models: ${p.models.slice(0, 3).join(', ')}...\n`;
      message += `   Enabled: ${p.enabled}\n\n`;
    });
    return message;
  }

  private getStartMessage(): string {
    return `
🤖 **AGL.ai Admin Control Bot**

Welcome to the admin control panel.

**Available Commands:**
/providers - List all LLM providers
/stats - System statistics
/users - Manage users
/tokens - Token management
/deploy - Deploy projects
/git_api - Git API status
/help - Show this help

**Quick Actions:**
• /test_provider github-models
• /test_provider groq
    `;
  }

  private getHelpMessage(): string {
    return `
📖 **AGL.ai Admin Bot Help**

**LLM Provider Management:**
/providers - List all providers
/test_provider <name> - Test a provider

**User Management:**
/users - List all users
/tokens <userId> <action> - Manage tokens

**Deployment:**
/deploy <project> - Deploy a project to Vercel

**System:**
/stats - View system statistics
/git_api - Check Git API status

**Admin login:** #AllOfThem-3301
    `;
  }

  private sendMessage(text: string) {
    if (!this.enabled) return;
    this.bot.sendMessage(this.adminChatId, text, { parse_mode: 'Markdown' });
  }

  public notify(message: string) {
    if (!this.enabled) return;
    this.bot.sendMessage(this.adminChatId, message);
  }

  public stop() {
    if (this.bot) {
      this.bot.stopPolling();
    }
  }
}

// Export singleton
import { ENV } from './_core/env';
let telegramBotInstance: AGLTelegramBot | null = null;

export function getTelegramBot(): AGLTelegramBot | null {
  if (!telegramBotInstance && ENV.TELEGRAM_BOT_TOKEN && ENV.TELEGRAM_ADMIN_CHAT_ID) {
    telegramBotInstance = new AGLTelegramBot({
      botToken: ENV.TELEGRAM_BOT_TOKEN,
      adminChatId: ENV.TELEGRAM_ADMIN_CHAT_ID,
      enabled: ENV.TELEGRAM_BOT_ENABLED === 'true',
    });
  }
  return telegramBotInstance;
}
