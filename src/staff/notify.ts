import { Bot, InlineKeyboard } from 'grammy';
import { BotContext } from '../bot/context';
import { config } from '../config';
import { formatOrderForStaff } from '../lib/order-format';
import { Order } from '../types';
import { updateOrderStatus, getOrderById } from '../db/orders';

function staffStatusKeyboard(orderId: number, mode: string): InlineKeyboard {
  const kb = new InlineKeyboard();
  if (mode === 'delivery') {
    kb.text('⏳ Preparing', `staff_status_${orderId}_preparing`).row();
    kb.text('🚚 Dispatched', `staff_status_${orderId}_dispatched`).row();
    kb.text('✅ Done', `staff_status_${orderId}_served`).row();
  } else {
    kb.text('⏳ Preparing', `staff_status_${orderId}_preparing`).row();
    kb.text('🛵 Ready', `staff_status_${orderId}_ready`).row();
    kb.text('✅ Done', `staff_status_${orderId}_served`).row();
  }
  return kb;
}

export async function notifyStaff(bot: Bot<BotContext>, order: Order): Promise<void> {
  if (!config.staffChatId) {
    console.warn('STAFF_CHAT_ID not configured — skipping staff notification');
    return;
  }

  const message = formatOrderForStaff(order);

  try {
    await bot.api.sendMessage(config.staffChatId, message, {
      reply_markup: staffStatusKeyboard(order.id, order.mode),
    });
  } catch (err) {
    console.error('Failed to notify staff:', err);
  }
}

export function registerStaffCallbacks(bot: Bot<BotContext>): void {
  bot.callbackQuery(/^staff_status_(\d+)_(.+)$/, async (ctx) => {
    const orderId = parseInt(ctx.match[1], 10);
    const status = ctx.match[2];
    await ctx.answerCallbackQuery(`Order #${orderId} → ${status}`);

    updateOrderStatus(orderId, status as any);

    try {
      const updated = getOrderById(orderId);
      if (!updated) return;
      await ctx.editMessageReplyMarkup({ reply_markup: undefined });
      await ctx.editMessageText(
        `${formatOrderForStaff(updated)}\n\n✅ Status updated to: ${status} by ${ctx.from?.first_name || 'staff'}`
      );
      if (updated.source?.startsWith('miniapp_telegram') || updated.source === 'bot') {
        const lang = updated.language;
        const statusIcons: Record<string, string> = {
          paid: '✅', preparing: '⏳', ready: '🛵', dispatched: '🚚',
          served: '✅', picked_up: '✅',
        };
        const icon = statusIcons[status] || '📋';
        await bot.api.sendMessage(updated.chatId,
          `${icon} *Order #${updated.id}: ${status}*\n` +
          (lang === 'vn' ? 'Cảm ơn bạn đã đặt hàng tại Little Dalat!' :
           lang === 'en' ? 'Thank you for ordering at Little Dalat!' :
           'Спасибо за заказ в Little Dalat!'),
          { parse_mode: 'Markdown' }
        );
      }
    } catch (e) {
      console.error('Staff status update failed:', e);
    }
  });
}
