import { getDb } from './schema';
import { CartItem, Order, OrderStatus, PaymentMethod, OrderMode, Language } from '../types';

export function createOrder(data: {
  chatId: number;
  tableNumber: string | null;
  mode: OrderMode;
  items: CartItem[];
  total: number;
  deliveryFee: number;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  pickupTime: number | null;
  language: Language;
}): Order {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO orders (chat_id, table_number, mode, items, total, delivery_fee, payment_method, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, pickup_time, language)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.chatId,
    data.tableNumber,
    data.mode,
    JSON.stringify(data.items),
    data.total,
    data.deliveryFee,
    data.paymentMethod,
    data.customerName,
    data.customerPhone,
    data.deliveryAddress,
    data.deliveryLat,
    data.deliveryLng,
    data.pickupTime,
    data.language
  );
  return getOrderById(result.lastInsertRowid as number)!;
}

export function getOrderById(id: number): Order | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
  return row ? mapRow(row) : undefined;
}

export function getOrdersByChatId(chatId: number): Order[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM orders WHERE chat_id = ? ORDER BY id DESC').all(chatId) as any[];
  return rows.map(mapRow);
}

export function updateOrderStatus(id: number, status: OrderStatus): void {
  const db = getDb();
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
}

function mapRow(row: any): Order {
  return {
    id: row.id,
    chatId: row.chat_id,
    tableNumber: row.table_number,
    mode: row.mode,
    items: row.items,
    total: row.total,
    deliveryFee: row.delivery_fee,
    paymentMethod: row.payment_method,
    status: row.status,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    deliveryAddress: row.delivery_address,
    deliveryLat: row.delivery_lat,
    deliveryLng: row.delivery_lng,
    pickupTime: row.pickup_time ?? null,
    language: row.language,
    createdAt: row.created_at,
  };
}
