import { CategoryInfo, Language } from '../types';
import { getCategoryName } from '../i18n';
import { Coffee, Flame, Thermometer, Flower2, GlassWater, Apple, Cookie, Footprints } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  signature: <Flame className="w-6 h-6" />,
  coffee_cocoa: <Coffee className="w-6 h-6" />,
  hot_tea: <Thermometer className="w-6 h-6" />,
  special_flower_tea: <Flower2 className="w-6 h-6" />,
  other_drinks: <GlassWater className="w-6 h-6" />,
  fruit_tea: <Apple className="w-6 h-6" />,
  desserts_snacks: <Cookie className="w-6 h-6" />,
  combos: <Footprints className="w-6 h-6" />,
};

interface CategoryGridProps {
  categories: CategoryInfo[];
  language: Language;
  onSelect: (categoryId: string) => void;
}

export default function CategoryGrid({ categories, language, onSelect }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className="bg-white rounded-xl border border-[#C5B5A5]/30 p-4 text-left transition hover:border-[#5A2C11]/40 hover:shadow-sm active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-lg bg-[#F4EDE0] flex items-center justify-center text-[#5A2C11] mb-3">
            {CATEGORY_ICONS[cat.id] || <Coffee className="w-6 h-6" />}
          </div>
          <h3 className="font-bold text-sm text-[#261308] leading-tight">
            {getCategoryName(cat, language)}
          </h3>
        </button>
      ))}
    </div>
  );
}
