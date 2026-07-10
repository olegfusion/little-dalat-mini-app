import { Bot, InlineKeyboard } from 'grammy';
import { BotContext } from '../context';
import { config } from '../../config';
import { getDb } from '../../db/schema';
import { t } from '../../locales';

export function registerSupportHandlers(bot: Bot<BotContext>): void {
  bot.hears(/^\/reply\s+(\d+)\s+([\s\S]+)/, async (ctx) => {
    if (String(ctx.chatId) !== config.staffChatId) return;
    const userId = Number(ctx.match[1]);
    const text = ctx.match[2].trim();
    try {
      await bot.api.sendMessage(userId, `📬 *Ответ от Little Dalat:*\n\n${text}`, { parse_mode: 'Markdown' });
      await ctx.reply(`✅ Ответ отправлен пользователю ${userId}`);
    } catch {
      await ctx.reply(`❌ Не удалось отправить пользователю ${userId}. Возможно, он заблокировал бота.`);
    }
  });

  bot.on(':text', async (ctx) => {
    if (String(ctx.chatId) === config.staffChatId) return;
    if (ctx.message?.text?.startsWith('/')) return;

    const activeStep = ctx.session.step;
    if (activeStep && !['choosing_language', 'idle'].includes(activeStep)) return;

    const name = ctx.from?.first_name || '';
    const username = ctx.from?.username ? `@${ctx.from?.username}` : '';
    const userId = ctx.from?.id || 0;
    const text = ctx.message?.text || '';

    const chatId = config.staffChatId;
    const keyboard = new InlineKeyboard().text('📨 Ответить', `reply_${userId}`);

    await bot.api.sendMessage(chatId,
      `💬 *Новое сообщение от пользователя*\n\n` +
      `👤 ${name} ${username}\n🆔 ${userId}\n📝 ${text}`,
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );

    await ctx.reply('📩 Ваше сообщение отправлено администратору. Мы ответим в ближайшее время!');
  });

  bot.callbackQuery(/^reply_(\d+)/, async (ctx) => {
    if (String(ctx.chatId) !== config.staffChatId) return;
    const userId = ctx.match[1];
    await ctx.answerCallbackQuery();
    await ctx.reply(
      `✏️ Чтобы ответить пользователю ${userId}, отправьте:\n/reply ${userId} ваш текст`
    );
  });
}
