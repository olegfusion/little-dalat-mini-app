import { ReactNode } from 'react';
import { Language } from '../types';
import { ShoppingCart } from 'lucide-react';
import { formatPrice } from '../i18n';

interface LayoutProps {
  children: ReactNode;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  cartItemCount: number;
  onCartClick: () => void;
  onCheckout?: () => void;
  cartTotal?: number;
}

const LANGUAGES: { key: Language; label: string }[] = [
  { key: 'vn', label: 'VN' },
  { key: 'en', label: 'EN' },
  { key: 'ru', label: 'RU' },
];

export default function Layout({ children, language, onLanguageChange, cartItemCount, onCartClick, onCheckout, cartTotal }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAF5EC] text-[#261308] pb-24">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#C5B5A5]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-lg font-black italic text-[#5A2C11]">Little Dalat</h1>
            <p className="text-[10px] text-[#8B7355] font-medium">Coffee & Tea</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-[#F4EDE0] rounded-lg p-0.5">
              {LANGUAGES.map(l => (
                <button
                  key={l.key}
                  onClick={() => onLanguageChange(l.key)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition ${
                    language === l.key
                      ? 'bg-[#5A2C11] text-white'
                      : 'text-[#5A2C11] hover:bg-[#E8DCCB]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <button
              onClick={onCartClick}
              className="relative p-2 text-[#5A2C11] hover:bg-[#F4EDE0] rounded-lg transition"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#DC2626] text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-4">
        {children}
      </main>
      {cartItemCount > 0 && onCheckout && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#C5B5A5]/30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[#8B7355]">
                {language === 'vn' ? `${cartItemCount} món` :
                 language === 'en' ? `${cartItemCount} item${cartItemCount > 1 ? 's' : ''}` :
                 `${cartItemCount} шт.`}
              </p>
              <p className="font-black text-[#9E3618]">{formatPrice(cartTotal || 0)}</p>
            </div>
            <button
              onClick={onCheckout}
              className="flex-1 py-3 rounded-xl bg-[#5A2C11] text-white font-black text-sm hover:bg-[#4A2210] transition active:scale-[0.98]"
            >
              {language === 'vn' ? 'Đặt hàng' :
               language === 'en' ? 'Checkout' :
               'Оформить заказ'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
