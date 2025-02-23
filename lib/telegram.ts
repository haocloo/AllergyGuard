import { TelegramSchema } from '@/services/types';
import { telegramSchema } from '@/services/validation';

const validateConfig = () => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const defaultChatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN configuration');
  }

  if (!defaultChatId) {
    throw new Error('Missing TELEGRAM_CHAT_ID configuration');
  }

  return { botToken, defaultChatId };
};

export async function sendTelegram({ message, chatId }: TelegramSchema): Promise<void> {
  try {
    // Validate configuration
    const { botToken, defaultChatId } = validateConfig();

    // Validate message data
    const validatedData = telegramSchema.parse({ message, chatId });

    // Prepare request
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: validatedData.chatId || defaultChatId,
        text: validatedData.message,
        parse_mode: 'HTML', // Support HTML formatting
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.description || 'Failed to send telegram message');
    }

  } catch (error) {
    throw error;
  }
}
