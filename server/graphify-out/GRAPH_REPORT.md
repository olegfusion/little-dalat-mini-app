# Graph Report - D:\AI-PROJECTS\little-dalat-telegram-bot\src  (2026-07-10)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 106 nodes · 377 edges · 7 communities
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6

## God Nodes (most connected - your core abstractions)
1. `t()` - 33 edges
2. `BotContext` - 15 edges
3. `registerPaymentHandlers()` - 15 edges
4. `config` - 14 edges
5. `Language` - 14 edges
6. `registerCheckoutHandlers()` - 13 edges
7. `registerReorderHandlers()` - 11 edges
8. `createBot()` - 11 edges
9. `getOrderById()` - 11 edges
10. `CartItem` - 10 edges

## Surprising Connections (you probably didn't know these)
- `registerCheckoutHandlers()` --calls--> `reverseGeocode()`  [EXTRACTED]
  bot/handlers/checkout.ts → lib/geocode.ts
- `processDeliveryAddress()` --calls--> `getDeliveryFee()`  [EXTRACTED]
  bot/handlers/checkout.ts → lib/distance.ts
- `processDeliveryAddress()` --calls--> `haversineDistance()`  [EXTRACTED]
  bot/handlers/checkout.ts → lib/distance.ts
- `registerMenuHandlers()` --calls--> `t()`  [EXTRACTED]
  bot/handlers/menu.ts → locales/index.ts
- `showItemPage()` --calls--> `t()`  [EXTRACTED]
  bot/handlers/menu.ts → locales/index.ts

## Import Cycles
- None detected.

## Communities (7 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.16
Nodes (14): router, apiRouter, router, router, router, config, app, PORT (+6 more)

### Community 1 - "Community 1"
Cohesion: 0.25
Nodes (17): buildCartText(), registerCartHandlers(), applyFreeDelivery(), cartTotalQty(), feeLine(), processDeliveryAddress(), registerCheckoutHandlers(), cartKeyboard() (+9 more)

### Community 2 - "Community 2"
Cohesion: 0.26
Nodes (13): CreateOrderBody, SessionData, getBot(), CartItem, CategoryInfo, DeliveryDistance, Language, MenuCategory (+5 more)

### Community 3 - "Community 3"
Cohesion: 0.26
Nodes (12): afterOrderKeyboard(), formatPickupTime(), registerPaymentHandlers(), confirmOrderKeyboard(), paymentConfirmKeyboard(), updateOrderStatus(), formatOrderForStaff(), modeLabels (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (10): BotContext, initialSession(), registerMenuHandlers(), showItemPage(), showMainMenuMsg(), registerStartHandler(), createBot(), languageKeyboard() (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.33
Nodes (10): formatOrderStatus(), registerReorderHandlers(), createOrder(), getOrderById(), getOrdersByChatId(), mapRow(), DB_PATH, getDb() (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.60
Nodes (5): goongGeocode(), locationIqGeocode(), nominatimGeocode(), photonGeocode(), reverseGeocode()

## Knowledge Gaps
- **12 isolated node(s):** `LANG_FIELD`, `PICKUP_TIMES`, `DB_PATH`, `app`, `PORT` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `t()` connect `Community 1` to `Community 2`, `Community 3`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **Why does `config` connect `Community 0` to `Community 1`, `Community 3`, `Community 4`, `Community 6`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `createBot()` connect `Community 4` to `Community 0`, `Community 1`, `Community 3`, `Community 5`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `LANG_FIELD`, `PICKUP_TIMES`, `DB_PATH` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._