import { Bot, session } from 'grammy';
import { BotContext, initialSession } from './context';
import { config } from '../config';
import { registerStartHandler } from './handlers/start';
import { registerMenuHandlers } from './handlers/menu';
import { registerCartHandlers } from './handlers/cart';
import { registerCheckoutHandlers } from './handlers/checkout';
import { registerPaymentHandlers } from './handlers/payment';
import { registerReorderHandlers } from './handlers/reorder';
import { registerStaffCallbacks } from '../staff/notify';

let _bot: Bot<BotContext> | null = null;

export function createBot(): Bot<BotContext> {
  const bot = new Bot<BotContext>(config.botToken);

  bot.use(session({ initial: initialSession }));

  registerStartHandler(bot);
  registerMenuHandlers(bot);
  registerCartHandlers(bot);
  registerCheckoutHandlers(bot);
  registerPaymentHandlers(bot);
  registerReorderHandlers(bot);
  registerStaffCallbacks(bot);

  _bot = bot;
  return bot;
}

export function getBot(): Bot<BotContext> {
  if (!_bot) throw new Error('Bot not initialized');
  return _bot;
}
