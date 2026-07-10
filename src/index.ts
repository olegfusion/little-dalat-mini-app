import express from 'express';
import { createBot } from './bot';
import { getDb } from './db/schema';
import { config } from './config';
import apiRouter from './api';

getDb();

const bot = createBot();

bot.catch((err) => {
  console.error('Bot error:', (err.error as any).message || err.error);
});

bot.api.setMyCommands([
  { command: 'start', description: '🆕 New Order' },
  { command: 'menu', description: '☕ Open Menu' },
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

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

const PORT = parseInt(process.env.API_PORT || '3001', 10);
app.listen(PORT, () => {
  console.log(`Little Dalat API listening on port ${PORT}`);
});

process.once('SIGINT', () => bot.stop());
process.once('SIGTERM', () => bot.stop());
