import { Language, PaymentMethod, OrderMode } from '../types';
import { t, formatPrice } from '../i18n';
import { QrCode, Banknote, Check, ArrowLeft } from 'lucide-react';
import { detectPlatform } from '../platforms/usePlatform';

interface PaymentScreenProps {
  language: Language;
  mode?: OrderMode;
  total: number;
  subtotal?: number;
  deliveryFee?: number;
  onPay: (method: PaymentMethod) => void;
  qrImageUrl?: string;
  onConfirmPaid: () => void;
  paymentMethod: PaymentMethod | null;
  isPlaced: boolean;
  orderId?: number;
  onBack?: () => void;
  onNewOrder?: () => void;
  onClose?: () => void;
}

export default function PaymentScreen({
  language, mode, total, subtotal, deliveryFee, onPay, qrImageUrl, onConfirmPaid, paymentMethod, isPlaced, orderId, onBack, onNewOrder, onClose,
}: PaymentScreenProps) {
  if (isPlaced) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-black text-xl text-[#261308] mb-1">{t('order_placed', language)}</h2>
          <p className="text-[#8B7355] text-sm mb-1">
            {language === 'vn' ? 'Cảm ơn bạn đã đặt hàng!' :
             language === 'en' ? 'Thank you for your order!' :
             'Спасибо за ваш заказ!'}
          </p>
          <div className="mt-4 text-center">
            <p className="text-sm text-[#8B7355] mb-1">{t('order_number', language)}</p>
            <p className="font-black text-4xl text-[#5A2C11]">#{orderId}</p>
          </div>
          {total > 0 && (
            <p className="text-[#9E3618] font-black text-lg mt-4">{formatPrice(total)}</p>
          )}
          {detectPlatform() === 'telegram' && (
            <p className="text-xs text-[#8B7355] mt-4 text-center">
              {language === 'vn' ? '📲 Theo dõi trạng thái đơn hàng trong Telegram' :
               language === 'en' ? '📲 Track order status in Telegram' :
               '📲 Отслеживайте статус заказа в Telegram'}
            </p>
          )}
        </div>
        <div className="px-6 pb-8 space-y-3">
          <button
            onClick={onNewOrder}
            className="w-full py-4 rounded-xl bg-[#5A2C11] text-white font-black text-base hover:bg-[#4A2210] transition"
          >
            {language === 'vn' ? '🆕 Đặt hàng mới' :
             language === 'en' ? '🆕 New order' :
             '🆕 Новый заказ'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl border-2 border-[#C5B5A5]/40 text-[#8B7355] font-black text-sm hover:bg-[#F4EDE0] transition"
            >
              {language === 'vn' ? '✕ Đóng' :
               language === 'en' ? '✕ Close' :
               '✕ Закрыть'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!paymentMethod) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        <div className="relative flex items-center justify-center py-4 border-b border-[#C5B5A5]/20">
          {onBack && (
            <button onClick={onBack} className="absolute left-4 p-2 text-[#5A2C11]">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <p className="text-sm font-bold text-[#261308]">Thanh toán</p>
        </div>
        <div className="flex-1 flex flex-col justify-center px-6">
          {mode === 'delivery' && subtotal !== undefined && deliveryFee !== undefined && (
            <div className="mb-4 px-4 py-3 bg-[#F4EDE0] rounded-xl space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-[#8B7355]">{t('subtotal', language)}</span>
                <span className="font-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8B7355]">{t('delivery_fee_label', language)}</span>
                <span className="font-bold">
                  {deliveryFee === 0 ? t('delivery_free', language) : formatPrice(deliveryFee)}
                </span>
              </div>
              <p className="text-[10px] text-[#5A2C11] font-medium">
                {deliveryFee === 0
                  ? (language === 'vn' ? '✅ Miễn phí giao hàng (5+ món)' :
                     language === 'en' ? '✅ Free delivery (5+ items)' :
                     '✅ Бесплатная доставка (5+)')
                  : (language === 'vn' ? '🚚 Miễn phí giao hàng từ 5 món' :
                     language === 'en' ? '🚚 Free delivery from 5 items' :
                     '🚚 Бесплатная доставка от 5 товаров')}
              </p>
            </div>
          )}
          <p className="text-[#8B7355] text-sm text-center mb-1">{t('total', language)}</p>
          <p className="text-[#9E3618] font-black text-4xl text-center mb-10">{formatPrice(total)}</p>
          <button
            onClick={() => onPay('qr')}
            className="w-full py-4 rounded-xl border-2 border-[#5A2C11] text-[#5A2C11] font-black text-sm flex items-center justify-center gap-3 hover:bg-[#F4EDE0] transition mb-3"
          >
            <QrCode className="w-6 h-6" />
            {t('pay_with_qr', language)}
          </button>
          <button
            onClick={() => onPay('cash')}
            className="w-full py-4 rounded-xl bg-[#5A2C11] text-white font-black text-sm flex items-center justify-center gap-3 hover:bg-[#4A2210] transition"
          >
            <Banknote className="w-6 h-6" />
            {t('pay_with_cash', language)}
          </button>
        </div>
      </div>
    );
  }

  if (paymentMethod === 'qr' && qrImageUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        <div className="relative flex items-center justify-center py-4 border-b border-[#C5B5A5]/20">
          {onBack && (
            <button onClick={onBack} className="absolute left-4 p-2 text-[#5A2C11]">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <p className="text-sm font-bold text-[#261308]">{t('pay_with_qr', language)}</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <p className="text-[#9E3618] font-black text-3xl mb-6">{formatPrice(total)}</p>
          {mode === 'delivery' && deliveryFee !== undefined && (
            <p className="text-[10px] text-[#8B7355] mb-4">
              {deliveryFee > 0
                ? `${t('subtotal', language)}: ${formatPrice(subtotal || 0)} + ${t('delivery_fee_label', language)}: ${formatPrice(deliveryFee)}`
                : `✅ ${t('delivery_free', language)}`}
            </p>
          )}
          <div className="w-full max-w-xs mx-auto bg-white rounded-2xl shadow-lg p-4 mb-4">
            <img src={qrImageUrl} alt="QR" className="w-full h-auto aspect-square object-contain" />
          </div>
          <p className="text-[10px] text-[#8B7355] text-center max-w-xs">
            {language === 'vn' ? 'Quét mã QR bằng ứng dụng ngân hàng để thanh toán' :
             language === 'en' ? 'Scan the QR code with your banking app to pay' :
             'Отсканируйте QR-код в банковском приложении для оплаты'}
          </p>
        </div>
        <div className="px-6 pb-8">
          <button
            onClick={onConfirmPaid}
            className="w-full py-4 rounded-xl bg-green-600 text-white font-black text-base hover:bg-green-700 transition active:scale-[0.98]"
          >
            {t('confirm_payment', language)} ✓
          </button>
        </div>
      </div>
    );
  }

  if (paymentMethod === 'cash') {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        <div className="relative flex items-center justify-center py-4 border-b border-[#C5B5A5]/20">
          {onBack && (
            <button onClick={onBack} className="absolute left-4 p-2 text-[#5A2C11]">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <p className="text-sm font-bold text-[#261308]">{t('pay_with_cash', language)}</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <Banknote className="w-16 h-16 text-green-600 mb-4" />
          <p className="text-[#9E3618] font-black text-3xl mb-1">{formatPrice(total)}</p>
          <p className="text-[10px] text-[#8B7355] text-center max-w-xs">
            {mode === 'delivery'
              ? (language === 'vn' ? 'Thanh toán khi nhận hàng' :
                 language === 'en' ? 'Pay cash on delivery' :
                 'Оплатите наличными при получении')
              : (language === 'vn' ? 'Thanh toán với nhân viên khi nhận hàng' :
                 language === 'en' ? 'Pay the staff when you receive the order' :
                 'Оплатите на кассе при получении заказа')}
          </p>
        </div>
        <div className="px-6 pb-8">
          <button
            onClick={onConfirmPaid}
            className="w-full py-4 rounded-xl bg-[#5A2C11] text-white font-black text-base hover:bg-[#4A2210] transition"
          >
            {t('place_order', language)} ✓
          </button>
        </div>
      </div>
    );
  }

  return null;
}
