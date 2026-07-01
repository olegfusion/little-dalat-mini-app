import { InlineKeyboard } from 'grammy';
import { Language, OrderMode } from '../types';
import { CATEGORIES } from '../data/categories';
import { t } from '../locales';

const LANG_FIELD: Record<Language, string> = { vn: 'vietnamese', en: 'english', ru: 'russian' };

function langField(lang: Language): string {
  return LANG_FIELD[lang] || 'english';
}

export function modeKeyboard(lang: Language) {
  return new InlineKeyboard()
    .text(t('btn_dine_in', lang), 'mode_dine-in')
    .text(t('btn_pickup', lang), 'mode_pickup')
    .row()
    .text(t('btn_delivery', lang), 'mode_delivery');
}

export function languageKeyboard() {
  return new InlineKeyboard()
    .text('🇻🇳 Tiếng Việt', 'lang_vn')
    .text('🇬🇧 English', 'lang_en')
    .row()
    .text('🇷🇺 Русский', 'lang_ru');
}

export function categoryKeyboard(lang: Language, mode?: OrderMode | null) {
  const kb = new InlineKeyboard();
  const filtered = mode === 'delivery'
    ? CATEGORIES.filter(c => c.id !== 'combos')
    : CATEGORIES;
  for (const cat of filtered) {
    const name = (cat as any)[langField(lang)] as string;
    if (name) kb.text(name, `cat_${cat.id}`).row();
  }
  kb.text(t('view_cart', lang), 'view_cart');
  return kb;
}

export function itemActionKeyboard(itemId: string, lang: Language) {
  return new InlineKeyboard()
    .text(t('add_to_cart', lang), `add_${itemId}`)
    .row()
    .text(t('back', lang), 'back_categories');
}

export function cartKeyboard(lang: Language) {
  return new InlineKeyboard()
    .text(t('proceed_checkout', lang), 'checkout')
    .text(t('clear_cart', lang), 'clear_cart')
    .row()
    .text(t('continue_shopping', lang), 'back_categories');
}

export function paymentKeyboard(lang: Language) {
  return new InlineKeyboard()
    .text(t('btn_qr', lang), 'pay_qr')
    .text(t('btn_cash', lang), 'pay_cash');
}

export function paymentConfirmKeyboard(lang: Language) {
  return new InlineKeyboard()
    .text(t('btn_i_paid', lang), 'confirm_paid')
    .row()
    .text(t('back', lang), 'back_payment');
}

export function confirmOrderKeyboard(lang: Language) {
  return new InlineKeyboard()
    .text(t('place_order', lang), 'confirm_order')
    .text(t('back', lang), 'back_cart');
}
