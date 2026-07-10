# Little Dalat Mini App

Multilingual (VN/EN/RU) mini app for **Little Dalat Coffee & Tea** that runs as a Telegram Mini App, Zalo Mini App, and standalone web app. Customers can browse the menu, add items to cart, and place orders (dine-in, pickup, or delivery).

---

## Architecture

```
Telegram Mini App      Zalo Mini App         Browser / WhatsApp
(WebView + TG SDK)     (WebView + ZMP SDK)   (Standalone)
         |                    |                     |
         └────────────────────┼─────────────────────┘
                              | HTTP
                              ▼
              little-dalat-telegram-bot/
              Express REST API  (port 3001)
              /api/categories, /api/menu, /api/orders, ...
                              |
                    ┌─────────┼──────────┐
                    ▼         ▼          ▼
               Bot (grammy)  SQLite    Staff Chat
                              |
                    ┌─────────┴──────────┐
                    │  Menu Data + i18n   │
                    └────────────────────┘
```

**Two projects work together:**
- `little-dalat-mini-app/` — React SPA (this project)
- `little-dalat-telegram-bot/` — Node.js backend + Telegram bot

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 |
| Language | TypeScript 5.8 |
| Bundler | Vite 6 |
| CSS | Tailwind CSS 4 |
| Icons | Lucide React |
| Map | Leaflet + OpenStreetMap |
| Geocoding | Nominatim (free, no API key) |
| Backend | Express (same process as Telegram bot) |
| Database | better-sqlite3 (SQLite) |
| Payment | VietQR standard |

---

## Project Structure

```
src/
├── api/client.ts           ← API client (fetchCategories, createOrder, ...)
├── components/
│   ├── CartDrawer.tsx      ← Slide-up cart with per-item comments
│   ├── CategoryGrid.tsx    ← 2-column category grid
│   ├── CheckoutForm.tsx    ← Name → Phone → Address (with map/location)
│   ├── Layout.tsx          ← Header + language switcher + cart badge
│   ├── MapPicker.tsx       ← Full-screen Leaflet map for location picker
│   ├── MenuList.tsx        ← Items with prices, variants, quantity controls
│   ├── ModeSelector.tsx    ← Dine-in / Pickup / Delivery selection
│   └── PaymentScreen.tsx   ← QR fullscreen / Cash / Success
├── context/
│   └── CartContext.tsx      ← Cart state (items, mode, customer info)
├── i18n/index.ts           ← Translations VN/EN/RU
├── pages/
│   ├── Home.tsx            ← Logo + categories
│   ├── Category.tsx        ← Items in a category
│   └── Checkout.tsx        ← Mode → Form → Payment flow
├── platforms/
│   ├── usePlatform.ts      ← Platform detection + user ID
│   ├── TelegramProvider.tsx ← Telegram WebApp SDK bridge
│   └── ZaloProvider.tsx    ← Zalo Mini App SDK bridge
├── types.ts                ← Shared TypeScript types
├── App.tsx                 ← Root: Language → Mode → Menu → Checkout
├── main.tsx                ← Entry point
└── index.css               ← Tailwind imports
```

---

## User Flow

### 1. Language Selection
App opens → choose 🇻🇳 🇬🇧 🇷🇺 (saved in localStorage for session)

### 2. Mode Selection
Choose order type:
- **🍽️ Dine-in** — sit at the cafe
- **🛍️ Pickup** — order ahead, pick up
- **🚚 Delivery** — delivery within 8km (free for 5+ items)

### 3. Browse Menu
Categories grid → select category → view items with prices → add to cart

Items with variants (e.g., Muối/Trứng/Tiramisu) show an inline picker.

### 4. Cart
- Per-item quantity controls (+/-)
- **Per-item comment field** (e.g., "Less sugar", "No ice")
- Total displayed
- "Thanh toán" button → checkout

### 5. Checkout
- **Name** → **Phone** (data saved in session, auto-filled on return)
- **Delivery only:** Address step with 3 options:
  - 📍 Use my location (browser Geolocation + reverse geocode)
  - 🌍 Map picker (Leaflet, drag/tap pin)
  - ✏️ Type address manually (auto-geocoded after 1s pause)
- Delivery fee calculated from coordinates via `/api/delivery/estimate`

### 6. Payment
- **QR:** Full-screen VietQR code → scan in banking app → tap "Đã thanh toán"
- **Cash:** Confirmation → pay staff on arrival

### 7. Success
- Order number displayed
- "🆕 New order" button → back to menu with saved customer info

### Free Delivery
5+ items (any) → delivery is free. Message shown in address & payment screens.

---

## API Endpoints

All served by the existing Telegram bot (port 3001):

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/categories` | All categories with translations |
| GET | `/api/menu` | All menu items with variants |
| GET | `/api/menu/:categoryId` | Items filtered by category |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/:id` | Get order status |
| POST | `/api/orders/:id/confirm` | Mark paid, notify staff |
| POST | `/api/delivery/estimate` | Estimate fee by lat/lng + itemCount |
| POST | `/api/payment/qr` | Generate VietQR image URL |

---

## Key Features

### Multilingual
- 3 languages: Vietnamese, English, Russian
- All UI text, menu items, categories, and instructions translated
- Language selector in header + initial picker

### Platform Detection
- Auto-detects Telegram / Zalo / WhatsApp / browser
- Telegram: reads `Telegram.WebApp.initDataUnsafe` + URL param `chat_id`
- Falls back to `chatId: 0` for browser testing

### Delivery
- Distance-based fee via Haversine formula
- Free for 5+ items (any combination)
- Max radius: 8 km
- Address input via geolocation, map picker, or manual text

### Cart Persistence
- Items, mode, and customer info persist within session (CartContext)
- Resets on page reload / app reopen
- Customer name/phone/address auto-fills on return visits within same session

### Staff Notifications
- Orders sent to Telegram staff group via `notifyStaff()`
- Includes: items with variants, per-item comments, total, payment method, delivery details, Google Maps link, customer contact

---

## Getting Started

### Prerequisites
- Node.js 20+
- Existing Telegram bot (`little-dalat-telegram-bot`) running

### Install & Run
```bash
cd little-dalat-mini-app
npm install
npm run dev          # Vite dev server on :5173
```

### Backend API (separate terminal)
```bash
cd little-dalat-telegram-bot
npm run dev          # Bot + API on :3001
```

### For Telegram Testing (HTTPS required)
```bash
npx cloudflared tunnel --url http://localhost:5173
```
Update `MINI_APP_URL` in bot's `.env` file with the Cloudflare URL.
Restart bot → `/menu` → tap "Open Mini App".

### Build for Production
```bash
npm run build        # Output in dist/
```
