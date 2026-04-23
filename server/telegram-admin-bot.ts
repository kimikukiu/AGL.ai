/**
 * Enhanced Telegram Bot for AGL.ai Admin Control
 * Full admin panel via Telegram
 */

import TelegramBot from 'node-telegram-bot-api';
import { providerManager } from '../providers/manager';
import { getDb } from './db';
import { wormGPTArsenal, logger, wormHttp, schedule } from './wormgpt-complete';

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
    this.bot.onText(/\/init_project (.+?) (.+)/, async (msg, match) => {
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

    // ==========================================
    // WORMGPT COMMANDS - ALL EXPLOITS
    // ==========================================
    
    // Main WormGPT Menu
    this.bot.onText(/\\/wormgpt$/, (msg) => {
      if (!this.isAdmin(msg)) return;
      const menu = `
💀 **WormGPT Complete Arsenal** 💀

**Available Exploits:**
• /cve_2025_29824 <target> - CLFS Driver EoP (Windows)
• /cve_2025_5777 <target> - CitrixBleed 2 (NetScaler)
• /cve_2026_2441 <target> - Chrome CSS RCE

**Burp Suite Techniques:**
• /burp <target> - Full Burp Suite automation
• /burp_intruder <target> - Cluster bomb attack
• /burp_repeater <target> - Request manipulation

**Tools:**
• /wormgpt_http <url> - WormHTTP client test
• /wormgpt_schedule - Test scheduler

**WARNING: Use only on authorized systems!**
      `;
      this.sendMessage(menu);
    });

    // CVE-2025-29824 - CLFS Driver Exploit
    this.bot.onText(/\\/cve_2025_29824 (.+)/, async (msg, match) => {
      if (!this.isAdmin(msg)) return;
      const target = match?.[1];
      if (!target) {
        this.sendMessage('Usage: /cve_2025_29824 <target_ip>');
        return;
      }
      
      await this.sendMessage(`💀 **CVE-2025-29824** - CLFS Driver EoP\n\n🎯 Target: ${target}\n⚡ Status: ARMED\n\nInitializing exploit chain...`);
      
      try {
        const result = wormGPTArsenal.cve_2025_29824_clfs_exploit(target);
        await this.sendMessage(`✅ **Exploit Ready**\n\n${JSON.stringify(result, null, 2).substring(0, 500)}...`);
      } catch (error) {
        await this.sendMessage(`❌ Exploit error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    });

    // CVE-2025-5777 - CitrixBleed 2
    this.bot.onText(/\\/cve_2025_5777 (.+)/, async (msg, match) => {
      if (!this.isAdmin(msg)) return;
      const target = match?.[1];
      if (!target) {
        this.sendMessage('Usage: /cve_2025_5777 <target_url>');
        return;
      }
      
      await this.sendMessage(`💀 **CVE-2025-5777** - CitrixBleed 2\n\n🎯 Target: ${target}\n⚡ Status: ARMED\n\nExtracting session tokens...`);
      
      try {
        const result = wormGPTArsenal.cve_2025_5777_citrixbleed2(target);
        await this.sendMessage(`✅ **Exploit Ready**\n\nCitrixBleed 2 exploit code generated for: ${target}`);
      } catch (error) {
        await this.sendMessage(`❌ Exploit error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    });

    // CVE-2026-2441 - Chrome CSS RCE
    this.bot.onText(/\\/cve_2026_2441 (.+)/, async (msg, match) => {
      if (!this.isAdmin(msg)) return;
      const target = match?.[1];
      if (!target) {
        this.sendMessage('Usage: /cve_2026_2441 <target_url>');
        return;
      }
      
      await this.sendMessage(`💀 **CVE-2026-2441** - Chrome CSS RCE\n\n🎯 Target: ${target}\n⚡ Status: ARMED\n\nGenerating payloads...`);
      
      try {
        const result = wormGPTArsenal.cve_2026_2441_chrome_rce(target);
        await this.sendMessage(`✅ **Exploit Ready**\n\n${JSON.stringify(result, null, 2).substring(0, 500)}...`);
      } catch (error) {
        await this.sendMessage(`❌ Exploit error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    });

    // Burp Suite Techniques
    this.bot.onText(/\\/burp (.+)/, async (msg, match) => {
      if (!this.isAdmin(msg)) return;
      const target = match?.[1];
      if (!target) {
        this.sendMessage('Usage: /burp <target_url>');
        return;
      }
      
      await this.sendMessage(`🔥 **Burp Suite Automation**\n\n🎯 Target: ${target}\n⚡ Running cluster bomb attack...`);
      
      try {
        const result = wormGPTArsenal.burp_intruder_attack(target, 'cluster_bomb');
        await this.sendMessage(`✅ **Burp Complete**\n\n${JSON.stringify(result, null, 2).substring(0, 500)}...`);
      } catch (error) {
        await this.sendMessage(`❌ Burp error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    });

    // WormHTTP Test
    this.bot.onText(/\\/wormgpt_http (.+)/, async (msg, match) => {
      if (!this.isAdmin(msg)) return;
      const url = match?.[1];
      if (!url) {
        this.sendMessage('Usage: /wormgpt_http <url>');
        return;
      }
      
      await this.sendMessage(`🌐 **WormHTTP Test**\n\nTarget: ${url}\nSending request...`);
      
      try {
        const response = await wormHttp.get(url);
        await this.sendMessage(`✅ **Response Received**\n\nLength: ${response.length} bytes\n\n${response.substring(0, 200)}...`);
      } catch (error) {
        await this.sendMessage(`❌ HTTP error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    });

    // Test Scheduler
    this.bot.onText(/\/wormgpt_schedule$/, (msg) => {
      if (!this.isAdmin(msg.chat.id.toString())) return;
      
      schedule.every(5).seconds().do(() => {
        logger.info('[WormGPT] Scheduled task executed!');
      });
      
      this.bot.sendMessage(msg.chat.id, `⏰ **WormGPT Scheduler**\n\n✅ Scheduled task every 5 seconds\nUse /wormgpt_stop to stop`, { parse_mode: 'Markdown' });
      
      schedule.start();
    });

    // ==========================================
    // HIGH-CAPACITY COMMANDS - REAL USAGE
    // ==========================================
    
    // Instant Code Generation (10k+ lines)
    this.bot.onText(/\/code_instant (.+?) (.+)/, async (msg, match) => {
      if (!this.isAdmin(msg.chat.id.toString())) return;
      const language = match?.[1] || 'typescript';
      const prompt = match?.[2] || '';
      
      await this.bot.sendMessage(msg.chat.id, `✍️ **HIGH-SPEED CODING**\n\n🎯 Language: ${language}\n📝 Prompt: ${prompt}\n⚡ Generating 10,000+ lines INSTANTLY...`, { parse_mode: 'Markdown' });
      
      try {
        // Dynamic import to avoid startup errors
        const { HighSpeedCodingEngine } = require('../../manus-core/highspeed-coding-engine');
        const engine = new HighSpeedCodingEngine();
        
        const result = await engine.generateInstant(prompt, { language, lines: 10000 });
        
        await this.bot.sendMessage(msg.chat.id, 
          `✅ **CODE GENERATED INSTANTLY!**\n\n` +
          `📏 Lines: ${result.stats.linesGenerated}\n` +
          `⏱️ Time: ${result.stats.timeSeconds}s\n` +
          `🔄 Chunks: ${result.stats.chunksUsed}\n` +
          `💾 Cache: ${result.stats.cacheHits} hits\n\n` +
          `First 500 chars:\n\`\`\`\n${result.code.substring(0, 500)}...\n\`\`\``,
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        await this.bot.sendMessage(msg.chat.id, `❌ Code generation error: ${error}`);
      }
    });

    // Real-time Thinking & Analysis
    this.bot.onText(/\/think (.+)/, async (msg, match) => {
      if (!this.isAdmin(msg.chat.id.toString())) return;
      const prompt = match?.[1] || '';
      
      await this.bot.sendMessage(msg.chat.id, `🧠 **REAL-TIME THINKING**\n\nAnalyzing: ${prompt}\n⚡ Thinking...`, { parse_mode: 'Markdown' });
      
      try {
        const { TrueManusAgent } = require('../../manus-core/true-agent');
        const agent = new TrueManusAgent();
        
        const thought = await agent.think(prompt, { depth: 'deep', mode: 'analytical' });
        
        await this.bot.sendMessage(msg.chat.id, 
          `✅ **THOUGHT COMPLETE**\n\n${thought.substring(0, 1000)}...`,
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        await this.bot.sendMessage(msg.chat.id, `❌ Thinking error: ${error}`);
      }
    });

    // Autonomous Search & Analysis
    this.bot.onText(/\/search_deep (.+)/, async (msg, match) => {
      if (!this.isAdmin(msg.chat.id.toString())) return;
      const query = match?.[1] || '';
      
      await this.bot.sendMessage(msg.chat.id, `🔍 **AUTONOMOUS SEARCH**\n\nQuery: ${query}\n⚡ Searching & analyzing...`, { parse_mode: 'Markdown' });
      
      try {
        const { TrueManusAgent } = require('../../manus-core/true-agent');
        const agent = new TrueManusAgent();
        
        const results = await agent.search(query, 5);
        
        await this.bot.sendMessage(msg.chat.id, 
          `✅ **SEARCH COMPLETE**\n\n` +
          `📊 Analysis:\n${results.analysis.substring(0, 500)}...\n\n` +
          `📚 Sources: ${results.sources.length}\n` +
          `💡 Recommendations:\n${JSON.stringify(results.recommendations, null, 2).substring(0, 300)}...`,
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        await this.bot.sendMessage(msg.chat.id, `❌ Search error: ${error}`);
      }
    });

    // Self-Repair Command
    this.bot.onText(/\/repair (.+)/, async (msg, match) => {
      if (!this.isAdmin(msg.chat.id.toString())) return;
      const filePath = match?.[1] || '';
      
      await this.bot.sendMessage(msg.chat.id, `🔧 **SELF-REPAIR ENGINE**\n\nFile: ${filePath}\n⚡ Analyzing & repairing...`, { parse_mode: 'Markdown' });
      
      try {
        const { SelfRepairEngine } = require('../../manus-core/self-repair-engine');
        const engine = new SelfRepairEngine();
        
        const result = await engine.repair(filePath);
        
        await this.bot.sendMessage(msg.chat.id, 
          `✅ **REPAIR ${result.fixed ? 'SUCCESS' : 'FAILED'}**\n\n` +
          `🔄 Attempts: ${result.attempts}\n` +
          `📝 Changes:\n${result.changes.map((c: string, i: number) => `${i+1}. ${c}`).join('\n')}\n\n` +
          `📄 New code (first 300 chars):\n\`\`\`\n${result.newCode.substring(0, 300)}...\n\`\`\``,
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        await this.bot.sendMessage(msg.chat.id, `❌ Repair error: ${error}`);
      }
    });

    // Workflow Execution
    this.bot.onText(/\/workflow (.+?) (\d+)/, async (msg, match) => {
      if (!this.isAdmin(msg.chat.id.toString())) return;
      const task = match?.[1] || '';
      const steps = parseInt(match?.[2] || '5');
      
      await this.bot.sendMessage(msg.chat.id, `🔄 **HIGH-SPEED WORKFLOW**\n\nTask: ${task}\n📊 Steps: ${steps}\n⚡ Executing...`, { parse_mode: 'Markdown' });
      
      try {
        const { TrueManusAgent } = require('../../manus-core/true-agent');
        const agent = new TrueManusAgent();
        
        const result = await agent.workflow(task, steps);
        
        await this.bot.sendMessage(msg.chat.id, 
          `✅ **WORKFLOW COMPLETE**\n\n` +
          `📋 Task: ${result.task}\n` +
          `✅ Status: ${result.status}\n` +
          `📊 Steps completed: ${result.steps.length}\n\n` +
          `First step: ${result.steps[0]?.thought?.substring(0, 200)}...`,
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        await this.bot.sendMessage(msg.chat.id, `❌ Workflow error: ${error}`);
      }
    });

    // System Status (High-Level)
    this.bot.onText(/\/system_status$/, async (msg) => {
      if (!this.isAdmin(msg.chat.id.toString())) return;
      
      try {
        const { TrueManusAgent } = require('../../manus-core/true-agent');
        const { SelfRepairEngine } = require('../../manus-core/self-repair-engine');
        const { HighSpeedCodingEngine } = require('../../manus-core/highspeed-coding-engine');
        
        const agent = new TrueManusAgent();
        const repair = new SelfRepairEngine();
        const coder = new HighSpeedCodingEngine();
        
        const agentStatus = agent.getStatus();
        const repairStats = repair.getStats();
        const coderStats = coder.getStats();
        
        await this.bot.sendMessage(msg.chat.id,
          `⚡ **SYSTEM STATUS - HIGH CAPACITY** ⚡\n\n` +
          `🧠 **Agent:**\n` +
          `  • Thinking: ${agentStatus.thinking ? 'YES' : 'NO'}\n` +
          `  • Working: ${agentStatus.working ? 'YES' : 'NO'}\n` +
          `  • Memory: ${agentStatus.memory_size} items\n` +
          `  • Capabilities: ${agentStatus.capabilities.length}\n\n` +
          `🔧 **Self-Repair:**\n` +
          `  • Total Repairs: ${repairStats.totalRepairs}\n` +
          `  • Success Rate: ${repairStats.successRate}\n` +
          `  • Strategies: ${repairStats.availableStrategies}\n\n` +
          `✍️ **Coding Engine:**\n` +
          `  • Cache: ${coderStats.cacheSize} items\n` +
          `  • Max Lines: ${coderStats.maxLinesPerGeneration.toLocaleString()}\n` +
          `  • Parallel: ${coderStats.parallelGeneration ? 'YES' : 'NO'}\n` +
          `  • Languages: ${coderStats.supportedLanguages.join(', ')}`,
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        await this.bot.sendMessage(msg.chat.id, `❌ Status error: ${error}`);
      }
    });
  }

  private async isAdmin(chatId: string): Promise<boolean> {
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
