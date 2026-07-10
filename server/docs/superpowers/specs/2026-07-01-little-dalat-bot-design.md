# Little Dalat Telegram Bot — Design Spec

## Overview

Telegram bot for ordering at Little Dalat Coffee & Tea in Nha Trang, Vietnam. Serves 3 ordering modes: dine-in (QR per table), pickup, and delivery (6 km max radius). Multilingual: Vietnamese, English, Russian.

**Location:** 02 Thi Sách, Phước Hòa, Nha Trang  
**Phone:** 0912 066 973  
**Hours:** 07:00–22:00 daily

## Architecture

```
Client Layer:
  ┌─ Telegram Bot (grammy.js) ─┐
  └─ Future: Website (same API) ┘
           │
           ▼
      API Layer (Node.js/Express)
           │
      ┌────┴────┐
      │  SQLite  │  ← menu, orders, sessions (filesystem, no infra)
      │ (better-sqlite3)
      └────┬────┘
           │
      ┌────┴────┐
      │  Staff  │  ← Telegram group/chat: order notifications
      │  Chat   │
      └─────────┘
```

- **Single Node.js process**: API + bot + staff notifications
- **SQLite**: zero-config, file-based — ideal for small VPS
- **No external auth needed**: chat-based, table numbers, order IDs

## Ordering Modes

### Mode A: Dine-in
1. Guest scans QR code (deep link: `t.me/LittleDalatBot?start=table_3`)
2. Bot detects `table_3` param → sets dining mode
3. Select language → menu → cart → checkout
4. Payment: QR (VietQR) or Cash
5. Staff notified in Telegram chat with items + table number

### Mode B: Pickup
1. Guest finds bot (search/Google Maps link)
2. Chooses "Pickup" mode
3. Select language → menu → cart
4. Enters name + estimated arrival time
5. Payment: QR or Cash
6. Staff notified: order ready for pickup

### Mode C: Delivery
1. Guest finds bot
2. Chooses "Delivery" mode
3. Select language → menu → cart (combos/foot soak hidden)
4. Shares location (Telegram location) or types address
5. Bot checks distance: ≤ 4 km → 15k, 4–6 km → 25k, 6–8 km → 38k, > 8 km → not available
6. Delivery fee added to total
7. Payment: **QR only** (no cash for delivery)
8. Staff notified: order + address → staff dispatches via Grab/ShopeeFood

## Menu Structure

### Categories (8)
| ID | VN | EN | RU |
|----|----|----|----|
| coffee_cocoa | CÀ PHÊ & CA CAO | COFFEE & COCOA | КОФЕ И КАКАО |
| hot_tea | TRÀ NÓNG | HOT TEA | ГОРЯЧИЙ ЧАЙ |
| best_sellers | BEST SELLERS | BEST SELLERS | БЕСТСЕЛЛЕРЫ |
| special_flower_tea | TRÀ HOA ĐẶC BIỆT | SPECIAL FLOWER TEA | ОСОБЫЙ ЦВЕТОЧНЫЙ ЧАЙ |
| other_drinks | ĐỒ UỐNG KHÁC | OTHER DRINKS | ДРУГИЕ НАПИТКИ |
| fruit_tea | TRÀ TRÁI CÂY | FRUIT TEA | ФРУКТОВЫЙ ЧАЙ |
| desserts_snacks | TRÁNG MIỆNG & ĂN VẶT | DESSERTS & SNACKS | ДЕСЕРТЫ И ЗАКУСКИ |
| combos | NGÂM CHÂN & COMBO | FOOT SOAK & COMBOS | КОМБО ПРЕДЛОЖЕНИЯ И ВАННОЧКИ |

~50 items total. Delivery mode hides `combos` category.

### Data storage
- Menu in code (`src/data/menu.ts`) — TypeScript, JSON-like structure
- 3 languages inline: `{ id, category, vietnamese, english, russian, price }`
- Future: more languages (Chinese, Korean) added to the same item object

## Cart & Order Flow

```
Category list → inline buttons
  → Item list with prices
    → Add to cart (+ choose item variant if any)
      → "Continue" / "Cart" / "Checkout"

Cart: item × qty, total
  → "Add more" / "Clear cart" / "Proceed"

Checkout:
  1. Confirm mode (Dine-in/Pickup/Delivery)
  2. For delivery: enter address or share location
  3. For pickup: enter name + time
  4. Choose payment: QR or Cash (Cash only for Dine-in/Pickup)
  5. Confirm order
```

### Order states
```
created → paid (if QR) → preparing → ready → served (dine-in) / picked_up (pickup) / dispatched (delivery)
```

## Payment

### QR Payment (VietQR)
- Uses VietQR standard — works with all Vietnamese banking apps
- Static merchant: OCB bank, individual account
- QR encodes: account number, amount, order ID as description
- Guest scans, pays, taps "I've paid" in bot
- Staff verifies payment in bank app (manual verification)

### Cash
- Available for Dine-in and Pickup only
- Guest chooses "Cash" → order goes directly to work
- Staff brings check/change to table or counter

## Staff Notifications

- Dedicated Telegram group chat (configured by env var)
- Each order posted bilingually: Vietnamese with English in parentheses
  ```
  🆕 ĐƠN HÀNG MỚI (NEW ORDER) #42
  ─────────────────────
  📍 Bàn (Table) 3 — Tại quán (Dine-in)
  ─────────────────────
  Matcha Latte x1 — 40k
  Trà Sen Vàng (Golden Lotus Tea) x1 — 40k
  ─────────────────────
  💰 Tổng cộng (Total): 80k
  💳 QR — Đã thanh toán (Paid)
  ─────────────────────
  ⏰ 14:32, 01/07/2026
  ```
  <details>
  <summary>Delivery version</summary>

  ```
  🆕 ĐƠN HÀNG MỚI (NEW ORDER) #47
  ─────────────────────
  🚚 Giao hàng (Delivery)
  📍 02 Thi Sách, Nha Trang
  📞 0912 066 973
  💵 Phí ship (Delivery fee): 15k
  ─────────────────────
  Trà Đào (Peach Tea) x2 — 70k
  ─────────────────────
  💰 Tổng cộng (Total): 85k
  💳 QR — Đã thanh toán (Paid)
  ─────────────────────
  ⏰ 14:32, 01/07/2026
  ```
  </details>

## Tech Stack

| Component | Choice |
|-----------|--------|
| Runtime | Node.js 20+ |
| Language | TypeScript |
| Bot framework | grammy.js |
| Web server | Express (API endpoints) |
| Database | better-sqlite3 (SQLite) |
| QR generation | vietqr library |
| Hosting | LXC on Proxmox, Singapore |
| Deployment | PM2 + git pull |
| Locales | JSON files (`locales/{vn,en,ru}.json`) |

## Project Structure

```
src/
  bot/           — Telegram bot logic (commands, handlers, keyboards)
  api/           — Express server (future: website API)
  data/          — menu data, orders, categories
  locales/       — translation files {vn,en,ru}.json
  lib/           — helpers (vietqr, order formatting)
  db/            — SQLite schema + queries
  staff/         — staff notification formatting
  types.ts       — TypeScript types
  config.ts      — env vars, bot token, staff chat ID, OCB details
  index.ts       — entry point

data/
  menu.db        — SQLite file
```

## Future Considerations

- Kiot Viet API integration (premium tier)
- Website frontend (React, same API)
- Grab/ShopeeFood API for automatic dispatching
- Chinese and Korean locales
- Admin panel in bot (edit menu, view stats)
- Automatic payment verification via bank API
