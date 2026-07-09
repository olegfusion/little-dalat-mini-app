import { MenuItem } from '../types';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // COFFEE & COCOA
  { id: 'cc-1', category: 'coffee_cocoa', vietnamese: 'Cà phê đen', english: 'Vietnamese Black Coffee', russian: 'Черный вьетнамский кофе', price: 30000 },
  { id: 'cc-2', category: 'coffee_cocoa', vietnamese: 'Cà phê sữa', english: 'Vietnamese Coffee with Condensed Milk', russian: 'Вьетнамский кофе со сгущенным молоком', price: 35000 },
  { id: 'cc-3', category: 'coffee_cocoa', vietnamese: 'Cà phê kem (Muối/Trứng/Tiramisu)', english: 'Cream Coffee (Salted / Egg / Tiramisu)', russian: 'Кофе с кремом (соленый / яичный / тирамису)', price: 40000, variants: { vn: ['Muối', 'Trứng', 'Tiramisu'], en: ['Salted', 'Egg', 'Tiramisu'], ru: ['Соленый', 'Яичный', 'Тирамису'] } },
  { id: 'cc-4', category: 'coffee_cocoa', vietnamese: 'Cà phê kem 1983', english: '1983 Signature Cream Coffee', russian: 'Фирменный кофе с кремом 1983', price: 40000 },
  { id: 'cc-5', category: 'coffee_cocoa', vietnamese: 'Sữa tươi cà phê sương sáo', english: 'Fresh Milk Coffee with Grass Jelly', russian: 'Кофе с молоком и травяным желе', price: 40000 },
  { id: 'cc-7', category: 'coffee_cocoa', vietnamese: 'Ca cao sữa đá / nóng', english: 'Iced / Hot Cocoa with Milk', russian: 'Какао с молоком, холодный / горячий', price: 35000 },
  { id: 'cc-8', category: 'coffee_cocoa', vietnamese: 'Ca cao kem (Muối/Trứng/Tiramisu)', english: 'Cocoa Cream (Salted / Egg / Tiramisu)', russian: 'Какао с кремом (соленый / яичный / тирамису)', price: 40000, variants: { vn: ['Muối', 'Trứng', 'Tiramisu'], en: ['Salted', 'Egg', 'Tiramisu'], ru: ['Соленый', 'Яичный', 'Тирамису'] } },
  { id: 'cc-9', category: 'coffee_cocoa', vietnamese: 'Bạc xỉu đá / nóng', english: 'Iced / Hot Bạc Xỉu (Vietnamese White Coffee)', russian: 'Бак Сиу (вьетнамский молочный кофе) — холодный / горячий', price: 35000, variants: { vn: ['Đá', 'Nóng'], en: ['Iced', 'Hot'], ru: ['Холодный', 'Горячий'] } },
  { id: 'cc-10', category: 'coffee_cocoa', vietnamese: 'Bạc xỉu xanh (Hoa đậu biếc)', english: 'Blue Butterfly Pea Bạc Xỉu', russian: 'Голубой Бак Сиу (с анчаном)', price: 40000 },
  // HOT TEA
  { id: 'ht-1', category: 'hot_tea', vietnamese: 'Trà ngủ ngon', english: 'Sleep Well Tea', russian: 'Чай для спокойного сна', price: 50000 },
  { id: 'ht-2', category: 'hot_tea', vietnamese: 'Trà hoa cúc', english: 'Chamomile Tea', russian: 'Ромашковый чай', price: 50000 },
  { id: 'ht-3', category: 'hot_tea', vietnamese: 'Trà hồng nụ', english: 'Rosebud Tea', russian: 'Чай из бутонов роз', price: 50000 },
  { id: 'ht-4', category: 'hot_tea', vietnamese: 'Trà sả gừng', english: 'Lemongrass Ginger Tea', russian: 'Имбирно-лемонграссовый чай', price: 50000 },
  { id: 'ht-5', category: 'hot_tea', vietnamese: 'Trà olong trái cây', english: 'Fruit Oolong Tea', russian: 'Фруктовый улун', price: 50000 },
  // BEST SELLERS
  { id: 'bs-1', category: 'best_sellers', vietnamese: 'Matcha Latte', english: 'Matcha Latte', russian: 'Матча латте', price: 40000 },
  { id: 'bs-2', category: 'best_sellers', vietnamese: 'Sữa tươi cà phê sương sáo', english: 'Fresh Milk Coffee with Grass Jelly', russian: 'Кофе с молоком и травяным желе', price: 40000 },
  { id: 'bs-5', category: 'best_sellers', vietnamese: 'Cà phê kem Muối / Tiramisu', english: 'Cream Coffee (Salted / Tiramisu)', russian: 'Кофе с кремом (соленый / тирамису)', price: 40000, variants: { vn: ['Muối', 'Tiramisu'], en: ['Salted', 'Tiramisu'], ru: ['Соленый', 'Тирамису'] } },
  // SPECIAL FLOWER TEA
  { id: 'sft-1', category: 'special_flower_tea', vietnamese: 'Trà mùa xuân', english: 'Spring Tea', russian: 'Весенний чай', price: 37000 },
  { id: 'sft-2', category: 'special_flower_tea', vietnamese: 'Trà dưỡng nhan', english: 'Herbal Beauty Tea', russian: 'Травяной чай для красоты', price: 37000 },
  { id: 'sft-3', category: 'special_flower_tea', vietnamese: 'Trà hoa đặc biệt', english: 'Signature Flower Tea', russian: 'Фирменный цветочный чай', price: 37000 },
  { id: 'sft-4', category: 'special_flower_tea', vietnamese: 'Trà atiso đỏ', english: 'Red Hibiscus Tea', russian: 'Красный каркаде', price: 37000 },
  { id: 'sft-5', category: 'special_flower_tea', vietnamese: 'Trà nhài kem cheese', english: 'Jasmine Tea with Cheese Cream', russian: 'Жасминовый чай с сырным кремом', price: 37000 },
  // OTHER DRINKS
  { id: 'od-1', category: 'other_drinks', vietnamese: 'Dừa tươi', english: 'Fresh Young Coconut', russian: 'Свежий молодой кокос', price: 35000 },
  { id: 'od-2', category: 'other_drinks', vietnamese: 'Sữa chua (Việt quất/Xoài/Dâu tây)', english: 'Yogurt (Blueberry/Mango/Strawberry)', russian: 'Йогурт (черника/манго/клубника)', price: 35000, variants: { vn: ['Việt quất', 'Xoài', 'Dâu tây'], en: ['Blueberry', 'Mango', 'Strawberry'], ru: ['Черника', 'Манго', 'Клубника'] } },
  { id: 'od-3', category: 'other_drinks', vietnamese: 'Bạc hà kem cheese', english: 'Mint Cheese Cream Drink', russian: 'Мятный напиток с сырной пенкой', price: 37000 },
  { id: 'od-4', category: 'other_drinks', vietnamese: 'Cam vắt hạt chia', english: 'Fresh Orange Juice with Chia Seeds', russian: 'Свежевыжатый апельсиновый сок с семенами чиа', price: 35000 },
  // FRUIT TEA
  { id: 'ft-1', category: 'fruit_tea', vietnamese: 'Trà trái cây nhiệt đới', english: 'Tropical Fruit Tea', russian: 'Тропический фруктовый чай', price: 45000 },
  { id: 'ft-3', category: 'fruit_tea', vietnamese: 'Trà dâu tằm', english: 'Mulberry Tea', russian: 'Шелковичный чай', price: 37000 },
  { id: 'ft-4', category: 'fruit_tea', vietnamese: 'Chanh dây hoàng kim', english: 'Golden Passion Fruit Tea', russian: 'Золотой чай из маракуйи', price: 37000 },
  { id: 'ft-5', category: 'fruit_tea', vietnamese: 'Trà dâu tây đậu biếc', english: 'Butterfly Pea Strawberry Tea', russian: 'Клубничный чай с анчаном', price: 40000 },
  { id: 'ft-6', category: 'fruit_tea', vietnamese: 'Trà đào', english: 'Peach Tea', russian: 'Персиковый чай', price: 37000 },
  { id: 'ft-7', category: 'fruit_tea', vietnamese: 'Trà đào cam sả', english: 'Peach Orange Lemongrass Tea', russian: 'Персиковый чай с апельсином и лемонграссом', price: 40000 },
  { id: 'ft-9', category: 'fruit_tea', vietnamese: 'Trà đào xoài đậu biếc', english: 'Butterfly Pea Peach Mango Tea', russian: 'Чай с персиком, манго и анчаном', price: 40000 },
  { id: 'ft-10', category: 'fruit_tea', vietnamese: 'Olong đào', english: 'Peach Oolong', russian: 'Персиковый улун', price: 37000 },
  { id: 'ft-11', category: 'fruit_tea', vietnamese: 'Olong ổi hồng', english: 'Pink Guava Oolong', russian: 'Улун с розовой гуавой', price: 37000 },
  { id: 'ft-12', category: 'fruit_tea', vietnamese: 'Olong nhài xí muội', english: 'Jasmine Oolong with Salted Plum', russian: 'Жасминовый улун с соленой сливой', price: 37000 },
  { id: 'ft-13', category: 'fruit_tea', vietnamese: 'Trà táo xanh bạc hà', english: 'Green Apple Mint Tea', russian: 'Чай с зеленым яблоком и мятой', price: 37000 },
  { id: 'ft-14', category: 'fruit_tea', vietnamese: 'Trà phúc bồn tử', english: 'Raspberry Tea', russian: 'Малиновый чай', price: 37000 },
  // DESSERTS & SNACKS
  { id: 'ds-2', category: 'desserts_snacks', vietnamese: 'Khô gà lá chanh', english: 'Dried Chicken with Lime Leaves', russian: 'Сушеная курица с листьями лайма', price: 35000 },
  { id: 'ds-3', category: 'desserts_snacks', vietnamese: 'Khoai lang sấy', english: 'Dried Sweet Potato', russian: 'Сушеный батат', price: 25000 },
  { id: 'ds-4', category: 'desserts_snacks', vietnamese: 'Bánh que chấm kem (Muối/Trứng/Tiramisu)', english: 'Cream Biscuit Sticks (Salted / Egg / Tiramisu)', russian: 'Бисквитные палочки с кремом (соленый / яичный / тирамису)', price: 25000, variants: { vn: ['Muối', 'Trứng', 'Tiramisu'], en: ['Salted', 'Egg', 'Tiramisu'], ru: ['Соленый', 'Яичный', 'Тирамису'] } },
  { id: 'ds-5', category: 'desserts_snacks', vietnamese: 'Snack', english: 'Snacks', russian: 'Снеки', price: 20000 },
  { id: 'ds-6', category: 'desserts_snacks', vietnamese: 'Hạt bí', english: 'Pumpkin Seeds', russian: 'Тыквенные семечки', price: 15000 },
  { id: 'ds-7', category: 'desserts_snacks', vietnamese: 'Hạt hướng dương', english: 'Sunflower Seeds', russian: 'Семечки подсолнуха', price: 12000 },
  // SIGNATURE
  { id: 'sg-1', category: 'signature', vietnamese: 'Little DaLat Coffee', english: 'Little DaLat Coffee', russian: 'Кофе Little DaLat', price: 45000 },
  { id: 'sg-2', category: 'signature', vietnamese: 'Hibiscus Đào Cam Sả', english: 'Hibiscus Peach Orange Lemongrass Tea', russian: 'Чай гибискус с персиком, апельсином и лемонграссом', price: 45000 },
  { id: 'sg-3', category: 'signature', vietnamese: 'Trà Sen Vàng Cao Nguyên', english: 'Highland Golden Lotus Tea', russian: 'Чай «Золотой лотос»', price: 45000 },
  { id: 'sg-4', category: 'signature', vietnamese: 'Matcha Mây Đà Lạt', english: 'Dalat Cloud Matcha', russian: 'Матча «Облако Далат»', price: 45000 },
];

export function getItemsByCategory(categoryId: string): MenuItem[] {
  return INITIAL_MENU_ITEMS.filter(item => item.category === categoryId);
}

export function getItemById(id: string): MenuItem | undefined {
  return INITIAL_MENU_ITEMS.find(item => item.id === id);
}

const LANG_FIELD: Record<string, string> = { vn: 'vietnamese', en: 'english', ru: 'russian' };

export function getItemName(item: MenuItem, lang: string): string {
  const field = LANG_FIELD[lang] || 'english';
  return (item as any)[field] as string || item.english;
}

const VARIANT_LANG_FIELD: Record<string, 'vn' | 'en' | 'ru'> = { vn: 'vn', en: 'en', ru: 'ru' };

export function getItemVariantName(item: MenuItem, lang: string, variantIndex: number): string {
  if (!item.variants) return '';
  const field = VARIANT_LANG_FIELD[lang] || 'en';
  return item.variants[field][variantIndex] || '';
}
