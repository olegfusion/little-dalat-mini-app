import { Bot, InlineKeyboard } from 'grammy';
import { BotContext } from '../context';
import { t } from '../../locales';
import { paymentConfirmKeyboard, confirmOrderKeyboard, modeKeyboard } from '../keyboards';
import { generateVietQR } from '../../lib/vietqr';
import { createOrder, getOrderById, updateOrderStatus } from '../../db/orders';
import { notifyStaff } from '../../staff/notify';
import { INITIAL_MENU_ITEMS } from '../../data/menu';

export function registerPaymentHandlers(bot: Bot<BotContext>): void {
  bot.callbackQuery('pay_qr', async (ctx) => {
    const lang = ctx.session.language;
    const cart = ctx.session.cart;
    const subtotal = cart.reduce((sum, ci) => {
      const item = INITIAL_MENU_ITEMS.find(i => i.id === ci.menuItemId);
      return sum + (item?.price || 0) * ci.quantity;
    }, 0);
    const total = subtotal + (ctx.session.deliveryFee || 0);

    const order = createOrder({
      chatId: ctx.chat!.id,
      tableNumber: ctx.session.tableNumber,
      mode: ctx.session.mode || 'dine-in',
      items: cart,
      total,
      deliveryFee: ctx.session.deliveryFee || 0,
      paymentMethod: 'qr',
      customerName: ctx.session.customerName || '',
      customerPhone: ctx.session.customerPhone || '',
      deliveryAddress: ctx.session.deliveryAddress || '',
      deliveryLat: ctx.session.deliveryLat || null,
      deliveryLng: ctx.session.deliveryLng || null,
      language: lang,
    });

    ctx.session.pendingOrderId = order.id;

    const qr = generateVietQR(order.id, total);

    await ctx.editMessageText(t('payment_qr_info', lang, { amount: total / 1000 }));

    await ctx.replyWithPhoto(qr.imageUrl, {
      caption: t('payment_qr_waiting', lang),
      reply_markup: paymentConfirmKeyboard(lang),
    });

    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('pay_cash', async (ctx) => {
    const lang = ctx.session.language;
    await ctx.editMessageText(t('payment_cash_info', lang), {
      reply_markup: confirmOrderKeyboard(lang),
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('confirm_paid', async (ctx) => {
    const lang = ctx.session.language;
    const orderId = ctx.session.pendingOrderId;
    if (!orderId) {
      await ctx.answerCallbackQuery('No pending order');
      return;
    }

    updateOrderStatus(orderId, 'paid');
    const order = getOrderById(orderId);
    if (order) {
      await notifyStaff(bot, order);
    }

    ctx.session.cart = [];
    ctx.session.pendingOrderId = undefined;
    ctx.session.deliveryFee = 0;

    const mode = ctx.session.mode;
    const msg = mode === 'delivery'
      ? t('order_delivery_msg', lang, { id: orderId })
      : mode === 'pickup'
      ? t('order_pickup_msg', lang, { id: orderId })
      : t('order_dinein_msg', lang, { id: orderId, table: ctx.session.tableNumber || '?' });

    await ctx.reply(msg, { parse_mode: 'Markdown' });
    await ctx.reply(t('new_order_prompt', lang), {
      reply_markup: new InlineKeyboard().text(t('new_order', lang), 'start_new_order'),
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('start_new_order', async (ctx) => {
    const lang = ctx.session.language;
    ctx.session.cart = [];
    ctx.session.mode = null;
    ctx.session.tableNumber = null;
    ctx.session.step = 'choosing_mode';
    ctx.session.currentCategory = null;
    ctx.session.currentPage = 0;
    ctx.session.itemsMessageId = null;
    await ctx.editMessageText(t('start_choose_mode', lang), {
      reply_markup: modeKeyboard(lang),
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('back_payment', async (ctx) => {
    const lang = ctx.session.language;
    const cart = ctx.session.cart;
    const subtotal = cart.reduce((sum, ci) => {
      const item = INITIAL_MENU_ITEMS.find(i => i.id === ci.menuItemId);
      return sum + (item?.price || 0) * ci.quantity;
    }, 0);
    const total = subtotal + (ctx.session.deliveryFee || 0);
    const text = `${t('total', lang)}: ${total / 1000}k`;
    await ctx.editMessageText(`${text}\n\n${t('choose_payment', lang)}`, {
      reply_markup: new InlineKeyboard()
        .text(t('btn_qr', lang), 'pay_qr')
        .text(t('btn_cash', lang), 'pay_cash'),
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('confirm_order', async (ctx) => {
    const lang = ctx.session.language;
    const cart = ctx.session.cart;
    const subtotal = cart.reduce((sum, ci) => {
      const item = INITIAL_MENU_ITEMS.find(i => i.id === ci.menuItemId);
      return sum + (item?.price || 0) * ci.quantity;
    }, 0);
    const total = subtotal + (ctx.session.deliveryFee || 0);

    const order = createOrder({
      chatId: ctx.chat!.id,
      tableNumber: ctx.session.tableNumber,
      mode: ctx.session.mode || 'dine-in',
      items: cart,
      total,
      deliveryFee: ctx.session.deliveryFee || 0,
      paymentMethod: 'cash',
      customerName: ctx.session.customerName || '',
      customerPhone: ctx.session.customerPhone || '',
      deliveryAddress: ctx.session.deliveryAddress || '',
      deliveryLat: ctx.session.deliveryLat || null,
      deliveryLng: ctx.session.deliveryLng || null,
      language: lang,
    });

    await notifyStaff(bot, order);

    ctx.session.cart = [];
    ctx.session.deliveryFee = 0;

    const mode = ctx.session.mode;
    const msg = mode === 'delivery'
      ? t('order_delivery_msg', lang, { id: order.id })
      : mode === 'pickup'
      ? t('order_pickup_msg', lang, { id: order.id })
      : t('order_dinein_msg', lang, { id: order.id, table: ctx.session.tableNumber || '?' });

    await ctx.reply(msg, { parse_mode: 'Markdown' });
    await ctx.reply(t('new_order_prompt', lang), {
      reply_markup: new InlineKeyboard().text(t('new_order', lang), 'start_new_order'),
    });
    await ctx.answerCallbackQuery();
  });
}
