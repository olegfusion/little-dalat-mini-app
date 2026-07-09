import { Bot, InlineKeyboard } from 'grammy';
import { BotContext } from '../context';
import { getItemsByCategory, getItemById, getItemName, getItemVariantName } from '../../data/menu';
import { CATEGORIES } from '../../data/categories';
import { categoryKeyboard } from '../keyboards';
import { t } from '../../locales';
import { MenuItem, Language } from '../../types';
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

    const cat = CATEGORIES.find(c => c.id === categoryId);
    if (cat) {
      const catName = (cat as any)[lang === 'vn' ? 'vietnamese' : lang === 'ru' ? 'russian' : 'english'] as string;
      try {
        await ctx.replyWithPhoto(cat.imageUrl, { caption: `📌 *${catName}*`, parse_mode: 'Markdown' });
      } catch { /* image failed */ }
    }

    ctx.session.currentCategory = categoryId;
    ctx.session.currentPage = 0;
    ctx.session.itemsMessageId = null;
    await showItemPage(ctx, categoryId, items, 0, lang);
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

    if (item.variants) {
      const kb = new InlineKeyboard();
      item.variants[lang === 'vn' ? 'vn' : lang === 'ru' ? 'ru' : 'en'].forEach((v, i) => {
        kb.text(v, `pick_${itemId}_${i}`).row();
      });
      kb.text(t('back', lang), 'back_item_page');
      await ctx.editMessageText(`${getItemName(item, lang)}\n\n${t('choose_variant', lang)}:`, { reply_markup: kb });
      await ctx.answerCallbackQuery();
      return;
    }

    const existing = ctx.session.cart.find(c => c.menuItemId === itemId);
    if (existing) {
      existing.quantity++;
    } else {
      ctx.session.cart.push({ menuItemId: itemId, quantity: 1 });
    }

    const qty = existing ? existing.quantity : 1;
    await ctx.answerCallbackQuery(`✅ ${getItemName(item, lang)} — +1 (${qty})`);

    const cat = ctx.session.currentCategory;
    if (cat) {
      const items = getItemsByCategory(cat);
      await showItemPage(ctx, cat, items, ctx.session.currentPage, lang);
    }
  });

  bot.callbackQuery(/^pick_(.+)_(\d+)$/, async (ctx) => {
    const itemId = ctx.match[1];
    const variantIndex = parseInt(ctx.match[2]);
    const lang = ctx.session.language;
    const item = getItemById(itemId);

    if (!item) {
      await ctx.answerCallbackQuery('Item not found');
      return;
    }

    const existing = ctx.session.cart.find(c => c.menuItemId === itemId && c.variantIndex === variantIndex);
    if (existing) {
      existing.quantity++;
    } else {
      ctx.session.cart.push({ menuItemId: itemId, quantity: 1, variantIndex });
    }

    const variant = getItemVariantName(item, lang, variantIndex);
    const qty = existing ? existing.quantity : 1;
    await ctx.answerCallbackQuery(`✅ ${getItemName(item, lang)} (${variant}) — +1 (${qty})`);

    const cat = ctx.session.currentCategory;
    if (cat) {
      const items = getItemsByCategory(cat);
      await showItemPage(ctx, cat, items, ctx.session.currentPage, lang);
    }
  });

  bot.callbackQuery('back_item_page', async (ctx) => {
    const lang = ctx.session.language;
    const cat = ctx.session.currentCategory;
    if (cat) {
      const items = getItemsByCategory(cat);
      await showItemPage(ctx, cat, items, ctx.session.currentPage, lang);
    }
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('back_categories', async (ctx) => {
    const lang = ctx.session.language;
    ctx.session.currentCategory = null;
    ctx.session.currentPage = 0;
    ctx.session.itemsMessageId = null;
    await ctx.editMessageText(t('select_category', lang), {
      reply_markup: categoryKeyboard(lang),
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^page_(.+)_(\d+)$/, async (ctx) => {
    const categoryId = ctx.match[1];
    const page = parseInt(ctx.match[2]);
    const lang = ctx.session.language;
    const items = getItemsByCategory(categoryId);

    ctx.session.currentCategory = categoryId;
    ctx.session.currentPage = page;
    await showItemPage(ctx, categoryId, items, page, lang);
    await ctx.answerCallbackQuery();
  });
}

async function showItemPage(
  ctx: BotContext,
  categoryId: string,
  items: MenuItem[],
  page: number,
  lang: Language,
): Promise<void> {
  const kb = new InlineKeyboard();

  for (const item of items) {
    const name = getItemName(item, lang);
    const cartItem = ctx.session.cart.find(c => c.menuItemId === item.id);
    const qty = cartItem ? ` ×${cartItem.quantity}` : '';
    kb.text(`${name} \u2014 ${item.price / 1000}${config.currency}${qty}`, `add_${item.id}`).row();
  }

  kb.text(`🛒 ${t('view_cart', lang)}`, 'view_cart');
  kb.text(t('back', lang), 'back_categories');

  const cat = CATEGORIES.find(c => c.id === categoryId);
  const catName = cat ? (cat as any)[lang === 'vn' ? 'vietnamese' : lang === 'ru' ? 'russian' : 'english'] : categoryId;
  const text = `📋 ${catName}`;

  if (ctx.session.itemsMessageId) {
    await ctx.api.editMessageText(ctx.chat!.id, ctx.session.itemsMessageId, text, { reply_markup: kb });
  } else {
    const sent = await ctx.reply(text, { reply_markup: kb });
    ctx.session.itemsMessageId = sent.message_id;
  }
}
