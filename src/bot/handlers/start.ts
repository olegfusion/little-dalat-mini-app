import { Bot } from 'grammy';
import { BotContext } from '../context';
import { modeKeyboard, languageKeyboard, categoryKeyboard } from '../keyboards';
import { t } from '../../locales';
import { Language } from '../../types';

export function registerStartHandler(bot: Bot<BotContext>): void {
  bot.command('start', async (ctx) => {
    const raw = ctx.message?.text || '';
    const match = raw.match(/\/start\s+table_(\d+)/i);
    if (match) {
      ctx.session.tableNumber = match[1];
      ctx.session.mode = 'dine-in';
    }
    ctx.session.cart = [];
    ctx.session.step = 'choosing_mode';

    const reply = t('start_choose_mode', ctx.session.language);

    if (ctx.session.mode) {
      await ctx.reply(t('choose_language', ctx.session.language), {
        reply_markup: languageKeyboard(),
      });
    } else {
      await ctx.reply(reply, {
        reply_markup: modeKeyboard(ctx.session.language),
      });
    }
  });

  bot.callbackQuery(/^mode_(.+)$/, async (ctx) => {
    const mode = ctx.match[1] as 'dine-in' | 'pickup' | 'delivery';
    ctx.session.mode = mode;
    ctx.session.step = 'choosing_language';
    await ctx.editMessageText(t('choose_language', ctx.session.language), {
      reply_markup: languageKeyboard(),
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^lang_(.+)$/, async (ctx) => {
    const lang = ctx.match[1] as Language;
    ctx.session.language = lang;
    ctx.session.step = 'browsing';
    const tableInfo = ctx.session.tableNumber
      ? `\n📍 ${t('table', lang)}: ${ctx.session.tableNumber} | ${t('mode_dine_in', lang)}`
      : '';
    await ctx.editMessageText(`${t('select_category', lang)}${tableInfo}`, {
      reply_markup: categoryKeyboard(lang, ctx.session.mode),
    });
    await ctx.answerCallbackQuery();
  });
}
