# Browser Mode Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the site fully functional in standalone browser mode with contact sharing, platform-appropriate UI, and QR-code table support.

**Architecture:** Create a `PlatformProvider` context to centralize platform detection. Add `ShareContact` component on success screen. Conditionally render close button based on platform. Parse `?table=N` URL param.

**Tech Stack:** React 19 + TypeScript, no new deps.

## Global Constraints

- No new API routes, DB changes, or server modifications
- Follow existing coding style (no comments, concise)
- All new text strings use existing i18n pattern from `src/i18n/index.ts`
- Contact numbers: shop phone `0912066973`, bot username `littledalatbot`

---

### Task 1: PlatformProvider + usePlatform hook

**Files:**
- Create: `src/platforms/PlatformProvider.tsx`
- Modify: `src/platforms/usePlatform.ts` (add re-exports)

**Interfaces:**
- Consumes: `detectPlatform()` from `usePlatform.ts`
- Produces: `<PlatformProvider>`, `usePlatform()` returning `{ platform: Platform }`

- [ ] **Step 1: Create PlatformProvider.tsx**

```tsx
import { ReactNode, createContext, useContext } from 'react';
import { Platform } from '../types';
import { detectPlatform } from './usePlatform';

interface PlatformContextValue {
  platform: Platform;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const platform = detectPlatform();
  return (
    <PlatformContext.Provider value={{ platform }}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform(): PlatformContextValue {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform must be used within PlatformProvider');
  return ctx;
}
```

- [ ] **Step 2: Add re-exports to usePlatform.ts**

Append to the bottom of `src/platforms/usePlatform.ts`:
```ts
export { PlatformProvider, usePlatform } from './PlatformProvider';
```

---

### Task 2: ShareContact component

**Files:**
- Create: `src/components/ShareContact.tsx`

**Interfaces:**
- Consumes: `{ language: Language, customerName: string, customerPhone: string, orderId?: number }`
- Produces: Three share buttons (Zalo/WhatsApp/Telegram)

- [ ] **Step 1: Create ShareContact.tsx**

```tsx
import { Language } from '../types';

interface ShareContactProps {
  language: Language;
  customerName: string;
  customerPhone: string;
  orderId?: number;
}

export default function ShareContact({ language, customerName, customerPhone, orderId }: ShareContactProps) {
  const text = encodeURIComponent(
    `Hi! I'm ${customerName}, phone: ${customerPhone}. Order #${orderId} — Little Dalat Coffee & Tea`
  );

  const buttons = [
    { label: 'Zalo', url: `https://zalo.me/84912066973?q=${text}`, bg: 'bg-[#0068FF]', icon: '💬' },
    { label: 'WhatsApp', url: `https://wa.me/84912066973?text=${text}`, bg: 'bg-[#25D366]', icon: '💬' },
    { label: 'Telegram', url: `https://t.me/littledalatbot?text=${text}`, bg: 'bg-[#0088CC]', icon: '✈️' },
  ];

  return (
    <div className="w-full">
      <p className="text-xs text-[#8B7355] text-center mb-3">
        {language === 'vn' ? '📲 Chia sẻ liên hệ với quán qua' :
         language === 'en' ? '📲 Share your contact via' :
         '📲 Поделитесь контактом через'}
      </p>
      <div className="flex gap-2">
        {buttons.map(btn => (
          <a
            key={btn.label}
            href={btn.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 py-3 rounded-xl ${btn.bg} text-white font-bold text-xs flex items-center justify-center gap-1.5 transition hover:opacity-90 active:scale-[0.97]`}
          >
            <span>{btn.icon}</span>
            <span>{btn.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
```

---

### Task 3: PaymentScreen browser adaptations

**Files:**
- Modify: `src/components/PaymentScreen.tsx`

- [ ] **Step 1: Add usePlatform import**

```tsx
import { usePlatform } from '../platforms/usePlatform';
```

- [ ] **Step 2: Add hook inside component**

After line 25 (inside PaymentScreen function):
```tsx
const { platform } = usePlatform();
```

- [ ] **Step 3: Conditional close in success view (line 63)**

Replace `{onClose && (` with `{onClose && platform !== 'browser' && (` to hide close button in browser.

- [ ] **Step 4: Replace Telegram-specific text (lines 46-52)**

Replace the block:
```tsx
{detectPlatform() === 'telegram' && (...)}
```
with:
```tsx
{platform === 'browser' && customerName && (
  <ShareContact
    language={language}
    customerName={customerName}
    customerPhone={customerPhone || ''}
    orderId={orderId}
  />
)}
```

Wait — PaymentScreen doesn't receive customerName/Phone. Need to add those props.

**Revised step 4:** Add props for customer info in the interface:

```tsx
interface PaymentScreenProps {
  // ... existing props ...
  customerName?: string;
  customerPhone?: string;
}
```

Then in the success section, replace the Telegram block with ShareContact:

```tsx
{platform === 'browser' && customerName && (
  <ShareContact
    language={language}
    customerName={customerName}
    customerPhone={customerPhone || ''}
    orderId={orderId}
  />
)}
```

Also remove the old `detectPlatform()` import line since it's replaced by `usePlatform()`.

---

### Task 4: Checkout conditional close

**Files:**
- Modify: `src/pages/Checkout.tsx`

- [ ] **Step 1: Add usePlatform import**

```tsx
import { detectPlatform } from '../platforms/usePlatform';
```
→ change to:
```tsx
import { getUserId, getPlatformSource } from '../platforms/usePlatform';
import { usePlatform } from '../platforms/usePlatform';
```

- [ ] **Step 2: Add hook and conditional onClose**

Inside the component, add:
```tsx
const { platform } = usePlatform();
```

Change the onClose prop in PaymentScreen:
```tsx
onClose={handleCloseMiniApp}
```
→
```tsx
onClose={platform !== 'browser' ? handleCloseMiniApp : undefined}
```

---

### Task 5: App.tsx — wrap PlatformProvider + ?table=N

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Import PlatformProvider**

```tsx
import { PlatformProvider, usePlatform } from './platforms/usePlatform';
```

- [ ] **Step 2: Wrap CartProvider with PlatformProvider**

```tsx
const wrapped = (
  <CartProvider>
    <PlatformProvider>
      <AppContent />
    </PlatformProvider>
  </CartProvider>
);
```

- [ ] **Step 3: Parse ?table=N in AppContent**

In AppContent, after existing URL param parsing:
```tsx
const urlTable = getUrlParam('table');
```

Then in the useEffect that handles urlMode:
```tsx
useEffect(() => {
  if (urlMode) {
    dispatch({ type: 'SET_MODE', payload: urlMode });
  }
  if (urlTable) {
    dispatch({ type: 'SET_TABLE', payload: urlTable });
  }
}, []);
```

Make sure `SET_TABLE` is handled in CartContext reducer — check if it exists.

Actually, let me check CartContext first.

---

### Task 6: Verify build

**Files:**
- All modified files

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: No errors.
