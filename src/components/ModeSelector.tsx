import { OrderMode, Language } from '../types';
import { UtensilsCrossed, ShoppingBag, Bike } from 'lucide-react';

interface ModeSelectorProps {
  language: Language;
  selected: OrderMode | null;
  onSelect: (mode: OrderMode) => void;
}

const MODES: { key: OrderMode; icon: React.ReactNode; labelVn: string; labelEn: string; labelRu: string; descVn: string; descEn: string; descRu: string }[] = [
  {
    key: 'dine-in',
    icon: <UtensilsCrossed className="w-6 h-6" />,
    labelVn: 'Tại quán', labelEn: 'Dine-in', labelRu: 'На месте',
    descVn: 'Ngồi lại và thưởng thức', descEn: 'Sit down and enjoy', descRu: 'Посидеть и насладиться',
  },
  {
    key: 'pickup',
    icon: <ShoppingBag className="w-6 h-6" />,
    labelVn: 'Mang đi', labelEn: 'Pickup', labelRu: 'С собой',
    descVn: 'Đặt trước, đến lấy', descEn: 'Order ahead, pick up', descRu: 'Заказать заранее, забрать',
  },
  {
    key: 'delivery',
    icon: <Bike className="w-6 h-6" />,
    labelVn: 'Giao hàng', labelEn: 'Delivery', labelRu: 'Доставка',
    descVn: 'Giao tận nơi trong 8km', descEn: 'Delivery within 8km', descRu: 'Доставка до 8км',
  },
];

export default function ModeSelector({ language, selected, onSelect }: ModeSelectorProps) {
  const label = (m: typeof MODES[0]) =>
    language === 'vn' ? m.labelVn : language === 'ru' ? m.labelRu : m.labelEn;
  const desc = (m: typeof MODES[0]) =>
    language === 'vn' ? m.descVn : language === 'ru' ? m.descRu : m.descEn;

  return (
    <div>
      {MODES.map(m => (
        <button
          key={m.key}
          onClick={() => onSelect(m.key)}
          className="w-full flex items-center gap-4 bg-white rounded-xl border border-[#C5B5A5]/20 p-4 mb-2 text-left transition hover:border-[#5A2C11]/40"
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selected === m.key ? 'bg-[#5A2C11] text-white' : 'bg-[#F4EDE0] text-[#5A2C11]'}`}>
            {m.icon}
          </div>
          <div>
            <p className="font-bold text-sm">{label(m)}</p>
            <p className="text-[10px] text-[#8B7355]">{desc(m)}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
