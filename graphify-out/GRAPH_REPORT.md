# Graph Report - D:\AI-PROJECTS\little-dalat-mini-app  (2026-07-10)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 98 nodes · 287 edges · 8 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7

## God Nodes (most connected - your core abstractions)
1. `Language` - 27 edges
2. `t()` - 15 edges
3. `OrderMode` - 13 edges
4. `formatPrice()` - 12 edges
5. `useCart()` - 11 edges
6. `MenuItem` - 10 edges
7. `Checkout()` - 8 edges
8. `CategoryInfo` - 8 edges
9. `detectPlatform()` - 7 edges
10. `CartItem` - 7 edges

## Surprising Connections (you probably didn't know these)
- `LayoutProps` --references--> `Language`  [EXTRACTED]
  components/Layout.tsx → types.ts
- `MapPickerProps` --references--> `Language`  [EXTRACTED]
  components/MapPicker.tsx → types.ts
- `CategoryProps` --references--> `Language`  [EXTRACTED]
  pages/Category.tsx → types.ts
- `HomeProps` --references--> `Language`  [EXTRACTED]
  pages/Home.tsx → types.ts
- `AppContent()` --calls--> `fetchMenu()`  [EXTRACTED]
  App.tsx → api/client.ts

## Import Cycles
- None detected.

## Communities (8 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.15
Nodes (11): App(), AppContent(), getUrlParam(), Page, TelegramContext, TelegramContextValue, TelegramProvider(), detectPlatform() (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.26
Nodes (11): DeliveryEstimate, fetchCategories(), fetchMenu(), fetchMenuByCategory(), get(), getOrder(), useCart(), Category() (+3 more)

### Community 2 - "Community 2"
Cohesion: 0.31
Nodes (10): CartDrawer(), LANGUAGES, Layout(), LayoutProps, MenuList(), PaymentScreen(), formatPrice(), getItemName() (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.28
Nodes (10): confirmOrder(), createOrderApi(), generateQr(), post(), Checkout(), getPlatformSource(), getTelegramUserId(), getUserId() (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.21
Nodes (11): CATEGORY_ICONS, CategoryGrid(), CategoryGridProps, MenuListProps, getCategoryName(), CheckoutProps, CategoryInfo, MenuCategory (+3 more)

### Community 5 - "Community 5"
Cohesion: 0.35
Nodes (8): CreateOrderInput, CheckoutFormProps, MODES, ModeSelectorProps, PaymentScreenProps, Language, OrderMode, PaymentMethod

### Community 6 - "Community 6"
Cohesion: 0.28
Nodes (8): CartDrawerProps, CartAction, CartContext, CartProvider(), cartReducer(), CartState, initialState, CartItem

### Community 7 - "Community 7"
Cohesion: 0.43
Nodes (5): estimateDelivery(), CheckoutForm(), reverseGeocode(), MapPicker(), MapPickerProps

## Knowledge Gaps
- **15 isolated node(s):** `Page`, `DeliveryEstimate`, `CATEGORY_ICONS`, `LANGUAGES`, `MODES` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Language` connect `Community 5` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.155) - this node is a cross-community bridge._
- **Why does `t()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 5`, `Community 7`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `OrderMode` connect `Community 5` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `Page`, `DeliveryEstimate`, `CATEGORY_ICONS` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.14705882352941177 - nodes in this community are weakly interconnected._