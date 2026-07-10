import { Bot, InlineKeyboard, InputFile } from 'grammy';
import { BotContext } from '../context';
import { modeKeyboard, languageKeyboard, categoryKeyboard } from '../keyboards';
import { showMainMenuMsg } from './reorder';
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
        caption: `☕ *Little Dalat Coffee & Tea*\n02 Thi Sách, Phước Hòa, Nha Trang\n🕐 07:00–22:00 📞 0912066973`,
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
      // Already in dine-in mode from QR scan → show main menu
      const baseUrl = process.env.MINI_APP_URL || 'https://littledalat.nillkin.org';
      const miniAppUrl = baseUrl + (baseUrl.includes('?') ? '&' : '?') + 'chat_id=' + ctx.from?.id;
      ctx.session.step = 'main_menu';
      await ctx.deleteMessage().catch(() => {});
      await showMainMenuMsg(ctx, lang, miniAppUrl);
    } else {
      ctx.session.step = 'choosing_mode';
      await ctx.editMessageText(t('start_choose_mode', lang), {
        reply_markup: modeKeyboard(lang),
      });
    }
    await ctx.answerCallbackQuery();
  });

  bot.command('menu', async (ctx) => {
    const lang = ctx.session?.language || 'en';
    const baseUrl = process.env.MINI_APP_URL || 'https://littledalat.nillkin.org';
    const miniAppUrl = baseUrl + (baseUrl.includes('?') ? '&' : '?') + 'chat_id=' + ctx.from?.id;
    await ctx.reply('☕', {
      reply_markup: {
        inline_keyboard: [[{
          text: '🛵 Open Mini App',
          web_app: { url: miniAppUrl },
        }]],
      },
    });
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
      reply_markup: new InlineKeyboard().url('🗺️ Google Maps', config.shop.mapsUrl),
    });
  });

  bot.callbackQuery(/^mode_(.+)$/, async (ctx) => {
    const mode = ctx.match[1] as 'dine-in' | 'pickup' | 'delivery';
    ctx.session.mode = mode;
    ctx.session.step = 'main_menu';
    await ctx.deleteMessage().catch(() => {});
    const baseUrl = process.env.MINI_APP_URL || 'https://littledalat.nillkin.org';
    const miniAppUrl = baseUrl + (baseUrl.includes('?') ? '&' : '?') + 'chat_id=' + ctx.from?.id;
    await showMainMenuMsg(ctx, ctx.session.language, miniAppUrl);
    await ctx.answerCallbackQuery();
  });
}
