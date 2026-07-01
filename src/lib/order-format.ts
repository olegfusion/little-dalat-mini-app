import { Order, CartItem } from '../types';
import { getItemById } from '../data/menu';

export function formatOrderForStaff(order: Order): string {
  const cartItems: CartItem[] = JSON.parse(order.items);

  let text = `🆕 ĐƠN HÀNG MỚI (NEW ORDER) #${order.id}\n`;
  text += `─────────────────────\n`;

  if (order.mode === 'dine-in') {
    text += `📍 Bàn (Table) ${order.tableNumber || '?'} — Tại quán (Dine-in)\n`;
  } else if (order.mode === 'pickup') {
    text += `🛍️ Mang đi (Pickup)\n`;
  } else {
    text += `🚚 Giao hàng (Delivery)\n`;
    text += `📍 ${order.deliveryAddress}\n`;
    if (order.customerPhone) text += `📞 ${order.customerPhone}\n`;
    if (order.deliveryFee > 0) {
      text += `💵 Phí ship (Delivery fee): ${order.deliveryFee / 1000}k\n`;
    }
  }

  text += `─────────────────────\n`;

  for (const ci of cartItems) {
    const menuItem = getItemById(ci.menuItemId);
    if (menuItem) {
      text += `${menuItem.vietnamese} (${menuItem.english}) x${ci.quantity} — ${menuItem.price / 1000}k\n`;
    }
  }

  text += `─────────────────────\n`;
  text += `💰 Tổng cộng (Total): ${order.total / 1000}k\n`;

  if (order.paymentMethod === 'qr') {
    text += `💳 QR — Đã thanh toán (Paid)\n`;
  } else {
    text += `💵 Tiền mặt — Chưa thanh toán (Unpaid)\n`;
  }

  text += `─────────────────────\n`;
  text += `⏰ ${order.createdAt}\n`;
  if (order.customerName) text += `👤 ${order.customerName}\n`;
  if (order.customerPhone) text += `📞 ${order.customerPhone}\n`;

  return text;
}
