import { Bot, InlineKeyboard } from 'grammy';
import { BotContext } from '../context';
import { config } from '../../config';
import { t } from '../../locales';
import { Language } from '../../types';
import { getDb } from '../../db/schema';

export function registerSupportHandlers(bot: Bot<BotContext>): void {
  const db = getDb();
  db.exec(`CREATE TABLE IF NOT EXISTS support_messages (
    staff_msg_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_lang TEXT NOT NULL DEFAULT 'en',
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  )`);

  bot.hears(/^\/reply\s+(\d+)\s+([\s\S]+)/, async (ctx) => {
    if (String(ctx.chatId) !== config.staffChatId) return;
    const userId = Number(ctx.match[1]);
    const text = ctx.match[2].trim();
    try {
      const row = db.prepare('SELECT user_lang FROM support_messages WHERE user_id = ? ORDER BY created_at DESC').get(userId) as { user_lang: string } | undefined;
      const ul = (row?.user_lang || 'en') as Language;
      await bot.api.sendMessage(userId, `${t('support_reply_header', ul)}\n\n${text}`, { parse_mode: 'Markdown' });
      const staffLang = (ctx.session.language || 'en') as Language;
      await ctx.reply(`✅ ${t('support_reply_sent', staffLang).replace('{userId}', String(userId))}`);
    } catch {
      await ctx.reply(`❌ ${t('support_reply_failed', (ctx.session.language || 'en') as Language).replace('{userId}', String(userId))}`);
    }
  });

  bot.on(':text', async (ctx) => {
    const staffLang = (ctx.session.language || 'en') as Language;
    if (String(ctx.chatId) === config.staffChatId) {
      const replyTo = ctx.message?.reply_to_message;
      if (replyTo) {
        const row = db.prepare('SELECT user_id, user_lang FROM support_messages WHERE staff_msg_id = ?').get(replyTo.message_id) as { user_id: number; user_lang: string } | undefined;
        if (row) {
          const text = ctx.message?.text || '';
          const ul = (row.user_lang || 'en') as Language;
          try {
            await bot.api.sendMessage(row.user_id, `${t('support_reply_header', ul)}\n\n${text}`, { parse_mode: 'Markdown' });
            await ctx.reply(`✅ ${t('support_reply_sent', staffLang).replace('{userId}', String(row.user_id))}`, { reply_to_message_id: replyTo.message_id });
          } catch {
            await ctx.reply(`❌ ${t('support_reply_failed', staffLang).replace('{userId}', String(row.user_id))}`, { reply_to_message_id: replyTo.message_id });
          }
          return;
        }
      }
      return;
    }

    if (ctx.message?.text?.startsWith('/')) return;

    const activeStep = ctx.session.step;
    const inputSteps = ['checkout_name', 'checkout_phone', 'checkout_address', 'checkout_address_edit', 'checkout_pickup_time', 'checkout_payment'];
    if (activeStep && inputSteps.includes(activeStep)) return;

    const lang = ctx.session.language || 'en';
    const name = ctx.from?.first_name || '';
    const username = ctx.from?.username ? `@${ctx.from?.username}` : '';
    const userId = ctx.from?.id || 0;
    const text = ctx.message?.text || '';

    const keyboard = new InlineKeyboard()
      .text('📨 ' + t('support_reply_btn', lang), `reply_${userId}`);

    const sent = await bot.api.sendMessage(config.staffChatId,
      `${t('support_new_message', lang)}\n\n` +
      `👤 ${name} ${username}\n🆔 ${userId}\n📝 ${text}`,
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );

    db.prepare('INSERT OR REPLACE INTO support_messages (staff_msg_id, user_id, user_lang) VALUES (?, ?, ?)').run(sent.message_id, userId, lang);

    await ctx.reply(t('support_message_forwarded', lang));
  });

  bot.callbackQuery(/^reply_(\d+)/, async (ctx) => {
    if (String(ctx.chatId) !== config.staffChatId) return;
    const userId = ctx.match[1];
    await ctx.answerCallbackQuery();
    await ctx.reply(t('support_reply_instruction', (ctx.session.language || 'en') as Language).replace('{userId}', userId));
  });
}
