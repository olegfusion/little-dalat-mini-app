import { Bot } from 'grammy';
import { BotContext } from '../context';
import { getItemsByCategory, getItemById, getItemName } from '../../data/menu';
import { itemActionKeyboard, categoryKeyboard } from '../keyboards';
import { t } from '../../locales';
import { MenuItem } from '../../types';
import { config } from '../../config';

export function registerMenuHandlers(bot: Bot<BotContext>): void {
  bot.callbackQuery(/^cat_(.+)$/, async (ctx) => {
    const categoryId = ctx.match[1];
    const lang = ctx.session.language;
    const items = getItemsByCategory(categoryId);

    if (items.length === 0) {
      await ctx.answerCallbackQuery('No items in this category');
      return;
    }

    const chunks: MenuItem[][] = [];
    for (let i = 0; i < items.length; i += 10) {
      chunks.push(items.slice(i, i + 10));
    }

    let chunkIndex = 0;
    const chunk = chunks[0];

    let text = `${t('items_in', lang)}:\n\n`;
    for (const item of chunk) {
      const name = getItemName(item, lang);
      text += `• ${name} — ${item.price / 1000}${config.currency}\n`;
    }

    const kb = itemActionKeyboard(chunk[0].id, lang);
    if (chunks.length > 1) {
      kb.row().text('▶️', `page_${categoryId}_${chunkIndex + 1}`);
    }
    kb.row().text(t('back', lang), 'back_categories');

    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^add_(.+)$/, async (ctx) => {
    const itemId = ctx.match[1];
    const lang = ctx.session.language;
    const item = getItemById(itemId);

    if (!item) {
      await ctx.answerCallbackQuery('Item not found');
      return;
    }

    const existing = ctx.session.cart.find(c => c.menuItemId === itemId);
    if (existing) {
      existing.quantity++;
    } else {
      ctx.session.cart.push({ menuItemId: itemId, quantity: 1 });
    }

    await ctx.answerCallbackQuery(t('added_to_cart', lang));
  });

  bot.callbackQuery('back_categories', async (ctx) => {
    const lang = ctx.session.language;
    await ctx.editMessageText(t('select_category', lang), {
      reply_markup: categoryKeyboard(lang, ctx.session.mode),
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^page_(.+)_(\d+)$/, async (ctx) => {
    const categoryId = ctx.match[1];
    const page = parseInt(ctx.match[2]);
    const lang = ctx.session.language;
    const items = getItemsByCategory(categoryId);
    const chunks: MenuItem[][] = [];
    for (let i = 0; i < items.length; i += 10) {
      chunks.push(items.slice(i, i + 10));
    }

    if (page >= chunks.length) {
      await ctx.answerCallbackQuery('No more items');
      return;
    }

    const chunk = chunks[page];
    let text = `${t('items_in', lang)}:\n\n`;
    for (const item of chunk) {
      const name = getItemName(item, lang);
      text += `• ${name} — ${item.price / 1000}${config.currency}\n`;
    }

    const kb = itemActionKeyboard(chunk[0].id, lang);
    if (page > 0) {
      kb.text('◀️', `page_${categoryId}_${page - 1}`);
    }
    if (page < chunks.length - 1) {
      kb.text('▶️', `page_${categoryId}_${page + 1}`);
    }
    kb.row().text(t('back', lang), 'back_categories');

    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });
}
