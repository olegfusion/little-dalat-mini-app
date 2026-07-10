# Little Dalat Mini App — Design Spec

## Overview

Multilingual (VN/EN/RU) mini app for Little Dalat Coffee & Tea that runs as a Telegram Mini App, Zalo Mini App, and WhatsApp interactive experience. Customers can browse the menu, add items to cart, and place orders (dine-in, pickup, or delivery).

## Architecture

```
Telegram Mini App      Zalo Mini App         WhatsApp
(WebView + TG SDK)     (WebView + ZMP SDK)   (Interactive Messages)
         |                    |                      |
         └────────────────────┼──────────────────────┘
                              | HTTP
                              ▼
                    Express REST API        ← NEW: src/api/
                    /api/menu, /api/orders, /api/payment
                              |
                    ┌─────────┼──────────┐
                    ▼         ▼          ▼
               Bot (grammy)  SQLite    Staff Chat
                              |
                    ┌─────────┴─────────┐
                    │  Menu Data + i18n  │
                    └───────────────────┘
```

- **Single Node.js process**: API + bot share the same runtime, DB, and business logic
- **SQLite** (better-sqlite3): existing orders DB reused as-is
- **No external auth**: chat-based sessions, table numbers from QR, order IDs
- **Menu data**: existing `src/data/menu.ts` with 50 items, 8 categories, variants
- **i18n**: existing `src/locales/` JSON files (vn/en/ru)

## API Layer (`src/api/`)

New Express routers added to the existing server:

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/categories` | All categories with translations |
| GET | `/api/menu` | All menu items with variants |
| GET | `/api/menu/:categoryId` | Items filtered by category |
| POST | `/api/orders` | Create order (returns order + QR if payment=qr) |
| GET | `/api/orders/:id` | Get order status |
| POST | `/api/orders/:id/confirm` | Mark as paid (QR) |
| POST | `/api/delivery/estimate` | Estimate delivery fee by lat/lng |
| POST | `/api/payment/qr` | Generate VietQR for amount + orderId |

### Session flow (stateless)

- Mini app sends `X-Session-Id` header (chat_id from Telegram or Zalo user ID)
- API uses existing DB + menu data directly
- No separate user store — platform handles auth

## Mini App Structure (`mini-app/`)

### Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 |
| Language | TypeScript 5.8 |
| Bundler | Vite 6 |
| CSS | Tailwind CSS 4 |
| Icons | Lucide React |
| Animations | Motion (motion/react) |
| Platform detection | Custom hook |
| Routing | React Router v7 (layouts) |
| State | React Context + useReducer (cart) |

### Directory

```
mini-app/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── public/
│   └── logo.png
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types.ts                ← Shared with bot (MenuItem, CartItem, Order, etc.)
    ├── i18n/
    │   └── index.ts            ← i18n hook, reads from bot's locale files
    ├── api/
    │   └── client.ts           ← fetch wrapper for /api/*
    ├── platforms/
    │   ├── usePlatform.ts      ← Detects Telegram / Zalo / WhatsApp / Browser
    │   ├── TelegramProvider.tsx ← TG WebApp SDK init, theme, back button
    │   └── ZaloProvider.tsx    ← ZMP SDK init, theme
    ├── context/
    │   ├── CartContext.tsx      ← Cart state (add, remove, clear, items)
    │   └── OrderContext.tsx     ← Current order flow state
    ├── components/
    │   ├── Layout.tsx           ← Header + language switcher + cart badge
    │   ├── CategoryGrid.tsx     ← 8 categories as cards
    │   ├── MenuList.tsx         ← Items in a category with add-to-cart
    │   ├── CartDrawer.tsx       ← Slide-over cart
    │   ├── CheckoutForm.tsx     ← Name, phone, address/time
    │   └── PaymentScreen.tsx    ← QR or confirm cash
    └── pages/
        ├── Home.tsx             ← Categories
        ├── Category.tsx         ← Items in category
        └── Checkout.tsx         ← Cart → Checkout → Payment
```

### Platform Detection (`usePlatform.ts`)

```typescript
type Platform = 'telegram' | 'zalo' | 'whatsapp' | 'browser';

// Telegram: window.TelegramWebviewProxy exists
// Zalo: window.ZaloMiniApp exists
// WhatsApp: navigator.userAgent includes 'WhatsApp'
// Fallback: browser (dev/test)
```

### Platform-specific behavior

| Feature | Telegram | Zalo | WhatsApp |
|---------|----------|------|----------|
| Auth | `tg.initDataUnsafe.user.id` → session | `zmp.getUser()` → session | phone number → session |
| Theme | `tg.themeParams` | `useTheme()` from zmp-ui | System theme |
| Back btn | `tg.BackButton` | `closeApp()` / `minimizeApp()` | N/A |
| Haptic | `tg.HapticFeedback` | N/A | N/A |
| Share | `tg.switchInlineQuery()` | `sendDataToPreviousMiniApp()` | Share button |

## Data Flow (End-to-End Order)

```
1. User opens Mini App
   → Platform detected, language selected (or auto from TG/Zalo locale)
   → Session ID created

2. Browse menu
   → GET /api/categories → show grid
   → Tap category → GET /api/menu/:categoryId → show items + prices
   → Tap item → select variant (if any) → add to cart
   → Cart badge updates (local state, persisted to sessionStorage)

3. Cart
   → View cart: items × qty, subtotal
   → Edit qty, remove items
   → "Proceed to Checkout"

4. Checkout
   a) Dine-in: table number (from QR param), name, phone
   b) Pickup: name, phone, pickup time
   c) Delivery: name, phone, address (text or location picker)
      → POST /api/delivery/estimate → fee + availability

5. Payment
   → Two options: QR (VietQR) or Cash
   → If QR: POST /api/orders → returns QR image URL
   → User scans → taps "I've paid" → POST /api/orders/:id/confirm
   → If Cash: POST /api/orders → order placed

6. Order placed
   → Staff notified via existing notifyStaff()
   → Order stored in SQLite
   → User sees confirmation screen with order ID
```

## Cart State (CartContext)

```typescript
interface CartItem {
  menuItemId: string;
  quantity: number;
  variantIndex?: number;
}

interface CartState {
  items: CartItem[];
  mode: 'dine-in' | 'pickup' | 'delivery' | null;
  tableNumber: string | null;
}

// Actions: ADD_ITEM, REMOVE_ITEM, UPDATE_QTY, CLEAR, SET_MODE, SET_TABLE
```

## Key UI Components

### Layout
- Top bar: logo "Little Dalat" + language switcher (🇻🇳 🇬🇧 🇷🇺)
- Cart badge (floating button, bottom-right)
- Adaptive: Telegram uses tg.themeParams bg, Zalo uses zmp-ui theme

### CategoryGrid
- 2-column grid of category cards
- Each card: emoji icon + category name in selected language
- Pulls from GET /api/categories

### MenuList
- Category header + items
- Each item: name (selected language), price, variant buttons if applicable
- Item has "Add to cart" button → shows quantity selector (+/-)

### CartDrawer
- Slide-up panel from bottom
- List: item name, variant, qty, line total
- Subtotal display
- "Checkout" button → navigates to Checkout page

### CheckoutForm
- Step-by-step: name → phone → (delivery: address/time) → payment
- Progress indicator
- Payment: QR (generated image) or Cash button
- Confirm button → creates order

## WhatsApp Integration

- Separate handler using WhatsApp Cloud API (existing Node.js process)
- Interactive list messages for categories
- Button messages for items in a category
- Cart managed server-side in session
- Checkout via form flow (name, phone, address) using interactive messages
- Uses same API and DB as the Mini App

## Tech Stack Summary

| Component | Choice |
|-----------|--------|
| Frontend | React 19 + TypeScript 5.8 + Vite 6 |
| Styling | Tailwind CSS 4 |
| Animations | Motion (motion/react) |
| Icons | Lucide React |
| Backend (API) | Express (same process as bot) |
| Database | better-sqlite3 (SQLite) |
| Bot framework | grammy.js |
| Payment | VietQR standard |
| Hosting | Existing VPS (same as bot) |
| WhatsApp SDK | whatsapp-web.js or Cloud API |

## Files to Create/Modify

### New files in `little-dalat-telegram-bot/`:
- `src/api/index.ts` — Express router mounting
- `src/api/menu.ts` — menu/category endpoints
- `src/api/orders.ts` — order CRUD endpoints
- `src/api/payment.ts` — QR generation endpoint
- `src/api/delivery.ts` — delivery fee estimate endpoint

### New files in `little-dalat-mini-app/`:
- `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
- `src/main.tsx`, `src/App.tsx`, `src/index.css`
- `src/types.ts`
- `src/i18n/index.ts`
- `src/api/client.ts`
- `src/platforms/usePlatform.ts`, `TelegramProvider.tsx`, `ZaloProvider.tsx`
- `src/context/CartContext.tsx`, `src/context/OrderContext.tsx`
- `src/components/Layout.tsx`, `CategoryGrid.tsx`, `MenuList.tsx`, `CartDrawer.tsx`, `CheckoutForm.tsx`, `PaymentScreen.tsx`
- `src/pages/Home.tsx`, `src/pages/Category.tsx`, `src/pages/Checkout.tsx`
