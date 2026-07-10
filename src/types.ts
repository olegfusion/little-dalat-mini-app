export type Language = 'vn' | 'en' | 'ru';

export type OrderMode = 'dine-in' | 'pickup' | 'delivery';

export type PaymentMethod = 'qr' | 'cash';

export type OrderStatus = 'created' | 'paid' | 'preparing' | 'ready' | 'served' | 'picked_up' | 'dispatched';

export type MenuCategory =
  | 'signature' | 'coffee_cocoa' | 'hot_tea' | 'special_flower_tea'
  | 'other_drinks' | 'fruit_tea' | 'desserts_snacks' | 'combos';

export interface MenuItem {
  id: string;
  category: MenuCategory;
  vietnamese: string;
  english: string;
  russian: string;
  price: number;
  variants?: {
    vn: string[];
    en: string[];
    ru: string[];
  };
}

export interface CategoryInfo {
  id: MenuCategory;
  vietnamese: string;
  english: string;
  russian: string;
  imageUrl: string;
}

export interface CartItem {
  menuItemId: string;
  quantity: number;
  variantIndex?: number;
  comment?: string;
}

export interface Order {
  id: number;
  chatId: number;
  tableNumber: string | null;
  mode: OrderMode;
  items: string;
  total: number;
  deliveryFee: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  pickupTime: number | null;
  language: Language;
  notes: string;
  createdAt: string;
}

export type OrderSource = 'bot' | 'miniapp_telegram' | 'miniapp_zalo' | 'browser';

export type Platform = 'telegram' | 'zalo' | 'whatsapp' | 'browser';
