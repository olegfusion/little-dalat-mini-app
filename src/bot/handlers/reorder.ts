import { Bot, InlineKeyboard } from 'grammy';
import { BotContext } from '../context';
import { t } from '../../locales';
import { getOrdersByChatId, getOrderById } from '../../db/orders';
import { Order, CartItem, Language } from '../../types';
import { INITIAL_MENU_ITEMS } from '../../data/menu';
import { paymentKeyboard } from '../keyboards';

export async function showMainMenuMsg(ctx: BotContext, lang: string, miniAppUrl: string): Promise<void> {
  const modeLabel = ctx.session.mode
    ? `\n${ctx.session.mode === 'dine-in' ? '🍽️' : ctx.session.mode === 'pickup' ? '🛍️' : '🚚'} ${t('mode_' + ctx.session.mode.replace('-', '_'), lang as Language)}` +
      (ctx.session.tableNumber ? ` | ${t('table', lang as Language)} ${ctx.session.tableNumber}` : '')
    : '';
  await ctx.reply(`☕ *Little Dalat*${modeLabel}`, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🛵 ' + t('btn_open_menu', lang as Language), web_app: { url: miniAppUrl } }],
        [{ text: '🔄 ' + t('btn_reorder', lang as Language), callback_data: 'reorder_last' }],
        [{ text: '📋 ' + t('btn_status', lang as Language), callback_data: 'status_show' }],
      ],
    },
  });
}

function formatOrderStatus(order: Order, lang: Language): string {
  const statusLabels: Record<string, string> = {
    created: '📝 ' + t('status_created', lang),
    paid: '✅ ' + t('status_paid', lang),
    preparing: '⏳ ' + t('status_preparing', lang),
    ready: '🛵 ' + t('status_ready', lang),
    served: '✅ ' + t('status_served', lang),
    picked_up: '✅ ' + t('status_picked_up', lang),
    dispatched: '🚚 ' + t('status_dispatched', lang),
  };
  return `📋 *Order #${order.id}*\n` +
    `Status: ${statusLabels[order.status] || order.status}\n` +
    `Total: ${order.total / 1000}k\n` +
    `Mode: ${order.mode}\n` +
    `📅 ${order.createdAt}`;
}

export function registerReorderHandlers(bot: Bot<BotContext>): void {
  bot.callbackQuery('reorder_last', async (ctx) => {
    const lang = ctx.session.language;
    await ctx.answerCallbackQuery();
    const orders = getOrdersByChatId(ctx.chat!.id);
    const order = orders.find(o => (o as any).status !== 'cancelled');
    if (!order) {
      await ctx.reply('⚠️ ' + t('order_not_found', lang)).catch(() => {});
      return;
    }
    const items: CartItem[] = JSON.parse(order.items as string);
    const summary = items.map(ci => {
      const item = INITIAL_MENU_ITEMS.find(i => i.id === ci.menuItemId);
      const name = item ? item.english : ci.menuItemId;
      return `• ${name} x${ci.quantity} — ${((item?.price || 0) * ci.quantity) / 1000}k`;
    }).join('\n');
    ctx.session.reorderData = { items, total: order.total, deliveryFee: order.deliveryFee || 0 };
    await ctx.reply(
      `🔄 *${t('choose_order', lang)}*\n\n${summary}\n\n${t('total', lang)}: ${order.total / 1000}k`,
      {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard()
          .text('✅ ' + t('place_order', lang), 'reorder_confirm_yes')
          .text(t('back', lang), 'main_menu'),
      }
    );
  });

  bot.callbackQuery('reorder_confirm_yes', async (ctx) => {
    const lang = ctx.session.language;
    await ctx.answerCallbackQuery();
    if (!ctx.session.reorderData) {
      await ctx.reply('⚠️ ' + t('order_not_found', lang)).catch(() => {});
      return;
    }
    ctx.session.cart = ctx.session.reorderData.items;
    ctx.session.deliveryFee = ctx.session.reorderData.deliveryFee;
    ctx.session.reorderData = null;
    const subtotal = ctx.session.cart.reduce((sum, ci) => {
      const item = INITIAL_MENU_ITEMS.find(i => i.id === ci.menuItemId);
      return sum + (item?.price || 0) * ci.quantity;
    }, 0);
    const total = subtotal + Math.max(0, ctx.session.deliveryFee || 0);
    await ctx.editMessageText(`${t('total', lang)}: ${total / 1000}k\n\n${t('choose_payment', lang)}`, {
      reply_markup: paymentKeyboard(lang, ctx.session.mode),
    }).catch(() => {
      ctx.reply(`${t('total', lang)}: ${total / 1000}k\n\n${t('choose_payment', lang)}`, {
        reply_markup: paymentKeyboard(lang, ctx.session.mode),
      });
    });
  });

  bot.callbackQuery('status_show', async (ctx) => {
    const lang = ctx.session.language;
    await ctx.answerCallbackQuery();
    const orders = getOrdersByChatId(ctx.chat!.id);
    if (orders.length === 0) {
      await ctx.reply('⚠️ ' + t('order_not_found', lang)).catch(() => {});
      return;
    }
    const recent = orders.slice(0, 3);
    const kb = new InlineKeyboard();
    for (const o of recent) {
      kb.text(`#${o.id}`, `status_detail_${o.id}`).row();
    }
    kb.text(t('back', lang), 'main_menu');
    await ctx.reply(`📋 ${t('your_orders', lang)}`, { reply_markup: kb });
  });

  bot.callbackQuery(/^status_detail_(\d+)$/, async (ctx) => {
    const lang = ctx.session.language;
    await ctx.answerCallbackQuery();
    const orderId = parseInt(ctx.match[1], 10);
    const order = getOrderById(orderId);
    if (!order) {
      await ctx.reply('⚠️ ' + t('order_not_found', lang)).catch(() => {});
      return;
    }
    await ctx.editMessageText(formatOrderStatus(order, lang), {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().text(t('back', lang), 'status_show'),
    }).catch(() => {
      ctx.reply(formatOrderStatus(order, lang), {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard().text(t('back', lang), 'status_show'),
      });
    });
  });

  bot.callbackQuery('main_menu', async (ctx) => {
    const lang = ctx.session.language;
    await ctx.deleteMessage().catch(() => {});
    const baseUrl = process.env.MINI_APP_URL || 'https://littledalat.nillkin.org';
    const miniAppUrl = baseUrl + (baseUrl.includes('?') ? '&' : '?') + 'chat_id=' + ctx.from?.id;
    ctx.session.step = 'main_menu';
    await showMainMenuMsg(ctx, lang, miniAppUrl);
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('reorder_list', async (ctx) => {
    const lang = ctx.session.language;
    await ctx.answerCallbackQuery();
    const orders = getOrdersByChatId(ctx.chat!.id);
    if (orders.length === 0) {
      await ctx.reply('⚠️ ' + t('order_not_found', lang)).catch(() => {});
      return;
    }
    const recent = orders.slice(0, 5);
    const kb = new InlineKeyboard();
    for (const o of recent) {
      const totalK = o.total / 1000;
      kb.text(`#${o.id} — ${totalK}k`, `reorder_id_${o.id}`).row();
    }
    kb.text(t('back', lang), 'main_menu');
    await ctx.reply(`🔄 ${t('choose_order', lang)}`, { reply_markup: kb });
  });

  bot.callbackQuery(/^reorder_id_(\d+)$/, async (ctx) => {
    const lang = ctx.session.language;
    await ctx.answerCallbackQuery();
    const orderId = parseInt(ctx.match[1], 10);
    const order = getOrderById(orderId);
    if (!order) {
      await ctx.reply('⚠️ ' + t('order_not_found', lang)).catch(() => {});
      return;
    }
    const items: CartItem[] = JSON.parse(order.items as string);
    ctx.session.cart = items;
    ctx.session.deliveryFee = order.deliveryFee || 0;
    const subtotal = items.reduce((sum, ci) => {
      const item = INITIAL_MENU_ITEMS.find(i => i.id === ci.menuItemId);
      return sum + (item?.price || 0) * ci.quantity;
    }, 0);
    const total = subtotal + Math.max(0, ctx.session.deliveryFee || 0);
    await ctx.editMessageText(`${t('total', lang)}: ${total / 1000}k\n\n${t('choose_payment', lang)}`, {
      reply_markup: paymentKeyboard(lang, ctx.session.mode),
    }).catch(() => {
      ctx.reply(`${t('total', lang)}: ${total / 1000}k\n\n${t('choose_payment', lang)}`, {
        reply_markup: paymentKeyboard(lang, ctx.session.mode),
      });
    });
  });
}
