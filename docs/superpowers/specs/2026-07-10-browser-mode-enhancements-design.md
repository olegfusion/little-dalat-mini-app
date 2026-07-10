# Browser Mode Enhancements — Little Dalat Mini App

## Objective

Adapt the existing React SPA so that when opened directly in a browser (not via Telegram/Zalo Mini App), the interface is fully functional for standalone use — including contact sharing, platform-appropriate UI, and support for QR-code table access.

---

## Changes

### 1. Platform Context (new file: `src/platforms/PlatformProvider.tsx`)

Create a centralized React context that exposes the current platform (`telegram | zalo | browser`), replacing ad-hoc `detectPlatform()` calls.

- `PlatformProvider` wraps children + exposes `{ platform }`
- `usePlatform()` convenience hook
- Used by `App.tsx`, `PaymentScreen.tsx`, `Checkout.tsx`

### 2. Contact Share Buttons (new: `src/components/ShareContact.tsx`)

Add to the success screen — three buttons that open the respective messenger with a prefilled message containing the customer's name, phone, and order ID.

| Button | URL Scheme |
|--------|-----------|
| Zalo | `https://zalo.me/{SHOP_PHONE}?q={encoded_text}` |
| WhatsApp | `https://wa.me/{SHOP_PHONE}?text={encoded_text}` |
| Telegram | `https://t.me/{BOT_USERNAME}?text={encoded_text}` |

**Message template:** `"I'm {name}, phone: {phone}. Order #{orderId} — Little Dalat Coffee & Tea"`

Hidden on Telegram/Zalo platforms (users are already inside the app).

### 3. PaymentScreen — Browser Mode Adaptations

- **Close button**: Only rendered for `telegram` / `zalo` platforms
- **Success text**: Platform-specific "Track in Telegram" replaced with generic contact info
- **ShareContact**: Shown on browser success screen

### 4. Checkout — Platform-Conscious Close

`onClose` only passed to `PaymentScreen` when platform is `telegram` or `zalo`.

### 5. App.tsx — QR Table Support

When `?table=N` is present in the URL:
- Auto-select `dine-in` mode
- Skip language & mode selection screens
- Show table number in the UI header

When `getUserId()` returns 0 (no Telegram), `chatId` in order creation defaults to 0.

---

## Files Changed

| File | Change |
|------|--------|
| `src/platforms/usePlatform.ts` | Add `PlatformProvider` + `usePlatform()` |
| `src/platforms/PlatformProvider.tsx` | **New** — context wrapper |
| `src/components/ShareContact.tsx` | **New** — share buttons |
| `src/components/PaymentScreen.tsx` | Conditional close, add ShareContact |
| `src/pages/Checkout.tsx` | Conditional onClose |
| `src/App.tsx` | Wrap in PlatformProvider, parse `?table=N` |

---

## Data Flow

```
PlatformProvider (detect)
  └── AppContent (reads platform + ?table=N)
       └── Checkout → PaymentScreen
                        ├── close btn — only telegram/zalo
                        └── ShareContact — only browser
                             ├── Zalo → zalo.me link
                             ├── WhatsApp → wa.me link
                             └── Telegram → t.me link
```

## Scope

Targeted changes only. No new API routes, no database changes, no server-side modifications.
