import { Bot, InlineKeyboard, InputFile } from 'grammy';
import { BotContext } from '../context';
import { modeKeyboard, languageKeyboard, categoryKeyboard } from '../keyboards';
import { t } from '../../locales';
import { Language } from '../../types';
import { config } from '../../config';

export function registerStartHandler(bot: Bot<BotContext>): void {
  bot.command('start', async (ctx) => {
    const raw = ctx.message?.text || '';
    const match = raw.match(/\/start\s+table_(\d+)/i);
    if (match) {
      ctx.session.tableNumber = match[1];
      ctx.session.mode = 'dine-in';
    }
    ctx.session.cart = [];
    ctx.session.step = 'choosing_language';

    try {
      await ctx.replyWithPhoto(new InputFile('logo.png'), {
        caption: `☕ *Little Dalat Coffee & Tea*\n02 Thi Sách, Phước Hòa, Nha Trang\n🕐 06:30–21:30 📞 0912066973`,
        parse_mode: 'Markdown',
      });
    } catch { /* fallback: no logo */ }

    await ctx.reply('🇻🇳 Tiếng Việt — Vui lòng chọn ngôn ngữ:\n🇬🇧 English — Please select language:\n🇷🇺 Русский — Пожалуйста, выберите язык:', {
      reply_markup: languageKeyboard(),
    });
  });

  bot.callbackQuery(/^lang_(.+)$/, async (ctx) => {
    const lang = ctx.match[1] as Language;
    ctx.session.language = lang;

    if (ctx.session.mode) {
      // Already in dine-in mode from QR scan → go straight to menu
      ctx.session.step = 'browsing';
      const tableInfo = ctx.session.tableNumber
        ? `\n📍 ${t('table', lang)}: ${ctx.session.tableNumber} | ${t('mode_dine_in', lang)}`
        : '';
      await ctx.editMessageText(`${t('select_category', lang)}${tableInfo}`, {
        reply_markup: categoryKeyboard(lang),
      });
    } else {
      ctx.session.step = 'choosing_mode';
      await ctx.editMessageText(t('start_choose_mode', lang), {
        reply_markup: modeKeyboard(lang),
      });
    }
    await ctx.answerCallbackQuery();
  });

  bot.command('contact', async (ctx) => {
    const lang = ctx.session?.language || 'en';
    const kb = new InlineKeyboard()
      .url('💬 WhatsApp', 'https://wa.me/84912066973')
      .url('💬 Zalo', 'https://zalo.me/84912066973')
      .row()
      .url('✈️ Telegram', 'https://t.me/littledalatbot');
    await ctx.reply(t('contact_msg', lang), { reply_markup: kb });
  });

  bot.command('map', async (ctx) => {
    const lang = ctx.session?.language || 'en';
    const lat = config.shop.lat;
    const lng = config.shop.lng;
    await ctx.reply(t('map_msg', lang, { lat, lng }), {
      reply_markup: new InlineKeyboard().url('🗺️ Google Maps', `https://www.google.com/maps?q=${lat},${lng}`),
    });
  });

  bot.callbackQuery(/^mode_(.+)$/, async (ctx) => {
    const mode = ctx.match[1] as 'dine-in' | 'pickup' | 'delivery';
    ctx.session.mode = mode;
    ctx.session.step = 'browsing';
    await ctx.editMessageText(t('select_category', ctx.session.language), {
      reply_markup: categoryKeyboard(ctx.session.language),
    });
    await ctx.answerCallbackQuery();
  });
}
