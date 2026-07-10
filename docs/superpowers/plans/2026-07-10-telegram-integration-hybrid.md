# Telegram/Zalo Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Telegram bot + Mini App work as a hybrid (bot for reorder/status, mini app for rich ordering), while keeping Zalo and browser standalone.

**Architecture:** Two projects share the same Express/SQLite backend on port 3001. Telegram bot (grammY) and Mini App (React) run independently but share the order database. Source tracking identifies where each order came from.

**Tech Stack:** grammY, Express, SQLite, React 19, Vite 6

**Projects:**
- `D:\AI-PROJECTS\little-dalat-telegram-bot` — backend + bot
- `D:\AI-PROJECTS\little-dalat-mini-app` — frontend

## Global Constraints

- All new text strings must have VN/EN/RU translations
- Follow existing code style (no comments added)
- Preserve existing bot flow — don't break inline keyboard ordering
- Zalo/browser must show NO Telegram references

---

### Task 1: Backend — add source tracking to orders

**Files:**
- Modify: `src/types.ts` — add `source` field + `OrderSource` type
- Modify: `src/db/schema.ts` — add `source` column
- Modify: `src/db/orders.ts` — add source to createOrder + mapRow
- Modify: `src/api/orders.ts` — accept source in body, add status update endpoint
- Modify: `src/lib/order-format.ts` — include source in staff notification
- Backend dir: `D:\AI-PROJECTS\little-dalat-telegram-bot`

**Interfaces:**
- Consumes: existing Order type
- Produces: `OrderSource` type, updated `createOrder()`, new `updateOrderStatusApi()` endpoint

- [ ] **Step 1: Add OrderSource type to types.ts**

```typescript
export type OrderSource = 'bot' | 'miniapp_telegram' | 'miniapp_zalo' | 'browser';
```

Add field to Order interface between `language` and `createdAt`:

```typescript
export interface Order {
  // ...existing fields...
  language: Language;
  source: OrderSource;
  notes: string;
  createdAt: string;
}
```

- [ ] **Step 2: Add source column to schema.ts**

Add after the existing ALTER TABLE for notes:

```typescript
try { db.exec("ALTER TABLE orders ADD COLUMN source TEXT NOT NULL DEFAULT 'bot'"); } catch { /* column already exists */ }
```

- [ ] **Step 3: Update orders.ts**

Add `source` to createOrder's insert statement and params:

```typescript
export function createOrder(data: {
  // ...existing fields...
  language: Language;
  source?: OrderSource;
  notes?: string;
}): Order {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO orders (chat_id, table_number, mode, items, total, delivery_fee, payment_method, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, pickup_time, language, source, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    data.language,
    data.source || 'bot',
    data.notes || ''
  );
  return getOrderById(result.lastInsertRowid as number)!;
}
```

Add `source` to mapRow:

```typescript
function mapRow(row: any): Order {
  return {
    // ...existing...
    language: row.language,
    source: row.source || 'bot',
    notes: row.notes || '',
    createdAt: row.created_at,
  };
}
```

- [ ] **Step 4: Update api/orders.ts**

Add `source` to CreateOrderBody:

```typescript
interface CreateOrderBody {
  // ...existing...
  language: Language;
  source?: string;
  notes?: string;
}
```

Pass source in createOrder call (add after `language`):

```typescript
language: body.language,
source: (body.source as OrderSource) || 'bot',
```

Add status update endpoint after the confirm endpoint:

```typescript
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
  // Notify user if Telegram source
  try {
    if (updated.source?.startsWith('miniapp_telegram') || updated.source === 'bot') {
      const bot = getBot();
      const lang = updated.language;
      const statusIcons: Record<string, string> = {
        paid: '✅', preparing: '⏳', ready: '🛵', dispatched: '🚚',
        served: '✅', picked_up: '✅',
      };
      const icon = statusIcons[status] || '📋';
      await bot.api.sendMessage(updated.chatId,
        `${icon} *Order #${updated.id}: ${status}*\n` +
        (lang === 'vn' ? 'Cảm ơn bạn đã đặt hàng tại Little Dalat!' :
         lang === 'en' ? 'Thank you for ordering at Little Dalat!' :
         'Спасибо за заказ в Little Dalat!'),
        { parse_mode: 'Markdown' }
      );
    }
  } catch (e) {
    console.error('Status notification failed:', e);
  }
  res.json(updated);
});
```

Also add import for `getBot` at the top (already exists) and `OrderSource, OrderStatus` to the import from types:

```typescript
import { CartItem, OrderMode, PaymentMethod, Language, OrderSource, OrderStatus } from '../types';
```

- [ ] **Step 5: Update order-format.ts**

Add source line after `⏰ ${order.createdAt}`:

```typescript
const sourceLabels: Record<string, string> = {
  bot: '🤖 Telegram Bot',
  miniapp_telegram: '🌐 Telegram Mini App',
  miniapp_zalo: '🇻🇳 Zalo Mini App',
  browser: '🌍 Browser',
};
text += `📱 ${sourceLabels[order.source] || order.source}\n`;
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add order source tracking"
```

---

### Task 2: Mini App — pass source + platform on order creation

**Files:**
- Modify: `src/types.ts` — add `OrderSource` type
- Modify: `src/api/client.ts` — add `source` to CreateOrderInput
- Modify: `src/pages/Checkout.tsx` — pass source from platform detection
- Modify: `src/platforms/usePlatform.ts` — export `getPlatformSource()`
- Dir: `D:\AI-PROJECTS\little-dalat-mini-app`

**Interfaces:**
- Consumes: OrderSource type from backend (mirror)
- Produces: platform source string passed in createOrderApi calls

- [ ] **Step 1: Add OrderSource type to types.ts**

Add before Platform type:

```typescript
export type OrderSource = 'bot' | 'miniapp_telegram' | 'miniapp_zalo' | 'browser';
```

- [ ] **Step 2: Export getPlatformSource in usePlatform.ts**

Add function:

```typescript
export function getPlatformSource(): OrderSource {
  const platform = detectPlatform();
  const map: Record<Platform, OrderSource> = {
    telegram: 'miniapp_telegram',
    zalo: 'miniapp_zalo',
    whatsapp: 'browser',
    browser: 'browser',
  };
  return map[platform];
}
```

Also import OrderSource at top:

```typescript
import { Platform, OrderSource } from '../types';
```

- [ ] **Step 3: Add source to CreateOrderInput in client.ts**

```typescript
export interface CreateOrderInput {
  // ...existing...
  language: Language;
  source?: OrderSource;
  notes?: string;
}
```

- [ ] **Step 4: Pass source in Checkout.tsx**

In handlePay, import `getPlatformSource` and add source to createOrderApi call:

```typescript
import { getUserId, getPlatformSource } from '../platforms/usePlatform';
```

Add `source: getPlatformSource(),` to the createOrderApi call (after `language,`):

```typescript
const order = await createOrderApi({
  chatId: getUserId(),
  mode: state.mode || 'dine-in',
  tableNumber: state.tableNumber || undefined,
  items: state.items,
  paymentMethod: method,
  customerName: customerInfo?.name || '',
  customerPhone: customerInfo?.phone || '',
  deliveryAddress: customerInfo?.address,
  deliveryFee: deliveryFee || undefined,
  language,
  source: getPlatformSource(),
});
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: pass platform source on order creation"
```

---

### Task 3: Telegram Bot — add reorder and status commands

**Files:**
- Modify: `src/bot/handlers/start.ts` — add /order command, reorder callback
- Modify: `src/bot/context.ts` — add reorderStep field
- Modify: `src/bot/keyboards.ts` — add main menu keyboard
- Modify: `src/bot/index.ts` — register new handlers
- Modify: `src/locales/en.json`, `vn.json`, `ru.json` — add new translations
- Modify: `src/bot/context.ts` — add `sessionMode` tracking

**Interfaces:**
- Consumes: `getOrdersByChatId()`, `createOrder()`, `getOrderById()`
- Produces: `/order` command, reorder flow, main menu

- [ ] **Step 1: Add translations**

Add to `en.json`:

```json
"main_menu": "☕ *Little Dalat*\nChoose an option:",
"btn_reorder": "🔄 Repeat Last Order",
"btn_status": "📋 Order Status",
"btn_open_menu": "🛵 Open Menu",
"no_orders": "You haven't placed any orders yet.",
"order_status_text": "📋 *Order #%id%*\nStatus: %status%\nTotal: %total%k\n📅 %date%",
"enter_order_id": "Enter the order number:",
"reorder_confirm": "🔄 Repeat order #%id%?\nItems: %items%\nTotal: %total%k",
"reorder_done": "✅ Order #%id% created! Choose payment:",
"order_cancelled": "Order check cancelled.",
"status_created": "📝 Created",
"status_paid": "✅ Paid",
"status_preparing": "⏳ Preparing",
"status_ready": "🛵 Ready",
"status_served": "✅ Served",
"status_picked_up": "✅ Picked Up",
"status_dispatched": "🚚 Dispatched"
```

Add same keys to `vn.json` and `ru.json` with appropriate translations.

- [ ] **Step 2: Create main menu keyboard in keyboards.ts**

```typescript
export function mainMenuKeyboard(lang: Language, miniAppUrl: string) {
  return new InlineKeyboard()
    .url(t('btn_open_menu', lang), miniAppUrl)
    .row()
    .text(t('btn_reorder', lang), 'reorder_last')
    .text(t('btn_status', lang), 'status_show')
    .row()
    .text(t('contact_msg', lang).split('\n')[0] || '📞 Contact', 'contact')
    .text(t('map_msg', lang).split('\n')[0] || '📍 Map', 'map');
}
```

- [ ] **Step 3: Update /start handler to show main menu after language/mode selection**

After mode is selected and user is in `browsing` step, or after language selection when mode is already set, show the main menu with both the WebApp button and quick actions.

Modify the existing start handler flow — when user completes mode selection (or scans a QR table code), instead of going straight to category browsing, show a main menu that includes:

```
☕ Little Dalat
🍽️ Dine-in (Table 3)

[🛵 Open Menu] (Web App button)

🔄 Repeat Last Order
📋 Order Status
```

This is a new entry point. The existing inline ordering flow stays fully intact — the main menu just adds the WebApp button and quick actions on top. When user taps Open Menu → opens Mini App. When user taps Repeat/Status → executes the action. Back button → goes back to categories (existing flow).

Actually, let me keep it simpler. I'll add the main menu as the start screen AFTER language selection. The existing `browsing` step (category browsing) is still accessible via the 'back' action.

Wait, the spec says:
```
- **Главное меню**: `/start` → Web App кнопка + inline-кнопки:
  - 🔄 Повторить последний заказ
  - 📋 Статус заказа
  - 📞 Контакты
```

Let me modify /start to show this after language selection (after `lang_xxx` callback).

Actually, let me modify the `lang_xxx` callback to show a combined menu when mode is already set (QR scan), and to show the main menu on `/start` without disrupting the existing mode selection flow.

Let me keep it really simple: the main menu shows when user does `/start` without any params. The existing flow (language → mode → browsing) stays for new users. But for returning users, `/start` shows the main menu.

Hmm, actually this gets complex. Let me just add the main menu as an additional state. Here's a simpler approach:

After `/start` → language selection → mode selection → show main menu (instead of going straight to categories). Main menu has:
- "🛵 Open Menu" (WebApp) → opens Mini App
- "🔄 Repeat Last Order" → triggers reorder
- "📋 Order Status" → asks for order # or shows recent
- "📋 Categories" (existing) → goes to category browsing

This makes the main menu the central hub, with the existing inline ordering accessible via "Categories" button.

Let me implement this.

First, in `start.ts`, change the flow so that after mode selection, instead of going to `browsing`, show the main menu. Add a new step `'main_menu'` to the SessionData step type.

Simplify: Just show the main menu as a separate message after mode selection, with the existing category browsing as one of the options.

- [ ] **Step 3: Update context.ts**

Add step type:

```typescript
step: 'idle' | 'choosing_mode' | 'choosing_language' | 'main_menu' | 'browsing' | 'in_cart' | 'checkout_name' | 'checkout_phone' | 'checkout_address' | 'checkout_address_edit' | 'checkout_pickup_time' | 'checkout_payment' | 'confirming' | 'status_check' | 'reorder_confirm';
```

- [ ] **Step 4: Implement main menu + /order command in start.ts**

Add after existing handlers but before bot.callbackQuery for mode_:

```typescript
bot.command('order', async (ctx) => {
  const lang = ctx.session?.language || 'vn';
  const text = ctx.message?.text || '';
  const match = text.match(/\/order\s*(\d+)/i);
  if (match) {
    const id = parseInt(match[1], 10);
    const order = getOrderById(id);
    if (!order || order.chatId !== ctx.chat?.id) {
      await ctx.reply(t('order_not_found', lang));
      return;
    }
    await ctx.reply(formatOrderStatus(order, lang), { parse_mode: 'Markdown' });
  } else {
    const orders = getOrdersByChatId(ctx.chat!.id);
    if (orders.length === 0) {
      await ctx.reply(t('no_orders', lang));
      return;
    }
    let msg = `📋 *${t('your_orders', lang)}*\n\n`;
    for (const o of orders.slice(0, 5)) {
      msg += `#${o.id} — ${t('order_status_' + o.status, lang)} — ${o.total / 1000}k\n`;
    }
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().text('🔄 ' + t('btn_reorder', lang), 'reorder_list'),
    });
  }
});

async function showMainMenu(ctx: BotContext, lang: Language): Promise<void> {
  const baseUrl = process.env.MINI_APP_URL || 'https://cruise-lanes-taylor-heel.trycloudflare.com';
  const miniAppUrl = baseUrl + (baseUrl.includes('?') ? '&' : '?') + 'chat_id=' + ctx.from?.id;
  const modeLabel = ctx.session.mode
    ? `\n${t('mode_' + ctx.session.mode, lang)}` + (ctx.session.tableNumber ? ` | ${t('table', lang)} ${ctx.session.tableNumber}` : '')
    : '';
  await ctx.reply(`☕ *Little Dalat*${modeLabel}`, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🛵 ' + t('btn_open_menu', lang), web_app: { url: miniAppUrl } }],
        [{ text: '🔄 ' + t('btn_reorder', lang), callback_data: 'reorder_last' }],
        [{ text: '📋 ' + t('btn_status', lang), callback_data: 'status_show' }],
        [{ text: '📋 ' + t('categories', lang), callback_data: 'go_categories' }],
      ],
    },
  });
}
```

Then modify the lang_xxx handler to show main menu after mode selection. After `ctx.session.mode` check — instead of going to browsing, show main menu. After mode callback (`mode_xxx`) — show main menu instead of browsing.

Wait, I need to be careful here. The existing flow is quite complex and deeply nested. Let me take a simpler approach: just add the main menu as a NEW entry point, without changing the existing flow. The existing `/start` flow stays exactly as-is. The main menu is shown when user does `/start` on subsequent visits (after they've already completed the setup), OR as a new command.

Actually the simplest and least disruptive approach:

1. Modify the `/start` command to check if user has existing session data (language + mode). If yes, show main menu. If no, show the existing language selection.
2. Add a "go_categories" callback that transitions to the existing browsing flow.
3. Add reorder and status callbacks.

Let me implement this cleanly.

- [ ] **Step 4: Implement reorder callback in start.ts**

Add a new file `src/bot/handlers/reorder.ts`:

```typescript
import { Bot, InlineKeyboard } from 'grammy';
import { BotContext } from '../context';
import { t } from '../../locales';
import { getOrdersByChatId, createOrder, getOrderById } from '../../db/orders';
import { INITIAL_MENU_ITEMS } from '../../data/menu';
import { generateVietQR } from '../../lib/vietqr';
import { paymentKeyboard, paymentConfirmKeyboard } from '../keyboards';
import { notifyStaff } from '../../staff/notify';
import { getBot } from '..';

export function registerReorderHandlers(bot: Bot<BotContext>): void {
  bot.callbackQuery('reorder_last', async (ctx) => {
    const lang = ctx.session.language;
    const orders = getOrdersByChatId(ctx.chat!.id);
    const last = orders.find(o => o.status !== 'cancelled');
    if (!last) {
      await ctx.answerCallbackQuery(t('no_orders', lang));
      return;
    }
    const items = JSON.parse(last.items) as CartItem[];
    const subtotal = items.reduce((sum, ci) => {
      const item = INITIAL_MENU_ITEMS.find(i => i.id === ci.menuItemId);
      return sum + (item?.price || 0) * ci.quantity;
    }, 0);
    const total = subtotal + Math.max(0, last.deliveryFee);
    const itemLines = items.map(ci => {
      const item = INITIAL_MENU_ITEMS.find(i => i.id === ci.menuItemId);
      return item ? `${item.vietnamese} x${ci.quantity}` : '';
    }).filter(Boolean).join(', ');
    ctx.session.reorderData = { items, total, deliveryFee: last.deliveryFee };
    await ctx.editMessageText(
      t('reorder_confirm', lang, { id: last.id, items: itemLines || '...', total: total / 1000 }),
      { reply_markup: new InlineKeyboard()
          .text('✅ ' + t('place_order', lang), 'reorder_confirm_yes')
          .text(t('back', lang), 'main_menu')
      }
    );
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('reorder_confirm_yes', async (ctx) => {
    const lang = ctx.session.language;
    const data = ctx.session.reorderData;
    if (!data) {
      await ctx.answerCallbackQuery('No reorder data');
      return;
    }
    // Go straight to payment selection
    ctx.session.cart = data.items;
    ctx.session.deliveryFee = data.deliveryFee;
    await ctx.editMessageText(t('choose_payment', lang), {
      reply_markup: paymentKeyboard(lang, ctx.session.mode),
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('status_show', async (ctx) => {
    const lang = ctx.session.language;
    const orders = getOrdersByChatId(ctx.chat!.id);
    if (orders.length === 0) {
      await ctx.answerCallbackQuery(t('no_orders', lang));
      return;
    }
    const recent = orders.slice(0, 3);
    let msg = `📋 ${t('your_orders', lang)}\n\n`;
    const kb = new InlineKeyboard();
    for (const o of recent) {
      const statusLabel = t(`status_${o.status}`, lang);
      msg += `#${o.id} — ${statusLabel} — ${o.total / 1000}k\n`;
      kb.text(`#${o.id}`, `status_detail_${o.id}`).row();
    }
    kb.text(t('back', lang), 'main_menu');
    await ctx.editMessageText(msg, { reply_markup: kb, parse_mode: 'Markdown' });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^status_detail_(\d+)$/, async (ctx) => {
    const lang = ctx.session.language;
    const id = parseInt(ctx.match[1], 10);
    const order = getOrderById(id);
    if (!order) {
      await ctx.answerCallbackQuery(t('order_not_found', lang));
      return;
    }
    await ctx.editMessageText(formatOrderStatus(order, lang), {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().text(t('back', lang), 'status_show'),
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('main_menu', async (ctx) => {
    // Re-show main menu
    await ctx.deleteMessage().catch(() => {});
    const lang = ctx.session.language;
    await showMainMenu(ctx, lang);
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('reorder_list', async (ctx) => {
    const lang = ctx.session.language;
    const orders = getOrdersByChatId(ctx.chat!.id);
    if (orders.length === 0) {
      await ctx.answerCallbackQuery(t('no_orders', lang));
      return;
    }
    const kb = new InlineKeyboard();
    for (const o of orders.slice(0, 5)) {
      kb.text(`#${o.id} — ${o.total / 1000}k`, `reorder_id_${o.id}`).row();
    }
    kb.text(t('back', lang), 'main_menu');
    await ctx.editMessageText(t('choose_order', lang) || 'Choose an order to repeat:', { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^reorder_id_(\d+)$/, async (ctx) => {
    const lang = ctx.session.language;
    const id = parseInt(ctx.match[1], 10);
    const order = getOrderById(id);
    if (!order || order.chatId !== ctx.chat!.id) {
      await ctx.answerCallbackQuery(t('order_not_found', lang));
      return;
    }
    const items = JSON.parse(order.items) as CartItem[];
    // Create new order with same items
    const subtotal = items.reduce((sum, ci) => {
      const item = INITIAL_MENU_ITEMS.find(i => i.id === ci.menuItemId);
      return sum + (item?.price || 0) * ci.quantity;
    }, 0);
    const total = subtotal + Math.max(0, order.deliveryFee);
    ctx.session.cart = items;
    ctx.session.deliveryFee = order.deliveryFee;
    await ctx.editMessageText(t('choose_payment', lang), {
      reply_markup: paymentKeyboard(lang, ctx.session.mode),
    });
    await ctx.answerCallbackQuery();
  });
}

function formatOrderStatus(order: Order, lang: Language): string {
  const statusLabels: Record<string, string> = {
    created: '📝 Created', paid: '✅ Paid', preparing: '⏳ Preparing',
    ready: '🛵 Ready', served: '✅ Served', picked_up: '✅ Picked Up',
    dispatched: '🚚 Dispatched',
  };
  return `📋 *Order #${order.id}*\n` +
    `Status: ${statusLabels[order.status] || order.status}\n` +
    `Total: ${order.total / 1000}k\n` +
    `Mode: ${order.mode}\n` +
    `📅 ${order.createdAt}`;
}
```

Wait, I need to import CartItem type. Let me fix that.

- [ ] **Step 5: Register the new handler in bot/index.ts**

```typescript
import { registerReorderHandlers } from './handlers/reorder';
// ...after other registrations...
registerReorderHandlers(bot);
```

- [ ] **Step 6: Create proper reorder.ts (fixed)**

```typescript
import { Bot, InlineKeyboard } from 'grammy';
import { BotContext } from '../context';
import { t } from '../../locales';
import { getOrdersByChatId, createOrder, getOrderById } from '../../db/orders';
import { CartItem, Order } from '../../types';
import { INITIAL_MENU_ITEMS } from '../../data/menu';
import { paymentKeyboard } from '../keyboards';

function formatOrderStatus(order: Order, lang: string): string {
  const statusLabels: Record<string, string> = {
    created: '📝 ' + (t('status_created', lang as any) || 'Created'),
    paid: '✅ ' + (t('status_paid', lang as any) || 'Paid'),
    preparing: '⏳ ' + (t('status_preparing', lang as any) || 'Preparing'),
    ready: '🛵 ' + (t('status_ready', lang as any) || 'Ready'),
    served: '✅ ' + (t('status_served', lang as any) || 'Served'),
    picked_up: '✅ ' + (t('status_picked_up', lang as any) || 'Picked Up'),
    dispatched: '🚚 ' + (t('status_dispatched', lang as any) || 'Dispatched'),
  };
  return `📋 *Order #${order.id}*\n` +
    `Status: ${statusLabels[order.status] || order.status}\n` +
    `Total: ${order.total / 1000}k\n` +
    `Mode: ${order.mode}\n` +
    `📅 ${order.createdAt}`;
}

export function registerReorderHandlers(bot: Bot<BotContext>): void {
  bot.callbackQuery('reorder_last', async (ctx) => {
    const lang = ctx.session.language;
    const orders = getOrdersByChatId(ctx.chat!.id);
    const last = orders.find(o => o.status !== 'cancelled');
    if (!last) {
      await ctx.answerCallbackQuery(t('no_orders', lang));
      return;
    }
    const items = JSON.parse(last.items) as CartItem[];
    const subtotal = items.reduce((sum, ci) => {
      const item = INITIAL_MENU_ITEMS.find(i => i.id === ci.menuItemId);
      return sum + (item?.price || 0) * ci.quantity;
    }, 0);
    const total = subtotal + Math.max(0, last.deliveryFee);
    const itemLines = items.map(ci => {
      const item = INITIAL_MENU_ITEMS.find(i => i.id === ci.menuItemId);
      return item ? `${item.vietnamese} x${ci.quantity}` : '';
    }).filter(Boolean).join(', ');
    ctx.session.reorderData = { items, total, deliveryFee: last.deliveryFee };
    await ctx.editMessageText(
      t('reorder_confirm', lang, { id: last.id, items: itemLines || '...', total: total / 1000 }),
      { reply_markup: new InlineKeyboard()
          .text('✅ ' + t('place_order', lang), 'reorder_confirm_yes')
          .text(t('back', lang), 'main_menu')
      }
    );
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('reorder_confirm_yes', async (ctx) => {
    const lang = ctx.session.language;
    const data = ctx.session.reorderData;
    if (!data || !data.items) {
      await ctx.answerCallbackQuery('No reorder data');
      return;
    }
    ctx.session.cart = data.items;
    ctx.session.deliveryFee = data.deliveryFee || 0;
    await ctx.editMessageText(t('choose_payment', lang), {
      reply_markup: paymentKeyboard(lang, ctx.session.mode),
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('status_show', async (ctx) => {
    const lang = ctx.session.language;
    const orders = getOrdersByChatId(ctx.chat!.id);
    if (orders.length === 0) {
      await ctx.answerCallbackQuery(t('no_orders', lang));
      return;
    }
    const recent = orders.slice(0, 3);
    let msg = `📋 ${t('your_orders', lang)}\n\n`;
    const kb = new InlineKeyboard();
    for (const o of recent) {
      const statusLabel = t(`status_${o.status}`, lang);
      msg += `#${o.id} — ${statusLabel} — ${o.total / 1000}k\n`;
      kb.text(`#${o.id}`, `status_detail_${o.id}`).row();
    }
    kb.text(t('back', lang), 'main_menu');
    await ctx.editMessageText(msg, { reply_markup: kb, parse_mode: 'Markdown' });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^status_detail_(\d+)$/, async (ctx) => {
    const lang = ctx.session.language;
    const id = parseInt(ctx.match[1], 10);
    const order = getOrderById(id);
    if (!order) {
      await ctx.answerCallbackQuery(t('order_not_found', lang));
      return;
    }
    await ctx.editMessageText(formatOrderStatus(order, lang), {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().text(t('back', lang), 'status_show'),
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('main_menu', async (ctx) => {
    await ctx.deleteMessage().catch(() => {});
    const lang = ctx.session.language;
    const baseUrl = process.env.MINI_APP_URL || 'https://cruise-lanes-taylor-heel.trycloudflare.com';
    const miniAppUrl = baseUrl + (baseUrl.includes('?') ? '&' : '?') + 'chat_id=' + ctx.from?.id;
    await showMainMenuMsg(ctx, lang, miniAppUrl);
    await ctx.answerCallbackQuery();
  });
}

export async function showMainMenuMsg(ctx: BotContext, lang: string, miniAppUrl: string): Promise<void> {
  const modeLabel = ctx.session.mode
    ? `\n${ctx.session.mode === 'dine-in' ? '🍽️' : ctx.session.mode === 'pickup' ? '🛍️' : '🚚'} ${t('mode_' + ctx.session.mode, lang)}` +
      (ctx.session.tableNumber ? ` | ${t('table', lang)} ${ctx.session.tableNumber}` : '')
    : '';
  await ctx.reply(`☕ *Little Dalat*${modeLabel}`, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🛵 ' + t('btn_open_menu', lang), web_app: { url: miniAppUrl } }],
        [{ text: '🔄 ' + t('btn_reorder', lang), callback_data: 'reorder_last' }],
        [{ text: '📋 ' + t('btn_status', lang), callback_data: 'status_show' }],
        [{ text: '📋 ' + t('categories', lang), callback_data: 'go_categories' }],
      ],
    },
  });
}
```

- [ ] **Step 7: Update context.ts — add reorderData**

```typescript
export interface SessionData {
  // ...existing...
  currentPage: number;
  itemsMessageId: number | null;
  reorderData?: { items: CartItem[]; total: number; deliveryFee: number } | null;
}
```

- [ ] **Step 8: Add go_categories callback in start.ts (or reorder.ts)**

Add to reorder.ts:

```typescript
bot.callbackQuery('go_categories', async (ctx) => {
  const lang = ctx.session.language;
  ctx.session.step = 'browsing';
  await ctx.editMessageText(t('select_category', lang), {
    reply_markup: categoryKeyboard(lang),
  });
  await ctx.answerCallbackQuery();
});
```

Need to import categoryKeyboard.

- [ ] **Step 9: Add translations to all locale files**

Add missing keys to `en.json`, `vn.json`, `ru.json`:
- `your_orders`: "Your orders"  
- `choose_order`: "Choose order to repeat"
- `reorder_confirm` already added above
- `btn_reorder`, `btn_status`, `btn_open_menu`, `main_menu` already added above
- `categories`: "📋 Categories"
- `status_created` etc already exist
- `no_orders` already exists
- `order_not_found` already exists

- [ ] **Step 10: Add your_orders and choose_order to all locale files**

Add to `en.json`:
```json
"your_orders": "Your Orders",
"choose_order": "Choose an order to repeat:"
```

Add to `vn.json`:
```json
"your_orders": "Đơn hàng của bạn",
"choose_order": "Chọn đơn hàng để đặt lại:"
```

Add to `ru.json`:
```json
"your_orders": "Ваши заказы",
"choose_order": "Выберите заказ для повтора:"
```

- [ ] **Step 11: Commit**

```bash
git add -A && git commit -m "feat: add reorder and order status commands to bot"
```

---

### Task 4: Bot — notify chat when order is created via Mini App

**Files:**
- Modify: `src/api/orders.ts` — after order creation + confirm, notify user via bot
- Modify: `src/bot/handlers/payment.ts` — no changes needed (already sends confirmation messages)
- Dir: `D:\AI-PROJECTS\little-dalat-telegram-bot`

**Interfaces:**
- Consumes: `getBot()`, order with source + chatId

- [ ] **Step 1: Add user notification after confirm in api/orders.ts**

After the existing staff notification in `/orders/:id/confirm`, add user notification:

```typescript
try {
  const bot = getBot();
  await notifyStaff(bot, updated);
  // Notify user if from Telegram mini app
  if (updated.source?.startsWith('miniapp_telegram') || updated.source === 'bot') {
    const lang = updated.language;
    const msg = `✅ *Order #${updated.id} Confirmed!*\n` +
      (lang === 'vn' ? 'Cảm ơn bạn đã đặt hàng tại Little Dalat!' :
       lang === 'en' ? 'Thank you for ordering at Little Dalat!' :
       'Спасибо за заказ в Little Dalat!');
    await bot.api.sendMessage(updated.chatId, msg, { parse_mode: 'Markdown' });
  }
} catch (e) {
  console.error('Notification failed:', e);
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: send order confirmation to user chat via bot"
```

---

### Task 5: Mini App — platform-specific success screens

**Files:**
- Modify: `src/components/PaymentScreen.tsx` — show different success messages per platform
- Modify: `src/i18n/index.ts` — add platform-specific translations
- Dir: `D:\AI-PROJECTS\little-dalat-mini-app`

**Interfaces:**
- Consumes: platform detection from usePlatform
- Produces: different success UI per platform (telegram shows bot link, zalo/browser don't)

- [ ] **Step 1: Add platform-specific success screen in PaymentScreen.tsx**

Import platform detection:

```typescript
import { detectPlatform } from '../platforms/usePlatform';
```

In the `isPlaced` section, after the order number display, add platform-specific text:

```tsx
{/* After order number display */}
{detectPlatform() === 'telegram' && (
  <p className="text-xs text-[#8B7355] mt-4 text-center">
    📲 {language === 'vn' ? 'Theo dõi trạng thái đơn hàng trong Telegram' :
        language === 'en' ? 'Track order status in Telegram' :
        'Отслеживайте статус заказа в Telegram'}
  </p>
)}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: platform-specific success screen in mini app"
```

---

### Task 6: Mini App — platform-specific UI tweaks

**Files:**
- Modify: `src/pages/Checkout.tsx` — pass platform to PaymentScreen
- Modify: `src/components/PaymentScreen.tsx` — hide Telegram refs on Zalo/browser
- Modify: `src/i18n/index.ts` — add needed translations
- Dir: `D:\AI-PROJECTS\little-dalat-mini-app`

**Interfaces:**
- Consumes: platform from usePlatform
- Produces: clean per-platform UI

- [ ] **Step 1: Handle Zalo/browser specifically in PaymentScreen**

Add a helper before the component or within it:

```typescript
const platform = detectPlatform();
```

Use this throughout to show/hide Telegram-specific content:
- On the QR payment screen: only show Telegram link when platform === 'telegram'
- On the cash screen: same
- On the success screen: already done in Task 5

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: platform UI isolation for zalo/browser"
```
