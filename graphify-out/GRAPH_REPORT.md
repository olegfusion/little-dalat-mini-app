# Graph Report - little-dalat-telegram-bot  (2026-07-20)

## Corpus Check
- 41 files · ~256,846 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 241 nodes · 555 edges · 16 communities (13 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7f2bbfae`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- compilerOptions
- Little Dalat Telegram Bot — Implementation Plan
- Product Variants
- Little Dalat — Telegram Bot & Backend
- geocode.ts
- SSH deploy keys
- opencode.json
- graphify.js
- setup-tunnel.sh

## God Nodes (most connected - your core abstractions)
1. `t()` - 34 edges
2. `registerPaymentHandlers()` - 16 edges
3. `BotContext` - 15 edges
4. `config` - 14 edges
5. `Language` - 14 edges
6. `registerCheckoutHandlers()` - 13 edges
7. `registerMenuHandlers()` - 12 edges
8. `registerReorderHandlers()` - 12 edges
9. `Little Dalat Telegram Bot — Implementation Plan` - 12 edges
10. `createBot()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `registerMenuHandlers()` --references--> `BotContext`  [EXTRACTED]
  src/bot/handlers/menu.ts → src/bot/context.ts
- `showItemPage()` --references--> `BotContext`  [EXTRACTED]
  src/bot/handlers/menu.ts → src/bot/context.ts
- `createBot()` --indirect_call--> `initialSession()`  [INFERRED]
  src/bot/index.ts → src/bot/context.ts
- `buildCartText()` --calls--> `getItemById()`  [EXTRACTED]
  src/bot/handlers/cart.ts → src/data/menu.ts
- `buildCartText()` --calls--> `getItemName()`  [EXTRACTED]
  src/bot/handlers/cart.ts → src/data/menu.ts

## Import Cycles
- None detected.

## Communities (16 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (31): BotContext, initialSession(), buildCartText(), registerCartHandlers(), applyFreeDelivery(), cartTotalQty(), feeLine(), processDeliveryAddress() (+23 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (27): author, dependencies, better-sqlite3, dotenv, express, grammy, vietqr, description (+19 more)

### Community 2 - "Community 2"
Cohesion: 0.19
Nodes (22): CreateOrderBody, SessionData, getBot(), createOrder(), getOrderById(), getOrdersByChatId(), mapRow(), updateOrderStatus() (+14 more)

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (19): registerMenuHandlers(), showItemPage(), CATEGORIES, getItemById(), getItemName(), getItemsByCategory(), getItemVariantName(), INITIAL_MENU_ITEMS (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (15): router, apiRouter, router, router, router, config, app, commands (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (19): Architecture, Cart & Order Flow, Cash, Categories (8), Data storage, Future Considerations, Little Dalat Telegram Bot — Design Spec, Menu Structure (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (14): 1. Prerequisites, 2. Install, 3. Configure, 4. Run, 5. Setup on VPS (Proxmox LXC — Ubuntu/Debian), 6. Telegram Bot Setup, 7. QR Codes for Tables, 8. Delivery Radius (+6 more)

### Community 7 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, module, moduleResolution, outDir, resolveJsonModule, rootDir (+5 more)

### Community 8 - "Little Dalat Telegram Bot — Implementation Plan"
Cohesion: 0.15
Nodes (12): Little Dalat Telegram Bot — Implementation Plan, Self-Review, Task 10: Bot initialization and main entry point, Task 1: Project scaffolding, Task 2: Locales (translation files), Task 3: Menu data, Task 4: Database, Task 5: Utility libraries (+4 more)

### Community 9 - "Product Variants"
Cohesion: 0.20
Nodes (9): Cart Display, CartItem (types.ts), Data Model, Files Changed, Items with Variants, MenuItem (types.ts), Overview, Product Variants (+1 more)

### Community 10 - "Little Dalat — Telegram Bot & Backend"
Cohesion: 0.22
Nodes (8): Bot Flow, Deploy, graphify, Key Architecture, Little Dalat — Telegram Bot & Backend, Order Source Tracking, Project Overview, Tech Stack

### Community 11 - "geocode.ts"
Cohesion: 0.60
Nodes (5): goongGeocode(), locationIqGeocode(), nominatimGeocode(), photonGeocode(), reverseGeocode()

### Community 12 - "SSH deploy keys"
Cohesion: 0.40
Nodes (4): Public key (добавить на сервер), SSH deploy keys, Добавление публичного ключа на сервер, Как использовать

## Knowledge Gaps
- **105 isolated node(s):** `$schema`, `plugin`, `setup-tunnel.sh script`, `name`, `version` (+100 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vietqr` connect `Community 1` to `Community 4`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Why does `config` connect `Community 4` to `Community 0`, `geocode.ts`, `Community 2`, `Community 3`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `$schema`, `plugin`, `IMPORTANT: keep the reminder string free of backticks and $(...) constructs.` to the rest of the system?**
  _106 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 6` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._