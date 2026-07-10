import dotenv from 'dotenv';
dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN || '',
  staffChatId: process.env.STAFF_CHAT_ID || '',
  bankCode: process.env.BANK_CODE || 'TCB',
  bankAccountNumber: process.env.BANK_ACCOUNT_NUMBER || '',
  bankBeneficiaryName: process.env.BANK_BENEFICIARY_NAME || 'Little Dalat',
  shop: {
    lat: Number(process.env.SHOP_LAT) || 12.2408331,
    lng: Number(process.env.SHOP_LNG) || 109.1845723,
    address: process.env.SHOP_ADDRESS || '02 Thi Sách, Phước Hòa, Nha Trang',
    phone: process.env.SHOP_PHONE || '0912066973',
    mapsUrl: process.env.SHOP_MAPS_URL || 'https://maps.app.goo.gl/u3dTQRes79XSisrk9',
  },
  delivery: {
    feeWithin1km: 10000,
    fee1to3km: 15000,
    fee3to5km: 25000,
    fee5to7km: 35000,
    fee7to9km: 45000,
    maxRadius: 9, // km
  },
  currency: 'k',
  goongApiKey: process.env.GOONG_API_KEY || '',
  gogodukKey: process.env.GOGODUK_API_KEY || '',
  locationIqKey: process.env.LOCATIONIQ_API_KEY || '',
};
