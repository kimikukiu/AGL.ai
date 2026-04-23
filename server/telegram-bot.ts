/**
/**
 * Telegram Bot Integration for AGL.ai Admin Control
 * Allows admins to manage users, allocate tokens, and control the system via Telegram
 */

import { AGLTelegramBot, getTelegramBot } from './telegram-admin-bot';

// Re-export for backward compatibility
export const botCommands = {}; // Now handled by AGLTelegramBot class
export const processTelegramMessage = async () => { /* handled by AGLTelegramBot */ };
export const sendTelegramMessage = async () => { /* handled by AGLTelegramBot */ };
export const notifyPaymentReceived = async () => { /* handled by AGLTelegramBot */ };
export const notifyNewUser = async () => { /* handled by AGLTelegramBot */ };

// Export the new bot class
export { AGLTelegramBot, getTelegramBot };
