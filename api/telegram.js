// Simple Telegram webhook handler for Vercel Serverless
export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

    try {
        const update = req.body;
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

        if (!token || !adminChatId) {
            return res.status(500).json({ error: 'Missing env vars' });
        }

        // Process message
        if (update.message) {
            const msg = update.message;
            const chatId = msg.chat.id.toString();
            
            // Check admin
            if (chatId !== adminChatId) {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            const text = msg.text || '';

            // Send response via Telegram API
            let responseText = 'Command not recognized';
            
            if (text.startsWith('/start')) {
                responseText = `🚀 AGL.ai Bot on Vercel!\n\nCommands:\n/start - Start\n/help - Help\n/manus - Manus Agent\n/hermes - Hermes Agent\n/kilocode - Kilocode (256K)`;
            } else if (text.startsWith('/help')) {
                responseText = 'Available commands: /start, /help, /manus, /hermes, /kilocode, /train, /kill';
            } else if (text.startsWith('/manus')) {
                responseText = '🤖 Manus Agent: Active! Cycle: Analyze → Think → Act → Observe';
            } else if (text.startsWith('/hermes')) {
                responseText = '🧠 Hermes Agent: Ready! Skills + Memories loaded.';
            } else if (text.startsWith('/kilocode')) {
                responseText = '⚡ Kilocode: 256K context (262144 tokens) - kilo-auto/free active!';
            } else if (text.startsWith('/train')) {
                responseText = '📚 Training curriculum loaded (33 languages, deep_manus_blueprint.txt)';
            }

            // Send message back via Telegram API
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: responseText
                })
            });
        }

        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ error: 'Internal error' });
    }
}
