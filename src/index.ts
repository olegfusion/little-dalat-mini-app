import { createBot } from './bot';
import { getDb } from './db/schema';
import { config } from './config';

getDb();

const bot = createBot();

bot.api.setMyCommands([
  { command: 'start', description: '🆕 New Order' },
  { command: 'contact', description: '📞 Contact Us' },
  { command: 'map', description: '📍 Our Location' },
]);

bot.start({
  onStart: (info) => {
    console.log(`Little Dalat Bot started as @${info.username}`);
    console.log(`Shop: ${config.shop.address}`);
    console.log(`Delivery radius: ${config.delivery.maxRadius}km`);
  },
});

process.once('SIGINT', () => bot.stop());
process.once('SIGTERM', () => bot.stop());
