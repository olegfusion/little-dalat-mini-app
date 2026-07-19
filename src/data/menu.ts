import { MenuItem } from '../types';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // SIGNATURE
  { id: 'sg-5', category: 'signature', vietnamese: 'Cà phê kem 1893', english: '1893 Signature Cream Coffee', russian: 'Фирменный кофе с кремом 1893', price: 45000, photo: 'Ảnh Menu/SIGNATURE/Cà phê kem 1893.jpg', descriptions: { vn: 'Cà phê kem 1893 là thức uống đặc trưng của quán, kết hợp cà phê Việt Nam với hai loại kem béo mịn Tiramisu và kem Trứng theo công thức riêng. Hương vị cân bằng giữa vị cà phê đậm đà và lớp kem béo nhẹ, mang đến trải nghiệm độc đáo chỉ có tại Little DaLat Coffee & Tea.', en: '1893 Signature Cream Coffee is our signature drink, combining Vietnamese coffee with two smooth creams — Tiramisu and Egg Cream — made with our own recipe. The bold coffee and creamy layers create a balanced flavor found only at Little DaLat Coffee & Tea.', ru: 'Фирменный кофе 1893 — авторский напиток, сочетающий вьетнамский кофе с двумя видами нежного крема: тирамису и яичным, приготовленными по фирменному рецепту. Гармония насыщенного кофе и мягкого крема создаёт вкус, который можно попробовать только в Little DaLat Coffee & Tea.' } },
  { id: 'sg-2', category: 'signature', vietnamese: 'Hibiscus Đào Cam Sả', english: 'Hibiscus Peach Orange Lemongrass Tea', russian: 'Чай гибискус с персиком, апельсином и лемонграссом', price: 45000 },
  { id: 'sg-3', category: 'signature', vietnamese: 'Trà Sen Vàng Cao Nguyên', english: 'Highland Golden Lotus Tea', russian: 'Чай «Золотой лотос»', price: 45000 },
  { id: 'sg-4', category: 'signature', vietnamese: 'Matcha Mây Đà Lạt', english: 'Dalat Cloud Matcha', russian: 'Матча «Облако Далат»', price: 45000 },
  // COFFEE & COCOA
  { id: 'cc-1', category: 'coffee_cocoa', vietnamese: 'Cà phê đen', english: 'Vietnamese Black Coffee', russian: 'Черный вьетнамский кофе', price: 30000 },
  { id: 'cc-2', category: 'coffee_cocoa', vietnamese: 'Cà phê sữa', english: 'Vietnamese Coffee with Condensed Milk', russian: 'Вьетнамский кофе со сгущенным молоком', price: 35000 },
  { id: 'cc-3a', category: 'coffee_cocoa', vietnamese: 'Cà phê kem Muối', english: 'Salted Cream Coffee', russian: 'Кофе с солёным кремом', price: 45000 },
  { id: 'cc-3b', category: 'coffee_cocoa', vietnamese: 'Cà phê kem Trứng', english: 'Egg Cream Coffee', russian: 'Кофе с яичным кремом', price: 45000 },
  { id: 'cc-3c', category: 'coffee_cocoa', vietnamese: 'Cà phê kem Tiramisu', english: 'Tiramisu Cream Coffee', russian: 'Кофе с кремом тирамису', price: 45000 },
  { id: 'cc-5', category: 'coffee_cocoa', vietnamese: 'Sữa tươi cà phê sương sáo', english: 'Fresh Milk Coffee with Grass Jelly', russian: 'Кофе с молоком и травяным желе', price: 40000 },
  { id: 'cc-7', category: 'coffee_cocoa', vietnamese: 'Ca cao sữa đá / nóng', english: 'Iced / Hot Cocoa with Milk', russian: 'Какао с молоком, холодный / горячий', price: 35000, variants: { vn: ['Đá', 'Nóng'], en: ['Iced', 'Hot'], ru: ['Холодный', 'Горячий'] } },
  { id: 'cc-8', category: 'coffee_cocoa', vietnamese: 'Ca cao kem (Muối/Trứng/Tiramisu)', english: 'Cocoa Cream (Salted / Egg / Tiramisu)', russian: 'Какао с кремом (соленый / яичный / тирамису)', price: 45000, variants: { vn: ['Muối', 'Trứng', 'Tiramisu'], en: ['Salted', 'Egg', 'Tiramisu'], ru: ['Соленый', 'Яичный', 'Тирамису'] } },
  { id: 'cc-9', category: 'coffee_cocoa', vietnamese: 'Bạc xỉu đá / nóng', english: 'Iced / Hot Bạc Xỉu (Vietnamese White Coffee)', russian: 'Бак Сиу (вьетнамский молочный кофе) — холодный / горячий', price: 35000, variants: { vn: ['Đá', 'Nóng'], en: ['Iced', 'Hot'], ru: ['Холодный', 'Горячий'] } },
  { id: 'cc-10', category: 'coffee_cocoa', vietnamese: 'Bạc xỉu xanh (Hoa đậu biếc)', english: 'Blue Butterfly Pea Bạc Xỉu', russian: 'Голубой Бак Сиу (с анчаном)', price: 40000 },
  // HOT TEA
  { id: 'ht-1', category: 'hot_tea', vietnamese: 'Trà ngủ ngon', english: 'Sleep Well Tea', russian: 'Чай для спокойного сна', price: 50000 },
  { id: 'ht-2', category: 'hot_tea', vietnamese: 'Trà hoa cúc', english: 'Chamomile Tea', russian: 'Ромашковый чай', price: 50000 },
  { id: 'ht-3', category: 'hot_tea', vietnamese: 'Trà hồng nụ', english: 'Rosebud Tea', russian: 'Чай из бутонов роз', price: 50000 },
  { id: 'ht-4', category: 'hot_tea', vietnamese: 'Trà sả gừng', english: 'Lemongrass Ginger Tea', russian: 'Имбирно-лемонграссовый чай', price: 50000 },
  { id: 'ht-5', category: 'hot_tea', vietnamese: 'Trà olong trái cây', english: 'Fruit Oolong Tea', russian: 'Фруктовый улун', price: 50000 },
  // SPECIAL FLOWER TEA
  { id: 'sft-1', category: 'special_flower_tea', vietnamese: 'Trà mùa xuân', english: 'Spring Tea', russian: 'Весенний чай', price: 39000 },
  { id: 'sft-2', category: 'special_flower_tea', vietnamese: 'Trà dưỡng nhan', english: 'Herbal Beauty Tea', russian: 'Травяной чай для красоты', price: 39000 },
  { id: 'sft-3', category: 'special_flower_tea', vietnamese: 'Trà hoa đặc biệt', english: 'Signature Flower Tea', russian: 'Фирменный цветочный чай', price: 39000 },
  { id: 'sft-4', category: 'special_flower_tea', vietnamese: 'Trà atiso đỏ', english: 'Red Hibiscus Tea', russian: 'Красный каркаде', price: 39000 },
  { id: 'sft-5', category: 'special_flower_tea', vietnamese: 'Trà nhài kem cheese', english: 'Jasmine Tea with Cheese Cream', russian: 'Жасминовый чай с сырным кремом', price: 39000 },
  // OTHER DRINKS
  { id: 'od-1', category: 'other_drinks', vietnamese: 'Dừa tươi', english: 'Fresh Young Coconut', russian: 'Свежий молодой кокос', price: 35000 },
  { id: 'od-2', category: 'other_drinks', vietnamese: 'Sữa chua (Việt quất/Xoài/Dâu tây)', english: 'Yogurt (Blueberry/Mango/Strawberry)', russian: 'Йогурт (черника/манго/клубника)', price: 37000, variants: { vn: ['Việt quất', 'Xoài', 'Dâu tây'], en: ['Blueberry', 'Mango', 'Strawberry'], ru: ['Черника', 'Манго', 'Клубника'] } },
  { id: 'od-3', category: 'other_drinks', vietnamese: 'Bạc hà kem cheese', english: 'Mint Cheese Cream Drink', russian: 'Мятный напиток с сырной пенкой', price: 39000 },
  // FRESH JUICE
  { id: 'fj-1', category: 'juices', vietnamese: 'Nước ép Cam (ép lạnh)', english: 'Cold-Pressed Orange Juice', russian: 'Свежевыжатый апельсиновый сок холодного отжима', price: 40000 },
  { id: 'fj-2', category: 'juices', vietnamese: 'Nước ép Thơm (ép lạnh)', english: 'Cold-Pressed Pineapple Juice', russian: 'Свежевыжатый ананасовый сок холодного отжима', price: 40000 },
  { id: 'fj-3', category: 'juices', vietnamese: 'Nước ép Dưa hấu (ép lạnh)', english: 'Cold-Pressed Watermelon Juice', russian: 'Свежевыжатый арбузный сок холодного отжима', price: 40000 },
  { id: 'fj-4', category: 'juices', vietnamese: 'Nước ép Chanh dây (ép lạnh)', english: 'Cold-Pressed Passion Fruit Juice', russian: 'Свежевыжатый сок маракуйи холодного отжима', price: 40000 },
  { id: 'fj-5', category: 'juices', vietnamese: 'Nước ép Ổi (ép lạnh)', english: 'Cold-Pressed Guava Juice', russian: 'Свежевыжатый сок гуавы холодного отжима', price: 45000 },
  { id: 'fj-6', category: 'juices', vietnamese: 'Nước ép Táo (ép lạnh)', english: 'Cold-Pressed Apple Juice', russian: 'Свежевыжатый яблочный сок холодного отжима', price: 45000 },
  { id: 'sb-1', category: 'juices', vietnamese: 'Sunrise (Cam + Thơm ép lạnh)', english: 'Sunrise Cold-Pressed (Orange + Pineapple)', russian: 'Санрайз холодного отжима (Апельсин + Ананас)', price: 50000 },
  { id: 'sb-2', category: 'juices', vietnamese: 'Vitamin Boost (Cam + Cà rốt ép lạnh)', english: 'Vitamin Boost Cold-Pressed (Orange + Carrot)', russian: 'Витамин Буст холодного отжима (Апельсин + Морковь)', price: 50000 },
  { id: 'sb-3', category: 'juices', vietnamese: 'Golden (Ổi + Thơm ép lạnh)', english: 'Golden Cold-Pressed (Guava + Pineapple)', russian: 'Голден холодного отжима (Гуава + Ананас)', price: 50000 },
  { id: 'sb-4', category: 'juices', vietnamese: 'Fresh Day (Táo + Cam ép lạnh)', english: 'Fresh Day Cold-Pressed (Apple + Orange)', russian: 'Фреш Дей холодного отжима (Яблоко + Апельсин)', price: 50000 },
  { id: 'sb-5', category: 'juices', vietnamese: 'Tropical (Táo + Thơm ép lạnh)', english: 'Tropical Cold-Pressed (Apple + Pineapple)', russian: 'Тропикал холодного отжима (Яблоко + Ананас)', price: 50000 },
  // FRUIT TEA
  { id: 'ft-1', category: 'fruit_tea', vietnamese: 'Trà trái cây nhiệt đới', english: 'Tropical Fruit Tea', russian: 'Тропический фруктовый чай', price: 45000 },
  { id: 'ft-3', category: 'fruit_tea', vietnamese: 'Trà dâu tằm', english: 'Mulberry Tea', russian: 'Шелковичный чай', price: 39000 },
  { id: 'ft-4', category: 'fruit_tea', vietnamese: 'Chanh dây hoàng kim', english: 'Golden Passion Fruit Tea', russian: 'Золотой чай из маракуйи', price: 39000 },
  { id: 'ft-5', category: 'fruit_tea', vietnamese: 'Trà dâu tây đậu biếc', english: 'Butterfly Pea Strawberry Tea', russian: 'Клубничный чай с анчаном', price: 42000 },
  { id: 'ft-6', category: 'fruit_tea', vietnamese: 'Trà đào', english: 'Peach Tea', russian: 'Персиковый чай', price: 39000 },
  { id: 'ft-7', category: 'fruit_tea', vietnamese: 'Trà đào cam sả', english: 'Peach Orange Lemongrass Tea', russian: 'Персиковый чай с апельсином и лемонграссом', price: 42000 },
  { id: 'ft-9', category: 'fruit_tea', vietnamese: 'Trà đào xoài đậu biếc', english: 'Butterfly Pea Peach Mango Tea', russian: 'Чай с персиком, манго и анчаном', price: 42000 },
  { id: 'ft-10', category: 'fruit_tea', vietnamese: 'Olong đào', english: 'Peach Oolong', russian: 'Персиковый улун', price: 39000 },
  { id: 'ft-11', category: 'fruit_tea', vietnamese: 'Olong ổi hồng', english: 'Pink Guava Oolong', russian: 'Улун с розовой гуавой', price: 39000 },
  { id: 'ft-12', category: 'fruit_tea', vietnamese: 'Olong nhài xí muội', english: 'Jasmine Oolong with Salted Plum', russian: 'Жасминовый улун с соленой сливой', price: 39000 },
  { id: 'ft-13', category: 'fruit_tea', vietnamese: 'Trà táo xanh bạc hà', english: 'Green Apple Mint Tea', russian: 'Чай с зеленым яблоком и мятой', price: 39000 },
  { id: 'ft-14', category: 'fruit_tea', vietnamese: 'Trà phúc bồn tử', english: 'Raspberry Tea', russian: 'Малиновый чай', price: 39000 },
  // DESSERTS & SNACKS
  { id: 'ds-2', category: 'desserts_snacks', vietnamese: 'Khô gà lá chanh', english: 'Dried Chicken with Lime Leaves', russian: 'Сушеная курица с листьями лайма', price: 30000 },
  { id: 'ds-3', category: 'desserts_snacks', vietnamese: 'Khoai lang sấy', english: 'Dried Sweet Potato', russian: 'Сушеный батат', price: 25000 },
  { id: 'ds-4', category: 'desserts_snacks', vietnamese: 'Bánh que chấm kem (Muối/Trứng/Tiramisu)', english: 'Cream Biscuit Sticks (Salted / Egg / Tiramisu)', russian: 'Бисквитные палочки с кремом (соленый / яичный / тирамису)', price: 25000, variants: { vn: ['Muối', 'Trứng', 'Tiramisu'], en: ['Salted', 'Egg', 'Tiramisu'], ru: ['Соленый', 'Яичный', 'Тирамису'] } },
  { id: 'ds-5', category: 'desserts_snacks', vietnamese: 'Snack', english: 'Snacks', russian: 'Снеки', price: 20000 },
  { id: 'ds-6', category: 'desserts_snacks', vietnamese: 'Hạt bí', english: 'Pumpkin Seeds', russian: 'Тыквенные семечки', price: 15000 },
  { id: 'ds-7', category: 'desserts_snacks', vietnamese: 'Hạt hướng dương', english: 'Sunflower Seeds', russian: 'Семечки подсолнуха', price: 12000 },
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
