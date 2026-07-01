import dotenv from 'dotenv';
dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN || '',
  staffChatId: process.env.STAFF_CHAT_ID || '',
  bankCode: process.env.BANK_CODE || 'TCB',
  bankAccountNumber: process.env.BANK_ACCOUNT_NUMBER || '',
  bankBeneficiaryName: process.env.BANK_BENEFICIARY_NAME || 'Little Dalat',
  shop: {
    lat: Number(process.env.SHOP_LAT) || 12.245566,
    lng: Number(process.env.SHOP_LNG) || 109.192793,
    address: process.env.SHOP_ADDRESS || '02 Thi Sách, Phước Hòa, Nha Trang',
    phone: process.env.SHOP_PHONE || '0912066973',
  },
  delivery: {
    feeWithin4km: 15000,
    fee4to6km: 25000,
    fee6to8km: 38000,
    maxRadius: 8, // km
  },
  currency: 'k',
  goongApiKey: process.env.GOONG_API_KEY || '',
  locationIqKey: process.env.LOCATIONIQ_API_KEY || '',
};
