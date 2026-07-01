import { Context, SessionFlavor, session } from 'grammy';
import { Language, OrderMode, CartItem } from '../types';

export interface SessionData {
  language: Language;
  mode: OrderMode | null;
  tableNumber: string | null;
  cart: CartItem[];
  step: 'idle' | 'choosing_mode' | 'choosing_language' | 'browsing' | 'in_cart' | 'checkout_name' | 'checkout_phone' | 'checkout_address' | 'checkout_address_edit' | 'checkout_payment' | 'confirming';
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  deliveryFee: number;
  pendingOrderId: number | undefined;
  paymentMethod: 'qr' | 'cash' | undefined;
  currentCategory: string | null;
  currentPage: number;
  itemsMessageId: number | null;
}

export type BotContext = Context & SessionFlavor<SessionData>;

export function initialSession(): SessionData {
  return {
    language: 'vn',
    mode: null,
    tableNumber: null,
    cart: [],
    step: 'idle',
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    deliveryLat: null,
    deliveryLng: null,
    deliveryFee: 0,
    pendingOrderId: undefined,
    paymentMethod: undefined,
    currentCategory: null,
    currentPage: 0,
    itemsMessageId: null,
  };
}
