# Product Variants

## Overview
8 menu items have flavor/option variants (e.g., Yogurt: Blueberry/Mango/Strawberry). When adding to cart, user selects variant first. Variant is shown in cart and staff notification as `Name (Variant)`.

## Data Model

### MenuItem (types.ts)
```typescript
interface MenuItem {
  // ... existing fields
  variants?: {
    vn: string[];
    en: string[];
    ru: string[];
  };
}
```

All three arrays have the same length. Index `i` corresponds to the same variant across languages.

### CartItem (types.ts)
```typescript
interface CartItem {
  menuItemId: string;
  quantity: number;
  variantIndex?: number;
}
```

## Items with Variants

| ID | Base Item | Options (VN) |
|---|---|---|
| cc-3 | Cà phê kem | Muối, Trứng, Tiramisu |
| cc-6 | Sữa tươi cà phê sương sáo kem | Muối, Trứng, Tiramisu |
| cc-8 | Ca cao kem | Muối, Trứng, Tiramisu |
| cc-9 | Bạc xỉu | Đá, Nóng |
| bs-5 | Cà phê kem | Muối, Tiramisu |
| od-2 | Sữa chua | Việt quất, Xoài, Dâu tây |
| ds-1 | Bánh Mousse | Tiramisu, Passion, Red Velvet |
| ds-4 | Bánh que chấm kem | Muối, Trứng, Tiramisu |

## UI Flow

1. Item with variants appears as `Tên — 35k` (no badge yet)
2. Click → bot edits message to `Chọn variant cho Tên:` + inline buttons per variant
3. Click variant → adds to cart as `Tên (Variant)` + toast confirmation

## Cart Display
Format in cart text and staff notification: `Sữa chua (Dâu tây) x1 — 35k`

## Files Changed
- `src/types.ts` — add `variants` to MenuItem, `variantIndex` to CartItem
- `src/data/menu.ts` — add variants data to 8 items
- `src/bot/handlers/menu.ts` — show variant picker on add_, handle variant selection
- `src/bot/handlers/cart.ts` — display variant in cart text
- `src/lib/order-format.ts` — display variant in staff notification
