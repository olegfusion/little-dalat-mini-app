import { useState } from 'react';
import { MenuItem, Language, CategoryInfo } from '../types';
import { getItemName, formatPrice, t } from '../i18n';
import { Plus, Minus, Image } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFlyToCart } from './FlyToCart';
import ItemDetailModal from './ItemDetailModal';

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

function getThumbUrl(item: MenuItem): string | null {
  const path = item.variants?.photos?.[0] || item.photo || null;
  if (!path) return null;
  return '/' + path.split('/').map(s => encodeURIComponent(s)).join('/');
}

function getVariantThumbUrl(item: MenuItem, idx: number): string | null {
  const path = item.variants?.photos?.[idx] || null;
  if (!path) return null;
  return '/' + path.split('/').map(s => encodeURIComponent(s)).join('/');
}

export default function MenuList({
  items, category, language, cartQuantities, onAdd, onRemove,
  onSelectVariant, selectedVariantItem, onVariantPick, onBackFromVariants,
}: MenuListProps) {
  const { state } = useCart();
  const { fly } = useFlyToCart();
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [detailVariant, setDetailVariant] = useState(0);
  const catName = (category as any)[language === 'vn' ? 'vietnamese' : language === 'ru' ? 'russian' : 'english'];
  const cartKey = (item: MenuItem, vi?: number) => `${item.id}_${vi ?? ''}`;

  const variantItem = selectedVariantItem
    ? items.find(i => i.id === selectedVariantItem)
    : null;

  const moreLabel = language === 'vn' ? 'Chi tiết' :
                    language === 'en' ? 'Details' :
                    'Подробнее';

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
          const thumbUrl = getThumbUrl(item);

          return (
            <div key={item.id}>
              <div className="bg-white rounded-xl border border-[#C5B5A5]/20 p-3.5 flex items-center gap-3" data-item-row={item.id}>
                <div className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => setDetailItem(item)}>
                  {thumbUrl && (
                    <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-[#FAF5EC] border border-[#C5B5A5]/20">
                      <img src={thumbUrl} alt={name} data-thumb className="w-full h-full object-contain bg-[#FAF5EC]" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-[#261308] leading-tight">{name}</h3>
                    <p className="text-[#9E3618] font-black text-sm">{formatPrice(item.price)}</p>
                    <span className="text-[10px] text-[#8B7355] underline mt-0.5 inline-flex items-center gap-1 hover:text-[#5A2C11]">
                      <Image className="w-3 h-3" />
                      {moreLabel}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
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
                      onClick={(e) => {
                        if (!item.variants) {
                          const row = (e.currentTarget as HTMLElement).closest('[data-item-row]');
                          const thumb = row?.querySelector<HTMLElement>('[data-thumb]');
                          if (thumb && thumb.getAttribute('src')) fly(thumb.getAttribute('src')!, thumb, true);
                          onAdd(item);
                        } else {
                          onSelectVariant(item);
                        }
                      }}
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
                    const vThumb = getVariantThumbUrl(item, i);
                    return (
                      <div key={i} data-variant-row className="flex items-center justify-between bg-white rounded-lg px-3 py-2 gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer" onClick={() => { setDetailItem(item); setDetailVariant(i); }}>
                          {vThumb && (
                            <div className="w-9 h-9 shrink-0 rounded-lg overflow-hidden bg-white border border-[#C5B5A5]/20">
                              <img src={vThumb} alt={v} data-thumb className="w-full h-full object-contain bg-white" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-sm font-medium text-[#261308] block leading-tight">{v}</span>
                            <span className="text-[10px] text-[#8B7355] underline mt-0.5 inline-flex items-center gap-1">{moreLabel}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
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
                            onClick={(e) => {
                              const variantRow = (e.currentTarget as HTMLElement).closest('[data-variant-row]');
                              const thumb = variantRow?.querySelector<HTMLElement>('[data-thumb]');
                              if (thumb && thumb.getAttribute('src')) fly(thumb.getAttribute('src')!, thumb, true);
                              onVariantPick(item, i);
                            }}
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
      {detailItem && (
        <ItemDetailModal
          item={detailItem}
          allItems={items}
          itemIndex={items.indexOf(detailItem)}
          language={language}
          cartQuantities={cartQuantities}
          onAdd={onAdd}
          onRemove={onRemove}
          onNavigate={(idx) => { setDetailItem(items[idx]); setDetailVariant(0); }}
          onClose={() => { setDetailItem(null); setDetailVariant(0); }}
          initialVariant={detailVariant}
        />
      )}
    </div>
  );
}
