import { Context, SessionFlavor, session } from 'grammy';
import { Language, OrderMode, CartItem } from '../types';

export interface SessionData {
  language: Language;
  mode: OrderMode | null;
  tableNumber: string | null;
  cart: CartItem[];
  step: 'idle' | 'choosing_mode' | 'choosing_language' | 'main_menu' | 'browsing' | 'in_cart' | 'checkout_name' | 'checkout_phone' | 'checkout_address' | 'checkout_address_edit' | 'checkout_pickup_time' | 'checkout_payment' | 'confirming' | 'status_check' | 'reorder_confirm';
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  deliveryFee: number;
  pickupTime: number | null;
  pendingOrderId: number | undefined;
  paymentMethod: 'qr' | 'cash' | undefined;
  currentCategory: string | null;
  currentPage: number;
  itemsMessageId: number | null;
  reorderData?: { items: CartItem[]; total: number; deliveryFee: number } | null;
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
    pickupTime: null,
    pendingOrderId: undefined,
    paymentMethod: undefined,
    currentCategory: null,
    currentPage: 0,
    itemsMessageId: null,
  };
}
