import { useEffect, useState } from 'react';
import { Language } from '../types';

interface ShareContactProps {
  language: Language;
  customerName: string;
  customerPhone: string;
  orderId?: number;
}

export default function ShareContact({ language, customerName, customerPhone, orderId }: ShareContactProps) {
  const [copied, setCopied] = useState(false);

  const shareText = language === 'vn'
    ? `Chào quán! Tôi là ${customerName}, SĐT: ${customerPhone}. Đơn hàng #${orderId} — Little Dalat Coffee & Tea`
    : language === 'en'
      ? `Hi! I'm ${customerName}, phone: ${customerPhone}. Order #${orderId} — Little Dalat Coffee & Tea`
      : `Здравствуйте! Я ${customerName}, тел: ${customerPhone}. Заказ #${orderId} — Little Dalat Coffee & Tea`;

  useEffect(() => {
    navigator.clipboard.writeText(shareText).then(() => setCopied(true)).catch(() => {});
  }, []);

  const text = encodeURIComponent(shareText);

  const buttons = [
    { label: 'Zalo', url: `https://zalo.me/84912066973?msg=${text}`, bg: 'bg-[#0068FF]', icon: '🇻🇳' },
    { label: 'WhatsApp', url: `https://wa.me/84912066973?text=${text}`, bg: 'bg-[#25D366]', icon: '💬' },
    { label: 'Telegram', url: `https://t.me/littledalatbot?text=${text}`, bg: 'bg-[#0088CC]', icon: '✈️' },
  ];

  return (
    <div className="w-full space-y-3">
      <div className="p-3 rounded-xl bg-[#F4EDE0]">
        <p className="text-[10px] text-[#8B7355] mb-1">
          {copied
            ? (language === 'vn' ? '✅ Đã sao chép vào bộ nhớ tạm' :
               language === 'en' ? '✅ Copied to clipboard' :
               '✅ Скопировано в буфер обмена')
            : (language === 'vn' ? '📋 Đang sao chép...' :
               language === 'en' ? '📋 Copying...' :
               '📋 Копирование...')}
        </p>
        <p className="text-xs text-[#261308] font-medium break-words select-all">{shareText}</p>
      </div>
      <p className="text-[10px] text-[#8B7355] text-center">
        {language === 'vn' ? 'Bạn có thể gửi thông tin này cho quán qua:' :
         language === 'en' ? 'You can send this info to the shop via:' :
         'Вы можете отправить эту информацию заведению через:'}
      </p>
      <div className="flex gap-2">
        {buttons.map(btn => (
          <a
            key={btn.label}
            href={btn.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 py-3 rounded-xl ${btn.bg} text-white font-bold text-xs flex items-center justify-center gap-1.5 transition hover:opacity-90 active:scale-[0.97]`}
          >
            <span>{btn.icon}</span>
            <span>{btn.label}</span>
          </a>
        ))}
      </div>
      <p className="text-[10px] text-[#8B7355] text-center">
        {language === 'vn' ? 'Nếu có thắc mắc, bạn có thể nhắn tin ngay cho quán!' :
         language === 'en' ? 'If you have any questions, feel free to message us!' :
         'Если есть вопросы — напишите нам!'}
      </p>
    </div>
  );
}
