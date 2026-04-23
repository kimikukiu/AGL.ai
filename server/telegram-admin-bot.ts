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

    // Content Generation
    this.bot.onText(/\\/generate (.+?) (.+)/, async (msg, match) => {
      if (!this.isAdmin(msg)) return;
      const type = match?.[1] || 'text';
      const prompt = match?.[2] || '';
      
      await this.sendMessage(`🤖 Generating ${type} content about: ${prompt}...`);
      
      try {
        // Call the generation API
        const response = await fetch('http://localhost:3000/api/v1/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, prompt })
        });
        
        if (response.ok) {
          const data = await response.json();
          await this.sendMessage(`✅ **${type} Generated**\n\n${data.content?.substring(0, 500) || 'Content ready!'}`);
        } else {
          await this.sendMessage(`❌ Generation failed: ${response.statusText}`);
        }
      } catch (error) {
        await this.sendMessage(`❌ Generation error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    });

    // Slides
    this.bot.onText(/\\/slides (.+?) (.+)/, async (msg, match) => {
      if (!this.isAdmin(msg)) return;
      const action = match?.[1] || 'create';
      const topic = match?.[2] || '';
      
      await this.sendMessage(`📊 Creating presentation about: ${topic}...`);
      
      try {
        const response = await fetch('http://localhost:3000/api/v1/slides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, topic, mode: 'html' })
        });
        
        if (response.ok) {
          await this.sendMessage(`✅ **Presentation Created**\n\n📎 Topic: ${topic}\n📊 Format: HTML (editable)`);
        } else {
          await this.sendMessage(`❌ Slides creation failed`);
        }
      } catch (error) {
        await this.sendMessage(`❌ Slides error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    });

    // Init Project
    this.bot.onText(/\\/init_project (.+?) (.+)/, async (msg, match) => {
      if (!this.isAdmin(msg)) return;
      const type = match?.[1] || 'web-static';
      const name = match?.[2] || 'MyProject';
      
      await this.sendMessage(`🚀 Initializing ${type} project: ${name}...`);
      
      try {
        const response = await fetch('http://localhost:3000/api/v1/init-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, name })
        });
        
        if (response.ok) {
          const data = await response.json();
          await this.sendMessage(`✅ **Project Initialized**\n\n📦 Name: ${name}\n📋 Type: ${type}\n📁 Location: ${data.path || '~/projects/' + name}`);
        } else {
          await this.sendMessage(`❌ Project initialization failed`);
        }
      } catch (error) {
        await this.sendMessage(`❌ Init error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
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

**Content Generation & Presentation:**
/generate <type> <prompt> - Generate images/videos/audio/music
/slides <action> <topic> - Create/edit presentations
/init_project <type> <name> - Initialize web/mobile project

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
