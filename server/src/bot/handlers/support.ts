import { Bot, InlineKeyboard } from 'grammy';
import { BotContext } from '../context';
import { config } from '../../config';
import { t } from '../../locales';

export function registerSupportHandlers(bot: Bot<BotContext>): void {
  bot.hears(/^\/reply\s+(\d+)\s+([\s\S]+)/, async (ctx) => {
    if (String(ctx.chatId) !== config.staffChatId) return;
    const userId = Number(ctx.match[1]);
    const text = ctx.match[2].trim();
    try {
      await bot.api.sendMessage(userId, `${t('support_reply_header', 'en')}\n\n${text}`, { parse_mode: 'Markdown' });
      await ctx.reply(t('support_reply_sent', 'en').replace('{userId}', String(userId)));
    } catch {
      await ctx.reply(t('support_reply_failed', 'en').replace('{userId}', String(userId)));
    }
  });

  bot.on(':text', async (ctx) => {
    if (String(ctx.chatId) === config.staffChatId) return;
    if (ctx.message?.text?.startsWith('/')) return;

    const activeStep = ctx.session.step;
    const inputSteps = ['checkout_name', 'checkout_phone', 'checkout_address', 'checkout_address_edit', 'checkout_pickup_time', 'checkout_payment'];
    if (activeStep && inputSteps.includes(activeStep)) return;

    const lang = ctx.session.language || 'en';
    const name = ctx.from?.first_name || '';
    const username = ctx.from?.username ? `@${ctx.from?.username}` : '';
    const userId = ctx.from?.id || 0;
    const text = ctx.message?.text || '';

    const keyboard = new InlineKeyboard().text('📨 Ответить', `reply_${userId}`);

    await bot.api.sendMessage(config.staffChatId,
      `${t('support_new_message', 'en')}\n\n` +
      `👤 ${name} ${username}\n🆔 ${userId}\n📝 ${text}`,
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );

    await ctx.reply(t('support_message_forwarded', lang));
  });

  bot.callbackQuery(/^reply_(\d+)/, async (ctx) => {
    if (String(ctx.chatId) !== config.staffChatId) return;
    const userId = ctx.match[1];
    await ctx.answerCallbackQuery();
    await ctx.reply(t('support_reply_instruction', 'en').replace('{userId}', userId));
  });
}
