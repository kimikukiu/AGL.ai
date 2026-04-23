import { IncomingMessage } from 'telegram-bot-api';
import { AGLTelegramBot } from '../server/telegram-admin-bot';

// Initialize bot instance (reuse logic from telegram-admin-bot.ts)
const bot = new AGLTelegramBot({
    botToken: process***REMOVED***.TELEGRAM_BOT_TOKEN || '',
    adminChatId: process***REMOVED***.TELEGRAM_ADMIN_CHAT_ID || '',
    enabled: true
});

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const update = await req.json();
        
        // Process the update (same as polling, but via webhook)
        if (update.message) {
            const msg = update.message;
            const chatId = msg.chat.id.toString();
            
            // Check if admin
            if (chatId !== process***REMOVED***.TELEGRAM_ADMIN_CHAT_ID) {
                return new Response('Unauthorized', { status: 403 });
            }
            
            const text = msg.text || '';
            
            // Handle commands (reuse logic from setupCommands)
            if (text.startsWith('/start')) {
                await bot.sendMessage('Welcome! Bot is running on Vercel!');
            } else if (text.startsWith('/help')) {
                await bot.sendMessage('Commands: /start, /help, /manus, /hermes, /kilocode');
            } else if (text.startsWith('/manus')) {
                await bot.sendMessage('Manus Agent activated!');
            } else if (text.startsWith('/hermes')) {
                await bot.sendMessage('Hermes Agent ready!');
            } else if (text.startsWith('/kilocode')) {
                await bot.sendMessage('Kilocode provider active (256K context)!');
            }
        }
        
        return new Response('OK', { status: 200 });
    } catch (error) {
        console.error('Webhook error:', error);
        return new Response('Internal error', { status: 500 });
    }
}
