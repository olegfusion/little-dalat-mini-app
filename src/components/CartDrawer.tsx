import { MenuItem, Language, CartItem as CartItemType } from '../types';
import { getItemName, formatPrice, t } from '../i18n';
import { X, ShoppingCart, Trash2 } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItemType[];
  menuItems: MenuItem[];
  language: Language;
  onUpdateQty: (menuItemId: string, qty: number, variantIndex?: number) => void;
  onUpdateComment: (menuItemId: string, comment: string, variantIndex?: number) => void;
  onRemove: (menuItemId: string, variantIndex?: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen, onClose, items, menuItems, language, onUpdateQty, onUpdateComment, onRemove, onClearCart, onCheckout,
}: CartDrawerProps) {
  const subtotal = items.reduce((sum, ci) => {
    const item = menuItems.find(i => i.id === ci.menuItemId);
    return sum + (item?.price || 0) * ci.quantity;
  }, 0);

  const getItem = (id: string) => menuItems.find(i => i.id === id);
  const itemKey = (ci: CartItemType) => `${ci.menuItemId}_${ci.variantIndex ?? ''}`;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      )}
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl transform transition-transform duration-300 max-h-[80vh] flex flex-col ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-[#C5B5A5]/20">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#5A2C11]" />
            <h2 className="font-black text-sm text-[#261308]">{t('cart', language)}</h2>
            <span className="text-[10px] text-[#8B7355]">({items.length})</span>
          </div>
          <div className="flex items-center gap-1">
            {items.length > 0 && (
              <button onClick={onClearCart} className="p-1 hover:bg-[#F4EDE0] rounded-lg text-[10px] text-[#8B7355] font-medium flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" />
                {language === 'vn' ? 'Xoá' :
                 language === 'en' ? 'Clear' :
                 'Очистить'}
              </button>
            )}
            <button onClick={onClose} className="p-1 hover:bg-[#F4EDE0] rounded-lg">
              <X className="w-5 h-5 text-[#5A2C11]" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-center text-[#8B7355] text-sm py-8">{t('cart_empty', language)}</p>
          ) : (
            items.map(ci => {
              const item = getItem(ci.menuItemId);
              if (!item) return null;
              const variantName = ci.variantIndex !== undefined && item.variants
                ? item.variants[language === 'vn' ? 'vn' : language === 'ru' ? 'ru' : 'en'][ci.variantIndex]
                : null;
              return (
                <div key={itemKey(ci)} className="bg-[#FAF5EC] rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="font-bold text-sm text-[#261308]">
                        {getItemName(item, language)}
                        {variantName && <span className="text-[#8B7355] font-medium"> ({variantName})</span>}
                      </p>
                      <p className="text-[#9E3618] font-black text-xs">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          if (ci.quantity <= 1) onRemove(ci.menuItemId, ci.variantIndex);
                          else onUpdateQty(ci.menuItemId, ci.quantity - 1, ci.variantIndex);
                        }}
                        className="w-6 h-6 rounded-full border border-[#C5B5A5] flex items-center justify-center text-[10px]"
                      >−</button>
                      <span className="w-4 text-center font-bold text-sm">{ci.quantity}</span>
                      <button
                        onClick={() => onUpdateQty(ci.menuItemId, ci.quantity + 1, ci.variantIndex)}
                        className="w-6 h-6 rounded-full bg-[#5A2C11] text-white flex items-center justify-center text-[10px]"
                      >+</button>
                      <button onClick={() => onRemove(ci.menuItemId, ci.variantIndex)} className="p-1">
                        <Trash2 className="w-4 h-4 text-[#8B7355]" />
                      </button>
                    </div>
                  </div>
                  <input
                    value={ci.comment || ''}
                    onChange={e => onUpdateComment(ci.menuItemId, e.target.value, ci.variantIndex)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#C5B5A5]/30 text-[11px] outline-none focus:border-[#5A2C11]"
                    placeholder={language === 'vn' ? 'Ghi chú...' :
                                language === 'en' ? 'Comment...' :
                                'Комментарий...'}
                  />
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-[#C5B5A5]/20 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-[#261308]">{t('total', language)}</span>
            <span className="text-lg font-black text-[#9E3618]">{formatPrice(subtotal)}</span>
          </div>
          <button
            onClick={onCheckout}
            disabled={items.length === 0}
            className="w-full py-3 rounded-xl font-black text-sm text-white transition bg-[#5A2C11] hover:bg-[#4A2210] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('checkout', language)}
          </button>
        </div>
      </div>
    </>
  );
}
