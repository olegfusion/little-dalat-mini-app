# Little Dalat — Telegram/Zalo Integration Design

## Overview

Hybrid approach: Telegram bot + Mini App work together seamlessly. Zalo Mini App runs independently. Browser version stays standalone.

## Architecture

```
Telegram Chat (бот)                Telegram Mini App         Zalo Mini App / Browser
        │                                   │                        │
        │  grammY polling                   │  fetch() / proxy       │  fetch() / proxy
        │                                   │                        │
        └──────────┬────────────────────────┘                        │
                   │                                                 │
        ┌──────────▼────────────────────────┐                        │
        │   Express (порт 3001)             │◄───────────────────────┘
        │   ─────────────────               │
        │   API: /api/*                     │
        │   SQLite: menu.db                 │
        │   Staff notify                    │
        └───────────────────────────────────┘
```

## Identity Linking

Mini App при старте получает `start_param` от Telegram (содержит chatId). При оформлении заказа передаёт chatId на бэкенд → бэкенд сохраняет связку `order_id ↔ chat_id`.

```typescript
// mini-app: передача chatId при создании заказа
interface CreateOrderInput {
  items: CartItem[]
  customer: CustomerInfo
  mode: OrderMode
  payment: PaymentMethod
  platform: 'telegram' | 'zalo' | 'browser'
  telegramChatId?: string  // заполняется из initDataUnsafe / start_param
}
```

## Telegram — гибрид

### Bot (grammY)

- **Главное меню**: `/start` → Web App кнопка + inline-кнопки:
  - 🔄 **Повторить последний заказ** — находит последний заказ по chatId, создаёт новый с теми же позициями (без WebView, 2 клика). Если последний заказ был доставлен >7 дней назад — не показывать
  - 📋 Статус заказа
  - 📞 Контакты
- **Глубокие ссылки**: `/start menu_cat_X` → Mini App открывается на категории X
- **Уведомления**: после оформления заказа в Mini App → бот шлёт статусы в чат
  - "✅ Заказ #42 принят!"
  - "⏳ Готовится..."
  - "🛵 В пути / готов к выдаче"
- **Команда `/order N`** — статус заказа по номеру

### Mini App (Telegram WebView)

- Принимает `start_param` (table, category, chatId)
- Статус-бар на экране успеха: "📲 Следите за статусом в Telegram"
- Платформенные ссылки: футер с Telegram-брендингом

## Zalo — standalone

- Всё в WebView без интеграции с Telegram
- Финальный экран: только "Заказ #42 оформлен"
- Никаких упоминаний Telegram или кнопок "Открыть в Telegram"
- Zalo SDK используется только для определения платформы и получения user ID

## Browser — standalone

- Текущее поведение
- Кнопка связи через WhatsApp
- Никакого Telegram/Zalo UI

## Platform Detection

Уже реализовано в `src/platforms/usePlatform.ts`. Доработки:
- `telegram` — показывать ссылки на бота, inline-статусы
- `zalo` — показывать Zalo-специфичный UI
- `browser` — показывать WhatsApp контакты

## Order Source Tracking

Добавить поле `source` в заказы:

| source | Описание |
|--------|----------|
| `bot` | Заказ сделан через inline-клавиатуры бота |
| `miniapp_telegram` | Заказ сделан через Telegram Mini App |
| `miniapp_zalo` | Заказ сделан через Zalo Mini App |
| `browser` | Заказ сделан через браузер (WhatsApp) |

## Staff Notifications

Текущий формат (билингва VN+EN) не меняется. Добавить в уведомление источник: `📱 Telegram Bot`, `🌐 Telegram Mini App`, `🇻🇳 Zalo Mini App`, `🌍 Browser/WhatsApp`.

## Что не меняется

- Menu data (уже определена в боте и доступна через API)
- Cart logic
- Payment (QR/Cash) — одинаков для всех платформ
- Delivery fee calculation
- SQLite schema (только добавить колонки `source`, `telegram_chat_id`, `zalo_user_id`)
- Staff notification format (только добавить источник)

## Implementation Order

1. Бэкенд: добавить `source`, `telegram_chat_id`, `zalo_user_id` в orders
2. Mini App: передавать platform + chatId при создании заказа
3. Bot: команда повторного заказа + статус по `/order`
4. Bot: уведомления о статусе заказа в чат
5. Mini App: платформенные экраны успеха (Telegram/Zalo/Browser)
6. Platform-specific UI tweaks
