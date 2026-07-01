import { Bot, InlineKeyboard } from 'grammy';
import { BotContext } from '../context';
import { t } from '../../locales';
import { paymentKeyboard } from '../keyboards';
import { config } from '../../config';
import { getDeliveryFee, haversineDistance } from '../../lib/distance';
import { reverseGeocode } from '../../lib/geocode';
import { buildCartText } from './cart';

export function registerCheckoutHandlers(bot: Bot<BotContext>): void {
  bot.callbackQuery('checkout', async (ctx) => {
    const lang = ctx.session.language;
    const cart = ctx.session.cart;

    if (cart.length === 0) {
      await ctx.answerCallbackQuery(t('cart_empty', lang));
      return;
    }

    ctx.session.step = 'checkout_name';
    await ctx.reply(t('enter_name', lang), { parse_mode: 'Markdown' });
    await ctx.answerCallbackQuery();
  });

  bot.on('message:text', async (ctx) => {
    if (ctx.session.step === 'checkout_name') {
      ctx.session.customerName = ctx.message.text;
      ctx.session.step = 'checkout_phone';
      await ctx.reply(t('enter_phone', ctx.session.language));
      return;
    }

    if (ctx.session.step === 'checkout_phone') {
      ctx.session.customerPhone = ctx.message.text;
      if (ctx.session.mode === 'delivery') {
        ctx.session.step = 'checkout_address';
        await ctx.reply(t('enter_address', ctx.session.language), {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: [[{ text: t('share_location', ctx.session.language), request_location: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
      } else {
        ctx.session.step = 'checkout_payment';
        const cart = ctx.session.cart;
        const text = buildCartText(cart, ctx.session.language, 0);
        await ctx.reply(`${text}\n\n${t('choose_payment', ctx.session.language)}`, {
          reply_markup: paymentKeyboard(ctx.session.language),
        });
      }
      return;
    }

    if (ctx.session.step === 'checkout_address') {
      ctx.session.deliveryAddress = ctx.message.text;
      ctx.session.deliveryLat = null;
      ctx.session.deliveryLng = null;
      ctx.session.deliveryFee = config.delivery.feeWithin4km;
      ctx.session.step = 'checkout_payment';
      const cart = ctx.session.cart;
      const text = buildCartText(cart, ctx.session.language, ctx.session.deliveryFee);
      await ctx.reply('✅', { reply_markup: { remove_keyboard: true } });
      await ctx.reply(`${t('location_received', ctx.session.language)}\n${t('distance_check', ctx.session.language, { km: '—', fee: ctx.session.deliveryFee / 1000 })}\n\n${text}\n\n${t('choose_payment', ctx.session.language)}`, {
        reply_markup: paymentKeyboard(ctx.session.language),
      });
      return;
    }

    if (ctx.session.step === 'checkout_address_edit') {
      ctx.session.deliveryAddress = ctx.message.text;
      ctx.session.step = 'checkout_payment';
      const cart = ctx.session.cart;
      const text = buildCartText(cart, ctx.session.language, ctx.session.deliveryFee);
      await ctx.reply('✅', { reply_markup: { remove_keyboard: true } });
      await ctx.reply(`${text}\n\n${t('choose_payment', ctx.session.language)}`, {
        reply_markup: paymentKeyboard(ctx.session.language),
      });
      return;
    }
  });

  bot.callbackQuery('confirm_address', async (ctx) => {
    const lang = ctx.session.language;
    ctx.session.step = 'checkout_payment';
    const cart = ctx.session.cart;
    const text = buildCartText(cart, lang, ctx.session.deliveryFee);
    await ctx.answerCallbackQuery();
    try {
      await ctx.editMessageText(`${text}\n\n${t('choose_payment', lang)}`, {
        reply_markup: paymentKeyboard(lang),
      });
    } catch {
      await ctx.reply(`${text}\n\n${t('choose_payment', lang)}`, {
        reply_markup: paymentKeyboard(lang),
      });
    }
  });

  bot.callbackQuery('edit_address', async (ctx) => {
    const lang = ctx.session.language;
    const address = ctx.session.deliveryAddress;
    await ctx.answerCallbackQuery();
    try {
      await ctx.editMessageText(`${t('current_address', lang)}: ${address}\n\n${t('enter_address_edit', lang)}\n\n${t('map_hint', lang)}`, {
        reply_markup: { inline_keyboard: [] },
      });
    } catch { /* ignore */ }
  });

  bot.on('message:location', async (ctx) => {
    if (ctx.session.step === 'checkout_address' || ctx.session.step === 'checkout_address_edit') {
      const loc = ctx.message.location;
      ctx.session.deliveryLat = loc.latitude;
      ctx.session.deliveryLng = loc.longitude;
      ctx.session.deliveryAddress = `${loc.latitude}, ${loc.longitude}`;
      const address = await reverseGeocode(loc.latitude, loc.longitude);
      ctx.session.deliveryAddress = address;
      await processDeliveryAddress(ctx);
    }
  });
}

async function processDeliveryAddress(ctx: BotContext): Promise<void> {
  const lang = ctx.session.language;
  const shop = config.shop;

  if (!ctx.session.deliveryLat || !ctx.session.deliveryLng) {
    ctx.session.deliveryFee = config.delivery.feeWithin4km;
    ctx.session.step = 'checkout_payment';
    const cart = ctx.session.cart;
    const text = buildCartText(cart, lang, ctx.session.deliveryFee);
    await ctx.reply('✅', { reply_markup: { remove_keyboard: true } });
    await ctx.reply(`${text}\n\n${t('choose_payment', lang)}`, {
      reply_markup: paymentKeyboard(lang),
    });
    return;
  }

  const km = haversineDistance(shop.lat, shop.lng, ctx.session.deliveryLat, ctx.session.deliveryLng);
  const fee = getDeliveryFee(km);

  if (fee === null) {
    await ctx.reply(t('distance_too_far', lang, { max: config.delivery.maxRadius }));
    ctx.session.step = 'checkout_address';
    return;
  }

  ctx.session.deliveryFee = fee;
  ctx.session.step = 'checkout_address_edit';
  await ctx.reply('✅', { reply_markup: { remove_keyboard: true } });
  const confirmKb = new InlineKeyboard()
    .text(t('confirm_address', lang), 'confirm_address')
    .text(t('edit_address', lang), 'edit_address');
  await ctx.reply(`${t('location_received', lang)} ✅\n${t('distance_check', lang, { km: km.toFixed(1), fee: fee / 1000 })}\n\n📍 ${t('your_address', lang)}: ${ctx.session.deliveryAddress}\n\n${t('address_edit_hint', lang)}`, {
    reply_markup: confirmKb,
  });
}
