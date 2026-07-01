import { Bot, InlineKeyboard } from 'grammy';
import { BotContext } from '../context';
import { t } from '../../locales';
import { paymentKeyboard, pickupTimeKeyboard } from '../keyboards';
import { config } from '../../config';
import { getDeliveryFee, haversineDistance } from '../../lib/distance';
import { reverseGeocode } from '../../lib/geocode';
import { buildCartText } from './cart';
import { CartItem, Language } from '../../types';

function applyFreeDelivery(cart: CartItem[], fee: number): number {
  const totalQty = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  return totalQty >= 5 ? -1 : fee;
}

function cartTotalQty(cart: CartItem[]): number {
  return cart.reduce((sum, ci) => sum + ci.quantity, 0);
}

function feeLine(lang: Language, fee: number): string {
  if (fee === -1) return t('delivery_free', lang);
  return t('distance_check', lang, { km: '—', fee: fee / 1000 });
}

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
        const qty = cartTotalQty(ctx.session.cart);
        let addressText = t('enter_address', ctx.session.language);
        if (qty >= 5) addressText += `\n\n${t('free_delivery_active', ctx.session.language)}`;
        const kb = new InlineKeyboard().text(`🛍️ ${t('continue_shopping', ctx.session.language)}`, 'back_categories');
        await ctx.reply(addressText, {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: [[{ text: t('share_location', ctx.session.language), request_location: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
        await ctx.reply('⬇️ ' + t('add_items_hint', ctx.session.language), { reply_markup: kb });
      } else if (ctx.session.mode === 'pickup') {
        ctx.session.step = 'checkout_pickup_time';
        await ctx.reply(t('choose_pickup_time', ctx.session.language), {
          parse_mode: 'Markdown',
          reply_markup: pickupTimeKeyboard(ctx.session.language),
        });
      } else {
        ctx.session.step = 'checkout_payment';
        const cart = ctx.session.cart;
        const text = buildCartText(cart, ctx.session.language, 0);
        await ctx.reply(`${text}\n\n${t('choose_payment', ctx.session.language)}`, {
          reply_markup: paymentKeyboard(ctx.session.language, ctx.session.mode),
        });
      }
      return;
    }

    if (ctx.session.step === 'checkout_address') {
      ctx.session.deliveryAddress = ctx.message.text;
      ctx.session.deliveryLat = null;
      ctx.session.deliveryLng = null;
      ctx.session.deliveryFee = applyFreeDelivery(ctx.session.cart, config.delivery.feeWithin4km);
      ctx.session.step = 'checkout_payment';
      const cart = ctx.session.cart;
      const text = buildCartText(cart, ctx.session.language, ctx.session.deliveryFee);
      await ctx.reply('✅', { reply_markup: { remove_keyboard: true } });
      await ctx.reply(`${t('location_received', ctx.session.language)}\n${feeLine(ctx.session.language, ctx.session.deliveryFee)}\n\n${text}\n\n${t('choose_payment', ctx.session.language)}`, {
        reply_markup: paymentKeyboard(ctx.session.language, ctx.session.mode),
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
        reply_markup: paymentKeyboard(ctx.session.language, ctx.session.mode),
      });
      return;
    }
  });

  bot.callbackQuery(/^pickup_time_\d+$/, async (ctx) => {
    const lang = ctx.session.language;
    const minutes = parseInt(ctx.callbackQuery.data!.split('_').pop()!, 10);
    ctx.session.pickupTime = minutes;
    ctx.session.step = 'checkout_payment';
    const cart = ctx.session.cart;
    const text = buildCartText(cart, lang, 0);
    await ctx.editMessageText(`${text}\n\n${t('choose_payment', lang)}`, {
      reply_markup: paymentKeyboard(lang, 'pickup'),
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('confirm_address', async (ctx) => {
    const lang = ctx.session.language;
    ctx.session.step = 'checkout_payment';
    const cart = ctx.session.cart;
    const text = buildCartText(cart, lang, ctx.session.deliveryFee);
    await ctx.answerCallbackQuery();
    try {
      await ctx.editMessageText(`${text}\n\n${t('choose_payment', lang)}`, {
        reply_markup: paymentKeyboard(lang, ctx.session.mode),
      });
    } catch {
      await ctx.reply(`${text}\n\n${t('choose_payment', lang)}`, {
        reply_markup: paymentKeyboard(lang, ctx.session.mode),
      });
    }
  });

  bot.callbackQuery('edit_address', async (ctx) => {
    const lang = ctx.session.language;
    const address = ctx.session.deliveryAddress;
    await ctx.answerCallbackQuery();
    try {
      await ctx.editMessageText(`✏️ ${t('enter_address_edit', lang)}`, {
        reply_markup: new InlineKeyboard()
          .switchInlineCurrent(t('edit_inline', lang), address)
          .row()
          .text(t('type_manually', lang), 'type_address'),
      });
    } catch { /* ignore */ }
  });

  bot.callbackQuery('type_address', async (ctx) => {
    const lang = ctx.session.language;
    await ctx.answerCallbackQuery();
    try {
      await ctx.editMessageText(`${addressWithMapLink(ctx)}\n\n${t('enter_address_edit', lang)}\n\n${t('map_hint', lang)}`, {
        reply_markup: { inline_keyboard: [] },
      });
    } catch { /* ignore */ }
  });

  bot.inlineQuery(/.*/, async (ctx) => {
    const query = ctx.inlineQuery.query.trim();
    if (!query) return;
    await ctx.answerInlineQuery([{
      type: 'article',
      id: 'send',
      title: `📍 ${query.substring(0, 100)}`,
      description: '✅ Tap to confirm address',
      input_message_content: { message_text: query },
    }], { cache_time: 0 });
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

  bot.on('message:venue', async (ctx) => {
    if (ctx.session.step === 'checkout_address' || ctx.session.step === 'checkout_address_edit') {
      const venue = ctx.message.venue;
      ctx.session.deliveryLat = venue.location.latitude;
      ctx.session.deliveryLng = venue.location.longitude;
      ctx.session.deliveryAddress = venue.address || venue.title || `${venue.location.latitude}, ${venue.location.longitude}`;
      await processDeliveryAddress(ctx);
    }
  });
}

async function processDeliveryAddress(ctx: BotContext): Promise<void> {
  const lang = ctx.session.language;
  const shop = config.shop;

  if (!ctx.session.deliveryLat || !ctx.session.deliveryLng) {
    ctx.session.deliveryFee = applyFreeDelivery(ctx.session.cart, config.delivery.feeWithin4km);
    ctx.session.step = 'checkout_payment';
    const cart = ctx.session.cart;
    const text = buildCartText(cart, lang, ctx.session.deliveryFee);
    await ctx.reply('✅', { reply_markup: { remove_keyboard: true } });
    await ctx.reply(`${text}\n\n${t('choose_payment', lang)}`, {
      reply_markup: paymentKeyboard(lang, ctx.session.mode),
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

  ctx.session.deliveryFee = applyFreeDelivery(ctx.session.cart, fee);
  ctx.session.step = 'checkout_address_edit';
  await ctx.reply('✅', { reply_markup: { remove_keyboard: true } });
  const confirmKb = new InlineKeyboard()
    .text(t('confirm_address', lang), 'confirm_address')
    .text(t('edit_address', lang), 'edit_address');
  const dm = ctx.session.deliveryFee === -1
    ? t('delivery_free', lang)
    : t('distance_check', lang, { km: km.toFixed(1), fee: ctx.session.deliveryFee / 1000 });
  const mapLink = ctx.session.deliveryLat && ctx.session.deliveryLng
    ? `\n🗺️ https://www.google.com/maps?q=${ctx.session.deliveryLat},${ctx.session.deliveryLng}`
    : '';
  await ctx.reply(`${t('location_received', lang)} ✅\n${dm}\n\n📍 ${t('your_address', lang)}: ${ctx.session.deliveryAddress}${mapLink}\n\n${t('address_edit_hint', lang)}`, {
    reply_markup: confirmKb,
  });
}

function addressWithMapLink(ctx: BotContext): string {
  const lang = ctx.session.language;
  let text = `${t('current_address', lang)}: ${ctx.session.deliveryAddress}`;
  if (ctx.session.deliveryLat && ctx.session.deliveryLng) {
    text += `\n🗺️ https://www.google.com/maps?q=${ctx.session.deliveryLat},${ctx.session.deliveryLng}`;
  }
  return text;
}
