import { useState, useEffect, useRef } from 'react';
import { Language, OrderMode } from '../types';
import { t, formatPrice, ruPluralize } from '../i18n';
import { estimateDelivery } from '../api/client';
import { useCart } from '../context/CartContext';
import { getPlatformUserName } from '../platforms/usePlatform';
import { ArrowLeft, MapPin, Globe } from 'lucide-react';
import MapPicker from './MapPicker';

interface CheckoutFormProps {
  language: Language;
  mode: OrderMode;
  drinkCount: number;
  onBack: () => void;
  onBackToMenu?: () => void;
  onGoToCategory?: (categoryId: string) => void;
  onSubmit: (data: { name: string; phone: string; address?: string; deliveryFee?: number; deliveryLat?: number; deliveryLng?: number }) => void;
}

async function reverseGeocode(lat: number, lng: number, lang: Language): Promise<string> {
  const locale = lang === 'vn' ? 'vi' : lang === 'ru' ? 'ru' : 'en';
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=${locale}&zoom=16`,
      { headers: { 'User-Agent': 'LittleDalatMiniApp/1.0' } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export default function CheckoutForm({ language, mode, drinkCount, onBack, onBackToMenu, onGoToCategory, onSubmit }: CheckoutFormProps) {
  const { state, dispatch } = useCart();
  const skipTo = state.customerName && state.customerPhone
    ? (mode === 'delivery' ? 'address' as const : 'phone' as const)
    : state.customerName ? 'phone' as const : null;
  const [step, setStep] = useState<'name' | 'phone' | 'address'>(skipTo || 'name');
  const savedName = localStorage.getItem('ld_name');
  const [name, setName] = useState(state.customerName || getPlatformUserName() || savedName || '');
  const savedPhone = localStorage.getItem('ld_phone');
  const savedAddr = localStorage.getItem('ld_address');
  const [phone, setPhone] = useState(state.customerPhone || savedPhone || '');
  const [address, setAddressState] = useState(savedAddr || state.customerAddress || '');
  const setAddress = (val: string) => {
    setAddressState(val);
    if (val.trim()) localStorage.setItem('ld_address', val.trim());
  };
  const [deliveryFee, setDeliveryFee] = useState<number | undefined>();
  const [deliveryLat, setDeliveryLat] = useState<number | undefined>();
  const [deliveryLng, setDeliveryLng] = useState<number | undefined>();
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const prevAddr = useRef('');
  useEffect(() => {
    if (deliveryFee === undefined || !address.trim() || address.trim() === prevAddr.current) return;
    prevAddr.current = address.trim();
    try {
      localStorage.setItem('ld_delivery', JSON.stringify({
        address: address.trim(),
        lat: deliveryLat,
        lng: deliveryLng,
        fee: deliveryFee === 0 ? -1 : deliveryFee,
      }));
    } catch {}
  }, [deliveryFee, deliveryLat, deliveryLng, address]);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const savedSource = (() => { try { return localStorage.getItem('ld_addr_source') as 'manual' | 'geo' | 'map' | null; } catch { return null; } })();
  const [addressSource, setAddressSourceState] = useState<'manual' | 'geo' | 'map' | null>(savedSource);
  const setAddressSource = (val: 'manual' | 'geo' | 'map' | null) => {
    setAddressSourceState(val);
    if (val) localStorage.setItem('ld_addr_source', val);
    else localStorage.removeItem('ld_addr_source');
  };
  const [suggestions, setSuggestions] = useState<{ display: string; lat: number; lng: number }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const geoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const suggestTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const suggestionLocked = useRef(false);
  const userEditedAddress = useRef(false);
  const addressRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const run = async () => {
      if (step !== 'address' || mode !== 'delivery') return;
      if (geoTimer.current) clearTimeout(geoTimer.current);
      if (!address.trim()) return;
      if (showSuggestions) return;
      let cached: any = {};
      try { cached = JSON.parse(localStorage.getItem('ld_delivery') || '{}'); } catch {}
      if (cached.address === address.trim() && cached.fee !== undefined && cached.drinkCount === drinkCount) {
        if (cached.lat) setDeliveryLat(cached.lat);
        if (cached.lng) setDeliveryLng(cached.lng);
        if (cached.fee === -1) { setDeliveryFee(0); } else if (cached.fee === null) { setDeliveryFee(undefined); } else { setDeliveryFee(cached.fee); }
        return;
      }
      if (addressSource === 'geo' || addressSource === 'map') setAddressSource('manual');
      setCheckingDelivery(true);
      setDeliveryFee(undefined);
      setDeliveryError(null);
      if (cached.address === address.trim() && (cached.drinkCount !== drinkCount || cached.fee === undefined)) {
        const lat = deliveryLat || cached.lat;
        const lng = deliveryLng || cached.lng;
        if (lat && lng) {
          const est = await estimateDelivery(lat, lng, drinkCount);
          if (!est.available) { setDeliveryError(t('delivery_not_available', language)); setDeliveryFee(undefined); }
          else { const fee = est.fee === -1 ? 0 : est.fee || 0; setDeliveryFee(fee); saveDeliveryToCache(address, lat, lng, fee); }
          setCheckingDelivery(false);
          return;
        }
      }
      geoTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(address)}`);
        const data = await res.json();
        const s = data?.suggestions?.[0];
        if (s) {
          setDeliveryLat(s.lat);
          setDeliveryLng(s.lng);
          const est = await estimateDelivery(s.lat, s.lng, drinkCount);
          if (!est.available) {
            setDeliveryError(t('delivery_not_available', language));
            setDeliveryFee(undefined);
          } else {
            setDeliveryFee(est.fee === -1 ? 0 : est.fee || 0);
          }
        } else {
          setDeliveryLat(undefined);
          setDeliveryLng(undefined);
          setDeliveryFee(undefined);
        }
      } catch { setDeliveryFee(undefined); }
        setCheckingDelivery(false);
      }, 2000);
    };
    run();
    return () => { if (geoTimer.current) clearTimeout(geoTimer.current); };
  }, [address, step, mode, language, showSuggestions, addressSource, drinkCount]);

  useEffect(() => {
    if (step !== 'address') return;
    if (!userEditedAddress.current) return;
    if (suggestionLocked.current) { suggestionLocked.current = false; return; }
    if (addressSource === 'geo' || addressSource === 'map') return;
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    const q = address.trim();
    if (q.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    suggestTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data?.suggestions?.length) {
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch { setSuggestions([]); setShowSuggestions(false); }
    }, 500);
    return () => { if (suggestTimer.current) clearTimeout(suggestTimer.current); };
  }, [address, step]);

  const resolveCoords = async (display: string, placeId?: string): Promise<{ lat: number; lng: number } | null> => {
    if (placeId) {
      try {
        const res = await fetch(`/api/geocode/resolve?display=${encodeURIComponent(display)}&placeId=${encodeURIComponent(placeId)}`);
        const data = await res.json();
        if (data.lat) return { lat: data.lat, lng: data.lng };
      } catch {}
    }
    return null;
  };

  const doEstimate = async (addr: string, lat: number, lng: number) => {
    setDeliveryLat(lat);
    setDeliveryLng(lng);
    setAddress(addr);
    setCheckingDelivery(true);
    const est = await estimateDelivery(lat, lng, drinkCount);
    if (!est.available) {
      setDeliveryError(t('delivery_not_available', language));
      setDeliveryFee(undefined);
    } else {
      const fee = est.fee === -1 ? 0 : est.fee || 0;
      setDeliveryFee(fee);
      saveDeliveryToCache(addr, lat, lng, fee);
    }
    setCheckingDelivery(false);
  };

  const pickSuggestion = async (s: { display: string; lat?: number; lng?: number; placeId?: string }) => {
    setShowSuggestions(false);
    suggestionLocked.current = true;
    const typed = address.trim();
    let lat = (s as any).lat;
    let lng = (s as any).lng;
    if (!lat && (s as any).placeId) {
      const coords = await resolveCoords(s.display, (s as any).placeId);
      if (coords) { lat = coords.lat; lng = coords.lng; }
    }
    const typedPrefix = typed.match(/^([\d\/]+)\s+/);
    if (typedPrefix) {
      const parts = s.display.split(',');
      const street = parts[0].trim();
      const streetNum = street.match(/^[\d\/]+/);
      if (!streetNum || !street.includes(typedPrefix[1])) {
        parts[0] = `${typedPrefix[1]} ${street.replace(/^[\d\/]+\s*/, '')}`;
        const finalAddr = parts.join(', ');
        setAddress(finalAddr);
        setAddressSource('manual');
        if (lat && lng) doEstimate(finalAddr, lat, lng);
        return;
      }
    }
    setAddress(s.display);
    setAddressSource('manual');
    if (lat && lng) doEstimate(s.display, lat, lng);
  };

  const saveCustomer = () => {
    dispatch({ type: 'SET_CUSTOMER', payload: { name: name.trim(), phone: phone.trim(), address: address.trim() } });
    localStorage.setItem('ld_name', name.trim());
    localStorage.setItem('ld_phone', phone.trim());
    if (address.trim()) localStorage.setItem('ld_address', address.trim());
  };

  const handleNext = () => {
    if (step === 'name' && name.trim()) {
      saveCustomer();
      setStep('phone');
    } else if (step === 'phone' && phone.trim()) {
      saveCustomer();
      if (mode === 'delivery') {
        setStep('address');
      } else {
        onSubmit({ name, phone });
      }
    }
  };

  const saveDeliveryToCache = (addr: string, lat?: number, lng?: number, fee?: number) => {
    if (!addr.trim()) return;
    try {
      localStorage.setItem('ld_delivery', JSON.stringify({
        address: addr.trim(), lat, lng, drinkCount,
        fee: fee === undefined ? null : (fee === 0 ? -1 : fee),
      }));
    } catch {}
  };

  const handleMapConfirm = async (lat: number, lng: number) => {
    setShowMapPicker(false);
    setAddressSource('map');
    setCheckingDelivery(true);
    setDeliveryError(null);
    setDeliveryLat(lat);
    setDeliveryLng(lng);
    setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    try {
      const addr = await reverseGeocode(lat, lng, language);
      setAddress(addr);
      const est = await estimateDelivery(lat, lng, drinkCount);
      if (!est.available) {
        setDeliveryError(t('delivery_not_available', language));
        setDeliveryFee(undefined);
      } else {
        const fee = est.fee === -1 ? 0 : est.fee || 0;
        setDeliveryFee(fee);
        saveDeliveryToCache(addr, lat, lng, fee);
      }
    } catch {
      setDeliveryError(t('delivery_not_available', language));
    } finally {
      setCheckingDelivery(false);
    }
  };

  const handleAddressSubmit = () => {
    if (address.trim()) {
      saveCustomer();
      onSubmit({ name, phone, address, deliveryFee, deliveryLat, deliveryLng });
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setDeliveryError('Geolocation not available');
      return;
    }

    const doGeocodeAndEstimate = async (lat: number, lng: number) => {
      setDeliveryLat(lat);
      setDeliveryLng(lng);
      setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      const addr = await reverseGeocode(lat, lng, language);
      setAddress(addr);
      const est = await estimateDelivery(lat, lng, drinkCount);
      if (!est.available) { setDeliveryError(t('delivery_not_available', language)); setDeliveryFee(undefined); }
      else {
        const fee = est.fee === -1 ? 0 : est.fee || 0;
        setDeliveryFee(fee);
        saveDeliveryToCache(addr, lat, lng, fee);
      }
      setCheckingDelivery(false);
    };

    const cached = localStorage.getItem('ld_geo');
    if (cached) {
      try {
        const { lat, lng } = JSON.parse(cached);
        setAddressSource('geo');
        setCheckingDelivery(true);
        setDeliveryError(null);
        doGeocodeAndEstimate(lat, lng);
        return;
      } catch {}
    }

    setAddressSource('geo');
    setCheckingDelivery(true);
    setDeliveryError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        localStorage.setItem('ld_geo', JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
        doGeocodeAndEstimate(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setDeliveryError(language === 'vn' ? 'Không thể lấy vị trí' : language === 'ru' ? 'Не удалось получить местоположение' : 'Could not get location');
        setCheckingDelivery(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const steps = mode === 'delivery' ? ['name', 'phone', 'address'] : ['name', 'phone'];
  const currentIdx = steps.indexOf(step);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#8B7355] mb-4">
        <ArrowLeft className="w-4 h-4" /> {t('back', language)}
      </button>

      <div className="flex gap-0.5 mb-3">
        {steps.map((s, i) => (
          <div key={s} className={`flex-1 h-0.5 rounded-full ${i <= currentIdx ? 'bg-[#5A2C11]' : 'bg-[#E8DCCB]'}`} />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#C5B5A5]/20 p-5 space-y-4">
        {step === 'name' && (
          <div>
            <label className="block text-sm font-bold mb-2">{t('your_name', language)}</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#C5B5A5]/40 bg-[#FAF5EC] text-sm outline-none focus:border-[#5A2C11]"
              placeholder={language === 'vn' ? 'Nhập tên của bạn' : language === 'ru' ? 'Введите имя' : 'Enter your name'}
              onKeyDown={e => e.key === 'Enter' && handleNext()}
            />
          </div>
        )}

        {step === 'phone' && (
          <div>
            <label className="block text-sm font-bold mb-2">{t('your_phone', language)}</label>
            <input
              autoFocus
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#C5B5A5]/40 bg-[#FAF5EC] text-sm outline-none focus:border-[#5A2C11]"
              placeholder="0912 066 973"
              onKeyDown={e => e.key === 'Enter' && handleNext()}
            />
          </div>
        )}

        {step === 'address' && (
          <div>
            <div className="mb-4 px-4 py-3 bg-[#F4EDE0] rounded-xl space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-[#8B7355] shrink-0">{t('your_name', language)}</span>
                <span className="flex-1 font-medium text-[#261308] text-right truncate">{name}</span>
                <button onClick={() => setStep('name')} className="text-[10px] text-[#5A2C11] underline shrink-0">
                  {language === 'vn' ? 'Sửa' : language === 'en' ? 'Edit' : 'Изм.'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B7355] shrink-0">{t('your_phone', language)}</span>
                <span className="flex-1 font-medium text-[#261308] text-right truncate">{phone}</span>
                <button onClick={() => setStep('phone')} className="text-[10px] text-[#5A2C11] underline shrink-0">
                  {language === 'vn' ? 'Sửa' : language === 'en' ? 'Edit' : 'Изм.'}
                </button>
              </div>
            </div>
            {checkingDelivery && (
              <div className="mb-3">
                <div className="h-1 bg-[#E8DCCB] rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 h-full bg-[#5A2C11] rounded-full animate-loading-bar" />
                </div>
                <p className="text-[10px] text-[#8B7355] mt-1 text-center">
                  {language === 'vn' ? 'Đang xác định vị trí...' :
                   language === 'en' ? 'Determining location...' :
                   'Определяем местоположение...'}
                </p>
              </div>
            )}

            <label className="block text-sm font-bold mb-2">{t('delivery_address', language)}</label>

            <div className="flex gap-2 mb-3">
              <button
                onClick={handleUseLocation}
                disabled={checkingDelivery}
                className="flex-1 py-3 rounded-xl border-2 border-[#5A2C11] text-[#5A2C11] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#F4EDE0] transition disabled:opacity-50"
              >
                <MapPin className="w-5 h-5 shrink-0" />
                {checkingDelivery ? '⏳' : t('use_my_location', language)}
              </button>
              <button
                onClick={() => setShowMapPicker(true)}
                disabled={checkingDelivery}
                className="flex-1 py-3 rounded-xl border-2 border-[#5A2C11] text-[#5A2C11] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#F4EDE0] transition disabled:opacity-50"
              >
                <Globe className="w-5 h-5 shrink-0" />
                {language === 'vn' ? 'Bản đồ' :
                 language === 'en' ? 'Map' :
                 'Карта'}
              </button>
            </div>

            <p className="text-[10px] text-[#8B7355] text-center mb-3">{t('or_type_address', language)}</p>

            <div className="relative">
              <textarea
                ref={addressRef}
                value={address}
                onChange={e => { userEditedAddress.current = true; if (addressSource === 'geo' || addressSource === 'map') setAddressSource(null); setAddress(e.target.value); }}
                className="w-full px-4 py-3 rounded-xl border border-[#C5B5A5]/40 bg-[#FAF5EC] text-sm outline-none focus:border-[#5A2C11] resize-none"
                rows={3}
                placeholder={language === 'vn' ? 'Nhập địa chỉ giao hàng' : language === 'ru' ? 'Введите адрес доставки' : 'Enter delivery address'}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 z-10 mb-1 bg-white rounded-xl border border-[#C5B5A5]/20 shadow-lg max-h-48 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => pickSuggestion(s)}
                      className="w-full text-left px-4 py-3 text-sm text-[#261308] hover:bg-[#F4EDE0] transition border-b border-[#C5B5A5]/10 last:border-0"
                    >
                      {s.display}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {deliveryError && (
              <p className="text-[#DC2626] text-xs mt-2">{deliveryError}</p>
            )}

            {checkingDelivery && (
              <div className="mt-3 p-3 bg-[#F4EDE0] rounded-xl">
                <p className="text-xs text-[#8B7355] text-center">
                  {language === 'vn' ? '⏳ Đang tính phí giao hàng...' :
                   language === 'en' ? '⏳ Calculating delivery fee...' :
                   '⏳ Рассчитываем стоимость доставки...'}
                </p>
              </div>
            )}

            {deliveryFee !== undefined && !deliveryError && !checkingDelivery && (
              <div className="mt-3 p-3 bg-[#F4EDE0] rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8B7355]">{t('delivery_fee_label', language)}</span>
                  <span className="font-black text-[#9E3618]">
                    {deliveryFee === 0 ? t('delivery_free', language) : formatPrice(deliveryFee)}
                  </span>
                </div>
                <p className="text-[10px] text-[#5A2C11] mt-2 font-medium">
                  {deliveryFee === 0 && drinkCount >= 5
                    ? (language === 'vn' ? '✅ Miễn phí giao hàng (5+ đồ uống)' :
                       language === 'en' ? '✅ Free delivery (5+ drinks)' :
                       '✅ Бесплатная доставка (5+ напитков)')
                    : (deliveryFee === 0
                        ? (language === 'vn' ? '✅ Miễn phí giao hàng (5+ đồ uống)' :
                           language === 'en' ? '✅ Free delivery (5+ drinks)' :
                           '✅ Бесплатная доставка (5+ напитков)')
                        : (language === 'vn'
                            ? `🚚 Trong giỏ: ${drinkCount} đồ uống. Thêm ${Math.max(0, 5 - drinkCount)} để được freeship!`
                            : language === 'en'
                              ? `🚚 Cart: ${drinkCount} drink${drinkCount !== 1 ? 's' : ''}. Add ${Math.max(0, 5 - drinkCount)} more for free delivery!`
                               : `🚚 В корзине: ${drinkCount} ${ruPluralize(drinkCount, ['напиток', 'напитка', 'напитков'])}. Добавьте ещё ${Math.max(0, 5 - drinkCount)} для бесплатной доставки!`))}
                </p>
              {deliveryFee === 0 && drinkCount >= 5 && onGoToCategory && (
                <button
                  onClick={() => onGoToCategory('desserts_snacks')}
                  className="w-full mt-2 py-2 rounded-lg border border-[#5A2C11] text-[#5A2C11] font-bold text-xs hover:bg-[#5A2C11] hover:text-white transition"
                >
                  {language === 'vn' ? '🍪 Thêm đồ ăn vặt' :
                   language === 'en' ? '🍪 Add snacks' :
                   '🍪 Добавить закуски'}
                </button>
              )}
              {deliveryFee > 0 && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onBackToMenu ? onBackToMenu() : onBack?.()}
                    className="flex-1 py-2 rounded-lg border border-[#5A2C11] text-[#5A2C11] font-bold text-xs hover:bg-[#5A2C11] hover:text-white transition"
                  >
                    {language === 'vn' ? '+ Đồ uống' :
                     language === 'en' ? '+ Drinks' :
                     '+ Напитки'}
                  </button>
                  {onGoToCategory && (
                    <button
                      onClick={() => onGoToCategory('desserts_snacks')}
                      className="flex-1 py-2 rounded-lg border border-[#5A2C11] text-[#5A2C11] font-bold text-xs hover:bg-[#5A2C11] hover:text-white transition"
                    >
                      {language === 'vn' ? '🍪 Ăn vặt' :
                       language === 'en' ? '🍪 Snacks' :
                       '🍪 Закуски'}
                    </button>
                  )}
                </div>
              )}
              </div>
            )}
          </div>
        )}

        {step !== 'address' && (
          <button
            onClick={handleNext}
            disabled={
              (step === 'name' && !name.trim()) ||
              (step === 'phone' && !phone.trim())
            }
            className="w-full py-3 rounded-xl font-black text-sm text-white bg-[#5A2C11] hover:bg-[#4A2210] disabled:opacity-40 transition"
          >
            {t('checkout', language)}
          </button>
        )}

        {step === 'address' && (
          <button
            onClick={handleAddressSubmit}
            disabled={!address.trim() || checkingDelivery}
            className="w-full py-3 rounded-xl font-black text-sm text-white bg-[#5A2C11] hover:bg-[#4A2210] disabled:opacity-40 transition"
          >
            {t('checkout', language)}
          </button>
        )}
      </div>

      {showMapPicker && (
        <MapPicker
          language={language}
          onConfirm={handleMapConfirm}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </div>
  );
}
