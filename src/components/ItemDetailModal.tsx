import { useState, useRef, useCallback } from 'react';
import { MenuItem, Language } from '../types';
import { getItemName, formatPrice } from '../i18n';
import { X, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { useFlyToCart } from './FlyToCart';

interface ItemDetailModalProps {
  item: MenuItem;
  allItems: MenuItem[];
  itemIndex: number;
  language: Language;
  cartQuantities: Record<string, number>;
  onAdd: (item: MenuItem, variantIndex?: number) => void;
  onRemove: (item: MenuItem, variantIndex?: number) => void;
  onNavigate: (index: number) => void;
  onClose: () => void;
  initialVariant?: number;
}

export default function ItemDetailModal({
  item, allItems, itemIndex, language, cartQuantities,
  onAdd, onRemove, onNavigate, onClose, initialVariant = 0
}: ItemDetailModalProps) {
  const name = getItemName(item, language);
  const { fly } = useFlyToCart();
  const [variantIdx, setVariantIdx] = useState(initialVariant);
  const hasVariants = !!item.variants;
  const varCount = item.variants?.vn.length || 0;
  const touchStart = useRef<number | null>(null);
  const touchX = useRef<number | null>(null);

  const photoUrl = (() => {
    if (item.variants?.photos?.[variantIdx]) {
      const path = item.variants.photos[variantIdx];
      return '/' + path.split('/').map(s => encodeURIComponent(s)).join('/');
    }
    if (item.photo) {
      return '/' + item.photo.split('/').map(s => encodeURIComponent(s)).join('/');
    }
    return null;
  })();

  const desc = (() => {
    if (item.variants?.descriptions) {
      const langArr = item.variants.descriptions[language === 'vn' ? 'vn' : language === 'ru' ? 'ru' : 'en'];
      if (langArr?.[variantIdx]) return langArr[variantIdx];
    }
    if (item.descriptions) {
      return item.descriptions[language === 'vn' ? 'vn' : language === 'ru' ? 'ru' : 'en'];
    }
    return null;
  })();

  const cartKey = (vi?: number) => `${item.id}_${vi ?? ''}`;
  const currentCartQty = cartQuantities[cartKey(hasVariants ? variantIdx : undefined)] || 0;
  const [addQty, setAddQty] = useState(1);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
    touchX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStart.current === null || touchX.current === null) return;
    const diff = touchX.current - touchStart.current;
    const threshold = 60;
    if (Math.abs(diff) > threshold) {
      if (diff < 0 && itemIndex < allItems.length - 1) onNavigate(itemIndex + 1);
      else if (diff > 0 && itemIndex > 0) onNavigate(itemIndex - 1);
    }
    touchStart.current = null;
    touchX.current = null;
  }, [itemIndex, allItems.length, onNavigate]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-sm w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl"
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
      >
        {/* Image */}
        {photoUrl && (
          <div className="relative shrink-0 bg-[#FAF5EC] flex items-center justify-center">
            <img src={photoUrl} alt={name} data-modal-thumb className="w-full max-h-[40vh] object-contain" />
            <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60">
              <X className="w-5 h-5" />
            </button>
            {hasVariants && varCount > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/50 rounded-full px-3 py-1.5">
                <button onClick={() => setVariantIdx(i => Math.max(0, i-1))} className="text-white/80 hover:text-white">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-white text-xs font-bold">{variantIdx+1}/{varCount}</span>
                <button onClick={() => setVariantIdx(i => Math.min(varCount-1, i+1))} className="text-white/80 hover:text-white">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {allItems.length > 1 && (
              <>
                {itemIndex > 0 && (
                  <button onClick={() => onNavigate(itemIndex - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow hover:bg-white">
                    <ChevronLeft className="w-5 h-5 text-[#5A2C11]" />
                  </button>
                )}
                {itemIndex < allItems.length - 1 && (
                  <button onClick={() => onNavigate(itemIndex + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow hover:bg-white">
                    <ChevronRight className="w-5 h-5 text-[#5A2C11]" />
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Header info (no scroll) */}
        <div className="shrink-0 px-5 pt-4 pb-2 border-b border-[#C5B5A5]/10">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-black text-lg text-[#261308]">{name}</h3>
              {hasVariants && (
                <p className="text-xs text-[#8B7355] mt-0.5">
                  {item.variants![language === 'vn' ? 'vn' : language === 'ru' ? 'ru' : 'en'][variantIdx]}
                </p>
              )}
            </div>
          </div>
          <p className="text-[#9E3618] font-black text-lg mt-1">{formatPrice(item.price)}</p>
          {currentCartQty > 0 && (
            <p className="text-xs text-green-600 font-medium mt-1">
              {language === 'vn' ? `✓ Đã có ${currentCartQty} trong giỏ` :
               language === 'en' ? `✓ ${currentCartQty} in cart` :
               `✓ ${currentCartQty} в корзине`}
            </p>
          )}
          {hasVariants && varCount > 1 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {item.variants![language === 'vn' ? 'vn' : language === 'ru' ? 'ru' : 'en'].map((v, i) => (
                <button key={i} onClick={() => setVariantIdx(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    i === variantIdx
                      ? 'bg-[#5A2C11] text-white'
                      : 'bg-[#F4EDE0] text-[#5A2C11] hover:bg-[#E8DCCB]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable description */}
        <div className="flex-1 overflow-y-auto px-5 py-3 min-h-0">
          {desc && (
            <p className="text-sm text-[#5C4533] leading-relaxed">{desc}</p>
          )}
          {!desc && (
            <p className="text-xs text-[#8B7355] italic">
              {language === 'vn' ? 'Chưa có mô tả' :
               language === 'en' ? 'No description yet' :
               'Описание пока отсутствует'}
            </p>
          )}
        </div>

        {/* Cart controls (fixed at bottom) */}
        <div className="shrink-0 px-5 py-3 border-t border-[#C5B5A5]/15 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-[#F4EDE0] rounded-xl px-3 py-2">
              <button onClick={() => setAddQty(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full bg-white border border-[#C5B5A5]/40 flex items-center justify-center text-[#5A2C11] hover:bg-[#5A2C11] hover:text-white transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-black text-lg text-[#5A2C11]">{addQty}</span>
              <button onClick={() => setAddQty(q => q + 1)}
                className="w-8 h-8 rounded-full bg-[#5A2C11] text-white flex items-center justify-center hover:bg-[#4A2210] transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => {
                const thumb = document.querySelector<HTMLElement>('[data-modal-thumb]');
                if (thumb && thumb.getAttribute('src')) fly(thumb.getAttribute('src')!, thumb);
                for (let i = 0; i < addQty; i++) onAdd(item, hasVariants ? variantIdx : undefined);
                setAddQty(1);
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-[#5A2C11] text-white font-black text-sm hover:bg-[#4A2210] transition active:scale-[0.98]"
            >
              {addQty > 1
                ? (language === 'vn' ? `Thêm ${addQty} vào giỏ` :
                   language === 'en' ? `Add ${addQty} to cart` :
                   `Добавить ${addQty} в корзину`)
                : (language === 'vn' ? 'Thêm vào giỏ' :
                   language === 'en' ? 'Add to cart' :
                   'В корзину')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
