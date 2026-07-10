# Changelog

## 2026-07-10 — Browser Mode + Zalo Integration + Delivery Overhaul

### Browser Mode (standalone web)

- **Platform Detection**: Created `PlatformProvider` context — centralized `usePlatform()` hook replacing ad-hoc `detectPlatform()` calls
- **Browser mode UI**: Close button hidden in browser, contact share buttons shown on success screen instead
- **QR table support**: `?table=N` URL param auto-selects dine-in mode + table number
- **Navigation**: Back gesture support via History API + page stack

### Contact Sharing (success screen)

- **ShareContact** component: Zalo / WhatsApp / Telegram buttons open chat with pre-filled message
- Auto-copy order info to clipboard on success screen
- Multi-language share text (VN/EN/RU)
- "Есть вопросы — напишите нам!" prompt

### Address Autocomplete

- **GoGoDuk** (primary): Vietnamese address autocomplete with house numbers, 100 req/day free
- **Goong** (fallback): Vietnamese geocoding (needs Place API activated)
- **Nominatim** (free fallback): OpenStreetMap-based
- Server-side caching in SQLite (`geocode_cache` table) — repeat queries are instant
- Lazy coordinate resolution: only first suggestion gets coordinates, others resolved on pick
- Street suggestions filtered to Nha Trang only
- House number preservation: user's typed prefix merged with suggestion
- Debounce 500ms for autocomplete, 2000ms for delivery fee calculation
- Autocomplete disabled for geo/map-sourced addresses
- Autocomplete only fires after user edits the field manually

### Delivery Fee Calculation

- New tiers: 0-1km = 10k, 1-3km = 15k, 3-5km = 25k, 5-7km = 35k, 7-9km = 45k
- Free delivery only for 5+ drinks (desserts/snacks excluded)
- Real-time drink count display with "Add X more for free delivery"
- Two buttons when drink count < 5: [+ Drinks] [+ Snacks]
- Snacks button navigates directly to desserts_snacks category
- Shop coordinates updated to Little Dalat Google Maps location
- Delivery fee caching via `ld_delivery` in localStorage
- Loading indicator during geolocation (animated bar)
- Timeout & low accuracy mode for faster GPS

### Cart Persistence

- Cart state persisted to `localStorage` via CartContext `useEffect`
- Language, mode, address, and delivery cache all survive page refresh
- Initial page skip to home if language + mode already saved
- "Clear cart" button in cart drawer
- Fixed "Added to cart" toast appearing on page refresh

### Checkout Form

- Address fields auto-fill from `localStorage` + platform (Telegram/Zalo name)
- Name/phone edit buttons on address step
- Address saved immediately on any change, not only on submit
- `addressSource` (geo/map/manual) persisted to prevent repeat geocoding
- Booking fixed: re-calc only when user manually edits
- Delivery fee calculation shows spinner, checkout button disabled during calc
- Geolocation cached in `ld_geo` for instant reuse
- Map loading indicator with spinner overlay

### Payment Screen

- Order summary (items + prices) displayed in yellow box before payment choice
- QR prioritized as primary payment method (dark button), Cash secondary (outlined)
- Variant options displayed on separate line with arrow (→ Muối)
- Prices in black, uniform size
- Larger text for cash payment description
- Cash view shows maximized items table

### Server

- `GET /api/geocode/search` — proxies GoGoDuk → Goong → Nominatim with caching
- `GET /api/geocode/resolve` — geocode a specific address for coordinates
- `geocode_cache` + `geocode_resolve_cache` SQLite tables
- Server timezone set to `Asia/Ho_Chi_Minh` (GMT+7)
- MINI_APP_URL updated to `https://littledalat.nillkin.org`

### i18n Updates

- All new UI strings in VN/EN/RU
- "Доставка до 8км" → "Доставка домой и в офис"
- "Free delivery (5+ items)" → "Free delivery (5+ drinks)"
- "Оформление" → "Оформить заказ"
- Checkout button on Layout: "Оформить" → "Оформить заказ"

### New Files Created

| File | Purpose |
|------|---------|
| `src/platforms/PlatformProvider.tsx` | Centralized platform context |
| `src/components/ShareContact.tsx` | Contact share buttons (Zalo/WA/TG) |
| `server/src/api/geocode.ts` | Geocoding API with caching |
| `docs/superpowers/specs/2026-07-10-browser-mode-enhancements-design.md` | Design spec |
| `docs/superpowers/plans/2026-07-10-browser-mode-enhancements.md` | Implementation plan |
