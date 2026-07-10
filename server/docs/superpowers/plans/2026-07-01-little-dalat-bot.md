# Little Dalat Telegram Bot — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Telegram bot for the Little Dalat coffee shop with dine-in, pickup, and delivery ordering, multilingual support (VN/EN/RU), and VietQR payment.

**Architecture:** Single Node.js/TypeScript process with grammy bot framework, SQLite for persistence, and VietQR for payment QR generation. Staff receives orders via a dedicated Telegram chat. All data in one process — no external infra needed beyond the VPS.

**Tech Stack:** Node.js 20+, TypeScript, grammy, better-sqlite3, vietqr, Express

---

### Task 1: Project scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `src/config.ts`
- Create: `src/types.ts`

- [ ] **Step 1: Create package.json**

Run in `D:\AI-PROJECTS\little-dalat-telegram-bot`:

```bash
npm init -y
npm install grammy better-sqlite3 express dotenv vietqr
npm install -D typescript @types/node @types/better-sqlite3 @types/express tsx
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "resolveJsonModule": true,
    "declaration": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create .env**

```
BOT_TOKEN=your_telegram_bot_token_here
STAFF_CHAT_ID=your_staff_group_chat_id_here
OCB_ACCOUNT_NUMBER=your_ocb_account_number
OCB_BENEFICIARY_NAME=Little Dalat
SHOP_LAT=12.245566
SHOP_LNG=109.192793
SHOP_ADDRESS=02 Thi Sách, Phước Hòa, Nha Trang
SHOP_PHONE=0912066973
```

- [ ] **Step 4: Create src/config.ts**

```typescript
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN || '',
  staffChatId: process.env.STAFF_CHAT_ID || '',
  ocbAccountNumber: process.env.OCB_ACCOUNT_NUMBER || '',
  ocbBeneficiaryName: process.env.OCB_BENEFICIARY_NAME || 'Little Dalat',
  shop: {
    lat: Number(process.env.SHOP_LAT) || 12.245566,
    lng: Number(process.env.SHOP_LNG) || 109.192793,
    address: process.env.SHOP_ADDRESS || '02 Thi Sách, Phước Hòa, Nha Trang',
    phone: process.env.SHOP_PHONE || '0912066973',
  },
  delivery: {
    feeWithin4km: 15000,
    fee4to6km: 25000,
    fee6to8km: 38000,
    maxRadius: 8, // km
  },
  currency: 'k',
};
```

- [ ] **Step 5: Create src/types.ts**

```typescript
export type Language = 'vn' | 'en' | 'ru';

export type OrderMode = 'dine-in' | 'pickup' | 'delivery';

export type PaymentMethod = 'qr' | 'cash';

export type OrderStatus = 'created' | 'paid' | 'preparing' | 'ready' | 'served' | 'picked_up' | 'dispatched';

export interface MenuItem {
  id: string;
  category: MenuCategory;
  vietnamese: string;
  english: string;
  russian: string;
  price: number; // in VND (e.g. 25000)
}

export type MenuCategory =
  | 'coffee_cocoa'
  | 'hot_tea'
  | 'best_sellers'
  | 'special_flower_tea'
  | 'other_drinks'
  | 'fruit_tea'
  | 'desserts_snacks'
  | 'combos';

export interface CategoryInfo {
  id: MenuCategory;
  vietnamese: string;
  english: string;
  russian: string;
}

export interface CartItem {
  menuItemId: string;
  quantity: number;
}

export interface Order {
  id: number;
  chatId: number;
  tableNumber: string | null;
  mode: OrderMode;
  items: string; // JSON string of CartItem[]
  total: number;
  deliveryFee: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  language: Language;
  createdAt: string;
}

export interface DeliveryDistance {
  km: number;
  fee: number;
}
```

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json .env src/config.ts src/types.ts
git commit -m "feat: project scaffolding with config and types"
```

---

### Task 2: Locales (translation files)

**Files:**
- Create: `src/locales/vn.json`
- Create: `src/locales/en.json`
- Create: `src/locales/ru.json`

- [ ] **Step 1: Create src/locales/vn.json**

```json
{
  "language": "Tiếng Việt",
  "start_choose_mode": "Chào mừng đến với Little Dalat! ☕\nVui lòng chọn hình thức đặt hàng:",
  "btn_dine_in": "🍽️ Tại quán",
  "btn_pickup": "🛍️ Mang đi",
  "btn_delivery": "🚚 Giao hàng",
  "choose_language": "Vui lòng chọn ngôn ngữ:",
  "categories": "📋 Danh mục",
  "select_category": "Chọn danh mục:",
  "items_in": "Sản phẩm trong",
  "add_to_cart": "🛒 Thêm vào giỏ",
  "added_to_cart": "✅ Đã thêm vào giỏ hàng!",
  "continue_shopping": "Tiếp tục mua",
  "view_cart": "🛒 Giỏ hàng",
  "checkout": "Thanh toán",
  "cart_empty": "🛒 Giỏ hàng trống",
  "cart_title": "🛒 Giỏ hàng của bạn",
  "item_line": "%name% x%qty% — %price%k",
  "total": "Tổng cộng",
  "delivery_fee": "Phí ship",
  "grand_total": "Thành tiền",
  "clear_cart": "🗑️ Xóa giỏ",
  "proceed_checkout": "✅ Thanh toán",
  "place_order": "📝 Đặt hàng",
  "enter_name": "Vui lòng nhập tên của bạn:",
  "enter_phone": "Vui lòng nhập số điện thoại:",
  "enter_address": "Vui lòng nhập địa chỉ giao hàng hoặc chia sẻ vị trí:",
  "share_location": "📍 Chia sẻ vị trí",
  "enter_manual": "✏️ Nhập địa chỉ",
  "location_received": "✅ Đã nhận vị trí của bạn!",
  "distance_check": "Khoảng cách: %km% km. Phí ship: %fee%k",
  "distance_too_far": "Xin lỗi, chúng tôi chỉ giao hàng trong bán kính %max% km.",
  "choose_payment": "Chọn phương thức thanh toán:",
  "btn_qr": "💳 QR (Chuyển khoản)",
  "btn_cash": "💵 Tiền mặt",
  "payment_qr_info": "Quét mã QR bên dưới để thanh toán %amount%k VND bằng bất kỳ ứng dụng ngân hàng nào.",
  "payment_qr_waiting": "Vui lòng chuyển khoản và nhấn nút bên dưới sau khi thanh toán.",
  "btn_i_paid": "✅ Tôi đã thanh toán",
  "payment_cash_info": "Bạn sẽ thanh toán khi nhận hàng (tại quán hoặc khi nhân viên mang ra).",
  "order_confirmed": "✅ Đơn hàng #%id% đã được xác nhận!",
  "order_dinein_msg": "Nhân viên sẽ mang đồ uống đến bàn %table% của bạn. Cảm ơn! ☕",
  "order_pickup_msg": "Đơn hàng của bạn đang được chuẩn bị. Vui lòng đến quán để nhận.",
  "order_delivery_msg": "Đơn hàng của bạn đang được chuẩn bị. Chúng tôi sẽ giao trong thời gian sớm nhất.",
  "order_not_found": "Không tìm thấy đơn hàng.",
  "order_status_title": "📋 Đơn hàng #%id%",
  "status_created": "Đã tạo",
  "status_paid": "Đã thanh toán",
  "status_preparing": "Đang chuẩn bị",
  "status_ready": "Đã sẵn sàng",
  "status_served": "Đã phục vụ",
  "status_picked_up": "Đã lấy",
  "status_dispatched": "Đã giao",
  "cancel_order": "❌ Hủy đơn",
  "order_cancelled": "Đơn hàng #%id% đã được hủy.",
  "not_in_delivery_range": "Xin lỗi, địa chỉ của bạn nằm ngoài khu vực giao hàng của chúng tôi.",
  "mode_dine_in": "Tại quán",
  "mode_pickup": "Mang đi",
  "mode_delivery": "Giao hàng",
  "table": "Bàn",
  "paid": "Đã thanh toán",
  "unpaid": "Chưa thanh toán",
  "back": "◀ Quay lại",
  "remove_item": "Xóa"
}
```

- [ ] **Step 2: Create src/locales/en.json**

```json
{
  "language": "English",
  "start_choose_mode": "Welcome to Little Dalat! ☕\nPlease choose your order mode:",
  "btn_dine_in": "🍽️ Dine-in",
  "btn_pickup": "🛍️ Pickup",
  "btn_delivery": "🚚 Delivery",
  "choose_language": "Please select language:",
  "categories": "📋 Categories",
  "select_category": "Select a category:",
  "items_in": "Items in",
  "add_to_cart": "🛒 Add to Cart",
  "added_to_cart": "✅ Added to cart!",
  "continue_shopping": "Continue Shopping",
  "view_cart": "🛒 Cart",
  "checkout": "Checkout",
  "cart_empty": "🛒 Your cart is empty",
  "cart_title": "🛒 Your Cart",
  "item_line": "%name% x%qty% — %price%k",
  "total": "Total",
  "delivery_fee": "Delivery Fee",
  "grand_total": "Grand Total",
  "clear_cart": "🗑️ Clear Cart",
  "proceed_checkout": "✅ Proceed to Checkout",
  "place_order": "📝 Place Order",
  "enter_name": "Please enter your name:",
  "enter_phone": "Please enter your phone number:",
  "enter_address": "Please enter delivery address or share location:",
  "share_location": "📍 Share Location",
  "enter_manual": "✏️ Enter Address",
  "location_received": "✅ Location received!",
  "distance_check": "Distance: %km% km. Delivery fee: %fee%k",
  "distance_too_far": "Sorry, we only deliver within %max% km radius.",
  "choose_payment": "Choose payment method:",
  "btn_qr": "💳 QR (Bank Transfer)",
  "btn_cash": "💵 Cash",
  "payment_qr_info": "Scan the QR code below to pay %amount%k VND using any banking app.",
  "payment_qr_waiting": "Please transfer and tap the button below after payment.",
  "btn_i_paid": "✅ I've Paid",
  "payment_cash_info": "You'll pay upon receiving (at the cafe or when staff brings your order).",
  "order_confirmed": "✅ Order #%id% has been confirmed!",
  "order_dinein_msg": "Staff will bring your drinks to table %table%. Thank you! ☕",
  "order_pickup_msg": "Your order is being prepared. Please come to the cafe to pick up.",
  "order_delivery_msg": "Your order is being prepared. We'll deliver as soon as possible.",
  "order_not_found": "Order not found.",
  "order_status_title": "📋 Order #%id%",
  "status_created": "Created",
  "status_paid": "Paid",
  "status_preparing": "Preparing",
  "status_ready": "Ready",
  "status_served": "Served",
  "status_picked_up": "Picked Up",
  "status_dispatched": "Dispatched",
  "cancel_order": "❌ Cancel Order",
  "order_cancelled": "Order #%id% has been cancelled.",
  "not_in_delivery_range": "Sorry, your address is outside our delivery area.",
  "mode_dine_in": "Dine-in",
  "mode_pickup": "Pickup",
  "mode_delivery": "Delivery",
  "table": "Table",
  "paid": "Paid",
  "unpaid": "Unpaid",
  "back": "◀ Back",
  "remove_item": "Remove"
}
```

- [ ] **Step 3: Create src/locales/ru.json**

```json
{
  "language": "Русский",
  "start_choose_mode": "Добро пожаловать в Little Dalat! ☕\nВыберите способ заказа:",
  "btn_dine_in": "🍽️ В кафе",
  "btn_pickup": "🛍️ Самовывоз",
  "btn_delivery": "🚚 Доставка",
  "choose_language": "Выберите язык:",
  "categories": "📋 Категории",
  "select_category": "Выберите категорию:",
  "items_in": "Товары в",
  "add_to_cart": "🛒 В корзину",
  "added_to_cart": "✅ Добавлено в корзину!",
  "continue_shopping": "Продолжить",
  "view_cart": "🛒 Корзина",
  "checkout": "Оформить",
  "cart_empty": "🛒 Корзина пуста",
  "cart_title": "🛒 Ваша корзина",
  "item_line": "%name% x%qty% — %price%k",
  "total": "Сумма",
  "delivery_fee": "Доставка",
  "grand_total": "Итого",
  "clear_cart": "🗑️ Очистить",
  "proceed_checkout": "✅ Оформить заказ",
  "place_order": "📝 Заказать",
  "enter_name": "Введите ваше имя:",
  "enter_phone": "Введите номер телефона:",
  "enter_address": "Введите адрес доставки или отправьте геолокацию:",
  "share_location": "📍 Отправить геолокацию",
  "enter_manual": "✏️ Ввести адрес",
  "location_received": "✅ Местоположение получено!",
  "distance_check": "Расстояние: %km% км. Доставка: %fee%k",
  "distance_too_far": "Извините, мы доставляем только в радиусе %max% км.",
  "choose_payment": "Выберите способ оплаты:",
  "btn_qr": "💳 QR (Перевод)",
  "btn_cash": "💵 Наличные",
  "payment_qr_info": "Отсканируйте QR ниже для оплаты %amount%k VND через любое банковское приложение.",
  "payment_qr_waiting": "Переведите средства и нажмите кнопку после оплаты.",
  "btn_i_paid": "✅ Я оплатил",
  "payment_cash_info": "Вы оплатите при получении (в кафе или когда staff принесёт заказ).",
  "order_confirmed": "✅ Заказ #%id% подтверждён!",
  "order_dinein_msg": "Staff принесёт напитки к столу %table%. Спасибо! ☕",
  "order_pickup_msg": "Заказ готовится. Подойдите в кафе для получения.",
  "order_delivery_msg": "Заказ готовится. Доставим в ближайшее время.",
  "order_not_found": "Заказ не найден.",
  "order_status_title": "📋 Заказ #%id%",
  "status_created": "Создан",
  "status_paid": "Оплачен",
  "status_preparing": "Готовится",
  "status_ready": "Готов",
  "status_served": "Подан",
  "status_picked_up": "Забран",
  "status_dispatched": "Отправлен",
  "cancel_order": "❌ Отменить заказ",
  "order_cancelled": "Заказ #%id% отменён.",
  "not_in_delivery_range": "Извините, ваш адрес вне зоны доставки.",
  "mode_dine_in": "В кафе",
  "mode_pickup": "Самовывоз",
  "mode_delivery": "Доставка",
  "table": "Стол",
  "paid": "Оплачено",
  "unpaid": "Не оплачено",
  "back": "◀ Назад",
  "remove_item": "Удалить"
}
```

- [ ] **Step 4: Create src/locales/index.ts**

```typescript
import vn from './vn.json';
import en from './en.json';
import ru from './ru.json';
import { Language } from '../types';

const locales = { vn, en, ru } as const;

export function t(key: string, lang: Language, params?: Record<string, string | number>): string {
  const locale = locales[lang] as Record<string, string>;
  let text = locale[key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`%${k}%`, String(v));
    }
  }
  return text;
}

export { locales };
```

- [ ] **Step 5: Commit**

```bash
git add src/locales/
git commit -m "feat: add trilingual locale files (VN/EN/RU)"
```

---

### Task 3: Menu data

**Files:**
- Create: `src/data/categories.ts`
- Create: `src/data/menu.ts`

- [ ] **Step 1: Create src/data/categories.ts**

```typescript
import { CategoryInfo } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  { id: 'coffee_cocoa', vietnamese: 'CÀ PHÊ & CA CAO', english: 'COFFEE & COCOA', russian: 'КОФЕ И КАКАО' },
  { id: 'hot_tea', vietnamese: 'TRÀ NÓNG', english: 'HOT TEA', russian: 'ГОРЯЧИЙ ЧАЙ' },
  { id: 'best_sellers', vietnamese: 'BEST SELLERS', english: 'BEST SELLERS', russian: 'БЕСТСЕЛЛЕРЫ' },
  { id: 'special_flower_tea', vietnamese: 'TRÀ HOA ĐẶC BIỆT', english: 'SPECIAL FLOWER TEA', russian: 'ОСОБЫЙ ЦВЕТОЧНЫЙ ЧАЙ' },
  { id: 'other_drinks', vietnamese: 'ĐỒ UỐNG KHÁC', english: 'OTHER DRINKS', russian: 'ДРУГИЕ НАПИТКИ' },
  { id: 'fruit_tea', vietnamese: 'TRÀ TRÁI CÂY', english: 'FRUIT TEA', russian: 'ФРУКТОВЫЙ ЧАЙ' },
  { id: 'desserts_snacks', vietnamese: 'TRÁNG MIỆNG & ĂN VẶT', english: 'DESSERTS & SNACKS', russian: 'ДЕСЕРТЫ И ЗАКУСКИ' },
  { id: 'combos', vietnamese: 'NGÂM CHÂN & COMBO', english: 'FOOT SOAK & COMBOS', russian: 'КОМБО ПРЕДЛОЖЕНИЯ И ВАННОЧКИ' },
];
```

- [ ] **Step 2: Create src/data/menu.ts**

```typescript
import { MenuItem } from '../types';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // COFFEE & COCOA
  { id: 'cc-1', category: 'coffee_cocoa', vietnamese: 'Cà phê đen', english: 'Vietnamese Black Coffee', russian: 'Черный вьетнамский кофе', price: 25000 },
  { id: 'cc-2', category: 'coffee_cocoa', vietnamese: 'Cà phê sữa', english: 'Coffee with Condensed Milk', russian: 'Кофе со сгущенным молоком', price: 30000 },
  { id: 'cc-3', category: 'coffee_cocoa', vietnamese: 'Cà phê kem (Muối/Trứng/Tiramisu)', english: 'Cream Coffee (Salted/Egg/Tiramisu)', russian: 'Кофе с кремом (соленый/яичный/тирамису)', price: 40000 },
  { id: 'cc-4', category: 'coffee_cocoa', vietnamese: 'Cà phê kem 1983', english: '1983 Signature Cream Coffee', russian: 'Фирменный кофе с кремом 1983', price: 40000 },
  { id: 'cc-5', category: 'coffee_cocoa', vietnamese: 'Sữa tươi cà phê sương sáo', english: 'Fresh Milk Coffee with Grass Jelly', russian: 'Кофе с молоком и травяным желе', price: 40000 },
  { id: 'cc-6', category: 'coffee_cocoa', vietnamese: 'Sữa tươi cà phê sương sáo kem (Muối/Trứng/Tiramisu)', english: 'Grass Jelly Cream Coffee (Salted/Egg/Tiramisu)', russian: 'Кофе с желе и кремом (соленый/яичный/тирамису)', price: 40000 },
  { id: 'cc-7', category: 'coffee_cocoa', vietnamese: 'Ca cao sữa đá', english: 'Iced Cocoa with Milk', russian: 'Холодное какао с молоком', price: 35000 },
  { id: 'cc-8', category: 'coffee_cocoa', vietnamese: 'Ca cao kem (Muối/Trứng/Tiramisu)', english: 'Cocoa Cream (Salted/Egg/Tiramisu)', russian: 'Какао с кремом (соленый/яичный/тирамису)', price: 40000 },
  { id: 'cc-9', category: 'coffee_cocoa', vietnamese: 'Bạc xỉu đá / nóng', english: 'Iced/Hot Bạc Xỉu (White Coffee)', russian: 'Бак Сиу (молочный кофе) холодный/горячий', price: 35000 },
  { id: 'cc-10', category: 'coffee_cocoa', vietnamese: 'Bạc xỉu xanh (Hoa đậu biếc)', english: 'Blue Butterfly Pea Bạc Xỉu', russian: 'Голубой Бак Сиу', price: 38000 },
  // HOT TEA
  { id: 'ht-1', category: 'hot_tea', vietnamese: 'Trà ngủ ngon', english: 'Sleep Well Tea', russian: 'Чай для сна', price: 50000 },
  { id: 'ht-2', category: 'hot_tea', vietnamese: 'Trà hoa cúc', english: 'Chamomile Tea', russian: 'Ромашковый чай', price: 50000 },
  { id: 'ht-3', category: 'hot_tea', vietnamese: 'Trà hồng nụ', english: 'Rosebud Tea', russian: 'Чай из бутонов роз', price: 50000 },
  { id: 'ht-4', category: 'hot_tea', vietnamese: 'Trà sả gừng', english: 'Lemongrass Ginger Tea', russian: 'Имбирно-лемонграссовый чай', price: 50000 },
  { id: 'ht-5', category: 'hot_tea', vietnamese: 'Trà olong trái cây', english: 'Fruit Oolong Tea', russian: 'Фруктовый улун', price: 50000 },
  // BEST SELLERS
  { id: 'bs-1', category: 'best_sellers', vietnamese: 'Matcha Latte', english: 'Matcha Latte', russian: 'Матча латте', price: 40000 },
  { id: 'bs-2', category: 'best_sellers', vietnamese: 'Sữa tươi cà phê sương sáo', english: 'Fresh Milk Coffee with Grass Jelly', russian: 'Кофе с молоком и травяным желе', price: 40000 },
  { id: 'bs-3', category: 'best_sellers', vietnamese: 'Hibiscus đào cam sả', english: 'Hibiscus Peach Orange Lemongrass Tea', russian: 'Чай гибискус с персиком и лемонграссом', price: 40000 },
  { id: 'bs-4', category: 'best_sellers', vietnamese: 'Trà sen vàng', english: 'Golden Lotus Tea', russian: 'Чай «Золотой лотос»', price: 40000 },
  { id: 'bs-5', category: 'best_sellers', vietnamese: 'Cà phê kem Muối / Tiramisu', english: 'Cream Coffee (Salted/Tiramisu)', russian: 'Кофе с кремом (соленый/тирамису)', price: 40000 },
  // SPECIAL FLOWER TEA
  { id: 'sft-1', category: 'special_flower_tea', vietnamese: 'Trà mùa xuân', english: 'Spring Tea', russian: 'Весенний чай', price: 35000 },
  { id: 'sft-2', category: 'special_flower_tea', vietnamese: 'Trà dưỡng nhan', english: 'Herbal Beauty Tea', russian: 'Травяной чай для красоты', price: 37000 },
  { id: 'sft-3', category: 'special_flower_tea', vietnamese: 'Trà hoa đặc biệt', english: 'Signature Flower Tea', russian: 'Фирменный цветочный чай', price: 37000 },
  { id: 'sft-4', category: 'special_flower_tea', vietnamese: 'Trà atiso đỏ', english: 'Red Hibiscus Tea', russian: 'Красный каркаде', price: 35000 },
  { id: 'sft-5', category: 'special_flower_tea', vietnamese: 'Trà nhài kem cheese', english: 'Jasmine Tea with Cheese Cream', russian: 'Жасминовый чай с сырным кремом', price: 37000 },
  { id: 'sft-6', category: 'special_flower_tea', vietnamese: 'Cam vắt hạt chia', english: 'Fresh Orange Juice with Chia Seeds', russian: 'Сок апельсин с семенами чиа', price: 35000 },
  // OTHER DRINKS
  { id: 'od-1', category: 'other_drinks', vietnamese: 'Dừa tươi', english: 'Fresh Young Coconut', russian: 'Свежий молодой кокос', price: 30000 },
  { id: 'od-2', category: 'other_drinks', vietnamese: 'Sữa chua (Việt quất/Xoài/Dâu tây)', english: 'Yogurt (Blueberry/Mango/Strawberry)', russian: 'Йогурт (черника/манго/клубника)', price: 35000 },
  { id: 'od-3', category: 'other_drinks', vietnamese: 'Bạc hà kem cheese', english: 'Mint Cheese Cream Drink', russian: 'Мятный напиток с сырной пенкой', price: 37000 },
  // FRUIT TEA
  { id: 'ft-1', category: 'fruit_tea', vietnamese: 'Trà trái cây nhiệt đới', english: 'Tropical Fruit Tea', russian: 'Тропический фруктовый чай', price: 40000 },
  { id: 'ft-2', category: 'fruit_tea', vietnamese: 'Trà sen vàng', english: 'Golden Lotus Tea', russian: 'Чай «Золотой лотос»', price: 40000 },
  { id: 'ft-3', category: 'fruit_tea', vietnamese: 'Trà dâu tằm', english: 'Mulberry Tea', russian: 'Шелковичный чай', price: 37000 },
  { id: 'ft-4', category: 'fruit_tea', vietnamese: 'Chanh dây hoàng kim', english: 'Golden Passion Fruit Tea', russian: 'Золотой чай из маракуйи', price: 35000 },
  { id: 'ft-5', category: 'fruit_tea', vietnamese: 'Trà dâu tây đậu biếc', english: 'Butterfly Pea Strawberry Tea', russian: 'Клубничный чай с анчаном', price: 35000 },
  { id: 'ft-6', category: 'fruit_tea', vietnamese: 'Trà đào', english: 'Peach Tea', russian: 'Персиковый чай', price: 35000 },
  { id: 'ft-7', category: 'fruit_tea', vietnamese: 'Trà đào cam sả', english: 'Peach Orange Lemongrass Tea', russian: 'Персиковый чай с апельсином', price: 40000 },
  { id: 'ft-8', category: 'fruit_tea', vietnamese: 'Hibiscus đào cam sả', english: 'Hibiscus Peach Orange Lemongrass Tea', russian: 'Гибискус с персиком и лемонграссом', price: 40000 },
  { id: 'ft-9', category: 'fruit_tea', vietnamese: 'Trà đào xoài đậu biếc', english: 'Butterfly Pea Peach Mango Tea', russian: 'Чай с персиком, манго и анчаном', price: 35000 },
  { id: 'ft-10', category: 'fruit_tea', vietnamese: 'Olong đào', english: 'Peach Oolong', russian: 'Персиковый улун', price: 35000 },
  { id: 'ft-11', category: 'fruit_tea', vietnamese: 'Olong ổi hồng', english: 'Pink Guava Oolong', russian: 'Улун с розовой гуавой', price: 35000 },
  { id: 'ft-12', category: 'fruit_tea', vietnamese: 'Olong nhài xí muội', english: 'Jasmine Oolong with Salted Plum', russian: 'Жасминовый улун с соленой сливой', price: 35000 },
  { id: 'ft-13', category: 'fruit_tea', vietnamese: 'Trà táo xanh bạc hà', english: 'Green Apple Mint Tea', russian: 'Чай с зеленым яблоком и мятой', price: 35000 },
  { id: 'ft-14', category: 'fruit_tea', vietnamese: 'Trà phúc bồn tử', english: 'Raspberry Tea', russian: 'Малиновый чай', price: 35000 },
  // DESSERTS & SNACKS
  { id: 'ds-1', category: 'desserts_snacks', vietnamese: 'Bánh Mousse (Tiramisu/Passion/Red Velvet)', english: 'Mousse Cake (Tiramisu/Passion/Red Velvet)', russian: 'Муссовый торт (тирамису/маракуйя/красный бархат)', price: 35000 },
  { id: 'ds-2', category: 'desserts_snacks', vietnamese: 'Khô gà lá chanh', english: 'Dried Chicken with Lime Leaves', russian: 'Сушеная курица с листьями лайма', price: 35000 },
  { id: 'ds-3', category: 'desserts_snacks', vietnamese: 'Khoai lang sấy', english: 'Dried Sweet Potato', russian: 'Сушеный батат', price: 25000 },
  { id: 'ds-4', category: 'desserts_snacks', vietnamese: 'Bánh que chấm kem (Muối/Trứng/Tiramisu)', english: 'Cream Biscuit Sticks (Salted/Egg/Tiramisu)', russian: 'Бисквитные палочки с кремом', price: 25000 },
  { id: 'ds-5', category: 'desserts_snacks', vietnamese: 'Snack', english: 'Snacks', russian: 'Снеки', price: 20000 },
  { id: 'ds-6', category: 'desserts_snacks', vietnamese: 'Hạt bí', english: 'Pumpkin Seeds', russian: 'Тыквенные семечки', price: 15000 },
  { id: 'ds-7', category: 'desserts_snacks', vietnamese: 'Hạt hướng dương', english: 'Sunflower Seeds', russian: 'Семечки подсолнуха', price: 12000 },
  // FOOT SOAK & COMBOS
  { id: 'cb-1', category: 'combos', vietnamese: 'Ngâm chân thảo mộc', english: 'Herbal Foot Soak', russian: 'Травяная ванночка для ног', price: 40000 },
  { id: 'cb-2', category: 'combos', vietnamese: 'Combo 1 (Trà + Ngâm chân + Bánh/Khô gà)', english: 'Combo 1: Tea + Foot Soak + Cake/Chicken', russian: 'Комбо 1: чай + ванночка + торт/курица', price: 105000 },
  { id: 'cb-3', category: 'combos', vietnamese: 'Combo 2 (Trà + Ngâm chân + Khoai/Bánh que)', english: 'Combo 2: Tea + Foot Soak + Sweet Potato/Sticks', russian: 'Комбо 2: чай + ванночка + батат/палочки', price: 95000 },
  { id: 'cb-4', category: 'combos', vietnamese: 'Combo 3 (Trà + Ngâm chân)', english: 'Combo 3: Tea + Foot Soak', russian: 'Комбо 3: чай + ванночка', price: 70000 },
];

export function getItemsByCategory(categoryId: string): MenuItem[] {
  return INITIAL_MENU_ITEMS.filter(item => item.category === categoryId);
}

export function getItemById(id: string): MenuItem | undefined {
  return INITIAL_MENU_ITEMS.find(item => item.id === id);
}

export function getItemName(item: MenuItem, lang: string): string {
  return item[lang as keyof typeof item] as string || item.english;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/data/
git commit -m "feat: add menu data with categories and 50+ items"
```

---

### Task 4: Database

**Files:**
- Create: `src/db/schema.ts`
- Create: `src/db/orders.ts`

- [ ] **Step 1: Create src/db/schema.ts**

```typescript
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'menu.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema();
  }
  return db;
}

function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id INTEGER NOT NULL,
      table_number TEXT,
      mode TEXT NOT NULL DEFAULT 'dine-in',
      items TEXT NOT NULL,
      total INTEGER NOT NULL,
      delivery_fee INTEGER NOT NULL DEFAULT 0,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'created',
      customer_name TEXT NOT NULL DEFAULT '',
      customer_phone TEXT NOT NULL DEFAULT '',
      delivery_address TEXT NOT NULL DEFAULT '',
      delivery_lat REAL,
      delivery_lng REAL,
      language TEXT NOT NULL DEFAULT 'vn',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `);
}
```

- [ ] **Step 2: Create src/db/orders.ts**

```typescript
import { getDb } from './schema';
import { CartItem, Order, OrderStatus, PaymentMethod, OrderMode, Language } from '../types';

export function createOrder(data: {
  chatId: number;
  tableNumber: string | null;
  mode: OrderMode;
  items: CartItem[];
  total: number;
  deliveryFee: number;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  language: Language;
}): Order {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO orders (chat_id, table_number, mode, items, total, delivery_fee, payment_method, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, language)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.chatId,
    data.tableNumber,
    data.mode,
    JSON.stringify(data.items),
    data.total,
    data.deliveryFee,
    data.paymentMethod,
    data.customerName,
    data.customerPhone,
    data.deliveryAddress,
    data.deliveryLat,
    data.deliveryLng,
    data.language
  );
  return getOrderById(result.lastInsertRowid as number)!;
}

export function getOrderById(id: number): Order | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
  return row ? mapRow(row) : undefined;
}

export function getOrdersByChatId(chatId: number): Order[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM orders WHERE chat_id = ? ORDER BY id DESC').all(chatId) as any[];
  return rows.map(mapRow);
}

export function updateOrderStatus(id: number, status: OrderStatus): void {
  const db = getDb();
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
}

function mapRow(row: any): Order {
  return {
    id: row.id,
    chatId: row.chat_id,
    tableNumber: row.table_number,
    mode: row.mode,
    items: row.items,
    total: row.total,
    deliveryFee: row.delivery_fee,
    paymentMethod: row.payment_method,
    status: row.status,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    deliveryAddress: row.delivery_address,
    deliveryLat: row.delivery_lat,
    deliveryLng: row.delivery_lng,
    language: row.language,
    createdAt: row.created_at,
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/db/
git commit -m "feat: add SQLite schema and order CRUD"
```

---

### Task 5: Utility libraries

**Files:**
- Create: `src/lib/vietqr.ts`
- Create: `src/lib/distance.ts`
- Create: `src/lib/order-format.ts`

- [ ] **Step 1: Create src/lib/vietqr.ts**

```typescript
import { config } from '../config';

interface QRData {
  imageUrl: string;
  content: string;
}

export function generateVietQR(orderId: number, amount: number): QRData {
  const napasString = buildNapasString(orderId, amount);

  return {
    imageUrl: `https://api.vietqr.io/image/${config.ocbAccountNumber}-compact2.jpg?amount=${amount}&addInfo=DH${orderId}&accountName=${encodeURIComponent(config.ocbBeneficiaryName)}`,
    content: napasString,
  };
}

function buildNapasString(orderId: number, amount: number): string {
  const beneficiary = config.ocbAccountNumber;
  const ref = `DH${orderId}`;
  return `${beneficiary}|${amount}|${ref}`;
}

export function generateStaticQR(): string {
  return `https://api.vietqr.io/image/${config.ocbAccountNumber}-compact2.jpg`;
}
```

- [ ] **Step 2: Create src/lib/distance.ts**

```typescript
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function getDeliveryFee(km: number): number | null {
  if (km <= 4) return 15000;
  if (km <= 6) return 25000;
  if (km <= 8) return 38000;
  return null; // out of range
}
```

- [ ] **Step 3: Create src/lib/order-format.ts**

```typescript
import { Order } from '../types';
import { getItemById } from '../data/menu';
import { config } from '../config';

export function formatOrderForStaff(order: Order): string {
  const items: { name: string; qty: number }[] = JSON.parse(order.items);
  const lang = 'vn'; // Staff sees Vietnamese with English in parentheses

  let text = `🆕 ĐƠN HÀNG MỚI (NEW ORDER) #${order.id}\n`;
  text += `─────────────────────\n`;

  if (order.mode === 'dine-in') {
    text += `📍 Bàn (Table) ${order.tableNumber || '?'} — Tại quán (Dine-in)\n`;
  } else if (order.mode === 'pickup') {
    text += `🛍️ Mang đi (Pickup)\n`;
  } else {
    text += `🚚 Giao hàng (Delivery)\n`;
    text += `📍 ${order.deliveryAddress}\n`;
    text += `📞 ${order.customerPhone}\n`;
    if (order.deliveryFee > 0) {
      text += `💰 Phí ship (Delivery fee): ${order.deliveryFee / 1000}k\n`;
    }
  }

  text += `─────────────────────\n`;

  for (const item of items) {
    const menuItem = getItemById(item.name);
    if (menuItem) {
      text += `${menuItem.vietnamese} (${menuItem.english}) x${item.qty} — ${menuItem.price / 1000}k\n`;
    } else {
      text += `${item.name} x${item.qty}\n`;
    }
  }

  text += `─────────────────────\n`;
  text += `💰 Tổng cộng (Total): ${order.total / 1000}k\n`;

  if (order.paymentMethod === 'qr') {
    text += `💳 QR — Đã thanh toán (Paid)\n`;
  } else {
    text += `💵 Tiền mặt — Chưa thanh toán (Unpaid)\n`;
  }

  text += `─────────────────────\n`;
  text += `⏰ ${order.createdAt}\n`;
  text += `👤 ${order.customerName} | 📞 ${order.customerPhone}\n`;

  return text;
}
```

Wait, I need to fix the `formatOrderForStaff` function. The items in the order are stored as CartItem[] which have `menuItemId`, not `name`. Let me fix that.

- [ ] **Step 3 (corrected): Create src/lib/order-format.ts**

```typescript
import { Order, CartItem } from '../types';
import { getItemById } from '../data/menu';

export function formatOrderForStaff(order: Order): string {
  const cartItems: CartItem[] = JSON.parse(order.items);

  let text = `🆕 ĐƠN HÀNG MỚI (NEW ORDER) #${order.id}\n`;
  text += `─────────────────────\n`;

  if (order.mode === 'dine-in') {
    text += `📍 Bàn (Table) ${order.tableNumber || '?'} — Tại quán (Dine-in)\n`;
  } else if (order.mode === 'pickup') {
    text += `🛍️ Mang đi (Pickup)\n`;
  } else {
    text += `🚚 Giao hàng (Delivery)\n`;
    text += `📍 ${order.deliveryAddress}\n`;
    text += `📞 ${order.customerPhone}\n`;
    if (order.deliveryFee > 0) {
      text += `💵 Phí ship (Delivery fee): ${order.deliveryFee / 1000}k\n`;
    }
  }

  text += `─────────────────────\n`;

  for (const ci of cartItems) {
    const menuItem = getItemById(ci.menuItemId);
    if (menuItem) {
      text += `${menuItem.vietnamese} (${menuItem.english}) x${ci.quantity} — ${menuItem.price / 1000}k\n`;
    }
  }

  text += `─────────────────────\n`;
  text += `💰 Tổng cộng (Total): ${order.total / 1000}k\n`;

  if (order.paymentMethod === 'qr') {
    text += `💳 QR — Đã thanh toán (Paid)\n`;
  } else {
    text += `💵 Tiền mặt — Chưa thanh toán (Unpaid)\n`;
  }

  text += `─────────────────────\n`;
  text += `⏰ ${order.createdAt}\n`;
  text += `👤 ${order.customerName} | 📞 ${order.customerPhone}\n`;

  return text;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/
git commit -m "feat: add VietQR generator, distance calc, staff order formatter"
```

---

### Task 6: Staff notifications

**Files:**
- Create: `src/staff/notify.ts`

- [ ] **Step 1: Create src/staff/notify.ts**

```typescript
import { Bot } from 'grammy';
import { config } from '../config';
import { formatOrderForStaff } from '../lib/order-format';
import { Order } from '../types';

export async function notifyStaff(bot: Bot, order: Order): Promise<void> {
  if (!config.staffChatId) {
    console.warn('STAFF_CHAT_ID not configured — skipping staff notification');
    return;
  }

  const message = formatOrderForStaff(order);

  try {
    await bot.api.sendMessage(config.staffChatId, message);
  } catch (err) {
    console.error('Failed to notify staff:', err);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/staff/
git commit -m "feat: add staff notification via Telegram chat"
```

---

### Task 7: Bot handlers — start, language, mode selection

**Files:**
- Create: `src/bot/context.ts`
- Create: `src/bot/handlers/start.ts`
- Create: `src/bot/handlers/language.ts`
- Create: `src/bot/keyboards.ts`

- [ ] **Step 1: Create src/bot/context.ts**

```typescript
import { Context, SessionFlavor, session } from 'grammy';
import { Language, OrderMode, CartItem } from '../types';

export interface SessionData {
  language: Language;
  mode: OrderMode | null;
  tableNumber: string | null;
  cart: CartItem[];
  step: 'idle' | 'choosing_mode' | 'choosing_language' | 'browsing' | 'in_cart' | 'checkout_name' | 'checkout_phone' | 'checkout_address' | 'checkout_payment' | 'confirming';
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  deliveryFee: number;
  pendingOrderId: number | undefined;
  paymentMethod: 'qr' | 'cash' | undefined;
}

export type BotContext = Context & SessionFlavor<SessionData>;

export function initialSession(): SessionData {
  return {
    language: 'vn',
    mode: null,
    tableNumber: null,
    cart: [],
    step: 'idle',
  };
}
```

- [ ] **Step 2: Create src/bot/keyboards.ts**

```typescript
import { Keyboard, InlineKeyboard } from 'grammy';
import { Language, OrderMode, MenuCategory } from '../types';
import { CATEGORIES } from '../data/categories';
import { t } from '../locales';

export function modeKeyboard(lang: Language) {
  return new InlineKeyboard()
    .text(t('btn_dine_in', lang), 'mode_dine-in')
    .text(t('btn_pickup', lang), 'mode_pickup')
    .row()
    .text(t('btn_delivery', lang), 'mode_delivery');
}

export function languageKeyboard() {
  return new InlineKeyboard()
    .text('🇻🇳 Tiếng Việt', 'lang_vn')
    .text('🇬🇧 English', 'lang_en')
    .row()
    .text('🇷🇺 Русский', 'lang_ru');
}

export function categoryKeyboard(lang: Language, mode?: OrderMode | null) {
  const kb = new InlineKeyboard();
  const filtered = mode === 'delivery'
    ? CATEGORIES.filter(c => c.id !== 'combos')
    : CATEGORIES;
  for (const cat of filtered) {
    const name = cat[lang as keyof typeof cat] as string;
    kb.text(name, `cat_${cat.id}`).row();
  }
  kb.text(t('view_cart', lang), 'view_cart').row();
  return kb;
}

export function itemActionKeyboard(itemId: string, lang: Language) {
  return new InlineKeyboard()
    .text(t('add_to_cart', lang), `add_${itemId}`)
    .row()
    .text(t('back', lang), 'back_categories');
}

export function cartKeyboard(lang: Language) {
  return new InlineKeyboard()
    .text(t('proceed_checkout', lang), 'checkout')
    .text(t('clear_cart', lang), 'clear_cart')
    .row()
    .text(t('continue_shopping', lang), 'back_categories');
}

export function paymentKeyboard(lang: Language) {
  return new InlineKeyboard()
    .text(t('btn_qr', lang), 'pay_qr')
    .text(t('btn_cash', lang), 'pay_cash');
}

export function paymentConfirmKeyboard(lang: Language) {
  return new InlineKeyboard()
    .text(t('btn_i_paid', lang), 'confirm_paid')
    .row()
    .text(t('back', lang), 'back_payment');
}

export function confirmOrderKeyboard(lang: Language) {
  return new InlineKeyboard()
    .text(t('place_order', lang), 'confirm_order')
    .text(t('back', lang), 'back_cart');
}
```

- [ ] **Step 3: Create src/bot/handlers/start.ts**

```typescript
import { Bot } from 'grammy';
import { BotContext } from '../context';
import { modeKeyboard } from '../keyboards';
import { t } from '../../locales';

export function registerStartHandler(bot: Bot<BotContext>): void {
  bot.command('start', async (ctx) => {
    const raw = ctx.message?.text || '';
    // Check for deep link like ?start=table_5
    const match = raw.match(/\/start\s+table_(\d+)/i);
    if (match) {
      ctx.session.tableNumber = match[1];
      ctx.session.mode = 'dine-in';
    }
    ctx.session.cart = [];
    ctx.session.step = 'choosing_mode';

    if (ctx.session.tableNumber) {
      // Already dine-in from QR, skip mode selection, go to language
      ctx.session.mode = 'dine-in';
    }

    const reply = ctx.session.mode === 'dine-in'
      ? `🍽️ ${t('start_choose_mode', ctx.session.language)}\n📍 ${t('table', ctx.session.language)}: ${ctx.session.tableNumber}`
      : t('start_choose_mode', ctx.session.language);

    if (ctx.session.mode) {
      // Already in dine-in mode from QR — go straight to language
      await ctx.reply(t('choose_language', ctx.session.language), {
        reply_markup: languageKeyboard(),
      });
    } else {
      await ctx.reply(reply, {
        reply_markup: modeKeyboard(ctx.session.language),
      });
    }
  });

  // Handle mode selection callback
  bot.callbackQuery(/^mode_(.+)$/, async (ctx) => {
    const mode = ctx.match[1] as 'dine-in' | 'pickup' | 'delivery';
    ctx.session.mode = mode;
    ctx.session.step = 'choosing_language';
    await ctx.editMessageText(t('choose_language', ctx.session.language), {
      reply_markup: languageKeyboard(),
    });
    await ctx.answerCallbackQuery();
  });
}

import { languageKeyboard } from '../keyboards';
```

Note: the import of `languageKeyboard` should be at the top. Let me fix in the code:

- [ ] **Step 4 (full): Create src/bot/handlers/language.ts**

Actually, let me keep the language handler in a separate file and export it cleanly. The start handler should register the language callbacks too, since they need to be on the bot.

Let me simplify and put everything in `start.ts`:

- [ ] **Step 3 (corrected): Create src/bot/handlers/start.ts**

```typescript
import { Bot } from 'grammy';
import { BotContext } from '../context';
import { modeKeyboard, languageKeyboard, categoryKeyboard } from '../keyboards';
import { t } from '../../locales';
import { Language } from '../../types';

export function registerStartHandler(bot: Bot<BotContext>): void {
  bot.command('start', async (ctx) => {
    const raw = ctx.message?.text || '';
    const match = raw.match(/\/start\s+table_(\d+)/i);
    if (match) {
      ctx.session.tableNumber = match[1];
      ctx.session.mode = 'dine-in';
    }
    ctx.session.cart = [];
    ctx.session.step = 'choosing_mode';

    const reply = ctx.session.mode === 'dine-in'
      ? `🍽️ ${t('start_choose_mode', ctx.session.language)}`
      : t('start_choose_mode', ctx.session.language);

    if (ctx.session.mode) {
      await ctx.reply(t('choose_language', ctx.session.language), {
        reply_markup: languageKeyboard(),
      });
    } else {
      await ctx.reply(reply, {
        reply_markup: modeKeyboard(ctx.session.language),
      });
    }
  });

  bot.callbackQuery(/^mode_(.+)$/, async (ctx) => {
    const mode = ctx.match[1] as 'dine-in' | 'pickup' | 'delivery';
    ctx.session.mode = mode;
    ctx.session.step = 'choosing_language';
    await ctx.editMessageText(t('choose_language', ctx.session.language), {
      reply_markup: languageKeyboard(),
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^lang_(.+)$/, async (ctx) => {
    const lang = ctx.match[1] as Language;
    ctx.session.language = lang;
    ctx.session.step = 'browsing';
    const text = `${t('select_category', lang)}\n\n${ctx.session.tableNumber ? `📍 ${t('table', lang)}: ${ctx.session.tableNumber} | ${t('mode_dine_in', lang)}` : ''}`;
    await ctx.editMessageText(text, {
      reply_markup: categoryKeyboard(lang, ctx.session.mode),
    });
    await ctx.answerCallbackQuery();
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add src/bot/context.ts src/bot/keyboards.ts src/bot/handlers/start.ts
git commit -m "feat: add bot context, keyboards, start/language handlers"
```

---

### Task 8: Bot handlers — menu browsing and cart

**Files:**
- Create: `src/bot/handlers/menu.ts`
- Create: `src/bot/handlers/cart.ts`

- [ ] **Step 1: Create src/bot/handlers/menu.ts**

```typescript
import { Bot } from 'grammy';
import { BotContext } from '../context';
import { getItemsByCategory, getItemById, getItemName } from '../../data/menu';
import { itemActionKeyboard, categoryKeyboard } from '../keyboards';
import { t } from '../../locales';
import { MenuItem } from '../../types';

export function registerMenuHandlers(bot: Bot<BotContext>): void {
  bot.callbackQuery(/^cat_(.+)$/, async (ctx) => {
    const categoryId = ctx.match[1];
    const lang = ctx.session.language;
    const items = getItemsByCategory(categoryId);

    if (items.length === 0) {
      await ctx.answerCallbackQuery('No items in this category');
      return;
    }

    // Split items into chunks of 10 for display
    const chunks: MenuItem[][] = [];
    for (let i = 0; i < items.length; i += 10) {
      chunks.push(items.slice(i, i + 10));
    }

    let chunkIndex = 0;

    const buildMessage = (chunk: MenuItem[]) => {
      let text = `${t('items_in', lang)} ${categoryId}:\n\n`;
      for (const item of chunk) {
        const name = getItemName(item, lang);
        text += `• ${name} — ${item.price / 1000}${config.currency}\n`;
      }
      return text;
    };

    // Show first chunk with navigation
    const chunk = chunks[0];
    const kb = itemActionKeyboard(chunk[0].id, lang);
    // Add pagination if needed
    if (chunks.length > 1) {
      kb.row().text('▶️ Next', `page_${categoryId}_${chunkIndex + 1}`);
    }
    kb.row().text(t('back', lang), 'back_categories');

    await ctx.editMessageText(buildMessage(chunk), { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^add_(.+)$/, async (ctx) => {
    const itemId = ctx.match[1];
    const lang = ctx.session.language;
    const item = getItemById(itemId);

    if (!item) {
      await ctx.answerCallbackQuery('Item not found');
      return;
    }

    const existing = ctx.session.cart.find(c => c.menuItemId === itemId);
    if (existing) {
      existing.quantity++;
    } else {
      ctx.session.cart.push({ menuItemId: itemId, quantity: 1 });
    }

    await ctx.answerCallbackQuery(t('added_to_cart', lang));
  });

  bot.callbackQuery('back_categories', async (ctx) => {
    const lang = ctx.session.language;
    await ctx.editMessageText(t('select_category', lang), {
      reply_markup: categoryKeyboard(lang, ctx.session.mode),
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^page_(.+)_(\d+)$/, async (ctx) => {
    const categoryId = ctx.match[1];
    const page = parseInt(ctx.match[2]);
    const lang = ctx.session.language;
    const items = getItemsByCategory(categoryId);
    const chunks: MenuItem[][] = [];
    for (let i = 0; i < items.length; i += 10) {
      chunks.push(items.slice(i, i + 10));
    }

    if (page >= chunks.length) {
      await ctx.answerCallbackQuery('No more items');
      return;
    }

    const chunk = chunks[page];
    let text = `${t('items_in', lang)}:\n\n`;
    for (const item of chunk) {
      const name = getItemName(item, lang);
      text += `• ${name} — ${item.price / 1000}${config.currency}\n`;
    }

    const kb = itemActionKeyboard(chunk[0].id, lang);
    if (page > 0) {
      kb.text('◀️', `page_${categoryId}_${page - 1}`);
    }
    if (page < chunks.length - 1) {
      kb.text('▶️', `page_${categoryId}_${page + 1}`);
    }
    kb.row().text(t('back', lang), 'back_categories');

    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });
}

import { config } from '../../config';
```

- [ ] **Step 2: Create src/bot/handlers/cart.ts**

```typescript
import { Bot } from 'grammy';
import { BotContext } from '../context';
import { getItemById, getItemName } from '../../data/menu';
import { cartKeyboard } from '../keyboards';
import { t } from '../../locales';
import { config } from '../../config';

export function registerCartHandlers(bot: Bot<BotContext>): void {
  bot.callbackQuery('view_cart', async (ctx) => {
    const lang = ctx.session.language;
    const cart = ctx.session.cart;

    if (cart.length === 0) {
      await ctx.answerCallbackQuery(t('cart_empty', lang));
      return;
    }

    const text = buildCartText(cart, lang, 0);
    await ctx.editMessageText(text, {
      reply_markup: cartKeyboard(lang),
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('clear_cart', async (ctx) => {
    ctx.session.cart = [];
    const lang = ctx.session.language;
    await ctx.editMessageText(t('cart_empty', lang), {
      reply_markup: cartKeyboard(lang),
    });
    await ctx.answerCallbackQuery();
  });
}

export function buildCartText(cart: { menuItemId: string; quantity: number }[], lang: string, deliveryFee: number = 0): string {
  let text = `🛒 ${t('cart_title', lang)}\n\n`;
  let subtotal = 0;

  for (const ci of cart) {
    const item = getItemById(ci.menuItemId);
    if (item) {
      const name = getItemName(item, lang);
      const lineTotal = item.price * ci.quantity;
      subtotal += lineTotal;
      text += `${name} x${ci.quantity} — ${lineTotal / 1000}${config.currency}\n`;
    }
  }

  text += `\n${t('total', lang)}: ${subtotal / 1000}${config.currency}\n`;
  if (deliveryFee > 0) {
    text += `${t('delivery_fee', lang)}: ${deliveryFee / 1000}${config.currency}\n`;
    text += `${t('grand_total', lang)}: ${(subtotal + deliveryFee) / 1000}${config.currency}\n`;
  }

  return text;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/bot/handlers/menu.ts src/bot/handlers/cart.ts
git commit -m "feat: add menu browsing and cart handlers"
```

---

### Task 9: Bot handlers — checkout flow

**Files:**
- Create: `src/bot/handlers/checkout.ts`
- Create: `src/bot/handlers/payment.ts`

- [ ] **Step 1: Create src/bot/handlers/checkout.ts**

```typescript
import { Bot } from 'grammy';
import { BotContext } from '../context';
import { t } from '../../locales';
import { paymentKeyboard, confirmOrderKeyboard } from '../keyboards';
import { config } from '../../config';
import { getDeliveryFee, haversineDistance } from '../../lib/distance';
import { buildCartText } from './cart';

export function registerCheckoutHandlers(bot: Bot<BotContext>): void {
  bot.callbackQuery('checkout', async (ctx) => {
    const lang = ctx.session.language;
    const cart = ctx.session.cart;

    if (cart.length === 0) {
      await ctx.answerCallbackQuery(t('cart_empty', lang));
      return;
    }

    if (ctx.session.mode === 'delivery') {
      ctx.session.step = 'checkout_name';
      await ctx.reply(t('enter_name', lang));
    } else if (ctx.session.mode === 'pickup') {
      ctx.session.step = 'checkout_name';
      await ctx.reply(t('enter_name', lang));
    } else {
      // Dine-in: no name needed, go straight to payment
      ctx.session.step = 'checkout_payment';
      const text = buildCartText(cart, lang, 0);
      await ctx.editMessageText(`${text}\n\n${t('choose_payment', lang)}`, {
        reply_markup: paymentKeyboard(lang),
      });
    }
    await ctx.answerCallbackQuery();
  });

  // Collect customer name
  bot.on('message:text', async (ctx) => {
    if (ctx.session.step === 'checkout_name') {
      ctx.session.customerName = ctx.message.text;
      ctx.session.step = 'checkout_phone';
      await ctx.reply(t('enter_phone', ctx.session.language));
      return;
    }

    if (ctx.session.step === 'checkout_phone') {
      ctx.session.customerPhone = ctx.message.text;
      if (ctx.session.mode === 'delivery') {
        ctx.session.step = 'checkout_address';
        await ctx.reply(t('enter_address', ctx.session.language), {
          reply_markup: {
            keyboard: [[{ text: t('share_location', ctx.session.language), request_location: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
      } else {
        // Pickup: skip address, go to payment
        ctx.session.step = 'checkout_payment';
        const cart = ctx.session.cart;
        const text = buildCartText(cart, ctx.session.language, 0);
        await ctx.reply(`${text}\n\n${t('choose_payment', ctx.session.language)}`, {
          reply_markup: paymentKeyboard(ctx.session.language),
        });
      }
      return;
    }

    if (ctx.session.step === 'checkout_address') {
      ctx.session.deliveryAddress = ctx.message.text;
      await processDeliveryAddress(ctx);
      return;
    }
  });

  // Handle location sharing
  bot.on('message:location', async (ctx) => {
    if (ctx.session.step === 'checkout_address') {
      const loc = ctx.message.location;
      ctx.session.deliveryLat = loc.latitude;
      ctx.session.deliveryLng = loc.longitude;
      ctx.session.deliveryAddress = `${loc.latitude}, ${loc.longitude}`;
      await processDeliveryAddress(ctx);
    }
  });
}

async function processDeliveryAddress(ctx: BotContext): Promise<void> {
  const lang = ctx.session.language;
  const shop = config.shop;

  if (ctx.session.deliveryLat && ctx.session.deliveryLng) {
    const km = haversineDistance(shop.lat, shop.lng, ctx.session.deliveryLat, ctx.session.deliveryLng);
    const fee = getDeliveryFee(km);

    if (fee === null) {
      await ctx.reply(t('distance_too_far', lang, { max: config.delivery.maxRadius }));
      ctx.session.step = 'checkout_address';
      return;
    }

    ctx.session.deliveryFee = fee;
    await ctx.reply(t('distance_check', lang, { km: km.toFixed(1), fee: fee / 1000 }));
  } else {
    ctx.session.deliveryFee = config.delivery.feeWithin4km;
  }

  ctx.session.step = 'checkout_payment';
  const cart = ctx.session.cart;
  const text = buildCartText(cart, lang, ctx.session.deliveryFee);
  await ctx.reply(`${text}\n\n${t('choose_payment', lang)}`, {
    reply_markup: paymentKeyboard(lang),
  });
}
```

- [ ] **Step 2: Create src/bot/handlers/payment.ts**

```typescript
import { Bot } from 'grammy';
import { BotContext } from '../context';
import { t } from '../../locales';
import { paymentConfirmKeyboard } from '../keyboards';
import { generateVietQR } from '../../lib/vietqr';
import { createOrder } from '../../db/orders';
import { notifyStaff } from '../../staff/notify';
import { config } from '../../config';

export function registerPaymentHandlers(bot: Bot<BotContext>): void {
  bot.callbackQuery('pay_qr', async (ctx) => {
    const lang = ctx.session.language;
    ctx.session.paymentMethod = 'qr';
    // Create order in "created" status
    const cart = ctx.session.cart;
    const subtotal = cart.reduce((sum, ci) => {
      const item = items.find(i => i.id === ci.menuItemId);
      return sum + (item?.price || 0) * ci.quantity;
    }, 0);
    const total = subtotal + (ctx.session.deliveryFee || 0);

    const order = createOrder({
      chatId: ctx.chat!.id,
      tableNumber: ctx.session.tableNumber,
      mode: ctx.session.mode || 'dine-in',
      items: cart,
      total,
      deliveryFee: ctx.session.deliveryFee || 0,
      paymentMethod: 'qr',
      customerName: ctx.session.customerName || '',
      customerPhone: ctx.session.customerPhone || '',
      deliveryAddress: ctx.session.deliveryAddress || '',
      deliveryLat: ctx.session.deliveryLat || null,
      deliveryLng: ctx.session.deliveryLng || null,
      language: lang,
    });

    ctx.session.pendingOrderId = order.id;

    const qr = generateVietQR(order.id, total);

    await ctx.editMessageText(t('payment_qr_info', lang, { amount: total / 1000 }), {
      reply_markup: paymentConfirmKeyboard(lang),
    });

    // Send QR image
    await ctx.replyWithPhoto(qr.imageUrl, {
      caption: t('payment_qr_waiting', lang),
    });

    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('pay_cash', async (ctx) => {
    const lang = ctx.session.language;
    ctx.session.paymentMethod = 'cash';
    await ctx.editMessageText(t('payment_cash_info', lang), {
      reply_markup: confirmOrderKeyboard(lang),
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('confirm_paid', async (ctx) => {
    const lang = ctx.session.language;
    const orderId = ctx.session.pendingOrderId;
    if (!orderId) return;

    const order = dbGetOrder(orderId);
    if (order) {
      updateOrderStatus(orderId, 'paid');
      order.status = 'paid';
      await notifyStaff(ctx.api as any, order);
    }

    ctx.session.cart = [];
    ctx.session.pendingOrderId = undefined;

    const msg = ctx.session.mode === 'delivery'
      ? t('order_delivery_msg', lang, { id: orderId })
      : ctx.session.mode === 'pickup'
      ? t('order_pickup_msg', lang, { id: orderId })
      : t('order_dinein_msg', lang, { id: orderId, table: ctx.session.tableNumber || '?' });

    await ctx.reply(msg);
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('confirm_order', async (ctx) => {
    const lang = ctx.session.language;
    const cart = ctx.session.cart;
    const subtotal = cart.reduce((sum, ci) => {
      const item = items.find(i => i.id === ci.menuItemId);
      return sum + (item?.price || 0) * ci.quantity;
    }, 0);
    const total = subtotal + (ctx.session.deliveryFee || 0);

    const order = createOrder({
      chatId: ctx.chat!.id,
      tableNumber: ctx.session.tableNumber,
      mode: ctx.session.mode || 'dine-in',
      items: cart,
      total,
      deliveryFee: ctx.session.deliveryFee || 0,
      paymentMethod: 'cash',
      customerName: ctx.session.customerName || '',
      customerPhone: ctx.session.customerPhone || '',
      deliveryAddress: ctx.session.deliveryAddress || '',
      deliveryLat: ctx.session.deliveryLat || null,
      deliveryLng: ctx.session.deliveryLng || null,
      language: lang,
    });

    await notifyStaff(ctx.api as any, order);

    ctx.session.cart = [];

    const msg = ctx.session.mode === 'delivery'
      ? t('order_delivery_msg', lang, { id: order.id })
      : ctx.session.mode === 'pickup'
      ? t('order_pickup_msg', lang, { id: order.id })
      : t('order_dinein_msg', lang, { id: order.id, table: ctx.session.tableNumber || '?' });

    await ctx.reply(msg);
    await ctx.answerCallbackQuery();
  });
}
```

Wait, I see issues with the payment handler. Let me clean it up — `items` is not imported, and we reference `dbGetOrder` / `updateOrderStatus` without imports. Also `ctx.api as any` is not correct. In grammy, `ctx.api` is the bot API instance, so we can pass the bot itself. Let me fix the payment handler properly.

- [ ] **Step 2 (corrected): Create src/bot/handlers/payment.ts**

```typescript
import { Bot } from 'grammy';
import { BotContext } from '../context';
import { t } from '../../locales';
import { paymentConfirmKeyboard, confirmOrderKeyboard } from '../keyboards';
import { generateVietQR } from '../../lib/vietqr';
import { createOrder, getOrderById, updateOrderStatus } from '../../db/orders';
import { notifyStaff } from '../../staff/notify';
import { INITIAL_MENU_ITEMS } from '../../data/menu';

export function registerPaymentHandlers(bot: Bot<BotContext>): void {
  bot.callbackQuery('pay_qr', async (ctx) => {
    const lang = ctx.session.language;
    const cart = ctx.session.cart;
    const subtotal = cart.reduce((sum, ci) => {
      const item = INITIAL_MENU_ITEMS.find(i => i.id === ci.menuItemId);
      return sum + (item?.price || 0) * ci.quantity;
    }, 0);
    const total = subtotal + (ctx.session.deliveryFee || 0);

    const order = createOrder({
      chatId: ctx.chat!.id,
      tableNumber: ctx.session.tableNumber,
      mode: ctx.session.mode || 'dine-in',
      items: cart,
      total,
      deliveryFee: ctx.session.deliveryFee || 0,
      paymentMethod: 'qr',
      customerName: ctx.session.customerName || '',
      customerPhone: ctx.session.customerPhone || '',
      deliveryAddress: ctx.session.deliveryAddress || '',
      deliveryLat: ctx.session.deliveryLat || null,
      deliveryLng: ctx.session.deliveryLng || null,
      language: lang,
    });

    ctx.session.pendingOrderId = order.id;

    const qr = generateVietQR(order.id, total);

    await ctx.editMessageText(t('payment_qr_info', lang, { amount: total / 1000 }), {
      reply_markup: paymentConfirmKeyboard(lang),
    });

    await ctx.replyWithPhoto(qr.imageUrl, {
      caption: t('payment_qr_waiting', lang),
    });

    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('pay_cash', async (ctx) => {
    const lang = ctx.session.language;
    await ctx.editMessageText(t('payment_cash_info', lang), {
      reply_markup: confirmOrderKeyboard(lang),
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('confirm_paid', async (ctx) => {
    const lang = ctx.session.language;
    const orderId = ctx.session.pendingOrderId;
    if (!orderId) return;

    updateOrderStatus(orderId, 'paid');
    const order = getOrderById(orderId);
    if (order) {
      await notifyStaff(bot, order);
    }

    ctx.session.cart = [];
    ctx.session.pendingOrderId = undefined;

    const msg = ctx.session.mode === 'delivery'
      ? t('order_delivery_msg', lang, { id: orderId })
      : ctx.session.mode === 'pickup'
      ? t('order_pickup_msg', lang, { id: orderId })
      : t('order_dinein_msg', lang, { id: orderId, table: ctx.session.tableNumber || '?' });

    await ctx.reply(msg, { reply_markup: { remove_keyboard: true } });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('confirm_order', async (ctx) => {
    const lang = ctx.session.language;
    const cart = ctx.session.cart;
    const subtotal = cart.reduce((sum, ci) => {
      const item = INITIAL_MENU_ITEMS.find(i => i.id === ci.menuItemId);
      return sum + (item?.price || 0) * ci.quantity;
    }, 0);
    const total = subtotal + (ctx.session.deliveryFee || 0);

    const order = createOrder({
      chatId: ctx.chat!.id,
      tableNumber: ctx.session.tableNumber,
      mode: ctx.session.mode || 'dine-in',
      items: cart,
      total,
      deliveryFee: ctx.session.deliveryFee || 0,
      paymentMethod: 'cash',
      customerName: ctx.session.customerName || '',
      customerPhone: ctx.session.customerPhone || '',
      deliveryAddress: ctx.session.deliveryAddress || '',
      deliveryLat: ctx.session.deliveryLat || null,
      deliveryLng: ctx.session.deliveryLng || null,
      language: lang,
    });

    await notifyStaff(bot, order);

    ctx.session.cart = [];

    const msg = ctx.session.mode === 'delivery'
      ? t('order_delivery_msg', lang, { id: order.id })
      : ctx.session.mode === 'pickup'
      ? t('order_pickup_msg', lang, { id: order.id })
      : t('order_dinein_msg', lang, { id: order.id, table: ctx.session.tableNumber || '?' });

    await ctx.reply(msg, { reply_markup: { remove_keyboard: true } });
    await ctx.answerCallbackQuery();
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/bot/handlers/checkout.ts src/bot/handlers/payment.ts
git commit -m "feat: add checkout and payment handlers"
```

---

### Task 10: Bot initialization and main entry point

**Files:**
- Create: `src/bot/index.ts`
- Create: `src/index.ts`

- [ ] **Step 1: Create src/bot/index.ts**

```typescript
import { Bot, session } from 'grammy';
import { BotContext, initialSession } from './context';
import { config } from '../config';
import { registerStartHandler } from './handlers/start';
import { registerMenuHandlers } from './handlers/menu';
import { registerCartHandlers } from './handlers/cart';
import { registerCheckoutHandlers } from './handlers/checkout';
import { registerPaymentHandlers } from './handlers/payment';

export function createBot(): Bot<BotContext> {
  const bot = new Bot<BotContext>(config.botToken);

  bot.use(session({ initial: initialSession }));

  registerStartHandler(bot);
  registerMenuHandlers(bot);
  registerCartHandlers(bot);
  registerCheckoutHandlers(bot);
  registerPaymentHandlers(bot);

  return bot;
}
```

- [ ] **Step 2: Create src/index.ts**

```typescript
import { createBot } from './bot';
import { getDb } from './db/schema';

// Initialize database
getDb();

// Create and start bot
const bot = createBot();

bot.start({
  onStart: (info) => {
    console.log(`🤖 Little Dalat Bot started as @${info.username}`);
    console.log(`📍 Shop: ${config.shop.address}`);
    console.log(`📍 Delivery radius: ${config.delivery.maxRadius}km`);
  },
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop());
process.once('SIGTERM', () => bot.stop());

import { config } from './config';
```

- [ ] **Step 3: Update package.json scripts**

In `package.json`, add:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

- [ ] **Step 4: Create .gitignore**

```
node_modules/
dist/
.env
data/
```

- [ ] **Step 5: Commit**

```bash
git add src/bot/index.ts src/index.ts .gitignore
git commit -m "feat: add bot initialization and main entry point"
```

---

### Self-Review

Check spec coverage:
- All 3 ordering modes: ✅ Tasks 7-9
- Multilingual: ✅ Task 2 (locales) + Task 3 (menu)
- VietQR payment: ✅ Task 5 (vietqr) + Task 9 (payment)
- Cash payment: ✅ Task 9 (cash flow)
- Delivery fee (15k/25k): ✅ Task 5 (distance) + Task 9 (checkout)
- Distance check: ✅ Task 5 (haversine) + Task 9 (checkout_address)
- Staff notifications (bilingual VN/EN): ✅ Task 5 (order-format) + Task 6 (notify)
- Combos hidden for delivery: ✅ Task 7 (categoryKeyboard filters)
- Menu from existing project: ✅ Task 3
- Deep link QR (table_XX): ✅ Task 7 (start handler)
- Pickup name/phone: ✅ Task 9 (checkout handlers)
- Future website API: Express placeholder not yet created - skip for now, YAGNI
