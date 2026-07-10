import { useState } from 'react';
import { Language, PaymentMethod, MenuItem, OrderMode } from '../types';
import { useCart } from '../context/CartContext';
import { createOrderApi, generateQr, confirmOrder } from '../api/client';
import { getUserId, getPlatformSource, usePlatform } from '../platforms/usePlatform';
import CheckoutForm from '../components/CheckoutForm';
import PaymentScreen from '../components/PaymentScreen';
import ModeSelector from '../components/ModeSelector';
import { formatPrice, t } from '../i18n';

interface CheckoutProps {
  language: Language;
  menuItems: MenuItem[];
  onBack: () => void;
  onOrderPlaced: (orderId: number) => void;
  onGoToCategory?: (categoryId: string) => void;
}

export default function Checkout({ language, menuItems, onBack, onOrderPlaced, onGoToCategory }: CheckoutProps) {
  const { state, dispatch } = useCart();
  const { platform } = usePlatform();
  const [step, setStep] = useState<'mode' | 'form' | 'payment' | 'done'>(state.mode ? 'form' : 'mode');
  const [customerInfo, setCustomerInfo] = useState<{ name: string; phone: string; address?: string } | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [qrImage, setQrImage] = useState<string | undefined>();
  const [orderId, setOrderId] = useState<number | undefined>();
  const [createdAt, setCreatedAt] = useState<string | undefined>();

  const subtotal = state.items.reduce((sum, ci) => {
    const item = menuItems.find(i => i.id === ci.menuItemId);
    return sum + (item?.price || 0) * ci.quantity;
  }, 0);
  const drinkCount = state.items.reduce((sum, ci) => {
    const item = menuItems.find(i => i.id === ci.menuItemId);
    return sum + (item?.category === 'desserts_snacks' ? 0 : ci.quantity);
  }, 0);
  const total = subtotal + deliveryFee;

  const handleModeSelect = (mode: OrderMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
    setStep('form');
  };

  const [deliveryLat, setDeliveryLat] = useState<number | undefined>();
  const [deliveryLng, setDeliveryLng] = useState<number | undefined>();

  const handleSubmitInfo = (data: { name: string; phone: string; address?: string; deliveryFee?: number; deliveryLat?: number; deliveryLng?: number }) => {
    setCustomerInfo(data);
    if (data.deliveryFee !== undefined) {
      setDeliveryFee(data.deliveryFee);
    }
    if (data.deliveryLat !== undefined) setDeliveryLat(data.deliveryLat);
    if (data.deliveryLng !== undefined) setDeliveryLng(data.deliveryLng);
    setStep('payment');
  };

  const handlePay = async (method: PaymentMethod) => {
    setPaymentMethod(method);

    try {
      const order = await createOrderApi({
        chatId: getUserId(),
        mode: state.mode || 'dine-in',
        tableNumber: state.tableNumber || undefined,
        items: state.items,
        paymentMethod: method,
        customerName: customerInfo?.name || '',
        customerPhone: customerInfo?.phone || '',
        deliveryAddress: customerInfo?.address,
        deliveryLat: deliveryLat || null,
        deliveryLng: deliveryLng || null,
        deliveryFee: deliveryFee || undefined,
        language,
        source: getPlatformSource(),
      });

      setOrderId(order.id);
      setCreatedAt(order.createdAt);

      if (method === 'qr') {
        const qr = await generateQr(order.id, order.total);
        setQrImage(qr.imageUrl);
      }
    } catch (e) {
      console.error('Order failed', e);
    }
  };

  const handleCloseMiniApp = () => {
    try {
      const proxy = (window as any).TelegramWebviewProxy;
      if (proxy?.postEvent) {
        proxy.postEvent('web_app_close', {});
        return;
      }
    } catch {}
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.close();
        return;
      }
    } catch {}
    try {
      window.parent?.postMessage?.({ eventType: 'web_app_close' }, '*');
    } catch {}
  };

  const handleConfirmPaid = async () => {
    try {
      if (orderId) {
        await confirmOrder(orderId);
      }
    } catch (e) {
      console.error('Confirm failed:', e);
    }
    setStep('done');
    dispatch({ type: 'CLEAR' });
  };

  if (step === 'mode') {
    return (
      <div>
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#8B7355] mb-4">
          ← {t('back', language)}
        </button>
        <h2 className="font-black text-lg text-[#261308] mb-4">{t('choose_mode', language)}</h2>
        <ModeSelector
          language={language}
          selected={state.mode}
          onSelect={handleModeSelect}
        />
      </div>
    );
  }

  if (step === 'form') {
    return (
      <CheckoutForm
        language={language}
        mode={state.mode || 'dine-in'}
        drinkCount={drinkCount}
        onBack={() => state.mode ? setStep('mode') : onBack}
        onBackToMenu={onBack}
        onGoToCategory={onGoToCategory}
        onSubmit={handleSubmitInfo}
      />
    );
  }

  return (
    <PaymentScreen
      language={language}
      mode={state.mode || 'dine-in'}
      total={total}
      subtotal={subtotal}
      deliveryFee={deliveryFee}
      onPay={handlePay}
      qrImageUrl={qrImage}
      onConfirmPaid={handleConfirmPaid}
      paymentMethod={paymentMethod}
      isPlaced={step === 'done'}
      orderId={orderId}
      createdAt={createdAt}
      onBack={paymentMethod ? () => setPaymentMethod(null) : () => setStep('form')}
      onNewOrder={() => onOrderPlaced(orderId || 0)}
      onClose={platform !== 'browser' ? handleCloseMiniApp : undefined}
      customerName={customerInfo?.name}
      customerPhone={customerInfo?.phone}
      items={state.items}
      menuItems={menuItems}
    />
  );
}
