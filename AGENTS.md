# Little Dalat — Mini App (Ordering Frontend)

## Project Overview

React SPA for ordering at Little Dalat Coffee & Tea. Runs as Telegram Mini App, Zalo Mini App, and standalone browser app.

## Tech Stack

- React 19 + TypeScript + Vite 6
- Tailwind CSS 4
- Lucide React (icons)
- Leaflet + OpenStreetMap (map picker)
- Distribution: static files served via nginx

## Key Architecture

```
src/
├── main.tsx              # Entry point
├── App.tsx               # Root: pages routing, platform wrapping
├── types.ts              # Shared types (mirrors backend types)
├── i18n/index.ts         # VN/EN/RU translations + helpers
├── api/client.ts         # API client (fetch wrapper)
├── platforms/
│   ├── usePlatform.ts    # Platform detection (Telegram/Zalo/browser)
│   ├── TelegramProvider.tsx  # Telegram WebView SDK bridge
│   └── ZaloProvider.tsx  # Zalo Mini App bridge
├── context/CartContext.tsx # Cart state (useReducer)
├── pages/
│   ├── Home.tsx          # Category grid
│   ├── Category.tsx      # Menu items per category
│   └── Checkout.tsx      # Full checkout flow
└── components/
    ├── Layout.tsx        # Header + sticky checkout bar
    ├── CategoryGrid.tsx  # Category icons grid
    ├── MenuList.tsx      # Items with variants + cart controls
    ├── CartDrawer.tsx    # Slide-up cart panel
    ├── ModeSelector.tsx  # Dine-in/Pickup/Delivery selection
    ├── CheckoutForm.tsx  # Name → Phone → Address (with map/geo)
    ├── MapPicker.tsx     # Leaflet map with draggable pin
    └── PaymentScreen.tsx # QR/Cash payment + success screen
```

## App Flow

1. Language selection (VN/EN/RU)
2. Mode selection (Dine-in/Pickup/Delivery)
3. Home → Category browsing → Add to cart
4. Checkout → Form → Payment → Success
5. On Telegram: "Close" button returns to bot chat

## Platform Behavior

- **Telegram**: WebView SDK init, lang+mode passed via URL params, close button on success
- **Zalo**: Standalone no Telegram references
- **Browser**: WhatsApp contact, no Telegram/Zalo UI

## API

All API calls go to `/api/*` (proxied by Vite in dev, nginx in prod):
- Categories, Menu, Orders, Delivery estimate, VietQR payment

## Build

```bash
npm run build   # → dist/ → deployed to server
```

## Deploy

Static files at `/opt/little-dalat/ordering/dist/` on server.
Served via nginx → Cloudflare Tunnel → littledalat.nillkin.org

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
