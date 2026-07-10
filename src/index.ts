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

const commands = [
  { command: 'start' as const, en: '🆕 New Order', vn: '🆕 Đặt hàng', ru: '🆕 Заказать' },
  { command: 'menu' as const, en: '☕ Open Menu', vn: '☕ Mở Menu', ru: '☕ Меню' },
  { command: 'contact' as const, en: '📞 Contact Us', vn: '📞 Liên hệ', ru: '📞 Контакты' },
  { command: 'map' as const, en: '📍 Our Location', vn: '📍 Vị trí của chúng tôi', ru: '📍 Наше местоположение' },
];

bot.api.setMyCommands(commands.map(c => ({ command: c.command, description: `${c.en} / ${c.vn} / ${c.ru}` })));
bot.api.setMyCommands(commands.map(c => ({ command: c.command, description: c.vn })), { language_code: 'vi' });
bot.api.setMyCommands(commands.map(c => ({ command: c.command, description: c.en })), { language_code: 'en' });
bot.api.setMyCommands(commands.map(c => ({ command: c.command, description: c.ru })), { language_code: 'ru' });

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
