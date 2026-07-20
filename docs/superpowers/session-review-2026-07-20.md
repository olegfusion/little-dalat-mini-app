# Session Review — Little Dalat Mini App + Telegram Bot

**Date:** 2026-07-20  
**Duration:** Full session (deploy, Telegram integration, menu management, UI)

---

## 1. Projects Consolidated

### little-dalat-mini-app (GitHub: `olegfusion/little-dalat-mini-app`)
React 19 + Vite 6 + Tailwind 4 — ordering frontend. Runs as Telegram/Zalo Mini App + browser.

### little-dalat-telegram-bot (part of same repo, `server/`)
grammY bot + Express API (port 3001) + SQLite. Handles bot commands, order processing, staff notifications.

---

## 2. Infrastructure & Deploy

### Server Setup (Proxmox LXC)
| Component | Detail |
|-----------|--------|
| Host | `96.9.231.111:32000` (SSH) |
| OS | Debian 13 (trixie) |
| Node.js | v26.5.0 |
| PM2 | v7.0.3 (manages `little-dalat-server`) |
| Nginx | Reverse proxy + SPA routing |
| Cloudflare Tunnel | systemd service, 4 connections via Singapore, domain `littledalat.nillkin.org` |

### Deploy Structure
```
/opt/little-dalat/
├── server/          # Express API + Telegram bot (tsx src/index.ts)
├── ordering/dist/   # Mini App static build (served at /)
├── menu/dist/       # Menu app (served at /menu/)
└── data/            # SQLite DB
```

### SSH Key
- Ed25519 key generated at `deploy/ssh/littledalat-deploy-key` (gitignored)
- Public: `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFC8suouaTNKPzQK7M//LYtwYsD6tJqKm4QiDGyiJbqy`

---

## 3. Telegram Bot — Hybrid Integration

### Architecture: Bot + Mini App

**Bot commands** (per-language, set via `setMyCommands` with `language_code`):
| Command | EN | VN | RU |
|---------|-----|-----|------|
| `/start` | 🆕 New Order | 🆕 Đặt hàng | 🆕 Заказать |
| `/menu` | ☕ Open Menu | ☕ Mở Menu | ☕ Меню |
| `/contact` | 📞 Contact Us | 📞 Liên hệ | 📞 Контакты |
| `/map` | 📍 Our Location | 📍 Vị trí | 📍 Наше местоположение |

**Bot Flow:**
1. `/start` → language → mode (dine-in/pickup/delivery) → main menu
2. Main menu: Web App button (opens Mini App) | Repeat Last Order | Order Status | Change Language
3. Full order flow also available via inline keyboards (legacy path)
4. URL params passed to Mini App: `chat_id`, `lang`, `mode`, `table`

### Mini App Integration
- Language + mode passed from bot via URL params (`?lang=vn&mode=delivery`)
- Mini App reads params, auto-sets language and skips mode selection
- Close button on success screen closes Telegram WebView

### Staff Notifications
- Bilingual (VN + EN) order messages in staff group
- Interactive inline status buttons: ⏳ Preparing → 🛵 Ready → ✅ Done
- Buttons update after each click, remaining options shown
- Google Maps link with destination coordinates

### Order Status Messages (per mode)
| Status | Delivery | Pickup | Dine-in |
|--------|----------|--------|---------|
| preparing | icon + status only | icon + status only | icon + status only |
| ready | "will be dispatched soon" | "pick up at counter" | "brought to table" |
| served/delivered | thanks + `/start` link | thanks + `/start` link | thanks + `/start` link |

---

## 4. Menu Data (55+1 = 56 items)

### Categories
| Category | Count |
|----------|-------|
| SIGNATURE | 4 (sg-1 removed: sg-5 added "Cà phê kem 1893") |
| COFFEE & COCOA | 10 (cc-3 split into 3a/3b/3c, cc-4 removed) |
| HOT TEA | 5 |
| SPECIAL FLOWER TEA | 5 |
| OTHER DRINKS | 3 (od-4 removed) |
| FRESH JUICE | 11 (new: 6 fresh + 5 blends) |
| FRUIT TEA | 12 |
| DESSERTS & SNACKS | 6 |
| COMBOS | 3 (new: foot soak) |

### Juice Menu (new)
- 6 cold-pressed juices: Cam, Thơm, Dưa hấu, Chanh dây, Ổi, Táo (40-45k)
- 5 signature blends: Sunrise, Vitamin Boost, Golden, Fresh Day, Tropical (50k)

### Menu Data Export
- `menu-data/menu-edit.json` — editable JSON (56 items, flat format)
- `menu-data/menu-complete.json` — full export with nested structure
- `menu-data/README.md` — usage instructions
- Source: `google-maps-descriptions.txt` — full VN/EN/RU descriptions

### Price Updates
- Special Flower Tea: 37k → 39k
- Other Drinks: od-2 37k, od-3 39k
- Snacks: ds-2 30k
- Fruit Tea: most to 39k, select items to 42k
- Coffee Cream variants: 45k (was 40k)

---

## 5. Photos & Descriptions

### Photo System
- 64 photo files in `Ảnh Menu/` directory (8 category subfolders)
- 62 photo references in menu data
- Files on server at `/opt/little-dalat/ordering/dist/Ảnh Menu/`
- URL encoding: `encodeURIComponent` per path segment

### Description System
- 36 items with properly parsed VN/EN/RU descriptions
- 7 items with per-variant descriptions (arrays)
- Descriptions importable from `google-maps-descriptions.txt`
- All descriptions via `formatOrderForUser()` in order confirmation

### Item Detail Modal
- Full-screen popup with photo, name, price, description
- Variant switching (left/right arrows + buttons)
- Quantity selector (local state, `addQty`)
- "Add to cart" button adds specified quantity + closes
- Item navigation (swipe left/right on mobile, arrow buttons)
- Scrollable description, fixed header + bottom bar

---

## 6. Mini App UI Components

### Menu List (Items)
| Element | Detail |
|---------|--------|
| Thumbnail | 64×64px, `object-contain`, first variant photo for variant items |
| Name | Multi-line wrap (no truncation) |
| Price | Bold, red-brown |
| "Details" link | Opens ItemDetailModal |
| Click area | Entire item row opens detail |
| Variant picker | Shows variant thumbnails + names |

### Cart UI
- Sticky bottom bar (Layout) with item count + total + Checkout button
- CheckoutForm: name → phone → address (with map, GPS, geocoding)
- PaymentScreen: QR (VietQR) + Cash options
- Success screen: order summary, customer info, share buttons (Zalo/WA/Telegram)

### Platform Behaviour
| Platform | Telegram | Zalo | Browser |
|----------|----------|------|---------|
| Close button | ✅ | ❌ | ❌ |
| Track in Telegram | ✅ | ❌ | ❌ |
| WhatsApp contact | ❌ | ❌ | ✅ |

---

## 7. Key Files Modified

### little-dalat-mini-app
| File | Change |
|------|--------|
| `src/App.tsx` | URL param parsing, lang+mode from bot |
| `src/components/Layout.tsx` | Sticky checkout bar + title update |
| `src/components/MenuList.tsx` | Thumbnails, details popup, clickable rows |
| `src/components/ItemDetailModal.tsx` | **New** — full detail popup with cart |
| `src/components/CheckoutForm.tsx` | Delivery coordinates (lat/lng) |
| `src/components/PaymentScreen.tsx` | Platform-specific UI, close button |
| `src/types.ts` | `photo`, `descriptions`, per-variant types |
| `menu-data/` | **New** — editable menu JSON exports |

### little-dalat-telegram-bot
| File | Change |
|------|--------|
| `src/types.ts` | `OrderSource`, `photo`, `descriptions` |
| `src/data/menu.ts` | Full menu update (prices, items, photos, descriptions) |
| `src/data/categories.ts` | Added `juices` category |
| `src/bot/handlers/start.ts` | Main menu, URL params for Mini App |
| `src/bot/handlers/reorder.ts` | Main menu, language switch |
| `src/lib/order-format.ts` | `formatOrderForUser()`, `formatStatusMessage()` |
| `src/staff/notify.ts` | Bilingual status buttons |
| `src/api/orders.ts` | Source tracking, status endpoint, user notifications |
| `src/index.ts` | Per-language bot command descriptions |
| `src/locales/` | All 3 languages updated |

---

## 8. GitHub Repos

| Repo | URL |
|------|-----|
| Main | `https://github.com/olegfusion/little-dalat-mini-app` |
| Branches | `master` (mini-app), `main` (bot, within same repo) |

---

## 9. Graphify

- Knowledge graphs built for both projects
- Bot: 106 nodes, 377 edges, 7 communities
- Mini App: 98 nodes, 287 edges, 8 communities
- AGENTS.md configured for both projects
- `.opencode/plugins/graphify.js` installed

---

## 10. Known Issues / TODOs

- [ ] Add descriptions for items without (sg-3, some juices have minimal desc)
- [ ] Per-variant photos for cc-9, ds-4 (currently use item-level photo)
- [ ] Add remaining variant description arrays (cc-9, sb-* items)
- [ ] Photo upload API for admin panel
- [ ] Webhook-based delivery status tracking
- [ ] Zalo Mini App close button
