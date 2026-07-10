import { useState, useEffect, useRef } from 'react';
import { Language, OrderMode } from '../types';
import { t, formatPrice } from '../i18n';
import { estimateDelivery } from '../api/client';
import { useCart } from '../context/CartContext';
import { ArrowLeft, MapPin, Globe } from 'lucide-react';
import MapPicker from './MapPicker';

interface CheckoutFormProps {
  language: Language;
  mode: OrderMode;
  onBack: () => void;
  onBackToMenu?: () => void;
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

export default function CheckoutForm({ language, mode, onBack, onBackToMenu, onSubmit }: CheckoutFormProps) {
  const { state, dispatch } = useCart();
  const itemCount = state.items.reduce((sum, ci) => sum + ci.quantity, 0);
  const skipTo = state.customerName && state.customerPhone
    ? (mode === 'delivery' ? 'address' as const : 'phone' as const)
    : state.customerName ? 'phone' as const : null;
  const [step, setStep] = useState<'name' | 'phone' | 'address'>(skipTo || 'name');
  const [name, setName] = useState(state.customerName || '');
  const [phone, setPhone] = useState(state.customerPhone || '');
  const [address, setAddress] = useState(state.customerAddress || '');
  const [deliveryFee, setDeliveryFee] = useState<number | undefined>();
  const [deliveryLat, setDeliveryLat] = useState<number | undefined>();
  const [deliveryLng, setDeliveryLng] = useState<number | undefined>();
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const geoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const forwardGeocode = async (query: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const locale = language === 'vn' ? 'vi' : language === 'ru' ? 'ru' : 'en';
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=${locale}`,
        { headers: { 'User-Agent': 'LittleDalatMiniApp/1.0' } }
      );
      const data = await res.json();
      if (data?.[0]?.lat && data?.[0]?.lon) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch {}
    return null;
  };

  useEffect(() => {
    if (step !== 'address' || mode !== 'delivery') return;
    if (geoTimer.current) clearTimeout(geoTimer.current);
    if (!address.trim()) return;
    geoTimer.current = setTimeout(async () => {
      setCheckingDelivery(true);
      setDeliveryError(null);
      const coords = await forwardGeocode(address);
      if (coords) {
        setDeliveryLat(coords.lat);
        setDeliveryLng(coords.lng);
        const est = await estimateDelivery(coords.lat, coords.lng, itemCount);
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
      setCheckingDelivery(false);
    }, 1000);
    return () => { if (geoTimer.current) clearTimeout(geoTimer.current); };
  }, [address, step, mode, language]);

  const saveCustomer = () => {
    dispatch({ type: 'SET_CUSTOMER', payload: { name: name.trim(), phone: phone.trim(), address: address.trim() } });
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

  const handleMapConfirm = async (lat: number, lng: number) => {
    setShowMapPicker(false);
    setCheckingDelivery(true);
    setDeliveryError(null);
    setDeliveryLat(lat);
    setDeliveryLng(lng);
    try {
      const addr = await reverseGeocode(lat, lng, language);
      setAddress(addr);
      const est = await estimateDelivery(lat, lng, itemCount);
      if (!est.available) {
        setDeliveryError(t('delivery_not_available', language));
        setDeliveryFee(undefined);
      } else {
        setDeliveryFee(est.fee === -1 ? 0 : est.fee || 0);
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
    setCheckingDelivery(true);
    setDeliveryError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setDeliveryLat(pos.coords.latitude);
        setDeliveryLng(pos.coords.longitude);
        try {
          const addr = await reverseGeocode(pos.coords.latitude, pos.coords.longitude, language);
          setAddress(addr);
          const est = await estimateDelivery(pos.coords.latitude, pos.coords.longitude, itemCount);
          if (!est.available) {
            setDeliveryError(t('delivery_not_available', language));
            setDeliveryFee(undefined);
          } else {
            setDeliveryFee(est.fee === -1 ? 0 : est.fee || 0);
            setDeliveryError(null);
          }
        } catch {
          setDeliveryError(t('delivery_not_available', language));
        } finally {
          setCheckingDelivery(false);
        }
      },
      () => {
        setDeliveryError(language === 'vn' ? 'Không thể lấy vị trí' : language === 'ru' ? 'Не удалось получить местоположение' : 'Could not get location');
        setCheckingDelivery(false);
      },
    );
  };

  const steps = mode === 'delivery' ? ['name', 'phone', 'address'] : ['name', 'phone'];
  const currentIdx = steps.indexOf(step);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#8B7355] mb-4">
        <ArrowLeft className="w-4 h-4" /> {t('back', language)}
      </button>

      <div className="flex gap-1 mb-6">
        {steps.map((s, i) => (
          <div key={s} className={`flex-1 h-1 rounded-full ${i <= currentIdx ? 'bg-[#5A2C11]' : 'bg-[#E8DCCB]'}`} />
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
              <div className="flex justify-between">
                <span className="text-[#8B7355]">{t('your_name', language)}</span>
                <span className="font-medium text-[#261308]">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B7355]">{t('your_phone', language)}</span>
                <span className="font-medium text-[#261308]">{phone}</span>
              </div>
            </div>
            <label className="block text-sm font-bold mb-2">{t('delivery_address', language)}</label>

            <div className="flex gap-2 mb-3">
              <button
                onClick={handleUseLocation}
                disabled={checkingDelivery}
                className="flex-1 py-3 rounded-xl border-2 border-[#5A2C11] text-[#5A2C11] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#F4EDE0] transition disabled:opacity-50"
              >
                <MapPin className="w-5 h-5 shrink-0" />
                {checkingDelivery ? '...' : t('use_my_location', language)}
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

            <textarea
              autoFocus
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#C5B5A5]/40 bg-[#FAF5EC] text-sm outline-none focus:border-[#5A2C11] resize-none"
              rows={3}
              placeholder={language === 'vn' ? 'Nhập địa chỉ giao hàng' : language === 'ru' ? 'Введите адрес доставки' : 'Enter delivery address'}
            />

            {deliveryError && (
              <p className="text-[#DC2626] text-xs mt-2">{deliveryError}</p>
            )}

            {deliveryFee !== undefined && !deliveryError && (
              <div className="mt-3 p-3 bg-[#F4EDE0] rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8B7355]">{t('delivery_fee_label', language)}</span>
                  <span className="font-black text-[#9E3618]">
                    {deliveryFee === 0 ? t('delivery_free', language) : formatPrice(deliveryFee)}
                  </span>
                </div>
                <p className="text-[10px] text-[#5A2C11] mt-2 font-medium">
                  {deliveryFee === 0
                    ? (language === 'vn' ? '✅ Miễn phí giao hàng (5+ món)' :
                       language === 'en' ? '✅ Free delivery (5+ items)' :
                       '✅ Бесплатная доставка (5+)')
                    : (language === 'vn' ? '🚚 Miễn phí giao hàng từ 5 món' :
                       language === 'en' ? '🚚 Free delivery from 5 items' :
                       '🚚 Бесплатная доставка от 5 товаров')}
                </p>
              {deliveryFee > 0 && (
                <button
                  onClick={onBackToMenu || onBack}
                  className="w-full mt-2 py-2 rounded-lg border border-[#5A2C11] text-[#5A2C11] font-bold text-xs hover:bg-[#5A2C11] hover:text-white transition"
                >
                  {language === 'vn' ? '+ Thêm món' :
                   language === 'en' ? '+ Order more' :
                   '+ Добавить ещё'}
                </button>
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
            disabled={!address.trim()}
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
