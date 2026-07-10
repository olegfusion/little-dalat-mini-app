import { Router, Request, Response } from 'express';
import { createOrder, getOrderById, updateOrderStatus } from '../db/orders';
import { INITIAL_MENU_ITEMS } from '../data/menu';
import { CartItem, OrderMode, PaymentMethod, Language, OrderSource, OrderStatus } from '../types';
import { notifyStaff } from '../staff/notify';
import { getBot } from '../bot';
import { t } from '../locales';
import { formatOrderForUser } from '../lib/order-format';

interface CreateOrderBody {
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
  deliveryFee?: number;
  source?: string;
  notes?: string;
}

const router = Router();

router.post('/orders', async (req: Request, res: Response) => {
  try {
    const body = req.body as CreateOrderBody;
    const subtotal = body.items.reduce((sum, ci) => {
      const item = INITIAL_MENU_ITEMS.find(i => i.id === ci.menuItemId);
      return sum + (item?.price || 0) * ci.quantity;
    }, 0);
    const total = subtotal + (body.deliveryFee || 0);

    const order = createOrder({
      chatId: body.chatId,
      tableNumber: body.tableNumber || null,
      mode: body.mode,
      items: body.items,
      total,
      deliveryFee: body.deliveryFee || 0,
      paymentMethod: body.paymentMethod,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      deliveryAddress: body.deliveryAddress || '',
      deliveryLat: body.deliveryLat || null,
      deliveryLng: body.deliveryLng || null,
      pickupTime: body.pickupTime || null,
      language: body.language,
      source: (body.source as OrderSource) || 'bot',
      notes: body.notes || '',
    });

    res.json(order);
  } catch (e) {
    console.error('create order error:', e);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/orders/:id', (req: Request, res: Response) => {
  const order = getOrderById(Number(req.params.id));
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json(order);
});

router.post('/orders/:id/confirm', async (req: Request, res: Response) => {
  const orderId = Number(req.params.id);
  const order = getOrderById(orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  updateOrderStatus(orderId, 'paid');
  const updated = getOrderById(orderId)!;
  try {
    const bot = getBot();
    await notifyStaff(bot, updated);
    if (updated.source?.startsWith('miniapp_telegram') || updated.source === 'bot') {
      const lang = updated.language;
      const msg = formatOrderForUser(updated, lang);
      await bot.api.sendMessage(updated.chatId, msg, { parse_mode: 'Markdown' });
    }
  } catch (e) {
    console.error('Notification failed:', e);
  }
  res.json(updated);
});

router.post('/orders/:id/status', async (req: Request, res: Response) => {
  const orderId = Number(req.params.id);
  const { status } = req.body as { status: OrderStatus };
  const order = getOrderById(orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  updateOrderStatus(orderId, status);
  const updated = getOrderById(orderId)!;
  try {
    if (updated.source?.startsWith('miniapp_telegram') || updated.source === 'bot') {
      const bot = getBot();
      const lang = updated.language;
      const statusIcons: Record<string, string> = {
        paid: '✅', preparing: '⏳', ready: '🛵', dispatched: '🚚',
        served: '✅', picked_up: '✅',
      };
      const icon = statusIcons[status] || '📋';
      const statusLabel = t(`status_${status}`, lang);
      await bot.api.sendMessage(updated.chatId,
        `${icon} *${t('order_number_short', lang, { id: updated.id })}: ${statusLabel}*\n━━━━━━━━━━━━━━━━━━\n👤 ${updated.customerName || '—'}\n📞 ${updated.customerPhone || '—'}\n━━━━━━━━━━━━━━━━━━\n${t('thank_you_ordering', lang)}`,
        { parse_mode: 'Markdown' }
      );
    }
  } catch (e) {
    console.error('Status notification failed:', e);
  }
  res.json(updated);
});

export default router;
