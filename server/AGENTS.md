# Little Dalat — Telegram Bot & Backend

## Project Overview

Telegram bot + Express API server for Little Dalat Coffee & Tea (Nha Trang, Vietnam).
Single monolith process: grammY bot + Express on port 3001 + SQLite.

## Tech Stack

- Node.js (ESM, TypeScript, tsx for dev)
- grammY (bot framework)
- Express (REST API)
- better-sqlite3 (SQLite)
- PM2 (production process manager)
- Deployed on Proxmox LXC (Debian 13), behind Cloudflare Tunnel

## Key Architecture

```
src/
├── index.ts          # Entry: starts Express + bot, registers commands
├── config.ts         # Env config (bot token, bank, shop coords)
├── types.ts          # All shared types (Order, MenuItem, CartItem, etc.)
├── bot/
│   ├── index.ts      # Bot factory, session middleware, handler registration
│   ├── context.ts    # Session state (cart, language, mode, step)
│   ├── keyboards.ts  # Inline keyboard builders
│   └── handlers/     # Bot callback handlers: start, menu, cart, checkout, payment, reorder
├── api/              # Express routes: menu, orders, payment, delivery
├── db/               # SQLite schema + order CRUD
├── staff/            # Staff Telegram group notification (with status buttons)
├── lib/              # Utilities: vietqr, distance (haversine), geocode, order formatting
├── locales/          # VN/EN/RU translations (JSON)
└── data/             # In-memory menu data (menu.ts, categories.ts)
```

## Bot Flow

1. `/start` → language → mode (dine-in/pickup/delivery) → main menu
2. Main menu: [Web App button] [Repeat Order] [Order Status] [Change Language]
3. Web App opens Mini App for full ordering experience
4. Bot can also handle full order flow via inline keyboards (legacy path)
5. Orders saved to SQLite → staff notified in Telegram group with status buttons

## Order Source Tracking

Each order has a `source` field: `bot`, `miniapp_telegram`, `miniapp_zalo`, `browser`.
Telegram-source orders get bot notifications on status update.

## Deploy

- PM2 runs `tsx src/index.ts` as `little-dalat-server`
- Cloudflare tunnel (systemd) → nginx (port 80) → Express (port 3001)
- Static frontends at: `/opt/little-dalat/ordering/dist/`, `/opt/little-dalat/menu/dist/`
- Domain: littledalat.nillkin.org
- SSH: root@96.9.231.111:32000 (key in deploy/ssh/)

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
