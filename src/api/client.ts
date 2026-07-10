import { CategoryInfo, MenuItem, Order, CartItem, OrderMode, Language, PaymentMethod, OrderSource } from '../types';

const BASE_URL = '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error: ${res.status} — ${err}`);
  }
  return res.json();
}

export function fetchCategories(): Promise<CategoryInfo[]> {
  return get<CategoryInfo[]>('/categories');
}

export function fetchMenu(): Promise<MenuItem[]> {
  return get<MenuItem[]>('/menu');
}

export function fetchMenuByCategory(categoryId: string): Promise<MenuItem[]> {
  return get<MenuItem[]>(`/menu/${categoryId}`);
}

export interface CreateOrderInput {
  chatId: number;
  tableNumber?: string;
  mode: OrderMode;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  pickupTime?: number | null;
  language: Language;
  source?: OrderSource;
  deliveryFee?: number;
  notes?: string;
}

export function createOrderApi(input: CreateOrderInput): Promise<Order> {
  return post<Order>('/orders', input);
}

export function getOrder(id: number): Promise<Order> {
  return get<Order>(`/orders/${id}`);
}

export function confirmOrder(id: number): Promise<Order> {
  return post<Order>(`/orders/${id}/confirm`, {});
}

export interface DeliveryEstimate {
  km: number;
  fee: number | null;
  isFree?: boolean;
  available: boolean;
  maxRadius: number;
}

export function estimateDelivery(lat: number, lng: number, itemCount?: number): Promise<DeliveryEstimate> {
  return post<DeliveryEstimate>('/delivery/estimate', { lat, lng, itemCount });
}

export function generateQr(orderId: number, amount: number): Promise<{ imageUrl: string }> {
  return post<{ imageUrl: string }>('/payment/qr', { orderId, amount });
}
