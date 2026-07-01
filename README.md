# Little Dalat Telegram Bot ☕

Telegram bot for ordering at **Little Dalat Coffee & Tea** (Nha Trang, Vietnam). Supports dine-in (QR per table), pickup, and delivery (up to 8 km). Multilingual: Vietnamese, English, Russian.

## Features

- 🍽️ **Dine-in** — QR code per table, order to table service
- 🛍️ **Pickup** — order ahead, pick up at the cafe
- 🚚 **Delivery** — location-based, 8 km radius, tiered fees (15k/25k/38k)
- 💳 **Payment** — VietQR (scan & pay via any VN banking app) or Cash
- 🌐 **3 languages** — Tiếng Việt, English, Русский
- 👥 **Staff notifications** — orders sent to Telegram group

## Quick Start

### 1. Prerequisites

- **Node.js 20+** on your server
- **Telegram Bot Token** from [@BotFather](https://t.me/BotFather)
- **Telegram Group/Chat ID** for staff notifications (get it from [@GetIDsBot](https://t.me/GetIDsBot))
- **OCB Bank account number** for VietQR payments

### 2. Install

```bash
# Clone or upload to your server
cd little-dalat-telegram-bot

# Install dependencies
npm install

# Build TypeScript
npm run build
```

### 3. Configure

Create `.env` file in project root:

```env
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
STAFF_CHAT_ID=-1234567890
OCB_ACCOUNT_NUMBER=1234567890
OCB_BENEFICIARY_NAME=Little Dalat
SHOP_LAT=12.245566
SHOP_LNG=109.192793
SHOP_ADDRESS=02 Thi Sách, Phước Hòa, Nha Trang
SHOP_PHONE=0912066973
```

| Variable | Description |
|----------|-------------|
| `BOT_TOKEN` | Your bot token from @BotFather |
| `STAFF_CHAT_ID` | Telegram group ID for staff orders (negative number) |
| `OCB_ACCOUNT_NUMBER` | OCB bank account number |
| `OCB_BENEFICIARY_NAME` | Account holder name (in VietQR) |
| `SHOP_LAT` / `SHOP_LNG` | Shop GPS coordinates (for delivery radius) |
| `SHOP_ADDRESS` | Shop address text |
| `SHOP_PHONE` | Shop phone number |

### 4. Run

```bash
# Development (with auto-reload)
npm run dev

# Production
npm run build
npm start
```

### 5. Setup on VPS (Proxmox LXC — Ubuntu/Debian)

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs git

# Clone project
git clone <your-repo-url> /opt/little-dalat-bot
cd /opt/little-dalat-bot

# Configure
cp .env.example .env
nano .env  # Fill in your values

# Install & build
npm install
npm run build

# Run with PM2 (auto-restart on crash/reboot)
npm install -g pm2
pm2 start dist/index.js --name little-dalat-bot
pm2 save
pm2 startup  # Follow the instructions to enable on boot

# Check logs
pm2 logs little-dalat-bot
```

### 6. Telegram Bot Setup

1. Send `/newbot` to [@BotFather](https://t.me/BotFather)
2. Set bot name: `Little Dalat Bot`
3. Set bot username: `@LittleDalatBot` (or similar)
4. Copy the token into your `.env` file
5. Set bot commands (send to BotFather):

```
start - Начать / Start / Bắt đầu
menu - Меню / Menu / Thực đơn
order - Заказ / Order / Đơn hàng
```

6. Create a Telegram group for staff, add your bot as admin
7. Send any message in the group
8. Visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
9. Find your group's `chat.id` (negative number like `-1001234567890`)
10. Put it in `.env` as `STAFF_CHAT_ID`

### 7. QR Codes for Tables

Generate QR codes that link to:

```
https://t.me/LittleDalatBot?start=table_1
https://t.me/LittleDalatBot?start=table_2
https://t.me/LittleDalatBot?start=table_3
...
```

Use any QR generator (like [qrcode-monkey.com](https://www.qrcode-monkey.com/)) and print them for each table.

### 8. Delivery Radius

| Distance | Fee |
|----------|-----|
| ≤ 4 km | 15,000 VND |
| 4–6 km | 25,000 VND |
| 6–8 km | 38,000 VND |
| > 8 km | Not available |

The GPS coordinates in `.env` (`SHOP_LAT`/`SHOP_LNG`) determine the shop location. Go to Google Maps, right-click your shop, and copy the coordinates.

## Project Structure

```
src/
  bot/              — Telegram bot logic
    handlers/       — Command and callback handlers
    context.ts      — Bot context with session
    keyboards.ts    — Inline keyboard builders
    index.ts        — Bot initialization
  data/             — Menu data and categories
  db/               — SQLite database (schema + queries)
  lib/              — Utilities (vietqr, distance, formatting)
  locales/          — Translation files (vn.json, en.json, ru.json)
  staff/            — Staff notification logic
  config.ts         — Environment config
  types.ts          — TypeScript types
  index.ts          — Entry point
data/
  menu.db           — SQLite database file (auto-created)
```

## Adding New Languages

1. Create `src/locales/<code>.json` (e.g. `cn.json` for Chinese)
2. Add the language to `MenuCategory` type in `types.ts`
3. Add the category translations in `src/data/categories.ts`
4. Add language button in `src/bot/keyboards.ts`

## License

Apache 2.0
