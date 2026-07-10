import { ReactNode, useEffect, createContext, useContext } from 'react';

interface TelegramContextValue {
  ready: () => void;
  expand: () => void;
  close: () => void;
}

const TelegramContext = createContext<TelegramContextValue | null>(null);

export function TelegramProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        return;
      }
    } catch {}
    try {
      (window as any).TelegramWebviewProxy?.postEvent('web_app_ready');
      (window as any).TelegramWebviewProxy?.postEvent('web_app_expand');
    } catch {}
  }, []);

  const value: TelegramContextValue = {
    ready: () => {
      try { (window as any).Telegram?.WebApp?.ready?.(); } catch {}
      try { (window as any).TelegramWebviewProxy?.postEvent('web_app_ready'); } catch {}
    },
    expand: () => {
      try { (window as any).Telegram?.WebApp?.expand?.(); } catch {}
      try { (window as any).TelegramWebviewProxy?.postEvent('web_app_expand'); } catch {}
    },
    close: () => {
      try { (window as any).Telegram?.WebApp?.close?.(); } catch {}
      try { (window as any).TelegramWebviewProxy?.postEvent('web_app_close'); } catch {}
    },
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram(): TelegramContextValue {
  const ctx = useContext(TelegramContext);
  if (!ctx) throw new Error('useTelegram must be used within TelegramProvider');
  return ctx;
}
