import { MenuItem, Language, CategoryInfo } from '../types';
import { getItemName, formatPrice, t } from '../i18n';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface MenuListProps {
  items: MenuItem[];
  category: CategoryInfo;
  language: Language;
  cartQuantities: Record<string, number>;
  onAdd: (item: MenuItem, variantIndex?: number) => void;
  onRemove: (item: MenuItem, variantIndex?: number) => void;
  onSelectVariant: (item: MenuItem) => void;
  selectedVariantItem: string | null;
  onVariantPick: (item: MenuItem, index: number) => void;
  onBackFromVariants: () => void;
}

export default function MenuList({
  items, category, language, cartQuantities, onAdd, onRemove,
  onSelectVariant, selectedVariantItem, onVariantPick, onBackFromVariants,
}: MenuListProps) {
  const { state } = useCart();
  const catName = (category as any)[language === 'vn' ? 'vietnamese' : language === 'ru' ? 'russian' : 'english'];
  const cartKey = (item: MenuItem, vi?: number) => `${item.id}_${vi ?? ''}`;

  const variantItem = selectedVariantItem
    ? items.find(i => i.id === selectedVariantItem)
    : null;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-black italic text-[#5A2C11]">{catName}</h2>
      </div>

      <div className="space-y-2">
        {items.map(item => {
          const key = cartKey(item);
          const qty = cartQuantities[key] || 0;
          const name = getItemName(item, language);
          const hasVariantInCart = item.variants && state.items.some(ci => ci.menuItemId === item.id);
          const isPickingVariant = item.variants && (selectedVariantItem === item.id || hasVariantInCart);

          return (
            <div key={item.id}>
              <div className="bg-white rounded-xl border border-[#C5B5A5]/20 p-3.5 flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-3">
                  <h3 className="font-bold text-sm text-[#261308]">{name}</h3>
                  <p className="text-[#9E3618] font-black text-sm mt-0.5">{formatPrice(item.price)}</p>
                  {item.variants && (
                    <p className="text-[10px] text-[#8B7355] mt-0.5">
                      {item.variants[language === 'vn' ? 'vn' : language === 'ru' ? 'ru' : 'en'].join(' / ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {qty > 0 ? (
                    <>
                      <button
                        onClick={() => onRemove(item)}
                        className="w-7 h-7 rounded-full border border-[#C5B5A5] flex items-center justify-center text-[#5A2C11] hover:bg-[#F4EDE0]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center font-bold text-sm">{qty}</span>
                    </>
                  ) : null}
                  {!isPickingVariant && (
                    <button
                      onClick={() => item.variants ? onSelectVariant(item) : onAdd(item)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                        qty > 0
                          ? 'bg-[#5A2C11] text-white'
                          : 'bg-[#F4EDE0] text-[#5A2C11] hover:bg-[#5A2C11] hover:text-white'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {isPickingVariant && item.variants && (
                <div className="bg-[#F4EDE0] rounded-xl p-4 mt-1 space-y-2">
                  <p className="text-xs font-bold text-[#5A2C11]">
                    {language === 'vn' ? 'Chọn phiên bản:' :
                     language === 'en' ? 'Choose variant:' :
                     'Выберите вариант:'}
                  </p>
                  {item.variants[language === 'vn' ? 'vn' : language === 'ru' ? 'ru' : 'en'].map((v, i) => {
                    const vKey = cartKey(item, i);
                    const vQty = cartQuantities[vKey] || 0;
                    return (
                      <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                        <span className="text-sm font-medium text-[#261308]">{v}</span>
                        <div className="flex items-center gap-2">
                          {vQty > 0 ? (
                            <>
                              <button
                                onClick={() => onRemove(item, i)}
                                className="w-7 h-7 rounded-full border border-[#C5B5A5] flex items-center justify-center text-[#5A2C11]"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-5 text-center font-bold text-sm">{vQty}</span>
                            </>
                          ) : null}
                          <button
                            onClick={() => onVariantPick(item, i)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                              vQty > 0 ? 'bg-[#5A2C11] text-white' : 'bg-white border border-[#5A2C11] text-[#5A2C11] hover:bg-[#5A2C11] hover:text-white'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <button onClick={onBackFromVariants} className="text-xs text-[#8B7355]">← {t('back', language)}</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
