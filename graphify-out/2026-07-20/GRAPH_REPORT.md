# Graph Report - little-dalat-mini-app  (2026-07-20)

## Corpus Check
- 81 files · ~5,260,654 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 583 nodes · 1075 edges · 29 communities (26 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8b892226`
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
- Community 7
- File Structure
- Little Dalat Telegram Bot — Design Spec
- compilerOptions
- Little Dalat — Telegram/Zalo Integration Design
- Quick Start
- 2026-07-10 — Browser Mode + Zalo Integration + Delivery Overhaul
- compilerOptions
- Little Dalat Telegram Bot — Implementation Plan
- Browser Mode Enhancements — Little Dalat Mini App
- Little Dalat — Mini App (Ordering Frontend)
- Product Variants
- Global Constraints
- Global Constraints
- Little Dalat — Telegram Bot & Backend
- How to Edit
- SSH deploy keys
- ZaloProvider.tsx
- opencode.json
- graphify.js
- graphify.js

## God Nodes (most connected - your core abstractions)
1. `t()` - 36 edges
2. `Language` - 31 edges
3. `File Structure` - 18 edges
4. `compilerOptions` - 17 edges
5. `BotContext` - 16 edges
6. `config` - 16 edges
7. `registerPaymentHandlers()` - 15 edges
8. `t()` - 15 edges
9. `Language` - 14 edges
10. `formatPrice()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `initCache()` --calls--> `getDb()`  [EXTRACTED]
  server/src/api/geocode.ts → server/src/db/schema.ts
- `createBot()` --references--> `bot`  [EXTRACTED]
  server/src/bot/index.ts → server/src/index.ts
- `createBot()` --indirect_call--> `initialSession()`  [INFERRED]
  server/src/bot/index.ts → server/src/bot/context.ts
- `processDeliveryAddress()` --calls--> `getDeliveryFee()`  [EXTRACTED]
  server/src/bot/handlers/checkout.ts → server/src/lib/distance.ts
- `processDeliveryAddress()` --calls--> `haversineDistance()`  [EXTRACTED]
  server/src/bot/handlers/checkout.ts → server/src/lib/distance.ts

## Import Cycles
- None detected.

## Communities (29 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (81): confirmOrder(), createOrderApi(), CreateOrderInput, DeliveryEstimate, estimateDelivery(), fetchCategories(), fetchMenu(), fetchMenuByCategory() (+73 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (68): CreateOrderBody, BotContext, initialSession(), SessionData, buildCartText(), registerCartHandlers(), applyFreeDelivery(), cartTotalQty() (+60 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (32): 10. Known Issues / TODOs, 1. Projects Consolidated, 2. Infrastructure & Deploy, 3. Telegram Bot — Hybrid Integration, 4. Menu Data (55+1 = 56 items), 5. Photos & Descriptions, 6. Mini App UI Components, 7. Key Files Modified (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (19): router, initCache(), router, apiRouter, router, router, router, DB_PATH (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (27): author, dependencies, better-sqlite3, dotenv, express, grammy, vietqr, description (+19 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (26): 1. Language Selection, 2. Mode Selection, 3. Browse Menu, 4. Cart, 5. Checkout, 6. Payment, 7. Success, API Endpoints (+18 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (24): API Layer (`src/api/`), Architecture, Cart State (CartContext), CartDrawer, CategoryGrid, CheckoutForm, Data Flow (End-to-End Order), Directory (+16 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (23): dependencies, leaflet, lucide-react, motion, react, react-dom, @types/leaflet, devDependencies (+15 more)

### Community 8 - "File Structure"
Cohesion: 0.09
Nodes (21): File Structure, Global Constraints, Little Dalat Mini App Implementation Plan, `little-dalat-mini-app/` (new project), `little-dalat-telegram-bot/` (API additions), Self-Review Checklist, Task 10: CategoryGrid Component, Task 11: MenuList Component (+13 more)

### Community 9 - "Little Dalat Telegram Bot — Design Spec"
Cohesion: 0.10
Nodes (19): Architecture, Cart & Order Flow, Cash, Categories (8), Data storage, Future Considerations, Little Dalat Telegram Bot — Design Spec, Menu Structure (+11 more)

### Community 10 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module, moduleDetection (+10 more)

### Community 11 - "Little Dalat — Telegram/Zalo Integration Design"
Cohesion: 0.13
Nodes (14): Architecture, Bot (grammY), Browser — standalone, Identity Linking, Implementation Order, Little Dalat — Telegram/Zalo Integration Design, Mini App (Telegram WebView), Order Source Tracking (+6 more)

### Community 12 - "Quick Start"
Cohesion: 0.13
Nodes (14): 1. Prerequisites, 2. Install, 3. Configure, 4. Run, 5. Setup on VPS (Proxmox LXC — Ubuntu/Debian), 6. Telegram Bot Setup, 7. QR Codes for Tables, 8. Delivery Radius (+6 more)

### Community 13 - "2026-07-10 — Browser Mode + Zalo Integration + Delivery Overhaul"
Cohesion: 0.14
Nodes (13): 2026-07-10 — Browser Mode + Zalo Integration + Delivery Overhaul, Address Autocomplete, Browser Mode (standalone web), Cart Persistence, Changelog, Checkout Form, Contact Sharing (success screen), Delivery Fee Calculation (+5 more)

### Community 14 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, module, moduleResolution, outDir, resolveJsonModule, rootDir (+5 more)

### Community 15 - "Little Dalat Telegram Bot — Implementation Plan"
Cohesion: 0.15
Nodes (12): Little Dalat Telegram Bot — Implementation Plan, Self-Review, Task 10: Bot initialization and main entry point, Task 1: Project scaffolding, Task 2: Locales (translation files), Task 3: Menu data, Task 4: Database, Task 5: Utility libraries (+4 more)

### Community 16 - "Browser Mode Enhancements — Little Dalat Mini App"
Cohesion: 0.17
Nodes (11): 1. Platform Context (new file: `src/platforms/PlatformProvider.tsx`), 2. Contact Share Buttons (new: `src/components/ShareContact.tsx`), 3. PaymentScreen — Browser Mode Adaptations, 4. Checkout — Platform-Conscious Close, 5. App.tsx — QR Table Support, Browser Mode Enhancements — Little Dalat Mini App, Changes, Data Flow (+3 more)

### Community 17 - "Little Dalat — Mini App (Ordering Frontend)"
Cohesion: 0.18
Nodes (10): API, App Flow, Build, Deploy, graphify, Key Architecture, Little Dalat — Mini App (Ordering Frontend), Platform Behavior (+2 more)

### Community 18 - "Product Variants"
Cohesion: 0.20
Nodes (9): Cart Display, CartItem (types.ts), Data Model, Files Changed, Items with Variants, MenuItem (types.ts), Overview, Product Variants (+1 more)

### Community 19 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Browser Mode Enhancements Implementation Plan, Global Constraints, Task 1: PlatformProvider + usePlatform hook, Task 2: ShareContact component, Task 3: PaymentScreen browser adaptations, Task 4: Checkout conditional close, Task 5: App.tsx — wrap PlatformProvider + ?table=N, Task 6: Verify build

### Community 20 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Global Constraints, Task 1: Backend — add source tracking to orders, Task 2: Mini App — pass source + platform on order creation, Task 3: Telegram Bot — add reorder and status commands, Task 4: Bot — notify chat when order is created via Mini App, Task 5: Mini App — platform-specific success screens, Task 6: Mini App — platform-specific UI tweaks, Telegram/Zalo Integration — Implementation Plan

### Community 21 - "Little Dalat — Telegram Bot & Backend"
Cohesion: 0.22
Nodes (8): Bot Flow, Deploy, graphify, Key Architecture, Little Dalat — Telegram Bot & Backend, Order Source Tracking, Project Overview, Tech Stack

### Community 22 - "How to Edit"
Cohesion: 0.29
Nodes (6): Description Source, Editing `menu-edit.json`, Files, How to Edit, Little DaLat — Menu Data, Photo Files

### Community 23 - "SSH deploy keys"
Cohesion: 0.40
Nodes (4): Public key (добавить на сервер), SSH deploy keys, Добавление публичного ключа на сервер, Как использовать

### Community 24 - "ZaloProvider.tsx"
Cohesion: 0.40
Nodes (3): ZaloContext, ZaloContextValue, ZaloProvider()

## Knowledge Gaps
- **297 isolated node(s):** `$schema`, `plugin`, `name`, `private`, `version` (+292 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vietqr` connect `Community 4` to `Community 3`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `config` connect `Community 1` to `Community 3`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `$schema`, `plugin`, `IMPORTANT: keep the reminder string free of backticks and $(...) constructs.` to the rest of the system?**
  _299 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05711318795430945 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09302325581395349 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.08143939393939394 - nodes in this community are weakly interconnected._