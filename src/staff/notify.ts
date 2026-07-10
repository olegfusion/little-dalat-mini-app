import { Bot, InlineKeyboard } from 'grammy';
import { BotContext } from '../bot/context';
import { config } from '../config';
import { formatOrderForStaff, formatStatusMessage } from '../lib/order-format';
import { Order } from '../types';
import { updateOrderStatus, getOrderById } from '../db/orders';
import { t } from '../locales';

function staffStatusKeyboard(orderId: number, mode: string): InlineKeyboard {
  const kb = new InlineKeyboard();
  if (mode === 'delivery') {
    kb.text('⏳ Preparing (Đang chuẩn bị)', `staff_status_${orderId}_preparing`).row();
    kb.text('🚚 Dispatched (Đã giao)', `staff_status_${orderId}_dispatched`).row();
    kb.text('✅ Done (Hoàn thành)', `staff_status_${orderId}_served`).row();
  } else {
    kb.text('⏳ Preparing (Đang chuẩn bị)', `staff_status_${orderId}_preparing`).row();
    kb.text('🛵 Ready (Sẵn sàng)', `staff_status_${orderId}_ready`).row();
    kb.text('✅ Done (Hoàn thành)', `staff_status_${orderId}_served`).row();
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

      const remainingKb = new InlineKeyboard();
      if (updated.mode === 'delivery') {
        if (status === 'paid' || status === 'created') {
          remainingKb.text('⏳ Preparing (Đang chuẩn bị)', `staff_status_${orderId}_preparing`).row();
        }
        if (status === 'preparing') {
          remainingKb.text('🚚 Dispatched (Đã giao)', `staff_status_${orderId}_dispatched`).row();
        }
        if (status === 'dispatched') {
          remainingKb.text('✅ Done (Hoàn thành)', `staff_status_${orderId}_served`).row();
        }
      } else {
        if (status === 'paid' || status === 'created') {
          remainingKb.text('⏳ Preparing (Đang chuẩn bị)', `staff_status_${orderId}_preparing`).row();
        }
        if (status === 'preparing') {
          remainingKb.text('🛵 Ready (Sẵn sàng)', `staff_status_${orderId}_ready`).row();
        }
        if (status === 'ready') {
          remainingKb.text('✅ Done (Hoàn thành)', `staff_status_${orderId}_served`).row();
        }
      }

      const statusLabelVn: Record<string, string> = {
        paid: 'Đã thanh toán', preparing: 'Đang chuẩn bị', ready: 'Sẵn sàng',
        dispatched: 'Đã giao', served: 'Hoàn thành', picked_up: 'Đã lấy',
      };
      await ctx.editMessageText(
        `${formatOrderForStaff(updated)}\n\n✅ Cập nhật: ${statusLabelVn[status] || status} — ${ctx.from?.first_name || 'staff'}`,
        { reply_markup: remainingKb.inline_keyboard.length > 0 ? remainingKb : undefined }
      );
      if (updated.source?.startsWith('miniapp_telegram') || updated.source === 'bot') {
        const lang = updated.language;
        await bot.api.sendMessage(updated.chatId,
          formatStatusMessage(updated, status),
          { parse_mode: 'Markdown' }
        );
      }
    } catch (e) {
      console.error('Staff status update failed:', e);
    }
  });
}
