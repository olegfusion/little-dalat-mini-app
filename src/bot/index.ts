import { Bot, session } from 'grammy';
import { BotContext, initialSession } from './context';
import { config } from '../config';
import { registerStartHandler } from './handlers/start';
import { registerMenuHandlers } from './handlers/menu';
import { registerCartHandlers } from './handlers/cart';
import { registerCheckoutHandlers } from './handlers/checkout';
import { registerPaymentHandlers } from './handlers/payment';

export function createBot(): Bot<BotContext> {
  const bot = new Bot<BotContext>(config.botToken);

  bot.use(session({ initial: initialSession }));

  registerStartHandler(bot);
  registerMenuHandlers(bot);
  registerCartHandlers(bot);
  registerCheckoutHandlers(bot);
  registerPaymentHandlers(bot);

  return bot;
}
