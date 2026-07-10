import { Order, CartItem } from '../types';
import { getItemById, getItemVariantName } from '../data/menu';
import { config } from '../config';

const sourceLabels: Record<string, string> = {
  bot: '🤖 Telegram Bot',
  miniapp_telegram: '🌐 Telegram Mini App',
  miniapp_zalo: '🇻🇳 Zalo Mini App',
  browser: '🌍 Browser',
};

const modeLabels: Record<string, string> = {
  'dine-in': '🍽️ Tại quán (Dine-in)',
  pickup: '🛍️ Mang đi (Pickup)',
  delivery: '🚚 Giao hàng (Delivery)',
};

export function formatOrderForStaff(order: Order): string {
  const cartItems: CartItem[] = JSON.parse(order.items);

  let text = `🆕 ĐƠN HÀNG MỚI (NEW ORDER) #${order.id}\n`;
  text += `───── ${modeLabels[order.mode] || order.mode} ─────\n`;

  if (order.mode === 'dine-in' && order.tableNumber) {
    text += `🪑 Bàn (Table): ${order.tableNumber}\n`;
  }

  if (order.mode === 'pickup' && order.pickupTime) {
    text += `⏱ Lấy hàng sau (Pickup in): ${order.pickupTime} phút (min)\n`;
  }

  if (order.mode === 'delivery') {
    text += `📍 ${order.deliveryAddress}\n`;
    if (order.deliveryLat && order.deliveryLng) {
      text += `🌐 ${order.deliveryLat.toFixed(5)}, ${order.deliveryLng.toFixed(5)}\n`;
      text += `🗺️ https://www.google.com/maps?q=${order.deliveryLat},${order.deliveryLng}\n`;
    } else {
      text += `🗺️ https://www.google.com/maps?q=${encodeURIComponent(order.deliveryAddress)}\n`;
    }
    if (order.deliveryFee === -1) {
      text += `🎉 Miễn phí giao hàng (Free delivery)\n`;
    } else if (order.deliveryFee > 0) {
      text += `💵 Phí ship (Delivery fee): ${order.deliveryFee / 1000}k\n`;
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
      if (ci.comment?.trim()) {
        text += `  📝 ${ci.comment.trim()}\n`;
      }
    }
  }

  text += `─────────────────────\n`;
  text += `💰 Tổng cộng (Total): ${order.total / 1000}k\n`;

  text += order.paymentMethod === 'qr' ? `💳 QR — Đã thanh toán (Paid)\n` : `💵 Tiền mặt — Chưa thanh toán (Unpaid)\n`;

  text += `─────────────────────\n`;
  text += `⏰ ${order.createdAt}\n`;
  text += `📱 ${sourceLabels[order.source] || order.source}\n`;
  if (order.customerName) text += `👤 ${order.customerName}\n`;
  if (order.customerPhone) text += `📞 ${order.customerPhone}\n`;
  if (order.notes) text += `📝 ${order.notes}\n`;
  text += `💬 tg://user?id=${order.chatId}\n`;

  return text;
}

export function formatOrderForUser(order: Order, lang: string): string {
  const cartItems: CartItem[] = JSON.parse(order.items);
  const isVn = lang === 'vn';
  const isRu = lang === 'ru';

  const modeNames: Record<string, string> = {
    'dine-in': isVn ? 'Tại quán' : isRu ? 'На месте' : 'Dine-in',
    pickup: isVn ? 'Mang đi' : isRu ? 'С собой' : 'Pickup',
    delivery: isVn ? 'Giao hàng' : isRu ? 'Доставка' : 'Delivery',
  };

  let text = `━━━━━━━━━━━━━━━━━━\n`;
  text += `☕ *LITTLE DALAT*\n`;
  text += `${modeNames[order.mode] || order.mode}`;
  if (order.mode === 'dine-in' && order.tableNumber) {
    text += ` | ${isVn ? 'Bàn' : isRu ? 'Стол' : 'Table'} ${order.tableNumber}`;
  }
  text += `\n━━━━━━━━━━━━━━━━━━\n\n`;

  text += `📋 *${isVn ? 'ĐƠN HÀNG' : isRu ? 'ЗАКАЗ' : 'ORDER'} #${order.id}*\n\n`;

  for (const ci of cartItems) {
    const item = getItemById(ci.menuItemId);
    if (item) {
      const name = isVn ? item.vietnamese : isRu ? item.russian : item.english;
      text += `• ${name}`;
      if (ci.variantIndex !== undefined && item.variants) {
        const variantName = getItemVariantName(item, lang as any, ci.variantIndex);
        text += ` (${variantName})`;
      }
      text += ` x${ci.quantity}`;
      if (ci.comment?.trim()) text += ` — 📝 ${ci.comment.trim()}`;
      text += `\n`;
    }
  }

  text += `\n💰 *${isVn ? 'Tổng cộng' : isRu ? 'Итого' : 'Total'}: ${order.total / 1000}k*\n`;

  if (order.mode === 'delivery' && order.deliveryAddress) {
    text += `📍 ${isVn ? 'Địa chỉ' : isRu ? 'Адрес' : 'Address'}: ${order.deliveryAddress}\n`;
    if (order.deliveryLat && order.deliveryLng) {
      text += `🗺️ https://www.google.com/maps?q=${order.deliveryLat},${order.deliveryLng}\n`;
    }
  }
  if (order.mode === 'pickup' && order.pickupTime) {
    text += `⏱ ${isVn ? `Lấy hàng sau ${order.pickupTime} phút` : isRu ? `Забрать через ${order.pickupTime} мин` : `Pickup in ${order.pickupTime} min`}\n`;
  }

  text += `\n👤 ${isVn ? 'Tên' : isRu ? 'Имя' : 'Name'}: ${order.customerName || '—'}\n`;
  text += `📞 ${isVn ? 'Điện thoại' : isRu ? 'Телефон' : 'Phone'}: ${order.customerPhone || '—'}\n`;

  if (order.paymentMethod === 'qr') {
    text += `\n✅ ${isVn ? 'Đã thanh toán qua QR' : isRu ? 'Оплачено по QR' : 'Paid via QR'}\n`;
  } else {
    text += `\n💵 ${isVn ? 'Thanh toán khi nhận hàng' : isRu ? 'Оплата при получении' : 'Pay on arrival'}\n`;
  }

  if (order.mode === 'pickup') {
    text += `\n🗺️ ${isVn ? 'Đường đến quán' : isRu ? 'Как добраться' : 'Get directions'}: https://www.google.com/maps/dir/?api=1&destination=${config.shop.lat},${config.shop.lng}\n`;
  }

  text += `\n━━━━━━━━━━━━━━━━━━\n`;
  text += `📍 02 Thi Sách, Phước Hòa, Nha Trang\n📞 0912066973\n`;
  text += `⭐ ${isVn ? 'Đánh giá chúng tôi' : isRu ? 'Оцените нас' : 'Review us'}: https://maps.app.goo.gl/pKx6QFVLn6tbRigk6`;
  return text;
}
