import { Bot } from 'grammy';
import { BotContext } from '../context';
import { getItemById, getItemName } from '../../data/menu';
import { cartKeyboard } from '../keyboards';
import { t } from '../../locales';
import { Language } from '../../types';
import { config } from '../../config';

export function registerCartHandlers(bot: Bot<BotContext>): void {
  bot.callbackQuery('view_cart', async (ctx) => {
    const lang = ctx.session.language;
    const cart = ctx.session.cart;

    if (cart.length === 0) {
      await ctx.answerCallbackQuery(t('cart_empty', lang));
      return;
    }

    const text = buildCartText(cart, lang, ctx.session.deliveryFee);
    await ctx.editMessageText(text, {
      reply_markup: cartKeyboard(lang),
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('clear_cart', async (ctx) => {
    ctx.session.cart = [];
    const lang = ctx.session.language;
    await ctx.editMessageText(t('cart_empty', lang), {
      reply_markup: cartKeyboard(lang),
    });
    await ctx.answerCallbackQuery();
  });
}

export function buildCartText(cart: { menuItemId: string; quantity: number }[], lang: Language, deliveryFee: number = 0): string {
  let text = `🛒 ${t('cart_title', lang)}\n\n`;
  let subtotal = 0;

  for (const ci of cart) {
    const item = getItemById(ci.menuItemId);
    if (item) {
      const name = getItemName(item, lang);
      const lineTotal = item.price * ci.quantity;
      subtotal += lineTotal;
      text += `${name} x${ci.quantity} — ${lineTotal / 1000}${config.currency}\n`;
    }
  }

  text += `\n${t('total', lang)}: ${subtotal / 1000}${config.currency}\n`;
  if (deliveryFee > 0) {
    text += `${t('delivery_fee', lang)}: ${deliveryFee / 1000}${config.currency}\n`;
    text += `${t('grand_total', lang)}: ${(subtotal + deliveryFee) / 1000}${config.currency}\n`;
  }

  return text;
}
