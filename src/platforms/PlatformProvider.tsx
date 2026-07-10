import { ReactNode, createContext, useContext } from 'react';
import { Platform } from '../types';
import { detectPlatform } from './usePlatform';

interface PlatformContextValue {
  platform: Platform;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const platform = detectPlatform();
  return (
    <PlatformContext.Provider value={{ platform }}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform(): PlatformContextValue {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform must be used within PlatformProvider');
  return ctx;
}
