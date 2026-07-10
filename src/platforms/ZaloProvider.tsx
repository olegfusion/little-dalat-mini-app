import { ReactNode, createContext, useContext } from 'react';

interface ZaloContextValue {
  close: () => void;
}

const ZaloContext = createContext<ZaloContextValue | null>(null);

export function ZaloProvider({ children }: { children: ReactNode }) {
  const value: ZaloContextValue = {
    close: () => {
      try { (window as any).ZaloMiniApp?.closeApp(); } catch {}
    },
  };

  return (
    <ZaloContext.Provider value={value}>
      {children}
    </ZaloContext.Provider>
  );
}

export function useZalo(): ZaloContextValue {
  const ctx = useContext(ZaloContext);
  if (!ctx) throw new Error('useZalo must be used within ZaloProvider');
  return ctx;
}
