import { Language } from '../types';

type Translations = Record<string, Record<Language, string>>;

const translations: Translations = {
  select_category: {
    vn: 'Chọn danh mục:',
    en: 'Select category:',
    ru: 'Выберите категорию:',
  },
  cart: {
    vn: 'Giỏ hàng',
    en: 'Cart',
    ru: 'Корзина',
  },
  cart_empty: {
    vn: 'Giỏ hàng trống',
    en: 'Cart is empty',
    ru: 'Корзина пуста',
  },
  total: {
    vn: 'Tổng cộng',
    en: 'Total',
    ru: 'Итого',
  },
  subtotal: {
    vn: 'Tạm tính',
    en: 'Subtotal',
    ru: 'Промежуточный итог',
  },
  delivery_fee: {
    vn: 'Phí giao hàng',
    en: 'Delivery fee',
    ru: 'Стоимость доставки',
  },
  free: {
    vn: 'Miễn phí',
    en: 'Free',
    ru: 'Бесплатно',
  },
  checkout: {
    vn: 'Thanh toán',
    en: 'Checkout',
    ru: 'Оформить заказ',
  },
  add_to_cart: {
    vn: 'Thêm vào giỏ',
    en: 'Add to cart',
    ru: 'В корзину',
  },
  your_name: {
    vn: 'Tên của bạn',
    en: 'Your name',
    ru: 'Ваше имя',
  },
  your_phone: {
    vn: 'Số điện thoại',
    en: 'Phone number',
    ru: 'Номер телефона',
  },
  your_address: {
    vn: 'Địa chỉ giao hàng',
    en: 'Delivery address',
    ru: 'Адрес доставки',
  },
  place_order: {
    vn: 'Đặt hàng',
    en: 'Place order',
    ru: 'Заказать',
  },
  pay_with_qr: {
    vn: 'Thanh toán QR',
    en: 'Pay with QR',
    ru: 'Оплатить по QR',
  },
  pay_with_cash: {
    vn: 'Tiền mặt',
    en: 'Cash',
    ru: 'Наличные',
  },
  confirm_payment: {
    vn: 'Đã thanh toán',
    en: "I've paid",
    ru: 'Я оплатил',
  },
  order_placed: {
    vn: 'Đặt hàng thành công!',
    en: 'Order placed!',
    ru: 'Заказ оформлен!',
  },
  order_number: {
    vn: 'Mã đơn hàng',
    en: 'Order number',
    ru: 'Номер заказа',
  },
  dine_in: {
    vn: 'Tại quán',
    en: 'Dine-in',
    ru: 'На месте',
  },
  pickup: {
    vn: 'Mang đi',
    en: 'Pickup',
    ru: 'С собой',
  },
  delivery: {
    vn: 'Giao hàng',
    en: 'Delivery',
    ru: 'Доставка',
  },
  language_vn: {
    vn: 'Tiếng Việt',
    en: 'Vietnamese',
    ru: 'Вьетнамский',
  },
  language_en: {
    vn: 'Tiếng Anh',
    en: 'English',
    ru: 'Английский',
  },
  language_ru: {
    vn: 'Tiếng Nga',
    en: 'Russian',
    ru: 'Русский',
  },
  table: {
    vn: 'Bàn',
    en: 'Table',
    ru: 'Стол',
  },
  mode_dine_in: {
    vn: 'Tại quán',
    en: 'Dine-in',
    ru: 'На месте',
  },
  choose_mode: {
    vn: 'Chọn hình thức',
    en: 'Choose your mode',
    ru: 'Выберите способ',
  },
  delivery_address: {
    vn: 'Địa chỉ giao hàng',
    en: 'Delivery address',
    ru: 'Адрес доставки',
  },
  delivery_km: {
    vn: 'Khoảng cách',
    en: 'Distance',
    ru: 'Расстояние',
  },
  delivery_fee_label: {
    vn: 'Phí giao hàng',
    en: 'Delivery fee',
    ru: 'Стоимость доставки',
  },
  grand_total: {
    vn: 'Tổng cộng',
    en: 'Grand total',
    ru: 'Итого',
  },
  use_my_location: {
    vn: '📍 Dùng vị trí của tôi',
    en: '📍 Use my location',
    ru: '📍 Моё местоположение',
  },
  or_type_address: {
    vn: 'Hoặc nhập địa chỉ:',
    en: 'Or type your address:',
    ru: 'Или введите адрес:',
  },
  delivery_not_available: {
    vn: 'Ngoài vùng giao hàng (tối đa 8km)',
    en: 'Outside delivery area (max 8km)',
    ru: 'Вне зоны доставки (макс. 8км)',
  },
  delivery_free: {
    vn: 'Miễn phí giao hàng',
    en: 'Free delivery',
    ru: 'Бесплатная доставка',
  },
  back: {
    vn: 'Quay lại',
    en: 'Back',
    ru: 'Назад',
  },
};

export function t(key: string, lang: Language): string {
  return translations[key]?.[lang] || key;
}

export function getItemName(item: { vietnamese: string; english: string; russian: string }, lang: Language): string {
  const map: Record<Language, keyof typeof item> = { vn: 'vietnamese', en: 'english', ru: 'russian' };
  return item[map[lang]] || item.english;
}

export function getCategoryName(cat: { vietnamese: string; english: string; russian: string }, lang: Language): string {
  const map: Record<Language, keyof typeof cat> = { vn: 'vietnamese', en: 'english', ru: 'russian' };
  return cat[map[lang]] || cat.english;
}

export function formatPrice(price: number): string {
  return `${Math.round(price / 1000)}k`;
}

export function ruPluralize(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}
