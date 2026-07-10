import { useState, useMemo, useEffect, useRef } from 'react';
import { Language, MenuItem, OrderMode } from './types';
import { detectPlatform } from './platforms/usePlatform';
import { TelegramProvider } from './platforms/TelegramProvider';
import { ZaloProvider } from './platforms/ZaloProvider';
import { CartProvider, useCart } from './context/CartContext';
import { fetchMenu } from './api/client';
import Layout from './components/Layout';
import CartDrawer from './components/CartDrawer';
import ModeSelector from './components/ModeSelector';
import Home from './pages/Home';
import Category from './pages/Category';
import Checkout from './pages/Checkout';
import { t } from './i18n';

type Page = 'language' | 'mode' | 'home' | 'category' | 'checkout';

function getUrlParam(name: string): string | null {
  try { return new URLSearchParams(window.location.search).get(name); } catch { return null; }
}

function AppContent() {
  const urlLang = getUrlParam('lang') as Language | null;
  const urlMode = getUrlParam('mode') as OrderMode | null;

  const [language, setLanguage] = useState<Language>(() => {
    if (urlLang === 'vn' || urlLang === 'en' || urlLang === 'ru') return urlLang;
    const saved = localStorage.getItem('ld_lang');
    if (saved === 'vn' || saved === 'en' || saved === 'ru') return saved;
    return 'vn';
  });
  const [page, setPage] = useState<Page>(() => urlMode ? 'home' : 'language');
  const [categoryId, setCategoryId] = useState<string>('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const prevCount = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { state, dispatch } = useCart();

  useEffect(() => {
    localStorage.setItem('ld_lang', language);
  }, [language]);

  useEffect(() => {
    if (urlMode) {
      dispatch({ type: 'SET_MODE', payload: urlMode });
    }
  }, []);

  const handleModeSelect = (mode: OrderMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
    setPage('home');
  };

  useEffect(() => {
    fetchMenu().then(setMenuItems).catch(console.error);
  }, []);

  const cartCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    if (cartCount > prevCount.current) {
      setToast(language === 'vn' ? 'Đã thêm vào giỏ hàng' :
               language === 'en' ? 'Added to cart' :
               'Добавлено в корзину');
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 1500);
    }
    prevCount.current = cartCount;
  }, [cartCount, language]);

  const subtotal = state.items.reduce((sum, ci) => {
    const item = menuItems.find(i => i.id === ci.menuItemId);
    return sum + (item?.price || 0) * ci.quantity;
  }, 0);

  const modeLabel = state.mode
    ? (state.mode === 'dine-in'
      ? (language === 'vn' ? 'Tại quán' : language === 'en' ? 'Dine-in' : 'На месте')
      : state.mode === 'pickup'
        ? (language === 'vn' ? 'Mang đi' : language === 'en' ? 'Pickup' : 'С собой')
        : (language === 'vn' ? 'Giao hàng' : language === 'en' ? 'Delivery' : 'Доставка'))
    : null;

  const pageContent = useMemo(() => {
    switch (page) {
      case 'language':
        return (
          <div className="min-h-screen bg-[#FAF5EC] flex flex-col items-center justify-center px-6 py-12">
            <img src="/logo.png" alt="Little Dalat" className="w-24 h-24 rounded-full object-cover border-2 border-[#C5B5A5]/30 mb-6" />
            <h1 className="font-serif text-3xl font-black italic text-[#5A2C11] mb-1">Little Dalat</h1>
            <p className="text-xs text-[#8B7355] mb-10">Coffee & Tea</p>
            <h2 className="font-black text-sm text-[#261308] mb-5 uppercase tracking-wider">
              {language === 'vn' ? 'Chọn ngôn ngữ' :
               language === 'en' ? 'Choose language' :
               'Выберите язык'}
            </h2>
            <div className="w-full max-w-xs space-y-3">
              <button onClick={() => { setLanguage('vn'); setPage('mode'); }}
                className="w-full flex items-center gap-4 bg-white rounded-xl border border-[#C5B5A5]/20 p-4 text-left transition hover:border-[#5A2C11]/40 hover:shadow-sm">
                <span className="text-3xl">🇻🇳</span>
                <div>
                  <p className="font-bold text-sm text-[#261308]">Tiếng Việt</p>
                  <p className="text-[10px] text-[#8B7355]">Vietnamese</p>
                </div>
              </button>
              <button onClick={() => { setLanguage('en'); setPage('mode'); }}
                className="w-full flex items-center gap-4 bg-white rounded-xl border border-[#C5B5A5]/20 p-4 text-left transition hover:border-[#5A2C11]/40 hover:shadow-sm">
                <span className="text-3xl">🇬🇧</span>
                <div>
                  <p className="font-bold text-sm text-[#261308]">English</p>
                  <p className="text-[10px] text-[#8B7355]">English</p>
                </div>
              </button>
              <button onClick={() => { setLanguage('ru'); setPage('mode'); }}
                className="w-full flex items-center gap-4 bg-white rounded-xl border border-[#C5B5A5]/20 p-4 text-left transition hover:border-[#5A2C11]/40 hover:shadow-sm">
                <span className="text-3xl">🇷🇺</span>
                <div>
                  <p className="font-bold text-sm text-[#261308]">Русский</p>
                  <p className="text-[10px] text-[#8B7355]">Russian</p>
                </div>
              </button>
            </div>
          </div>
        );
      case 'mode':
        return (
          <div className="min-h-screen bg-[#FAF5EC] flex flex-col items-center justify-center px-6 py-12">
            <img src="/logo.png" alt="Little Dalat" className="w-24 h-24 rounded-full object-cover border-2 border-[#C5B5A5]/30 mb-4" />
            <h1 className="font-serif text-3xl font-black italic text-[#5A2C11] mb-1">Little Dalat</h1>
            <p className="text-xs text-[#8B7355] mb-8">Coffee & Tea</p>
            <h2 className="font-black text-lg text-[#261308] mb-4">{t('choose_mode', language)}</h2>
            <ModeSelector language={language} selected={null} onSelect={handleModeSelect} />
          </div>
        );
      case 'home':
        return (
          <Home
            language={language}
            onSelectCategory={(id) => { setCategoryId(id); setPage('category'); }}
          />
        );
      case 'category':
        return (
          <Category
            categoryId={categoryId}
            language={language}
            onBack={() => setPage('home')}
          />
        );
      case 'checkout':
        return (
          <Checkout
            language={language}
            menuItems={menuItems}
            onBack={() => setPage('home')}
            onOrderPlaced={() => setPage('home')}
          />
        );
      default:
        return null;
    }
  }, [page, language, categoryId, menuItems]);

  if (page === 'mode' || page === 'language') {
    return <>{pageContent}</>;
  }

  return (
    <>
      <Layout
        language={language}
        onLanguageChange={setLanguage}
        cartItemCount={cartCount}
        onCartClick={() => setCartOpen(true)}
        onCheckout={page === 'checkout' ? undefined : () => setPage('checkout')}
        cartTotal={subtotal}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-[#8B7355] uppercase tracking-wider">
            {state.mode === 'dine-in' ? '🍽️' : state.mode === 'pickup' ? '🛍️' : '🚚'} {modeLabel}
          </span>
          <button
            onClick={() => setPage('mode')}
            className="text-[10px] text-[#5A2C11] underline"
          >
            ({language === 'vn' ? 'Đổi' : language === 'en' ? 'Change' : 'Изменить'})
          </button>
        </div>
        {pageContent}
      </Layout>

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#5A2C11] text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-bold">
          ✅ {toast}
        </div>
      )}

      {page !== 'checkout' && (
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          items={state.items}
          menuItems={menuItems}
          language={language}
          onUpdateQty={(id, qty, vi) => dispatch({ type: 'UPDATE_QTY', payload: { menuItemId: id, quantity: qty, variantIndex: vi } })}
          onUpdateComment={(id, comment, vi) => dispatch({ type: 'UPDATE_COMMENT', payload: { menuItemId: id, comment, variantIndex: vi } })}
          onRemove={(id, vi) => dispatch({ type: 'REMOVE_ITEM', payload: { menuItemId: id, variantIndex: vi } })}
          onCheckout={() => { setCartOpen(false); setPage('checkout'); }}
        />
      )}
    </>
  );
}

export default function App() {
  const platform = detectPlatform();

  const wrapped = (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );

  if (platform === 'telegram') return <TelegramProvider>{wrapped}</TelegramProvider>;
  if (platform === 'zalo') return <ZaloProvider>{wrapped}</ZaloProvider>;
  return wrapped;
}
