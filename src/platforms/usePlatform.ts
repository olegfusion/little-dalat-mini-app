import { OrderSource, Platform } from '../types';

export function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'browser';
  if ((window as any).TelegramWebviewProxy) return 'telegram';
  if ((window as any).ZaloMiniApp) return 'zalo';
  if (navigator.userAgent.includes('WhatsApp')) return 'whatsapp';
  return 'browser';
}

export function getTelegramUserId(): number | null {
  try {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user?.id) return tg.initDataUnsafe.user.id;
    if (tg?.initDataUnsafe?.chat?.id) return tg.initDataUnsafe.chat.id;
  } catch {}
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('chat_id');
    if (fromUrl) return Number(fromUrl);
  } catch {}
  try {
    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
      const tgWebAppData = hashParams.get('tgWebAppData');
      if (tgWebAppData) {
        const data = new URLSearchParams(tgWebAppData);
        const userStr = data.get('user');
        if (userStr) {
          const user = JSON.parse(decodeURIComponent(userStr));
          if (user?.id) return user.id;
        }
      }
    }
  } catch {}
  return null;
}

export function getZaloUserId(): string | null {
  try {
    const zmp = (window as any).ZaloMiniApp;
    if (!zmp) return null;
    return zmp.getUser?.()?.id || null;
  } catch {
    return null;
  }
}

export function getPlatformSource(): OrderSource {
  const platform = detectPlatform();
  const map: Record<Platform, OrderSource> = {
    telegram: 'miniapp_telegram',
    zalo: 'miniapp_zalo',
    whatsapp: 'browser',
    browser: 'browser',
  };
  return map[platform];
}

export function getUserId(): number {
  const tgId = getTelegramUserId();
  if (tgId) return tgId;
  return 0;
}

export function getPlatformUserName(): string | null {
  try {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      const u = tg.initDataUnsafe.user;
      return [u.first_name, u.last_name].filter(Boolean).join(' ') || null;
    }
  } catch {}
  try {
    const zmp = (window as any).ZaloMiniApp;
    if (zmp?.getUser) {
      const u = zmp.getUser();
      if (u?.name) return u.name;
    }
  } catch {}
  return null;
}

export { PlatformProvider, usePlatform } from './PlatformProvider';
