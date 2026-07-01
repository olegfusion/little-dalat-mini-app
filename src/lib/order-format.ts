import { Order, CartItem } from '../types';
import { getItemById, getItemVariantName } from '../data/menu';
import { config } from '../config';

export function formatOrderForStaff(order: Order): string {
  const cartItems: CartItem[] = JSON.parse(order.items);

  let text = `🆕 ĐƠN HÀNG MỚI (NEW ORDER) #${order.id}\n`;
  text += `─────────────────────\n`;

  if (order.mode === 'dine-in') {
    if (order.tableNumber) text += `📍 Bàn (Table) ${order.tableNumber} — Tại quán (Dine-in)\n`;
  } else if (order.mode === 'pickup') {
    text += `🛍️ Mang đi (Pickup)\n`;
    if (order.pickupTime) {
      text += `⏱ Lấy hàng sau (Pickup in): ${order.pickupTime} phút (min)\n`;
    }
  } else {
    text += `🚚 Giao hàng (Delivery)\n`;
    text += `📍 ${order.deliveryAddress}\n`;
    if (order.deliveryLat && order.deliveryLng) {
      text += `🗺️ https://www.google.com/maps/dir/?api=1&origin=${config.shop.lat},${config.shop.lng}&destination=${order.deliveryLat},${order.deliveryLng}\n`;
    } else {
      const q = encodeURIComponent(order.deliveryAddress);
      text += `🗺️ https://www.google.com/maps?q=${q}\n`;
    }
    if (order.customerPhone) text += `📞 ${order.customerPhone}\n`;
    if (order.deliveryFee > 0) {
      text += `💵 Phí ship (Delivery fee): ${order.deliveryFee / 1000}k\n`;
    } else if (order.deliveryFee === -1) {
      text += `🚚 Giao hàng miễn phí (Free delivery)\n`;
    }
  }

  text += `─────────────────────\n`;

  for (const ci of cartItems) {
    const menuItem = getItemById(ci.menuItemId);
    if (menuItem) {
      let vnName = menuItem.vietnamese;
      let enName = menuItem.english;
      if (ci.variantIndex !== undefined && menuItem.variants) {
        vnName += ` (${getItemVariantName(menuItem, 'vn', ci.variantIndex)})`;
        enName += ` (${getItemVariantName(menuItem, 'en', ci.variantIndex)})`;
      }
      text += `${vnName} / ${enName} x${ci.quantity} — ${menuItem.price / 1000}k\n`;
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
  text += `💬 tg://user?id=${order.chatId}\n`;

  return text;
}
