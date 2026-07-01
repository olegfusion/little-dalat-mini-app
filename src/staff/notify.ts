import { Bot } from 'grammy';
import { BotContext } from '../bot/context';
import { config } from '../config';
import { formatOrderForStaff } from '../lib/order-format';
import { Order } from '../types';

export async function notifyStaff(bot: Bot<BotContext>, order: Order): Promise<void> {
  if (!config.staffChatId) {
    console.warn('STAFF_CHAT_ID not configured — skipping staff notification');
    return;
  }

  const message = formatOrderForStaff(order);

  try {
    await bot.api.sendMessage(config.staffChatId, message);
  } catch (err) {
    console.error('Failed to notify staff:', err);
  }
}
