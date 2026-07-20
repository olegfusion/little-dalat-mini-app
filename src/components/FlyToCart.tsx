import { createContext, useContext, useCallback, ReactNode } from 'react';

interface FlyToCartContextType {
  fly: (imageUrl: string, sourceEl: HTMLElement, withPause?: boolean) => void;
}

const FlyToCartContext = createContext<FlyToCartContextType | null>(null);

export function useFlyToCart() {
  const ctx = useContext(FlyToCartContext);
  if (!ctx) throw new Error('useFlyToCart must be used within FlyToCartProvider');
  return ctx;
}

function bounceCart() {
  const el = document.querySelector('[data-cart-icon]');
  if (!el) return;
  el.classList.add('cart-bounce');
  setTimeout(() => el.classList.remove('cart-bounce'), 500);
}

export function FlyToCartProvider({ children }: { children: ReactNode }) {
  const fly = useCallback((imageUrl: string, sourceEl: HTMLElement, withPause = false) => {
    const src = sourceEl.getBoundingClientRect();
    const cartIcon = document.querySelector<HTMLElement>('[data-cart-icon]');
    if (!cartIcon) return;
    const tgt = cartIcon.getBoundingClientRect();

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = '';

    const fixedSize = withPause ? 64 : src.width;
    const ox = (src.width - fixedSize) / 2;
    const oy = (src.height - fixedSize) / 2;
    const sx = src.left + ox;
    const sy = src.top + oy;

    img.style.cssText = `
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      border-radius: 10px;
      object-fit: contain;
      background: #FAF5EC;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      width: ${fixedSize}px;
      height: ${fixedSize}px;
      left: ${sx}px;
      top: ${sy}px;
      will-change: transform, opacity;
    `;
    document.body.appendChild(img);

    const dx = tgt.left + tgt.width / 2 - sx - fixedSize / 2;
    const dy = tgt.top + tgt.height / 2 - sy - fixedSize / 2;

    if (withPause) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const cdx = cx - sx - fixedSize / 2;
      const cdy = cy - sy - fixedSize / 2;

      const anim1 = img.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 0 },
        { transform: `translate(${cdx * 0.5}px, ${cdy * 0.6}px) scale(3)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${cdx}px, ${cdy}px) scale(5)`, opacity: 1, offset: 1 },
      ], {
        duration: 550,
        easing: 'cubic-bezier(0.34, 1.2, 0.64, 1)',
        fill: 'forwards',
      });

      anim1.onfinish = () => {
        const anim2 = img.animate([
          { transform: `translate(${cdx}px, ${cdy}px) scale(5)`, opacity: 1, offset: 0 },
          { transform: `translate(${dx * 0.5 + cdx * 0.5}px, ${dy * 0.5 + cdy * 0.3}px) scale(0.6)`, opacity: 0.85, offset: 0.5 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0, offset: 1 },
        ], {
          duration: 800,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'forwards',
        });

        anim2.onfinish = () => {
          img.remove();
          bounceCart();
        };
      };
    } else {
      const anim = img.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 0 },
        { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - 120}px) scale(0.7)`, opacity: 0.9, offset: 0.38 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0, offset: 1 },
      ], {
        duration: 1350,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards',
      });

      anim.onfinish = () => {
        img.remove();
        bounceCart();
      };
    }
  }, []);

  return (
    <FlyToCartContext.Provider value={{ fly }}>
      {children}
    </FlyToCartContext.Provider>
  );
}
